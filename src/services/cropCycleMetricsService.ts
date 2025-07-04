import { CropCycle } from '../types/cropCycles'
import { BlocActivity } from '../types/activities'
import { BlocObservation } from '../types/observations'
import { CropCycleService } from './cropCycleService'
import { ActivityService } from './activityService'
import { ObservationService } from './observationService'
import { BlocService } from './blocService'

export interface CropCycleMetrics {
  // Cost metrics
  totalEstimatedCosts: number
  totalActualCosts: number
  
  // Yield metrics (from observations)
  totalSugarcaneYield: number // tons
  totalSugarcaneYieldPerHa: number // tons/ha
  totalIntercropYield: number // tons
  totalIntercropYieldPerHa: number // tons/ha
  
  // Revenue metrics (from observations)
  totalSugarcaneRevenue: number
  totalIntercropRevenue: number
  totalRevenue: number
  
  // Profit metrics
  netProfit: number
  profitPerHa: number
  profitMargin: number // percentage
}

export class CropCycleMetricsService {
  
  /**
   * Calculate all metrics for a crop cycle
   */
  static async calculateCycleMetrics(cycleId: string): Promise<CropCycleMetrics> {
    const cycle = await CropCycleService.getCropCycleById(cycleId)
    if (!cycle) {
      throw new Error('Crop cycle not found')
    }

    // Get bloc area for per-hectare calculations
    const bloc = await BlocService.getBlocById(cycle.blocId)
    const blocArea = bloc?.area || 1 // Default to 1 ha if area not found

    // Get all activities for this cycle
    const activities = await ActivityService.getActivitiesForCycle(cycleId)

    // Get all observations for this cycle
    const observations = await ObservationService.getObservationsForCycle(cycleId)

    // Calculate cost metrics
    const costMetrics = this.calculateCostMetrics(activities)

    // Calculate yield metrics
    const yieldMetrics = this.extractYieldMetrics(observations)
    
    // Calculate revenue metrics
    const revenueMetrics = this.calculateRevenueMetrics(observations)
    
    // Calculate profit metrics
    const profitMetrics = this.calculateProfitMetrics(
      costMetrics.totalActualCosts,
      revenueMetrics.totalRevenue,
      blocArea
    )

    return {
      ...costMetrics,
      ...yieldMetrics,
      ...revenueMetrics,
      ...profitMetrics
    }
  }

  /**
   * Calculate cost metrics from activities
   */
  private static calculateCostMetrics(activities: BlocActivity[]) {
    let totalEstimatedCosts = 0
    let totalActualCosts = 0

    activities.forEach(activity => {
      // Add activity estimated costs
      if (activity.estimatedCost) {
        totalEstimatedCosts += activity.estimatedCost
      }
      
      // Add activity actual costs
      if (activity.actualCost) {
        totalActualCosts += activity.actualCost
      }

      // Add resource costs
      if (activity.resources) {
        activity.resources.forEach(resource => {
          if (resource.estimatedCost) {
            totalEstimatedCosts += resource.estimatedCost
          }
          if (resource.actualCost) {
            totalActualCosts += resource.actualCost
          }
        })
      }

      // Add product costs
      if (activity.products) {
        activity.products.forEach(product => {
          if (product.estimatedCost) {
            totalEstimatedCosts += product.estimatedCost
          }
          if (product.actualCost) {
            totalActualCosts += product.actualCost
          }
        })
      }
    })

    return {
      totalEstimatedCosts,
      totalActualCosts
    }
  }

  /**
   * Calculate yield metrics from observations
   */
  private static calculateYieldMetrics(observations: BlocObservation[], blocArea: number) {
    let totalSugarcaneYield = 0
    let totalIntercropYield = 0

    observations.forEach(observation => {
      if (observation.category === 'sugarcane-yield-quality' && observation.data) {
        const data = observation.data as any
        if (data.totalYieldTons) {
          totalSugarcaneYield += data.totalYieldTons
        }
      }
      
      if (observation.category === 'intercrop-yield-quality' && observation.data) {
        const data = observation.data as any
        if (data.totalYieldTons) {
          totalIntercropYield += data.totalYieldTons
        }
      }
    })

    return {
      totalSugarcaneYield,
      totalSugarcaneYieldPerHa: blocArea > 0 ? totalSugarcaneYield / blocArea : 0,
      totalIntercropYield,
      totalIntercropYieldPerHa: blocArea > 0 ? totalIntercropYield / blocArea : 0
    }
  }

  /**
   * Calculate revenue metrics from observations
   */
  private static calculateRevenueMetrics(observations: BlocObservation[]) {
    let totalSugarcaneRevenue = 0
    let totalIntercropRevenue = 0

    observations.forEach(observation => {
      if (observation.category === 'sugarcane-yield-quality' && observation.data) {
        const data = observation.data as any
        if (data.sugarcaneRevenue) {
          totalSugarcaneRevenue += data.sugarcaneRevenue
        }
      }
      
      if (observation.category === 'intercrop-yield-quality' && observation.data) {
        const data = observation.data as any
        if (data.intercropRevenue) {
          totalIntercropRevenue += data.intercropRevenue
        }
      }
    })

    return {
      totalSugarcaneRevenue,
      totalIntercropRevenue,
      totalRevenue: totalSugarcaneRevenue + totalIntercropRevenue
    }
  }

