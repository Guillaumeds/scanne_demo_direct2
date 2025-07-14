'use client'

import { useState, useEffect } from 'react'
import { Product, ProductCategory, PRODUCT_CATEGORIES } from '@/types/products'
import { useProducts } from '@/hooks/useLocalStorageData'

interface ProductSelectorProps {
  onSelect: (product: Product, quantity: number, rate: number, actualCost?: number) => void
  onClose: () => void
  blocArea: number // hectares
  existingProduct?: {
    productId: string
    productName: string
    quantity: number
    rate: number
    unit: string
    estimatedCost: number
    actualCost?: number
  }
}

export default function ProductSelector({ onSelect, onClose, blocArea, existingProduct }: ProductSelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [quantity, setQuantity] = useState<number>(0)
  const [rate, setRate] = useState<number>(0)
  const [isUpdatingFromRate, setIsUpdatingFromRate] = useState(false)

  // Use localStorage for products data
  const { data: products, loading, error } = useProducts()

  const filteredProducts = (products || []).filter(product => {
    const matchesCategory = !selectedCategory || product.category === selectedCategory
    const matchesSearch = !searchTerm ||
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch
  })

  // Pre-populate fields when editing existing product
  useEffect(() => {
    if (existingProduct && products && products.length > 0) {
      const product = products.find(p => p.id === existingProduct.productId)
      if (product) {
        setSelectedProduct(product)
        setQuantity(existingProduct.quantity)
        setRate(existingProduct.rate)
      }
    }
  }, [existingProduct, products])

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product)
    const defaultRate = product.defaultRate || 0
    const calculatedQuantity = Math.round((defaultRate * blocArea) * 10) / 10
    setRate(Math.round(defaultRate * 10) / 10)
    setQuantity(calculatedQuantity)
  }

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

  const handleConfirm = () => {
    if (selectedProduct && quantity > 0 && rate > 0) {
      onSelect(selectedProduct, quantity, rate)
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Select Product</h2>
            <p className="text-gray-600 mt-1">Choose from our fertilizer catalog</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Close"
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
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setSelectedCategory(null)}
                className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                  selectedCategory === null
                    ? 'bg-green-100 text-green-800 border border-green-200'
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-lg">🌟</span>
                  <div>
                    <div className="font-medium">All Categories</div>
                    <div className="text-xs text-gray-500">{products?.length || 0} products</div>
                  </div>
                </div>
              </button>

              {PRODUCT_CATEGORIES.map(category => {
                const productCount = products?.filter(p => p.category === category.id).length || 0
                return (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                      selectedCategory === category.id
                        ? 'bg-green-100 text-green-800 border border-green-200'
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-lg">{category.icon}</span>
                      <div>
                        <div className="font-medium text-sm">{category.name}</div>
                        <div className="text-xs text-gray-500">{productCount} products</div>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1 p-6 overflow-y-auto">
            {!selectedProduct ? (
              <>
                {/* Loading State */}
                {loading && (
                  <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                      <p className="text-gray-600">Loading products...</p>
                    </div>
                  </div>
                )}

                {/* Error State */}
                {error && !loading && (
                  <div className="flex items-center justify-center h-64">
                    <div className="text-center max-w-md">
                      <div className="text-red-500 text-6xl mb-4">⚠️</div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to Load Products</h3>
                      <p className="text-gray-600 mb-4">{typeof error === 'string' ? error : (error as any)?.message || 'Unknown error'}</p>
                      <button
                        type="button"
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        Reload Page
                      </button>
                    </div>
                  </div>
                )}

                {/* Products Grid */}
                {!loading && !error && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredProducts.length === 0 ? (
                      <div className="col-span-full text-center py-12">
                        <div className="text-gray-400 text-6xl mb-4">📦</div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Products Found</h3>
                        <p className="text-gray-600">
                          {searchTerm || selectedCategory
                            ? 'Try adjusting your search or category filter.'
                            : 'No products are available in the database.'
                          }
                        </p>
                      </div>
                    ) : (
                      filteredProducts.map(product => {
                  const category = PRODUCT_CATEGORIES.find(c => c.id === product.category)
                  return (
                    <div
                      key={product.id}
                      onClick={() => handleProductSelect(product)}
                      className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-lg hover:border-green-300 transition-all duration-200 cursor-pointer group"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <span className="text-2xl">{category?.icon}</span>
                        <span className={`px-2 py-1 text-xs rounded-full ${category?.color}`}>
                          {category?.name.split(' ')[0]}
                        </span>
                      </div>
                      
                      <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-green-700 transition-colors">
                        {product.name}
                      </h3>
                      
                      <div className="space-y-1 text-sm text-gray-600">
                        <div className="flex justify-between">
                          <span>Default Rate:</span>
                          <span className="font-medium">{product.defaultRate} {product.unit}/ha</span>
                        </div>
                        {product.cost && (
                          <div className="flex justify-between">
                            <span>Cost:</span>
                            <span className="font-medium text-green-600">Rs {product.cost}/{product.unit}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">Click to select</span>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400 group-hover:text-green-500 transition-colors">
                            <polyline points="9,18 15,12 9,6"></polyline>
                          </svg>
                        </div>
                      </div>
                        </div>
                      )
                    })
                    )}
                  </div>
                )}
              </>
            ) : (
              /* Product Configuration */
              <div className="max-w-2xl mx-auto">
                <button
                  type="button"
                  onClick={() => setSelectedProduct(null)}
                  className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 mb-6"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="15,18 9,12 15,6"></polyline>
                  </svg>
                  <span>Back to products</span>
                </button>

                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <div className="flex items-start space-x-4 mb-6">
                    <span className="text-4xl">{PRODUCT_CATEGORIES.find(c => c.id === selectedProduct.category)?.icon}</span>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{selectedProduct.name}</h3>
                      <p className="text-gray-600">{PRODUCT_CATEGORIES.find(c => c.id === selectedProduct.category)?.name}</p>
                    </div>
                  </div>

                  {/* Bloc Area Display */}
                  <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="text-sm text-blue-800">
                      <span className="font-medium">Bloc Area:</span> {blocArea.toFixed(2)} ha
                    </div>
                  </div>

                  {/* Calculation Equation */}
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="text-sm text-gray-600 mb-2 font-medium">Calculation:</div>
                    <div className="flex items-center space-x-2 text-sm">
                      <span className="px-2 py-1 bg-white rounded border">Rate: {rate.toFixed(1)} {selectedProduct.unit}/ha</span>
                      <span className="text-gray-500">×</span>
                      <span className="px-2 py-1 bg-blue-100 rounded border border-blue-300">{blocArea.toFixed(2)} ha</span>
                      <span className="text-gray-500">=</span>
                      <span className="px-2 py-1 bg-green-100 rounded border border-green-300 font-medium">
                        {quantity.toFixed(1)} {selectedProduct.unit}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Rate ({selectedProduct.unit}/ha) *
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
                        Quantity ({selectedProduct.unit}) *
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

                  {selectedProduct.cost && (
                    <div className="mt-4 p-4 bg-green-50 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Estimated Cost:</span>
                        <span className="text-lg font-bold text-green-700">
                          Rs {(quantity * selectedProduct.cost).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-end space-x-3 mt-6">
                    <button
                      type="button"
                      onClick={() => setSelectedProduct(null)}
                      className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirm}
                      disabled={!quantity || !rate}
                      className="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                    >
                      Add Product
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
