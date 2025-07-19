'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { DrawnArea } from '@/types/drawnArea'
import { BlocProvider } from './contexts/BlocContext'
import { BlocLayout } from './layout/BlocLayout'
import { LoadingSpinner } from './shared/LoadingSpinner'
import { useBlocData } from '@/hooks/useDemoData'
import { useGlobalLoading } from '@/hooks/useGlobalState'

interface BlocScreenProps {
  bloc: DrawnArea
  onBack: () => void
  onDelete?: () => void
}

export function BlocScreen({ bloc, onBack, onDelete }: BlocScreenProps) {
  const [error, setError] = useState<string | null>(null)

  // Validate that bloc is saved and has UUID
  if (!bloc.uuid) {
    console.error('❌ BlocScreen: Bloc missing UUID', {
      bloc,
      localId: bloc.localId,
      isSaved: bloc.isSaved,
      hasUuid: !!bloc.uuid
    })

    // Instead of throwing an error, show an error state and navigate back immediately
    useEffect(() => {
      setError(`Cannot open bloc details: Bloc "${bloc.localId}" must be saved to database first`)
      // Auto-navigate back immediately
      console.log('🔄 Auto-navigating back due to missing UUID')
      onBack()
    }, [bloc.localId, onBack])

    // Show error state instead of throwing
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="h-full w-full flex items-center justify-center bg-background"
      >
        <div className="text-center">
          <div className="text-destructive text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-foreground mb-2">Cannot Open Bloc</h2>
          <p className="text-muted-foreground mb-4">
            Bloc "{bloc.localId}" must be saved to database first
          </p>
          <p className="text-sm text-muted-foreground">
            Returning to map view...
          </p>
        </div>
      </motion.div>
    )
  }

  // Use modern data hooks
  const {
    data: blocData,
    isLoading: blocDataLoading,
    error: blocDataError
  } = useBlocData(bloc.uuid)

  const { isLoading: globalLoading } = useGlobalLoading()

  const isLoading = blocDataLoading || globalLoading

  // Handle bloc data errors
  useEffect(() => {
    if (blocDataError) {
      console.error('❌ Bloc data error:', blocDataError)
      setError(`Failed to load bloc data: ${blocDataError.message}`)
    } else {
      setError(null)
    }
  }, [blocDataError])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{
        duration: 0.1,
        ease: "easeOut"
      }}
      className="h-full w-full"
    >
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="h-full w-full flex items-center justify-center bg-background"
          >
            <LoadingSpinner size="lg" message="Loading bloc data..." />
          </motion.div>
        ) : error ? (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="h-full w-full flex items-center justify-center bg-background"
          >
            <div className="text-center">
              <div className="text-destructive text-4xl mb-4">⚠️</div>
              <h2 className="text-xl font-bold text-foreground mb-2">Error Loading Bloc</h2>
              <p className="text-muted-foreground">{error}</p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.1 }}
            className="h-full w-full"
          >
            <BlocProvider bloc={bloc} onBack={onBack} onDelete={onDelete}>
              <BlocLayout />
            </BlocProvider>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
