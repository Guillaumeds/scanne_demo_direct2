/**
 * Types for bloc observations management
 *
 * Advanced TypeScript Features:
 * - Branded types for type safety
 * - Template literal types for dynamic keys
 * - Discriminated unions for observation data
 * - Utility types for common patterns
 */

import { BlocAttachment } from '@/types/attachments'

// Branded types for better type safety
export type ObservationId = string & { readonly __brand: unique symbol }
export type CropCycleId = string & { readonly __brand: unique symbol }

// Utility function to create branded IDs
export const createObservationId = (id: string): ObservationId => id as ObservationId
export const createCropCycleId = (id: string): CropCycleId => id as CropCycleId

export type ObservationCategory =
  | 'soil'
  | 'water'
  | 'plant-morphological'
  | 'growth-stage'
  | 'sugarcane-yield-quality'
  | 'pest-disease'
  | 'weed'
  | 'intercrop-yield-quality'

export type ObservationStatus = 'planned' | 'in-progress' | 'completed' | 'cancelled'

// Base observation interface
export interface BlocObservation {
  id: string
  name: string
  description: string
  category: ObservationCategory
  status: ObservationStatus

  // Crop cycle linking - MANDATORY
  cropCycleId: string
  cropCycleType: 'plantation' | 'ratoon'

  // UUIDEntity properties
  isNew?: boolean
  isDirty?: boolean

  // Scheduling
  observationDate: string
  actualDate?: string

  // Sample information
  numberOfSamples?: number
  numberOfPlants?: number

  // Notes
  notes?: string

  // Category-specific data
  data: ObservationData

  // Yield calculation properties (from database schema)
  yieldTonsHa?: number        // Maps to yield_tons_ha in database
  areaHectares?: number       // Maps to area_hectares in database
  totalYieldTons?: number     // Maps to total_yield_tons in database

  // Revenue properties (from database schema)
  sugarcaneRevenue?: number   // Maps to sugarcane_revenue in database
  intercropRevenue?: number   // Maps to intercrop_revenue in database
  revenuePerHectare?: number  // Maps to revenue_per_hectare in database
  pricePerTonne?: number      // Maps to price_per_tonne in database

  // Attachments (from application usage)
  attachments?: BlocAttachment[]  // Associated attachments

  // Metadata
  createdAt: string
  updatedAt: string
  createdBy: string
}

// Union type for all observation data types
export type ObservationData =
  | SoilObservationData
  | WaterObservationData
  | PlantMorphologicalData
  | GrowthStageData
  | SugarcaneYieldQualityData
  | PestDiseaseData
  | WeedObservationData
  | IntercropYieldQualityData
  | YieldQualityData
  | IntercropYieldData

// Soil Observations
export interface SoilObservationData {
  soilTexture?: string
  soilPH?: number // pH units
  electricalConductivity?: number // dS/m
  soilOrganicMatter?: number // %
  soilOrganicCarbon?: number // %
  bulkDensity?: number // g/cm³
  soilMoisture?: number // %
  soilTemperature?: number // °C
  availableNitrogen?: number // mg/kg
  phosphorus?: number // mg/kg
  potassium?: number // mg/kg
  calcium?: number // mg/kg
  magnesium?: number // mg/kg
  sulfur?: number // mg/kg
  boron?: number // mg/kg
  zinc?: number // mg/kg
  iron?: number // mg/kg
  manganese?: number // mg/kg
  copper?: number // mg/kg
  cationExchangeCapacity?: number // cmol/kg
  soilSalinity?: number // dS/m
  soilCompaction?: number // MPa
}

// Water Observations
export interface WaterObservationData {
  irrigationWaterEC?: number // dS/m
  waterPH?: number // pH units
  waterSourceType?: string
  waterAvailability?: number // L/min or m³/h
  waterUseEfficiency?: number // %
  drainageStatus?: string
}

