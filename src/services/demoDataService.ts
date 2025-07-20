/**
 * Demo Data Service - Simplified for Quick Demo Setup
 * Provides realistic Mauritius sugarcane demo data without database dependencies
 * Uses localStorage as the persistence layer with TanStack Query caching
 */

import { generateCompleteMauritiusDemoData } from './mauritiusDemoDataGenerator'
import type {
  FarmGISInitialData,
  BlocData,
} from '@/schemas/apiSchemas'

// Demo data keys
const DEMO_DATA_KEY = 'scanne_demo_data'
const DEMO_VERSION_KEY = 'scanne_demo_version'
const CURRENT_DEMO_VERSION = '2.0.0'

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
      localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error('Failed to save to localStorage:', error)
    }
  }

  static remove(key: string): void {
    try {
      localStorage.removeItem(key)
    } catch (error) {
      console.error('Failed to remove from localStorage:', error)
    }
  }
}

// Generate initial demo data using Mauritius generator
const INITIAL_DEMO_DATA: DemoDataStore = (() => {
  const generatedData = generateCompleteMauritiusDemoData()
  return {
    ...generatedData,
    // Add existing products, labour, equipment from current demo data
    products: [
      {
        id: 'product-1',
        name: 'NPK Fertilizer 15-15-15',
        category: 'fertilizer',
        unit: 'kg',
        cost_per_unit: 45.50, // MUR
        active: true,
        created_at: '2024-01-01T00:00:00Z'
      },
      {
        id: 'product-2',
        name: 'Glyphosate Herbicide',
        category: 'herbicide',
        unit: 'L',
        cost_per_unit: 85.00, // MUR
        active: true,
        created_at: '2024-01-01T00:00:00Z'
      },
      {
        id: 'product-3',
        name: 'Urea Fertilizer',
        category: 'fertilizer',
        unit: 'kg',
        cost_per_unit: 35.75, // MUR
        active: true,
        created_at: '2024-01-01T00:00:00Z'
      },
      {
        id: 'product-4',
        name: 'Insecticide - Cypermethrin',
        category: 'insecticide',
        unit: 'L',
        cost_per_unit: 125.00, // MUR
        active: true,
        created_at: '2024-01-01T00:00:00Z'
      }
    ],
    equipment: [
      {
        id: 'equipment-1',
        name: 'Tractor - John Deere 6120M',
        category: 'tractor',
        cost_per_hour: 450.00, // MUR
        active: true,
        created_at: '2024-01-01T00:00:00Z'
      },
      {
        id: 'equipment-2',
        name: 'Sugarcane Planter',
        category: 'planter',
        cost_per_hour: 350.00, // MUR
        active: true,
        created_at: '2024-01-01T00:00:00Z'
      },
      {
        id: 'equipment-3',
        name: 'Fertilizer Spreader',
        category: 'spreader',
        cost_per_hour: 200.00, // MUR
        active: true,
        created_at: '2024-01-01T00:00:00Z'
      },
      {
        id: 'equipment-4',
        name: 'Harvester - Case IH A8000',
        category: 'harvester',
        cost_per_hour: 850.00, // MUR
        active: true,
        created_at: '2024-01-01T00:00:00Z'
      }
    ],
    labour: [
      {
        id: 'labour-1',
        name: 'Field Worker',
        category: 'general',
        cost_per_hour: 45.00, // MUR
        active: true,
        created_at: '2024-01-01T00:00:00Z'
      },
      {
        id: 'labour-2',
        name: 'Machine Operator',
        category: 'skilled',
        cost_per_hour: 75.00, // MUR
        active: true,
        created_at: '2024-01-01T00:00:00Z'
      },
      {
        id: 'labour-3',
        name: 'Field Supervisor',
        category: 'management',
        cost_per_hour: 120.00, // MUR
        active: true,
        created_at: '2024-01-01T00:00:00Z'
      }
    ]
  }
})()

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
  private static async simulateApiCall<T>(data: T): Promise<T> {
    // No delays for demo mode - instant responses for better UX
    return data
  }

  /**
   * Fetch initial farm GIS data (simulates API call)
   */
  static async fetchFarmGISInitialData(): Promise<FarmGISInitialData> {
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

    return this.simulateApiCall(result)
  }

  /**
   * Fetch comprehensive bloc data
   */
  static async fetchBlocData(blocId: string): Promise<BlocData> {
    const demoData = this.getDemoData()

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

    return this.simulateApiCall(result)
  }

  /**
   * Fetch configuration data
   */
  static async fetchProducts() {
    const demoData = this.getDemoData()
    return this.simulateApiCall(demoData.products.filter(p => p.active))
  }

  static async fetchLabour() {
    const demoData = this.getDemoData()
    return this.simulateApiCall(demoData.labour.filter(l => l.active))
  }

  static async fetchEquipment() {
    const demoData = this.getDemoData()
    return this.simulateApiCall(demoData.equipment.filter(e => e.active))
  }

  static async fetchSugarcaneVarieties() {
    const demoData = this.getDemoData()
    return this.simulateApiCall(demoData.sugarcaneVarieties)
  }

  static async fetchIntercropVarieties() {
    const demoData = this.getDemoData()
    return this.simulateApiCall(demoData.intercropVarieties)
  }
}
