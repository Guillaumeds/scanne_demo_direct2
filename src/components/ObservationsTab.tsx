'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
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
  BlocObservation,
  ObservationCategory,
  ObservationStatus,
  OBSERVATION_CATEGORIES
} from '@/types/observations'
import ObservationForm from './ObservationForms'
import CategorySelector from './CategorySelector'
import { useCropCyclePermissions, useCropCycleInfo, useCropCycleValidation } from '@/contexts/CropCycleContext'
import { useSelectedCropCycle } from '@/contexts/SelectedCropCycleContext'
import { ObservationService } from '@/services/observationService'
import CropCycleSelector from './CropCycleSelector'
import AttachmentUploader, { AttachmentFile } from './AttachmentUploader'

interface DrawnArea {
  id: string
  type: string
  coordinates: [number, number][]
  area: number
  isHarvested?: boolean
  ratoonHarvestDates?: {
    ratoonNumber: number
    expectedDate: string
    isHarvested: boolean
  }[]
}

interface ObservationsTabProps {
  bloc: DrawnArea
}

// Sortable Observation Item Component
function SortableObservationItem({ observation, onEdit, onDelete, onStatusChange }: {
  observation: BlocObservation
  onEdit: (observation: BlocObservation) => void
  onDelete: (id: string) => void
  onStatusChange: (id: string, status: ObservationStatus) => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: observation.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const getStatusColor = (status: ObservationStatus) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200'
      case 'in-progress': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'planned': return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  // Check if observation is overdue
  const isOverdue = () => {
    const today = new Date()
    const observationDate = new Date(observation.observationDate)
    return observation.status !== 'completed' && observationDate < today
  }

  const getCategoryInfo = (category: ObservationCategory) => {
    return OBSERVATION_CATEGORIES.find(c => c.id === category)
  }

  const categoryInfo = getCategoryInfo(observation.category)
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
              <span className="text-lg">{categoryInfo?.icon}</span>
              <h4 className="font-semibold text-gray-900 truncate">{observation.name}</h4>
              {/* Status Indicators */}
              <div className="flex items-center space-x-1">
                {observation.status === 'completed' && (
                  <span className="text-green-600" title="Completed">✅</span>
                )}
                {overdueStatus && (
                  <span className="text-red-600" title="Overdue">⚠️</span>
                )}
                {observation.status === 'in-progress' && (
                  <span className="text-yellow-600" title="In Progress">⏳</span>
                )}
              </div>
            </div>
            <p className="text-sm text-gray-600 line-clamp-2">{observation.description}</p>
            {/* Sample info */}
            {(observation.numberOfSamples || observation.numberOfPlants) && (
              <div className="text-xs text-gray-500 mt-1">
                {observation.numberOfSamples && `${observation.numberOfSamples} samples`}
                {observation.numberOfSamples && observation.numberOfPlants && ' • '}
                {observation.numberOfPlants && `${observation.numberOfPlants} plants`}
              </div>
            )}
          </div>
        </div>

        {/* Right side - Date and actions */}
        <div className="flex flex-col items-end space-y-2 ml-4">
          {/* Date */}
          <div className="text-right text-xs text-gray-500">
            <div>{format(new Date(observation.observationDate), 'MMM dd')}</div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-1">
            {/* Status cycle button */}
            <button
              type="button"
              onClick={() => {
                const statusCycle: ObservationStatus[] = ['planned', 'in-progress', 'completed']
                const currentIndex = statusCycle.indexOf(observation.status)
                const nextStatus = statusCycle[(currentIndex + 1) % statusCycle.length]
                onStatusChange(observation.id, nextStatus)
              }}
              className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                observation.status === 'completed'
                  ? 'bg-green-500 border-green-500 text-white'
                  : observation.status === 'in-progress'
                  ? 'bg-yellow-500 border-yellow-500 text-white'
                  : 'border-gray-300 hover:border-green-400'
              }`}
              title={`Current: ${observation.status}. Click to cycle status.`}
            >
              {observation.status === 'completed' && (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <polyline points="20,6 9,17 4,12"></polyline>
                </svg>
              )}
              {observation.status === 'in-progress' && (
                <div className="w-2 h-2 bg-white rounded-full"></div>
              )}
            </button>

            {/* Edit button */}
            <button
              type="button"
              onClick={() => onEdit(observation)}
              className="w-5 h-5 text-gray-400 hover:text-blue-600 transition-colors"
              title="Edit observation"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            </button>

            {/* Delete button */}
            <button
              type="button"
              onClick={() => onDelete(observation.id)}
              className="w-5 h-5 text-gray-400 hover:text-red-600 transition-colors"
              title="Delete observation"
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

export default function ObservationsTab({ bloc }: ObservationsTabProps) {
  // Crop cycle permissions and data
  const permissions = useCropCyclePermissions()
  const validation = useCropCycleValidation()
  const { allCycles } = useCropCycleInfo()

  // Selected crop cycle context
  const { getSelectedCycleInfo, canEditSelectedCycle } = useSelectedCropCycle()
  const selectedCycleInfo = getSelectedCycleInfo()
  const canEdit = canEditSelectedCycle()

  const [observations, setObservations] = useState<BlocObservation[]>([])
  const [selectedCategory, setSelectedCategory] = useState<ObservationCategory | 'all'>('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showCategorySelector, setShowCategorySelector] = useState(false)
  const [editingObservation, setEditingObservation] = useState<BlocObservation | null>(null)
  const [sortBy, setSortBy] = useState<'date' | 'date-desc' | 'category' | 'status'>('date')
  const [selectedCropCycle, setSelectedCropCycle] = useState<string>('planted')
  const [statusFilter, setStatusFilter] = useState<'all' | 'incomplete' | 'overdue'>('all')
  const [completionFilter, setCompletionFilter] = useState<'all' | 'complete' | 'incomplete'>('all')
  const [observationsLoading, setObservationsLoading] = useState(false)
  // Totals are displayed in right panel only - no duplicate calculations needed

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Load observations from database
  useEffect(() => {
    const loadObservations = async () => {
      if (selectedCycleInfo?.id) {
        setObservationsLoading(true)
        try {
          const cycleObservations = await ObservationService.getObservationsForCycle(selectedCycleInfo.id)
          setObservations(cycleObservations)
        } catch (error) {
          console.error('Error loading observations:', error)
          setObservations([])
        } finally {
          setObservationsLoading(false)
        }
      } else {
        setObservations([])
        setObservationsLoading(false)
      }
    }

    loadObservations()
  }, [selectedCycleInfo?.id])

  // Helper function to format cost without decimals
  const formatCostWithoutDecimals = (cost: number) => {
    return Math.round(cost).toLocaleString()
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (active.id !== over?.id) {
      setObservations((items) => {
        const oldIndex = items.findIndex(item => item.id === active.id)
        const newIndex = items.findIndex(item => item.id === over?.id)

        return arrayMove(items, oldIndex, newIndex)
      })
    }
  }

  const handleStatusChange = async (id: string, status: ObservationStatus) => {
    try {
      // Update in database and state
      const updatedObservation = await ObservationService.updateObservation(id, {
        status,
        updatedAt: new Date().toISOString()
      })
      setObservations(prev => prev.map(observation =>
        observation.id === id ? updatedObservation : observation
      ))
    } catch (error) {
      console.error('Error updating observation status:', error)
    }
  }

  const handleDeleteObservation = async (id: string) => {
    if (confirm('Are you sure you want to delete this observation?')) {
      // Immediate UI feedback - remove from list and show loading
      setObservations(prev => prev.filter(observation => observation.id !== id))
      setObservationsLoading(true)

      // Background database operation
      ObservationService.deleteObservation(id).then(() => {
        console.log('✅ Observation deleted successfully')
        // Reload observations from database to ensure consistency
        if (selectedCycleInfo?.id) {
          return ObservationService.getObservationsForCycle(selectedCycleInfo.id)
        }
        return []
      }).then((refreshedObservations) => {
        setObservations(refreshedObservations)
        setObservationsLoading(false)
      }).catch(error => {
        console.error('❌ Error deleting observation:', error)
        // Reload observations to restore state in case of error
        if (selectedCycleInfo?.id) {
          ObservationService.getObservationsForCycle(selectedCycleInfo.id).then(observations => {
            setObservations(observations)
            setObservationsLoading(false)
          })
        } else {
          setObservationsLoading(false)
        }
      })
    }
  }

  const handleEditObservation = (observation: BlocObservation) => {
    console.log('✏️ Editing observation:', observation.id, observation.name)
    console.log('📊 Observation data:', observation.data)
    console.log('🌾 Yield data:', {
      yieldTonsHa: observation.yieldTonsHa,
      areaHectares: observation.areaHectares,
      totalYieldTons: observation.totalYieldTons
    })
    console.log('📋 Full observation:', observation)

    setEditingObservation(observation)
    setShowAddModal(true)
  }

  const handleAddObservation = () => {
    setShowCategorySelector(true)
  }

  const handleCategorySelect = (category: ObservationCategory | import('@/types/attachments').AttachmentCategory) => {
    // Only handle observation categories - use the actual category IDs
    const validCategories = OBSERVATION_CATEGORIES.map(c => c.id)
    if (!validCategories.includes(category as ObservationCategory)) {
      return
    }
    setShowCategorySelector(false)
    setEditingObservation(null)
    setShowAddModal(true)
    // Set the selected category for the form
    setSelectedCategory(category as ObservationCategory)
  }

  // Check if observation is overdue
  const isOverdue = (observation: BlocObservation) => {
    const today = new Date()
    const observationDate = new Date(observation.observationDate)
    return observation.status !== 'completed' && observationDate < today
  }

  const filteredObservations = observations
    .filter(observation => {
      // Category filter
      if (selectedCategory !== 'all' && observation.category !== selectedCategory) return false

      // Status filter
      if (statusFilter === 'incomplete' && observation.status === 'completed') return false
      if (statusFilter === 'overdue' && !isOverdue(observation)) return false

      // Completion filter
      if (completionFilter === 'complete' && observation.status !== 'completed') return false
      if (completionFilter === 'incomplete' && observation.status === 'completed') return false

      return true
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(a.observationDate).getTime() - new Date(b.observationDate).getTime()
        case 'date-desc':
          return new Date(b.observationDate).getTime() - new Date(a.observationDate).getTime()
        case 'category':
          return OBSERVATION_CATEGORIES.findIndex(c => c.id === a.category) - OBSERVATION_CATEGORIES.findIndex(c => c.id === b.category)
        case 'status':
          return a.status.localeCompare(b.status)
        default:
          return 0
      }
    })

  return (
    <div className="flex h-full bg-gray-50">
      {/* Left Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <span className="text-2xl mr-3">🔬</span>
              Observations
            </h2>
          </div>
        </div>

        {/* Crop Cycle Selector */}
        <CropCycleSelector />

        {/* Totals displayed in right panel only */}

        {/* Category Selection */}
        <div className="p-6 border-b border-gray-200 flex-1 overflow-y-auto">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Categories</h3>
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => setSelectedCategory('all')}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors border ${
                selectedCategory === 'all'
                  ? 'bg-green-100 text-green-800 border-green-200'
                  : 'hover:bg-gray-50 text-gray-700 border-gray-200'
              }`}
            >
              <span className="font-medium">All Categories</span>
            </button>

            {OBSERVATION_CATEGORIES.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => setSelectedCategory(category.id)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors border ${
                  selectedCategory === category.id
                    ? 'bg-green-100 text-green-800 border-green-200'
                    : 'hover:bg-gray-50 text-gray-700 border-gray-200'
                }`}
              >
                <span className="font-medium">{category.icon} {category.name}</span>
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
            {/* Add Observation Button */}
            <button
              type="button"
              onClick={handleAddObservation}
              disabled={!permissions.canAddObservations}
              className={`p-2 rounded-lg transition-colors ${
                permissions.canAddObservations
                  ? 'text-gray-400 hover:text-green-600 hover:bg-green-50'
                  : 'text-gray-300 cursor-not-allowed'
              }`}
              title={permissions.canAddObservations ? "Add observation" : "Cannot add observations - cycle is closed"}
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
                  title="Show incomplete observations"
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
                  title="Show overdue observations"
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

          {/* Observations List */}
          <div className="space-y-4">
            {observationsLoading ? (
              <div className="flex flex-col items-center justify-center py-12 bg-white rounded-lg border border-gray-200">
                <div className="relative">
                  <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mt-4 mb-2">Loading Observations</h3>
                <p className="text-gray-600 text-center">
                  Fetching observations from database...
                </p>
              </div>
            ) : (
              <>
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={filteredObservations.map(o => o.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {filteredObservations.map((observation) => (
                      <SortableObservationItem
                        key={observation.id}
                        observation={observation}
                        onEdit={handleEditObservation}
                        onDelete={handleDeleteObservation}
                        onStatusChange={handleStatusChange}
                      />
                    ))}
                  </SortableContext>
                </DndContext>

                {filteredObservations.length === 0 && (
                  <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                    <div className="text-4xl mb-4">🔬</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No observations found</h3>
                    <p className="text-gray-600 mb-4">
                      {selectedCategory === 'all'
                        ? 'Start by adding your first observation'
                        : `No observations in the ${OBSERVATION_CATEGORIES.find(c => c.id === selectedCategory)?.name} category`
                      }
                    </p>
                    <button
                      type="button"
                      onClick={handleAddObservation}
                      disabled={!permissions.canAddObservations}
                      className={`px-4 py-2 rounded-lg transition-colors ${
                        permissions.canAddObservations
                          ? 'bg-green-600 hover:bg-green-700 text-white'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      Add Observation
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Category Selector Modal */}
      {showCategorySelector && (
        <CategorySelector
          type="observation"
          onSelect={handleCategorySelect}
          onClose={() => setShowCategorySelector(false)}
        />
      )}

      {/* Add/Edit Observation Modal */}
      {showAddModal && (
        <ObservationForm
          observation={editingObservation}
          category={selectedCategory !== 'all' ? selectedCategory : undefined}
          blocArea={bloc.area}
          onSave={async (observation) => {
            try {
              // Close modal immediately for better UX
              setShowAddModal(false)
              setEditingObservation(null)
              setObservationsLoading(true)

              // Background database operation
              const saveOperation = editingObservation
                ? ObservationService.updateObservation(editingObservation.id, observation)
                : ObservationService.createObservation(observation)

              saveOperation.then((savedObservation) => {
                console.log('✅ Observation saved successfully')
                // Reload observations from database to ensure consistency
                if (selectedCycleInfo?.id) {
                  return ObservationService.getObservationsForCycle(selectedCycleInfo.id)
                }
                return []
              }).then((refreshedObservations) => {
                setObservations(refreshedObservations)
                setObservationsLoading(false)
              }).catch(error => {
                console.error('❌ Error saving observation:', error)
                // Reload observations to restore state in case of error
                if (selectedCycleInfo?.id) {
                  ObservationService.getObservationsForCycle(selectedCycleInfo.id).then(observations => {
                    setObservations(observations)
                    setObservationsLoading(false)
                  })
                } else {
                  setObservationsLoading(false)
                }
                alert(`Error saving observation: ${error instanceof Error ? error.message : 'Unknown error'}`)
              })
            } catch (error) {
              console.error('Error preparing observation for save:', error)
              alert(`Error preparing observation: ${error instanceof Error ? error.message : 'Unknown error'}`)
            }
          }}
          onCancel={() => {
            setShowAddModal(false)
            setEditingObservation(null)
          }}
        />
      )}
    </div>
  )
}




