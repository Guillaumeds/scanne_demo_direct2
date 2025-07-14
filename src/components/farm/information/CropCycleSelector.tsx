'use client'

import React, { useState } from 'react'
import { motion } from 'motion/react'
import { ChevronDown, Plus, Calendar, Sprout } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface CropCycle {
  id: string
  cycleNumber: number
  variety: string
  plantingDate: string
  expectedHarvestDate: string
  growthStage: string
  daysSincePlanting: number
  progress: number
}

interface CropCycleSelectorProps {
  currentCycle: CropCycle
}

export function CropCycleSelector({ currentCycle }: CropCycleSelectorProps) {
  const [selectedCycleId, setSelectedCycleId] = useState(currentCycle.id)

  // Mock data for available cycles
  const availableCycles = [
    currentCycle,
    {
      id: '2',
      cycleNumber: 2,
      variety: 'NCo 376',
      plantingDate: '2023-03-10',
      expectedHarvestDate: '2024-02-10',
      growthStage: 'Harvested',
      daysSincePlanting: 365,
      progress: 100
    }
  ]

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getStatusColor = (stage: string) => {
    switch (stage.toLowerCase()) {
      case 'harvested':
        return 'bg-gray-100 text-gray-800'
      case 'tillering':
        return 'bg-primary/10 text-primary'
      case 'grand growth':
        return 'bg-green-100 text-green-800'
      case 'maturation':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-primary/10 text-primary'
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Sprout className="h-5 w-5 text-primary" />
            Crop Cycle Management
          </CardTitle>
          <Button variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            New Cycle
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Cycle Selector */}
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <label className="text-sm font-medium text-muted-foreground mb-2 block">
              Active Crop Cycle
            </label>
            <Select value={selectedCycleId} onValueChange={setSelectedCycleId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a crop cycle" />
              </SelectTrigger>
              <SelectContent>
                {availableCycles.map((cycle) => (
                  <SelectItem key={cycle.id} value={cycle.id}>
                    <div className="flex items-center gap-2">
                      <span>Cycle {cycle.cycleNumber}</span>
                      <Badge variant="outline" className={getStatusColor(cycle.growthStage)}>
                        {cycle.growthStage}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Current Cycle Details */}
        <motion.div
          key={selectedCycleId}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="bg-muted/30 rounded-lg p-4 space-y-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="text-sm font-medium text-muted-foreground">Variety</div>
              <div className="text-lg font-semibold">{currentCycle.variety}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Planting Date</div>
              <div className="text-lg font-semibold flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {formatDate(currentCycle.plantingDate)}
              </div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Expected Harvest</div>
              <div className="text-lg font-semibold flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {formatDate(currentCycle.expectedHarvestDate)}
              </div>
            </div>
          </div>

          {/* Growth Progress */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Growth Progress</span>
              <Badge className={getStatusColor(currentCycle.growthStage)}>
                {currentCycle.growthStage}
              </Badge>
            </div>
            <Progress value={currentCycle.progress} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>Day {currentCycle.daysSincePlanting}</span>
              <span>{currentCycle.progress}% complete</span>
            </div>
          </div>

          {/* Timeline Visualization */}
          <div className="space-y-2">
            <div className="text-sm font-medium text-muted-foreground">Growth Timeline</div>
            <div className="flex items-center gap-2 text-xs">
              <div className="flex-1 bg-primary/20 h-2 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-500"
                  style={{ width: `${currentCycle.progress}%` }}
                />
              </div>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Planting</span>
              <span>Tillering</span>
              <span>Grand Growth</span>
              <span>Maturation</span>
              <span>Harvest</span>
            </div>
          </div>
        </motion.div>
      </CardContent>
    </Card>
  )
}
