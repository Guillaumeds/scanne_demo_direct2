/**
 * Query Options Factory
 * Reusable query configurations following TanStack Query best practices
 * Provides consistent caching strategies and error handling for demo system
 */

import { queryOptions } from '@tanstack/react-query'
import { queryKeys } from './queryKeys'

// Cache time constants for different data types
export const CACHE_TIMES = {
  // Master data - rarely changes
  MASTER_STALE: 60 * 60 * 1000, // 1 hour
  MASTER_GC: 24 * 60 * 60 * 1000, // 24 hours

  // Transactional data - changes frequently
  TRANSACTIONAL_STALE: 5 * 60 * 1000, // 5 minutes
  TRANSACTIONAL_GC: 30 * 60 * 1000, // 30 minutes

  // Session data - temporary
  SESSION_STALE: 1 * 60 * 1000, // 1 minute
  SESSION_GC: 5 * 60 * 1000, // 5 minutes

  // Analytics - computed data
  ANALYTICS_STALE: 10 * 60 * 1000, // 10 minutes
  ANALYTICS_GC: 60 * 60 * 1000, // 1 hour
} as const

// Master data query options
export const masterDataQueries = {
  // Sugarcane varieties
  sugarcaneVarieties: () => queryOptions({
    queryKey: queryKeys.master.sugarcaneVarieties(),
    queryFn: async () => {
      const { SUGARCANE_VARIETIES } = await import('./master/sugarcaneVarieties')
      return SUGARCANE_VARIETIES.filter(v => v.active)
    },
    staleTime: CACHE_TIMES.MASTER_STALE,
    gcTime: CACHE_TIMES.MASTER_GC,
    retry: 1, // Master data is static, minimal retries
  }),

  // Products
  products: () => queryOptions({
    queryKey: queryKeys.master.products(),
    queryFn: async () => {
      const { PRODUCTS } = await import('./master/products')
      return PRODUCTS.filter(p => p.active)
    },
    staleTime: CACHE_TIMES.MASTER_STALE,
    gcTime: CACHE_TIMES.MASTER_GC,
    retry: 1,
  }),

  // Labour types
  labour: () => queryOptions({
    queryKey: queryKeys.master.labour(),
    queryFn: async () => {
      const { LABOUR_TYPES } = await import('./master/labour')
      return LABOUR_TYPES.filter(l => l.active)
    },
    staleTime: CACHE_TIMES.MASTER_STALE,
    gcTime: CACHE_TIMES.MASTER_GC,
    retry: 1,
  }),

  // Equipment types
  equipment: () => queryOptions({
    queryKey: queryKeys.master.equipment(),
    queryFn: async () => {
      const { EQUIPMENT_TYPES } = await import('./master/equipment')
      return EQUIPMENT_TYPES.filter(e => e.active)
    },
    staleTime: CACHE_TIMES.MASTER_STALE,
    gcTime: CACHE_TIMES.MASTER_GC,
    retry: 1,
  }),
}

