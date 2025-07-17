'use client'

import { useState, useEffect, forwardRef, useImperativeHandle } from 'react'
import { CropCycle, CreateCycleRequest, CycleClosureValidation } from '@/types/cropCycles'
import { CropVariety } from '@/types/varieties'
import { useSugarcaneVarieties, useIntercropVarieties } from '@/hooks/useLocalStorageData'
import { CropCycleValidationService } from '@/services/cropCycleValidationService'
import { CropCycleService } from '@/services/cropCycleService'
import { CropCycleCalculationService } from '@/services/cropCycleCalculationService'
import { ActivityService } from '@/services/activityService'
import { ObservationService } from '@/services/observationService'

import { useCropCycle } from '@/contexts/CropCycleContext'
import VarietySelector from './VarietySelector'
import CycleClosureModal from './CycleClosureModal'
import { FormSaveStatus } from './UnsavedChangesIndicator'
import { Trash2, Archive, AlertTriangle } from 'lucide-react'

// Import the proper DrawnArea type instead of redefining it
import { DrawnArea } from '@/types/drawnArea'

interface CropCycleGeneralInfoProps {
  bloc: DrawnArea
  onSave: (data: any) => void
  sidePanel?: boolean
  hideSidePanel?: boolean
}

const CropCycleGeneralInfo = forwardRef<any, CropCycleGeneralInfoProps>(
  ({ bloc, onSave, sidePanel = false, hideSidePanel = false }, ref) => {
    // Use crop cycle context (eliminates redundant API calls!)
    const { createCycle, allCycles, activeCycle, refreshCycles } = useCropCycle()
    const [cycleMetrics, setCycleMetrics] = useState<{[cycleId: string]: any}>({})
    const [showSugarcaneSelector, setShowSugarcaneSelector] = useState(false)
    const [showIntercropSelector, setShowIntercropSelector] = useState(false)
    const [showClosureModal, setShowClosureModal] = useState(false)
    const [showEditCycle, setShowEditCycle] = useState(false)
    const [editCycleData, setEditCycleData] = useState({
      plantingDate: '',
      plannedHarvestDate: '',
      expectedYield: 0,
      sugarcaneVarietyId: '',
      sugarcaneVarietyName: '',
      intercropVarietyId: '',
      intercropVarietyName: ''
    })
    const [closureValidation, setClosureValidation] = useState<CycleClosureValidation | null>(null)
    const [validationErrors, setValidationErrors] = useState<string[]>([])
    const [isValidating, setIsValidating] = useState(false)
  const [isUpdatingCycle, setIsUpdatingCycle] = useState(false)
    const [isCreatingCycle, setIsCreatingCycle] = useState(false)
    const [isRecalculating, setIsRecalculating] = useState(false)
    const [isLoadingData, setIsLoadingData] = useState(false)

    // Delete/Retire confirmation states
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const [showRetireConfirm, setShowRetireConfirm] = useState(false)
    const [deleteConfirmText, setDeleteConfirmText] = useState('')
    const [retireConfirmText, setRetireConfirmText] = useState('')
    const [isDeleting, setIsDeleting] = useState(false)
    const [isRetiring, setIsRetiring] = useState(false)

    // Simple form state for new cycle creation (no auto-commit)
    const [newCycleData, setNewCycleData] = useState({
      sugarcaneVarietyId: '',
      sugarcaneVarietyName: '',
      intercropVarietyId: 'none',
      intercropVarietyName: 'None',
      plantingDate: '',
      plannedHarvestDate: '',
      expectedYield: '' as string | number
    })

    // Use localStorage for varieties data
    const { data: sugarcaneVarieties, loading: sugarcaneLoading } = useSugarcaneVarieties()
    const { data: intercropVarieties, loading: intercropLoading } = useIntercropVarieties()
    const configLoading = sugarcaneLoading || intercropLoading

    // Expose simple interface to parent component (no auto-commit needed)
    useImperativeHandle(ref, () => ({
      isDirty: false, // No auto-commit, so no dirty state tracking needed
      save: () => Promise.resolve() // No auto-save needed
    }))

  // No need to load crop cycles - context already provides them!

  // Calculate metrics from actual activities and observations data
  const loadCycleMetrics = async () => {
    if (allCycles.length === 0) {
      setCycleMetrics({})
      return
    }

    setIsLoadingData(true)
    const metricsData: {[cycleId: string]: any} = {}

    // Calculate totals from actual activities and observations data
    for (const cycle of allCycles) {
      try {
        // Get activities and observations for this cycle to calculate real totals
        const activities = await ActivityService.getActivitiesForCycle(cycle.id)
        const observations = await ObservationService.getObservationsForCycle(cycle.id)

        // Calculate actual costs from all activities
        const estimatedCost = activities.reduce((total, activity) => {
          const productCosts = (activity.products || []).reduce((sum, p) => sum + (p.estimatedCost || 0), 0)
          const resourceCosts = (activity.resources || []).reduce((sum, r) => sum + (r.estimatedCost || 0), 0)
          return total + productCosts + resourceCosts
        }, 0)

        const actualCost = activities.reduce((total, activity) => {
          const productCosts = (activity.products || []).reduce((sum, p) => sum + (p.actualCost || 0), 0)
          const resourceCosts = (activity.resources || []).reduce((sum, r) => sum + (r.actualCost || 0), 0)
          return total + productCosts + resourceCosts
        }, 0)

        // Calculate total yield from all sugarcane yield observations
        const totalSugarcaneYield = observations
          .filter(obs => obs.category === 'sugarcane-yield-quality')
          .reduce((total, obs) => {
            const yieldData = obs.data as any
            return total + (yieldData?.yieldPerHectare || 0)
          }, 0)

        // Calculate total revenue from all observations
        const sugarcaneRevenue = observations
          .filter(obs => obs.category === 'sugarcane-yield-quality')
          .reduce((total, obs) => {
            // Check both the data field and the top-level revenue field
            const yieldData = obs.data as any
            const revenue = yieldData?.sugarcaneRevenue || obs.sugarcaneRevenue || 0
            return total + revenue
          }, 0)

        const intercropRevenue = observations
          .filter(obs => obs.category === 'intercrop-yield-quality')
          .reduce((total, obs) => {
            // Check both the data field and the top-level revenue field
            const yieldData = obs.data as any
            const revenue = yieldData?.intercropRevenue || obs.intercropRevenue || 0
            return total + revenue
          }, 0)

        const totalRevenue = sugarcaneRevenue + intercropRevenue

        // Check for missing data (null/undefined is missing, 0 is valid)
        const hasEstCost = estimatedCost !== null && estimatedCost !== undefined
        const hasActCost = actualCost !== null && actualCost !== undefined
        const hasSugarcaneRevenue = sugarcaneRevenue > 0
        const hasTotalRevenue = totalRevenue > 0
        const hasYieldData = totalSugarcaneYield > 0

        // Calculate derived values
        const netProfit = totalRevenue - actualCost
        const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0

        // Profit/margin logic: Show 'Missing cost/revenue' only if there are NO activities with actual costs
        // AND NO observations with actual revenue and sugarcane profit. Otherwise show actual values (including 0).
        const hasAnyActualCosts = activities.some(activity =>
          (activity.products || []).some(p => p.actualCost !== null && p.actualCost !== undefined) ||
          (activity.resources || []).some(r => r.actualCost !== null && r.actualCost !== undefined)
        )
        const hasAnyObservationRevenue = observations.some(obs => {
          if (obs.category === 'sugarcane-yield-quality') {
            const yieldData = obs.data as any
            const revenue = yieldData?.sugarcaneRevenue || obs.sugarcaneRevenue || 0
            return (yieldData?.yieldPerHectare || 0) > 0 || revenue > 0
          }
          if (obs.category === 'intercrop-yield-quality') {
            const yieldData = obs.data as any
            const revenue = yieldData?.intercropRevenue || obs.intercropRevenue || 0
            return (yieldData?.yieldPerHectare || 0) > 0 || revenue > 0
          }
          return false
        })

        const canCalculateProfit = hasAnyActualCosts || hasAnyObservationRevenue

        metricsData[cycle.id] = {
          costs: {
            estimated: hasEstCost ? `Rs ${estimatedCost.toLocaleString()}` : 'No activity cost',
            actual: hasActCost ? `Rs ${actualCost.toLocaleString()}` : 'No activity cost'
          },
          yield: {
            sugarcane: hasYieldData ? `${totalSugarcaneYield.toFixed(1)} t/ha` : '0.0 t/ha',
            intercrop: '0.0 t/ha' // TODO: Calculate intercrop yield when available
          },
          revenue: {
            total: hasTotalRevenue ? `Rs ${totalRevenue.toLocaleString()}` : 'No observation revenue',
            sugarcane: hasSugarcaneRevenue ? `Rs ${sugarcaneRevenue.toLocaleString()}` : 'No observation revenue',
            intercrop: `Rs ${intercropRevenue.toLocaleString()}`
          },
          profit: {
            total: canCalculateProfit ? `Rs ${netProfit.toLocaleString()}` : 'Missing cost/revenue',
            perHa: canCalculateProfit ? `Rs ${(netProfit / bloc.area).toLocaleString()}` : 'Missing cost/revenue',
            margin: canCalculateProfit ? `${profitMargin.toFixed(1)}%` : 'Missing cost/revenue'
          }
        }
      } catch (error) {
        console.error(`Failed to process metrics for cycle ${cycle.id}:`, error)
        metricsData[cycle.id] = {
          costs: { estimated: 'N/A', actual: 'N/A' },
          yield: { sugarcane: '0.0 t/ha', intercrop: '0.0 t/ha' },
          revenue: { total: 'N/A', sugarcane: 'N/A', intercrop: 'N/A' },
          profit: { total: 'N/A', perHa: 'N/A', margin: 'N/A' }
        }
      }
    }

    setCycleMetrics(metricsData)
    setIsLoadingData(false)
  }

  // Load metrics when cycles change (calculate from activities and observations)
  useEffect(() => {
    if (allCycles.length > 0) {
      console.log('🔄 CropCycleGeneralInfo: allCycles changed, reloading metrics...')
      loadCycleMetrics().then(() => {
        console.log('✅ CropCycleGeneralInfo: metrics reloaded')
      }).catch(error => {
        console.error('❌ Error loading cycle metrics:', error)
      })
    }
  }, [allCycles])

  // Listen for crop cycle totals updates from activities and observations
  useEffect(() => {
    const handleTotalsUpdate = (event: CustomEvent) => {
      const { cropCycleId, totals } = event.detail
      console.log('🔄 CropCycleGeneralInfo: Received totals update for cycle:', cropCycleId)

      // Show recalculating state briefly
      setIsRecalculating(true)

      // Reload metrics for the updated cycle
      loadCycleMetrics().then(() => {
        console.log('✅ CropCycleGeneralInfo: metrics reloaded after totals update')
        setIsRecalculating(false)
      }).catch(error => {
        console.error('❌ Error reloading metrics after totals update:', error)
        setIsRecalculating(false)
      })
    }

    // Listen for the custom event dispatched by ActivityService
    window.addEventListener('cropCycleTotalsCalculated', handleTotalsUpdate as EventListener)

    // Cleanup listener on unmount
    return () => {
      window.removeEventListener('cropCycleTotalsCalculated', handleTotalsUpdate as EventListener)
    }
  }, [])  // Empty dependency array - this effect should only run once



  // Helper functions
  const canCloseCycle = () => {
    return activeCycle && activeCycle.status === 'active'
  }

  // Calculate if cycle can be closed based on financial data availability
  const canCloseCycleFinancially = (cycleId: string) => {
    if (!cycleMetrics[cycleId]) return false

    const metrics = cycleMetrics[cycleId]
    // Same logic as profit calculation - if we can calculate profit, we can close cycle
    return metrics.profit.total !== 'Missing cost/revenue'
  }

  const handleCloseCycle = async () => {
    if (!activeCycle) return

    setIsValidating(true)

    try {
      const validation = await CropCycleService.validateCycleForClosure(
        activeCycle.id,
        bloc.area
      )

      setClosureValidation(validation)
      setShowClosureModal(true)
    } catch (error) {
      console.error('Error validating cycle for closure:', error)
      alert('Error validating cycle. Please try again.')
    } finally {
      setIsValidating(false)
    }
  }

  // If this is a side panel, show simplified current crop info
  if (sidePanel) {
    return (
      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-gray-900">Current Crop</h4>

        {/* Loading State */}
        {(isLoadingData || isRecalculating) && (
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex flex-col items-center justify-center py-6">
              <div className="relative">
                <div className="w-8 h-8 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
              </div>
              <h5 className="font-medium text-gray-900 mt-3 mb-1">
                {isLoadingData ? 'Loading Data' : 'Recalculating Values'}
              </h5>
              <p className="text-sm text-gray-600 text-center">
                {isLoadingData ? 'Fetching crop cycle data...' : 'Updating calculations...'}
              </p>
            </div>
          </div>
        )}

        {/* Active Cycle Only - Crop Performance */}
        {!isLoadingData && !isRecalculating && activeCycle && cycleMetrics[activeCycle.id] && (
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h5 className="font-medium text-gray-900 mb-3">Crop Performance</h5>
            <div className="space-y-2 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-gray-600">Est. Cost:</span>
                  <div className="font-medium">{cycleMetrics[activeCycle.id].costs.estimated}</div>
                </div>
                <div>
                  <span className="text-gray-600">Actual Cost:</span>
                  <div className="font-medium">{cycleMetrics[activeCycle.id].costs.actual}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-gray-600">Revenue:</span>
                  <div className="font-medium">{cycleMetrics[activeCycle.id].revenue.total}</div>
                </div>
                <div>
                  <span className="text-gray-600">Profit:</span>
                  <div className="font-medium">{cycleMetrics[activeCycle.id].profit.total}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-gray-600">Yield:</span>
                  <div className="font-medium">{cycleMetrics[activeCycle.id].yield.sugarcane}</div>
                </div>
                <div>
                  <span className="text-gray-600">Margin:</span>
                  <div className="font-medium">{cycleMetrics[activeCycle.id].profit.margin}</div>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* Active Cycle Only - Crop Information */}
        {!isLoadingData && !isRecalculating && activeCycle && (
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h5 className="font-medium text-gray-900 mb-3">Crop Information</h5>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-gray-600">Type:</span>
                <div className="font-medium">
                  {activeCycle.type === 'plantation' ? 'Plantation' : `Ratoon ${activeCycle.cycleNumber - 1}`}
                </div>
              </div>
              <div>
                <span className="text-gray-600">Sugarcane Variety:</span>
                <div className="font-medium">{activeCycle.sugarcaneVarietyName}</div>
              </div>
              <div>
                <span className="text-gray-600">Plant Date:</span>
                <div className="font-medium">
                  {activeCycle.type === 'plantation'
                    ? (activeCycle.plantingDate ? new Date(activeCycle.plantingDate).toLocaleDateString() : 'TBC')
                    : (activeCycle.ratoonPlantingDate ? new Date(activeCycle.ratoonPlantingDate).toLocaleDateString() : 'TBC')
                  }
                </div>
              </div>
              <div>
                <span className="text-gray-600">Planned Harvest:</span>
                <div className="font-medium">{new Date(activeCycle.plannedHarvestDate).toLocaleDateString()}</div>
              </div>
              <div>
                <span className="text-gray-600">Intercrop:</span>
                <div className="font-medium">
                  {!activeCycle.intercropVarietyName || activeCycle.intercropVarietyName === '' || activeCycle.intercropVarietyId === 'none'
                    ? 'None'
                    : activeCycle.intercropVarietyName}
                </div>
              </div>
              <div>
                <span className="text-gray-600">Expected Yield:</span>
                <div className="font-medium">{activeCycle.expectedYield} tons/ha</div>
              </div>
            </div>
          </div>
        )}

        {/* No active cycle message */}
        {!activeCycle && (
          <div className="text-center text-gray-500 py-8">
            <p>No active crop cycle</p>
            <p className="text-sm">Create a cycle in the General tab</p>
          </div>
        )}
      </div>
    )
  }

  // Remove 5-second polling - metrics will refresh when:
  // 1. Cycles change (above useEffect)
  // 2. Activities/observations are added (via refreshCycles() calls)
  // 3. User manually refreshes the page

  // loadCropCycles function removed - using context data instead!

  // loadConfigData function removed - now using React Query hooks

  const validateCycleData = (): boolean => {
    const errors: string[] = []
    const isPlantationCycle = allCycles.length === 0

    // For plantation cycles, sugarcane variety is required
    // For ratoon cycles, it's inherited so we don't need to validate it
    if (isPlantationCycle && !newCycleData.sugarcaneVarietyId) {
      errors.push('Sugarcane variety is required')
    }

    if (!newCycleData.plannedHarvestDate) {
      errors.push('Planned harvest date is required')
    }

    // Planting date is only required for plantation cycles
    if (isPlantationCycle && !newCycleData.plantingDate) {
      errors.push('Planting date is required for plantation cycle')
    }

    const expectedYieldNum = typeof newCycleData.expectedYield === 'string'
      ? parseFloat(newCycleData.expectedYield)
      : newCycleData.expectedYield

    if (!expectedYieldNum || expectedYieldNum <= 0 || isNaN(expectedYieldNum)) {
      errors.push('Expected yield must be greater than 0 tons/ha')
    }

    // For ratoon cycles, ensure previous cycle is closed
    if (!isPlantationCycle) {
      if (allCycles.length === 0) {
        errors.push('Cannot create ratoon cycle: No existing cycles found')
      } else {
        const mostRecentCycle = allCycles.reduce((latest, cycle) =>
          cycle.cycleNumber > latest.cycleNumber ? cycle : latest
        )
        if (mostRecentCycle.status !== 'closed') {
          errors.push('Previous cycle must be closed before creating a ratoon cycle')
        }
      }
    }

    setValidationErrors(errors)
    return errors.length === 0
  }

  const handleCreateCycle = async () => {
    if (!validateCycleData()) return

    try {
      const expectedYieldNum = typeof newCycleData.expectedYield === 'string'
        ? parseFloat(newCycleData.expectedYield)
        : newCycleData.expectedYield

      // Determine cycle type based on existing cycles
      const cycleType = allCycles.length === 0 ? 'plantation' : 'ratoon'

      // For ratoon cycles, get sugarcane variety from plantation cycle
      let sugarcaneVarietyId = newCycleData.sugarcaneVarietyId
      if (cycleType === 'ratoon' && allCycles.length > 0) {
        const plantationCycle = allCycles.find(cycle => cycle.type === 'plantation')
        if (plantationCycle) {
          sugarcaneVarietyId = plantationCycle.sugarcaneVarietyId
        }
      }

      // For ratoon cycles, get the most recent cycle as parent
      let parentCycleId: string | undefined = undefined
      if (cycleType === 'ratoon' && allCycles.length > 0) {
        const mostRecentCycle = allCycles.reduce((latest, cycle) =>
          cycle.cycleNumber > latest.cycleNumber ? cycle : latest
        )
        parentCycleId = mostRecentCycle.id
      }

      // Validate bloc has UUID for database operations
      if (!bloc.uuid) {
        throw new Error(`Cannot create crop cycle: Bloc "${bloc.localId}" must be saved to database first`)
      }

      const cycleRequest: CreateCycleRequest = {
        blocId: bloc.uuid,
        type: cycleType,
        sugarcaneVarietyId: sugarcaneVarietyId,
        plannedHarvestDate: newCycleData.plannedHarvestDate,
        expectedYield: expectedYieldNum,
        intercropVarietyId: newCycleData.intercropVarietyId === 'none' ? undefined : newCycleData.intercropVarietyId,
        plantingDate: cycleType === 'plantation' ? newCycleData.plantingDate : undefined,
        parentCycleId: parentCycleId
      }

      const newCycle = await createCycle(cycleRequest)

      // Reload cycles to get updated list
      await refreshCycles()

      onSave(newCycle)

      // Reset form
      setNewCycleData({
        sugarcaneVarietyId: '',
        sugarcaneVarietyName: '',
        intercropVarietyId: 'none',
        intercropVarietyName: 'None',
        plantingDate: '',
        plannedHarvestDate: '',
        expectedYield: ''
      })
    } catch (error) {
      console.error('🚨 DETAILED Error creating cycle:', {
        error,
        errorType: typeof error,
        errorConstructor: error?.constructor?.name,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        errorStack: error instanceof Error ? error.stack : undefined,
        newCycleData,
        cycleType: allCycles.length === 0 ? 'plantation' : 'ratoon'
      })

      const errorMessage = error instanceof Error ? error.message :
                          typeof error === 'string' ? error :
                          JSON.stringify(error)

      const cycleTypeName = allCycles.length === 0 ? 'plantation' : 'ratoon'
      alert(`Error creating ${cycleTypeName} cycle: ${errorMessage}`)
    }
  }

  // Keep the old function names for backward compatibility but redirect to unified function
  const handleCreatePlantationCycle = handleCreateCycle

  const handleCreateRatoonCycle = async () => {
    // Use the unified cycle creation function (validation is handled there)
    await handleCreateCycle()
  }

  // handleCloseCycle function moved above

  const handleSugarcaneVarietySelect = (variety: CropVariety) => {
    console.log('🌾 Sugarcane variety selected:', variety)
    console.log('🌾 Variety UUID:', variety.uuid)
    console.log('🌾 Variety ID:', variety.id)
    console.log('🌾 Show edit cycle:', showEditCycle)

    if (showEditCycle) {
      // Update edit form data - use UUID for database operations
      setEditCycleData(prev => ({
        ...prev,
        sugarcaneVarietyId: variety.uuid, // Use UUID for database foreign key
        sugarcaneVarietyName: variety.name
      }))
    } else {
      // Update new cycle data - use UUID for database operations
      setNewCycleData(prev => ({
        ...prev,
        sugarcaneVarietyId: variety.uuid, // Use UUID for database foreign key
        sugarcaneVarietyName: variety.name
      }))
    }
    setShowSugarcaneSelector(false)
  }

  const handleIntercropVarietySelect = (variety: CropVariety) => {
    if (showEditCycle) {
      // Update edit form data - use UUID for database operations
      setEditCycleData(prev => ({
        ...prev,
        intercropVarietyId: variety.uuid, // Use UUID for database foreign key
        intercropVarietyName: variety.name
      }))
    } else {
      // Update new cycle data - use UUID for database operations
      setNewCycleData(prev => ({
        ...prev,
        intercropVarietyId: variety.uuid, // Use UUID for database foreign key
        intercropVarietyName: variety.name
      }))
    }
    setShowIntercropSelector(false)
  }

  const getSelectedSugarcaneVariety = () => {
    return (sugarcaneVarieties || []).find(v => v.uuid === newCycleData.sugarcaneVarietyId)
  }

  const getSelectedIntercropVariety = () => {
    return (intercropVarieties || []).find(v => v.uuid === newCycleData.intercropVarietyId)
  }

  const canCreateRatoonCycle = () => {
    // Can create ratoon if there are existing cycles and the most recent one is closed
    if (allCycles.length === 0) return false

    // Find the most recent cycle (highest cycle number)
    const mostRecentCycle = allCycles.reduce((latest, cycle) =>
      cycle.cycleNumber > latest.cycleNumber ? cycle : latest
    )

    return mostRecentCycle.status === 'closed'
  }

  // canCloseCycle function moved above

  // Delete and Retire handlers
  const handleDeleteBloc = async () => {
    if (deleteConfirmText !== 'delete bloc') {
      return
    }

    try {
      setIsDeleting(true)

      // Call delete API (you'll need to implement this in your service)
      // await BlocService.deleteBloc(bloc.id)

      console.log('Deleting bloc:', bloc.uuid || bloc.localId)
      alert('Bloc deletion functionality will be implemented')

      // Close modal and reset
      setShowDeleteConfirm(false)
      setDeleteConfirmText('')

      // Navigate back or refresh parent component
      // onBlocDeleted?.()

    } catch (error) {
      console.error('Error deleting bloc:', error)
      alert(`Error deleting bloc: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleRetireBloc = async () => {
    if (retireConfirmText !== 'retire bloc') {
      return
    }

    try {
      setIsRetiring(true)

      // Call retire API (you'll need to implement this in your service)
      // await BlocService.retireBloc(bloc.id)

      console.log('Retiring bloc:', bloc.uuid || bloc.localId)
      alert('Bloc retirement functionality will be implemented')

      // Close modal and reset
      setShowRetireConfirm(false)
      setRetireConfirmText('')

      // Refresh parent component to show retired status
      // onBlocRetired?.()

    } catch (error) {
      console.error('Error retiring bloc:', error)
      alert(`Error retiring bloc: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsRetiring(false)
    }
  }

  const resetDeleteConfirm = () => {
    setShowDeleteConfirm(false)
    setDeleteConfirmText('')
  }

  const resetRetireConfirm = () => {
    setShowRetireConfirm(false)
    setRetireConfirmText('')
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Crop Cycle Management</h2>
        <p className="text-sm text-gray-600">
          Manage plantation and ratoon cycles for this bloc. All fields marked with * are mandatory.
        </p>
      </div>

      {/* Loading State */}
      {isLoadingData && (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mt-4 mb-2">Loading Data</h3>
          <p className="text-gray-600 text-center">
            Fetching crop cycle information...
          </p>
        </div>
      )}

      {/* Validation Errors */}
      {!isLoadingData && validationErrors.length > 0 && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center mb-2">
            <svg className="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <h3 className="text-sm font-medium text-red-800">Please fix the following errors:</h3>
          </div>
          <ul className="text-sm text-red-700 list-disc list-inside">
            {validationErrors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Current Crop Information - Beautiful Boxes */}
      {!isLoadingData && activeCycle && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Current Crop</h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Financial Overview Box */}
            {cycleMetrics[activeCycle.id] && (
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6 shadow-sm">
                <div className="flex items-center mb-4">
                  <div className="bg-green-100 p-2 rounded-lg mr-3">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Crop Performance</h3>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white rounded-lg p-3 border border-green-100">
                    <span className="text-sm text-gray-600">Est. Cost</span>
                    <div className="font-semibold text-gray-900">{cycleMetrics[activeCycle.id].costs.estimated}</div>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-green-100">
                    <span className="text-sm text-gray-600">Actual Cost</span>
                    <div className="font-semibold text-gray-900">{cycleMetrics[activeCycle.id].costs.actual}</div>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-green-100">
                    <span className="text-sm text-gray-600">Revenue</span>
                    <div className="font-semibold text-gray-900">{cycleMetrics[activeCycle.id].revenue.total}</div>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-green-100">
                    <span className="text-sm text-gray-600">Profit</span>
                    <div className="font-semibold text-gray-900">{cycleMetrics[activeCycle.id].profit.total}</div>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-green-100">
                    <span className="text-sm text-gray-600">Yield</span>
                    <div className="font-semibold text-gray-900">{cycleMetrics[activeCycle.id].yield.sugarcane}</div>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-green-100">
                    <span className="text-sm text-gray-600">Margin</span>
                    <div className="font-semibold text-gray-900">{cycleMetrics[activeCycle.id].profit.margin}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Crop Information Box */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 shadow-sm">
              <div className="flex items-center mb-4">
                <div className="bg-blue-100 p-2 rounded-lg mr-3">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Crop Information</h3>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center bg-white rounded-lg p-3 border border-blue-100">
                  <span className="text-sm text-gray-600">Type</span>
                  <div className="font-semibold text-gray-900">
                    {activeCycle.type === 'plantation' ? 'Plantation' : `Ratoon ${activeCycle.cycleNumber - 1}`}
                  </div>
                </div>
                <div className="flex justify-between items-center bg-white rounded-lg p-3 border border-blue-100">
                  <span className="text-sm text-gray-600">Sugarcane Variety</span>
                  <div className="font-semibold text-gray-900">{activeCycle.sugarcaneVarietyName}</div>
                </div>
                <div className="flex justify-between items-center bg-white rounded-lg p-3 border border-blue-100">
                  <span className="text-sm text-gray-600">Plant Date</span>
                  <div className="font-semibold text-gray-900">
                    {activeCycle.type === 'plantation'
                      ? (activeCycle.plantingDate ? new Date(activeCycle.plantingDate).toLocaleDateString() : 'TBC')
                      : (activeCycle.ratoonPlantingDate ? new Date(activeCycle.ratoonPlantingDate).toLocaleDateString() : 'TBC')
                    }
                  </div>
                </div>
                <div className="flex justify-between items-center bg-white rounded-lg p-3 border border-blue-100">
                  <span className="text-sm text-gray-600">Planned Harvest</span>
                  <div className="font-semibold text-gray-900">{new Date(activeCycle.plannedHarvestDate).toLocaleDateString()}</div>
                </div>
                <div className="flex justify-between items-center bg-white rounded-lg p-3 border border-blue-100">
                  <span className="text-sm text-gray-600">Intercrop</span>
                  <div className="font-semibold text-gray-900">
                    {!activeCycle.intercropVarietyName || activeCycle.intercropVarietyName === '' || activeCycle.intercropVarietyId === 'none'
                      ? 'None'
                      : activeCycle.intercropVarietyName}
                  </div>
                </div>
                <div className="flex justify-between items-center bg-white rounded-lg p-3 border border-blue-100">
                  <span className="text-sm text-gray-600">Expected Yield</span>
                  <div className="font-semibold text-gray-900">{activeCycle.expectedYield} tons/ha</div>
                </div>
              </div>
            </div>
          </div>

          {/* Close Cycle Button */}
          {canCloseCycle() && (
            <div className="flex justify-center mb-6">
              <button
                type="button"
                onClick={handleCloseCycle}
                disabled={isValidating || !canCloseCycleFinancially(activeCycle.id)}
                className={`px-8 py-3 rounded-lg font-medium transition-all duration-200 ${
                  canCloseCycleFinancially(activeCycle.id)
                    ? 'bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {isValidating ? 'Validating...' : '✓ Close Cycle'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Cycle Creation Form */}
      {!isLoadingData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Cycle Information */}
          <div className="space-y-6">
            <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {allCycles.length === 0 ? 'Create Plantation Cycle' : `Create Next Ratoon Cycle (Ratoon ${allCycles.length})`}
              </h3>

            {/* Sugarcane Variety Selection - Mandatory */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sugarcane Variety *
                {allCycles.length > 0 && (
                  <span className="text-xs text-gray-500 ml-2">(Inherited from plantation cycle)</span>
                )}
              </label>
              <button
                type="button"
                onClick={() => allCycles.length === 0 && setShowSugarcaneSelector(true)}
                disabled={allCycles.length > 0}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-left flex items-center justify-between transition-colors ${
                  allCycles.length > 0
                    ? 'bg-gray-100 border-gray-300 cursor-not-allowed'
                    : 'bg-white border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-lg">🌾</span>
                  <div>
                    <div className="font-medium text-gray-900">
                      {(activeCycle ? activeCycle.sugarcaneVarietyName : newCycleData.sugarcaneVarietyName) || 'Select sugarcane variety...'}
                    </div>
                    {getSelectedSugarcaneVariety() && (
                      <div className="text-xs text-gray-500">
                        Harvest: {getSelectedSugarcaneVariety()?.harvestStart} - {getSelectedSugarcaneVariety()?.harvestEnd}
                      </div>
                    )}
                  </div>
                </div>
                {!activeCycle && (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400">
                    <polyline points="9,18 15,12 9,6"></polyline>
                  </svg>
                )}
              </button>
            </div>

            {/* Intercrop Variety Selection - Optional */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Intercrop Variety (Optional)
              </label>
              <button
                type="button"
                onClick={() => setShowIntercropSelector(true)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white hover:bg-gray-50 transition-colors text-left flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-lg">{newCycleData.intercropVarietyId === 'none' ? '❌' : '🌿'}</span>
                  <div>
                    <div className="font-medium text-gray-900">
                      {newCycleData.intercropVarietyName || (newCycleData.intercropVarietyId === 'none' ? 'None' : 'Select intercrop variety...')}
                    </div>
                    {getSelectedIntercropVariety() && getSelectedIntercropVariety()?.id !== 'none' && (
                      <div className="text-xs text-gray-500">
                        Harvest: {getSelectedIntercropVariety()?.harvestTime}
                      </div>
                    )}
                  </div>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400">
                  <polyline points="9,18 15,12 9,6"></polyline>
                </svg>
              </button>
            </div>

            {/* Planting Date - Only for plantation cycles */}
            {allCycles.length === 0 && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Planting Date *</label>
                <input
                  type="date"
                  value={newCycleData.plantingDate}
                  onChange={(e) => setNewCycleData(prev => ({ ...prev, plantingDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            )}

            {/* Planned Harvest Date - Mandatory */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Planned Harvest Date *
              </label>
              <input
                type="date"
                value={newCycleData.plannedHarvestDate}
                onChange={(e) => setNewCycleData(prev => ({ ...prev, plannedHarvestDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            {/* Expected Yield Field */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expected Yield (tons/ha) *
              </label>
              <input
                type="number"
                min="0.1"
                step="0.1"
                value={newCycleData.expectedYield}
                onChange={(e) => setNewCycleData(prev => ({
                  ...prev,
                  expectedYield: e.target.value === '' ? '' : parseFloat(e.target.value) || ''
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="e.g., 85.5"
              />
            </div>

            {/* Form Save Status - Removed since no auto-save */}

            {/* Action Buttons */}
            <div className="flex space-x-3">
              {allCycles.length === 0 ? (
                <button
                  type="button"
                  onClick={handleCreateCycle}
                  disabled={isCreatingCycle}
                  className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors duration-200"
                >
                  {isCreatingCycle ? 'Creating...' : 'Create Plantation Cycle'}
                </button>
              ) : canCreateRatoonCycle() ? (
                <button
                  type="button"
                  onClick={handleCreateCycle}
                  disabled={isCreatingCycle}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors duration-200"
                >
                  {isCreatingCycle ? 'Creating...' : `Create Ratoon ${allCycles.length} Cycle`}
                </button>
              ) : (
                <div className="flex-1 px-4 py-2 bg-gray-100 text-gray-500 rounded-lg font-medium text-center">
                  Close current cycle to create ratoon
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Cycle History (Closed Cycles Only) */}
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Cycle History</h3>
            {allCycles.filter(cycle => cycle.status === 'closed').length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p>No closed cycles yet</p>
                <p className="text-sm">Close your first cycle to see history</p>
              </div>
            ) : (
              <div className="space-y-4">
                {allCycles
                  .filter(cycle => cycle.status === 'closed')
                  .sort((a, b) => new Date(b.actualHarvestDate || b.plannedHarvestDate).getTime() - new Date(a.actualHarvestDate || a.plannedHarvestDate).getTime())
                  .map((cycle) => (
                  <div
                    key={cycle.id}
                    className="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-300 rounded-xl p-6 shadow-sm"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-semibold text-gray-900">
                        {cycle.type === 'plantation' ? 'Plantation' : `Ratoon ${cycle.cycleNumber - 1}`}
                      </h4>
                      <span className="px-3 py-1 text-xs bg-gray-200 text-gray-700 rounded-full font-medium">
                        Closed
                      </span>
                    </div>
                    {/* Financial Overview for Closed Cycle */}
                    {cycleMetrics[cycle.id] && (
                      <div className="mb-4">
                        <h5 className="font-medium text-gray-800 mb-3">Crop Performance</h5>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-white rounded-lg p-3 border border-gray-200">
                            <span className="text-xs text-gray-600">Actual Cost</span>
                            <div className="font-semibold text-gray-900">{cycleMetrics[cycle.id].costs.actual}</div>
                          </div>
                          <div className="bg-white rounded-lg p-3 border border-gray-200">
                            <span className="text-xs text-gray-600">Revenue</span>
                            <div className="font-semibold text-gray-900">{cycleMetrics[cycle.id].revenue.total}</div>
                          </div>
                          <div className="bg-white rounded-lg p-3 border border-gray-200">
                            <span className="text-xs text-gray-600">Profit</span>
                            <div className="font-semibold text-gray-900">{cycleMetrics[cycle.id].profit.total}</div>
                          </div>
                          <div className="bg-white rounded-lg p-3 border border-gray-200">
                            <span className="text-xs text-gray-600">Yield</span>
                            <div className="font-semibold text-gray-900">{cycleMetrics[cycle.id].yield.sugarcane}</div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Crop Information for Closed Cycle */}
                    <div>
                      <h5 className="font-medium text-gray-800 mb-3">Crop Information</h5>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center bg-white rounded-lg p-3 border border-gray-200">
                          <span className="text-xs text-gray-600">Harvested</span>
                          <div className="font-semibold text-gray-900">
                            {cycle.actualHarvestDate ? new Date(cycle.actualHarvestDate).toLocaleDateString() : 'TBC'}
                          </div>
                        </div>
                        <div className="flex justify-between items-center bg-white rounded-lg p-3 border border-gray-200">
                          <span className="text-xs text-gray-600">Expected Yield</span>
                          <div className="font-semibold text-gray-900">{cycle.expectedYield} tons/ha</div>
                        </div>
                        <div className="flex justify-between items-center bg-white rounded-lg p-3 border border-gray-200">
                          <span className="text-xs text-gray-600">Sugarcane Variety</span>
                          <div className="font-semibold text-gray-900">{cycle.sugarcaneVarietyName}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      )}

      {/* Variety Selectors */}
      {showSugarcaneSelector && (
        <VarietySelector
          onSelect={handleSugarcaneVarietySelect}
          onClose={() => setShowSugarcaneSelector(false)}
          varietyType="sugarcane"
        />
      )}

      {showIntercropSelector && (
        <VarietySelector
          onSelect={handleIntercropVarietySelect}
          onClose={() => setShowIntercropSelector(false)}
          varietyType="intercrop"
        />
      )}

      {/* Cycle Closure Modal */}
      {showClosureModal && closureValidation && (
        <CycleClosureModal
          validation={closureValidation}
          onClose={() => setShowClosureModal(false)}
          onConfirm={async (data) => {
            try {
              const closedCycle = await CropCycleService.closeCropCycle(data)
              console.log('Cycle closed successfully:', closedCycle)

              // Reload cycles to get updated list
              await refreshCycles()

              setShowClosureModal(false)
              setClosureValidation(null)

              alert('Cycle closed successfully!')
            } catch (error) {
              console.error('Error closing cycle:', error)
              alert(`Error closing cycle: ${error instanceof Error ? error.message : 'Unknown error'}`)
            }
          }}
        />
      )}

      {/* Edit Cycle Modal */}
      {showEditCycle && activeCycle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Edit Crop Cycle</h3>
              <button
                type="button"
                onClick={() => setShowEditCycle(false)}
                className="text-gray-400 hover:text-gray-600"
                title="Close"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={async (e) => {
              e.preventDefault()
              setIsUpdatingCycle(true)
              try {
                const updatedCycle = await CropCycleService.updateCropCycle(activeCycle.id, {
                  plantingDate: editCycleData.plantingDate,
                  plannedHarvestDate: editCycleData.plannedHarvestDate,
                  expectedYield: editCycleData.expectedYield,
                  sugarcaneVarietyId: editCycleData.sugarcaneVarietyId,
                  sugarcaneVarietyName: editCycleData.sugarcaneVarietyName,
                  intercropVarietyId: editCycleData.intercropVarietyId || undefined,
                  intercropVarietyName: editCycleData.intercropVarietyName || undefined
                })

                // Reload cycles to get updated data
                await refreshCycles()
                setShowEditCycle(false)
                alert('Crop cycle updated successfully!')
              } catch (error) {
                console.error('Error updating cycle:', error)
                alert(`Error updating cycle: ${error instanceof Error ? error.message : 'Unknown error'}`)
              } finally {
                setIsUpdatingCycle(false)
              }
            }} className="space-y-4">

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Planting Date *</label>
                  <input
                    type="date"
                    required
                    value={editCycleData.plantingDate}
                    onChange={(e) => setEditCycleData(prev => ({ ...prev, plantingDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    title="Planting date"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Planned Harvest Date *</label>
                  <input
                    type="date"
                    required
                    value={editCycleData.plannedHarvestDate}
                    onChange={(e) => setEditCycleData(prev => ({ ...prev, plannedHarvestDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    title="Planned harvest date"
                  />
                </div>
              </div>

              {/* Expected Yield */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Expected Yield (tons/ha) *</label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  required
                  value={editCycleData.expectedYield}
                  onChange={(e) => setEditCycleData(prev => ({ ...prev, expectedYield: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter expected yield in tons per hectare"
                  title="Expected yield in tons per hectare"
                />
              </div>

              {/* Varieties */}
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sugarcane Variety *</label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={editCycleData.sugarcaneVarietyName}
                      readOnly
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                      placeholder="Select sugarcane variety"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSugarcaneSelector(true)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Change
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Intercrop Variety</label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={editCycleData.intercropVarietyName || 'None'}
                      readOnly
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                      placeholder="Select intercrop variety"
                    />
                    <button
                      type="button"
                      onClick={() => setShowIntercropSelector(true)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Change
                    </button>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowEditCycle(false)}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingCycle}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2 disabled:cursor-not-allowed"
                >
                  {isUpdatingCycle ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete and Retire Buttons */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => setShowRetireConfirm(true)}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-orange-700 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 hover:border-orange-300 transition-colors"
          >
            <Archive className="w-4 h-4 mr-2" />
            Retire Bloc
          </button>
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 hover:border-red-300 transition-colors"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Bloc
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">Delete Bloc</h3>
                  <p className="text-sm text-gray-600">This action cannot be undone</p>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-sm text-gray-700 mb-4">
                  This will permanently delete <strong>Bloc {bloc.localId}</strong> and all associated data including:
                </p>
                <ul className="text-sm text-gray-600 list-disc list-inside space-y-1 mb-4">
                  <li>All crop cycles and their history</li>
                  <li>All activities and observations</li>
                  <li>All attachments and files</li>
                  <li>All metrics and analytics data</li>
                </ul>
                <p className="text-sm text-gray-700 mb-4">
                  To confirm deletion, type <strong>delete bloc</strong> in the box below:
                </p>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder="delete bloc"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  autoFocus
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={resetDeleteConfirm}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={isDeleting}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteBloc}
                  disabled={deleteConfirmText !== 'delete bloc' || isDeleting}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  {isDeleting ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Deleting...
                    </div>
                  ) : (
                    'Delete Bloc'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Retire Confirmation Modal */}
      {showRetireConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0 w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                  <Archive className="w-5 h-5 text-orange-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">Retire Bloc</h3>
                  <p className="text-sm text-gray-600">Mark this bloc as retired</p>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-sm text-gray-700 mb-4">
                  This will retire <strong>Bloc {bloc.localId}</strong> and:
                </p>
                <ul className="text-sm text-gray-600 list-disc list-inside space-y-1 mb-4">
                  <li>Mark the bloc as retired (not deleted)</li>
                  <li>Preserve all historical data</li>
                  <li>Remove from active bloc lists</li>
                  <li>Close any active crop cycles</li>
                </ul>
                <p className="text-sm text-gray-700 mb-4">
                  To confirm retirement, type <strong>retire bloc</strong> in the box below:
                </p>
                <input
                  type="text"
                  value={retireConfirmText}
                  onChange={(e) => setRetireConfirmText(e.target.value)}
                  placeholder="retire bloc"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  autoFocus
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={resetRetireConfirm}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={isRetiring}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleRetireBloc}
                  disabled={retireConfirmText !== 'retire bloc' || isRetiring}
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  {isRetiring ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Retiring...
                    </div>
                  ) : (
                    'Retire Bloc'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
})

CropCycleGeneralInfo.displayName = 'CropCycleGeneralInfo'

export default CropCycleGeneralInfo
