/**
 * Types for bloc activities management
 */

export type ActivityPhase = 
  | 'land-preparation'
  | 'planting'
  | 'establishment'
  | 'growth'
  | 'maintenance'
  | 'pre-harvest'
  | 'harvest'
  | 'post-harvest'

export type ActivityStatus = 'planned' | 'in-progress' | 'completed' | 'cancelled'

export type ResourceType = 'manual' | 'mechanical' | 'both'

export interface Product {
  id: string
  name: string
  type: 'fertilizer' | 'pesticide' | 'herbicide' | 'seed' | 'fuel' | 'other'
  unit: string // kg, L, bags, etc.
}

export interface BlocActivity {
  id: string
  name: string
  description: string
  phase: ActivityPhase
  status: ActivityStatus

  // Crop cycle linking - MANDATORY
  cropCycleId: string
  cropCycleType: 'plantation' | 'ratoon'

  // Scheduling
  startDate: string
  endDate: string
  actualDate?: string
  duration: number // hours
  
  // Products used
  products: {
    productId: string
    productName: string
    quantity: number
    rate: number // per hectare
    unit: string
    estimatedCost: number // Auto-calculated, non-editable
    actualCost?: number // User-entered actual cost
  }[]

  // Resources used
  resources?: {
    resourceId: string
    resourceName: string
    hours: number
    unit: string
    estimatedCost: number // Auto-calculated, non-editable
    actualCost?: number // User-entered actual cost
    category: string
  }[]

  // Cost summaries (auto-calculated, non-editable)
  totalEstimatedCost: number // Sum of all estimated costs
  totalActualCost?: number // Sum of all actual costs (when available)

  // Legacy fields (for backward compatibility)
  resourceType?: ResourceType
  laborHours?: number
  machineHours?: number
  totalCost?: number // Deprecated - use totalEstimatedCost and totalActualCost instead
  
  // Additional info
  weather?: string
  notes?: string
  attachments?: string[]
  
  // Metadata
  createdAt: string
  updatedAt: string
  createdBy: string
}

export interface ActivityTemplate {
  id: string
  name: string
  description: string
  phase: ActivityPhase
  estimatedDuration: number
  typicalProducts: Product[]
  resourceType: ResourceType
  estimatedCost: number
}

export const SUGARCANE_PHASES: { 
  id: ActivityPhase
  name: string
  description: string
  color: string
  icon: string
  duration: string
}[] = [
  {
    id: 'land-preparation',
    name: 'Land Preparation',
    description: 'Clearing, plowing, and soil preparation',
    color: 'bg-amber-100 text-amber-800 border-amber-200',
    icon: '🚜',
    duration: '2-4 weeks'
  },
  {
    id: 'planting',
    name: 'Planting',
    description: 'Seed bed preparation and planting',
    color: 'bg-green-100 text-green-800 border-green-200',
    icon: '🌱',
    duration: '1-2 weeks'
  },
  {
    id: 'establishment',
    name: 'Establishment',
    description: 'Initial growth and establishment care',
    color: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    icon: '🌿',
    duration: '2-3 months'
  },
  {
    id: 'growth',
    name: 'Growth Phase',
    description: 'Active growth and development',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: '🌾',
    duration: '6-8 months'
  },
  {
    id: 'maintenance',
    name: 'Maintenance',
    description: 'Ongoing care, fertilization, pest control',
    color: 'bg-purple-100 text-purple-800 border-purple-200',
    icon: '🔧',
    duration: 'Ongoing'
  },
  {
    id: 'pre-harvest',
    name: 'Pre-Harvest',
    description: 'Preparation for harvest activities',
    color: 'bg-orange-100 text-orange-800 border-orange-200',
    icon: '📋',
    duration: '2-4 weeks'
  },
  {
    id: 'harvest',
    name: 'Harvest',
    description: 'Cutting and collection of sugarcane',
    color: 'bg-red-100 text-red-800 border-red-200',
    icon: '✂️',
    duration: '4-8 weeks'
  },
  {
    id: 'post-harvest',
    name: 'Post-Harvest',
    description: 'Field cleanup and preparation for next cycle',
    color: 'bg-gray-100 text-gray-800 border-gray-200',
    icon: '🧹',
    duration: '2-3 weeks'
  }
]

