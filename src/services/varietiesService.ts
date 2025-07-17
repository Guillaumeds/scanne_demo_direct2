/**
 * Varieties Service
 * Handles API calls for crop varieties with proper typing and validation
 */

import { z } from 'zod'

// Zod schemas for API responses (matching the API route schemas)
export const SugarcaneVarietySchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
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
 */
export class VarietiesService {
  private static baseUrl = '/api/varieties'

  /**
   * Fetch all sugarcane varieties
   * @returns Promise<SugarcaneVariety[]>
   * @throws Error with proper typing
   */
  static async getSugarcaneVarieties(): Promise<SugarcaneVariety[]> {
    try {
      const response = await fetch(`${VarietiesService.baseUrl}/sugarcane`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        // Try to parse error response
        const errorData = await response.json().catch(() => ({}))
        const validatedError = ErrorResponseSchema.safeParse(errorData)
        
        if (validatedError.success) {
          throw new Error(validatedError.data.details || validatedError.data.error)
        } else {
          throw new Error(`HTTP ${response.status}: Failed to fetch sugarcane varieties`)
        }
      }

      const data = await response.json()
      
      // Validate response with Zod
      const validatedData = SugarcaneVarietiesResponseSchema.parse(data)
      return validatedData
      
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
   * @param searchTerm - Search term
   * @returns Promise<SugarcaneVariety[]>
   */
  static async searchSugarcaneVarieties(searchTerm: string): Promise<SugarcaneVariety[]> {
    try {
      const varieties = await this.getSugarcaneVarieties()
      const lowercaseSearch = searchTerm.toLowerCase()
      
      return varieties.filter(variety => 
        variety.name.toLowerCase().includes(lowercaseSearch) ||
        (variety.description && variety.description.toLowerCase().includes(lowercaseSearch))
      )
    } catch (error) {
      console.error('VarietiesService.searchSugarcaneVarieties error:', error)
      throw error
    }
  }
}
