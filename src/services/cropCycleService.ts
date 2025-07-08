/**
 * Crop Cycle Service
 * Database-only implementation for crop cycle operations
 * Replaces localStorage with Supabase database calls
 */

import {
  CropCycle,
  CreateCycleRequest,
  CloseCycleRequest,
  CycleClosureValidation,
  CyclePermissions,
  getCyclePermissions,
  formatCycleDisplayName,
  GrowthStage
} from '@/types/cropCycles'
import { BlocActivity } from '@/types/activities'
import { BlocObservation } from '@/types/observations'
// ❌ REMOVED: Hardcoded varieties import - now using ConfigurationService
import { BlocAttachment } from '@/types/attachments'
import { CropCycleValidationService } from './cropCycleValidationService'
import { CropCycleCalculationService } from './cropCycleCalculationService'
import { LocalStorageService } from './localStorageService'
import { supabase } from '@/lib/supabase'

export class CropCycleService {

  /**
   * Get all crop cycles for a specific bloc WITH TOTALS INCLUDED
   * This eliminates the need for separate getCropCycleTotals() calls
   */
  static async getCropCyclesForBloc(blocId: string): Promise<CropCycle[]> {
    try {
      // Fetch complete cycle data including calculated totals
      const { data, error } = await supabase
        .from('crop_cycles')
        .select(`
          *,
          estimated_total_cost,
          actual_total_cost,
          total_revenue,
          sugarcane_revenue,
          intercrop_revenue,
          net_profit,
          profit_per_hectare,
          profit_margin_percent,
          sugarcane_actual_yield_tons_ha
        `)
        .eq('bloc_id', blocId)
        .order('created_at', { ascending: false })

      if (error) throw error

      return await Promise.all((data || []).map(record => this.transformDbToLocal(record)))
    } catch (error) {
      console.error('Failed to fetch crop cycles for bloc:', error)
      return []
    }
  }

  /**
   * Get the active crop cycle for a bloc
   */
  static async getActiveCropCycle(blocId: string): Promise<CropCycle | null> {
    try {
      const { data, error } = await supabase
        .from('crop_cycles')
        .select('*')
        .eq('bloc_id', blocId)
        .eq('status', 'active')
        .single()

      if (error) {
        if (error.code === 'PGRST116') return null // No rows returned
        throw error
      }

      return await this.transformDbToLocal(data)
    } catch (error) {
      console.error('Failed to fetch active crop cycle:', error)
      return null
    }
  }

  /**
   * Create a new crop cycle with auto-recovery for UUID mismatches
   */
  static async createCropCycle(request: CreateCycleRequest): Promise<CropCycle> {
    return LocalStorageService.withAutoRecovery(
      () => this._createCropCycleInternal(request),
      'crop cycle creation'
    )
  }

