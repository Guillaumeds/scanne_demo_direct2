/**
 * Demo Farm Data Hooks
 * TanStack Query hooks optimized for demo mode with localStorage persistence
 * Replaces database-dependent hooks with localStorage-based equivalents
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { DemoApiService } from '@/services/demoApiService'
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

// Query keys for demo data
export const demoQueryKeys = {
  farmGIS: {
    all: ['demo-farm-gis'] as const,
    bloc: (blocId: string) => ['demo-farm-gis', 'bloc', blocId] as const,
  },
  cropCycles: {
    all: ['demo-crop-cycles'] as const,
    byBloc: (blocId: string) => ['demo-crop-cycles', 'bloc', blocId] as const,
  },
  fieldOperations: {
    all: ['demo-field-operations'] as const,
    byCycle: (cycleId: string) => ['demo-field-operations', 'cycle', cycleId] as const,
  },
  workPackages: {
    all: ['demo-work-packages'] as const,
    byOperation: (operationId: string) => ['demo-work-packages', 'operation', operationId] as const,
  },
}

/**
 * Fetch initial farm GIS data for demo mode
 */
export function useDemoFarmGISInitialData() {
  return useQuery({
    queryKey: demoQueryKeys.farmGIS.all,
    queryFn: () => DemoApiService.fetchFarmGISInitialData(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}

/**
 * Fetch comprehensive bloc data for demo mode
 */
export function useDemoComprehensiveBlocData(blocId: string) {
  return useQuery({
    queryKey: demoQueryKeys.farmGIS.bloc(blocId),
    queryFn: () => DemoApiService.fetchComprehensiveBlocData(blocId),
    enabled: !!blocId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Create crop cycle mutation for demo mode
 */
export function useDemoCreateCropCycle() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (request: CreateCropCycleRequest) => DemoApiService.createCropCycle(request),
    onSuccess: (newCycle) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: demoQueryKeys.farmGIS.all })
      queryClient.invalidateQueries({ queryKey: demoQueryKeys.farmGIS.bloc(newCycle.bloc_id) })
      queryClient.invalidateQueries({ queryKey: demoQueryKeys.cropCycles.byBloc(newCycle.bloc_id) })
      
      // Optimistically update cache if possible
      queryClient.setQueryData(
        demoQueryKeys.cropCycles.byBloc(newCycle.bloc_id),
        (oldData: CropCycle[] | undefined) => {
          return oldData ? [...oldData, newCycle] : [newCycle]
        }
      )
    },
    onError: (error) => {
      console.error('Failed to create crop cycle:', error)
    },
  })
}

/**
 * Create field operation mutation for demo mode
 */
export function useDemoCreateFieldOperation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (request: CreateFieldOperationRequest) => DemoApiService.createFieldOperation(request),
    onSuccess: (newOperation) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: demoQueryKeys.fieldOperations.all })
      queryClient.invalidateQueries({ queryKey: demoQueryKeys.fieldOperations.byCycle(newOperation.crop_cycle_uuid) })

      // Find the bloc ID to invalidate bloc data
      const cropCycles = queryClient.getQueryData(demoQueryKeys.cropCycles.all) as CropCycle[] | undefined
      const relatedCycle = cropCycles?.find(cycle => cycle.id === newOperation.crop_cycle_uuid)
      if (relatedCycle) {
        queryClient.invalidateQueries({ queryKey: demoQueryKeys.farmGIS.bloc(relatedCycle.bloc_id) })
      }
    },
    onError: (error) => {
      console.error('Failed to create field operation:', error)
    },
  })
}

/**
 * Create work package mutation for demo mode
 */
export function useDemoCreateWorkPackage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (request: CreateWorkPackageRequest) => DemoApiService.createWorkPackage(request),
    onSuccess: (newWorkPackage) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: demoQueryKeys.workPackages.all })
      queryClient.invalidateQueries({ queryKey: demoQueryKeys.workPackages.byOperation(newWorkPackage.field_operation_uuid) })
    },
    onError: (error) => {
      console.error('Failed to create work package:', error)
    },
  })
}

/**
 * Fetch products for demo mode
 */
export function useDemoProducts() {
  return useQuery({
    queryKey: ['demo-products'],
    queryFn: () => DemoApiService.fetchProducts(),
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  })
}

/**
 * Fetch equipment for demo mode
 */
export function useDemoEquipment() {
  return useQuery({
    queryKey: ['demo-equipment'],
    queryFn: () => DemoApiService.fetchEquipment(),
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  })
}

/**
 * Fetch labour for demo mode
 */
export function useDemoLabour() {
  return useQuery({
    queryKey: ['demo-labour'],
    queryFn: () => DemoApiService.fetchLabour(),
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  })
}

/**
 * Fetch sugarcane varieties for demo mode
 */
export function useDemoSugarcaneVarieties() {
  return useQuery({
    queryKey: ['demo-sugarcane-varieties'],
    queryFn: () => DemoApiService.fetchSugarcaneVarieties(),
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
  })
}

/**
 * Fetch intercrop varieties for demo mode
 */
export function useDemoInterCropVarieties() {
  return useQuery({
    queryKey: ['demo-intercrop-varieties'],
    queryFn: () => DemoApiService.fetchIntercropVarieties(),
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
  })
}

/**
 * Delete bloc mutation for demo mode
 */
export function useDemoDeleteBloc() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (blocId: string) => DemoApiService.deleteBloc(blocId),
    onSuccess: (_, blocId) => {
      // Invalidate all related queries
      queryClient.invalidateQueries({ queryKey: demoQueryKeys.farmGIS.all })
      queryClient.invalidateQueries({ queryKey: demoQueryKeys.farmGIS.bloc(blocId) })
      queryClient.invalidateQueries({ queryKey: demoQueryKeys.cropCycles.byBloc(blocId) })
      queryClient.invalidateQueries({ queryKey: demoQueryKeys.fieldOperations.all })
      queryClient.invalidateQueries({ queryKey: demoQueryKeys.workPackages.all })

      // Clear specific bloc data from cache
      queryClient.removeQueries({ queryKey: demoQueryKeys.farmGIS.bloc(blocId) })
      queryClient.removeQueries({ queryKey: demoQueryKeys.cropCycles.byBloc(blocId) })
    },
    onError: (error) => {
      console.error('Failed to delete bloc:', error)
    },
  })
}
