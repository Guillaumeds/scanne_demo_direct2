'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { Users, Clock, DollarSign, AlertCircle, Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useLabour } from '@/hooks/useConfigurationData'
import { Labour } from '@/schemas/apiSchemas'

export interface LabourTableEntry {
  labour: Labour
  estimatedHours: number
  ratePerHour: number
  totalEstimatedCost: number
}

interface LabourSelectionManagerProps {
  selectedLabour: LabourTableEntry[]
  onLabourChange: (labour: LabourTableEntry[]) => void
  title?: string
  subtitle?: string
  isLoading?: boolean
  error?: string | null
}

export default function LabourSelectionManager({
  selectedLabour,
  onLabourChange,
  title = "Labour & Human Resources",
  subtitle = "Enter estimated hours for each labour type",
  isLoading = false,
  error = null
}: LabourSelectionManagerProps) {

  // Fetch all available labour
  const { data: allLabour, isLoading: labourLoading, error: labourError } = useLabour()

  // Initialize labour table when data is loaded
  useEffect(() => {
    if (allLabour && allLabour.length > 0 && selectedLabour.length === 0) {
      // Initialize table with all labour types, zero hours
      const initialLabourTable: LabourTableEntry[] = allLabour.map(labour => ({
        labour: {
          ...labour,
          description: labour.description || null,
          created_at: labour.created_at || '',
          updated_at: labour.updated_at || ''
        },
        estimatedHours: 0,
        ratePerHour: labour.cost_per_unit || 0,
        totalEstimatedCost: 0
      }))
      onLabourChange(initialLabourTable)
    }
  }, [allLabour, selectedLabour.length, onLabourChange])

  const handleHoursChange = (index: number, hours: number) => {
    const updatedLabour = [...selectedLabour]
    updatedLabour[index].estimatedHours = hours
    updatedLabour[index].totalEstimatedCost = hours * updatedLabour[index].ratePerHour
    onLabourChange(updatedLabour)
  }

  // Rate is read-only in demo mode - always uses default rate from labour data

  const totalLabourCost = selectedLabour.reduce((sum, entry) => sum + entry.totalEstimatedCost, 0)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              {title}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              Total: Rs {totalLabourCost.toFixed(2)}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {(error || labourError) && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error || labourError?.message}</AlertDescription>
          </Alert>
        )}

        {(isLoading || labourLoading) ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Loading labour data...</span>
          </div>
        ) : !selectedLabour.length ? (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No labour data available</p>
            <p className="text-sm">Labour data will appear here when loaded</p>
          </div>
        ) : (
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold">Labour</TableHead>
                  <TableHead className="font-semibold text-center w-32">Est. Effort (hrs)</TableHead>
                  <TableHead className="font-semibold text-center w-32">Rate ($/hr)</TableHead>
                  <TableHead className="font-semibold text-right w-32">Total ($)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {selectedLabour.map((entry, index) => (
                  <TableRow key={entry.labour.id} className="hover:bg-muted/30">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div>
                          <div className="font-medium text-sm">{entry.labour.name}</div>
                          {entry.labour.description && (
                            <div className="text-xs text-muted-foreground mt-1">
                              {entry.labour.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Input
                        type="number"
                        step="0.5"
                        min="0"
                        value={entry.estimatedHours || ''}
                        onChange={(e) => handleHoursChange(index, parseFloat(e.target.value) || 0)}
                        className="w-20 text-center"
                        placeholder="0"
                      />
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="w-20 text-center py-2 px-3 text-sm font-medium">
                        Rs {(entry.ratePerHour || 0).toFixed(2)}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="font-medium text-green-600">
                        Rs {entry.totalEstimatedCost.toFixed(2)}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
