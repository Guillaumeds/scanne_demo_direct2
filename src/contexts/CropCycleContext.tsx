'use client'

import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react'
import { CropCycle, CyclePermissions } from '@/types/cropCycles'
import { CropCycleService } from '@/services/cropCycleService'

interface CropCycleContextType {
  activeCycle: CropCycle | null
  allCycles: CropCycle[]
  permissions: CyclePermissions | null
  isLoading: boolean
  error: string | null
  
  // Actions
  refreshCycles: () => Promise<void>
  setActiveCycleId: (cycleId: string | null) => Promise<void>
  createCycle: (request: any) => Promise<CropCycle>
  closeCycle: (request: any) => Promise<CropCycle>
}

const CropCycleContext = createContext<CropCycleContextType | undefined>(undefined)

interface CropCycleProviderProps {
  children: ReactNode
  blocId: string
  userRole?: 'user' | 'admin' | 'super'
}

export function CropCycleProvider({ 
  children, 
  blocId, 
  userRole = 'user' 
}: CropCycleProviderProps) {
  const [activeCycle, setActiveCycle] = useState<CropCycle | null>(null)
  const [allCycles, setAllCycles] = useState<CropCycle[]>([])
  const [permissions, setPermissions] = useState<CyclePermissions | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refreshCycles = async () => {
    try {
      console.log('🔄 CropCycleContext.refreshCycles() called for blocId:', blocId)
      setIsLoading(true)
      setError(null)

      // Get all cycles for the bloc (includes active + closed)
      const cycles = await CropCycleService.getCropCyclesForBloc(blocId)
      console.log('📊 CropCycleContext: Fetched cycles from DB:', cycles.map(c => ({
        id: c.id.substring(0, 8) + '...',
        estimatedCost: c.estimatedTotalCost,
        actualCost: c.actualTotalCost,
        lastUpdated: c.lastUpdated
      })))

      setAllCycles(cycles)
      console.log('✅ CropCycleContext: allCycles state updated')

      // Find active cycle from the data we already have (no extra DB call needed!)
      const active = cycles.find(cycle => cycle.status === 'active') || null
      setActiveCycle(active)

      if (active) {
        const cyclePermissions = CropCycleService.getCyclePermissions(active, userRole)
        setPermissions(cyclePermissions)
      } else {
        setPermissions(null)
      }
    } catch (err) {
      console.error('Error refreshing crop cycles:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsLoading(false)
    }
  }

  const setActiveCycleId = async (cycleId: string | null) => {
    try {
      if (!cycleId) {
        setActiveCycle(null)
        setPermissions(null)
        return
      }

      const cycle = await CropCycleService.getCropCycleById(cycleId)
      if (cycle) {
        setActiveCycle(cycle)
        const cyclePermissions = CropCycleService.getCyclePermissions(cycle, userRole)
        setPermissions(cyclePermissions)
      }
    } catch (err) {
      console.error('Error setting active cycle:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
    }
  }

  const createCycle = async (request: any): Promise<CropCycle> => {
    try {
      const newCycle = await CropCycleService.createCropCycle(request)
      await refreshCycles()
      // Automatically set the newly created cycle as active
      await setActiveCycleId(newCycle.id)
      return newCycle
    } catch (err) {
      console.error('Error creating cycle:', err)
      throw err
    }
  }

  const closeCycle = async (request: any): Promise<CropCycle> => {
    try {
      const closedCycle = await CropCycleService.closeCropCycle(request)
      await refreshCycles()
      return closedCycle
    } catch (err) {
      console.error('Error closing cycle:', err)
      throw err
    }
  }

  useEffect(() => {
    if (blocId) {
      refreshCycles()
    }
  }, [blocId, userRole])

  const contextValue: CropCycleContextType = useMemo(() => ({
    activeCycle,
    allCycles,
    permissions,
    isLoading,
    error,
    refreshCycles,
    setActiveCycleId,
    createCycle,
    closeCycle
  }), [activeCycle, allCycles, permissions, isLoading, error, refreshCycles, setActiveCycleId, createCycle, closeCycle])

  return (
    <CropCycleContext.Provider value={contextValue}>
      {children}
    </CropCycleContext.Provider>
  )
}

export function useCropCycle() {
  const context = useContext(CropCycleContext)
  if (context === undefined) {
    throw new Error('useCropCycle must be used within a CropCycleProvider')
  }
  return context
}

// Hook to check if current user can perform specific actions
export function useCropCyclePermissions() {
  const { permissions, activeCycle } = useCropCycle()
  
  return {
    canEdit: permissions?.canEdit ?? false,
    canAddActivities: permissions?.canAddActivities ?? false,
    canAddObservations: permissions?.canAddObservations ?? false,
    canAddAttachments: permissions?.canAddAttachments ?? false,
    canClose: permissions?.canClose ?? false,
    canReopen: permissions?.canReopen ?? false,
    hasActiveCycle: !!activeCycle,
    activeCycleId: activeCycle?.id,
    activeCycleType: activeCycle?.type,
    activeCycleStatus: activeCycle?.status
  }
}

// Hook to get crop cycle information for linking
export function useCropCycleInfo() {
  const { activeCycle, allCycles } = useCropCycle()
  
  return {
    activeCycle,
    allCycles,
    getActiveCycleInfo: () => activeCycle ? {
      id: activeCycle.id,
      type: activeCycle.type,
      status: activeCycle.status,
      sugarcaneVariety: activeCycle.sugarcaneVarietyName,
      intercropVariety: activeCycle.intercropVarietyName,
      plantingDate: activeCycle.plantingDate || activeCycle.ratoonPlantingDate,
      plannedHarvestDate: activeCycle.plannedHarvestDate
    } : null
  }
}

// Hook for validation and warnings
export function useCropCycleValidation() {
  const { activeCycle, permissions } = useCropCycle()

  const getValidationWarnings = (): string[] => {
    const warnings: string[] = []

    if (!activeCycle) {
      warnings.push('No active crop cycle. Create a plantation cycle to start tracking activities and observations.')
    } else if (activeCycle.status === 'closed') {
      warnings.push('This crop cycle is closed. Data can only be viewed, not modified.')
    }

    return warnings
  }
  
  const canPerformAction = (action: 'edit' | 'add_activity' | 'add_observation' | 'add_attachment'): boolean => {
    if (!permissions) return false
    
    switch (action) {
      case 'edit':
        return permissions.canEdit
      case 'add_activity':
        return permissions.canAddActivities
      case 'add_observation':
        return permissions.canAddObservations
      case 'add_attachment':
        return permissions.canAddAttachments
      default:
        return false
    }
  }
  
  return {
    warnings: getValidationWarnings(),
    canPerformAction,
    requiresActiveCycle: !activeCycle,
    isCycleClosed: activeCycle?.status === 'closed'
  }
}
