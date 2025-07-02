'use client'

import { useState, useEffect } from 'react'
import { Resource, ResourceCategory, RESOURCE_CATEGORIES, RESOURCES } from '@/types/resources'

interface ResourceSelectorProps {
  onSelect: (resource: Resource, hours: number, actualCost?: number) => void
  onClose: () => void
  existingResource?: {
    resourceId: string
    resourceName: string
    hours: number
    unit: string
    estimatedCost: number
    actualCost?: number
    category: string
  }
}

export default function ResourceSelector({ onSelect, onClose, existingResource }: ResourceSelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState<ResourceCategory | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null)
  const [hours, setHours] = useState<number>(0)
  const [actualCost, setActualCost] = useState<number>(0)

  const filteredResources = RESOURCES.filter(resource => {
    const matchesCategory = !selectedCategory || resource.category === selectedCategory
    const matchesSearch = !searchTerm ||
      resource.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.description?.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch
  })

  // Pre-populate fields when editing existing resource
  useEffect(() => {
    if (existingResource) {
      const resource = RESOURCES.find(r => r.id === existingResource.resourceId)
      if (resource) {
        setSelectedResource(resource)
        setHours(existingResource.hours)
        setActualCost(existingResource.actualCost || existingResource.estimatedCost)
      }
    }
  }, [existingResource])

  const handleResourceSelect = (resource: Resource) => {
    setSelectedResource(resource)
    setHours(resource.defaultRate || 1)
    setActualCost(0)
  }

  const handleConfirm = () => {
    if (selectedResource && hours > 0) {
      onSelect(selectedResource, hours, actualCost || undefined)
      onClose()
    }
  }

  const estimatedCost = selectedResource && selectedResource.costPerUnit ? hours * selectedResource.costPerUnit : 0

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Select Resource</h2>
            <p className="text-gray-600 mt-1">Choose from our resource catalog</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Categories Sidebar */}
          <div className="w-80 bg-gray-50 border-r border-gray-200 p-4 overflow-y-auto">
            <div className="mb-4">
              <input
                type="text"
                placeholder="Search resources..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setSelectedCategory(null)}
                className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                  selectedCategory === null
                    ? 'bg-blue-100 text-blue-800 border border-blue-200'
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-lg">🌟</span>
                  <div>
                    <div className="font-medium">All Categories</div>
                    <div className="text-xs text-gray-500">{RESOURCES.length} resources</div>
                  </div>
                </div>
              </button>

              {RESOURCE_CATEGORIES.map(category => {
                const resourceCount = RESOURCES.filter(r => r.category === category.id).length
                return (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                      selectedCategory === category.id
                        ? 'bg-blue-100 text-blue-800 border border-blue-200'
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-lg">{category.icon}</span>
                      <div>
                        <div className="font-medium text-sm">{category.name}</div>
                        <div className="text-xs text-gray-500">{resourceCount} resources</div>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Resources Grid */}
          <div className="flex-1 p-6 overflow-y-auto">
            {!selectedResource ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredResources.map(resource => {
                  const category = RESOURCE_CATEGORIES.find(c => c.id === resource.category)
                  return (
                    <div
                      key={resource.id}
                      onClick={() => handleResourceSelect(resource)}
                      className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-lg hover:border-blue-300 transition-all duration-200 cursor-pointer group"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <span className="text-2xl">{category?.icon}</span>
                        <span className={`px-2 py-1 text-xs rounded-full ${category?.color}`}>
                          {category?.name.split(' ')[0]}
                        </span>
                      </div>
                      
                      <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-blue-700 transition-colors">
                        {resource.name}
                      </h3>
                      
                      <div className="space-y-1 text-sm text-gray-600">
                        {resource.skillLevel && (
                          <div className="flex justify-between">
                            <span>Skill Level:</span>
                            <span className="font-medium">{resource.skillLevel}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span>Default Rate:</span>
                          <span className="font-medium">{resource.defaultRate} {resource.unit}</span>
                        </div>
                        {resource.costPerUnit && (
                          <div className="flex justify-between">
                            <span>Cost:</span>
                            <span className="font-medium text-blue-600">Rs {resource.costPerUnit}/{resource.unit}</span>
                          </div>
                        )}
                        {resource.overtimeMultiplier && (
                          <div className="flex justify-between">
                            <span>Overtime:</span>
                            <span className="font-medium text-orange-600">{resource.overtimeMultiplier}x rate</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">Click to select</span>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400 group-hover:text-blue-500 transition-colors">
                            <polyline points="9,18 15,12 9,6"></polyline>
                          </svg>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              /* Resource Configuration */
              <div className="max-w-2xl mx-auto">
                <button
                  type="button"
                  onClick={() => setSelectedResource(null)}
                  className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 mb-6"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="15,18 9,12 15,6"></polyline>
                  </svg>
                  <span>Back to resources</span>
                </button>

                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <div className="flex items-start space-x-4 mb-6">
                    <span className="text-4xl">{RESOURCE_CATEGORIES.find(c => c.id === selectedResource.category)?.icon}</span>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{selectedResource.name}</h3>
                      <p className="text-gray-600">{RESOURCE_CATEGORIES.find(c => c.id === selectedResource.category)?.name}</p>
                      {selectedResource.skillLevel && (
                        <p className="text-sm text-blue-600 mt-1">Skill Level: {selectedResource.skillLevel}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Hours Required *
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.5"
                        value={hours}
                        onChange={(e) => setHours(parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter actual cost"
                      />
                    </div>
                  </div>

                  {selectedResource.costPerUnit && (
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Estimated Cost:</span>
                        <span className="text-lg font-bold text-blue-700">
                          Rs {estimatedCost.toLocaleString()}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {hours} hours × Rs {selectedResource.costPerUnit}/{selectedResource.unit}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-end space-x-3 mt-6">
                    <button
                      type="button"
                      onClick={() => setSelectedResource(null)}
                      className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirm}
                      disabled={!hours}
                      className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                    >
                      Add Resource
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
