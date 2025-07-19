/**
 * Demo Data Hooks
 * TanStack Query hooks for demo-only system following best practices
 * Uses query options pattern and optimistic updates
 */

import { useQuery, useMutation, useQueryClient, useIsFetching, useIsMutating } from '@tanstack/react-query'
import { MockApiService } from '../services/mockApiService'
import { 
  masterDataQueries, 
  transactionalQueries, 
  sessionQueries, 
  analyticsQueries, 
  legacyQueries,
  queryUtils 
} from '../data/queryOptions'
import { queryKeys } from '../data/queryKeys'
import type { Farm, Company } from '../data/transactional/farms'

/**
 * Master Data Hooks
 */
export function useProducts() {
  return useQuery(masterDataQueries.products())
}

export function useLabourTypes() {
  return useQuery(masterDataQueries.labour())
}

export function useEquipmentTypes() {
  return useQuery(masterDataQueries.equipment())
}

export function useSugarcaneVarieties() {
  return useQuery(masterDataQueries.sugarcaneVarieties())
}

/**
 * Transactional Data Hooks
 */
export function useCompanies() {
  return useQuery(transactionalQueries.companies())
}

export function useFarms() {
  return useQuery(transactionalQueries.farms())
}

export function useFarmDetail(farmId: string) {
  return useQuery(transactionalQueries.farmDetail(farmId))
}

export function useFarmBlocs(farmId: string) {
  return useQuery(transactionalQueries.blocsByFarm(farmId))
}

/**
 * Bloc Data Hooks
 */
export function useBlocs() {
  return useQuery(transactionalQueries.blocs())
}

export function useBlocDetail(blocId: string) {
  return useQuery(transactionalQueries.blocDetail(blocId))
}

export function useBlocData(blocId: string) {
  return useQuery(transactionalQueries.blocComprehensive(blocId))
}

/**
 * Session Data Hooks
 */
export function useFilters() {
  return useQuery(sessionQueries.filters())
}

export function useSelections() {
  return useQuery(sessionQueries.selections())
}

/**
 * Analytics Hooks
 */
export function useDashboard() {
  return useQuery(analyticsQueries.dashboard())
}

export function useFarmSummary(farmId: string) {
  return useQuery(analyticsQueries.farmSummary(farmId))
}

/**
 * Legacy Compatibility Hooks
 */
export function useFarmGISData() {
  return useQuery(legacyQueries.farmGISInitial())
}

/**
 * Mutation Hooks with Optimistic Updates
 */
