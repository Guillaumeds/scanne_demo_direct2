'use client'

import { useState, useEffect, useRef } from 'react'
import L from 'leaflet'
import MapComponent from './MapComponent'
import BlocList from './BlocList'
import DrawingToolbar from './DrawingToolbar'
import DrawnAreasList from './DrawnAreasList'
import PolygonInfoModal from './PolygonInfoModal'

import { BlocScreen } from './farm/BlocScreen'
import FloatingInfoBox from './FloatingInfoBox'
import { DrawnArea, DrawnAreaUtils } from '@/types/drawnArea'
import { LocalStorageService } from '@/services/localStorageService'
import { useFarmGISData } from '@/hooks/useDemoData'
import { GlobalLoadingIndicator } from '@/components/global/GlobalLoadingIndicator'
import { GlobalErrorHandler } from '@/components/global/GlobalErrorHandler'
import { CacheManagementDashboard } from '@/components/dev/CacheManagementDashboard'
import { FIELDS } from '@/data/master/fields'

export default function FarmGISLayout() {
  // Field functionality removed - blocs are the primary entities
  // const [selectedField, setSelectedField] = useState<string | null>(null)
  // const [hoveredField, setHoveredField] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTool, setActiveTool] = useState<string | null>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [drawnAreas, setDrawnAreas] = useState<DrawnArea[]>([])
  const [savedAreas, setSavedAreas] = useState<DrawnArea[]>([])
  const [selectedPolygon, setSelectedPolygon] = useState<DrawnArea | null>(null)
  const [selectedAreaId, setSelectedAreaId] = useState<string | null>(null)
  const [hoveredAreaId, setHoveredAreaId] = useState<string | null>(null)
  const [scrollToBlocId, setScrollToBlocId] = useState<string | null>(null)
  const [showDataScreen, setShowDataScreen] = useState(false)
  const [dataScreenBloc, setDataScreenBloc] = useState<DrawnArea | null>(null)
  const [defaultFarmId, setDefaultFarmId] = useState<string | null>(null)
  const [mapDimmed, setMapDimmed] = useState(false)
  const [mapInstance, setMapInstance] = useState<L.Map | null>(null)
  const [farms, setFarms] = useState<any[]>([])
  const [companies, setCompanies] = useState<any[]>([])

  // Field polygons and labels
  const [fieldPolygons, setFieldPolygons] = useState<L.Polygon[]>([])
  const [fieldLabels, setFieldLabels] = useState<L.Marker[]>([])
  const [currentZoom, setCurrentZoom] = useState<number>(10)

  // Use modern farm data hook instead of manual loading
  const {
    data: farmData,
    isLoading: farmDataLoading,
    error: farmDataError
  } = useFarmGISData()


  // Debug savedAreas changes
  useEffect(() => {
    // savedAreas updated
  }, [savedAreas])

  // Manage map dimming when data screen is shown/hidden
  useEffect(() => {
    if (showDataScreen) {
      // Ensure dimming is applied when data screen is shown
      applyMapDimming(true)
    } else {
      // Remove dimming when data screen is hidden
      applyMapDimming(false)
    }
  }, [showDataScreen])

  // Cleanup: Remove dimming effect when component unmounts
  useEffect(() => {
    return () => {
      applyMapDimming(false)
    }
  }, [])

  // Only zoom to farm view when explicitly requested (not on deselection)
  // Removed auto-zoom on deselection for better UX

  // Initial zoom to farm view when map and blocs are ready
  useEffect(() => {
    if (mapInstance && savedAreas.length > 0 && !showDataScreen) {
      // Only zoom if not in data screen mode
      console.log('🔍 Initial zoom to farm view with', savedAreas.length, 'blocs')
      zoomToFarmViewInitial(mapInstance)
    }
  }, [mapInstance, savedAreas.length, showDataScreen]) // Include showDataScreen to prevent zoom during bloc info

  // Auto-refresh cache and initialize
  useEffect(() => {
    const initializeApp = async () => {
      try {
        setLoading(true)

        // Auto-refresh localStorage cache if stale
        await LocalStorageService.autoRefreshIfStale()

        // FIELD CREATION/LOADING DISABLED FOR DEMO
        // const loadFields = async () => {
        //   try {
        //     console.log('🔄 Starting to load field data...')

        //     // Check if database has fields, otherwise fall back to GeoJSON
        //     const hasDbFields = await hasFieldsInDatabase()

        //     let fieldData
        //     if (hasDbFields) {
        //       console.log('📊 Loading fields from database...')
        //       fieldData = await loadBelleVueFields()
        //     } else {
        //       console.log('📊 No fields in database, loading from GeoJSON...')
        //       fieldData = await loadFieldData()
        //     }

        //     console.log('✅ Loaded fields:', fieldData.length, 'fields')
        //     console.log('📊 First field sample:', fieldData[0])
        //     console.log('📊 Field data structure:', {
        //       totalFields: fieldData.length,
        //       hasCoordinates: fieldData.filter(f => f.coordinates && f.coordinates.length > 0).length,
        //       sampleCoords: fieldData[0]?.coordinates?.slice(0, 3)
        //     })
        //     setFields(fieldData)
        //   } catch (error) {
        //     console.error('❌ Failed to load field data:', error)
        //     setError('Failed to load field data. Please check your database connection.')
        //   }
        // }

        // await loadFields()

        // Set empty fields array for demo
        // Field loading disabled
        // Field functionality removed - blocs are the primary entities

      } catch (error) {
        console.error('❌ Failed to initialize app:', error)
        setError('Failed to initialize application. Please refresh the page.')
      } finally {
        setLoading(false)
      }
    }

    initializeApp()
  }, [])

  // Expose refresh function globally for demo purposes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).refreshDemoData = async () => {
        const { MockApiService } = await import('@/services/mockApiService')
        await MockApiService.refreshWithNewData()
        window.location.reload()
      }
    }
  }, [])

  // Update state when farm data loads
  useEffect(() => {
    if (farmData) {
      try {
        // Validate data integrity
        if (!farmData.farms || farmData.farms.length === 0) {
          throw new Error('No farms found - database setup required')
        }

        // Store farm data for bloc creation
        const defaultFarm = farmData.farms[0]
        setDefaultFarmId(defaultFarm.id)
        setFarms(farmData.farms)
        setCompanies(farmData.companies)

        if (!farmData.blocs || farmData.blocs.length === 0) {
          console.log('📍 No blocs found in database')
          setSavedAreas([])
          return
        }

        // Transform demo bloc objects to DrawnArea format using proper utility
        const savedBlocs: DrawnArea[] = farmData.blocs.map(bloc => {
          return DrawnAreaUtils.fromDatabaseBloc(bloc)
        })

        // Set blocs immediately for card display (without waiting for polygon rendering)
        setSavedAreas(savedBlocs)

        console.log('✅ Farm data loaded successfully:', {
          blocs: farmData.blocs.length,
          farms: farmData.farms.length,
          companies: farmData.companies.length,
          activeCropCycles: farmData.activeCropCycles.length,
        })

      } catch (error) {
        console.error('❌ Failed to process farm data:', error)
        setError('Failed to process farm data.')
        // Graceful degradation - don't crash the app
        setSavedAreas([])
        setDefaultFarmId(null)
      }
    }
  }, [farmData])

  // Handle loading and error states
  useEffect(() => {
    if (farmDataError) {
      console.error('❌ Farm data error:', farmDataError)
      setError('Failed to load farm data. Please check your database connection.')
      setLoading(false)
    } else if (!farmDataLoading && farmData) {
      setLoading(false)
    }
  }, [farmDataLoading, farmDataError, farmData])

  // Field selection handlers removed - parcelles are background only
  // const handleFieldSelect = (fieldId: string) => {
  //   setSelectedField(fieldId === selectedField ? null : fieldId)
  // }

  // const handleFieldHover = (fieldId: string | null) => {
  //   setHoveredField(fieldId)
  // }

  const handleToolSelect = (tool: string | null) => {
    setActiveTool(tool)
    if (!tool) {
      setIsDrawing(false)
    }
  }

  const handleDrawingStart = () => {
    setIsDrawing(true)
  }

  const handleDrawingEnd = () => {
    setIsDrawing(false)
    setActiveTool(null)
  }

  const handleAreaDrawn = (area: DrawnArea) => {
    setDrawnAreas(prev => [...prev, area])
  }

  const handleAreaDelete = (areaKey: string) => {
    setDrawnAreas(prev => prev.filter(area => DrawnAreaUtils.getEntityKey(area) !== areaKey))
  }

  const handleAreaSelect = (areaKey: string) => {
    // Toggle selection - if already selected, deselect
    if (selectedAreaId === areaKey) {
      setSelectedAreaId(null)
      // Stay at current zoom/pan position (better UX)
    } else {
      setSelectedAreaId(areaKey)
      // Zoom to the selected bloc
      zoomToBlocArea(areaKey)
    }
  }

  const handleAreaHover = (areaId: string | null) => {
    setHoveredAreaId(areaId)
  }

  const handleMapClick = () => {
    // Deselect when clicking on empty map area
    setSelectedAreaId(null)
  }

  const handleAreaUpdated = (updatedArea: DrawnArea) => {
    setDrawnAreas(prev => prev.map(area =>
      DrawnAreaUtils.getEntityKey(area) === DrawnAreaUtils.getEntityKey(updatedArea) ? updatedArea : area
    ))
  }

  const handlePolygonClick = (areaId: string) => {
    // Toggle selection - if already selected, deselect
    if (selectedAreaId === areaId) {
      setSelectedAreaId(null)
      setScrollToBlocId(null)
      // Stay at current zoom/pan position (better UX)
    } else {
      setSelectedAreaId(areaId)
      // Zoom to the selected bloc
      zoomToBlocArea(areaId)
      // Trigger scroll to the corresponding bloc card immediately
      setScrollToBlocId(areaId)
      // Clear the scroll trigger immediately after setting
      setScrollToBlocId(null)
    }
    // Don't open modal automatically - only highlight
  }

  // Function to apply map dimming effect
  const applyMapDimming = (shouldDim: boolean) => {
    const mapElement = document.querySelector('.leaflet-container')
    if (mapElement) {
      if (shouldDim) {
        mapElement.classList.add('map-dimmed')
        setMapDimmed(true)
      } else {
        mapElement.classList.remove('map-dimmed')
        setMapDimmed(false)
      }
    }
  }

  // Function to zoom to bloc area
  const zoomToBlocArea = (areaId: string, onComplete?: () => void) => {
    if (!mapInstance) {
      console.error('❌ Map instance not available yet')
      return
    }

    // Find the bloc in either drawn or saved areas
    const bloc = [...drawnAreas, ...savedAreas].find(area => DrawnAreaUtils.getEntityKey(area) === areaId)
    if (!bloc) {
      console.error('❌ Bloc not found for areaId:', areaId)
      return
    }

    // Calculate bounds from coordinates
    const coordinates = bloc.coordinates
    if (coordinates.length === 0) {
      console.error('❌ No coordinates found for bloc:', areaId)
      return
    }

    // Our coordinates are always in [lng, lat] format (GeoJSON standard)
    // Extract lat/lng consistently
    const lats = coordinates.map(coord => coord[1]) // latitude is second element
    const lngs = coordinates.map(coord => coord[0]) // longitude is first element

    const minLat = Math.min(...lats)
    const maxLat = Math.max(...lats)
    const minLng = Math.min(...lngs)
    const maxLng = Math.max(...lngs)

    // Create bounds with minimal padding
    const bounds = L.latLngBounds([minLat, minLng], [maxLat, maxLng])
    const paddedBounds = bounds.pad(0.05) // Minimal padding (5%)

    // Instant zoom for immediate response
    mapInstance.fitBounds(paddedBounds, {
      animate: false, // No animation for instant response
      padding: [10, 10] // Minimal additional padding
    })

    // Call completion callback immediately for pop-out
    if (onComplete) {
      onComplete() // No delay
    }
  }



  // Create field polygons on the map
  const createFieldPolygons = (map: L.Map) => {
    try {
      // Clear existing polygons and labels
      fieldPolygons.forEach(polygon => map.removeLayer(polygon))
      fieldLabels.forEach(label => map.removeLayer(label))

      const newPolygons: L.Polygon[] = []
      const newLabels: L.Marker[] = []

      console.log(`🗺️ Creating polygons for ${FIELDS.length} fields from CSV data`)

      FIELDS.forEach((field, index) => {
        try {
          if (field.active && field.polygon && field.polygon.length > 0) {
          // Create polygon with slate styling
          const polygon = L.polygon(
            field.polygon.map(coord => [coord.lat, coord.lng]),
            {
              color: '#64748b', // slate-500 border
              weight: 2,
              opacity: 0.8,
              fillColor: '#64748b', // slate-500 fill
              fillOpacity: 0.1, // very transparent
              interactive: true
            }
          )

          // Add popup with field info
          polygon.bindPopup(`
            <div class="p-2">
              <h3 class="font-semibold text-slate-800">${field.name}</h3>
              <p class="text-sm text-slate-600">Area: ${field.area} ha</p>
              <p class="text-sm text-slate-600">Soil: ${field.soil_type || 'Unknown'}</p>
              <p class="text-sm text-slate-600">Irrigation: ${field.irrigation_type || 'Unknown'}</p>
            </div>
          `)

          // Add click handler for field selection
          polygon.on('click', () => {
            if (selectedAreaId === field.id) {
              // Unselect field - zoom back to full farm view
              setSelectedAreaId(null)
              zoomToFarmView(map)
            } else {
              // Select field - zoom to this field
              setSelectedAreaId(field.id)
              zoomToField(map, field)
            }
          })

          // Highlight selected field
          if (selectedAreaId === field.id) {
            polygon.setStyle({
              color: '#3b82f6', // blue-500 for selected
              weight: 3,
              fillOpacity: 0.2
            })
          }

          polygon.addTo(map)
          newPolygons.push(polygon)

          // Create field label (initially hidden, shown based on zoom)
          const labelIcon = L.divIcon({
            className: 'field-label',
            html: `<div style="
              transform: translate(-50%, -50%);
              font-size: 11px;
              line-height: 1.2;
              text-align: center;
              max-width: 120px;
              word-wrap: break-word;
              pointer-events: none;
              background: rgba(255, 255, 255, 0.8);
              backdrop-filter: blur(4px);
              padding: 4px 8px;
              border-radius: 4px;
              box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
              border: 1px solid rgb(226, 232, 240);
              font-weight: 500;
              color: rgb(51, 65, 85);
              white-space: nowrap;
            ">${field.name}</div>`,
            iconSize: [0, 0],
            iconAnchor: [0, 0]
          })

          const label = L.marker([field.center.lat, field.center.lng], {
            icon: labelIcon,
            interactive: false
          })

            label.addTo(map)
            newLabels.push(label)
          } else {
            console.warn(`⚠️ Skipping field ${field.name}: inactive or no polygon data`)
          }
        } catch (fieldError) {
          console.error(`❌ Error creating polygon for field ${field.name}:`, fieldError)
          throw new Error(`Failed to create polygon for field ${field.name}: ${fieldError instanceof Error ? fieldError.message : String(fieldError)}`)
        }
      })

      setFieldPolygons(newPolygons)
      setFieldLabels(newLabels)

      // Set up zoom event listener to show/hide labels
      map.on('zoomend', () => {
        const zoom = map.getZoom()
        setCurrentZoom(zoom)
        updateFieldLabelsVisibility(zoom)
      })

      // Initial label visibility
      updateFieldLabelsVisibility(map.getZoom())

      console.log(`✅ Successfully created ${newPolygons.length} field polygons from CSV data`)
    } catch (error) {
      console.error('❌ Critical error creating field polygons:', error)
      throw new Error(`Failed to create field polygons: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  // Zoom to a specific field
  const zoomToField = (map: L.Map, field: any) => {
    try {
      if (field.polygon && field.polygon.length > 0) {
        const bounds = L.latLngBounds(field.polygon.map((coord: any) => [coord.lat, coord.lng]))
        map.fitBounds(bounds, {
          animate: true,
          padding: [20, 20] // Small padding for individual field
        })
        console.log(`🔍 Zoomed to field: ${field.name}`)
      }
    } catch (error) {
      console.error('❌ Error zooming to field:', error)
    }
  }

  // Zoom to full farm view (all fields, no padding)
  const zoomToFarmView = (map: L.Map) => {
    try {
      const activeFields = FIELDS.filter(field => field.active)
      if (activeFields.length === 0) return

      // Collect all coordinates from all fields
      const allCoordinates: [number, number][] = []
      activeFields.forEach(field => {
        if (field.polygon && Array.isArray(field.polygon)) {
          field.polygon.forEach(coord => {
            if (coord.lat && coord.lng) {
              allCoordinates.push([coord.lat, coord.lng])
            }
          })
        }
      })

      if (allCoordinates.length > 0) {
        const bounds = L.latLngBounds(allCoordinates)
        map.fitBounds(bounds, {
          animate: true,
          padding: [0, 0] // NO PADDING for full farm view
        })
        console.log('🔍 Zoomed to full farm view (no padding)')
      }
    } catch (error) {
      console.error('❌ Error zooming to farm view:', error)
    }
  }

  // Update field label visibility based on zoom level
  const updateFieldLabelsVisibility = (zoom: number) => {
    fieldLabels.forEach((label, index) => {
      const field = FIELDS[index]
      if (field) {
        // Show labels at zoom level 14 and above
        // Hide if text would overflow the polygon (simple heuristic)
        const shouldShow = zoom >= 14

        if (shouldShow) {
          label.getElement()?.style.setProperty('display', 'block')
        } else {
          label.getElement()?.style.setProperty('display', 'none')
        }
      }
    })
  }

  // Handle map ready callback
  const handleMapReady = (map: L.Map) => {
    setMapInstance(map)
    // Create field polygons when map is ready
    createFieldPolygons(map)
    // Initial zoom is handled by the useEffect below - no duplicate zoom here
  }

  // Initial farm view zoom (no animation for startup)
  const zoomToFarmViewInitial = (map: L.Map) => {
    try {
      // Use field data for initial zoom since blocs are removed
      const activeFields = FIELDS.filter(field => field.active)
      if (activeFields.length === 0) {
        console.log('🔍 No active fields available for initial zoom, using default Mauritius view')
        const mauritiusBounds = L.latLngBounds([-20.5, 57.3], [-19.9, 57.8])
        map.fitBounds(mauritiusBounds, {
          animate: false,
          padding: [50, 50]
        })
        return
      }

      console.log('🔍 Using', activeFields.length, 'fields for initial zoom')

      // Collect all coordinates from all fields
      const allCoordinates: [number, number][] = []
      activeFields.forEach((field, index) => {
        if (field.polygon && Array.isArray(field.polygon)) {
          // Convert field polygon coordinates to [lat, lng] format
          const validCoords = field.polygon
            .filter(coord =>
              coord.lat && coord.lng &&
              !isNaN(coord.lat) && !isNaN(coord.lng) &&
              isFinite(coord.lat) && isFinite(coord.lng)
            )
            .map(coord => [coord.lat, coord.lng] as [number, number])

          if (validCoords.length > 0) {
            allCoordinates.push(...validCoords)
            console.log(`🔍 Field ${index + 1} (${field.name}): ${validCoords.length} valid coordinates`)
          } else {
            console.warn(`⚠️ Field ${index + 1} (${field.name}): No valid coordinates`)
          }
        } else {
          console.warn(`⚠️ Field ${index + 1} (${field.name}): No polygon coordinates`)
        }
      })

      if (allCoordinates.length === 0) {
        console.error('❌ No valid coordinates found in any fields, using default view')
        const mauritiusBounds = L.latLngBounds([-20.5, 57.3], [-19.9, 57.8])
        map.fitBounds(mauritiusBounds, {
          animate: false,
          padding: [0, 0] // NO PADDING for initial view
        })
        return
      }

      console.log('🔍 Total valid coordinates for bounds calculation:', allCoordinates.length)

      // Create bounds from all field coordinates and fit with NO PADDING
      const bounds = L.latLngBounds(allCoordinates)
      map.fitBounds(bounds, {
        animate: false,
        padding: [0, 0] // NO PADDING for initial farm view
      })

      console.log('✅ Initial zoom set to all fields (no padding)')
      return
    } catch (error) {
      console.error('❌ Error in zoomToFarmViewInitial:', error)
      // Fallback to default Mauritius view
      const mauritiusBounds = L.latLngBounds([-20.5, 57.3], [-19.9, 57.8])
      map.fitBounds(mauritiusBounds, {
        animate: false,
        padding: [0, 0] // NO PADDING
      })
    }
  }

  // Helper function to calculate bounds from coordinate arrays
  const calculateBoundsFromCoordinates = (lngs: number[], lats: number[], map: L.Map): void => {
    console.log('🔍 Sample coordinates for bounds calculation:', {
      sampleLngs: lngs.slice(0, 3),
      sampleLats: lats.slice(0, 3),
      coordinateFormat: 'Using lng/lat arrays',
      mauritiusExpected: 'lng: ~57.6, lat: ~-20.3'
    })

    // Validate that we have valid numbers
    const validLats = lats.filter(lat => !isNaN(lat) && isFinite(lat))
    const validLngs = lngs.filter(lng => !isNaN(lng) && isFinite(lng))

    if (validLats.length === 0 || validLngs.length === 0) {
      console.error('❌ No valid lat/lng values found')
      return
    }

    const minLat = Math.min(...validLats)
    const maxLat = Math.max(...validLats)
    const minLng = Math.min(...validLngs)
    const maxLng = Math.max(...validLngs)

    console.log('🔍 Initial farm view bounds:', { minLat, maxLat, minLng, maxLng })

    // Validate bounds are reasonable for Mauritius
    const latRange = maxLat - minLat
    const lngRange = maxLng - minLng

    // Mauritius coordinates should be: lat: -20.5 to -19.9, lng: 57.3 to 57.8
    const isValidMauritiusLat = minLat >= -21 && maxLat <= -19
    const isValidMauritiusLng = minLng >= 57 && maxLng <= 58

    if (!isValidMauritiusLat || !isValidMauritiusLng || latRange > 2 || lngRange > 2 || latRange <= 0 || lngRange <= 0) {
      const boundsInfo = {
        latRange: isNaN(latRange) ? 'NaN' : latRange,
        lngRange: isNaN(lngRange) ? 'NaN' : lngRange,
        minLat, maxLat, minLng, maxLng,
        isValidMauritiusLat,
        isValidMauritiusLng,
        coordinateCount: lats.length
      }
      console.error('❌ Bounds invalid for Mauritius, using fallback:', boundsInfo)
      // Fallback to default Mauritius view
      const mauritiusBounds = L.latLngBounds([-20.5, 57.3], [-19.9, 57.8])
      map.fitBounds(mauritiusBounds, {
        animate: false,
        padding: [0, 0] // NO PADDING
      })
      return
    }

    // Create bounds with NO PADDING for initial view
    const bounds = L.latLngBounds([minLat, minLng], [maxLat, maxLng])

    map.fitBounds(bounds, {
      animate: false, // No animation for initial load
      padding: [0, 0] // NO PADDING for full farm view
    })

    console.log('✅ Initial zoom completed successfully')
  }

  const handleBlocCardClick = (areaId: string) => {
    // Zoom is now handled in handleAreaSelect, so this is just for any additional card-specific logic
    // The zoom will happen automatically when the selection changes
  }

  const handlePolygonDelete = (areaId: string) => {
    setDrawnAreas(prev => prev.filter(area => DrawnAreaUtils.getEntityKey(area) !== areaId))
    setSelectedPolygon(null)
    setSelectedAreaId(null)
  }

  const handleSaveAll = async () => {
    if (drawnAreas.length === 0) return

    // Validate farm ID is available
    if (!defaultFarmId) {
      console.error('❌ Cannot save blocs: No farm ID available')
      return
    }

    try {
      // STEP 1: Remove text labels from drawn areas BEFORE database save
      if (mapInstance) {
        drawnAreas.forEach(area => {
          // Iterate through all map layers to find and remove text labels
          mapInstance.eachLayer((layer: any) => {
            // Check if this layer has a text label and matches our area
            if (layer._areaLabel && layer._localId === area.localId) {
              if (mapInstance.hasLayer(layer._areaLabel)) {
                mapInstance.removeLayer(layer._areaLabel)
              }
              layer._areaLabel = null
            }
          })
        })
      }

      // STEP 2: Use MockApiService for demo mode
      const { MockApiService } = await import('@/services/mockApiService')

      // STEP 3: Save all drawn areas to demo storage with farm ID
      const savedBlocs: any[] = []
      for (const drawnArea of drawnAreas) {
        try {
          const response = await MockApiService.createBloc({
            name: drawnArea.localId,
            farmId: defaultFarmId,
            coordinates: drawnArea.coordinates,
            area: drawnArea.area,
            notes: `Created from map drawing on ${new Date().toLocaleDateString()}`
          })
          savedBlocs.push(response.data)
        } catch (error) {
          console.error(`Failed to save bloc ${drawnArea.localId}:`, error)
        }
      }

      // Transform saved blocs to DrawnArea format with UUIDs from database
      const savedDrawnAreas: DrawnArea[] = drawnAreas.map((drawnArea, index) => {
        const correspondingBloc = savedBlocs[index]
        if (correspondingBloc) {
          return {
            ...drawnArea,
            uuid: correspondingBloc.id, // Set UUID from database
            isSaved: true,
            isDirty: false,
            createdAt: correspondingBloc.createdAt || new Date().toISOString(),
            updatedAt: correspondingBloc.updatedAt || new Date().toISOString()
          }
        }
        return drawnArea
      })

      // Move to saved areas in local state with proper UUIDs
      setSavedAreas(prev => [...prev, ...savedDrawnAreas])

      // Clear drawn areas immediately after setting saved areas
      setDrawnAreas([])
      setSelectedPolygon(null)
      setSelectedAreaId(null)

      // Force map refresh to ensure polygons are visible
      if (mapInstance) {
        mapInstance.invalidateSize()
      }

      // Show success message
      alert(`Successfully saved ${savedBlocs.length} bloc(s) to database!`)

    } catch (error) {
      console.error('❌ Failed to save blocs:', error)
      alert(`Failed to save blocs: ${(error as any)?.message || 'Unknown error'}. Please check that the database is properly set up.`)
    }
  }

  const handleCancelAll = () => {
    setDrawnAreas([])
    setSelectedPolygon(null)
    setSelectedAreaId(null)
  }

  const handleBlocPopOut = (areaKey: string) => {
    // Find the bloc in either drawn or saved areas
    const bloc = [...drawnAreas, ...savedAreas].find(area => DrawnAreaUtils.getEntityKey(area) === areaKey)
    if (bloc) {
      console.log('🔍 Opening bloc data screen for:', {
        areaKey,
        localId: bloc.localId,
        uuid: bloc.uuid,
        isSaved: bloc.isSaved,
        hasUuid: !!bloc.uuid
      })

      // Validate bloc has UUID before opening
      if (!bloc.uuid) {
        console.error('❌ Cannot open bloc: Missing UUID', bloc)
        alert(`Cannot open bloc "${bloc.localId}": Bloc must be saved to database first`)
        return
      }

      // Remove any hover effects immediately
      setHoveredAreaId(null)

      // Ensure bloc is selected (blue border, no fill)
      setSelectedAreaId(areaKey)

      // Apply dimming effect immediately
      applyMapDimming(true)

      // Show the data screen immediately - no zoom delay
      setDataScreenBloc(bloc)
      setShowDataScreen(true)

      // Optional: Quick zoom in background (non-blocking)
      zoomToBlocArea(areaKey)

      console.log('✅ Bloc data screen opened successfully')
    } else {
      console.error('❌ Bloc not found for pop-out:', areaKey)
    }
  }

  const handleBackToMap = () => {
    // Remove dimming immediately
    applyMapDimming(false)

    // Close the data screen immediately
    setShowDataScreen(false)
    setDataScreenBloc(null)

    // Zoom to farm view immediately - no delays
    if (mapInstance) {
      zoomToFarmView(mapInstance)
    }
    // Keep the field selected (blue border, no fill) after returning to farm view
    // selectedAreaId remains unchanged so field stays selected
  }

  if (loading) {
    return (
      <div className="h-screen-dynamic w-full flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading farm data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-screen-dynamic w-full flex items-center justify-center bg-gray-100">
        <div className="text-center max-w-md">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Error Loading Data</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="gis-layout h-full w-full flex">
        {/* Main content area */}
      <div className="flex-1 flex">
        {/* Conditionally show sidebar only when not in data screen mode */}
        {!showDataScreen && (
          <div className="flex-shrink-0">
            <BlocList
              drawnAreas={drawnAreas}
              savedAreas={savedAreas}
              selectedAreaId={selectedAreaId}
              onAreaSelect={handleAreaSelect}
              onAreaDelete={handlePolygonDelete}
              onAreaHover={handleAreaHover}
              onSaveAll={handleSaveAll}
              onCancelAll={handleCancelAll}
              onBlocCardClick={handleBlocCardClick}
              onBlocPopOut={handleBlocPopOut}
              onToolSelect={handleToolSelect}
              scrollToBloc={scrollToBlocId}
            />
          </div>
        )}

        {/* Main content area - map is always mounted, data screen overlays when needed */}
        <div className="flex-1 relative">
          {/* Map Component - Always mounted to preserve state */}
          <MapComponent
            activeTool={activeTool}
            drawnAreas={drawnAreas}
            savedAreas={savedAreas}
            selectedAreaId={selectedAreaId}
            hoveredAreaId={hoveredAreaId}
            onAreaDrawn={handleAreaDrawn}
            onAreaUpdated={handleAreaUpdated}
            onPolygonClick={handlePolygonClick}
            onMapClick={handleMapClick}
            onDrawingStart={handleDrawingStart}
            onDrawingEnd={handleDrawingEnd}
            onMapReady={handleMapReady}
          />



          {/* DrawnAreasList hidden - functionality moved to BlocList in sidebar */}
          <div className="hidden">
            <DrawnAreasList
              drawnAreas={drawnAreas}
              selectedAreaId={selectedAreaId}
              onAreaSelect={handleAreaSelect}
              onAreaDelete={handlePolygonDelete}
              onAreaHover={handleAreaHover}
              onSaveAll={handleSaveAll}
              onCancelAll={handleCancelAll}
            />
          </div>

          {/* Status bar - Only show when not in data screen mode */}
          {!showDataScreen && (
            <div className="absolute bottom-4 left-4 bg-white px-3 py-2 rounded-lg shadow-lg z-[1000]">
              <p className="text-sm text-gray-600">
                {drawnAreas.length + savedAreas.length} blocs
                {activeTool && <span className="ml-2 text-blue-600">• Drawing mode: {activeTool}</span>}
              </p>
            </div>
          )}

          {/* Floating Info Box - Bottom Right */}
          {!showDataScreen && (
            <FloatingInfoBox />
          )}

          {/* Data Screen Overlay - Shows on top of map when needed */}
          {showDataScreen && dataScreenBloc && (
            <div className="absolute inset-0 z-[2000]">
              <BlocScreen
                bloc={dataScreenBloc}
                onBack={handleBackToMap}
                onDelete={() => handlePolygonDelete(dataScreenBloc.uuid || dataScreenBloc.localId)}
              />
            </div>
          )}
        </div>

        {/* Global Components */}
        <GlobalLoadingIndicator />
        <GlobalErrorHandler />
        <CacheManagementDashboard />
      </div>
    </div>
  )
}
