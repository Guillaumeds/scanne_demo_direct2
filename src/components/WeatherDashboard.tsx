'use client'

import React, { useState, useEffect, useRef } from 'react'
import { fetch15DayWeatherForecast, WeatherAnalysis } from '@/services/weatherDataService'
import { calculatePolygonCenter } from '@/utils/geoUtils'
import {
  Sun,
  CloudSun,
  Cloud,
  CloudRain,
  CloudDrizzle,
  CloudSnow,
  CloudLightning
  Thermometer,
  Droplets,
  Wind,
  Eye,
  Gauge,
  RefreshCw,
  MapPin
} from 'lucide-react'

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
  const [selectedDay, setSelectedDay] = useState<number | null>(0)
  const hourlyScrollRef = useRef<HTMLDivElement>(null)
  const dailyScrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  // Fetch weather data
  const fetchWeatherData = async () => {
    if (drawnAreas.length === 0) return

    setLoading(true)
    setError(null)

    try {
      const centerCoords = calculatePolygonCenter(drawnAreas[0].coordinates)
      const analysis = await fetch15DayWeatherForecast(centerCoords)
      setWeatherData(analysis)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch weather data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (drawnAreas.length > 0) {
      fetchWeatherData()
    }
  }, [drawnAreas])

  // Scroll logic when weather data loads or day changes
  useEffect(() => {
    if (weatherData && selectedDay !== null && hourlyScrollRef.current) {
      setTimeout(() => {
        if (hourlyScrollRef.current) {
          if (selectedDay === 0) {
            const now = new Date()
            const currentHour = now.getHours()
            const scrollPosition = currentHour * 116

            hourlyScrollRef.current.scrollTo({
              left: scrollPosition,
              behavior: 'smooth'
            })
          } else {
            hourlyScrollRef.current.scrollTo({
              left: 0,
              behavior: 'smooth'
            })
          }
        }
      }, 100)
    }
  }, [weatherData, selectedDay])

  // Check scroll position for daily cards
  const checkScrollPosition = () => {
    if (dailyScrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = dailyScrollRef.current
      setCanScrollLeft(scrollLeft > 0)
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1)
    }
  }

  // Scroll daily cards by 7 days (or remaining days)
  const scrollDaily = (direction: 'left' | 'right') => {
    if (dailyScrollRef.current) {
      const cardWidth = 100 + 16 // card width (min-w-[100px]) + gap
      const scrollAmount = cardWidth * 7 // 7 cards at a time
      const currentScroll = dailyScrollRef.current.scrollLeft

      let newScrollPosition
      if (direction === 'left') {
        newScrollPosition = Math.max(0, currentScroll - scrollAmount)
      } else {
        const maxScroll = dailyScrollRef.current.scrollWidth - dailyScrollRef.current.clientWidth
        newScrollPosition = Math.min(maxScroll, currentScroll + scrollAmount)
      }

      dailyScrollRef.current.scrollTo({
        left: newScrollPosition,
        behavior: 'smooth'
      })
    }
  }

  // Update scroll position when weather data loads
  useEffect(() => {
    if (weatherData && dailyScrollRef.current) {
      setTimeout(checkScrollPosition, 100)
    }
  }, [weatherData])

  // Render weather icon component
  const renderWeatherIcon = (code: number, className: string = "w-6 h-6") => {
    const iconName = getWeatherIcon(code)
    const iconComponents = {
      Sun,
      CloudSun,
      Cloud,
      CloudRain,
      CloudDrizzle,
      CloudSnow,
      CloudLightning,
      Cloud
    }

    const IconComponent = iconComponents[iconName as keyof typeof iconComponents] || Cloud
    return <IconComponent className={className} />
  }

  // Get weather icon name for Lucide React
  const getWeatherIcon = (code: number): string => {
    if (code === 0) return 'Sun'
    if (code === 1) return 'Sun'
    if (code === 2) return 'CloudSun'
    if (code === 3) return 'Cloud'
    if (code === 45 || code === 48) return 'Cloud'
    if (code === 51) return 'CloudDrizzle'
    if (code === 53) return 'CloudDrizzle'
    if (code === 55) return 'CloudRain'
    if (code === 61) return 'CloudRain'
    if (code === 63) return 'CloudRain'
    if (code === 65) return 'CloudRain'
    if (code === 66 || code === 67) return 'CloudRain'
    if (code === 71) return 'CloudSnow'
    if (code === 73) return 'CloudSnow'
    if (code === 75) return 'CloudSnow'
    if (code === 77) return 'CloudSnow'
    if (code === 80) return 'CloudDrizzle'
    if (code === 81) return 'CloudRain'
    if (code === 82) return 'CloudRain'
    if (code === 85 || code === 86) return 'CloudSnow'
    if (code === 95) return 'CloudLightning'
    if (code === 96 || code === 99) return 'CloudLightning'
    return 'Cloud'
  }

  const getWeatherDescription = (code: number): string => {
    if (code === 0) return 'Clear sky'
    if (code === 1) return 'Mainly clear'
    if (code === 2) return 'Partly cloudy'
    if (code === 3) return 'Overcast'
    if (code === 45) return 'Fog'
    if (code === 48) return 'Depositing rime fog'
    if (code === 51) return 'Light drizzle'
    if (code === 53) return 'Moderate drizzle'
    if (code === 55) return 'Dense drizzle'
    if (code === 61) return 'Slight rain'
    if (code === 63) return 'Moderate rain'
    if (code === 65) return 'Heavy rain'
    if (code === 66) return 'Light freezing rain'
    if (code === 67) return 'Heavy freezing rain'
    if (code === 71) return 'Slight snow'
    if (code === 73) return 'Moderate snow'
    if (code === 75) return 'Heavy snow'
    if (code === 77) return 'Snow grains'
    if (code === 80) return 'Slight rain showers'
    if (code === 81) return 'Moderate rain showers'
    if (code === 82) return 'Violent rain showers'
    if (code === 85) return 'Slight snow showers'
    if (code === 86) return 'Heavy snow showers'
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
      <div className="flex flex-col items-center justify-center p-12 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg min-h-[400px]">
        <div className="text-center">
          {/* Weather Icon */}
          <div className="mx-auto mb-6 w-24 h-24 bg-blue-200 rounded-full flex items-center justify-center">
            <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.002 4.002 0 003 15z" />
            </svg>
          </div>

          {/* Scanne Logo */}
          <div className="mb-4">
            <img
              src="/scanne-logo.png"
              alt="Scanne"
              className="h-8 mx-auto opacity-60"
              onError={(e) => {
                e.currentTarget.style.display = 'none'
              }}
            />
          </div>

          <h3 className="text-2xl font-semibold text-gray-800 mb-3">Weather Service Unavailable</h3>
          <p className="text-gray-600 mb-6 max-w-md">
            We&apos;re unable to fetch weather data at the moment. Please check your internet connection and try again later.
          </p>

          <button
            type="button"
            onClick={() => fetchWeatherData()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
          >
            Try Again
          </button>

          <p className="text-xs text-gray-500 mt-4">
            Error: {error}
          </p>
        </div>
      </div>
    )
  }

  if (!weatherData || !weatherData.daily) return null

  return (
    <div className="p-6">
      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">15-Day Weather Forecast</h2>
        <p className="text-gray-600">Click on a day to see hourly details • Powered by ECMWF IFS</p>
      </div>

      {/* 15-Day Cards - Scrollable with Navigation */}
      <div className="mb-6 relative">
        {/* Left Arrow */}
        {canScrollLeft && (
          <button
            type="button"
            onClick={() => scrollDaily('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-2 hover:bg-gray-50 transition-colors -mt-5"
            aria-label="Scroll to previous 7 days"
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}

        {/* Right Arrow */}
        {canScrollRight && (
          <button
            type="button"
            onClick={() => scrollDaily('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-2 hover:bg-gray-50 transition-colors -mt-5"
            aria-label="Scroll to next 7 days"
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}

        <div
          className={`overflow-x-auto scrollbar-hide ${canScrollLeft ? 'pl-12' : 'pl-2'} ${canScrollRight ? 'pr-12' : 'pr-2'}`}
          ref={dailyScrollRef}
          onScroll={checkScrollPosition}
        >
          <div className="flex space-x-4 pb-4 pt-2">
            {weatherData.daily.time.slice(0, 15).map((date, index) => {
              const isSelected = selectedDay === index
              const maxTemp = Math.round(weatherData.daily!.temperature_2m_max[index])
              const minTemp = Math.round(weatherData.daily!.temperature_2m_min[index])
              const precipitation = weatherData.daily!.precipitation_sum[index]
              const windSpeed = Math.round(weatherData.daily!.wind_speed_10m_max[index])
              const weatherCode = weatherData.daily!.weather_code[index]

              return (
                <div
                  key={date}
                  className={`bg-white rounded-lg shadow-md p-3 cursor-pointer transition-all hover:shadow-lg flex-shrink-0 min-w-[100px] text-center m-1 ${
                    isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                  }`}
                  onClick={() => setSelectedDay(isSelected ? null : index)}
                >
                  <div className="text-center">
                    <div className="text-sm font-medium text-gray-600 mb-2">
                      {new Date(date).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </div>

                    <div className="mb-3 flex justify-center">
                      {renderWeatherIcon(weatherCode, "w-12 h-12 text-blue-600")}
                    </div>

                    <div className="mb-3">
                      <div className="text-xl font-bold text-gray-900">{maxTemp}°</div>
                      <div className="text-sm text-gray-500">{minTemp}°</div>
                    </div>

                    <div className="space-y-1 text-xs text-gray-600">
                      <div className="text-sm text-gray-700">
                        {getWeatherDescription(weatherCode)}
                      </div>

                      {precipitation > 0 && (
                        <div className="flex items-center justify-center text-blue-600 gap-1">
                          <Droplets className="w-3 h-3" />
                          {precipitation.toFixed(1)}mm
                        </div>
                      )}

                      <div className="flex items-center justify-center text-gray-500 gap-1">
                        <Wind className="w-3 h-3" />
                        {windSpeed} km/h
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
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

                const now = new Date()
                const isCurrentHour = selectedDay === 0 && hour === now.getHours()

                return (
                  <div key={hour} className={`flex-shrink-0 rounded-lg p-3 text-center min-w-[100px] ${
                    isCurrentHour
                      ? 'bg-blue-100 border-2 border-blue-500'
                      : 'bg-gray-50'
                  }`}>
                    <div className="text-xs text-gray-600 mb-2">
                      {time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </div>

                    <div className="mb-2 flex justify-center">
                      {renderWeatherIcon(weatherCode, "w-8 h-8 text-blue-600")}
                    </div>

                    <div className="text-lg font-bold text-gray-900 mb-2">{temp}°C</div>

                    <div className="space-y-1 text-xs text-gray-600">
                      {precipitation > 0 && (
                        <div className="text-blue-600 flex items-center gap-1">
                          <Droplets className="w-3 h-3" />
                          {precipitation.toFixed(1)}mm
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Wind className="w-3 h-3" />
                        {windSpeed} km/h
                      </div>
                      <div className="flex items-center gap-1">
                        <Droplets className="w-3 h-3" />
                        {humidity}%
                      </div>
                      <div className="flex items-center gap-1">
                        <Cloud className="w-3 h-3" />
                        {cloudCover}%
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      <div className="mt-6 text-sm text-gray-500">
        <div>Last Updated: {new Date(weatherData.lastUpdated).toLocaleString()}</div>
      </div>
    </div>
  )
}

export default WeatherDashboard
