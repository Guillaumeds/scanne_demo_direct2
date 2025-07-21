'use client'

import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Search, Filter, Download, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { ViewSwitcher } from './ViewSwitcher'
import { PerspectiveSwitcher } from './PerspectiveSwitcher'
import { FarmOperationsTable } from './FarmOperationsTable'
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
  const [viewMode, setViewMode] = useState<ViewMode>('table')
  const [perspective, setPerspective] = useState<Perspective>('operations')
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)

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

  // Transform data to farm-level structure (Blocs -> Operations -> Work Packages)
  const farmData = useMemo(() => {
    if (!blocs.data || !fieldOperations.data || !workPackages.data) return []

    return blocs.data.map((bloc: any) => {
      // Get operations for this bloc
      const blocOperations = fieldOperations.data.filter((op: any) => 
        op.crop_cycle_uuid && 
        bloc.crop_cycles?.some((cc: any) => cc.uuid === op.crop_cycle_uuid)
      )

      // Transform operations with their work packages
      const operations = blocOperations.map((operation: any) => {
        const operationWorkPackages = workPackages.data.filter((wp: any) => 
          wp.field_operation_uuid === operation.uuid
        )

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
          blocArea: bloc.area || 0,
          estimatedCost: operation.estimated_total_cost || 0,
          actualCost: operation.actual_total_cost || 0,
          progress: operation.progress || 0,
          equipmentNames: '',
          equipmentEffort: 0,
          labourEffort: 0,
          estimatedProductCost: 0,
          estimatedEquipmentCost: 0,
          estimatedLabourCost: 0,
          products: [],
          equipment: [],
          labour: [],
          workPackages: operationWorkPackages.map((wp: any) => ({
            id: wp.uuid,
            work_date: wp.work_date,
            date: wp.work_date,
            area: wp.area || 0,
            hours: wp.hours || 0,
            cost: wp.cost || 0,
            status: wp.status,
            products: [],
            equipment: [],
            labour: [],
            productActualCost: 0,
            equipmentActualCost: 0,
            labourActualCost: 0,
            equipmentEffort: 0,
            labourEffort: 0
          }))
        }
      })

      return {
        id: bloc.uuid,
        name: bloc.name,
        area: bloc.area || 0,
        operations: operations,
        completedOperations: operations.filter((op: any) => op.status === 'completed').length,
        totalOperations: operations.length,
        completedWorkPackages: operations.reduce((sum: number, op: any) =>
          sum + op.workPackages.filter((wp: any) => wp.status === 'completed').length, 0
        ),
        totalWorkPackages: operations.reduce((sum: number, op: any) => sum + op.workPackages.length, 0)
      }
    })
  }, [blocs.data, fieldOperations.data, workPackages.data])

  // Filter data based on search query
  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return farmData

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
          <LoadingSpinner />
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
                  <FarmOperationsTable
                    data={filteredData}
                    perspective={perspective}
                    searchQuery={searchQuery}
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
