'use client'

import React, { createContext, useContext, useState, useCallback } from 'react'

// Navigation state types
export type BlocTab = 'information' | 'crop-management' | 'observations' | 'weather' | 'satellite-soil' | 'satellite-vegetation'
export type BlocSubView = 'overview' | 'form' | 'selector' | 'modal'
export type FormType = 'operation' | 'work-package' | null

export interface BreadcrumbItem {
  label: string
  href?: string
  onClick?: () => void
  isActive?: boolean
}

export interface NavigationState {
  currentTab: BlocTab
  currentSubView: BlocSubView
  currentFormType: FormType
  breadcrumbs: BreadcrumbItem[]
  canNavigateAway: boolean
  hasUnsavedChanges: boolean
}

export interface NavigationActions {
  setCurrentTab: (tab: BlocTab) => void
  setCurrentSubView: (subView: BlocSubView) => void
  setCurrentFormType: (formType: FormType) => void
  setBreadcrumbs: (breadcrumbs: BreadcrumbItem[]) => void
  setCanNavigateAway: (canNavigate: boolean) => void
  setHasUnsavedChanges: (hasChanges: boolean) => void
  navigateToTab: (tab: BlocTab, subView?: BlocSubView) => void
  navigateToForm: (formType: FormType) => void
  navigateBack: () => void
  resetNavigation: () => void
}

export interface BlocNavigationContextType extends NavigationState, NavigationActions {}

const BlocNavigationContext = createContext<BlocNavigationContextType | undefined>(undefined)

interface BlocNavigationProviderProps {
  children: React.ReactNode
  blocName: string
  initialTab?: BlocTab
  onNavigateAway?: () => void
}

export function BlocNavigationProvider({
  children,
  blocName,
  initialTab = 'information',
  onNavigateAway
}: BlocNavigationProviderProps) {
  const [currentTab, setCurrentTab] = useState<BlocTab>(initialTab)
  const [currentSubView, setCurrentSubView] = useState<BlocSubView>('overview')
  const [currentFormType, setCurrentFormType] = useState<FormType>(null)
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([
    { label: 'Farm', onClick: onNavigateAway },
    { label: blocName, isActive: true }
  ])
  const [canNavigateAway, setCanNavigateAway] = useState(true)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  // Navigation history for back functionality
  const [navigationHistory, setNavigationHistory] = useState<Array<{
    tab: BlocTab
    subView: BlocSubView
  }>>([])

  const resetNavigation = useCallback(() => {
    setCurrentTab('information')
    setCurrentSubView('overview')
    setNavigationHistory([])
    setHasUnsavedChanges(false)
    setCanNavigateAway(true)
    setBreadcrumbs([
      { label: 'Farm', onClick: onNavigateAway },
      { label: blocName, isActive: true }
    ])
  }, [blocName, onNavigateAway])

  const navigateToTab = useCallback((tab: BlocTab, subView: BlocSubView = 'overview') => {
    // Check if we can navigate away
    if (!canNavigateAway && hasUnsavedChanges) {
      const confirmNavigation = window.confirm(
        'You have unsaved changes. Are you sure you want to leave this page?'
      )
      if (!confirmNavigation) return
    }

    // Add current state to history
    setNavigationHistory(prev => [...prev, { tab: currentTab, subView: currentSubView }])

    // Update navigation state
    setCurrentTab(tab)
    setCurrentSubView(subView)
    
    // Reset change tracking
    setHasUnsavedChanges(false)
    setCanNavigateAway(true)

    // Update breadcrumbs
    const newBreadcrumbs: BreadcrumbItem[] = [
      { label: 'Farm', onClick: onNavigateAway },
      { label: blocName, onClick: () => resetNavigation() }
    ]

    // Add tab breadcrumb
    const tabLabels: Record<BlocTab, string> = {
      'information': 'Information',
      'crop-management': 'Crop Management',
      'observations': 'Observations',
      'weather': 'Weather',
      'satellite-soil': 'Soil Data',
      'satellite-vegetation': 'Vegetation Data'
    }
    
    newBreadcrumbs.push({
      label: tabLabels[tab],
      isActive: subView === 'overview'
    })

    // Add sub-view breadcrumb if not overview
    if (subView !== 'overview') {
      const subViewLabels: Record<BlocSubView, string> = {
        'overview': 'Overview',
        'form': 'Form',
        'selector': 'Selector',
        'modal': 'Details'
      }
      
      newBreadcrumbs.push({
        label: subViewLabels[subView],
        isActive: true
      })
    }

    setBreadcrumbs(newBreadcrumbs)
  }, [currentTab, currentSubView, canNavigateAway, hasUnsavedChanges, blocName, onNavigateAway])

  const navigateToForm = useCallback((formType: FormType) => {
    setCurrentFormType(formType)
    setCurrentSubView('form')

    // Update breadcrumbs for form navigation
    const newBreadcrumbs: BreadcrumbItem[] = [
      { label: 'Farm', onClick: onNavigateAway },
      { label: blocName, onClick: () => resetNavigation() },
      { label: 'Crop Management', onClick: () => navigateToTab('crop-management') }
    ]

    if (formType === 'operation') {
      newBreadcrumbs.push({ label: 'Field Operation', isActive: true })
    } else if (formType === 'work-package') {
      newBreadcrumbs.push(
        { label: 'Field Operation', onClick: () => setCurrentFormType('operation') },
        { label: 'Daily Work Package', isActive: true }
      )
    }

    setBreadcrumbs(newBreadcrumbs)
  }, [blocName, onNavigateAway, navigateToTab, resetNavigation])

  const navigateBack = useCallback(() => {
    if (navigationHistory.length > 0) {
      const previousState = navigationHistory[navigationHistory.length - 1]
      setNavigationHistory(prev => prev.slice(0, -1))
      navigateToTab(previousState.tab, previousState.subView)
    } else {
      // No history, go back to overview of current tab
      setCurrentSubView('overview')
    }
  }, [navigationHistory, navigateToTab])

  const contextValue: BlocNavigationContextType = {
    // State
    currentTab,
    currentSubView,
    currentFormType,
    breadcrumbs,
    canNavigateAway,
    hasUnsavedChanges,

    // Actions
    setCurrentTab,
    setCurrentSubView,
    setCurrentFormType,
    setBreadcrumbs,
    setCanNavigateAway,
    setHasUnsavedChanges,
    navigateToTab,
    navigateToForm,
    navigateBack,
    resetNavigation
  }

  return (
    <BlocNavigationContext.Provider value={contextValue}>
      {children}
    </BlocNavigationContext.Provider>
  )
}

export function useBlocNavigation() {
  const context = useContext(BlocNavigationContext)
  if (context === undefined) {
    throw new Error('useBlocNavigation must be used within a BlocNavigationProvider')
  }
  return context
}

// Convenience hooks for specific navigation actions
export function useBlocTab() {
  const { currentTab, navigateToTab } = useBlocNavigation()
  return { currentTab, navigateToTab }
}

export function useBlocBreadcrumbs() {
  const { breadcrumbs, setBreadcrumbs } = useBlocNavigation()
  return { breadcrumbs, setBreadcrumbs }
}

export function useBlocUnsavedChanges() {
  const { 
    hasUnsavedChanges, 
    setHasUnsavedChanges, 
    canNavigateAway, 
    setCanNavigateAway 
  } = useBlocNavigation()
  
  return { 
    hasUnsavedChanges, 
    setHasUnsavedChanges, 
    canNavigateAway, 
    setCanNavigateAway 
  }
}
