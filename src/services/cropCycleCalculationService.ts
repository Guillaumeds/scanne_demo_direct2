/**
 * Crop Cycle Calculation Service
 * 
 * This service provides a clean separation between:
 * 1. Authoritative database calculations (for persistence and business logic)
 * 2. Form-level UX calculations (for real-time user feedback)
 * 
 * ARCHITECTURE PRINCIPLES:
 * - Database functions are the single source of truth for stored calculations
 * - Form calculations are for UX only and never stored directly
 * - All financial totals come from database to ensure precision and consistency
 */

import { supabase } from '@/lib/supabase'

// Types for database calculation results
export interface CropCycleTotals {
  estimatedTotalCost: number
  actualTotalCost: number
  sugarcaneYieldTonnesPerHectare: number
  intercropYieldTonnesPerHectare: number
  totalRevenue: number
  profitPerHectare: number
}

// Types for form-level calculations (UX only)
export interface FormCalculationResult {
  isTemporary: true // Marker to indicate this is not authoritative
  totalYield?: number
  totalRevenue?: number
  pricePerTonne?: number
  revenuePerHectare?: number
  note: 'This is a temporary calculation for UX feedback only. Authoritative results come from database.'
}

export class CropCycleCalculationService {
  
  /**
   * ✅ AUTHORITATIVE: Get crop cycle totals from database
   * This is the single source of truth for all financial and yield calculations
   */
  static async getAuthoritativeTotals(cropCycleId: string): Promise<CropCycleTotals | null> {
    try {
      console.log('📊 Fetching authoritative totals from database for cycle:', cropCycleId)

      // Get the crop cycle record directly from the database
      const { data, error } = await supabase
        .from('crop_cycles')
        .select('total_planned_cost, total_actual_cost, actual_yield_tons')
        .eq('id', cropCycleId)
        .single()

      if (error) {
        console.error('❌ Error fetching crop cycle totals:', error)
        throw new Error(`Failed to fetch crop cycle totals: ${error.message}`)
      }

      if (!data) {
        console.log('⚠️ No data returned for crop cycle:', cropCycleId)
        return null;
      }

      console.log('✅ Authoritative totals fetched:', data)

      return {
        estimatedTotalCost: Number(data.total_planned_cost) || 0,
        actualTotalCost: Number(data.total_actual_cost) || 0,
        sugarcaneYieldTonnesPerHectare: Number(data.actual_yield_tons) || 0,
        intercropYieldTonnesPerHectare: 0, // Intercrop yield not stored in crop_cycles table
        totalRevenue: 0, // Revenue calculation not implemented in DB yet
        profitPerHectare: 0 // Profit calculation not implemented in DB yet
      }

    } catch (error) {
      console.error('❌ Error in getAuthoritativeTotals:', error)
      throw error
    }
  }

  /**
   * 🔄 TRIGGER: Recalculate totals after data changes
   * Call this after saving activities, observations, or other data that affects totals
   * Note: This now uses frontend calculations instead of database functions
   */
  static async triggerRecalculation(cropCycleId: string): Promise<CropCycleTotals | null> {
    try {
      console.log('🔄 Triggering recalculation for crop cycle:', cropCycleId)

      // For now, just return the current totals from the database
      // The actual recalculation should be done by the frontend calculation service
      // when activities or observations are saved
      return await this.getAuthoritativeTotals(cropCycleId)
    } catch (error) {
      console.error('❌ Error triggering recalculation:', error)
      throw error
    }
  }

  /**
   * 📱 UX ONLY: Calculate form values for real-time feedback
   * These calculations are for immediate user feedback and are never stored
   *
   * 🎯 PRECISION HANDLING:
   * - Matches HTML input step values for consistent UX
   * - Prevents rounding discrepancies between calculation and display
   * - Uses appropriate decimal places for each field type
   */
  static calculateFormFeedback(params: {
    yieldPerHectare?: number
    totalYield?: number
    pricePerTonne?: number
    totalRevenue?: number
    areaHectares?: number
    fieldPrecision?: {
      yield?: number      // Default: 1 decimal (matches step="0.1")
      revenue?: number    // Default: 2 decimals (currency)
      price?: number      // Default: 2 decimals (currency)
    }
  }): FormCalculationResult {
    const { yieldPerHectare, totalYield, pricePerTonne, totalRevenue, areaHectares, fieldPrecision = {} } = params

    // Default precision settings to match HTML input step values
    const precision = {
      yield: fieldPrecision.yield ?? 1,     // step="0.1" → 1 decimal
      revenue: fieldPrecision.revenue ?? 2, // currency → 2 decimals
      price: fieldPrecision.price ?? 2      // currency → 2 decimals
    }

    const result: FormCalculationResult = {
      isTemporary: true,
      note: 'This is a temporary calculation for UX feedback only. Authoritative results come from database.'
    }

    // Calculate total yield from per-hectare yield (match field precision)
    if (yieldPerHectare && areaHectares && areaHectares > 0) {
      const calculated = yieldPerHectare * areaHectares
      result.totalYield = Number(calculated.toFixed(precision.yield))
    }

    // Calculate revenue from yield and price (currency precision)
    if (result.totalYield && pricePerTonne && pricePerTonne > 0) {
      const calculated = result.totalYield * pricePerTonne
      result.totalRevenue = Number(calculated.toFixed(precision.revenue))
    }

    // Calculate price per tonne from revenue and yield (currency precision)
    if (totalRevenue && totalYield && totalYield > 0) {
      const calculated = totalRevenue / totalYield
      result.pricePerTonne = Number(calculated.toFixed(precision.price))
    }

    // Calculate revenue per hectare (currency precision)
    if (result.totalRevenue && areaHectares && areaHectares > 0) {
      const calculated = result.totalRevenue / areaHectares
      result.revenuePerHectare = Number(calculated.toFixed(precision.revenue))
    }

    return result
  }

