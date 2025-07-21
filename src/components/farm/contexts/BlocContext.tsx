'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react'
import { DrawnArea } from '@/types/drawnArea'
import { useBlocData, useCropCycles, useFieldOperations, useWorkPackages } from '@/hooks/useBlocData'
import { useDemoDeleteBloc } from '@/hooks/useDemoFarmData'
import { BlocData } from '@/services/blocDataService'

type BlocScreen = 'information' | 'operations' | 'crop-cycle-management' | 'operation-form' | 'work-package-form'

interface BlocContextType {
  bloc: DrawnArea
  currentScreen: BlocScreen
  setCurrentScreen: (screen: BlocScreen) => void
  currentOperationId?: string
  setCurrentOperationId: (id?: string) => void
  currentWorkPackageId?: string
  setCurrentWorkPackageId: (id?: string) => void
  onBack: () => void
  onDelete?: () => void
  farmName: string
  breadcrumbs: BreadcrumbItem[]
  // Comprehensive bloc data from TanStack Query
  blocData: BlocData | undefined
  isLoadingBlocData: boolean
  blocDataError: Error | null
  // Derived data hooks
  cropCycles: ReturnType<typeof useCropCycles>
  fieldOperations: ReturnType<typeof useFieldOperations>
  workPackages: ReturnType<typeof useWorkPackages>
}

interface BreadcrumbItem {
  label: string
  href?: string
  isActive?: boolean
}

interface BlocProviderProps {
  bloc: DrawnArea
  onBack: () => void
  onDelete?: () => void
  children: ReactNode
}

const BlocContext = createContext<BlocContextType | undefined>(undefined)

export function BlocProvider({ bloc, onBack, onDelete, children }: BlocProviderProps) {
  const [currentScreen, setCurrentScreen] = useState<BlocScreen>('information')
  const [currentOperationId, setCurrentOperationId] = useState<string>()
  const [currentWorkPackageId, setCurrentWorkPackageId] = useState<string>()

  // Get farm name from bloc or default
  const farmName = "Sugarcane Farm" // TODO: Get from bloc data or context

  // Load comprehensive bloc data using TanStack Query
  const {
    data: blocData,
    isLoading: isLoadingBlocData,
    error: blocDataError
  } = useBlocData(bloc.uuid!)

  // Derived data hooks for easy access
  const cropCycles = useCropCycles(bloc.uuid!)
  const fieldOperations = useFieldOperations(bloc.uuid!)
  const workPackages = useWorkPackages(bloc.uuid!)

  // Demo delete functionality
  const deleteBlocMutation = useDemoDeleteBloc()

  // Enhanced delete handler that combines demo data cleanup with parent callback
  const handleDelete = async () => {
    if (!bloc.uuid) return

    try {
      // First, delete all demo data related to this bloc
      await deleteBlocMutation.mutateAsync(bloc.uuid)

      // Then call the parent's delete handler (which handles the main app state)
      if (onDelete) {
        onDelete()
      }
    } catch (error) {
      console.error('Failed to delete bloc:', error)
      // Still call parent delete even if demo data cleanup fails
      if (onDelete) {
        onDelete()
      }
    }
  }

  // Generate breadcrumbs based on current screen
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const base = [
      { label: farmName },
      { label: bloc.name || `Bloc ${bloc.localId}` }
    ]

    switch (currentScreen) {
      case 'information':
        return [...base, { label: 'Information', isActive: true }]
      
      case 'operations':
        return [...base, { label: 'Field Operations', isActive: true }]

      case 'crop-cycle-management':
        return [...base, { label: 'Crop Cycle Management', isActive: true }]

      case 'operation-form':
        const operationName = currentOperationId ? 'Fertilization' : 'New Operation' // TODO: Get actual operation name
        return [
          ...base,
          { label: 'Field Operations', href: '#' },
          { label: operationName, isActive: true }
        ]
      
      case 'work-package-form':
        const opName = currentOperationId ? 'Fertilization' : 'Operation' // TODO: Get actual operation name
        const workPackageDate = currentWorkPackageId ? '3 Feb 2025' : 'New Work Package' // TODO: Get actual date
        return [
          ...base,
          { label: 'Field Operations', href: '#' },
          { label: opName, href: '#' },
          { label: workPackageDate, isActive: true }
        ]
      
      default:
        return base
    }
  }

  const contextValue: BlocContextType = {
    bloc,
    currentScreen,
    setCurrentScreen,
    currentOperationId,
    setCurrentOperationId,
    currentWorkPackageId,
    setCurrentWorkPackageId,
    onBack,
    onDelete: handleDelete, // Use enhanced delete handler
    farmName,
    breadcrumbs: generateBreadcrumbs(),
    // Comprehensive bloc data
    blocData,
    isLoadingBlocData,
    blocDataError,
    // Derived data hooks
    cropCycles,
    fieldOperations,
    workPackages
  }

  return (
    <BlocContext.Provider value={contextValue}>
      {children}
    </BlocContext.Provider>
  )
}

export function useBlocContext() {
  const context = useContext(BlocContext)
  if (context === undefined) {
    throw new Error('useBlocContext must be used within a BlocProvider')
  }
  return context
}

// Safe version that doesn't throw an error if context is not available
export function useBlocContextSafe() {
  const context = useContext(BlocContext)
  return context
}
