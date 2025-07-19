/**
 * Demo Data Service
 * Provides static demo data for the application without database dependencies
 * Uses localStorage as the persistence layer with TanStack Query caching
 */

import { z } from 'zod'
import type {
  FarmGISInitialData,
  BlocData,
  CropCycle,
  FieldOperation,
  WorkPackage,
  CreateCropCycleRequest,
  CreateFieldOperationRequest,
  CreateWorkPackageRequest,
} from '@/schemas/apiSchemas'

// Demo data storage key
const DEMO_DATA_KEY = 'scanne_demo_data'
const DEMO_VERSION_KEY = 'scanne_demo_version'
const CURRENT_DEMO_VERSION = '1.0.0'

// Type-safe localStorage wrapper
class DemoStorage {
  static get<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : null
    } catch {
      return null
    }
  }

  static set<T>(key: string, value: T): void {
    try {
      const jsonString = JSON.stringify(value)
      console.log(`Setting localStorage key: ${key}, size: ${jsonString.length} chars`)
      localStorage.setItem(key, jsonString)
      console.log(`✅ Successfully saved ${key} to localStorage`)
    } catch (error) {
      console.error('❌ Failed to save to localStorage:', error)
      throw error // Re-throw to catch in initialization
    }
  }

  static remove(key: string): void {
    localStorage.removeItem(key)
  }

  static clear(): void {
    localStorage.clear()
  }
}

// Demo data structure
interface DemoDataStore {
  version: string
  farms: any[]
  blocs: any[]
  cropCycles: any[]
  fieldOperations: any[]
  workPackages: any[]
  products: any[]
  labour: any[]
  equipment: any[]
  sugarcaneVarieties: any[]
  intercropVarieties: any[]
  lastUpdated: string
}

