import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

// Types matching actual database schema
export interface OperationType {
  id: string
  ordr: number | null
  operation_type: string
  display_name: string
  description: string | null
  active: boolean | null
  created_at: string | null
  updated_at: string | null
  // Legacy fields for backward compatibility
  icon?: string | null
  color_class?: string | null
}

export interface OperationMethod {
  id: string
  ordr: number | null
  method: string
  display_name: string
  description: string | null
  active: boolean | null
  created_at: string | null
  updated_at: string | null
}

// Hook to fetch operation types
export function useOperationTypes() {
  return useQuery({
    queryKey: ['operation-types'],
    queryFn: async (): Promise<OperationType[]> => {
      const { data, error } = await supabase
        .from('operation_type_config')
        .select('*')
        .order('ordr', { ascending: true })

      if (error) {
        throw new Error(`Failed to fetch operation types: ${error.message}`)
      }

      return data || []
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
      const { data, error } = await supabase
        .from('operations_method')
        .select('*')
        .order('ordr', { ascending: true })

      if (error) {
        throw new Error(`Failed to fetch operation methods: ${error.message}`)
      }

      return data || []
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
