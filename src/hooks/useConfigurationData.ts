/**
 * TanStack Query hooks for configuration data
 * Provides caching, error handling, and loading states for database configuration
 */

import { useQuery } from '@tanstack/react-query'
import {
  useProducts as useDemoProducts,
  useLabourTypes as useDemoLabour,
  useEquipmentTypes as useDemoEquipment,
  useSugarcaneVarieties as useDemoVarieties
} from '@/hooks/useDemoData'

// Query keys for consistent caching
export const configurationKeys = {
  all: ['configuration'] as const,
  products: () => [...configurationKeys.all, 'products'] as const,
  labour: () => [...configurationKeys.all, 'labour'] as const,
  equipment: () => [...configurationKeys.all, 'equipment'] as const,
  resources: () => [...configurationKeys.all, 'resources'] as const, // @deprecated
  sugarcaneVarieties: () => [...configurationKeys.all, 'sugarcane-varieties'] as const,
  intercropVarieties: () => [...configurationKeys.all, 'intercrop-varieties'] as const,
  allVarieties: () => [...configurationKeys.all, 'all-varieties'] as const,
  health: () => [...configurationKeys.all, 'health'] as const,
  productById: (id: string) => [...configurationKeys.products(), id] as const,
  labourById: (id: string) => [...configurationKeys.labour(), id] as const,
  equipmentById: (id: string) => [...configurationKeys.equipment(), id] as const,
  resourceById: (id: string) => [...configurationKeys.resources(), id] as const, // @deprecated
  varietyById: (id: string) => [...configurationKeys.allVarieties(), id] as const,
}

/**
 * Hook for fetching all products
 * @deprecated Use useDemoProducts from useDemoData instead
 */
export function useProducts() {
  return useDemoProducts()
}

/**
 * Hook for fetching all labour
 * @deprecated Use useDemoLabour from useDemoData instead
 */
export function useLabour() {
  return useDemoLabour()
}

/**
 * Hook for fetching all equipment
 * @deprecated Use useDemoEquipment from useDemoData instead
 */
export function useEquipment() {
  return useDemoEquipment()
}

/**
 * @deprecated Use useLabour() instead
 */
export function useResources() {
  return useLabour()
}

/**
 * Hook for fetching sugarcane varieties only
 * @deprecated Use useDemoVarieties from useDemoData instead
 */
export function useSugarcaneVarieties() {
  return useDemoVarieties()
}

/**
 * Hook for fetching intercrop varieties only
 * @deprecated Use useDemoVarieties from useDemoData instead (returns empty for intercrop in demo)
 */
export function useIntercropVarieties() {
  return useQuery({
    queryKey: configurationKeys.intercropVarieties(),
    queryFn: () => Promise.resolve({ data: [], success: true, timestamp: new Date().toISOString() }),
    staleTime: 60 * 60 * 1000,
  })
}

/**
 * Hook for fetching all varieties (sugarcane + intercrop)
 * @deprecated Use useDemoVarieties from useDemoData instead
 */
export function useAllVarieties() {
  return useDemoVarieties()
}

/**
 * Hook for configuration health check
 * @deprecated Demo mode always returns healthy status
 */
export function useConfigurationHealth() {
  return useQuery({
    queryKey: configurationKeys.health(),
    queryFn: () => Promise.resolve({
      data: { status: 'healthy', message: 'Demo mode - all systems operational' },
      success: true,
      timestamp: new Date().toISOString()
    }),
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Hook for fetching a specific product by ID
 * @deprecated Use demo data directly from useDemoData
 */
export function useProductById(id: string) {
  const { data: products } = useDemoProducts()
  return useQuery({
    queryKey: configurationKeys.productById(id),
    queryFn: () => {
      const product = products?.find((p: any) => p.id === id)
      if (!product) throw new Error(`Product ${id} not found`)
      return { data: product, success: true, timestamp: new Date().toISOString() }
    },
    enabled: !!id && !!products,
    staleTime: 60 * 60 * 1000,
  })
}

/**
 * Hook for fetching a specific resource by ID
 * @deprecated Use demo data directly from useDemoData
 */
export function useResourceById(id: string) {
  const { data: labour } = useDemoLabour()
  return useQuery({
    queryKey: configurationKeys.resourceById(id),
    queryFn: () => {
      const resource = labour?.find((l: any) => l.id === id)
      if (!resource) throw new Error(`Resource ${id} not found`)
      return { data: resource, success: true, timestamp: new Date().toISOString() }
    },
    enabled: !!id && !!labour,
    staleTime: 60 * 60 * 1000,
  })
}

/**
 * Hook for fetching a specific variety by ID
 * @deprecated Use demo data directly from useDemoData
 */
export function useVarietyById(id: string) {
  const { data: varieties } = useDemoVarieties()
  return useQuery({
    queryKey: configurationKeys.varietyById(id),
    queryFn: () => {
      const variety = varieties?.find((v: any) => v.id === id)
      if (!variety) throw new Error(`Variety ${id} not found`)
      return { data: variety, success: true, timestamp: new Date().toISOString() }
    },
    enabled: !!id && !!varieties,
    staleTime: 60 * 60 * 1000,
  })
}
