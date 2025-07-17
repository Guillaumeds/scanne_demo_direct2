import { NextRequest, NextResponse } from 'next/server'
import { CropCycleManagementService } from '@/services/cropCycleManagementService'
import { CloseCropCycleRequest } from '@/types/cropCycleManagement'

export async function POST(request: NextRequest) {
  try {
    const body: CloseCropCycleRequest = await request.json()

    // Validate required fields
    if (!body.cycleId || !body.actualHarvestDate || !body.userConfirmation) {
      return NextResponse.json(
        { error: 'Missing required fields: cycleId, actualHarvestDate, userConfirmation' },
        { status: 400 }
      )
    }

    const closedCycle = await CropCycleManagementService.closeCropCycle(body)
    
    return NextResponse.json(closedCycle)
  } catch (error) {
    console.error('Error closing crop cycle:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to close crop cycle' },
      { status: 500 }
    )
  }
}
