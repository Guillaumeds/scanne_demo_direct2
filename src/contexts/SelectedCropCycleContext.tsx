'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useCropCycle } from './CropCycleContext'

interface SelectedCropCycleContextType {
  selectedCycleId: string | null
  setSelectedCycleId: (cycleId: string | null) => void
  getSelectedCycleInfo: () => any | null
  isSelectedCycleActive: () => boolean
  canEditSelectedCycle: () => boolean
  canCloseSelectedCycle: () => boolean
}

const SelectedCropCycleContext = createContext<SelectedCropCycleContextType | undefined>(undefined)

interface SelectedCropCycleProviderProps {
  children: ReactNode
}

export function SelectedCropCycleProvider({ children }: SelectedCropCycleProviderProps) {
  const { activeCycle, allCycles } = useCropCycle()
  const [selectedCycleId, setSelectedCycleId] = useState<string | null>(null)

  // Auto-select active cycle when it becomes available
  useEffect(() => {
    if (activeCycle && !selectedCycleId) {
      setSelectedCycleId(activeCycle.id)
    }
  }, [activeCycle, selectedCycleId])

  const getSelectedCycleInfo = () => {
    if (!selectedCycleId) return null
    
    const cycle = allCycles.find(c => c.id === selectedCycleId)
    if (!cycle) return null

    return {
      id: cycle.id,
      type: cycle.type,
      status: cycle.status,
      sugarcaneVariety: cycle.sugarcaneVarietyName,
      intercropVariety: cycle.intercropVarietyName === 'None' || !cycle.intercropVarietyName ? 'None' : cycle.intercropVarietyName,
      plantingDate: cycle.plantingDate || cycle.ratoonPlantingDate,
      plannedHarvestDate: cycle.plannedHarvestDate,
      cycleNumber: cycle.cycleNumber,
      displayName: cycle.type === 'plantation' 
        ? `Plantation Cycle` 
        : `Ratoon Cycle ${cycle.cycleNumber - 1}`
    }
  }

  const isSelectedCycleActive = () => {
    const selectedCycle = allCycles.find(c => c.id === selectedCycleId)
    return selectedCycle?.status === 'active'
  }

  const canEditSelectedCycle = () => {
    const selectedCycle = allCycles.find(c => c.id === selectedCycleId)
    // Allow editing of active cycles, prevent editing of closed cycles
    return selectedCycle?.status === 'active'
  }

  const canCloseSelectedCycle = () => {
    const selectedCycle = allCycles.find(c => c.id === selectedCycleId)
    // Only allow closing if cycle is active and all validation passes
    return selectedCycle?.status === 'active'
  }

  const contextValue: SelectedCropCycleContextType = {
    selectedCycleId,
    setSelectedCycleId,
    getSelectedCycleInfo,
    isSelectedCycleActive,
    canEditSelectedCycle,
    canCloseSelectedCycle
  }

  return (
    <SelectedCropCycleContext.Provider value={contextValue}>
      {children}
    </SelectedCropCycleContext.Provider>
  )
}

export function useSelectedCropCycle() {
  const context = useContext(SelectedCropCycleContext)
  if (context === undefined) {
    throw new Error('useSelectedCropCycle must be used within a SelectedCropCycleProvider')
  }
  return context
}
