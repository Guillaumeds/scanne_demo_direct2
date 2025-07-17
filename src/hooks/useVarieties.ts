/**
 * TanStack Query hooks for varieties
 * Provides typed, cached, and optimized data fetching
 */

import { useQuery, UseQueryResult } from '@tanstack/react-query'
import { VarietiesService, SugarcaneVariety } from '@/services/varietiesService'

/**
 * Query keys for varieties
 */
export const varietiesKeys = {
  all: ['varieties'] as const,
  sugarcane: () => [...varietiesKeys.all, 'sugarcane'] as const,
  sugarcaneById: (id: string) => [...varietiesKeys.sugarcane(), id] as const,
  sugarcaneSearch: (searchTerm: string) => [...varietiesKeys.sugarcane(), 'search', searchTerm] as const,
}

/**
 * Hook to fetch all sugarcane varieties
 * @returns UseQueryResult with typed data
 */
export function useSugarcaneVarieties() {
  return useQuery({
    queryKey: varietiesKeys.sugarcane(),
    queryFn: VarietiesService.getSugarcaneVarieties,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  })
}

/**
 * Hook to fetch a specific sugarcane variety by ID
 * @param id - Variety ID
 * @returns UseQueryResult with typed data
 */
export function useSugarcaneVarietyById(id: string | null) {
  return useQuery({
    queryKey: varietiesKeys.sugarcaneById(id || ''),
    queryFn: () => id ? VarietiesService.getSugarcaneVarietyById(id) : null,
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  })
}

/**
 * Hook to search sugarcane varieties
 * @param searchTerm - Search term
 * @param enabled - Whether to enable the query
 * @returns UseQueryResult with typed data
 */
export function useSearchSugarcaneVarieties(searchTerm: string, enabled: boolean = true) {
  return useQuery({
    queryKey: varietiesKeys.sugarcaneSearch(searchTerm),
    queryFn: () => VarietiesService.searchSugarcaneVarieties(searchTerm),
    enabled: enabled && searchTerm.length > 0,
    staleTime: 2 * 60 * 1000, // 2 minutes for search results
    gcTime: 5 * 60 * 1000,
    retry: 1,
    retryDelay: 1000,
  })
}

/**
 * Hook to get varieties for form select options
 * Transforms data into format suitable for Select components
 */
export function useSugarcaneVarietiesForSelect() {
  const query = useSugarcaneVarieties()
  
  const selectOptions = query.data?.map(variety => ({
    value: variety.id,
    label: variety.name,
    description: variety.description,
  })) || []

  return {
    ...query,
    selectOptions,
  }
}

/**
 * Type exports for convenience
 */
export type { SugarcaneVariety } from '@/services/varietiesService'
