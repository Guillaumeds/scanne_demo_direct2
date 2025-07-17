'use client'

import { motion } from 'motion/react'
import { Check, LucideIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'

export interface CardOption {
  id: string
  name: string
  description?: string
  icon?: LucideIcon
  value?: string
  trend?: 'up' | 'down' | 'stable'
  badge?: string
  color?: string
  disabled?: boolean
}

interface ModernCardSelectorProps {
  options: CardOption[]
  value: string | string[]
  onChange: (value: string | string[]) => void
  multiSelect?: boolean
  layout?: 'grid' | 'list'
  columns?: 1 | 2 | 3 | 4
  className?: string
  disabled?: boolean
  showValues?: boolean
  showTrends?: boolean
}

export default function ModernCardSelector({
  options,
  value,
  onChange,
  multiSelect = false,
  layout = 'grid',
  columns = 2,
  className = "",
  disabled = false,
  showValues = false,
  showTrends = false
}: ModernCardSelectorProps) {
  
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
      onChange(optionId)
    }
  }

  const getTrendIcon = (trend?: string) => {
    switch (trend) {
      case 'up':
        return '↗'
      case 'down':
        return '↘'
      case 'stable':
        return '→'
      default:
        return null
    }
  }

  const getTrendColor = (trend?: string) => {
    switch (trend) {
      case 'up':
        return 'text-emerald-600'
      case 'down':
        return 'text-red-600'
      case 'stable':
        return 'text-slate-600'
      default:
        return 'text-slate-600'
    }
  }

  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
  }

  return (
    <div className={className}>
      <div className={layout === 'grid' ? `grid ${gridCols[columns]} gap-3` : 'space-y-2'}>
        {options.map((option) => {
          const IconComponent = option.icon
          const isSelected = selectedValues.includes(option.id)
          const trendIcon = getTrendIcon(option.trend)
          const trendColor = getTrendColor(option.trend)
          
          return (
            <motion.div
              key={option.id}
              whileHover={!disabled && !option.disabled ? { scale: 1.02 } : {}}
              whileTap={!disabled && !option.disabled ? { scale: 0.98 } : {}}
              transition={{ duration: 0.15 }}
            >
              <Card
                className={`cursor-pointer transition-all duration-200 ${
                  disabled || option.disabled
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:shadow-md'
                } ${
                  isSelected
                    ? 'border-emerald-200 bg-emerald-50 shadow-sm'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
                onClick={() => handleSelect(option.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className={`p-2 rounded-lg ${
                        isSelected
                          ? 'bg-emerald-100'
                          : option.color || 'bg-slate-100'
                      }`}>
                        {IconComponent ? (
                          <IconComponent className={`w-5 h-5 ${
                            isSelected ? 'text-emerald-600' : 'text-slate-600'
                          }`} />
                        ) : (
                          <span className="text-xl">📦</span>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className={`font-medium text-sm truncate ${
                          isSelected ? 'text-emerald-900' : 'text-slate-900'
                        }`}>
                          {option.name}
                        </div>
                        
                        {option.description && (
                          <div className="text-xs text-slate-500 truncate mt-1">
                            {option.description}
                          </div>
                        )}
                        
                        {showValues && option.value && (
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-lg font-bold text-slate-900">
                              {option.value}
                            </span>
                            {showTrends && trendIcon && (
                              <span className={`text-sm ${trendColor}`}>
                                {trendIcon}
                              </span>
                            )}
                          </div>
                        )}
                        
                        {option.badge && (
                          <Badge variant="secondary" className="mt-2">
                            {option.badge}
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.15 }}
                        className="flex-shrink-0 ml-2"
                      >
                        <div className="w-6 h-6 bg-emerald-600 rounded-full flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      </motion.div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>
      
      {options.length === 0 && (
        <div className="text-center py-8 text-slate-500">
          <div className="text-sm">No options available</div>
        </div>
      )}
    </div>
  )
}
