'use client'

import { useState } from 'react'
import SoilDataTab from './SoilDataTab'
import VegetationDataTab from './VegetationDataTab'
import WeatherDashboard from './WeatherDashboard'
import ActivitiesTab from './ActivitiesTab'
import AttachmentsTab from './AttachmentsTab'
import VarietySelector from './VarietySelector'
import { CropVariety, ALL_VARIETIES } from '@/types/varieties'



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

export default function BlocDataScreen({ bloc, onBack, onDelete }: BlocDataScreenProps) {
  const [activeTab, setActiveTab] = useState('general')
  const [showSugarcaneSelector, setShowSugarcaneSelector] = useState(false)
  const [showIntercropSelector, setShowIntercropSelector] = useState(false)
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

  const tabs = [
    { id: 'general', name: 'General Info', icon: '📋' },
    { id: 'activities', name: 'Activities', icon: '📋' },
    { id: 'weather', name: 'Weather', icon: '🌤️' },
    { id: 'satellite-soil', name: 'Satellite Soil', icon: '🛰️' },
    { id: 'satellite-vegetation', name: 'Satellite Vegetation', icon: '🌿' },
    { id: 'attachments', name: 'Attachments', icon: '📎' }
  ]

  const handleInputChange = (field: keyof BlocData, value: string | number | boolean) => {
    setBlocData(prev => ({
      ...prev,
      [field]: value
    }))
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

  const handleSave = () => {
    // TODO: Implement save functionality
    console.log('Saving bloc data:', blocData)
    alert('Data saved successfully!')
  }

  const handleArchiveBloc = () => {
    if (window.confirm('Are you sure you want to archive this bloc? It will be moved to archived blocs but can be restored later.')) {
      // TODO: Implement archive functionality
      console.log('Archiving bloc:', bloc.id)
      onBack() // Return to main view after archiving
    }
  }

  const handleDeleteBloc = () => {
    if (window.confirm('Are you sure you want to delete this bloc? All data will be lost and this action cannot be undone.')) {
      console.log('Deleting bloc:', bloc.id)
      if (onDelete) {
        onDelete(bloc.id) // Call the delete function passed from parent
      }
      onBack() // Return to main view after deletion
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
            <h1 className="text-xl font-bold text-gray-900">{blocData.blocName}</h1>
            <p className="text-sm text-gray-600">
              Area: {bloc.area.toFixed(2)} ha • Fields: {bloc.fieldIds.length} parcelles
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors duration-200"
          >
            Save Changes
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200 px-6">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                activeTab === tab.id
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="flex items-center space-x-2">
                <span>{tab.icon}</span>
                <span>{tab.name}</span>
              </span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto">
          {activeTab === 'general' && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column */}
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">General Information</h2>

                    {/* Block ID Display */}
                    <div className="mb-4">
                      <span className="text-xs text-gray-500 uppercase tracking-wide">Block ID</span>
                      <div className="text-sm font-mono text-gray-700 bg-gray-50 px-2 py-1 rounded mt-1">
                        {bloc.id.slice(-8)}
                      </div>
                    </div>

                    {/* Planting Date */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Planting Date</label>
                      <input
                        type="date"
                        value={blocData.plantingDate}
                        onChange={(e) => handleInputChange('plantingDate', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>

                    {/* Sugar Cane Variety Selection */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Sugar Cane Variety</label>
                      <button
                        type="button"
                        onClick={() => setShowSugarcaneSelector(true)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white hover:bg-gray-50 transition-colors text-left flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-lg">🌾</span>
                          <div>
                            <div className="font-medium text-gray-900">
                              {blocData.sugarcaneVariety || 'Select sugar cane variety...'}
                            </div>
                            {getSelectedSugarcaneVarietyDetails() && (
                              <div className="text-xs text-gray-500">
                                Harvest: {(getSelectedSugarcaneVarietyDetails() as any)?.harvestStart} - {(getSelectedSugarcaneVarietyDetails() as any)?.harvestEnd}
                              </div>
                            )}
                          </div>
                        </div>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400">
                          <polyline points="9,18 15,12 9,6"></polyline>
                        </svg>
                      </button>
                    </div>

                    {/* Intercrop Variety Selection */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Intercrop Variety</label>
                      <button
                        type="button"
                        onClick={() => setShowIntercropSelector(true)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white hover:bg-gray-50 transition-colors text-left flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-lg">🌿</span>
                          <div>
                            <div className="font-medium text-gray-900">
                              {blocData.intercropVariety || 'Select intercrop variety...'}
                            </div>
                            {getSelectedIntercropVarietyDetails() && (
                              <div className="text-xs text-gray-500">
                                Harvest: {(getSelectedIntercropVarietyDetails() as any)?.harvestTime}
                              </div>
                            )}
                          </div>
                        </div>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400">
                          <polyline points="9,18 15,12 9,6"></polyline>
                        </svg>
                      </button>
                    </div>

                    {/* Bloc Description */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Bloc Description</label>
                      <textarea
                        value={blocData.blocDescription}
                        onChange={(e) => handleInputChange('blocDescription', e.target.value)}
                        rows={3}
                        placeholder="Enter bloc description..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>

                    {/* Delete and Archive Actions */}
                    <div className="flex items-center space-x-3 pt-4 border-t border-gray-200">
                      <button
                        type="button"
                        onClick={() => handleArchiveBloc()}
                        className="flex items-center space-x-2 px-3 py-2 text-sm text-amber-600 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="21,8 21,21 3,21 3,8"></polyline>
                          <rect x="1" y="3" width="22" height="5"></rect>
                          <line x1="10" y1="12" x2="14" y2="12"></line>
                        </svg>
                        <span>Archive Bloc</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteBloc()}
                        className="flex items-center space-x-2 px-3 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3,6 5,6 21,6"></polyline>
                          <path d="M19,6v14a2,2,0,0,1-2,2H7a2,2,0,0,1-2-2V6m3,0V4a2,2,0,0,1,2-2h4a2,2,0,0,1,2,2V6"></path>
                          <line x1="10" y1="11" x2="10" y2="17"></line>
                          <line x1="14" y1="11" x2="14" y2="17"></line>
                        </svg>
                        <span>Delete Bloc</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Right Column - Harvest Dates */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Harvest Schedule</h3>

                    {/* Expected Harvest Date for Planted Cane */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Expected Harvest Date (Planted Cane)</label>
                      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <label className="block text-xs text-gray-500 mb-1">
                            Expected Harvest Date Planted Cane
                          </label>
                          <input
                            type="date"
                            value={blocData.expectedHarvestDatePlanted}
                            onChange={(e) => handleInputChange('expectedHarvestDatePlanted', e.target.value)}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => handleInputChange('isHarvested', !blocData.isHarvested)}
                          className={`flex items-center space-x-1 px-2 py-1 rounded border transition-all duration-200 ${
                            blocData.isHarvested
                              ? 'bg-green-50 border-green-500 text-green-700'
                              : 'bg-gray-50 border-gray-300 text-gray-600 hover:border-green-400'
                          }`}
                        >
                          <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                            blocData.isHarvested
                              ? 'bg-green-500 border-green-500 text-white'
                              : 'border-gray-300 hover:border-green-400'
                          }`}>
                            {blocData.isHarvested && (
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                <polyline points="20,6 9,17 4,12"></polyline>
                              </svg>
                            )}
                          </div>
                          <span className="text-xs font-medium">Harvested</span>
                        </button>
                      </div>
                    </div>

                    {/* Ratoon Harvest Dates */}
                    <div className="space-y-3">
                      {blocData.ratoonHarvestDates.map((ratoon, index) => (
                        <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                          <div className="flex-1">
                            <label className="block text-xs text-gray-500 mb-1">
                              Expected Harvest Date Ratoon {ratoon.ratoonNumber}
                            </label>
                            <input
                              type="date"
                              value={ratoon.expectedDate}
                              onChange={(e) => updateRatoonHarvestDate(index, 'expectedDate', e.target.value)}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => updateRatoonHarvestDate(index, 'isHarvested', !ratoon.isHarvested)}
                            className={`flex items-center space-x-1 px-2 py-1 rounded border transition-all duration-200 ${
                              ratoon.isHarvested
                                ? 'bg-green-50 border-green-500 text-green-700'
                                : 'bg-gray-50 border-gray-300 text-gray-600 hover:border-green-400'
                            }`}
                          >
                            <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                              ratoon.isHarvested
                                ? 'bg-green-500 border-green-500 text-white'
                                : 'border-gray-300 hover:border-green-400'
                            }`}>
                              {ratoon.isHarvested && (
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                  <polyline points="20,6 9,17 4,12"></polyline>
                                </svg>
                              )}
                            </div>
                            <span className="text-xs font-medium">Harvested</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => removeRatoonHarvestDate(index)}
                            className="text-red-500 hover:text-red-700 p-1"
                            title="Remove ratoon"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <line x1="18" y1="6" x2="6" y2="18"></line>
                              <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                          </button>
                        </div>
                      ))}

                      {/* Add Ratoon Button */}
                      {blocData.ratoonHarvestDates.length < 10 && (
                        <button
                          type="button"
                          onClick={addRatoonHarvestDate}
                          className="flex items-center space-x-2 px-3 py-2 text-sm text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg border border-dashed border-green-300 hover:border-green-400 transition-colors w-full justify-center"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                          </svg>
                          <span>Add Ratoon Harvest Date</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
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
