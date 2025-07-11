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
  const [formData, setFormData] = useState<Partial<BlocActivity>>(() => {
    console.log('🎯 Initializing operations form with operation:', operation?.id, operation?.product_name)
    
    return {
      id: operation?.id || '',
      name: operation?.product_name || '',
      description: operation?.description || '',
      phase: 'growth' as ActivityPhase,
      status: 'planned' as ActivityStatus,
      startDate: operation?.planned_start_date || new Date().toISOString().split('T')[0],
      endDate: operation?.planned_end_date || new Date().toISOString().split('T')[0],
      duration: 8,
      products: operation?.products || [],
      resources: operation?.resources || [],
      resourceType: 'both',
      laborHours: 0,
      machineHours: 0,
      totalCost: 0,
      notes: operation?.notes || ''
    }
  })

  const [selectedTemplate, setSelectedTemplate] = useState('')
  const [showProductSelector, setShowProductSelector] = useState(false)
  const [showResourceSelector, setShowResourceSelector] = useState(false)
  const [editingProductIndex, setEditingProductIndex] = useState<number | null>(null)
  const [editingResourceIndex, setEditingResourceIndex] = useState<number | null>(null)
  const [showProductEditor, setShowProductEditor] = useState(false)
  const [showResourceEditor, setShowResourceEditor] = useState(false)
  const [attachmentFiles, setAttachmentFiles] = useState<AttachmentFile[]>([])

  // Template selection handler
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

  // Product handlers
  const handleProductSelect = (product: Product, quantity: number, rate: number, actualCost?: number) => {
    const estimatedCost = product.cost ? quantity * product.cost : 0
    const newProduct = {
      productId: product.id,
      productName: product.name,
      quantity,
      rate,
      unit: product.unit,
      estimatedCost,
      actualCost
    }

    if (editingProductIndex !== null) {
      const updatedProducts = [...(formData.products || [])]
      updatedProducts[editingProductIndex] = newProduct
      setFormData({ ...formData, products: updatedProducts })
      setEditingProductIndex(null)
    } else {
      const updatedProducts = [...(formData.products || []), newProduct]
      setFormData({ ...formData, products: updatedProducts })
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
      product_name: formData.name!,
      description: formData.description!,
      planned_start_date: formData.startDate!,
      planned_end_date: formData.endDate!,
      planned_rate: formData.totalCost || 0,
      method: formData.resourceType || 'both',
      products: formData.products || [],
      resources: formData.resources || [],
      notes: formData.notes,
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

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Template Selection */}
            {!operation && (
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
                  Operation Name *
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
                  Phase
                </label>
                <select
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

            {/* Description */}
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

            {/* Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            </div>

            {/* Status and Method */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Method
                </label>
                <select
                  value={formData.resourceType}
                  onChange={(e) => setFormData({ ...formData, resourceType: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="manual">Manual</option>
                  <option value="mechanical">Mechanical</option>
                  <option value="both">Both</option>
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
                            <br />
                            <span className="text-blue-600">Est: Rs {(product.estimatedCost || 0).toLocaleString()}</span>
                            {product.actualCost !== undefined && (
                              <span className="text-green-600 ml-2">Act: Rs {product.actualCost.toLocaleString()}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingProductIndex(index)
                            setShowProductEditor(true)
                          }}
                          className="p-1 text-gray-400 hover:text-green-600 hover:bg-green-100 rounded transition-colors"
                          title="Edit product"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="m18 2 4 4-14 14H4v-4L18 2z"></path>
                          </svg>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const updatedProducts = formData.products?.filter((_, i) => i !== index) || []
                            setFormData({ ...formData, products: updatedProducts })
                          }}
                          className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-100 rounded transition-colors"
                          title="Remove product"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3,6 5,6 21,6"></polyline>
                            <path d="m19,6v14a2,2 0 0,1-2,2H7a2,2 0 0,1-2-2V6m3,0V4a2,2 0 0,1,2-2h4a2,2 0 0,1,2,2v2"></path>
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Resources */}
                  {formData.resources?.map((resource, index) => (
                    <div key={`resource-${index}`} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center space-x-3">
                        <span className="text-lg">{resource.category === 'labor' ? '👷' : '🚜'}</span>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{resource.resourceName}</div>
                          <div className="text-sm text-gray-600">
                            {resource.hours} {resource.unit}
                            <br />
                            <span className="text-blue-600">Est: Rs {(resource.estimatedCost || 0).toLocaleString()}</span>
                            {resource.actualCost !== undefined && (
                              <span className="text-green-600 ml-2">Act: Rs {resource.actualCost.toLocaleString()}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingResourceIndex(index)
                            setShowResourceEditor(true)
                          }}
                          className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-100 rounded transition-colors"
                          title="Edit resource"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="m18 2 4 4-14 14H4v-4L18 2z"></path>
                          </svg>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const updatedResources = formData.resources?.filter((_, i) => i !== index) || []
                            setFormData({ ...formData, resources: updatedResources })
                          }}
                          className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-100 rounded transition-colors"
                          title="Remove resource"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3,6 5,6 21,6"></polyline>
                            <path d="m19,6v14a2,2 0 0,1-2,2H7a2,2 0 0,1-2-2V6m3,0V4a2,2 0 0,1,2-2h4a2,2 0 0,1,2,2v2"></path>
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                  <div className="text-gray-500 mb-2">No products or resources added yet</div>
                  <div className="text-sm text-gray-400">Click the buttons above to add products and resources</div>
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
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Additional notes or comments..."
              />
            </div>

            {/* Attachments */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Attachments
              </label>
              <AttachmentUploader
                onFilesChange={setAttachmentFiles}
                maxFiles={10}
                maxSize={50}
                className="mt-2"
              />
            </div>
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

      {/* Product Selector Modal */}
      {showProductSelector && (
        <ProductSelector
          onSelect={handleProductSelect}
          onClose={() => {
            setShowProductSelector(false)
            setEditingProductIndex(null)
          }}
          blocArea={blocArea}
          existingProduct={editingProductIndex !== null && formData.products?.[editingProductIndex] ?
            formData.products[editingProductIndex] : undefined}
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
    estimatedCost: number
    actualCost?: number
  }
  blocArea: number
  onSave: (product: {
    productId: string
    productName: string
    quantity: number
    rate: number
    unit: string
    estimatedCost: number
    actualCost?: number
  }) => void
  onClose: () => void
}) {
  const [quantity, setQuantity] = useState(product.quantity)
  const [rate, setRate] = useState(product.rate)
  const [actualCost, setActualCost] = useState(product.actualCost || 0)
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
      estimatedCost: product.estimatedCost, // Keep the original estimated cost
      actualCost: actualCost > 0 ? actualCost : undefined
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
            title="Close"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rate ({product.unit}/ha) *
              </label>
              <input
                type="number"
                min="0"
                step="0.1"
                value={rate === 0 ? '' : rate}
                onChange={(e) => handleRateChange(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Total Quantity ({product.unit}) *
              </label>
              <input
                type="number"
                min="0"
                step="0.1"
                value={quantity === 0 ? '' : quantity}
                onChange={(e) => handleQuantityChange(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="0"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Actual Cost (Rs) <span className="text-gray-500 text-xs">Optional</span>
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={actualCost || ''}
              onChange={(e) => setActualCost(e.target.value === '' ? 0 : parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Enter actual cost"
            />
          </div>

          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="text-sm text-gray-600">
              <div>Estimated Cost: Rs {product.estimatedCost.toLocaleString()}</div>
              <div>Bloc Area: {blocArea} ha</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={quantity <= 0 || rate <= 0}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  )
}
