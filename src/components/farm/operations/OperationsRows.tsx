'use client'

import React, { useState } from 'react'
import { motion } from 'motion/react'
import { ChevronDown, ChevronRight, Calendar, MapPin, Users, Truck, Clock, Edit, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { useBlocContext } from '../contexts/BlocContext'

type Perspective = 'operations' | 'resources' | 'financial'

interface Operation {
  id: string
  type: string
  status: string
  plannedStartDate: string
  plannedEndDate: string
  actualStartDate: string | null
  actualEndDate: string | null
  area: number
  estimatedCost: number
  actualCost: number
  progress: number
  workPackages: WorkPackage[]
}

interface WorkPackage {
  id: string
  date: string
  area: number
  hours: number
  cost: number
  crew: string
  equipment: string
  status: string
}

interface OperationsRowsProps {
  data: Operation[]
  perspective: Perspective
  searchQuery: string
}

export function OperationsRows({ data, perspective, searchQuery }: OperationsRowsProps) {
  const { setCurrentScreen, setCurrentOperationId, setCurrentWorkPackageId } = useBlocContext()
  const [expandedOperations, setExpandedOperations] = useState<Set<string>>(new Set())

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'planned':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })
  }

  const toggleExpanded = (operationId: string) => {
    const newExpanded = new Set(expandedOperations)
    if (newExpanded.has(operationId)) {
      newExpanded.delete(operationId)
    } else {
      newExpanded.add(operationId)
    }
    setExpandedOperations(newExpanded)
  }

  const handleEditOperation = (operation: Operation) => {
    setCurrentOperationId(operation.id)
    setCurrentScreen('operation-form')
  }

  const handleEditWorkPackage = (workPackage: WorkPackage, operationId: string) => {
    setCurrentOperationId(operationId)
    setCurrentWorkPackageId(workPackage.id)
    setCurrentScreen('work-package-form')
  }

  const handleAddWorkPackage = (operationId: string) => {
    setCurrentOperationId(operationId)
    setCurrentWorkPackageId(undefined)
    setCurrentScreen('work-package-form')
  }

  // Filter data based on search query
  const filteredData = data.filter(operation =>
    operation.type.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const renderOperationContent = (operation: Operation) => {
    if (perspective === 'operations') {
      return (
        <div className="flex items-center gap-4 flex-1">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">
              {formatDate(operation.plannedStartDate)} - {formatDate(operation.plannedEndDate)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{operation.area.toFixed(1)} ha</span>
          </div>
          <div className="flex items-center gap-2 min-w-24">
            <Progress value={operation.progress} className="h-2 w-16" />
            <span className="text-xs">{operation.progress}%</span>
          </div>
        </div>
      )
    }

    if (perspective === 'resources') {
      const totalHours = operation.workPackages.reduce((acc, wp) => acc + wp.hours, 0)
      const uniqueEquipment = Array.from(new Set(operation.workPackages.map(wp => wp.equipment)))
      const uniqueCrews = Array.from(new Set(operation.workPackages.map(wp => wp.crew)))

      return (
        <div className="flex items-center gap-4 flex-1">
          <div className="flex items-center gap-2">
            <Truck className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{uniqueEquipment.join(', ')}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{uniqueCrews.join(', ')}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{totalHours}h</span>
          </div>
        </div>
      )
    }

    // Financial perspective
    const variance = operation.actualCost - operation.estimatedCost
    const isOver = variance > 0

    return (
      <div className="flex items-center gap-4 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm">Est: Rs {operation.estimatedCost.toLocaleString()}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm">Actual: Rs {operation.actualCost.toLocaleString()}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Rs</span>
          <span className={`text-sm ${isOver ? 'text-red-600' : 'text-green-600'}`}>
            {isOver ? '+' : ''}Rs {variance.toLocaleString()}
          </span>
        </div>
      </div>
    )
  }

  const renderWorkPackageContent = (workPackage: WorkPackage) => {
    if (perspective === 'operations') {
      return (
        <div className="flex items-center gap-4 flex-1">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{formatDate(workPackage.date)}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{workPackage.area.toFixed(1)} ha</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{workPackage.hours}h</span>
          </div>
        </div>
      )
    }

    if (perspective === 'resources') {
      return (
        <div className="flex items-center gap-4 flex-1">
          <div className="flex items-center gap-2">
            <Truck className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{workPackage.equipment}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{workPackage.crew}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{workPackage.hours}h</span>
          </div>
        </div>
      )
    }

    // Financial perspective
    return (
      <div className="flex items-center gap-4 flex-1">
        <div className="flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">${workPackage.cost.toLocaleString()}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm">
            ${(workPackage.cost / workPackage.area).toFixed(0)}/ha
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full overflow-auto">
      <div className="space-y-1">
        {filteredData.map((operation, index) => (
          <motion.div
            key={operation.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2, delay: index * 0.05 }}
            className="border border-border rounded-lg bg-card"
          >
            {/* Operation Row */}
            <div className="flex items-center gap-3 p-4 hover:bg-muted/50">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleExpanded(operation.id)}
                className="h-6 w-6 p-0"
              >
                {expandedOperations.has(operation.id) ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
              
              <div className="flex items-center gap-3 flex-1">
                <div className="min-w-32">
                  <div className="font-medium">{operation.type}</div>
                  <Badge variant="outline" className={`${getStatusColor(operation.status)} text-xs`}>
                    {operation.status}
                  </Badge>
                </div>
                
                {renderOperationContent(operation)}
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleAddWorkPackage(operation.id)}
                  className="h-8"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add WP
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEditOperation(operation)}
                  className="h-8"
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Work Packages */}
            {expandedOperations.has(operation.id) && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="border-t border-border"
              >
                {operation.workPackages.map((workPackage) => (
                  <div
                    key={workPackage.id}
                    className="flex items-center gap-3 p-4 pl-12 bg-muted/20 hover:bg-muted/40"
                  >
                    <div className="w-2 h-2 rounded-full bg-primary/60" />
                    
                    <div className="flex items-center gap-3 flex-1">
                      <div className="min-w-32">
                        <div className="text-sm font-medium">Work Package</div>
                        <Badge variant="outline" className={`${getStatusColor(workPackage.status)} text-xs`}>
                          {workPackage.status}
                        </Badge>
                      </div>
                      
                      {renderWorkPackageContent(workPackage)}
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditWorkPackage(workPackage, operation.id)}
                      className="h-8"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  )
}
