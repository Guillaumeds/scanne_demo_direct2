// Updated types for Crop Cycle Management with new validation rules

export interface CropCycleValidation {
  canClose: boolean
  operationsCompleted: boolean
  costsEntered: boolean
  harvestCompleted: boolean
  validationErrors: string[]
}

export interface CropCycleFormData {
  sugarcaneVarietyId: string
  sugarcaneVarietyName: string
  plantingDate: string
  expectedHarvestDate: string
  expectedYield: number
}

export interface CropCycle {
  id: string
  blocId: string
  type: 'plantation' | 'ratoon'
  cycleNumber: number
  status: 'active' | 'closed'
  
  // Variety information
  sugarcaneVarietyId: string
  sugarcaneVarietyName: string
  
  // Dates
  sugarcaneePlantingDate?: string
  sugarcaneePlannedHarvestDate: string
  sugarcaneActualHarvestDate?: string
  
  // Yield data
  sugarcaneExpectedYieldTonsHa: number
  sugarcaneActualYieldTonsHa?: number
  
  // Financial data
  estimatedTotalCost: number
  actualTotalCost: number
  sugarcaneeRevenue: number
  totalRevenue: number
  netProfit: number
  profitPerHectare: number
  profitMarginPercent: number
  
  // Growth tracking
  growthStage?: string
  growthStageUpdatedAt?: string
  daysSincePlanting: number
  
  // Closure validation
  closureValidated: boolean
  
  // Parent relationship (for ratoon cycles)
  parentCycleId?: string
  
  // Metadata
  createdAt: string
  updatedAt: string
}

export interface CreateCropCycleRequest {
  blocId: string
  type: 'plantation' | 'ratoon'
  sugarcaneVarietyId: string
  plantingDate?: string // Required for plantation, optional for ratoon
  expectedHarvestDate: string
  expectedYield: number
  parentCycleId?: string // For ratoon cycles
}

export interface CloseCropCycleRequest {
  cycleId: string
  actualHarvestDate: string
  userConfirmation: boolean
  notes?: string
}

export interface CropCycleSummary {
  cycleId: string
  cycleType: 'plantation' | 'ratoon'
  cycleNumber: number
  sugarcaneVariety: string
  
  // Financial summary
  costs: {
    estimated: number
    actual: number
  }
  
  revenue: {
    sugarcane: number
    total: number
  }
  
  profitability: {
    netProfit: number
    profitPerHectare: number
    roi: number
  }
  
  // Yield summary
  yields: {
    sugarcane: {
      expected: number
      actual?: number
      perHectare: number
    }
  }
  
  // Quality metrics (if available)
  quality?: {
    brix: number
    purity: number
    sugarContent: number
  }
  
  // Completion status
  operations: {
    completed: number
    total: number
    completionRate: number
  }
  
  // Duration
  duration: number // days
}

// Field Operations related types for validation
export interface FieldOperation {
  id: string
  cropCycleId: string
  operationName: string
  operationType: string
  status: 'planned' | 'in-progress' | 'completed' | 'cancelled'
  estimatedTotalCost: number
  actualTotalCost?: number
  totalYield?: number // For harvest operations
  workPackages: WorkPackage[]
}

export interface WorkPackage {
  id: string
  fieldOperationId: string
  date: string
  status: 'not-started' | 'in-progress' | 'completed'
  
  // Cost tracking (separate for products, resources, equipment)
  productPlannedCost: number
  productActualCost?: number
  resourcePlannedCost: number
  resourceActualCost?: number
  equipmentPlannedCost: number
  equipmentActualCost?: number
}

// Validation helper types
export interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

export interface CropCyclePermissions {
  canEdit: boolean
  canClose: boolean
  canReopen: boolean
  canDelete: boolean
}

// Growth stage enum
export type GrowthStage = 
  | 'germination'
  | 'tillering'
  | 'grand-growth'
  | 'maturation'
  | 'harvest-ready'
  | 'harvested'

// Utility types for form handling
export type CropCycleFormErrors = Partial<Record<keyof CropCycleFormData, string>>

export interface CropCycleFormState {
  data: CropCycleFormData
  errors: CropCycleFormErrors
  isSubmitting: boolean
  isDirty: boolean
}
