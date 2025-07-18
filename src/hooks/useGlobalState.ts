/**
 * Global State Management Hook
 * Provides app-wide loading states, error handling, and cache management
 */

import { useQueryClient, useIsFetching, useIsMutating } from '@tanstack/react-query'
import { farmDataKeys } from '@/hooks/useModernFarmData'
import { useState, useEffect } from 'react'
import { z } from 'zod'

export interface GlobalError {
  id: string
  queryKey: readonly unknown[]
  error: Error
  timestamp: Date
  dismissed: boolean
}

export interface GlobalState {
  // Loading states
  isLoading: boolean
  isFetching: boolean
  isMutating: boolean
  
  // Error states
  hasErrors: boolean
  errors: GlobalError[]
  
  // Cache stats
  cacheStats: {
    totalQueries: number
    successQueries: number
    errorQueries: number
    loadingQueries: number
    staleCacheSize: string
  }
  
  // Actions
  dismissError: (errorId: string) => void
  clearAllErrors: () => void
  retryFailedQueries: () => void
  clearCache: () => void
  invalidateAll: () => void
}

/**
 * Global state hook for the entire application
 */
export function useGlobalState(): GlobalState {
  const queryClient = useQueryClient()
  const isFetching = useIsFetching()
  const isMutating = useIsMutating()
  
  const [dismissedErrors, setDismissedErrors] = useState<Set<string>>(new Set())
  
  // Get all queries and their states
  const queries = queryClient.getQueryCache().getAll()
  
  // Calculate error states
  const errorQueries = queries.filter(query => query.state.status === 'error')
  const errors: GlobalError[] = errorQueries.map(query => ({
    id: `${JSON.stringify(query.queryKey)}-${query.state.errorUpdateCount}`,
    queryKey: query.queryKey,
    error: query.state.error as Error,
    timestamp: new Date(query.state.errorUpdatedAt || Date.now()),
    dismissed: dismissedErrors.has(`${JSON.stringify(query.queryKey)}-${query.state.errorUpdateCount}`),
  }))
  
  // Calculate cache stats
  const cacheStats = {
    totalQueries: queries.length,
    successQueries: queries.filter(q => q.state.status === 'success').length,
    errorQueries: queries.filter(q => q.state.status === 'error').length,
    loadingQueries: queries.filter(q => q.state.status === 'pending').length,
    staleCacheSize: formatBytes(calculateCacheSize(queries)),
  }
  
  // Actions
  const dismissError = (errorId: string) => {
    setDismissedErrors(prev => new Set([...Array.from(prev), errorId]))
  }
  
  const clearAllErrors = () => {
    errorQueries.forEach(query => {
      queryClient.resetQueries({ queryKey: query.queryKey })
    })
    setDismissedErrors(new Set())
  }
  
  const retryFailedQueries = () => {
    errorQueries.forEach(query => {
      queryClient.refetchQueries({ queryKey: query.queryKey })
    })
  }
  
  const clearCache = () => {
    queryClient.clear()
    setDismissedErrors(new Set())
  }
  
  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: farmDataKeys.all })
  }
  
  return {
    // Loading states
    isLoading: isFetching > 0 || isMutating > 0,
    isFetching: isFetching > 0,
    isMutating: isMutating > 0,
    
    // Error states
    hasErrors: errors.filter(e => !e.dismissed).length > 0,
    errors,
    
    // Cache stats
    cacheStats,
    
    // Actions
    dismissError,
    clearAllErrors,
    retryFailedQueries,
    clearCache,
    invalidateAll,
  }
}

/**
 * Hook for displaying global loading indicator
 */
export function useGlobalLoading() {
  const { isLoading, isFetching, isMutating } = useGlobalState()
  
  return {
    isLoading,
    isFetching,
    isMutating,
    showSpinner: isLoading,
    loadingText: isMutating ? 'Saving...' : isFetching ? 'Loading...' : '',
  }
}

