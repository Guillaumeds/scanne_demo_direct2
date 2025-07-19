/**
 * Query Key Factory
 * Centralized query key management following TanStack Query best practices
 * Provides type-safe, hierarchical query keys for demo system
 */

export const queryKeys = {
  // Master data (static/rarely changes)
  master: {
    all: ['master'] as const,
    varieties: () => [...queryKeys.master.all, 'varieties'] as const,
    sugarcaneVarieties: () => [...queryKeys.master.varieties(), 'sugarcane'] as const,
    intercropVarieties: () => [...queryKeys.master.varieties(), 'intercrop'] as const,
    products: () => [...queryKeys.master.all, 'products'] as const,
    labour: () => [...queryKeys.master.all, 'labour'] as const,
    equipment: () => [...queryKeys.master.all, 'equipment'] as const,
  },

  // Transactional data (frequently updated)
  farms: {
    all: ['farms'] as const,
    list: (filters?: FarmFilters) => [...queryKeys.farms.all, 'list', filters] as const,
    detail: (id: string) => [...queryKeys.farms.all, 'detail', id] as const,
    blocs: (farmId: string) => [...queryKeys.farms.detail(farmId), 'blocs'] as const,
  },

  blocs: {
    all: ['blocs'] as const,
    list: (farmId?: string) => [...queryKeys.blocs.all, 'list', farmId] as const,
    detail: (id: string) => [...queryKeys.blocs.all, 'detail', id] as const,
    comprehensive: (id: string) => [...queryKeys.blocs.detail(id), 'comprehensive'] as const,
  },

  cropCycles: {
    all: ['cropCycles'] as const,
    list: (blocId?: string) => [...queryKeys.cropCycles.all, 'list', blocId] as const,
    detail: (id: string) => [...queryKeys.cropCycles.all, 'detail', id] as const,
    active: (blocId: string) => [...queryKeys.cropCycles.list(blocId), 'active'] as const,
  },

  fieldOperations: {
    all: ['fieldOperations'] as const,
    list: (cropCycleId?: string) => [...queryKeys.fieldOperations.all, 'list', cropCycleId] as const,
    detail: (id: string) => [...queryKeys.fieldOperations.all, 'detail', id] as const,
    byCropCycle: (cropCycleId: string) => [...queryKeys.fieldOperations.list(cropCycleId)] as const,
  },

  workPackages: {
    all: ['workPackages'] as const,
    list: (operationId?: string) => [...queryKeys.workPackages.all, 'list', operationId] as const,
    detail: (id: string) => [...queryKeys.workPackages.all, 'detail', id] as const,
    byOperation: (operationId: string) => [...queryKeys.workPackages.list(operationId)] as const,
  },

  // Derived/computed data
  analytics: {
    all: ['analytics'] as const,
    dashboard: () => [...queryKeys.analytics.all, 'dashboard'] as const,
    reports: (type: string) => [...queryKeys.analytics.all, 'reports', type] as const,
    farmSummary: (farmId: string) => [...queryKeys.analytics.all, 'farmSummary', farmId] as const,
    blocSummary: (blocId: string) => [...queryKeys.analytics.all, 'blocSummary', blocId] as const,
  },

  // Session data (temporary)
  session: {
    all: ['session'] as const,
    filters: () => [...queryKeys.session.all, 'filters'] as const,
    selections: () => [...queryKeys.session.all, 'selections'] as const,
    uiState: () => [...queryKeys.session.all, 'uiState'] as const,
  },

  // Legacy compatibility (for gradual migration)
  farmGIS: {
    all: ['farmGIS'] as const,
    initial: () => ['farmGIS', 'initial'] as const,
    bloc: (blocId: string) => ['farmGIS', 'bloc', blocId] as const,
  },

  config: {
    all: ['config'] as const,
    products: () => [...queryKeys.master.products()] as const,
    labour: () => [...queryKeys.master.labour()] as const,
    equipment: () => [...queryKeys.master.equipment()] as const,
    sugarcaneVarieties: () => [...queryKeys.master.sugarcaneVarieties()] as const,
    intercropVarieties: () => [...queryKeys.master.intercropVarieties()] as const,
  },
} as const

// Type definitions for filters
export interface FarmFilters {
  companyId?: string
  active?: boolean
  search?: string
}

export interface BlocFilters {
  farmId?: string
  active?: boolean
  hasActiveCropCycle?: boolean
}

export interface CropCycleFilters {
  blocId?: string
  status?: 'active' | 'completed' | 'planned'
  varietyId?: string
}

// Utility functions for query key management
export const queryKeyUtils = {
  /**
   * Invalidate all queries for a specific entity
   */
  invalidateEntity: (queryClient: any, entity: keyof typeof queryKeys) => {
    return queryClient.invalidateQueries({ queryKey: queryKeys[entity].all })
  },

  /**
   * Remove all queries for a specific entity
   */
  removeEntity: (queryClient: any, entity: keyof typeof queryKeys) => {
    return queryClient.removeQueries({ queryKey: queryKeys[entity].all })
  },

  /**
   * Prefetch common data
   */
  prefetchCommon: async (queryClient: any) => {
    const commonQueries = [
      queryKeys.master.products(),
      queryKeys.master.labour(),
      queryKeys.master.equipment(),
      queryKeys.master.sugarcaneVarieties(),
      queryKeys.farms.all,
    ]

    return Promise.all(
      commonQueries.map(queryKey => 
        queryClient.prefetchQuery({ queryKey })
      )
    )
  },
}