// Plant Morphological Observations
export interface PlantMorphologicalData {
  plantHeight?: number // cm
  stalkDiameter?: number // mm
  numberOfTillersPerStool?: number
  leafLength?: number // cm
  leafWidth?: number // cm
  leafAreaIndex?: number
  internodeLength?: number // cm
  numberOfInternodes?: number
  stalkWeightFresh?: number // g
  stalkWeightDry?: number // g
  rootLength?: number // cm
  rootVolume?: number // cm³
  rootBiomass?: number // g
  numberOfRoots?: number
  budViability?: number // %
}

// Growth Stage Observations
export interface GrowthStageData {
  emergenceDate?: string
  germinationPercentage?: number // %
  tilleringStage?: string
  elongationStage?: string
  maturityStage?: string
  floweringDate?: string
  brix?: number // %
  ccs?: number // %
  spad?: number // SPAD units
}

// Sugarcane Yield and Quality Observations (MANDATORY for cycle closure)
export interface SugarcaneYieldQualityData {
  // Yield data (MANDATORY)
  totalYieldTons: number // Total sugarcane yield in tons
  yieldPerHectare: number // Tons per hectare (MANDATORY)
  harvestDate: string // Harvest date (MANDATORY)

  // Sugar quality data (MANDATORY)
  brix: number // Brix percentage (MANDATORY)
  sugarContent: number // Sugar content percentage (MANDATORY)

  // Additional quality metrics
  pol?: number // Pol percentage
  purity?: number // Purity percentage
  ccs?: number // Commercial Cane Sugar percentage
  fiberContent?: number // %
  moistureContent?: number // %

  // Revenue properties (from database schema)
  totalRevenue?: number       // Total revenue from sugarcane
  pricePerTonne?: number      // Price per tonne
  revenuePerHa?: number       // Revenue per hectare
  trashPercentage?: number // %
  qualityGrade?: 'A' | 'B' | 'C' | 'D'

  // Revenue data (MANDATORY)
  sugarcaneRevenue: number // Total revenue from sugarcane sales (MUR)
  sugarcanePrice: number // Price per ton (MUR)
  sugarRevenue: number // Total revenue from sugar sales (MUR)
  sugarPrice: number // Price per ton of sugar (MUR)

  // Energy/Electricity revenue (OPTIONAL - only if bagasse/biomass sold)
  energyRevenue?: number // Revenue from bagasse/biomass sales (MUR)
  energyPrice?: number // Price per ton of biomass (MUR)
  bagasseYieldTons?: number // Tons of bagasse produced

  // Additional data
  harvestMethod?: 'manual' | 'mechanical' | 'mixed'
  notes?: string
}

// Pest and Disease Observations
export interface PestDiseaseData {
  pestIncidence?: number // %
  pestSeverity?: number // 1-5 scale
  diseaseSymptoms?: string
  infestationLevel?: number // %
  damageAssessment?: string
  pestSpecies?: string
  diseaseType?: string
}

// Weed Observations
export interface WeedObservationData {
  weedSpecies?: string
  weedDensity?: number // plants/m²
  weedCoveragePercentage?: number // %
  weedBiomass?: number // g/m²
}

// Intercrop Yield and Quality Observations (MANDATORY if intercrop planted)
export interface IntercropYieldQualityData {
  // Basic info
  intercropType: string // Type of intercrop (MANDATORY)
  harvestDate: string // Harvest date (MANDATORY)

  // Yield data (MANDATORY)
  totalYieldTons: number // Total intercrop yield in tons
  yieldPerHectare: number // Tons per hectare (MANDATORY)

  // Quality metrics (specific to intercrop type)
  moistureContent?: number // %
  qualityGrade?: string // Grade specific to crop type

  // Revenue data (MANDATORY)
  intercropRevenue: number // Total revenue from intercrop sales (MUR)
  intercropPrice: number // Price per ton (MUR)
  pricePerTonne?: number // Alternative price per tonne field

  // Additional data
  harvestMethod?: 'manual' | 'mechanical' | 'mixed'
  notes?: string
}









