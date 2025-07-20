'use client'

import React from 'react'
import { motion } from 'motion/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Calendar, MapPin, Sprout, TrendingUp, DollarSign, Clock } from 'lucide-react'
import { useBlocContext } from '../contexts/BlocContext'
import { CropCycleSelector } from './CropCycleSelector'
import { BlocMetrics } from './BlocMetrics'
import { GrowthStageChart } from './GrowthStageChart'
// Charts removed for demo mode

export function InformationScreen() {
  const { bloc } = useBlocContext()

  // Mock data - in real app, this would come from TanStack Query
  const cropCycleData = {
    currentCycle: {
      id: '1',
      cycleNumber: 1,
      variety: 'NCo 376',
      plantingDate: '2024-03-15',
      expectedHarvestDate: '2025-02-15',
      growthStage: 'Tillering',
      daysSincePlanting: 142,
      progress: 65
    },
    metrics: {
      totalOperations: 12,
      completedOperations: 8,
      totalCost: 45000,
      actualCost: 32000,
      expectedYield: 85.2
    }
  }

  return (
    <div className="h-full overflow-auto">
      <div className="p-6 space-y-6">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="bg-gradient-to-r from-primary/20 to-primary/30 border-primary/40 bg-white/90">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl text-primary">
                    {bloc.name || `Bloc ${bloc.localId}`}
                  </CardTitle>
                  <CardDescription className="text-lg mt-2">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {bloc.area.toFixed(1)} hectares
                      </span>
                      <span className="flex items-center gap-1">
                        <Sprout className="h-4 w-4" />
                        {cropCycleData.currentCycle.variety}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Cycle {cropCycleData.currentCycle.cycleNumber}
                      </span>
                    </div>
                  </CardDescription>
                </div>
                <Badge variant="secondary" className="text-lg px-4 py-2">
                  {cropCycleData.currentCycle.growthStage}
                </Badge>
              </div>
            </CardHeader>
          </Card>
        </motion.div>

        {/* Crop Cycle Selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <CropCycleSelector currentCycle={cropCycleData.currentCycle} />
        </motion.div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              title: "Days Since Planting",
              icon: Clock,
              value: cropCycleData.currentCycle.daysSincePlanting,
              subtitle: "Expected harvest in 89 days",
              delay: 0.2
            },
            {
              title: "Operations Progress",
              icon: TrendingUp,
              value: `${cropCycleData.metrics.completedOperations}/${cropCycleData.metrics.totalOperations}`,
              subtitle: "67% complete",
              progress: 67,
              delay: 0.3
            },
            {
              title: "Budget Status",
              icon: DollarSign,
              value: `Rs ${cropCycleData.metrics.actualCost.toLocaleString()}`,
              subtitle: `of Rs ${cropCycleData.metrics.totalCost.toLocaleString()} budget`,
              progress: 71,
              delay: 0.4
            },
            {
              title: "Expected Yield",
              icon: Sprout,
              value: cropCycleData.metrics.expectedYield,
              subtitle: "tons per hectare",
              delay: 0.5
            }
          ].map((metric, index) => {
            const Icon = metric.icon
            return (
              <motion.div
                key={metric.title}
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{
                  duration: 0.4,
                  delay: metric.delay,
                  ease: [0.4, 0, 0.2, 1]
                }}
                whileHover={{
                  y: -4,
                  transition: { duration: 0.2 }
                }}
              >
                <Card className="relative overflow-hidden group">
                  {/* Hover gradient effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100"
                    transition={{ duration: 0.3 }}
                  />

                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Icon className="h-4 w-4 text-muted-foreground" />
                    </motion.div>
                  </CardHeader>
                  <CardContent>
                    <motion.div
                      className="text-2xl font-bold text-primary"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: metric.delay + 0.2, type: "spring", bounce: 0.4 }}
                    >
                      {metric.value}
                    </motion.div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {metric.subtitle}
                    </p>
                    {metric.progress && (
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: "100%" }}
                        transition={{ delay: metric.delay + 0.4, duration: 0.6 }}
                        className="mt-2"
                      >
                        <Progress value={metric.progress} className="h-2" />
                      </motion.div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>

        {/* Charts and Detailed Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <GrowthStageChart />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
          >
            <BlocMetrics />
          </motion.div>
        </div>

        {/* Climate Data Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.5 }}
          >
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-medium text-slate-800 mb-4">Solar Radiation</h3>
              <p className="text-slate-600">Climate monitoring features are not available in demo mode.</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.6 }}
          >
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-medium text-slate-800 mb-4">Precipitation</h3>
              <p className="text-slate-600">Climate monitoring features are not available in demo mode.</p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
