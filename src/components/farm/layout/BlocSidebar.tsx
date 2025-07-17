'use client'

import React from 'react'
import { motion } from 'motion/react'
import { Info, Sprout, Leaf, ArrowLeft, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useBlocContext } from '../contexts/BlocContext'

export function BlocSidebar() {
  const { currentScreen, setCurrentScreen, onBack, onDelete, bloc } = useBlocContext()

  const navigationItems = [
    {
      id: 'information',
      label: 'Information',
      icon: Info,
      screen: 'information' as const
    },
    {
      id: 'crop-cycle-management',
      label: 'Crop Cycle Management',
      icon: Leaf,
      screen: 'crop-cycle-management' as const
    },
    {
      id: 'operations',
      label: 'Field Operations',
      icon: Sprout,
      screen: 'operations' as const
    }
  ]

  return (
    <div className="w-64 bg-card border-r border-border flex flex-col">
      {/* Header */}
      <div className="p-4">
        <div className="flex items-center gap-3 mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="h-8 w-8 p-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <h2 className="font-semibold text-foreground truncate">
              {bloc.name || `Bloc ${bloc.localId}`}
            </h2>
            <p className="text-sm text-muted-foreground">
              {bloc.area.toFixed(1)} hectares
            </p>
          </div>
        </div>
        <Separator />
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4">
        <div className="space-y-1">
          {navigationItems.map((item, index) => {
            const Icon = item.icon
            const isActive = currentScreen === item.screen ||
              (item.screen === 'operations' && (currentScreen === 'operation-form' || currentScreen === 'work-package-form'))

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                whileHover={{
                  x: 4,
                  transition: { duration: 0.2, ease: "easeOut" }
                }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className={`w-full justify-start gap-3 h-10 relative overflow-hidden ${
                    isActive
                      ? 'bg-primary/10 text-primary border-primary/20'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                  onClick={() => setCurrentScreen(item.screen)}
                >
                  {/* Active indicator */}
                  {isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-full"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}

                  {/* Icon with micro-animation */}
                  <motion.div
                    animate={isActive ? { scale: [1, 1.1, 1] } : {}}
                    transition={{ duration: 0.3 }}
                  >
                    <Icon className="h-4 w-4" />
                  </motion.div>

                  {/* Label with stagger effect */}
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.1 + 0.2 }}
                  >
                    {item.label}
                  </motion.span>

                  {/* Hover background effect */}
                  <motion.div
                    className="absolute inset-0 bg-primary/5 rounded-md"
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileHover={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.2 }}
                    style={{ zIndex: -1 }}
                  />
                </Button>
              </motion.div>
            )
          })}
        </div>
      </nav>

      {/* Footer Actions */}
      {onDelete && (
        <div className="p-4 border-t border-border">
          <Button
            variant="ghost"
            size="sm"
            onClick={onDelete}
            className="w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="h-4 w-4" />
            Delete Bloc
          </Button>
        </div>
      )}
    </div>
  )
}