// Initial demo data - more comprehensive and realistic
const INITIAL_DEMO_DATA: DemoDataStore = {
  version: CURRENT_DEMO_VERSION,
  farms: [
    {
      id: '550e8400-e29b-41d4-a716-446655440001',
      name: 'Omnicane Estate - North',
      company_id: '550e8400-e29b-41d4-a716-446655440000',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440002',
      name: 'Omnicane Estate - South',
      company_id: '550e8400-e29b-41d4-a716-446655440000',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    }
  ],
  blocs: [
    {
      id: '550e8400-e29b-41d4-a716-446655440010',
      name: 'Block A1',
      area_hectares: 125.5,
      coordinates_wkt: 'POLYGON((57.5 -20.3, 57.51 -20.3, 57.51 -20.31, 57.5 -20.31, 57.5 -20.3))',
      status: 'active',
      farm_id: '550e8400-e29b-41d4-a716-446655440001',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440011',
      name: 'Block B2',
      area_hectares: 98.3,
      coordinates_wkt: 'POLYGON((57.52 -20.3, 57.53 -20.3, 57.53 -20.31, 57.52 -20.31, 57.52 -20.3))',
      status: 'active',
      farm_id: '550e8400-e29b-41d4-a716-446655440001',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440012',
      name: 'Block C3',
      area_hectares: 156.8,
      coordinates_wkt: 'POLYGON((57.54 -20.32, 57.55 -20.32, 57.55 -20.33, 57.54 -20.33, 57.54 -20.32))',
      status: 'active',
      farm_id: '550e8400-e29b-41d4-a716-446655440002',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440013',
      name: 'Block D4',
      area_hectares: 89.2,
      coordinates_wkt: 'POLYGON((57.56 -20.34, 57.57 -20.34, 57.57 -20.35, 57.56 -20.35, 57.56 -20.34))',
      status: 'active',
      farm_id: '550e8400-e29b-41d4-a716-446655440002',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    }
  ],
  cropCycles: [
    {
      id: '550e8400-e29b-41d4-a716-446655440020',
      bloc_id: '550e8400-e29b-41d4-a716-446655440010',
      type: 'plantation',
      cycle_number: 1,
      status: 'active',
      sugarcane_variety_id: '550e8400-e29b-41d4-a716-446655440030',
      intercrop_variety_id: null,
      planting_date: '2024-03-15',
      planned_harvest_date: '2025-09-15',
      actual_harvest_date: null,
      expected_yield_tons_ha: 120,
      actual_yield_tons_ha: null,
      estimated_total_cost: 15000,
      actual_total_cost: null,
      total_revenue: null,
      sugarcane_revenue: null,
      intercrop_revenue: null,
      net_profit: null,
      profit_per_hectare: null,
      profit_margin_percent: null,
      growth_stage: 'tillering',
      days_since_planting: 126,
      created_at: '2024-03-15T00:00:00Z',
      updated_at: '2024-07-19T00:00:00Z'
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440021',
      bloc_id: '550e8400-e29b-41d4-a716-446655440011',
      type: 'plantation',
      cycle_number: 1,
      status: 'active',
      sugarcane_variety_id: '550e8400-e29b-41d4-a716-446655440031',
      intercrop_variety_id: null,
      planting_date: '2024-04-01',
      planned_harvest_date: '2025-08-01',
      actual_harvest_date: null,
      expected_yield_tons_ha: 110,
      actual_yield_tons_ha: null,
      estimated_total_cost: 12000,
      actual_total_cost: null,
      total_revenue: null,
      sugarcane_revenue: null,
      intercrop_revenue: null,
      net_profit: null,
      profit_per_hectare: null,
      profit_margin_percent: null,
      growth_stage: 'grand_growth',
      days_since_planting: 109,
      created_at: '2024-04-01T00:00:00Z',
      updated_at: '2024-07-19T00:00:00Z'
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440022',
      bloc_id: '550e8400-e29b-41d4-a716-446655440012',
      type: 'ratoon',
      cycle_number: 2,
      status: 'active',
      sugarcane_variety_id: '550e8400-e29b-41d4-a716-446655440030',
      intercrop_variety_id: null,
      planting_date: '2023-10-15',
      planned_harvest_date: '2025-04-15',
      actual_harvest_date: null,
      expected_yield_tons_ha: 135,
      actual_yield_tons_ha: null,
      estimated_total_cost: 18000,
      actual_total_cost: null,
      total_revenue: null,
      sugarcane_revenue: null,
      intercrop_revenue: null,
      net_profit: null,
      profit_per_hectare: null,
      profit_margin_percent: null,
      growth_stage: 'maturation',
      days_since_planting: 277,
      created_at: '2023-10-15T00:00:00Z',
      updated_at: '2024-07-19T00:00:00Z'
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440023',
      bloc_id: '550e8400-e29b-41d4-a716-446655440013',
      type: 'plantation',
      cycle_number: 1,
      status: 'closed',
      sugarcane_variety_id: '550e8400-e29b-41d4-a716-446655440032',
      intercrop_variety_id: null,
      planting_date: '2023-08-01',
      planned_harvest_date: '2024-12-01',
      actual_harvest_date: '2024-11-28',
      expected_yield_tons_ha: 105,
      actual_yield_tons_ha: 98,
      estimated_total_cost: 14000,
      actual_total_cost: 13500,
      total_revenue: 24500,
      sugarcane_revenue: 24500,
      intercrop_revenue: null,
      net_profit: 11000,
      profit_per_hectare: 123.3,
      profit_margin_percent: 44.9,
      growth_stage: 'harvested',
      days_since_planting: 485,
      created_at: '2023-08-01T00:00:00Z',
      updated_at: '2024-11-28T00:00:00Z'
    }
  ],
  fieldOperations: [
    {
      uuid: 'op-1',
      crop_cycle_uuid: 'cycle-1',
      operation_name: 'Sugarcane Planting',
      operation_type: 'planting',
      method: 'mechanical',
      priority: 'high',
      planned_start_date: '2024-03-15',
      planned_end_date: '2024-03-15',
      actual_start_date: '2024-03-15',
      actual_end_date: '2024-03-15',
      planned_area_hectares: 125.5,
      actual_area_hectares: 125.5,
      planned_quantity: null,
      actual_quantity: null,
      status: 'completed',
      completion_percentage: 100,
      estimated_total_cost: 5000,
      actual_total_cost: 4800,
      created_at: '2024-03-15T00:00:00Z',
      updated_at: '2024-03-15T00:00:00Z'
    },
    {
      uuid: 'op-2',
      crop_cycle_uuid: 'cycle-1',
      operation_name: 'First Fertilization',
      operation_type: 'fertilization',
      method: 'mechanical',
      priority: 'normal',
      planned_start_date: '2024-05-01',
      planned_end_date: '2024-05-01',
      actual_start_date: '2024-05-02',
      actual_end_date: '2024-05-02',
      planned_area_hectares: 125.5,
      actual_area_hectares: 125.5,
      planned_quantity: 500,
      actual_quantity: 500,
      status: 'completed',
      completion_percentage: 100,
      estimated_total_cost: 2500,
      actual_total_cost: 2550,
      created_at: '2024-05-01T00:00:00Z',
      updated_at: '2024-05-02T00:00:00Z'
    },
    {
      uuid: 'op-3',
      crop_cycle_uuid: 'cycle-2',
      operation_name: 'Sugarcane Planting - Block B2',
      operation_type: 'planting',
      method: 'mechanical',
      priority: 'high',
      planned_start_date: '2024-04-01',
      planned_end_date: '2024-04-01',
      actual_start_date: '2024-04-01',
      actual_end_date: '2024-04-01',
      planned_area_hectares: 98.3,
      actual_area_hectares: 98.3,
      planned_quantity: null,
      actual_quantity: null,
      status: 'completed',
      completion_percentage: 100,
      estimated_total_cost: 4000,
      actual_total_cost: 3950,
      created_at: '2024-04-01T00:00:00Z',
      updated_at: '2024-04-01T00:00:00Z'
    }
  ],
  workPackages: [
    {
      id: 'wp-1',
      crop_cycle_id: 'cycle-1',
      operation_type: 'fertilization',
      planned_date: '2024-08-15',
      status: 'planned',
      total_cost: 3200.50,
      created_at: '2024-07-15T00:00:00Z',
      updated_at: '2024-07-15T00:00:00Z'
    },
    {
      id: 'wp-2',
      crop_cycle_id: 'cycle-2',
      operation_type: 'pest_control',
      planned_date: '2024-08-01',
      status: 'in_progress',
      total_cost: 1850.00,
      created_at: '2024-07-20T00:00:00Z',
      updated_at: '2024-07-25T00:00:00Z'
    }
  ],
  products: [
    {
      id: '550e8400-e29b-41d4-a716-446655440040',
      product_id: 'NPK-15-15-15',
      name: 'NPK Fertilizer 15-15-15',
      category: 'fertilizer',
      subcategory: 'compound',
      unit: 'kg',
      cost_per_unit: 25.50,
      supplier: 'AgriSupply Ltd',
      description: 'Balanced NPK fertilizer for sugarcane cultivation',
      active: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 'product-2',
      product_id: 'GLYPH-480',
      name: 'Glyphosate Herbicide',
      category: 'herbicide',
      subcategory: 'systemic',
      unit: 'L',
      cost_per_unit: 45.00,
      supplier: 'ChemCorp',
      description: 'Non-selective systemic herbicide',
      active: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 'product-3',
      product_id: 'UREA-46',
      name: 'Urea Fertilizer',
      category: 'fertilizer',
      subcategory: 'nitrogen',
      unit: 'kg',
      cost_per_unit: 18.75,
      supplier: 'FertCorp',
      description: 'High nitrogen content fertilizer',
      active: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 'product-4',
      product_id: 'CYPER-100',
      name: 'Insecticide - Cypermethrin',
      category: 'insecticide',
      subcategory: 'pyrethroid',
      unit: 'L',
      cost_per_unit: 65.00,
      supplier: 'PestControl Inc',
      description: 'Broad-spectrum insecticide for pest control',
      active: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 'product-5',
      product_id: 'MANCO-80',
      name: 'Fungicide - Mancozeb',
      category: 'fungicide',
      subcategory: 'contact',
      unit: 'kg',
      cost_per_unit: 32.50,
      supplier: 'FungiGuard Ltd',
      description: 'Contact fungicide for disease prevention',
      active: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    }
  ],
  labour: [
    {
      id: 'labour-1',
      labour_id: 'FW-001',
      name: 'Field Worker',
      category: 'manual',
      unit: 'hour',
      cost_per_unit: 12.50,
      description: 'General field worker for manual operations',
      active: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 'labour-2',
      labour_id: 'TO-001',
      name: 'Tractor Operator',
      category: 'skilled',
      unit: 'hour',
      cost_per_unit: 18.00,
      description: 'Skilled tractor operator for mechanical operations',
      active: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    }
  ],
  equipment: [
    {
      id: 'equipment-1',
      name: 'John Deere 6120M Tractor',
      category: 'tractor',
      hourly_rate: 85.00,
      active: true,
      created_at: '2024-01-01T00:00:00Z'
    }
  ],
  sugarcaneVarieties: [
    {
      id: '550e8400-e29b-41d4-a716-446655440030',
      name: 'R579',
      description: 'High-yielding variety with excellent disease resistance',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440031',
      name: 'M1176/77',
      description: 'Medium maturity variety suitable for various soil types',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440032',
      name: 'R570',
      description: 'Premium variety with exceptional yield potential',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440033',
      name: 'M2593/92',
      description: 'Fast-growing variety ideal for quick turnaround',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    }
  ],
  intercropVarieties: [
    {
      id: 'intercrop-1',
      name: 'Sweet Potato',
      description: 'Root vegetable suitable for intercropping with sugarcane',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    }
  ],
  lastUpdated: new Date().toISOString()
}

