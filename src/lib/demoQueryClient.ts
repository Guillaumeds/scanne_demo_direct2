/**
 * Demo Query Client Configuration
 * TanStack Query client optimized for demo-only system
 * Includes cache persistence, error handling, and performance optimizations
 */

import { QueryClient } from '@tanstack/react-query'
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'
import { persistQueryClient } from '@tanstack/react-query-persist-client'

// Cache configuration for demo mode
const DEMO_CACHE_CONFIG = {
  // Default cache times
  defaultStaleTime: 5 * 60 * 1000, // 5 minutes
  defaultGcTime: 30 * 60 * 1000, // 30 minutes
  
  // Retry configuration
  defaultRetryCount: 2,
  defaultRetryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
  
  // Persistence configuration
  persistenceKey: 'scanne-demo-cache',
  maxAge: 24 * 60 * 60 * 1000, // 24 hours
  
  // Performance settings
  maxQueries: 100, // Limit cache size for demo
  refetchOnWindowFocus: false, // Disable for demo stability
  refetchOnReconnect: false, // Disable for demo stability
} as const

/**
 * Create optimized query client for demo mode
 */
export function createDemoQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: DEMO_CACHE_CONFIG.defaultStaleTime,
        gcTime: DEMO_CACHE_CONFIG.defaultGcTime,
        retry: DEMO_CACHE_CONFIG.defaultRetryCount,
        retryDelay: DEMO_CACHE_CONFIG.defaultRetryDelay,
        refetchOnWindowFocus: DEMO_CACHE_CONFIG.refetchOnWindowFocus,
        refetchOnReconnect: DEMO_CACHE_CONFIG.refetchOnReconnect,
        refetchOnMount: false, // Use cached data when available
        
        // Error handling for demo mode
        throwOnError: false, // Don't throw errors in demo mode
        
        // Network mode for demo (always online)
        networkMode: 'always',
      },
      mutations: {
        retry: 1, // Minimal retries for mutations in demo
        retryDelay: 1000,
        
        // Error handling for mutations
        throwOnError: false,
        
        // Network mode for mutations
        networkMode: 'always',
      },
    },
  })
}

/**
 * Storage persister for demo cache
 */
export function createDemoPersister() {
  if (typeof window === 'undefined') {
    return null // No persistence on server side
  }

  try {
    return createSyncStoragePersister({
      storage: window.localStorage,
      key: DEMO_CACHE_CONFIG.persistenceKey,
      
      // Serialize/deserialize functions for better performance
      serialize: JSON.stringify,
      deserialize: JSON.parse,
      
      // No retry in demo mode for simplicity
    })
  } catch (error) {
    console.warn('Failed to create cache persister:', error)
    return null
  }
}

/**
 * Initialize cache persistence
 */
export async function initializeCachePersistence(queryClient: QueryClient) {
  const persister = createDemoPersister()
  
  if (!persister) {
    console.log('Cache persistence not available')
    return
  }

  try {
    await persistQueryClient({
      queryClient,
      persister,
      maxAge: DEMO_CACHE_CONFIG.maxAge,
      
      // Buster for cache invalidation when demo version changes
      buster: 'demo-v2.0.0',
      
      // Dehydrate options
      dehydrateOptions: {
        shouldDehydrateQuery: (query) => {
          // Only persist certain query types
          const queryKey = query.queryKey[0] as string
          
          // Persist master data and transactional data
          const persistableKeys = ['master', 'farms', 'companies', 'blocs', 'cropCycles']
          const shouldPersist = persistableKeys.some(key => queryKey.includes(key))
          
          // Don't persist session data or analytics
          const sessionKeys = ['session', 'analytics', 'filters', 'selections']
          const isSession = sessionKeys.some(key => queryKey.includes(key))
          
          return shouldPersist && !isSession && query.state.status === 'success'
        },
      },
    })
    
    console.log('Cache persistence initialized successfully')
  } catch (error) {
    console.warn('Failed to initialize cache persistence:', error)
  }
}

/**
 * Cache management utilities
 */
export class DemoCacheManager {
  private queryClient: QueryClient

  constructor(queryClient: QueryClient) {
    this.queryClient = queryClient
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const cache = this.queryClient.getQueryCache()
    const queries = cache.getAll()
    
    const stats = {
      totalQueries: queries.length,
      successfulQueries: queries.filter(q => q.state.status === 'success').length,
      errorQueries: queries.filter(q => q.state.status === 'error').length,
      loadingQueries: queries.filter(q => q.state.status === 'pending').length,
      staleQueries: queries.filter(q => q.isStale()).length,
      cacheSize: this.estimateCacheSize(),
      oldestQuery: this.getOldestQuery(),
      newestQuery: this.getNewestQuery(),
    }
    
    return stats
  }

