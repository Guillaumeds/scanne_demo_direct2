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
import { Resource } from '@/types/resources'
import { 
  transformAndValidate,
  transformDbVarieties 
} from './dataAdapters'

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

      return transformAndValidate.sugarcaneVarieties(data)
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

      return transformAndValidate.intercropVarieties(data)
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

      return transformDbVarieties(sugarcaneData, intercropData)
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

      return transformAndValidate.products(data)
    } catch (error) {
      console.error('ConfigurationService.getProducts error:', error)
      throw error
    }
  }

  /**
   * Fetch all resources from database
   * @throws Error if database query fails or data is invalid
   */
  static async getResources(): Promise<Resource[]> {
    try {
      const { data, error } = await supabase
        .from('resources')
        .select('*')
        .eq('active', true)
        .order('name')

      if (error) {
        throw new Error(`Failed to fetch resources: ${error.message}`)
      }

      if (!data || data.length === 0) {
        console.warn('No resources found in database - returning empty array')
        return []
      }

      return transformAndValidate.resources(data)
    } catch (error) {
      console.error('ConfigurationService.getResources error:', error)
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
        return transformAndValidate.sugarcaneVarieties([sugarcaneData])[0]
      }

      // Try intercrop
      const { data: intercropData, error: intercropError } = await supabase
        .from('intercrop_varieties')
        .select('*')
        .eq('variety_id', id)
        .eq('active', true)
        .single()

      if (!intercropError && intercropData) {
        return transformAndValidate.intercropVarieties([intercropData])[0]
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

      return transformAndValidate.products([data])[0]
    } catch (error) {
      console.error('ConfigurationService.getProductById error:', error)
      throw error
    }
  }

  /**
   * Get resource by ID
   * @param id Resource ID to search for
   * @throws Error if database query fails or resource not found
   */
  static async getResourceById(id: string): Promise<Resource> {
    try {
      const { data, error } = await supabase
        .from('resources')
        .select('*')
        .eq('resource_id', id)
        .eq('active', true)
        .single()

      if (error) {
        throw new Error(`Failed to fetch resource '${id}': ${error.message}`)
      }

      if (!data) {
        throw new Error(`Resource with ID '${id}' not found in database`)
      }

      return transformAndValidate.resources([data])[0]
    } catch (error) {
      console.error('ConfigurationService.getResourceById error:', error)
      throw error
    }
  }

  /**
   * Health check - verify database connectivity and data availability
   * @throws Error if database is not accessible or missing critical data
   */
  static async healthCheck(): Promise<{ status: 'healthy' | 'error', message: string }> {
    try {
      const [varieties, products, resources] = await Promise.all([
        this.getAllVarieties(),
        this.getProducts(),
        this.getResources()
      ])

      const varietyCount = varieties.length
      const productCount = products.length
      const resourceCount = resources.length

      if (varietyCount === 0 || productCount === 0 || resourceCount === 0) {
        return {
          status: 'error',
          message: `Missing configuration data: ${varietyCount} varieties, ${productCount} products, ${resourceCount} resources`
        }
      }

      return {
        status: 'healthy',
        message: `Configuration data loaded: ${varietyCount} varieties, ${productCount} products, ${resourceCount} resources`
      }
    } catch (error) {
      return {
        status: 'error',
        message: `Database health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }
  }
}
