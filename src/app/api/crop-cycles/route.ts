import { NextRequest, NextResponse } from 'next/server'
import { CropCycleManagementService } from '@/services/cropCycleManagementService'
import { CreateCropCycleRequest } from '@/types/cropCycleManagement'

export async function POST(request: NextRequest) {
  try {
    const body: CreateCropCycleRequest = await request.json()

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

    const newCycle = await CropCycleManagementService.createCropCycle(body)
    
    return NextResponse.json(newCycle, { status: 201 })
  } catch (error) {
    console.error('Error creating crop cycle:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create crop cycle' },
      { status: 500 }
    )
  }
}
