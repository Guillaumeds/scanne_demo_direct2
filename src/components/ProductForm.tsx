'use client'

import { useState, useEffect } from 'react'

interface Product {
  id: string
  name: string
  category: string
  icon: string
  defaultRate: number
  unit: string
  description?: string
}

interface ProductFormProps {
  product: Product
  editingProduct?: {
    id: string
    productName: string
    rate: number
    quantity: number
    unit: string
    estimatedCost: number
  } | null
  onSave: (product: {
    productName: string
    rate: number
    quantity: number
    unit: string
    estimatedCost: number
  }) => void
  onCancel: () => void
  onBack: () => void
}

export default function ProductForm({ product, editingProduct, onSave, onCancel, onBack }: ProductFormProps) {
  const [rate, setRate] = useState<number>(product.defaultRate)
  const [quantity, setQuantity] = useState<number>(0)
  const [costPerUnit, setCostPerUnit] = useState<number>(100) // Default cost per unit
  const [estimatedCost, setEstimatedCost] = useState<number>(0)

  // Pre-populate fields when editing existing product
  useEffect(() => {
    if (editingProduct) {
      setRate(editingProduct.rate)
      setQuantity(editingProduct.quantity)
      setEstimatedCost(editingProduct.estimatedCost)
      // Calculate cost per unit from existing data
      if (editingProduct.quantity > 0) {
        setCostPerUnit(editingProduct.estimatedCost / editingProduct.quantity)
      }
    } else {
      setRate(product.defaultRate)
    }
  }, [editingProduct, product])

  // Auto-calculate estimated cost when quantity or cost per unit changes
  useEffect(() => {
    const total = quantity * costPerUnit
    setEstimatedCost(total)
  }, [quantity, costPerUnit])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (rate <= 0) {
      alert('Please enter rate per hectare')
      return
    }

    if (quantity <= 0) {
      alert('Please enter quantity')
      return
    }

    if (costPerUnit <= 0) {
      alert('Please enter cost per unit')
      return
    }

    onSave({
      productName: product.name,
      rate,
      quantity,
      unit: product.unit,
      estimatedCost
    })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {editingProduct ? 'Edit Product' : 'Configure Product'}
              </h2>
              <p className="text-gray-600 mt-1">Set rate, quantity and cost details</p>
            </div>
            <button
              type="button"
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Close"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Product Info */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <div className="flex items-start space-x-4 mb-6">
                <span className="text-4xl">{product.icon}</span>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{product.name}</h3>
                  <p className="text-gray-600">{product.description}</p>
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rate per Hectare ({product.unit}/ha) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={rate || ''}
                    onChange={(e) => setRate(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                    required
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
                    value={quantity || ''}
                    onChange={(e) => setQuantity(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cost per {product.unit} (Rs) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={costPerUnit || ''}
                    onChange={(e) => setCostPerUnit(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estimated Total Cost (Rs)
                  </label>
                  <div className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-700">
                    Rs {estimatedCost.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
            <button
              type="button"
              onClick={onBack}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              ← Back to Selection
            </button>
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                {editingProduct ? 'Update Product' : 'Add Product'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
