'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { ChevronDown, Check, Search, LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { fuzzySearch } from '@/utils/fuzzySearch'

export interface DropdownOption {
  id: string
  name: string
  description?: string
  icon?: LucideIcon
  category?: string
  badge?: string
  disabled?: boolean
}

interface ModernDropdownSelectorProps {
  options: DropdownOption[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  searchable?: boolean
  showCategories?: boolean
  className?: string
  disabled?: boolean
}

export default function ModernDropdownSelector({
  options,
  value,
  onChange,
  placeholder = "Select an option",
  searchable = true,
  showCategories = false,
  className = "",
  disabled = false
}: ModernDropdownSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const selectedOption = options.find(option => option.id === value)
  
  const filteredOptions = searchTerm
    ? fuzzySearch(options, searchTerm, {
        keys: ['name', 'description', 'category'],
        threshold: 0.2
      })
    : options

  const groupedOptions = showCategories 
    ? filteredOptions.reduce((groups, option) => {
        const category = option.category || 'Other'
        if (!groups[category]) groups[category] = []
        groups[category].push(option)
        return groups
      }, {} as Record<string, DropdownOption[]>)
    : { 'All': filteredOptions }

  const handleSelect = (optionId: string) => {
    onChange(optionId)
    setIsOpen(false)
    setSearchTerm('')
  }

  return (
    <div className={`relative ${className}`}>
      <Button
        variant="outline"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className="w-full justify-between h-12 text-left"
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {selectedOption ? (
            <>
              {selectedOption.icon && (
                <selectedOption.icon className="w-4 h-4 text-slate-600 flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <span className="font-medium truncate block">{selectedOption.name}</span>
                {selectedOption.description && (
                  <span className="text-xs text-slate-500 truncate block">
                    {selectedOption.description}
                  </span>
                )}
              </div>
              {selectedOption.badge && (
                <Badge variant="secondary" className="flex-shrink-0">
                  {selectedOption.badge}
                </Badge>
              )}
            </>
          ) : (
            <span className="text-slate-500">{placeholder}</span>
          )}
        </div>
        <ChevronDown 
          className={`w-4 h-4 text-slate-400 transition-transform flex-shrink-0 ${
            isOpen ? 'rotate-180' : ''
          }`} 
        />
      </Button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 right-0 z-50 mt-2 bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden"
          >
            {searchable && (
              <div className="p-3 border-b border-slate-100">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="Search options..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-9"
                    autoFocus
                  />
                </div>
              </div>
            )}
            
            <div className="max-h-64 overflow-y-auto">
              {Object.entries(groupedOptions).map(([category, categoryOptions]) => (
                <div key={category}>
                  {showCategories && Object.keys(groupedOptions).length > 1 && (
                    <div className="px-4 py-2 text-xs font-semibold text-slate-500 bg-slate-50 border-b border-slate-100">
                      {category}
                    </div>
                  )}
                  {categoryOptions.map((option) => {
                    const IconComponent = option.icon
                    const isSelected = value === option.id
                    return (
                      <motion.button
                        key={option.id}
                        whileHover={{ backgroundColor: 'rgb(248 250 252)' }}
                        onClick={() => handleSelect(option.id)}
                        disabled={option.disabled}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                          option.disabled 
                            ? 'opacity-50 cursor-not-allowed' 
                            : 'hover:bg-slate-50'
                        } ${isSelected ? 'bg-emerald-50' : ''}`}
                      >
                        {IconComponent && (
                          <IconComponent className={`w-4 h-4 flex-shrink-0 ${
                            isSelected ? 'text-emerald-600' : 'text-slate-600'
                          }`} />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className={`font-medium text-sm truncate ${
                            isSelected ? 'text-emerald-900' : 'text-slate-900'
                          }`}>
                            {option.name}
                          </div>
                          {option.description && (
                            <div className="text-xs text-slate-500 truncate">
                              {option.description}
                            </div>
                          )}
                        </div>
                        {option.badge && (
                          <Badge variant="secondary" className="flex-shrink-0">
                            {option.badge}
                          </Badge>
                        )}
                        {isSelected && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="flex-shrink-0"
                          >
                            <Check className="w-4 h-4 text-emerald-600" />
                          </motion.div>
                        )}
                      </motion.button>
                    )
                  })}
                </div>
              ))}
              
              {filteredOptions.length === 0 && (
                <div className="px-4 py-8 text-center text-slate-500">
                  <div className="text-sm">No options found</div>
                  {searchTerm && (
                    <div className="text-xs mt-1">
                      Try adjusting your search term
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}
