/**
 * Modern Farm Data Hooks
 * Unified data management with TanStack Query and Zod validation
 */

import { useQuery, useMutation, useQueryClient, useIsFetching, useIsMutating } from '@tanstack/react-query'
import { ValidatedApiService } from '@/services/validatedApiService'
import { z } from 'zod'
import type {
  FarmGISInitialData,
  BlocData,
  CropCycle,
  FieldOperation,
  WorkPackage,
  CreateCropCycleRequest,
  CreateFieldOperationRequest,
  CreateWorkPackageRequest,
} from '@/schemas/apiSchemas'

// Centralized query keys
export const farmDataKeys = {
  all: ['farmData'] as const,
  initial: () => [...farmDataKeys.all, 'initial'] as const,
  bloc: (blocId: string) => [...farmDataKeys.all, 'bloc', blocId] as const,
  config: {
    all: ['config'] as const,
    products: () => [...farmDataKeys.config.all, 'products'] as const,
    labour: () => [...farmDataKeys.config.all, 'labour'] as const,
    sugarcaneVarieties: () => [...farmDataKeys.config.all, 'sugarcane-varieties'] as const,
    intercropVarieties: () => [...farmDataKeys.config.all, 'intercrop-varieties'] as const,
  },
  health: () => [...farmDataKeys.all, 'health'] as const,
}

/**
 * Hook for initial farm GIS data (overview level)
 * Single call that fetches companies, farms, blocs, and active crop cycles
 */
export function useFarmGISData() {
  return useQuery({
    queryKey: farmDataKeys.initial(),
    queryFn: ValidatedApiService.fetchFarmGISInitialData,
    staleTime: 10 * 60 * 1000, // 10 minutes - overview data doesn't change often
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  })
}

/**
 * Hook for comprehensive bloc data (bloc level)
 * Single call that fetches all bloc-related data
 */
export function useBlocData(blocId: string) {
  return useQuery({
    queryKey: farmDataKeys.bloc(blocId),
    queryFn: () => ValidatedApiService.fetchComprehensiveBlocData(blocId),
    staleTime: 5 * 60 * 1000, // 5 minutes - bloc data changes more frequently
    gcTime: 30 * 60 * 1000, // 30 minutes
    enabled: !!blocId,
    retry: (failureCount, error) => {
      // Don't retry on validation errors
      if (error instanceof z.ZodError) return false
      return failureCount < 3
    },
  })
}

/**
 * Configuration data hooks with long cache times
 */
export function useProducts() {
  return useQuery({
    queryKey: farmDataKeys.config.products(),
    queryFn: ValidatedApiService.fetchProducts,
    staleTime: 60 * 60 * 1000, // 1 hour - config data rarely changes
    gcTime: 24 * 60 * 60 * 1000, // 24 hours
  })
}

export function useLabour() {
  return useQuery({
    queryKey: farmDataKeys.config.labour(),
    queryFn: ValidatedApiService.fetchLabour,
    staleTime: 60 * 60 * 1000, // 1 hour
    gcTime: 24 * 60 * 60 * 1000, // 24 hours
  })
}

export function useSugarcaneVarieties() {
  return useQuery({
    queryKey: farmDataKeys.config.sugarcaneVarieties(),
    queryFn: ValidatedApiService.fetchSugarcaneVarieties,
    staleTime: 60 * 60 * 1000, // 1 hour
    gcTime: 24 * 60 * 60 * 1000, // 24 hours
  })
}

export function useIntercropVarieties() {
  return useQuery({
    queryKey: farmDataKeys.config.intercropVarieties(),
    queryFn: ValidatedApiService.fetchIntercropVarieties,
    staleTime: 60 * 60 * 1000, // 1 hour
    gcTime: 24 * 60 * 60 * 1000, // 24 hours
  })
}

/**
 * Derived data hooks - get data from cache without additional API calls
 */
export function useCropCycles(blocId: string) {
  const queryClient = useQueryClient()
  const blocData = queryClient.getQueryData<BlocData>(farmDataKeys.bloc(blocId))
  
  return {
    data: blocData?.cropCycles || [],
    isLoading: !blocData,
    error: null,
  }
}

export function useFieldOperations(blocId: string, cropCycleId?: string) {
  const queryClient = useQueryClient()
  const blocData = queryClient.getQueryData<BlocData>(farmDataKeys.bloc(blocId))
  
  let operations = blocData?.fieldOperations || []
  
  // Filter by crop cycle if specified
  if (cropCycleId) {
    operations = operations.filter(op => op.crop_cycle_uuid === cropCycleId)
  }
  
  return {
    data: operations,
    isLoading: !blocData,
    error: null,
  }
}

export function useWorkPackages(blocId: string, operationId?: string) {
  const queryClient = useQueryClient()
  const blocData = queryClient.getQueryData<BlocData>(farmDataKeys.bloc(blocId))
  
  let workPackages = blocData?.workPackages || []
  
  // Filter by operation if specified
  if (operationId) {
    workPackages = workPackages.filter(wp => wp.field_operation_uuid === operationId)
  }
  
  return {
    data: workPackages,
    isLoading: !blocData,
    error: null,
  }
}

/**
 * Global state hooks
 */
export function useGlobalLoadingState() {
  const isFetching = useIsFetching()
  const isMutating = useIsMutating()
  
  return {
    isLoading: isFetching > 0 || isMutating > 0,
    isFetching: isFetching > 0,
    isMutating: isMutating > 0,
  }
}

export function useGlobalErrorState() {
  const queryClient = useQueryClient()
  const queries = queryClient.getQueryCache().getAll()
  
  const errorQueries = queries.filter(query => query.state.status === 'error')
  
  return {
    hasErrors: errorQueries.length > 0,
    errors: errorQueries.map(query => ({
      queryKey: query.queryKey,
      error: query.state.error,
    })),
    clearErrors: () => {
      errorQueries.forEach(query => {
        queryClient.resetQueries({ queryKey: query.queryKey })
      })
    },
  }
}

/**
 * API health check hook
 */
export function useApiHealth() {
  return useQuery({
    queryKey: farmDataKeys.health(),
    queryFn: ValidatedApiService.healthCheck,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 2 * 60 * 1000, // 2 minutes
    retry: 1,
  })
}

/**
 * Cache management utilities
 */
export function useCacheUtils() {
  const queryClient = useQueryClient()
  
  return {
    // Invalidate all farm data
    invalidateAll: () => {
      queryClient.invalidateQueries({ queryKey: farmDataKeys.all })
    },
    
    // Invalidate specific bloc data
    invalidateBloc: (blocId: string) => {
      queryClient.invalidateQueries({ queryKey: farmDataKeys.bloc(blocId) })
    },
    
    // Invalidate initial data
    invalidateInitial: () => {
      queryClient.invalidateQueries({ queryKey: farmDataKeys.initial() })
    },
    
    // Clear all cache
    clearCache: () => {
      queryClient.clear()
    },
    
    // Get cache stats
    getCacheStats: () => {
      const queries = queryClient.getQueryCache().getAll()
      return {
        totalQueries: queries.length,
        successQueries: queries.filter(q => q.state.status === 'success').length,
        errorQueries: queries.filter(q => q.state.status === 'error').length,
        loadingQueries: queries.filter(q => q.state.status === 'pending').length,
      }
    },
  }
}
