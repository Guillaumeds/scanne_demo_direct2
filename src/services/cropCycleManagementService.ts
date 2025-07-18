// Crop Cycle Management Service
// Handles CRUD operations and validation for crop cycles
// Updated to work with real crop_cycles and field_operations tables

import { supabase } from '@/lib/supabase'
import {
  CropCycle,
  CreateCropCycleRequest,
  CloseCropCycleRequest,
  CropCycleValidation,
  CropCycleSummary
} from '@/types/cropCycleManagement'

export class CropCycleManagementService {

  /**
   * Get the active crop cycle for a bloc
   * Works with real crop_cycles table
   */
  static async getActiveCropCycle(blocId: string): Promise<CropCycle | null> {
    try {
      const { data, error } = await supabase
        .from('crop_cycles')
        .select(`
          *,
          sugarcane_varieties!inner(name),
          intercrop_varieties(name)
        `)
        .eq('bloc_id', blocId)
        .eq('status', 'active')
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows returned - no active cycle
          return null
        }
        throw new Error(`Failed to fetch active crop cycle: ${error.message}`)
      }

      return this.transformDbToCropCycle(data)
    } catch (error) {
      console.warn('crop_cycles table not found, returning null')
      return null
    }
  }

  /**
   * Get crop cycle history (closed cycles) for a bloc
   */
  static async getCropCycleHistory(blocId: string): Promise<CropCycle[]> {
    try {
      const { data, error } = await supabase
        .from('crop_cycles')
        .select(`
          *,
          sugarcane_varieties!inner(name),
          intercrop_varieties(name)
        `)
        .eq('bloc_id', blocId)
        .eq('status', 'closed')
        .order('created_at', { ascending: false })

      if (error) {
        throw new Error(`Failed to fetch crop cycle history: ${error.message}`)
      }

      return data?.map(cycle => this.transformDbToCropCycle(cycle)) || []
    } catch (error) {
      console.warn('crop_cycles table not found, returning empty array')
      return []
    }
  }

  /**
   * Create a new crop cycle
   * Works with real crop_cycles table
   */
  static async createCropCycle(request: CreateCropCycleRequest): Promise<CropCycle> {
    try {
      // Validate that no active cycle exists
      const existingCycle = await this.getActiveCropCycle(request.blocId)
      if (existingCycle) {
        throw new Error('An active crop cycle already exists for this bloc')
      }

      // Determine cycle number
      const history = await this.getCropCycleHistory(request.blocId)
      const cycleNumber = history.length + 1

      // Calculate days since planting
      const daysSincePlanting = request.plantingDate
        ? Math.floor((Date.now() - new Date(request.plantingDate).getTime()) / (1000 * 60 * 60 * 24))
        : 0

      const newCycle = {
        bloc_id: request.blocId,
        type: request.type,
        cycle_number: cycleNumber,
        status: 'active' as const,

        // Variety information
        sugarcane_variety_id: request.sugarcaneVarietyId,

        // Dates
        sugarcane_planting_date: request.plantingDate,
        sugarcane_planned_harvest_date: request.expectedHarvestDate,

        // Yield expectations
        sugarcane_expected_yield_tons_ha: request.expectedYield,

        // Parent relationship for ratoon cycles
        parent_cycle_id: request.parentCycleId,

        // Initialize financial tracking
        estimated_total_cost: 0,
        actual_total_cost: 0,
        sugarcane_revenue: 0,
        total_revenue: 0,
        net_profit: 0,
        profit_per_hectare: 0,
        profit_margin_percent: 0,

        // Growth tracking
        growth_stage: 'germination',
        days_since_planting: daysSincePlanting,
        growth_stage_updated_at: new Date().toISOString(),

        // Validation
        closure_validated: false,

        // Metadata
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('crop_cycles')
        .insert(newCycle)
        .select(`
          *,
          sugarcane_varieties!inner(name)
        `)
        .single()

      if (error) {
        throw new Error(`Failed to create crop cycle: ${error.message}`)
      }

      return this.transformDbToCropCycle(data)
    } catch (error) {
      console.error('Error creating crop cycle:', error)
      throw error
    }
  }

  /**
   * Validate crop cycle for closure
   */
  static async validateCropCycleForClosure(cycleId: string): Promise<CropCycleValidation> {
    try {
      // Check if all field operations are completed
      const { data: operations, error: operationsError } = await supabase
        .from('field_operations')
        .select('status')
        .eq('crop_cycle_uuid', cycleId)

      if (operationsError) {
        throw new Error(`Failed to fetch operations: ${operationsError.message}`)
      }

      const operationsCompleted = operations?.every(op => op.status === 'completed') || false

      // Check if costs are entered (basic validation)
      const { data: cycle, error: cycleError } = await supabase
        .from('crop_cycles')
        .select('total_actual_cost, actual_harvest_date')
        .eq('id', cycleId)
        .single()

      if (cycleError) {
        throw new Error(`Failed to fetch cycle: ${cycleError.message}`)
      }

      const costsEntered = (cycle.total_actual_cost || 0) > 0
      const harvestCompleted = !!cycle.actual_harvest_date

      const validationErrors: string[] = []
      if (!operationsCompleted) validationErrors.push('Not all field operations are completed')
      if (!costsEntered) validationErrors.push('Actual costs have not been entered')
      if (!harvestCompleted) validationErrors.push('Harvest date has not been recorded')

      return {
        canClose: validationErrors.length === 0,
        operationsCompleted,
        costsEntered,
        harvestCompleted,
        validationErrors
      }
    } catch (error) {
      console.error('Error validating crop cycle:', error)
      return {
        canClose: false,
        operationsCompleted: false,
        costsEntered: false,
        harvestCompleted: false,
        validationErrors: ['Validation failed due to system error']
      }
    }
  }

  /**
   * Close a crop cycle
   */
  static async closeCropCycle(request: CloseCropCycleRequest): Promise<CropCycle> {
    try {
      // First validate that the cycle can be closed
      const validation = await this.validateCropCycleForClosure(request.cycleId)

      if (!validation.canClose) {
        throw new Error(`Cannot close crop cycle: ${validation.validationErrors.join(', ')}`)
      }

      // Update the crop cycle to closed status
      const { data, error } = await supabase
        .from('crop_cycles')
        .update({
          status: 'closed',
          sugarcane_actual_harvest_date: request.actualHarvestDate,
          closure_validated: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', request.cycleId)
        .select(`
          *,
          sugarcane_varieties!inner(name)
        `)
        .single()

      if (error) {
        throw new Error(`Failed to close crop cycle: ${error.message}`)
      }

      return this.transformDbToCropCycle(data)
    } catch (error) {
      console.error('Error closing crop cycle:', error)
      throw error
    }
  }

  /**
   * Transform database crop cycle to frontend type
   */
  private static transformDbToCropCycle(data: any): CropCycle {
    return {
      id: data.id,
      blocId: data.bloc_id,
      type: data.type,
      cycleNumber: data.cycle_number,
      status: data.status,
      sugarcaneVarietyId: data.sugarcane_variety_id,
      sugarcaneVarietyName: data.sugarcane_varieties?.name || '',
      sugarcaneePlantingDate: data.sugarcane_planting_date,
      sugarcaneePlannedHarvestDate: data.sugarcane_planned_harvest_date,
      sugarcaneActualHarvestDate: data.sugarcane_actual_harvest_date,
      sugarcaneExpectedYieldTonsHa: data.sugarcane_expected_yield_tons_ha || 0,
      sugarcaneActualYieldTonsHa: data.sugarcane_actual_yield_tons_ha,
      estimatedTotalCost: data.estimated_total_cost || 0,
      actualTotalCost: data.actual_total_cost || 0,
      sugarcaneeRevenue: data.sugarcane_revenue || 0,
      totalRevenue: data.total_revenue || 0,
      netProfit: data.net_profit || 0,
      profitPerHectare: data.profit_per_hectare || 0,
      profitMarginPercent: data.profit_margin_percent || 0,
      growthStage: data.growth_stage,
      growthStageUpdatedAt: data.growth_stage_updated_at,
      daysSincePlanting: data.days_since_planting || 0,
      closureValidated: data.closure_validated || false,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    }
  }
}



