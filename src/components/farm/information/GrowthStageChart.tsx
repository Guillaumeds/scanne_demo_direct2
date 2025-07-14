'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp } from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts'

export function GrowthStageChart() {
  // Mock growth data over time
  const growthData = [
    { day: 0, height: 0, stage: 'Planting' },
    { day: 30, height: 15, stage: 'Germination' },
    { day: 60, height: 45, stage: 'Tillering' },
    { day: 90, height: 85, stage: 'Tillering' },
    { day: 120, height: 140, stage: 'Grand Growth' },
    { day: 150, height: 210, stage: 'Grand Growth' },
    { day: 180, height: 280, stage: 'Grand Growth' },
    { day: 210, height: 320, stage: 'Maturation' },
    { day: 240, height: 340, stage: 'Maturation' },
    { day: 270, height: 350, stage: 'Maturation' },
    { day: 300, height: 355, stage: 'Pre-Harvest' }
  ]

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{`Day ${label}`}</p>
          <p className="text-primary">{`Height: ${data.height}cm`}</p>
          <p className="text-muted-foreground text-sm">{`Stage: ${data.stage}`}</p>
        </div>
      )
    }
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Growth Progress
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={growthData}>
              <defs>
                <linearGradient id="growthGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
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
                  value: 'Height (cm)', 
                  angle: -90, 
                  position: 'insideLeft',
                  style: { textAnchor: 'middle' }
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="height"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                fill="url(#growthGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        
        {/* Growth Stage Indicators */}
        <div className="mt-4 space-y-2">
          <div className="text-sm font-medium text-muted-foreground">Current Stage: Tillering</div>
          <div className="flex flex-wrap gap-2">
            {['Germination', 'Tillering', 'Grand Growth', 'Maturation', 'Harvest'].map((stage, index) => (
              <div
                key={stage}
                className={`px-2 py-1 rounded-full text-xs ${
                  index <= 1 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {stage}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
