/**
 * Configuration Data: Operation Methods
 * Exact data from CSV: operation_methods_conf.csv
 */

export interface OperationMethod {
  id: string
  method: string
  description: string | null
  active: boolean
  created_at: string | null
  updated_at: string | null
}

export const OPERATION_METHODS: OperationMethod[] = [
  // Exact data from CSV: operation_methods_conf.csv - ALL 5 OPERATION METHODS
  {
    id: 'manual',
    method: 'Manual',
    description: 'Hand labor operations performed by workers',
    active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'mechanical',
    method: 'Mechanical',
    description: 'Machine-based operations using tractors and implements',
    active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'chemical',
    method: 'Chemical',
    description: 'Chemical applications including fertilizers and pesticides',
    active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'biological',
    method: 'Biological',
    description: 'Biological control methods and organic approaches',
    active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'integrated',
    method: 'Integrated',
    description: 'Combined approach using multiple methods',
    active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }
]

// Utility functions for operation methods
export const operationMethodUtils = {
  getById: (id: string) => OPERATION_METHODS.find(om => om.id === id),
  getByMethod: (method: string) => OPERATION_METHODS.find(om => om.method === method),
  getActive: () => OPERATION_METHODS.filter(om => om.active === true),
  searchByName: (query: string) => OPERATION_METHODS.filter(om => 
    om.method.toLowerCase().includes(query.toLowerCase())
  ),
}
