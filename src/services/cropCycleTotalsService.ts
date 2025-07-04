/**
 * Crop Cycle Totals Service
 *
 * ⚠️ DEPRECATED: This service has been refactored to use database functions
 *
 * MIGRATION NOTICE:
 * - calculateCropCycleTotals() is now replaced with database function calls
 * - Use CropCycleCalculationService.getAuthoritativeTotals() instead
 * - This ensures data consistency and better performance
 *
 * @deprecated Use CropCycleCalculationService instead
 */

import { supabase } from '@/lib/supabase'
import { CropCycleCalculationService } from './cropCycleCalculationService'

export interface CropCycleTotals {
  estimatedTotalCost: number
  actualTotalCost: number
  sugarcaneYieldTonsHa: number
  sugarcaneRevenue: number
  intercropRevenue: number
  totalRevenue: number
  netProfit: number
  profitMarginPercent: number
}

export class CropCycleTotalsService {

  /**
   * @deprecated Use CropCycleCalculationService.getAuthoritativeTotals() instead
   * Calculate totals for a crop cycle using database function
   */
  static async calculateCropCycleTotals(cropCycleId: string): Promise<CropCycleTotals> {
    console.warn('⚠️ DEPRECATED: CropCycleTotalsService.calculateCropCycleTotals() is deprecated. Use CropCycleCalculationService.getAuthoritativeTotals() instead.')

    try {
      // Use the new database-first calculation service
      const authoritativeTotals = await CropCycleCalculationService.getAuthoritativeTotals(cropCycleId)

      if (!authoritativeTotals) {
        throw new Error('No calculation results available for crop cycle')
      }

      // Convert to legacy format for backward compatibility
      const totalRevenue = authoritativeTotals.totalRevenue
      const netProfit = totalRevenue - authoritativeTotals.actualTotalCost
      const profitMarginPercent = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0

      return {
        estimatedTotalCost: authoritativeTotals.estimatedTotalCost,
        actualTotalCost: authoritativeTotals.actualTotalCost,
        sugarcaneYieldTonsHa: authoritativeTotals.sugarcaneYieldTonnesPerHectare,
        sugarcaneRevenue: totalRevenue, // Database function returns total revenue, not split by type
        intercropRevenue: 0, // TODO: Database function needs to be updated to split revenue by type
        totalRevenue: totalRevenue,
        netProfit: netProfit,
        profitMarginPercent: Math.round(profitMarginPercent * 100) / 100
      }

    } catch (error) {
      console.error('❌ Error in deprecated calculateCropCycleTotals:', error)
      throw error
    }
  }

  /**
   * @deprecated Database functions now handle calculations automatically
   * Update crop cycle totals in database
   */
  static async updateCropCycleTotals(cropCycleId: string, totals: CropCycleTotals): Promise<void> {
    console.warn('⚠️ DEPRECATED: updateCropCycleTotals() is deprecated. Database functions now calculate totals automatically.')

    try {
      // Trigger recalculation using the new service
      await CropCycleCalculationService.triggerRecalculation(cropCycleId)
      console.log(`✅ Triggered recalculation for crop cycle ${cropCycleId}`)
    } catch (error) {
      console.error('❌ Error triggering recalculation:', error)
      throw error
    }
  }

  /**
   * @deprecated Use CropCycleCalculationService.triggerRecalculation() instead
   * Calculate and update crop cycle totals (combined operation)
   */
  static async recalculateAndUpdateTotals(cropCycleId: string): Promise<CropCycleTotals> {
    console.warn('⚠️ DEPRECATED: recalculateAndUpdateTotals() is deprecated. Use CropCycleCalculationService.triggerRecalculation() instead.')

    try {
      // Use the new service for recalculation
      const authoritativeTotals = await CropCycleCalculationService.triggerRecalculation(cropCycleId)

      if (!authoritativeTotals) {
        throw new Error('Recalculation failed - no results returned')
      }

      // Convert to legacy format for backward compatibility
      const totalRevenue = authoritativeTotals.totalRevenue
      const netProfit = totalRevenue - authoritativeTotals.actualTotalCost
      const profitMarginPercent = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0

      return {
        estimatedTotalCost: authoritativeTotals.estimatedTotalCost,
        actualTotalCost: authoritativeTotals.actualTotalCost,
        sugarcaneYieldTonsHa: authoritativeTotals.sugarcaneYieldTonnesPerHectare,
        sugarcaneRevenue: totalRevenue,
        intercropRevenue: 0,
        totalRevenue: totalRevenue,
        netProfit: netProfit,
        profitMarginPercent: Math.round(profitMarginPercent * 100) / 100
      }
    } catch (error) {
      console.error('❌ Error in deprecated recalculateAndUpdateTotals:', error)
      throw error
    }
  }

  /**
   * Batch update totals for multiple crop cycles
   * Useful for data migration or bulk operations
   */
  static async batchUpdateTotals(cropCycleIds: string[]): Promise<void> {
    try {
      const promises = cropCycleIds.map(id => this.recalculateAndUpdateTotals(id))
      await Promise.all(promises)
      console.log(`Successfully updated totals for ${cropCycleIds.length} crop cycles`)
    } catch (error) {
      console.error('Error in batch update of crop cycle totals:', error)
      throw error
    }
  }
}