export const OBSERVATION_CATEGORIES: {
  id: ObservationCategory
  name: string
  description: string
  color: string
  icon: string
}[] = [
  {
    id: 'soil',
    name: 'Soil Observations',
    description: 'Soil texture, pH, nutrients, and physical properties',
    color: 'bg-amber-100 text-amber-800 border-amber-200',
    icon: '🌱'
  },
  {
    id: 'water',
    name: 'Water Observations',
    description: 'Irrigation water quality and availability',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: '💧'
  },
  {
    id: 'plant-morphological',
    name: 'Plant Morphological',
    description: 'Plant height, diameter, and physical measurements',
    color: 'bg-green-100 text-green-800 border-green-200',
    icon: '📏'
  },
  {
    id: 'growth-stage',
    name: 'Growth Stage',
    description: 'Development phases and maturity indicators',
    color: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    icon: '🌾'
  },
  {
    id: 'sugarcane-yield-quality',
    name: 'Sugarcane Yield & Quality',
    description: 'MANDATORY: Sugarcane harvest yield, sugar quality, and revenue data',
    color: 'bg-green-100 text-green-800 border-green-200',
    icon: '🎯'
  },
  {
    id: 'pest-disease',
    name: 'Pest & Disease',
    description: 'Pest incidence and disease symptoms',
    color: 'bg-red-100 text-red-800 border-red-200',
    icon: '🐛'
  },
  {
    id: 'weed',
    name: 'Weed Observations',
    description: 'Weed species, density, and coverage',
    color: 'bg-orange-100 text-orange-800 border-orange-200',
    icon: '🌿'
  },
  {
    id: 'intercrop-yield-quality',
    name: 'Intercrop Yield & Quality',
    description: 'MANDATORY if intercrop planted: Intercrop harvest yield, quality, and revenue data',
    color: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    icon: '🌽'
  }
]

// Helper functions for observation validation
export const getMandatoryObservationsForCycle = (
  cycleType: 'plantation' | 'ratoon',
  hasIntercrop: boolean
): ObservationCategory[] => {
  const mandatory: ObservationCategory[] = ['sugarcane-yield-quality']

  if (hasIntercrop) {
    mandatory.push('intercrop-yield-quality')
  }

  return mandatory
}

