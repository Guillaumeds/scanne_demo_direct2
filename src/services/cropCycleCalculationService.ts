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
      
      const { data, error } = await supabase.rpc('calculate_crop_cycle_totals', {
        cycle_id: cropCycleId
      })

      if (error) {
        console.error('❌ Error fetching crop cycle totals:', error)
        throw new Error(`Failed to calculate crop cycle totals: ${error.message}`)
      }

      if (!data || data.length === 0) {
        console.log('⚠️ No data returned for crop cycle:', cropCycleId)
        return null
      }

      const result = data[0]
      console.log('✅ Authoritative totals calculated:', result)

      return {
        estimatedTotalCost: Number(result.estimated_total_cost) || 0,
        actualTotalCost: Number(result.actual_total_cost) || 0,
        sugarcaneYieldTonnesPerHectare: Number(result.sugarcane_yield_tonnes_per_hectare) || 0,
        intercropYieldTonnesPerHectare: Number(result.intercrop_yield_tonnes_per_hectare) || 0,
        totalRevenue: Number(result.total_revenue) || 0,
        profitPerHectare: Number(result.profit_per_hectare) || 0
      }

    } catch (error) {
      console.error('❌ Error in getAuthoritativeTotals:', error)
      throw error
    }
  }

  /**
   * 🔄 TRIGGER: Recalculate totals after data changes
   * Call this after saving activities, observations, or other data that affects totals
   */
  static async triggerRecalculation(cropCycleId: string): Promise<CropCycleTotals | null> {
    try {
      console.log('🔄 Triggering recalculation for crop cycle:', cropCycleId)
      
      // The database function automatically recalculates from current data
      const totals = await this.getAuthoritativeTotals(cropCycleId)
      
      if (totals) {
        console.log('✅ Recalculation completed:', totals)
      }
      
      return totals
    } catch (error) {
      console.error('❌ Error triggering recalculation:', error)
      throw error
    }
  }

  /**
   * 📱 UX ONLY: Calculate form values for real-time feedback
   * These calculations are for immediate user feedback and are never stored
   */
  static calculateFormFeedback(params: {
    yieldPerHectare?: number
    totalYield?: number
    pricePerTonne?: number
    totalRevenue?: number
    areaHectares?: number
  }): FormCalculationResult {
    const { yieldPerHectare, totalYield, pricePerTonne, totalRevenue, areaHectares } = params
    
    const result: FormCalculationResult = {
      isTemporary: true,
      note: 'This is a temporary calculation for UX feedback only. Authoritative results come from database.'
    }

    // Calculate total yield from per-hectare yield
    if (yieldPerHectare && areaHectares && areaHectares > 0) {
      result.totalYield = Number((yieldPerHectare * areaHectares).toFixed(2))
    }

    // Calculate revenue from yield and price
    if (result.totalYield && pricePerTonne && pricePerTonne > 0) {
      result.totalRevenue = Number((result.totalYield * pricePerTonne).toFixed(2))
    }

    // Calculate price per tonne from revenue and yield
    if (totalRevenue && totalYield && totalYield > 0) {
      result.pricePerTonne = Number((totalRevenue / totalYield).toFixed(2))
    }

    // Calculate revenue per hectare
    if (result.totalRevenue && areaHectares && areaHectares > 0) {
      result.revenuePerHectare = Number((result.totalRevenue / areaHectares).toFixed(2))
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
