'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import ProductSelector from './ProductSelector'
import ResourceSelector from './ResourceSelector'
import ActivitySelector from './ActivitySelector'
import { Product } from '@/types/products'
import { Resource } from '@/types/resources'
import { 
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import {
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  BlocActivity,
  ActivityPhase,
  ActivityStatus,
  ActivityTemplate,
  SUGARCANE_PHASES,
  ACTIVITY_TEMPLATES,
  ActivityTemplate
} from '@/types/activities'

interface DrawnArea {
  id: string
  type: string
  coordinates: [number, number][]
  area: number
  fieldIds: string[]
  isHarvested?: boolean
  ratoonHarvestDates?: {
    ratoonNumber: number
    expectedDate: string
    isHarvested: boolean
  }[]
}

interface ActivitiesTabProps {
  bloc: DrawnArea
}

// Sortable Activity Item Component
function SortableActivityItem({ activity, onEdit, onDelete, onStatusChange }: {
  activity: BlocActivity
  onEdit: (activity: BlocActivity) => void
  onDelete: (id: string) => void
  onStatusChange: (id: string, status: ActivityStatus) => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: activity.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const getStatusColor = (status: ActivityStatus) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200'
      case 'planned': return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  // Check if activity is overdue
  const isOverdue = () => {
    const today = new Date()
    const endDate = new Date(activity.endDate)
    return activity.status !== 'completed' && activity.status !== 'cancelled' && endDate < today
  }

  const getPhaseInfo = (phase: ActivityPhase) => {
    return SUGARCANE_PHASES.find(p => p.id === phase)
  }

  const phaseInfo = getPhaseInfo(activity.phase)
  const overdueStatus = isOverdue()

  return (
    <div
      ref={setNodeRef}
      className={`bg-white border rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow ${
        overdueStatus ? 'border-red-300 bg-red-50' : 'border-gray-200'
      }`}
      style={style}
    >
      <div className="flex items-start justify-between">
        {/* Left side - Drag handle and content */}
        <div className="flex items-start space-x-3 flex-1">
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab hover:cursor-grabbing text-gray-400 hover:text-gray-600 mt-1"
          >
            ⋮⋮
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <span className="text-lg">{phaseInfo?.icon}</span>
              <h4 className="font-semibold text-gray-900 truncate">{activity.name}</h4>
              {/* Status Indicators */}
              <div className="flex items-center space-x-1">
                {activity.status === 'completed' && (
                  <span className="text-green-600" title="Completed">✅</span>
                )}
                {overdueStatus && (
                  <span className="text-red-600" title="Overdue">⚠️</span>
                )}
                {activity.status === 'in-progress' && (
                  <span className="text-yellow-600" title="In Progress">⏳</span>
                )}
              </div>
            </div>
            <p className="text-sm text-gray-600 line-clamp-2">{activity.description}</p>
          </div>
        </div>

        {/* Right side - Dates and actions */}
        <div className="flex flex-col items-end space-y-2 ml-4">
          {/* Dates */}
          <div className="text-right text-xs text-gray-500">
            <div>{format(new Date(activity.startDate || activity.plannedDate), 'MMM dd')}</div>
            <div>{format(new Date(activity.endDate || activity.plannedDate), 'MMM dd')}</div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-1">
            {/* Completion checkbox */}
            <button
              type="button"
              onClick={() => onStatusChange(activity.id, activity.status === 'completed' ? 'planned' : 'completed')}
              className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                activity.status === 'completed'
                  ? 'bg-green-500 border-green-500 text-white'
                  : 'border-gray-300 hover:border-green-400'
              }`}
              title={activity.status === 'completed' ? 'Mark as planned' : 'Mark as completed'}
            >
              {activity.status === 'completed' && (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <polyline points="20,6 9,17 4,12"></polyline>
                </svg>
              )}
            </button>

            {/* Edit button */}
            <button
              type="button"
              onClick={() => onEdit(activity)}
              className="w-5 h-5 text-gray-400 hover:text-blue-600 transition-colors"
              title="Edit activity"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            </button>

            {/* Delete button */}
            <button
              type="button"
              onClick={() => onDelete(activity.id)}
              className="w-5 h-5 text-gray-400 hover:text-red-600 transition-colors"
              title="Delete activity"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="3,6 5,6 21,6"></polyline>
                <path d="M19,6v14a2,2,0,0,1-2,2H7a2,2,0,0,1-2-2V6m3,0V4a2,2,0,0,1,2-2h4a2,2,0,0,1,2,2V6"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ActivitiesTab({ bloc }: ActivitiesTabProps) {
  const [activities, setActivities] = useState<BlocActivity[]>([])
  const [selectedPhase, setSelectedPhase] = useState<ActivityPhase | 'all'>('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showActivitySelector, setShowActivitySelector] = useState(false)
  const [editingActivity, setEditingActivity] = useState<BlocActivity | null>(null)
  const [sortBy, setSortBy] = useState<'date' | 'date-desc' | 'phase' | 'status'>('date')
  const [selectedCropCycle, setSelectedCropCycle] = useState<string>('planted')
  const [statusFilter, setStatusFilter] = useState<'all' | 'incomplete' | 'overdue'>('all')
  const [completionFilter, setCompletionFilter] = useState<'all' | 'complete' | 'incomplete'>('all')

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Load mock activities on component mount
  useEffect(() => {
    const mockActivities: BlocActivity[] = [
      {
        id: '1',
        name: 'Land Clearing',
        description: 'Remove weeds, debris, and old crop residues',
        phase: 'land-preparation',
        status: 'completed',
        startDate: '2024-01-15',
        endDate: '2024-01-16',
        actualDate: '2024-01-16',
        duration: 8,
        products: [],
        resourceType: 'mechanical',
        laborHours: 0,
        machineHours: 8,
        totalCost: 500,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'user'
      },
      {
        id: '2',
        name: 'Primary Tillage (Plowing)',
        description: 'Deep plowing to break hardpan and improve soil structure',
        phase: 'land-preparation',
        status: 'completed',
        startDate: '2024-01-20',
        endDate: '2024-01-21',
        actualDate: '2024-01-21',
        duration: 6,
        products: [],
        resourceType: 'mechanical',
        laborHours: 2,
        machineHours: 6,
        totalCost: 400,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'user'
      },
      {
        id: '3',
        name: 'Seed Placement',
        description: 'Place seed cane in furrows',
        phase: 'planting',
        status: 'planned',
        startDate: '2024-02-01',
        endDate: '2024-02-03',
        duration: 12,
        products: [
          {
            productId: 'seed-cane',
            productName: 'Seed Cane R570',
            quantity: 3,
            rate: 3,
            unit: 'tons',
            cost: 600
          }
        ],
        resourceType: 'both',
        laborHours: 8,
        machineHours: 4,
        totalCost: 800,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'user'
      },
      {
        id: '4',
        name: 'First Fertilizer Application',
        description: 'Apply NPK and micronutrients for establishment',
        phase: 'establishment',
        status: 'planned',
        startDate: '2024-02-15',
        endDate: '2024-02-15',
        duration: 4,
        products: [
          {
            productId: 'npk-fertilizer',
            productName: 'NPK 12-12-17',
            quantity: 200,
            rate: 200,
            unit: 'kg',
            cost: 400
          }
        ],
        resourceType: 'both',
        laborHours: 2,
        machineHours: 2,
        totalCost: 600,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'user'
      }
    ]
    setActivities(mockActivities)
  }, [])

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (active.id !== over?.id) {
      setActivities((items) => {
        const oldIndex = items.findIndex(item => item.id === active.id)
        const newIndex = items.findIndex(item => item.id === over?.id)

        return arrayMove(items, oldIndex, newIndex)
      })
    }
  }

  const handleStatusChange = (id: string, status: ActivityStatus) => {
    setActivities(prev => prev.map(activity => 
      activity.id === id 
        ? { ...activity, status, updatedAt: new Date().toISOString() }
        : activity
    ))
  }

  const handleDeleteActivity = (id: string) => {
    if (confirm('Are you sure you want to delete this activity?')) {
      setActivities(prev => prev.filter(activity => activity.id !== id))
    }
  }

  const handleEditActivity = (activity: BlocActivity) => {
    setEditingActivity(activity)
    setShowAddModal(true)
  }

  const handleAddActivity = () => {
    setShowActivitySelector(true)
  }

  const handleActivitySelect = (template: ActivityTemplate) => {
    // Create new activity from template
    const newActivity: BlocActivity = {
      id: Date.now().toString(),
      name: template.name,
      description: template.description,
      phase: template.phase,
      status: 'planned',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + template.estimatedDuration * 60 * 60 * 1000).toISOString().split('T')[0],
      duration: template.estimatedDuration,
      products: [],
      resources: [],
      resourceType: template.resourceType,
      totalCost: template.estimatedCost,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'user'
    }

    setEditingActivity(newActivity)
    setShowAddModal(true)
  }

  const handleSortActivities = () => {
    const sorted = [...activities].sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(a.plannedDate).getTime() - new Date(b.plannedDate).getTime()
        case 'phase':
          const phaseOrder = SUGARCANE_PHASES.map(p => p.id)
          return phaseOrder.indexOf(a.phase) - phaseOrder.indexOf(b.phase)
        case 'status':
          const statusOrder = ['planned', 'in-progress', 'completed', 'cancelled']
          return statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status)
        default:
          return 0
      }
    })
    setActivities(sorted)
  }

  // Check if activity is overdue
  const isOverdue = (activity: BlocActivity) => {
    const today = new Date()
    const endDate = new Date(activity.endDate)
    return activity.status !== 'completed' && activity.status !== 'cancelled' && endDate < today
  }

  const filteredActivities = activities
    .filter(activity => {
      // Phase filter
      if (selectedPhase !== 'all' && activity.phase !== selectedPhase) return false

      // Status filter
      if (statusFilter === 'incomplete' && activity.status === 'completed') return false
      if (statusFilter === 'overdue' && !isOverdue(activity)) return false

      // Completion filter
      if (completionFilter === 'complete' && activity.status !== 'completed') return false
      if (completionFilter === 'incomplete' && activity.status === 'completed') return false

      return true
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(a.startDate || a.plannedDate).getTime() - new Date(b.startDate || b.plannedDate).getTime()
        case 'date-desc':
          return new Date(b.startDate || b.plannedDate).getTime() - new Date(a.startDate || a.plannedDate).getTime()
        case 'phase':
          return SUGARCANE_PHASES.findIndex(p => p.id === a.phase) - SUGARCANE_PHASES.findIndex(p => p.id === b.phase)
        case 'status':
          return a.status.localeCompare(b.status)
        default:
          return 0
      }
    })

  const getPhaseStats = () => {
    const stats = SUGARCANE_PHASES.map(phase => {
      const phaseActivities = activities.filter(a => a.phase === phase.id)
      const completed = phaseActivities.filter(a => a.status === 'completed').length
      const total = phaseActivities.length
      return {
        ...phase,
        completed,
        total,
        progress: total > 0 ? (completed / total) * 100 : 0
      }
    })
    return stats
  }

  const getTotalEstimatedCost = () => {
    return filteredActivities.reduce((total, activity) => {
      const productCosts = activity.products?.reduce((sum, product) => {
        // Use estimated cost from product default cost
        const estimatedCost = product.rate * bloc.area * (product.cost || 0)
        return sum + estimatedCost
      }, 0) || 0

      const resourceCosts = activity.resources?.reduce((sum, resource) => {
        // Use estimated cost from resource default cost
        return sum + (resource.cost || 0)
      }, 0) || 0

      return total + productCosts + resourceCosts
    }, 0)
  }

  const getTotalActualCost = () => {
    return filteredActivities.reduce((total, activity) => {
      const productCosts = activity.products?.reduce((sum, product) => {
        // Use actual cost if available, otherwise estimated
        return sum + (product.cost || 0)
      }, 0) || 0

      const resourceCosts = activity.resources?.reduce((sum, resource) => {
        // Use actual cost if available, otherwise estimated
        return sum + (resource.cost || 0)
      }, 0) || 0

      return total + productCosts + resourceCosts
    }, 0)
  }

  // Helper function to format cost without decimals
  const formatCostWithoutDecimals = (cost: number) => {
    return Math.round(cost).toLocaleString()
  }

  const getCropCycles = () => {
    const cycles = ['planted']

    // Add ratoon cycles based on bloc data
    if (bloc.ratoonHarvestDates) {
      bloc.ratoonHarvestDates.forEach((ratoon) => {
        cycles.push(`ratoon-${ratoon.ratoonNumber}`)
      })
    }

    return cycles.map(cycle => ({
      id: cycle,
      name: cycle === 'planted' ? 'Planted Cycle' : `Ratoon ${cycle.split('-')[1]}`,
      isHarvested: cycle === 'planted' ? bloc.isHarvested :
        bloc.ratoonHarvestDates?.find(r => `ratoon-${r.ratoonNumber}` === cycle)?.isHarvested || false
    }))
  }

  return (
    <div className="flex h-full bg-gray-50">
      {/* Left Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <span className="text-2xl mr-3">📋</span>
              Activities
            </h2>
            <div className="mt-2 text-sm text-gray-600 space-y-1">
              <div>Est Cost: <span className="font-medium text-green-600">Rs {formatCostWithoutDecimals(getTotalEstimatedCost())}</span></div>
              <div>Actual Cost: <span className="font-medium text-blue-600">Rs {formatCostWithoutDecimals(getTotalActualCost())}</span></div>
            </div>
          </div>


        </div>

        {/* Crop Cycle Filter */}
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Crop Cycle</h3>
          <div className="relative">
            <select
              value={selectedCropCycle}
              onChange={(e) => setSelectedCropCycle(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
            >
              {getCropCycles().map((cycle) => (
                <option key={cycle.id} value={cycle.id}>
                  {cycle.name} {cycle.isHarvested ? '(Harvested)' : ''}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400">
                <polyline points="6,9 12,15 18,9"></polyline>
              </svg>
            </div>
          </div>
        </div>

        {/* Phase Selection Blocks */}
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Phases</h3>
          <div className="space-y-2">
            <button
              onClick={() => setSelectedPhase('all')}
              className={`w-full text-left px-3 py-3 rounded-lg text-sm transition-colors border ${
                selectedPhase === 'all'
                  ? 'bg-green-100 text-green-800 border-green-200'
                  : 'hover:bg-gray-50 text-gray-700 border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-lg mr-2">🌾</span>
                  <span className="font-medium">All Phases</span>
                </div>
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                  {activities.length}
                </span>
              </div>
            </button>

            {getPhaseStats().map((phase) => (
              <button
                key={phase.id}
                onClick={() => setSelectedPhase(phase.id)}
                className={`w-full text-left px-3 py-3 rounded-lg text-sm transition-colors border ${
                  selectedPhase === phase.id
                    ? 'bg-green-100 text-green-800 border-green-200'
                    : 'hover:bg-gray-50 text-gray-700 border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <span className="text-lg mr-2">{phase.icon}</span>
                    <span className="font-medium">{phase.name}</span>
                  </div>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                    {phase.total}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600">{phase.completed}/{phase.total} completed</span>
                  <div className="w-16 bg-gray-200 rounded-full h-1.5">
                    <div
                      className="bg-green-500 h-1.5 rounded-full transition-all duration-300"
                      style={{ width: `${phase.progress}%` }}
                    ></div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>


      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          {/* Controls */}
          <div className="flex justify-between items-center mb-4">
            {/* Add Activity Button */}
            <button
              type="button"
              onClick={handleAddActivity}
              className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
              title="Add activity"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
            </button>

            {/* Enhanced Controls */}
            <div className="flex items-center space-x-4">
              {/* Completion Status Filter */}
              <div className="flex items-center space-x-1">
                <span className="text-sm text-gray-500">Status:</span>
                <button
                  type="button"
                  onClick={() => setCompletionFilter(completionFilter === 'incomplete' ? 'all' : 'incomplete')}
                  className={`flex items-center space-x-1 px-2 py-1 rounded-lg text-xs transition-colors ${
                    completionFilter === 'incomplete'
                      ? 'bg-orange-100 text-orange-600 border border-orange-200'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                  title="Show incomplete activities"
                >
                  <span>⏳</span>
                  <span>Incomplete</span>
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter(statusFilter === 'overdue' ? 'all' : 'overdue')}
                  className={`flex items-center space-x-1 px-2 py-1 rounded-lg text-xs transition-colors ${
                    statusFilter === 'overdue'
                      ? 'bg-red-100 text-red-600 border border-red-200'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                  title="Show overdue activities"
                >
                  <span>⚠️</span>
                  <span>Overdue</span>
                </button>
              </div>

              {/* Sort Controls */}
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">Sort:</span>
              <button
                type="button"
                onClick={() => setSortBy('date')}
                className={`p-2 rounded-lg transition-colors ${
                  sortBy === 'date'
                    ? 'bg-green-100 text-green-600'
                    : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                }`}
                title="Sort by date ascending"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 6h18M3 12h18M3 18h18"/>
                  <path d="M8 6l4-4 4 4M8 18l4 4 4-4"/>
                </svg>
              </button>
              <button
                type="button"
                onClick={() => setSortBy('date-desc')}
                className={`p-2 rounded-lg transition-colors ${
                  sortBy === 'date-desc'
                    ? 'bg-green-100 text-green-600'
                    : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                }`}
                title="Sort by date descending"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 6h18M3 12h18M3 18h18"/>
                  <path d="M16 10l-4-4-4 4M16 14l-4 4-4-4"/>
                </svg>
              </button>
              </div>
            </div>
          </div>

          {/* Activities List */}
          <div className="space-y-4">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={filteredActivities.map(a => a.id)}
                strategy={verticalListSortingStrategy}
              >
                {filteredActivities.map((activity) => (
                  <SortableActivityItem
                    key={activity.id}
                    activity={activity}
                    onEdit={handleEditActivity}
                    onDelete={handleDeleteActivity}
                    onStatusChange={handleStatusChange}
                  />
                ))}
              </SortableContext>
            </DndContext>

            {filteredActivities.length === 0 && (
              <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                <div className="text-4xl mb-4">📝</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No activities found</h3>
                <p className="text-gray-600 mb-4">
                  {selectedPhase === 'all'
                    ? 'Start by adding your first activity'
                    : `No activities in the ${SUGARCANE_PHASES.find(p => p.id === selectedPhase)?.name} phase`
                  }
                </p>
                <button
                  type="button"
                  onClick={handleAddActivity}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                >
                  Add Activity
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add/Edit Activity Modal */}
      {showAddModal && (
        <AddActivityModal
          activity={editingActivity}
          blocArea={bloc.area}
          onSave={(activity) => {
            if (editingActivity) {
              setActivities(prev => prev.map(a => a.id === activity.id ? activity : a))
            } else {
              setActivities(prev => [...prev, { ...activity, id: Date.now().toString() }])
            }
            setShowAddModal(false)
            setEditingActivity(null)
          }}
          onCancel={() => {
            setShowAddModal(false)
            setEditingActivity(null)
          }}
        />
      )}

      {/* Activity Selector Modal */}
      {showActivitySelector && (
        <ActivitySelector
          onSelect={handleActivitySelect}
          onClose={() => setShowActivitySelector(false)}
          selectedPhase={selectedPhase}
        />
      )}
    </div>
  )
}

// Add Activity Modal Component
function AddActivityModal({
  activity,
  blocArea,
  onSave,
  onCancel
}: {
  activity: BlocActivity | null
  blocArea: number
  onSave: (activity: BlocActivity) => void
  onCancel: () => void
}) {
  const [formData, setFormData] = useState<Partial<BlocActivity>>({
    name: activity?.name || '',
    description: activity?.description || '',
    phase: activity?.phase || 'land-preparation',
    status: activity?.status || 'planned',
    startDate: activity?.startDate || new Date().toISOString().split('T')[0],
    endDate: activity?.endDate || new Date().toISOString().split('T')[0],
    duration: activity?.duration || 4,
    products: activity?.products || [],
    resources: activity?.resources || [],
    resourceType: activity?.resourceType || 'both',
    laborHours: activity?.laborHours || 0,
    machineHours: activity?.machineHours || 0,
    totalCost: activity?.totalCost || 0,
    notes: activity?.notes || ''
  })

  const [selectedTemplate, setSelectedTemplate] = useState<string>('')
  const [showProductSelector, setShowProductSelector] = useState(false)
  const [showResourceSelector, setShowResourceSelector] = useState(false)
  const [showProductEditor, setShowProductEditor] = useState(false)
  const [editingProductIndex, setEditingProductIndex] = useState<number | null>(null)
  const [editingResourceIndex, setEditingResourceIndex] = useState<number | null>(null)

  const handleTemplateSelect = (templateId: string) => {
    const template = ACTIVITY_TEMPLATES.find(t => t.id === templateId)
    if (template) {
      setFormData({
        ...formData,
        name: template.name,
        description: template.description,
        phase: template.phase,
        duration: template.estimatedDuration,
        resourceType: template.resourceType,
        totalCost: template.estimatedCost
      })
    }
  }

  const handleProductSelect = (product: Product, quantity: number, rate: number, actualCost?: number) => {
    const newProduct = {
      productId: product.id,
      productName: product.name,
      quantity,
      rate,
      unit: product.unit,
      cost: actualCost || (product.cost ? quantity * product.cost : 0)
    }

    if (editingProductIndex !== null) {
      // Edit existing product
      const updatedProducts = [...(formData.products || [])]
      updatedProducts[editingProductIndex] = newProduct
      setFormData({ ...formData, products: updatedProducts })
      setEditingProductIndex(null)
    } else {
      // Add new product
      const updatedProducts = [...(formData.products || []), newProduct]
      setFormData({ ...formData, products: updatedProducts })
    }
  }

  const handleResourceSelect = (resource: Resource, hours: number, actualCost?: number) => {
    const newResource = {
      resourceId: resource.id,
      resourceName: resource.name,
      hours,
      unit: resource.unit,
      cost: actualCost || (resource.costPerUnit ? hours * resource.costPerUnit : 0),
      category: resource.category
    }

    if (editingResourceIndex !== null) {
      // Edit existing resource
      const updatedResources = [...(formData.resources || [])]
      updatedResources[editingResourceIndex] = newResource
      setFormData({ ...formData, resources: updatedResources })
      setEditingResourceIndex(null)
    } else {
      // Add new resource
      const updatedResources = [...(formData.resources || []), newResource]
      setFormData({ ...formData, resources: updatedResources })
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const newActivity: BlocActivity = {
      id: activity?.id || Date.now().toString(),
      name: formData.name!,
      description: formData.description!,
      phase: formData.phase!,
      status: formData.status!,
      startDate: formData.startDate!,
      endDate: formData.endDate!,
      actualDate: activity?.actualDate,
      duration: formData.duration!,
      products: formData.products || [],
      resources: formData.resources || [],
      resourceType: formData.resourceType,
      laborHours: formData.laborHours,
      machineHours: formData.machineHours,
      totalCost: formData.totalCost,
      notes: formData.notes,
      createdAt: activity?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: activity?.createdBy || 'user'
    }

    onSave(newActivity)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">
              {activity ? 'Edit Activity' : 'Add New Activity'}
            </h2>
            <button
              type="button"
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ✕
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Template Selection */}
            {!activity && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Use Template (Optional)
                </label>
                <select
                  value={selectedTemplate}
                  onChange={(e) => {
                    setSelectedTemplate(e.target.value)
                    if (e.target.value) handleTemplateSelect(e.target.value)
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Select a template...</option>
                  {ACTIVITY_TEMPLATES.map(template => (
                    <option key={template.id} value={template.id}>
                      {SUGARCANE_PHASES.find(p => p.id === template.phase)?.icon} {template.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Activity Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phase *
                </label>
                <select
                  required
                  value={formData.phase}
                  onChange={(e) => setFormData({ ...formData, phase: e.target.value as ActivityPhase })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  {SUGARCANE_PHASES.map(phase => (
                    <option key={phase.id} value={phase.id}>
                      {phase.icon} {phase.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* Scheduling */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date *
                </label>
                <input
                  type="date"
                  required
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date *
                </label>
                <input
                  type="date"
                  required
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration (hours) *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.5"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as ActivityStatus })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="planned">Planned</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>

            {/* Products & Resources */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-gray-700">
                  Products & Resources
                </label>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowProductSelector(true)}
                    className="flex items-center space-x-2 px-3 py-2 text-sm text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg border border-dashed border-green-300 hover:border-green-400 transition-colors"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="12" y1="5" x2="12" y2="19"></line>
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                    <span>Add Product</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowResourceSelector(true)}
                    className="flex items-center space-x-2 px-3 py-2 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg border border-dashed border-blue-300 hover:border-blue-400 transition-colors"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="12" y1="5" x2="12" y2="19"></line>
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                    <span>Add Resource</span>
                  </button>
                </div>
              </div>

              {(formData.products && formData.products.length > 0) || (formData.resources && formData.resources.length > 0) ? (
                <div className="space-y-2">
                  {/* Products */}
                  {formData.products?.map((product, index) => (
                    <div key={`product-${index}`} className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center space-x-3">
                        <span className="text-lg">🧪</span>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{product.productName}</div>
                          <div className="text-sm text-gray-600">
                            {product.quantity} {product.unit} • Rate: {product.rate} {product.unit}/ha
                            {product.cost && <span> • Cost: Rs {product.cost.toLocaleString()}</span>}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingProductIndex(index)
                            setShowProductEditor(true)
                          }}
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="Edit product"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                          </svg>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const updatedProducts = formData.products?.filter((_, i) => i !== index) || []
                            setFormData({ ...formData, products: updatedProducts })
                          }}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Remove product"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Resources */}
                  {formData.resources?.map((resource, index) => (
                    <div key={`resource-${index}`} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center space-x-3">
                        <span className="text-lg">🚜</span>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{resource.resourceName}</div>
                          <div className="text-sm text-gray-600">
                            {resource.hours} {resource.unit}
                            {resource.cost && <span> • Cost: Rs {resource.cost.toLocaleString()}</span>}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingResourceIndex(index)
                            setShowResourceSelector(true)
                          }}
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="Edit resource"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                          </svg>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const updatedResources = formData.resources?.filter((_, i) => i !== index) || []
                            setFormData({ ...formData, resources: updatedResources })
                          }}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Remove resource"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
                  <div className="text-2xl mb-2">📦</div>
                  <p>No products or resources added yet</p>
                  <p className="text-sm">Click "Add Product" or "Add Resource" to get started</p>
                </div>
              )}
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Additional notes or observations..."
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              Enregistrer
            </button>
          </div>
        </form>
      </div>

      {/* Product Selector Modal */}
      {showProductSelector && (
        <ProductSelector
          onSelect={handleProductSelect}
          onClose={() => {
            setShowProductSelector(false)
            setEditingProductIndex(null)
          }}
          blocArea={blocArea}
          existingProduct={editingProductIndex !== null ? formData.products?.[editingProductIndex] : undefined}
        />
      )}

      {/* Resource Selector Modal */}
      {showResourceSelector && (
        <ResourceSelector
          onSelect={handleResourceSelect}
          onClose={() => {
            setShowResourceSelector(false)
            setEditingResourceIndex(null)
          }}
          existingResource={editingResourceIndex !== null ? formData.resources?.[editingResourceIndex] : undefined}
        />
      )}

      {/* Product Editor Modal */}
      {showProductEditor && editingProductIndex !== null && formData.products?.[editingProductIndex] && (
        <ProductEditor
          product={formData.products[editingProductIndex]}
          blocArea={blocArea}
          onSave={(updatedProduct) => {
            const updatedProducts = [...(formData.products || [])]
            updatedProducts[editingProductIndex] = updatedProduct
            setFormData({ ...formData, products: updatedProducts })
            setShowProductEditor(false)
            setEditingProductIndex(null)
          }}
          onClose={() => {
            setShowProductEditor(false)
            setEditingProductIndex(null)
          }}
        />
      )}
    </div>
  )
}

// Product Editor Component
function ProductEditor({
  product,
  blocArea,
  onSave,
  onClose
}: {
  product: {
    productId: string
    productName: string
    quantity: number
    rate: number
    unit: string
    cost: number
  }
  blocArea: number
  onSave: (product: {
    productId: string
    productName: string
    quantity: number
    rate: number
    unit: string
    cost: number
  }) => void
  onClose: () => void
}) {
  const [quantity, setQuantity] = useState(product.quantity)
  const [rate, setRate] = useState(product.rate)
  const [actualCost, setActualCost] = useState(product.cost)
  const [isUpdatingFromRate, setIsUpdatingFromRate] = useState(false)

  const handleRateChange = (newRate: number) => {
    setIsUpdatingFromRate(true)
    setRate(newRate)
    const calculatedQuantity = Math.round((newRate * blocArea) * 10) / 10
    setQuantity(calculatedQuantity)
    setIsUpdatingFromRate(false)
  }

  const handleQuantityChange = (newQuantity: number) => {
    if (!isUpdatingFromRate) {
      setQuantity(newQuantity)
      const calculatedRate = blocArea > 0 ? Math.round((newQuantity / blocArea) * 10) / 10 : 0
      setRate(calculatedRate)
    }
  }

  const handleSave = () => {
    onSave({
      productId: product.productId,
      productName: product.productName,
      quantity,
      rate,
      unit: product.unit,
      cost: actualCost
    })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Edit Product</h2>
            <p className="text-gray-600 mt-1">{product.productName}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* Form */}
        <div className="p-6 space-y-6">
          {/* Rate Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rate ({product.unit}/ha) *
            </label>
            <input
              type="number"
              min="0"
              step="0.1"
              value={rate}
              onChange={(e) => handleRateChange(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Enter application rate"
            />
          </div>

          {/* Quantity Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quantity ({product.unit}) *
            </label>
            <input
              type="number"
              min="0"
              step="0.1"
              value={quantity}
              onChange={(e) => handleQuantityChange(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Total quantity needed"
            />
            <p className="text-xs text-gray-500 mt-1">
              Calculated: {rate} {product.unit}/ha × {blocArea.toFixed(2)} ha = {(rate * blocArea).toFixed(1)} {product.unit}
            </p>
          </div>

          {/* Actual Cost Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Actual Cost (Rs)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={actualCost}
              onChange={(e) => setActualCost(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Enter actual cost"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  )
}
