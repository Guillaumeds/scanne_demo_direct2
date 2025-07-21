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
import { OperationsCards } from './OperationsCards'
import { OperationsRows } from './OperationsRows'
import { OperationsFilters } from './OperationsFilters'
import { LoadingSpinner, SkeletonTable } from '../shared/LoadingSpinner'
import { useBlocContext } from '../contexts/BlocContext'

type ViewMode = 'table' | 'cards' | 'rows'
type Perspective = 'operations' | 'resources' | 'financial'

export function OperationsScreen() {
  const { bloc, fieldOperations, workPackages, cropCycles, isLoadingBlocData, setCurrentScreen } = useBlocContext()
  const [viewMode, setViewMode] = useState<ViewMode>('rows')
  const [perspective, setPerspective] = useState<Perspective>('operations')
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  // Use real loading state from BlocContext
  const isLoading = isLoadingBlocData || fieldOperations.isLoading || workPackages.isLoading
  const [isTransitioning, setIsTransitioning] = useState(false)

  // No artificial loading delay - show content immediately

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

  // Transform real data from BlocContext to the format expected by the UI components
  const operationsData = useMemo(() => {
    if (!fieldOperations.data || !workPackages.data) {
      return []
    }



    return fieldOperations.data.map((operation: any) => {
      // Find work packages for this operation
      const operationWorkPackages = workPackages.data
        .filter((wp: any) => wp.field_operation_uuid === operation.uuid)
        .map((wp: any) => ({
          id: wp.uuid || wp.id,
          work_date: wp.work_date || wp.planned_date,
          date: wp.work_date || wp.planned_date,
          area: wp.actual_area_hectares || wp.planned_area_hectares || 0,
          hours: wp.duration_hours || 8,
          cost: wp.actual_cost || wp.estimated_cost || 0,
          status: wp.status,
          // Resources data for work packages
          products: wp.products || [],
          equipment: wp.equipment || [],
          labour: wp.labour || [],
          // Calculated costs for work packages
          productActualCost: wp.products ? wp.products.reduce((sum: number, p: any) => sum + (p.actual_cost || 0), 0) : 0,
          equipmentActualCost: wp.equipment ? wp.equipment.reduce((sum: number, e: any) => sum + (e.actual_cost || 0), 0) : 0,
          labourActualCost: wp.labour ? wp.labour.reduce((sum: number, l: any) => sum + (l.actual_cost || 0), 0) : 0,
          equipmentEffort: wp.equipment ? wp.equipment.reduce((sum: number, e: any) => sum + (e.actual_hours || e.planned_hours || 0), 0) : 0,
          labourEffort: wp.labour ? wp.labour.reduce((sum: number, l: any) => sum + (l.actual_hours || l.planned_hours || 0), 0) : 0
        }))

      // Calculate progress based on completed work package areas vs total operation area
      const completedArea = operationWorkPackages
        .filter((wp: any) => wp.status === 'completed')
        .reduce((sum: number, wp: any) => sum + wp.area, 0)
      const totalOperationArea = operation.planned_area_hectares || bloc.area
      const progress = totalOperationArea > 0 ? Math.round((completedArea / totalOperationArea) * 100) : 0

      // Extract main product (first product)
      const mainProduct = operation.products && operation.products.length > 0 ? operation.products[0].name : 'No Product'

      // Debug logging
      if (operation.products && operation.products.length > 0) {
        console.log(`Operation ${operation.operation_name} has ${operation.products.length} products:`, operation.products)
      }

      // Calculate equipment and labour efforts for operation
      const equipmentNames = operation.equipment ? operation.equipment.map((e: any) => e.name).join(', ') : 'No Equipment'
      const equipmentEffort = operation.equipment ? operation.equipment.reduce((sum: number, e: any) => sum + (e.planned_hours || 0), 0) : 0
      const labourEffort = operation.labour ? operation.labour.reduce((sum: number, l: any) => sum + (l.planned_hours || 0), 0) : 0

      // Calculate estimated costs by category
      const estimatedProductCost = operation.products ? operation.products.reduce((sum: number, p: any) => sum + (p.planned_cost || 0), 0) : 0
      const estimatedEquipmentCost = operation.equipment ? operation.equipment.reduce((sum: number, e: any) => sum + (e.planned_cost || 0), 0) : 0
      const estimatedLabourCost = operation.labour ? operation.labour.reduce((sum: number, l: any) => sum + (l.planned_cost || 0), 0) : 0

      return {
        id: operation.uuid,
        type: operation.operation_name || operation.operation_type || 'Unknown Operation',
        operationType: operation.operation_type,
        method: operation.method || 'Manual',
        mainProduct,
        status: operation.status || 'planned',
        plannedStartDate: operation.planned_start_date,
        plannedEndDate: operation.planned_end_date,
        actualStartDate: operation.actual_start_date || null,
        actualEndDate: operation.actual_end_date || null,
        area: totalOperationArea,
        blocArea: bloc.area,
        estimatedCost: operation.estimated_total_cost || 0,
        actualCost: operation.actual_total_cost || 0,
        progress,
        // Resource details for operations
        equipmentNames,
        equipmentEffort,
        labourEffort,
        estimatedProductCost,
        estimatedEquipmentCost,
        estimatedLabourCost,
        products: operation.products || [],
        equipment: operation.equipment || [],
        labour: operation.labour || [],
        workPackages: operationWorkPackages
      }
    })
  }, [fieldOperations.data, workPackages.data, bloc.area])

  // Get active crop cycle for revenue calculations
  const activeCropCycle = useMemo(() => {
    return cropCycles.data?.find((cycle: any) => cycle.status === 'active') || null
  }, [cropCycles.data])

  // Calculate footer totals
  const footerTotals = useMemo(() => {
    if (!operationsData.length) return {
      totalEstimatedCost: 0,
      totalActualCost: 0,
      totalEstimatedRevenue: 0,
      totalActualRevenue: 0,
      profitPercent: 0
    }

    const totalEstimatedCost = operationsData.reduce((sum, op) => sum + op.estimatedCost, 0)
    const totalActualCost = operationsData.reduce((sum, op) => sum + (op.actualCost || 0), 0)

    // Calculate revenue based on crop cycle expected yield
    const expectedYieldTonsHa = activeCropCycle?.expected_yield_tons_ha || 80 // Default sugarcane yield
    const sugarcanePricePerTon = 2500 // MUR per ton (estimated)
    const totalEstimatedRevenue = expectedYieldTonsHa * sugarcanePricePerTon * bloc.area

    // Actual revenue (if cycle is completed)
    const actualYieldTonsHa = activeCropCycle?.actual_yield_tons_ha || 0
    const totalActualRevenue = actualYieldTonsHa > 0 ? actualYieldTonsHa * sugarcanePricePerTon * bloc.area : 0

    // Calculate profit percentage
    const relevantRevenue = totalActualRevenue > 0 ? totalActualRevenue : totalEstimatedRevenue
    const relevantCost = totalActualCost > 0 ? totalActualCost : totalEstimatedCost
    const profit = relevantRevenue - relevantCost
    const profitPercent = relevantRevenue > 0 ? (profit / relevantRevenue) * 100 : 0

    return {
      totalEstimatedCost,
      totalActualCost,
      totalEstimatedRevenue,
      totalActualRevenue,
      profitPercent
    }
  }, [operationsData, activeCropCycle, bloc.area])

  const renderView = () => {
    // Show empty state if no operations exist
    if (!operationsData || operationsData.length === 0) {
      return (
        <div className="h-full flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-center max-w-md"
          >
            <Card className="p-8 border-dashed border-2 border-muted-foreground/20">
              <CardContent className="space-y-4">
                <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
                  <Plus className="h-8 w-8 text-muted-foreground" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-foreground">
                    No Field Operations Yet
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    No field operations exist for this bloc yet. Start creating field operations and daily work packages to manage your agricultural activities.
                  </p>
                </div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="pt-2"
                >
                  <Button
                    onClick={() => setCurrentScreen('operation-form')}
                    className="bg-primary hover:bg-primary/90"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Field Operation
                  </Button>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )
    }

    const commonProps = {
      data: operationsData,
      perspective,
      searchQuery,
      footerTotals
    }

    switch (viewMode) {
      case 'rows':
        return <OperationsRows {...commonProps} />
      case 'cards':
        return <OperationsCards {...commonProps} />
      case 'table':
        return <OperationsTable {...commonProps} />
      default:
        return <OperationsRows {...commonProps} />
    }
  }

  // Render skeleton based on current view mode
  const renderSkeleton = () => {
    if (viewMode === 'rows') {
      return (
        <div className="space-y-4 p-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-card rounded-lg border p-4 animate-pulse">
              <div className="flex items-center justify-between mb-3">
                <div className="h-5 bg-muted rounded w-32" />
                <div className="h-6 bg-muted rounded-full w-20" />
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-4 bg-muted rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      )
    }
    return <SkeletonTable />
  }

  if (isLoading) {
    return (
      <div className="h-full flex flex-col">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="border-b border-border bg-card p-4"
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1">
              <div className="relative flex-1 max-w-md">
                <div className="h-10 bg-muted rounded-md animate-pulse" />
              </div>
              <div className="h-10 w-20 bg-muted rounded-md animate-pulse" />
            </div>
            <div className="flex items-center gap-3">
              <div className="h-10 w-32 bg-muted rounded-md animate-pulse" />
              <div className="h-10 w-24 bg-muted rounded-md animate-pulse" />
              <div className="h-10 w-20 bg-muted rounded-md animate-pulse" />
            </div>
          </div>
        </motion.div>
        <div className="flex-1 overflow-hidden">
          {renderSkeleton()}
        </div>
      </div>
    )
  }

  return (
    <motion.div
      className="h-full flex flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Controls Header */}
      <motion.div
        className="border-b border-border bg-card p-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <div className="flex items-center justify-between gap-4">
          {/* Search and Filters */}
          <div className="flex items-center gap-3 flex-1">
            <motion.div
              className="relative flex-1 max-w-md"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search operations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className={showFilters ? 'bg-primary/10' : ''}
              >
                <motion.div
                  animate={{ rotate: showFilters ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Filter className="h-4 w-4 mr-2" />
                </motion.div>
                Filters
              </Button>
            </motion.div>
          </div>

          {/* View and Perspective Controls */}
          <motion.div
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <PerspectiveSwitcher
              currentPerspective={perspective}
              onPerspectiveChange={handlePerspectiveChange}
              viewMode={viewMode}
            />
            <ViewSwitcher
              currentView={viewMode}
              onViewChange={handleViewChange}
            />
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </motion.div>

            {/* Add Field Operation Button */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                size="sm"
                onClick={() => setCurrentScreen('operation-form')}
                className="bg-primary hover:bg-primary/90"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Field Operation
              </Button>
            </motion.div>
          </motion.div>
        </div>

        {/* Filters Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -10 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: -10 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              className="mt-4 overflow-hidden"
            >
              <OperationsFilters />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${viewMode}-${perspective}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 0.15,
              ease: "easeOut"
            }}
            className="h-full"
          >
            {isTransitioning ? (
              <div className="h-full flex items-center justify-center">
                <LoadingSpinner size="md" message="Switching view..." />
              </div>
            ) : (
              <div className="h-full">
                {renderView()}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Summary Footer */}
      <motion.div
        className="border-t border-border bg-muted/30 px-4 py-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.4 }}
      >
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {operationsData.length} operations • {operationsData.reduce((acc: number, op: any) => acc + op.workPackages.length, 0)} work packages
          </motion.span>
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            Total estimated cost: ${operationsData.reduce((acc: number, op: any) => acc + op.estimatedCost, 0).toLocaleString()}
          </motion.span>
        </div>
      </motion.div>
    </motion.div>
  )
}
