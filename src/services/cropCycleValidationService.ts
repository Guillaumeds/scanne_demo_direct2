/**
 * Crop Cycle Validation Service
 * Handles validation logic for crop cycle closure and management
 */

import { 
  CropCycle, 
  CycleClosureValidation, 
  ValidationError, 
  MissingObservation, 
  MissingActivityCost,
  CycleSummary,
  MANDATORY_YIELD_OBSERVATIONS,
  CYCLE_CLOSURE_REQUIREMENTS
} from '@/types/cropCycles'
import { BlocActivity } from '@/types/activities'
import {
  BlocObservation,
  getMandatoryObservationsForCycle,
  validateObservationForCycleClosure,
  SugarcaneYieldQualityData
} from '@/types/observations'
import { BlocAttachment } from '@/types/attachments'

export class CropCycleValidationService {
  
  /**
   * Validate if a crop cycle can be closed
   */
  static async validateCycleForClosure(
    cycle: CropCycle,
    activities: BlocActivity[],
    observations: BlocObservation[],
    blocArea: number
  ): Promise<CycleClosureValidation> {
    const validationErrors: ValidationError[] = []
    const missingObservations: MissingObservation[] = []
    const missingActivityCosts: MissingActivityCost[] = []
    
    // 1. Validate mandatory cycle fields
    this.validateMandatoryFields(cycle, validationErrors)
    
    // 2. Validate activities have actual costs
    this.validateActivityCosts(activities, missingActivityCosts)
    
    // 3. Validate mandatory observations exist and are complete
    await this.validateMandatoryObservations(
      cycle, 
      observations, 
      missingObservations, 
      validationErrors
    )
    
    // 4. Generate cycle summary if validation passes
    let summary: CycleSummary | undefined
    if (validationErrors.length === 0 && missingActivityCosts.length === 0 && missingObservations.length === 0) {
      summary = await this.generateCycleSummary(cycle, activities, observations, blocArea)
    }
    
    return {
      cycleId: cycle.id,
      canClose: validationErrors.length === 0 && missingActivityCosts.length === 0 && missingObservations.length === 0,
      validationErrors,
      missingObservations,
      missingActivityCosts,
      summary
    }
  }
  
  /**
   * Validate mandatory cycle fields
   */
  private static validateMandatoryFields(cycle: CropCycle, errors: ValidationError[]) {
    if (!cycle.sugarcaneVarietyId) {
      errors.push({
        type: 'missing_variety',
        message: 'Sugarcane variety must be selected',
        field: 'sugarcaneVarietyId',
        severity: 'error'
      })
    }
    
    if (!cycle.plannedHarvestDate) {
      errors.push({
        type: 'missing_harvest_date',
        message: 'Planned harvest date is required',
        field: 'plannedHarvestDate',
        severity: 'error'
      })
    }
    
    // For ratoon cycles, validate parent cycle exists
    if (cycle.type === 'ratoon' && !cycle.parentCycleId) {
      errors.push({
        type: 'invalid_data',
        message: 'Ratoon cycle must have a parent cycle',
        field: 'parentCycleId',
        severity: 'error'
      })
    }
  }
  
  /**
   * Validate all activities have actual costs entered
   */
  private static validateActivityCosts(activities: BlocActivity[], missingCosts: MissingActivityCost[]) {
    activities.forEach(activity => {
      const missingItems: MissingActivityCost['missingItems'] = []
      
      // Check products have actual costs
      activity.products?.forEach(product => {
        if (!product.actualCost && !product.estimatedCost) {
          missingItems.push({
            type: 'product',
            name: product.productName,
            hasEstimatedCost: false, // Would need to check against product defaults
            hasActualCost: false
          })
        }
      })
      
      // Check resources have actual costs
      activity.resources?.forEach(resource => {
        if (!resource.actualCost && !resource.estimatedCost) {
          missingItems.push({
            type: 'resource',
            name: resource.resourceName,
            hasEstimatedCost: false, // Would need to check against resource defaults
            hasActualCost: false
          })
        }
      })
      
      if (missingItems.length > 0) {
        missingCosts.push({
          activityId: activity.id,
          activityName: activity.name,
          phase: activity.phase,
          missingItems
        })
      }
    })
  }
  
