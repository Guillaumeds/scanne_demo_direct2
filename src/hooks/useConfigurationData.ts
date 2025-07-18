/**
 * TanStack Query hooks for configuration data
 * Provides caching, error handling, and loading states for database configuration
 */

import { useQuery } from '@tanstack/react-query'
import { ConfigurationService } from '@/services/configurationService'
import { supabase } from '@/lib/supabase'
import { Product } from '@/types/products'
import { Resource } from '@/types/resources'
import { SugarcaneVariety, InterCropPlant, CropVariety } from '@/types/varieties'

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
 */
export function useProducts() {
  return useQuery({
    queryKey: configurationKeys.products(),
    queryFn: ConfigurationService.getProducts,
    staleTime: 60 * 60 * 1000, // 1 hour
    gcTime: 24 * 60 * 60 * 1000, // 24 hours
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  })
}

/**
 * Hook for fetching all labour
 */
export function useLabour() {
  return useQuery({
    queryKey: configurationKeys.labour(),
    queryFn: ConfigurationService.getLabour,
    staleTime: 60 * 60 * 1000, // 1 hour
    gcTime: 24 * 60 * 60 * 1000, // 24 hours
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  })
}

/**
 * Hook for fetching all equipment
 */
export function useEquipment() {
  return useQuery({
    queryKey: configurationKeys.equipment(),
    queryFn: async () => {
      const { data, error } = await supabase.from('equipment').select('*').eq('active', true).order('name')
      if (error) throw error
      return data || []
    },
    staleTime: 60 * 60 * 1000, // 1 hour
    gcTime: 24 * 60 * 60 * 1000, // 24 hours
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  })
}

/**
 * @deprecated Use useLabour() instead
 */
export function useResources() {
  return useLabour()
}

/**
 * Hook for fetching sugarcane varieties only
 */
export function useSugarcaneVarieties() {
  return useQuery({
    queryKey: configurationKeys.sugarcaneVarieties(),
    queryFn: ConfigurationService.getSugarcaneVarieties,
    staleTime: 60 * 60 * 1000, // 1 hour
    gcTime: 24 * 60 * 60 * 1000, // 24 hours
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  })
}

/**
 * Hook for fetching intercrop varieties only
 */
export function useIntercropVarieties() {
  return useQuery({
    queryKey: configurationKeys.intercropVarieties(),
    queryFn: ConfigurationService.getIntercropVarieties,
    staleTime: 60 * 60 * 1000, // 1 hour
    gcTime: 24 * 60 * 60 * 1000, // 24 hours
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  })
}

/**
 * Hook for fetching all varieties (sugarcane + intercrop)
 */
export function useAllVarieties() {
  return useQuery({
    queryKey: configurationKeys.allVarieties(),
    queryFn: ConfigurationService.getAllVarieties,
    staleTime: 60 * 60 * 1000, // 1 hour
    gcTime: 24 * 60 * 60 * 1000, // 24 hours
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  })
}

/**
 * Hook for configuration health check
 */
export function useConfigurationHealth() {
  return useQuery({
    queryKey: configurationKeys.health(),
    queryFn: ConfigurationService.healthCheck,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  })
}

/**
 * Hook for fetching a specific product by ID
 */
export function useProductById(id: string) {
  return useQuery({
    queryKey: configurationKeys.productById(id),
    queryFn: () => ConfigurationService.getProductById(id),
    staleTime: 60 * 60 * 1000, // 1 hour
    gcTime: 24 * 60 * 60 * 1000, // 24 hours
    enabled: !!id,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  })
}

/**
 * Hook for fetching a specific resource by ID
 */
export function useResourceById(id: string) {
  return useQuery({
    queryKey: configurationKeys.resourceById(id),
    queryFn: () => ConfigurationService.getLabourById(id),
    staleTime: 60 * 60 * 1000, // 1 hour
    gcTime: 24 * 60 * 60 * 1000, // 24 hours
    enabled: !!id,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  })
}

/**
 * Hook for fetching a specific variety by ID
 */
export function useVarietyById(id: string) {
  return useQuery({
    queryKey: configurationKeys.varietyById(id),
    queryFn: () => ConfigurationService.getVarietyById(id),
    staleTime: 60 * 60 * 1000, // 1 hour
    gcTime: 24 * 60 * 60 * 1000, // 24 hours
    enabled: !!id,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  })
}
