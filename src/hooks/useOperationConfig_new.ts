import { useQuery } from '@tanstack/react-query'
import { OPERATION_TYPES, OperationType } from '@/data/configuration/operationTypes'
import { OPERATION_METHODS, OperationMethod } from '@/data/configuration/operationMethods'

// Transform CSV data to match hook interface
const transformOperationTypes = (types: typeof OPERATION_TYPES): OperationType[] => {
  return types.map((type, index) => ({
    ...type,
    ordr: index + 1,
    display_name: type.operation_type,
    active: type.active
  }))
}

const transformOperationMethods = (methods: typeof OPERATION_METHODS): OperationMethod[] => {
  return methods.map((method, index) => ({
    ...method,
    ordr: index + 1,
    display_name: method.method,
    active: method.active
  }))
}

// Hook to fetch operation types
export function useOperationTypes() {
  return useQuery({
    queryKey: ['operation-types'],
    queryFn: async (): Promise<OperationType[]> => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 100))
      return transformOperationTypes(OPERATION_TYPES)
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}

// Hook to fetch operation methods
export function useOperationMethods() {
  return useQuery({
    queryKey: ['operation-methods'],
    queryFn: async (): Promise<OperationMethod[]> => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 100))
      return transformOperationMethods(OPERATION_METHODS)
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}

// Combined hook for both operation types and methods
export function useOperationConfig() {
  const operationTypesQuery = useOperationTypes()
  const operationMethodsQuery = useOperationMethods()

  return {
    operationTypes: operationTypesQuery.data || [],
    operationMethods: operationMethodsQuery.data || [],
    isLoading: operationTypesQuery.isLoading || operationMethodsQuery.isLoading,
    isError: operationTypesQuery.isError || operationMethodsQuery.isError,
    error: operationTypesQuery.error || operationMethodsQuery.error,
  }
}
