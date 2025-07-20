'use client'

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { CloudRain } from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  ComposedChart
} from 'recharts'

interface PrecipitationCardProps {
  plantingDate: string
  harvestDate: string
}

// Generate realistic precipitation data for Mauritius
const generatePrecipitationData = (plantingDate: string, harvestDate: string) => {
  const start = new Date(plantingDate)
  const end = new Date(harvestDate)
  const data = []
  let cumulativePrecipitation = 0
  
  // Mauritius precipitation patterns (mm/day)
  // Wet season (Nov-Apr): Higher rainfall, cyclone season
  // Dry season (May-Oct): Lower rainfall
  // Annual average: ~2000mm
  
  const current = new Date(start)
  let dayCount = 0
  
  while (current <= end) {
    const month = current.getMonth()
    const dayOfYear = Math.floor((current.getTime() - new Date(current.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24))
    
    // Seasonal variation for Mauritius (Southern Hemisphere)
    // Wet season: Nov-Apr (months 10,11,0,1,2,3)
    // Dry season: May-Oct (months 4,5,6,7,8,9)
    let baseRainfall = 0
    if (month >= 10 || month <= 3) {
      // Wet season: 6-12mm/day average
      baseRainfall = 8 + 3 * Math.sin((dayOfYear - 300) * 2 * Math.PI / 365)
    } else {
      // Dry season: 2-6mm/day average
      baseRainfall = 3 + 2 * Math.sin((dayOfYear - 150) * 2 * Math.PI / 365)
    }
    
    // Add realistic daily variation with occasional heavy rain events
    const randomFactor = Math.random()
    let dailyRainfall = 0
    
    if (randomFactor < 0.7) {
      // Normal day
      dailyRainfall = Math.max(0, baseRainfall + (Math.random() - 0.5) * 4)
    } else if (randomFactor < 0.9) {
      // Moderate rain day
      dailyRainfall = baseRainfall * (1.5 + Math.random())
    } else {
      // Heavy rain day (cyclone/storm)
      dailyRainfall = baseRainfall * (3 + Math.random() * 2)
    }
    
    cumulativePrecipitation += dailyRainfall
    dayCount++
    
    data.push({
      day: dayCount,
      date: current.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' }),
      month: current.toLocaleDateString('en-GB', { month: 'short' }),
      dailyPrecipitation: parseFloat(dailyRainfall.toFixed(1)),
      cumulativePrecipitation: parseFloat(cumulativePrecipitation.toFixed(1)),
      monthlyTotal: 0 // Will be calculated below
    })
    
    current.setDate(current.getDate() + 1)
  }
  
  // Calculate monthly totals
  const monthlyData: { [key: string]: number } = {}
  data.forEach(item => {
    if (!monthlyData[item.month]) {
      monthlyData[item.month] = 0
    }
    monthlyData[item.month] += item.dailyPrecipitation
  })
  
  // Add monthly totals to data
  data.forEach(item => {
    item.monthlyTotal = parseFloat(monthlyData[item.month].toFixed(1))
  })
  
  return data
}

export function PrecipitationCard({ plantingDate, harvestDate }: PrecipitationCardProps) {
  const data = generatePrecipitationData(plantingDate, harvestDate)
  const totalPrecipitation = data[data.length - 1]?.cumulativePrecipitation || 0
  
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-lg">
          <p className="font-medium">{`Day ${label}`}</p>
          <p className="text-blue-600">{`Daily: ${data.dailyPrecipitation} mm`}</p>
          <p className="text-blue-800">{`Cumulative: ${data.cumulativePrecipitation} mm`}</p>
          <p className="text-gray-600 text-sm">{`Date: ${data.date}`}</p>
        </div>
      )
    }
    return null
  }

  return (
    <Card className="h-full">
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <CloudRain className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-800">Precipitation</h3>
            <p className="text-sm text-slate-600">Total: {totalPrecipitation.toLocaleString()} mm</p>
          </div>
        </div>
        
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="day" 
                tick={{ fontSize: 10 }}
                interval="preserveStartEnd"
              />
              <YAxis 
                yAxisId="cumulative"
                orientation="left"
                tick={{ fontSize: 10 }}
                domain={[0, 'dataMax']}
              />
              <YAxis 
                yAxisId="daily"
                orientation="right"
                tick={{ fontSize: 10 }}
                domain={[0, 50]}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                yAxisId="cumulative"
                type="monotone"
                dataKey="cumulativePrecipitation"
                stroke="#2563eb"
                strokeWidth={2}
                dot={false}
                name="Cumulative Precipitation"
              />
              <Bar
                yAxisId="daily"
                dataKey="dailyPrecipitation"
                fill="#bfdbfe"
                opacity={0.6}
                name="Daily Precipitation"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        
        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
          <div className="text-center">
            <div className="text-blue-600 font-semibold">Avg Daily</div>
            <div className="text-slate-600">{(totalPrecipitation / data.length).toFixed(1)} mm</div>
          </div>
          <div className="text-center">
            <div className="text-blue-600 font-semibold">Peak Day</div>
            <div className="text-slate-600">{Math.max(...data.map(d => d.dailyPrecipitation)).toFixed(1)} mm</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
