import { supabase } from '@/lib/supabase'
import { ClimaticData } from '@/lib/supabase'
import { z } from 'zod'

// Zod schemas for validation
export const ClimaticDataSchema = z.object({
  station_id: z.string(),
  julian_day: z.number().min(1).max(366),
  observation_year: z.number(),
  observation_month: z.number().min(1).max(12).nullable(),
  observation_day: z.number().min(1).max(31).nullable(),
  temperature_min_celsius: z.number().nullable(),
  temperature_max_celsius: z.number().nullable(),
  solar_radiation_mj_per_m2: z.number().nullable(),
  evapotranspiration_mm: z.number().nullable(),
  precipitation_mm: z.number().nullable(), // Now correctly typed as number
  wind_speed_m_per_s: z.number().nullable(),
  vapor_pressure_hpa: z.number().nullable(),
  co2_concentration_ppm: z.number().nullable(),
})

export const ClimaticDataRangeSchema = z.object({
  startDate: z.string(),
  endDate: z.string(),
  stationId: z.string().optional(),
})

// Types for aggregated data
export interface ClimateAggregation {
  date: string
  totalSolarRadiation: number
  totalPrecipitation: number
  avgTemperatureMin: number
  avgTemperatureMax: number
  count: number
}

export interface MonthlyClimateData {
  month: string
  year: number
  totalSolarRadiation: number
  totalPrecipitation: number
  avgTemperature: number
  dayCount: number
}

/**
 * Generate mock climatic data for development/testing
 */
function generateMockClimateData(startDate: string, endDate: string): ClimaticData[] {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const data: ClimaticData[] = []

  let currentDate = new Date(start)
  let dayCount = 0

  while (currentDate <= end) {
    dayCount++
    const julianDay = Math.floor((currentDate.getTime() - new Date(currentDate.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24))

    // Generate realistic climate data with seasonal variation
    const month = currentDate.getMonth() + 1
    const seasonalFactor = Math.sin((month - 3) * Math.PI / 6) // Peak in summer

    data.push({
      station_id: 'mock-station',
      julian_day: julianDay,
      observation_year: currentDate.getFullYear(),
      observation_month: month,
      observation_day: currentDate.getDate(),
      temperature_min_celsius: 18 + seasonalFactor * 8 + Math.random() * 4,
      temperature_max_celsius: 28 + seasonalFactor * 12 + Math.random() * 6,
      solar_radiation_mj_per_m2: 15 + seasonalFactor * 10 + Math.random() * 5,
      evapotranspiration_mm: 3 + seasonalFactor * 2 + Math.random() * 2,
      precipitation_mm: Math.random() < 0.3 ? Math.random() * 15 : 0, // Number format
      wind_speed_m_per_s: 2 + Math.random() * 3,
      vapor_pressure_hpa: 1200 + seasonalFactor * 200 + Math.random() * 100,
      co2_concentration_ppm: 410 + Math.random() * 10,
    })

    currentDate.setDate(currentDate.getDate() + 1)
  }

  return data
}

/**
 * Fetch climatic data for a date range
 */
export async function fetchClimaticDataRange(
  startDate: string,
  endDate: string,
  stationId?: string
): Promise<ClimaticData[]> {
  try {
    // Validate input
    const validatedInput = ClimaticDataRangeSchema.parse({
      startDate,
      endDate,
      stationId,
    })

    // Try to fetch from real database first
    try {
      // Parse start and end dates
      const startDate = new Date(validatedInput.startDate)
      const endDate = new Date(validatedInput.endDate)

      let query = supabase
        .from('climatic_data')
        .select('*')
        .gte('observation_year', startDate.getFullYear())
        .lte('observation_year', endDate.getFullYear())
        .order('observation_year', { ascending: true })
        .order('observation_month', { ascending: true })
        .order('observation_day', { ascending: true })

      if (validatedInput.stationId) {
        query = query.eq('station_id', validatedInput.stationId)
      }

      const { data, error } = await query

      if (error) {
        console.warn('Error fetching real climatic data, falling back to mock data:', error)
        return generateMockClimateData(validatedInput.startDate, validatedInput.endDate)
      }

      if (data && data.length > 0) {
        console.log('🌤️ Using real climate data from database')
        return data
      } else {
        console.log('🌤️ No real climate data found, using mock data')
        return generateMockClimateData(validatedInput.startDate, validatedInput.endDate)
      }
    } catch (dbError) {
      console.warn('Database error, falling back to mock data:', dbError)
      return generateMockClimateData(validatedInput.startDate, validatedInput.endDate)
    }
  } catch (error) {
    console.error('Error in fetchClimaticDataRange:', error)
    throw error
  }
}

/**
 * Aggregate climatic data for crop cycle analysis
 * Accumulates solar radiation and precipitation over the crop cycle period
 */
export async function fetchCropCycleClimateData(
  startDate: string,
  endDate: string,
  stationId?: string
): Promise<ClimateAggregation[]> {
  try {
    const rawData = await fetchClimaticDataRange(startDate, endDate, stationId)
    
    // Group by date and aggregate
    const aggregatedData: { [date: string]: ClimateAggregation } = {}
    
    rawData.forEach((record) => {
      // Construct date from year, month, day components
      const date = `${record.observation_year}-${String(record.observation_month || 1).padStart(2, '0')}-${String(record.observation_day || 1).padStart(2, '0')}`

      if (!aggregatedData[date]) {
        aggregatedData[date] = {
          date,
          totalSolarRadiation: 0,
          totalPrecipitation: 0,
          avgTemperatureMin: 0,
          avgTemperatureMax: 0,
          count: 0,
        }
      }
      
      const agg = aggregatedData[date]
      agg.count += 1
      
      if (record.solar_radiation_mj_per_m2 !== null) {
        agg.totalSolarRadiation += record.solar_radiation_mj_per_m2
      }

      if (record.precipitation_mm !== null) {
        agg.totalPrecipitation += record.precipitation_mm
      }
      
      if (record.temperature_min_celsius !== null) {
        agg.avgTemperatureMin = (agg.avgTemperatureMin * (agg.count - 1) + record.temperature_min_celsius) / agg.count
      }
      
      if (record.temperature_max_celsius !== null) {
        agg.avgTemperatureMax = (agg.avgTemperatureMax * (agg.count - 1) + record.temperature_max_celsius) / agg.count
      }
    })
    
    return Object.values(aggregatedData).sort((a, b) => a.date.localeCompare(b.date))
  } catch (error) {
    console.error('Error in fetchCropCycleClimateData:', error)
    throw error
  }
}

/**
 * Get monthly climate summaries for bar charts
 */
export async function fetchMonthlyClimateData(
  startDate: string,
  endDate: string,
  stationId?: string
): Promise<MonthlyClimateData[]> {
  try {
    const rawData = await fetchClimaticDataRange(startDate, endDate, stationId)
    
    // Group by year-month
    const monthlyData: { [key: string]: MonthlyClimateData } = {}
    
    rawData.forEach((record) => {
      const year = record.observation_year
      const month = record.observation_month || 1
      const monthKey = `${year}-${month.toString().padStart(2, '0')}`
      const monthName = new Date(year, month - 1).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          month: monthName,
          year,
          totalSolarRadiation: 0,
          totalPrecipitation: 0,
          avgTemperature: 0,
          dayCount: 0,
        }
      }
      
      const monthly = monthlyData[monthKey]
      monthly.dayCount += 1
      
      if (record.solar_radiation_mj_per_m2 !== null) {
        monthly.totalSolarRadiation += record.solar_radiation_mj_per_m2
      }

      if (record.precipitation_mm !== null) {
        monthly.totalPrecipitation += record.precipitation_mm
      }
      
      if (record.temperature_min_celsius !== null && record.temperature_max_celsius !== null) {
        const dailyAvg = (record.temperature_min_celsius + record.temperature_max_celsius) / 2
        monthly.avgTemperature = (monthly.avgTemperature * (monthly.dayCount - 1) + dailyAvg) / monthly.dayCount
      }
    })
    
    return Object.values(monthlyData).sort((a, b) => a.year - b.year || a.month.localeCompare(b.month))
  } catch (error) {
    console.error('Error in fetchMonthlyClimateData:', error)
    throw error
  }
}

