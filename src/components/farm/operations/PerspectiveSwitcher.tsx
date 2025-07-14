'use client'

import React from 'react'
import { motion } from 'motion/react'
import { Sprout, Users, DollarSign, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

type Perspective = 'operations' | 'resources' | 'financial'
type ViewMode = 'table' | 'cards' | 'rows'

interface PerspectiveSwitcherProps {
  currentPerspective: Perspective
  onPerspectiveChange: (perspective: Perspective) => void
  viewMode: ViewMode
}

export function PerspectiveSwitcher({ 
  currentPerspective, 
  onPerspectiveChange, 
  viewMode 
}: PerspectiveSwitcherProps) {
  const perspectives = [
    {
      id: 'operations' as const,
      label: 'Operations',
      icon: Sprout,
      description: 'Agricultural activities and progress',
      color: 'bg-primary/10 text-primary'
    },
    {
      id: 'resources' as const,
      label: 'Resources',
      icon: Users,
      description: 'Equipment, labor, and materials',
      color: 'bg-blue-100 text-blue-700'
    },
    {
      id: 'financial' as const,
      label: 'Financial',
      icon: DollarSign,
      description: 'Costs, budgets, and profitability',
      color: 'bg-green-100 text-green-700'
    }
  ]

  const currentIndex = perspectives.findIndex(p => p.id === currentPerspective)

  const handlePrevious = () => {
    const prevIndex = currentIndex > 0 ? currentIndex - 1 : perspectives.length - 1
    onPerspectiveChange(perspectives[prevIndex].id)
  }

  const handleNext = () => {
    const nextIndex = currentIndex < perspectives.length - 1 ? currentIndex + 1 : 0
    onPerspectiveChange(perspectives[nextIndex].id)
  }

  // For cards view, use AirBNB-style horizontal scroller
  if (viewMode === 'cards') {
    return (
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handlePrevious}
          className="h-8 w-8 p-0"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <motion.div
          key={currentPerspective}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          <Badge variant="secondary" className={perspectives[currentIndex].color}>
            {React.createElement(perspectives[currentIndex].icon, { className: "h-3 w-3 mr-1" })}
            {perspectives[currentIndex].label}
          </Badge>
        </motion.div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleNext}
          className="h-8 w-8 p-0"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  // For table and rows view, use selector/tabs style
  return (
    <div className="flex items-center bg-muted/50 rounded-lg p-1">
      {perspectives.map((perspective) => {
        const Icon = perspective.icon
        const isActive = currentPerspective === perspective.id
        
        return (
          <motion.div
            key={perspective.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              variant={isActive ? "secondary" : "ghost"}
              size="sm"
              onClick={() => onPerspectiveChange(perspective.id)}
              className={`relative h-8 px-3 ${
                isActive 
                  ? 'bg-background shadow-sm text-foreground' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              title={perspective.description}
            >
              <Icon className="h-4 w-4" />
              <span className="ml-2 hidden md:inline">{perspective.label}</span>
              
              {/* Active indicator */}
              {isActive && (
                <motion.div
                  layoutId="activePerspectiveIndicator"
                  className="absolute inset-0 bg-background rounded-md border border-border/50"
                  style={{ zIndex: -1 }}
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
            </Button>
          </motion.div>
        )
      })}
    </div>
  )
}
