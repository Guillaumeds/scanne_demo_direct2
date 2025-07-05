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
   * Get all crop cycles for a specific bloc
   */
  static async getCropCyclesForBloc(blocId: string): Promise<CropCycle[]> {
    try {
      const { data, error } = await supabase
        .from('crop_cycles')
        .select(`
          *,
          sugarcane_varieties(name, variety_id),
          intercrop_varieties(name, variety_id)
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
        .select(`
          *,
          sugarcane_varieties(name, variety_id),
          intercrop_varieties(name, variety_id)
        `)
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
      // Calculate initial growth stage and days since planting
      const plantingDate = new Date(request.plantingDate || new Date())
      const daysSincePlanting = Math.floor((new Date().getTime() - plantingDate.getTime()) / (1000 * 60 * 60 * 24))
      const initialGrowthStage = this.calculateGrowthStage(daysSincePlanting)

      // Note: The frontend should now pass UUIDs directly from cached variety data
      // This eliminates the need for database lookups during crop cycle creation
      const sugarcaneVarietyUuid = request.sugarcaneVarietyId === 'none' ? null : request.sugarcaneVarietyId
      const intercropVarietyUuid = request.intercropVarietyId === 'none' ? null : request.intercropVarietyId

      const insertData = {
        bloc_id: request.blocId,
        type: request.type,
        cycle_number: request.type === 'plantation' ? 1 : 2, // Calculate based on type
        sugarcane_variety_id: sugarcaneVarietyUuid,
        intercrop_variety_id: intercropVarietyUuid,
        parent_cycle_id: request.parentCycleId || null,
        sugarcane_planting_date: request.plantingDate,
        sugarcane_planned_harvest_date: request.plannedHarvestDate,
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

      // Update cycle with closure data
      const { data, error } = await supabase
        .from('crop_cycles')
        .update({
          status: 'closed',
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
   * Update growth stages for all active crop cycles
   * This would be called by a database trigger or scheduled job in real implementation
   */
  static async updateGrowthStages(): Promise<void> {
    try {
      const { data: activeCycles, error } = await supabase
        .from('crop_cycles')
        .select('id, sugarcane_planting_date, growth_stage')
        .eq('status', 'active')

      if (error) throw error

      for (const cycle of activeCycles || []) {
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
   */
  private static calculateGrowthStage(daysSincePlanting: number): GrowthStage {
    if (daysSincePlanting <= 30) return 'germination'
    if (daysSincePlanting <= 120) return 'tillering'
    if (daysSincePlanting <= 270) return 'grand-growth'
    if (daysSincePlanting <= 360) return 'maturation'
    return 'ripening'
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
      expectedYield: dbRecord.sugarcane_actual_yield_tons_ha || 0,
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
      totalCosts: dbRecord.actual_total_cost,
      totalRevenue: dbRecord.total_revenue,
      netProfit: dbRecord.net_profit,
      profitPerHectare: dbRecord.net_profit, // TODO: Calculate per hectare
      sugarcaneYieldTons: dbRecord.sugarcane_actual_yield_tons_ha,
      sugarcaneYieldTonsPerHa: dbRecord.sugarcane_actual_yield_tons_ha,
      sugarcaneRevenue: dbRecord.sugarcane_revenue,
      intercropRevenue: dbRecord.intercrop_revenue,
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
    if (localUpdates.expectedYield) dbUpdates.sugarcane_actual_yield_tons_ha = localUpdates.expectedYield
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
        description: activity.description,
        phase: activity.phase,
        status: activity.status,
        cropCycleId: activity.crop_cycle_id,
        startDate: activity.start_date,
        endDate: activity.end_date,
        actualDate: activity.actual_date,
        durationHours: activity.duration_hours,
        estimatedTotalCost: activity.estimated_total_cost || 0,
        actualTotalCost: activity.actual_total_cost || 0,
        notes: activity.notes,
        createdAt: activity.created_at,
        updatedAt: activity.updated_at,
        createdBy: activity.created_by || 'system'
      }))
    } catch (error) {
      console.error('Error loading activities for cycle:', error)
      return []
    }
  }

  /**
   * Get observations for a crop cycle (helper method)
   */
  private static async getObservationsForCycle(cycleId: string): Promise<BlocObservation[]> {
    try {
      const { data, error } = await supabase
        .from('observations')
        .select('*')
        .eq('crop_cycle_id', cycleId)
        .order('created_at', { ascending: false })

      if (error) throw error

      return (data || []).map(observation => ({
        id: observation.id,
        name: observation.name,
        description: observation.description,
        category: observation.category,
        status: observation.status,
        cropCycleId: observation.crop_cycle_id,
        observationDate: observation.observation_date,
        numberOfSamples: observation.number_of_samples,
        numberOfPlants: observation.number_of_plants,
        observationData: observation.observation_data,
        notes: observation.notes,
        createdAt: observation.created_at,
        updatedAt: observation.updated_at,
        createdBy: observation.created_by || 'system'
      }))
    } catch (error) {
      console.error('Error loading observations for cycle:', error)
      return []
    }
  }
}
