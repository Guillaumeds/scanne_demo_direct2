import { useQuery } from '@tanstack/react-query'

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

// Demo operation types data
const DEMO_OPERATION_TYPES: OperationType[] = [
  {
    id: 'land-prep',
    ordr: 1,
    operation_type: 'Land Preparation',
    display_name: 'Land Preparation',
    description: 'Preparing the land for planting',
    active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    icon: '🚜',
    color_class: 'bg-brown-500'
  },
  {
    id: 'planting',
    ordr: 2,
    operation_type: 'Planting',
    display_name: 'Planting',
    description: 'Planting sugarcane',
    active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    icon: '🌱',
    color_class: 'bg-green-500'
  },
  {
    id: 'fertilizing',
    ordr: 3,
    operation_type: 'Fertilizing',
    display_name: 'Fertilizing',
    description: 'Applying fertilizers',
    active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    icon: '🧪',
    color_class: 'bg-blue-500'
  },
  {
    id: 'weeding',
    ordr: 4,
    operation_type: 'Weeding',
    display_name: 'Weeding',
    description: 'Weed control operations',
    active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    icon: '🌿',
    color_class: 'bg-yellow-500'
  },
  {
    id: 'harvesting',
    ordr: 5,
    operation_type: 'Harvesting',
    display_name: 'Harvesting',
    description: 'Harvesting sugarcane',
    active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    icon: '🚛',
    color_class: 'bg-orange-500'
  }
]

// Hook to fetch operation types
export function useOperationTypes() {
  return useQuery({
    queryKey: ['operation-types'],
    queryFn: async (): Promise<OperationType[]> => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 100))
      return DEMO_OPERATION_TYPES
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}

// Demo operation methods data
const DEMO_OPERATION_METHODS: OperationMethod[] = [
  {
    id: 'manual',
    ordr: 1,
    method: 'Manual',
    display_name: 'Manual',
    description: 'Manual operation using hand tools',
    active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'mechanical',
    ordr: 2,
    method: 'Mechanical',
    display_name: 'Mechanical',
    description: 'Mechanical operation using machinery',
    active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'chemical',
    ordr: 3,
    method: 'Chemical',
    display_name: 'Chemical',
    description: 'Chemical application',
    active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }
]

// Hook to fetch operation methods
export function useOperationMethods() {
  return useQuery({
    queryKey: ['operation-methods'],
    queryFn: async (): Promise<OperationMethod[]> => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 100))
      return DEMO_OPERATION_METHODS
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
