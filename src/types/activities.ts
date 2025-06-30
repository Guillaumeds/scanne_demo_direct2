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

export type ActivityStatus = 'planned' | 'completed'

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
    cost: number
  }[]
  
  // Resources used
  resources?: {
    resourceId: string
    resourceName: string
    hours: number
    unit: string
    cost: number
    category: string
  }[]

  // Legacy fields (for backward compatibility)
  resourceType?: ResourceType
  laborHours?: number
  machineHours?: number
  totalCost?: number
  
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
  // Land Preparation
  {
    id: 'land-clearing',
    name: 'Land Clearing',
    description: 'Remove weeds, debris, and old crop residues',
    phase: 'land-preparation',
    estimatedDuration: 8,
    typicalProducts: [],
    resourceType: 'mechanical',
    estimatedCost: 500
  },
  {
    id: 'plowing',
    name: 'Primary Tillage (Plowing)',
    description: 'Deep plowing to break hardpan and improve soil structure',
    phase: 'land-preparation',
    estimatedDuration: 6,
    typicalProducts: [],
    resourceType: 'mechanical',
    estimatedCost: 400
  },
  {
    id: 'harrowing',
    name: 'Secondary Tillage (Harrowing)',
    description: 'Break clods and prepare fine seedbed',
    phase: 'land-preparation',
    estimatedDuration: 4,
    typicalProducts: [],
    resourceType: 'mechanical',
    estimatedCost: 300
  },
  
  // Planting
  {
    id: 'furrow-opening',
    name: 'Furrow Opening',
    description: 'Create planting furrows at proper spacing',
    phase: 'planting',
    estimatedDuration: 4,
    typicalProducts: [],
    resourceType: 'mechanical',
    estimatedCost: 200
  },
  {
    id: 'seed-placement',
    name: 'Seed Placement',
    description: 'Place seed cane in furrows',
    phase: 'planting',
    estimatedDuration: 12,
    typicalProducts: [
      { id: 'seed-cane', name: 'Seed Cane', type: 'seed', unit: 'tons' }
    ],
    resourceType: 'both',
    estimatedCost: 800
  },
  {
    id: 'covering',
    name: 'Covering and Compaction',
    description: 'Cover seeds and compact soil',
    phase: 'planting',
    estimatedDuration: 3,
    typicalProducts: [],
    resourceType: 'mechanical',
    estimatedCost: 150
  },
  
  // Establishment
  {
    id: 'first-irrigation',
    name: 'First Irrigation',
    description: 'Initial watering after planting',
    phase: 'establishment',
    estimatedDuration: 2,
    typicalProducts: [],
    resourceType: 'mechanical',
    estimatedCost: 100
  },
  {
    id: 'gap-filling',
    name: 'Gap Filling',
    description: 'Replace failed plants',
    phase: 'establishment',
    estimatedDuration: 6,
    typicalProducts: [
      { id: 'replacement-cane', name: 'Replacement Cane', type: 'seed', unit: 'pieces' }
    ],
    resourceType: 'manual',
    estimatedCost: 200
  },
  
  // Growth & Maintenance
  {
    id: 'fertilizer-application',
    name: 'Fertilizer Application',
    description: 'Apply NPK and micronutrients',
    phase: 'maintenance',
    estimatedDuration: 4,
    typicalProducts: [
      { id: 'npk-fertilizer', name: 'NPK Fertilizer', type: 'fertilizer', unit: 'kg' },
      { id: 'urea', name: 'Urea', type: 'fertilizer', unit: 'kg' }
    ],
    resourceType: 'both',
    estimatedCost: 600
  },
  {
    id: 'weed-control',
    name: 'Weed Control',
    description: 'Herbicide application or manual weeding',
    phase: 'maintenance',
    estimatedDuration: 6,
    typicalProducts: [
      { id: 'herbicide', name: 'Herbicide', type: 'herbicide', unit: 'L' }
    ],
    resourceType: 'both',
    estimatedCost: 300
  },
  {
    id: 'pest-control',
    name: 'Pest Control',
    description: 'Apply pesticides for pest management',
    phase: 'maintenance',
    estimatedDuration: 3,
    typicalProducts: [
      { id: 'insecticide', name: 'Insecticide', type: 'pesticide', unit: 'L' }
    ],
    resourceType: 'mechanical',
    estimatedCost: 250
  },
  
  // Harvest
  {
    id: 'cutting',
    name: 'Cane Cutting',
    description: 'Cut mature sugarcane',
    phase: 'harvest',
    estimatedDuration: 16,
    typicalProducts: [],
    resourceType: 'both',
    estimatedCost: 1200
  },
  {
    id: 'loading-transport',
    name: 'Loading and Transport',
    description: 'Load cut cane and transport to mill',
    phase: 'harvest',
    estimatedDuration: 8,
    typicalProducts: [
      { id: 'fuel', name: 'Diesel Fuel', type: 'fuel', unit: 'L' }
    ],
    resourceType: 'mechanical',
    estimatedCost: 800
  }
]
