/**
 * Mock API Service
 * Demo-only API service following TanStack Query best practices
 * Provides realistic API simulation with localStorage persistence
 */

import { DemoStorage } from './demoStorage'
import type { Farm, Company } from '../data/transactional/farms'
import type { Bloc } from '../data/transactional/blocs'
import type { SugarcaneVariety } from '../data/master/sugarcaneVarieties'
import type { Product } from '../data/master/products'
import type { Labour } from '../data/master/labour'
import type { Equipment } from '../data/master/equipment'
import type { CropCycle, FieldOperation, WorkPackage } from '@/schemas/apiSchemas'

// Storage keys for different data types
const STORAGE_KEYS = {
  COMPANIES: 'companies',
  FARMS: 'farms',
  BLOCS: 'blocs',
  CROP_CYCLES: 'crop_cycles',
  FIELD_OPERATIONS: 'field_operations',
  WORK_PACKAGES: 'work_packages',
  FILTERS: 'filters',
  SELECTIONS: 'selections',
} as const

// API response types
export interface ApiResponse<T> {
  data: T
  success: boolean
  message?: string
  timestamp: string
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface FarmGISInitialData {
  companies: Company[]
  farms: Farm[]
  blocs: Bloc[]
  cropCycles: CropCycle[]
  activeCropCycles: CropCycle[]
  fieldOperations: FieldOperation[]
  workPackages: WorkPackage[]
  products: Product[]
  labour: Labour[]
  equipment: Equipment[]
  varieties: SugarcaneVariety[]
  lastUpdated: string
}

export interface BlocData {
  bloc: Bloc
  cropCycles: CropCycle[]
  activeCropCycle: CropCycle | null
  fieldOperations: FieldOperation[]
  workPackages: WorkPackage[]
  lastUpdated: string
}

export class MockApiService {
  private static simulateDelay = 0 // No delays for demo mode

  /**
   * Simulate API response with realistic structure - NO DELAYS
   */
  private static async simulateResponse<T>(
    data: T,
    delay: number = 0 // Always 0 delay
  ): Promise<ApiResponse<T>> {
    // No delays - return immediately
    return {
      data,
      success: true,
      timestamp: new Date().toISOString(),
    }
  }

  /**
   * Initialize demo data if not exists
   */
  static async initializeData(): Promise<void> {
    try {
      // Check if data already exists
      const existingFarms = DemoStorage.get<Farm[]>(STORAGE_KEYS.FARMS)
      
      if (!existingFarms) {
        console.log('Initializing demo data...')
        
        // Load initial data
        const [
          { DEMO_COMPANIES },
          { DEMO_FARMS },
          { DEMO_BLOCS, DEMO_CROP_CYCLES, DEMO_FIELD_OPERATIONS, DEMO_WORK_PACKAGES }
        ] = await Promise.all([
          import('../data/transactional/farms'),
          import('../data/transactional/farms'),
          import('../data/transactional/blocs')
        ])

        // Store initial data
        DemoStorage.set(STORAGE_KEYS.COMPANIES, DEMO_COMPANIES)
        DemoStorage.set(STORAGE_KEYS.FARMS, DEMO_FARMS)
        DemoStorage.set(STORAGE_KEYS.BLOCS, DEMO_BLOCS)
        DemoStorage.set(STORAGE_KEYS.CROP_CYCLES, DEMO_CROP_CYCLES)
        DemoStorage.set(STORAGE_KEYS.FIELD_OPERATIONS, DEMO_FIELD_OPERATIONS)
        DemoStorage.set(STORAGE_KEYS.WORK_PACKAGES, DEMO_WORK_PACKAGES)

        console.log('Demo data initialized successfully')
      }
    } catch (error) {
      console.error('Failed to initialize demo data:', error)
      throw new Error('Demo initialization failed')
    }
  }

  /**
   * Master Data API Methods
   */
  static async getProducts(): Promise<ApiResponse<Product[]>> {
    const { PRODUCTS } = await import('../data/master/products')
    return this.simulateResponse(PRODUCTS.filter(p => p.active))
  }

  static async getLabourTypes(): Promise<ApiResponse<Labour[]>> {
    const { LABOUR_TYPES } = await import('../data/master/labour')
    return this.simulateResponse(LABOUR_TYPES.filter(l => l.active))
  }

  static async getEquipmentTypes(): Promise<ApiResponse<Equipment[]>> {
    const { EQUIPMENT_TYPES } = await import('../data/master/equipment')
    return this.simulateResponse(EQUIPMENT_TYPES.filter(e => e.active))
  }