  /**
   * Estimate cache size in bytes
   */
  private estimateCacheSize(): number {
    try {
      const cache = this.queryClient.getQueryCache()
      const queries = cache.getAll()
      
      let totalSize = 0
      queries.forEach(query => {
        if (query.state.data) {
          const serialized = JSON.stringify(query.state.data)
          totalSize += new Blob([serialized]).size
        }
      })
      
      return totalSize
    } catch (error) {
      console.warn('Failed to estimate cache size:', error)
      return 0
    }
  }

  /**
   * Get oldest query timestamp
   */
  private getOldestQuery(): Date | null {
    const cache = this.queryClient.getQueryCache()
    const queries = cache.getAll()
    
    if (queries.length === 0) return null
    
    const oldest = queries.reduce((oldest, query) => {
      return query.state.dataUpdatedAt < oldest.state.dataUpdatedAt ? query : oldest
    })
    
    return new Date(oldest.state.dataUpdatedAt)
  }

  /**
   * Get newest query timestamp
   */
  private getNewestQuery(): Date | null {
    const cache = this.queryClient.getQueryCache()
    const queries = cache.getAll()
    
    if (queries.length === 0) return null
    
    const newest = queries.reduce((newest, query) => {
      return query.state.dataUpdatedAt > newest.state.dataUpdatedAt ? query : newest
    })
    
    return new Date(newest.state.dataUpdatedAt)
  }

  /**
   * Clean up stale queries
   */
  cleanupStaleQueries() {
    const cache = this.queryClient.getQueryCache()
    const queries = cache.getAll()
    
    let removedCount = 0
    queries.forEach(query => {
      if (query.isStale() && query.getObserversCount() === 0) {
        cache.remove(query)
        removedCount++
      }
    })
    
    console.log(`Cleaned up ${removedCount} stale queries`)
    return removedCount
  }

  /**
   * Clear cache by pattern
   */
  clearByPattern(pattern: string) {
    const cache = this.queryClient.getQueryCache()
    const queries = cache.getAll()
    
    let removedCount = 0
    queries.forEach(query => {
      const queryKey = query.queryKey.join('.')
      if (queryKey.includes(pattern)) {
        cache.remove(query)
        removedCount++
      }
    })
    
    console.log(`Cleared ${removedCount} queries matching pattern: ${pattern}`)
    return removedCount
  }

  /**
   * Force refresh all queries
   */
  async refreshAll() {
    await this.queryClient.invalidateQueries()
    console.log('Refreshed all queries')
  }

  /**
   * Clear all cache data
   */
  clearAll() {
    this.queryClient.clear()
    console.log('Cleared all cache data')
  }

  /**
   * Get query details for debugging
   */
  getQueryDetails(queryKey: string[]) {
    const query = this.queryClient.getQueryCache().find({ queryKey })
    
    if (!query) {
      return null
    }
    
    return {
      queryKey: query.queryKey,
      status: query.state.status,
      data: query.state.data,
      error: query.state.error,
      dataUpdatedAt: new Date(query.state.dataUpdatedAt),
      errorUpdatedAt: new Date(query.state.errorUpdatedAt),
      fetchStatus: query.state.fetchStatus,
      isStale: query.isStale(),
      observersCount: query.getObserversCount(),
    }
  }

  /**
   * Monitor cache performance
   */
  startPerformanceMonitoring() {
    const interval = setInterval(() => {
      const stats = this.getStats()
      
      // Log warnings for performance issues
      if (stats.totalQueries > DEMO_CACHE_CONFIG.maxQueries) {
        console.warn(`Cache has ${stats.totalQueries} queries (max: ${DEMO_CACHE_CONFIG.maxQueries})`)
        this.cleanupStaleQueries()
      }
      
      if (stats.cacheSize > 10 * 1024 * 1024) { // 10MB
        console.warn(`Cache size is ${(stats.cacheSize / 1024 / 1024).toFixed(2)}MB`)
      }
      
      if (stats.errorQueries > 5) {
        console.warn(`${stats.errorQueries} queries have errors`)
      }
    }, 60000) // Check every minute
    
    // Return cleanup function
    return () => clearInterval(interval)
  }
}

/**
 * Global cache manager instance
 */
let globalCacheManager: DemoCacheManager | null = null

export function getCacheManager(queryClient?: QueryClient): DemoCacheManager {
  if (!globalCacheManager && queryClient) {
    globalCacheManager = new DemoCacheManager(queryClient)
  }
  
  if (!globalCacheManager) {
    throw new Error('Cache manager not initialized. Provide a QueryClient instance.')
  }
  
  return globalCacheManager
}
