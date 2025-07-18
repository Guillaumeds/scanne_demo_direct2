/**
 * Global Loading Indicator
 * Shows loading state for all TanStack Query operations
 */

import React from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useGlobalLoading } from '@/hooks/useGlobalState'
import { Loader2 } from 'lucide-react'

export function GlobalLoadingIndicator() {
  const { isLoading, isFetching, isMutating, loadingText } = useGlobalLoading()

  if (!isLoading) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        transition={{ duration: 0.2 }}
        className="fixed top-4 right-4 z-50 bg-background/95 backdrop-blur-sm border rounded-lg shadow-lg p-3"
      >
        <div className="flex items-center gap-2 text-sm">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          <span className="text-muted-foreground">
            {loadingText || (isMutating ? 'Saving...' : 'Loading...')}
          </span>
          {isFetching && isMutating && (
            <span className="text-xs text-muted-foreground/70">
              (Syncing)
            </span>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

/**
 * Minimal loading indicator for specific components
 */
export function LoadingSpinner({ size = 'default', text }: { 
  size?: 'sm' | 'default' | 'lg'
  text?: string 
}) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    default: 'h-6 w-6',
    lg: 'h-8 w-8'
  }

  return (
    <div className="flex items-center justify-center gap-2 p-4">
      <Loader2 className={`animate-spin text-primary ${sizeClasses[size]}`} />
      {text && (
        <span className="text-sm text-muted-foreground">{text}</span>
      )}
    </div>
  )
}

/**
 * Full-screen loading overlay
 */
export function LoadingOverlay({ text = 'Loading...' }: { text?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center"
    >
      <div className="bg-card border rounded-lg shadow-lg p-6 flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">{text}</p>
      </div>
    </motion.div>
  )
}
