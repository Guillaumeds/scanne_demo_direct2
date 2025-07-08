/**
 * Frontend Calculation Service
 * Centralized service for all financial and yield calculations
 * Replaces database-side calculations with consistent frontend logic
 */

import { BlocActivity } from '@/types/activities'
import { BlocObservation } from '@/types/observations'

// Types for calculation results
export interface ActivityTotals {
  estimatedTotalCost: number
  actualTotalCost: number
  activityCount: number
  completedActivityCount: number
}

export interface ObservationTotals {
  totalRevenue: number
  sugarcaneRevenue: number
  intercropRevenue: number
  totalYieldTons: number
  sugarcaneYieldTonsHa: number
  intercropYieldTonsHa: number
  observationCount: number
  completedObservationCount: number
}

export interface CropCycleTotals {
  // Activity totals
  estimatedTotalCost: number
  actualTotalCost: number
  
  // Observation totals
  totalRevenue: number
  sugarcaneRevenue: number
  intercropRevenue: number
  
  // Yield data
  sugarcaneActualYieldTonsHa: number
  intercropActualYieldTonsHa: number
  
  // Calculated metrics
  netProfit: number
  profitPerHectare: number
  profitMarginPercent: number
  
  // Metadata
  lastUpdated: string
  cycleId: string
}

export class FrontendCalculationService {
  
  // LocalStorage keys for cycle totals
  private static readonly CYCLE_TOTALS_PREFIX = 'scanne_cycle_totals_'
  
  /**
   * Calculate activity totals for a crop cycle
   */
  static calculateActivityTotals(activities: BlocActivity[]): ActivityTotals {
    console.log('🧮 FrontendCalculationService: Calculating activity totals for', activities.length, 'activities')

    const activeActivities = activities.filter(a => a.cropCycleId) // Only activities for this cycle
    console.log('🔍 Active activities after filtering:', activeActivities.length)

    let estimatedTotalCost = 0
    let actualTotalCost = 0
    let completedActivityCount = 0

    for (const activity of activeActivities) {
      console.log(`📋 Processing activity: ${activity.name} (${activity.id.substring(0, 8)}...)`)
      console.log(`   Products: ${activity.products?.length || 0}, Resources: ${activity.resources?.length || 0}`)
      // Calculate estimated cost from products and resources
      const productCosts = (activity.products || []).reduce((sum, product) => {
        console.log(`     Product: ${product.productName || 'UNNAMED'} - Est: ${product.estimatedCost || 0}`)
        console.log(`     Product object:`, product)
        return sum + (product.estimatedCost || 0)
      }, 0)

      const resourceCosts = (activity.resources || []).reduce((sum, resource) => {
        console.log(`     Resource: ${resource.resourceName} - Est: ${resource.estimatedCost || 0}`)
        return sum + (resource.estimatedCost || 0)
      }, 0)

      console.log(`   Activity estimated total: ${productCosts + resourceCosts}`)
      estimatedTotalCost += productCosts + resourceCosts

      // Calculate actual cost (use actual if available, otherwise estimated)
      const actualProductCosts = (activity.products || []).reduce((sum, product) => {
        const cost = product.actualCost || product.estimatedCost || 0
        console.log(`     Product: ${product.productName || 'UNNAMED'} - Actual: ${cost}`)
        return sum + cost
      }, 0)

      const actualResourceCosts = (activity.resources || []).reduce((sum, resource) => {
        const cost = resource.actualCost || resource.estimatedCost || 0
        console.log(`     Resource: ${resource.resourceName} - Actual: ${cost}`)
        return sum + cost
      }, 0)

      console.log(`   Activity actual total: ${actualProductCosts + actualResourceCosts}`)
      actualTotalCost += actualProductCosts + actualResourceCosts
      
      // Count completed activities
      if (activity.status === 'completed') {
        completedActivityCount++
      }
    }
    
    const result = {
      estimatedTotalCost: Math.round(estimatedTotalCost * 100) / 100,
      actualTotalCost: Math.round(actualTotalCost * 100) / 100,
      activityCount: activeActivities.length,
      completedActivityCount
    }

    console.log('✅ Final activity totals:', result)
    return result
  }
  
  /**
   * Calculate observation totals for a crop cycle
   */
  static calculateObservationTotals(observations: BlocObservation[], blocArea: number = 1): ObservationTotals {
    const activeObservations = observations.filter(o => o.cropCycleId) // Only observations for this cycle
    
    let totalRevenue = 0
    let sugarcaneRevenue = 0
    let intercropRevenue = 0
    let totalYieldTons = 0
    let sugarcaneYieldSum = 0
    let intercropYieldSum = 0
    let sugarcaneObsCount = 0
    let intercropObsCount = 0
    let completedObservationCount = 0
    
    for (const observation of activeObservations) {
      // Extract revenue from observation data
      const obsData = observation.data || {}
      
      // Sugarcane revenue and yield
      if (observation.category === 'sugarcane-yield-quality') {
        const revenue = observation.sugarcaneRevenue || 0
        sugarcaneRevenue += revenue
        totalRevenue += revenue

        if (observation.yieldTonsHa) {
          sugarcaneYieldSum += observation.yieldTonsHa
          sugarcaneObsCount++
        }
      }

      // Intercrop revenue and yield
      if (observation.category === 'intercrop-yield-quality') {
        const revenue = observation.intercropRevenue || 0
        intercropRevenue += revenue
        totalRevenue += revenue
        
        if (observation.yieldTonsHa) {
          intercropYieldSum += observation.yieldTonsHa
          intercropObsCount++
        }
      }
      
      // Total yield
      if (observation.totalYieldTons) {
        totalYieldTons += observation.totalYieldTons
      }
      
      // Count completed observations
      if (observation.status === 'completed') {
        completedObservationCount++
      }
    }
    
    // Calculate average yields per hectare
    const sugarcaneYieldTonsHa = sugarcaneObsCount > 0 ? sugarcaneYieldSum / sugarcaneObsCount : 0
    const intercropYieldTonsHa = intercropObsCount > 0 ? intercropYieldSum / intercropObsCount : 0
    
    return {
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      sugarcaneRevenue: Math.round(sugarcaneRevenue * 100) / 100,
      intercropRevenue: Math.round(intercropRevenue * 100) / 100,
      totalYieldTons: Math.round(totalYieldTons * 100) / 100,
      sugarcaneYieldTonsHa: Math.round(sugarcaneYieldTonsHa * 100) / 100,
      intercropYieldTonsHa: Math.round(intercropYieldTonsHa * 100) / 100,
      observationCount: activeObservations.length,
      completedObservationCount
    }
  }
  
