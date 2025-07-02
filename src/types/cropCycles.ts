/**
 * Types for comprehensive crop cycle management
 */

export type CropCycleType = 'plantation' | 'ratoon'
export type CropCycleStatus = 'active' | 'closed' | 'archived'

// Core crop cycle interface
export interface CropCycle {
  id: string
  blocId: string
  type: CropCycleType
  status: CropCycleStatus
  cycleNumber: number // 1 for plantation, 2+ for ratoons
  
  // Mandatory fields for plantation cycles
  sugarcaneVarietyId: string
  sugarcaneVarietyName: string
  plantingDate?: string // Optional for ratoon cycles
  plannedHarvestDate: string
  expectedYield: number // tons/ha - mandatory field

  // Optional intercrop (for both plantation and ratoon)
  intercropVarietyId?: string
  intercropVarietyName?: string
  
  // Ratoon-specific fields
  parentCycleId?: string // Links to previous cycle
  ratoonPlantingDate?: string // For ratoon cycles
  
  // Cycle closure data
  actualHarvestDate?: string
  closureDate?: string
  closedBy?: string
  closureValidated: boolean
  
  // Financial summary (calculated on closure)
  totalCosts?: number
  totalRevenue?: number
  netProfit?: number
  profitPerHectare?: number
  
  // Yield summary (calculated on closure)
  sugarcaneYieldTons?: number
  sugarcaneYieldTonsPerHa?: number
  sugarYieldTons?: number
  sugarYieldTonsPerHa?: number
  electricityYieldTons?: number // Bagasse/trash for electricity
  electricityYieldTonsPerHa?: number
  intercropYieldTons?: number
  intercropYieldTonsPerHa?: number
  
  // Revenue breakdown
  sugarcaneRevenue?: number
  sugarRevenue?: number
  electricityRevenue?: number
  intercropRevenue?: number
  
  // Metadata
  createdAt: string
  updatedAt: string
  createdBy: string
}

// Validation requirements for cycle closure
export interface CycleClosureValidation {
  cycleId: string
  canClose: boolean
  validationErrors: ValidationError[]
  missingObservations: MissingObservation[]
  missingActivityCosts: MissingActivityCost[]
  summary?: CycleSummary
}

export interface ValidationError {
  type: 'missing_variety' | 'missing_harvest_date' | 'missing_observations' | 'missing_costs' | 'invalid_data'
  message: string
  field?: string
  severity: 'error' | 'warning'
}

export interface MissingObservation {
  type: 'sugarcane_yield' | 'sugar_yield' | 'electricity_yield' | 'intercrop_yield'
  name: string
  description: string
  mandatory: boolean
}

export interface MissingActivityCost {
  activityId: string
  activityName: string
  phase: string
  missingItems: {
    type: 'product' | 'resource'
    name: string
    hasEstimatedCost: boolean
    hasActualCost: boolean
  }[]
}

// Comprehensive cycle summary for user review
export interface CycleSummary {
  cycleId: string
  cycleType: CropCycleType
  cycleNumber: number
  duration: number // days
  
  // Area information
  blocArea: number // hectares
  
  // Variety information
  sugarcaneVariety: string
  intercropVariety?: string
  
  // Cost breakdown
  costs: {
    landPreparation: number
    planting: number
    establishment: number
    growth: number
    maintenance: number
    preHarvest: number
    harvest: number
    postHarvest: number
    total: number
    perHectare: number
  }
  
  // Revenue breakdown
  revenue: {
    sugarcane: number
    sugar: number
    electricity: number
    intercrop: number
    total: number
    perHectare: number
  }
  
  // Yield data
  yields: {
    sugarcane: {
      total: number // tons
      perHectare: number // tons/ha
    }
    sugar: {
      total: number // tons
      perHectare: number // tons/ha
      percentage: number // % of sugarcane
    }
    electricity: {
      total: number // tons of bagasse/trash
      perHectare: number // tons/ha
      percentage: number // % of sugarcane
    }
    intercrop?: {
      total: number // tons
      perHectare: number // tons/ha
    }
  }
  
  // Profitability
  profitability: {
    grossProfit: number
    netProfit: number
    profitMargin: number // %
    profitPerHectare: number
    roi: number // Return on Investment %
  }
  
  // Quality metrics
  quality: {
    sugarContent: number // %
    purity: number // %
    brix: number // %
  }
  
  // Activity summary
  activities: {
    total: number
    completed: number
    completionRate: number // %
  }
  
  // Observation summary
  observations: {
    total: number
    completed: number
    completionRate: number // %
  }
}

// Interface for cycle creation
export interface CreateCycleRequest {
  blocId: string
  type: CropCycleType
  sugarcaneVarietyId: string
  plannedHarvestDate: string
  expectedYield: number // tons/ha - mandatory
  intercropVarietyId?: string
  plantingDate?: string // Optional for ratoons
  parentCycleId?: string // Required for ratoons
}

// Interface for cycle closure request
export interface CloseCycleRequest {
  cycleId: string
  actualHarvestDate: string
  userConfirmation: boolean
  notes?: string
}

// Cycle permissions based on status
export interface CyclePermissions {
  canEdit: boolean
  canAddActivities: boolean
  canAddObservations: boolean
  canAddAttachments: boolean
  canClose: boolean
  canReopen: boolean // Super user only
  editableFields: string[]
}

// Helper functions for cycle management
export const getCyclePermissions = (cycle: CropCycle, userRole: 'user' | 'admin' | 'super'): CyclePermissions => {
  const isActive = cycle.status === 'active'
  const isSuperUser = userRole === 'super'
  
  return {
    canEdit: isActive || isSuperUser,
    canAddActivities: isActive,
    canAddObservations: isActive,
    canAddAttachments: isActive || isSuperUser, // Super users can add attachments to closed cycles
    canClose: isActive && cycle.closureValidated,
    canReopen: !isActive && isSuperUser,
    editableFields: isActive ? ['all'] : isSuperUser ? ['notes', 'attachments'] : []
  }
}

export const calculateCycleDuration = (plantingDate: string, harvestDate: string): number => {
  const start = new Date(plantingDate)
  const end = new Date(harvestDate)
  return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
}

export const formatCycleDisplayName = (cycle: CropCycle): string => {
  if (cycle.type === 'plantation') {
    return `Plantation Cycle (${cycle.sugarcaneVarietyName})`
  } else {
    return `Ratoon ${cycle.cycleNumber - 1} (${cycle.sugarcaneVarietyName})`
  }
}

// Constants for validation
export const MANDATORY_YIELD_OBSERVATIONS = [
  'sugarcane_yield',
  'sugar_yield'
] as const

export const OPTIONAL_YIELD_OBSERVATIONS = [
  'electricity_yield',
  'intercrop_yield'
] as const

export const CYCLE_CLOSURE_REQUIREMENTS = {
  mandatoryFields: ['sugarcaneVarietyId', 'plannedHarvestDate'],
  mandatoryObservations: MANDATORY_YIELD_OBSERVATIONS,
  requireActualCosts: true,
  requireYieldData: true,
  requireRevenueData: true
} as const
