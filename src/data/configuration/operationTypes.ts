/**
 * Configuration Data: Operation Types
 * Exact data from CSV: operation_types_conf.csv
 */

export interface OperationType {
  id: string
  operation_type: string
  description: string | null
  icon: string | null
  color_class: string | null
  active: boolean
  created_at: string | null
  updated_at: string | null
}

export const OPERATION_TYPES: OperationType[] = [
  // Exact data from CSV: operation_types_conf.csv - ALL 8 OPERATION TYPES
  {
    id: 'field-preparation',
    operation_type: 'Field Preparation',
    description: 'Land preparation activities including plowing, harrowing, and leveling',
    icon: '🚜',
    color_class: 'bg-orange-100 text-orange-800',
    active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'planting',
    operation_type: 'Planting',
    description: 'Seed/seedling planting and establishment activities',
    icon: '🌱',
    color_class: 'bg-green-100 text-green-800',
    active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'fertilization',
    operation_type: 'Fertilization',
    description: 'Application of fertilizers and soil amendments',
    icon: '🧪',
    color_class: 'bg-blue-100 text-blue-800',
    active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'irrigation',
    operation_type: 'Irrigation',
    description: 'Water management and irrigation activities',
    icon: '💧',
    color_class: 'bg-cyan-100 text-cyan-800',
    active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'pest-control',
    operation_type: 'Pest Control',
    description: 'Pest and disease management activities',
    icon: '🐛',
    color_class: 'bg-red-100 text-red-800',
    active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'weed-control',
    operation_type: 'Weed Control',
    description: 'Weed management and herbicide application',
    icon: '🌿',
    color_class: 'bg-yellow-100 text-yellow-800',
    active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'harvest',
    operation_type: 'Harvest',
    description: 'Crop harvesting and collection activities',
    icon: '🌾',
    color_class: 'bg-amber-100 text-amber-800',
    active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'post-harvest',
    operation_type: 'Post-Harvest',
    description: 'Post-harvest processing and storage activities',
    icon: '📦',
    color_class: 'bg-purple-100 text-purple-800',
    active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }
]

// Utility functions for operation types
export const operationTypeUtils = {
  getById: (id: string) => OPERATION_TYPES.find(ot => ot.id === id),
  getByOperationType: (operation_type: string) => OPERATION_TYPES.find(ot => ot.operation_type === operation_type),
  getActive: () => OPERATION_TYPES.filter(ot => ot.active === true),
  searchByName: (query: string) => OPERATION_TYPES.filter(ot => 
    ot.operation_type.toLowerCase().includes(query.toLowerCase())
  ),
}
