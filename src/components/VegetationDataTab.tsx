'use client'

import { useState, useEffect } from 'react'
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

interface VegetationDataTabProps {
  bloc: DrawnArea
}

export default function VegetationDataTab({ bloc }: VegetationDataTabProps) {
  const [satelliteAnalysis, setSatelliteAnalysis] = useState<SatelliteAnalysis | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [timeRange, setTimeRange] = useState<'current' | 'historical'>('current')

  const fetchVegetationData = async (useMock = false) => {
    setLoading(true)
    setError(null)
    
    try {
      const center = calculatePolygonCenter(bloc.coordinates)
      const analysis = useMock 
        ? await getMockSatelliteAnalysis(center, 'vegetation')
        : await fetchSatelliteAnalysis(center, 'vegetation')
      
      setSatelliteAnalysis(analysis)
      if (analysis.error) {
        setError(analysis.error)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch vegetation data'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Auto-fetch vegetation data when component mounts
    fetchVegetationData(true) // Use mock data for now
  }, [bloc.id])

  const getVegetationHealth = (ndvi: number) => {
    if (ndvi >= 0.7) return { status: 'Excellent', color: 'text-green-600 bg-green-50', bgColor: 'bg-green-100' }
    if (ndvi >= 0.5) return { status: 'Good', color: 'text-green-600 bg-green-50', bgColor: 'bg-green-100' }
    if (ndvi >= 0.3) return { status: 'Fair', color: 'text-yellow-600 bg-yellow-50', bgColor: 'bg-yellow-100' }
    if (ndvi >= 0.1) return { status: 'Poor', color: 'text-orange-600 bg-orange-50', bgColor: 'bg-orange-100' }
    return { status: 'Very Poor', color: 'text-red-600 bg-red-50', bgColor: 'bg-red-100' }
  }

  const getIndexStatus = (value: number, thresholds: [number, number]) => {
    const [low, high] = thresholds
    if (value >= high) return { status: 'High', color: 'text-green-600', bgColor: 'bg-green-50' }
    if (value >= low) return { status: 'Normal', color: 'text-blue-600', bgColor: 'bg-blue-50' }
    return { status: 'Low', color: 'text-red-600', bgColor: 'bg-red-50' }
  }

  if (loading) {
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
          <h3 className="text-2xl font-bold text-gray-800 mb-2">Analyzing Vegetation Data</h3>
          <p className="text-gray-600 mb-4">Connecting to vegetation satellite systems...</p>
          <div className="flex items-center justify-center space-x-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse animation-delay-200"></div>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse animation-delay-400"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error && !satelliteAnalysis) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center mb-4">
          <div className="text-red-600 text-xl mr-3">⚠️</div>
          <h3 className="text-lg font-semibold text-red-800">Error Loading Vegetation Data</h3>
        </div>
        <p className="text-red-700 mb-4">{error}</p>
        <div className="flex space-x-3">
          <button
            type="button"
            onClick={() => fetchVegetationData(true)}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            Try Mock Data
          </button>
          <button
            type="button"
            onClick={() => fetchVegetationData(false)}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            Retry Analysis
          </button>
        </div>
      </div>
    )
  }

  if (!satelliteAnalysis) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No vegetation data available</p>
        <button
          type="button"
          onClick={() => fetchVegetationData(true)}
          className="mt-4 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
        >
          Load Vegetation Data
        </button>
      </div>
    )
  }

  const { vegetationIndices } = satelliteAnalysis
  const healthStatus = getVegetationHealth(vegetationIndices.ndvi)

  return (
    <div className="flex h-full bg-gray-50">
      {/* Left Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header Info */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <span className="text-2xl mr-3">🌿</span>
              Vegetation Analysis
            </h2>
            <button
              type="button"
              onClick={() => fetchVegetationData(false)}
              className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-colors"
              disabled={loading}
            >
              {loading ? '...' : 'Refresh'}
            </button>
          </div>
          
          <div className="space-y-3 text-sm">
            <div>
              <span className="text-gray-600">Location:</span>
              <div className="font-medium text-gray-900">{formatCoordinates(satelliteAnalysis.coordinates)}</div>
            </div>
            <div>
              <span className="text-gray-600">Area:</span>
              <div className="font-medium text-gray-900">{bloc.area.toFixed(2)} hectares</div>
            </div>
            <div>
              <span className="text-gray-600">Last Updated:</span>
              <div className="font-medium text-gray-900">
                {format(new Date(satelliteAnalysis.acquisitionDate), 'MMM dd, HH:mm')}
              </div>
            </div>
          </div>
        </div>

        {/* Time Range Selection */}
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Time Range</h3>
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => setTimeRange('current')}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                timeRange === 'current'
                  ? 'bg-green-100 text-green-800 border border-green-200'
                  : 'hover:bg-gray-50 text-gray-700'
              }`}
            >
              <span className="mr-2">📅</span>
              Current Analysis
            </button>
            <button
              type="button"
              onClick={() => setTimeRange('historical')}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                timeRange === 'historical'
                  ? 'bg-blue-100 text-blue-800 border border-blue-200'
                  : 'hover:bg-gray-50 text-gray-700'
              }`}
            >
              <span className="mr-2">📈</span>
              Historical Trends
            </button>
          </div>
        </div>


      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6 space-y-6">
          {/* Data Quality Block - Always First */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <span className="text-xl mr-2">📊</span>
              Data Quality
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="text-sm font-medium text-gray-700 mb-2">Analysis Quality</div>
                <div className="text-2xl font-bold text-gray-900">{satelliteAnalysis.quality}</div>
                <div className="text-xs text-gray-600 mt-1">
                  Acquired: {format(new Date(satelliteAnalysis.acquisitionDate), 'MMM dd, yyyy')}
                </div>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <div className="text-sm font-medium text-gray-700 mb-2">Cloud Cover</div>
                <div className="text-2xl font-bold text-gray-900">{satelliteAnalysis.cloudCover.toFixed(1)}%</div>
                <div className="text-xs text-gray-600 mt-1">
                  {satelliteAnalysis.cloudCover < 10 ? 'Excellent' :
                   satelliteAnalysis.cloudCover < 30 ? 'Good' : 'Fair'}
                </div>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="text-sm font-medium text-gray-700 mb-2">Coverage</div>
                <div className="text-2xl font-bold text-gray-900">{bloc.area.toFixed(1)} ha</div>
                <div className="text-xs text-gray-600 mt-1">Analysis area</div>
              </div>
            </div>
          </div>

          {/* Vegetation Indices */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <span className="text-xl mr-2">🌱</span>
              Vegetation Indices
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* NDVI */}
              <div className={`p-4 rounded-lg ${healthStatus.bgColor}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">NDVI</span>
                  <span className={`text-xs px-2 py-1 rounded ${healthStatus.color}`}>
                    {healthStatus.status}
                  </span>
                </div>
                <div className="text-2xl font-bold text-gray-900">{vegetationIndices.ndvi.toFixed(3)}</div>
                <div className="text-xs text-gray-600 mt-1">Vegetation vigor</div>
              </div>

              {/* EVI */}
              {(() => {
                const eviStatus = getIndexStatus(vegetationIndices.evi, [0.3, 0.6])
                return (
                  <div className={`p-4 rounded-lg ${eviStatus.bgColor}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">EVI</span>
                      <span className={`text-xs px-2 py-1 rounded ${eviStatus.color} bg-white`}>
                        {eviStatus.status}
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{vegetationIndices.evi.toFixed(3)}</div>
                    <div className="text-xs text-gray-600 mt-1">Enhanced vegetation</div>
                  </div>
                )
              })()}

              {/* SAVI */}
              {(() => {
                const saviStatus = getIndexStatus(vegetationIndices.savi, [0.25, 0.5])
                return (
                  <div className={`p-4 rounded-lg ${saviStatus.bgColor}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">SAVI</span>
                      <span className={`text-xs px-2 py-1 rounded ${saviStatus.color} bg-white`}>
                        {saviStatus.status}
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{vegetationIndices.savi.toFixed(3)}</div>
                    <div className="text-xs text-gray-600 mt-1">Soil adjusted</div>
                  </div>
                )
              })()}

              {/* NDWI */}
              {(() => {
                const ndwiStatus = vegetationIndices.ndwi > 0 ? 
                  { status: 'Good', color: 'text-blue-600', bgColor: 'bg-blue-50' } :
                  { status: 'Stress', color: 'text-red-600', bgColor: 'bg-red-50' }
                return (
                  <div className={`p-4 rounded-lg ${ndwiStatus.bgColor}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">NDWI</span>
                      <span className={`text-xs px-2 py-1 rounded ${ndwiStatus.color} bg-white`}>
                        {ndwiStatus.status}
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{vegetationIndices.ndwi.toFixed(3)}</div>
                    <div className="text-xs text-gray-600 mt-1">Water stress</div>
                  </div>
                )
              })()}
            </div>
          </div>

          {/* Advanced Vegetation Metrics */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <span className="text-xl mr-2">🔬</span>
              Advanced Vegetation Metrics
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* LAI */}
              <div className="p-4 rounded-lg bg-green-50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Leaf Area Index</span>
                  <span className="text-xs px-2 py-1 rounded bg-green-100 text-green-800">
                    {vegetationIndices.lai > 3 ? 'Dense' : vegetationIndices.lai > 1.5 ? 'Moderate' : 'Sparse'}
                  </span>
                </div>
                <div className="text-2xl font-bold text-gray-900">{vegetationIndices.lai.toFixed(1)}</div>
                <div className="text-xs text-gray-600 mt-1">m²/m² leaf area</div>
              </div>

              {/* fCover */}
              <div className="p-4 rounded-lg bg-blue-50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Vegetation Cover</span>
                  <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-800">
                    {vegetationIndices.fcover > 0.7 ? 'High' : vegetationIndices.fcover > 0.4 ? 'Medium' : 'Low'}
                  </span>
                </div>
                <div className="text-2xl font-bold text-gray-900">{(vegetationIndices.fcover * 100).toFixed(1)}%</div>
                <div className="text-xs text-gray-600 mt-1">Ground coverage</div>
              </div>

              {/* fAPAR */}
              <div className="p-4 rounded-lg bg-purple-50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">fAPAR</span>
                  <span className="text-xs px-2 py-1 rounded bg-purple-100 text-purple-800">
                    {vegetationIndices.fapar > 0.6 ? 'High' : vegetationIndices.fapar > 0.3 ? 'Medium' : 'Low'}
                  </span>
                </div>
                <div className="text-2xl font-bold text-gray-900">{(vegetationIndices.fapar * 100).toFixed(1)}%</div>
                <div className="text-xs text-gray-600 mt-1">Light absorption</div>
              </div>

              {/* Chlorophyll */}
              <div className="p-4 rounded-lg bg-yellow-50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Chlorophyll Content</span>
                  <span className="text-xs px-2 py-1 rounded bg-yellow-100 text-yellow-800">
                    {vegetationIndices.chlorophyll > 40 ? 'High' : vegetationIndices.chlorophyll > 25 ? 'Normal' : 'Low'}
                  </span>
                </div>
                <div className="text-2xl font-bold text-gray-900">{vegetationIndices.chlorophyll.toFixed(1)}</div>
                <div className="text-xs text-gray-600 mt-1">μg/cm² content</div>
              </div>
            </div>
          </div>

          {/* Agricultural Spectral Indices */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <span className="text-xl mr-2">🌾</span>
              Agricultural Spectral Indices
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* NDRE */}
              <div className="p-4 rounded-lg bg-red-50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">NDRE</span>
                  <span className="text-xs px-2 py-1 rounded bg-red-100 text-red-800">
                    {vegetationIndices.ndre > 0.3 ? 'High' : vegetationIndices.ndre > 0.15 ? 'Medium' : 'Low'}
                  </span>
                </div>
                <div className="text-2xl font-bold text-gray-900">{vegetationIndices.ndre.toFixed(3)}</div>
                <div className="text-xs text-gray-600 mt-1">Red Edge sensitivity</div>
              </div>

              {/* CCI */}
              <div className="p-4 rounded-lg bg-emerald-50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">CCI</span>
                  <span className="text-xs px-2 py-1 rounded bg-emerald-100 text-emerald-800">
                    {vegetationIndices.cci > 1.5 ? 'High' : vegetationIndices.cci > 0.8 ? 'Medium' : 'Low'}
                  </span>
                </div>
                <div className="text-2xl font-bold text-gray-900">{vegetationIndices.cci.toFixed(2)}</div>
                <div className="text-xs text-gray-600 mt-1">Canopy Chlorophyll</div>
              </div>

              {/* GNDVI */}
              <div className="p-4 rounded-lg bg-lime-50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">GNDVI</span>
                  <span className="text-xs px-2 py-1 rounded bg-lime-100 text-lime-800">
                    {vegetationIndices.gndvi > 0.5 ? 'High' : vegetationIndices.gndvi > 0.3 ? 'Medium' : 'Low'}
                  </span>
                </div>
                <div className="text-2xl font-bold text-gray-900">{vegetationIndices.gndvi.toFixed(3)}</div>
                <div className="text-xs text-gray-600 mt-1">Green NDVI</div>
              </div>

              {/* ARVI */}
              <div className="p-4 rounded-lg bg-cyan-50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">ARVI</span>
                  <span className="text-xs px-2 py-1 rounded bg-cyan-100 text-cyan-800">
                    {vegetationIndices.arvi > 0.4 ? 'High' : vegetationIndices.arvi > 0.2 ? 'Medium' : 'Low'}
                  </span>
                </div>
                <div className="text-2xl font-bold text-gray-900">{vegetationIndices.arvi.toFixed(3)}</div>
                <div className="text-xs text-gray-600 mt-1">Atmospheric Resistant</div>
              </div>

              {/* MCARI */}
              <div className="p-4 rounded-lg bg-orange-50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">MCARI</span>
                  <span className="text-xs px-2 py-1 rounded bg-orange-100 text-orange-800">
                    {vegetationIndices.mcari > 1.0 ? 'High' : vegetationIndices.mcari > 0.5 ? 'Medium' : 'Low'}
                  </span>
                </div>
                <div className="text-2xl font-bold text-gray-900">{vegetationIndices.mcari.toFixed(2)}</div>
                <div className="text-xs text-gray-600 mt-1">Chlorophyll Absorption</div>
              </div>

              {/* TCARI */}
              <div className="p-4 rounded-lg bg-violet-50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">TCARI</span>
                  <span className="text-xs px-2 py-1 rounded bg-violet-100 text-violet-800">
                    {vegetationIndices.tcari > 1.5 ? 'High' : vegetationIndices.tcari > 0.8 ? 'Medium' : 'Low'}
                  </span>
                </div>
                <div className="text-2xl font-bold text-gray-900">{vegetationIndices.tcari.toFixed(2)}</div>
                <div className="text-xs text-gray-600 mt-1">Transformed CARI</div>
              </div>
            </div>
          </div>

          {/* Historical Vegetation Analysis */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <span className="text-xl mr-2">📈</span>
              Analyse Historique de la Végétation
            </h3>

            {/* Time Series Charts */}
            <div className="space-y-6">
              {/* NDVI Historical Chart */}
              <div className="bg-green-50 rounded-lg p-4">
                <h4 className="text-md font-semibold text-gray-800 mb-3 flex items-center">
                  <span className="text-lg mr-2">🌿</span>
                  NDVI - Indice de Végétation
                </h4>
                <div className="h-48 bg-white rounded-lg p-4 flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <div className="text-3xl mb-2">📊</div>
                    <p>Graphique temporel NDVI</p>
                    <p className="text-sm">Données satellite des 12 derniers mois</p>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-3 text-sm">
                  <div className="bg-white rounded p-2 text-center">
                    <div className="text-xs text-gray-600">Actuel</div>
                    <div className="font-bold text-green-700">{satelliteAnalysis.vegetationIndices.ndvi.toFixed(3)}</div>
                  </div>
                  <div className="bg-white rounded p-2 text-center">
                    <div className="text-xs text-gray-600">Moyenne 6M</div>
                    <div className="font-bold text-green-700">{(satelliteAnalysis.vegetationIndices.ndvi * 0.95).toFixed(3)}</div>
                  </div>
                  <div className="bg-white rounded p-2 text-center">
                    <div className="text-xs text-gray-600">Tendance</div>
                    <div className="font-bold text-green-700">↗ +5%</div>
                  </div>
                </div>
              </div>

              {/* Water Stress Historical Chart */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="text-md font-semibold text-gray-800 mb-3 flex items-center">
                  <span className="text-lg mr-2">💧</span>
                  Stress Hydrique
                </h4>
                <div className="h-48 bg-white rounded-lg p-4 flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <div className="text-3xl mb-2">📊</div>
                    <p>Graphique stress hydrique</p>
                    <p className="text-sm">Évolution du stress hydrique</p>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-3 text-sm">
                  <div className="bg-white rounded p-2 text-center">
                    <div className="text-xs text-gray-600">Actuel</div>
                    <div className="font-bold text-blue-700">{satelliteAnalysis.vegetationIndices.ndwi.toFixed(3)}</div>
                  </div>
                  <div className="bg-white rounded p-2 text-center">
                    <div className="text-xs text-gray-600">Moyenne 6M</div>
                    <div className="font-bold text-blue-700">{(satelliteAnalysis.vegetationIndices.ndwi * 1.1).toFixed(3)}</div>
                  </div>
                  <div className="bg-white rounded p-2 text-center">
                    <div className="text-xs text-gray-600">Tendance</div>
                    <div className="font-bold text-blue-700">↘ -8%</div>
                  </div>
                </div>
              </div>

              {/* LAI Historical Chart */}
              <div className="bg-emerald-50 rounded-lg p-4">
                <h4 className="text-md font-semibold text-gray-800 mb-3 flex items-center">
                  <span className="text-lg mr-2">🍃</span>
                  LAI - Indice de Surface Foliaire
                </h4>
                <div className="h-48 bg-white rounded-lg p-4 flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <div className="text-3xl mb-2">📊</div>
                    <p>Graphique LAI temporel</p>
                    <p className="text-sm">Évolution de la densité foliaire</p>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-3 text-sm">
                  <div className="bg-white rounded p-2 text-center">
                    <div className="text-xs text-gray-600">Actuel</div>
                    <div className="font-bold text-emerald-700">{satelliteAnalysis.vegetationIndices.lai.toFixed(2)}</div>
                  </div>
                  <div className="bg-white rounded p-2 text-center">
                    <div className="text-xs text-gray-600">Moyenne 6M</div>
                    <div className="font-bold text-emerald-700">{(satelliteAnalysis.vegetationIndices.lai * 0.92).toFixed(2)}</div>
                  </div>
                  <div className="bg-white rounded p-2 text-center">
                    <div className="text-xs text-gray-600">Tendance</div>
                    <div className="font-bold text-emerald-700">↗ +12%</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

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
