/**
 * TanStack Query Client Configuration
 * Demo-only configuration optimized for performance and reliability
 */

import { createDemoQueryClient, initializeCachePersistence, getCacheManager } from './demoQueryClient'

// Create demo-optimized query client
export const queryClient = createDemoQueryClient()

// Initialize cache persistence
if (typeof window !== 'undefined') {
  initializeCachePersistence(queryClient).catch(error => {
    console.warn('Failed to initialize cache persistence:', error)
  })
}

// Export cache manager for debugging and utilities
export const cacheManager = getCacheManager(queryClient)

// Legacy compatibility - re-export cache manager utilities
export const demoQueryUtils = {
  clearCache: () => cacheManager.clearAll(),
  invalidateAll: () => cacheManager.refreshAll(),
  getCacheStats: () => cacheManager.getStats(),
  prefetchDemoData: async () => {
    const { queryUtils } = await import('../data/queryOptions')
    await Promise.all([
      queryUtils.prefetchMasterData(queryClient),
      queryUtils.prefetchTransactionalData(queryClient),
    ])
  },
  resetDemo: async () => {
    const { MockApiService } = await import('../services/mockApiService')
    await MockApiService.resetData()
    cacheManager.clearAll()
    window.location.reload()
  },
}

// Re-export query keys from new architecture
export { queryKeys } from '../data/queryKeys'

export default queryClient
