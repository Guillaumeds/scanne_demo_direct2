/**
 * TanStack Query hooks for configuration data
 * Provides caching, error handling, and loading states for database configuration
 */

import { useQuery } from '@tanstack/react-query'
import { ConfigurationService } from '@/services/configurationService'
import { Product } from '@/types/products'
import { Resource } from '@/types/resources'
import { SugarcaneVariety, InterCropPlant, CropVariety } from '@/types/varieties'

// Query keys for consistent caching
export const configurationKeys = {
  all: ['configuration'] as const,
  products: () => [...configurationKeys.all, 'products'] as const,
  resources: () => [...configurationKeys.all, 'resources'] as const,
  sugarcaneVarieties: () => [...configurationKeys.all, 'sugarcane-varieties'] as const,
  intercropVarieties: () => [...configurationKeys.all, 'intercrop-varieties'] as const,
  allVarieties: () => [...configurationKeys.all, 'all-varieties'] as const,
  health: () => [...configurationKeys.all, 'health'] as const,
  productById: (id: string) => [...configurationKeys.products(), id] as const,
  resourceById: (id: string) => [...configurationKeys.resources(), id] as const,
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
 * Hook for fetching all resources
 */
export function useResources() {
  return useQuery({
    queryKey: configurationKeys.resources(),
    queryFn: ConfigurationService.getResources,
    staleTime: 60 * 60 * 1000, // 1 hour
    gcTime: 24 * 60 * 60 * 1000, // 24 hours
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  })
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
    queryFn: () => ConfigurationService.getResourceById(id),
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
