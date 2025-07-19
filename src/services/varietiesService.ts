/**
 * Varieties Service
 * Handles API calls for crop varieties with proper typing and validation
 */

import { z } from 'zod'
import { dataService } from './dataService'
import { isDemoMode } from '@/utils/demoMode'

// Zod schemas for API responses (matching the demo data structure)
export const SugarcaneVarietySchema = z.object({
  id: z.string(),
  variety_id: z.string(),
  name: z.string(),
  category: z.string(),
  description: z.string().nullable(),
  maturity_period_months: z.number(),
  yield_potential_tons_per_ha: z.number(),
  sugar_content_percentage: z.number(),
  disease_resistance: z.string().nullable(),
  climate_suitability: z.string().nullable(),
  planting_season: z.string().nullable(),
  active: z.boolean(),
  created_at: z.string().nullable(),
  updated_at: z.string().nullable(),
})

export const SugarcaneVarietiesResponseSchema = z.array(SugarcaneVarietySchema)

export const ErrorResponseSchema = z.object({
  error: z.string(),
  details: z.string().optional(),
  timestamp: z.string(),
})

// TypeScript types
export type SugarcaneVariety = z.infer<typeof SugarcaneVarietySchema>
export type SugarcaneVarietiesResponse = z.infer<typeof SugarcaneVarietiesResponseSchema>
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>

/**
 * API client for varieties endpoints
 * Community best practice: Service abstraction with demo/production switching
 */
export class VarietiesService {
  /**
   * Fetch all sugarcane varieties
   * Uses service abstraction to automatically switch between demo and production modes
   * @returns Promise<SugarcaneVariety[]>
   * @throws Error with proper typing
   */
  static async getSugarcaneVarieties(): Promise<SugarcaneVariety[]> {
    try {
      console.log(`🌾 Fetching sugarcane varieties (${isDemoMode() ? 'Demo' : 'Production'} mode)`)

      // Use service abstraction - automatically handles demo vs production
      const varieties = await dataService.getSugarcaneVarieties()

      // Debug: Log the actual data structure
      console.log('🔍 Raw varieties data structure:', JSON.stringify(varieties[0], null, 2))
      console.log('🔍 Total varieties count:', varieties.length)

      // Validate response with Zod for type safety
      try {
        const validatedData = SugarcaneVarietiesResponseSchema.parse(varieties)
        console.log(`✅ Successfully fetched ${validatedData.length} sugarcane varieties`)
        return validatedData
      } catch (zodError) {
        console.error('❌ Zod validation failed:', zodError)
        console.log('🔍 First variety data:', varieties[0])
        throw zodError
      }

    } catch (error) {
      console.error('VarietiesService.getSugarcaneVarieties error:', error)
      
      if (error instanceof z.ZodError) {
        throw new Error(`Invalid response format: ${error.message}`)
      }
      
      throw error
    }
  }

  /**
   * Get a specific sugarcane variety by ID
   * @param id - Variety ID
   * @returns Promise<SugarcaneVariety | null>
   */
  static async getSugarcaneVarietyById(id: string): Promise<SugarcaneVariety | null> {
    try {
      const varieties = await this.getSugarcaneVarieties()
      return varieties.find(variety => variety.id === id) || null
    } catch (error) {
      console.error('VarietiesService.getSugarcaneVarietyById error:', error)
      throw error
    }
  }

  /**
   * Search sugarcane varieties by name
   * Uses service abstraction for consistent demo/production behavior
   * @param searchTerm - Search term
   * @returns Promise<SugarcaneVariety[]>
   */
  static async searchSugarcaneVarieties(searchTerm: string): Promise<SugarcaneVariety[]> {
    try {
      console.log(`🔍 Searching sugarcane varieties for: "${searchTerm}" (${isDemoMode() ? 'Demo' : 'Production'} mode)`)

      // Use service abstraction for search
      const results = await dataService.searchSugarcaneVarieties(searchTerm)

      console.log(`✅ Found ${results.length} matching varieties`)
      return results

    } catch (error) {
      console.error('VarietiesService.searchSugarcaneVarieties error:', error)
      throw error
    }
  }
}
