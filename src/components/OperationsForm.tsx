'use client'

import { useState, useEffect } from 'react'
import ProductSelector from './ProductSelector'
import ResourceSelector from './ResourceSelector'
import { Product } from '@/types/products'
import { Resource } from '@/types/resources'
import { 
  BlocActivity,
  ActivityPhase,
  ActivityStatus,
  ActivityTemplate,
  calculateActivityCosts,
  SUGARCANE_PHASES,
  ACTIVITY_TEMPLATES
} from '@/types/activities'
import AttachmentUploader, { AttachmentFile } from './AttachmentUploader'
import { SaveButton, CancelButton } from '@/components/ui/SubmitButton'

interface OperationsFormProps {
  operation: any // The product/operation data from the overview table
  blocArea: number
  activeCycleInfo: any
  onSave: (operation: any) => Promise<void>
  onCancel: () => void
}

export default function OperationsForm({
  operation,
  blocArea,
  activeCycleInfo,
  onSave,
  onCancel
}: OperationsFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState(() => {
    console.log('🎯 Initializing operations form with operation:', operation?.id, operation?.product_name)

    return {
      id: operation?.id || '',
      operationName: operation?.product_name || '',
      method: operation?.method || '',
      mainProduct: operation?.mainProduct || null,
      quantity: operation?.quantity || 0,
      startDate: operation?.planned_start_date || new Date().toISOString().split('T')[0],
      endDate: operation?.planned_end_date || new Date().toISOString().split('T')[0],
      status: operation?.status || 'planned',
      resources: operation?.resources || [],
      notes: operation?.notes || ''
    }
  })

  // Selection modal states
  const [showOperationSelector, setShowOperationSelector] = useState(false)
  const [showMethodSelector, setShowMethodSelector] = useState(false)
  const [showMainProductSelector, setShowMainProductSelector] = useState(false)
  const [showResourceSelector, setShowResourceSelector] = useState(false)
  const [editingResourceIndex, setEditingResourceIndex] = useState<number | null>(null)
  const [showResourceEditor, setShowResourceEditor] = useState(false)
  const [attachmentFiles, setAttachmentFiles] = useState<AttachmentFile[]>([])

  // Tab state
  const [activeTab, setActiveTab] = useState<'general' | 'yield' | 'resources' | 'notes' | 'attachments'>('general')

  // Additional form data for new tabs
  const [yieldData, setYieldData] = useState({
    totalYieldTons: 552.2,
    yieldPerHectare: 110,
    actualHarvestDate: '16/07/2025',
    brixPercentage: 17,
    sugarContentPercentage: 14,
    totalSugarcaneRevenue: 828300,
    revenuePerHa: 165000,
    pricePerTonne: 1500
  })

  // Fixed resource list with predefined rates (will be from DB later)
  const RESOURCE_TYPES = [
    { name: 'Supervisor', ratePerHour: 500 },
    { name: 'Permanent Male', ratePerHour: 300 },
    { name: 'Permanent Female', ratePerHour: 250 },
    { name: 'Contract Male', ratePerHour: 350 },
    { name: 'Contract Female', ratePerHour: 280 }
  ]

  const [resourcesData, setResourcesData] = useState<Array<{
    resource: string
    estimatedEffort: number
    estimatedCost: number
    ratePerHour: number
  }>>(
    RESOURCE_TYPES.map(type => ({
      resource: type.name,
      estimatedEffort: 0,
      estimatedCost: 0,
      ratePerHour: type.ratePerHour
    }))
  )

  const [notesData, setNotesData] = useState<string[]>([''])

  // Template selection handler
  const handleTemplateSelect = (templateId: string) => {
    const template = ACTIVITY_TEMPLATES.find(t => t.id === templateId)
    if (template) {
      setFormData({
        ...formData,
        operationName: template.name,
        method: template.resourceType || 'Manual'
      })
    }
  }



  // Resource handlers
  const handleResourceSelect = (resource: Resource, hours: number, actualCost?: number) => {
    const estimatedCost = resource.costPerUnit ? hours * resource.costPerUnit : 0
    const newResource = {
      resourceId: resource.id,
      resourceName: resource.name,
      hours,
      unit: resource.unit,
      estimatedCost,
      actualCost,
      category: resource.category
    }

    if (editingResourceIndex !== null) {
      const updatedResources = [...(formData.resources || [])]
      updatedResources[editingResourceIndex] = newResource
      setFormData({ ...formData, resources: updatedResources })
      setEditingResourceIndex(null)
    } else {
      const updatedResources = [...(formData.resources || []), newResource]
      setFormData({ ...formData, resources: updatedResources })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (isSubmitting) return

    console.log('Operations form submit - operation:', operation?.id, 'formData.id:', formData.id)

    if (!activeCycleInfo) {
      alert('No active crop cycle found. Please create a crop cycle first.')
      return
    }

    setIsSubmitting(true)

    // Create operation data structure
    const operationData = {
      id: formData.id || operation?.id || `operation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      product_name: formData.operationName!,
      method: formData.method!,
      planned_start_date: formData.startDate!,
      planned_end_date: formData.endDate!,
      quantity: formData.quantity || 0,
      mainProduct: formData.mainProduct,
      resources: resourcesData || [],
      yieldData: yieldData,
      notes: notesData.filter(note => note.trim() !== '').join('\n'),
      attachments: attachmentFiles,
      status: formData.status || 'planned'
    }

    try {
      await onSave(operationData)
    } catch (error) {
      console.error('Error saving operation:', error)
      alert(`Error saving operation: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">
              {operation ? 'Edit Operation' : 'Add New Operation'}
            </h2>
            <button
              type="button"
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ✕
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {[
                { id: 'general', name: 'General', icon: '⚙️' },
                { id: 'yield', name: 'Yield', icon: '🌾' },
                { id: 'resources', name: 'Resources', icon: '👥' },
                { id: 'notes', name: 'Notes', icon: '📝' },
                { id: 'attachments', name: 'Attachments', icon: '📎' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`${
                    activeTab === tab.id
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* General Tab */}
            {activeTab === 'general' && (
              <div className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Operation Name - Connected to table */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Operation *
                    </label>
                    <div
                      className="w-full px-3 py-2 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 min-h-[42px] flex items-center"
                      onClick={() => setShowOperationSelector(true)}
                      title="Click to select operation"
                    >
                      <span className={formData.operationName ? "text-gray-900" : "text-gray-500"}>
                        {formData.operationName || "Select operation..."}
                      </span>
                    </div>
                  </div>

                  {/* Method - Connected to table */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Method *
                    </label>
                    <div
                      className="w-full px-3 py-2 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 min-h-[42px] flex items-center"
                      onClick={() => setShowMethodSelector(true)}
                      title="Click to select method"
                    >
                      <span className={formData.method ? "text-gray-900" : "text-gray-500"}>
                        {formData.method || "Select method..."}
                      </span>
                    </div>
                  </div>

                  {/* Quantity - Independent field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quantity
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      value={formData.quantity || ''}
                      onChange={(e) => setFormData({ ...formData, quantity: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      placeholder="Enter quantity"
                      title="Enter quantity"
                    />
                  </div>
                </div>

            {/* Dates - Connected to table */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Planned Start Date *
                </label>
                <input
                  type="date"
                  required
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  title="Select planned start date"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Planned End Date *
                </label>
                <input
                  type="date"
                  required
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  title="Select planned end date"
                />
              </div>
            </div>

            {/* Product - Connected to table, compact design */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-gray-700">
                  Product
                </label>
                <button
                  type="button"
                  onClick={() => setShowMainProductSelector(true)}
                  className="flex items-center space-x-2 px-3 py-2 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg border border-dashed border-blue-300 hover:border-blue-400 transition-colors"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                  <span>{formData.mainProduct ? 'Change Product' : 'Add Product'}</span>
                </button>
              </div>

              {formData.mainProduct ? (
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-lg">🧪</span>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{formData.mainProduct.productName}</div>
                        <div className="text-sm text-gray-600">
                          Rate: {formData.mainProduct.rate} {formData.mainProduct.unit}/ha •
                          Qty: {formData.mainProduct.quantity} {formData.mainProduct.unit}
                          <br />
                          <span className="text-blue-600">Est: Rs {(formData.mainProduct.estimatedCost || 0).toLocaleString()}</span>
                          {formData.mainProduct.actualCost !== undefined && (
                            <span className="text-green-600 ml-2">Act: Rs {formData.mainProduct.actualCost.toLocaleString()}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, mainProduct: null })}
                      className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-100 rounded transition-colors"
                      title="Remove main product"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3,6 5,6 21,6"></polyline>
                        <path d="m19,6v14a2,2 0 0,1-2,2H7a2,2 0 0,1-2-2V6m3,0V4a2,2 0 0,1,2-2h4a2,2 0 0,1,2,2v2"></path>
                      </svg>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 border-2 border-dashed border-gray-300 rounded-lg">
                  <div className="text-gray-500 text-sm">No product selected</div>
                </div>
              )}
            </div>


              </div>
            )}

            {/* Yield Tab */}
            {activeTab === 'yield' && (
              <div className="space-y-6">
                {/* Main Yield Section */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-4">Main Yield Section</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Total Yield (tons) *
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        value={yieldData.totalYieldTons || ''}
                        onChange={(e) => {
                          const totalYield = parseFloat(e.target.value) || 0
                          const yieldPerHa = blocArea > 0 ? totalYield / blocArea : 0
                          setYieldData({
                            ...yieldData,
                            totalYieldTons: totalYield,
                            yieldPerHectare: Math.round(yieldPerHa * 10) / 10
                          })
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        placeholder="552.2"
                        title="Enter total yield in tons"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Yield per Hectare (t/ha) *
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        value={yieldData.yieldPerHectare || ''}
                        onChange={(e) => {
                          const yieldPerHa = parseFloat(e.target.value) || 0
                          const totalYield = yieldPerHa * blocArea
                          setYieldData({
                            ...yieldData,
                            yieldPerHectare: yieldPerHa,
                            totalYieldTons: Math.round(totalYield * 10) / 10
                          })
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        placeholder="110"
                        title="Enter yield per hectare"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Actual Harvest Date
                      </label>
                      <input
                        type="date"
                        value={yieldData.actualHarvestDate}
                        onChange={(e) => setYieldData({ ...yieldData, actualHarvestDate: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        title="Select actual harvest date"
                      />
                    </div>
                  </div>
                </div>

                {/* Quality Metrics */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-4">Quality Metrics</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Brix (%)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={yieldData.brixPercentage || ''}
                        onChange={(e) => setYieldData({ ...yieldData, brixPercentage: parseFloat(e.target.value) || 0 })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        placeholder="17"
                        title="Enter brix percentage"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Sugar Content (%)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={yieldData.sugarContentPercentage || ''}
                        onChange={(e) => setYieldData({ ...yieldData, sugarContentPercentage: parseFloat(e.target.value) || 0 })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        placeholder="14"
                        title="Enter sugar content percentage"
                      />
                    </div>
                  </div>
                </div>

                {/* Revenue Information Section */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-4">Revenue Information Section</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Total Sugarcane Revenue (MUR)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={yieldData.totalSugarcaneRevenue || ''}
                        onChange={(e) => {
                          const totalRevenue = parseFloat(e.target.value) || 0
                          const revenuePerHa = blocArea > 0 ? totalRevenue / blocArea : 0
                          const pricePerTonne = yieldData.totalYieldTons > 0 ? totalRevenue / yieldData.totalYieldTons : 0
                          setYieldData({
                            ...yieldData,
                            totalSugarcaneRevenue: totalRevenue,
                            revenuePerHa: Math.round(revenuePerHa),
                            pricePerTonne: Math.round(pricePerTonne)
                          })
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        placeholder="828300"
                        title="Enter total sugarcane revenue"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Revenue / ha (MUR/ha)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={yieldData.revenuePerHa || ''}
                        onChange={(e) => {
                          const revenuePerHa = parseFloat(e.target.value) || 0
                          const totalRevenue = revenuePerHa * blocArea
                          const pricePerTonne = yieldData.totalYieldTons > 0 ? totalRevenue / yieldData.totalYieldTons : 0
                          setYieldData({
                            ...yieldData,
                            revenuePerHa: revenuePerHa,
                            totalSugarcaneRevenue: Math.round(totalRevenue),
                            pricePerTonne: Math.round(pricePerTonne)
                          })
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        placeholder="165000"
                        title="Enter revenue per hectare"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Price per Tonne (MUR/t)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={yieldData.pricePerTonne || ''}
                        onChange={(e) => {
                          const pricePerTonne = parseFloat(e.target.value) || 0
                          const totalRevenue = pricePerTonne * yieldData.totalYieldTons
                          const revenuePerHa = blocArea > 0 ? totalRevenue / blocArea : 0
                          setYieldData({
                            ...yieldData,
                            pricePerTonne: pricePerTonne,
                            totalSugarcaneRevenue: Math.round(totalRevenue),
                            revenuePerHa: Math.round(revenuePerHa)
                          })
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        placeholder="1500"
                        title="Enter price per tonne"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Resources Tab */}
            {activeTab === 'resources' && (
              <div className="space-y-6">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Resource
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Estimate Effort (Hours)
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Estimate Cost (MUR)
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {resourcesData.map((resource, index) => (
                        <tr key={resource.resource}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <span className="text-sm font-medium text-gray-900">{resource.resource}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="number"
                              min="0"
                              step="0.5"
                              value={resource.estimatedEffort || ''}
                              onChange={(e) => {
                                const effort = parseFloat(e.target.value) || 0
                                const cost = effort * resource.ratePerHour
                                const updated = [...resourcesData]
                                updated[index] = {
                                  ...updated[index],
                                  estimatedEffort: effort,
                                  estimatedCost: Math.round(cost)
                                }
                                setResourcesData(updated)
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                              placeholder="0"
                              title="Enter estimated effort in hours"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {resource.estimatedCost.toLocaleString()}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Notes Tab */}
            {activeTab === 'notes' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">Notes</h3>
                  <button
                    type="button"
                    onClick={() => setNotesData([...notesData, ''])}
                    className="flex items-center space-x-2 px-3 py-2 text-sm text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg border border-dashed border-green-300 hover:border-green-400 transition-colors"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="12" y1="5" x2="12" y2="19"></line>
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                    <span>Add Note</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {notesData.map((note, index) => (
                    <div key={index} className="relative">
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm font-medium text-gray-600">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <textarea
                            value={note}
                            onChange={(e) => {
                              const updated = [...notesData]
                              updated[index] = e.target.value
                              setNotesData(updated)
                            }}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                            placeholder={`Note ${index + 1}...`}
                            title={`Enter note ${index + 1}`}
                          />
                        </div>
                        {notesData.length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              setNotesData(notesData.filter((_, i) => i !== index))
                            }}
                            className="flex-shrink-0 p-1 text-gray-400 hover:text-red-600 hover:bg-red-100 rounded transition-colors"
                            title="Remove note"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="3,6 5,6 21,6"></polyline>
                              <path d="m19,6v14a2,2 0 0,1-2,2H7a2,2 0 0,1-2-2V6m3,0V4a2,2 0 0,1,2-2h4a2,2 0 0,1,2,2v2"></path>
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Attachments Tab */}
            {activeTab === 'attachments' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">Attachments</h3>

                <div>
                  <AttachmentUploader
                    onFilesChange={setAttachmentFiles}
                    maxFiles={10}
                    maxSize={50}
                    className="mt-2"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
            <CancelButton
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </CancelButton>
            <SaveButton
              type="submit"
              disabled={isSubmitting}
              loadingText="Saving..."
            >
              Save Operation
            </SaveButton>
          </div>
        </form>
      </div>

      {/* Operation Selector Modal */}
      {showOperationSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Select Operation</h3>
              <div className="space-y-2">
                {['Planting', 'Fertilizing', 'Weeding', 'Irrigation', 'Harvesting', 'Spraying'].map(op => (
                  <button
                    key={op}
                    type="button"
                    onClick={() => {
                      setFormData({ ...formData, operationName: op })
                      setShowOperationSelector(false)
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded"
                  >
                    {op}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setShowOperationSelector(false)}
                className="mt-4 w-full px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Method Selector Modal */}
      {showMethodSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Select Method</h3>
              <div className="space-y-2">
                {['Manual', 'Mechanical', 'Chemical', 'Biological', 'Integrated'].map(method => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => {
                      setFormData({ ...formData, method })
                      setShowMethodSelector(false)
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded"
                  >
                    {method}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setShowMethodSelector(false)}
                className="mt-4 w-full px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Product Selector Modal */}
      {showMainProductSelector && (
        <ProductSelector
          onSelect={(product, quantity, actualCost) => {
            const mainProduct = {
              productId: product.id,
              productName: product.name,
              quantity,
              rate: quantity / blocArea,
              unit: product.unit,
              estimatedCost: (product as any).costPerUnit ? quantity * (product as any).costPerUnit : 0,
              actualCost
            }
            setFormData({ ...formData, mainProduct })
            setShowMainProductSelector(false)
          }}
          onClose={() => setShowMainProductSelector(false)}
          blocArea={blocArea}
          existingProduct={formData.mainProduct}
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
          existingResource={editingResourceIndex !== null && formData.resources?.[editingResourceIndex] ?
            formData.resources[editingResourceIndex] : undefined}
        />
      )}


    </div>
  )
}


