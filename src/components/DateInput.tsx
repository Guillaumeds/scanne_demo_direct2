import React, { useState, useRef, useEffect } from 'react'

interface DateInputProps {
  value?: string
  onChange?: (date: string) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}

export default function DateInput({ 
  value = '', 
  onChange, 
  placeholder = '4 Jan 2025',
  className = '',
  disabled = false 
}: DateInputProps) {
  const [inputValue, setInputValue] = useState('')
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [selectedDate, setSelectedDate] = useState<string>('')
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Format date to "4 Jan 2025" format
  const formatDate = (dateString: string): string => {
    if (!dateString) return ''
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return ''
    return date.toLocaleDateString('en-GB', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    })
  }

  // Smart date parser - converts various formats to ISO date
  const parseSmartDate = (input: string): string => {
    if (!input.trim()) return ''
    
    // Try various date formats
    const monthNames = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 
                       'jul', 'aug', 'sep', 'oct', 'nov', 'dec']
    
    // Try direct Date parsing first
    let parsedDate = new Date(input)
    if (!isNaN(parsedDate.getTime())) {
      return parsedDate.toISOString().split('T')[0]
    }
    
    // Try manual parsing for specific formats
    const formats = [
      // DD/MM/YYYY or DD/MM/YY
      /^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/,
      // DD-MM-YYYY or DD-MM-YY  
      /^(\d{1,2})-(\d{1,2})-(\d{2,4})$/,
      // DD MMM YYYY (e.g., "4 Jan 2025")
      /^(\d{1,2})\s+(\w{3,})\s+(\d{4})$/,
      // MMM DD YYYY (e.g., "Jan 4 2025")
      /^(\w{3,})\s+(\d{1,2})\s+(\d{4})$/
    ]
    
    for (const format of formats) {
      const match = input.toLowerCase().match(format)
      if (match) {
        if (format.source.includes('MMM')) {
          // Handle month name formats
          if (match[2] && match[1] && match[3]) { // MMM DD YYYY
            const monthIndex = monthNames.findIndex(m => match[1].startsWith(m))
            if (monthIndex !== -1) {
              parsedDate = new Date(parseInt(match[3]), monthIndex, parseInt(match[2]))
            }
          } else if (match[1] && match[2] && match[3]) { // DD MMM YYYY
            const monthIndex = monthNames.findIndex(m => match[2].startsWith(m))
            if (monthIndex !== -1) {
              parsedDate = new Date(parseInt(match[3]), monthIndex, parseInt(match[1]))
            }
          }
        } else {
          // Handle numeric formats (DD/MM/YYYY)
          const day = parseInt(match[1])
          const month = parseInt(match[2]) - 1 // Month is 0-indexed
          let year = parseInt(match[3])
          if (year < 100) year += 2000 // Convert 2-digit year
          parsedDate = new Date(year, month, day)
        }
        break
      }
    }
    
    if (!isNaN(parsedDate.getTime())) {
      return parsedDate.toISOString().split('T')[0]
    }
    
    return '' // Return empty if parsing fails
  }

  // Initialize input value from prop
  useEffect(() => {
    if (value) {
      const formatted = formatDate(value)
      setInputValue(formatted)
      setSelectedDate(value)
    } else {
      setInputValue('')
      setSelectedDate('')
    }
  }, [value])

  // Handle text input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setInputValue(newValue)
    
    // Try to parse the input
    const parsedDate = parseSmartDate(newValue)
    if (parsedDate) {
      setSelectedDate(parsedDate)
      onChange?.(parsedDate)
    }
  }

  // Handle input focus
  const handleInputFocus = () => {
    if (!disabled) {
      setShowDatePicker(true)
    }
  }

  // Handle date picker selection
  const handleDatePickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedISODate = e.target.value
    if (selectedISODate) {
      setSelectedDate(selectedISODate)
      setInputValue(formatDate(selectedISODate))
      onChange?.(selectedISODate)
      setShowDatePicker(false)
      inputRef.current?.focus()
    }
  }

  // Handle clicks outside to close date picker
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowDatePicker(false)
      }
    }

    if (showDatePicker) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showDatePicker])

  // Handle Enter key to show/hide date picker
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      setShowDatePicker(!showDatePicker)
    } else if (e.key === 'Escape') {
      setShowDatePicker(false)
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onFocus={handleInputFocus}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full bg-transparent border-none focus:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-gray-300 rounded px-2 py-1 text-sm ${className}`}
        title="Enter date (e.g., 4 Jan 2025, 4/1/25, Jan 4) or click to open calendar"
      />
      
      {/* Native Date Picker */}
      {showDatePicker && (
        <div className="absolute top-full left-0 z-50 bg-white border border-gray-300 rounded-lg shadow-lg p-2 mt-1">
          <input
            type="date"
            value={selectedDate}
            onChange={handleDatePickerChange}
            className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
        </div>
      )}
    </div>
  )
}