export const ACTIVITY_TEMPLATES: ActivityTemplate[] = [
  // Land Preparation Phase
  {
    id: 'clearing',
    name: 'Clearing',
    description: 'Remove vegetation, rocks, and debris from the field',
    phase: 'land-preparation',
    estimatedDuration: 8,
    typicalProducts: [],
    resourceType: 'mechanical',
    estimatedCost: 5000
  },
  {
    id: 'deep-ploughing',
    name: 'Deep Ploughing',
    description: 'Deep tillage to break hardpan and improve soil structure',
    phase: 'land-preparation',
    estimatedDuration: 6,
    typicalProducts: [],
    resourceType: 'mechanical',
    estimatedCost: 8000
  },
  {
    id: 'harrowing',
    name: 'Harrowing',
    description: 'Break up soil clods and create smooth seedbed',
    phase: 'land-preparation',
    estimatedDuration: 4,
    typicalProducts: [],
    resourceType: 'mechanical',
    estimatedCost: 3000
  },
  {
    id: 'leveling',
    name: 'Leveling',
    description: 'Level the field for uniform water distribution',
    phase: 'land-preparation',
    estimatedDuration: 6,
    typicalProducts: [],
    resourceType: 'mechanical',
    estimatedCost: 4000
  },
  {
    id: 'soil-testing',
    name: 'Soil Testing',
    description: 'Collect and analyze soil samples for nutrient content',
    phase: 'land-preparation',
    estimatedDuration: 2,
    typicalProducts: [],
    resourceType: 'manual',
    estimatedCost: 1500
  },
  {
    id: 'furrow-preparation',
    name: 'Furrow Preparation',
    description: 'Create furrows for planting and drainage',
    phase: 'land-preparation',
    estimatedDuration: 4,
    typicalProducts: [],
    resourceType: 'mechanical',
    estimatedCost: 3500
  },
  {
    id: 'fallowing',
    name: 'Fallowing',
    description: 'Leave field uncultivated to restore soil fertility',
    phase: 'land-preparation',
    estimatedDuration: 24,
    typicalProducts: [],
    resourceType: 'manual',
    estimatedCost: 500
  },
  {
    id: 'land-weed-control',
    name: 'Weed Control',
    description: 'Remove weeds before planting',
    phase: 'land-preparation',
    estimatedDuration: 6,
    typicalProducts: [],
    resourceType: 'manual',
    estimatedCost: 2500
  },
  {
    id: 'basal-fertilization-land',
    name: 'Basal Fertilization',
    description: 'Apply base fertilizers before planting',
    phase: 'land-preparation',
    estimatedDuration: 4,
    typicalProducts: [],
    resourceType: 'manual',
    estimatedCost: 4000
  },
  {
    id: 'soil-amendment-land',
    name: 'Soil Amendment',
    description: 'Add organic matter or lime to improve soil conditions',
    phase: 'land-preparation',
    estimatedDuration: 6,
    typicalProducts: [],
    resourceType: 'manual',
    estimatedCost: 3000
  },
  {
    id: 'trash-removal',
    name: 'Trash Removal',
    description: 'Remove crop residues and debris from previous harvest',
    phase: 'land-preparation',
    estimatedDuration: 4,
    typicalProducts: [],
    resourceType: 'manual',
    estimatedCost: 2000
  },
  {
    id: 'stubble-shaving',
    name: 'Stubble Shaving',
    description: 'Cut remaining stubble close to ground level',
    phase: 'land-preparation',
    estimatedDuration: 3,
    typicalProducts: [],
    resourceType: 'mechanical',
    estimatedCost: 2500
  },
  {
    id: 'land-preparation-other',
    name: 'Other',
    description: 'Custom land preparation activity - add description and notes',
    phase: 'land-preparation',
    estimatedDuration: 4,
    typicalProducts: [],
    resourceType: 'manual',
    estimatedCost: 2000
  },

  // Planting Phase
  {
    id: 'seed-cane-selection',
    name: 'Seed Cane Selection',
    description: 'Select healthy seed cane for planting',
    phase: 'planting',
    estimatedDuration: 4,
    typicalProducts: [],
    resourceType: 'manual',
    estimatedCost: 2000
  },
  {
    id: 'sett-treatment',
    name: 'Sett Treatment',
    description: 'Treat seed cane setts with fungicides and insecticides',
    phase: 'planting',
    estimatedDuration: 3,
    typicalProducts: [],
    resourceType: 'manual',
    estimatedCost: 1500
  },
  {
    id: 'sett-placement',
    name: 'Sett Placement',
    description: 'Place treated setts in furrows at proper spacing',
    phase: 'planting',
    estimatedDuration: 8,
    typicalProducts: [],
    resourceType: 'manual',
    estimatedCost: 3000
  },
  {
    id: 'basal-fertilization-planting',
    name: 'Basal Fertilization',
    description: 'Apply fertilizers at the time of planting',
    phase: 'planting',
    estimatedDuration: 4,
    typicalProducts: [],
    resourceType: 'manual',
    estimatedCost: 2500
  },
  {
    id: 'soil-amendment-planting',
    name: 'Soil Amendment',
    description: 'Apply soil amendments during planting',
    phase: 'planting',
    estimatedDuration: 3,
    typicalProducts: [],
    resourceType: 'manual',
    estimatedCost: 2000
  },
  {
    id: 'soil-covering',
    name: 'Soil Covering',
    description: 'Cover planted setts with soil',
    phase: 'planting',
    estimatedDuration: 6,
    typicalProducts: [],
    resourceType: 'manual',
    estimatedCost: 2500
  },
  {
    id: 'irrigation-planting',
    name: 'Irrigation',
    description: 'Initial irrigation after planting',
    phase: 'planting',
    estimatedDuration: 2,
    typicalProducts: [],
    resourceType: 'manual',
    estimatedCost: 1000
  },
  {
    id: 'planting-other',
    name: 'Other',
    description: 'Custom planting activity - add description and notes',
    phase: 'planting',
    estimatedDuration: 4,
    typicalProducts: [],
    resourceType: 'manual',
    estimatedCost: 2000
  },

  // Establishment Phase
  {
    id: 'germination-monitoring',
    name: 'Germination Monitoring',
    description: 'Monitor and assess germination rates',
    phase: 'establishment',
    estimatedDuration: 2,
    typicalProducts: [],
    resourceType: 'manual',
    estimatedCost: 500
  },
  {
    id: 'gap-filling',
    name: 'Gap Filling',
    description: 'Replace failed setts with new ones',
    phase: 'establishment',
    estimatedDuration: 6,
    typicalProducts: [],
    resourceType: 'manual',
    estimatedCost: 2000
  },
  {
    id: 'establishment-weed-control',
    name: 'Weed Control',
    description: 'Control weeds during establishment phase',
    phase: 'establishment',
    estimatedDuration: 8,
    typicalProducts: [],
    resourceType: 'manual',
    estimatedCost: 3000
  },
  {
    id: 'fertilization-establishment',
    name: 'Fertilization',
    description: 'Apply fertilizers during establishment',
    phase: 'establishment',
    estimatedDuration: 4,
    typicalProducts: [],
    resourceType: 'manual',
    estimatedCost: 2500
  },
  {
    id: 'irrigation-establishment',
    name: 'Irrigation',
    description: 'Regular irrigation during establishment',
    phase: 'establishment',
    estimatedDuration: 3,
    typicalProducts: [],
    resourceType: 'manual',
    estimatedCost: 1500
  },
  {
    id: 'establishment-other',
    name: 'Other',
    description: 'Custom establishment activity - add description and notes',
    phase: 'establishment',
    estimatedDuration: 4,
    typicalProducts: [],
    resourceType: 'manual',
    estimatedCost: 2000
  },

  // Growth Phase
  {
    id: 'irrigation-growth',
    name: 'Irrigation',
    description: 'Regular irrigation during growth phase',
    phase: 'growth',
    estimatedDuration: 3,
    typicalProducts: [],
    resourceType: 'manual',
    estimatedCost: 1500
  },
  {
    id: 'fertilization-growth',
    name: 'Fertilization',
    description: 'Apply fertilizers during growth phase',
    phase: 'growth',
    estimatedDuration: 4,
    typicalProducts: [],
    resourceType: 'manual',
    estimatedCost: 3000
  },
  {
    id: 'intercultural-operations',
    name: 'Intercultural Operations',
    description: 'Earthing up, cultivation, and other field operations',
    phase: 'growth',
    estimatedDuration: 6,
    typicalProducts: [],
    resourceType: 'mechanical',
    estimatedCost: 2500
  },
  {
    id: 'growth-weed-control',
    name: 'Weed Control',
    description: 'Control weeds during growth phase',
    phase: 'growth',
    estimatedDuration: 8,
    typicalProducts: [],
    resourceType: 'manual',
    estimatedCost: 3000
  },
  {
    id: 'trash-mulching',
    name: 'Trash Mulching',
    description: 'Apply trash mulch around plants',
    phase: 'growth',
    estimatedDuration: 6,
    typicalProducts: [],
    resourceType: 'manual',
    estimatedCost: 2000
  },
  {
    id: 'intercrop-planting',
    name: 'Intercrop Planting',
    description: 'Plant intercrops between cane rows',
    phase: 'growth',
    estimatedDuration: 8,
    typicalProducts: [],
    resourceType: 'manual',
    estimatedCost: 2500
  },
  {
    id: 'intercrop-harvesting',
    name: 'Intercrop Harvesting',
    description: 'Harvest intercrops',
    phase: 'growth',
    estimatedDuration: 6,
    typicalProducts: [],
    resourceType: 'manual',
    estimatedCost: 2000
  },
  {
    id: 'pest-control',
    name: 'Pest Control',
    description: 'Control pests and diseases',
    phase: 'growth',
    estimatedDuration: 4,
    typicalProducts: [],
    resourceType: 'manual',
    estimatedCost: 2500
  },
  {
    id: 'growth-other',
    name: 'Other',
    description: 'Custom growth phase activity - add description and notes',
    phase: 'growth',
    estimatedDuration: 4,
    typicalProducts: [],
    resourceType: 'manual',
    estimatedCost: 2000
  },

  // Pre-Harvest Phase
  {
    id: 'detrashing',
    name: 'Detrashing',
    description: 'Remove dry leaves before harvest',
    phase: 'pre-harvest',
    estimatedDuration: 8,
    typicalProducts: [],
    resourceType: 'manual',
    estimatedCost: 3000
  },
  {
    id: 'propping',
    name: 'Propping',
    description: 'Support lodged canes',
    phase: 'pre-harvest',
    estimatedDuration: 6,
    typicalProducts: [],
    resourceType: 'manual',
    estimatedCost: 2500
  },
  {
    id: 'earthing-up',
    name: 'Earthing Up',
    description: 'Build up soil around cane base',
    phase: 'pre-harvest',
    estimatedDuration: 6,
    typicalProducts: [],
    resourceType: 'mechanical',
    estimatedCost: 2000
  },
  {
    id: 'flowering-regulation',
    name: 'Flowering Regulation',
    description: 'Control flowering to maintain sugar content',
    phase: 'pre-harvest',
    estimatedDuration: 2,
    typicalProducts: [],
    resourceType: 'manual',
    estimatedCost: 1000
  },
  {
    id: 'water-shoot-removal',
    name: 'Water Shoot Removal',
    description: 'Remove excess shoots',
    phase: 'pre-harvest',
    estimatedDuration: 4,
    typicalProducts: [],
    resourceType: 'manual',
    estimatedCost: 1500
  },
  {
    id: 'irrigation-pre-harvest',
    name: 'Irrigation',
    description: 'Final irrigation before harvest',
    phase: 'pre-harvest',
    estimatedDuration: 2,
    typicalProducts: [],
    resourceType: 'manual',
    estimatedCost: 1000
  },
  {
    id: 'maturity-assessment',
    name: 'Maturity Assessment',
    description: 'Assess cane maturity for optimal harvest timing',
    phase: 'pre-harvest',
    estimatedDuration: 2,
    typicalProducts: [],
    resourceType: 'manual',
    estimatedCost: 500
  },
  {
    id: 'pre-harvest-other',
    name: 'Other',
    description: 'Custom pre-harvest activity - add description and notes',
    phase: 'pre-harvest',
    estimatedDuration: 4,
    typicalProducts: [],
    resourceType: 'manual',
    estimatedCost: 2000
  },

  // Maintenance Phase
  {
    id: 'infrastructure-maintenance',
    name: 'Infrastructure Maintenance',
    description: 'Maintain farm infrastructure, roads, and equipment',
    phase: 'maintenance',
    estimatedDuration: 8,
    typicalProducts: [],
    resourceType: 'mechanical',
    estimatedCost: 5000
  },
  {
    id: 'maintenance-other',
    name: 'Other',
    description: 'Custom maintenance activity - add description and notes',
    phase: 'maintenance',
    estimatedDuration: 4,
    typicalProducts: [],
    resourceType: 'manual',
    estimatedCost: 2000
  },

  // Harvest Phase
  {
    id: 'field-draining',
    name: 'Field Draining',
    description: 'Drain excess water from fields before harvest',
    phase: 'harvest',
    estimatedDuration: 4,
    typicalProducts: [],
    resourceType: 'manual',
    estimatedCost: 1500
  },
  {
    id: 'cane-cutting',
    name: 'Cane Cutting',
    description: 'Manual cutting of sugarcane',
    phase: 'harvest',
    estimatedDuration: 16,
    typicalProducts: [],
    resourceType: 'manual',
    estimatedCost: 8000
  },
  {
    id: 'cane-bundling',
    name: 'Cane Bundling',
    description: 'Bundle cut canes for transport',
    phase: 'harvest',
    estimatedDuration: 8,
    typicalProducts: [],
    resourceType: 'manual',
    estimatedCost: 3000
  },
  {
    id: 'transport-preparation',
    name: 'Transport Preparation',
    description: 'Prepare canes for transport to mill',
    phase: 'harvest',
    estimatedDuration: 4,
    typicalProducts: [],
    resourceType: 'manual',
    estimatedCost: 2000
  },
  {
    id: 'field-cleanup',
    name: 'Field Clean-up',
    description: 'Clean field after harvest',
    phase: 'harvest',
    estimatedDuration: 6,
    typicalProducts: [],
    resourceType: 'manual',
    estimatedCost: 2500
  },
  {
    id: 'mechanical-harvesting',
    name: 'Mechanical Harvesting',
    description: 'Machine harvesting of sugarcane',
    phase: 'harvest',
    estimatedDuration: 4,
    typicalProducts: [],
    resourceType: 'mechanical',
    estimatedCost: 6000
  },
  {
    id: 'harvest-other',
    name: 'Other',
    description: 'Custom harvest activity - add description and notes',
    phase: 'harvest',
    estimatedDuration: 4,
    typicalProducts: [],
    resourceType: 'manual',
    estimatedCost: 2000
  }
]