// Transactional data query options
export const transactionalQueries = {
  // Companies
  companies: () => queryOptions({
    queryKey: queryKeys.farms.all,
    queryFn: async () => {
      const { DEMO_COMPANIES } = await import('./transactional/farms')
      return DEMO_COMPANIES.filter(c => c.active)
    },
    staleTime: CACHE_TIMES.TRANSACTIONAL_STALE,
    gcTime: CACHE_TIMES.TRANSACTIONAL_GC,
    retry: 2,
  }),

  // Farms
  farms: () => queryOptions({
    queryKey: queryKeys.farms.all,
    queryFn: async () => {
      const { DEMO_FARMS } = await import('./transactional/farms')
      return DEMO_FARMS.filter(f => f.active)
    },
    staleTime: CACHE_TIMES.TRANSACTIONAL_STALE,
    gcTime: CACHE_TIMES.TRANSACTIONAL_GC,
    retry: 2,
  }),

  // Farm detail
  farmDetail: (farmId: string) => queryOptions({
    queryKey: queryKeys.farms.detail(farmId),
    queryFn: async () => {
      const { DEMO_FARMS, farmUtils } = await import('./transactional/farms')
      const farm = farmUtils.getById(farmId, DEMO_FARMS)
      if (!farm) throw new Error(`Farm ${farmId} not found`)
      return farm
    },
    staleTime: CACHE_TIMES.TRANSACTIONAL_STALE,
    gcTime: CACHE_TIMES.TRANSACTIONAL_GC,
    retry: 2,
    enabled: !!farmId,
  }),

  // All blocs
  blocs: () => queryOptions({
    queryKey: queryKeys.blocs.all,
    queryFn: async () => {
      const { MockApiService } = await import('../services/mockApiService')
      const response = await MockApiService.getBlocs()
      return response.data
    },
    staleTime: CACHE_TIMES.TRANSACTIONAL_STALE,
    gcTime: CACHE_TIMES.TRANSACTIONAL_GC,
    retry: 2,
  }),

  // Bloc detail
  blocDetail: (blocId: string) => queryOptions({
    queryKey: queryKeys.blocs.detail(blocId),
    queryFn: async () => {
      const { MockApiService } = await import('../services/mockApiService')
      const response = await MockApiService.getBlocById(blocId)
      return response.data
    },
    staleTime: CACHE_TIMES.TRANSACTIONAL_STALE,
    gcTime: CACHE_TIMES.TRANSACTIONAL_GC,
    retry: 2,
    enabled: !!blocId,
  }),

  // Comprehensive bloc data (for BlocScreen)
  blocComprehensive: (blocId: string) => queryOptions({
    queryKey: queryKeys.blocs.comprehensive(blocId),
    queryFn: async () => {
      const { MockApiService } = await import('../services/mockApiService')
      const response = await MockApiService.getComprehensiveBlocData(blocId)
      return response.data
    },
    staleTime: CACHE_TIMES.TRANSACTIONAL_STALE,
    gcTime: CACHE_TIMES.TRANSACTIONAL_GC,
    retry: 2,
    enabled: !!blocId,
  }),

  // Blocs by farm
  blocsByFarm: (farmId: string) => queryOptions({
    queryKey: queryKeys.farms.blocs(farmId),
    queryFn: async () => {
      const { MockApiService } = await import('../services/mockApiService')
      const response = await MockApiService.getBlocsByFarm(farmId)
      return response.data
    },
    staleTime: CACHE_TIMES.TRANSACTIONAL_STALE,
    gcTime: CACHE_TIMES.TRANSACTIONAL_GC,
    retry: 2,
    enabled: !!farmId,
  }),
}

// Session data query options
export const sessionQueries = {
  // UI filters
  filters: () => queryOptions({
    queryKey: queryKeys.session.filters(),
    queryFn: () => {
      // Get filters from localStorage or return defaults
      const stored = localStorage.getItem('demo_filters')
      return stored ? JSON.parse(stored) : {
        farmId: null,
        blocId: null,
        cropCycleId: null,
        dateRange: null,
      }
    },
    staleTime: CACHE_TIMES.SESSION_STALE,
    gcTime: CACHE_TIMES.SESSION_GC,
    retry: 0, // Don't retry session data
  }),

  // User selections
  selections: () => queryOptions({
    queryKey: queryKeys.session.selections(),
    queryFn: () => {
      const stored = localStorage.getItem('demo_selections')
      return stored ? JSON.parse(stored) : {
        selectedFarms: [],
        selectedBlocs: [],
        selectedCropCycles: [],
      }
    },
    staleTime: CACHE_TIMES.SESSION_STALE,
    gcTime: CACHE_TIMES.SESSION_GC,
    retry: 0,
  }),
}

