'use client'

import React from 'react'
import { motion } from 'motion/react'
import { Table, LayoutGrid, List } from 'lucide-react'
import { Button } from '@/components/ui/button'

type ViewMode = 'table' | 'cards' | 'rows'

interface ViewSwitcherProps {
  currentView: ViewMode
  onViewChange: (view: ViewMode) => void
}

export function ViewSwitcher({ currentView, onViewChange }: ViewSwitcherProps) {
  const views = [
    {
      id: 'rows' as const,
      label: 'Rows',
      icon: List,
      description: 'Compact row layout optimized for mobile'
    },
    {
      id: 'cards' as const,
      label: 'Cards',
      icon: LayoutGrid,
      description: 'Card-based layout for visual overview'
    },
    {
      id: 'table' as const,
      label: 'Table',
      icon: Table,
      description: 'Detailed table view with sorting and filtering'
    }
  ]

  return (
    <motion.div
      className="flex items-center bg-muted/50 rounded-lg p-1 relative overflow-hidden"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Background glow effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 opacity-0"
        animate={{ opacity: [0, 1, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      />

      {views.map((view, index) => {
        const Icon = view.icon
        const isActive = currentView === view.id

        return (
          <motion.div
            key={view.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2, delay: index * 0.1 }}
            whileHover={{
              scale: 1.05,
              transition: { duration: 0.2 }
            }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              variant={isActive ? "secondary" : "ghost"}
              size="sm"
              onClick={() => onViewChange(view.id)}
              className={`relative h-8 px-3 transition-all duration-200 ${
                isActive
                  ? 'bg-background shadow-sm text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              title={view.description}
            >
              {/* Icon with micro-animation */}
              <motion.div
                animate={isActive ? {
                  rotate: [0, 5, -5, 0],
                  scale: [1, 1.1, 1]
                } : {}}
                transition={{ duration: 0.5 }}
              >
                <Icon className="h-4 w-4" />
              </motion.div>

              {/* Label with stagger animation */}
              <motion.span
                className="ml-2 hidden sm:inline"
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                transition={{ duration: 0.3, delay: index * 0.1 + 0.2 }}
              >
                {view.label}
              </motion.span>

              {/* Active indicator with smooth transition */}
              {isActive && (
                <motion.div
                  layoutId="activeViewIndicator"
                  className="absolute inset-0 bg-background rounded-md border border-border/50 shadow-sm"
                  style={{ zIndex: -1 }}
                  transition={{
                    type: "spring",
                    bounce: 0.2,
                    duration: 0.6,
                    layout: { duration: 0.3 }
                  }}
                />
              )}

              {/* Hover effect */}
              <motion.div
                className="absolute inset-0 bg-primary/5 rounded-md opacity-0"
                whileHover={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
                style={{ zIndex: -2 }}
              />
            </Button>
          </motion.div>
        )
      })}
    </motion.div>
  )
}
