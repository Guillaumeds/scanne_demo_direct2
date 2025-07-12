'use client'

import React, { useState } from 'react'
import { useBlocNavigation } from '@/contexts/BlocNavigationContext'
import { useCropCycleInfo } from '@/contexts/CropCycleContext'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Icon } from '@/components/ui/icon'
import { IconButton } from '@/components/ui/icon'
import { cn } from '@/lib/utils'
import { DrawnArea } from '@/types/drawnArea'

interface ModernBlocNavigationProps {
  bloc: DrawnArea
  onDelete?: () => void
}

export function ModernBlocNavigation({ bloc, onDelete }: ModernBlocNavigationProps) {
  const { currentTab, navigateToTab, hasUnsavedChanges } = useBlocNavigation()
  const { activeCycleInfo } = useCropCycleInfo()
  const [isEditingBlocName, setIsEditingBlocName] = useState(false)

  // Navigation items
  const navigationItems = [
    {
      id: 'information' as const,
      name: 'Information',
      icon: 'settings' as const,
      description: 'Bloc details and crop cycle information',
      isEnabled: true
    },
    {
      id: 'crop-management' as const,
      name: 'Crop Management',
      icon: 'overview' as const,
      description: 'Field operations and work packages',
      isEnabled: true // Temporarily enabled for testing
    },
    {
      id: 'observations' as const,
      name: 'Observations',
      icon: 'observations' as const,
      description: 'Field observations and monitoring',
      isEnabled: true // Temporarily enabled for testing
    }
  ]

  // Footer navigation items
  const footerNavigationItems = [
    {
      id: 'weather' as const,
      name: 'Weather',
      icon: 'weather' as const,
      description: 'Weather data and forecasts',
      isEnabled: true
    },
    {
      id: 'satellite-soil' as const,
      name: 'Soil Data',
      icon: 'location' as const,
      description: 'Satellite soil analysis',
      isEnabled: true
    },
    {
      id: 'satellite-vegetation' as const,
      name: 'Vegetation',
      icon: 'crop' as const,
      description: 'Satellite vegetation analysis',
      isEnabled: true
    }
  ]

  const handleTabClick = (tabId: typeof currentTab) => {
    if (hasUnsavedChanges) {
      const confirmNavigation = window.confirm(
        'You have unsaved changes. Are you sure you want to leave this page?'
      )
      if (!confirmNavigation) return
    }
    
    navigateToTab(tabId)
  }

  return (
    <div className="h-full flex flex-col">
      {/* Bloc Header */}
      <div className="p-6 border-b border-slate-200">
        <div className="flex items-center gap-3 mb-2">
          <Icon name="location" className="text-emerald-600" />
          <div className="flex-1">
            {isEditingBlocName ? (
              <input
                type="text"
                defaultValue={bloc.name || `Bloc ${bloc.localId}`}
                className="text-lg font-semibold text-slate-900 bg-transparent border-b border-slate-300 focus:border-emerald-500 focus:outline-none"
                onBlur={() => setIsEditingBlocName(false)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') setIsEditingBlocName(false)
                }}
                autoFocus
              />
            ) : (
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-semibold text-slate-900">
                  {bloc.name || `Bloc ${bloc.localId}`}
                </h1>
                <IconButton
                  icon="edit"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditingBlocName(true)}
                  className="text-slate-400 hover:text-slate-600"
                />
              </div>
            )}
          </div>
        </div>
        <p className="text-sm text-slate-600">
          Area: {bloc.area.toFixed(2)} ha
        </p>
      </div>

      {/* Navigation Items */}
      <div className="flex-1 p-4">
        <div className="space-y-2">
          {navigationItems.map((item) => {
            const isActive = currentTab === item.id
            const isDisabled = !item.isEnabled

            return (
              <Button
                key={item.id}
                variant={isActive ? 'secondary' : 'ghost'}
                className={cn(
                  'w-full justify-start h-auto p-4 text-left',
                  isActive && 'bg-emerald-50 text-emerald-700 border-emerald-200',
                  isDisabled && 'opacity-50 cursor-not-allowed'
                )}
                onClick={() => !isDisabled && handleTabClick(item.id)}
                disabled={isDisabled}
              >
                <div className="flex items-center gap-3 w-full">
                  <Icon 
                    name={item.icon} 
                    className={cn(
                      isActive ? 'text-emerald-600' : 'text-slate-600',
                      isDisabled && 'text-slate-400'
                    )}
                  />
                  <div className="flex-1">
                    <div className="font-medium">{item.name}</div>
                    <div className="text-xs text-slate-500 mt-1">
                      {item.description}
                    </div>
                  </div>
                </div>
              </Button>
            )
          })}
        </div>

        {/* No Active Crop Cycle Info */}
        {!activeCycleInfo && (
          <div className="mt-6 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start gap-2">
              <Icon name="info" size="sm" className="text-amber-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-800">No Active Crop Cycle</p>
                <p className="text-xs text-amber-700 mt-1">
                  Create a crop cycle in Information for full functionality. Management and observations are still accessible.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Navigation */}
      <div className="border-t border-slate-200 p-4">
        <h4 className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3">
          Satellite & Weather
        </h4>
        <div className="space-y-1">
          {footerNavigationItems.map((item) => (
            <Button
              key={item.id}
              variant="ghost"
              className="w-full justify-start h-auto p-3 text-left"
              onClick={() => handleTabClick(item.id)}
            >
              <Icon name={item.icon} className="mr-3 text-slate-600" />
              <div>
                <div className="font-medium text-sm">{item.name}</div>
                <div className="text-xs text-slate-500">{item.description}</div>
              </div>
            </Button>
          ))}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-slate-200">
        <div className="space-y-2">
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start"
            onClick={() => {/* Handle bloc settings */}}
          >
            <Icon name="settings" size="sm" className="mr-2" />
            Bloc Settings
          </Button>
          
          {onDelete && (
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50"
              onClick={onDelete}
            >
              <Icon name="delete" size="sm" className="mr-2" />
              Delete Bloc
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
