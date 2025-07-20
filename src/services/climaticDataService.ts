// import { supabase } from '@/lib/supabase' // Removed for demo mode
// import { ClimaticData } from '@/lib/supabase' // Removed for demo mode
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
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  stationId: z.string().optional(),
})

export type ClimateAggregation = {
  date: string
  totalSolarRadiation: number
  totalPrecipitation: number
  avgTemperatureMin: number
  avgTemperatureMax: number
  count: number
}

export type MonthlyClimateData = {
  month: string
  year: number
  totalSolarRadiation: number
  totalPrecipitation: number
  avgTemperature: number
  dayCount: number
}

/**
 * Generate realistic mock climatic data for Mauritius
 * Based on actual climate patterns for sugarcane farming in Mauritius
 */
function generateMockClimateData(startDate: string, endDate: string): any[] {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const data: any[] = []

  let currentDate = new Date(start)
  let dayCount = 0

  while (currentDate <= end) {
    dayCount++
    const julianDay = Math.floor((currentDate.getTime() - new Date(currentDate.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24))

    // Mauritius climate patterns (Southern Hemisphere)
    const month = currentDate.getMonth() + 1
    
    // Mauritius seasons: Summer (Nov-Apr), Winter (May-Oct)
    // Peak summer: Dec-Feb, Peak winter: Jun-Aug
    const isSummer = month >= 11 || month <= 4
    const isWinter = month >= 5 && month <= 10
    
    // Temperature patterns for Mauritius coastal/lowland areas
    let tempMin, tempMax, solarRadiation, precipitation, evapotranspiration
    
    if (isSummer) {
      // Summer: Hot and humid with cyclone season (Nov-Apr)
      tempMin = 22 + Math.random() * 4 // 22-26°C
      tempMax = 29 + Math.random() * 4 // 29-33°C
      solarRadiation = 20 + Math.random() * 8 // 20-28 MJ/m²
      evapotranspiration = 5 + Math.random() * 3 // 5-8 mm
      
      // Higher precipitation in summer, with occasional heavy rainfall
      if (Math.random() < 0.4) {
        precipitation = Math.random() < 0.1 ? 20 + Math.random() * 80 : Math.random() * 25 // Occasional heavy rain
      } else {
        precipitation = 0
      }
    } else {
      // Winter: Cooler and drier (May-Oct)
      tempMin = 17 + Math.random() * 4 // 17-21°C
      tempMax = 24 + Math.random() * 4 // 24-28°C
      solarRadiation = 12 + Math.random() * 6 // 12-18 MJ/m²
      evapotranspiration = 2 + Math.random() * 2 // 2-4 mm
      
      // Lower precipitation in winter
      if (Math.random() < 0.2) {
        precipitation = Math.random() * 15 // Light rainfall
      } else {
        precipitation = 0
      }
    }

    data.push({
      station_id: 'mauritius-demo-station',
      julian_day: julianDay,
      observation_year: currentDate.getFullYear(),
      observation_month: month,
      observation_day: currentDate.getDate(),
      temperature_min_celsius: tempMin,
      temperature_max_celsius: tempMax,
      solar_radiation_mj_per_m2: solarRadiation,
      evapotranspiration_mm: evapotranspiration,
      precipitation_mm: precipitation,
      wind_speed_m_per_s: 2 + Math.random() * 4, // Trade winds 2-6 m/s
      vapor_pressure_hpa: isSummer ? 1800 + Math.random() * 400 : 1400 + Math.random() * 300,
      co2_concentration_ppm: 415 + Math.random() * 5, // Current atmospheric levels
    })

    currentDate.setDate(currentDate.getDate() + 1)
  }

  return data
}

/**
 * Fetch climatic data for a date range
 * Falls back to mock data if database is unavailable
 */
export async function fetchClimaticDataRange(
  startDate: string,
  endDate: string,
  stationId?: string
): Promise<any[]> {
  try {
    // Validate input
    const validatedInput = ClimaticDataRangeSchema.parse({
      startDate,
      endDate,
      stationId,
    })

    // Demo mode: Always use mock data
    console.log('🎭 Demo Mode: Using mock climate data')
    return generateMockClimateData(validatedInput.startDate, validatedInput.endDate)
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
  // try {
    // Try to fetch from real database first
    // try {
      // const { data, error } = await supabase // Removed for demo mode
      //   .from('climatic_data')
      //   .select('station_id')
      //   .order('station_id')

      // if (error) {
      //   console.warn('Error fetching weather stations, using mock data:', error)
        return [
          { station_id: 'mauritius-demo-station', count: 365 },
          { station_id: 'farm-station-1', count: 300 },
          { station_id: 'regional-station', count: 250 }
        ]
      // }

      // if (data && data.length > 0) {
      //   // Count occurrences of each station
      //   const stationCounts: { [key: string]: number } = {}
      //   data.forEach((record: any) => {
      //     stationCounts[record.station_id] = (stationCounts[record.station_id] || 0) + 1
      //   })

      //   return Object.entries(stationCounts)
      //     .map(([station_id, count]) => ({ station_id, count }))
      //     .sort((a, b) => b.count - a.count)
      // } else {
      //   console.log('🌤️ No weather stations found, using mock data')
      //   return [
      //     { station_id: 'mauritius-demo-station', count: 365 },
      //     { station_id: 'farm-station-1', count: 300 },
      //     { station_id: 'regional-station', count: 250 }
      //   ]
      // }
    // } catch (dbError) {
    //   console.warn('Database error, using mock weather stations:', dbError)
    //   return [
    //     { station_id: 'mauritius-demo-station', count: 365 },
    //     { station_id: 'farm-station-1', count: 300 },
    //     { station_id: 'regional-station', count: 250 }
    //   ]
    // }
  // } catch (error) {
  //   console.error('Error in fetchWeatherStations:', error)
  //   throw error
  // }
}
