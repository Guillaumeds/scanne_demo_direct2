/**
 * Data Service Abstraction Layer
 * Community best practice: Service abstraction with demo/production switching
 */

import { isDemoMode } from '@/utils/demoMode'
import { MockApiService } from './mockApiService'
import type {
  SugarcaneVariety,
  InterCropPlant as InterCropVariety
} from '@/types/varieties'
import type { Product } from '@/types/products'

// Service interface for type safety
interface IDataService {
  getSugarcaneVarieties(): Promise<SugarcaneVariety[]>
  getInterCropVarieties(): Promise<InterCropVariety[]>
  getProducts(): Promise<Product[]>
  searchSugarcaneVarieties(searchTerm: string): Promise<SugarcaneVariety[]>
}

// Production service (makes real API calls)
class ProductionDataService implements IDataService {
  async getSugarcaneVarieties(): Promise<SugarcaneVariety[]> {
    const response = await fetch('/api/varieties/sugarcane', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: Failed to fetch sugarcane varieties`)
    }

    return response.json()
  }

  async getInterCropVarieties(): Promise<InterCropVariety[]> {
    const response = await fetch('/api/varieties/intercrop', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: Failed to fetch intercrop varieties`)
    }

    return response.json()
  }

  async getProducts(): Promise<Product[]> {
    const response = await fetch('/api/products', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: Failed to fetch products`)
    }

    return response.json()
  }

  async searchSugarcaneVarieties(searchTerm: string): Promise<SugarcaneVariety[]> {
    const varieties = await this.getSugarcaneVarieties()
    const lowercaseSearch = searchTerm.toLowerCase()
    
    return varieties.filter(variety => 
      variety.name.toLowerCase().includes(lowercaseSearch) ||
      (variety.description && variety.description.toLowerCase().includes(lowercaseSearch))
    )
  }
}

// Demo service (uses mock data directly)
class DemoDataService implements IDataService {
  async getSugarcaneVarieties(): Promise<SugarcaneVariety[]> {
    console.log('🎭 Demo Mode: Using mock sugarcane varieties')
    
    try {
      const response = await MockApiService.getSugarcaneVarieties()
      return response.data as SugarcaneVariety[]
    } catch (error) {
      console.error('Demo service error:', error)
      // Fallback to empty array in demo mode
      return []
    }
  }

  async getInterCropVarieties(): Promise<InterCropVariety[]> {
    console.log('🎭 Demo Mode: Using mock intercrop varieties')

    try {
      // Check if MockApiService has this method, otherwise return empty array
      if ('getInterCropVarieties' in MockApiService) {
        const response = await (MockApiService as any).getInterCropVarieties()
        return response.data
      } else {
        console.warn('MockApiService.getInterCropVarieties not implemented yet')
        return []
      }
    } catch (error) {
      console.error('Demo service error:', error)
      return []
    }
  }

  async getProducts(): Promise<Product[]> {
    console.log('🎭 Demo Mode: Using mock products')

    try {
      const response = await MockApiService.getProducts()
      return response.data
    } catch (error) {
      console.error('Demo service error:', error)
      // Fallback to empty array in demo mode
      return []
    }
  }

  async searchSugarcaneVarieties(searchTerm: string): Promise<SugarcaneVariety[]> {
    const varieties = await this.getSugarcaneVarieties()
    const lowercaseSearch = searchTerm.toLowerCase()

    return varieties.filter(variety =>
      variety.name.toLowerCase().includes(lowercaseSearch) ||
      (variety.description && variety.description.toLowerCase().includes(lowercaseSearch))
    )
  }
}

// Service factory - community recommended pattern
const createDataService = (): IDataService => {
  const isDemo = isDemoMode()
  
  if (isDemo) {
    console.log('🎭 Initializing Demo Data Service')
    return new DemoDataService()
  } else {
    console.log('🏭 Initializing Production Data Service')
    return new ProductionDataService()
  }
}

// Singleton instance
export const dataService = createDataService()

// Export for testing and explicit usage
export { ProductionDataService, DemoDataService }
export type { IDataService }
