'use client'

import { motion } from 'motion/react'
import { LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export interface ToggleOption {
  id: string
  name: string
  shortName?: string
  icon?: LucideIcon
  badge?: string
  disabled?: boolean
}

interface ModernToggleSelectorProps {
  options: ToggleOption[]
  value: string | string[]
  onChange: (value: string | string[]) => void
  multiSelect?: boolean
  size?: 'sm' | 'default' | 'lg'
  variant?: 'default' | 'outline' | 'ghost'
  orientation?: 'horizontal' | 'vertical'
  className?: string
  disabled?: boolean
  allowNone?: boolean
}

export default function ModernToggleSelector({
  options,
  value,
  onChange,
  multiSelect = false,
  size = 'default',
  variant = 'outline',
  orientation = 'horizontal',
  className = "",
  disabled = false,
  allowNone = true
}: ModernToggleSelectorProps) {
  
  const selectedValues = Array.isArray(value) ? value : [value]
  
  const handleSelect = (optionId: string) => {
    if (disabled) return
    
    if (multiSelect) {
      const currentValues = Array.isArray(value) ? value : []
      const newValues = currentValues.includes(optionId)
        ? currentValues.filter(id => id !== optionId)
        : [...currentValues, optionId]
      onChange(newValues)
    } else {
      // For single select, allow deselection if allowNone is true
      if (value === optionId && allowNone) {
        onChange('')
      } else {
        onChange(optionId)
      }
    }
  }

  const sizeClasses = {
    sm: 'h-8 px-3 text-xs',
    default: 'h-10 px-4 text-sm',
    lg: 'h-12 px-6 text-base'
  }

  const containerClasses = orientation === 'horizontal' 
    ? 'flex flex-wrap gap-2' 
    : 'flex flex-col gap-2'

  return (
    <div className={`${containerClasses} ${className}`}>
      {options.map((option) => {
        const IconComponent = option.icon
        const isSelected = selectedValues.includes(option.id)
        
        return (
          <motion.div
            key={option.id}
            whileHover={!disabled && !option.disabled ? { scale: 1.02 } : {}}
            whileTap={!disabled && !option.disabled ? { scale: 0.98 } : {}}
            transition={{ duration: 0.15 }}
          >
            <Button
              variant={isSelected ? 'default' : variant}
              size={size}
              onClick={() => handleSelect(option.id)}
              disabled={disabled || option.disabled}
              className={`${sizeClasses[size]} ${
                isSelected 
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600' 
                  : ''
              } ${
                orientation === 'vertical' ? 'w-full justify-start' : ''
              }`}
            >
              <div className="flex items-center gap-2">
                {IconComponent && (
                  <IconComponent className={`${
                    size === 'sm' ? 'w-3 h-3' : size === 'default' ? 'w-4 h-4' : 'w-5 h-5'
                  }`} />
                )}
                
                <span className="truncate">
                  {option.shortName || option.name}
                </span>
                
                {option.badge && (
                  <Badge 
                    variant={isSelected ? 'secondary' : 'outline'}
                    className={`ml-1 ${
                      size === 'sm' ? 'text-xs px-1' : ''
                    }`}
                  >
                    {option.badge}
                  </Badge>
                )}
              </div>
            </Button>
          </motion.div>
        )
      })}
      
      {options.length === 0 && (
        <div className="text-center py-4 text-slate-500 text-sm">
          No options available
        </div>
      )}
    </div>
  )
}
