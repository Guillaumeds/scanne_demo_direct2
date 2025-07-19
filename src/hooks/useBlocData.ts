/**
 * Clean useBlocData.ts for Demo Mode
 * Optimized TanStack Query hooks for bloc data management
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { MockApiService } from '@/services/mockApiService'
import type { 
  Bloc, 
  CropCycle, 
  FieldOperation, 
  WorkPackage, 
  BlocData 
} from '@/data/transactional/blocs'

// Query keys for consistent cache management
export const blocDataKeys = {
  all: ['blocData'] as const,
  bloc: (blocId: string) => [...blocDataKeys.all, blocId] as const,
  cropCycles: (blocId: string) => [...blocDataKeys.bloc(blocId), 'cropCycles'] as const,
  fieldOperations: (blocId: string) => [...blocDataKeys.bloc(blocId), 'fieldOperations'] as const,
  workPackages: (blocId: string) => [...blocDataKeys.bloc(blocId), 'workPackages'] as const,
}

/**
 * Main hook for comprehensive bloc data
 * Loads ALL related data when bloc opens and keeps it in cache
 */
export function useBlocData(blocId: string) {
  return useQuery({
    queryKey: blocDataKeys.bloc(blocId),
    queryFn: async () => {
      const response = await MockApiService.getComprehensiveBlocData(blocId)
      return response.data
    },
    staleTime: 5 * 60 * 1000, // 5 minutes - data stays fresh
    gcTime: 30 * 60 * 1000, // 30 minutes - cache retention
    refetchOnWindowFocus: false, // Don't refetch on window focus
    refetchOnMount: false, // Don't refetch if data exists
    enabled: !!blocId,
  })
}

/**
 * Derived hook for crop cycles from cached bloc data
 */
export function useCropCycles(blocId: string) {
  const queryClient = useQueryClient()
  
  const blocData = queryClient.getQueryData<BlocData>(blocDataKeys.bloc(blocId))
  
  return {
    data: blocData?.cropCycles || [],
    isLoading: !blocData,
    error: null
  }
}

/**
 * Derived hook for field operations from cached bloc data
 */
export function useFieldOperations(blocId: string, cropCycleId?: string) {
  const queryClient = useQueryClient()
  
  const blocData = queryClient.getQueryData<BlocData>(blocDataKeys.bloc(blocId))
  
  let operations = blocData?.fieldOperations || []
  
  // Filter by crop cycle if specified
  if (cropCycleId) {
    operations = operations.filter(op => op.cropCycleId === cropCycleId)
  }
  
  return {
    data: operations,
    isLoading: !blocData,
    error: null
  }
}

/**
 * Derived hook for work packages from cached bloc data
 */
export function useWorkPackages(blocId: string, operationId?: string) {
  const queryClient = useQueryClient()
  
  const blocData = queryClient.getQueryData<BlocData>(blocDataKeys.bloc(blocId))
  
  let workPackages = blocData?.workPackages || []
  
  // Filter by operation if specified
  if (operationId) {
    workPackages = workPackages.filter(wp => wp.fieldOperationId === operationId)
  }
  
  return {
    data: workPackages,
    isLoading: !blocData,
    error: null
  }
}

/**
 * Create crop cycle mutation with optimistic updates
 */
export function useCreateCropCycle(blocId: string) {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (request: Partial<CropCycle>) => {
      const response = await MockApiService.createCropCycle(request)
      return response.data
    },
    
    onMutate: async (request) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: blocDataKeys.bloc(blocId) })
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData<BlocData>(blocDataKeys.bloc(blocId))
      
      // Optimistically update cache
      if (previousData) {
        const optimisticCropCycle: CropCycle = {
          id: `temp-${Date.now()}`,
          blocId: request.blocId || blocId,
          type: request.type || 'plantation',
          cycleNumber: previousData.cropCycles.length + 1,
          status: 'active',
          sugarcaneVarietyId: request.sugarcaneVarietyId || '',
          sugarcaneVarietyName: 'Loading...',
          plantingDate: request.plantingDate || new Date().toISOString(),
          plannedHarvestDate: request.plannedHarvestDate || new Date().toISOString(),
          expectedYield: request.expectedYield || 0,
          estimatedTotalCost: 0,
          actualTotalCost: 0,
          revenue: 0,
          netProfit: 0,
          profitPerHectare: 0,
          profitMarginPercent: 0,
          growthStage: 'planted',
          growthStageUpdatedAt: new Date().toISOString(),
          daysSincePlanting: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
        
        queryClient.setQueryData<BlocData>(blocDataKeys.bloc(blocId), {
          ...previousData,
          cropCycles: [optimisticCropCycle, ...previousData.cropCycles],
          activeCropCycle: optimisticCropCycle,
          lastUpdated: new Date().toISOString()
        })
      }
      
      return { previousData }
    },
    
    onSuccess: (newCropCycle, variables, context) => {
      const currentData = queryClient.getQueryData<BlocData>(blocDataKeys.bloc(blocId))
      
      if (currentData) {
        queryClient.setQueryData<BlocData>(blocDataKeys.bloc(blocId), {
          ...currentData,
          cropCycles: currentData.cropCycles.map(cycle =>
            cycle.id.startsWith('temp-') ? newCropCycle : cycle
          ),
          activeCropCycle: newCropCycle,
          lastUpdated: new Date().toISOString()
        })
      }
    },
    
    onError: (error, variables, context) => {
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData(blocDataKeys.bloc(blocId), context.previousData)
      }
    }
  })
}

