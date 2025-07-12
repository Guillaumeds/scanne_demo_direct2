'use client'

import React, { useState, useRef } from 'react'
import SoilDataTab from './SoilDataTab'
import VegetationDataTab from './VegetationDataTab'
import WeatherDashboard from './WeatherDashboard'
import ObservationsTab from './ObservationsTab'
import OverviewTab from './OverviewTab'
import ModernOverviewTab from './ModernOverviewTab'
import { ModernBlocScreen } from './bloc/ModernBlocScreen'
import { getFeatureFlags } from '@/lib/featureFlags'
import { Icon } from '@/components/ui/icon'
import VarietySelector from './VarietySelector'
import CropCycleGeneralInfo from './CropCycleGeneralInfo'
import { TabUnsavedIndicator } from './UnsavedChangesIndicator'
import { CropCycleProvider, useCropCyclePermissions, useCropCycleInfo, useCropCycleValidation, useCropCycle } from '@/contexts/CropCycleContext'
import { SelectedCropCycleProvider } from '@/contexts/SelectedCropCycleContext'
import { CropVariety } from '@/types/varieties'
import { DrawnArea, DrawnAreaUtils } from '@/types/drawnArea'
import { FormCommitRef } from '@/hooks/useFormWithAutoCommit'
import { useAllVarieties } from '@/hooks/useLocalStorageData'

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
function BlocDataScreenInner({ bloc, onBack, onDelete }: BlocDataScreenProps): JSX.Element {
  // Crop cycle context hooks
  const permissions = useCropCyclePermissions()
  const { getActiveCycleInfo } = useCropCycleInfo()
  const validation = useCropCycleValidation()

  // Get the crop cycle context for creating cycles
  const cropCycleContext = useCropCycle()

  // Get active cycle info
  const activeCycleInfo = getActiveCycleInfo()

  // Load varieties data
  const { data: allVarieties, loading: varietiesLoading } = useAllVarieties()

  const [activeTab, setActiveTab] = useState('general')
  const [showSugarcaneSelector, setShowSugarcaneSelector] = useState(false)
  const [showIntercropSelector, setShowIntercropSelector] = useState(false)
  const [isEditingBlocName, setIsEditingBlocName] = useState(false)
  const [editedBlocName, setEditedBlocName] = useState(bloc.name || `Bloc ${bloc.localId}`)

  // Convert DrawnArea to legacy format expected by tab components
  const legacyBloc = {
    id: DrawnAreaUtils.getEntityKey(bloc), // Use entity key as id for compatibility
    localId: bloc.localId,
    type: bloc.type,
    coordinates: bloc.coordinates,
    area: bloc.area,
    name: bloc.name,
    isHarvested: false, // Default values for legacy properties
    ratoonHarvestDates: []
  }

  // Form refs for auto-commit functionality
  const cropCycleFormRef = useRef<FormCommitRef>(null)
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
    { id: 'general', name: 'Crop Cycle Information', icon: 'settings', status: getTabStatus('general') },
    { id: 'overview', name: 'Crop Management', icon: 'overview', status: getTabStatus('overview') },
    { id: 'observations', name: 'Observations', icon: 'observations', status: getTabStatus('observations') }
  ]

  const footerTabs = [
    { id: 'weather', name: 'Weather', icon: 'weather', status: getTabStatus('weather') },
    { id: 'satellite-soil', name: 'Soil', icon: 'location', status: getTabStatus('satellite-soil') },
    { id: 'satellite-vegetation', name: 'Vegetation', icon: 'crop', status: getTabStatus('satellite-vegetation') }
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
    if (!allVarieties) return null
    return allVarieties.find(v => v.name === blocData.sugarcaneVariety && v.category === 'sugarcane')
  }

  const getSelectedIntercropVarietyDetails = () => {
    if (!allVarieties) return null
    return allVarieties.find(v => v.name === blocData.intercropVariety && v.category === 'intercrop')
  }

  // Simple tab change handler - no auto-commit needed with database persistence
  const handleTabChange = (newTabId: string) => {
    if (newTabId === activeTab) return

    // Prevent switching to disabled tabs when no active crop cycle
    if (!activeCycleInfo && (newTabId === 'overview' || newTabId === 'observations')) {
      return
    }

    setActiveTab(newTabId)
  }

  // Handle bloc name editing
  const handleBlocNameSave = async () => {
    try {
      // Here you would typically save to database
      // For now, just update the local state
      bloc.name = editedBlocName
      setIsEditingBlocName(false)
    } catch (error) {
      console.error('Error saving bloc name:', error)
    }
  }

  const handleBlocNameCancel = () => {
    setEditedBlocName(bloc.name || `Bloc ${bloc.localId}`)
    setIsEditingBlocName(false)
  }

  const handleArchiveBloc = () => {
    if (window.confirm('Are you sure you want to archive this bloc? It will be moved to archived blocs but can be restored later.')) {
      // Archive bloc by updating its status in database
      try {
        // TODO: Implement bloc archiving in database
        console.log('Archiving bloc:', DrawnAreaUtils.getDisplayName(bloc), 'UUID:', bloc.uuid)
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
        console.log('Deleting bloc:', DrawnAreaUtils.getDisplayName(bloc), 'UUID:', bloc.uuid)
        if (onDelete) {
          onDelete(DrawnAreaUtils.getEntityKey(bloc)) // Use entity key for deletion
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
        console.log('Retiring bloc:', DrawnAreaUtils.getDisplayName(bloc), 'UUID:', bloc.uuid)
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


      {/* Main Content Area with Left Navigation Panel */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Navigation Panel */}
        <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
          <nav className="flex-1 p-4">
            {/* Bloc Name and Area */}
            <div className="mb-6 pb-4 border-b border-gray-200">
              <div className="flex items-center space-x-2 mb-1">
                {isEditingBlocName ? (
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={editedBlocName}
                      onChange={(e) => setEditedBlocName(e.target.value)}
                      className="text-lg font-bold text-gray-900 border-b-2 border-green-500 bg-transparent focus:outline-none"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleBlocNameSave()
                        if (e.key === 'Escape') handleBlocNameCancel()
                      }}
                      autoFocus
                    />
                    <button
                      onClick={handleBlocNameSave}
                      className="p-1 text-green-600 hover:text-green-700"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </button>
                    <button
                      onClick={handleBlocNameCancel}
                      className="p-1 text-gray-400 hover:text-gray-600"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <h1 className="text-lg font-bold text-gray-900">{bloc.name || `Bloc ${bloc.localId}`}</h1>
                    <button
                      onClick={() => setIsEditingBlocName(true)}
                      className="p-1 text-gray-400 hover:text-gray-600"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
              <p className="text-sm text-gray-600">
                Area: {bloc.area.toFixed(2)} ha
              </p>
            </div>

            <div className="space-y-2">
              {tabs.map((tab) => {
                // Check if tab has unsaved changes
                const hasUnsavedChanges = Boolean(
                  (tab.id === 'general' && cropCycleFormRef.current?.isDirty) ||
                  (tab.id === 'observations' && observationsFormRef.current?.isDirty)
                )

                // Allow access to all tabs regardless of crop cycle status
                const isDisabled = false

                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => !isDisabled && handleTabChange(tab.id)}
                    disabled={isDisabled}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                      activeTab === tab.id
                        ? 'bg-green-100 text-green-700 border border-green-200'
                        : isDisabled
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <Icon
                      name={tab.icon as any}
                      size="sm"
                      className={activeTab === tab.id ? 'text-emerald-600' : 'text-slate-600'}
                    />
                    <span className="flex-1 text-left">{tab.name}</span>

                    {/* Unsaved changes indicator */}
                    <TabUnsavedIndicator isDirty={hasUnsavedChanges} />

                    {/* Status indicators removed as requested */}
                  </button>
                )
              })}
            </div>

            {/* Back to Map Button */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onBack}
                className="w-full flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 12H5M12 19l-7-7 7-7"/>
                </svg>
                <span className="text-sm font-medium">Back to Map</span>
              </button>
            </div>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Content Title */}
          <div className="bg-white border-b border-gray-200 px-6 py-4">
            <h2 className="text-xl font-semibold text-gray-900">
              {tabs.find(tab => tab.id === activeTab)?.name}
            </h2>
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
                hideSidePanel={true}
              />
            )}

            {activeTab === 'overview' && (() => {
              const flags = getFeatureFlags()

              if (flags.useModernOverviewTab) {
                // Use modern overview tab with mock data for now
                const mockData = [{
                  id: bloc.uuid || bloc.localId,
                  name: bloc.name || `Bloc ${bloc.localId}`,
                  area_hectares: bloc.area,
                  cycle_number: [1], // Default cycle number
                  variety_name: activeCycleInfo?.sugarcaneVariety || 'Not set',
                  planned_harvest_date: activeCycleInfo?.plannedHarvestDate || '',
                  expected_yield_tons_ha: 80,
                  growth_stage: 'germination', // Default growth stage
                  progress: 0,
                  total_est_product_cost: 0,
                  total_est_resource_cost: 0,
                  total_act_product_cost: 0,
                  total_act_resource_cost: 0,
                  cycle_type: activeCycleInfo?.type || 'plantation',
                  planting_date: activeCycleInfo?.plantingDate || new Date().toISOString().split('T')[0],
                  products: []
                }]

                return (
                  <ModernOverviewTab
                    data={mockData}
                    activeCycleInfo={activeCycleInfo}
                    onDataUpdate={(data) => {
                      console.log('Modern overview data updated:', data)
                    }}
                  />
                )
              }

              // Use legacy overview tab
              return (
                <OverviewTab
                  bloc={bloc}
                  readOnly={false}
                />
              )
            })()}

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
            <SoilDataTab bloc={legacyBloc} />
          )}

          {activeTab === 'satellite-vegetation' && (
            <VegetationDataTab bloc={legacyBloc} />
          )}

          {activeTab === 'weather' && (
            <WeatherDashboard drawnAreas={[legacyBloc]} />
          )}

          {activeTab === 'observations' && (
            <ObservationsTab bloc={legacyBloc} />
          )}

            </div>
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
    </div>
  )
}

// Main component wrapper with CropCycleProvider
export default function BlocDataScreen({ bloc, onBack, onDelete }: BlocDataScreenProps) {
  // Validate that bloc is saved and has UUID before creating crop cycles
  if (!bloc.uuid) {
    throw new Error(`Cannot open bloc details: Bloc "${bloc.localId}" must be saved to database first`)
  }

  // Check feature flags
  const flags = getFeatureFlags()

  if (flags.useModernNavigation) {
    // Use modern bloc screen
    return (
      <ModernBlocScreen
        bloc={bloc}
        onBack={onBack}
        onDelete={onDelete ? () => onDelete(bloc.uuid || bloc.localId) : undefined}
      />
    )
  }

  // Use legacy bloc screen
  return (
    <CropCycleProvider blocId={bloc.uuid} userRole="user">
      <SelectedCropCycleProvider>
        <BlocDataScreenInner bloc={bloc} onBack={onBack} onDelete={onDelete} />
      </SelectedCropCycleProvider>
    </CropCycleProvider>
  )
}
