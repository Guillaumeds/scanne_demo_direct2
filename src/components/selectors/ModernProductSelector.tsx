'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { ArrowLeft, X, Search, Calculator, Package } from 'lucide-react'
import { useProducts } from '@/hooks/useConfigurationData'
import { Product, PRODUCT_CATEGORIES } from '@/types/products'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { fuzzySearch } from '@/utils/fuzzySearch'
import ModernCardSelector, { CardOption } from './ModernCardSelector'

export interface SelectedProduct {
  product: Product
  quantity: number
  rate: number
  estimatedCost: number
}

interface ModernProductSelectorProps {
  onSelect: (selectedProduct: SelectedProduct) => void
  onClose: () => void
  blocArea: number // hectares
  existingProduct?: SelectedProduct
  title?: string
  subtitle?: string
}

export default function ModernProductSelector({
  onSelect,
  onClose,
  blocArea,
  existingProduct,
  title = "Select Product",
  subtitle = "Choose products for this operation"
}: ModernProductSelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [quantity, setQuantity] = useState<number>(0)
  const [rate, setRate] = useState<number>(0)

  const [isUpdatingFromRate, setIsUpdatingFromRate] = useState(false)

  // Fetch products using TanStack Query
  const { data: products, isLoading, error } = useProducts()

  // Convert categories to card options
  const categoryOptions: CardOption[] = PRODUCT_CATEGORIES.map(category => {
    const productCount = (products || []).filter(p => p.subcategory === category.id).length
    return {
      id: category.id,
      name: category.name,
      description: `${productCount} products available`,
      badge: `${productCount} items`,
      color: category.color?.replace('text-', 'bg-').replace('-700', '-100') || 'bg-slate-100',
      icon: typeof category.icon === 'function' ? category.icon : Package
    }
  })

  // Filter products by category and fuzzy search
  const categoryFilteredProducts = (products || []).filter(product =>
    !selectedCategory || product.subcategory === selectedCategory
  )

  const filteredProducts = searchTerm
    ? fuzzySearch(categoryFilteredProducts, searchTerm, {
        keys: ['name', 'description', 'category', 'brand', 'composition'],
        threshold: 0.2
      })
    : categoryFilteredProducts



  // Pre-populate fields when editing existing product
  useEffect(() => {
    if (existingProduct && products && products.length > 0) {
      const product = products.find(p => p.id === existingProduct.product.id)
      if (product) {
        setSelectedProduct(product as any)
        setQuantity(existingProduct.quantity)
        setRate(existingProduct.rate)

      }
    }
  }, [existingProduct, products])

  const handleCategorySelect = (value: string | string[]) => {
    const categoryId = Array.isArray(value) ? value[0] : value
    if (!categoryId) return
    setSelectedCategory(categoryId)
  }

  const handleProductSelect = (value: string | string[]) => {
    const productId = Array.isArray(value) ? value[0] : value
    if (!productId) return
    const product = (products || []).find(p => p.id === productId)
    if (product) {
      setSelectedProduct(product as any)
      const defaultRate = (product as any).defaultRate || 0
      const calculatedQuantity = Math.round((defaultRate * blocArea) * 10) / 10
      setRate(Math.round(defaultRate * 10) / 10)
      setQuantity(calculatedQuantity)
    }
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
      const unitCost = selectedProduct.cost || selectedProduct.cost_per_unit || 0
      const estimatedCost = unitCost * quantity
      onSelect({
        product: selectedProduct,
        quantity,
        rate,
        estimatedCost
      })
      onClose()
    }
  }

  const handleBack = () => {
    if (selectedProduct) {
      setSelectedProduct(null)
    } else if (selectedCategory) {
      setSelectedCategory('')
    }
  }

  const unitCost = selectedProduct?.cost || selectedProduct?.cost_per_unit || 0
  const estimatedCost = unitCost * quantity

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100">
          <div className="flex items-center gap-3">
            {(selectedCategory || selectedProduct) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
                className="p-2"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
            )}
            <div>
              <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
              <p className="text-slate-600 mt-1">{subtitle}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="p-2"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
                <p className="text-slate-600">Loading products...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center max-w-md">
                <div className="text-red-500 text-6xl mb-4">⚠️</div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Failed to Load Products</h3>
                <p className="text-slate-600 mb-4">{typeof error === 'string' ? error : 'Unknown error'}</p>
                <Button onClick={() => window.location.reload()}>
                  Reload Page
                </Button>
              </div>
            </div>
          ) : selectedProduct ? (
            /* Product Configuration */
            <ScrollArea className="h-[calc(90vh-80px)] p-6">
              <div className="max-w-2xl mx-auto space-y-6 pb-6">
                {/* Selected Product Info */}
                <Card className="border-l-4 border-l-emerald-500">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                        <span className="text-lg">
                          {PRODUCT_CATEGORIES.find(c => c.id === selectedProduct.category)?.icon || '📦'}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{selectedProduct.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {PRODUCT_CATEGORIES.find(c => c.id === selectedProduct.category)?.name}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>



                {/* Calculation Display */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Calculator className="w-5 h-5" />
                      Calculation
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Rate ({selectedProduct.unit}/ha) *
                        </label>
                        <Input
                          type="number"
                          min="0"
                          step="0.1"
                          value={rate === 0 ? '' : rate}
                          onChange={(e) => handleRateChange(parseFloat(e.target.value) || 0)}
                          placeholder="0"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Quantity ({selectedProduct.unit}) *
                        </label>
                        <Input
                          type="number"
                          min="0"
                          step="0.1"
                          value={quantity === 0 ? '' : quantity}
                          onChange={(e) => handleQuantityChange(parseFloat(e.target.value) || 0)}
                          placeholder="0"
                        />
                      </div>
                    </div>

                    {/* Visual Calculations */}
                    <div className="space-y-3 mt-6">
                      {/* Quantity Calculation */}
                      <div className="flex items-center justify-center gap-2 p-3 bg-slate-50 rounded-lg text-sm">
                        <Badge variant="outline">Rate: {rate.toFixed(1)} {selectedProduct.unit}/ha</Badge>
                        <span className="text-slate-500">×</span>
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          {blocArea.toFixed(2)} ha
                        </Badge>
                        <span className="text-slate-500">=</span>
                        <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
                          {quantity.toFixed(1)} {selectedProduct.unit}
                        </Badge>
                      </div>

                      {/* Cost Calculation */}
                      {(selectedProduct.cost || selectedProduct.cost_per_unit) && (
                        <div className="flex items-center justify-center gap-2 p-3 bg-blue-50 rounded-lg text-sm">
                          <Badge variant="outline" className="bg-emerald-100 text-emerald-700 border-emerald-200">
                            {quantity.toFixed(1)} {selectedProduct.unit}
                          </Badge>
                          <span className="text-slate-500">×</span>
                          <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                            Rs {unitCost}/{selectedProduct.unit}
                          </Badge>
                          <span className="text-slate-500">=</span>
                          <Badge className="bg-green-100 text-green-700 border-green-200 font-semibold">
                            Rs {estimatedCost.toLocaleString()}
                          </Badge>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </ScrollArea>
          ) : selectedCategory ? (
            /* Product Selection */
            <div className="flex-1 overflow-hidden flex flex-col">
              <div className="p-6 pb-4">
                <div className="flex items-center gap-3">
                  <Search className="w-5 h-5 text-slate-400" />
                  <Input
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>

              <ScrollArea className="h-[400px] px-6">
                <div className="pb-6">
                  <ModernCardSelector
                    options={filteredProducts.map((product) => {
                    const category = PRODUCT_CATEGORIES.find(c => c.id === (product as any).category)
                      return {
                        id: product.id,
                        name: product.name,
                        description: (product as any).description || `Default rate: ${(product as any).defaultRate || 0} ${product.unit}/ha`,
                        badge: category?.name.split(' ')[0] || product.category || undefined,
                        color: category?.color?.replace('text-', 'bg-').replace('-700', '-100') || 'bg-slate-100',
                        icon: typeof category?.icon === 'function' ? category.icon : Package,
                        cost: (product as any).cost,
                        unit: product.unit
                      }
                    })}
                    value=""
                    onChange={handleProductSelect}
                    layout="grid"
                    columns={2}
                  />
                </div>
                {filteredProducts.length === 0 && (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Products Found</h3>
                    <p className="text-muted-foreground">
                      {searchTerm
                        ? 'Try adjusting your search term.'
                        : 'No products available in this category.'
                      }
                    </p>
                  </div>
                )}
              </ScrollArea>
            </div>
          ) : (
            /* Category Selection */
            <div className="flex-1 overflow-hidden flex flex-col">
              {/* Removed section header and description here */}
              <ScrollArea className="h-[400px] px-6">
                <div className="pb-6">
                  <ModernCardSelector
                    options={categoryOptions}
                    value=""
                    onChange={handleCategorySelect}
                    layout="grid"
                    columns={2}
                  />
                </div>
              </ScrollArea>
            </div>
          )}
        </div>

        {/* Footer */}
        {selectedProduct && (
          <div className="border-t border-slate-200 p-6 bg-slate-50">
            <div className="flex items-center justify-between">
              <div className="text-sm text-slate-600">
                Total: Rs {estimatedCost.toLocaleString()}
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setSelectedProduct(null)}>
                  Back
                </Button>
                <Button
                  onClick={handleConfirm}
                  disabled={!quantity || !rate}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  Confirm Product
                </Button>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}