export const validateObservationForCycleClosure = (
  observation: BlocObservation,
  hasIntercrop: boolean
): { valid: boolean; errors: string[] } => {
  const errors: string[] = []

  console.log('🔍 Validating observation for closure:', observation.name)
  console.log('📊 Observation data:', observation.data)
  console.log('🌾 Top-level yield fields:', {
    totalYieldTons: observation.totalYieldTons,
    yieldTonsHa: observation.yieldTonsHa,
    areaHectares: observation.areaHectares
  })

  switch (observation.category) {
    case 'sugarcane-yield-quality':
      const sugarcaneData = observation.data as SugarcaneYieldQualityData

      // Check yield data from both top-level fields and category data
      const totalYield = observation.totalYieldTons || sugarcaneData?.totalYieldTons
      const yieldPerHa = observation.yieldTonsHa || sugarcaneData?.yieldPerHectare

      console.log('🔍 Yield validation data:', {
        totalYield,
        yieldPerHa,
        fromTopLevel: { totalYieldTons: observation.totalYieldTons, yieldTonsHa: observation.yieldTonsHa },
        fromCategoryData: { totalYieldTons: sugarcaneData?.totalYieldTons, yieldPerHectare: sugarcaneData?.yieldPerHectare }
      })

      // Mandatory yield fields
      if (!totalYield || totalYield <= 0) {
        errors.push('Total sugarcane yield is required and must be greater than 0')
      }
      if (!yieldPerHa || yieldPerHa <= 0) {
        errors.push('Yield per hectare is required and must be greater than 0')
      }

      // Revenue validation (more flexible - check if any revenue data exists)
      const hasRevenue = sugarcaneData?.sugarcaneRevenue > 0 ||
                        (sugarcaneData?.totalRevenue || 0) > 0 ||
                        (sugarcaneData?.pricePerTonne || 0) > 0

      if (!hasRevenue) {
        errors.push('Revenue data is required (price per tonne or total revenue)')
      }

      // Quality fields are optional for basic closure validation
      // Only require them if they exist but are invalid
      if (sugarcaneData?.brix !== undefined && sugarcaneData.brix <= 0) {
        errors.push('Brix percentage must be greater than 0 if provided')
      }
      if (sugarcaneData?.sugarContent !== undefined && sugarcaneData.sugarContent <= 0) {
        errors.push('Sugar content percentage must be greater than 0 if provided')
      }
      break

    case 'intercrop-yield-quality':
      const intercropData = observation.data as IntercropYieldQualityData

      // Check yield data from both top-level fields and category data
      const intercropTotalYield = observation.totalYieldTons || intercropData?.totalYieldTons
      const intercropYieldPerHa = observation.yieldTonsHa || intercropData?.yieldPerHectare

      // Mandatory yield fields
      if (!intercropTotalYield || intercropTotalYield <= 0) {
        errors.push('Total intercrop yield is required and must be greater than 0')
      }
      if (!intercropYieldPerHa || intercropYieldPerHa <= 0) {
        errors.push('Intercrop yield per hectare is required and must be greater than 0')
      }

      // Revenue validation (more flexible)
      const hasIntercropRevenue = intercropData?.intercropRevenue !== undefined && intercropData.intercropRevenue >= 0
      if (!hasIntercropRevenue) {
        errors.push('Intercrop revenue is required (can be 0)')
      }
      break
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

// Additional observation data types for legacy compatibility
export interface YieldQualityData {
  yieldPerHectare: number // tons/ha
  qualityGrade: 'A' | 'B' | 'C' | 'D'
  harvestDate: string
  moistureContent?: number // %
  trashPercentage?: number // %
  notes?: string
}

export interface IntercropYieldData {
  intercropType: string
  intercropYield: number // tons/ha
  harvestDate: string
  qualityGrade?: 'A' | 'B' | 'C' | 'D'
  marketPrice?: number // Rs per unit
  totalRevenue?: number // Rs
  notes?: string
}

// Advanced TypeScript Features

// Template literal types for dynamic observation keys
export type ObservationDataKey<T extends ObservationCategory> =
  T extends 'soil' ? keyof SoilObservationData :
  T extends 'water' ? keyof WaterObservationData :
  T extends 'plant-morphological' ? keyof PlantMorphologicalData :
  T extends 'growth-stage' ? keyof GrowthStageData :
  T extends 'sugarcane-yield-quality' ? keyof SugarcaneYieldQualityData :
  T extends 'pest-disease' ? keyof PestDiseaseData :
  T extends 'weed' ? keyof WeedObservationData :
  T extends 'intercrop-yield-quality' ? keyof IntercropYieldQualityData :
  never

// Discriminated union for type-safe observation data access
export type TypedObservationData<T extends ObservationCategory> =
  T extends 'soil' ? SoilObservationData :
  T extends 'water' ? WaterObservationData :
  T extends 'plant-morphological' ? PlantMorphologicalData :
  T extends 'growth-stage' ? GrowthStageData :
  T extends 'sugarcane-yield-quality' ? SugarcaneYieldQualityData :
  T extends 'pest-disease' ? PestDiseaseData :
  T extends 'weed' ? WeedObservationData :
  T extends 'intercrop-yield-quality' ? IntercropYieldQualityData :
  never

// Utility types for common patterns
export type ObservationWithData<T extends ObservationCategory> = Omit<BlocObservation, 'data' | 'category'> & {
  category: T
  data: TypedObservationData<T>
}

// Result types for better error handling
export type ObservationResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; code?: string }

// Partial update types
export type ObservationUpdate = Partial<Omit<BlocObservation, 'id' | 'createdAt' | 'createdBy'>>

// Query types for filtering
export interface ObservationQuery {
  category?: ObservationCategory | ObservationCategory[]
  status?: ObservationStatus | ObservationStatus[]
  cropCycleId?: string
  dateRange?: {
    start: string
    end: string
  }
  limit?: number
  offset?: number
}

// Type guards for runtime type checking
export const isObservationCategory = (value: string): value is ObservationCategory => {
  return ['soil', 'water', 'plant-morphological', 'growth-stage', 'sugarcane-yield-quality',
          'pest-disease', 'weed', 'intercrop-yield-quality'].includes(value)
}

export const isObservationStatus = (value: string): value is ObservationStatus => {
  return ['planned', 'in-progress', 'completed', 'cancelled'].includes(value)
}
