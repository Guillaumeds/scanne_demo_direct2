/**
 * Crop Cycle Totals Calculation Service
 * Centralized service for calculating and updating crop cycle financial and yield totals
 * Integrates with database operations to ensure totals are always up-to-date
 */

import { supabase } from '@/lib/supabase'

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
   * Calculate totals for a crop cycle from its activities and observations
   */
  static async calculateCropCycleTotals(cropCycleId: string): Promise<CropCycleTotals> {
    try {
      // Get all activities for this crop cycle
      const { data: activities, error: activitiesError } = await supabase
        .from('activities')
        .select('estimated_total_cost, actual_total_cost')
        .eq('crop_cycle_id', cropCycleId)

      if (activitiesError) {
        console.error('Error fetching activities for totals calculation:', activitiesError)
        throw activitiesError
      }

      // Get all observations for this crop cycle
      const { data: observations, error: observationsError } = await supabase
        .from('observations')
        .select('observation_data')
        .eq('crop_cycle_id', cropCycleId)

      if (observationsError) {
        console.error('Error fetching observations for totals calculation:', observationsError)
        throw observationsError
      }

      // Get crop cycle details for area calculation
      const { data: cropCycle, error: cropCycleError } = await supabase
        .from('crop_cycles')
        .select(`
          *,
          blocs(area_hectares)
        `)
        .eq('id', cropCycleId)
        .single()

      if (cropCycleError) {
        console.error('Error fetching crop cycle for totals calculation:', cropCycleError)
        throw cropCycleError
      }

      // Calculate activity totals
      const estimatedTotalCost = (activities || []).reduce((sum, activity) => 
        sum + (activity.estimated_total_cost || 0), 0)
      
      const actualTotalCost = (activities || []).reduce((sum, activity) => 
        sum + (activity.actual_total_cost || 0), 0)

      // Calculate observation-based totals (yield and revenue)
      let sugarcaneYieldTons = 0
      let intercropYieldTons = 0
      let sugarcaneRevenue = 0
      let intercropRevenue = 0

      (observations || []).forEach(observation => {
        const data = observation.observation_data as any
        if (data) {
          // Sugarcane yield (rounded to whole number as specified)
          if (data.sugarcaneYieldTons) {
            sugarcaneYieldTons += Math.round(data.sugarcaneYieldTons)
          }
          if (data.sugarcaneYieldTonsPerHa && cropCycle.blocs?.area_hectares) {
            sugarcaneYieldTons += Math.round(data.sugarcaneYieldTonsPerHa * cropCycle.blocs.area_hectares)
          }

          // Intercrop yield (rounded to whole number as specified)
          if (data.intercropYieldTons) {
            intercropYieldTons += Math.round(data.intercropYieldTons)
          }
          if (data.intercropYieldTonsPerHa && cropCycle.blocs?.area_hectares) {
            intercropYieldTons += Math.round(data.intercropYieldTonsPerHa * cropCycle.blocs.area_hectares)
          }

          // Revenue calculations
          if (data.sugarcaneRevenue) {
            sugarcaneRevenue += data.sugarcaneRevenue
          }
          if (data.sugarcanePricePerTonne && data.sugarcaneYieldTons) {
            sugarcaneRevenue += data.sugarcanePricePerTonne * Math.round(data.sugarcaneYieldTons)
          }

          if (data.intercropRevenue) {
            intercropRevenue += data.intercropRevenue
          }
          if (data.intercropPricePerTonne && data.intercropYieldTons) {
            intercropRevenue += data.intercropPricePerTonne * Math.round(data.intercropYieldTons)
          }
        }
      })

      // Calculate yield per hectare
      const areaHectares = cropCycle.blocs?.area_hectares || 1
      const sugarcaneYieldTonsHa = Math.round(sugarcaneYieldTons / areaHectares)

      // Calculate final totals
      const totalRevenue = sugarcaneRevenue + intercropRevenue
      const netProfit = totalRevenue - actualTotalCost
      const profitMarginPercent = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0

      return {
        estimatedTotalCost,
        actualTotalCost,
        sugarcaneYieldTonsHa,
        sugarcaneRevenue,
        intercropRevenue,
        totalRevenue,
        netProfit,
        profitMarginPercent: Math.round(profitMarginPercent * 100) / 100 // Round to 2 decimal places
      }

    } catch (error) {
      console.error('Error calculating crop cycle totals:', error)
      throw error
    }
  }

  /**
   * Update crop cycle totals in database
   */
  static async updateCropCycleTotals(cropCycleId: string, totals: CropCycleTotals): Promise<void> {
    try {
      const { error } = await supabase
        .from('crop_cycles')
        .update({
          estimated_total_cost: totals.estimatedTotalCost,
          actual_total_cost: totals.actualTotalCost,
          sugarcane_actual_yield_tons_ha: totals.sugarcaneYieldTonsHa,
          sugarcane_revenue: totals.sugarcaneRevenue,
          intercrop_revenue: totals.intercropRevenue,
          total_revenue: totals.totalRevenue,
          net_profit: totals.netProfit,
          profit_margin_percent: totals.profitMarginPercent,
          updated_at: new Date().toISOString()
        })
        .eq('id', cropCycleId)

      if (error) {
        console.error('Error updating crop cycle totals:', error)
        throw error
      }

      console.log(`Updated crop cycle ${cropCycleId} totals:`, totals)
    } catch (error) {
      console.error('Error updating crop cycle totals in database:', error)
      throw error
    }
  }

  /**
   * Calculate and update crop cycle totals (combined operation)
   * This is the main method to be called when activities/observations change
   */
  static async recalculateAndUpdateTotals(cropCycleId: string): Promise<CropCycleTotals> {
    try {
      const totals = await this.calculateCropCycleTotals(cropCycleId)
      await this.updateCropCycleTotals(cropCycleId, totals)
      return totals
    } catch (error) {
      console.error('Error recalculating and updating crop cycle totals:', error)
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