  /**
   * Validate mandatory observations exist and are complete
   */
  private static async validateMandatoryObservations(
    cycle: CropCycle,
    observations: BlocObservation[],
    missingObservations: MissingObservation[],
    validationErrors: ValidationError[]
  ) {
    const hasIntercrop = !!cycle.intercropVarietyId
    const hasElectricityYield = false // observations.some(obs => obs.category === 'electricity-yield')
    
    const mandatoryCategories = getMandatoryObservationsForCycle(
      cycle.type,
      hasIntercrop,

    )
    
    // Check each mandatory category exists
    mandatoryCategories.forEach(category => {
      const categoryObservations = observations.filter(obs => obs.category === category)
      
      if (categoryObservations.length === 0) {
        missingObservations.push({
          type: category as any,
          name: this.getObservationDisplayName(category),
          description: this.getObservationDescription(category),
          mandatory: true
        })
      } else {
        // Validate observation data completeness
        categoryObservations.forEach(observation => {
          const validation = validateObservationForCycleClosure(
            observation,
            hasIntercrop,

          )
          
          if (!validation.valid) {
            validation.errors.forEach(error => {
              validationErrors.push({
                type: 'invalid_data',
                message: `${observation.name}: ${error}`,
                field: `observation_${observation.id}`,
                severity: 'error'
              })
            })
          }
        })
      }
    })
    
    // Special validation for intercrop
    if (hasIntercrop) {
      const intercropObservations = observations.filter(obs => obs.category === 'intercrop-yield-quality')
      if (intercropObservations.length === 0) {
        missingObservations.push({
          type: 'intercrop_yield',
          name: 'Intercrop Yield',
          description: 'Yield and quality data for intercrop harvest',
          mandatory: true
        })
      }
    }
  }
  
  /**
   * Generate comprehensive cycle summary
   */
  private static async generateCycleSummary(
    cycle: CropCycle,
    activities: BlocActivity[],
    observations: BlocObservation[],
    blocArea: number
  ): Promise<CycleSummary> {
    // Calculate costs by phase
    const costs = this.calculateCostsByPhase(activities, blocArea)
    
    // Extract yield data from observations
    const yields = this.extractYieldData(observations, blocArea)
    
    // Extract revenue data from observations
    const revenue = this.extractRevenueData(observations, blocArea)
    
    // Calculate profitability
    const profitability = this.calculateProfitability(costs, revenue)
    
    // Extract quality metrics
    const quality = this.extractQualityMetrics(observations)
    
    // Calculate activity and observation completion rates
    const activitySummary = this.calculateActivitySummary(activities)
    const observationSummary = this.calculateObservationSummary(observations)
    
    // Calculate cycle duration
    const plantingDate = cycle.type === 'plantation' ? cycle.plantingDate : cycle.ratoonPlantingDate
    const harvestDate = cycle.actualHarvestDate || cycle.plannedHarvestDate
    const duration = plantingDate && harvestDate ? 
      Math.ceil((new Date(harvestDate).getTime() - new Date(plantingDate).getTime()) / (1000 * 60 * 60 * 24)) : 0
    
    return {
      cycleId: cycle.id,
      cycleType: cycle.type,
      cycleNumber: cycle.cycleNumber,
      duration,
      blocArea,
      sugarcaneVariety: cycle.sugarcaneVarietyName,
      intercropVariety: cycle.intercropVarietyName,
      costs,
      revenue,
      yields,
      profitability,
      quality,
      activities: activitySummary,
      observations: observationSummary
    }
  }
  
  /**
   * Calculate costs by activity phase
   */
  private static calculateCostsByPhase(activities: BlocActivity[], blocArea: number) {
    const costsByPhase = {
      landPreparation: 0,
      planting: 0,
      establishment: 0,
      growth: 0,
      maintenance: 0,
      preHarvest: 0,
      harvest: 0,
      postHarvest: 0,
      total: 0,
      perHectare: 0
    }
    
    activities.forEach(activity => {
      const activityCost = this.calculateActivityTotalCost(activity)
      
      switch (activity.phase) {
        case 'land-preparation':
          costsByPhase.landPreparation += activityCost
          break
        case 'planting':
          costsByPhase.planting += activityCost
          break
        case 'establishment':
          costsByPhase.establishment += activityCost
          break
        case 'growth':
          costsByPhase.growth += activityCost
          break
        case 'maintenance':
          costsByPhase.maintenance += activityCost
          break
        case 'pre-harvest':
          costsByPhase.preHarvest += activityCost
          break
        case 'harvest':
          costsByPhase.harvest += activityCost
          break
        case 'post-harvest':
          costsByPhase.postHarvest += activityCost
          break
      }
      
      costsByPhase.total += activityCost
    })
    
    costsByPhase.perHectare = costsByPhase.total / blocArea
    
    return costsByPhase
  }
  
  /**
   * Calculate total cost for a single activity
   */
  private static calculateActivityTotalCost(activity: BlocActivity): number {
    const productCosts = activity.products?.reduce((sum, product) => sum + (product.actualCost || product.estimatedCost || 0), 0) || 0
    const resourceCosts = activity.resources?.reduce((sum, resource) => sum + (resource.actualCost || resource.estimatedCost || 0), 0) || 0
    return productCosts + resourceCosts
  }
  
