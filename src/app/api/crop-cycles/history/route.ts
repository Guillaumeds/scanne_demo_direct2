import { NextRequest, NextResponse } from 'next/server'
import { MockApiService } from '@/services/mockApiService'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const blocId = searchParams.get('blocId')

    if (!blocId) {
      return NextResponse.json(
        { error: 'blocId parameter is required' },
        { status: 400 }
      )
    }

    const response = await MockApiService.getCropCycleHistory(blocId)
    const cycleHistory = response.data
    
    return NextResponse.json(cycleHistory)
  } catch (error) {
    console.error('Error fetching crop cycle history:', error)
    return NextResponse.json(
      { error: 'Failed to fetch crop cycle history' },
      { status: 500 }
    )
  }
}