  static async getSugarcaneVarieties(): Promise<ApiResponse<SugarcaneVariety[]>> {
    const { SUGARCANE_VARIETIES } = await import('../data/master/sugarcaneVarieties')
    return this.simulateResponse(SUGARCANE_VARIETIES.filter(v => v.active))
  }

  /**
   * Transactional Data API Methods
   */
  static async getCompanies(): Promise<ApiResponse<Company[]>> {
    await this.initializeData()
    const companies = DemoStorage.get<Company[]>(STORAGE_KEYS.COMPANIES) || []
    return this.simulateResponse(companies.filter(c => c.active))
  }

  static async getFarms(): Promise<ApiResponse<Farm[]>> {
    await this.initializeData()
    const farms = DemoStorage.get<Farm[]>(STORAGE_KEYS.FARMS) || []
    return this.simulateResponse(farms.filter(f => f.active))
  }

  static async getFarmById(farmId: string): Promise<ApiResponse<Farm>> {
    await this.initializeData()
    const farms = DemoStorage.get<Farm[]>(STORAGE_KEYS.FARMS) || []
    const farm = farms.find(f => f.id === farmId)
    
    if (!farm) {
      throw new Error(`Farm ${farmId} not found`)
    }
    
    return this.simulateResponse(farm)
  }

  static async getFarmsByCompany(companyId: string): Promise<ApiResponse<Farm[]>> {
    await this.initializeData()
    const farms = DemoStorage.get<Farm[]>(STORAGE_KEYS.FARMS) || []
    const companyFarms = farms.filter(f => f.companyId === companyId && f.active)
    return this.simulateResponse(companyFarms)
  }

  /**
   * Get all blocs
   */
  static async getBlocs(): Promise<ApiResponse<Bloc[]>> {
    await this.initializeData()
    const blocs = DemoStorage.get<Bloc[]>(STORAGE_KEYS.BLOCS) || []
    return this.simulateResponse(blocs.filter(b => b.active))
  }

  static async getBlocById(blocId: string): Promise<ApiResponse<Bloc>> {
    await this.initializeData()
    const blocs = DemoStorage.get<Bloc[]>(STORAGE_KEYS.BLOCS) || []

    console.log('🔍 MockApiService: Searching for bloc:', {
      blocId,
      availableBlocs: blocs.map(b => ({ id: b.id, uuid: b.uuid, name: b.name }))
    })

    const bloc = blocs.find(b => b.id === blocId || b.uuid === blocId)

    if (!bloc) {
      console.error('❌ MockApiService: Bloc not found:', blocId)
      throw new Error(`Bloc ${blocId} not found`)
    }

    console.log('✅ MockApiService: Bloc found:', { id: bloc.id, uuid: bloc.uuid, name: bloc.name })
    return this.simulateResponse(bloc)
  }

  static async getBlocsByFarm(farmId: string): Promise<ApiResponse<Bloc[]>> {
    await this.initializeData()
    const blocs = DemoStorage.get<Bloc[]>(STORAGE_KEYS.BLOCS) || []
    const farmBlocs = blocs.filter(b => b.farmId === farmId && b.active)
    return this.simulateResponse(farmBlocs)
  }

  /**
   * Get comprehensive bloc data (for BlocScreen)
   */
  static async getComprehensiveBlocData(blocId: string): Promise<ApiResponse<BlocData>> {
    console.log('🔍 MockApiService: Loading comprehensive bloc data for:', blocId)
    await this.initializeData()

    const [
      blocResponse,
      cropCycles,
      fieldOperations,
      workPackages
    ] = await Promise.all([
      this.getBlocById(blocId),
      DemoStorage.get<CropCycle[]>(STORAGE_KEYS.CROP_CYCLES) || [],
      DemoStorage.get<FieldOperation[]>(STORAGE_KEYS.FIELD_OPERATIONS) || [],
      DemoStorage.get<WorkPackage[]>(STORAGE_KEYS.WORK_PACKAGES) || []
    ])

    console.log('📊 Bloc data loaded:', {
      blocId,
      blocFound: !!blocResponse.data,
      cropCyclesCount: cropCycles.length,
      fieldOperationsCount: fieldOperations.length,
      workPackagesCount: workPackages.length
    })

    const blocCropCycles = cropCycles.filter(c => c.blocId === blocId)
    const activeCropCycle = blocCropCycles.find(c => c.status === 'active') || null
    const blocFieldOperations = fieldOperations.filter(o => o.blocId === blocId)
    const blocWorkPackages = workPackages.filter(p =>
      blocFieldOperations.some(o => o.id === p.fieldOperationId)
    )

    const data: BlocData = {
      bloc: blocResponse.data,
      cropCycles: blocCropCycles,
      activeCropCycle,
      fieldOperations: blocFieldOperations,
      workPackages: blocWorkPackages,
      lastUpdated: new Date().toISOString(),
    }

    return this.simulateResponse(data)
  }