  /**
   * 🧮 UX ONLY: Calculate activity costs for form validation
   * This is for immediate feedback only - database stores authoritative totals
   */
  static calculateActivityFormCosts(products: any[], resources: any[]): {
    estimatedTotal: number
    actualTotal: number
    hasActualCosts: boolean
    note: string
  } {
    let estimatedTotal = 0
    let actualTotal = 0
    let hasActualCosts = false

    // Calculate product costs
    if (products) {
      for (const product of products) {
        estimatedTotal += product.estimatedCost || 0
        if (product.actualCost !== undefined && product.actualCost !== null) {
          actualTotal += product.actualCost
          hasActualCosts = true
        }
      }
    }

    // Calculate resource costs
    if (resources) {
      for (const resource of resources) {
        estimatedTotal += resource.estimatedCost || 0
        if (resource.actualCost !== undefined && resource.actualCost !== null) {
          actualTotal += resource.actualCost
          hasActualCosts = true
        }
      }
    }

    return {
      estimatedTotal: Number(estimatedTotal.toFixed(2)),
      actualTotal: Number(actualTotal.toFixed(2)),
      hasActualCosts,
      note: 'Form calculation for UX only. Database will store authoritative totals when activity is saved.'
    }
  }

  /**
   * 📊 INTEGRATION: Update crop cycle with fresh calculations
   * Call this after saving activities or observations to update the UI
   */
  static async updateCropCycleDisplay(cropCycleId: string, updateCallback: (totals: CropCycleTotals) => void): Promise<void> {
    try {
      const totals = await this.getAuthoritativeTotals(cropCycleId)
      if (totals) {
        updateCallback(totals)
      }
    } catch (error) {
      console.error('❌ Error updating crop cycle display:', error)
      // Don't throw - this is for UI updates only
    }
  }

  /**
   * 🔧 MAINTENANCE: Force recalculation for all crop cycles
   * Use this to fix crop cycles that were created before atomic functions were implemented
   */
  static async forceRecalculateAllCycles(): Promise<void> {
    try {
      console.log('🔧 Starting force recalculation for all crop cycles...')

      // Get all active crop cycles
      const { data: cycles, error } = await supabase
        .from('crop_cycles')
        .select('id')
        .eq('status', 'active')

      if (error) throw error

      if (!cycles || cycles.length === 0) {
        console.log('ℹ️ No active crop cycles found')
        return
      }

      console.log(`🔄 Recalculating ${cycles.length} crop cycles...`)

      // Recalculate each cycle
      for (const cycle of cycles) {
        try {
          await this.triggerRecalculation(cycle.id)
          console.log(`✅ Recalculated cycle: ${cycle.id}`)
        } catch (error) {
          console.error(`❌ Failed to recalculate cycle ${cycle.id}:`, error)
        }
      }

      console.log('🎉 Force recalculation completed!')
    } catch (error) {
      console.error('❌ Error in force recalculation:', error)
      throw error
    }
  }

  /**
   * 🔍 VALIDATION: Check if calculations are consistent
   * Useful for debugging and ensuring data integrity
   */
  static async validateCalculations(cropCycleId: string): Promise<{
    isValid: boolean
    issues: string[]
    totals?: CropCycleTotals
  }> {
    try {
      const totals = await this.getAuthoritativeTotals(cropCycleId)
      const issues: string[] = []

      if (!totals) {
        return {
          isValid: false,
          issues: ['No calculation results returned from database']
        }
      }

      // Check for negative values that shouldn't be negative
      if (totals.estimatedTotalCost < 0) {
        issues.push('Estimated total cost is negative')
      }

      if (totals.actualTotalCost < 0) {
        issues.push('Actual total cost is negative')
      }

      if (totals.totalRevenue < 0) {
        issues.push('Total revenue is negative')
      }

      // Check for unrealistic values
      if (totals.sugarcaneYieldTonnesPerHectare > 200) {
        issues.push('Sugarcane yield per hectare seems unrealistically high (>200 tonnes/ha)')
      }

      if (totals.intercropYieldTonnesPerHectare > 100) {
        issues.push('Intercrop yield per hectare seems unrealistically high (>100 tonnes/ha)')
      }

      return {
        isValid: issues.length === 0,
        issues,
        totals
      }

    } catch (error) {
      return {
        isValid: false,
        issues: [`Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`]
      }
    }
  }
}

/**
 * 🎯 USAGE EXAMPLES:
 * 
 * // ✅ Get authoritative totals for display
 * const totals = await CropCycleCalculationService.getAuthoritativeTotals(cycleId)
 * 
 * // 🔄 After saving an activity
 * await ActivityService.saveActivity(activity)
 * const updatedTotals = await CropCycleCalculationService.triggerRecalculation(cycleId)
 * 
 * // 📱 For real-time form feedback
 * const formFeedback = CropCycleCalculationService.calculateFormFeedback({
 *   yieldPerHectare: 85,
 *   areaHectares: 2.5,
 *   pricePerTonne: 120
 * })
 * 
 * // 🧮 For activity form validation
 * const activityCosts = CropCycleCalculationService.calculateActivityFormCosts(
 *   products, resources
 * )
 */
