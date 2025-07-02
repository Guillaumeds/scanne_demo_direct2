300/**
 * Service for fetching weather data
 * Simplified version focusing on 7-day forecast only
 */

// Weather API Configuration
const WEATHER_API_CONFIG = {
  baseUrl: 'https://api.open-meteo.com/v1'
}

export interface HourlyWeatherData {
  time: string[]
  temperature_2m: number[]
  relative_humidity_2m: number[]
  precipitation: number[]
  wind_speed_10m: number[]
  wind_direction_10m: number[]
  solar_radiation: number[]
  cloud_cover: number[]
  pressure_msl: number[]
  weather_code: number[]
}

export interface DailyWeatherData {
  time: string[]
  temperature_2m_max: number[]
  temperature_2m_min: number[]
  precipitation_sum: number[]
  wind_speed_10m_max: number[]
  solar_radiation_sum: number[]
  relative_humidity_2m_mean: number[]
  weather_code: number[]
  sunrise: string[]
  sunset: string[]
}

export interface WeatherAnalysis {
  coordinates: [number, number]
  timezone: string
  current?: {
    time: string
    temperature: number
    humidity: number
    precipitation: number
    wind_speed: number
    wind_direction: number
    solar_radiation: number
    weather_code: number
    cloud_cover: number
  }
  hourly?: HourlyWeatherData
  daily?: DailyWeatherData
  lastUpdated: string
  dataSource: string
  error?: string
}

export type WeatherTimeframe = 
  | '7-day-forecast'
  | '15-day-forecast' 
  | '35-day-forecast'
  | '1-year-forecast'
  | '2-year-forecast'
  | '30-day-historical'
  | '3-month-historical'
  | '1-year-historical'

/**
 * Get weather code description and icon component name for React Icons
 */
export function getWeatherInfo(code: number): { description: string; iconName: string; color: string } {
  // Ensure code is a number
  const numCode = typeof code === 'string' ? parseInt(code, 10) : code

  const weatherCodes: Record<number, { description: string; iconName: string; color: string }> = {
    0: { description: 'Clear sky', iconName: 'WiDaySunny', color: 'text-yellow-500' },
    1: { description: 'Mainly clear', iconName: 'WiDayCloudy', color: 'text-yellow-400' },
    2: { description: 'Partly cloudy', iconName: 'WiCloudy', color: 'text-gray-400' },
    3: { description: 'Overcast', iconName: 'WiCloudy', color: 'text-gray-500' },
    45: { description: 'Fog', iconName: 'WiFog', color: 'text-gray-400' },
    48: { description: 'Depositing rime fog', iconName: 'WiFog', color: 'text-gray-400' },
    51: { description: 'Light drizzle', iconName: 'WiSprinkle', color: 'text-blue-400' },
    53: { description: 'Moderate drizzle', iconName: 'WiRain', color: 'text-blue-500' },
    55: { description: 'Dense drizzle', iconName: 'WiRain', color: 'text-blue-600' },
    61: { description: 'Slight rain', iconName: 'WiRain', color: 'text-blue-500' },
    63: { description: 'Moderate rain', iconName: 'WiRain', color: 'text-blue-600' },
    65: { description: 'Heavy rain', iconName: 'WiRain', color: 'text-blue-700' },
    71: { description: 'Slight snow', iconName: 'WiSnow', color: 'text-blue-300' },
    73: { description: 'Moderate snow', iconName: 'WiSnow', color: 'text-blue-400' },
    75: { description: 'Heavy snow', iconName: 'WiSnow', color: 'text-blue-500' },
    95: { description: 'Thunderstorm', iconName: 'WiThunderstorm', color: 'text-purple-600' },
    96: { description: 'Thunderstorm with hail', iconName: 'WiHail', color: 'text-purple-700' }
  }

  const result = weatherCodes[numCode] || { description: 'Unknown', iconName: 'WiNa', color: 'text-gray-500' }

  // Debug logging
  if (result.iconName === 'WiNa') {
    console.warn(`Unknown weather code: ${code} (type: ${typeof code}, parsed: ${numCode})`)
  }

  return result
}

