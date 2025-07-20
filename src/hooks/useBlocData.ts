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
    operations = operations.filter(op => op.crop_cycle_uuid === cropCycleId)
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
    workPackages = workPackages.filter(wp => wp.field_operation_uuid === operationId)
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
          bloc_id: request.bloc_id || blocId,
          type: request.type || 'plantation',
          cycle_number: previousData.cropCycles.length + 1,
          status: 'active',
          sugarcane_variety_id: request.sugarcane_variety_id || '',
          intercrop_variety_id: null,
          planting_date: request.planting_date || new Date().toISOString(),
          planned_harvest_date: request.planned_harvest_date || new Date().toISOString(),
          // expectedYield: request.expected_yield || 0, // Property doesn't exist in schema
          actual_harvest_date: null,
          expected_yield_tons_ha: 80,
          actual_yield_tons_ha: null,
          estimated_total_cost: 0,
          actual_total_cost: null,
          total_revenue: null,
          sugarcane_revenue: null,
          intercrop_revenue: null,
          net_profit: null,
          profit_per_hectare: null,
          profit_margin_percent: null,
          growth_stage: 'germination',
          days_since_planting: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
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
          uuid: `temp-operation-${Date.now()}`,
          crop_cycle_uuid: operationData.crop_cycle_uuid || '',
          operation_name: operationData.operation_name || 'New Operation',
          operation_type: operationData.operation_type || 'cultivation',
          method: operationData.method || null,
          priority: operationData.priority || 'normal',
          planned_start_date: operationData.planned_start_date || new Date().toISOString(),
          planned_end_date: operationData.planned_end_date || new Date().toISOString(),
          planned_area_hectares: operationData.planned_area_hectares || 0,
          actual_area_hectares: null,
          actual_start_date: null,
          actual_end_date: null,
          planned_quantity: null,
          actual_quantity: null,
          status: 'planned',
          completion_percentage: 0,
          estimated_total_cost: operationData.estimated_total_cost || 0,
          actual_total_cost: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
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
          uuid: `temp-wp-${Date.now()}`,
          field_operation_uuid: workPackageData.field_operation_uuid || '',
          package_name: workPackageData.package_name || null,
          work_date: workPackageData.work_date || new Date().toISOString().split('T')[0],
          shift: workPackageData.shift || 'day',
          planned_area_hectares: workPackageData.planned_area_hectares || null,
          actual_area_hectares: null,
          planned_quantity: workPackageData.planned_quantity || null,
          actual_quantity: null,
          status: 'not-started',
          start_time: null,
          end_time: null,
          duration_hours: null,
          weather_conditions: null,
          temperature_celsius: null,
          humidity_percent: null,
          wind_speed_kmh: null,
          notes: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
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
    }
  })
}
