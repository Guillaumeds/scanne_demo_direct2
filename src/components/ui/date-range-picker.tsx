'use client'

import React from 'react'
import { Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DateRange } from 'react-day-picker'

interface DatePickerWithRangeProps {
  date?: DateRange
  onDateChange: (date: DateRange | undefined) => void
  placeholder?: string
  className?: string
}

export function DatePickerWithRange({
  date,
  onDateChange,
  placeholder = "Select date range",
  className
}: DatePickerWithRangeProps) {
  // Simple implementation - in a real app, you'd use a proper date picker library
  const formatDateRange = (dateRange?: DateRange) => {
    if (!dateRange?.from) return placeholder
    if (!dateRange.to) return dateRange.from.toLocaleDateString()
    return `${dateRange.from.toLocaleDateString()} - ${dateRange.to.toLocaleDateString()}`
  }

  return (
    <Button
      variant="outline"
      className={`w-full justify-start text-left font-normal ${className}`}
      onClick={() => {
        // TODO: Implement proper date picker modal
        console.log('Date picker clicked')
      }}
    >
      <Calendar className="mr-2 h-4 w-4" />
      {formatDateRange(date)}
    </Button>
  )
}
