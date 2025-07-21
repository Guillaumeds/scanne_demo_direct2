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
      // Check if data already exists - but also check if blocs have valid coordinates
      const existingFarms = DemoStorage.get<Farm[]>(STORAGE_KEYS.FARMS)
      const existingBlocs = DemoStorage.get<any[]>(STORAGE_KEYS.BLOCS)

      // Check if existing blocs have valid coordinates
      const blocsHaveValidCoords = existingBlocs && existingBlocs.length > 0 &&
                                   existingBlocs.some(bloc =>
                                     bloc.coordinates &&
                                     Array.isArray(bloc.coordinates) &&
                                     bloc.coordinates.length > 0
                                   )

      console.log('🔍 Checking existing data:', {
        existingFarms: existingFarms?.length || 0,
        existingBlocs: existingBlocs?.length || 0,
        farmsExists: !!existingFarms,
        blocsExists: !!existingBlocs,
        blocsHaveValidCoords,
        willInitialize: !existingFarms || !blocsHaveValidCoords
      })

      // Initialize if no farms OR if blocs don't have valid coordinates
      if (!existingFarms || !blocsHaveValidCoords) {
        if (!existingFarms) {
          console.log('🔄 No existing farms found - initializing demo data...')
        } else {
          console.log('🔄 Existing blocs have invalid coordinates - reinitializing demo data...')
        }
        console.log('🔄 Initializing demo data...')

        try {
          // Load initial data - use new comprehensive Mauritius demo data
          console.log('📦 Loading demo data modules...')
          const [
            { DEMO_COMPANIES },
            { DEMO_FARMS },
            { generateCompleteMauritiusDemoData }
          ] = await Promise.all([
            import('../data/transactional/farms'),
            import('../data/transactional/farms'),
            import('../services/mauritiusDemoDataGenerator')
          ])
          console.log('✅ Demo data modules loaded successfully')

          // Generate comprehensive Mauritius demo data
          console.log('🏭 Generating comprehensive Mauritius demo data...')
          const comprehensiveData = generateCompleteMauritiusDemoData()
          console.log('✅ Demo data generated:', {
            blocs: comprehensiveData.blocs?.length || 0,
            cropCycles: comprehensiveData.cropCycles?.length || 0,
            fieldOperations: comprehensiveData.fieldOperations?.length || 0,
            workPackages: comprehensiveData.workPackages?.length || 0
          })

        // Debug: Check first bloc coordinates before storage
        if (comprehensiveData.blocs && comprehensiveData.blocs.length > 0) {
          const firstBloc = comprehensiveData.blocs[0]
          console.log('🔍 First bloc before storage:', {
            name: firstBloc.name,
            coordinatesCount: firstBloc.coordinates?.length || 0,
            firstCoord: firstBloc.coordinates?.[0],
            hasWKT: !!firstBloc.coordinates_wkt,
            wktPreview: firstBloc.coordinates_wkt?.substring(0, 50) + '...'
          })
        }

        // Store initial data with new comprehensive data
        console.log('💾 Storing demo data to localStorage...')
        try {
          DemoStorage.set(STORAGE_KEYS.COMPANIES, DEMO_COMPANIES)
          console.log(`✅ Stored ${DEMO_COMPANIES.length} companies`)

          DemoStorage.set(STORAGE_KEYS.FARMS, DEMO_FARMS)
          console.log(`✅ Stored ${DEMO_FARMS.length} farms`)

          DemoStorage.set(STORAGE_KEYS.BLOCS, comprehensiveData.blocs)
          console.log(`✅ Stored ${comprehensiveData.blocs?.length || 0} blocs`)

          DemoStorage.set(STORAGE_KEYS.CROP_CYCLES, comprehensiveData.cropCycles)
          console.log(`✅ Stored ${comprehensiveData.cropCycles?.length || 0} crop cycles`)

          DemoStorage.set(STORAGE_KEYS.FIELD_OPERATIONS, comprehensiveData.fieldOperations)
          console.log(`✅ Stored ${comprehensiveData.fieldOperations?.length || 0} field operations`)

          DemoStorage.set(STORAGE_KEYS.WORK_PACKAGES, comprehensiveData.workPackages)
          console.log(`✅ Stored ${comprehensiveData.workPackages?.length || 0} work packages`)
        } catch (storageError) {
          console.error('❌ Error storing demo data:', storageError)
          throw storageError
        }

        // Debug: Check first bloc coordinates after storage
        const storedBlocs = DemoStorage.get<any[]>(STORAGE_KEYS.BLOCS)
        if (storedBlocs && storedBlocs.length > 0) {
          const firstStoredBloc = storedBlocs[0]
          console.log('🔍 First bloc after storage:', {
            name: firstStoredBloc.name,
            coordinatesCount: firstStoredBloc.coordinates?.length || 0,
            firstCoord: firstStoredBloc.coordinates?.[0],
            hasWKT: !!firstStoredBloc.coordinates_wkt,
            wktPreview: firstStoredBloc.coordinates_wkt?.substring(0, 50) + '...'
          })
        }

        console.log('✅ Comprehensive Mauritius demo data initialized successfully:', {
          blocs: comprehensiveData.blocs?.length || 0,
          cropCycles: comprehensiveData.cropCycles?.length || 0,
          fieldOperations: comprehensiveData.fieldOperations?.length || 0,
          workPackages: comprehensiveData.workPackages?.length || 0
        })

        } catch (initError) {
          console.error('❌ Error during demo data initialization:', initError)
          console.error('Stack trace:', (initError as Error).stack)
          throw initError
        }
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

    // Debug: Check first bloc coordinates when retrieved
    if (blocs.length > 0) {
      const firstBloc = blocs[0]
      const coords = firstBloc.coordinates
      const isArrayCoords = Array.isArray(coords)
      console.log('🔍 First bloc when retrieved from storage:', {
        name: firstBloc.name,
        coordinatesCount: isArrayCoords ? coords.length : 1,
        firstCoord: isArrayCoords ? coords[0] : coords,
        hasWKT: false, // coordinates_wkt doesn't exist in Bloc type
        wktPreview: 'N/A',
        isSquare: isArrayCoords && coords.length === 5 &&
                  coords[0] && coords[1] && coords[2] && coords[3] &&
                  Math.abs(coords[0][0] - coords[3][0]) < 0.001 &&
                  Math.abs(coords[1][1] - coords[2][1]) < 0.001
      })
    }

    const activeBlocs = blocs // Remove status filter since Bloc type doesn't have status property
    console.log(`📍 Returning ${activeBlocs.length} active blocs`)

    return this.simulateResponse(activeBlocs)
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
    const farmBlocs = blocs.filter(b => b.farmId === farmId) // Use farmId instead of farm_id, remove status filter
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

    const blocCropCycles = cropCycles.filter(c => c.bloc_id === blocId)
    const activeCropCycle = blocCropCycles.find(c => c.status === 'active') || null

    // Fix: Filter operations by crop cycle IDs, not bloc ID directly
    const cropCycleIds = blocCropCycles.map(c => c.id)
    const blocFieldOperations = fieldOperations.filter(o => cropCycleIds.includes(o.crop_cycle_uuid))
    const blocWorkPackages = workPackages.filter(p =>
      blocFieldOperations.some(o => o.uuid === p.field_operation_uuid)
    )

    console.log('🔍 Operations filtering debug:', {
      blocId,
      cropCyclesFound: blocCropCycles.length,
      cropCycleIds,
      operationsFound: blocFieldOperations.length,
      workPackagesFound: blocWorkPackages.length
    })

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

    // Get demo data directly from storage with safety checks
    const cropCyclesData = DemoStorage.get<CropCycle[]>(STORAGE_KEYS.CROP_CYCLES) || []
    const fieldOperationsData = DemoStorage.get<FieldOperation[]>(STORAGE_KEYS.FIELD_OPERATIONS) || []
    const workPackagesData = DemoStorage.get<WorkPackage[]>(STORAGE_KEYS.WORK_PACKAGES) || []

    // Ensure data is arrays
    const cropCycles = Array.isArray(cropCyclesData) ? cropCyclesData : []
    const fieldOperations = Array.isArray(fieldOperationsData) ? fieldOperationsData : []
    const workPackages = Array.isArray(workPackagesData) ? workPackagesData : []

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
      field_id: `field-${Date.now()}`,
      name: blocData.name,
      area: blocData.area,
      location: null,
      soil_type: blocData.soilType || 'Clay',
      irrigation_type: null,
      slope_percentage: null,
      drainage_status: null,
      last_soil_test_date: null,
      ph_level: null,
      organic_matter_percentage: null,
      active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      coordinates: blocData.coordinates,
      uuid: `bloc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      farmId: blocData.farmId,
      // irrigationMethod: blocData.irrigationMethod || 'Drip irrigation', // Property not in Bloc schema
      // accessRoad: blocData.accessRoad ?? true, // Property not in Bloc schema
      // active: true, // Property not in Bloc schema
      // notes: blocData.notes || '', // Property not in Bloc schema
      // createdAt: new Date().toISOString(), // Property not in Bloc schema
      // updatedAt: new Date().toISOString(), // Property not in Bloc schema
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

  /**
   * Force refresh with new comprehensive data
   */
  static async refreshWithNewData(): Promise<ApiResponse<void>> {
    console.log('🔄 Forcing refresh with new comprehensive Mauritius data...')
    DemoStorage.clear()
    await this.initializeData()
    // Also clear React Query cache if available
    if (typeof window !== 'undefined' && (window as any).queryClient) {
      (window as any).queryClient.clear()
    }
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
    const activeCycle = cropCycles.find(c => c.bloc_id === blocId && c.status === 'active') || null
    return this.simulateResponse(activeCycle)
  }

  static async getCropCycleHistory(blocId: string): Promise<ApiResponse<CropCycle[]>> {
    await this.initializeData()
    const cropCycles = DemoStorage.get<CropCycle[]>(STORAGE_KEYS.CROP_CYCLES) || []
    const history = cropCycles.filter(c => c.bloc_id === blocId && c.status === 'closed')
    return this.simulateResponse(history)
  }

  static async getCropCyclesForBloc(blocId: string): Promise<ApiResponse<CropCycle[]>> {
    await this.initializeData()
    const cropCycles = DemoStorage.get<CropCycle[]>(STORAGE_KEYS.CROP_CYCLES) || []
    const blocCycles = cropCycles.filter(c => c.bloc_id === blocId)
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
      const activeCycle = cropCycles.find(c => c.bloc_id === blocId && c.status === 'active')
      summaries[blocId] = {
        blocId,
        blocStatus: 'active',
        hasActiveCycle: !!activeCycle,
        cycleType: activeCycle?.type,
        varietyName: activeCycle?.sugarcane_variety_id,
        cycleNumber: activeCycle?.cycle_number,
        plannedHarvestDate: activeCycle?.planned_harvest_date,
        growthStage: activeCycle?.growth_stage,
        daysSincePlanting: activeCycle?.days_since_planting || 0
      }
    }

    return summaries
  }

  static async createCropCycle(cycleData: any): Promise<ApiResponse<CropCycle>> {
    await this.initializeData()

    const cropCycles = DemoStorage.get<CropCycle[]>(STORAGE_KEYS.CROP_CYCLES) || []
    const newCycle: CropCycle = {
      id: `cycle-${Date.now()}`,
      bloc_id: cycleData.bloc_id,
      type: cycleData.type || 'plantation',
      cycle_number: 1,
      status: 'active',
      sugarcane_variety_id: cycleData.sugarcaneVarietyId,
      intercrop_variety_id: cycleData.intercropVarietyId || null,
      planting_date: cycleData.plantingDate || new Date().toISOString(),
      planned_harvest_date: cycleData.plannedHarvestDate || new Date().toISOString(),
      actual_harvest_date: null,
      expected_yield_tons_ha: cycleData.expectedYield || 80,
      actual_yield_tons_ha: null,
      estimated_total_cost: 0,
      actual_total_cost: null,
      total_revenue: null,
      sugarcane_revenue: null,
      intercrop_revenue: null,
      net_profit: null,
      profit_per_hectare: null,
      profit_margin_percent: null,
      growth_stage: 'planted',
      days_since_planting: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    const updatedCycles = [...cropCycles, newCycle]
    DemoStorage.set(STORAGE_KEYS.CROP_CYCLES, updatedCycles)

    return this.simulateResponse(newCycle, 100)
  }

  static async createFieldOperation(operationData: any): Promise<ApiResponse<FieldOperation>> {
    await this.initializeData()

    const fieldOperations = DemoStorage.get<FieldOperation[]>(STORAGE_KEYS.FIELD_OPERATIONS) || []
    const newOperation: FieldOperation = {
      uuid: `operation-${Date.now()}`,
      crop_cycle_uuid: operationData.crop_cycle_uuid,
      operation_name: operationData.operationName || 'New Operation',
      operation_type: operationData.type || 'cultivation',
      method: operationData.method || 'standard',
      priority: 'normal',
      planned_start_date: operationData.plannedStartDate || new Date().toISOString().split('T')[0],
      planned_end_date: operationData.plannedEndDate || new Date().toISOString().split('T')[0],
      actual_start_date: null,
      actual_end_date: null,
      planned_area_hectares: null,
      actual_area_hectares: null,
      planned_quantity: null,
      actual_quantity: null,
      status: 'planned',
      completion_percentage: 0,
      estimated_total_cost: 0,
      actual_total_cost: null,
      // weather_conditions: null, // Property not in FieldOperation schema
      // temperature_celsius: null, // Property not in FieldOperation schema
      // humidity_percent: null, // Property not in FieldOperation schema
      // wind_speed_kmh: null, // Property not in FieldOperation schema
      // notes: null, // Property not in FieldOperation schema
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const updatedOperations = [...fieldOperations, newOperation]
    DemoStorage.set(STORAGE_KEYS.FIELD_OPERATIONS, updatedOperations)

    return this.simulateResponse(newOperation, 100)
  }

  static async createWorkPackage(workPackageData: any): Promise<ApiResponse<WorkPackage>> {
    await this.initializeData()

    const workPackages = DemoStorage.get<WorkPackage[]>(STORAGE_KEYS.WORK_PACKAGES) || []
    const newWorkPackage: WorkPackage = {
      uuid: `work-package-${Date.now()}`,
      field_operation_uuid: workPackageData.fieldOperationId,
      package_name: null,
      work_date: workPackageData.date || new Date().toISOString().split('T')[0],
      shift: 'day',
      planned_area_hectares: workPackageData.area || null,
      actual_area_hectares: null,
      planned_quantity: null,
      actual_quantity: null,
      status: 'not-started',
      start_time: null,
      end_time: null,
      duration_hours: workPackageData.hours || null,
      weather_conditions: null,
      temperature_celsius: null,
      humidity_percent: null,
      wind_speed_kmh: null,
      notes: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const updatedWorkPackages = [...workPackages, newWorkPackage]
    DemoStorage.set(STORAGE_KEYS.WORK_PACKAGES, updatedWorkPackages)

    return this.simulateResponse(newWorkPackage, 100)
  }
}
