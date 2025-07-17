'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Search, Package, DollarSign } from 'lucide-react'

// Mock data for testing
const mockProducts = [
  { id: 1, name: 'Nitrogen Fertilizer 28-0-0', category: 'Nitrogen', price: 45.99, unit: 'kg', description: 'High quality nitrogen fertilizer for crop growth' },
  { id: 2, name: 'Phosphorus Boost 0-46-0', category: 'Phosphorus', price: 52.50, unit: 'kg', description: 'Essential phosphorus for root development' },
  { id: 3, name: 'Potassium Supreme 0-0-60', category: 'Potassium', price: 38.75, unit: 'kg', description: 'Premium potassium for plant health' },
  { id: 4, name: 'NPK Complete 15-15-15', category: 'Compound', price: 42.00, unit: 'kg', description: 'Balanced NPK fertilizer for all crops' },
  { id: 5, name: 'Organic Compost Mix', category: 'Organic', price: 25.99, unit: 'kg', description: 'Natural organic matter for soil health' },
  { id: 6, name: 'Calcium Carbonate', category: 'Calcium', price: 18.50, unit: 'kg', description: 'Soil pH adjustment and calcium supply' },
  { id: 7, name: 'Magnesium Sulfate', category: 'Magnesium', price: 22.75, unit: 'kg', description: 'Essential magnesium for chlorophyll production' },
  { id: 8, name: 'Micronutrient Blend', category: 'Micronutrients', price: 65.00, unit: 'kg', description: 'Complete micronutrient package' },
  { id: 9, name: 'Slow Release 20-10-10', category: 'Compound', price: 58.25, unit: 'kg', description: 'Long-lasting slow release formula' },
  { id: 10, name: 'Liquid Nitrogen 32-0-0', category: 'Nitrogen', price: 35.99, unit: 'L', description: 'Fast-acting liquid nitrogen solution' },
  { id: 11, name: 'Bone Meal Organic', category: 'Organic', price: 28.50, unit: 'kg', description: 'Natural phosphorus from bone meal' },
  { id: 12, name: 'Sulfur Granules', category: 'Sulfur', price: 19.99, unit: 'kg', description: 'Pure sulfur for soil conditioning' },
  { id: 13, name: 'Iron Chelate', category: 'Micronutrients', price: 45.75, unit: 'kg', description: 'Highly available iron supplement' },
  { id: 14, name: 'Zinc Sulfate', category: 'Micronutrients', price: 32.25, unit: 'kg', description: 'Essential zinc for enzyme function' },
  { id: 15, name: 'Humic Acid Concentrate', category: 'Organic', price: 75.00, unit: 'L', description: 'Soil structure and nutrient uptake enhancer' },
]

interface Product {
  id: number
  name: string
  category: string
  price: number
  unit: string
  description: string
}

interface TestProductSelectorProps {
  onSelect?: (product: Product) => void
}

export default function TestProductSelector({ onSelect }: TestProductSelectorProps) {
  const [open, setOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  console.log('TestProductSelector render, open state:', open)

  const filteredProducts = mockProducts.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product)
    onSelect?.(product)
    setOpen(false)
  }

  return (
    <div className="w-full max-w-md">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => {
              console.log('Button clicked, current open state:', open)
              setOpen(true)
            }}
          >
            <Package className="mr-2 h-4 w-4" />
            {selectedProduct ? selectedProduct.name : 'Select Product...'}
          </Button>
        </DialogTrigger>
        
        <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Select Product</DialogTitle>
          </DialogHeader>

          {/* Fixed Search Section */}
          <div className="flex items-center space-x-2 px-1 mb-4">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
          </div>

          {/* Scrollable Content Area - EXPLICIT HEIGHT IS KEY */}
          <ScrollArea className="h-[400px] pr-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-1">
              {filteredProducts.map((product) => (
                <Card 
                  key={product.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => handleProductSelect(product)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-sm font-medium leading-tight">
                        {product.name}
                      </CardTitle>
                      <Badge variant="secondary" className="ml-2 text-xs">
                        {product.category}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                      {product.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm font-semibold text-emerald-600">
                        <DollarSign className="h-3 w-3 mr-1" />
                        {product.price.toFixed(2)}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        per {product.unit}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {filteredProducts.length === 0 && (
              <div className="text-center py-8">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Products Found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search term.
                </p>
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  )
}
