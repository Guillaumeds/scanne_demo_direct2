'use client'

import { useState } from 'react'
import L from 'leaflet'

interface SentinelOverlaySelectorProps {
  map: L.Map | null
}

interface SentinelLayer {
  name: string
  displayName: string
  type: 'vegetation' | 'moisture' | 'soil' | 'crop_cycles' | 'variety'
  url: string
  bounds: [[number, number], [number, number]]
  opacity: number
  description: string
  icon: string
}

const sentinelLayers: Record<string, SentinelLayer> = {
  ndvi: {
    name: 'ndvi',
    displayName: 'NDVI',
    type: 'vegetation',
    url: '/sentinel_overlays/2019-06-03-00-00_2019-06-03-23-59_Sentinel-2_L2A_NDVI.png',
    bounds: [[-20.520584, 57.546387], [-20.384847, 57.731781]],
    opacity: 0.7,
    description: 'Normalized Difference Vegetation Index - Plant health',
    icon: '🌱'
  },
  evi: {
    name: 'evi',
    displayName: 'EVI',
    type: 'vegetation',
    url: '/sentinel_overlays/2019-06-03-00-00_2019-06-03-23-59_Sentinel-2_L2A_EVI.png',
    bounds: [[-20.520584, 57.546387], [-20.384847, 57.731781]],
    opacity: 0.7,
    description: 'Enhanced Vegetation Index - Improved vegetation analysis',
    icon: '🌿'
  },
  savi: {
    name: 'savi',
    displayName: 'SAVI',
    type: 'vegetation',
    url: '/sentinel_overlays/2019-06-03-00-00_2019-06-03-23-59_Sentinel-2_L2A_SAVI.png',
    bounds: [[-20.520584, 57.546387], [-20.384847, 57.731781]],
    opacity: 0.7,
    description: 'Soil-Adjusted Vegetation Index - Reduces soil background',
    icon: '🌾'
  },
  agriculture: {
    name: 'agriculture',
    displayName: 'Agriculture',
    type: 'vegetation',
    url: '/sentinel_overlays/2019-06-03-00-00_2019-06-03-23-59_Sentinel-2_L2A_Agriculture.png',
    bounds: [[-20.520584, 57.546387], [-20.384847, 57.731781]],
    opacity: 0.7,
    description: 'Agricultural areas identification',
    icon: '🚜'
  },
  moisture_index: {
    name: 'moisture_index',
    displayName: 'Moisture Index',
    type: 'moisture',
    url: '/sentinel_overlays/2019-06-03-00-00_2019-06-03-23-59_Sentinel-2_L2A_Moisture_Index.png',
    bounds: [[-20.520584, 57.546387], [-20.384847, 57.731781]],
    opacity: 0.7,
    description: 'Soil moisture content analysis',
    icon: '💧'
  },
  moisture_stress: {
    name: 'moisture_stress',
    displayName: 'Moisture Stress',
    type: 'moisture',
    url: '/sentinel_overlays/2019-06-03-00-00_2019-06-03-23-59_Sentinel-2_L2A_Moisture_Stress.png',
    bounds: [[-20.520584, 57.546387], [-20.384847, 57.731781]],
    opacity: 0.7,
    description: 'Plant water stress indicators',
    icon: '🌡️'
  },
  barren_soil: {
    name: 'barren_soil',
    displayName: 'Barren Soil',
    type: 'soil',
    url: '/sentinel_overlays/2019-06-03-00-00_2019-06-03-23-59_Sentinel-2_L2A_Barren_Soil.png',
    bounds: [[-20.520584, 57.546387], [-20.384847, 57.731781]],
    opacity: 0.7,
    description: 'Exposed soil and bare ground areas',
    icon: '🏔️'
  }
}

