import { NextRequest, NextResponse } from 'next/server'
import { MockApiService } from '@/services/mockApiService'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    if (!body.cycleId || !body.actualHarvestDate || !body.userConfirmation) {
      return NextResponse.json(
        { error: 'Missing required fields: cycleId, actualHarvestDate, userConfirmation' },
        { status: 400 }
      )
    }

    // Demo mode - not implemented
    return NextResponse.json(
      { error: 'Crop cycle closure not available in demo mode' },
      { status: 501 }
    )

  } catch (error) {
    console.error('Error closing crop cycle:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to close crop cycle' },
      { status: 500 }
    )
  }
}
