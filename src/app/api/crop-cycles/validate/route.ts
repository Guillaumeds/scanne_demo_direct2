import { NextRequest, NextResponse } from 'next/server'
import { CropCycleManagementService } from '@/services/cropCycleManagementService'

export async function POST(request: NextRequest) {
  try {
    const { cycleId } = await request.json()

    if (!cycleId) {
      return NextResponse.json(
        { error: 'cycleId is required' },
        { status: 400 }
      )
    }

    const validation = await CropCycleManagementService.validateCropCycleForClosure(cycleId)
    
    return NextResponse.json(validation)
  } catch (error) {
    console.error('Error validating crop cycle:', error)
    return NextResponse.json(
      { error: 'Failed to validate crop cycle' },
      { status: 500 }
    )
  }
}
