'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import TestProductSelector from './TestProductSelector'
import { Calculator, Save, Trash2 } from 'lucide-react'

interface Product {
  id: number
  name: string
  category: string
  price: number
  unit: string
  description: string
}

interface FormData {
  operationName: string
  area: number
  rate: number
  notes: string
  selectedProduct: Product | null
}

export default function TestForm() {
  const [formData, setFormData] = useState<FormData>({
    operationName: '',
    area: 0,
    rate: 0,
    notes: '',
    selectedProduct: null
  })

  const totalQuantity = formData.area * formData.rate
  const totalCost = formData.selectedProduct ? totalQuantity * formData.selectedProduct.price : 0

  const handleProductSelect = (product: Product) => {
    setFormData(prev => ({ ...prev, selectedProduct: product }))
  }

  const handleInputChange = (field: keyof FormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Form submitted:', formData)
    alert('Form submitted! Check console for data.')
  }

  const handleReset = () => {
    setFormData({
      operationName: '',
      area: 0,
      rate: 0,
      notes: '',
      selectedProduct: null
    })
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Test Product Selection Form
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Operation Name */}
            <div className="space-y-2">
              <Label htmlFor="operation-name">Operation Name</Label>
              <Input
                id="operation-name"
                placeholder="e.g., Spring Fertilizer Application"
                value={formData.operationName}
                onChange={(e) => handleInputChange('operationName', e.target.value)}
              />
            </div>

            {/* Product Selection */}
            <div className="space-y-2">
              <Label>Product Selection</Label>
              <TestProductSelector onSelect={handleProductSelect} />
              {formData.selectedProduct && (
                <div className="mt-2 p-3 bg-muted rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{formData.selectedProduct.name}</span>
                    <Badge variant="secondary">{formData.selectedProduct.category}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {formData.selectedProduct.description}
                  </p>
                  <div className="text-sm font-semibold text-emerald-600">
                    ${formData.selectedProduct.price.toFixed(2)} per {formData.selectedProduct.unit}
                  </div>
                </div>
              )}
            </div>

            {/* Area and Rate */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="area">Area (hectares)</Label>
                <Input
                  id="area"
                  type="number"
                  step="0.1"
                  min="0"
                  placeholder="0.0"
                  value={formData.area || ''}
                  onChange={(e) => handleInputChange('area', parseFloat(e.target.value) || 0)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rate">Application Rate ({formData.selectedProduct?.unit || 'units'}/ha)</Label>
                <Input
                  id="rate"
                  type="number"
                  step="0.1"
                  min="0"
                  placeholder="0.0"
                  value={formData.rate || ''}
                  onChange={(e) => handleInputChange('rate', parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>

            {/* Calculations */}
            {(formData.area > 0 || formData.rate > 0) && (
              <Card className="bg-emerald-50 border-emerald-200">
                <CardContent className="pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Total Quantity:</span>
                      <div className="font-semibold">
                        {totalQuantity.toFixed(2)} {formData.selectedProduct?.unit || 'units'}
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Unit Cost:</span>
                      <div className="font-semibold">
                        ${formData.selectedProduct?.price.toFixed(2) || '0.00'}
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Total Cost:</span>
                      <div className="font-semibold text-emerald-600">
                        ${totalCost.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Additional notes about this operation..."
                rows={3}
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
              />
            </div>

            <Separator />

            {/* Actions */}
            <div className="flex gap-3">
              <Button type="submit" className="flex-1">
                <Save className="mr-2 h-4 w-4" />
                Save Operation
              </Button>
              <Button type="button" variant="outline" onClick={handleReset}>
                <Trash2 className="mr-2 h-4 w-4" />
                Reset
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
