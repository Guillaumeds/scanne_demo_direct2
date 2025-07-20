'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Plus, X, Leaf, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import ModernVarietySelector, { SelectedVariety } from './ModernVarietySelector'
import { SugarcaneVariety } from '@/types/varieties'

interface VarietySelectionManagerProps {
  selectedVariety: SelectedVariety | null
  onVarietyChange: (variety: SelectedVariety | null) => void
  cycleType: 'plantation' | 'ratoon'
  cycleNumber?: number
  existingVariety?: SugarcaneVariety // For ratoon cycles
  title?: string
  subtitle?: string
  disabled?: boolean
}

export default function VarietySelectionManager({
  selectedVariety,
  onVarietyChange,
  cycleType,
  cycleNumber,
  existingVariety,
  title = "Sugarcane Variety",
  subtitle = "Select variety for this crop cycle",
  disabled = false
}: VarietySelectionManagerProps) {
  const [showSelector, setShowSelector] = useState(false)

  const handleSelectVariety = () => {
    if (disabled) return
    setShowSelector(true)
  }

  const handleVarietySelect = (variety: SelectedVariety) => {
    onVarietyChange(variety)
    setShowSelector(false)
  }

  const handleRemoveVariety = () => {
    if (disabled) return
    onVarietyChange(null)
  }

  const handleCloseSelector = () => {
    setShowSelector(false)
  }

  // For ratoon cycles, variety is inherited from plantation
  const isRatoonCycle = cycleType === 'ratoon'
  const displayVariety = isRatoonCycle ? existingVariety : selectedVariety?.variety

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Leaf className="h-5 w-5 text-green-600" />
              {title}
            </CardTitle>
            {!isRatoonCycle && !disabled && !selectedVariety && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleSelectVariety}
              >
                <Plus className="h-4 w-4 mr-2" />
                Select Variety
              </Button>
            )}
          </div>
          {subtitle && (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          )}
        </CardHeader>
        <CardContent>
          {isRatoonCycle ? (
            // Ratoon cycle - show inherited variety
            <div>
              <Alert className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Ratoon cycles inherit the variety from the original plantation cycle.
                </AlertDescription>
              </Alert>
              
              {existingVariety ? (
                <Card className="border-l-4 border-l-green-500">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium text-sm">{existingVariety.name}</h4>
                          <Badge variant="secondary" className="text-xs">
                            Ratoon {cycleNumber ? cycleNumber - 1 : 'Cycle'}
                          </Badge>
                          <Badge variant="outline" className="text-xs text-green-600">
                            Inherited
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs text-muted-foreground">
                          <div>
                            <span>Harvest: {existingVariety.harvestStart} - {existingVariety.harvestEnd}</span>
                          </div>
                          {existingVariety.seasons && existingVariety.seasons.length > 0 && (
                            <div>
                              <span>Seasons: {existingVariety.seasons.join(', ')}</span>
                            </div>
                          )}
                          {existingVariety.yieldPotential && (
                            <div>
                              <span>Yield: {existingVariety.yieldPotential} t/ha</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="text-center py-8 border-2 border-dashed border-border rounded-lg">
                  <Leaf className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">No variety information available</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Variety should be inherited from plantation cycle
                  </p>
                </div>
              )}
            </div>
          ) : (
            // Plantation cycle - allow variety selection
            <div>
              {selectedVariety ? (
                <Card className="border-l-4 border-l-green-500">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium text-sm">{selectedVariety.variety.name}</h4>
                          <Badge variant="secondary" className="text-xs">
                            Plantation
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs text-muted-foreground">
                          <div>
                            <span>Harvest: {selectedVariety.variety.harvestStart} - {selectedVariety.variety.harvestEnd}</span>
                          </div>
                          {selectedVariety.variety.seasons && Array.isArray(selectedVariety.variety.seasons) && selectedVariety.variety.seasons.length > 0 && (
                            <div>
                              <span>Seasons: {selectedVariety.variety.seasons.join(', ')}</span>
                            </div>
                          )}
                          {selectedVariety.variety.yieldPotential && (
                            <div>
                              <span>Yield: {selectedVariety.variety.yieldPotential} t/ha</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {!disabled && (
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={handleSelectVariety}
                            className="text-xs"
                          >
                            Change
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={handleRemoveVariety}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="text-center py-8 border-2 border-dashed border-border rounded-lg">
                  <Leaf className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">No variety selected yet</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Plantation cycles require a variety selection
                  </p>
                  {!disabled && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleSelectVariety}
                      className="mt-2"
                    >
                      Select Variety
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Variety Selector Modal */}
      <AnimatePresence>
        {showSelector && (
          <ModernVarietySelector
            onSelect={handleVarietySelect}
            onClose={handleCloseSelector}
            title="Select Sugarcane Variety"
            subtitle="Choose the variety for this plantation cycle"
            varietyType="sugarcane"
          />
        )}
      </AnimatePresence>
    </>
  )
}
