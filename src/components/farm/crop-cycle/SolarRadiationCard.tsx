'use client'

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Sun } from 'lucide-react'
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

interface SolarRadiationCardProps {
  plantingDate: string
  harvestDate: string
}

// Generate realistic solar radiation data for Mauritius
const generateSolarRadiationData = (plantingDate: string, harvestDate: string) => {
  const start = new Date(plantingDate)
  const end = new Date(harvestDate)
  const data = []
  let cumulativeRadiation = 0
  
  // Mauritius solar radiation patterns (MJ/m²/day)
  // Higher in summer (Nov-Apr): 20-25 MJ/m²/day
  // Lower in winter (May-Oct): 12-18 MJ/m²/day
  
  const current = new Date(start)
  let dayCount = 0
  
  while (current <= end) {
    const month = current.getMonth()
    const dayOfYear = Math.floor((current.getTime() - new Date(current.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24))
    
    // Seasonal variation for Mauritius (Southern Hemisphere)
    let baseSolar = 18 + 4 * Math.sin((dayOfYear - 80) * 2 * Math.PI / 365)
    
    // Add some realistic daily variation
    const dailyVariation = (Math.random() - 0.5) * 4
    const dailySolar = Math.max(12, Math.min(25, baseSolar + dailyVariation))
    
    cumulativeRadiation += dailySolar
    dayCount++
    
    data.push({
      day: dayCount,
      date: current.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' }),
      month: current.toLocaleDateString('en-GB', { month: 'short' }),
      dailySolar: parseFloat(dailySolar.toFixed(1)),
      cumulativeSolar: parseFloat(cumulativeRadiation.toFixed(1)),
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
    monthlyData[item.month] += item.dailySolar
  })
  
  // Add monthly totals to data
  data.forEach(item => {
    item.monthlyTotal = parseFloat(monthlyData[item.month].toFixed(1))
  })
  
  return data
}

export function SolarRadiationCard({ plantingDate, harvestDate }: SolarRadiationCardProps) {
  const data = generateSolarRadiationData(plantingDate, harvestDate)
  const totalRadiation = data[data.length - 1]?.cumulativeSolar || 0
  
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-lg">
          <p className="font-medium">{`Day ${label}`}</p>
          <p className="text-orange-600">{`Daily: ${data.dailySolar} MJ/m²`}</p>
          <p className="text-orange-800">{`Cumulative: ${data.cumulativeSolar} MJ/m²`}</p>
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
          <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
            <Sun className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-800">Solar Radiation</h3>
            <p className="text-sm text-slate-600">Cumulative: {totalRadiation.toLocaleString()} MJ/m²</p>
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
                domain={[0, 30]}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                yAxisId="cumulative"
                type="monotone"
                dataKey="cumulativeSolar"
                stroke="#ea580c"
                strokeWidth={2}
                dot={false}
                name="Cumulative Solar"
              />
              <Bar
                yAxisId="daily"
                dataKey="dailySolar"
                fill="#fed7aa"
                opacity={0.6}
                name="Daily Solar"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        
        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
          <div className="text-center">
            <div className="text-orange-600 font-semibold">Avg Daily</div>
            <div className="text-slate-600">{(totalRadiation / data.length).toFixed(1)} MJ/m²</div>
          </div>
          <div className="text-center">
            <div className="text-orange-600 font-semibold">Peak Day</div>
            <div className="text-slate-600">{Math.max(...data.map(d => d.dailySolar)).toFixed(1)} MJ/m²</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
