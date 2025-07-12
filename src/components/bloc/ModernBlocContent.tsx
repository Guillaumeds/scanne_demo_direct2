'use client'

import React from 'react'
import { BlocTab, BlocSubView } from '@/contexts/BlocNavigationContext'
import { PageTransition } from '@/components/ui/page-transition'
import { DrawnArea } from '@/types/drawnArea'

// Import tab components (these will be modernized versions)
import { ModernInformationTab } from './tabs/ModernInformationTab'
import { ModernCropManagementTab } from './tabs/ModernCropManagementTab'
import { ModernObservationsTab } from './tabs/ModernObservationsTab'
import WeatherDashboard from '@/components/WeatherDashboard'
import SoilDataTab from '@/components/SoilDataTab'
import VegetationDataTab from '@/components/VegetationDataTab'

interface ModernBlocContentProps {
  bloc: DrawnArea
  currentTab: BlocTab
  currentSubView: BlocSubView
}

export function ModernBlocContent({ 
  bloc, 
  currentTab, 
  currentSubView 
}: ModernBlocContentProps) {
  
  const renderTabContent = () => {
    switch (currentTab) {
      case 'information':
        return (
          <ModernInformationTab 
            bloc={bloc} 
            currentSubView={currentSubView}
          />
        )
      
      case 'crop-management':
        return (
          <ModernCropManagementTab 
            bloc={bloc} 
            currentSubView={currentSubView}
          />
        )
      
      case 'observations':
        return (
          <ModernObservationsTab
            bloc={bloc}
            currentSubView={currentSubView}
          />
        )

      case 'weather':
        return (
          <div className="p-6">
            <WeatherDashboard drawnAreas={[{
              id: bloc.uuid || bloc.localId,
              coordinates: bloc.coordinates,
              area: bloc.area,
              name: bloc.name
            }]} />
          </div>
        )

      case 'satellite-soil':
        return (
          <div className="p-6">
            <SoilDataTab bloc={bloc} />
          </div>
        )

      case 'satellite-vegetation':
        return (
          <div className="p-6">
            <VegetationDataTab bloc={bloc} />
          </div>
        )

      default:
        return (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-slate-900 mb-2">
                Tab Not Found
              </h2>
              <p className="text-slate-600">
                The requested tab could not be found.
              </p>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="h-full overflow-hidden">
      <PageTransition key={`${currentTab}-${currentSubView}`}>
        {renderTabContent()}
      </PageTransition>
    </div>
  )
}
