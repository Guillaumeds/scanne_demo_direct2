/**
 * Demo Utilities
 * Helper functions for managing demo state and data
 */

import { DemoDataService } from '@/services/demoDataService'
import { demoQueryUtils } from '@/lib/queryClient'

export interface DemoScenario {
  id: string
  name: string
  description: string
  data: any
}

// Predefined demo scenarios
export const DEMO_SCENARIOS: DemoScenario[] = [
  {
    id: 'default',
    name: 'Default Demo',
    description: 'Standard demo with multiple farms, active crop cycles, and operations',
    data: null // Uses INITIAL_DEMO_DATA
  },
  {
    id: 'single-farm',
    name: 'Single Farm Focus',
    description: 'Simplified demo with one farm and two blocks for focused presentations',
    data: {
      // Simplified data structure would go here
    }
  },
  {
    id: 'harvest-season',
    name: 'Harvest Season',
    description: 'Demo focused on harvest operations and completed cycles',
    data: {
      // Harvest-focused data would go here
    }
  }
]

export class DemoUtils {
  /**
   * Reset demo to initial state
   */
  static async resetToDefault(): Promise<void> {
    try {
      console.log('🔄 Resetting demo to default state...')
      
      // Clear query cache
      demoQueryUtils.clearCache()
      
      // Reset demo data
      DemoDataService.resetDemoData()
      
      // Prefetch fresh data
      await demoQueryUtils.prefetchDemoData()
      
      console.log('✅ Demo reset completed successfully')
    } catch (error) {
      console.error('❌ Failed to reset demo:', error)
      throw error
    }
  }

  /**
   * Load a specific demo scenario
   */
  static async loadScenario(scenarioId: string): Promise<void> {
    const scenario = DEMO_SCENARIOS.find(s => s.id === scenarioId)
    if (!scenario) {
      throw new Error(`Demo scenario '${scenarioId}' not found`)
    }

    console.log(`🎬 Loading demo scenario: ${scenario.name}`)
    
    // Clear existing data
    demoQueryUtils.clearCache()
    
    if (scenario.data) {
      // Load custom scenario data
      DemoDataService.updateDemoData(scenario.data)
    } else {
      // Load default data
      DemoDataService.resetDemoData()
    }
    
    // Prefetch data for the scenario
    await demoQueryUtils.prefetchDemoData()
    
    console.log(`✅ Scenario '${scenario.name}' loaded successfully`)
  }

  /**
   * Export current demo state
   */
  static async exportCurrentState(): Promise<string> {
    const demoData = DemoDataService.getDemoData()
    const exportData = {
      ...demoData,
      exportedAt: new Date().toISOString(),
      exportedBy: 'Scanne Demo App'
    }
    
    return JSON.stringify(exportData, null, 2)
  }

  /**
   * Import demo state from JSON
   */
  static async importState(jsonData: string): Promise<void> {
    try {
      const importedData = JSON.parse(jsonData)
      
      // Validate basic structure
      if (!importedData.version || !importedData.farms || !importedData.blocs) {
        throw new Error('Invalid demo data format')
      }
      
      console.log('📥 Importing demo data...')
      
      // Clear existing data
      demoQueryUtils.clearCache()
      
      // Import new data
      DemoDataService.updateDemoData(importedData)
      
      // Prefetch imported data
      await demoQueryUtils.prefetchDemoData()
      
      console.log('✅ Demo data imported successfully')
    } catch (error) {
      console.error('❌ Failed to import demo data:', error)
      throw error
    }
  }

  /**
   * Get demo statistics
   */
  static getDemoStats() {
    const demoData = DemoDataService.getDemoData()
    const cacheStats = demoQueryUtils.getCacheStats()
    
    return {
      data: {
        farms: demoData.farms.length,
        blocs: demoData.blocs.length,
        cropCycles: demoData.cropCycles.length,
        activeCycles: demoData.cropCycles.filter(c => c.status === 'active').length,
        fieldOperations: demoData.fieldOperations.length,
        workPackages: demoData.workPackages.length,
        products: demoData.products.length,
        labour: demoData.labour.length,
        equipment: demoData.equipment.length,
      },
      cache: cacheStats,
      lastUpdated: demoData.lastUpdated,
      version: demoData.version
    }
  }

