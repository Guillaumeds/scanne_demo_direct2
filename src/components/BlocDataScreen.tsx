'use client'

import { useState, useRef } from 'react'
import SoilDataTab from './SoilDataTab'
import VegetationDataTab from './VegetationDataTab'
import WeatherDashboard from './WeatherDashboard'
import ActivitiesTab from './ActivitiesTab'
import ObservationsTab from './ObservationsTab'
import AttachmentsTab from './AttachmentsTab'
import VarietySelector from './VarietySelector'
import CropCycleGeneralInfo from './CropCycleGeneralInfo'
import { TabUnsavedIndicator } from './UnsavedChangesIndicator'
import { CropCycleProvider, useCropCyclePermissions, useCropCycleInfo, useCropCycleValidation, useCropCycle } from '@/contexts/CropCycleContext'
import { SelectedCropCycleProvider } from '@/contexts/SelectedCropCycleContext'
import { CropVariety, ALL_VARIETIES } from '@/types/varieties'
import { FormCommitRef } from '@/hooks/useFormWithAutoCommit'



interface DrawnArea {
  id: string
  type: string
  coordinates: [number, number][]
  area: number
  fieldIds: string[]
}

interface BlocDataScreenProps {
  bloc: DrawnArea
  onBack: () => void
  onDelete?: (areaId: string) => void
}

interface BlocData {
  // General Information
  blocDescription: string
  plantingDate: string
  sugarcaneVariety: string
  intercropVariety: string
  expectedHarvestDatePlanted: string
  isHarvested: boolean
  ratoonHarvestDates: { ratoonNumber: number; expectedDate: string; isHarvested: boolean }[]
  
  // Cultivation Data
  soilType: string
  irrigationType: string
  fertilizers: string
  pesticides: string
  lastCultivation: string
  
  // Production Data
  estimatedYield: number
  actualYield: number
  sugarContent: number
  qualityGrade: string
  
  // Monitoring Data
  lastInspection: string
  healthStatus: string
  issues: string
  recommendations: string
  
  // Financial Data
  plantingCost: number
  maintenanceCost: number
  harvestCost: number
  revenue: number
  profitMargin: number
}

