/**
 * Simple React Hooks for LocalStorage Data
 * Replaces React Query with simple useState + useEffect + localStorage
 * No complex caching - just browser storage with loading states
 */

import { useState, useEffect } from 'react'
import { LocalStorageService } from '@/services/localStorageService'
import { SugarcaneVariety, InterCropPlant, CropVariety } from '@/types/varieties'
import { Product } from '@/types/products'
import { Resource } from '@/types/resources'

interface UseDataResult<T> {
  data: T | null
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
}

/**
 * Generic hook for data with localStorage + loading states
 */
function useLocalStorageData<T>(
  fetchFunction: () => Promise<T>,
  defaultValue: T
): UseDataResult<T> {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await fetchFunction()
      setData(result)
    } catch (err) {
      console.error('Error loading data:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
      setData(defaultValue) // Fallback to default
    } finally {
      setLoading(false)
    }
  }

  const refresh = async () => {
    await loadData()
  }

  useEffect(() => {
    loadData()
  }, [])

  return { data, loading, error, refresh }
}

/**
 * Hook for sugarcane varieties
 */
export function useSugarcaneVarieties(): UseDataResult<SugarcaneVariety[]> {
  return useLocalStorageData(
    () => LocalStorageService.getSugarcaneVarieties(),
    []
  )
}

/**
 * Hook for intercrop varieties
 */
export function useIntercropVarieties(): UseDataResult<InterCropPlant[]> {
  return useLocalStorageData(
    () => LocalStorageService.getIntercropVarieties(),
    []
  )
}

/**
 * Hook for all varieties (sugarcane + intercrop)
 */
export function useAllVarieties(): UseDataResult<CropVariety[]> {
  return useLocalStorageData(
    () => LocalStorageService.getAllVarieties(),
    []
  )
}

/**
 * Hook for products
 */
export function useProducts(): UseDataResult<Product[]> {
  return useLocalStorageData(
    () => LocalStorageService.getProducts(),
    []
  )
}

/**
 * Hook for resources
 */
export function useResources(): UseDataResult<Resource[]> {
  return useLocalStorageData(
    () => LocalStorageService.getResources(),
    []
  )
}

/**
 * Hook to refresh all configuration data
 */
export function useRefreshConfiguration() {
  const [refreshing, setRefreshing] = useState(false)

  const refreshAll = async () => {
    try {
      setRefreshing(true)
      await LocalStorageService.refreshData()
      // Force re-render of all components using the data
      window.location.reload()
    } catch (error) {
      console.error('Error refreshing configuration:', error)
    } finally {
      setRefreshing(false)
    }
  }

  return { refreshAll, refreshing }
}

/**
 * Hook for debugging localStorage
 */
export function useStorageDebug() {
  const [stats, setStats] = useState<Record<string, any>>({})

  const updateStats = () => {
    setStats(LocalStorageService.getStorageStats())
  }

  useEffect(() => {
    updateStats()
    // Update stats every 30 seconds
    const interval = setInterval(updateStats, 30000)
    return () => clearInterval(interval)
  }, [])

  return { stats, updateStats }
}
