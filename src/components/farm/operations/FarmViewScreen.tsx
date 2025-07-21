'use client'

import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Search, Filter, Download, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { ViewSwitcher } from './ViewSwitcher'
import { PerspectiveSwitcher } from './PerspectiveSwitcher'
import { OperationsTable } from './OperationsTable'
import { OperationsFilters } from './OperationsFilters'
import { LoadingSpinner, SkeletonTable } from '../shared/LoadingSpinner'
import { useFarmGISData } from '@/hooks/useDemoData'

type ViewMode = 'table' | 'cards' | 'rows'
type Perspective = 'operations' | 'resources' | 'financial'

export function FarmViewScreen() {
  const { data, isLoading } = useFarmGISData()
  const blocs = { data: data?.blocs || [] }
  const fieldOperations = { data: data?.fieldOperations || [] }
  const workPackages = { data: data?.workPackages || [] }

  // Debug logging
  console.log('🔍 FarmViewScreen data:', {
    isLoading,
    hasData: !!data,
    blocsCount: blocs.data.length,
    operationsCount: fieldOperations.data.length,
    workPackagesCount: workPackages.data.length,
    firstBloc: blocs.data[0] ? {
      name: blocs.data[0].name,
      uuid: blocs.data[0].uuid,
      cropCycles: blocs.data[0].crop_cycles?.length || 0
    } : null,
    firstOperation: fieldOperations.data[0] ? {
      name: fieldOperations.data[0].operation_name,
      type: fieldOperations.data[0].operation_type,
      cropCycleUuid: fieldOperations.data[0].crop_cycle_uuid
    } : null
  })
  const [viewMode, setViewMode] = useState<ViewMode>('table')
  const [perspective, setPerspective] = useState<Perspective>('operations')
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)

  // Handlers for farm-level operations (context-free)
  const handleEditOperation = (operation: any) => {
    // TODO: Navigate to bloc view and edit operation
    // For now, just log the action
    console.log('Edit operation in farm view:', {
      operationId: operation.id,
      blocId: operation.blocId,
      blocName: operation.blocName,
      operationType: operation.operationType
    })
    // Future: router.push(`/bloc/${operation.blocId}/operations/${operation.id}/edit`)
  }

  const handleEditWorkPackage = (workPackage: any, operationId: string) => {
    // TODO: Navigate to bloc view and edit work package
    // For now, just log the action
    console.log('Edit work package in farm view:', {
      workPackageId: workPackage.id,
      operationId,
      workDate: workPackage.work_date,
      status: workPackage.status
    })
    // Future: router.push(`/bloc/${operation.blocId}/work-packages/${workPackage.id}/edit`)
  }

  // Handle view/perspective changes with transition
  const handleViewChange = (newView: ViewMode) => {
    setIsTransitioning(true)
    setTimeout(() => {
      setViewMode(newView)
      setIsTransitioning(false)
    }, 150)
  }

  const handlePerspectiveChange = (newPerspective: Perspective) => {
    setIsTransitioning(true)
    setTimeout(() => {
      setPerspective(newPerspective)
      setIsTransitioning(false)
    }, 150)
  }

  // Transform data to flat operations list with bloc information (for reusable OperationsTable)
  const farmData = useMemo(() => {
    console.log('🔍 farmData transformation starting...', {
      hasBlocs: !!blocs.data,
      hasOperations: !!fieldOperations.data,
      hasWorkPackages: !!workPackages.data,
      blocsLength: blocs.data?.length || 0,
      operationsLength: fieldOperations.data?.length || 0,
      workPackagesLength: workPackages.data?.length || 0
    })

    if (!blocs.data || !fieldOperations.data || !workPackages.data) {
      console.log('🔍 farmData: Missing required data, returning empty array')
      return []
    }

    // QUICK FIX: Transform all operations directly without complex bloc filtering
    // This bypasses the crop cycle linking issue for now
    const allOperations = fieldOperations.data.map((operation: any) => {
      // Find work packages for this operation
      const operationWorkPackages = workPackages.data.filter((wp: any) =>
        wp.field_operation_uuid === operation.uuid
      )

      // Find the bloc for this operation (simplified lookup)
      const relatedBloc = blocs.data.find((bloc: any) =>
        bloc.crop_cycles?.some((cc: any) => cc.uuid === operation.crop_cycle_uuid)
      ) || blocs.data[0] // Fallback to first bloc if not found

      return {
        id: operation.uuid,
        type: operation.operation_name,
        operationType: operation.operation_type,
        method: operation.method,
        mainProduct: operation.main_product || 'No product',
        status: operation.status,
        plannedStartDate: operation.planned_start_date,
        plannedEndDate: operation.planned_end_date,
        actualStartDate: operation.actual_start_date,
        actualEndDate: operation.actual_end_date,
        area: operation.area || 0,
        blocArea: relatedBloc?.area || 0,
        estimatedCost: operation.estimated_total_cost || 0,
        actualCost: operation.actual_total_cost || 0,
        progress: operation.progress || 0,
        equipmentNames: '',
        equipmentEffort: 0,
        labourEffort: 0,
        estimatedProductCost: 0,
        estimatedEquipmentCost: 0,
        estimatedLabourCost: 0,
        // Preserve existing linked data from demo generator
        products: operation.products || [],
        equipment: operation.equipment || [],
        labour: operation.labour || [],
        // Add bloc information to each operation
        blocId: relatedBloc?.uuid || 'unknown',
        blocName: relatedBloc?.name || 'Unknown Bloc',
        workPackages: operationWorkPackages.map((wp: any) => ({
          id: wp.uuid,
          work_date: wp.work_date,
          date: wp.work_date,
          area: wp.area || 0,
          hours: wp.hours || 0,
          cost: wp.cost || 0,
          status: wp.status,
          // Preserve existing linked data from demo generator
          products: wp.products || [],
          equipment: wp.equipment || [],
          labour: wp.labour || [],
          productActualCost: 0,
          equipmentActualCost: 0,
          labourActualCost: 0,
          equipmentEffort: 0,
          labourEffort: 0
        }))
      }
    })

    console.log('🔍 farmData transformation complete:', {
      totalOperations: allOperations.length,
      firstOperation: allOperations[0] ? {
        id: allOperations[0].id,
        type: allOperations[0].operationType,
        blocName: allOperations[0].blocName,
        workPackagesCount: allOperations[0].workPackages?.length || 0
      } : null
    })

    return allOperations
  }, [blocs.data, fieldOperations.data, workPackages.data])

  // Filter data based on search query
  const filteredData = useMemo(() => {
    console.log('🔍 filteredData calculation:', {
      farmDataLength: farmData.length,
      searchQuery: searchQuery.trim(),
      hasSearchQuery: !!searchQuery.trim()
    })

    if (!searchQuery.trim()) {
      console.log('🔍 No search query, returning all farmData:', farmData.length)
      return farmData
    }

    return farmData.filter((bloc: any) => {
      // Search in bloc name
      if (bloc.name.toLowerCase().includes(searchQuery.toLowerCase())) return true

      // Search in operations
      return bloc.operations.some((operation: any) =>
        operation.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        operation.operationType.toLowerCase().includes(searchQuery.toLowerCase()) ||
        operation.mainProduct.toLowerCase().includes(searchQuery.toLowerCase())
      )
    })
  }, [farmData, searchQuery])

  if (isLoading) {
    return (
      <div className="h-full flex flex-col">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <LoadingSpinner />
            <p className="mt-4 text-sm text-gray-600">Loading farm data...</p>
          </div>
        </div>
      </div>
    )
  }

  // Debug display
  if (farmData.length === 0) {
    return (
      <div className="h-full flex flex-col">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Debug: No Operations Data</h3>
            <div className="text-sm text-gray-600 space-y-1 text-left p-4 bg-gray-100 rounded-md">
              <p>Blocs: {blocs.data.length}</p>
              <p>Operations: {fieldOperations.data.length}</p>
              <p>Work Packages: {workPackages.data.length}</p>
              <p>Farm Data: {farmData.length}</p>
              <p>Filtered Data: {filteredData.length}</p>
              <p>Is Loading: {isLoading ? 'Yes' : 'No'}</p>
              <p>Has Data: {data ? 'Yes' : 'No'}</p>
            </div>
            <p className="mt-4 text-xs text-gray-500">Check browser console for detailed logs</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="flex-none border-b bg-card/50 backdrop-blur-sm">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Farm Operations</h1>
              <p className="text-sm text-muted-foreground">
                Overview of all operations across all blocs
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                New Operation
              </Button>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search operations, blocs, products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </div>

            <div className="flex items-center gap-4">
              <PerspectiveSwitcher
                currentPerspective={perspective}
                onPerspectiveChange={handlePerspectiveChange}
                viewMode={viewMode}
              />
              <ViewSwitcher
                currentView={viewMode}
                onViewChange={handleViewChange}
              />
            </div>
          </div>
        </div>

        {/* Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden border-t"
            >
              <div className="p-4">
                <OperationsFilters />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          {!isTransitioning && (
            <motion.div
              key={`${viewMode}-${perspective}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              <Card className="h-full m-4 shadow-sm">
                <CardContent className="p-0 h-full">
                  <OperationsTable
                    data={filteredData}
                    perspective={perspective}
                    searchQuery={searchQuery}
                    showBlocColumn={true}
                    groupByBloc={false}
                    onEditOperation={handleEditOperation}
                    onEditWorkPackage={handleEditWorkPackage}
                  />
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {isTransitioning && (
          <div className="h-full flex items-center justify-center">
            <LoadingSpinner />
          </div>
        )}
      </div>
    </div>
  )
}
