/**
 * Transactional Data: Blocs
 * Dynamic bloc data that can be modified in demo mode
 */

export interface Bloc {
  id: string
  uuid: string
  localId: string
  name: string
  farmId: string
  area: number
  coordinates: Array<[number, number]> // [lat, lng] pairs for polygon
  soilType: string
  elevation: number
  slope: number
  drainageClass: string
  irrigationMethod: string
  accessRoad: boolean
  active: boolean
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface CropCycle {
  id: string
  blocId: string
  type: 'plantation' | 'ratoon'
  cycleNumber: number
  status: 'active' | 'closed' | 'planned'
  
  // Variety information
  sugarcaneVarietyId: string
  sugarcaneVarietyName: string
  intercropVarietyId?: string
  intercropVarietyName?: string
  
  // Dates
  plantingDate?: string
  plannedHarvestDate: string
  actualHarvestDate?: string
  
  // Yield data
  expectedYield: number // tons/ha
  actualYield?: number // tons/ha
  
  // Financial data
  estimatedTotalCost: number
  actualTotalCost: number
  revenue: number
  netProfit: number
  profitPerHectare: number
  profitMarginPercent: number
  
  // Growth tracking
  growthStage: string
  growthStageUpdatedAt: string
  daysSincePlanting: number
  
  // Parent relationship (for ratoon cycles)
  parentCycleId?: string
  
  // Metadata
  createdAt: string
  updatedAt: string
}

export interface FieldOperation {
  id: string
  cropCycleId: string
  blocId: string
  type: string
  method: string
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled'
  
  // Dates
  plannedStartDate: string
  plannedEndDate: string
  actualStartDate?: string
  actualEndDate?: string
  
  // Area and progress
  plannedArea: number
  actualArea?: number
  progress: number // 0-100
  
  // Costs
  estimatedCost: number
  actualCost: number
  
  // Resources
  labourRequired: string[]
  equipmentRequired: string[]
  productsUsed: Array<{
    productId: string
    quantity: number
    unit: string
    costPerUnit: number
  }>
  
  // Notes and conditions
  notes?: string
  weatherConditions?: string
  
