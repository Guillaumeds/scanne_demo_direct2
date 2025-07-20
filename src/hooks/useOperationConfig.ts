import { useQuery } from '@tanstack/react-query'

// Mock operation types and methods for now
const OPERATION_TYPES = [
  { operation_type: 'Planting', icon: '🌱', color_class: 'bg-green-100 text-green-800', description: 'Plant crops' },
  { operation_type: 'Fertilizing', icon: '🧪', color_class: 'bg-blue-100 text-blue-800', description: 'Apply fertilizers' },
  { operation_type: 'Irrigation', icon: '💧', color_class: 'bg-cyan-100 text-cyan-800', description: 'Water crops' },
  { operation_type: 'Pest Control', icon: '🐛', color_class: 'bg-red-100 text-red-800', description: 'Control pests' },
  { operation_type: 'Harvest', icon: '🌾', color_class: 'bg-yellow-100 text-yellow-800', description: 'Harvest crops' },
  { operation_type: 'Cultivation', icon: '🚜', color_class: 'bg-orange-100 text-orange-800', description: 'Cultivate soil' },
  { operation_type: 'Weeding', icon: '🌿', color_class: 'bg-lime-100 text-lime-800', description: 'Remove weeds' }
]

const OPERATION_METHODS = [
  { method: 'Manual', description: 'Manual labor' },
  { method: 'Mechanical', description: 'Using machinery' },
  { method: 'Chemical', description: 'Chemical application' },
  { method: 'Biological', description: 'Biological methods' },
  { method: 'Integrated', description: 'Combined methods' }
]

export function useOperationConfig() {
  const operationTypesQuery = useQuery({
    queryKey: ['operation-types'],
    queryFn: async () => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 100))
      return OPERATION_TYPES
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  const operationMethodsQuery = useQuery({
    queryKey: ['operation-methods'],
    queryFn: async () => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 100))
      return OPERATION_METHODS
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  return {
    operationTypes: operationTypesQuery.data || [],
    operationMethods: operationMethodsQuery.data || [],
    isLoading: operationTypesQuery.isLoading || operationMethodsQuery.isLoading,
    error: operationTypesQuery.error || operationMethodsQuery.error
  }
}
