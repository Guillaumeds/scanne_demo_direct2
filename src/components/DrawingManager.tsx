'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
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
  const previewLineRef = useRef<L.Polyline | null>(null)

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
      return { color: '#2563eb', fillColor: '#2563eb', weight: 4, fillOpacity: 0 } // No fill when selected
    }
    // Only show hover effect if not selected
    if (isHovered && !isSelected) {
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
    // Initializing drawing layers
    layerMapRef.current.clear()

    // Add drawn layers group to map
    const drawnLayers = drawnLayersRef.current
    map.addLayer(drawnLayers)

    // Make field polygons non-interactive after map loads
    setTimeout(() => {
      makeFieldPolygonsNonInteractive()
    }, 1000) // Wait for field polygons to load

    // Periodic check to ensure field polygons remain non-interactive
    const fieldPolygonInterval = setInterval(() => {
      makeFieldPolygonsNonInteractive()
    }, 5000) // Check every 5 seconds

    // Add zoom event listener to update field label sizes
    const handleZoomEnd = () => {
      updateFieldLabelSizes()
    }

    map.on('zoomend', handleZoomEnd)

    return () => {
      if (map) {
        map.removeLayer(drawnLayers)
        map.off('zoomend', handleZoomEnd)
      }
      clearInterval(fieldPolygonInterval)
    }
  }, [map])

  // Function to make field polygons non-interactive
  const makeFieldPolygonsNonInteractive = () => {
    if (!map) return

    // Find all field polygons in the DOM and make them non-interactive
    const mapContainer = map.getContainer()
    const fieldPolygons = mapContainer.querySelectorAll('.leaflet-interactive[stroke="#64748b"], .leaflet-interactive[fill="#64748b"], .leaflet-interactive[fill-opacity="0.1"]')

    fieldPolygons.forEach((polygon: Element) => {
      const svgElement = polygon as SVGElement
      // Remove interactive class and add non-interactive styling
      svgElement.classList.remove('leaflet-interactive')
      svgElement.style.pointerEvents = 'none'

      // Apply field styling with slate palette
      svgElement.setAttribute('fill', '#475569') // Slate-600
      svgElement.setAttribute('fill-opacity', '0.4') // Less transparent
      svgElement.setAttribute('stroke', '#334155') // Slate-700
      svgElement.setAttribute('stroke-width', '3')
      svgElement.setAttribute('stroke-opacity', '1')
    })

    // Update field label sizes based on zoom level
    updateFieldLabelSizes()
  }

  // Function to update field label sizes based on zoom level and polygon size
  const updateFieldLabelSizes = () => {
    if (!map) return

    const currentZoom = map.getZoom()
    const mapContainer = map.getContainer()

    // Find all field labels (Leaflet marker icons)
    const fieldLabels = mapContainer.querySelectorAll('.leaflet-marker-icon')



    fieldLabels.forEach((label: Element) => {
      const labelElement = label as HTMLElement

      // Calculate responsive font size based on zoom level
      // Base font size scales with zoom: 8px at zoom 10, up to 16px at zoom 18
      const baseFontSize = Math.max(6, Math.min(18, (currentZoom - 8) * 1.5 + 8))

      // Apply the calculated font size
      labelElement.style.fontSize = `${baseFontSize}px`

      // Also apply to child elements
      const childElements = labelElement.querySelectorAll('div, span')
      childElements.forEach((child: Element) => {
        const childElement = child as HTMLElement
        childElement.style.fontSize = `${baseFontSize}px`
        // Remove any white backgrounds from child elements
        childElement.style.background = 'transparent'
        childElement.style.backgroundColor = 'transparent'
        childElement.style.border = 'none'
        childElement.style.boxShadow = 'none'
      })
    })
  }

  // MOVED: Tool activation useEffect moved after event handlers to fix hoisting

  // MOVED: Robust helper functions moved after event handlers to fix hoisting

  // ROBUST LAYER MANAGEMENT: Smart polygon update logic
  const updatePolygonsRobustly = useCallback(() => {
    const existingKeys = new Set(Array.from(layerMapRef.current.keys()))
    const currentKeys = new Set([
      ...savedAreas.map(area => DrawnAreaUtils.getEntityKey(area)),
      ...drawnAreas.map(area => DrawnAreaUtils.getEntityKey(area))
    ])
    const sizeDifference = Math.abs((savedAreas.length + drawnAreas.length) - layerMapRef.current.size)

    // Analyzing polygon state

    // SMART DECISION TREE for most robust handling
    if (layerMapRef.current.size === 0 && (savedAreas.length > 0 || drawnAreas.length > 0)) {
      // First load: full creation
      createAllPolygonsRobustly()
    } else if (sizeDifference <= 3 && sizeDifference > 0) {
      // Small changes: incremental update (most common case)
      updateIncrementallyRobustly(existingKeys, currentKeys)
    } else if (sizeDifference > 10) {
      // Major changes: full recreation with validation
      recreateWithValidationRobustly()
    } else if (sizeDifference === 0) {
      // No size change: validate consistency
      validateConsistencyRobustly(existingKeys, currentKeys)
    } else {
      // Edge cases: validate and decide
      validateAndDecideRobustly(existingKeys, currentKeys)
    }
  }, [savedAreas, drawnAreas])

  // ROBUST CLICK HANDLERS: Set up click events efficiently
  const setupClickHandlersRobustly = useCallback(() => {
    const totalAreas = drawnAreas.length + savedAreas.length
    if (totalAreas > 0) {
      // Setting up click handlers
      // Click handlers are set up during polygon creation
    }
  }, [drawnAreas.length, savedAreas.length])

  // ROBUST HIGHLIGHTING: Apply selection/hover states efficiently
  const applyHighlightingRobustly = useCallback(() => {
    let highlightedCount = 0
    layerMapRef.current.forEach((layer, areaId) => {
      const isSelected = selectedAreaId === areaId
      const isHovered = hoveredAreaId === areaId

      // Get the area object for proper styling
      const area = [...savedAreas, ...drawnAreas].find(a => DrawnAreaUtils.getEntityKey(a) === areaId)

      if (area) {
        const styling = getPolygonColor(area, isSelected, isHovered)
        layer.setStyle({
          color: styling.color,
          fillColor: styling.fillColor,
          weight: styling.weight,
          fillOpacity: styling.fillOpacity
        })

        if (isSelected || isHovered) {
          highlightedCount++
        }
      }
    })

    if (highlightedCount > 0) {
      // Applied highlighting
    }
  }, [selectedAreaId, hoveredAreaId, savedAreas, drawnAreas, getPolygonColor])

  // EVENT HANDLERS: All map interaction handlers (moved before useEffects to fix hoisting)

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
      // Red polygon indication is sufficient - no need for big red circle
      return // Don't add the point
    }

    // Show snap indicator if point was snapped
    const wasSnapped = snappedPoint.lat !== e.latlng.lat || snappedPoint.lng !== e.latlng.lng
    if (wasSnapped) {
      showSnapIndicator(snappedPoint)
    }

    drawingPointsRef.current.push(snappedPoint)
    // Point added to drawing

    // Update drawing progress
    onDrawingProgress?.(drawingPointsRef.current.length, true)

    // Calculate real-time stats
    calculateRealTimeStats(drawingPointsRef.current)

    // Create or update the polygon
    if (drawingPointsRef.current.length >= 2) {
      // Creating/updating polygon
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
      // Polygon updated on map
    }
  }

  const handleDoubleClick = (e: L.LeafletMouseEvent) => {
    if (!isDrawingRef.current || activeTool !== 'polygon') return
    e.originalEvent?.preventDefault()
    finishPolygonDrawing()
  }

  const handleRightClick = (e: L.LeafletMouseEvent) => {
    if (!isDrawingRef.current || activeTool !== 'polygon') return

    // Right-click detected - finishing polygon
    e.originalEvent.preventDefault()
    finishPolygonDrawing()
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    if (!isDrawingRef.current) return

    if (e.key === 'Escape') {
      e.preventDefault()
      cancelDrawing()
    } else if (e.key === 'Enter') {
      e.preventDefault()
      finishPolygonDrawing()
    } else if (e.key === 'Backspace' || e.key === 'Delete') {
      e.preventDefault()
      removeLastPoint()
    }
  }

  const handleMapMouseMove = (e: L.LeafletMouseEvent) => {
    if (!isDrawingRef.current || activeTool !== 'polygon') return

    // Update preview line and polygon if we have at least one point
    if (drawingPointsRef.current.length > 0) {
      const lastPoint = drawingPointsRef.current[drawingPointsRef.current.length - 1]
      const currentPoint = findNearestFieldPoint(e.latlng)

      // Remove existing preview line
      if (previewLineRef.current) {
        map?.removeLayer(previewLineRef.current)
      }

      // Check if the cursor point would cause overlap
      const pointOverlap = checkOverlapWithSavedAreas(currentPoint)

      // Create preview line with color based on overlap
      const lineColor = pointOverlap.isOverlap ? '#dc2626' : '#3b82f6'  // Red if overlap, blue if valid
      previewLineRef.current = L.polyline([lastPoint, currentPoint], {
        color: lineColor,
        weight: 2,
        dashArray: '5, 5',
        opacity: 0.7
      })

      map?.addLayer(previewLineRef.current)

      // Update the drawing polygon with overlap indication if we have enough points
      if (drawingPointsRef.current.length >= 2) {
        const previewPoints = [...drawingPointsRef.current, currentPoint]

        // Remove current drawing polygon
        if (currentDrawingRef.current) {
          map?.removeLayer(currentDrawingRef.current)
        }

        // Check if the preview polygon would overlap
        let polygonOverlap = false
        if (previewPoints.length >= 3) {
          const tempPolygon = L.polygon(previewPoints)
          const overlapResult = checkPolygonOverlapWithExistingBlocs(tempPolygon)
          polygonOverlap = overlapResult.isOverlap
        }

        // Use red if point overlap OR polygon overlap
        const hasOverlap = pointOverlap.isOverlap || polygonOverlap
        const polygonColor = hasOverlap ? '#dc2626' : '#3b82f6'  // Red for invalid, blue for valid
        const fillColor = hasOverlap ? '#fca5a5' : '#3b82f6'     // Light red fill for invalid

        // Create preview polygon
        currentDrawingRef.current = L.polygon(previewPoints, {
          color: polygonColor,
          fillColor: fillColor,
          fillOpacity: 0.3,
          weight: 2,
          dashArray: '5, 5'
        })

        map?.addLayer(currentDrawingRef.current)
      }
    }
  }

  // DRAWING UTILITY FUNCTIONS
  const removeLastPoint = () => {
    if (drawingPointsRef.current.length > 0) {
      drawingPointsRef.current.pop()

      // Update the polygon if we still have enough points
      if (drawingPointsRef.current.length >= 2) {
        if (currentDrawingRef.current) {
          map?.removeLayer(currentDrawingRef.current)
        }

        currentDrawingRef.current = L.polygon(drawingPointsRef.current, {
          color: '#3b82f6',
          fillColor: '#3b82f6',
          fillOpacity: 0.3,
          weight: 2,
          dashArray: '5, 5'
        })

        map?.addLayer(currentDrawingRef.current)
      } else if (drawingPointsRef.current.length < 2 && currentDrawingRef.current) {
        // Remove polygon if less than 2 points
        map?.removeLayer(currentDrawingRef.current)
        currentDrawingRef.current = null
      }

      // Update drawing progress
      onDrawingProgress?.(drawingPointsRef.current.length, true)

      // Calculate real-time stats
      calculateRealTimeStats(drawingPointsRef.current)
    }
  }

  // ROBUST HELPER FUNCTIONS for layer management (moved after event handlers)
  const createAllPolygonsRobustly = () => {
    // Creating all polygons from scratch

    // Clean up vertex markers before clearing layers
    drawnLayersRef.current.eachLayer((layer) => {
      if (layer instanceof L.Polygon) {
        removeVertexMarkers(layer)
      }
    })

    drawnLayersRef.current.clearLayers()
    layerMapRef.current.clear()

    const allAreas = [...savedAreas, ...drawnAreas]
    allAreas.forEach(area => {
      try {
        // Determine if this is a saved area or drawn area
        const areaKey = DrawnAreaUtils.getEntityKey(area)
        const isSaved = savedAreas.some(saved => DrawnAreaUtils.getEntityKey(saved) === areaKey)
        const isDrawn = drawnAreas.some(drawn => DrawnAreaUtils.getEntityKey(drawn) === areaKey)

        // Use proper colors: green for saved, blue for drawn
        const color = isSaved ? '#22c55e' : '#3b82f6'  // Green for saved, blue for drawn
        const fillColor = isSaved ? '#22c55e' : '#3b82f6'

        // Applied color styling

        // Our coordinates are [lng, lat], but Leaflet expects [lat, lng]
        const leafletCoords = area.coordinates.map(([lng, lat]) => [lat, lng] as [number, number])

        const polygon = L.polygon(leafletCoords, {
          color,
          fillColor,
          fillOpacity: 0.3,
          weight: 2
        })

        drawnLayersRef.current.addLayer(polygon)
        layerMapRef.current.set(DrawnAreaUtils.getEntityKey(area), polygon)

        // Add click handler
        polygon.on('click', (e) => {
          if (e.originalEvent) {
            e.originalEvent.stopPropagation()
            e.originalEvent.preventDefault()
          }
          L.DomEvent.stopPropagation(e)
          onPolygonClick?.(DrawnAreaUtils.getEntityKey(area))
        })
      } catch (error) {
        console.error('Failed to create polygon for area:', area.localId, error)
      }
    })
  }

  const updateIncrementallyRobustly = (existingKeys: Set<string>, currentKeys: Set<string>) => {
    // Add new polygons
    const toAdd = [...savedAreas, ...drawnAreas].filter(area =>
      !existingKeys.has(DrawnAreaUtils.getEntityKey(area))
    )

    // Remove deleted polygons
    const toRemove = Array.from(existingKeys).filter(key => !currentKeys.has(key))



    // Remove deleted polygons
    toRemove.forEach(key => {
      const layer = layerMapRef.current.get(key)
      if (layer) {
        // Clean up vertex markers before removing the polygon
        if (layer instanceof L.Polygon) {
          removeVertexMarkers(layer)
        }
        drawnLayersRef.current.removeLayer(layer)
        layerMapRef.current.delete(key)
      }
    })

    // Update existing polygons that might have changed status (drawn -> saved)
    const allAreas = [...savedAreas, ...drawnAreas]
    allAreas.forEach(area => {
      const areaKey = DrawnAreaUtils.getEntityKey(area)
      let existingLayer = layerMapRef.current.get(areaKey)

      // If layer not found under UUID key, try localId key (for newly saved areas)
      if (!existingLayer && area.localId) {
        existingLayer = layerMapRef.current.get(area.localId)

        // If found under localId, remap it to the UUID key
        if (existingLayer) {
          layerMapRef.current.delete(area.localId) // Remove old key
          layerMapRef.current.set(areaKey, existingLayer) // Add under new key
        }
      }

      if (existingLayer) {
        // Update the layer styling based on current status
        const isSaved = savedAreas.some(saved => DrawnAreaUtils.getEntityKey(saved) === areaKey)
        const color = isSaved ? '#22c55e' : '#3b82f6'  // Green for saved, blue for drawn
        const fillColor = isSaved ? '#22c55e' : '#3b82f6'

        existingLayer.setStyle({
          color,
          fillColor,
          fillOpacity: 0.3,
          weight: 2
        })

        // Text labels are now removed directly in the save handler
        // Only remove vertex markers for saved areas (make them non-editable)
        if (isSaved && (existingLayer as any)._vertexMarkers) {
          ;(existingLayer as any)._vertexMarkers.forEach((marker: L.CircleMarker) => {
            if (map && map.hasLayer(marker)) {
              map.removeLayer(marker)
            }
          })
          ;(existingLayer as any)._vertexMarkers = null
        }
      }
    })

    // Add new polygons
    toAdd.forEach(area => {
      try {
        // Determine if this is a saved area or drawn area
        const areaKey = DrawnAreaUtils.getEntityKey(area)
        const isSaved = savedAreas.some(saved => DrawnAreaUtils.getEntityKey(saved) === areaKey)
        const isDrawn = drawnAreas.some(drawn => DrawnAreaUtils.getEntityKey(drawn) === areaKey)

        // Use proper colors: green for saved, blue for drawn
        const color = isSaved ? '#22c55e' : '#3b82f6'  // Green for saved, blue for drawn
        const fillColor = isSaved ? '#22c55e' : '#3b82f6'

        // Applied incremental color

        // Our coordinates are [lng, lat], but Leaflet expects [lat, lng]
        const leafletCoords = area.coordinates.map(([lng, lat]) => [lat, lng] as [number, number])

        const polygon = L.polygon(leafletCoords, {
          color,
          fillColor,
          fillOpacity: 0.3,
          weight: 2
        })

        drawnLayersRef.current.addLayer(polygon)
        layerMapRef.current.set(DrawnAreaUtils.getEntityKey(area), polygon)

        polygon.on('click', (e) => {
          if (e.originalEvent) {
            e.originalEvent.stopPropagation()
            e.originalEvent.preventDefault()
          }
          L.DomEvent.stopPropagation(e)
          onPolygonClick?.(DrawnAreaUtils.getEntityKey(area))
        })
      } catch (error) {
        console.error('Failed to add polygon for area:', area.localId, error)
      }
    })
  }

  const recreateWithValidationRobustly = () => {
    createAllPolygonsRobustly()
  }

  const validateConsistencyRobustly = (existingKeys: Set<string>, currentKeys: Set<string>) => {
    const missingKeys = Array.from(currentKeys).filter(key => !existingKeys.has(key))
    const extraKeys = Array.from(existingKeys).filter(key => !currentKeys.has(key))

    if (missingKeys.length > 0 || extraKeys.length > 0) {
      console.log('🔄 Consistency issues found, recreating:', { missing: missingKeys.length, extra: extraKeys.length })
      createAllPolygonsRobustly()
    } else {
      // Consistency validated
    }
  }

  const validateAndDecideRobustly = (existingKeys: Set<string>, currentKeys: Set<string>) => {
    createAllPolygonsRobustly()
  }

  // TOOL ACTIVATION: Handle tool activation with custom drawing (moved after handlers)
  useEffect(() => {
    if (!map) return

    // Clean up previous drawing and preview lines
    if (currentDrawingRef.current) {
      map.removeLayer(currentDrawingRef.current)
      currentDrawingRef.current = null
    }

    // Clean up preview line
    if (previewLineRef.current) {
      map.removeLayer(previewLineRef.current)
      previewLineRef.current = null
      console.log('🧹 TOOL CHANGE: Removed preview line')
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

      // Clear drawing stats and total area when switching away from drawing tool
      setDrawingStats(null)
      setTotalDrawnArea(0)
      setCurrentCropCycleId('')

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

        // Clean up preview line on unmount
        if (previewLineRef.current) {
          map.removeLayer(previewLineRef.current)
          previewLineRef.current = null
          console.log('🧹 UNMOUNT: Removed preview line')
        }

        map.getContainer().style.cursor = ''
        map.getContainer().removeAttribute('tabindex')
        map.doubleClickZoom.enable()
      }
    }
  }, [activeTool, map])

  // CONSOLIDATED: Main map operations effect - handles rendering, click handlers, and highlighting
  useEffect(() => {
    if (!map) {
      return
    }

    // STEP 1: Handle polygon rendering with smart layer management
    updatePolygonsRobustly()

    // STEP 2: Set up click handlers for all polygons
    setupClickHandlersRobustly()

    // STEP 3: Apply highlighting to selected/hovered areas
    applyHighlightingRobustly()

    // All map operations completed
  }, [map, updatePolygonsRobustly, setupClickHandlersRobustly, applyHighlightingRobustly])

  // OPTIMIZED: Clear totals when areas are saved (text labels now removed in save handler)
  useEffect(() => {
    if (savedAreas.length > lastSavedAreasCount) {
      // Clearing drawing totals after save
      setTotalDrawnArea(0)
      setCurrentCropCycleId('')
    }
    setLastSavedAreasCount(savedAreas.length)
  }, [savedAreas.length, lastSavedAreasCount, map])

  // Text labels are now removed directly in the save handler - no complex cleanup needed

  // REMOVED: Click handlers now handled in consolidated effect

  // REMOVED: Area deletion now handled in consolidated effect

  // REMOVED: Highlighting now handled in consolidated effect

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

  // Function removed - red polygon indication is sufficient for overlap feedback

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
          return { isOverlap: true, reason: 'Cannot draw inside existing blocs' }
        } else {
          console.log('✅ Point touching boundary of drawn bloc - allowed')
        }
      }
    }

    // Check if the line from last point to this point crosses any existing polygon
    if (drawingPointsRef.current.length > 0) {
      const lastPoint = drawingPointsRef.current[drawingPointsRef.current.length - 1]
      const lineOverlap = checkLineCrossesPolygons(lastPoint, point)
      if (lineOverlap.isOverlap) {
        return lineOverlap
      }
    }

    // Field boundary check removed - allow drawing anywhere

    return { isOverlap: false, reason: '' }
  }

  // Check if a line crosses into any existing polygon areas
  const checkLineCrossesPolygons = (startPoint: L.LatLng, endPoint: L.LatLng): { isOverlap: boolean; reason: string } => {
    // Check against saved areas
    for (const savedArea of savedAreas) {
      const savedLayer = layerMapRef.current.get(DrawnAreaUtils.getEntityKey(savedArea))
      if (savedLayer) {
        const latlngs = savedLayer.getLatLngs()[0] as L.LatLng[]
        if (lineIntersectsPolygon(startPoint, endPoint, latlngs)) {
          return { isOverlap: true, reason: 'Line crosses saved bloc' }
        }
      }
    }

    // Check against drawn areas
    for (const drawnArea of drawnAreas) {
      const drawnLayer = layerMapRef.current.get(DrawnAreaUtils.getEntityKey(drawnArea))
      if (drawnLayer) {
        const latlngs = drawnLayer.getLatLngs()[0] as L.LatLng[]
        if (lineIntersectsPolygon(startPoint, endPoint, latlngs)) {
          return { isOverlap: true, reason: 'Line crosses drawn bloc' }
        }
      }
    }

    return { isOverlap: false, reason: '' }
  }

  // Check if a line intersects with a polygon (crosses into the area)
  const lineIntersectsPolygon = (lineStart: L.LatLng, lineEnd: L.LatLng, polygon: L.LatLng[]): boolean => {
    // Check if line intersects any edge of the polygon
    for (let i = 0; i < polygon.length; i++) {
      const j = (i + 1) % polygon.length
      if (lineSegmentsIntersect(lineStart, lineEnd, polygon[i], polygon[j])) {
        return true
      }
    }

    // Check if line passes through the polygon interior
    const midPoint = L.latLng(
      (lineStart.lat + lineEnd.lat) / 2,
      (lineStart.lng + lineEnd.lng) / 2
    )
    if (isPointStrictlyInsidePolygon(midPoint, polygon)) {
      return true
    }

    return false
  }

  // Check if a polygon overlaps with existing blocs (more comprehensive than point check)
  const checkPolygonOverlapWithExistingBlocs = (polygon: L.Polygon): { isOverlap: boolean; reason: string } => {
    const polygonLatLngs = polygon.getLatLngs()[0] as L.LatLng[]
    const currentPolygonId = L.stamp(polygon).toString()

    // Check overlap with saved areas
    for (const savedArea of savedAreas) {
      const areaKey = DrawnAreaUtils.getEntityKey(savedArea)
      const savedLayer = layerMapRef.current.get(areaKey)
      if (savedLayer) {
        const savedLatLngs = savedLayer.getLatLngs()[0] as L.LatLng[]
        const hasOverlap = polygonsOverlap(polygonLatLngs, savedLatLngs)

        if (hasOverlap) {
          return { isOverlap: true, reason: 'New bloc overlaps with saved bloc' }
        }
      }
    }

    // Check overlap with drawn areas (excluding current drawing)
    for (const drawnArea of drawnAreas) {
      const areaKey = DrawnAreaUtils.getEntityKey(drawnArea)
      const drawnLayer = layerMapRef.current.get(areaKey)
      if (drawnLayer && areaKey !== currentPolygonId) {
        const drawnLatLngs = drawnLayer.getLatLngs()[0] as L.LatLng[]
        const hasOverlap = polygonsOverlap(polygonLatLngs, drawnLatLngs)

        if (hasOverlap) {
          return { isOverlap: true, reason: 'New bloc overlaps with existing bloc' }
        }
      }
    }
    return { isOverlap: false, reason: '' }
  }

  // Helper function to check if two polygons have AREA overlap (not just touching)
  const polygonsOverlap = (poly1: L.LatLng[], poly2: L.LatLng[]): boolean => {

    // Only check if vertices are INSIDE the other polygon (not on edges)
    // This allows touching/sharing edges but blocks area coverage

    let hasAreaOverlap = false

    // Check if any vertex of poly1 is INSIDE poly2 (not just on boundary)
    for (let i = 0; i < poly1.length; i++) {
      const isInside = isPointStrictlyInsidePolygon(poly1[i], poly2)
      if (isInside) {
        hasAreaOverlap = true
        break
      }
    }

    // Check if any vertex of poly2 is INSIDE poly1 (not just on boundary)
    if (!hasAreaOverlap) {
      for (let i = 0; i < poly2.length; i++) {
        const isInside = isPointStrictlyInsidePolygon(poly2[i], poly1)
        if (isInside) {
          hasAreaOverlap = true
          break
        }
      }
    }

    // Additional check: if one polygon completely contains the other
    if (!hasAreaOverlap) {


      // Check if poly1 completely contains poly2
      let allPoly2InsidePoly1 = true
      for (const point of poly2) {
        if (!isPointStrictlyInsidePolygon(point, poly1)) {
          allPoly2InsidePoly1 = false
          break
        }
      }
      if (allPoly2InsidePoly1 && poly2.length > 0) {

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

          hasAreaOverlap = true
        }
      }

      // Additional check: Use a more robust intersection test
      // Sample points within each polygon and check if they're in the other
      if (!hasAreaOverlap) {

        const samplePoints1 = generatePolygonSamplePoints(poly1, 10)
        const samplePoints2 = generatePolygonSamplePoints(poly2, 10)

        // Check if any sample points from poly1 are inside poly2
        for (const point of samplePoints1) {
          if (isPointStrictlyInsidePolygon(point, poly2)) {

            hasAreaOverlap = true
            break
          }
        }

        // Check if any sample points from poly2 are inside poly1
        if (!hasAreaOverlap) {
          for (const point of samplePoints2) {
            if (isPointStrictlyInsidePolygon(point, poly1)) {

              hasAreaOverlap = true
              break
            }
          }
        }
      }
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

  // REMOVED: Duplicate function definitions moved to top

  // REMOVED: More duplicate functions moved to top

  const cancelDrawing = () => {
    console.log('🧹 CANCEL: Cleaning up drawing state and preview lines')

    // Clean up current drawing polygon
    if (currentDrawingRef.current) {
      map?.removeLayer(currentDrawingRef.current)
    }
    currentDrawingRef.current = null

    // Clean up preview line
    if (previewLineRef.current) {
      map?.removeLayer(previewLineRef.current)
      previewLineRef.current = null
      console.log('🧹 CANCEL: Removed preview line')
    }

    drawingPointsRef.current = []
    isDrawingRef.current = false
    setDrawingStats(null)
    hideSnapIndicator()

    // Reset snap state
    setCurrentSnapPoint(null)
    setIsCurrentlySnapped(false)

    // Clear total area display when cancelling
    setTotalDrawnArea(0)
    setCurrentCropCycleId('')

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

  // Helper function to estimate text dimensions
  const estimateTextDimensions = (text: string, fontSize: number): { width: number, height: number } => {
    // More accurate estimation: each character is about 0.5-0.7 * fontSize wide depending on font
    // Height is fontSize * number of lines * line-height
    const lines = text.split('<br/>').length
    const longestLine = text.split('<br/>').reduce((longest, line) => {
      const cleanLine = line.replace(/<[^>]*>/g, '') // Remove HTML tags
      return cleanLine.length > longest.length ? cleanLine : longest
    }, '')

    // Use more conservative estimates - Arial/sans-serif is typically 0.5-0.6 * fontSize per character
    return {
      width: longestLine.length * fontSize * 0.5, // More conservative width estimate
      height: lines * fontSize * 1.1 // Slightly tighter line height
    }
  }

  // Helper function to check if text fits within polygon bounds
  const doesTextFitInPolygon = (polygon: L.Polygon, textWidth: number, textHeight: number): boolean => {
    const bounds = polygon.getBounds()
    const currentZoom = map!.getZoom()

    // Convert polygon bounds to pixel dimensions on screen
    const southWest = map!.latLngToContainerPoint(bounds.getSouthWest())
    const northEast = map!.latLngToContainerPoint(bounds.getNorthEast())
    const boundsWidthPixels = Math.abs(northEast.x - southWest.x)
    const boundsHeightPixels = Math.abs(southWest.y - northEast.y)

    // Be more permissive - allow text if it fits within 90% of polygon bounds
    // and ensure minimum reasonable size thresholds
    const minWidth = 60  // Minimum 60px width to show any label
    const minHeight = 20 // Minimum 20px height to show any label

    const fitsWidth = textWidth < boundsWidthPixels * 0.9 && boundsWidthPixels >= minWidth
    const fitsHeight = textHeight < boundsHeightPixels * 0.9 && boundsHeightPixels >= minHeight

    return fitsWidth && fitsHeight
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

    // Create label text
    const labelText = `${dimensions.area.toFixed(2)} ha<br/>${dimensions.width}m × ${dimensions.length}m`

    // Check if text fits within polygon
    const textDimensions = estimateTextDimensions(labelText, maxFontSize)

    // Check if text fits within polygon
    const isSmallText = maxFontSize <= 10 || textDimensions.width <= 80
    const fitsInPolygon = doesTextFitInPolygon(polygon, textDimensions.width, textDimensions.height)

    if (!isSmallText && !fitsInPolygon) {
      // Text doesn't fit, don't show the label
      return
    }

    // Ensure minimum dimensions and avoid zero/negative values
    const safeWidth = Math.max(textDimensions.width, 20)
    const safeHeight = Math.max(textDimensions.height, 16)

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
        display: flex;
        align-items: center;
        justify-content: center;
        width: ${safeWidth}px;
        height: ${safeHeight}px;
      ">${labelText}</div>`,
      className: 'area-label',
      iconSize: [safeWidth, safeHeight],
      iconAnchor: [safeWidth / 2, safeHeight / 2]
    })

    const labelMarker = L.marker(center, { icon: updatedLabel })
    labelMarker.addTo(map)
    ;(polygon as any)._areaLabel = labelMarker
  }

  // REMOVED: Duplicate handleMapMouseMove moved to top



  const finishPolygonDrawing = () => {
    // Clean up preview line immediately
    if (previewLineRef.current) {
      map?.removeLayer(previewLineRef.current)
      previewLineRef.current = null
    }

    if (!currentDrawingRef.current || drawingPointsRef.current.length < 3) {
      // Cancel drawing if not enough points
      if (currentDrawingRef.current) {
        map?.removeLayer(currentDrawingRef.current)
      }
      onDrawingEnd()
      return
    }

    // Check if the completed polygon overlaps with existing blocs
    const tempPolygon = L.polygon(drawingPointsRef.current)
    const polygonOverlap = checkPolygonOverlapWithExistingBlocs(tempPolygon)

    if (polygonOverlap.isOverlap) {
      // Red polygon indication is sufficient - no need for big red circle
      // const centerPoint = calculatePolygonCentroid(drawingPointsRef.current)
      // showOverlapIndicator(centerPoint, polygonOverlap.reason)

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

    // Create drawn area object FIRST to get proper ID
    const coordinates = drawingPointsRef.current.map(latlng => [latlng.lng, latlng.lat] as [number, number])
    const area = calculateArea(coordinates)
    const drawnArea = DrawnAreaUtils.createNew(coordinates, area, 'polygon')

    // Get proper entity key for layer map
    const areaKey = DrawnAreaUtils.getEntityKey(drawnArea)

    // Store in layer map with proper key and set identifier on polygon
    try {
      layerMapRef.current.set(areaKey, finalPolygon)
      // Set localId on polygon for easy identification during cleanup
      ;(finalPolygon as any)._localId = drawnArea.localId
    } catch (error) {
      console.error('❌ Failed to store polygon in layer map:', error)
      throw new Error(`Failed to store polygon in layer map: ${error}`)
    }

    // Add vertex markers for editing
    addVertexMarkers(finalPolygon)

    // Make polygon clickable for highlighting (not info modal)
    finalPolygon.on('click', (e) => {
      // Stop event propagation more aggressively
      if (e.originalEvent) {
        e.originalEvent.stopPropagation()
        e.originalEvent.preventDefault()
        e.originalEvent.stopImmediatePropagation()
      }
      L.DomEvent.stopPropagation(e)
      console.log('🖱️ Polygon clicked:', areaKey)
      onPolygonClick?.(areaKey)
    })

    // Generate crop cycle ID if not set
    if (!currentCropCycleId) {
      const now = new Date()
      const cycleId = `CC${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}_${Math.random().toString(36).slice(2, 6).toUpperCase()}`
      setCurrentCropCycleId(cycleId)
    }

    // Update total drawn area
    setTotalDrawnArea(prev => prev + area)

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

    // Create label text
    const labelText = `${dimensions.area.toFixed(2)} ha<br/>${dimensions.width}m × ${dimensions.length}m`

    // Check if text fits within polygon
    const textDimensions = estimateTextDimensions(labelText, maxFontSize)

    // Check if text fits within polygon
    const isSmallText = maxFontSize <= 10 || textDimensions.width <= 80

    if (!isSmallText && !doesTextFitInPolygon(finalPolygon, textDimensions.width, textDimensions.height)) {
      // Text doesn't fit, don't show the label
      ;(finalPolygon as any)._areaLabel = null
      ;(finalPolygon as any)._cropCycleId = currentCropCycleId
    } else {
      // Ensure minimum dimensions and avoid zero/negative values
      const safeWidth = Math.max(textDimensions.width, 20)
      const safeHeight = Math.max(textDimensions.height, 16)

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
          display: flex;
          align-items: center;
          justify-content: center;
          width: ${safeWidth}px;
          height: ${safeHeight}px;
        ">${labelText}</div>`,
        className: 'area-label',
        iconSize: [safeWidth, safeHeight],
        iconAnchor: [safeWidth / 2, safeHeight / 2]
      })

      const labelMarker = L.marker(center, { icon: areaLabel })
      if (map) {
        labelMarker.addTo(map)
        // Store label reference on polygon for cleanup and updates
        ;(finalPolygon as any)._areaLabel = labelMarker
        ;(finalPolygon as any)._cropCycleId = currentCropCycleId
      }
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
        // Revert the change - red polygon indication is sufficient
        latlngs[vertexIndex] = originalPoint
        // showOverlapIndicator(snappedPoint, polygonOverlap.reason)

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
        // Remove the polygon entirely - no need for red circle indicator
        console.log('🗑️ Removed overlapping polygon after vertex edit')

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