export default function SentinelOverlaySelector({ map }: SentinelOverlaySelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeOverlays, setActiveOverlays] = useState<Set<string>>(new Set())
  const [overlayInstances, setOverlayInstances] = useState<Map<string, L.ImageOverlay>>(new Map())

  const toggleOverlay = (layerName: string) => {
    if (!map) return

    const layer = sentinelLayers[layerName]
    if (!layer) return

    const newActiveOverlays = new Set(activeOverlays)
    const newOverlayInstances = new Map(overlayInstances)

    if (activeOverlays.has(layerName)) {
      // Remove overlay
      const overlayInstance = overlayInstances.get(layerName)
      if (overlayInstance) {
        map.removeLayer(overlayInstance)
        newOverlayInstances.delete(layerName)
      }
      newActiveOverlays.delete(layerName)
    } else {
      // Add overlay
      const imageOverlay = L.imageOverlay(layer.url, layer.bounds, {
        opacity: layer.opacity,
        interactive: false
      })
      
      imageOverlay.addTo(map)
      newOverlayInstances.set(layerName, imageOverlay)
      newActiveOverlays.add(layerName)
    }

    setActiveOverlays(newActiveOverlays)
    setOverlayInstances(newOverlayInstances)
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'vegetation': return 'text-green-600 bg-green-50'
      case 'moisture': return 'text-blue-600 bg-blue-50'
      case 'soil': return 'text-orange-600 bg-orange-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'vegetation': return '🌱'
      case 'moisture': return '💧'
      case 'soil': return '🏔️'
      default: return '📊'
    }
  }

  return (
    <div className="absolute top-20 right-4 z-[1000]">
      <div className="relative">
        {/* Sentinel overlay selector button */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center space-x-2 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 shadow-md transition-colors duration-200"
          title="Sentinel-2 Overlays"
        >
          <span className="text-lg">🛰️</span>
          <span className="text-sm font-medium text-gray-700">
            Sentinel-2 {activeOverlays.size > 0 && `(${activeOverlays.size})`}
          </span>
          <svg 
            width="16" 
            height="16" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2"
            className={`transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          >
            <polyline points="6,9 12,15 18,9"/>
          </svg>
        </button>

        {/* Dropdown menu */}
        {isOpen && (
          <div className="absolute top-full right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden max-h-96 overflow-y-auto">
            <div className="p-3 border-b border-gray-200 bg-gray-50">
              <h3 className="text-sm font-semibold text-gray-700">Sentinel-2 Data Overlays</h3>
              <p className="text-xs text-gray-500 mt-1">June 3, 2019 - Agricultural Analysis</p>
            </div>
            
            {Object.entries(sentinelLayers).map(([layerName, layer]) => (
              <button
                key={layerName}
                type="button"
                onClick={() => toggleOverlay(layerName)}
                className={`w-full flex items-start space-x-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors duration-200 border-b border-gray-100 last:border-b-0 ${
                  activeOverlays.has(layerName) ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex-shrink-0 mt-0.5">
                  <span className="text-lg">{layer.icon}</span>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <div className="font-medium text-gray-900">{layer.displayName}</div>
                    <span className={`px-2 py-0.5 text-xs rounded-full ${getTypeColor(layer.type)}`}>
                      {layer.type}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {layer.description}
                  </div>
                </div>
                
                <div className="flex-shrink-0">
                  {activeOverlays.has(layerName) ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-600">
                      <polyline points="20,6 9,17 4,12"/>
                    </svg>
                  ) : (
                    <div className="w-4 h-4 border border-gray-300 rounded"></div>
                  )}
                </div>
              </button>
            ))}
            
            {activeOverlays.size > 0 && (
              <div className="p-3 border-t border-gray-200 bg-gray-50">
                <button
                  type="button"
                  onClick={() => {
                    // Clear all overlays
                    overlayInstances.forEach((overlay) => {
                      if (map) map.removeLayer(overlay)
                    })
                    setActiveOverlays(new Set())
                    setOverlayInstances(new Map())
                  }}
                  className="text-xs text-red-600 hover:text-red-700 font-medium"
                >
                  Clear All Overlays
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Click outside to close */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-[-1]" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}
