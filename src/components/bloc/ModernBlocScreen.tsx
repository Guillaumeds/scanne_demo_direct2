'use client'

import React from 'react'
import { BlocNavigationProvider, useBlocNavigation } from '@/contexts/BlocNavigationContext'
import { CropCycleProvider } from '@/contexts/CropCycleContext'
import { SelectedCropCycleProvider } from '@/contexts/SelectedCropCycleContext'
import { ModernBlocNavigation } from './ModernBlocNavigation'
import { ModernBlocBreadcrumbs } from './ModernBlocBreadcrumbs'
import { ModernBlocContent } from './ModernBlocContent'
import { DrawnArea } from '@/types/drawnArea'

interface ModernBlocScreenProps {
  bloc: DrawnArea
  onBack: () => void
  onDelete?: () => void
}

// Inner component that uses the navigation context
function ModernBlocScreenInner({ bloc, onBack, onDelete }: ModernBlocScreenProps) {
  const { currentTab, currentSubView } = useBlocNavigation()

  return (
    <div className="h-full flex flex-col bg-slate-50">
      {/* Header with Breadcrumbs */}
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <ModernBlocBreadcrumbs />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Navigation Panel */}
        <div className="w-64 bg-white border-r border-slate-200">
          <ModernBlocNavigation bloc={bloc} onDelete={onDelete} />
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden">
          <ModernBlocContent 
            bloc={bloc} 
            currentTab={currentTab}
            currentSubView={currentSubView}
          />
        </div>
      </div>
    </div>
  )
}

// Main component with all providers
export function ModernBlocScreen({ bloc, onBack, onDelete }: ModernBlocScreenProps) {
  // Validate that bloc is saved and has UUID before creating crop cycles
  if (!bloc.uuid) {
    throw new Error(`Cannot open bloc details: Bloc "${bloc.localId}" must be saved to database first`)
  }

  return (
    <CropCycleProvider blocId={bloc.uuid} userRole="user">
      <SelectedCropCycleProvider>
        <BlocNavigationProvider 
          blocName={bloc.name || `Bloc ${bloc.localId}`}
          onNavigateAway={onBack}
        >
          <ModernBlocScreenInner 
            bloc={bloc} 
            onBack={onBack} 
            onDelete={onDelete} 
          />
        </BlocNavigationProvider>
      </SelectedCropCycleProvider>
    </CropCycleProvider>
  )
}