  /**
   * Calculate profit metrics
   */
  private static calculateProfitMetrics(totalCosts: number, totalRevenue: number, blocArea: number) {
    const netProfit = totalRevenue - totalCosts
    const profitPerHa = blocArea > 0 ? netProfit / blocArea : 0
    const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0

    return {
      netProfit,
      profitPerHa,
      profitMargin
    }
  }

  /**
   * Update crop cycle with calculated metrics and save to database
   */
  static async updateCycleMetrics(cycleId: string): Promise<void> {
    try {
      const metrics = await this.calculateCycleMetrics(cycleId)
      
      // Update the crop cycle with calculated metrics
      await CropCycleService.updateCropCycle(cycleId, {
        // Financial metrics
        totalCosts: metrics.totalActualCosts,
        totalRevenue: metrics.totalRevenue,
        netProfit: metrics.netProfit,
        profitPerHectare: metrics.profitPerHa,
        
        // Yield metrics
        sugarcaneYieldTons: metrics.totalSugarcaneYield,
        sugarcaneYieldTonsPerHa: metrics.totalSugarcaneYieldPerHa,
        intercropYieldTons: metrics.totalIntercropYield,
        intercropYieldTonsPerHa: metrics.totalIntercropYieldPerHa,
        
        // Revenue breakdown
        sugarcaneRevenue: metrics.totalSugarcaneRevenue,
        intercropRevenue: metrics.totalIntercropRevenue,
        
        updatedAt: new Date().toISOString()
      })
      
      console.log(`Updated metrics for crop cycle ${cycleId}:`, metrics)
    } catch (error) {
      console.error(`Failed to update metrics for crop cycle ${cycleId}:`, error)
      throw error
    }
  }

  /**
   * Trigger metrics update when an activity is created/updated
   */
  static async onActivityChange(activity: BlocActivity): Promise<void> {
    if (activity.cropCycleId) {
      await this.updateCycleMetrics(activity.cropCycleId)
    }
  }

  /**
   * Trigger metrics update when an observation is created/updated
   */
  static async onObservationChange(observation: BlocObservation): Promise<void> {
    if (observation.cropCycleId) {
      await this.updateCycleMetrics(observation.cropCycleId)
    }
  }

  /**
   * Extract yield metrics from observations
   */
  private static extractYieldMetrics(observations: BlocObservation[]): {
    sugarcaneYieldTonsHa: number
    intercropYieldTonsHa: number
    totalSugarcaneYield: number
    totalIntercropYield: number
  } {
    let sugarcaneYieldTonsHa = 0
    let intercropYieldTonsHa = 0
    let totalSugarcaneYield = 0
    let totalIntercropYield = 0

    observations.forEach(observation => {
      const data = observation.observationData as any
      if (data) {
        // Sugarcane yield (rounded to whole number as specified)
        if (data.sugarcaneYieldTons) {
          totalSugarcaneYield += Math.round(data.sugarcaneYieldTons)
        }
        if (data.sugarcaneYieldTonsPerHa) {
          sugarcaneYieldTonsHa += Math.round(data.sugarcaneYieldTonsPerHa)
        }

        // Intercrop yield (rounded to whole number as specified)
        if (data.intercropYieldTons) {
          totalIntercropYield += Math.round(data.intercropYieldTons)
        }
        if (data.intercropYieldTonsPerHa) {
          intercropYieldTonsHa += Math.round(data.intercropYieldTonsPerHa)
        }
      }
    })

    return {
      sugarcaneYieldTonsHa,
      intercropYieldTonsHa,
      totalSugarcaneYield,
      totalIntercropYield
    }
  }

  /**
   * Get formatted metrics for display
   */
  static async getFormattedMetrics(cycleId: string): Promise<{
    costs: { estimated: string, actual: string }
    yield: { sugarcane: string, intercrop: string }
    revenue: { total: string, sugarcane: string, intercrop: string }
    profit: { total: string, perHa: string, margin: string }
  }> {
    const metrics = await this.calculateCycleMetrics(cycleId)

    return {
      costs: {
        estimated: `MUR ${metrics.totalEstimatedCosts.toLocaleString()}`,
        actual: `MUR ${metrics.totalActualCosts.toLocaleString()}`
      },
      yield: {
        sugarcane: `${metrics.totalSugarcaneYieldPerHa.toFixed(1)} t/ha`,
        intercrop: metrics.totalIntercropYieldPerHa > 0 ? `${metrics.totalIntercropYieldPerHa.toFixed(1)} t/ha` : 'N/A'
      },
      revenue: {
        total: `MUR ${metrics.totalRevenue.toLocaleString()}`,
        sugarcane: `MUR ${metrics.totalSugarcaneRevenue.toLocaleString()}`,
        intercrop: `MUR ${metrics.totalIntercropRevenue.toLocaleString()}`
      },
      profit: {
        total: `MUR ${metrics.netProfit.toLocaleString()}`,
        perHa: `MUR ${metrics.profitPerHa.toLocaleString()}/ha`,
        margin: `${metrics.profitMargin.toFixed(1)}%`
      }
    }
  }
}