  /**
   * Internal crop cycle creation method
   */
  private static async _createCropCycleInternal(request: CreateCycleRequest): Promise<CropCycle> {
    // Validate that only one active cycle exists per bloc
    const activeCycle = await this.getActiveCropCycle(request.blocId)
    if (activeCycle) {
      throw new Error('Cannot create new cycle: An active cycle already exists for this bloc. Please close the current cycle first.')
    }

    try {
      // Calculate the correct cycle number based on existing cycles for this bloc
      const existingCycles = await this.getCropCyclesForBloc(request.blocId)
      const cycleNumber = existingCycles.length + 1

      // Determine cycle type based on cycle number
      // First cycle (1) = plantation, subsequent cycles (2+) = ratoon
      const cycleType = cycleNumber === 1 ? 'plantation' : 'ratoon'

      // Validate that the requested type matches the expected type
      if (request.type !== cycleType) {
        if (cycleNumber === 1) {
          throw new Error('First cycle must be a plantation cycle')
        } else {
          throw new Error(`Cycle ${cycleNumber} must be a ratoon cycle (Ratoon ${cycleNumber - 1})`)
        }
      }

      // For ratoon cycles, inherit sugarcane variety from plantation cycle
      let sugarcaneVarietyUuid = request.sugarcaneVarietyId
      if (cycleType === 'ratoon' && existingCycles.length > 0) {
        const plantationCycle = existingCycles.find(cycle => cycle.type === 'plantation')
        if (plantationCycle) {
          sugarcaneVarietyUuid = plantationCycle.sugarcaneVarietyId
        }
      }

      // Calculate initial growth stage and days since planting
      const plantingDate = new Date(request.plantingDate || new Date())
      const daysSincePlanting = Math.floor((new Date().getTime() - plantingDate.getTime()) / (1000 * 60 * 60 * 24))
      const initialGrowthStage = this.calculateGrowthStage(daysSincePlanting)

      // Handle variety UUIDs
      const finalSugarcaneVarietyUuid = sugarcaneVarietyUuid === 'none' ? null : sugarcaneVarietyUuid
      const intercropVarietyUuid = request.intercropVarietyId === 'none' ? null : request.intercropVarietyId

      const insertData = {
        bloc_id: request.blocId,
        type: cycleType,
        cycle_number: cycleNumber,
        sugarcane_variety_id: finalSugarcaneVarietyUuid || null,
        intercrop_variety_id: intercropVarietyUuid,
        parent_cycle_id: request.parentCycleId || null,
        sugarcane_planting_date: request.plantingDate,
        sugarcane_planned_harvest_date: request.plannedHarvestDate,
        sugarcane_expected_yield_tons_ha: request.expectedYield, // ✅ Add expected yield
        growth_stage: initialGrowthStage,
        days_since_planting: daysSincePlanting,
        estimated_total_cost: 0,
        actual_total_cost: 0,
        sugarcane_revenue: 0,
        intercrop_revenue: 0,
        total_revenue: 0,
        net_profit: 0,
        profit_per_hectare: 0,
        profit_margin_percent: 0,
        closure_validated: false
      }

      console.log('🔍 DEBUG - Bloc ID being inserted:', request.blocId)
      console.log('🔍 DEBUG - Insert data:', insertData)

      // Debug: Check if bloc exists
      const { data: blocCheck, error: blocError } = await supabase
        .from('blocs')
        .select('id, name')
        .eq('id', request.blocId)
        .single()

      console.log('🔍 DEBUG - Bloc check result:', { blocCheck, blocError })

      const { data, error } = await supabase
        .from('crop_cycles')
        .insert(insertData)
        .select('*')
        .single()

      if (error) {
        console.error('🚨 Detailed error creating crop cycle:', {
          error,
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
          insertData
        })
        throw new Error(`Database error: ${error.message || 'Unknown database error'}`)
      }

      const newCycle = await this.transformDbToLocal(data)

      // Initialize totals for the new crop cycle using database function
      await CropCycleCalculationService.triggerRecalculation(newCycle.id)

      return newCycle
    } catch (error) {
      console.error('Error creating crop cycle:', error)
      throw error
    }
  }
  
  /**
   * Validate crop cycle for closure
   */
  static async validateCycleForClosure(
    cycleId: string,
    blocArea: number
  ): Promise<CycleClosureValidation> {
    const cycle = await this.getCropCycleById(cycleId)
    if (!cycle) {
      throw new Error('Crop cycle not found')
    }

    if (cycle.status !== 'active') {
      throw new Error('Only active cycles can be validated for closure')
    }

    // Get related data from database
    const activities = await this.getActivitiesForCycle(cycleId)
    const observations = await this.getObservationsForCycle(cycleId)

    return CropCycleValidationService.validateCycleForClosure(
      cycle,
      activities,
      observations,
      blocArea
    )
  }

