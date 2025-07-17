// TanStack Query hooks for optimal bloc data management
// Implements best practices: single data load, frontend caching, optimistic updates

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { BlocDataService, BlocData, FieldOperation, WorkPackage } from '@/services/blocDataService'
import { CropCycle, CreateCropCycleRequest } from '@/types/cropCycleManagement'

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
    queryFn: () => BlocDataService.fetchComprehensiveBlocData(blocId),
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
    operations = operations.filter(op => op.cropCycleUuid === cropCycleId)
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
    workPackages = workPackages.filter(wp => wp.fieldOperationUuid === operationId)
  }
  
  return {
    data: workPackages,
    isLoading: !blocData,
    error: null
  }
}

/**
 * Optimistic mutation for creating crop cycles
 * Updates cache immediately, syncs to DB, rolls back on error
 */
export function useCreateCropCycle(blocId: string) {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (request: CreateCropCycleRequest) => {
      // TODO: Implement actual API call when crop_cycles table is ready
      console.log('Creating crop cycle:', request)
      
      // Mock response for now
      const newCropCycle: CropCycle = {
        id: `crop-cycle-${Date.now()}`,
        blocId: request.blocId,
        type: request.type,
        cycleNumber: 1, // Calculate from existing cycles
        status: 'active',
        sugarcaneVarietyId: request.sugarcaneVarietyId,
        sugarcaneVarietyName: 'Mock Variety',
        sugarcaneePlantingDate: request.plantingDate,
        sugarcaneePlannedHarvestDate: request.expectedHarvestDate,
        sugarcaneExpectedYieldTonsHa: request.expectedYield,
        estimatedTotalCost: 0,
        actualTotalCost: 0,
        sugarcaneeRevenue: 0,
        totalRevenue: 0,
        netProfit: 0,
        profitPerHectare: 0,
        profitMarginPercent: 0,
        daysSincePlanting: 0,
        closureValidated: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      return newCropCycle
    },
    
    // Optimistic update
    onMutate: async (request) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: blocDataKeys.bloc(blocId) })
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData<BlocData>(blocDataKeys.bloc(blocId))
      
      // Optimistically update cache
      if (previousData) {
        const optimisticCropCycle: CropCycle = {
          id: `temp-${Date.now()}`,
          blocId: request.blocId,
          type: request.type,
          cycleNumber: previousData.cropCycles.length + 1,
          status: 'active',
          sugarcaneVarietyId: request.sugarcaneVarietyId,
          sugarcaneVarietyName: 'Loading...',
          sugarcaneePlantingDate: request.plantingDate,
          sugarcaneePlannedHarvestDate: request.expectedHarvestDate,
          sugarcaneExpectedYieldTonsHa: request.expectedYield,
          estimatedTotalCost: 0,
          actualTotalCost: 0,
          sugarcaneeRevenue: 0,
          totalRevenue: 0,
          netProfit: 0,
          profitPerHectare: 0,
          profitMarginPercent: 0,
          daysSincePlanting: 0,
          closureValidated: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
        
        queryClient.setQueryData<BlocData>(blocDataKeys.bloc(blocId), {
          ...previousData,
          cropCycles: [optimisticCropCycle, ...previousData.cropCycles],
          lastUpdated: new Date().toISOString()
        })
      }
      
      return { previousData }
    },
    
    // On success, replace optimistic data with server response
    onSuccess: (newCropCycle, variables, context) => {
      const currentData = queryClient.getQueryData<BlocData>(blocDataKeys.bloc(blocId))
      
      if (currentData) {
        queryClient.setQueryData<BlocData>(blocDataKeys.bloc(blocId), {
          ...currentData,
          cropCycles: currentData.cropCycles.map(cycle => 
            cycle.id.startsWith('temp-') ? newCropCycle : cycle
          ),
          lastUpdated: new Date().toISOString()
        })
      }
    },
    
    // On error, rollback to previous state
    onError: (error, variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(blocDataKeys.bloc(blocId), context.previousData)
      }
    },
  })
}

