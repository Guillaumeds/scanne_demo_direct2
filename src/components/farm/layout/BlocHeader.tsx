'use client'

import React from 'react'
import { motion } from 'motion/react'
import { Plus, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useBlocContext } from '../contexts/BlocContext'

export function BlocHeader() {
  const { currentScreen, setCurrentScreen } = useBlocContext()

  const getHeaderContent = () => {
    switch (currentScreen) {
      case 'information':
        return {
          title: 'Bloc Information',
          description: 'View and manage bloc details, crop cycles, and key metrics',
          actions: (
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Edit Bloc
            </Button>
          )
        }
      
      case 'operations':
        return {
          title: 'Field Operations',
          description: 'Manage field operations and daily work packages',
          actions: (
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setCurrentScreen('work-package-form')}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Work Package
              </Button>
              <Button 
                size="sm"
                onClick={() => setCurrentScreen('operation-form')}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Operation
              </Button>
            </div>
          )
        }
      
      case 'operation-form':
        return {
          title: 'Field Operation',
          description: 'Create or edit field operation details',
          actions: null
        }
      
      case 'work-package-form':
        return {
          title: 'Daily Work Package',
          description: 'Create or edit daily work package details',
          actions: null
        }
      
      default:
        return {
          title: 'Bloc Management',
          description: 'Manage your agricultural bloc',
          actions: null
        }
    }
  }

  const { title, description, actions } = getHeaderContent()

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: 0.1 }}
      className="px-6 py-4 bg-muted/30"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{title}</h1>
          <p className="text-muted-foreground mt-1">{description}</p>
        </div>
        {actions && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2, delay: 0.2 }}
          >
            {actions}
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}
