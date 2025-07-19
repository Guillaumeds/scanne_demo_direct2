'use client'

import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'

import DrawingManager from './DrawingManager'
import LayerSelector from './LayerSelector'
import DrawingProgress from './DrawingProgress'
import SentinelOverlaySelector from './SentinelOverlaySelector'
import MapLegend from './MapLegend'

// Fix for default markers in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

interface MapComponentProps {
  className?: string
  // Field functionality removed - blocs are the primary entities
  activeTool?: string | null
  drawnAreas?: any[]
  savedAreas?: any[]
  selectedAreaId?: string | null
  hoveredAreaId?: string | null
  onAreaDrawn?: (area: any) => void
  onAreaUpdated?: (area: any) => void
  onPolygonClick?: (areaId: string) => void
  onMapClick?: () => void
  onDrawingStart?: () => void
  onDrawingEnd?: () => void
  onMapReady?: (mapInstance: L.Map) => void
}

export default function MapComponent({
  className = '',
  // Field functionality removed - blocs are the primary entities
  activeTool,
  drawnAreas = [],
  savedAreas = [],
  selectedAreaId,
  hoveredAreaId,
  onAreaDrawn,
  onAreaUpdated,
  onPolygonClick,
  onMapClick,
  onDrawingStart,
  onDrawingEnd,
  onMapReady
}: MapComponentProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  // Field functionality removed - blocs are the primary entities
  const [mapReady, setMapReady] = useState(false)
  const [mapKey, setMapKey] = useState(0)
  const [currentLayer, setCurrentLayer] = useState('satellite')
  const currentTileLayerRef = useRef<L.TileLayer | null>(null)
  const soilOverlayRef = useRef<L.ImageOverlay | null>(null)
  const [drawingPointCount, setDrawingPointCount] = useState(0)
  const [isDrawing, setIsDrawing] = useState(false)
  const initializingRef = useRef(false)

  // Function to get tile layer configuration
  const getTileLayerConfig = (layerType: string) => {
    switch (layerType) {
      case 'satellite':
        return {
          url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
          attribution: '&copy; <a href="https://www.esri.com/">Esri</a>, Maxar, Earthstar Geographics',
          type: 'tile'
        }
      case 'crop_cycles':
        return {
          url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
          attribution: '&copy; <a href="https://www.esri.com/">Esri</a>, Maxar, Earthstar Geographics',
          type: 'crop_cycles'
        }
      case 'variety':
        return {
          url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
          attribution: '&copy; <a href="https://www.esri.com/">Esri</a>, Maxar, Earthstar Geographics',
          type: 'variety'
        }
      case 'growth_stages':
        return {
          url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
          attribution: '&copy; <a href="https://www.esri.com/">Esri</a>, Maxar, Earthstar Geographics',
          type: 'growth_stages'
        }
      case 'harvest_planning':
        return {
          url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
          attribution: '&copy; <a href="https://www.esri.com/">Esri</a>, Maxar, Earthstar Geographics',
          type: 'harvest_planning'
        }
      case 'soil':
        return {
          url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
          attribution: '&copy; <a href="https://www.esri.com/">Esri</a>, Maxar, Earthstar Geographics | &copy; MSIRI Soil Map',
          type: 'composite',
          overlayUrl: '/msiri_soil_map/MSIRI Soil Map.png',
          overlayBounds: [[-20.52652002870618, 57.33208436489189], [-19.99370479669043, 57.79812696743258]] as [[number, number], [number, number]]
        }
      case 'osm':
      default:
        return {
          url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          type: 'tile'
        }
    }
  }

  // Function to handle layer changes
  const handleLayerChange = (layerType: string) => {
    const map = mapInstanceRef.current
    if (!map) return

    // Remove current tile layer
    if (currentTileLayerRef.current) {
      map.removeLayer(currentTileLayerRef.current)
    }

    // Remove current soil overlay if it exists
    if (soilOverlayRef.current) {
      map.removeLayer(soilOverlayRef.current)
      soilOverlayRef.current = null
    }

    // Get layer configuration
    const config = getTileLayerConfig(layerType)

    // Handle different layer types
    if (config.type === 'composite') {
      // Create satellite base layer + soil overlay
      const satelliteLayer = L.tileLayer(config.url, {
        attribution: config.attribution,
        maxZoom: 19
      })
      satelliteLayer.addTo(map)
      currentTileLayerRef.current = satelliteLayer

      // Add soil map overlay on top
      const soilOverlay = L.imageOverlay(config.overlayUrl!, config.overlayBounds!, {
        opacity: 0.7, // Balanced transparency
        interactive: false
      })
      soilOverlay.addTo(map)
      soilOverlayRef.current = soilOverlay

      console.log('✅ Added composite layer: Satellite + Soil overlay')
    } else if (config.type === 'crop_cycles') {
      // Create satellite base layer for crop cycles visualization
      const satelliteLayer = L.tileLayer(config.url, {
        attribution: config.attribution,
        maxZoom: 19
      })
      satelliteLayer.addTo(map)
      currentTileLayerRef.current = satelliteLayer

      console.log('✅ Added crop cycles layer - polygons will be colored by cycle phase')
    } else if (config.type === 'variety') {
      // Create satellite base layer for variety visualization
      const satelliteLayer = L.tileLayer(config.url, {
        attribution: config.attribution,
        maxZoom: 19
      })
      satelliteLayer.addTo(map)
      currentTileLayerRef.current = satelliteLayer

      console.log('✅ Added variety layer - polygons will be colored by variety type')
    } else if (config.type === 'growth_stages') {
      // Create satellite base layer for growth stages visualization
      const satelliteLayer = L.tileLayer(config.url, {
        attribution: config.attribution,
        maxZoom: 19
      })
      satelliteLayer.addTo(map)
      currentTileLayerRef.current = satelliteLayer

      console.log('✅ Added growth stages layer - polygons will be colored by growth stage')
    } else if (config.type === 'harvest_planning') {
      // Create satellite base layer for harvest planning visualization
      const satelliteLayer = L.tileLayer(config.url, {
        attribution: config.attribution,
        maxZoom: 19
      })
      satelliteLayer.addTo(map)
      currentTileLayerRef.current = satelliteLayer

      console.log('✅ Added harvest planning layer - polygons will be colored by harvest timeline')
    } else if (config.type === 'image' && 'overlayBounds' in config && config.overlayBounds) {
      // Create image overlay for PNG/image files
      const imageOverlay = L.imageOverlay(config.url, config.overlayBounds, {
        attribution: config.attribution,
        opacity: 0.8,
        interactive: false
      })
      imageOverlay.addTo(map)
      currentTileLayerRef.current = imageOverlay as any // Type assertion for compatibility
    } else {
      // Create tile layer for standard tiles
      const newTileLayer = L.tileLayer(config.url, {
        attribution: config.attribution,
        maxZoom: 19
      })
      newTileLayer.addTo(map)
      currentTileLayerRef.current = newTileLayer
    }

    setCurrentLayer(layerType)
    console.log(`✅ Switched to ${layerType} layer`)
  }

  // Handle drawing progress updates
  const handleDrawingProgress = (pointCount: number, drawingActive: boolean) => {
    setDrawingPointCount(pointCount)
    setIsDrawing(drawingActive)
  }

  // Handle drawing cancellation
  const handleDrawingCancel = () => {
    // Trigger ESC key event to cancel drawing
    const escEvent = new KeyboardEvent('keydown', { key: 'Escape' })
    document.dispatchEvent(escEvent)
  }

  // Field functionality removed - blocs are the primary entities

  // Calculate polygon centroid for better label positioning
  const calculatePolygonCentroid = (coordinates: [number, number][]): L.LatLng => {
    if (!coordinates || coordinates.length === 0) {
      console.error('❌ calculatePolygonCentroid: No coordinates provided')
      return L.latLng(0, 0)
    }

    // Validate coordinates
    const invalidCoords = coordinates.filter(coord =>
      !coord || !Array.isArray(coord) || coord.length < 2 ||
      typeof coord[0] !== 'number' || typeof coord[1] !== 'number'
    )

    if (invalidCoords.length > 0) {
      console.error('❌ calculatePolygonCentroid: Invalid coordinates found:', invalidCoords)
      return L.latLng(0, 0)
    }

    let area = 0
    let centroidLat = 0
    let centroidLng = 0

    for (let i = 0; i < coordinates.length; i++) {
      const j = (i + 1) % coordinates.length
      const xi = coordinates[i][1] // lat (second element in [lng, lat])
      const yi = coordinates[i][0] // lng (first element in [lng, lat])
      const xj = coordinates[j][1] // lat (second element in [lng, lat])
      const yj = coordinates[j][0] // lng (first element in [lng, lat])

      const a = xi * yj - xj * yi
      area += a
      centroidLat += (xi + xj) * a
      centroidLng += (yi + yj) * a
    }

    area *= 0.5
    if (area === 0) {
      console.error('❌ calculatePolygonCentroid: Area calculation resulted in 0')
      return L.latLng(0, 0)
    }

    centroidLat /= (6 * area)
    centroidLng /= (6 * area)

    console.log(`✅ calculatePolygonCentroid: Calculated centroid [${centroidLat}, ${centroidLng}]`)
    return L.latLng(centroidLat, centroidLng)
  }

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current || initializingRef.current) {
      return
    }

    initializingRef.current = true

    // Force clear any Leaflet state on the container
    const container = mapRef.current

    // Remove all Leaflet-related properties and classes
    container.innerHTML = ''
    container.className = container.className.replace(/leaflet-[^\s]*/g, '')

    // Remove all Leaflet data attributes
    Object.keys(container.dataset).forEach(key => {
      if (key.startsWith('leaflet')) {
        delete container.dataset[key]
      }
    })

    // Clear any Leaflet internal references
    delete (container as any)._leaflet_id
    delete (container as any)._leaflet
    delete (container as any)._leaflet_pos

    // Initialize map with better error handling
    const initMap = () => {
      try {
        // Ensure container has dimensions
        if (!mapRef.current?.offsetWidth || !mapRef.current?.offsetHeight) {
          console.error('❌ Map container has no dimensions!')
          throw new Error('Map container has no dimensions')
        }

        // Initialize the map - center on Mauritius estate fields
        const map = L.map(mapRef.current!, {
          center: [-20.4400, 57.6500],
          zoom: 13,
          zoomControl: true,
          attributionControl: true
        })

        // Add initial layer
        const config = getTileLayerConfig(currentLayer)

        if (config.type === 'composite') {
          // Create satellite base layer + soil overlay
          const satelliteLayer = L.tileLayer(config.url, {
            attribution: config.attribution,
            maxZoom: 19
          })
          satelliteLayer.addTo(map)
          currentTileLayerRef.current = satelliteLayer

          // Add soil map overlay on top
          const soilOverlay = L.imageOverlay(config.overlayUrl!, config.overlayBounds!, {
            opacity: 0.7,
            interactive: false
          })
          soilOverlay.addTo(map)
          soilOverlayRef.current = soilOverlay
        } else if (config.type === 'image' && 'overlayBounds' in config && config.overlayBounds) {
          // Create image overlay for PNG/image files
          const imageOverlay = L.imageOverlay(config.url, config.overlayBounds, {
            attribution: config.attribution,
            opacity: 0.8,
            interactive: false
          })
          imageOverlay.addTo(map)
          currentTileLayerRef.current = imageOverlay as any
        } else {
          // Create tile layer for standard tiles
          const tileLayer = L.tileLayer(config.url, {
            attribution: config.attribution,
            maxZoom: 19
          })
          tileLayer.addTo(map)
          currentTileLayerRef.current = tileLayer
        }

        // Field functionality removed - blocs are the primary entities

        mapInstanceRef.current = map

        // Force map to invalidate size and set ready state immediately
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize()
          setMapReady(true)
          initializingRef.current = false

          // Notify parent component that map is ready
          if (onMapReady) {
            onMapReady(mapInstanceRef.current)
          }
        }

      } catch (error) {
        console.error('❌ Error initializing map:', error)
        // Clean up any partial initialization
        if (mapInstanceRef.current) {
          try {
            mapInstanceRef.current.remove()
          } catch (e) {
            console.error('Error cleaning up map:', e)
          }
          mapInstanceRef.current = null
        }
        initializingRef.current = false

        // Force recreation of the map container immediately
        setMapKey(prev => prev + 1)
      }
    }

    // Initialize map immediately when DOM is ready
    if (mapRef.current && !mapInstanceRef.current) {
      initMap()
    }

    // Also try with requestAnimationFrame as fallback
    requestAnimationFrame(() => {
      if (mapRef.current && !mapInstanceRef.current) {
        initMap()
      }
    })

    // Cleanup function
    return () => {
      clearTimeout(timeoutId)
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
      setMapReady(false)
      initializingRef.current = false
    }
  }, [])

  // Field functionality removed - blocs are the primary entities

  return (
    <div className="relative h-full w-full">
      {/* Map Loading State */}
      {!mapReady && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Loading map...</p>
          </div>
        </div>
      )}

      {/* Map Container */}
      <div
        key={mapKey}
        ref={mapRef}
        className="map-container"
        style={{
          height: '100%',
          width: '100%',
          minHeight: '400px',
          position: 'relative',
          zIndex: 0,
          backgroundColor: '#f3f4f6' // Light grey background while loading
        }}
      />

      {/* Drawing Manager */}
      {mapInstanceRef.current && mapReady && (
        <DrawingManager
            map={mapInstanceRef.current}
            activeTool={activeTool || null}
            drawnAreas={drawnAreas}
            savedAreas={savedAreas}
            selectedAreaId={selectedAreaId}
            hoveredAreaId={hoveredAreaId}
            currentLayer={currentLayer}
          onAreaDrawn={onAreaDrawn || (() => {})}
          onAreaUpdated={onAreaUpdated}
          onPolygonClick={onPolygonClick}
          onMapClick={onMapClick}
          onDrawingStart={onDrawingStart || (() => {})}
          onDrawingEnd={onDrawingEnd || (() => {})}
          onDrawingProgress={handleDrawingProgress}
        />
      )}

      {/* Drawing Progress Indicator */}
      <DrawingProgress
        pointCount={drawingPointCount}
        isDrawing={isDrawing}
        activeTool={activeTool || null}
        onCancel={handleDrawingCancel}
      />



      {/* Layer Selector */}
      {mapReady && (
        <LayerSelector
          currentLayer={currentLayer}
          onLayerChange={handleLayerChange}
        />
      )}

      {/* Sentinel-2 Overlay Selector */}
      {mapReady && (
        <SentinelOverlaySelector
          map={mapInstanceRef.current}
        />
      )}

      {/* Map Legend for Crop Cycles and Variety layers */}
      {mapReady && (
        <MapLegend layerType={currentLayer} />
      )}

    </div>
  )
}
