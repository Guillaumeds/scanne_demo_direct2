'use client'

import React, { useState } from 'react'
import { Calendar, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DatePickerWithRange } from '@/components/ui/date-range-picker'
import { DateRange } from 'react-day-picker'

export function OperationsFilters() {
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [typeFilter, setTypeFilter] = useState<string>('')
  const [dateRange, setDateRange] = useState<DateRange | undefined>()

  const operationTypes = [
    'Fertilization',
    'Irrigation',
    'Pest Control',
    'Soil Testing',
    'Planting',
    'Harvesting',
    'Cultivation'
  ]

  const statusOptions = [
    'planned',
    'in-progress',
    'completed',
    'cancelled'
  ]

  const clearAllFilters = () => {
    setStatusFilter('')
    setTypeFilter('')
    setDateRange(undefined)
  }

  const hasActiveFilters = statusFilter || typeFilter || dateRange

  return (
    <div className="bg-muted/30 rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Filters</h3>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="h-8 text-muted-foreground"
          >
            <X className="h-4 w-4 mr-1" />
            Clear All
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Status Filter */}
        <div className="space-y-2">
          <Label htmlFor="status-filter" className="text-sm">Status</Label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger id="status-filter">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All statuses</SelectItem>
              {statusOptions.map((status) => (
                <SelectItem key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Operation Type Filter */}
        <div className="space-y-2">
          <Label htmlFor="type-filter" className="text-sm">Operation Type</Label>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger id="type-filter">
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All types</SelectItem>
              {operationTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Date Range Filter */}
        <div className="space-y-2">
          <Label className="text-sm">Date Range</Label>
          <DatePickerWithRange
            date={dateRange}
            onDateChange={setDateRange}
            placeholder="Select date range"
            className="w-full"
          />
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
          <span className="text-xs text-muted-foreground">Active filters:</span>
          
          {statusFilter && (
            <Badge variant="secondary" className="text-xs">
              Status: {statusFilter}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setStatusFilter('')}
                className="h-4 w-4 p-0 ml-1 hover:bg-transparent"
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          
          {typeFilter && (
            <Badge variant="secondary" className="text-xs">
              Type: {typeFilter}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setTypeFilter('')}
                className="h-4 w-4 p-0 ml-1 hover:bg-transparent"
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          
          {dateRange && (
            <Badge variant="secondary" className="text-xs">
              <Calendar className="h-3 w-3 mr-1" />
              Date Range
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDateRange(undefined)}
                className="h-4 w-4 p-0 ml-1 hover:bg-transparent"
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
        </div>
      )}
    </div>
  )
}