  /**
   * Close a crop cycle
   */
  static async closeCropCycle(request: CloseCycleRequest): Promise<CropCycle> {
    try {
      const cycle = await this.getCropCycleById(request.cycleId)
      if (!cycle) {
        throw new Error('Crop cycle not found')
      }

      if (cycle.status !== 'active') {
        throw new Error('Only active cycles can be closed')
      }

      // Update cycle with closure data and set growth stage to 'harvested'
      const { data, error } = await supabase
        .from('crop_cycles')
        .update({
          status: 'closed',
          growth_stage: 'harvested', // 🎯 Set to harvested when closed
          growth_stage_updated_at: new Date().toISOString(),
          sugarcane_actual_harvest_date: request.actualHarvestDate,
          closure_validated: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', request.cycleId)
        .select('*')
        .single()

      if (error) throw error

      const closedCycle = await this.transformDbToLocal(data)

      // Recalculate and update totals for the closed cycle using database function
      await CropCycleCalculationService.triggerRecalculation(closedCycle.id)

      return closedCycle
    } catch (error) {
      console.error('Error closing crop cycle:', error)
      throw error
    }
  }
  
  /**
   * Get crop cycle by ID
   */
  static async getCropCycleById(cycleId: string): Promise<CropCycle | null> {
    try {
      const { data, error } = await supabase
        .from('crop_cycles')
        .select('*')
        .eq('id', cycleId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') return null // No rows returned
        throw error
      }

      return await this.transformDbToLocal(data)
    } catch (error) {
      console.error('Failed to fetch crop cycle by ID:', error)
      return null
    }
  }

  /**
   * Get permissions for a crop cycle
   */
  static getCyclePermissions(cycle: CropCycle, userRole: 'user' | 'admin' | 'super' = 'user'): CyclePermissions {
    return getCyclePermissions(cycle, userRole)
  }

  /**
   * Update crop cycle
   */
  static async updateCropCycle(cycleId: string, updates: Partial<CropCycle>): Promise<CropCycle> {
    try {
      // Transform local updates to database format
      const dbUpdates = this.transformLocalToDb(updates)

      const { data, error } = await supabase
        .from('crop_cycles')
        .update({
          ...dbUpdates,
          updated_at: new Date().toISOString()
        })
        .eq('id', cycleId)
        .select('*')
        .single()

      if (error) throw error

      const updatedCycle = await this.transformDbToLocal(data)

      // Recalculate totals if the update might affect them
      await CropCycleCalculationService.triggerRecalculation(cycleId)

      return updatedCycle
    } catch (error) {
      console.error('Error updating crop cycle:', error)
      throw error
    }
  }

  /**
   * Delete crop cycle (only if no activities/observations linked)
   */
  static async deleteCropCycle(cycleId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('crop_cycles')
        .delete()
        .eq('id', cycleId)

      if (error) throw error
    } catch (error) {
      console.error('Error deleting crop cycle:', error)
      throw error
    }
  }

  // ❌ REMOVED: Helper methods using hardcoded arrays
  // These are no longer needed since we fetch variety names directly from database joins

  /**
   * Get bloc summary with active crop cycle data for bloc cards
   */
  static async getBlocSummary(blocId: string): Promise<{
    blocId: string
    blocStatus: 'active' | 'retired'
    hasActiveCycle: boolean
    cycleType?: string
    varietyName?: string
    intercropName?: string
    cycleNumber?: number
    plannedHarvestDate?: string
    growthStage?: string
    growthStageName?: string
    growthStageColor?: string
    growthStageIcon?: string
    daysSincePlanting?: number
  }> {
    const activeCycle = await this.getActiveCropCycle(blocId)

    if (!activeCycle) {
      return {
        blocId,
        blocStatus: 'active', // TODO: Get from blocs table
        hasActiveCycle: false
      }
    }

    // Get growth stage information
    const growthStageInfo = this.getGrowthStageInfo(activeCycle.growthStage)

    return {
      blocId,
      blocStatus: 'active', // TODO: Get from blocs table
      hasActiveCycle: true,
      cycleType: activeCycle.type,
      varietyName: activeCycle.sugarcaneVarietyName,
      intercropName: activeCycle.intercropVarietyName,
      cycleNumber: activeCycle.cycleNumber,
      plannedHarvestDate: activeCycle.plannedHarvestDate,
      growthStage: activeCycle.growthStage,
      growthStageName: growthStageInfo?.name,
      growthStageColor: growthStageInfo?.color,
      growthStageIcon: growthStageInfo?.icon,
      daysSincePlanting: activeCycle.daysSincePlanting
    }
  }

  /**
   * OPTIMIZED: Get crop cycle summaries for multiple blocs efficiently
   * Uses single DB call + cached variety data for maximum performance
   */
  static async getBlocSummariesBatch(blocIds: string[]): Promise<Record<string, {
    blocId: string
    blocStatus: 'active' | 'retired'
    hasActiveCycle: boolean
    cycleType?: string
    varietyName?: string
    intercropName?: string
    cycleNumber?: number
    plannedHarvestDate?: string
    growthStage?: string
    growthStageName?: string
    growthStageColor?: string
    growthStageIcon?: string
    daysSincePlanting?: number
    cycleDisplay?: string
  }>> {


    // Step 1: Update growth stages for all active cycles (Option 3 implementation)
    await this.updateGrowthStages()

    // Step 2: Get ALL crop cycles for our blocs, then filter to latest per bloc
    // TODO: Optimize with PostgreSQL function for even better performance
    const { data: allCropCycles, error: cyclesError } = await supabase
      .from('crop_cycles')
      .select('*')
      .in('bloc_id', blocIds)
      .order('cycle_number', { ascending: false }) // Latest cycles first

    if (cyclesError) {
      console.error('❌ Error fetching crop cycles:', cyclesError)
      // Return all blocs as having no cycles
      const result: Record<string, any> = {}
      blocIds.forEach(blocId => {
        result[blocId] = {
          blocId,
          blocStatus: 'active',
          hasActiveCycle: false,
          cycleDisplay: 'Barren Soil'
        }
      })
      return result
    }

    // Step 2: Optimize data - keep only latest cycle per bloc (JavaScript filtering)
    const latestCyclesMap = new Map<string, any>()

    if (allCropCycles) {
      allCropCycles.forEach(cycle => {
        // Skip cycles without bloc_id
        if (!cycle.bloc_id) return

        const existing = latestCyclesMap.get(cycle.bloc_id)
        if (!existing || cycle.cycle_number > existing.cycle_number) {
          latestCyclesMap.set(cycle.bloc_id, cycle)
        }
      })
    }

    // Step 3: Get cached variety names (0 DB calls!)
    const varietyMaps = await this.getCachedVarietyNames()

    // Step 4: Process each bloc with optimized data
    const result: Record<string, any> = {}

    blocIds.forEach(blocId => {
      const latestCycle = latestCyclesMap.get(blocId)

      if (!latestCycle) {
        // No cycles at all = Barren Soil
        result[blocId] = {
          blocId,
          blocStatus: 'active',
          hasActiveCycle: false,
          cycleDisplay: 'Barren Soil',
          growthStage: ''
        }
        return
      }

      // Use the latest cycle (which could be active or closed)
      const displayCycle = latestCycle
      const hasActiveCycle = latestCycle.status === 'active'

      // Clean cycle type display
      const cycleDisplay = displayCycle.type === 'plantation'
        ? 'Plantation'
        : `Ratoon ${displayCycle.cycle_number - 1}`

      // Get variety name from cache
      const varietyName = varietyMaps.sugarcane.get(displayCycle.sugarcane_variety_id) || 'Unknown'
      const intercropName = displayCycle.intercrop_variety_id
        ? varietyMaps.intercrop.get(displayCycle.intercrop_variety_id)
        : undefined

      // Get growth stage info
      const growthStageInfo = this.getGrowthStageInfo(displayCycle.growth_stage)

      result[blocId] = {
        blocId,
        blocStatus: 'active',
        hasActiveCycle,
        cycleType: displayCycle.type,
        cycleDisplay,
        varietyName,
        intercropName,
        cycleNumber: displayCycle.cycle_number,
        plannedHarvestDate: displayCycle.sugarcane_planned_harvest_date,
        growthStage: displayCycle.growth_stage,
        growthStageName: growthStageInfo?.name,
        growthStageColor: growthStageInfo?.color,
        growthStageIcon: growthStageInfo?.icon,
        daysSincePlanting: displayCycle.days_since_planting
      }
    })


    return result
  }

  /**
   * Update growth stages for all active crop cycles
   * PROTECTION: Never overwrite 'harvested' growth stage or cycles with past harvest dates
   * Note: Only updates ACTIVE cycles. Closed cycles remain 'harvested'
   */
  static async updateGrowthStages(): Promise<void> {
    try {
      const { data: activeCycles, error } = await supabase
        .from('crop_cycles')
        .select('id, sugarcane_planting_date, sugarcane_actual_harvest_date, growth_stage, status, cycle_number')
        .eq('status', 'active') // Only active cycles get growth stage updates

      if (error) throw error

      for (const cycle of activeCycles || []) {
        // 🛡️ PROTECTION 1: Skip if already harvested
        if (cycle.growth_stage === 'harvested') {
          continue
        }

        // 🛡️ PROTECTION 2: Skip if actual harvest date is in the past
        if (cycle.sugarcane_actual_harvest_date) {
          const harvestDate = new Date(cycle.sugarcane_actual_harvest_date)
          if (harvestDate <= new Date()) {
            continue
          }
        }

        if (cycle.sugarcane_planting_date) {
          const plantingDate = new Date(cycle.sugarcane_planting_date)
          const daysSincePlanting = Math.floor((new Date().getTime() - plantingDate.getTime()) / (1000 * 60 * 60 * 24))
          const newGrowthStage = this.calculateGrowthStage(daysSincePlanting)

          if (cycle.growth_stage !== newGrowthStage) {
            await supabase
              .from('crop_cycles')
              .update({
                growth_stage: newGrowthStage,
                growth_stage_updated_at: new Date().toISOString(),
                days_since_planting: daysSincePlanting,
                updated_at: new Date().toISOString()
              })
              .eq('id', cycle.id)
              .neq('growth_stage', 'harvested') // 🛡️ Extra protection at DB level


          }
        }
      }
    } catch (error) {
      console.error('Error updating growth stages:', error)
      throw error
    }
  }

  /**
   * Calculate growth stage based on days since planting
   * Note: This is only for active cycles. Closed cycles should have growth_stage = 'harvested'
   */
  private static calculateGrowthStage(daysSincePlanting: number): GrowthStage {
    if (daysSincePlanting <= 30) return 'germination'
    if (daysSincePlanting <= 120) return 'tillering'
    if (daysSincePlanting <= 270) return 'grand-growth'
    if (daysSincePlanting <= 360) return 'maturation'
    return 'ripening'
  }



  /**
   * Get cached variety names from localStorage (no DB calls needed!)
   */
  private static async getCachedVarietyNames(): Promise<{
    sugarcane: Map<string, string>
    intercrop: Map<string, string>
  }> {
    // Get cached varieties data (already loaded during app initialization)
    const [sugarcaneVarietiesData, intercropVarietiesData] = await Promise.all([
      LocalStorageService.getSugarcaneVarieties(),
      LocalStorageService.getIntercropVarieties()
    ])

    // Create lookup maps by UUID
    const sugarcane = new Map<string, string>()
    sugarcaneVarietiesData.forEach(variety => {
      sugarcane.set(variety.id, variety.name)
    })

    const intercrop = new Map<string, string>()
    intercropVarietiesData.forEach(variety => {
      intercrop.set(variety.id, variety.name)
    })
    return { sugarcane, intercrop }
  }

  /**
   * Get growth stage display information
   */
  private static getGrowthStageInfo(stage: string) {
    const stageMap: Record<string, { name: string; color: string; icon: string }> = {
      'germination': { name: 'Germination', color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: '🌱' },
      'tillering': { name: 'Tillering', color: 'bg-green-100 text-green-800 border-green-200', icon: '🌿' },
      'grand-growth': { name: 'Grand Growth', color: 'bg-emerald-100 text-emerald-800 border-emerald-200', icon: '🎋' },
      'maturation': { name: 'Maturation', color: 'bg-amber-100 text-amber-800 border-amber-200', icon: '🌾' },
      'ripening': { name: 'Ripening', color: 'bg-orange-100 text-orange-800 border-orange-200', icon: '🏆' },
      'harvested': { name: 'Harvested', color: 'bg-gray-100 text-gray-800 border-gray-200', icon: '✅' }
    }
    return stageMap[stage]
  }



  /**
   * Transform database record to local CropCycle type using pre-fetched variety data
   */
  private static async transformDbToLocalWithVarieties(
    dbRecord: any,
    varietyMaps: { sugarcaneVarieties: Map<string, string>, intercropVarieties: Map<string, string> }
  ): Promise<CropCycle> {
    // Get variety names from pre-fetched maps
    const sugarcaneVarietyName = dbRecord.sugarcane_variety_id
      ? varietyMaps.sugarcaneVarieties.get(dbRecord.sugarcane_variety_id) || 'Unknown'
      : 'Unknown'

    const intercropVarietyName = dbRecord.intercrop_variety_id
      ? varietyMaps.intercropVarieties.get(dbRecord.intercrop_variety_id)
      : undefined

    // Rest of transformation logic (same as original transformDbToLocal)
    return {
      id: dbRecord.id,
      blocId: dbRecord.bloc_id,
      type: dbRecord.type as 'plantation' | 'ratoon',
      cycleNumber: dbRecord.cycle_number,
      status: dbRecord.status as 'active' | 'closed',
      sugarcaneVarietyId: dbRecord.sugarcane_variety_id,
      sugarcaneVarietyName,
      intercropVarietyId: dbRecord.intercrop_variety_id,
      intercropVarietyName,
      expectedYield: dbRecord.sugarcane_expected_yield_tons_ha || 0,
      intercropExpectedYieldTonnesPerHectare: dbRecord.intercrop_expected_yield_tons_ha,
      sugarcaneActualYieldTonnesPerHectare: dbRecord.sugarcane_actual_yield_tons_ha,
      intercropActualYieldTonnesPerHectare: dbRecord.intercrop_actual_yield_tons_ha,
      sugarcanePlantingDate: dbRecord.sugarcane_planting_date,
      intercropPlantingDate: dbRecord.intercrop_planting_date,
      plannedHarvestDate: dbRecord.planned_harvest_date,
      actualHarvestDate: dbRecord.actual_harvest_date,
      growthStage: dbRecord.growth_stage,
      growthStageUpdatedAt: dbRecord.growth_stage_updated_at,
      daysSincePlanting: dbRecord.days_since_planting,
      estimatedTotalCost: dbRecord.estimated_total_cost,
      actualTotalCost: dbRecord.actual_total_cost,
      totalRevenue: dbRecord.total_revenue,
      profitPerHectare: dbRecord.profit_per_hectare,
      createdAt: dbRecord.created_at,
      updatedAt: dbRecord.updated_at,
      isNew: false,
      isDirty: false
    }
  }

  /**
   * Transform database record to local CropCycle type
   * Now fetches variety names separately to avoid PostgREST join issues
   */
  private static async transformDbToLocal(dbRecord: any): Promise<CropCycle> {
    // Fetch variety names separately to avoid PostgREST relationship issues
    let sugarcaneVarietyName = 'Unknown'
    let intercropVarietyName: string | undefined

    try {
      // Fetch sugarcane variety name if ID exists
      if (dbRecord.sugarcane_variety_id) {
        const { data: sugarcaneVariety } = await supabase
          .from('sugarcane_varieties')
          .select('name, variety_id')
          .eq('id', dbRecord.sugarcane_variety_id)
          .single()

        if (sugarcaneVariety) {
          sugarcaneVarietyName = sugarcaneVariety.name
        }
      }

      // Fetch intercrop variety name if ID exists
      if (dbRecord.intercrop_variety_id) {
        const { data: intercropVariety } = await supabase
          .from('intercrop_varieties')
          .select('name, variety_id')
          .eq('id', dbRecord.intercrop_variety_id)
          .single()

        if (intercropVariety) {
          intercropVarietyName = intercropVariety.name
        }
      }
    } catch (error) {
      console.warn('Failed to fetch variety names:', error)
      // Continue with default values
    }

    return {
      id: dbRecord.id,
      blocId: dbRecord.bloc_id,
      type: dbRecord.type,
      status: dbRecord.status,
      cycleNumber: dbRecord.cycle_number,
      sugarcaneVarietyId: dbRecord.sugarcane_variety_id,
      sugarcaneVarietyName,
      plantingDate: dbRecord.sugarcane_planting_date,
      plannedHarvestDate: dbRecord.sugarcane_planned_harvest_date,
      expectedYield: dbRecord.sugarcane_expected_yield_tons_ha || 0,
      intercropVarietyId: dbRecord.intercrop_variety_id,
      intercropVarietyName,
      parentCycleId: dbRecord.parent_cycle_id,
      ratoonPlantingDate: dbRecord.intercrop_planting_date,
      growthStage: dbRecord.growth_stage,
      growthStageUpdatedAt: dbRecord.growth_stage_updated_at,
      daysSincePlanting: dbRecord.days_since_planting || 0,
      actualHarvestDate: dbRecord.sugarcane_actual_harvest_date,
      closureDate: dbRecord.created_at, // TODO: Add closure_date field
      closedBy: 'system', // TODO: Add closed_by field
      closureValidated: dbRecord.closure_validated,
      // Financial totals (now included in main query - no separate calls needed!)
      totalCosts: dbRecord.actual_total_cost || 0,
      totalRevenue: dbRecord.total_revenue || 0,
      netProfit: dbRecord.net_profit || 0,
      profitPerHectare: dbRecord.profit_per_hectare || 0,
      profitMarginPercent: dbRecord.profit_margin_percent || 0,

      // Yield data
      sugarcaneYieldTons: dbRecord.sugarcane_actual_yield_tons_ha || 0,
      sugarcaneYieldTonsPerHa: dbRecord.sugarcane_actual_yield_tons_ha || 0,

      // Revenue breakdown
      sugarcaneRevenue: dbRecord.sugarcane_revenue || 0,
      intercropRevenue: dbRecord.intercrop_revenue || 0,

      // Cost breakdown
      estimatedTotalCost: dbRecord.estimated_total_cost || 0,
      actualTotalCost: dbRecord.actual_total_cost || 0,
      createdAt: dbRecord.created_at,
      updatedAt: dbRecord.updated_at,
      createdBy: 'system' // TODO: Add created_by field
    }
  }

  /**
   * Transform local CropCycle updates to database format
   */
  private static transformLocalToDb(localUpdates: Partial<CropCycle>): any {
    const dbUpdates: any = {}

    if (localUpdates.type) dbUpdates.type = localUpdates.type
    if (localUpdates.status) dbUpdates.status = localUpdates.status
    if (localUpdates.cycleNumber) dbUpdates.cycle_number = localUpdates.cycleNumber
    if (localUpdates.sugarcaneVarietyId) dbUpdates.sugarcane_variety_id = localUpdates.sugarcaneVarietyId
    if (localUpdates.intercropVarietyId) dbUpdates.intercrop_variety_id = localUpdates.intercropVarietyId
    if (localUpdates.parentCycleId) dbUpdates.parent_cycle_id = localUpdates.parentCycleId
    if (localUpdates.plantingDate) dbUpdates.sugarcane_planting_date = localUpdates.plantingDate
    if (localUpdates.plannedHarvestDate) dbUpdates.sugarcane_planned_harvest_date = localUpdates.plannedHarvestDate
    if (localUpdates.actualHarvestDate) dbUpdates.sugarcane_actual_harvest_date = localUpdates.actualHarvestDate
    if (localUpdates.expectedYield) dbUpdates.sugarcane_expected_yield_tons_ha = localUpdates.expectedYield
    if (localUpdates.growthStage) dbUpdates.growth_stage = localUpdates.growthStage
    if (localUpdates.daysSincePlanting) dbUpdates.days_since_planting = localUpdates.daysSincePlanting
    if (localUpdates.closureValidated !== undefined) dbUpdates.closure_validated = localUpdates.closureValidated

    return dbUpdates
  }

  /**
   * Get activities for a crop cycle (helper method)
   */
  private static async getActivitiesForCycle(cycleId: string): Promise<BlocActivity[]> {
    try {
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .eq('crop_cycle_id', cycleId)
        .order('created_at', { ascending: false })

      if (error) throw error

      return (data || []).map(activity => ({
        id: activity.id,
        name: activity.name,
        description: activity.description || '',
        phase: activity.phase,
        status: activity.status,
        cropCycleId: activity.crop_cycle_id,
        cropCycleType: 'plantation' as 'plantation' | 'ratoon', // Default, could be enhanced based on cycle data
        startDate: activity.start_date,
        endDate: activity.end_date,
        actualDate: activity.activity_date, // Correct database column name
        duration: activity.duration || 0, // Correct property name
        products: [], // Will be loaded separately if needed
        resources: [], // Will be loaded separately if needed
        totalEstimatedCost: activity.estimated_total_cost || 0, // Correct property name
        totalActualCost: (activity.actual_total_cost && activity.actual_total_cost > 0) ? activity.actual_total_cost : undefined,
        notes: activity.notes,
        createdAt: activity.created_at,
        updatedAt: activity.updated_at,
        createdBy: activity.created_at || 'system' // Use created_at as fallback since created_by doesn't exist
      }))
    } catch (error) {
      console.error('Error loading activities for cycle:', error)
      return []
    }
  }

  /**
   * Get observations for a crop cycle (helper method)
   * Uses ObservationService to ensure proper data transformation
   */
  private static async getObservationsForCycle(cycleId: string): Promise<BlocObservation[]> {
    // Import ObservationService dynamically to avoid circular dependency
    const { ObservationService } = await import('./observationService')
    return ObservationService.getObservationsForCycle(cycleId)
  }
}