/**
 * Hook for global error handling
 */
export function useGlobalErrors() {
  const { hasErrors, errors, dismissError, clearAllErrors, retryFailedQueries } = useGlobalState()
  
  // Auto-dismiss validation errors after 10 seconds
  useEffect(() => {
    const validationErrors = errors.filter(
      error => error.error instanceof z.ZodError && !error.dismissed
    )
    
    if (validationErrors.length > 0) {
      const timer = setTimeout(() => {
        validationErrors.forEach(error => dismissError(error.id))
      }, 10000)
      
      return () => clearTimeout(timer)
    }
  }, [errors, dismissError])
  
  return {
    hasErrors,
    errors: errors.filter(e => !e.dismissed),
    dismissError,
    clearAllErrors,
    retryFailedQueries,
    
    // Categorized errors
    validationErrors: errors.filter(e => e.error instanceof z.ZodError && !e.dismissed),
    networkErrors: errors.filter(e => !(e.error instanceof z.ZodError) && !e.dismissed),
  }
}

/**
 * Hook for cache management and debugging
 */
export function useCacheManagement() {
  const { cacheStats, clearCache, invalidateAll } = useGlobalState()
  const queryClient = useQueryClient()
  
  const getQueryDetails = () => {
    const queries = queryClient.getQueryCache().getAll()
    return queries.map(query => ({
      queryKey: query.queryKey,
      status: query.state.status,
      dataUpdatedAt: new Date(query.state.dataUpdatedAt),
      errorUpdatedAt: query.state.errorUpdatedAt ? new Date(query.state.errorUpdatedAt) : null,
      fetchStatus: query.state.fetchStatus,
      isStale: query.isStale(),
      isInvalidated: query.state.isInvalidated,
    }))
  }
  
  const invalidateStaleQueries = () => {
    const queries = queryClient.getQueryCache().getAll()
    queries.forEach(query => {
      if (query.isStale()) {
        queryClient.invalidateQueries({ queryKey: query.queryKey })
      }
    })
  }
  
  return {
    cacheStats,
    clearCache,
    invalidateAll,
    invalidateStaleQueries,
    getQueryDetails,
    
    // Specific invalidations
    invalidateFarmData: () => queryClient.invalidateQueries({ queryKey: farmDataKeys.initial() }),
    invalidateBlocData: (blocId: string) => queryClient.invalidateQueries({ queryKey: farmDataKeys.bloc(blocId) }),
    invalidateConfigData: () => queryClient.invalidateQueries({ queryKey: farmDataKeys.config.all }),
  }
}

/**
 * Utility functions
 */
function calculateCacheSize(queries: any[]): number {
  // Rough estimation of cache size in bytes
  return queries.reduce((total, query) => {
    const dataSize = query.state.data ? JSON.stringify(query.state.data).length * 2 : 0 // UTF-16
    return total + dataSize
  }, 0)
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * Development-only hook for debugging
 */
export function useDevTools() {
  const queryClient = useQueryClient()
  
  if (process.env.NODE_ENV !== 'development') {
    return null
  }
  
  return {
    logCacheState: () => {
      const queries = queryClient.getQueryCache().getAll()
      console.group('🔍 TanStack Query Cache State')
      queries.forEach(query => {
        console.log(`Query: ${JSON.stringify(query.queryKey)}`, {
          status: query.state.status,
          data: query.state.data,
          error: query.state.error,
          isStale: query.isStale(),
          lastUpdated: new Date(query.state.dataUpdatedAt),
        })
      })
      console.groupEnd()
    },
    
    simulateError: (queryKey: readonly unknown[]) => {
      queryClient.setQueryData(queryKey, () => {
        throw new Error('Simulated error for testing')
      })
    },
    
    simulateNetworkDelay: (ms: number = 2000) => {
      console.log(`🐌 Simulating ${ms}ms network delay`)
      return new Promise(resolve => setTimeout(resolve, ms))
    },
  }
}