  /**
   * Simulate time progression (useful for demos)
   */
  static async simulateTimeProgression(days: number): Promise<void> {
    console.log(`⏰ Simulating ${days} days of progression...`)
    
    const demoData = DemoDataService.getDemoData()
    const currentDate = new Date()
    const futureDate = new Date(currentDate.getTime() + (days * 24 * 60 * 60 * 1000))
    
    // Update crop cycle growth stages based on time progression
    const updatedCycles = demoData.cropCycles.map(cycle => {
      if (cycle.status === 'active') {
        const plantingDate = new Date(cycle.planting_date)
        const daysSincePlanting = Math.floor((futureDate.getTime() - plantingDate.getTime()) / (24 * 60 * 60 * 1000))
        
        // Simple growth stage progression logic
        let newStage = cycle.growth_stage
        if (daysSincePlanting > 365) {
          newStage = 'maturation'
        } else if (daysSincePlanting > 180) {
          newStage = 'grand_growth'
        } else if (daysSincePlanting > 60) {
          newStage = 'tillering'
        } else if (daysSincePlanting > 30) {
          newStage = 'establishment'
        }
        
        return {
          ...cycle,
          growth_stage: newStage,
          updated_at: futureDate.toISOString()
        }
      }
      return cycle
    })
    
    // Update demo data
    DemoDataService.updateDemoData({
      cropCycles: updatedCycles,
      lastUpdated: futureDate.toISOString()
    })
    
    // Invalidate cache to reflect changes
    demoQueryUtils.invalidateAll()
    
    console.log('✅ Time progression simulation completed')
  }

  /**
   * Add random field operation (for demo purposes)
   */
  static async addRandomOperation(cycleId: string): Promise<void> {
    const operations = [
      'fertilization',
      'weed_control',
      'pest_control',
      'irrigation',
      'soil_cultivation'
    ]
    
    const methods = ['manual', 'mechanical', 'chemical']
    
    const randomOperation = operations[Math.floor(Math.random() * operations.length)]
    const randomMethod = methods[Math.floor(Math.random() * methods.length)]
    
    const demoData = DemoDataService.getDemoData()
    const newOperation = {
      id: `op-${Date.now()}`,
      crop_cycle_id: cycleId,
      operation_type: randomOperation,
      operation_method: randomMethod,
      planned_date: new Date().toISOString().split('T')[0],
      actual_date: null,
      status: 'planned',
      area_covered: 0,
      notes: `Demo operation: ${randomOperation}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    
    demoData.fieldOperations.push(newOperation)
    DemoDataService.updateDemoData({ fieldOperations: demoData.fieldOperations })
    
    // Invalidate related queries
    demoQueryUtils.invalidateAll()
    
    console.log(`✅ Added random operation: ${randomOperation}`)
  }

  /**
   * Clean up old demo data (useful for maintenance)
   */
  static cleanupOldData(): void {
    const demoData = DemoDataService.getDemoData()
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
    
    // Remove old completed operations
    const recentOperations = demoData.fieldOperations.filter(op => {
      if (op.status === 'completed' && op.actual_date) {
        const opDate = new Date(op.actual_date)
        return opDate > sixMonthsAgo
      }
      return true // Keep non-completed operations
    })
    
    // Remove old completed work packages
    const recentWorkPackages = demoData.workPackages.filter(wp => {
      const wpDate = new Date(wp.created_at)
      return wp.status !== 'completed' || wpDate > sixMonthsAgo
    })
    
    DemoDataService.updateDemoData({
      fieldOperations: recentOperations,
      workPackages: recentWorkPackages
    })
    
    console.log('🧹 Old demo data cleaned up')
  }

  /**
   * Validate demo data integrity
   */
  static validateDemoData(): { valid: boolean; errors: string[] } {
    const demoData = DemoDataService.getDemoData()
    const errors: string[] = []
    
    // Check for orphaned crop cycles
    const farmIds = new Set(demoData.farms.map(f => f.id))
    const blocIds = new Set(demoData.blocs.map(b => b.id))
    
    demoData.blocs.forEach(bloc => {
      if (!farmIds.has(bloc.farm_id)) {
        errors.push(`Bloc ${bloc.id} references non-existent farm ${bloc.farm_id}`)
      }
    })
    
    demoData.cropCycles.forEach(cycle => {
      if (!blocIds.has(cycle.bloc_id)) {
        errors.push(`Crop cycle ${cycle.id} references non-existent bloc ${cycle.bloc_id}`)
      }
    })
    
    // Check for orphaned operations
    const cycleIds = new Set(demoData.cropCycles.map(c => c.id))
    
    demoData.fieldOperations.forEach(op => {
      if (!cycleIds.has(op.crop_cycle_id)) {
        errors.push(`Field operation ${op.id} references non-existent cycle ${op.crop_cycle_id}`)
      }
    })
    
    return {
      valid: errors.length === 0,
      errors
    }
  }
}

export default DemoUtils
