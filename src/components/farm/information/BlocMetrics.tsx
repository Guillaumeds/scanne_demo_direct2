'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Activity, DollarSign, Users, Truck } from 'lucide-react'
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts'

export function BlocMetrics() {
  // Mock metrics data
  const costBreakdown = [
    { name: 'Labor', value: 15000, color: 'hsl(var(--chart-1))' },
    { name: 'Materials', value: 12000, color: 'hsl(var(--chart-2))' },
    { name: 'Equipment', value: 8000, color: 'hsl(var(--chart-3))' },
    { name: 'Other', value: 3000, color: 'hsl(var(--chart-4))' }
  ]

  const monthlyProgress = [
    { month: 'Jan', operations: 2, cost: 8000 },
    { month: 'Feb', operations: 3, cost: 12000 },
    { month: 'Mar', operations: 4, cost: 15000 },
    { month: 'Apr', operations: 2, cost: 7000 },
    { month: 'May', operations: 1, cost: 5000 }
  ]

  const recentActivities = [
    { id: 1, type: 'Fertilization', date: '2024-07-10', status: 'completed', cost: 2500 },
    { id: 2, type: 'Irrigation', date: '2024-07-08', status: 'in-progress', cost: 800 },
    { id: 3, type: 'Pest Control', date: '2024-07-05', status: 'completed', cost: 1200 },
    { id: 4, type: 'Soil Testing', date: '2024-07-01', status: 'completed', cost: 300 }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800'
      case 'planned':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{payload[0].payload.month}</p>
          <p className="text-primary">{`Operations: ${payload[0].value}`}</p>
          <p className="text-muted-foreground">{`Cost: $${payload[1]?.value.toLocaleString()}`}</p>
        </div>
      )
    }
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          Activity & Performance
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Cost Breakdown Pie Chart */}
        <div>
          <h4 className="text-sm font-medium mb-3">Cost Breakdown</h4>
          <div className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={costBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={30}
                  outerRadius={60}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {costBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any) => [`Rs ${value.toLocaleString()}`, 'Cost']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {costBreakdown.map((item, index) => (
              <div key={index} className="flex items-center gap-2 text-xs">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: item.color }}
                />
                <span>{item.name}: Rs {item.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Progress */}
        <div>
          <h4 className="text-sm font-medium mb-3">Monthly Activity</h4>
          <div className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyProgress}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="month" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis hide />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="operations" 
                  fill="hsl(var(--primary))" 
                  radius={[2, 2, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activities */}
        <div>
          <h4 className="text-sm font-medium mb-3">Recent Activities</h4>
          <div className="space-y-2">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between p-2 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <div>
                    <div className="text-sm font-medium">{activity.type}</div>
                    <div className="text-xs text-muted-foreground">{activity.date}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">${activity.cost.toLocaleString()}</span>
                  <Badge variant="outline" className={getStatusColor(activity.status)}>
                    {activity.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
          <div className="text-center">
            <div className="text-lg font-bold text-primary">12</div>
            <div className="text-xs text-muted-foreground">Total Operations</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-primary">8</div>
            <div className="text-xs text-muted-foreground">Completed</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-primary">67%</div>
            <div className="text-xs text-muted-foreground">Efficiency</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
