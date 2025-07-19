import { NextRequest, NextResponse } from 'next/server'
import { MockApiService } from '@/services/mockApiService'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    if (!body.blocId || !body.sugarcaneVarietyId || !body.expectedHarvestDate || !body.expectedYield) {
      return NextResponse.json(
        { error: 'Missing required fields: blocId, sugarcaneVarietyId, expectedHarvestDate, expectedYield' },
        { status: 400 }
      )
    }

    // Validate that plantation cycles have planting date
    if (body.type === 'plantation' && !body.plantingDate) {
      return NextResponse.json(
        { error: 'Planting date is required for plantation cycles' },
        { status: 400 }
      )
    }

    const response = await MockApiService.createCropCycle(body)
    const newCycle = response.data
    
    return NextResponse.json(newCycle, { status: 201 })
  } catch (error) {
    console.error('Error creating crop cycle:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create crop cycle' },
      { status: 500 }
    )
  }
}
