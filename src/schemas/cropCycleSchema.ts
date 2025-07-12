import { z } from 'zod'

// Crop cycle schema for farm management
export const cropCycleSchema = z.object({
  // Basic information
  id: z.string().optional(),
  blocId: z.string().min(1, "Bloc ID is required"),
  cropType: z.string().min(1, "Crop type is required"),
  variety: z.string().min(1, "Variety is required"),
  
  // Cycle information
  cycleNumber: z.number().min(1, "Cycle number must be at least 1"),
  cycleType: z.enum(['plantation', 'ratoon']),
  
  // Dates
  plantingDate: z.string().min(1, "Planting date is required"),
  expectedHarvestDate: z.string().min(1, "Expected harvest date is required"),
  actualHarvestDate: z.string().optional(),
  
  // Status
  status: z.enum(['active', 'completed', 'cancelled']).default('active'),
  
  // Area and planning
  plannedArea: z.number().min(0, "Planned area must be positive"),
  actualArea: z.number().min(0, "Actual area must be positive").optional(),
  
  // Yield expectations and actuals
  expectedYield: z.number().min(0, "Expected yield must be positive").optional(),
  actualYield: z.number().min(0, "Actual yield must be positive").optional(),
  yieldUnit: z.string().default('tons'),
  
  // Financial planning
  estimatedCosts: z.object({
    seedCosts: z.number().min(0).optional(),
    fertiliserCosts: z.number().min(0).optional(),
    pesticideCosts: z.number().min(0).optional(),
    laborCosts: z.number().min(0).optional(),
    equipmentCosts: z.number().min(0).optional(),
    irrigationCosts: z.number().min(0).optional(),
    otherCosts: z.number().min(0).optional(),
    totalEstimatedCosts: z.number().min(0).optional(),
  }).optional(),
  
  actualCosts: z.object({
    seedCosts: z.number().min(0).optional(),
    fertiliserCosts: z.number().min(0).optional(),
    pesticideCosts: z.number().min(0).optional(),
    laborCosts: z.number().min(0).optional(),
    equipmentCosts: z.number().min(0).optional(),
    irrigationCosts: z.number().min(0).optional(),
    otherCosts: z.number().min(0).optional(),
    totalActualCosts: z.number().min(0).optional(),
  }).optional(),
  
  // Revenue
  estimatedRevenue: z.number().min(0, "Estimated revenue must be positive").optional(),
  actualRevenue: z.number().min(0, "Actual revenue must be positive").optional(),
  
  // Profitability
  estimatedProfit: z.number().optional(),
  actualProfit: z.number().optional(),
  profitMargin: z.number().optional(),
  
  // Environmental conditions
  soilPreparation: z.object({
    method: z.string().optional(),
    date: z.string().optional(),
    conditions: z.string().optional(),
    notes: z.string().optional(),
  }).optional(),
  
  // Irrigation planning
  irrigationPlan: z.object({
    method: z.enum(['drip', 'sprinkler', 'flood', 'manual']).optional(),
    frequency: z.string().optional(),
    waterSource: z.string().optional(),
    estimatedWaterUsage: z.number().min(0).optional(),
    actualWaterUsage: z.number().min(0).optional(),
  }).optional(),
  
  // Pest and disease management
  pestManagement: z.object({
    commonPests: z.array(z.string()).optional().default([]),
    preventiveMeasures: z.array(z.string()).optional().default([]),
    treatmentHistory: z.array(z.object({
      date: z.string(),
      pest: z.string(),
      treatment: z.string(),
      effectiveness: z.enum(['excellent', 'good', 'fair', 'poor']).optional(),
    })).optional().default([]),
  }).optional(),
  
  // Quality metrics
  qualityMetrics: z.object({
    sugarContent: z.number().min(0).optional(),
    moisture: z.number().min(0).max(100).optional(),
    purity: z.number().min(0).max(100).optional(),
    grade: z.string().optional(),
    qualityScore: z.number().min(0).max(10).optional(),
  }).optional(),
  
  // Weather impact
  weatherImpact: z.object({
    droughtDays: z.number().min(0).optional(),
    floodDays: z.number().min(0).optional(),
    stormDamage: z.boolean().optional().default(false),
    temperatureStress: z.boolean().optional().default(false),
    overallImpact: z.enum(['minimal', 'moderate', 'significant', 'severe']).optional(),
    notes: z.string().optional(),
  }).optional(),
  
  // Sustainability metrics
  sustainability: z.object({
    organicCertified: z.boolean().optional().default(false),
    chemicalUsage: z.number().min(0).optional(),
    waterEfficiency: z.number().min(0).optional(),
    soilHealthScore: z.number().min(0).max(10).optional(),
    carbonFootprint: z.number().min(0).optional(),
  }).optional(),
  
  // Notes and observations
  notes: z.string().optional(),
  lessonsLearned: z.string().optional(),
  recommendationsForNext: z.string().optional(),
  
  // Timestamps
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  createdBy: z.string().optional(),
  updatedBy: z.string().optional(),
})

// Simplified schemas for different form sections
export const basicCropCycleSchema = cropCycleSchema.pick({
  cropType: true,
  variety: true,
  cycleNumber: true,
  cycleType: true,
  plantingDate: true,
  expectedHarvestDate: true,
  plannedArea: true,
  status: true,
})

export const cropCycleFinancialsSchema = cropCycleSchema.pick({
  estimatedCosts: true,
  actualCosts: true,
  estimatedRevenue: true,
  actualRevenue: true,
  estimatedProfit: true,
  actualProfit: true,
})

export const cropCycleYieldSchema = cropCycleSchema.pick({
  expectedYield: true,
  actualYield: true,
  yieldUnit: true,
  qualityMetrics: true,
})

// Type inference
export type CropCycleData = z.infer<typeof cropCycleSchema>
export type BasicCropCycleData = z.infer<typeof basicCropCycleSchema>
export type CropCycleFinancialsData = z.infer<typeof cropCycleFinancialsSchema>
export type CropCycleYieldData = z.infer<typeof cropCycleYieldSchema>

// Validation helpers
export const validateCropCycle = (data: unknown) => {
  return cropCycleSchema.safeParse(data)
}

export const validateBasicCropCycle = (data: unknown) => {
  return basicCropCycleSchema.safeParse(data)
}

// Business logic validation
export const validateCropCycleDates = (plantingDate: string, expectedHarvestDate: string, actualHarvestDate?: string) => {
  const planting = new Date(plantingDate)
  const expectedHarvest = new Date(expectedHarvestDate)
  
  if (expectedHarvest <= planting) {
    return { valid: false, error: "Expected harvest date must be after planting date" }
  }
  
  if (actualHarvestDate) {
    const actualHarvest = new Date(actualHarvestDate)
    if (actualHarvest < planting) {
      return { valid: false, error: "Actual harvest date cannot be before planting date" }
    }
  }
  
  return { valid: true }
}

export const validateCycleNumber = (cycleNumber: number, cycleType: 'plantation' | 'ratoon') => {
  if (cycleType === 'plantation' && cycleNumber !== 1) {
    return { valid: false, error: "Plantation cycle must be cycle number 1" }
  }
  
  if (cycleType === 'ratoon' && cycleNumber <= 1) {
    return { valid: false, error: "Ratoon cycle must be cycle number 2 or higher" }
  }
  
  return { valid: true }
}
