'use client'

import React, { useState } from 'react'
import { BlocSubView } from '@/contexts/BlocNavigationContext'
import { useCropCycleInfo } from '@/contexts/CropCycleContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Icon } from '@/components/ui/icon'
import { AnimatedCard } from '@/components/ui/animated-card'
import { DrawnArea } from '@/types/drawnArea'
import { BlocOverviewNode } from '@/types/operationsOverview'

// Import the modern overview tab we created earlier
import ModernOverviewTab from '@/components/ModernOverviewTab'

interface ModernCropManagementTabProps {
  bloc: DrawnArea
  currentSubView: BlocSubView
}

export function ModernCropManagementTab({ bloc, currentSubView }: ModernCropManagementTabProps) {
  const { getActiveCycleInfo } = useCropCycleInfo()
  const activeCycleInfo = getActiveCycleInfo()

  // State to manage operations data
  const [operationsData, setOperationsData] = useState<BlocOverviewNode[]>([{
    id: bloc.uuid || bloc.localId,
    name: bloc.name || `Bloc ${bloc.localId}`,
    area_hectares: bloc.area,
    cycle_number: [1],
    variety_name: 'Unknown',
    planned_harvest_date: new Date().toISOString().split('T')[0],
    expected_yield_tons_ha: 0,
    growth_stage: 'Unknown',
    progress: 0,
    total_est_product_cost: 0,
    total_est_resource_cost: 0,
    total_act_product_cost: 0,
    total_act_resource_cost: 0,
    cycle_type: 'plantation',
    planting_date: new Date().toISOString().split('T')[0],
    products: [] // Empty products array - will show "Add Operation" button
  }])

  // Handle data updates from the table
  const handleDataUpdate = (updatedData: BlocOverviewNode[]) => {
    console.log('Operations data updated:', updatedData)
    setOperationsData(updatedData) // Update state to trigger re-render
  }

  // Always allow access to crop management, even without active cycle
  // If we're in a sub-view (form mode), the ModernOverviewTab will handle it
  // For overview, we show the modern operations table
  return (
    <div className="h-full flex flex-col">
      <ModernOverviewTab
        data={operationsData} // Use state data
        activeCycleInfo={activeCycleInfo}
        onDataUpdate={handleDataUpdate} // Use proper state update handler
      />
    </div>
  )
}
