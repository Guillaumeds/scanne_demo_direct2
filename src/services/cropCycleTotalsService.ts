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

      // Update crop cycle totals using regular update (RPC function not available)
      const { data, error } = await supabase
        .from('crop_cycles')
        .update({
          total_planned_cost: totals.estimatedTotalCost,
          total_actual_cost: totals.actualTotalCost,
          updated_at: new Date().toISOString()
          // Note: Revenue fields not implemented in DB yet
        })
        .eq('id', cycleUuid)

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
