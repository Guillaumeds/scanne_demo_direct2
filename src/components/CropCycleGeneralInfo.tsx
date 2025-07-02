'use client'

import { useState, useEffect } from 'react'
import { CropCycle, CreateCycleRequest, CycleClosureValidation } from '@/types/cropCycles'
import { SugarcaneVariety, InterCropPlant, CropVariety, SUGARCANE_VARIETIES, INTERCROP_PLANTS } from '@/types/varieties'
import { CropCycleValidationService } from '@/services/cropCycleValidationService'
import { CropCycleService } from '@/services/cropCycleService'
import { useCropCycle } from '@/contexts/CropCycleContext'
import VarietySelector from './VarietySelector'
import CycleClosureModal from './CycleClosureModal'

interface DrawnArea {
  id: string
  type: string
  coordinates: [number, number][]
  area: number
  fieldIds: string[]
}

interface CropCycleGeneralInfoProps {
  bloc: DrawnArea
  onSave: (data: any) => void
}

export default function CropCycleGeneralInfo({ bloc, onSave }: CropCycleGeneralInfoProps) {
  // Use crop cycle context
  const { createCycle } = useCropCycle()

  const [cropCycles, setCropCycles] = useState<CropCycle[]>([])
  const [activeCycle, setActiveCycle] = useState<CropCycle | null>(null)
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

  // Form state for new cycle creation
  const [newCycleData, setNewCycleData] = useState({
    sugarcaneVarietyId: '',
    sugarcaneVarietyName: '',
    intercropVarietyId: '',
    intercropVarietyName: '',
    plantingDate: '',
    plannedHarvestDate: '',
    expectedYield: '' as string | number
  })

  useEffect(() => {
    // Load existing crop cycles for this bloc
    loadCropCycles()
  }, [bloc.id])

  const loadCropCycles = async () => {
    try {
      const cycles = await CropCycleService.getCropCyclesForBloc(bloc.id)
      setCropCycles(cycles)

      // Set active cycle
      const active = await CropCycleService.getActiveCropCycle(bloc.id)
      setActiveCycle(active)
    } catch (error) {
      console.error('Error loading crop cycles:', error)
      setCropCycles([])
      setActiveCycle(null)
    }
  }

  const validateCycleData = (): boolean => {
    const errors: string[] = []

    if (!newCycleData.sugarcaneVarietyId) {
      errors.push('Sugarcane variety is required')
    }

    if (!newCycleData.plannedHarvestDate) {
      errors.push('Planned harvest date is required')
    }

    if (!newCycleData.plantingDate && !activeCycle) {
      errors.push('Planting date is required for plantation cycle')
    }

    const expectedYieldNum = typeof newCycleData.expectedYield === 'string'
      ? parseFloat(newCycleData.expectedYield)
      : newCycleData.expectedYield

    if (!expectedYieldNum || expectedYieldNum <= 0 || isNaN(expectedYieldNum)) {
      errors.push('Expected yield must be greater than 0 tons/ha')
    }

    setValidationErrors(errors)
    return errors.length === 0
  }

  const handleCreatePlantationCycle = async () => {
    if (!validateCycleData()) return

    try {
      const expectedYieldNum = typeof newCycleData.expectedYield === 'string'
        ? parseFloat(newCycleData.expectedYield)
        : newCycleData.expectedYield

      const cycleRequest: CreateCycleRequest = {
        blocId: bloc.id,
        type: 'plantation',
        sugarcaneVarietyId: newCycleData.sugarcaneVarietyId,
        plannedHarvestDate: newCycleData.plannedHarvestDate,
        expectedYield: expectedYieldNum,
        intercropVarietyId: newCycleData.intercropVarietyId || undefined,
        plantingDate: newCycleData.plantingDate
      }

      const newCycle = await createCycle(cycleRequest)

      // Reload cycles to get updated list
      await loadCropCycles()

      onSave(newCycle)

      // Reset form
      setNewCycleData({
        sugarcaneVarietyId: '',
        sugarcaneVarietyName: '',
        intercropVarietyId: '',
        intercropVarietyName: '',
        plantingDate: '',
        plannedHarvestDate: '',
        expectedYield: ''
      })
    } catch (error) {
      console.error('Error creating plantation cycle:', error)
      alert(`Error creating plantation cycle: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const handleCreateRatoonCycle = async () => {
    if (!activeCycle || activeCycle.status !== 'closed') {
      alert('Previous cycle must be closed before creating a ratoon cycle')
      return
    }

    if (!newCycleData.plannedHarvestDate) {
      setValidationErrors(['Planned harvest date is required for ratoon cycle'])
      return
    }

    try {
      const expectedYieldNum = typeof newCycleData.expectedYield === 'string'
        ? parseFloat(newCycleData.expectedYield)
        : newCycleData.expectedYield

      const cycleRequest: CreateCycleRequest = {
        blocId: bloc.id,
        type: 'ratoon',
        sugarcaneVarietyId: activeCycle.sugarcaneVarietyId,
        plannedHarvestDate: newCycleData.plannedHarvestDate,
        expectedYield: expectedYieldNum,
        intercropVarietyId: newCycleData.intercropVarietyId || undefined,
        parentCycleId: activeCycle.id
      }

      const newCycle = await createCycle(cycleRequest)

      // Reload cycles to get updated list
      await loadCropCycles()

      onSave(newCycle)

      // Reset form
      setNewCycleData({
        sugarcaneVarietyId: '',
        sugarcaneVarietyName: '',
        intercropVarietyId: '',
        intercropVarietyName: '',
        plantingDate: '',
        plannedHarvestDate: '',
        expectedYield: ''
      })
    } catch (error) {
      console.error('Error creating ratoon cycle:', error)
      alert(`Error creating ratoon cycle: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
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

  const handleSugarcaneVarietySelect = (variety: CropVariety) => {
    const sugarcaneVariety = variety as SugarcaneVariety

    if (showEditCycle) {
      // Update edit form data
      setEditCycleData(prev => ({
        ...prev,
        sugarcaneVarietyId: sugarcaneVariety.id,
        sugarcaneVarietyName: sugarcaneVariety.name
      }))
    } else {
      // Update new cycle data
      setNewCycleData(prev => ({
        ...prev,
        sugarcaneVarietyId: sugarcaneVariety.id,
        sugarcaneVarietyName: sugarcaneVariety.name
      }))
    }
    setShowSugarcaneSelector(false)
  }

  const handleIntercropVarietySelect = (variety: CropVariety) => {
    const intercropVariety = variety as InterCropPlant

    if (showEditCycle) {
      // Update edit form data
      setEditCycleData(prev => ({
        ...prev,
        intercropVarietyId: intercropVariety.id,
        intercropVarietyName: intercropVariety.name
      }))
    } else {
      // Update new cycle data
      setNewCycleData(prev => ({
        ...prev,
        intercropVarietyId: intercropVariety.id,
        intercropVarietyName: intercropVariety.name
      }))
    }
    setShowIntercropSelector(false)
  }

  const getSelectedSugarcaneVariety = () => {
    return SUGARCANE_VARIETIES.find(v => v.id === newCycleData.sugarcaneVarietyId)
  }

  const getSelectedIntercropVariety = () => {
    return INTERCROP_PLANTS.find(v => v.id === newCycleData.intercropVarietyId)
  }

  const canCreateRatoonCycle = () => {
    return activeCycle && activeCycle.status === 'closed' && activeCycle.type === 'plantation'
  }

  const canCloseCycle = () => {
    return activeCycle && activeCycle.status === 'active'
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Crop Cycle Management</h2>
        <p className="text-sm text-gray-600">
          Manage plantation and ratoon cycles for this bloc. All fields marked with * are mandatory.
        </p>
      </div>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
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

      {/* Current Active Cycle Display */}
      {activeCycle && (
        <div className="mb-8 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-medium text-green-900">
              Active {activeCycle.type === 'plantation' ? 'Plantation' : `Ratoon ${activeCycle.cycleNumber - 1}`} Cycle
            </h3>
            {activeCycle.status === 'active' && (
              <button
                type="button"
                onClick={() => {
                  // Initialize edit form with current cycle data
                  setEditCycleData({
                    plantingDate: activeCycle.plantingDate || '',
                    plannedHarvestDate: activeCycle.plannedHarvestDate,
                    expectedYield: activeCycle.expectedYield,
                    sugarcaneVarietyId: activeCycle.sugarcaneVarietyId,
                    sugarcaneVarietyName: activeCycle.sugarcaneVarietyName,
                    intercropVarietyId: activeCycle.intercropVarietyId || '',
                    intercropVarietyName: activeCycle.intercropVarietyName || ''
                  })
                  setShowEditCycle(true)
                }}
                className="px-3 py-1 text-xs bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg transition-colors"
                title="Edit cycle details"
              >
                Edit
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-green-700 font-medium">Sugarcane Variety:</span>
              <p className="text-green-900">{activeCycle.sugarcaneVarietyName}</p>
            </div>
            <div>
              <span className="text-green-700 font-medium">Plant Date:</span>
              <p className="text-green-900">
                {activeCycle.type === 'plantation'
                  ? (activeCycle.plantingDate ? new Date(activeCycle.plantingDate).toLocaleDateString() : 'TBC')
                  : (activeCycle.ratoonPlantingDate ? new Date(activeCycle.ratoonPlantingDate).toLocaleDateString() : 'TBC')
                }
              </p>
            </div>
            <div>
              <span className="text-green-700 font-medium">Planned Harvest:</span>
              <p className="text-green-900">{new Date(activeCycle.plannedHarvestDate).toLocaleDateString()}</p>
            </div>
            <div>
              <span className="text-green-700 font-medium">Intercrop:</span>
              <p className="text-green-900">
                {activeCycle.intercropVarietyName === 'None' || !activeCycle.intercropVarietyName
                  ? 'None'
                  : activeCycle.intercropVarietyName}
              </p>
            </div>
            <div>
              <span className="text-green-700 font-medium">Expected Yield:</span>
              <p className="text-green-900">{activeCycle.expectedYield} tons/ha</p>
            </div>
            <div>
              <span className="text-green-700 font-medium">Cycle Duration:</span>
              <p className="text-green-900">
                {activeCycle.plantingDate || activeCycle.ratoonPlantingDate ?
                  `${Math.ceil((new Date(activeCycle.plannedHarvestDate).getTime() -
                    new Date(activeCycle.plantingDate || activeCycle.ratoonPlantingDate!).getTime()) /
                    (1000 * 60 * 60 * 24))} days` : 'N/A'}
              </p>
            </div>
          </div>
          
          {canCloseCycle() && (
            <div className="mt-4 pt-4 border-t border-green-200">
              <button
                type="button"
                onClick={handleCloseCycle}
                disabled={isValidating}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2"
                title="Validate and close this crop cycle"
              >
                {isValidating ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Validating...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Close Cycle</span>
                  </>
                )}
              </button>
              <p className="text-xs text-gray-600 mt-2">
                Requires: All activities actual costs and all yield observations revenue
              </p>
            </div>
          )}
        </div>
      )}

      {/* Cycle Creation Form */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Cycle Information */}
        <div className="space-y-6">
          <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {!activeCycle ? 'Create Plantation Cycle' : 'Create Next Ratoon Cycle'}
            </h3>

            {/* Sugarcane Variety Selection - Mandatory */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sugarcane Variety *
                {activeCycle && activeCycle.type === 'plantation' && (
                  <span className="text-xs text-gray-500 ml-2">(Inherited from plantation cycle)</span>
                )}
              </label>
              <button
                type="button"
                onClick={() => !activeCycle && setShowSugarcaneSelector(true)}
                disabled={!!activeCycle}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-left flex items-center justify-between transition-colors ${
                  activeCycle 
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
                  <span className="text-lg">🌿</span>
                  <div>
                    <div className="font-medium text-gray-900">
                      {newCycleData.intercropVarietyName || 'Select intercrop variety...'}
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
            {!activeCycle && (
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

            {/* Action Buttons */}
            <div className="flex space-x-3">
              {!activeCycle ? (
                <button
                  onClick={handleCreatePlantationCycle}
                  className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors duration-200"
                >
                  Create Plantation Cycle
                </button>
              ) : canCreateRatoonCycle() ? (
                <button
                  onClick={handleCreateRatoonCycle}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200"
                >
                  Create Ratoon Cycle
                </button>
              ) : (
                <div className="flex-1 px-4 py-2 bg-gray-100 text-gray-500 rounded-lg font-medium text-center">
                  Close current cycle to create ratoon
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Cycle History */}
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Cycle History</h3>
            {cropCycles.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p>No crop cycles created yet</p>
                <p className="text-sm">Create your first plantation cycle to get started</p>
              </div>
            ) : (
              <div className="space-y-3">
                {cropCycles.map((cycle) => (
                  <div
                    key={cycle.id}
                    className={`p-3 rounded-lg ${
                      cycle.status === 'active'
                        ? 'border-2 border-green-500 bg-green-50'
                        : 'border border-gray-200'
                    }`}
                  >
                    <div className="mb-2">
                      <h4 className="font-medium text-gray-900">
                        {cycle.type === 'plantation' ? 'Plantation' : `Ratoon ${cycle.cycleNumber - 1}`}
                      </h4>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      {/* Show plantation date only for plantation cycles */}
                      {cycle.type === 'plantation' && (
                        <p>Planted: {cycle.plantingDate ? new Date(cycle.plantingDate).toLocaleDateString() : 'TBC'}</p>
                      )}

                      {/* For closed cycles, show actual data */}
                      {cycle.status === 'closed' ? (
                        <>
                          <p>Harvested: {cycle.actualHarvestDate ? new Date(cycle.actualHarvestDate).toLocaleDateString() : 'TBC'}</p>
                          <p>Expected Yield: {cycle.expectedYield} tons/ha</p>
                          <p>Yield: TBC</p>
                          <p>Profit: TBC</p>
                          <p>Precipitation: TBC</p>
                          <p>Solar Radiation: TBC</p>
                        </>
                      ) : (
                        /* For active cycles, show predicted values */
                        <>
                          <p>Planned Harvest: {new Date(cycle.plannedHarvestDate).toLocaleDateString()}</p>
                          <p>Expected Yield: {cycle.expectedYield} tons/ha</p>
                          <p>Yield: TBC</p>
                          <p>Profit: TBC</p>
                          <p>Predicted Precipitation: TBC</p>
                          <p>Predicted Solar Radiation: TBC</p>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

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
              await loadCropCycles()

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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
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
                await loadCropCycles()
                setShowEditCycle(false)
                alert('Crop cycle updated successfully!')
              } catch (error) {
                console.error('Error updating cycle:', error)
                alert(`Error updating cycle: ${error instanceof Error ? error.message : 'Unknown error'}`)
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
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