  // Metadata
  createdAt: string
  updatedAt: string
}

export interface WorkPackage {
  id: string
  fieldOperationId: string
  date: string
  area: number
  hours: number
  cost: number
  crew: string
  equipment: string
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled'
  notes?: string
  createdAt: string
  updatedAt: string
}

// Demo blocs data
export const DEMO_BLOCS: Bloc[] = [
  {
    id: 'bloc-001',
    uuid: 'bloc-001',
    localId: 'B001',
    name: 'North Field A',
    farmId: 'farm-001',
    area: 45.2,
    coordinates: [
      [-20.2833, 57.6167],
      [-20.2823, 57.6177],
      [-20.2813, 57.6167],
      [-20.2823, 57.6157],
      [-20.2833, 57.6167]
    ],
    soilType: 'Clay Loam',
    elevation: 125,
    slope: 2.5,
    drainageClass: 'Well Drained',
    irrigationMethod: 'Drip Irrigation',
    accessRoad: true,
    active: true,
    notes: 'Prime sugarcane growing area with excellent drainage',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'bloc-002',
    uuid: 'bloc-002',
    localId: 'B002',
    name: 'South Field B',
    farmId: 'farm-001',
    area: 38.7,
    coordinates: [
      [-20.2843, 57.6157],
      [-20.2833, 57.6167],
      [-20.2823, 57.6157],
      [-20.2833, 57.6147],
      [-20.2843, 57.6157]
    ],
    soilType: 'Sandy Loam',
    elevation: 118,
    slope: 1.8,
    drainageClass: 'Moderately Well Drained',
    irrigationMethod: 'Sprinkler',
    accessRoad: true,
    active: true,
    notes: 'Good for early variety planting',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'bloc-003',
    uuid: 'bloc-003',
    localId: 'B003',
    name: 'East Field C',
    farmId: 'farm-002',
    area: 52.1,
    coordinates: [
      [-20.3167, 57.6000],
      [-20.3157, 57.6010],
      [-20.3147, 57.6000],
      [-20.3157, 57.5990],
      [-20.3167, 57.6000]
    ],
    soilType: 'Latosol',
    elevation: 142,
    slope: 3.2,
    drainageClass: 'Well Drained',
    irrigationMethod: 'Center Pivot',
    accessRoad: true,
    active: true,
    notes: 'High elevation field with good yields',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }
]

// Demo crop cycles
export const DEMO_CROP_CYCLES: CropCycle[] = [
  {
    id: 'cycle-001',
    blocId: 'bloc-001',
    type: 'plantation',
    cycleNumber: 1,
    status: 'active',
    sugarcaneVarietyId: 'var-001',
    sugarcaneVarietyName: 'R570',
    plantingDate: '2024-03-15',
    plannedHarvestDate: '2025-03-15',
    expectedYield: 85,
    estimatedTotalCost: 125000,
    actualTotalCost: 45000,
    revenue: 0,
    netProfit: -45000,
    profitPerHectare: -995.58,
    profitMarginPercent: -100,
    growthStage: 'Tillering',
    growthStageUpdatedAt: '2024-07-19T00:00:00Z',
    daysSincePlanting: 126,
    createdAt: '2024-03-15T00:00:00Z',
    updatedAt: '2024-07-19T00:00:00Z'
  },
  {
    id: 'cycle-002',
    blocId: 'bloc-002',
    type: 'plantation',
    cycleNumber: 1,
    status: 'active',
    sugarcaneVarietyId: 'var-002',
    sugarcaneVarietyName: 'R579',
    plantingDate: '2024-04-01',
    plannedHarvestDate: '2025-02-01',
    expectedYield: 78,
    estimatedTotalCost: 110000,
    actualTotalCost: 38000,
    revenue: 0,
    netProfit: -38000,
    profitPerHectare: -982.17,
    profitMarginPercent: -100,
    growthStage: 'Grand Growth',
    growthStageUpdatedAt: '2024-07-19T00:00:00Z',
    daysSincePlanting: 109,
    createdAt: '2024-04-01T00:00:00Z',
    updatedAt: '2024-07-19T00:00:00Z'
  }
]

// Demo field operations
export const DEMO_FIELD_OPERATIONS: FieldOperation[] = [
  {
    id: 'op-001',
    cropCycleId: 'cycle-001',
    blocId: 'bloc-001',
    type: 'Land Preparation',
    method: 'Mechanical',
    status: 'completed',
    plannedStartDate: '2024-02-15',
    plannedEndDate: '2024-02-20',
    actualStartDate: '2024-02-15',
    actualEndDate: '2024-02-19',
    plannedArea: 45.2,
    actualArea: 45.2,
    progress: 100,
    estimatedCost: 15000,
    actualCost: 14500,
    labourRequired: ['labour-001', 'labour-002'],
    equipmentRequired: ['equip-001', 'equip-003'],
    productsUsed: [],
    notes: 'Completed ahead of schedule',
    weatherConditions: 'Dry and sunny',
    createdAt: '2024-02-15T00:00:00Z',
    updatedAt: '2024-02-19T00:00:00Z'
  },
  {
    id: 'op-002',
    cropCycleId: 'cycle-001',
    blocId: 'bloc-001',
    type: 'Planting',
    method: 'Mechanical',
    status: 'completed',
    plannedStartDate: '2024-03-10',
    plannedEndDate: '2024-03-15',
    actualStartDate: '2024-03-12',
    actualEndDate: '2024-03-15',
    plannedArea: 45.2,
    actualArea: 45.2,
    progress: 100,
    estimatedCost: 25000,
    actualCost: 24800,
    labourRequired: ['labour-001', 'labour-002'],
    equipmentRequired: ['equip-004'],
    productsUsed: [
      {
        productId: 'prod-001',
        quantity: 200,
        unit: 'kg',
        costPerUnit: 45.50
      }
    ],
    notes: 'Good planting conditions',
    weatherConditions: 'Partly cloudy, no rain',
    createdAt: '2024-03-10T00:00:00Z',
    updatedAt: '2024-03-15T00:00:00Z'
  }
]

// Demo work packages
export const DEMO_WORK_PACKAGES: WorkPackage[] = [
  {
    id: 'wp-001',
    fieldOperationId: 'op-001',
    date: '2024-02-15',
    area: 22.6,
    hours: 8,
    cost: 7250,
    crew: 'Team A',
    equipment: 'Tractor T1 + Disc Harrow',
    status: 'completed',
    notes: 'First half of field completed',
    createdAt: '2024-02-15T00:00:00Z',
    updatedAt: '2024-02-15T00:00:00Z'
  },
  {
    id: 'wp-002',
    fieldOperationId: 'op-001',
    date: '2024-02-16',
    area: 22.6,
    hours: 7.5,
    cost: 7250,
    crew: 'Team A',
    equipment: 'Tractor T1 + Disc Harrow',
    status: 'completed',
    notes: 'Second half completed efficiently',
    createdAt: '2024-02-16T00:00:00Z',
    updatedAt: '2024-02-16T00:00:00Z'
  }
]

// Utility functions
export const blocUtils = {
  getById: (id: string, blocs: Bloc[] = DEMO_BLOCS) => blocs.find(b => b.id === id || b.uuid === id),
  getByFarmId: (farmId: string, blocs: Bloc[] = DEMO_BLOCS) => blocs.filter(b => b.farmId === farmId),
  getActive: (blocs: Bloc[] = DEMO_BLOCS) => blocs.filter(b => b.active),
  getTotalArea: (blocs: Bloc[] = DEMO_BLOCS) => blocs.reduce((total, bloc) => total + bloc.area, 0),
}

export const cropCycleUtils = {
  getById: (id: string, cycles: CropCycle[] = DEMO_CROP_CYCLES) => cycles.find(c => c.id === id),
  getByBlocId: (blocId: string, cycles: CropCycle[] = DEMO_CROP_CYCLES) => cycles.filter(c => c.blocId === blocId),
  getActive: (cycles: CropCycle[] = DEMO_CROP_CYCLES) => cycles.filter(c => c.status === 'active'),
  getActiveByCycle: (blocId: string, cycles: CropCycle[] = DEMO_CROP_CYCLES) => 
    cycles.find(c => c.blocId === blocId && c.status === 'active'),
}

export const fieldOperationUtils = {
  getById: (id: string, operations: FieldOperation[] = DEMO_FIELD_OPERATIONS) => operations.find(o => o.id === id),
  getByCropCycleId: (cropCycleId: string, operations: FieldOperation[] = DEMO_FIELD_OPERATIONS) => 
    operations.filter(o => o.cropCycleId === cropCycleId),
  getByBlocId: (blocId: string, operations: FieldOperation[] = DEMO_FIELD_OPERATIONS) => 
    operations.filter(o => o.blocId === blocId),
}

export const workPackageUtils = {
  getById: (id: string, packages: WorkPackage[] = DEMO_WORK_PACKAGES) => packages.find(p => p.id === id),
  getByOperationId: (operationId: string, packages: WorkPackage[] = DEMO_WORK_PACKAGES) =>
    packages.filter(p => p.fieldOperationId === operationId),
}

// BlocData interface for comprehensive bloc information
export interface BlocData {
  bloc: Bloc
  cropCycles: CropCycle[]
  activeCropCycle: CropCycle | null
  fieldOperations: FieldOperation[]
  workPackages: WorkPackage[]
  lastUpdated: string
}
