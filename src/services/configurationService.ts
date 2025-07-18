/**
 * Configuration Service
 * Handles fetching and caching of configuration data from database
 * NO FALLBACK - Always use real database data or show errors
 */

import { supabase } from '@/lib/supabase'
import { 
  SugarcaneVariety, 
  InterCropPlant, 
  CropVariety 
} from '@/types/varieties'
import { Product } from '@/types/products'
import { Labour } from '@/lib/supabase'
// Removed transform functions - using database data directly

/**
 * Configuration Service Class
 * Provides methods to fetch configuration data from database
 */
export class ConfigurationService {
  
  /**
   * Fetch all sugarcane varieties from database
   * @throws Error if database query fails or data is invalid
   */
  static async getSugarcaneVarieties(): Promise<SugarcaneVariety[]> {
    try {
      const { data, error } = await supabase
        .from('sugarcane_varieties')
        .select('*')
        .eq('active', true)
        .order('name')

      if (error) {
        throw new Error(`Failed to fetch sugarcane varieties: ${error.message}`)
      }

      if (!data || data.length === 0) {
        console.warn('No sugarcane varieties found in database - returning empty array')
        return []
      }

      // Return data directly from database
      return data
    } catch (error) {
      console.error('ConfigurationService.getSugarcaneVarieties error:', error)
      throw error
    }
  }

  /**
   * Fetch all intercrop varieties from database
   * @throws Error if database query fails or data is invalid
   */
  static async getIntercropVarieties(): Promise<InterCropPlant[]> {
    try {
      const { data, error } = await supabase
        .from('intercrop_varieties')
        .select('*')
        .eq('active', true)
        .order('name')

      if (error) {
        throw new Error(`Failed to fetch intercrop varieties: ${error.message}`)
      }

      if (!data || data.length === 0) {
        console.warn('No intercrop varieties found in database - returning empty array')
        return []
      }

      // Return data directly from database
      return data
    } catch (error) {
      console.error('ConfigurationService.getIntercropVarieties error:', error)
      throw error
    }
  }

  /**
   * Fetch all varieties (sugarcane + intercrop) from database
   * @throws Error if database query fails or data is invalid
   */
  static async getAllVarieties(): Promise<CropVariety[]> {
    try {
      // Fetch both types in parallel
      const [sugarcaneResult, intercropResult] = await Promise.all([
        supabase
          .from('sugarcane_varieties')
          .select('*')
          .eq('active', true)
          .order('name'),
        supabase
          .from('intercrop_varieties')
          .select('*')
          .eq('active', true)
          .order('name')
      ])

      if (sugarcaneResult.error) {
        throw new Error(`Failed to fetch sugarcane varieties: ${sugarcaneResult.error.message}`)
      }

      if (intercropResult.error) {
        throw new Error(`Failed to fetch intercrop varieties: ${intercropResult.error.message}`)
      }

      const sugarcaneData = sugarcaneResult.data || []
      const intercropData = intercropResult.data || []

      if (sugarcaneData.length === 0 && intercropData.length === 0) {
        throw new Error('No varieties found in database')
      }

      // Combine both variety types
      return [...sugarcaneData, ...intercropData] as CropVariety[]
    } catch (error) {
      console.error('ConfigurationService.getAllVarieties error:', error)
      throw error
    }
  }

  /**
   * Fetch all products from database
   * @throws Error if database query fails or data is invalid
   */
  static async getProducts(): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('active', true)
        .order('name')

      if (error) {
        throw new Error(`Failed to fetch products: ${error.message}`)
      }

      if (!data || data.length === 0) {
        console.warn('No products found in database - returning empty array')
        return []
      }

      // Return data directly from database
      return data
    } catch (error) {
      console.error('ConfigurationService.getProducts error:', error)
      throw error
    }
  }

  /**
   * Fetch all labour from database
   * @throws Error if database query fails or data is invalid
   */
  static async getLabour(): Promise<Labour[]> {
    try {
      const { data, error } = await supabase
        .from('labour')
        .select('*')
        .eq('active', true)
        .order('name')

      if (error) {
        throw new Error(`Failed to fetch labour: ${error.message}`)
      }

      if (!data || data.length === 0) {
        console.warn('No labour found in database - returning empty array')
        return []
      }

      return data
    } catch (error) {
      console.error('ConfigurationService.getLabour error:', error)
      throw error
    }
  }

  /**
   * Get variety by ID (searches both sugarcane and intercrop)
   * @param id Variety ID to search for
   * @throws Error if database query fails or variety not found
   */
  static async getVarietyById(id: string): Promise<CropVariety> {
    try {
      // Try sugarcane first
      const { data: sugarcaneData, error: sugarcaneError } = await supabase
        .from('sugarcane_varieties')
        .select('*')
        .eq('variety_id', id)
        .eq('active', true)
        .single()

      if (!sugarcaneError && sugarcaneData) {
        return sugarcaneData
      }

      // Try intercrop
      const { data: intercropData, error: intercropError } = await supabase
        .from('intercrop_varieties')
        .select('*')
        .eq('variety_id', id)
        .eq('active', true)
        .single()

      if (!intercropError && intercropData) {
        return intercropData
      }

      throw new Error(`Variety with ID '${id}' not found in database`)
    } catch (error) {
      console.error('ConfigurationService.getVarietyById error:', error)
      throw error
    }
  }

  /**
   * Get product by ID
   * @param id Product ID to search for
   * @throws Error if database query fails or product not found
   */
  static async getProductById(id: string): Promise<Product> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('product_id', id)
        .eq('active', true)
        .single()

      if (error) {
        throw new Error(`Failed to fetch product '${id}': ${error.message}`)
      }

      if (!data) {
        throw new Error(`Product with ID '${id}' not found in database`)
      }

      return data
    } catch (error) {
      console.error('ConfigurationService.getProductById error:', error)
      throw error
    }
  }

  /**
   * Get labour by ID
   * @param id Labour ID to search for
   * @throws Error if database query fails or labour not found
   */
  static async getLabourById(id: string): Promise<Labour> {
    try {
      const { data, error } = await supabase
        .from('labour')
        .select('*')
        .eq('labour_id', id)
        .eq('active', true)
        .single()

      if (error) {
        throw new Error(`Failed to fetch labour '${id}': ${error.message}`)
      }

      if (!data) {
        throw new Error(`Labour with ID '${id}' not found in database`)
      }

      return data
    } catch (error) {
      console.error('ConfigurationService.getLabourById error:', error)
      throw error
    }
  }

  /**
   * Health check - verify database connectivity and data availability
   * @throws Error if database is not accessible or missing critical data
   */
  static async healthCheck(): Promise<{ status: 'healthy' | 'error', message: string }> {
    try {
      const [varieties, products, labour] = await Promise.all([
        this.getAllVarieties(),
        this.getProducts(),
        this.getLabour()
      ])

      const varietyCount = varieties.length
      const productCount = products.length
      const labourCount = labour.length

      if (varietyCount === 0 || productCount === 0 || labourCount === 0) {
        return {
          status: 'error',
          message: `Missing configuration data: ${varietyCount} varieties, ${productCount} products, ${labourCount} labour`
        }
      }

      return {
        status: 'healthy',
        message: `Configuration data loaded: ${varietyCount} varieties, ${productCount} products, ${labourCount} labour`
      }
    } catch (error) {
      return {
        status: 'error',
        message: `Database health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }
  }
}
