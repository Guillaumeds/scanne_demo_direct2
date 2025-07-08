'use client'

import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
// @ts-ignore - Turf.js types issue with package.json exports
import * as turf from '@turf/turf'
import { DrawnArea, DrawnAreaUtils } from '@/types/drawnArea'

// Extend Leaflet types for vertex markers
declare module 'leaflet' {
  interface Polygon {
    _vertexMarkers?: L.CircleMarker[]
  }
}

interface DrawingManagerProps {
  map: L.Map | null
  // Field functionality removed - blocs are the primary entities
  activeTool: string | null
  drawnAreas?: DrawnArea[]
  savedAreas?: DrawnArea[]
  selectedAreaId?: string | null
  hoveredAreaId?: string | null
  currentLayer?: string
  onAreaDrawn: (area: DrawnArea) => void
  onAreaUpdated?: (area: DrawnArea) => void
  onPolygonClick?: (areaId: string) => void
  onMapClick?: () => void
  onDrawingStart: () => void
  onDrawingEnd: () => void
  onDrawingProgress?: (pointCount: number, isDrawing: boolean) => void
}

export default function DrawingManager({
  map,
  // Field functionality removed - blocs are the primary entities
  activeTool,
  drawnAreas = [],
  savedAreas = [],
  selectedAreaId,
  hoveredAreaId,
  currentLayer,
  onAreaDrawn,
  onAreaUpdated,
  onPolygonClick,
  onMapClick,
  onDrawingStart,
  onDrawingEnd,
  onDrawingProgress
}: DrawingManagerProps) {
  const drawnLayersRef = useRef<L.FeatureGroup>(new L.FeatureGroup())
  const currentDrawingRef = useRef<L.Polygon | L.Rectangle | null>(null)
  const drawingPointsRef = useRef<L.LatLng[]>([])
  const isDrawingRef = useRef(false)
  const snapIndicatorRef = useRef<L.CircleMarker | null>(null)
  const layerMapRef = useRef<Map<string, L.Polygon | L.Rectangle>>(new Map())

  // State for drawing stats and area tracking
  const [drawingStats, setDrawingStats] = useState<{
    width: number
    height: number
    area: number
  } | null>(null)
  const [totalDrawnArea, setTotalDrawnArea] = useState<number>(0)
  const [currentCropCycleId, setCurrentCropCycleId] = useState<string>('')
  const [lastSavedAreasCount, setLastSavedAreasCount] = useState<number>(0)

  // Hysteresis snapping state
  const [currentSnapPoint, setCurrentSnapPoint] = useState<L.LatLng | null>(null)
  const [isCurrentlySnapped, setIsCurrentlySnapped] = useState<boolean>(false)

  // Function to get polygon color based on layer type and data
  const getPolygonColor = (area: DrawnArea, isSelected: boolean, isHovered: boolean) => {
    // Default styling for selection and hover states
    if (isSelected) {
      return { color: '#2563eb', fillColor: '#2563eb', weight: 4, fillOpacity: 0.5 }
    }
    if (isHovered) {
      return { color: '#f59e0b', fillColor: '#f59e0b', weight: 3, fillOpacity: 0.4 }
    }

    // Layer-specific coloring
    if (currentLayer === 'crop_cycles') {
      // TODO: Get actual crop cycle data from area
      // For now, use mock data based on area entity key
      const cyclePhase = getCropCyclePhase(DrawnAreaUtils.getEntityKey(area))
      return getCropCycleColor(cyclePhase)
    } else if (currentLayer === 'variety') {
      // TODO: Get actual variety data from area
      // For now, use mock data based on area entity key
      const varietyType = getVarietyType(DrawnAreaUtils.getEntityKey(area))
      return getVarietyColor(varietyType)
    } else if (currentLayer === 'growth_stages') {
      // TODO: Get actual growth stage data from area
      // For now, use mock data based on area entity key
      const growthStage = getGrowthStage(DrawnAreaUtils.getEntityKey(area))
      return getGrowthStageColor(growthStage)
    } else if (currentLayer === 'harvest_planning') {
      // TODO: Get actual harvest planning data from area
      // For now, use mock data based on area entity key
      const harvestTiming = getHarvestTiming(DrawnAreaUtils.getEntityKey(area))
      return getHarvestPlanningColor(harvestTiming)
    }

    // Default green for saved blocs
    return { color: '#22c55e', fillColor: '#22c55e', weight: 2, fillOpacity: 0.3 }
  }

  // Mock function to get crop cycle phase - replace with actual data
  const getCropCyclePhase = (areaId: string): string => {
    const hash = areaId.split('').reduce((a, b) => a + b.charCodeAt(0), 0)
    const phases = ['plantation', 'ratoon1', 'ratoon2', 'ratoon3', 'ratoon4+', 'no_cycle']
    return phases[hash % phases.length]
  }

  // Mock function to get variety type - replace with actual data
  const getVarietyType = (areaId: string): string => {
    const hash = areaId.split('').reduce((a, b) => a + b.charCodeAt(0), 0)
    const varieties = ['early', 'mid', 'late', 'inter_crop', 'no_variety']
    return varieties[hash % varieties.length]
  }

  // Mock function to get growth stage - replace with actual data
  const getGrowthStage = (areaId: string): string => {
    const hash = areaId.split('').reduce((a, b) => a + b.charCodeAt(0), 0)
    const stages = ['germination', 'tillering', 'grand_growth', 'maturation', 'ripening', 'no_stage']
    return stages[hash % stages.length]
  }

  // Mock function to get harvest timing - replace with actual data
  const getHarvestTiming = (areaId: string): string => {
    const hash = areaId.split('').reduce((a, b) => a + b.charCodeAt(0), 0)
    const timings = ['within_1_month', '1_2_months', '2_3_months', '3_4_months', '4_5_months', 'not_planned']
    return timings[hash % timings.length]
  }

  // Get color for crop cycle phase
  const getCropCycleColor = (phase: string) => {
    const colors = {
      plantation: { color: '#22c55e', fillColor: '#22c55e' },
      ratoon1: { color: '#3b82f6', fillColor: '#3b82f6' },
      ratoon2: { color: '#8b5cf6', fillColor: '#8b5cf6' },
      ratoon3: { color: '#f59e0b', fillColor: '#f59e0b' },
      'ratoon4+': { color: '#ef4444', fillColor: '#ef4444' },
      no_cycle: { color: '#6b7280', fillColor: '#6b7280' }
    }
    return { ...colors[phase as keyof typeof colors] || colors.no_cycle, weight: 2, fillOpacity: 0.6 }
  }

  // Get color for variety type
  const getVarietyColor = (variety: string) => {
    const colors = {
      early: { color: '#22c55e', fillColor: '#22c55e' },
      mid: { color: '#3b82f6', fillColor: '#3b82f6' },
      late: { color: '#f59e0b', fillColor: '#f59e0b' },
      inter_crop: { color: '#8b5cf6', fillColor: '#8b5cf6' },
      no_variety: { color: '#6b7280', fillColor: '#6b7280' }
    }
    return { ...colors[variety as keyof typeof colors] || colors.no_variety, weight: 2, fillOpacity: 0.6 }
  }

  // Get color for growth stage
  const getGrowthStageColor = (stage: string) => {
    const colors = {
      germination: { color: '#22c55e', fillColor: '#22c55e' },
      tillering: { color: '#3b82f6', fillColor: '#3b82f6' },
      grand_growth: { color: '#8b5cf6', fillColor: '#8b5cf6' },
      maturation: { color: '#f59e0b', fillColor: '#f59e0b' },
      ripening: { color: '#ef4444', fillColor: '#ef4444' },
      no_stage: { color: '#6b7280', fillColor: '#6b7280' }
    }
    return { ...colors[stage as keyof typeof colors] || colors.no_stage, weight: 2, fillOpacity: 0.6 }
  }

  // Get color for harvest planning (blue gradient based on timing)
  const getHarvestPlanningColor = (timing: string) => {
    const colors = {
      within_1_month: { color: '#1e3a8a', fillColor: '#1e3a8a' },    // Dark blue
      '1_2_months': { color: '#1e40af', fillColor: '#1e40af' },      // Darker blue
      '2_3_months': { color: '#2563eb', fillColor: '#2563eb' },      // Medium blue
      '3_4_months': { color: '#3b82f6', fillColor: '#3b82f6' },      // Light blue
      '4_5_months': { color: '#60a5fa', fillColor: '#60a5fa' },      // Lighter blue
      not_planned: { color: '#6b7280', fillColor: '#6b7280' }        // Gray
    }
    return { ...colors[timing as keyof typeof colors] || colors.not_planned, weight: 2, fillOpacity: 0.6 }
  }

  // Calculate polygon centroid for better label positioning
  const calculatePolygonCentroid = (points: L.LatLng[]): L.LatLng => {
    if (points.length === 0) return L.latLng(0, 0)

    let area = 0
    let centroidLat = 0
    let centroidLng = 0

    for (let i = 0; i < points.length; i++) {
      const j = (i + 1) % points.length
      const xi = points[i].lat
      const yi = points[i].lng
      const xj = points[j].lat
      const yj = points[j].lng

      const a = xi * yj - xj * yi
      area += a
      centroidLat += (xi + xj) * a
      centroidLng += (yi + yj) * a
    }

    area *= 0.5
    if (area === 0) {
      // Fallback to simple average if area calculation fails
      const avgLat = points.reduce((sum, point) => sum + point.lat, 0) / points.length
      const avgLng = points.reduce((sum, point) => sum + point.lng, 0) / points.length
      return L.latLng(avgLat, avgLng)
    }

    centroidLat /= (6 * area)
    centroidLng /= (6 * area)

    // Additional NaN check
    if (isNaN(centroidLat) || isNaN(centroidLng)) {
      console.warn('Centroid calculation resulted in NaN, using simple average')
      const avgLat = points.reduce((sum, point) => sum + point.lat, 0) / points.length
      const avgLng = points.reduce((sum, point) => sum + point.lng, 0) / points.length
      return L.latLng(avgLat, avgLng)
    }

    return L.latLng(centroidLat, centroidLng)
  }

  // Initialize drawing layers
  useEffect(() => {
    if (!map) return

    // Clear layer tracking when map is initialized/changed
    console.log('🔄 Initializing drawing layers - clearing layer map')
    layerMapRef.current.clear()

    // Add drawn layers group to map
    const drawnLayers = drawnLayersRef.current
    map.addLayer(drawnLayers)

    return () => {
      if (map) {
        map.removeLayer(drawnLayers)
      }
    }
  }, [map])

  // Handle tool activation with custom drawing
  useEffect(() => {
    if (!map) return

    // Clean up previous drawing
    if (currentDrawingRef.current) {
      map.removeLayer(currentDrawingRef.current)
      currentDrawingRef.current = null
    }
    drawingPointsRef.current = []

    // Remove existing event listeners
    map.off('click', handleMapClick)
    map.off('contextmenu', handleRightClick)
    map.off('dblclick', handleDoubleClick)
    map.off('mousemove', handleMapMouseMove)
    document.removeEventListener('keydown', handleKeyDown)

    if (activeTool === 'polygon') {
      onDrawingStart()
      isDrawingRef.current = true
      onDrawingProgress?.(0, true)
      map.on('click', handleMapClick)
      map.on('contextmenu', handleRightClick) // Right-click to finish
      map.on('dblclick', handleDoubleClick) // Double-click to finish
      map.on('mousemove', handleMapMouseMove)
      document.addEventListener('keydown', handleKeyDown) // Escape to cancel

      // Disable double-click zoom during drawing
      map.doubleClickZoom.disable()

      // Change cursor
      map.getContainer().style.cursor = 'crosshair'

      // Focus map to capture keyboard events
      map.getContainer().focus()
      map.getContainer().setAttribute('tabindex', '0')
    } else {
      isDrawingRef.current = false
      map.getContainer().style.cursor = ''

      // Re-enable double-click zoom when not drawing
      map.doubleClickZoom.enable()

      // Add map click handler for deselection when not drawing
      map.on('click', handleMapClickForDeselection)
    }

    return () => {
      if (map) {
        map.off('click', handleMapClick)
        map.off('click', handleMapClickForDeselection)
        map.off('contextmenu', handleRightClick)
        map.off('dblclick', handleDoubleClick)
        map.off('mousemove', handleMapMouseMove)
        document.removeEventListener('keydown', handleKeyDown)

        map.getContainer().style.cursor = ''
        map.getContainer().removeAttribute('tabindex')
        map.doubleClickZoom.enable()
      }
    }
  }, [activeTool, map])

  // Create Leaflet polygons for saved areas with batched rendering for performance
  useEffect(() => {
    if (!map) {
      console.log('🚫 Map not ready for saved areas processing')
      return
    }

    console.log('🗺️ Processing saved areas for map display:', savedAreas.length)

    // Filter areas that need polygon creation
    const areasToProcess = savedAreas.filter(area => {
      const areaKey = DrawnAreaUtils.getEntityKey(area)
      return !layerMapRef.current.has(areaKey) && area.coordinates && area.coordinates.length >= 3
    })

    if (areasToProcess.length === 0) {
      console.log('✅ All polygons already rendered')
      return
    }

    console.log('⚡ Batched polygon rendering:', areasToProcess.length, 'polygons to process')

    // Process polygons in batches to avoid blocking UI
    const BATCH_SIZE = 10
    let currentBatch = 0

    const processBatch = () => {
      const startIdx = currentBatch * BATCH_SIZE
      const endIdx = Math.min(startIdx + BATCH_SIZE, areasToProcess.length)
      const batch = areasToProcess.slice(startIdx, endIdx)

      console.log(`🔄 Processing batch ${currentBatch + 1}/${Math.ceil(areasToProcess.length / BATCH_SIZE)}: ${batch.length} polygons`)

      batch.forEach(area => {
        const areaKey = DrawnAreaUtils.getEntityKey(area)

        // Database stores coordinates as [lat, lng] which is what Leaflet expects
        const latlngs = area.coordinates.map(coord => {
          if (!Array.isArray(coord) || coord.length !== 2) {
            console.error('❌ Invalid coordinate format:', coord)
            return [0, 0] as [number, number]
          }
          return [coord[0], coord[1]] as [number, number]
        })

        // Create polygon with green styling for saved blocs
        const polygon = L.polygon(latlngs, {
          color: '#22c55e', // Green for saved blocs
          fillColor: '#22c55e',
          fillOpacity: 0.3,
          weight: 2,
          opacity: 0.8
        })

        // Add to map and store reference
        drawnLayersRef.current.addLayer(polygon)
        layerMapRef.current.set(areaKey, polygon)

        // Add click handler
        polygon.on('click', (e) => {
          if (e.originalEvent) {
            e.originalEvent.stopPropagation()
            e.originalEvent.preventDefault()
            e.originalEvent.stopImmediatePropagation()
          }
          L.DomEvent.stopPropagation(e)
          onPolygonClick?.(areaKey)
        })
      })

      currentBatch++

      // Process next batch if there are more
      if (currentBatch * BATCH_SIZE < areasToProcess.length) {
        // Use requestAnimationFrame for smooth rendering
        requestAnimationFrame(processBatch)
      } else {
        console.log('✅ All polygons rendered successfully in', currentBatch, 'batches')
      }
    }

    // Start processing batches
    processBatch()
  }, [map, savedAreas, onPolygonClick])

  // Detect when areas are saved and clear totals
  useEffect(() => {
    if (savedAreas && savedAreas.length > lastSavedAreasCount) {
      // Areas were saved, clear the drawing session totals
      setTotalDrawnArea(0)
      setCurrentCropCycleId('')

      // Remove vertex markers and text labels from saved areas (make them non-editable)
      savedAreas.forEach(area => {
        const areaKey = DrawnAreaUtils.getEntityKey(area)
        const layer = layerMapRef.current.get(areaKey)
        if (layer && layer instanceof L.Polygon) {
          removeVertexMarkers(layer)
          removeTextLabel(layer)

          // Ensure saved areas have click handlers
          layer.off('click') // Remove any existing handlers
          layer.on('click', (e) => {
            console.log('🖱️ Saved polygon clicked:', areaKey)
            // Stop event propagation more aggressively
            if (e.originalEvent) {
              e.originalEvent.stopPropagation()
              e.originalEvent.preventDefault()
              e.originalEvent.stopImmediatePropagation()
            }
            L.DomEvent.stopPropagation(e)
            onPolygonClick?.(areaKey)
          })

          console.log('💾 Made area non-editable, removed text, and added click handler:', areaKey)
        }
      })
    }
    setLastSavedAreasCount(savedAreas?.length || 0)
  }, [savedAreas])

  // Ensure all existing polygons have click handlers
  useEffect(() => {
    console.log('🔗 Setting up click handlers for existing areas')

    // Add click handlers to drawn areas
    drawnAreas.forEach(area => {
      const areaKey = DrawnAreaUtils.getEntityKey(area)
      const layer = layerMapRef.current.get(areaKey)
      if (layer && layer instanceof L.Polygon) {
        layer.off('click') // Remove any existing handlers
        layer.on('click', (e) => {
          console.log('🖱️ Drawn polygon clicked:', areaKey)
          // Stop event propagation more aggressively
          if (e.originalEvent) {
            e.originalEvent.stopPropagation()
            e.originalEvent.preventDefault()
            e.originalEvent.stopImmediatePropagation()
          }
          L.DomEvent.stopPropagation(e)
          onPolygonClick?.(areaKey)
        })
        console.log('🔗 Added click handler to drawn area:', areaKey)
      }
    })

    // Add click handlers to saved areas
    savedAreas.forEach(area => {
      const areaKey = DrawnAreaUtils.getEntityKey(area)
      const layer = layerMapRef.current.get(areaKey)
      if (layer && layer instanceof L.Polygon) {
        layer.off('click') // Remove any existing handlers
        layer.on('click', (e) => {
          console.log('🖱️ Saved polygon clicked:', areaKey)
          // Stop event propagation more aggressively
          if (e.originalEvent) {
            e.originalEvent.stopPropagation()
            e.originalEvent.preventDefault()
            e.originalEvent.stopImmediatePropagation()
          }
          L.DomEvent.stopPropagation(e)
          onPolygonClick?.(areaKey)
        })
        console.log('🔗 Added click handler to saved area:', areaKey)
      }
    })
  }, [drawnAreas, savedAreas, onPolygonClick])

  // Handle area deletion - remove from map when deleted from state
  useEffect(() => {
    const currentAreaIds = new Set([...drawnAreas.map(a => DrawnAreaUtils.getEntityKey(a)), ...savedAreas.map(a => DrawnAreaUtils.getEntityKey(a))])

    console.log('🗂️ Area management effect:', {
      drawnAreaIds: drawnAreas.map(a => DrawnAreaUtils.getEntityKey(a)),
      savedAreaIds: savedAreas.map(a => DrawnAreaUtils.getEntityKey(a)),
      layerMapKeys: Array.from(layerMapRef.current.keys()),
      currentAreaIds: Array.from(currentAreaIds)
    })

    // Track deleted areas to update total
    const deletedAreas: string[] = []

    // Remove layers that are no longer in the state
    layerMapRef.current.forEach((layer, areaId) => {
      if (!currentAreaIds.has(areaId)) {
        console.log('🗑️ Removing layer for deleted area:', areaId)
        deletedAreas.push(areaId)
        // Remove the layer from map
        if (map && drawnLayersRef.current.hasLayer(layer)) {
          drawnLayersRef.current.removeLayer(layer)
        }

        // Remove vertex markers if they exist
        if (layer._vertexMarkers) {
          layer._vertexMarkers.forEach(marker => {
            if (map && map.hasLayer(marker)) {
              map.removeLayer(marker)
            }
          })
        }

        // Remove area label (crop cycle ID, area, dimensions) if it exists
        if ((layer as any)._areaLabel) {
          if (map && map.hasLayer((layer as any)._areaLabel)) {
            map.removeLayer((layer as any)._areaLabel)
          }
          ;(layer as any)._areaLabel = null
        }

        // Remove from our tracking
        layerMapRef.current.delete(areaId)
      }
    })

    // Update total drawn area if any areas were deleted
    if (deletedAreas.length > 0) {
      // Recalculate total from remaining drawn areas (not saved areas)
      const newTotal = drawnAreas.reduce((sum, area) => sum + area.area, 0)
      setTotalDrawnArea(newTotal)
    }
  }, [drawnAreas, savedAreas, map])

  // Handle highlighting of drawn areas
  useEffect(() => {
    layerMapRef.current.forEach((layer, areaId) => {
      const isSelected = selectedAreaId === areaId
      const isHovered = hoveredAreaId === areaId

      // Get the area to determine if it's saved or drawn
      const isSaved = savedAreas.some(a => DrawnAreaUtils.getEntityKey(a) === areaId)
      const isDrawn = drawnAreas.some(a => DrawnAreaUtils.getEntityKey(a) === areaId)

      // Get the actual area object
      const area = savedAreas.find(a => DrawnAreaUtils.getEntityKey(a) === areaId) || drawnAreas.find(a => DrawnAreaUtils.getEntityKey(a) === areaId)

      if (!area) {
        console.warn(`Area not found for ID: ${areaId}`)
        return
      }

      // Get polygon styling based on layer type and state
      const styling = getPolygonColor(area, isSelected, isHovered)

      // If not selected or hovered, use default colors based on saved state
      if (!isSelected && !isHovered) {
        if (isSaved) {
          // Use layer-specific colors for saved blocs, or default green
          const layerStyling = getPolygonColor(area, false, false)
          styling.color = layerStyling.color
          styling.fillColor = layerStyling.fillColor
          styling.fillOpacity = layerStyling.fillOpacity
        } else {
          // Blue for drawn but not saved blocs
          styling.color = '#3b82f6'
          styling.fillColor = '#3b82f6'
          styling.fillOpacity = 0.3
        }
      }

      const { color, fillColor, weight, fillOpacity } = styling

      layer.setStyle({
        color,
        weight,
        fillOpacity,
        fillColor
      })
    })
  }, [selectedAreaId, hoveredAreaId, drawnAreas, savedAreas])

  // Helper function to find nearest field edge point using proper GIS snapping
  const findNearestFieldPoint = (clickPoint: L.LatLng): L.LatLng => {
    if (!map) return clickPoint

    // Less aggressive hysteresis snapping: much smaller tolerances
    const SNAP_IN_TOLERANCE_PIXELS = 5       // Distance to start snapping (much smaller)
    const SNAP_OUT_TOLERANCE_PIXELS = 10     // Distance to break snapping (less aggressive hold)

    // Convert pixel tolerances to map units
    const mapCenter = map.getCenter()
    const mapCenterPoint = map.latLngToContainerPoint(mapCenter)

    const snapInPoint = L.point(mapCenterPoint.x + SNAP_IN_TOLERANCE_PIXELS, mapCenterPoint.y)
    const snapInLatLng = map.containerPointToLatLng(snapInPoint)
    const snapInToleranceMeters = map.distance(mapCenter, snapInLatLng)

    const snapOutPoint = L.point(mapCenterPoint.x + SNAP_OUT_TOLERANCE_PIXELS, mapCenterPoint.y)
    const snapOutLatLng = map.containerPointToLatLng(snapOutPoint)
    const snapOutToleranceMeters = map.distance(mapCenter, snapOutLatLng)

    let nearestPoint = clickPoint
    let minDistanceMeters = Infinity
    let foundSnapPoint: L.LatLng | null = null

    // Check if we're currently snapped and should use hysteresis
    if (isCurrentlySnapped && currentSnapPoint) {
      const distanceFromCurrentSnap = map.distance(clickPoint, currentSnapPoint)

      // If still within "snap out" tolerance, keep the current snap point
      if (distanceFromCurrentSnap <= snapOutToleranceMeters) {
        return currentSnapPoint
      } else {
        // We've moved far enough to break the snap
        setIsCurrentlySnapped(false)
        setCurrentSnapPoint(null)
      }
    }

    // Field functionality removed - no field edge snapping available
    // Future: Could implement bloc edge snapping here if needed

    // Update snap state if we found a new snap point
    if (foundSnapPoint && foundSnapPoint !== clickPoint) {
      setCurrentSnapPoint(foundSnapPoint)
      setIsCurrentlySnapped(true)
    } else if (!isCurrentlySnapped) {
      setCurrentSnapPoint(null)
      setIsCurrentlySnapped(false)
    }

    return nearestPoint
  }

  // Helper function to detect significant corners based on angle change
  const isSignificantCorner = (points: L.LatLng[], index: number): boolean => {
    if (index <= 0 || index >= points.length - 1) return false

    const prev = points[index - 1]
    const curr = points[index]
    const next = points[index + 1]

    // Calculate vectors
    const v1 = { x: curr.lng - prev.lng, y: curr.lat - prev.lat }
    const v2 = { x: next.lng - curr.lng, y: next.lat - curr.lat }

    // Calculate angle between vectors
    const dot = v1.x * v2.x + v1.y * v2.y
    const mag1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y)
    const mag2 = Math.sqrt(v2.x * v2.x + v2.y * v2.y)

    if (mag1 === 0 || mag2 === 0) return false

    const cosAngle = dot / (mag1 * mag2)
    const angle = Math.acos(Math.max(-1, Math.min(1, cosAngle))) * 180 / Math.PI

    // Consider it a significant corner if angle is less than 150 degrees (more aggressive)
    return angle < 150
  }

  // Calculate closest point on a line segment (proper geometric calculation)
  const getClosestPointOnLineSegment = (point: L.LatLng, lineStart: L.LatLng, lineEnd: L.LatLng): L.LatLng => {
    const A = point.lat - lineStart.lat
    const B = point.lng - lineStart.lng
    const C = lineEnd.lat - lineStart.lat
    const D = lineEnd.lng - lineStart.lng

    const dot = A * C + B * D
    const lenSq = C * C + D * D

    if (lenSq === 0) return lineStart // Line segment is actually a point

    let param = dot / lenSq

    // Clamp to line segment
    if (param < 0) param = 0
    if (param > 1) param = 1

    const closestLat = lineStart.lat + param * C
    const closestLng = lineStart.lng + param * D

    return L.latLng(closestLat, closestLng)
  }

  // Show visual feedback when snapping occurs
  const showSnapIndicator = (point: L.LatLng) => {
    if (!map) return

    // Remove previous indicator
    if (snapIndicatorRef.current) {
      map.removeLayer(snapIndicatorRef.current)
    }

    // Create snap indicator that stays visible
    snapIndicatorRef.current = L.circleMarker(point, {
      radius: 6,
      color: '#ff6b35',
      fillColor: '#ff6b35',
      fillOpacity: 0.8,
      weight: 2
    }).addTo(map)
  }

  // Hide snap indicator when not snapping
  const hideSnapIndicator = () => {
    if (snapIndicatorRef.current && map) {
      map.removeLayer(snapIndicatorRef.current)
      snapIndicatorRef.current = null
    }
  }

  // Show red indicator when trying to draw in invalid location
  const showOverlapIndicator = (point: L.LatLng, reason: string = 'Invalid location') => {
    if (!map) return



    // Remove previous indicator
    if (snapIndicatorRef.current) {
      map.removeLayer(snapIndicatorRef.current)
    }

    // Create overlap indicator (red) - make it more visible
    snapIndicatorRef.current = L.circleMarker(point, {
      radius: 12,
      color: '#dc2626',
      fillColor: '#fca5a5',
      fillOpacity: 0.9,
      weight: 4
    }).addTo(map)

    // Add popup with reason
    snapIndicatorRef.current.bindPopup(`
      <div style="text-align: center; color: #dc2626; font-weight: bold;">
        ⚠️ Cannot draw here<br>
        <small style="font-weight: normal;">${reason}</small>
      </div>
    `).openPopup()

    // Add a pulsing effect
    let pulseCount = 0
    const pulseInterval = setInterval(() => {
      if (snapIndicatorRef.current && pulseCount < 6) {
        const radius = pulseCount % 2 === 0 ? 12 : 16
        snapIndicatorRef.current.setRadius(radius)
        pulseCount++
      } else {
        clearInterval(pulseInterval)
      }
    }, 200)

    // Remove indicator after longer delay
    setTimeout(() => {
      if (snapIndicatorRef.current && map) {
        map.removeLayer(snapIndicatorRef.current)
        snapIndicatorRef.current = null
      }
      clearInterval(pulseInterval)
    }, 3000)
  }

  // Check if a point overlaps with existing blocs (saved or drawn) OR is outside field boundaries
  const checkOverlapWithSavedAreas = (point: L.LatLng): { isOverlap: boolean; reason: string } => {

    // Check overlap with saved areas (cultivation areas)
    // Only block if point is STRICTLY INSIDE, not just touching boundary
    for (const savedArea of savedAreas) {
      const savedLayer = layerMapRef.current.get(DrawnAreaUtils.getEntityKey(savedArea))
      if (savedLayer && savedLayer.getBounds().contains(point)) {
        // More precise check - point STRICTLY inside polygon (not on boundary)
        const latlngs = savedLayer.getLatLngs()[0] as L.LatLng[]
        if (isPointStrictlyInsidePolygon(point, latlngs)) {
          console.log('❌ POINT INSIDE saved bloc:', DrawnAreaUtils.getDisplayName(savedArea))
          return { isOverlap: true, reason: 'Cannot draw inside saved blocs' }
        } else {
          console.log('✅ Point touching boundary of saved bloc - allowed')
        }
      }
    }

    // Check overlap with drawn areas (unsaved blocs)
    // Only block if point is STRICTLY INSIDE, not just touching boundary
    for (const drawnArea of drawnAreas) {
      const drawnLayer = layerMapRef.current.get(DrawnAreaUtils.getEntityKey(drawnArea))
      if (drawnLayer && drawnLayer.getBounds().contains(point)) {
        // More precise check - point STRICTLY inside polygon (not on boundary)
        const latlngs = drawnLayer.getLatLngs()[0] as L.LatLng[]
        if (isPointStrictlyInsidePolygon(point, latlngs)) {
          console.log('❌ POINT INSIDE drawn bloc:', DrawnAreaUtils.getDisplayName(drawnArea))
          return { isOverlap: true, reason: 'Cannot draw inside existing blocs' }
        } else {
          console.log('✅ Point touching boundary of drawn bloc - allowed')
        }
      }
    }

    // Field boundary check removed - allow drawing anywhere

    return { isOverlap: false, reason: '' }
  }

  // Check if a polygon overlaps with existing blocs (more comprehensive than point check)
  const checkPolygonOverlapWithExistingBlocs = (polygon: L.Polygon): { isOverlap: boolean; reason: string } => {
    const polygonLatLngs = polygon.getLatLngs()[0] as L.LatLng[]
    const currentPolygonId = L.stamp(polygon).toString()

    // Check overlap with saved areas
    for (const savedArea of savedAreas) {
      const areaKey = DrawnAreaUtils.getEntityKey(savedArea)
      console.log('🔍 Checking overlap with saved area:', DrawnAreaUtils.getDisplayName(savedArea))
      const savedLayer = layerMapRef.current.get(areaKey)
      if (savedLayer) {
        const savedLatLngs = savedLayer.getLatLngs()[0] as L.LatLng[]
        console.log('🔍 Saved area coordinates:', savedLatLngs.length, 'points')

        const hasOverlap = polygonsOverlap(polygonLatLngs, savedLatLngs)
        console.log('🔍 Overlap result with saved area', DrawnAreaUtils.getDisplayName(savedArea), ':', hasOverlap)

        if (hasOverlap) {
          console.log('❌ POLYGON OVERLAP with saved bloc:', DrawnAreaUtils.getDisplayName(savedArea))
          return { isOverlap: true, reason: 'New bloc overlaps with saved bloc' }
        }
      } else {
        console.log('⚠️ No layer found for saved area:', DrawnAreaUtils.getDisplayName(savedArea))
      }
    }

    // Check overlap with drawn areas (excluding current drawing)
    for (const drawnArea of drawnAreas) {
      const areaKey = DrawnAreaUtils.getEntityKey(drawnArea)
      console.log('🔍 Checking overlap with drawn area:', DrawnAreaUtils.getDisplayName(drawnArea))
      const drawnLayer = layerMapRef.current.get(areaKey)
      if (drawnLayer && areaKey !== currentPolygonId) {
        const drawnLatLngs = drawnLayer.getLatLngs()[0] as L.LatLng[]
        console.log('🔍 Drawn area coordinates:', drawnLatLngs.length, 'points')

        const hasOverlap = polygonsOverlap(polygonLatLngs, drawnLatLngs)
        console.log('🔍 Overlap result with drawn area', DrawnAreaUtils.getDisplayName(drawnArea), ':', hasOverlap)

        if (hasOverlap) {
          console.log('❌ POLYGON OVERLAP with drawn bloc:', DrawnAreaUtils.getDisplayName(drawnArea))
          return { isOverlap: true, reason: 'New bloc overlaps with existing bloc' }
        }
      } else if (!drawnLayer) {
        console.log('⚠️ No layer found for drawn area:', DrawnAreaUtils.getDisplayName(drawnArea))
      } else {
        console.log('🔍 Skipping current polygon:', DrawnAreaUtils.getDisplayName(drawnArea))
      }
    }

    console.log('✅ No polygon overlap detected')
    return { isOverlap: false, reason: '' }
  }

  // Helper function to check if two polygons have AREA overlap (not just touching)
  const polygonsOverlap = (poly1: L.LatLng[], poly2: L.LatLng[]): boolean => {
    console.log('🔍 Checking polygon AREA overlap (not just touching)')
    console.log('🔍 Poly1 has', poly1.length, 'vertices')
    console.log('🔍 Poly2 has', poly2.length, 'vertices')

    // Only check if vertices are INSIDE the other polygon (not on edges)
    // This allows touching/sharing edges but blocks area coverage

    let hasAreaOverlap = false

    // Check if any vertex of poly1 is INSIDE poly2 (not just on boundary)
    console.log('🔍 Checking if poly1 vertices are inside poly2...')
    for (let i = 0; i < poly1.length; i++) {
      const isInside = isPointStrictlyInsidePolygon(poly1[i], poly2)
      console.log(`🔍 Poly1 vertex ${i} (${poly1[i].lat.toFixed(6)}, ${poly1[i].lng.toFixed(6)}) inside poly2:`, isInside)
      if (isInside) {
        console.log('✅ Area overlap detected: poly1 vertex', i, 'is inside poly2')
        hasAreaOverlap = true
        break
      }
    }

    // Check if any vertex of poly2 is INSIDE poly1 (not just on boundary)
    if (!hasAreaOverlap) {
      console.log('🔍 Checking if poly2 vertices are inside poly1...')
      for (let i = 0; i < poly2.length; i++) {
        const isInside = isPointStrictlyInsidePolygon(poly2[i], poly1)
        console.log(`🔍 Poly2 vertex ${i} (${poly2[i].lat.toFixed(6)}, ${poly2[i].lng.toFixed(6)}) inside poly1:`, isInside)
        if (isInside) {
          console.log('✅ Area overlap detected: poly2 vertex', i, 'is inside poly1')
          hasAreaOverlap = true
          break
        }
      }
    }

    // Additional check: if one polygon completely contains the other
    if (!hasAreaOverlap) {
      console.log('🔍 Checking if one polygon contains the other...')

      // Check if poly1 completely contains poly2
      let allPoly2InsidePoly1 = true
      for (const point of poly2) {
        if (!isPointStrictlyInsidePolygon(point, poly1)) {
          allPoly2InsidePoly1 = false
          break
        }
      }
      if (allPoly2InsidePoly1 && poly2.length > 0) {
        console.log('✅ Area overlap detected: poly1 completely contains poly2')
        hasAreaOverlap = true
      }

      // Check if poly2 completely contains poly1
      if (!hasAreaOverlap) {
        let allPoly1InsidePoly2 = true
        for (const point of poly1) {
          if (!isPointStrictlyInsidePolygon(point, poly2)) {
            allPoly1InsidePoly2 = false
            break
          }
        }
        if (allPoly1InsidePoly2 && poly1.length > 0) {
          console.log('✅ Area overlap detected: poly2 completely contains poly1')
          hasAreaOverlap = true
        }
      }

      // Additional check: Use a more robust intersection test
      // Sample points within each polygon and check if they're in the other
      if (!hasAreaOverlap) {
        console.log('🔍 Performing additional intersection sampling...')
        const samplePoints1 = generatePolygonSamplePoints(poly1, 10)
        const samplePoints2 = generatePolygonSamplePoints(poly2, 10)

        // Check if any sample points from poly1 are inside poly2
        for (const point of samplePoints1) {
          if (isPointStrictlyInsidePolygon(point, poly2)) {
            console.log('✅ Area overlap detected: poly1 sample point inside poly2')
            hasAreaOverlap = true
            break
          }
        }

        // Check if any sample points from poly2 are inside poly1
        if (!hasAreaOverlap) {
          for (const point of samplePoints2) {
            if (isPointStrictlyInsidePolygon(point, poly1)) {
              console.log('✅ Area overlap detected: poly2 sample point inside poly1')
              hasAreaOverlap = true
              break
            }
          }
        }
      }
    }

    if (hasAreaOverlap) {
      console.log('🔴 AREA OVERLAP detected - blocking')
    } else {
      console.log('✅ No area overlap - touching/sharing edges is allowed')
    }

    return hasAreaOverlap
  }

  // Helper function to check if point is STRICTLY inside polygon (not on boundary)
  const isPointStrictlyInsidePolygon = (point: L.LatLng, polygon: L.LatLng[]): boolean => {
    let inside = false
    const x = point.lng
    const y = point.lat

    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i].lng
      const yi = polygon[i].lat
      const xj = polygon[j].lng
      const yj = polygon[j].lat

      if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) {
        inside = !inside
      }
    }

    // Additional check: if point is exactly on an edge, it's not "strictly inside"
    if (inside) {
      // Check if point is on any edge
      for (let i = 0; i < polygon.length; i++) {
        const j = (i + 1) % polygon.length
        if (isPointOnLineSegment(point, polygon[i], polygon[j])) {
          return false // Point is on boundary, not strictly inside
        }
      }
    }

    return inside
  }

  // Helper function to check if point is on a line segment
  const isPointOnLineSegment = (point: L.LatLng, lineStart: L.LatLng, lineEnd: L.LatLng): boolean => {
    const tolerance = 1e-10

    // Check if point is collinear with line segment
    const crossProduct = (point.lat - lineStart.lat) * (lineEnd.lng - lineStart.lng) -
                         (point.lng - lineStart.lng) * (lineEnd.lat - lineStart.lat)

    if (Math.abs(crossProduct) > tolerance) return false

    // Check if point is within the line segment bounds
    const dotProduct = (point.lng - lineStart.lng) * (lineEnd.lng - lineStart.lng) +
                       (point.lat - lineStart.lat) * (lineEnd.lat - lineStart.lat)
    const squaredLength = (lineEnd.lng - lineStart.lng) * (lineEnd.lng - lineStart.lng) +
                          (lineEnd.lat - lineStart.lat) * (lineEnd.lat - lineStart.lat)

    return dotProduct >= 0 && dotProduct <= squaredLength
  }

  // Generate sample points within a polygon for more robust overlap detection
  const generatePolygonSamplePoints = (polygon: L.LatLng[], numPoints: number): L.LatLng[] => {
    const points: L.LatLng[] = []

    // Find bounding box
    const lats = polygon.map(p => p.lat)
    const lngs = polygon.map(p => p.lng)
    const minLat = Math.min(...lats)
    const maxLat = Math.max(...lats)
    const minLng = Math.min(...lngs)
    const maxLng = Math.max(...lngs)

    // Generate random points within bounding box and keep those inside polygon
    let attempts = 0
    while (points.length < numPoints && attempts < numPoints * 10) {
      const lat = minLat + Math.random() * (maxLat - minLat)
      const lng = minLng + Math.random() * (maxLng - minLng)
      const testPoint = L.latLng(lat, lng)

      if (isPointStrictlyInsidePolygon(testPoint, polygon)) {
        points.push(testPoint)
      }
      attempts++
    }

    return points
  }

  // Helper function to check if two line segments intersect
  const lineSegmentsIntersect = (p1: L.LatLng, p2: L.LatLng, p3: L.LatLng, p4: L.LatLng): boolean => {
    const d1 = direction(p3, p4, p1)
    const d2 = direction(p3, p4, p2)
    const d3 = direction(p1, p2, p3)
    const d4 = direction(p1, p2, p4)

    if (((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) &&
        ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0))) {
      return true
    }

    return false
  }

  // Helper function to determine the direction of the turn
  const direction = (p1: L.LatLng, p2: L.LatLng, p3: L.LatLng): number => {
    return (p3.lng - p1.lng) * (p2.lat - p1.lat) - (p2.lng - p1.lng) * (p3.lat - p1.lat)
  }

  // Point in polygon algorithm
  const isPointInPolygon = (point: L.LatLng, polygon: L.LatLng[]): boolean => {
    let inside = false
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      if (((polygon[i].lat > point.lat) !== (polygon[j].lat > point.lat)) &&
          (point.lng < (polygon[j].lng - polygon[i].lng) * (point.lat - polygon[i].lat) / (polygon[j].lat - polygon[i].lat) + polygon[i].lng)) {
        inside = !inside
      }
    }
    return inside
  }

  // Handle map clicks for deselection when not drawing
  const handleMapClickForDeselection = (e: L.LeafletMouseEvent) => {
    // Only deselect if not drawing and not clicking on a polygon
    if (!isDrawingRef.current && !e.originalEvent?.defaultPrevented) {
      onMapClick?.()
    }
  }

  // Custom polygon drawing handlers
  const handleMapClick = (e: L.LeafletMouseEvent) => {
    if (!isDrawingRef.current || activeTool !== 'polygon') return

    // Apply snapping with proper GIS tolerance
    const snappedPoint = findNearestFieldPoint(e.latlng)

    // Check for overlap with saved areas and field boundaries
    const overlapCheck = checkOverlapWithSavedAreas(snappedPoint)
    if (overlapCheck.isOverlap) {
      // Show red indicator for invalid placement
      showOverlapIndicator(snappedPoint, overlapCheck.reason)
      return // Don't add the point
    }

    // Show snap indicator if point was snapped
    const wasSnapped = snappedPoint.lat !== e.latlng.lat || snappedPoint.lng !== e.latlng.lng
    if (wasSnapped) {
      showSnapIndicator(snappedPoint)
    }

    drawingPointsRef.current.push(snappedPoint)

    // Update drawing progress
    onDrawingProgress?.(drawingPointsRef.current.length, true)

    // Calculate real-time stats
    calculateRealTimeStats(drawingPointsRef.current)

    // Create or update the polygon
    if (drawingPointsRef.current.length >= 2) {
      if (currentDrawingRef.current) {
        map?.removeLayer(currentDrawingRef.current)
      }

      currentDrawingRef.current = L.polygon(drawingPointsRef.current, {
        color: '#3b82f6',
        fillColor: '#3b82f6',
        fillOpacity: 0.3,
        weight: 2,
        dashArray: '5, 5' // Dashed line while drawing
      })

      map?.addLayer(currentDrawingRef.current)
    }
  }

  const handleDoubleClick = (e: L.LeafletMouseEvent) => {
    if (!isDrawingRef.current || activeTool !== 'polygon') return

    e.originalEvent.preventDefault()
    finishPolygonDrawing()
  }

  const handleRightClick = (e: L.LeafletMouseEvent) => {
    if (!isDrawingRef.current || activeTool !== 'polygon') return

    e.originalEvent.preventDefault()
    finishPolygonDrawing()
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    if (!isDrawingRef.current) return

    if (e.key === 'Escape') {
      cancelDrawing()
    } else if (e.key === 'Enter' && activeTool === 'polygon') {
      finishPolygonDrawing()
    }
  }

  const cancelDrawing = () => {
    if (currentDrawingRef.current) {
      map?.removeLayer(currentDrawingRef.current)
    }
    currentDrawingRef.current = null
    drawingPointsRef.current = []
    isDrawingRef.current = false
    setDrawingStats(null)
    hideSnapIndicator()

    // Reset snap state
    setCurrentSnapPoint(null)
    setIsCurrentlySnapped(false)

    onDrawingEnd()
  }

  // Function to clear total area when areas are saved
  const clearTotalArea = () => {
    setTotalDrawnArea(0)
    setCurrentCropCycleId('')
  }

  // Function to remove vertex markers from saved areas (make them non-editable)
  const removeVertexMarkers = (polygon: L.Polygon) => {
    if ((polygon as any)._vertexMarkers) {
      ;(polygon as any)._vertexMarkers.forEach((marker: L.CircleMarker) => {
        if (map) {
          map.removeLayer(marker)
        }
      })
      ;(polygon as any)._vertexMarkers = []
    }
  }

  // Function to remove text labels from saved areas
  const removeTextLabel = (polygon: L.Polygon) => {
    if ((polygon as any)._areaLabel && map) {
      map.removeLayer((polygon as any)._areaLabel)
      ;(polygon as any)._areaLabel = null
      console.log('🏷️ Removed text label from saved bloc')
    }
  }

  // Function to update polygon label with current dimensions
  const updatePolygonLabel = (polygon: L.Polygon, latlngs: L.LatLng[]) => {
    if (!map) return

    const dimensions = calculatePolygonDimensions(latlngs)
    const center = calculatePolygonCentroid(latlngs)
    const cropCycleId = (polygon as any)._cropCycleId || 'Unknown'

    // Remove existing label
    if ((polygon as any)._areaLabel) {
      map.removeLayer((polygon as any)._areaLabel)
    }

    // Create updated label with zoom-responsive sizing
    const currentZoom = map.getZoom()
    const bounds = polygon.getBounds()
    const shapeWidthInPixels = map.distance(bounds.getSouthWest(), bounds.getSouthEast()) * Math.pow(2, currentZoom - 10) / 100
    const maxFontSize = Math.max(8, Math.min(14, shapeWidthInPixels / 15))

    const updatedLabel = L.divIcon({
      html: `<div style="
        font-family: Arial, sans-serif;
        font-size: ${maxFontSize}px;
        font-weight: bold;
        color: #000000;
        text-align: center;
        text-shadow: 1px 1px 2px rgba(255,255,255,0.8), -1px -1px 2px rgba(255,255,255,0.8), 1px -1px 2px rgba(255,255,255,0.8), -1px 1px 2px rgba(255,255,255,0.8);
        pointer-events: none;
        white-space: nowrap;
        line-height: 1.2;
        position: absolute;
        transform: translate(-50%, -50%);
        top: 0;
        left: 0;
        max-width: ${shapeWidthInPixels * 0.9}px;
        overflow: hidden;
        text-overflow: ellipsis;
      ">${dimensions.area.toFixed(2)} ha<br/>${dimensions.width}m × ${dimensions.length}m</div>`,
      className: 'area-label',
      iconSize: [1, 1],
      iconAnchor: [0, 0]
    })

    const labelMarker = L.marker(center, { icon: updatedLabel })
    labelMarker.addTo(map)
    ;(polygon as any)._areaLabel = labelMarker
  }

  const handleMapMouseMove = (e: L.LeafletMouseEvent) => {
    if (!isDrawingRef.current || activeTool !== 'polygon') return

    // Apply snapping to cursor position for preview
    const snappedCursorPoint = findNearestFieldPoint(e.latlng)

    // Check if the cursor position would cause overlap
    const pointOverlap = checkOverlapWithSavedAreas(snappedCursorPoint)

    // Show/hide snap indicator based on whether snapping occurred and no overlap
    const wasSnapped = snappedCursorPoint.lat !== e.latlng.lat || snappedCursorPoint.lng !== e.latlng.lng
    if (wasSnapped && !pointOverlap.isOverlap) {
      showSnapIndicator(snappedCursorPoint)
    } else {
      hideSnapIndicator()
    }

    if (drawingPointsRef.current.length === 0) return

    // Show preview line to snapped cursor position
    const points = [...drawingPointsRef.current, snappedCursorPoint]

    if (currentDrawingRef.current) {
      map?.removeLayer(currentDrawingRef.current)
    }

    // Check if the entire preview polygon would overlap with existing blocs
    let polygonOverlap = false
    if (points.length >= 3) {
      const tempPolygon = L.polygon(points)
      const overlapResult = checkPolygonOverlapWithExistingBlocs(tempPolygon)
      polygonOverlap = overlapResult.isOverlap

      if (polygonOverlap) {
        console.log('🔴 Preview polygon overlaps with existing bloc')
      }
    }

    // ALWAYS check polygon overlap if we have enough points, even if cursor point is valid
    // This ensures that if the polygon area covers existing blocs, it shows red
    let finalPolygonOverlap = false
    if (points.length >= 3) {
      // Create a closed polygon to check the full area
      const closedPoints = [...points, points[0]] // Close the polygon
      const tempClosedPolygon = L.polygon(closedPoints)
      const closedOverlapResult = checkPolygonOverlapWithExistingBlocs(tempClosedPolygon)
      finalPolygonOverlap = closedOverlapResult.isOverlap

      if (finalPolygonOverlap) {
        console.log('🔴 Closed polygon area would overlap with existing bloc')
      }
    }

    // Use red if point overlap OR polygon overlap OR final closed polygon overlap
    const hasOverlap = pointOverlap.isOverlap || polygonOverlap || finalPolygonOverlap

    // Use different colors based on overlap status
    const polygonStyle = hasOverlap ? {
      color: '#dc2626',        // Red for invalid
      fillColor: '#fca5a5',    // Light red fill
      fillOpacity: 0.3,
      weight: 2,
      dashArray: '5, 5'
    } : {
      color: '#3b82f6',        // Blue for valid
      fillColor: '#3b82f6',
      fillOpacity: 0.2,
      weight: 2,
      dashArray: '5, 5'
    }

    currentDrawingRef.current = L.polygon(points, polygonStyle)
    map?.addLayer(currentDrawingRef.current)
  }



  const finishPolygonDrawing = () => {
    if (!currentDrawingRef.current || drawingPointsRef.current.length < 3) {
      // Cancel drawing if not enough points
      if (currentDrawingRef.current) {
        map?.removeLayer(currentDrawingRef.current)
      }
      onDrawingEnd()
      return
    }

    console.log('🏁 Attempting to finish polygon with', drawingPointsRef.current.length, 'points')

    // Check if the completed polygon overlaps with existing blocs
    const tempPolygon = L.polygon(drawingPointsRef.current)
    const polygonOverlap = checkPolygonOverlapWithExistingBlocs(tempPolygon)

    if (polygonOverlap.isOverlap) {
      // Show error indicator at polygon center
      const centerPoint = calculatePolygonCentroid(drawingPointsRef.current)
      showOverlapIndicator(centerPoint, polygonOverlap.reason)

      // Cancel the drawing - make it disappear
      if (currentDrawingRef.current) {
        map?.removeLayer(currentDrawingRef.current)
      }
      currentDrawingRef.current = null
      drawingPointsRef.current = []
      isDrawingRef.current = false
      setDrawingStats(null)
      hideSnapIndicator()
      onDrawingEnd()
      onDrawingProgress?.(0, false)

      return
    }

    // Finalize the polygon
    const finalPolygon = L.polygon(drawingPointsRef.current, {
      color: '#3b82f6',
      fillColor: '#3b82f6',
      fillOpacity: 0.3,
      weight: 2
    })

    map?.removeLayer(currentDrawingRef.current)
    drawnLayersRef.current.addLayer(finalPolygon)

    // Generate a proper UUID for the bloc
    const generateUUID = () => {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0
        const v = c == 'x' ? r : (r & 0x3 | 0x8)
        return v.toString(16)
      })
    }

    const areaId = generateUUID()
    layerMapRef.current.set(areaId, finalPolygon)

    // Add vertex markers for editing
    addVertexMarkers(finalPolygon)

    // Make polygon clickable for highlighting (not info modal)
    finalPolygon.on('click', (e) => {
      console.log('🖱️ Polygon clicked:', areaId)
      // Stop event propagation more aggressively
      if (e.originalEvent) {
        e.originalEvent.stopPropagation()
        e.originalEvent.preventDefault()
        e.originalEvent.stopImmediatePropagation()
      }
      L.DomEvent.stopPropagation(e)
      onPolygonClick?.(areaId)
    })

    // Generate crop cycle ID if not set
    if (!currentCropCycleId) {
      const now = new Date()
      const cycleId = `CC${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}_${Math.random().toString(36).substr(2, 4).toUpperCase()}`
      setCurrentCropCycleId(cycleId)
    }

    // Create drawn area object
    const coordinates = drawingPointsRef.current.map(latlng => [latlng.lng, latlng.lat] as [number, number])
    const area = calculateArea(coordinates)

    // Update total drawn area
    setTotalDrawnArea(prev => prev + area)

    // Use DrawnAreaUtils to create properly structured area
    const drawnArea = DrawnAreaUtils.createNew(coordinates, area, 'polygon')

    // Calculate dimensions for the completed polygon
    const dimensions = calculatePolygonDimensions(drawingPointsRef.current)

    // Add area info label to polygon centroid (same style as field labels)
    const center = calculatePolygonCentroid(drawingPointsRef.current)

    // Calculate responsive font size based on zoom and shape size
    if (!map) return
    const currentZoom = map.getZoom()
    const bounds = finalPolygon.getBounds()
    const shapeWidthInPixels = map.distance(bounds.getSouthWest(), bounds.getSouthEast()) * Math.pow(2, currentZoom - 10) / 100
    const maxFontSize = Math.max(8, Math.min(14, shapeWidthInPixels / 15))

    const areaLabel = L.divIcon({
      html: `<div style="
        font-family: Arial, sans-serif;
        font-size: ${maxFontSize}px;
        font-weight: bold;
        color: #000000;
        text-align: center;
        text-shadow: 1px 1px 2px rgba(255,255,255,0.8), -1px -1px 2px rgba(255,255,255,0.8), 1px -1px 2px rgba(255,255,255,0.8), -1px 1px 2px rgba(255,255,255,0.8);
        pointer-events: none;
        white-space: nowrap;
        line-height: 1.2;
        position: absolute;
        transform: translate(-50%, -50%);
        top: 0;
        left: 0;
        max-width: ${shapeWidthInPixels * 0.9}px;
        overflow: hidden;
        text-overflow: ellipsis;
      ">${dimensions.area.toFixed(2)} ha<br/>${dimensions.width}m × ${dimensions.length}m</div>`,
      className: 'area-label',
      iconSize: [1, 1],
      iconAnchor: [0, 0]
    })

    const labelMarker = L.marker(center, { icon: areaLabel })
    if (map) {
      labelMarker.addTo(map)
      // Store label reference on polygon for cleanup and updates
      ;(finalPolygon as any)._areaLabel = labelMarker
      ;(finalPolygon as any)._cropCycleId = currentCropCycleId
    }

    onAreaDrawn(drawnArea)
    onDrawingEnd()
    onDrawingProgress?.(0, false)

    // Reset drawing state but keep stats for display
    currentDrawingRef.current = null
    drawingPointsRef.current = []
    isDrawingRef.current = false
    setDrawingStats(null)
    hideSnapIndicator()

    // Reset snap state
    setCurrentSnapPoint(null)
    setIsCurrentlySnapped(false)
  }

  const addVertexMarkers = (polygon: L.Polygon) => {
    if (!map) return

    const latlngs = polygon.getLatLngs()[0] as L.LatLng[]

    latlngs.forEach((latlng, index) => {
      const marker = L.circleMarker(latlng, {
        radius: 5,
        color: '#ffffff',
        fillColor: '#3b82f6',
        fillOpacity: 1,
        weight: 2
      })

      marker.addTo(map)

      // Make marker draggable
      marker.on('mousedown', (e) => {
        e.originalEvent?.preventDefault()
        e.originalEvent?.stopPropagation()
        startVertexDrag(marker, polygon, index)
      })

      // Store marker reference on polygon for cleanup
      if (!polygon._vertexMarkers) {
        polygon._vertexMarkers = []
      }
      polygon._vertexMarkers.push(marker)
    })
  }

  const startVertexDrag = (marker: L.CircleMarker, polygon: L.Polygon, vertexIndex: number) => {
    if (!map) return

    // Disable map dragging during vertex editing
    map.dragging.disable()
    map.getContainer().style.cursor = 'move'

    const handleMouseMove = (e: L.LeafletMouseEvent) => {
      e.originalEvent?.preventDefault()
      e.originalEvent?.stopPropagation()

      const snappedPoint = findNearestFieldPoint(e.latlng)

      // Temporarily move the vertex to check for overlaps
      const latlngs = polygon.getLatLngs()[0] as L.LatLng[]
      const originalPoint = latlngs[vertexIndex]
      latlngs[vertexIndex] = snappedPoint

      // Check if the modified polygon would overlap with existing blocs
      const tempPolygon = L.polygon(latlngs)
      const polygonOverlap = checkPolygonOverlapWithExistingBlocs(tempPolygon)

      if (polygonOverlap.isOverlap) {
        // Revert the change and show red indicator
        latlngs[vertexIndex] = originalPoint
        showOverlapIndicator(snappedPoint, polygonOverlap.reason)

        // Change polygon color to red to indicate invalid state
        polygon.setStyle({
          color: '#dc2626',
          fillColor: '#fca5a5',
          fillOpacity: 0.4,
          weight: 3
        })
        return // Don't move the vertex
      }

      // Valid position - move the vertex
      marker.setLatLng(snappedPoint)
      polygon.setLatLngs([latlngs])

      // Reset polygon color to normal
      polygon.setStyle({
        color: '#3b82f6',
        fillColor: '#3b82f6',
        fillOpacity: 0.3,
        weight: 2
      })

      // Update area label in real-time during dragging
      updatePolygonLabel(polygon, latlngs)
    }

    const handleMouseUp = (e: L.LeafletMouseEvent) => {
      e.originalEvent?.preventDefault()
      e.originalEvent?.stopPropagation()

      // Re-enable map dragging
      map.dragging.enable()
      map.getContainer().style.cursor = ''

      map.off('mousemove', handleMouseMove)
      map.off('mouseup', handleMouseUp)

      // Check if the final polygon overlaps with existing blocs
      const polygonOverlap = checkPolygonOverlapWithExistingBlocs(polygon)

      if (polygonOverlap.isOverlap) {
        // Show error and revert to original position or delete
        const latlngs = polygon.getLatLngs()[0] as L.LatLng[]
        const centerPoint = calculatePolygonCentroid(latlngs)
        showOverlapIndicator(centerPoint, 'Bloc overlaps with existing bloc - removing')

        // Remove the polygon entirely
        const polygonId = L.stamp(polygon).toString()
        if (map) {
          drawnLayersRef.current.removeLayer(polygon)
          layerMapRef.current.delete(polygonId)

          // Remove vertex markers
          removeVertexMarkers(polygon)

          // Remove area label
          if ((polygon as any)._areaLabel) {
            map.removeLayer((polygon as any)._areaLabel)
          }
        }

      // Final update of the label after dragging completes
      updatePolygonLabel(polygon, latlngs)

        console.log('🗑️ Removed overlapping polygon after vertex edit')
        return
      }

      // Valid polygon - update the drawn area data
      const latlngs = polygon.getLatLngs()[0] as L.LatLng[]
      const coordinates = latlngs.map(latlng => [latlng.lng, latlng.lat] as [number, number])
      const area = calculateArea(coordinates)

      // Find the existing area ID from the layer map
      let existingAreaId = ''
      for (const [id, layer] of Array.from(layerMapRef.current.entries())) {
        if (layer === polygon) {
          existingAreaId = id
          break
        }
      }

      const now = new Date().toISOString()
      const updatedArea: DrawnArea = {
        uuid: existingAreaId,
        localId: `Bloc ${existingAreaId}`,
        type: 'polygon',
        coordinates,
        area,
        isSaved: true,
        isDirty: true,
        createdAt: now,
        updatedAt: now
      }

      onAreaUpdated?.(updatedArea)
    }

    map.on('mousemove', handleMouseMove)
    map.on('mouseup', handleMouseUp)
  }



  const calculateArea = (coordinates: [number, number][]): number => {
    // Use Turf.js for accurate geodesic area calculation
    if (coordinates.length < 3) return 0

    try {
      // Create a GeoJSON polygon from coordinates
      // Turf expects coordinates in [longitude, latitude] format
      // Ensure the polygon is closed by adding the first coordinate at the end if needed
      const coords = [...coordinates]
      if (coords[0][0] !== coords[coords.length - 1][0] || coords[0][1] !== coords[coords.length - 1][1]) {
        coords.push(coords[0])
      }

      const polygon = turf.polygon([coords])

      // Calculate area in square meters using Turf.js (geodesic calculation)
      const areaInSquareMeters = turf.area(polygon)

      // Convert to hectares: 1 hectare = 10,000 m²
      const hectares = areaInSquareMeters / 10000



      return hectares
    } catch (error) {
      console.error('Error calculating area with Turf.js:', error)
      // Fallback to shoelace calculation
      return calculateShoelaceArea(coordinates) / 10000
    }
  }

  // Fallback shoelace calculation for approximate area in square meters
  const calculateShoelaceArea = (coordinates: [number, number][]): number => {
    let area = 0
    for (let i = 0; i < coordinates.length - 1; i++) {
      area += coordinates[i][0] * coordinates[i + 1][1]
      area -= coordinates[i + 1][0] * coordinates[i][1]
    }
    area = Math.abs(area) / 2

    // Convert decimal degrees to square meters (approximate)
    // For Mauritius latitude (~-20°), this is a reasonable approximation
    const avgLat = coordinates.reduce((sum, coord) => sum + coord[1], 0) / coordinates.length
    const latRadians = avgLat * Math.PI / 180

    // Conversion: 1 degree ≈ 111,320 meters at equator, adjusted for latitude
    const metersPerDegree = 111320 * Math.cos(latRadians)
    const areaInSquareMeters = area * metersPerDegree * metersPerDegree

    console.log('🧮 Shoelace fallback calculation:', {
      rawArea: area,
      avgLat,
      metersPerDegree,
      areaInSquareMeters
    })

    return areaInSquareMeters
  }

  const calculateRealTimeStats = (points: L.LatLng[]) => {
    if (points.length < 3) {
      setDrawingStats(null)
      return
    }

    // Calculate area
    const coordinates = points.map(p => [p.lng, p.lat] as [number, number])
    coordinates.push(coordinates[0]) // Close the polygon
    const area = calculateArea(coordinates)

    // Calculate true average width and length
    const { avgWidth, avgLength } = calculateAverageWidthLength(points)

    setDrawingStats({
      width: Math.round(avgWidth),
      height: Math.round(avgLength),
      area: Math.round(area * 100) / 100
    })
  }

  // Calculate polygon dimensions (width, length, area) for completed shapes
  const calculatePolygonDimensions = (points: L.LatLng[]) => {
    if (points.length < 3) return { width: 0, length: 0, area: 0 }

    // Calculate area first
    const coordinates = points.map(p => [p.lng, p.lat] as [number, number])
    coordinates.push(coordinates[0]) // Close the polygon
    const area = calculateArea(coordinates)

    // Calculate average width and length using polygon geometry
    const { avgWidth, avgLength } = calculateAverageWidthLength(points)

    return {
      width: Math.round(avgWidth),
      length: Math.round(avgLength),
      area: Math.round(area * 100) / 100
    }
  }

  // Calculate true average width and length of polygon using geometric analysis
  const calculateAverageWidthLength = (points: L.LatLng[]) => {
    if (points.length < 3) return { avgWidth: 0, avgLength: 0 }

    // Find the polygon's oriented bounding box (minimum area rectangle)
    const coords = points.map(p => ({ x: p.lng, y: p.lat }))

    // Calculate all edge vectors and their lengths
    const edges: { vector: { x: number, y: number }, length: number }[] = []

    for (let i = 0; i < coords.length; i++) {
      const current = coords[i]
      const next = coords[(i + 1) % coords.length]

      const vector = { x: next.x - current.x, y: next.y - current.y }
      const length = Math.sqrt(vector.x * vector.x + vector.y * vector.y) * 111320 // Convert to meters

      edges.push({ vector, length })
    }

    // Group edges by similar direction (within 45 degrees)
    const edgeGroups: { lengths: number[], avgAngle: number }[] = []

    for (const edge of edges) {
      const angle = Math.atan2(edge.vector.y, edge.vector.x)

      // Find existing group with similar angle
      let foundGroup = false
      for (const group of edgeGroups) {
        const angleDiff = Math.abs(angle - group.avgAngle)
        const normalizedDiff = Math.min(angleDiff, Math.abs(angleDiff - Math.PI), Math.abs(angleDiff + Math.PI))

        if (normalizedDiff < Math.PI / 4) { // Within 45 degrees
          group.lengths.push(edge.length)
          foundGroup = true
          break
        }
      }

      if (!foundGroup) {
        edgeGroups.push({ lengths: [edge.length], avgAngle: angle })
      }
    }

    // Calculate average length for each direction group
    const groupAverages = edgeGroups.map(group => {
      const avgLength = group.lengths.reduce((sum, len) => sum + len, 0) / group.lengths.length
      return { avgLength, angle: group.avgAngle }
    })

    // Sort by average length to get primary dimensions
    groupAverages.sort((a, b) => b.avgLength - a.avgLength)

    // Take the two primary dimensions as width and length
    const avgWidth = groupAverages[0]?.avgLength || 0
    const avgLength = groupAverages[1]?.avgLength || avgWidth

    return { avgWidth, avgLength }
  }

  // Field overlap logic removed - blocs no longer need field association

  // This component doesn't render anything visible
  return (
    <>
      {/* Real-time drawing stats */}
      {drawingStats && (
        <div className="absolute top-20 right-4 bg-white rounded-lg shadow-lg z-[1000] p-3 border">
          <div className="text-sm font-semibold text-gray-700 mb-2">Drawing Stats</div>
          <div className="space-y-1 text-xs">
            <div>Width: <span className="font-mono">{drawingStats.width}m</span></div>
            <div>Height: <span className="font-mono">{drawingStats.height}m</span></div>
            <div>Area: <span className="font-mono text-blue-600">{drawingStats.area} ha</span></div>
          </div>
        </div>
      )}


    </>
  )
}
