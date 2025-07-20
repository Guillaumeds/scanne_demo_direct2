'use client'

import React from 'react'
import { motion } from 'motion/react'
import { Calendar, MapPin, Users, Truck, Clock, Edit, Plus } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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

interface OperationsCardsProps {
  data: Operation[]
  perspective: Perspective
  searchQuery: string
}

export function OperationsCards({ data, perspective, searchQuery }: OperationsCardsProps) {
  const { setCurrentScreen, setCurrentOperationId, setCurrentWorkPackageId } = useBlocContext()

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

  const renderOperationCard = (operation: Operation) => {
    if (perspective === 'operations') {
      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
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
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Progress</span>
              <span className="text-sm text-muted-foreground">{operation.progress}%</span>
            </div>
            <Progress value={operation.progress} className="h-2" />
          </div>

          {operation.actualStartDate && (
            <div className="text-xs text-muted-foreground">
              Actual: {formatDate(operation.actualStartDate)} - {formatDate(operation.actualEndDate)}
            </div>
          )}
        </div>
      )
    }

    if (perspective === 'resources') {
      const totalHours = operation.workPackages.reduce((acc, wp) => acc + wp.hours, 0)
      const uniqueEquipment = Array.from(new Set(operation.workPackages.map(wp => wp.equipment)))
      const uniqueCrews = Array.from(new Set(operation.workPackages.map(wp => wp.crew)))

      return (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="text-sm font-medium">Equipment</div>
                <div className="text-xs text-muted-foreground">
                  {uniqueEquipment.join(', ')}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="text-sm font-medium">Crews</div>
                <div className="text-xs text-muted-foreground">
                  {uniqueCrews.join(', ')}
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">Total Hours: {totalHours}h</span>
          </div>
        </div>
      )
    }

    // Financial perspective
    const variance = operation.actualCost - operation.estimatedCost
    const isOver = variance > 0

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm font-medium">Estimated</div>
            <div className="text-lg font-bold text-primary">
              Rs {operation.estimatedCost.toLocaleString()}
            </div>
          </div>
          <div>
            <div className="text-sm font-medium">Actual</div>
            <div className="text-lg font-bold">
              Rs {operation.actualCost.toLocaleString()}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">Rs</span>
          <span className="text-sm">Variance: </span>
          <span className={`text-sm font-medium ${isOver ? 'text-red-600' : 'text-green-600'}`}>
            {isOver ? '+' : ''}Rs {variance.toLocaleString()}
          </span>
        </div>

        <div className="text-xs text-muted-foreground">
          Cost per hectare: ${(operation.actualCost / operation.area).toFixed(0)}
        </div>
      </div>
    )
  }

  return (
    <div className="h-full overflow-auto p-6">
      <motion.div
        className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {filteredData.map((operation, index) => (
          <motion.div
            key={operation.id}
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
              duration: 0.4,
              delay: index * 0.1,
              ease: [0.4, 0, 0.2, 1]
            }}
            whileHover={{
              y: -8,
              transition: { duration: 0.2, ease: "easeOut" }
            }}
            layout
          >
            <Card className="h-full relative overflow-hidden group cursor-pointer">
              {/* Hover gradient overlay */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10 opacity-0 group-hover:opacity-100"
                transition={{ duration: 0.3 }}
              />

              {/* Status indicator line */}
              <motion.div
                className={`absolute top-0 left-0 right-0 h-1 ${
                  operation.status === 'completed' ? 'bg-green-500' :
                  operation.status === 'in-progress' ? 'bg-yellow-500' :
                  operation.status === 'planned' ? 'bg-blue-500' : 'bg-gray-500'
                }`}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 + 0.2 }}
                style={{ transformOrigin: 'left' }}
              />

              <CardHeader className="relative">
                <div className="flex items-center justify-between">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 + 0.3 }}
                  >
                    <CardTitle className="text-lg group-hover:text-primary transition-colors">
                      {operation.type}
                    </CardTitle>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 + 0.4, type: "spring", bounce: 0.4 }}
                  >
                    <Badge variant="outline" className={getStatusColor(operation.status)}>
                      {operation.status}
                    </Badge>
                  </motion.div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 relative">
                {renderOperationCard(operation)}
                
                <Separator />
                
                {/* Work Packages Section */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-medium">Work Packages ({operation.workPackages.length})</h4>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddWorkPackage(operation.id)}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Add
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    {operation.workPackages.slice(0, 3).map((workPackage) => (
                      <div
                        key={workPackage.id}
                        className="flex items-center justify-between p-2 bg-muted/30 rounded-lg"
                      >
                        <div>
                          <div className="text-sm font-medium">{formatDate(workPackage.date)}</div>
                          <div className="text-xs text-muted-foreground">
                            {workPackage.area.toFixed(1)} ha • {workPackage.hours}h
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Badge variant="outline" className={getStatusColor(workPackage.status)}>
                            {workPackage.status}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditWorkPackage(workPackage, operation.id)}
                            className="h-6 w-6 p-0"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    
                    {operation.workPackages.length > 3 && (
                      <div className="text-xs text-muted-foreground text-center">
                        +{operation.workPackages.length - 3} more work packages
                      </div>
                    )}
                  </div>
                </div>
                
                <Separator />
                
                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditOperation(operation)}
                    className="flex-1"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Operation
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}
