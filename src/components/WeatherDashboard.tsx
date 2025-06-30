'use client'

import React, { useState, useEffect, useRef } from 'react'
import { fetch7DayWeatherForecast, getMockWeatherData, WeatherAnalysis } from '@/services/weatherDataService'
import { calculatePolygonCenter } from '@/utils/geoUtils'

interface DrawnArea {
  id: string
  coordinates: [number, number][]
  area: number
  name?: string
}

interface WeatherDashboardProps {
  drawnAreas: DrawnArea[]
}

const WeatherDashboard: React.FC<WeatherDashboardProps> = ({ drawnAreas }) => {
  const [weatherData, setWeatherData] = useState<WeatherAnalysis | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedDay, setSelectedDay] = useState<number | null>(0) // Initialize with today (day 0)
  const hourlyScrollRef = useRef<HTMLDivElement>(null)

  // Fetch weather data
  const fetchWeatherData = async (useMockData = false) => {
    if (drawnAreas.length === 0) return

    setLoading(true)
    setError(null)

    try {
      const centerCoords = calculatePolygonCenter(drawnAreas[0].coordinates)

      const analysis = useMockData
        ? getMockWeatherData(centerCoords)
        : await fetch7DayWeatherForecast(centerCoords)

      setWeatherData(analysis)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch weather data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (drawnAreas.length > 0) {
      fetchWeatherData(false)
    }
  }, [drawnAreas])

  // Scroll logic when weather data loads or day changes
  useEffect(() => {
    if (weatherData && selectedDay !== null && hourlyScrollRef.current) {
      setTimeout(() => {
        if (hourlyScrollRef.current) {
          if (selectedDay === 0) {
            // For today: scroll to current hour
            const now = new Date()
            const currentHour = now.getHours()
            const scrollPosition = currentHour * 116 // Each card is approximately 116px wide including margin

            hourlyScrollRef.current.scrollTo({
              left: scrollPosition,
              behavior: 'smooth'
            })
          } else {
            // For other days: scroll to far left (start of day)
            hourlyScrollRef.current.scrollTo({
              left: 0,
              behavior: 'smooth'
            })
          }
        }
      }, 100) // Small delay to ensure DOM is ready
    }
  }, [weatherData, selectedDay])

  // Get weather emoji/icon - Accurate OpenMeteo weather code mapping
  const getWeatherIcon = (code: number): string => {
    // Clear conditions
    if (code === 0) return '☀️'  // Clear sky
    if (code === 1) return '🌤️'  // Mainly clear
    if (code === 2) return '⛅'  // Partly cloudy
    if (code === 3) return '☁️'  // Overcast

    // Fog
    if (code === 45 || code === 48) return '🌫️'  // Fog

    // Drizzle
    if (code === 51) return '🌦️'  // Light drizzle
    if (code === 53) return '🌦️'  // Moderate drizzle
    if (code === 55) return '🌧️'  // Dense drizzle

    // Rain
    if (code === 61) return '🌧️'  // Slight rain
    if (code === 63) return '🌧️'  // Moderate rain
    if (code === 65) return '🌧️'  // Heavy rain

    // Freezing rain (rare in tropics)
    if (code === 66 || code === 67) return '🌧️'  // Freezing rain

    // Snow (should not occur in tropical climates)
    if (code === 71) return '❄️'  // Slight snow
    if (code === 73) return '❄️'  // Moderate snow
    if (code === 75) return '❄️'  // Heavy snow
    if (code === 77) return '❄️'  // Snow grains

    // Rain showers
    if (code === 80) return '🌦️'  // Slight rain showers
    if (code === 81) return '🌧️'  // Moderate rain showers
    if (code === 82) return '🌧️'  // Violent rain showers

    // Snow showers (should not occur in tropics)
    if (code === 85 || code === 86) return '❄️'  // Snow showers

    // Thunderstorms
    if (code === 95) return '⛈️'  // Thunderstorm
    if (code === 96 || code === 99) return '⛈️'  // Thunderstorm with hail

    // Default fallback
    return '☁️'
  }

  const getWeatherDescription = (code: number): string => {
    // Clear conditions
    if (code === 0) return 'Clear sky'
    if (code === 1) return 'Mainly clear'
    if (code === 2) return 'Partly cloudy'
    if (code === 3) return 'Overcast'

    // Fog
    if (code === 45) return 'Fog'
    if (code === 48) return 'Depositing rime fog'

    // Drizzle
    if (code === 51) return 'Light drizzle'
    if (code === 53) return 'Moderate drizzle'
    if (code === 55) return 'Dense drizzle'

    // Rain
    if (code === 61) return 'Slight rain'
    if (code === 63) return 'Moderate rain'
    if (code === 65) return 'Heavy rain'

    // Freezing rain
    if (code === 66) return 'Light freezing rain'
    if (code === 67) return 'Heavy freezing rain'

    // Snow
    if (code === 71) return 'Slight snow'
    if (code === 73) return 'Moderate snow'
    if (code === 75) return 'Heavy snow'
    if (code === 77) return 'Snow grains'

    // Rain showers
    if (code === 80) return 'Slight rain showers'
    if (code === 81) return 'Moderate rain showers'
    if (code === 82) return 'Violent rain showers'

    // Snow showers
    if (code === 85) return 'Slight snow showers'
    if (code === 86) return 'Heavy snow showers'

    // Thunderstorms
    if (code === 95) return 'Thunderstorm'
    if (code === 96) return 'Thunderstorm with slight hail'
    if (code === 99) return 'Thunderstorm with heavy hail'

    return 'Unknown weather'
  }

  if (drawnAreas.length === 0) {
    return (
      <div className="p-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-blue-800 font-medium">No Area Selected</h3>
          <p className="text-blue-600 text-sm mt-1">Please draw an area on the map to view weather data for that location.</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-lg shadow p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading weather data...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-medium">Error Loading Weather Data</h3>
          <p className="text-red-600 text-sm mt-1">{error}</p>
          <div className="mt-4 space-x-2">
            <button
              type="button"
              onClick={() => fetchWeatherData(false)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Retry API
            </button>
            <button
              type="button"
              onClick={() => fetchWeatherData(true)}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Use Mock Data
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!weatherData || !weatherData.daily) return null

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">7-Day Weather Forecast</h2>
        <p className="text-gray-600">Click on a day to see hourly details</p>
      </div>

      {/* 7-Day Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4 mb-6">
        {weatherData.daily.time.slice(0, 7).map((date, index) => {
          const isSelected = selectedDay === index
          const maxTemp = Math.round(weatherData.daily!.temperature_2m_max[index])
          const minTemp = Math.round(weatherData.daily!.temperature_2m_min[index])
          const precipitation = weatherData.daily!.precipitation_sum[index]
          const windSpeed = Math.round(weatherData.daily!.wind_speed_10m_max[index])
          const weatherCode = weatherData.daily!.weather_code[index]

          return (
            <div
              key={date}
              className={`bg-white rounded-lg shadow-md p-4 cursor-pointer transition-all hover:shadow-lg ${
                isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : ''
              }`}
              onClick={() => setSelectedDay(isSelected ? null : index)}
            >
              <div className="text-center">
                {/* Day */}
                <div className="text-sm font-medium text-gray-600 mb-2">
                  {new Date(date).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric'
                  })}
                </div>

                {/* Weather Icon */}
                <div className="text-4xl mb-3">
                  {getWeatherIcon(weatherCode)}
                </div>

                {/* Temperature */}
                <div className="mb-3">
                  <div className="text-xl font-bold text-gray-900">{maxTemp}°</div>
                  <div className="text-sm text-gray-500">{minTemp}°</div>
                </div>

                {/* Weather Details */}
                <div className="space-y-1 text-xs text-gray-600">
                  <div className="text-sm text-gray-700">
                    {getWeatherDescription(weatherCode)}
                  </div>

                  {precipitation > 0 && (
                    <div className="flex items-center justify-center text-blue-600">
                      <span className="mr-1">💧</span>
                      {precipitation.toFixed(1)}mm
                    </div>
                  )}

                  <div className="flex items-center justify-center text-gray-500">
                    <span className="mr-1">💨</span>
                    {windSpeed} km/h
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Hourly Details for Selected Day */}
      {selectedDay !== null && weatherData.hourly && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Hourly Forecast - {new Date(weatherData.daily.time[selectedDay]).toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric'
            })}
          </h3>

          <div className="overflow-x-auto" ref={hourlyScrollRef}>
            <div className="flex space-x-4 pb-4 min-w-max">
              {Array.from({ length: 24 }, (_, hour) => {
                const hourIndex = selectedDay * 24 + hour
                if (hourIndex >= weatherData.hourly!.time.length) return null

                const time = new Date(weatherData.hourly!.time[hourIndex])
                const temp = Math.round(weatherData.hourly!.temperature_2m[hourIndex])
                const precipitation = weatherData.hourly!.precipitation[hourIndex]
                const windSpeed = Math.round(weatherData.hourly!.wind_speed_10m[hourIndex])
                const humidity = weatherData.hourly!.relative_humidity_2m[hourIndex]
                const cloudCover = weatherData.hourly!.cloud_cover[hourIndex]
                const weatherCode = weatherData.hourly!.weather_code[hourIndex]

                // Check if this is the current hour (only for today)
                const now = new Date()
                const isCurrentHour = selectedDay === 0 && hour === now.getHours()

                return (
                  <div key={hour} className={`flex-shrink-0 rounded-lg p-3 text-center min-w-[100px] ${
                    isCurrentHour
                      ? 'bg-blue-100 border-2 border-blue-500'
                      : 'bg-gray-50'
                  }`}>
                    {/* Time */}
                    <div className="text-xs text-gray-600 mb-2">
                      {time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </div>

                    {/* Weather Icon */}
                    <div className="text-2xl mb-2">
                      {getWeatherIcon(weatherCode)}
                    </div>

                    {/* Temperature */}
                    <div className="text-lg font-bold text-gray-900 mb-2">{temp}°C</div>

                    {/* Details */}
                    <div className="space-y-1 text-xs text-gray-600">
                      {precipitation > 0 && (
                        <div className="text-blue-600">
                          💧 {precipitation.toFixed(1)}mm
                        </div>
                      )}
                      <div>💨 {windSpeed} km/h</div>
                      <div>💧 {humidity}%</div>
                      <div>☁️ {cloudCover}%</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="mt-6 text-sm text-gray-500">
        <div>Last Updated: {new Date(weatherData.lastUpdated).toLocaleString()}</div>
      </div>
    </div>
  )
}

export default WeatherDashboard
