'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Plus, X, Tractor, Clock, DollarSign, AlertCircle, Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import ModernEquipmentSelector, { SelectedEquipment } from './ModernEquipmentSelector'
import { Resource } from '@/types/resources'

interface EquipmentSelectionManagerProps {
  selectedEquipment: SelectedEquipment[]
  onEquipmentChange: (equipment: SelectedEquipment[]) => void
  blocArea: number
  title?: string
  subtitle?: string
  maxEquipment?: number
  isLoading?: boolean
  error?: string | null
}

export default function EquipmentSelectionManager({
  selectedEquipment,
  onEquipmentChange,
  blocArea,
  title = "Equipment & Machinery",
  subtitle = "Select equipment for this operation",
  maxEquipment,
  isLoading = false,
  error = null
}: EquipmentSelectionManagerProps) {
  const [showSelector, setShowSelector] = useState(false)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)

  const handleAddEquipment = () => {
    setEditingIndex(null)
    setShowSelector(true)
  }

  const handleEditEquipment = (index: number) => {
    setEditingIndex(index)
    setShowSelector(true)
  }

  const handleEquipmentSelect = (selectedEquip: SelectedEquipment) => {
    if (editingIndex !== null) {
      // Edit existing equipment
      const updatedEquipment = [...selectedEquipment]
      updatedEquipment[editingIndex] = selectedEquip
      onEquipmentChange(updatedEquipment)
    } else {
      // Add new equipment
      onEquipmentChange([...selectedEquipment, selectedEquip])
    }
    setShowSelector(false)
    setEditingIndex(null)
  }

  const handleRemoveEquipment = (index: number) => {
    const updatedEquipment = selectedEquipment.filter((_, i) => i !== index)
    onEquipmentChange(updatedEquipment)
  }

  const handleCloseSelector = () => {
    setShowSelector(false)
    setEditingIndex(null)
  }

  const canAddMore = !maxEquipment || selectedEquipment.length < maxEquipment

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Tractor className="h-5 w-5 text-primary" />
              {title}
            </CardTitle>
            {canAddMore && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddEquipment}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4 mr-2" />
                )}
                Add Equipment
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
          {selectedEquipment.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed border-border rounded-lg">
              <Tractor className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">No equipment selected yet</p>
              {canAddMore && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleAddEquipment}
                  className="mt-2"
                >
                  Select your first equipment
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence>
                {selectedEquipment.map((selectedEquip, index) => (
                  <motion.div
                    key={`${selectedEquip.equipment.id}-${index}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="group relative"
                  >
                    <Card className="border-l-4 border-l-blue-200 hover:border-l-blue-400 transition-colors cursor-pointer"
                          onClick={() => handleEditEquipment(index)}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-medium text-sm">{selectedEquip.equipment.name}</h4>
                              <Badge variant="secondary" className="text-xs">
                                {selectedEquip.equipment.category}
                              </Badge>
                            </div>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                <span>Duration: {selectedEquip.estimatedDuration || 0} hrs</span>
                              </div>
                              <div>
                                <span>Rate: Rs {selectedEquip.costPerHour || 0}/hr</span>
                              </div>
                              <div>
                                <span>Area: {blocArea.toFixed(1)} ha</span>
                              </div>
                              <div className="font-medium text-blue-600">
                                <span>Cost: Rs {selectedEquip.totalEstimatedCost?.toFixed(2) || '0.00'}</span>
                              </div>
                            </div>
                            {selectedEquip.operator && (
                              <div className="mt-2 text-xs text-muted-foreground">
                                <span>Operator: {selectedEquip.operator}</span>
                              </div>
                            )}
                          </div>
                          
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleRemoveEquipment(index)
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
                  onClick={handleAddEquipment}
                  className="w-full border-dashed"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Another Equipment
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Equipment Selector Modal */}
      <AnimatePresence>
        {showSelector && (
          <ModernEquipmentSelector
            onSelect={handleEquipmentSelect}
            onClose={handleCloseSelector}
            title={editingIndex !== null ? "Edit Equipment" : "Select Equipment"}
            subtitle={editingIndex !== null ? "Update equipment details" : "Choose equipment for this operation"}
          />
        )}
      </AnimatePresence>
    </>
  )
}