/**
 * Fetch 35-day weather forecast using multiple models
 * Days 1-7: Standard forecast API
 * Days 8-15: ECMWF AIFS model
 * Days 16-35: GFS Ensemble model
 */
export async function fetch35DayWeatherForecast(
  coordinates: [number, number]
): Promise<WeatherAnalysis> {
  const [lng, lat] = coordinates

  try {
    // Fetch all three forecast periods in parallel
    const [shortTerm, mediumTerm, longTerm] = await Promise.all([
      fetchShortTermForecast(coordinates), // Days 1-7
      fetchECMWFAIFSForecast(coordinates), // Days 8-15
      fetchGFSEnsembleForecast(coordinates) // Days 16-35
    ])

    // Combine all forecasts
    const combinedForecast = combineForecasts([shortTerm, mediumTerm, longTerm])

    return {
      ...combinedForecast,
      coordinates: [lng, lat],
      lastUpdated: new Date().toISOString(),
      dataSource: 'Combined: Standard (1-7d) + ECMWF AIFS (8-15d) + GFS Ensemble (16-35d)'
    }
  } catch (error) {
    console.error('Error fetching 35-day forecast:', error)
    throw error
  }
}

/**
 * Fetch 15-day weather forecast using ECMWF IFS model
 * This is the main function used by the app
 */
export async function fetch15DayWeatherForecast(
  coordinates: [number, number]
): Promise<WeatherAnalysis> {
  const [lng, lat] = coordinates

  try {
    const params = new URLSearchParams({
      latitude: lat.toString(),
      longitude: lng.toString(),
      models: 'ecmwf_ifs025', // Use ECMWF IFS 0.25° model
      current: [
        'temperature_2m',
        'relative_humidity_2m',
        'precipitation',
        'wind_speed_10m',
        'wind_direction_10m',
        'weather_code',
        'cloud_cover'
      ].join(','),
      hourly: [
        'temperature_2m',
        'relative_humidity_2m',
        'precipitation',
        'wind_speed_10m',
        'wind_direction_10m',
        'weather_code',
        'cloud_cover',
        'pressure_msl'
      ].join(','),
      daily: [
        'temperature_2m_max',
        'temperature_2m_min',
        'precipitation_sum',
        'wind_speed_10m_max',
        'weather_code'
      ].join(','),
      forecast_days: '15',
      timezone: 'auto'
    })

    const url = `${WEATHER_API_CONFIG.baseUrl}/ecmwf?${params}`
    console.log('Fetching 15-day ECMWF IFS forecast from:', url)

    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    console.log('15-day ECMWF IFS forecast API response:', data)

    // Process the response into our format
    return {
      coordinates: [lng, lat],
      timezone: data.timezone || 'UTC',
      current: data.current ? {
        time: data.current.time,
        temperature: data.current.temperature_2m,
        humidity: data.current.relative_humidity_2m,
        precipitation: data.current.precipitation,
        wind_speed: data.current.wind_speed_10m,
        wind_direction: data.current.wind_direction_10m,
        solar_radiation: 0, // Not available in simplified API
        weather_code: data.current.weather_code,
        cloud_cover: data.current.cloud_cover
      } : undefined,
      hourly: data.hourly ? {
        time: data.hourly.time,
        temperature_2m: data.hourly.temperature_2m,
        relative_humidity_2m: data.hourly.relative_humidity_2m,
        precipitation: data.hourly.precipitation,
        wind_speed_10m: data.hourly.wind_speed_10m,
        wind_direction_10m: data.hourly.wind_direction_10m,
        solar_radiation: data.hourly.solar_radiation || new Array(data.hourly.time.length).fill(0),
        cloud_cover: data.hourly.cloud_cover,
        pressure_msl: data.hourly.pressure_msl,
        weather_code: data.hourly.weather_code
      } : undefined,
      daily: data.daily ? {
        time: data.daily.time,
        temperature_2m_max: data.daily.temperature_2m_max,
        temperature_2m_min: data.daily.temperature_2m_min,
        precipitation_sum: data.daily.precipitation_sum,
        wind_speed_10m_max: data.daily.wind_speed_10m_max,
        solar_radiation_sum: new Array(data.daily.time.length).fill(0), // Not available
        relative_humidity_2m_mean: new Array(data.daily.time.length).fill(0), // Not available in this endpoint
        weather_code: data.daily.weather_code,
        sunrise: new Array(data.daily.time.length).fill('06:00'), // Placeholder
        sunset: new Array(data.daily.time.length).fill('18:00') // Placeholder
      } : undefined,
      lastUpdated: new Date().toISOString(),
      dataSource: 'ECMWF IFS 15-day forecast'
    }
  } catch (error) {
    console.error('Error fetching 15-day weather forecast:', error)
    return {
      coordinates: [lng, lat],
      timezone: 'UTC',
      lastUpdated: new Date().toISOString(),
      dataSource: 'ECMWF IFS 15-day forecast (error)',
      error: error instanceof Error ? error.message : 'Failed to fetch weather data'
    }
  }
}