  /**
   * Legacy compatibility method
   */
  static async getFarmGISInitialData(): Promise<ApiResponse<FarmGISInitialData>> {
    await this.initializeData()

    const [
      companiesResponse,
      farmsResponse,
      blocsResponse,
      productsResponse,
      labourResponse,
      equipmentResponse,
      varietiesResponse
    ] = await Promise.all([
      this.getCompanies(),
      this.getFarms(),
      this.getBlocs(),
      this.getProducts(),
      this.getLabourTypes(),
      this.getEquipmentTypes(),
      this.getSugarcaneVarieties()
    ])

    // Get demo data directly from storage
    const cropCycles = DemoStorage.get<CropCycle[]>(STORAGE_KEYS.CROP_CYCLES) || []
    const fieldOperations = DemoStorage.get<FieldOperation[]>(STORAGE_KEYS.FIELD_OPERATIONS) || []
    const workPackages = DemoStorage.get<WorkPackage[]>(STORAGE_KEYS.WORK_PACKAGES) || []

    const activeCropCycles = cropCycles.filter(c => c.status === 'active')

    const data: FarmGISInitialData = {
      companies: companiesResponse.data,
      farms: farmsResponse.data,
      blocs: blocsResponse.data,
      cropCycles,
      activeCropCycles,
      fieldOperations,
      workPackages,
      products: productsResponse.data,
      labour: labourResponse.data,
      equipment: equipmentResponse.data,
      varieties: varietiesResponse.data,
      lastUpdated: new Date().toISOString(),
    }

    return this.simulateResponse(data)
  }

  /**
   * Session Data API Methods
   */
  static async getFilters(): Promise<ApiResponse<any>> {
    const filters = DemoStorage.get(STORAGE_KEYS.FILTERS) || {
      farmId: null,
      blocId: null,
      cropCycleId: null,
      dateRange: null,
    }
    return this.simulateResponse(filters)
  }

  static async setFilters(filters: any): Promise<ApiResponse<any>> {
    DemoStorage.set(STORAGE_KEYS.FILTERS, filters)
    return this.simulateResponse(filters)
  }

  static async getSelections(): Promise<ApiResponse<any>> {
    const selections = DemoStorage.get(STORAGE_KEYS.SELECTIONS) || {
      selectedFarms: [],
      selectedBlocs: [],
      selectedCropCycles: [],
    }
    return this.simulateResponse(selections)
  }

  static async setSelections(selections: any): Promise<ApiResponse<any>> {
    DemoStorage.set(STORAGE_KEYS.SELECTIONS, selections)
    return this.simulateResponse(selections)
  }

