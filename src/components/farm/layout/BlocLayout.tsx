'use client'

import React from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useBlocContext } from '../contexts/BlocContext'
import { BlocBreadcrumbs } from './BlocBreadcrumbs'
import { BlocSidebar } from './BlocSidebar'
import { InformationScreen } from '../information/InformationScreen'
import { OperationsScreen } from '../operations/OperationsScreen'
import { OperationForm } from '../forms/OperationForm'
import { WorkPackageForm } from '../forms/WorkPackageForm'
import CropCycleManagementScreen from '../CropCycleManagementScreen'

export function BlocLayout() {
  const { currentScreen, bloc } = useBlocContext()

  const renderContent = () => {
    switch (currentScreen) {
      case 'information':
        return <InformationScreen />
      case 'operations':
        return <OperationsScreen />
      case 'crop-cycle-management':
        return (
          <CropCycleManagementScreen
            blocId={bloc.uuid!}
            blocName={bloc.name || `Bloc ${bloc.localId}`}
            blocArea={bloc.area}
          />
        )
      case 'operation-form':
        return <OperationForm />
      case 'work-package-form':
        return <WorkPackageForm />
      default:
        return <InformationScreen />
    }
  }

  // Animation variants for different screen types
  const getAnimationVariants = (screen: string) => {
    switch (screen) {
      case 'information':
        return {
          initial: { opacity: 0, y: 20 },
          animate: { opacity: 1, y: 0 },
          exit: { opacity: 0, y: -20 }
        }
      case 'operations':
        return {
          initial: { opacity: 0, scale: 0.95 },
          animate: { opacity: 1, scale: 1 },
          exit: { opacity: 0, scale: 1.05 }
        }
      case 'crop-cycle-management':
        return {
          initial: { opacity: 0, y: 30 },
          animate: { opacity: 1, y: 0 },
          exit: { opacity: 0, y: -30 }
        }
      case 'operation-form':
      case 'work-package-form':
        return {
          initial: { opacity: 0, x: 300 },
          animate: { opacity: 1, x: 0 },
          exit: { opacity: 0, x: -300 }
        }
      default:
        return {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          exit: { opacity: 0 }
        }
    }
  }

  return (
    <motion.div
      className="h-full flex flex-col bg-background"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header with Breadcrumbs - Staggered Animation */}
      <motion.div
        className="border-b border-border bg-card"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <motion.div
          className="px-6 py-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <BlocBreadcrumbs />
        </motion.div>
      </motion.div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar Navigation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.1 }}
        >
          <BlocSidebar />
        </motion.div>

        {/* Content Area with Enhanced Animation */}
        <div className="flex-1 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentScreen}
              variants={getAnimationVariants(currentScreen)}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{
                duration: 0.1,
                ease: "easeOut"
              }}
              className="h-full"
              layout
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  )
}