  /**
   * Extract yield data from observations
   */
  private static extractYieldData(observations: BlocObservation[], blocArea: number) {
    const sugarcaneObs = observations.find(obs => obs.category === 'sugarcane-yield-quality')
    const intercropObs = observations.find(obs => obs.category === 'intercrop-yield-quality')
    
    const sugarcaneData = sugarcaneObs?.data as SugarcaneYieldQualityData
    // const sugarData = sugarObs?.data as SugarYieldData
    // const electricityData = electricityObs?.data as ElectricityYieldData
    
    return {
      sugarcane: {
        total: sugarcaneData?.totalYieldTons || 0,
        perHectare: sugarcaneData?.yieldPerHectare || 0
      },
      sugar: {
        total: 0, // sugarData?.totalSugarTons || 0,
        perHectare: 0, // sugarData?.sugarPerHectare || 0,
        percentage: 0 // sugarData?.sugarPercentage || 0
      },
      electricity: {
        total: 0, // electricityData?.totalBiomassYieldTons || 0,
        perHectare: 0, // electricityData?.biomassPerHectare || 0,
        percentage: 0 // sugarcaneData?.totalYieldTons ? ((electricityData?.totalBiomassYieldTons || 0) / sugarcaneData.totalYieldTons) * 100 : 0
      },
      intercrop: intercropObs ? {
        total: (intercropObs.data as any).intercropYield * blocArea || 0,
        perHectare: (intercropObs.data as any).intercropYield || 0
      } : undefined
    }
  }
  
  /**
   * Extract revenue data from observations
   */
  private static extractRevenueData(observations: BlocObservation[], blocArea: number) {
    // const revenueObs = observations.find(obs => obs.category === 'revenue-tracking')
    // const revenueData = revenueObs?.data as RevenueTrackingData
    
    // Revenue data not available yet
    return {
      sugarcane: 0,
      sugar: 0,
      electricity: 0,
      intercrop: 0,
      total: 0,
      perHectare: 0
    }
  }
  
  /**
   * Calculate profitability metrics
   */
  private static calculateProfitability(costs: any, revenue: any) {
    const grossProfit = revenue.total - costs.total
    const profitMargin = revenue.total > 0 ? (grossProfit / revenue.total) * 100 : 0
    const roi = costs.total > 0 ? (grossProfit / costs.total) * 100 : 0
    
    return {
      grossProfit,
      netProfit: grossProfit, // Same as gross for now, could subtract taxes/fees
      profitMargin,
      profitPerHectare: revenue.perHectare - costs.perHectare,
      roi
    }
  }
  
  /**
   * Extract quality metrics from observations
   */
  private static extractQualityMetrics(observations: BlocObservation[]) {
    // const sugarObs = observations.find(obs => obs.category === 'sugar-yield')
    // const sugarData = sugarObs?.data as SugarYieldData
    
    return {
      sugarContent: 0, // sugarData?.sugarPercentage || 0,
      purity: 0, // sugarData?.purity || 0,
      brix: 0 // sugarData?.brix || 0
    }
  }
  
  /**
   * Calculate activity completion summary
   */
  private static calculateActivitySummary(activities: BlocActivity[]) {
    const total = activities.length
    const completed = activities.filter(act => act.status === 'completed').length
    
    return {
      total,
      completed,
      completionRate: total > 0 ? (completed / total) * 100 : 0
    }
  }
  
  /**
   * Calculate observation completion summary
   */
  private static calculateObservationSummary(observations: BlocObservation[]) {
    const total = observations.length
    const completed = observations.filter(obs => obs.status === 'completed').length
    
    return {
      total,
      completed,
      completionRate: total > 0 ? (completed / total) * 100 : 0
    }
  }
  
  /**
   * Helper methods for observation display names and descriptions
   */
  private static getObservationDisplayName(category: string): string {
    const names: Record<string, string> = {
      'sugarcane-yield': 'Sugarcane Yield',
      'sugar-yield': 'Sugar Yield',
      'electricity-yield': 'Electricity Yield',
      'intercrop-yield': 'Intercrop Yield',
      'revenue-tracking': 'Revenue Tracking'
    }
    return names[category] || category
  }
  
  private static getObservationDescription(category: string): string {
    const descriptions: Record<string, string> = {
      'sugarcane-yield': 'Total sugarcane harvest yield and quality metrics',
      'sugar-yield': 'Sugar extraction yield and quality data',
      'electricity-yield': 'Bagasse and biomass yield for power generation',
      'intercrop-yield': 'Intercrop harvest yield and quality',
      'revenue-tracking': 'Revenue from all crop cycle products'
    }
    return descriptions[category] || 'Observation data'
  }
}