/**
 * Legacy function for 7-day forecast (now returns 15 days)
 * @deprecated Use fetch15DayWeatherForecast instead
 */
export async function fetch7DayWeatherForecast(
  coordinates: [number, number]
): Promise<WeatherAnalysis> {
  return await fetch15DayWeatherForecast(coordinates)
}

/**
 * Fetch short-term forecast (Days 1-7) using standard API
 */
async function fetchShortTermForecast(coordinates: [number, number]): Promise<WeatherAnalysis> {
  return await fetch7DayWeatherForecast(coordinates)
}

/**
 * Fetch medium-term forecast (Days 8-15) using ECMWF AIFS model
 */
async function fetchECMWFAIFSForecast(coordinates: [number, number]): Promise<WeatherAnalysis> {
  const [lng, lat] = coordinates

  try {
    const params = new URLSearchParams({
      latitude: lat.toString(),
      longitude: lng.toString(),
      models: 'ecmwf_aifs',
      hourly: [
        'temperature_2m',
        'relative_humidity_2m',
        'precipitation',
        'wind_speed_10m',
        'wind_direction_10m',
        'weather_code',
        'cloud_cover',
        'pressure_msl'
      ].join(','),
      daily: [
        'temperature_2m_max',
        'temperature_2m_min',
        'precipitation_sum',
        'wind_speed_10m_max',
        'weather_code'
      ].join(','),
      forecast_days: '15',
      timezone: 'auto'
    })

    const url = `${WEATHER_API_CONFIG.baseUrl}/ecmwf?${params}`
    console.log('Fetching ECMWF AIFS forecast from:', url)

    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`ECMWF AIFS API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()

    // Extract days 8-15 (skip first 7 days)
    const startIndex = 7
    const endIndex = 15

    return {
      coordinates: [lng, lat],
      timezone: data.timezone || 'UTC',
      hourly: data.hourly ? {
        time: data.hourly.time.slice(startIndex * 24, endIndex * 24),
        temperature_2m: data.hourly.temperature_2m.slice(startIndex * 24, endIndex * 24),
        relative_humidity_2m: data.hourly.relative_humidity_2m.slice(startIndex * 24, endIndex * 24),
        precipitation: data.hourly.precipitation.slice(startIndex * 24, endIndex * 24),
        wind_speed_10m: data.hourly.wind_speed_10m.slice(startIndex * 24, endIndex * 24),
        wind_direction_10m: data.hourly.wind_direction_10m.slice(startIndex * 24, endIndex * 24),
        solar_radiation: new Array((endIndex - startIndex) * 24).fill(0),
        cloud_cover: data.hourly.cloud_cover.slice(startIndex * 24, endIndex * 24),
        pressure_msl: data.hourly.pressure_msl.slice(startIndex * 24, endIndex * 24),
        weather_code: data.hourly.weather_code.slice(startIndex * 24, endIndex * 24)
      } : undefined,
      daily: data.daily ? {
        time: data.daily.time.slice(startIndex, endIndex),
        temperature_2m_max: data.daily.temperature_2m_max.slice(startIndex, endIndex),
        temperature_2m_min: data.daily.temperature_2m_min.slice(startIndex, endIndex),
        precipitation_sum: data.daily.precipitation_sum.slice(startIndex, endIndex),
        wind_speed_10m_max: data.daily.wind_speed_10m_max.slice(startIndex, endIndex),
        solar_radiation_sum: new Array(endIndex - startIndex).fill(0),
        relative_humidity_2m_mean: new Array(endIndex - startIndex).fill(0),
        weather_code: data.daily.weather_code.slice(startIndex, endIndex),
        sunrise: new Array(endIndex - startIndex).fill('06:00'),
        sunset: new Array(endIndex - startIndex).fill('18:00')
      } : undefined,
      lastUpdated: new Date().toISOString(),
      dataSource: 'ECMWF AIFS (Days 8-15)'
    }
  } catch (error) {
    console.error('Error fetching ECMWF AIFS forecast:', error)
    throw error
  }
}

/**
 * Fetch long-term forecast (Days 16-35) using GFS Ensemble model
 */
async function fetchGFSEnsembleForecast(coordinates: [number, number]): Promise<WeatherAnalysis> {
  const [lng, lat] = coordinates

  try {
    const params = new URLSearchParams({
      latitude: lat.toString(),
      longitude: lng.toString(),
      models: 'gfs_seamless',
      hourly: [
        'temperature_2m',
        'relative_humidity_2m',
        'precipitation',
        'wind_speed_10m',
        'wind_direction_10m',
        'weather_code',
        'cloud_cover',
        'pressure_msl'
      ].join(','),
      daily: [
        'temperature_2m_max',
        'temperature_2m_min',
        'precipitation_sum',
        'wind_speed_10m_max',
        'weather_code'
      ].join(','),
      forecast_days: '35',
      timezone: 'auto'
    })

    const url = `https://ensemble-api.open-meteo.com/v1/ensemble?${params}`
    console.log('Fetching GFS Ensemble forecast from:', url)

    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`GFS Ensemble API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()

    // Extract days 16-35 (skip first 15 days)
    const startIndex = 15
    const endIndex = 35

    return {
      coordinates: [lng, lat],
      timezone: data.timezone || 'UTC',
      hourly: data.hourly ? {
        time: data.hourly.time.slice(startIndex * 24, endIndex * 24),
        temperature_2m: data.hourly.temperature_2m.slice(startIndex * 24, endIndex * 24),
        relative_humidity_2m: data.hourly.relative_humidity_2m.slice(startIndex * 24, endIndex * 24),
        precipitation: data.hourly.precipitation.slice(startIndex * 24, endIndex * 24),
        wind_speed_10m: data.hourly.wind_speed_10m.slice(startIndex * 24, endIndex * 24),
        wind_direction_10m: data.hourly.wind_direction_10m.slice(startIndex * 24, endIndex * 24),
        solar_radiation: new Array((endIndex - startIndex) * 24).fill(0),
        cloud_cover: data.hourly.cloud_cover.slice(startIndex * 24, endIndex * 24),
        pressure_msl: data.hourly.pressure_msl.slice(startIndex * 24, endIndex * 24),
        weather_code: data.hourly.weather_code.slice(startIndex * 24, endIndex * 24)
      } : undefined,
      daily: data.daily ? {
        time: data.daily.time.slice(startIndex, endIndex),
        temperature_2m_max: data.daily.temperature_2m_max.slice(startIndex, endIndex),
        temperature_2m_min: data.daily.temperature_2m_min.slice(startIndex, endIndex),
        precipitation_sum: data.daily.precipitation_sum.slice(startIndex, endIndex),
        wind_speed_10m_max: data.daily.wind_speed_10m_max.slice(startIndex, endIndex),
        solar_radiation_sum: new Array(endIndex - startIndex).fill(0),
        relative_humidity_2m_mean: new Array(endIndex - startIndex).fill(0),
        weather_code: data.daily.weather_code.slice(startIndex, endIndex),
        sunrise: new Array(endIndex - startIndex).fill('06:00'),
        sunset: new Array(endIndex - startIndex).fill('18:00')
      } : undefined,
      lastUpdated: new Date().toISOString(),
      dataSource: 'GFS Ensemble (Days 16-35)'
    }
  } catch (error) {
    console.error('Error fetching GFS Ensemble forecast:', error)
    throw error
  }
}

/**
 * Combine multiple forecast periods into a single forecast
 */
function combineForecasts(forecasts: WeatherAnalysis[]): WeatherAnalysis {
  const validForecasts = forecasts.filter(f => f.daily && f.hourly)

  if (validForecasts.length === 0) {
    throw new Error('No valid forecasts to combine')
  }

  const combined: WeatherAnalysis = {
    coordinates: validForecasts[0].coordinates,
    timezone: validForecasts[0].timezone,
    current: validForecasts[0].current,
    hourly: {
      time: [],
      temperature_2m: [],
      relative_humidity_2m: [],
      precipitation: [],
      wind_speed_10m: [],
      wind_direction_10m: [],
      solar_radiation: [],
      cloud_cover: [],
      pressure_msl: [],
      weather_code: []
    },
    daily: {
      time: [],
      temperature_2m_max: [],
      temperature_2m_min: [],
      precipitation_sum: [],
      wind_speed_10m_max: [],
      solar_radiation_sum: [],
      relative_humidity_2m_mean: [],
      weather_code: [],
      sunrise: [],
      sunset: []
    },
    lastUpdated: new Date().toISOString(),
    dataSource: 'Combined forecast'
  }

  // Combine all forecasts
  for (const forecast of validForecasts) {
    if (forecast.hourly) {
      combined.hourly!.time.push(...forecast.hourly.time)
      combined.hourly!.temperature_2m.push(...forecast.hourly.temperature_2m)
      combined.hourly!.relative_humidity_2m.push(...forecast.hourly.relative_humidity_2m)
      combined.hourly!.precipitation.push(...forecast.hourly.precipitation)
      combined.hourly!.wind_speed_10m.push(...forecast.hourly.wind_speed_10m)
      combined.hourly!.wind_direction_10m.push(...forecast.hourly.wind_direction_10m)
      combined.hourly!.solar_radiation.push(...forecast.hourly.solar_radiation)
      combined.hourly!.cloud_cover.push(...forecast.hourly.cloud_cover)
      combined.hourly!.pressure_msl.push(...forecast.hourly.pressure_msl)
      combined.hourly!.weather_code.push(...forecast.hourly.weather_code)
    }

    if (forecast.daily) {
      combined.daily!.time.push(...forecast.daily.time)
      combined.daily!.temperature_2m_max.push(...forecast.daily.temperature_2m_max)
      combined.daily!.temperature_2m_min.push(...forecast.daily.temperature_2m_min)
      combined.daily!.precipitation_sum.push(...forecast.daily.precipitation_sum)
      combined.daily!.wind_speed_10m_max.push(...forecast.daily.wind_speed_10m_max)
      combined.daily!.solar_radiation_sum.push(...forecast.daily.solar_radiation_sum)
      combined.daily!.relative_humidity_2m_mean.push(...forecast.daily.relative_humidity_2m_mean)
      combined.daily!.weather_code.push(...forecast.daily.weather_code)
      combined.daily!.sunrise.push(...forecast.daily.sunrise)
      combined.daily!.sunset.push(...forecast.daily.sunset)
    }
  }

  return combined
}

/**
 * Fetch current and forecast weather data (legacy function)
 */
async function fetchForecastWeather(
  lat: number,
  lng: number,
  days: number,
  model: string = 'ecmwf_ifs'
): Promise<WeatherAnalysis> {
  try {
    const params = new URLSearchParams({
      latitude: lat.toString(),
      longitude: lng.toString(),
      current: [
        'temperature_2m',
        'relative_humidity_2m',
        'precipitation',
        'wind_speed_10m',
        'wind_direction_10m',
        'weather_code',
        'cloud_cover'
      ].join(','),
      hourly: [
        'temperature_2m',
        'relative_humidity_2m',
        'precipitation',
        'wind_speed_10m',
        'wind_direction_10m',
        'cloud_cover',
        'pressure_msl',
        'weather_code'
      ].join(','),
      daily: [
        'temperature_2m_max',
        'temperature_2m_min',
        'precipitation_sum',
        'wind_speed_10m_max',
        'relative_humidity_2m_mean',
        'weather_code',
        'sunrise',
        'sunset'
      ].join(','),
      forecast_days: days.toString(),
      timezone: 'auto',
      models: model
    })

    const url = `${WEATHER_API_CONFIG.baseUrl}/forecast?${params}`
    console.log('Fetching weather forecast from:', url)

    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    console.log('Weather forecast API response:', data)
    
    return {
      coordinates: [lng, lat],
      timezone: data.timezone || 'UTC',
      current: data.current ? {
        time: data.current.time,
        temperature: data.current.temperature_2m,
        humidity: data.current.relative_humidity_2m,
        precipitation: data.current.precipitation,
        wind_speed: data.current.wind_speed_10m,
        wind_direction: data.current.wind_direction_10m,
        solar_radiation: data.current.solar_radiation || 0,
        weather_code: data.current.weather_code,
        cloud_cover: data.current.cloud_cover
      } : undefined,
      hourly: data.hourly,
      daily: data.daily,
      lastUpdated: new Date().toISOString(),
      dataSource: ''
    }
  } catch (error) {
    console.error('Error fetching forecast weather:', error)
    throw error
  }
}

/**
 * Fetch historical weather data
 */
async function fetchHistoricalWeather(
  lat: number,
  lng: number,
  startDate: string,
  endDate: string,
  model: string = 'ecmwf_ifs'
): Promise<WeatherAnalysis> {
  try {
    const params = new URLSearchParams({
      latitude: lat.toString(),
      longitude: lng.toString(),
      start_date: startDate,
      end_date: endDate,
      hourly: [
        'temperature_2m',
        'relative_humidity_2m',
        'precipitation',
        'wind_speed_10m',
        'wind_direction_10m',
        'weather_code'
      ].join(','),
      daily: [
        'temperature_2m_max',
        'temperature_2m_min',
        'precipitation_sum',
        'wind_speed_10m_max',
        'relative_humidity_2m_mean',
        'weather_code'
      ].join(','),
      timezone: 'auto',
      models: model
    })

    const url = `${WEATHER_API_CONFIG.baseUrl}/archive?${params}`
    console.log('Fetching historical weather from:', url)

    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`Historical weather API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    console.log('Historical weather API response:', data)
    
    return {
      coordinates: [lng, lat],
      timezone: data.timezone || 'UTC',
      hourly: data.hourly,
      daily: data.daily,
      lastUpdated: new Date().toISOString(),
      dataSource: ''
    }
  } catch (error) {
    console.error('Error fetching historical weather:', error)
    throw error
  }
}