export function useCreateFarm() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (farmData: Omit<Farm, 'id' | 'createdAt' | 'updatedAt'>) => 
      MockApiService.createFarm(farmData),
    
    onMutate: async (newFarm) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.farms.all })

      // Snapshot previous value
      const previousFarms = queryClient.getQueryData(queryKeys.farms.all)

      // Optimistically update
      const optimisticFarm: Farm = {
        ...newFarm,
        id: `temp-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      queryClient.setQueryData(queryKeys.farms.all, (old: any) => {
        if (!old?.data) return { data: [optimisticFarm] }
        return { ...old, data: [...old.data, optimisticFarm] }
      })

      return { previousFarms, optimisticFarm }
    },

    onError: (err, newFarm, context) => {
      // Rollback on error
      if (context?.previousFarms) {
        queryClient.setQueryData(queryKeys.farms.all, context.previousFarms)
      }
    },

    onSuccess: (response, variables, context) => {
      // Replace optimistic update with real data
      queryClient.setQueryData(queryKeys.farms.all, (old: any) => {
        if (!old?.data) return { data: [response.data] }
        return {
          ...old,
          data: old.data.map((farm: Farm) => 
            farm.id === context?.optimisticFarm.id ? response.data : farm
          )
        }
      })
    },

    onSettled: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.farms.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.analytics.all })
    },
  })
}

export function useUpdateFarm() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ farmId, updates }: { farmId: string; updates: Partial<Farm> }) =>
      MockApiService.updateFarm(farmId, updates),

    onMutate: async ({ farmId, updates }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.farms.all })
      await queryClient.cancelQueries({ queryKey: queryKeys.farms.detail(farmId) })

      // Snapshot previous values
      const previousFarms = queryClient.getQueryData(queryKeys.farms.all)
      const previousFarm = queryClient.getQueryData(queryKeys.farms.detail(farmId))

      // Optimistically update farms list
      queryClient.setQueryData(queryKeys.farms.all, (old: any) => {
        if (!old?.data) return old
        return {
          ...old,
          data: old.data.map((farm: Farm) =>
            farm.id === farmId 
              ? { ...farm, ...updates, updatedAt: new Date().toISOString() }
              : farm
          )
        }
      })

      // Optimistically update farm detail
      queryClient.setQueryData(queryKeys.farms.detail(farmId), (old: any) => {
        if (!old?.data) return old
        return {
          ...old,
          data: { ...old.data, ...updates, updatedAt: new Date().toISOString() }
        }
      })

      return { previousFarms, previousFarm, farmId }
    },

    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousFarms) {
        queryClient.setQueryData(queryKeys.farms.all, context.previousFarms)
      }
      if (context?.previousFarm && context?.farmId) {
        queryClient.setQueryData(queryKeys.farms.detail(context.farmId), context.previousFarm)
      }
    },

    onSettled: (data, error, variables) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.farms.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.farms.detail(variables.farmId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.analytics.all })
    },
  })
}

export function useDeleteFarm() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (farmId: string) => MockApiService.deleteFarm(farmId),

    onMutate: async (farmId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.farms.all })

      // Snapshot previous value
      const previousFarms = queryClient.getQueryData(queryKeys.farms.all)

      // Optimistically remove farm
      queryClient.setQueryData(queryKeys.farms.all, (old: any) => {
        if (!old?.data) return old
        return {
          ...old,
          data: old.data.filter((farm: Farm) => farm.id !== farmId)
        }
      })

      return { previousFarms, farmId }
    },

    onError: (err, farmId, context) => {
      // Rollback on error
      if (context?.previousFarms) {
        queryClient.setQueryData(queryKeys.farms.all, context.previousFarms)
      }
    },

    onSettled: (data, error, farmId) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.farms.all })
      queryClient.removeQueries({ queryKey: queryKeys.farms.detail(farmId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.analytics.all })
    },
  })
}

/**
 * Session Mutation Hooks
 */
export function useUpdateFilters() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (filters: any) => MockApiService.setFilters(filters),
    
    onMutate: async (newFilters) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.session.filters() })
      const previousFilters = queryClient.getQueryData(queryKeys.session.filters())
      
      queryClient.setQueryData(queryKeys.session.filters(), { data: newFilters })
      
      return { previousFilters }
    },

    onError: (err, newFilters, context) => {
      if (context?.previousFilters) {
        queryClient.setQueryData(queryKeys.session.filters(), context.previousFilters)
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.session.filters() })
    },
  })
}

export function useUpdateSelections() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (selections: any) => MockApiService.setSelections(selections),
    
    onMutate: async (newSelections) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.session.selections() })
      const previousSelections = queryClient.getQueryData(queryKeys.session.selections())
      
      queryClient.setQueryData(queryKeys.session.selections(), { data: newSelections })
      
      return { previousSelections }
    },

    onError: (err, newSelections, context) => {
      if (context?.previousSelections) {
        queryClient.setQueryData(queryKeys.session.selections(), context.previousSelections)
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.session.selections() })
    },
  })
}

/**
 * Utility Hooks
 */
export function useLoadingStates() {
  const isFetchingFarms = useIsFetching({ queryKey: queryKeys.farms.all })
  const isFetchingMaster = useIsFetching({ queryKey: queryKeys.master.all })
  const isMutatingFarms = useIsMutating({ mutationKey: ['farms'] })

  return {
    isLoadingFarms: isFetchingFarms > 0,
    isLoadingMaster: isFetchingMaster > 0,
    isSaving: isMutatingFarms > 0,
    isLoading: isFetchingFarms > 0 || isFetchingMaster > 0,
  }
}

export function usePrefetchData() {
  const queryClient = useQueryClient()

  const prefetchAll = async () => {
    await Promise.all([
      queryUtils.prefetchMasterData(queryClient),
      queryUtils.prefetchTransactionalData(queryClient),
    ])
  }

  const clearAll = () => {
    queryUtils.clearAll(queryClient)
  }

  const invalidateAll = () => {
    queryUtils.invalidateAll(queryClient)
  }

  return {
    prefetchAll,
    clearAll,
    invalidateAll,
  }
}

/**
 * Demo Management Hooks
 */
export function useResetDemo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => MockApiService.resetData(),
    onSuccess: () => {
      queryClient.clear()
      window.location.reload()
    },
  })
}

export function useExportDemo() {
  return useMutation({
    mutationFn: () => MockApiService.exportData(),
    onSuccess: (data) => {
      const blob = new Blob([data], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `scanne-demo-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    },
  })
}

export function useImportDemo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (jsonData: string) => MockApiService.importData(jsonData),
    onSuccess: () => {
      queryClient.clear()
      window.location.reload()
    },
  })
}