export class DemoDataService {
  /**
   * Initialize demo data if not exists or version mismatch
   */
  static initializeDemoData(): void {
    try {
      console.log('🔍 Checking demo data version...')
      const currentVersion = DemoStorage.get<string>(DEMO_VERSION_KEY)
      const existingData = DemoStorage.get<DemoDataStore>(DEMO_DATA_KEY)

      if (!existingData || currentVersion !== CURRENT_DEMO_VERSION) {
        console.log('📝 Initializing demo data...')
        console.log('Demo data size:', JSON.stringify(INITIAL_DEMO_DATA).length, 'characters')

        DemoStorage.set(DEMO_DATA_KEY, INITIAL_DEMO_DATA)
        DemoStorage.set(DEMO_VERSION_KEY, CURRENT_DEMO_VERSION)

        console.log('✅ Demo data initialization complete')
      } else {
        console.log('✅ Demo data already exists and is current version')
      }
    } catch (error) {
      console.error('❌ Failed to initialize demo data:', error)
      throw new Error(`Demo initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Get all demo data
   */
  static getDemoData(): DemoDataStore {
    this.initializeDemoData()
    return DemoStorage.get<DemoDataStore>(DEMO_DATA_KEY) || INITIAL_DEMO_DATA
  }

  /**
   * Update demo data
   */
  static updateDemoData(updates: Partial<DemoDataStore>): void {
    const currentData = this.getDemoData()
    const updatedData = {
      ...currentData,
      ...updates,
      lastUpdated: new Date().toISOString()
    }
    DemoStorage.set(DEMO_DATA_KEY, updatedData)
  }

  /**
   * Reset demo data to initial state
   */
  static resetDemoData(): void {
    console.log('Resetting demo data to initial state...')
    DemoStorage.set(DEMO_DATA_KEY, INITIAL_DEMO_DATA)
    DemoStorage.set(DEMO_VERSION_KEY, CURRENT_DEMO_VERSION)
  }

  /**
   * Clear all demo data
   */
  static clearDemoData(): void {
    DemoStorage.remove(DEMO_DATA_KEY)
    DemoStorage.remove(DEMO_VERSION_KEY)
  }

  // Simulate async API calls with minimal delays for demo performance
  private static async simulateApiCall<T>(data: T, delay: number = 0): Promise<T> {
    // No delays for demo mode - instant responses for better UX
    return data
  }

  /**
   * Fetch initial farm GIS data (simulates API call)
   */
  static async fetchFarmGISInitialData(): Promise<any> {
    const demoData = this.getDemoData()

    const result = {
      farms: demoData.farms,
      blocs: demoData.blocs,
      activeCropCycles: demoData.cropCycles.filter(cycle => cycle.status === 'active'),
      companies: [{
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'Omnicane Ltd',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      }]
    }

    return this.simulateApiCall(result, 0)
  }

  /**
   * Fetch comprehensive bloc data (simulates API call)
   */
  static async fetchComprehensiveBlocData(blocId: string): Promise<BlocData> {
    const demoData = this.getDemoData()
    
    const bloc = demoData.blocs.find(b => b.id === blocId)
    if (!bloc) {
      throw new Error(`Bloc ${blocId} not found`)
    }

    const result = {
      blocId,
      cropCycles: demoData.cropCycles.filter(cc => cc.bloc_id === blocId),
      fieldOperations: demoData.fieldOperations.filter(fo =>
        demoData.cropCycles.some(cc => cc.id === fo.crop_cycle_uuid && cc.bloc_id === blocId)
      ),
      workPackages: demoData.workPackages.filter(wp =>
        demoData.fieldOperations.some(fo => fo.uuid === wp.field_operation_uuid &&
          demoData.cropCycles.some(cc => cc.id === fo.crop_cycle_uuid && cc.bloc_id === blocId)
        )
      ),
      products: [],
      equipment: [],
      labour: [],
      lastUpdated: new Date().toISOString()
    }

    return this.simulateApiCall(result, 0)
  }

  /**
   * Fetch configuration data
   */
  static async fetchProducts() {
    const demoData = this.getDemoData()
    return this.simulateApiCall(demoData.products.filter(p => p.active), 0)
  }

  static async fetchLabour() {
    const demoData = this.getDemoData()
    return this.simulateApiCall(demoData.labour.filter(l => l.active), 0)
  }

  static async fetchEquipment() {
    const demoData = this.getDemoData()
    return this.simulateApiCall(demoData.equipment.filter(e => e.active), 0)
  }

  static async fetchSugarcaneVarieties() {
    const demoData = this.getDemoData()
    return this.simulateApiCall(demoData.sugarcaneVarieties, 0)
  }

  static async fetchIntercropVarieties() {
    const demoData = this.getDemoData()
    return this.simulateApiCall(demoData.intercropVarieties, 0)
  }
}