// Analytics query options
export const analyticsQueries = {
  // Dashboard summary
  dashboard: () => queryOptions({
    queryKey: queryKeys.analytics.dashboard(),
    queryFn: async () => {
      // Compute dashboard metrics from transactional data
      const { DEMO_FARMS } = await import('./transactional/farms')
      const { PRODUCTS } = await import('./master/products')
      
      return {
        totalFarms: DEMO_FARMS.length,
        totalArea: DEMO_FARMS.reduce((sum, farm) => sum + farm.area.total, 0),
        cultivatedArea: DEMO_FARMS.reduce((sum, farm) => sum + farm.area.cultivated, 0),
        totalProducts: PRODUCTS.filter(p => p.active).length,
        lastUpdated: new Date().toISOString(),
      }
    },
    staleTime: CACHE_TIMES.ANALYTICS_STALE,
    gcTime: CACHE_TIMES.ANALYTICS_GC,
    retry: 2,
  }),

  // Farm summary
  farmSummary: (farmId: string) => queryOptions({
    queryKey: queryKeys.analytics.farmSummary(farmId),
    queryFn: async () => {
      const { DEMO_FARMS, farmUtils } = await import('./transactional/farms')
      const farm = farmUtils.getById(farmId, DEMO_FARMS)
      if (!farm) throw new Error(`Farm ${farmId} not found`)
      
      return {
        farmId,
        name: farm.name,
        totalArea: farm.area.total,
        cultivatedArea: farm.area.cultivated,
        utilizationRate: (farm.area.cultivated / farm.area.total) * 100,
        blocCount: 0, // Will be computed when blocs are implemented
        activeCropCycles: 0, // Will be computed when crop cycles are implemented
        lastUpdated: new Date().toISOString(),
      }
    },
    staleTime: CACHE_TIMES.ANALYTICS_STALE,
    gcTime: CACHE_TIMES.ANALYTICS_GC,
    retry: 2,
    enabled: !!farmId,
  }),
}

// Legacy compatibility queries (for gradual migration)
export const legacyQueries = {
  // Farm GIS initial data
  farmGISInitial: () => queryOptions({
    queryKey: queryKeys.farmGIS.initial(),
    queryFn: async () => {
      console.log('🔍 farmGISInitial query executing...')
      const { MockApiService } = await import('../services/mockApiService')
      console.log('📦 MockApiService imported, calling getFarmGISInitialData...')
      const response = await MockApiService.getFarmGISInitialData()
      console.log('✅ getFarmGISInitialData response:', {
        success: response.success,
        dataKeys: Object.keys(response.data),
        blocsCount: response.data.blocs?.length || 0
      })
      return response.data
    },
    staleTime: CACHE_TIMES.TRANSACTIONAL_STALE,
    gcTime: CACHE_TIMES.TRANSACTIONAL_GC,
    retry: 2,
  }),
}

// Utility functions for query management
export const queryUtils = {
  /**
   * Prefetch all master data
   */
  prefetchMasterData: async (queryClient: any) => {
    return Promise.all([
      queryClient.prefetchQuery(masterDataQueries.products()),
      queryClient.prefetchQuery(masterDataQueries.labour()),
      queryClient.prefetchQuery(masterDataQueries.equipment()),
      queryClient.prefetchQuery(masterDataQueries.sugarcaneVarieties()),
    ])
  },

  /**
   * Prefetch common transactional data
   */
  prefetchTransactionalData: async (queryClient: any) => {
    return Promise.all([
      queryClient.prefetchQuery(transactionalQueries.companies()),
      queryClient.prefetchQuery(transactionalQueries.farms()),
    ])
  },

  /**
   * Invalidate all data for a fresh start
   */
  invalidateAll: (queryClient: any) => {
    return queryClient.invalidateQueries()
  },

  /**
   * Clear all cached data
   */
  clearAll: (queryClient: any) => {
    return queryClient.clear()
  },
}
