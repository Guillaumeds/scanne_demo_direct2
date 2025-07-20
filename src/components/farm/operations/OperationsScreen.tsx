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
  const { bloc, fieldOperations, workPackages, isLoadingBlocData, setCurrentScreen } = useBlocContext()
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
          id: wp.id,
          date: wp.planned_date,
          area: wp.actual_area || bloc.area,
          hours: 8, // Default hours - could be calculated from work package data
          cost: wp.total_cost || 0,
          crew: 'Team A', // Default crew - could come from work package data
          equipment: 'Equipment', // Default equipment - could come from work package data
          status: wp.status
        }))

      // Calculate progress based on work package statuses
      const completedPackages = operationWorkPackages.filter((wp: any) => wp.status === 'completed').length
      const totalPackages = operationWorkPackages.length
      const progress = totalPackages > 0 ? Math.round((completedPackages / totalPackages) * 100) : 0

      return {
        id: operation.uuid,
        type: operation.operation_type,
        status: operation.status,
        plannedStartDate: operation.planned_start_date,
        plannedEndDate: operation.planned_end_date,
        actualStartDate: operation.actual_start_date || null,
        actualEndDate: operation.actual_end_date || null,
        area: bloc.area, // Use bloc area as default
        estimatedCost: operation.estimated_total_cost || 0,
        actualCost: operation.actual_total_cost || 0,
        progress,
        workPackages: operationWorkPackages
      }
    })
  }, [fieldOperations.data, workPackages.data, bloc.area])

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
      searchQuery
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