  /**
   * Calculate combined crop cycle totals
   */
  static calculateCropCycleTotals(
    activities: BlocActivity[],
    observations: BlocObservation[],
    blocArea: number = 1,
    cycleId: string
  ): CropCycleTotals {
    console.log('🎯 FrontendCalculationService.calculateCropCycleTotals CALLED for cycle:', cycleId)
    console.log('📊 Input data:', {
      activitiesCount: activities.length,
      observationsCount: observations.length,
      blocArea
    })

    const activityTotals = this.calculateActivityTotals(activities)
    const observationTotals = this.calculateObservationTotals(observations, blocArea)
    
    // Calculate profit metrics
    const netProfit = observationTotals.totalRevenue - activityTotals.actualTotalCost
    const profitPerHectare = blocArea > 0 ? netProfit / blocArea : 0
    const profitMarginPercent = observationTotals.totalRevenue > 0 ? 
      (netProfit / observationTotals.totalRevenue) * 100 : 0
    
    const result = {
      estimatedTotalCost: activityTotals.estimatedTotalCost,
      actualTotalCost: activityTotals.actualTotalCost,
      totalRevenue: observationTotals.totalRevenue,
      sugarcaneRevenue: observationTotals.sugarcaneRevenue,
      intercropRevenue: observationTotals.intercropRevenue,
      sugarcaneActualYieldTonsHa: observationTotals.sugarcaneYieldTonsHa,
      intercropActualYieldTonsHa: observationTotals.intercropYieldTonsHa,
      netProfit: Math.round(netProfit * 100) / 100,
      profitPerHectare: Math.round(profitPerHectare * 100) / 100,
      profitMarginPercent: Math.round(profitMarginPercent * 100) / 100,
      lastUpdated: new Date().toISOString(),
      cycleId
    }

    console.log('🎉 FrontendCalculationService final result:', result)
    return result
  }
  
  /**
   * Store cycle totals in localStorage
   */
  static storeCycleTotals(cycleId: string, totals: CropCycleTotals): void {
    try {
      const key = this.CYCLE_TOTALS_PREFIX + cycleId
      localStorage.setItem(key, JSON.stringify(totals))
      console.log('💾 Stored cycle totals in localStorage:', cycleId, totals)
    } catch (error) {
      console.error('❌ Error storing cycle totals:', error)
    }
  }
  
  /**
   * Get cycle totals from localStorage
   */
  static getCycleTotals(cycleId: string): CropCycleTotals | null {
    try {
      const key = this.CYCLE_TOTALS_PREFIX + cycleId
      const stored = localStorage.getItem(key)
      if (stored) {
        const totals = JSON.parse(stored) as CropCycleTotals
        console.log('📊 Retrieved cycle totals from localStorage:', cycleId, totals)
        return totals
      }
      return null
    } catch (error) {
      console.error('❌ Error retrieving cycle totals:', error)
      return null
    }
  }
  
  /**
   * Clear cycle totals from localStorage
   */
  static clearCycleTotals(cycleId: string): void {
    try {
      const key = this.CYCLE_TOTALS_PREFIX + cycleId
      localStorage.removeItem(key)
      console.log('🧹 Cleared cycle totals from localStorage:', cycleId)
    } catch (error) {
      console.error('❌ Error clearing cycle totals:', error)
    }
  }
  
  /**
   * Clear all cycle totals (when bloc is closed)
   */
  static clearAllCycleTotals(): void {
    try {
      const keys = Object.keys(localStorage).filter(key => 
        key.startsWith(this.CYCLE_TOTALS_PREFIX)
      )
      
      keys.forEach(key => localStorage.removeItem(key))
      console.log('🧹 Cleared all cycle totals from localStorage:', keys.length, 'items')
    } catch (error) {
      console.error('❌ Error clearing all cycle totals:', error)
    }
  }
  
  /**
   * Calculate and store totals for a crop cycle
   */
  static async calculateAndStoreTotals(
    cycleId: string,
    activities: BlocActivity[],
    observations: BlocObservation[],
    blocArea: number = 1
  ): Promise<CropCycleTotals> {
    const totals = this.calculateCropCycleTotals(activities, observations, blocArea, cycleId)
    this.storeCycleTotals(cycleId, totals)
    return totals
  }
  
  /**
   * Get totals with fallback calculation if not in localStorage
   */
  static async getTotalsWithFallback(
    cycleId: string,
    activities: BlocActivity[],
    observations: BlocObservation[],
    blocArea: number = 1
  ): Promise<CropCycleTotals> {
    // Try to get from localStorage first
    let totals = this.getCycleTotals(cycleId)
    
    if (!totals) {
      // Calculate and store if not found
      totals = await this.calculateAndStoreTotals(cycleId, activities, observations, blocArea)
    }
    
    return totals
  }
}
