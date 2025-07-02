'use client'

import { useState, useEffect } from 'react'
import { fetchSoilAnalysis, getMockSoilAnalysis, SoilAnalysis, SoilDepth, SOIL_DEPTHS } from '@/services/soilDataService'
import { fetchSatelliteAnalysis, getMockSatelliteAnalysis, SatelliteAnalysis } from '@/services/satelliteDataService'
import { calculatePolygonCenter, formatCoordinates } from '@/utils/geoUtils'
import { format } from 'date-fns'

interface DrawnArea {
  id: string
  type: string
  coordinates: [number, number][]
  area: number
  fieldIds: string[]
}

interface SoilDataTabProps {
  bloc: DrawnArea
}

export default function SoilDataTab({ bloc }: SoilDataTabProps) {
  const [soilAnalysis, setSoilAnalysis] = useState<SoilAnalysis | null>(null)
  const [satelliteAnalysis, setSatelliteAnalysis] = useState<SatelliteAnalysis | null>(null)
  const [allSoilData, setAllSoilData] = useState<Record<SoilDepth, SoilAnalysis> | null>(null)
  const [loading, setLoading] = useState(false)
  const [satelliteLoading, setSatelliteLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedDepth, setSelectedDepth] = useState<SoilDepth>('0-5cm')
  const [activeDataSource, setActiveDataSource] = useState<'soilgrids' | 'satellite' | 'both'>('both')
  const [hasInitiallyLoaded, setHasInitiallyLoaded] = useState(false)
  const [showAnimation, setShowAnimation] = useState(true)

  const fetchAllSoilData = async (useMock = false) => {
    setLoading(true)
    setError(null)

    try {
      const center = calculatePolygonCenter(bloc.coordinates)
      const allData: Record<SoilDepth, SoilAnalysis> = {} as Record<SoilDepth, SoilAnalysis>

      // Fetch data for all soil depths
      for (const depth of SOIL_DEPTHS) {
        try {
          const analysis = useMock
            ? await getMockSoilAnalysis(center)
            : await fetchSoilAnalysis(center, depth.id)

          allData[depth.id] = analysis

          if (analysis.error && !error) {
            setError(analysis.error)
          }
        } catch (err) {
          console.error(`Error fetching soil data for depth ${depth.id}:`, err)
          // Create a fallback analysis with error
          allData[depth.id] = {
            coordinates: center,
            soilGridsData: null,
            soilType: 'Unknown',
            fertility: 'Medium',
            recommendations: [`Failed to fetch soil data for depth ${depth.name}`],
            lastUpdated: new Date().toISOString(),
            error: err instanceof Error ? err.message : 'Unknown error'
          }
          if (!error) {
            setError(err instanceof Error ? err.message : 'Failed to fetch soil data')
          }
        }
      }

      setAllSoilData(allData)
      setSoilAnalysis(allData[selectedDepth])
      setHasInitiallyLoaded(true)

      // Hide animation after first successful load
      setTimeout(() => setShowAnimation(false), 1000)

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch soil data'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const fetchSatelliteData = async (useMock = false) => {
    setSatelliteLoading(true)

    try {
      const center = calculatePolygonCenter(bloc.coordinates)
      const analysis = useMock
        ? await getMockSatelliteAnalysis(center, 'soil')
        : await fetchSatelliteAnalysis(center, 'soil')

      setSatelliteAnalysis(analysis)
    } catch (err) {
      console.error('Error fetching satellite data:', err)
    } finally {
      setSatelliteLoading(false)
    }
  }

  // Handle depth selection without re-fetching
  const handleDepthChange = (depth: SoilDepth) => {
    setSelectedDepth(depth)
    if (allSoilData && allSoilData[depth]) {
      setSoilAnalysis(allSoilData[depth])
    }
  }

  useEffect(() => {
    // Only fetch data on first mount or when bloc changes
    if (!hasInitiallyLoaded) {
      fetchAllSoilData(false) // Use real API data
      fetchSatelliteData(true) // Use mock satellite data for now
    }
  }, [bloc.id, hasInitiallyLoaded])

  const getFertilityColor = (fertility: string) => {
    switch (fertility) {
      case 'High': return 'text-green-600 bg-green-50'
      case 'Medium': return 'text-yellow-600 bg-yellow-50'
      case 'Low': return 'text-red-600 bg-red-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getParameterStatus = (value: number, optimal: [number, number], unit: string) => {
    const [min, max] = optimal
    const isOptimal = value >= min && value <= max
    const statusColor = isOptimal ? 'text-green-600' : 'text-orange-600'
    const bgColor = isOptimal ? 'bg-green-50' : 'bg-orange-50'
    
    return {
      value: `${value.toFixed(1)} ${unit}`,
      status: isOptimal ? 'Optimal' : 'Needs attention',
      color: statusColor,
      bgColor
    }
  }



  // Only show animation on first load and if showAnimation is true
  if ((loading || satelliteLoading) && showAnimation && !hasInitiallyLoaded) {
    return (
      <div className="flex items-center justify-center h-full bg-gradient-to-br from-green-50 to-emerald-100">
        <div className="text-center">
          <div className="relative mb-8">
            {/* Animated Satellite */}
            <div className="text-8xl animate-bounce">🛰️</div>
            {/* Signal waves */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="w-32 h-32 border-4 border-green-300 rounded-full animate-ping opacity-20"></div>
              <div className="absolute top-2 left-2 w-28 h-28 border-4 border-green-400 rounded-full animate-ping opacity-30 animation-delay-200"></div>
              <div className="absolute top-4 left-4 w-24 h-24 border-4 border-green-500 rounded-full animate-ping opacity-40 animation-delay-400"></div>
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">Analyzing Soil Data</h3>
          <p className="text-gray-600 mb-4">Connecting to soil satellite systems...</p>
          <div className="flex items-center justify-center space-x-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse animation-delay-200"></div>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse animation-delay-400"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error && !soilAnalysis) {
    const isNoDataError = error.includes('null values') || error.includes('No soil data available')

    return (
      <div className={`rounded-lg p-6 ${
        isNoDataError ? 'bg-yellow-50 border border-yellow-200' : 'bg-red-50 border border-red-200'
      }`}>
        <div className="flex items-center mb-4">
          <div className={`text-xl mr-3 ${isNoDataError ? 'text-yellow-600' : 'text-red-600'}`}>
            {isNoDataError ? '🌊' : '⚠️'}
          </div>
          <h3 className={`text-lg font-semibold ${
            isNoDataError ? 'text-yellow-800' : 'text-red-800'
          }`}>
            {isNoDataError ? 'No Soil Data Available' : 'Error Loading Soil Data'}
          </h3>
        </div>
        <p className={`mb-4 ${isNoDataError ? 'text-yellow-700' : 'text-red-700'}`}>
          {isNoDataError
            ? 'SoilGrids data is not available for this location. This may be because the area is over water or outside the coverage area.'
            : error
          }
        </p>
        <div className="flex space-x-3">
          <button
            type="button"
            onClick={() => {
              setHasInitiallyLoaded(false)
              setShowAnimation(true)
              fetchAllSoilData(true)
            }}
            className={`px-4 py-2 text-white rounded-lg transition-colors ${
              isNoDataError
                ? 'bg-blue-600 hover:bg-blue-700'
                : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            {isNoDataError ? 'Use Sample Data' : 'Try Mock Data'}
          </button>
          <button
            type="button"
            onClick={() => {
              setHasInitiallyLoaded(false)
              setShowAnimation(true)
              fetchAllSoilData(false)
            }}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            Retry API
          </button>
        </div>
      </div>
    )
  }

  if (!soilAnalysis) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No soil data available</p>
        <button
          type="button"
          onClick={() => {
            setHasInitiallyLoaded(false)
            setShowAnimation(true)
            fetchAllSoilData(false) // Use real API data
          }}
          className="mt-4 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
        >
          Load Soil Data
        </button>
      </div>
    )
  }

  const { soilGridsData } = soilAnalysis

  if (!soilGridsData) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No soil data available</p>
      </div>
    )
  }

  return (
    <div className="flex h-full bg-gray-50">
      {/* Left Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header Info */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <span className="text-2xl mr-3">🛰️</span>
              Soil Analysis
            </h2>
            <button
              type="button"
              onClick={() => {
                setHasInitiallyLoaded(false)
                setShowAnimation(true)
                fetchAllSoilData(false)
              }}
              className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-colors"
              disabled={loading || satelliteLoading}
            >
              {loading || satelliteLoading ? '...' : 'Refresh'}
            </button>
          </div>
          
          <div className="space-y-3 text-sm">
            <div>
              <span className="text-gray-600">Location:</span>
              <div className="font-medium text-gray-900">{formatCoordinates(soilAnalysis.coordinates)}</div>
            </div>
            <div>
              <span className="text-gray-600">Soil Type:</span>
              <div className="font-medium text-gray-900">{soilAnalysis.soilType}</div>
            </div>
            <div>
              <span className="text-gray-600">Fertility:</span>
              <div className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getFertilityColor(soilAnalysis.fertility)}`}>
                {soilAnalysis.fertility}
              </div>
            </div>
            <div>
              <span className="text-gray-600">Last Updated:</span>
              <div className="font-medium text-gray-900">
                {format(new Date(soilAnalysis.lastUpdated), 'MMM dd, yyyy HH:mm')}
              </div>
            </div>
          </div>
        </div>

        {/* Soil Depth Selection */}
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Soil Depth</h3>
          <div className="space-y-2">
            {SOIL_DEPTHS.map((depth) => (
              <button
                key={depth.id}
                type="button"
                onClick={() => handleDepthChange(depth.id)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                  selectedDepth === depth.id
                    ? 'bg-green-100 text-green-800 border border-green-200'
                    : 'hover:bg-gray-50 text-gray-700'
                }`}
              >
                <div className="font-medium">{depth.name}</div>
                <div className="text-xs text-gray-500">{depth.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Data Quality */}
        {satelliteAnalysis && (
          <div className="p-6 flex-1">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Data Quality</h3>
            <div className="space-y-3">
              <div className="bg-blue-50 rounded-lg p-3">
                <div className="text-xs text-blue-600 font-medium">Analysis Quality</div>
                <div className="text-lg font-bold text-blue-900">{satelliteAnalysis.quality}</div>
                <div className="text-xs text-blue-600 mt-1">
                  Acquired: {format(new Date(satelliteAnalysis.acquisitionDate), 'MMM dd, yyyy')}
                </div>
              </div>
              <div className="bg-green-50 rounded-lg p-3">
                <div className="text-xs text-green-600 font-medium">Cloud Cover</div>
                <div className="text-lg font-bold text-green-900">{satelliteAnalysis.cloudCover.toFixed(1)}%</div>
                <div className="text-xs text-green-600 mt-1">
                  {satelliteAnalysis.cloudCover < 10 ? 'Excellent' :
                   satelliteAnalysis.cloudCover < 30 ? 'Good' : 'Fair'}
                </div>
              </div>
              <div className="bg-yellow-50 rounded-lg p-3">
                <div className="text-xs text-yellow-600 font-medium">Soil Brightness</div>
                <div className="text-lg font-bold text-yellow-900">{satelliteAnalysis.soilIndices.brightness.toFixed(3)}</div>
                <div className="text-xs text-yellow-600 mt-1">
                  {satelliteAnalysis.soilIndices.brightness > 0.25 ? 'High' : 'Normal'}
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6 space-y-6">
          {/* Soil Physical Properties */}
          {soilAnalysis?.soilGridsData && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <span className="text-xl mr-2">🏔️</span>
                Physical Properties
              </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Sand Content */}
              {(() => {
                const sand = getParameterStatus(soilGridsData.sand, [30, 70], '%')
                return (
                  <div className={`p-4 rounded-lg ${sand.bgColor}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Sand Content</span>
                      <span className={`text-xs px-2 py-1 rounded ${sand.color} bg-white`}>
                        {sand.status}
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{sand.value}</div>
                    <div className="text-xs text-gray-600 mt-1">Depth: {selectedDepth}</div>
                  </div>
                )
              })()}

              {/* Silt Content */}
              {(() => {
                const silt = getParameterStatus(soilGridsData.silt, [20, 50], '%')
                return (
                  <div className={`p-4 rounded-lg ${silt.bgColor}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Silt Content</span>
                      <span className={`text-xs px-2 py-1 rounded ${silt.color} bg-white`}>
                        {silt.status}
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{silt.value}</div>
                    <div className="text-xs text-gray-600 mt-1">Depth: {selectedDepth}</div>
                  </div>
                )
              })()}

              {/* Clay Content */}
              {(() => {
                const clay = getParameterStatus(soilGridsData.clay, [15, 40], '%')
                return (
                  <div className={`p-4 rounded-lg ${clay.bgColor}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Clay Content</span>
                      <span className={`text-xs px-2 py-1 rounded ${clay.color} bg-white`}>
                        {clay.status}
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{clay.value}</div>
                    <div className="text-xs text-gray-600 mt-1">Depth: {selectedDepth}</div>
                  </div>
                )
              })()}

              {/* Bulk Density */}
              {(() => {
                const bdod = getParameterStatus(soilGridsData.bdod, [1.0, 1.6], 'kg/dm³')
                return (
                  <div className={`p-4 rounded-lg ${bdod.bgColor}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Bulk Density</span>
                      <span className={`text-xs px-2 py-1 rounded ${bdod.color} bg-white`}>
                        {bdod.status}
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{bdod.value}</div>
                    <div className="text-xs text-gray-600 mt-1">Optimal: 1.0-1.6 kg/dm³</div>
                  </div>
                )
              })()}

              {/* Coarse Fragments */}
              {(() => {
                const cfvo = getParameterStatus(soilGridsData.cfvo, [0, 15], '%')
                return (
                  <div className={`p-4 rounded-lg ${cfvo.bgColor}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Coarse Fragments</span>
                      <span className={`text-xs px-2 py-1 rounded ${cfvo.color} bg-white`}>
                        {cfvo.status}
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{cfvo.value}</div>
                    <div className="text-xs text-gray-600 mt-1">Rock/gravel content</div>
                  </div>
                )
              })()}

              {/* Soil Moisture - from satellite */}
              {satelliteAnalysis && (() => {
                const moisture = satelliteAnalysis.soilIndices.moisture
                return (
                  <div className="p-4 rounded-lg bg-cyan-50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Soil Moisture</span>
                      <span className="text-xs px-2 py-1 rounded bg-cyan-100 text-cyan-800">
                        {moisture > 0.3 ? 'Good' : 'Low'}
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{(moisture * 100).toFixed(1)}%</div>
                    <div className="text-xs text-gray-600 mt-1">Satellite moisture</div>
                  </div>
                )
              })()}
            </div>
            </div>
          )}

          {/* Chemical Properties */}
          {soilAnalysis?.soilGridsData && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <span className="text-xl mr-2">🧪</span>
                Chemical Properties
              </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* pH */}
              {(() => {
                const ph = getParameterStatus(soilGridsData.phh2o, [6.0, 7.5], '')
                return (
                  <div className={`p-4 rounded-lg ${ph.bgColor}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">pH Level</span>
                      <span className={`text-xs px-2 py-1 rounded ${ph.color} bg-white`}>
                        {ph.status}
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{ph.value}</div>
                    <div className="text-xs text-gray-600 mt-1">Optimal: 6.0-7.5</div>
                  </div>
                )
              })()}

              {/* Organic Carbon */}
              {(() => {
                const soc = getParameterStatus(soilGridsData.soc, [15, 50], 'g/kg')
                return (
                  <div className={`p-4 rounded-lg ${soc.bgColor}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Organic Carbon</span>
                      <span className={`text-xs px-2 py-1 rounded ${soc.color} bg-white`}>
                        {soc.status}
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{soc.value}</div>
                    <div className="text-xs text-gray-600 mt-1">Good: &gt;15 g/kg</div>
                  </div>
                )
              })()}

              {/* CEC */}
              {(() => {
                const cec = getParameterStatus(soilGridsData.cec, [15, 40], 'cmol/kg')
                return (
                  <div className={`p-4 rounded-lg ${cec.bgColor}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">CEC</span>
                      <span className={`text-xs px-2 py-1 rounded ${cec.color} bg-white`}>
                        {cec.status}
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{cec.value}</div>
                    <div className="text-xs text-gray-600 mt-1">Good: &gt;15 cmol/kg</div>
                  </div>
                )
              })()}

              {/* Nitrogen */}
              {(() => {
                const nitrogen = getParameterStatus(soilGridsData.nitrogen, [1.5, 5], 'g/kg')
                return (
                  <div className={`p-4 rounded-lg ${nitrogen.bgColor}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Total Nitrogen</span>
                      <span className={`text-xs px-2 py-1 rounded ${nitrogen.color} bg-white`}>
                        {nitrogen.status}
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{nitrogen.value}</div>
                    <div className="text-xs text-gray-600 mt-1">Good: &gt;1.5 g/kg</div>
                  </div>
                )
              })()}

              {/* Soil Organic Matter - from satellite */}
              {satelliteAnalysis && (() => {
                const organicMatter = satelliteAnalysis.soilIndices.organic_matter
                return (
                  <div className="p-4 rounded-lg bg-emerald-50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Organic Matter</span>
                      <span className="text-xs px-2 py-1 rounded bg-emerald-100 text-emerald-800">
                        {organicMatter > 0.1 ? 'Good' : 'Low'}
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{(organicMatter * 100).toFixed(1)}%</div>
                    <div className="text-xs text-gray-600 mt-1">Satellite organic</div>
                  </div>
                )
              })()}
            </div>
            </div>
          )}



          {error && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center">
                <div className="text-yellow-600 text-lg mr-2">⚠️</div>
                <p className="text-yellow-800 text-sm">{error}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
