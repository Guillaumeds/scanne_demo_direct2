/**
 * Modern Mutation Hooks with Optimistic Updates
 * Complete implementation of all CRUD operations with proper error handling
 */

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ValidatedApiService } from '@/services/validatedApiService'
import { farmDataKeys } from '@/hooks/useModernFarmData'
import { z } from 'zod'
import type {
  BlocData,
  CropCycle,
  FieldOperation,
  WorkPackage,
  CreateCropCycleRequest,
  CreateFieldOperationRequest,
  CreateWorkPackageRequest,
} from '@/schemas/apiSchemas'

/**
 * Create Crop Cycle with Optimistic Update
 */
export function useCreateCropCycle(blocId: string) {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (data: CreateCropCycleRequest) => {
      console.log('🔄 Creating crop cycle...', data)
      return ValidatedApiService.createCropCycle(data)
    },
    
    // Optimistic update - immediately add to UI
    onMutate: async (newCycleData) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: farmDataKeys.bloc(blocId) })
      
      // Snapshot the previous value
      const previousBlocData = queryClient.getQueryData<BlocData>(farmDataKeys.bloc(blocId))
      
      // Optimistically update the cache
      if (previousBlocData) {
        const optimisticCycle: CropCycle = {
          id: `temp-${Date.now()}`,
          bloc_id: blocId,
          type: newCycleData.type,
          cycle_number: (previousBlocData.cropCycles?.length || 0) + 1,
          status: 'active',
          sugarcane_variety_id: newCycleData.sugarcaneVarietyId,
          intercrop_variety_id: newCycleData.intercropVarietyId,
          planting_date: newCycleData.plantingDate,
          planned_harvest_date: newCycleData.expectedHarvestDate,
          actual_harvest_date: null,
          expected_yield_tons_ha: newCycleData.expectedYield,
          actual_yield_tons_ha: null,
          estimated_total_cost: 0,
          actual_total_cost: null,
          total_revenue: null,
          sugarcane_revenue: null,
          intercrop_revenue: null,
          net_profit: null,
          profit_per_hectare: null,
          profit_margin_percent: null,
          growth_stage: null,
          days_since_planting: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
        
        queryClient.setQueryData<BlocData>(farmDataKeys.bloc(blocId), {
          ...previousBlocData,
          cropCycles: [optimisticCycle, ...previousBlocData.cropCycles],
          lastUpdated: new Date().toISOString(),
        })
      }
      
      return { previousBlocData }
    },
    
    // Replace optimistic data with real data on success
    onSuccess: (newCycle, variables, context) => {
      console.log('✅ Crop cycle created successfully:', newCycle)
      
      const currentData = queryClient.getQueryData<BlocData>(farmDataKeys.bloc(blocId))
      
      if (currentData) {
        queryClient.setQueryData<BlocData>(farmDataKeys.bloc(blocId), {
          ...currentData,
          cropCycles: currentData.cropCycles.map(cycle => 
            cycle.id.startsWith('temp-') ? newCycle : cycle
          ),
          lastUpdated: new Date().toISOString(),
        })
      }
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: farmDataKeys.initial() })
    },
    
    // Rollback on error
    onError: (error, variables, context) => {
      console.error('❌ Failed to create crop cycle:', error)
      
      if (context?.previousBlocData) {
        queryClient.setQueryData(farmDataKeys.bloc(blocId), context.previousBlocData)
      }
    },
  })
}

/**
 * Create Field Operation with Optimistic Update
 */
export function useCreateFieldOperation(blocId: string) {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (data: CreateFieldOperationRequest) => {
      console.log('🔄 Creating field operation...', data)
      return ValidatedApiService.createFieldOperation(data)
    },
    
    onMutate: async (newOperationData) => {
      await queryClient.cancelQueries({ queryKey: farmDataKeys.bloc(blocId) })
      
      const previousBlocData = queryClient.getQueryData<BlocData>(farmDataKeys.bloc(blocId))
      
      if (previousBlocData) {
        const optimisticOperation: FieldOperation = {
          uuid: `temp-${Date.now()}`,
          crop_cycle_uuid: newOperationData.cropCycleUuid,
          operation_name: newOperationData.operationName,
          operation_type: newOperationData.operationType,
          method: newOperationData.method,
          priority: newOperationData.priority,
          planned_start_date: newOperationData.plannedStartDate,
          planned_end_date: newOperationData.plannedEndDate,
          actual_start_date: null,
          actual_end_date: null,
          planned_area_hectares: newOperationData.plannedAreaHectares,
          actual_area_hectares: null,
          planned_quantity: newOperationData.plannedQuantity,
          actual_quantity: null,
          status: 'planned',
          completion_percentage: 0,
          estimated_total_cost: newOperationData.estimatedTotalCost,
          actual_total_cost: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
        
        queryClient.setQueryData<BlocData>(farmDataKeys.bloc(blocId), {
          ...previousBlocData,
          fieldOperations: [...previousBlocData.fieldOperations, optimisticOperation],
          lastUpdated: new Date().toISOString(),
        })
      }
      
      return { previousBlocData }
    },
    
    onSuccess: (newOperation, variables, context) => {
      console.log('✅ Field operation created successfully:', newOperation)
      
      const currentData = queryClient.getQueryData<BlocData>(farmDataKeys.bloc(blocId))
      
      if (currentData) {
        queryClient.setQueryData<BlocData>(farmDataKeys.bloc(blocId), {
          ...currentData,
          fieldOperations: currentData.fieldOperations.map(op => 
            op.uuid.startsWith('temp-') ? newOperation : op
          ),
          lastUpdated: new Date().toISOString(),
        })
      }
    },
    
    onError: (error, variables, context) => {
      console.error('❌ Failed to create field operation:', error)
      
      if (context?.previousBlocData) {
        queryClient.setQueryData(farmDataKeys.bloc(blocId), context.previousBlocData)
      }
    },
  })
}