/**
 * Fetch long-term climate projections
 */
async function fetchClimateProjections(
  lat: number,
  lng: number,
  startDate: string,
  endDate: string,
  model: string = 'EC_Earth3P_HR'
): Promise<WeatherAnalysis> {
  try {
    const params = new URLSearchParams({
      latitude: lat.toString(),
      longitude: lng.toString(),
      start_date: startDate,
      end_date: endDate,
      daily: [
        'temperature_2m_max',
        'temperature_2m_min',
        'precipitation_sum',
        'wind_speed_10m_max',
        'relative_humidity_2m_mean'
      ].join(','),
      models: model
    })

    const url = `${WEATHER_API_CONFIG.baseUrl}/climate?${params}`
    console.log('Fetching climate projections from:', url)

    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`Climate API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    console.log('Climate projections API response:', data)
    
    return {
      coordinates: [lng, lat],
      timezone: 'UTC',
      daily: data.daily,
      lastUpdated: new Date().toISOString(),
      dataSource: ''
    }
  } catch (error) {
    console.error('Error fetching climate projections:', error)
    throw error
  }
}

/**
 * Main function to fetch weather data based on timeframe
 */
export async function fetchWeatherData(
  coordinates: [number, number],
  timeframe: WeatherTimeframe
): Promise<WeatherAnalysis> {
  // For simplified app, always use 7-day forecast
  if (timeframe === '7-day-forecast') {
    return await fetch7DayWeatherForecast(coordinates)
  }

  // Legacy support for other timeframes (fallback to 7-day)
  console.warn(`Timeframe ${timeframe} not supported in simplified version, using 7-day forecast`)
  return await fetch7DayWeatherForecast(coordinates)
}

/**
 * Mock weather data for development
 */
export async function getMockWeatherData(
  coordinates: [number, number],
  timeframe: WeatherTimeframe
): Promise<WeatherAnalysis> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500))
  
  const now = new Date()
  const mockHourly: HourlyWeatherData = {
    time: Array.from({ length: 168 }, (_, i) => 
      new Date(now.getTime() + i * 60 * 60 * 1000).toISOString()
    ),
    temperature_2m: Array.from({ length: 168 }, (_, i) => 
      25 + Math.sin(i / 24 * Math.PI * 2) * 5 + Math.random() * 3
    ),
    relative_humidity_2m: Array.from({ length: 168 }, () => 60 + Math.random() * 30),
    precipitation: Array.from({ length: 168 }, () => Math.random() < 0.1 ? Math.random() * 5 : 0),
    wind_speed_10m: Array.from({ length: 168 }, () => 5 + Math.random() * 10),
    wind_direction_10m: Array.from({ length: 168 }, () => Math.random() * 360),
    solar_radiation: Array.from({ length: 168 }, (_, i) => 
      Math.max(0, Math.sin((i % 24) / 24 * Math.PI) * 800)
    ),
    cloud_cover: Array.from({ length: 168 }, () => Math.random() * 100),
    pressure_msl: Array.from({ length: 168 }, () => 1013 + Math.random() * 20 - 10),
    weather_code: Array.from({ length: 168 }, () => [0, 1, 2, 3, 61, 63][Math.floor(Math.random() * 6)])
  }

  const mockDaily: DailyWeatherData = {
    time: Array.from({ length: 7 }, (_, i) => 
      new Date(now.getTime() + i * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    ),
    temperature_2m_max: Array.from({ length: 7 }, () => 28 + Math.random() * 6),
    temperature_2m_min: Array.from({ length: 7 }, () => 18 + Math.random() * 4),
    precipitation_sum: Array.from({ length: 7 }, () => Math.random() * 10),
    wind_speed_10m_max: Array.from({ length: 7 }, () => 8 + Math.random() * 12),
    solar_radiation_sum: Array.from({ length: 7 }, () => 15 + Math.random() * 10),
    relative_humidity_2m_mean: Array.from({ length: 7 }, () => 65 + Math.random() * 20),
    weather_code: Array.from({ length: 7 }, () => [0, 1, 2, 61][Math.floor(Math.random() * 4)]),
    sunrise: Array.from({ length: 7 }, (_, i) => 
      new Date(now.getTime() + i * 24 * 60 * 60 * 1000).toISOString().replace(/T.*/, 'T06:30:00')
    ),
    sunset: Array.from({ length: 7 }, (_, i) => 
      new Date(now.getTime() + i * 24 * 60 * 60 * 1000).toISOString().replace(/T.*/, 'T18:45:00')
    )
  }

  return {
    coordinates,
    timezone: 'Indian/Mauritius',
    current: {
      time: now.toISOString(),
      temperature: 26.5,
      humidity: 72,
      precipitation: 0,
      wind_speed: 8.2,
      wind_direction: 120,
      solar_radiation: 450,
      weather_code: 1,
      cloud_cover: 25
    },
    hourly: mockHourly,
    daily: mockDaily,
    lastUpdated: new Date().toISOString(),
    dataSource: ''
  }
}
