'use client'

import React from 'react'
import { Package, Tractor, Users, Calculator } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { SelectedProduct } from '@/components/selectors/ModernProductSelector'
import { SelectedEquipment } from '@/components/selectors/ModernEquipmentSelector'
import { LabourTableEntry } from '@/components/selectors/LabourSelectionManager'

interface FinancialTotalsProps {
  products: SelectedProduct[]
  equipment: SelectedEquipment[]
  labour: LabourTableEntry[]
  className?: string
}

export default function FinancialTotals({
  products,
  equipment,
  labour,
  className = ""
}: FinancialTotalsProps) {
  
  // Calculate totals
  const productsCost = products.reduce((sum, p) => sum + (p.estimatedCost || 0), 0)
  const equipmentCost = equipment.reduce((sum, e) => sum + (e.totalEstimatedCost || 0), 0)
  const labourCost = labour.reduce((sum, l) => sum + (l.totalEstimatedCost || 0), 0)
  const totalCost = productsCost + equipmentCost + labourCost

  const formatCurrency = (amount: number) => {
    return `Rs ${amount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Calculator className="h-4 w-4 text-primary" />
          Cost Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 pb-3">
        {totalCost > 0 ? (
          <div className="space-y-2">
            {/* Single Row with All Items */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-4">
                {productsCost > 0 && (
                  <div className="flex items-center gap-1">
                    <Package className="h-3 w-3 text-blue-600" />
                    <span className="font-medium text-blue-700">{formatCurrency(productsCost)}</span>
                  </div>
                )}
                {equipmentCost > 0 && (
                  <div className="flex items-center gap-1">
                    <Tractor className="h-3 w-3 text-orange-600" />
                    <span className="font-medium text-orange-700">{formatCurrency(equipmentCost)}</span>
                  </div>
                )}
                {labourCost > 0 && (
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3 text-green-600" />
                    <span className="font-medium text-green-700">{formatCurrency(labourCost)}</span>
                  </div>
                )}
              </div>

              {/* Total on the right */}
              <div className="flex items-center gap-1">
                <span className="text-xs text-muted-foreground">Total:</span>
                <span className="font-bold text-primary">{formatCurrency(totalCost)}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-1 text-muted-foreground">
            <span className="text-xs">Rs</span>
            <p className="text-sm mt-1">No costs calculated yet</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
