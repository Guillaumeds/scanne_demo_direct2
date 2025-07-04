/**
 * Types for bloc observations management
 */

export type ObservationCategory = 
  | 'soil'
  | 'water'
  | 'plant-morphological'
  | 'growth-stage'
  | 'yield-quality'
  | 'pest-disease'
  | 'weed'
  | 'intercrop-yield'

export type ObservationStatus = 'planned' | 'in-progress' | 'completed'

// Base observation interface
export interface BlocObservation {
  id: string
  name: string
  description: string
  category: ObservationCategory
  status: ObservationStatus
  
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
  | YieldQualityData
  | PestDiseaseData
  | WeedObservationData
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

// Yield and Quality Observations
export interface YieldQualityData {
  caneYield?: number // t/ha
  juiceBrix?: number // %
  commercialCaneSugar?: number // %
  fiberContent?: number // %
  polPercent?: number // %
  purity?: number // %
  trashPercentage?: number // %
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

// Intercrop Yield Observations
export interface IntercropYieldData {
  intercropType?: string
  intercropYield?: number // t/ha or kg/ha
  intercropQuality?: string
  intercropBrix?: number // %
  intercropMoisture?: number // %
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
    id: 'yield-quality',
    name: 'Yield & Quality',
    description: 'Harvest yield and sugar quality metrics',
    color: 'bg-purple-100 text-purple-800 border-purple-200',
    icon: '⚖️'
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
    id: 'intercrop-yield',
    name: 'Intercrop Yield',
    description: 'Intercrop harvest and quality data',
    color: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    icon: '🌽'
  }
]
