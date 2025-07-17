'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Plus, X, Package, Calculator, AlertCircle, Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import ModernProductSelector, { SelectedProduct } from './ModernProductSelector'
import { Product } from '@/types/products'

interface ProductSelectionManagerProps {
  selectedProducts: SelectedProduct[]
  onProductsChange: (products: SelectedProduct[]) => void
  blocArea: number
  title?: string
  subtitle?: string
  maxProducts?: number
  isLoading?: boolean
  error?: string | null
}

export default function ProductSelectionManager({
  selectedProducts,
  onProductsChange,
  blocArea,
  title = "Products & Materials",
  subtitle = "Select products for this operation",
  maxProducts,
  isLoading = false,
  error = null
}: ProductSelectionManagerProps) {
  const [showSelector, setShowSelector] = useState(false)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)

  const handleAddProduct = () => {
    setEditingIndex(null)
    setShowSelector(true)
  }

  const handleEditProduct = (index: number) => {
    setEditingIndex(index)
    setShowSelector(true)
  }

  const handleProductSelect = (selectedProduct: SelectedProduct) => {
    if (editingIndex !== null) {
      // Edit existing product
      const updatedProducts = [...selectedProducts]
      updatedProducts[editingIndex] = selectedProduct
      onProductsChange(updatedProducts)
    } else {
      // Add new product
      onProductsChange([...selectedProducts, selectedProduct])
    }
    setShowSelector(false)
    setEditingIndex(null)
  }

  const handleRemoveProduct = (index: number) => {
    const updatedProducts = selectedProducts.filter((_, i) => i !== index)
    onProductsChange(updatedProducts)
  }

  const handleCloseSelector = () => {
    setShowSelector(false)
    setEditingIndex(null)
  }

  const canAddMore = !maxProducts || selectedProducts.length < maxProducts

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              {title}
            </CardTitle>
            {canAddMore && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddProduct}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4 mr-2" />
                )}
                Add Product
              </Button>
            )}
          </div>
          {subtitle && (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          )}
        </CardHeader>
        <CardContent>
          {/* Error Alert */}
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {error}
              </AlertDescription>
            </Alert>
          )}
          {selectedProducts.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed border-border rounded-lg">
              <Package className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">No products selected yet</p>
              {canAddMore && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleAddProduct}
                  className="mt-2"
                >
                  Select your first product
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence>
                {selectedProducts.map((selectedProduct, index) => (
                  <motion.div
                    key={`${selectedProduct.product.id}-${index}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="group relative"
                  >
                    <Card className="border-l-4 border-l-primary/20 hover:border-l-primary/40 transition-colors cursor-pointer"
                          onClick={() => handleEditProduct(index)}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-medium text-sm">{selectedProduct.product.name}</h4>
                              <Badge variant="secondary" className="text-xs">
                                {selectedProduct.product.category}
                              </Badge>
                            </div>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Calculator className="h-3 w-3" />
                                <span>Rate: {selectedProduct.rate} {selectedProduct.product.unit}/ha</span>
                              </div>
                              <div>
                                <span>Quantity: {selectedProduct.quantity.toFixed(1)} {selectedProduct.product.unit}</span>
                              </div>
                              <div>
                                <span>Area: {blocArea.toFixed(1)} ha</span>
                              </div>
                              <div className="font-medium text-primary">
                                <span>Cost: Rs {selectedProduct.estimatedCost.toFixed(2)}</span>
                              </div>
                            </div>
                          </div>
                          
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleRemoveProduct(index)
                            }}
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {canAddMore && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddProduct}
                  className="w-full border-dashed"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Another Product
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Product Selector Modal */}
      <AnimatePresence>
        {showSelector && (
          <ModernProductSelector
            onSelect={handleProductSelect}
            onClose={handleCloseSelector}
            blocArea={blocArea}
            existingProduct={editingIndex !== null ? selectedProducts[editingIndex] : undefined}
            title={editingIndex !== null ? "Edit Product" : "Select Product"}
            subtitle={editingIndex !== null ? "Update product details" : "Choose from our product catalog"}
          />
        )}
      </AnimatePresence>
    </>
  )
}
