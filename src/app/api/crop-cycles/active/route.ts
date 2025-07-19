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

    const response = await MockApiService.getActiveCropCycle(blocId)
    const activeCycle = response.data
    
    return NextResponse.json(activeCycle)
  } catch (error) {
    console.error('Error fetching active crop cycle:', error)
    return NextResponse.json(
      { error: 'Failed to fetch active crop cycle' },
      { status: 500 }
    )
  }
}
