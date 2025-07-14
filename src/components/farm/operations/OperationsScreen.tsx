'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Search, Filter, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
  const { bloc } = useBlocContext()
  const [viewMode, setViewMode] = useState<ViewMode>('rows')
  const [perspective, setPerspective] = useState<Perspective>('operations')
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isTransitioning, setIsTransitioning] = useState(false)

  // Simulate data loading
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 600)
    return () => clearTimeout(timer)
  }, [])

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

  // Mock operations data - in real app, this would come from TanStack Query
  const operationsData = [
    {
      id: '1',
      type: 'Fertilization',
      status: 'completed',
      plannedStartDate: '2024-06-15',
      plannedEndDate: '2024-06-17',
      actualStartDate: '2024-06-15',
      actualEndDate: '2024-06-16',
      area: 25.5,
      estimatedCost: 5000,
      actualCost: 4800,
      progress: 100,
      workPackages: [
        {
          id: 'wp1',
          date: '2024-06-15',
          area: 12.5,
          hours: 8,
          cost: 2400,
          crew: 'Team A',
          equipment: 'Tractor T1',
          status: 'completed'
        },
        {
          id: 'wp2',
          date: '2024-06-16',
          area: 13.0,
          hours: 8,
          cost: 2400,
          crew: 'Team A',
          equipment: 'Tractor T1',
          status: 'completed'
        }
      ]
    },
    {
      id: '2',
      type: 'Irrigation',
      status: 'in-progress',
      plannedStartDate: '2024-07-01',
      plannedEndDate: '2024-07-15',
      actualStartDate: '2024-07-01',
      actualEndDate: null,
      area: 25.5,
      estimatedCost: 3000,
      actualCost: 1800,
      progress: 60,
      workPackages: [
        {
          id: 'wp3',
          date: '2024-07-01',
          area: 8.5,
          hours: 6,
          cost: 600,
          crew: 'Team B',
          equipment: 'Irrigation System',
          status: 'completed'
        },
        {
          id: 'wp4',
          date: '2024-07-08',
          area: 8.5,
          hours: 6,
          cost: 600,
          crew: 'Team B',
          equipment: 'Irrigation System',
          status: 'completed'
        },
        {
          id: 'wp5',
          date: '2024-07-15',
          area: 8.5,
          hours: 6,
          cost: 600,
          crew: 'Team B',
          equipment: 'Irrigation System',
          status: 'planned'
        }
      ]
    },
    {
      id: '3',
      type: 'Pest Control',
      status: 'planned',
      plannedStartDate: '2024-08-01',
      plannedEndDate: '2024-08-02',
      actualStartDate: null,
      actualEndDate: null,
      area: 25.5,
      estimatedCost: 2500,
      actualCost: 0,
      progress: 0,
      workPackages: [
        {
          id: 'wp6',
          date: '2024-08-01',
          area: 25.5,
          hours: 10,
          cost: 2500,
          crew: 'Team C',
          equipment: 'Sprayer S1',
          status: 'planned'
        }
      ]
    }
  ]

  const renderView = () => {
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
        <div className="flex-1 p-6">
          <SkeletonTable />
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
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 1.02 }}
            transition={{
              duration: 0.3,
              ease: [0.4, 0, 0.2, 1],
              layout: { duration: 0.2 }
            }}
            className="h-full"
            layout
          >
            <AnimatePresence mode="wait">
              {isTransitioning ? (
                <motion.div
                  key="transitioning"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full flex items-center justify-center"
                >
                  <LoadingSpinner size="md" message="Switching view..." />
                </motion.div>
              ) : (
                <motion.div
                  key="content"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                  className="h-full"
                >
                  {renderView()}
                </motion.div>
              )}
            </AnimatePresence>
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
            {operationsData.length} operations • {operationsData.reduce((acc, op) => acc + op.workPackages.length, 0)} work packages
          </motion.span>
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            Total estimated cost: ${operationsData.reduce((acc, op) => acc + op.estimatedCost, 0).toLocaleString()}
          </motion.span>
        </div>
      </motion.div>
    </motion.div>
  )
}