/**
 * Create field operation mutation with optimistic updates
 */
export function useCreateFieldOperation(blocId: string) {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (operationData: Partial<FieldOperation>) => {
      const response = await MockApiService.createFieldOperation(operationData)
      return response.data
    },
    
    onMutate: async (operationData) => {
      await queryClient.cancelQueries({ queryKey: blocDataKeys.bloc(blocId) })
      
      const previousData = queryClient.getQueryData<BlocData>(blocDataKeys.bloc(blocId))
      
      if (previousData) {
        const optimisticOperation: FieldOperation = {
          id: `temp-operation-${Date.now()}`,
          cropCycleId: operationData.cropCycleId || '',
          blocId: operationData.blocId || blocId,
          type: operationData.type || 'cultivation',
          method: operationData.method || 'standard',
          status: 'planned',
          plannedStartDate: operationData.plannedStartDate || new Date().toISOString(),
          plannedEndDate: operationData.plannedEndDate || new Date().toISOString(),
          plannedArea: operationData.plannedArea || 0,
          progress: 0,
          estimatedCost: operationData.estimatedCost || 0,
          actualCost: 0,
          labourRequired: [],
          equipmentRequired: [],
          productsUsed: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
        
        queryClient.setQueryData<BlocData>(blocDataKeys.bloc(blocId), {
          ...previousData,
          fieldOperations: [...previousData.fieldOperations, optimisticOperation],
          lastUpdated: new Date().toISOString()
        })
      }
      
      return { previousData }
    },
    
    onSuccess: (newOperation, variables, context) => {
      const currentData = queryClient.getQueryData<BlocData>(blocDataKeys.bloc(blocId))
      
      if (currentData) {
        queryClient.setQueryData<BlocData>(blocDataKeys.bloc(blocId), {
          ...currentData,
          fieldOperations: currentData.fieldOperations.map(op =>
            op.id.startsWith('temp-operation-') ? newOperation : op
          ),
          lastUpdated: new Date().toISOString()
        })
      }
    },
    
    onError: (error, variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(blocDataKeys.bloc(blocId), context.previousData)
      }
    }
  })
}

/**
 * Create work package mutation with optimistic updates
 */
export function useCreateWorkPackage(blocId: string) {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (workPackageData: Partial<WorkPackage>) => {
      const response = await MockApiService.createWorkPackage(workPackageData)
      return response.data
    },
    
    onMutate: async (workPackageData) => {
      await queryClient.cancelQueries({ queryKey: blocDataKeys.bloc(blocId) })
      
      const previousData = queryClient.getQueryData<BlocData>(blocDataKeys.bloc(blocId))
      
      if (previousData) {
        const optimisticWorkPackage: WorkPackage = {
          id: `temp-wp-${Date.now()}`,
          fieldOperationId: workPackageData.fieldOperationId || '',
          date: workPackageData.date || new Date().toISOString(),
          area: workPackageData.area || 0,
          hours: workPackageData.hours || 0,
          cost: workPackageData.cost || 0,
          crew: workPackageData.crew || '',
          equipment: workPackageData.equipment || '',
          status: 'planned',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
        
        queryClient.setQueryData<BlocData>(blocDataKeys.bloc(blocId), {
          ...previousData,
          workPackages: [...previousData.workPackages, optimisticWorkPackage],
          lastUpdated: new Date().toISOString()
        })
      }
      
      return { previousData }
    },
    
    onSuccess: (newWorkPackage, variables, context) => {
      const currentData = queryClient.getQueryData<BlocData>(blocDataKeys.bloc(blocId))
      
      if (currentData) {
        queryClient.setQueryData<BlocData>(blocDataKeys.bloc(blocId), {
          ...currentData,
          workPackages: currentData.workPackages.map(wp =>
            wp.id.startsWith('temp-wp-') ? newWorkPackage : wp
          ),
          lastUpdated: new Date().toISOString()
        })
      }
    },
    
    onError: (error, variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(blocDataKeys.bloc(blocId), context.previousData)
      }
    }
  })
}
