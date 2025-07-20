import { useQuery } from '@tanstack/react-query'
import {
  fetchClimaticDataRange,
  fetchCropCycleClimateData,
  fetchMonthlyClimateData,
  fetchWeatherStations,
  calculateCumulativeClimateData,
  type ClimateAggregation,
  type MonthlyClimateData,
} from '@/services/climaticDataService'
// import { ClimaticData } from '@/lib/supabase' // Removed for demo mode

// Query keys for React Query
export const climaticDataKeys = {
  all: ['climatic-data'] as const,
  range: (startDate: string, endDate: string, stationId?: string) => 
    [...climaticDataKeys.all, 'range', startDate, endDate, stationId] as const,
  cropCycle: (startDate: string, endDate: string, stationId?: string) => 
    [...climaticDataKeys.all, 'crop-cycle', startDate, endDate, stationId] as const,
  monthly: (startDate: string, endDate: string, stationId?: string) => 
    [...climaticDataKeys.all, 'monthly', startDate, endDate, stationId] as const,
  stations: () => [...climaticDataKeys.all, 'stations'] as const,
}

/**
 * Hook to fetch raw climatic data for a date range
 */
export function useClimaticDataRange(
  startDate: string,
  endDate: string,
  stationId?: string,
  options?: {
    enabled?: boolean
    staleTime?: number
    cacheTime?: number
  }
) {
  return useQuery({
    queryKey: climaticDataKeys.range(startDate, endDate, stationId),
    queryFn: () => fetchClimaticDataRange(startDate, endDate, stationId),
    enabled: options?.enabled ?? Boolean(startDate && endDate),
    staleTime: options?.staleTime ?? 1000 * 60 * 30, // 30 minutes
    gcTime: options?.cacheTime ?? 1000 * 60 * 60 * 24, // 24 hours
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  })
}

/**
 * Hook to fetch aggregated climate data for crop cycle analysis
 */
export function useCropCycleClimateData(
  startDate: string,
  endDate: string,
  stationId?: string,
  options?: {
    enabled?: boolean
    cumulative?: boolean
    staleTime?: number
    cacheTime?: number
  }
) {
  return useQuery({
    queryKey: climaticDataKeys.cropCycle(startDate, endDate, stationId),
    queryFn: async () => {
      const data = await fetchCropCycleClimateData(startDate, endDate, stationId)
      return options?.cumulative ? calculateCumulativeClimateData(data) : data
    },
    enabled: options?.enabled ?? Boolean(startDate && endDate),
    staleTime: options?.staleTime ?? 1000 * 60 * 30, // 30 minutes
    gcTime: options?.cacheTime ?? 1000 * 60 * 60 * 24, // 24 hours
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  })
}

/**
 * Hook to fetch monthly climate summaries
 */
export function useMonthlyClimateData(
  startDate: string,
  endDate: string,
  stationId?: string,
  options?: {
    enabled?: boolean
    staleTime?: number
    cacheTime?: number
  }
) {
  return useQuery({
    queryKey: climaticDataKeys.monthly(startDate, endDate, stationId),
    queryFn: () => fetchMonthlyClimateData(startDate, endDate, stationId),
    enabled: options?.enabled ?? Boolean(startDate && endDate),
    staleTime: options?.staleTime ?? 1000 * 60 * 30, // 30 minutes
    gcTime: options?.cacheTime ?? 1000 * 60 * 60 * 24, // 24 hours
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  })
}

/**
 * Hook to fetch available weather stations
 */
export function useWeatherStations(options?: {
  enabled?: boolean
  staleTime?: number
  cacheTime?: number
}) {
  return useQuery({
    queryKey: climaticDataKeys.stations(),
    queryFn: fetchWeatherStations,
    enabled: options?.enabled ?? true,
    staleTime: options?.staleTime ?? 1000 * 60 * 60, // 1 hour
    gcTime: options?.cacheTime ?? 1000 * 60 * 60 * 24, // 24 hours
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  })
}

/**
 * Hook to get climate data for a specific crop cycle
 * Automatically determines date range from crop cycle data
 */
export function useCropCycleClimate(
  cropCycle: {
    plantingDate?: string | null
    plannedHarvestDate?: string | null
    actualHarvestDate?: string | null
    type?: string
  },
  stationId?: string,
  options?: {
    enabled?: boolean
    cumulative?: boolean
  }
) {
  // Determine start date (planting date or previous harvest for ratoon)
  const startDate = cropCycle.plantingDate || ''
  
  // Determine end date (actual harvest if available, otherwise planned harvest)
  const endDate = cropCycle.actualHarvestDate || cropCycle.plannedHarvestDate || ''

  const climateQuery = useCropCycleClimateData(
    startDate,
    endDate,
    stationId,
    {
      enabled: options?.enabled && Boolean(startDate && endDate),
      cumulative: options?.cumulative ?? true,
    }
  )

  const monthlyQuery = useMonthlyClimateData(
    startDate,
    endDate,
    stationId,
    {
      enabled: options?.enabled && Boolean(startDate && endDate),
    }
  )

  return {
    // Daily cumulative data for line charts
    dailyData: climateQuery.data,
    isDailyLoading: climateQuery.isLoading,
    dailyError: climateQuery.error,
    
    // Monthly data for bar charts
    monthlyData: monthlyQuery.data,
    isMonthlyLoading: monthlyQuery.isLoading,
    monthlyError: monthlyQuery.error,
    
    // Combined loading state
    isLoading: climateQuery.isLoading || monthlyQuery.isLoading,
    error: climateQuery.error || monthlyQuery.error,
    
    // Date range info
    dateRange: {
      startDate,
      endDate,
      dayCount: climateQuery.data?.length || 0,
    },
    
    // Refetch functions
    refetch: () => {
      climateQuery.refetch()
      monthlyQuery.refetch()
    },
  }
}

/**
 * Hook to calculate climate statistics from daily data
 */
export function useClimateStatistics(dailyData?: ClimateAggregation[]) {
  if (!dailyData || dailyData.length === 0) {
    return {
      totalSolarRadiation: '0',
      totalPrecipitation: '0',
      avgDailySolar: '0.0',
      avgDailyPrecipitation: '0.0',
      dayCount: 0,
    }
  }

  const lastDay = dailyData[dailyData.length - 1]
  const totalSolar = lastDay.totalSolarRadiation
  const totalPrecipitation = lastDay.totalPrecipitation
  const dayCount = dailyData.length

  return {
    totalSolarRadiation: Math.round(totalSolar).toString(),
    totalPrecipitation: Math.round(totalPrecipitation).toString(),
    avgDailySolar: (totalSolar / dayCount).toFixed(1),
    avgDailyPrecipitation: (totalPrecipitation / dayCount).toFixed(1),
    dayCount,
  }
}

/**
 * Hook to get climate data with automatic refetch on date changes
 */
export function useAutoRefreshClimateData(
  startDate: string,
  endDate: string,
  stationId?: string,
  refreshInterval?: number
) {
  return useQuery({
    queryKey: [...climaticDataKeys.range(startDate, endDate, stationId), 'auto-refresh'],
    queryFn: () => fetchClimaticDataRange(startDate, endDate, stationId),
    enabled: Boolean(startDate && endDate),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
    refetchInterval: refreshInterval ?? 1000 * 60 * 15, // 15 minutes default
    refetchIntervalInBackground: false,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  })
}
