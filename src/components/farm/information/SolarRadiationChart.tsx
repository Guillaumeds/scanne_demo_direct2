'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Sun, BarChart3 } from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
  BarChart,
  Bar,
  ComposedChart
} from 'recharts'
import { useCropCycleClimate, useClimateStatistics } from '@/hooks/useClimaticData'
import { Badge } from '@/components/ui/badge'

interface SolarRadiationChartProps {
  cropCycle: {
    plantingDate?: string | null
    plannedHarvestDate?: string | null
    actualHarvestDate?: string | null
    type?: string
  }
  stationId?: string
}

export function SolarRadiationChart({ cropCycle, stationId }: SolarRadiationChartProps) {
  const {
    dailyData,
    monthlyData,
    isLoading,
    error,
    dateRange
  } = useCropCycleClimate(cropCycle, stationId, { cumulative: true })

  const statistics = useClimateStatistics(dailyData)

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{`Day ${label}`}</p>
          <p className="text-orange-600">{`Cumulative Solar: ${data.totalSolarRadiation.toFixed(1)} MJ/m²`}</p>
          <p className="text-muted-foreground text-sm">{`Date: ${data.date}`}</p>
        </div>
      )
    }
    return null
  }

  const MonthlyTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{label}</p>
          <p className="text-orange-600">{`Total Solar: ${data.totalSolarRadiation.toFixed(1)} MJ/m²`}</p>
          <p className="text-muted-foreground text-sm">{`${data.dayCount} days`}</p>
        </div>
      )
    }
    return null
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sun className="h-5 w-5 text-orange-500" />
            Solar Radiation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            <div className="text-center">
              <Sun className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
              <p>Unable to load solar radiation data</p>
              <p className="text-sm">{error.message}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sun className="h-5 w-5 text-orange-500" />
            Solar Radiation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!dailyData || dailyData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sun className="h-5 w-5 text-orange-500" />
            Solar Radiation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            <div className="text-center">
              <Sun className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
              <p>No solar radiation data available</p>
              <p className="text-sm">for the selected crop cycle period</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Prepare data for charts - add day numbers for X-axis
  const chartData = dailyData.map((record, index) => ({
    ...record,
    day: index + 1,
    date: new Date(record.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sun className="h-5 w-5 text-orange-500" />
          Solar Radiation
        </CardTitle>
        <div className="flex items-center gap-2 mt-2">
          <Badge variant="secondary" className="text-xs">
            {statistics.totalSolarRadiation} MJ/m² total
          </Badge>
          <Badge variant="outline" className="text-xs">
            {statistics.avgDailySolar} MJ/m² avg/day
          </Badge>
          <Badge variant="outline" className="text-xs">
            {dateRange.dayCount} days
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Cumulative Solar Radiation Line Chart */}
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-3">
            Cumulative Solar Radiation Over Crop Cycle
          </h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="solarGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="day" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  label={{ 
                    value: 'Solar Radiation (MJ/m²)', 
                    angle: -90, 
                    position: 'insideLeft',
                    style: { textAnchor: 'middle' }
                  }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="totalSolarRadiation"
                  stroke="#f97316"
                  strokeWidth={2}
                  fill="url(#solarGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Solar Radiation Bar Chart */}
        {monthlyData && monthlyData.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Monthly Solar Radiation Totals
            </h4>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="month" 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    label={{ 
                      value: 'MJ/m²', 
                      angle: -90, 
                      position: 'insideLeft',
                      style: { textAnchor: 'middle' }
                    }}
                  />
                  <Tooltip content={<MonthlyTooltip />} />
                  <Bar 
                    dataKey="totalSolarRadiation" 
                    fill="#f97316"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Summary Statistics */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {statistics.totalSolarRadiation}
            </div>
            <div className="text-xs text-muted-foreground">Total MJ/m²</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {statistics.avgDailySolar}
            </div>
            <div className="text-xs text-muted-foreground">Avg Daily MJ/m²</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
