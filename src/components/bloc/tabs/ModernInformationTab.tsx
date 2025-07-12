'use client'

import React from 'react'
import { BlocSubView, useBlocNavigation } from '@/contexts/BlocNavigationContext'
import { useCropCycleInfo } from '@/contexts/CropCycleContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Icon } from '@/components/ui/icon'
import { AnimatedCard } from '@/components/ui/animated-card'
import { DrawnArea } from '@/types/drawnArea'

interface ModernInformationTabProps {
  bloc: DrawnArea
  currentSubView: BlocSubView
}

export function ModernInformationTab({ bloc, currentSubView }: ModernInformationTabProps) {
  const { navigateToTab, setCurrentSubView } = useBlocNavigation()
  const { activeCycleInfo, cropCycles } = useCropCycleInfo()

  // If we're in a sub-view, render the appropriate component
  if (currentSubView === 'form') {
    return (
      <div className="p-6">
        <AnimatedCard>
          <CardHeader>
            <CardTitle>Crop Cycle Form</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-slate-500">
              <Icon name="settings" size="xl" className="mx-auto mb-4 opacity-50" />
              <p>Modern Crop Cycle Form will be implemented here</p>
              <p className="text-sm">Create and edit crop cycles with modern UI</p>
            </div>
          </CardContent>
        </AnimatedCard>
      </div>
    )
  }

  if (currentSubView === 'selector') {
    return (
      <div className="p-6">
        <AnimatedCard>
          <CardHeader>
            <CardTitle>Variety Selector</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-slate-500">
              <Icon name="crop" size="xl" className="mx-auto mb-4 opacity-50" />
              <p>Modern Variety Selector will be implemented here</p>
              <p className="text-sm">Select crop varieties with modern interface</p>
            </div>
          </CardContent>
        </AnimatedCard>
      </div>
    )
  }

  // Default overview view
  return (
    <div className="p-6 space-y-6">
      {/* Bloc Information Card */}
      <AnimatedCard delay={0.1}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="location" className="text-emerald-600" />
            Bloc Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-700">Bloc Name</label>
              <p className="text-slate-900">{bloc.name || `Bloc ${bloc.localId}`}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Area</label>
              <p className="text-slate-900">{bloc.area.toFixed(2)} hectares</p>
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium text-slate-700">Coordinates</label>
            <p className="text-slate-600 text-sm">
              {bloc.coordinates.length} coordinate points defined
            </p>
          </div>

          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setCurrentSubView('form')}
            >
              <Icon name="edit" size="sm" className="mr-2" />
              Edit Bloc Details
            </Button>
          </div>
        </CardContent>
      </AnimatedCard>

      {/* Active Crop Cycle Card */}
      <AnimatedCard delay={0.2}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="crop" className="text-green-600" />
            Active Crop Cycle
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activeCycleInfo ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-slate-900">
                    {activeCycleInfo.variety_name} - Cycle {activeCycleInfo.cycle_number}
                  </h3>
                  <p className="text-sm text-slate-600">
                    {activeCycleInfo.cycle_type === 'plantation' ? 'Plantation' : 'Ratoon'} Cycle
                  </p>
                </div>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  Active
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700">Planting Date</label>
                  <p className="text-slate-900">
                    {new Date(activeCycleInfo.planting_date).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Expected Harvest</label>
                  <p className="text-slate-900">
                    {new Date(activeCycleInfo.planned_harvest_date).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">Growth Stage</label>
                <p className="text-slate-900 capitalize">{activeCycleInfo.growth_stage}</p>
              </div>

              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setCurrentSubView('form')}
                >
                  <Icon name="edit" size="sm" className="mr-2" />
                  Edit Cycle
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setCurrentSubView('selector')}
                >
                  <Icon name="crop" size="sm" className="mr-2" />
                  Change Variety
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Icon name="crop" size="xl" className="mx-auto mb-4 text-slate-400" />
              <h3 className="font-medium text-slate-900 mb-2">No Active Crop Cycle</h3>
              <p className="text-slate-600 mb-4">
                Create a crop cycle to start managing this bloc.
              </p>
              <Button 
                onClick={() => setCurrentSubView('form')}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                <Icon name="add" size="sm" className="mr-2" />
                Create Crop Cycle
              </Button>
            </div>
          )}
        </CardContent>
      </AnimatedCard>

      {/* Crop Cycle History */}
      {cropCycles && cropCycles.length > 0 && (
        <AnimatedCard delay={0.3}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="calendar" className="text-blue-600" />
              Crop Cycle History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {cropCycles.slice(0, 5).map((cycle, index) => (
                <div key={cycle.uuid} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div>
                    <p className="font-medium text-slate-900">
                      {cycle.variety_name} - Cycle {cycle.cycle_number}
                    </p>
                    <p className="text-sm text-slate-600">
                      {new Date(cycle.planting_date).toLocaleDateString()} - 
                      {cycle.actual_harvest_date 
                        ? new Date(cycle.actual_harvest_date).toLocaleDateString()
                        : 'Ongoing'
                      }
                    </p>
                  </div>
                  <Badge variant={cycle.status === 'active' ? 'default' : 'outline'}>
                    {cycle.status}
                  </Badge>
                </div>
              ))}
              
              {cropCycles.length > 5 && (
                <Button variant="ghost" size="sm" className="w-full">
                  View All {cropCycles.length} Cycles
                </Button>
              )}
            </div>
          </CardContent>
        </AnimatedCard>
      )}
    </div>
  )
}