  /**
   * Mutation API Methods
   */
  static async createFarm(farmData: Omit<Farm, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Farm>> {
    await this.initializeData()
    
    const farms = DemoStorage.get<Farm[]>(STORAGE_KEYS.FARMS) || []
    const newFarm: Farm = {
      ...farmData,
      id: `farm-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    
    const updatedFarms = [...farms, newFarm]
    DemoStorage.set(STORAGE_KEYS.FARMS, updatedFarms)
    
    return this.simulateResponse(newFarm, 100)
  }

  static async updateFarm(farmId: string, updates: Partial<Farm>): Promise<ApiResponse<Farm>> {
    await this.initializeData()
    
    const farms = DemoStorage.get<Farm[]>(STORAGE_KEYS.FARMS) || []
    const farmIndex = farms.findIndex(f => f.id === farmId)
    
    if (farmIndex === -1) {
      throw new Error(`Farm ${farmId} not found`)
    }
    
    const updatedFarm = {
      ...farms[farmIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    }
    
    farms[farmIndex] = updatedFarm
    DemoStorage.set(STORAGE_KEYS.FARMS, farms)
    
    return this.simulateResponse(updatedFarm, 100)
  }

  static async deleteFarm(farmId: string): Promise<ApiResponse<void>> {
    await this.initializeData()
    
    const farms = DemoStorage.get<Farm[]>(STORAGE_KEYS.FARMS) || []
    const filteredFarms = farms.filter(f => f.id !== farmId)
    
    if (filteredFarms.length === farms.length) {
      throw new Error(`Farm ${farmId} not found`)
    }
    
    DemoStorage.set(STORAGE_KEYS.FARMS, filteredFarms)
    
    return this.simulateResponse(undefined, 100)
  }

  /**
   * Bloc Creation Methods
   */
  static async createBloc(blocData: {
    name: string
    farmId: string
    coordinates: [number, number][]
    area: number
    soilType?: string
    elevation?: number
    slope?: number
    drainageClass?: string
    irrigationMethod?: string
    accessRoad?: boolean
    notes?: string
  }): Promise<ApiResponse<Bloc>> {
    await this.initializeData()

    const blocs = DemoStorage.get<Bloc[]>(STORAGE_KEYS.BLOCS) || []
    const newBloc: Bloc = {
      id: `bloc-${Date.now()}`,
      uuid: `bloc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      localId: blocData.name,
      name: blocData.name,
      farmId: blocData.farmId,
      area: blocData.area,
      coordinates: blocData.coordinates,
      soilType: blocData.soilType || 'Clay',
      elevation: blocData.elevation || 100,
      slope: blocData.slope || 2,
      drainageClass: blocData.drainageClass || 'Well drained',
      irrigationMethod: blocData.irrigationMethod || 'Drip irrigation',
      accessRoad: blocData.accessRoad ?? true,
      active: true,
      notes: blocData.notes || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    blocs.push(newBloc)
    DemoStorage.set(STORAGE_KEYS.BLOCS, blocs)

    return this.simulateResponse(newBloc, 100)
  }

  static async updateBloc(blocId: string, updates: Partial<Bloc>): Promise<ApiResponse<Bloc>> {
    await this.initializeData()

    const blocs = DemoStorage.get<Bloc[]>(STORAGE_KEYS.BLOCS) || []
    const blocIndex = blocs.findIndex(b => b.id === blocId || b.uuid === blocId)

    if (blocIndex === -1) {
      throw new Error(`Bloc ${blocId} not found`)
    }

    const updatedBloc = {
      ...blocs[blocIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    }

    blocs[blocIndex] = updatedBloc
    DemoStorage.set(STORAGE_KEYS.BLOCS, blocs)

    return this.simulateResponse(updatedBloc, 100)
  }

  static async deleteBloc(blocId: string): Promise<ApiResponse<void>> {
    await this.initializeData()

    const blocs = DemoStorage.get<Bloc[]>(STORAGE_KEYS.BLOCS) || []
    const filteredBlocs = blocs.filter(b => b.id !== blocId && b.uuid !== blocId)

    if (filteredBlocs.length === blocs.length) {
      throw new Error(`Bloc ${blocId} not found`)
    }

    DemoStorage.set(STORAGE_KEYS.BLOCS, filteredBlocs)
    return this.simulateResponse(undefined)
  }

  /**
   * Utility Methods
   */
  static async resetData(): Promise<ApiResponse<void>> {
    DemoStorage.clear()
    await this.initializeData()
    return this.simulateResponse(undefined)
  }

  static async exportData(): Promise<string> {
    return DemoStorage.exportData()
  }

  static async importData(jsonData: string): Promise<ApiResponse<void>> {
    DemoStorage.importData(jsonData)
    return this.simulateResponse(undefined)
  }

  static getStorageStats() {
    return DemoStorage.getUsageStats()
  }

  /**
   * Crop Cycle Management Methods
   */
  static async getActiveCropCycle(blocId: string): Promise<ApiResponse<CropCycle | null>> {
    await this.initializeData()
    const cropCycles = DemoStorage.get<CropCycle[]>(STORAGE_KEYS.CROP_CYCLES) || []
    const activeCycle = cropCycles.find(c => c.blocId === blocId && c.status === 'active') || null
    return this.simulateResponse(activeCycle)
  }

  static async getCropCycleHistory(blocId: string): Promise<ApiResponse<CropCycle[]>> {
    await this.initializeData()
    const cropCycles = DemoStorage.get<CropCycle[]>(STORAGE_KEYS.CROP_CYCLES) || []
    const history = cropCycles.filter(c => c.blocId === blocId && c.status === 'closed')
    return this.simulateResponse(history)
  }

  static async getCropCyclesForBloc(blocId: string): Promise<ApiResponse<CropCycle[]>> {
    await this.initializeData()
    const cropCycles = DemoStorage.get<CropCycle[]>(STORAGE_KEYS.CROP_CYCLES) || []
    const blocCycles = cropCycles.filter(c => c.blocId === blocId)
    return this.simulateResponse(blocCycles)
  }

  static async getCropCycleById(cycleId: string): Promise<ApiResponse<CropCycle | null>> {
    await this.initializeData()
    const cropCycles = DemoStorage.get<CropCycle[]>(STORAGE_KEYS.CROP_CYCLES) || []
    const cycle = cropCycles.find(c => c.id === cycleId) || null
    return this.simulateResponse(cycle)
  }

  static async getBlocSummariesBatch(blocIds: string[]): Promise<Record<string, any>> {
    await this.initializeData()
    const cropCycles = DemoStorage.get<CropCycle[]>(STORAGE_KEYS.CROP_CYCLES) || []

    const summaries: Record<string, any> = {}

    for (const blocId of blocIds) {
      const activeCycle = cropCycles.find(c => c.blocId === blocId && c.status === 'active')
      summaries[blocId] = {
        blocId,
        blocStatus: 'active',
        hasActiveCycle: !!activeCycle,
        cycleType: activeCycle?.type,
        varietyName: activeCycle?.sugarcaneVarietyName,
        cycleNumber: activeCycle?.cycleNumber,
        plannedHarvestDate: activeCycle?.plannedHarvestDate,
        growthStage: activeCycle?.growthStage,
        daysSincePlanting: activeCycle?.daysSincePlanting || 0
      }
    }

    return summaries
  }

  static async createCropCycle(cycleData: any): Promise<ApiResponse<CropCycle>> {
    await this.initializeData()

    const cropCycles = DemoStorage.get<CropCycle[]>(STORAGE_KEYS.CROP_CYCLES) || []
    const newCycle: CropCycle = {
      id: `cycle-${Date.now()}`,
      blocId: cycleData.blocId,
      type: cycleData.type || 'plantation',
      cycleNumber: 1,
      status: 'active',
      sugarcaneVarietyId: cycleData.sugarcaneVarietyId,
      sugarcaneVarietyName: cycleData.sugarcaneVarietyName || 'Unknown Variety',
      intercropVarietyId: cycleData.intercropVarietyId || null,
      intercropVarietyName: cycleData.intercropVarietyName || null,
      plantingDate: cycleData.plantingDate || new Date().toISOString(),
      plannedHarvestDate: cycleData.plannedHarvestDate || new Date().toISOString(),
      expectedYield: cycleData.expectedYield || 0,
      actualYield: undefined,
      revenue: 0,
      estimatedTotalCost: 0,
      actualTotalCost: 0,
      netProfit: 0,
      profitPerHectare: 0,
      profitMarginPercent: 0,
      growthStage: 'planted',
      growthStageUpdatedAt: new Date().toISOString(),
      daysSincePlanting: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const updatedCycles = [...cropCycles, newCycle]
    DemoStorage.set(STORAGE_KEYS.CROP_CYCLES, updatedCycles)

    return this.simulateResponse(newCycle, 100)
  }

  static async createFieldOperation(operationData: any): Promise<ApiResponse<FieldOperation>> {
    await this.initializeData()

    const fieldOperations = DemoStorage.get<FieldOperation[]>(STORAGE_KEYS.FIELD_OPERATIONS) || []
    const newOperation: FieldOperation = {
      id: `operation-${Date.now()}`,
      cropCycleId: operationData.cropCycleId,
      blocId: operationData.blocId,
      type: operationData.type || 'cultivation',
      method: operationData.method || 'standard',
      status: 'planned',
      plannedStartDate: operationData.plannedStartDate || new Date().toISOString(),
      plannedEndDate: operationData.plannedEndDate || new Date().toISOString(),
      plannedArea: operationData.plannedArea || 0,
      progress: 0,
      estimatedCost: operationData.estimatedCost || 0,
      actualCost: 0,
      labourRequired: [],
      equipmentRequired: [],
      productsUsed: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    const updatedOperations = [...fieldOperations, newOperation]
    DemoStorage.set(STORAGE_KEYS.FIELD_OPERATIONS, updatedOperations)

    return this.simulateResponse(newOperation, 100)
  }

  static async createWorkPackage(workPackageData: any): Promise<ApiResponse<WorkPackage>> {
    await this.initializeData()

    const workPackages = DemoStorage.get<WorkPackage[]>(STORAGE_KEYS.WORK_PACKAGES) || []
    const newWorkPackage: WorkPackage = {
      id: `work-package-${Date.now()}`,
      fieldOperationId: workPackageData.fieldOperationId,
      date: workPackageData.date || new Date().toISOString(),
      area: workPackageData.area || 0,
      hours: workPackageData.hours || 0,
      cost: workPackageData.cost || 0,
      crew: workPackageData.crew || '',
      equipment: workPackageData.equipment || '',
      status: 'planned',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    const updatedWorkPackages = [...workPackages, newWorkPackage]
    DemoStorage.set(STORAGE_KEYS.WORK_PACKAGES, updatedWorkPackages)

    return this.simulateResponse(newWorkPackage, 100)
  }
}
