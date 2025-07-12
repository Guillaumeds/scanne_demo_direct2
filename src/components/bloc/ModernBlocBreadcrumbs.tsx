'use client'

import React from 'react'
import { useBlocNavigation } from '@/contexts/BlocNavigationContext'
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from '@/components/ui/breadcrumb'
import { Icon } from '@/components/ui/icon'
import { IconButton } from '@/components/ui/icon'
import { Badge } from '@/components/ui/badge'

export function ModernBlocBreadcrumbs() {
  const { 
    breadcrumbs, 
    hasUnsavedChanges, 
    navigateBack,
    currentTab,
    currentSubView 
  } = useBlocNavigation()

  // Get current page title
  const getCurrentPageTitle = () => {
    const tabTitles = {
      'information': 'Information',
      'crop-management': 'Crop Management',
      'observations': 'Observations',
      'weather': 'Weather',
      'satellite-soil': 'Soil Data',
      'satellite-vegetation': 'Vegetation Data'
    }
    
    const subViewTitles = {
      'overview': '',
      'form': 'Form',
      'selector': 'Selector',
      'modal': 'Details'
    }

    const tabTitle = tabTitles[currentTab]
    const subViewTitle = subViewTitles[currentSubView]
    
    return subViewTitle ? `${tabTitle} - ${subViewTitle}` : tabTitle
  }

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        {/* Back Button - only show if not on main overview */}
        {currentSubView !== 'overview' && (
          <IconButton
            icon="back"
            variant="ghost"
            onClick={navigateBack}
            className="text-slate-500 hover:text-slate-700"
          />
        )}

        {/* Breadcrumbs */}
        <Breadcrumb>
          <BreadcrumbList>
            {breadcrumbs.map((crumb, index) => (
              <React.Fragment key={index}>
                <BreadcrumbItem>
                  {crumb.onClick ? (
                    <BreadcrumbLink 
                      onClick={crumb.onClick}
                      className="text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                    >
                      {crumb.label}
                    </BreadcrumbLink>
                  ) : crumb.isActive ? (
                    <BreadcrumbPage className="text-slate-900 font-medium">
                      {crumb.label}
                    </BreadcrumbPage>
                  ) : (
                    <span className="text-slate-600">{crumb.label}</span>
                  )}
                </BreadcrumbItem>
                {index < breadcrumbs.length - 1 && (
                  <BreadcrumbSeparator className="text-slate-400" />
                )}
              </React.Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Right side - Status indicators */}
      <div className="flex items-center gap-3">
        {/* Unsaved changes indicator */}
        {hasUnsavedChanges && (
          <Badge variant="secondary" className="bg-amber-100 text-amber-800 border-amber-200">
            <Icon name="warning" size="xs" className="mr-1" />
            Unsaved Changes
          </Badge>
        )}

        {/* Current page title */}
        <div className="text-sm text-slate-600">
          {getCurrentPageTitle()}
        </div>
      </div>
    </div>
  )
}
