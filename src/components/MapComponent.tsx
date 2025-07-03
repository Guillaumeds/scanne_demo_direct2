'use client'

import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import { FieldData } from '@/types/field'
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
  fields: FieldData[]
  // Field selection removed - parcelles are background only
  // selectedField: string | null
  // hoveredField?: string | null
  // onFieldSelect: (fieldId: string) => void
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
}

export default function MapComponent({
  className = '',
  fields,
  // Field selection removed - parcelles are background only
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
  onDrawingEnd
}: MapComponentProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const fieldLayersRef = useRef<L.LayerGroup | null>(null)
  const fieldPolygonsRef = useRef<Map<string, L.Polygon>>(new Map())
  const fieldLabelsRef = useRef<Map<string, L.Marker>>(new Map())
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

  // Function to update field labels on zoom
  const updateFieldLabels = () => {
    const map = mapInstanceRef.current
    if (!map) return

    fieldPolygonsRef.current.forEach((polygon, fieldId) => {
      const fieldData = (polygon as any)._fieldData
      if (!fieldData) return

      const center = calculatePolygonCentroid(fieldData.coordinates)
      const currentZoom = map.getZoom()
      const bounds = polygon.getBounds()
      const shapeWidthInPixels = map.distance(bounds.getSouthWest(), bounds.getSouthEast()) * Math.pow(2, currentZoom - 10) / 100
      const maxFontSize = Math.max(8, Math.min(16, shapeWidthInPixels / fieldData.field_id.length * 0.8))

      const existingLabel = fieldLabelsRef.current.get(fieldId)
      if (existingLabel) {
        map.removeLayer(existingLabel)
      }

      const fieldLabel = L.divIcon({
        html: `<div style="
          font-family: Arial, sans-serif;
          font-size: ${maxFontSize}px;
          font-weight: bold;
          color: #000000;
          text-align: center;
          text-shadow: 1px 1px 2px rgba(255,255,255,0.8), -1px -1px 2px rgba(255,255,255,0.8), 1px -1px 2px rgba(255,255,255,0.8), -1px 1px 2px rgba(255,255,255,0.8);
          pointer-events: none;
          white-space: nowrap;
          position: absolute;
          transform: translate(-50%, -50%);
          top: 0;
          left: 0;
          max-width: ${shapeWidthInPixels * 0.9}px;
          overflow: hidden;
          text-overflow: ellipsis;
        ">${fieldData.field_id}</div>`,
        className: 'field-label',
        iconSize: [1, 1],
        iconAnchor: [0, 0]
      })

      const labelMarker = L.marker(center, { icon: fieldLabel })
      labelMarker.addTo(map)
      fieldLabelsRef.current.set(fieldId, labelMarker)
    })
  }

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
      const xi = coordinates[i][1] // lat
      const yi = coordinates[i][0] // lng
      const xj = coordinates[j][1] // lat
      const yj = coordinates[j][0] // lng

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
    console.log('🗺️ Map initialization effect triggered:', {
      hasContainer: !!mapRef.current,
      hasMapInstance: !!mapInstanceRef.current,
      isInitializing: initializingRef.current
    })

    if (!mapRef.current || mapInstanceRef.current || initializingRef.current) {
      console.log('🚫 Map initialization skipped')
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
        console.log('🗺️ Initializing map instance...')
        console.log('Container dimensions:', {
          width: mapRef.current?.offsetWidth,
          height: mapRef.current?.offsetHeight,
          clientWidth: mapRef.current?.clientWidth,
          clientHeight: mapRef.current?.clientHeight
        })

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

        console.log('✅ Map instance created')

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
          console.log('✅ Composite layer added: Satellite + Soil overlay')
        } else if (config.type === 'image' && 'overlayBounds' in config && config.overlayBounds) {
          // Create image overlay for PNG/image files
          const imageOverlay = L.imageOverlay(config.url, config.overlayBounds, {
            attribution: config.attribution,
            opacity: 0.8,
            interactive: false
          })
          imageOverlay.addTo(map)
          currentTileLayerRef.current = imageOverlay as any
          console.log('✅ Image overlay added')
        } else {
          // Create tile layer for standard tiles
          const tileLayer = L.tileLayer(config.url, {
            attribution: config.attribution,
            maxZoom: 19
          })
          tileLayer.addTo(map)
          currentTileLayerRef.current = tileLayer
          console.log('✅ Tile layer added')
        }

        // Create layer group for field polygons
        const fieldLayerGroup = L.layerGroup()
        fieldLayerGroup.addTo(map)
        fieldLayersRef.current = fieldLayerGroup
        console.log('✅ Field layer group created')

        mapInstanceRef.current = map

        // Force map to invalidate size and set ready state
        setTimeout(() => {
          if (mapInstanceRef.current) {
            mapInstanceRef.current.invalidateSize()
            setMapReady(true)
            initializingRef.current = false
            console.log('✅ Map is ready and size invalidated')
          }
        }, 200)

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

        // Force recreation of the map container after a delay
        setTimeout(() => {
          setMapKey(prev => prev + 1)
        }, 1000)
      }
    }

    // Use multiple timing strategies to ensure DOM is ready
    const timeoutId = setTimeout(() => {
      if (mapRef.current && !mapInstanceRef.current) {
        console.log('🕐 Attempting map initialization via timeout...')
        initMap()
      }
    }, 100)

    // Also try with requestAnimationFrame
    requestAnimationFrame(() => {
      setTimeout(() => {
        if (mapRef.current && !mapInstanceRef.current) {
          console.log('🕐 Attempting map initialization via RAF...')
          initMap()
        }
      }, 50)
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

  // Add field polygons to map
  useEffect(() => {
    console.log('Field effect triggered:', {
      mapReady,
      mapInstance: !!mapInstanceRef.current,
      fieldLayers: !!fieldLayersRef.current,
      fieldsCount: fields.length,
      fields: fields.map(f => ({ id: f.field_id, coordsLength: f.coordinates?.length || 0 }))
    })

    if (!mapReady || !mapInstanceRef.current || !fieldLayersRef.current) {
      console.log('Field effect early return - map not ready')
      return
    }

    if (fields.length === 0) {
      console.log('⚠️ No fields to display - map will show without field polygons')
      // Don't return - let the map show even without fields
    }

    const map = mapInstanceRef.current
    const fieldLayerGroup = fieldLayersRef.current

    // Clear existing field layers
    fieldLayerGroup.clearLayers()

    // Clear existing field labels
    fieldLabelsRef.current.forEach(label => {
      if (map) {
        map.removeLayer(label)
      }
    })
    fieldLabelsRef.current.clear()

    // If no fields, just ensure map is visible
    if (fields.length === 0) {
      console.log('📍 Map ready without field data')
      return
    }

    // Add each field as a polygon
    console.log('Adding fields to map:', fields.length)
    fields.forEach((field, index) => {
      console.log(`Processing field ${index + 1}/${fields.length}:`, {
        id: field.field_id,
        coordsLength: field.coordinates?.length || 0,
        status: field.status
      })

      if (field.coordinates && field.coordinates.length > 0) {
        console.log(`🔍 Field ${field.field_id} raw coordinates:`, field.coordinates)
        console.log(`🔍 Field ${field.field_id} coordinates type:`, typeof field.coordinates, Array.isArray(field.coordinates))

        // Validate coordinates before processing
        const invalidCoords = field.coordinates.filter(coord =>
          !coord || !Array.isArray(coord) || coord.length < 2 ||
          typeof coord[0] !== 'number' || typeof coord[1] !== 'number'
        )

        if (invalidCoords.length > 0) {
          console.error(`❌ Field ${field.field_id} has invalid coordinates:`, invalidCoords)
          console.log(`❌ Skipping field ${field.field_id} - invalid coordinates`)
          return
        }

        // Convert coordinates to Leaflet format [lat, lng]
        const latlngs = field.coordinates.map(coord => [coord[1], coord[0]] as [number, number])
        console.log(`✅ Field ${field.field_id} processed latlngs:`, latlngs)

        // Create polygon with grey styling (all parcelles are inactive)
        const polygon = L.polygon(latlngs, {
          color: '#6b7280', // Grey for all parcelles
          fillColor: '#6b7280',
          fillOpacity: 0.3,
          weight: 2,
          opacity: 0.8
        })

        // No labels for parcelles (fields) - they are now background only
        // const labelMarker = L.marker(center, { icon: fieldLabel })
        // Labels removed as requested

        // Parcelles are background-only - disable all interactions
        // They should not be selectable since we're using BlocList instead of FieldList
        polygon.on('click', (e) => {
          // Always prevent field selection - parcelles are inactive background
          e.originalEvent?.stopPropagation()
          return false
        })

        // Disable all mouse interactions - parcelles are background only
        polygon.on('mouseover', (e) => {
          e.originalEvent?.stopPropagation()
          return false
        })

        polygon.on('mouseout', (e) => {
          e.originalEvent?.stopPropagation()
          return false
        })

        // Store polygon reference for later styling updates
        fieldPolygonsRef.current.set(field.field_id, polygon)

        // Store field data for zoom updates
        ;(polygon as any)._fieldData = field

        // Add to layer group
        fieldLayerGroup.addLayer(polygon)
        console.log(`Added polygon for field ${field.field_id} to layer group`)
      } else {
        console.log(`Skipping field ${field.field_id} - no coordinates`)
      }
    })

    console.log(`Finished processing ${fields.length} fields`)

    // No field labels to update - parcelles are background only

    // Fit map to show all fields if we have any
    if (fields.length > 0) {
      console.log('🔍 Fitting map bounds to show all fields')
      const layers = fieldLayersRef.current.getLayers()
      console.log('🔍 Available layers for bounds:', layers.length)

      if (layers.length > 0) {
        const group = L.featureGroup(layers)
        const bounds = group.getBounds()
        console.log('🔍 Field bounds:', bounds)

        if (bounds && bounds.isValid && bounds.isValid()) {
          console.log('✅ Fitting map to valid bounds')
          map.fitBounds(bounds.pad(0.1))
        } else {
          console.error('❌ Invalid bounds returned from field layer group')
          console.log('❌ Bounds object:', bounds)
        }
      } else {
        console.error('❌ No valid layers found for bounds calculation')
      }
    } else {
      console.log('⚠️ No fields to fit bounds to')
    }

  }, [fields, mapReady])

  // Handle field styling - parcelles are always grey and inactive
  useEffect(() => {
    fieldPolygonsRef.current.forEach((polygon, fieldId) => {
      const field = fields.find(f => f.field_id === fieldId)
      if (!field) return

      const isDrawingMode = !!activeTool

      // All parcelles (fields) are always inactive/grey - no selection/hover
      const baseColor = '#6b7280' // Grey for all parcelles
      const weight = 2
      const fillOpacity = 0.3

      // Always disable pointer events - parcelles are background only
      const polygonElement = polygon.getElement() as HTMLElement
      if (polygonElement) {
        polygonElement.style.pointerEvents = 'none'
        polygonElement.style.cursor = isDrawingMode ? 'crosshair' : 'default'
      }

      // Always apply the same grey styling - no selection/hover changes
      polygon.setStyle({
        color: baseColor,
        weight,
        fillOpacity,
        fillColor: baseColor
      })
    })
  }, [fields, activeTool]) // Removed selectedField and hoveredField dependencies

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
          fieldPolygons={fieldPolygonsRef.current}
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