/**
 * Create Work Package with Optimistic Update
 */
export function useCreateWorkPackage(blocId: string) {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (data: CreateWorkPackageRequest) => {
      console.log('🔄 Creating work package...', data)
      return ValidatedApiService.createWorkPackage(data)
    },
    
    onMutate: async (newPackageData) => {
      await queryClient.cancelQueries({ queryKey: farmDataKeys.bloc(blocId) })
      
      const previousBlocData = queryClient.getQueryData<BlocData>(farmDataKeys.bloc(blocId))
      
      if (previousBlocData) {
        const optimisticPackage: WorkPackage = {
          uuid: `temp-${Date.now()}`,
          field_operation_uuid: newPackageData.fieldOperationUuid,
          package_name: null,
          work_date: newPackageData.workDate,
          shift: newPackageData.shift,
          planned_area_hectares: newPackageData.plannedAreaHectares,
          actual_area_hectares: null,
          planned_quantity: newPackageData.plannedQuantity,
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
          updated_at: new Date().toISOString(),
        }
        
        queryClient.setQueryData<BlocData>(farmDataKeys.bloc(blocId), {
          ...previousBlocData,
          workPackages: [...previousBlocData.workPackages, optimisticPackage],
          lastUpdated: new Date().toISOString(),
        })
      }
      
      return { previousBlocData }
    },
    
    onSuccess: (newPackage, variables, context) => {
      console.log('✅ Work package created successfully:', newPackage)
      
      const currentData = queryClient.getQueryData<BlocData>(farmDataKeys.bloc(blocId))
      
      if (currentData) {
        queryClient.setQueryData<BlocData>(farmDataKeys.bloc(blocId), {
          ...currentData,
          workPackages: currentData.workPackages.map(pkg => 
            pkg.uuid.startsWith('temp-') ? newPackage : pkg
          ),
          lastUpdated: new Date().toISOString(),
        })
      }
    },
    
    onError: (error, variables, context) => {
      console.error('❌ Failed to create work package:', error)
      
      if (context?.previousBlocData) {
        queryClient.setQueryData(farmDataKeys.bloc(blocId), context.previousBlocData)
      }
    },
  })
}

/**
 * Update Field Operation with Optimistic Update
 */
export function useUpdateFieldOperation(blocId: string) {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ uuid, data }: { uuid: string; data: Partial<CreateFieldOperationRequest> }) => {
      console.log('🔄 Updating field operation...', uuid, data)
      return ValidatedApiService.updateFieldOperation(uuid, data)
    },
    
    onMutate: async ({ uuid, data }) => {
      await queryClient.cancelQueries({ queryKey: farmDataKeys.bloc(blocId) })
      
      const previousBlocData = queryClient.getQueryData<BlocData>(farmDataKeys.bloc(blocId))
      
      if (previousBlocData) {
        queryClient.setQueryData<BlocData>(farmDataKeys.bloc(blocId), {
          ...previousBlocData,
          fieldOperations: previousBlocData.fieldOperations.map(op => 
            op.uuid === uuid 
              ? { ...op, ...data, updated_at: new Date().toISOString() }
              : op
          ),
          lastUpdated: new Date().toISOString(),
        })
      }
      
      return { previousBlocData }
    },
    
    onSuccess: (updatedOperation) => {
      console.log('✅ Field operation updated successfully:', updatedOperation)
    },
    
    onError: (error, variables, context) => {
      console.error('❌ Failed to update field operation:', error)
      
      if (context?.previousBlocData) {
        queryClient.setQueryData(farmDataKeys.bloc(blocId), context.previousBlocData)
      }
    },
  })
}

/**
 * Delete Field Operation with Optimistic Update
 */
export function useDeleteFieldOperation(blocId: string) {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (uuid: string) => {
      console.log('🔄 Deleting field operation...', uuid)
      return ValidatedApiService.deleteFieldOperation(uuid)
    },
    
    onMutate: async (uuid) => {
      await queryClient.cancelQueries({ queryKey: farmDataKeys.bloc(blocId) })
      
      const previousBlocData = queryClient.getQueryData<BlocData>(farmDataKeys.bloc(blocId))
      
      if (previousBlocData) {
        queryClient.setQueryData<BlocData>(farmDataKeys.bloc(blocId), {
          ...previousBlocData,
          fieldOperations: previousBlocData.fieldOperations.filter(op => op.uuid !== uuid),
          workPackages: previousBlocData.workPackages.filter(pkg => pkg.field_operation_uuid !== uuid),
          lastUpdated: new Date().toISOString(),
        })
      }
      
      return { previousBlocData }
    },
    
    onSuccess: () => {
      console.log('✅ Field operation deleted successfully')
    },
    
    onError: (error, variables, context) => {
      console.error('❌ Failed to delete field operation:', error)
      
      if (context?.previousBlocData) {
        queryClient.setQueryData(farmDataKeys.bloc(blocId), context.previousBlocData)
      }
    },
  })
}
