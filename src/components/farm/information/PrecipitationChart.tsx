'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CloudRain, BarChart3 } from 'lucide-react'
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

interface PrecipitationChartProps {
  cropCycle: {
    plantingDate?: string | null
    plannedHarvestDate?: string | null
    actualHarvestDate?: string | null
    type?: string
  }
  stationId?: string
}

export function PrecipitationChart({ cropCycle, stationId }: PrecipitationChartProps) {
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
          <p className="text-blue-600">{`Cumulative Precipitation: ${data.totalPrecipitation.toFixed(1)} mm`}</p>
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
          <p className="text-blue-600">{`Total Precipitation: ${data.totalPrecipitation.toFixed(1)} mm`}</p>
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
            <CloudRain className="h-5 w-5 text-blue-500" />
            Precipitation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            <div className="text-center">
              <CloudRain className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
              <p>Unable to load precipitation data</p>
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
            <CloudRain className="h-5 w-5 text-blue-500" />
            Precipitation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
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
            <CloudRain className="h-5 w-5 text-blue-500" />
            Precipitation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            <div className="text-center">
              <CloudRain className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
              <p>No precipitation data available</p>
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
          <CloudRain className="h-5 w-5 text-blue-500" />
          Precipitation
        </CardTitle>
        <div className="flex items-center gap-2 mt-2">
          <Badge variant="secondary" className="text-xs">
            {statistics.totalPrecipitation} mm total
          </Badge>
          <Badge variant="outline" className="text-xs">
            {statistics.avgDailyPrecipitation} mm avg/day
          </Badge>
          <Badge variant="outline" className="text-xs">
            {dateRange.dayCount} days
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Cumulative Precipitation Line Chart */}
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-3">
            Cumulative Precipitation Over Crop Cycle
          </h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="precipitationGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
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
                    value: 'Precipitation (mm)', 
                    angle: -90, 
                    position: 'insideLeft',
                    style: { textAnchor: 'middle' }
                  }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="totalPrecipitation"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fill="url(#precipitationGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Precipitation Bar Chart */}
        {monthlyData && monthlyData.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Monthly Precipitation Totals
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
                      value: 'mm', 
                      angle: -90, 
                      position: 'insideLeft',
                      style: { textAnchor: 'middle' }
                    }}
                  />
                  <Tooltip content={<MonthlyTooltip />} />
                  <Bar 
                    dataKey="totalPrecipitation" 
                    fill="#3b82f6"
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
            <div className="text-2xl font-bold text-blue-600">
              {statistics.totalPrecipitation}
            </div>
            <div className="text-xs text-muted-foreground">Total mm</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {statistics.avgDailyPrecipitation}
            </div>
            <div className="text-xs text-muted-foreground">Avg Daily mm</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
