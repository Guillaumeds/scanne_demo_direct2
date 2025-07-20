'use client'

import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { ArrowLeft, X, Search, Tractor, Wrench, Clock, User } from 'lucide-react'
import { useEquipment } from '@/hooks/useConfigurationData'
// Equipment type now comes from demo data
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'

import { ScrollArea } from '@/components/ui/scroll-area'
import { fuzzySearch } from '@/utils/fuzzySearch'
import ModernCardSelector from '@/components/selectors/ModernCardSelector'

export interface SelectedEquipment {
  equipment: any // Using any for demo mode
  estimatedDuration?: number
  costPerHour?: number
  totalEstimatedCost?: number
  operator?: string
  notes?: string
}

interface ModernEquipmentSelectorProps {
  onSelect: (selectedEquipment: SelectedEquipment) => void
  onClose: () => void
  existingEquipment?: SelectedEquipment
  title?: string
  subtitle?: string
}



export default function ModernEquipmentSelector({
  onSelect,
  onClose,
  existingEquipment,
  title = "Select Equipment",
  subtitle = "Choose equipment for this operation"
}: ModernEquipmentSelectorProps) {
  const [selectedEquipment, setSelectedEquipment] = useState<any | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [estimatedDuration, setEstimatedDuration] = useState<number>(0)
  const [costPerHour, setCostPerHour] = useState<number>(0)


  // Fetch resources (equipment) using TanStack Query
  const { data: equipment, isLoading, error } = useEquipment()



  // Pre-populate fields when editing existing equipment
  useEffect(() => {
    if (existingEquipment && equipment && equipment.length > 0) {
      const equipmentItem = equipment.find(e => e.id === existingEquipment.equipment.id)
      if (equipmentItem) {
        setSelectedEquipment(equipmentItem)
        setEstimatedDuration(existingEquipment.estimatedDuration || 0)
        setCostPerHour(existingEquipment.costPerHour || equipmentItem.operationalCosts?.hourlyRate || 0)

      }
    }
  }, [existingEquipment, equipment])

  // Filter equipment with fuzzy search
  const filteredEquipment = searchTerm && equipment
    ? fuzzySearch(equipment, searchTerm, {
        keys: ['name', 'description', 'category'],
        threshold: 0.2
      })
    : equipment || []



  const handleEquipmentSelect = (value: string | string[]) => {
    const equipmentId = Array.isArray(value) ? value[0] : value
    if (!equipmentId) return
    const equipmentItem = (equipment || []).find(e => e.id === equipmentId)
    if (equipmentItem) {
      setSelectedEquipment(equipmentItem)
      setCostPerHour(equipmentItem.operationalCosts?.hourlyRate || 0)
      setEstimatedDuration(1) // Default to 1 hour
    }
  }

  const handleConfirm = () => {
    if (selectedEquipment && estimatedDuration > 0) {
      const totalEstimatedCost = estimatedDuration * costPerHour
      onSelect({
        equipment: selectedEquipment,
        estimatedDuration,
        costPerHour,
        totalEstimatedCost
      })
      onClose()
    }
  }

  const handleBack = () => {
    setSelectedEquipment(null)
  }

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
            {selectedEquipment && (
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
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-slate-600">Loading equipment...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center max-w-md">
                <div className="text-red-500 text-6xl mb-4">⚠️</div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Failed to Load Equipment</h3>
                <p className="text-slate-600 mb-4">{typeof error === 'string' ? error : 'Unknown error'}</p>
                <Button onClick={() => window.location.reload()}>
                  Reload Page
                </Button>
              </div>
            </div>
          ) : selectedEquipment ? (
            // Equipment calculation form
            <ScrollArea className="h-[calc(90vh-80px)] p-6">
              <div className="max-w-2xl mx-auto space-y-6 pb-6">
                {/* Selected Equipment Info */}
                <Card className="border-l-4 border-l-blue-500">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Tractor className="h-8 w-8 text-blue-600" />
                      <div>
                        <h3 className="font-semibold text-lg">{selectedEquipment.name}</h3>
                        <p className="text-sm text-muted-foreground">{selectedEquipment.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Calculation Form */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      Calculation
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="max-w-md">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Estimated Duration (hours) *
                        </label>
                        <Input
                          type="number"
                          step="0.5"
                          min="0"
                          value={estimatedDuration === 0 ? '' : estimatedDuration}
                          onChange={(e) => setEstimatedDuration(parseFloat(e.target.value) || 0)}
                          placeholder="0"
                        />
                      </div>
                    </div>

                    {/* Visual Calculation */}
                    <div className="mt-6">
                      <div className="flex items-center justify-center gap-2 p-3 bg-slate-50 rounded-lg text-sm">
                        <Badge variant="outline">Rate: Rs {costPerHour.toFixed(2)}/hour</Badge>
                        <span className="text-slate-500">×</span>
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          {estimatedDuration.toFixed(1)} hours
                        </Badge>
                        <span className="text-slate-500">=</span>
                        <Badge className="bg-green-100 text-green-700 border-green-200 font-semibold">
                          Rs {(estimatedDuration * costPerHour).toFixed(2)}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </ScrollArea>
          ) : (
            // Equipment selection
            <div className="flex-1 overflow-hidden flex flex-col">
              <div className="p-6 pb-4">
                <div className="flex items-center gap-3">
                  <Search className="w-5 h-5 text-slate-400" />
                  <Input
                    placeholder="Search equipment..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>

              <ScrollArea className="h-[400px] px-6">
                <div className="pb-6">
                  <ModernCardSelector
                    options={filteredEquipment.map((equipmentItem) => ({
                      id: equipmentItem.id,
                      name: equipmentItem.name,
                      description: equipmentItem.name || 'Farm equipment',
                      badge: equipmentItem.category || undefined,
                      color: 'bg-blue-50',
                      icon: Tractor,
                      cost: equipmentItem.operationalCosts?.hourlyRate,
                      unit: 'hour',
                      skillLevel: 'Basic' // Equipment doesn't have skillLevel in DB
                    }))}
                    value=""
                    onChange={handleEquipmentSelect}
                    layout="grid"
                    columns={2}
                  />
                </div>
                {filteredEquipment.length === 0 && (
                  <div className="text-center py-8">
                    <Tractor className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Equipment Found</h3>
                    <p className="text-muted-foreground">
                      {searchTerm
                        ? 'Try adjusting your search term.'
                        : 'No equipment available in the database.'
                      }
                    </p>
                  </div>
                )}
              </ScrollArea>
            </div>
          )}
        </div>

        {/* Footer */}
        {selectedEquipment && (
          <div className="border-t border-slate-200 p-6 bg-slate-50">
            <div className="flex items-center justify-between">
              <div className="text-sm text-slate-600">
                Total: Rs {(estimatedDuration * costPerHour).toFixed(2)}
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={handleBack}>
                  Back
                </Button>
                <Button
                  onClick={handleConfirm}
                  disabled={!selectedEquipment || estimatedDuration <= 0}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Confirm Equipment
                </Button>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}