// Helper functions for activity cost validation (UX ONLY)
// ⚠️ NOTE: This is for form validation and real-time feedback only
// Authoritative cost totals are calculated and stored by database functions
export const calculateActivityCosts = (activity: BlocActivity): {
  totalEstimatedCost: number
  totalActualCost?: number
  note: 'UX calculation only - database stores authoritative totals'
} => {
  let totalEstimatedCost = 0
  let totalActualCost = 0
  let hasActualCosts = false

  // Calculate product costs
  if (activity.products) {
    for (const product of activity.products) {
      totalEstimatedCost += product.estimatedCost || 0
      if (product.actualCost !== undefined) {
        totalActualCost += product.actualCost
        hasActualCosts = true
      }
    }
  }

  // Calculate resource costs
  if (activity.resources) {
    for (const resource of activity.resources) {
      totalEstimatedCost += resource.estimatedCost || 0
      if (resource.actualCost !== undefined) {
        totalActualCost += resource.actualCost
        hasActualCosts = true
      }
    }
  }

  return {
    totalEstimatedCost,
    totalActualCost: hasActualCosts ? totalActualCost : undefined,
    note: 'UX calculation only - database stores authoritative totals'
  }
}

export const validateActivityForCycleClosure = (activity: BlocActivity): {
  valid: boolean
  errors: string[]
} => {
  const errors: string[] = []

  // Check if activity is completed
  if (activity.status !== 'completed') {
    errors.push(`Activity "${activity.name}" must be completed before cycle closure`)
  }

  // Check if all products have actual costs
  if (activity.products) {
    for (const product of activity.products) {
      if (product.actualCost === undefined || product.actualCost === null) {
        errors.push(`Actual cost for product "${product.productName}" is required`)
      }
    }
  }

  // Check if all resources have actual costs
  if (activity.resources) {
    for (const resource of activity.resources) {
      if (resource.actualCost === undefined || resource.actualCost === null) {
        errors.push(`Actual cost for resource "${resource.resourceName}" is required`)
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

export const getAllActivitiesValidationErrors = (activities: BlocActivity[]): string[] => {
  const allErrors: string[] = []

  for (const activity of activities) {
    const validation = validateActivityForCycleClosure(activity)
    allErrors.push(...validation.errors)
  }

  return allErrors
}
