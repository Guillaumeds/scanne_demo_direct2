'use client'

import { useState, useEffect } from 'react'

interface Equipment {
  id: string
  name: string
  category: string
  icon: string
  defaultRate: number
  unit: string
  description?: string
}

interface EquipmentFormProps {
  selectedEquipment: Equipment
  existingData?: {
    id: string
    name: string
    estimatedDuration: number
    costPerHour: number
    totalEstimatedCost: number
  } | null
  onSave: (equipment: {
    name: string
    estimatedDuration: number
    costPerHour: number
    totalEstimatedCost: number
  }) => void
  onCancel: () => void
  onBack: () => void
}

export default function EquipmentForm({ selectedEquipment, existingData, onSave, onCancel, onBack }: EquipmentFormProps) {
  const [estimatedDuration, setEstimatedDuration] = useState<number>(0)
  const [costPerHour, setCostPerHour] = useState<number>(selectedEquipment.defaultRate)
  const [totalEstimatedCost, setTotalEstimatedCost] = useState<number>(0)

  // Pre-populate fields when editing existing equipment
  useEffect(() => {
    if (existingData) {
      setEstimatedDuration(existingData.estimatedDuration)
      setCostPerHour(existingData.costPerHour)
      setTotalEstimatedCost(existingData.totalEstimatedCost)
    } else {
      setCostPerHour(selectedEquipment.defaultRate)
    }
  }, [existingData, selectedEquipment])

  // Auto-calculate total cost when duration or cost per hour changes
  useEffect(() => {
    const total = estimatedDuration * costPerHour
    setTotalEstimatedCost(total)
  }, [estimatedDuration, costPerHour])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (estimatedDuration <= 0) {
      alert('Please enter estimated duration')
      return
    }

    if (costPerHour <= 0) {
      alert('Please enter cost per hour')
      return
    }

    onSave({
      name: selectedEquipment.name,
      estimatedDuration,
      costPerHour,
      totalEstimatedCost
    })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Configure Equipment</h2>
              <p className="text-sm text-gray-600 mt-1">Set duration and cost details</p>
            </div>
            <button
              type="button"
              onClick={onCancel}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
              title="Close"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-2xl mx-auto">
            <button
              type="button"
              onClick={onBack}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 mb-6"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="15,18 9,12 15,6"></polyline>
              </svg>
              <span>Back to equipment</span>
            </button>

            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <div className="flex items-start space-x-4 mb-6">
                <span className="text-4xl">{selectedEquipment.icon}</span>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{selectedEquipment.name}</h3>
                  <p className="text-gray-600">{selectedEquipment.description}</p>
                </div>
              </div>

              {/* Calculation Equation */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="text-sm text-gray-600 mb-2 font-medium">Calculation:</div>
                <div className="flex items-center space-x-2 text-sm">
                  <span className="px-2 py-1 bg-white rounded border">Duration: {estimatedDuration.toFixed(1)} hours</span>
                  <span className="text-gray-500">×</span>
                  <span className="px-2 py-1 bg-blue-100 rounded border border-blue-300">Rs {costPerHour.toFixed(0)}/hour</span>
                  <span className="text-gray-500">=</span>
                  <span className="px-2 py-1 bg-green-100 rounded border border-green-300 font-medium">
                    Rs {totalEstimatedCost.toFixed(0)}
                  </span>
                </div>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Estimated Duration (hours) *
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      value={estimatedDuration === 0 ? '' : estimatedDuration}
                      onChange={(e) => setEstimatedDuration(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="0"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cost Per Hour (Rs) *
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={costPerHour === 0 ? '' : costPerHour}
                      onChange={(e) => setCostPerHour(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="0"
                      required
                    />
                  </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    {existingData ? 'Update Equipment' : 'Add Equipment'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
