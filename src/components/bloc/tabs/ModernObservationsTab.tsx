'use client'

import React, { useState } from 'react'
import { BlocSubView, useBlocNavigation } from '@/contexts/BlocNavigationContext'
import { useCropCycleInfo } from '@/contexts/CropCycleContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Icon } from '@/components/ui/icon'
import { IconButton } from '@/components/ui/icon'
import { AnimatedCard, AnimatedCardGrid } from '@/components/ui/animated-card'
import { DrawnArea } from '@/types/drawnArea'

interface ModernObservationsTabProps {
  bloc: DrawnArea
  currentSubView: BlocSubView
}

// Mock observation data - replace with real data
const mockObservations = [
  {
    id: '1',
    date: '2024-01-15',
    type: 'Growth Assessment',
    category: 'growth',
    notes: 'Good tillering observed across the field. Plants showing healthy green color.',
    images: 2,
    weather: 'Sunny, 28°C',
    author: 'Field Manager'
  },
  {
    id: '2',
    date: '2024-01-10',
    type: 'Pest Monitoring',
    category: 'pest',
    notes: 'Minor aphid presence detected in northeast corner. Monitoring required.',
    images: 3,
    weather: 'Cloudy, 26°C',
    author: 'Agronomist'
  },
  {
    id: '3',
    date: '2024-01-05',
    type: 'Soil Condition',
    category: 'soil',
    notes: 'Soil moisture adequate after recent irrigation. Good field capacity.',
    images: 1,
    weather: 'Partly cloudy, 27°C',
    author: 'Field Manager'
  }
]

export function ModernObservationsTab({ bloc, currentSubView }: ModernObservationsTabProps) {
  const { getActiveCycleInfo } = useCropCycleInfo()
  const activeCycleInfo = getActiveCycleInfo()
  const { setCurrentSubView } = useBlocNavigation()
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  // Observation form sub-view
  if (currentSubView === 'form') {
    return (
      <div className="p-6">
        <AnimatedCard>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="add" className="text-emerald-600" />
              New Observation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">
                  Observation Type
                </label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="growth">Growth Assessment</SelectItem>
                    <SelectItem value="pest">Pest Monitoring</SelectItem>
                    <SelectItem value="disease">Disease Check</SelectItem>
                    <SelectItem value="soil">Soil Condition</SelectItem>
                    <SelectItem value="weather">Weather Impact</SelectItem>
                    <SelectItem value="irrigation">Irrigation Status</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">
                  Date
                </label>
                <Input type="date" defaultValue={new Date().toISOString().split('T')[0]} />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">
                Observation Notes
              </label>
              <Textarea 
                placeholder="Describe your observations in detail..."
                className="min-h-[120px]"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">
                Weather Conditions
              </label>
              <Input placeholder="e.g., Sunny, 28°C, Light breeze" />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">
                Photos
              </label>
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center">
                <Icon name="image" size="lg" className="mx-auto mb-2 text-slate-400" />
                <p className="text-slate-600 mb-2">Click to upload photos</p>
                <p className="text-xs text-slate-500">PNG, JPG up to 10MB each</p>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button 
                onClick={() => setCurrentSubView('overview')}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                <Icon name="save" size="sm" className="mr-2" />
                Save Observation
              </Button>
              <Button 
                variant="outline"
                onClick={() => setCurrentSubView('overview')}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </AnimatedCard>
      </div>
    )
  }

  // Filter observations by category
  const filteredObservations = selectedCategory === 'all' 
    ? mockObservations 
    : mockObservations.filter(obs => obs.category === selectedCategory)

  // Get category badge variant
  const getCategoryVariant = (category: string) => {
    switch (category) {
      case 'growth': return 'default'
      case 'pest': return 'destructive'
      case 'disease': return 'destructive'
      case 'soil': return 'secondary'
      case 'weather': return 'outline'
      case 'irrigation': return 'secondary'
      default: return 'outline'
    }
  }

  // Default overview
  return (
    <div className="p-6 space-y-6">

      {/* Header with filters and actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Field Observations</h2>
          <p className="text-sm text-slate-600">
            Track field conditions and crop development
          </p>
        </div>

        <Button
          onClick={() => setCurrentSubView('form')}
          className="bg-emerald-600 hover:bg-emerald-700"
        >
          <Icon name="add" size="sm" className="mr-2" />
          New Observation
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-slate-700">Filter by:</label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="growth">Growth Assessment</SelectItem>
                <SelectItem value="pest">Pest Monitoring</SelectItem>
                <SelectItem value="disease">Disease Check</SelectItem>
                <SelectItem value="soil">Soil Condition</SelectItem>
                <SelectItem value="weather">Weather Impact</SelectItem>
                <SelectItem value="irrigation">Irrigation Status</SelectItem>
              </SelectContent>
            </Select>
            
            <div className="text-sm text-slate-600">
              {filteredObservations.length} observation{filteredObservations.length !== 1 ? 's' : ''}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Observations Grid */}
      <AnimatedCardGrid columns={1} gap="md">
        {filteredObservations.map((observation, index) => (
          <AnimatedCard key={observation.id} delay={index * 0.1}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Icon 
                    name="observations" 
                    className="text-emerald-600" 
                  />
                  <div>
                    <h3 className="font-medium text-slate-900">{observation.type}</h3>
                    <p className="text-sm text-slate-600">{observation.date}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge variant={getCategoryVariant(observation.category)}>
                    {observation.category}
                  </Badge>
                  <IconButton
                    icon="edit"
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentSubView('form')}
                  />
                </div>
              </div>

              <p className="text-slate-700 mb-4">{observation.notes}</p>

              <div className="flex items-center justify-between text-sm text-slate-600">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <Icon name="image" size="sm" />
                    {observation.images} photo{observation.images !== 1 ? 's' : ''}
                  </span>
                  <span className="flex items-center gap-1">
                    <Icon name="weather" size="sm" />
                    {observation.weather}
                  </span>
                </div>
                <span>by {observation.author}</span>
              </div>
            </CardContent>
          </AnimatedCard>
        ))}
      </AnimatedCardGrid>

      {/* Empty state */}
      {filteredObservations.length === 0 && (
        <AnimatedCard>
          <CardContent className="text-center py-12">
            <Icon name="observations" size="xl" className="mx-auto mb-4 text-slate-400" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">
              No observations found
            </h3>
            <p className="text-slate-600 mb-4">
              {selectedCategory === 'all' 
                ? 'Start tracking field conditions by creating your first observation.'
                : `No observations found for the selected category.`
              }
            </p>
            <Button 
              onClick={() => setCurrentSubView('form')}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              <Icon name="add" size="sm" className="mr-2" />
              Create First Observation
            </Button>
          </CardContent>
        </AnimatedCard>
      )}
    </div>
  )
}