/**
 * Optimistic mutation for creating field operations
 */
export function useCreateFieldOperation(blocId: string) {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (operationData: Partial<FieldOperation>) => {
      // TODO: Implement actual API call
      console.log('Creating field operation:', operationData)
      
      const newOperation: FieldOperation = {
        uuid: `operation-${Date.now()}`,
        cropCycleUuid: operationData.cropCycleUuid!,
        operationName: operationData.operationName!,
        operationType: operationData.operationType!,
        method: operationData.method,
        priority: operationData.priority!,
        plannedStartDate: operationData.plannedStartDate!,
        plannedEndDate: operationData.plannedEndDate!,
        status: 'planned',
        completionPercentage: 0,
        estimatedTotalCost: operationData.estimatedTotalCost || 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...operationData
      }
      
      return newOperation
    },
    
    // Optimistic update
    onMutate: async (operationData) => {
      await queryClient.cancelQueries({ queryKey: blocDataKeys.bloc(blocId) })
      
      const previousData = queryClient.getQueryData<BlocData>(blocDataKeys.bloc(blocId))
      
      if (previousData) {
        const optimisticOperation: FieldOperation = {
          uuid: `temp-operation-${Date.now()}`,
          cropCycleUuid: operationData.cropCycleUuid!,
          operationName: operationData.operationName!,
          operationType: operationData.operationType!,
          method: operationData.method,
          priority: operationData.priority!,
          plannedStartDate: operationData.plannedStartDate!,
          plannedEndDate: operationData.plannedEndDate!,
          status: 'planned',
          completionPercentage: 0,
          estimatedTotalCost: operationData.estimatedTotalCost || 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          ...operationData
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
            op.uuid.startsWith('temp-operation-') ? newOperation : op
          ),
          lastUpdated: new Date().toISOString()
        })
      }
    },
    
    onError: (error, variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(blocDataKeys.bloc(blocId), context.previousData)
      }
    },
  })
}

/**
 * Optimistic mutation for creating work packages
 */
export function useCreateWorkPackage(blocId: string) {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (workPackageData: Partial<WorkPackage>) => {
      // TODO: Implement actual API call
      console.log('Creating work package:', workPackageData)
      
      const newWorkPackage: WorkPackage = {
        uuid: `work-package-${Date.now()}`,
        fieldOperationUuid: workPackageData.fieldOperationUuid!,
        workDate: workPackageData.workDate!,
        shift: workPackageData.shift || 'day',
        status: 'not-started',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...workPackageData
      }
      
      return newWorkPackage
    },
    
    // Optimistic update
    onMutate: async (workPackageData) => {
      await queryClient.cancelQueries({ queryKey: blocDataKeys.bloc(blocId) })
      
      const previousData = queryClient.getQueryData<BlocData>(blocDataKeys.bloc(blocId))
      
      if (previousData) {
        const optimisticWorkPackage: WorkPackage = {
          uuid: `temp-wp-${Date.now()}`,
          fieldOperationUuid: workPackageData.fieldOperationUuid!,
          workDate: workPackageData.workDate!,
          shift: workPackageData.shift || 'day',
          status: 'not-started',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          ...workPackageData
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
            wp.uuid.startsWith('temp-wp-') ? newWorkPackage : wp
          ),
          lastUpdated: new Date().toISOString()
        })
      }
    },
    
    onError: (error, variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(blocDataKeys.bloc(blocId), context.previousData)
      }
    },
  })
}

/**
 * Force refresh bloc data from database
 * Use sparingly - only when explicitly needed
 */
export function useRefreshBlocData(blocId: string) {
  const queryClient = useQueryClient()
  
  return () => {
    console.log('🔄 Force refreshing bloc data from database...')
    queryClient.invalidateQueries({ queryKey: blocDataKeys.bloc(blocId) })
  }
}