/**
 * Calculate cumulative climate data for crop cycle visualization
 */
export function calculateCumulativeClimateData(data: ClimateAggregation[]): ClimateAggregation[] {
  let cumulativeSolar = 0
  let cumulativePrecipitation = 0
  
  return data.map((record) => {
    cumulativeSolar += record.totalSolarRadiation
    cumulativePrecipitation += record.totalPrecipitation
    
    return {
      ...record,
      totalSolarRadiation: cumulativeSolar,
      totalPrecipitation: cumulativePrecipitation,
    }
  })
}

/**
 * Get available weather stations
 */
export async function fetchWeatherStations(): Promise<{ station_id: string; count: number }[]> {
  try {
    // Try to fetch from real database first
    try {
      const { data, error } = await supabase
        .from('climatic_data')
        .select('station_id')
        .order('station_id')

      if (error) {
        console.warn('Error fetching weather stations, using mock data:', error)
        return [
          { station_id: 'mock-station', count: 365 },
          { station_id: 'farm-station-1', count: 300 },
          { station_id: 'regional-station', count: 250 }
        ]
      }

      if (data && data.length > 0) {
        // Count occurrences of each station
        const stationCounts: { [key: string]: number } = {}
        data.forEach((record) => {
          stationCounts[record.station_id] = (stationCounts[record.station_id] || 0) + 1
        })

        return Object.entries(stationCounts)
          .map(([station_id, count]) => ({ station_id, count }))
          .sort((a, b) => b.count - a.count)
      } else {
        console.log('🌤️ No weather stations found, using mock data')
        return [
          { station_id: 'mock-station', count: 365 },
          { station_id: 'farm-station-1', count: 300 },
          { station_id: 'regional-station', count: 250 }
        ]
      }
    } catch (dbError) {
      console.warn('Database error, using mock weather stations:', dbError)
      return [
        { station_id: 'mock-station', count: 365 },
        { station_id: 'farm-station-1', count: 300 },
        { station_id: 'regional-station', count: 250 }
      ]
    }
  } catch (error) {
    console.error('Error in fetchWeatherStations:', error)
    throw error
  }
}
