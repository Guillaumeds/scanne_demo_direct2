import { NextResponse } from 'next/server'
import { z } from 'zod'
import { MockApiService } from '@/services/mockApiService'

// Zod schema for sugarcane variety response
const SugarcaneVarietySchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
})

const SugarcaneVarietiesResponseSchema = z.array(SugarcaneVarietySchema)

// Zod schema for error response
const ErrorResponseSchema = z.object({
  error: z.string(),
  details: z.string().optional(),
  timestamp: z.string(),
})

export type SugarcaneVariety = z.infer<typeof SugarcaneVarietySchema>
export type SugarcaneVarietiesResponse = z.infer<typeof SugarcaneVarietiesResponseSchema>
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>

export async function GET() {
  try {
    console.log('Fetching sugarcane varieties from demo service...')

    const response = await MockApiService.getSugarcaneVarieties()
    const data = response.data

    // Validate response data with Zod
    const validatedData = SugarcaneVarietiesResponseSchema.parse(data || [])

    console.log('Successfully fetched and validated varieties:', validatedData.length, 'records')
    return NextResponse.json(validatedData)

  } catch (error) {
    console.error('Error fetching sugarcane varieties:', error)

    const errorResponse: ErrorResponse = {
      error: 'Failed to fetch sugarcane varieties',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }

    // Validate error response with Zod
    const validatedError = ErrorResponseSchema.parse(errorResponse)
    return NextResponse.json(validatedError, { status: 500 })
  }
}
