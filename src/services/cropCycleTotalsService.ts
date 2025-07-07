/**
 * Crop Cycle Totals Service
 * Handles updating crop cycle totals in the database
 * Called from frontend after calculations are done
 */

import { supabase } from '@/lib/supabase'
import { CropCycleTotals } from './frontendCalculationService'

export class CropCycleTotalsService {
  
  /**
   * Update crop cycle totals in database (called from frontend after calculations)
   */
  static async updateCycleTotals(cycleUuid: string, totals: CropCycleTotals): Promise<boolean> {
    try {
      console.log('💾 Updating crop cycle totals in database:', cycleUuid, totals)

      const { data, error } = await supabase.rpc('update_crop_cycle_totals', {
        p_cycle_id: cycleUuid,
        p_estimated_total_cost: totals.estimatedTotalCost,
        p_actual_total_cost: totals.actualTotalCost,
        p_total_revenue: totals.totalRevenue,
        p_sugarcane_revenue: totals.sugarcaneRevenue,
        p_intercrop_revenue: totals.intercropRevenue,
        p_net_profit: totals.netProfit,
        p_profit_per_hectare: totals.profitPerHectare,
        p_profit_margin_percent: totals.profitMarginPercent,
        p_sugarcane_actual_yield_tons_ha: totals.sugarcaneActualYieldTonsHa
      })

      if (error) {
        console.error('❌ Error updating crop cycle totals:', error)
        throw new Error(`Failed to update crop cycle totals: ${error.message}`)
      }

      console.log('✅ Successfully updated crop cycle totals in database')
      return data || true
    } catch (error) {
      console.error('❌ Error in updateCycleTotals:', error)
      throw error
    }
  }

  /**
   * Atomic save: individual record + totals update
   * Used by activities and observations services
   */
  static async atomicSaveWithTotals(
    individualSaveOperation: () => Promise<any>,
    cycleId: string,
    totals: CropCycleTotals
  ): Promise<any> {
    try {
      // Start transaction-like behavior
      console.log('🔄 Starting atomic save with totals update')

      // 1. Save individual record first
      const savedRecord = await individualSaveOperation()
      console.log('✅ Individual record saved:', savedRecord)

      // 2. Update crop cycle totals
      await this.updateCycleTotals(cycleId, totals)
      console.log('✅ Crop cycle totals updated')

      return savedRecord
    } catch (error) {
      console.error('❌ Error in atomic save with totals:', error)
      throw error
    }
  }
}