// Inner component that uses the crop cycle context
function BlocDataScreenInner({ bloc, onBack, onDelete }: BlocDataScreenProps) {
  // Crop cycle context hooks
  const permissions = useCropCyclePermissions()
  const { getActiveCycleInfo } = useCropCycleInfo()
  const validation = useCropCycleValidation()

  // Get the crop cycle context for creating cycles
  const cropCycleContext = useCropCycle()

  // Get active cycle info
  const activeCycleInfo = getActiveCycleInfo()

  const [activeTab, setActiveTab] = useState('general')
  const [showSugarcaneSelector, setShowSugarcaneSelector] = useState(false)
  const [showIntercropSelector, setShowIntercropSelector] = useState(false)

  // Form refs for auto-commit functionality
  const cropCycleFormRef = useRef<FormCommitRef>(null)
  const activitiesFormRef = useRef<FormCommitRef>(null)
  const observationsFormRef = useRef<FormCommitRef>(null)
  const [blocData, setBlocData] = useState<BlocData>({
    // Initialize with default values
    blocDescription: '',
    plantingDate: '',
    sugarcaneVariety: '',
    intercropVariety: '',
    expectedHarvestDatePlanted: '',
    isHarvested: false,
    ratoonHarvestDates: [],
    
    soilType: 'Clay Loam',
    irrigationType: 'Drip Irrigation',
    fertilizers: '',
    pesticides: '',
    lastCultivation: '',
    
    estimatedYield: 0,
    actualYield: 0,
    sugarContent: 0,
    qualityGrade: 'A',
    
    lastInspection: '',
    healthStatus: 'Good',
    issues: '',
    recommendations: '',
    
    plantingCost: 0,
    maintenanceCost: 0,
    harvestCost: 0,
    revenue: 0,
    profitMargin: 0
  })

  // Helper function to get tab status
  const getTabStatus = (tabId: string) => {
    // Check if tab has validation issues or missing required data
    const tabWarnings = validation.warnings.filter(warning =>
      warning.toLowerCase().includes(tabId) ||
      (tabId === 'general' && warning.includes('cycle')) ||
      (tabId === 'activities' && warning.includes('activity')) ||
      (tabId === 'observations' && warning.includes('observation'))
    )

    if (tabWarnings.length > 0) return 'warning'

    // Check if tab has required data completed
    if (tabId === 'general' && activeCycleInfo) return 'complete'
    if (tabId === 'activities' && activeCycleInfo) return 'complete'
    if (tabId === 'observations' && activeCycleInfo) return 'complete'

    return 'default'
  }

  const tabs = [
    { id: 'general', name: 'General Info', icon: '📋', status: getTabStatus('general') },
    { id: 'activities', name: 'Activities', icon: '📋', status: getTabStatus('activities') },
    { id: 'observations', name: 'Observations', icon: '🔬', status: getTabStatus('observations') },
    { id: 'weather', name: 'Weather', icon: '🌤️', status: getTabStatus('weather') },
    { id: 'satellite-soil', name: 'Satellite Soil', icon: '🛰️', status: getTabStatus('satellite-soil') },
    { id: 'satellite-vegetation', name: 'Satellite Vegetation', icon: '🌿', status: getTabStatus('satellite-vegetation') },
    { id: 'attachments', name: 'Attachments', icon: '📎', status: getTabStatus('attachments') }
  ]

  const handleInputChange = (field: keyof BlocData, value: string | number | boolean) => {
    const updatedData = { ...blocData, [field]: value }
    setBlocData(updatedData)
    // Note: With database persistence, individual field changes are not auto-saved
    // Data is saved only at the defined DB commit stages
  }

  const addRatoonHarvestDate = () => {
    if (blocData.ratoonHarvestDates.length < 10) {
      setBlocData(prev => ({
        ...prev,
        ratoonHarvestDates: [
          ...prev.ratoonHarvestDates,
          {
            ratoonNumber: prev.ratoonHarvestDates.length + 1,
            expectedDate: '',
            isHarvested: false
          }
        ]
      }))
    }
  }

  const updateRatoonHarvestDate = (index: number, field: 'expectedDate' | 'isHarvested', value: string | boolean) => {
    setBlocData(prev => ({
      ...prev,
      ratoonHarvestDates: prev.ratoonHarvestDates.map((ratoon, i) =>
        i === index ? { ...ratoon, [field]: value } : ratoon
      )
    }))
  }

  const removeRatoonHarvestDate = (index: number) => {
    setBlocData(prev => ({
      ...prev,
      ratoonHarvestDates: prev.ratoonHarvestDates.filter((_, i) => i !== index)
        .map((ratoon, i) => ({ ...ratoon, ratoonNumber: i + 1 }))
    }))
  }

  const handleSugarcaneVarietySelect = (variety: CropVariety) => {
    setBlocData(prev => ({
      ...prev,
      sugarcaneVariety: variety.name
    }))
    setShowSugarcaneSelector(false)
  }

  const handleIntercropVarietySelect = (variety: CropVariety) => {
    setBlocData(prev => ({
      ...prev,
      intercropVariety: variety.name
    }))
    setShowIntercropSelector(false)
  }

  const getSelectedSugarcaneVarietyDetails = () => {
    return ALL_VARIETIES.find(v => v.name === blocData.sugarcaneVariety && v.category === 'sugarcane')
  }

  const getSelectedIntercropVarietyDetails = () => {
    return ALL_VARIETIES.find(v => v.name === blocData.intercropVariety && v.category === 'intercrop')
  }

  // Simple tab change handler - no auto-commit needed with database persistence
  const handleTabChange = (newTabId: string) => {
    if (newTabId === activeTab) return
    setActiveTab(newTabId)
  }

  const handleArchiveBloc = () => {
    if (window.confirm('Are you sure you want to archive this bloc? It will be moved to archived blocs but can be restored later.')) {
      // Archive bloc by updating its status in database
      try {
        // TODO: Implement bloc archiving in database
        console.log('Archiving bloc:', bloc.id)
        onBack() // Return to main view after archiving
      } catch (error) {
        console.error('Error archiving bloc:', error)
        alert('Error archiving bloc. Please try again.')
      }
    }
  }

  const handleDeleteBloc = () => {
    const confirmText = prompt('To confirm deletion, please type "delete this bloc" exactly:')
    if (confirmText === 'delete this bloc') {
      const finalConfirm = window.confirm('Are you absolutely sure? This will permanently delete the bloc and ALL related data including activities, products, resources, observations, and attachments. This action cannot be undone.')
      if (finalConfirm) {
        console.log('Deleting bloc:', bloc.id)
        if (onDelete) {
          onDelete(bloc.id) // Call the delete function passed from parent
        }
        onBack() // Return to main view after deletion
      }
    } else if (confirmText !== null) {
      alert('Deletion cancelled. The text did not match exactly.')
    }
  }

  const handleRetireBloc = () => {
    const confirmText = prompt('To confirm retirement, please type "retire this bloc" exactly:')
    if (confirmText === 'retire this bloc') {
      const finalConfirm = window.confirm('Are you sure you want to retire this bloc? It will be marked as retired but data will be preserved.')
      if (finalConfirm) {
        console.log('Retiring bloc:', bloc.id)
        // TODO: Implement bloc retirement logic - update status from active to retired
        // This should call a service to update the bloc status in the database
        alert('Bloc retirement functionality will be implemented with database integration.')
        onBack() // Return to main view after retirement
      }
    } else if (confirmText !== null) {
      alert('Retirement cancelled. The text did not match exactly.')
    }
  }

  return (
    <div className="h-full bg-gray-50 flex flex-col">
      {/* Header with back button */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-4">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            <span className="font-medium">Back to Map</span>
          </button>
          
          <div className="h-6 w-px bg-gray-300"></div>
          
          <div>
            <h1 className="text-xl font-bold text-gray-900">Bloc {bloc.id}</h1>
            <p className="text-sm text-gray-600">
              Area: {bloc.area.toFixed(2)} ha • Fields: {bloc.fieldIds.length} parcelles
            </p>

          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* Database persistence indicator */}
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span>Database connected</span>
          </div>
        </div>
      </div>

      {/* Validation Warnings */}
      {validation.warnings.length > 0 && (
        <div className="bg-yellow-50 border-b border-yellow-200 px-6 py-4">
          <div className="flex items-start space-x-2">
            <svg className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div className="text-sm">
              <h4 className="font-medium text-yellow-800 mb-1">Validation Issues</h4>
              <ul className="space-y-1">
                {validation.warnings.map((warning, index) => (
                  <li key={index} className="text-yellow-700">{warning}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}



      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200 px-6">
        <nav className="flex space-x-8">
          {tabs.map((tab) => {
            // Check if tab has unsaved changes
            const hasUnsavedChanges = Boolean(
              (tab.id === 'general' && cropCycleFormRef.current?.isDirty) ||
              (tab.id === 'activities' && activitiesFormRef.current?.isDirty) ||
              (tab.id === 'observations' && observationsFormRef.current?.isDirty)
            )

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabChange(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 relative ${
                  activeTab === tab.id
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="flex items-center space-x-2">
                  <span>{tab.icon}</span>
                  <span>{tab.name}</span>

                  {/* Unsaved changes indicator */}
                  <TabUnsavedIndicator isDirty={hasUnsavedChanges} />

                  {/* Status indicator */}
                  {tab.status === 'warning' && (
                    <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                  )}
                  {tab.status === 'complete' && (
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  )}
                </span>
              </button>
            )
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto">
          {activeTab === 'general' && (
            <CropCycleGeneralInfo
              ref={cropCycleFormRef}
              bloc={bloc}
              onSave={async (data) => {
                try {
                  console.log('Crop cycle data saved:', data)
                  // The cycle creation and activation is handled in the CropCycleGeneralInfo component
                  // and the CropCycleContext automatically sets it as active
                } catch (error) {
                  console.error('Error handling crop cycle save:', error)
                }
              }}
            />
          )}

          {activeTab === 'cultivation' && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Cultivation Data</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Soil Type</label>
                  <select
                    value={blocData.soilType}
                    onChange={(e) => handleInputChange('soilType', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="Clay Loam">Clay Loam</option>
                    <option value="Sandy Loam">Sandy Loam</option>
                    <option value="Clay">Clay</option>
                    <option value="Sandy">Sandy</option>
                    <option value="Volcanic">Volcanic</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Irrigation Type</label>
                  <select
                    value={blocData.irrigationType}
                    onChange={(e) => handleInputChange('irrigationType', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="Drip Irrigation">Drip Irrigation</option>
                    <option value="Sprinkler">Sprinkler</option>
                    <option value="Flood Irrigation">Flood Irrigation</option>
                    <option value="Rain Fed">Rain Fed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Fertilizers Applied</label>
                  <textarea
                    value={blocData.fertilizers}
                    onChange={(e) => handleInputChange('fertilizers', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="List fertilizers and application rates..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Pesticides/Herbicides</label>
                  <textarea
                    value={blocData.pesticides}
                    onChange={(e) => handleInputChange('pesticides', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="List pesticides and application dates..."
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Last Cultivation Date</label>
                  <input
                    type="date"
                    value={blocData.lastCultivation}
                    onChange={(e) => handleInputChange('lastCultivation', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'production' && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Production Data</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Estimated Yield (tons/ha)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={blocData.estimatedYield}
                    onChange={(e) => handleInputChange('estimatedYield', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Actual Yield (tons/ha)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={blocData.actualYield}
                    onChange={(e) => handleInputChange('actualYield', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sugar Content (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={blocData.sugarContent}
                    onChange={(e) => handleInputChange('sugarContent', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Quality Grade</label>
                  <select
                    value={blocData.qualityGrade}
                    onChange={(e) => handleInputChange('qualityGrade', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="A">Grade A (Premium)</option>
                    <option value="B">Grade B (Standard)</option>
                    <option value="C">Grade C (Below Standard)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'monitoring' && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Monitoring & Health</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Last Inspection Date</label>
                  <input
                    type="date"
                    value={blocData.lastInspection}
                    onChange={(e) => handleInputChange('lastInspection', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Health Status</label>
                  <select
                    value={blocData.healthStatus}
                    onChange={(e) => handleInputChange('healthStatus', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="Excellent">Excellent</option>
                    <option value="Good">Good</option>
                    <option value="Fair">Fair</option>
                    <option value="Poor">Poor</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Current Issues</label>
                  <textarea
                    value={blocData.issues}
                    onChange={(e) => handleInputChange('issues', e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Describe any pests, diseases, or other issues..."
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Recommendations</label>
                  <textarea
                    value={blocData.recommendations}
                    onChange={(e) => handleInputChange('recommendations', e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Treatment recommendations and action items..."
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'financial' && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Financial Data</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Planting Cost (MUR)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={blocData.plantingCost}
                    onChange={(e) => handleInputChange('plantingCost', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Maintenance Cost (MUR)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={blocData.maintenanceCost}
                    onChange={(e) => handleInputChange('maintenanceCost', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Harvest Cost (MUR)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={blocData.harvestCost}
                    onChange={(e) => handleInputChange('harvestCost', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Revenue (MUR)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={blocData.revenue}
                    onChange={(e) => handleInputChange('revenue', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div className="md:col-span-2">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Financial Summary</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Total Costs:</span>
                        <span className="font-medium ml-2">
                          MUR {(blocData.plantingCost + blocData.maintenanceCost + blocData.harvestCost).toLocaleString()}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Net Profit:</span>
                        <span className={`font-medium ml-2 ${
                          (blocData.revenue - blocData.plantingCost - blocData.maintenanceCost - blocData.harvestCost) >= 0
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`}>
                          MUR {(blocData.revenue - blocData.plantingCost - blocData.maintenanceCost - blocData.harvestCost).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Delete and Retire Buttons */}
              <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={handleRetireBloc}
                  className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors duration-200 font-medium"
                >
                  Retire Bloc
                </button>
                <button
                  type="button"
                  onClick={handleDeleteBloc}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 font-medium"
                >
                  Delete Bloc
                </button>
              </div>
            </div>
          )}

          {activeTab === 'satellite-soil' && (
            <SoilDataTab bloc={bloc} />
          )}

          {activeTab === 'satellite-vegetation' && (
            <VegetationDataTab bloc={bloc} />
          )}

          {activeTab === 'weather' && (
            <WeatherDashboard drawnAreas={[bloc]} />
          )}

          {activeTab === 'activities' && (
            <ActivitiesTab bloc={bloc} />
          )}

          {activeTab === 'observations' && (
            <ObservationsTab bloc={bloc} />
          )}

          {activeTab === 'attachments' && (
            <AttachmentsTab bloc={bloc} />
          )}

        </div>
      </div>

      {/* Sugar Cane Variety Selector Modal */}
      {showSugarcaneSelector && (
        <VarietySelector
          onSelect={handleSugarcaneVarietySelect}
          onClose={() => setShowSugarcaneSelector(false)}
          selectedVariety={getSelectedSugarcaneVarietyDetails()?.id}
          varietyType="sugarcane"
        />
      )}

      {/* Intercrop Variety Selector Modal */}
      {showIntercropSelector && (
        <VarietySelector
          onSelect={handleIntercropVarietySelect}
          onClose={() => setShowIntercropSelector(false)}
          selectedVariety={getSelectedIntercropVarietyDetails()?.id}
          varietyType="intercrop"
        />
      )}
    </div>
  )
}

// Main component wrapper with CropCycleProvider
export default function BlocDataScreen({ bloc, onBack, onDelete }: BlocDataScreenProps) {
  return (
    <CropCycleProvider blocId={bloc.id} userRole="user">
      <SelectedCropCycleProvider>
        <BlocDataScreenInner bloc={bloc} onBack={onBack} onDelete={onDelete} />
      </SelectedCropCycleProvider>
    </CropCycleProvider>
  )
}
