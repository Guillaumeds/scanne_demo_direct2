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
    if (mapInstance && savedAreas.length > 0) {
      // Small delay to ensure everything is loaded
      setTimeout(() => {
        zoomToFarmViewInitial(mapInstance)
      }, 300)
    }
  }, [mapInstance]) // Remove savedAreas.length dependency to prevent re-zoom on save

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

  // Load initial data: blocs, farms, and companies in one atomic operation
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const { BlocService } = await import('@/services/blocService')

        // Loading initial data

        // Load all required data in one atomic operation
        const [blocsData, farmsData, companiesData] = await Promise.all([
          BlocService.getAllBlocs(),
          BlocService.getFarms(),
          BlocService.getCompanies()
        ])

        // Validate data integrity
        if (!farmsData || farmsData.length === 0) {
          throw new Error('No farms found - database setup required')
        }

        // Store farm data for bloc creation
        const defaultFarm = farmsData[0]
        // Default farm loaded
        setDefaultFarmId(defaultFarm.id)

        if (!blocsData || blocsData.length === 0) {
          console.log('📍 No blocs found in database')
          setSavedAreas([])
          return
        }

        // Transform database objects to DrawnArea format
        const savedBlocs: DrawnArea[] = blocsData.map(bloc => {
          // Parse WKT coordinates using the existing utility function (returns [lng, lat] format)
          const wktCoordinates = DrawnAreaUtils.parseWKTToCoordinates(bloc.coordinates_wkt || '')
          // Keep [lng, lat] format - no swap needed for Leaflet
          const coordinates: [number, number][] = wktCoordinates.map(([lng, lat]) => [lng, lat])

          return {
            uuid: bloc.id,
            localId: bloc.name,
            type: 'polygon' as const,
            coordinates,
            area: bloc.area_hectares || 0,
            isSaved: true,
            isDirty: false,
            createdAt: bloc.created_at || new Date().toISOString(),
            updatedAt: bloc.updated_at || new Date().toISOString()
          }
        })

        // Set blocs immediately for card display (without waiting for polygon rendering)
        setSavedAreas(savedBlocs)
        // Initial data loaded successfully

      } catch (error) {
        console.error('❌ Failed to load initial data:', error)
        // Graceful degradation - don't crash the app
        setSavedAreas([])
        setDefaultFarmId(null)
      }
    }

    loadInitialData()
  }, [])

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
    console.log('🎯 STEP G: FarmGISLayout.handleAreaDrawn called')
    console.log('🎯 STEP G1: Adding area to drawnAreas state - area:', area.area.toFixed(2), 'ha')
    setDrawnAreas(prev => {
      const newAreas = [...prev, area]
      console.log('🎯 STEP G1: Total drawn areas now:', newAreas.length)
      return newAreas
    })

    console.log('✅ STEP G: Area successfully added to state')
    // Show success message
  }

  const handleAreaDelete = (areaKey: string) => {
    console.log('🎯 STEP J: Area deletion requested for:', areaKey)
    console.log('🎯 STEP J1: Removing from drawnAreas state')
    setDrawnAreas(prev => {
      const filtered = prev.filter(area => DrawnAreaUtils.getEntityKey(area) !== areaKey)
      console.log('🎯 STEP J1: Drawn areas count:', prev.length, '→', filtered.length)
      return filtered
    })
    console.log('✅ STEP J: Area deletion completed')
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
    console.log('Area updated:', updatedArea)
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
      // Trigger scroll to the corresponding bloc card with longer delay
      setTimeout(() => {
        setScrollToBlocId(areaId)
        // Clear the scroll trigger after scroll completes
        setTimeout(() => setScrollToBlocId(null), 500)
      }, 200) // Delay to ensure selection state is set first
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

    // Debug: Log first coordinate to understand format
    console.log('🔍 First coordinate:', coordinates[0], 'Total coords:', coordinates.length)

    // Check if coordinates are in Mauritius range
    // Mauritius is approximately: lat -20.5 to -19.9, lng 57.3 to 57.8
    const firstCoord = coordinates[0]
    const isLatFirst = firstCoord[0] >= -21 && firstCoord[0] <= -19 && firstCoord[1] >= 57 && firstCoord[1] <= 58

    let lats, lngs
    if (isLatFirst) {
      // Coordinates are [latitude, longitude]
      lats = coordinates.map(coord => coord[0])
      lngs = coordinates.map(coord => coord[1])
      console.log('🔍 Using [lat, lng] format')
    } else {
      // Coordinates are [longitude, latitude]
      lats = coordinates.map(coord => coord[1])
      lngs = coordinates.map(coord => coord[0])
      console.log('🔍 Using [lng, lat] format')
    }

    const minLat = Math.min(...lats)
    const maxLat = Math.max(...lats)
    const minLng = Math.min(...lngs)
    const maxLng = Math.max(...lngs)

    console.log('🔍 Calculated bounds:', { minLat, maxLat, minLng, maxLng })

    // Create bounds with minimal padding
    const bounds = L.latLngBounds([minLat, minLng], [maxLat, maxLng])
    const paddedBounds = bounds.pad(0.05) // Minimal padding (5%)

    // Fast zoom for immediate response
    mapInstance.fitBounds(paddedBounds, {
      animate: true,
      duration: 0.5, // Fast animation
      easeLinearity: 0.25, // Standard easing
      padding: [10, 10] // Minimal additional padding
    })

    // Call completion callback immediately for pop-out
    if (onComplete) {
      setTimeout(onComplete, 100) // Minimal delay
    }
  }

  // Function to zoom to fit all blocs (farm view)
  const zoomToFarmView = () => {
    if (!mapInstance) {
      console.error('❌ Map instance not available for farm view')
      return
    }

    const allBlocs = [...drawnAreas, ...savedAreas]
    if (allBlocs.length === 0) {
      console.warn('⚠️ No blocs to fit in view')
      return
    }

    // Collect all coordinates from all blocs
    const allCoordinates: [number, number][] = []
    allBlocs.forEach(bloc => {
      allCoordinates.push(...bloc.coordinates)
    })

    if (allCoordinates.length === 0) {
      console.error('❌ No coordinates found in any bloc')
      return
    }

    // Use same coordinate detection logic as bloc zoom
    const firstCoord = allCoordinates[0]
    const isLatFirst = firstCoord[0] >= -21 && firstCoord[0] <= -19 && firstCoord[1] >= 57 && firstCoord[1] <= 58

    let lats, lngs
    if (isLatFirst) {
      // Coordinates are [latitude, longitude]
      lats = allCoordinates.map(coord => coord[0])
      lngs = allCoordinates.map(coord => coord[1])
    } else {
      // Coordinates are [longitude, latitude]
      lats = allCoordinates.map(coord => coord[1])
      lngs = allCoordinates.map(coord => coord[0])
    }

    const minLat = Math.min(...lats)
    const maxLat = Math.max(...lats)
    const minLng = Math.min(...lngs)
    const maxLng = Math.max(...lngs)

    console.log('🔍 Farm view bounds:', { minLat, maxLat, minLng, maxLng })

    // Create bounds with no padding for farm view
    const bounds = L.latLngBounds([minLat, minLng], [maxLat, maxLng])

    mapInstance.fitBounds(bounds, {
      animate: true,
      duration: 5.0, // Much slower animation for farm view
      easeLinearity: 0.02, // Very smooth easing (lower = smoother)
      padding: [5, 5] // Minimal padding to avoid edge clipping
    })
  }

  // Handle map ready callback
  const handleMapReady = (map: L.Map) => {
    setMapInstance(map)

    // Once map is ready and we have blocs, zoom to farm view
    if (savedAreas.length > 0) {
      // Small delay to ensure map is fully initialized
      setTimeout(() => {
        zoomToFarmViewInitial(map)
      }, 500)
    }
  }

  // Initial farm view zoom (no animation for startup)
  const zoomToFarmViewInitial = (map: L.Map) => {
    const allBlocs = [...drawnAreas, ...savedAreas]
    if (allBlocs.length === 0) return

    // Collect all coordinates from all blocs
    const allCoordinates: [number, number][] = []
    allBlocs.forEach(bloc => {
      allCoordinates.push(...bloc.coordinates)
    })

    if (allCoordinates.length === 0) return

    // Use same coordinate detection logic
    const firstCoord = allCoordinates[0]
    const isLatFirst = firstCoord[0] >= -21 && firstCoord[0] <= -19 && firstCoord[1] >= 57 && firstCoord[1] <= 58

    let lats, lngs
    if (isLatFirst) {
      lats = allCoordinates.map(coord => coord[0])
      lngs = allCoordinates.map(coord => coord[1])
    } else {
      lats = allCoordinates.map(coord => coord[1])
      lngs = allCoordinates.map(coord => coord[0])
    }

    const minLat = Math.min(...lats)
    const maxLat = Math.max(...lats)
    const minLng = Math.min(...lngs)
    const maxLng = Math.max(...lngs)

    // Create bounds with no padding for initial view
    const bounds = L.latLngBounds([minLat, minLng], [maxLat, maxLng])

    map.fitBounds(bounds, {
      animate: false, // No animation for initial load
      padding: [5, 5] // Minimal padding to avoid edge clipping
    })
  }

  const handleBlocCardClick = (areaId: string) => {
    // Zoom is now handled in handleAreaSelect, so this is just for any additional card-specific logic
    // The zoom will happen automatically when the selection changes
  }

  const handlePolygonDelete = (areaId: string) => {
    setDrawnAreas(prev => prev.filter(area => DrawnAreaUtils.getEntityKey(area) !== areaId))
    setSelectedPolygon(null)
    setSelectedAreaId(null)
    console.log('Area deleted:', areaId)
  }

  const handleSaveAll = async () => {
    if (drawnAreas.length === 0) return

    // Validate farm ID is available
    if (!defaultFarmId) {
      console.error('❌ Cannot save blocs: No farm ID available')
      return
    }

    try {
      console.log('💾 Saving blocs to database...', drawnAreas)

      // Import BlocService dynamically to avoid import issues
      const { BlocService } = await import('@/services/blocService')

      // Save all drawn areas to database with farm ID
      const savedBlocs = await BlocService.saveMultipleDrawnAreas(drawnAreas, defaultFarmId)
      console.log('✅ Blocs saved successfully:', savedBlocs)

      // Transform saved blocs to DrawnArea format with UUIDs from database
      const savedDrawnAreas: DrawnArea[] = drawnAreas.map((drawnArea, index) => {
        const correspondingBloc = savedBlocs[index]
        if (correspondingBloc) {
          return {
            ...drawnArea,
            uuid: correspondingBloc.id, // Set UUID from database
            isSaved: true,
            isDirty: false,
            createdAt: correspondingBloc.created_at || new Date().toISOString(),
            updatedAt: correspondingBloc.updated_at || new Date().toISOString()
          }
        }
        return drawnArea
      })

      // Move to saved areas in local state with proper UUIDs
      setSavedAreas(prev => [...prev, ...savedDrawnAreas])
      setDrawnAreas([])
      setSelectedPolygon(null)
      setSelectedAreaId(null)

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
    }
  }

  const handleBackToMap = () => {
    // Start graceful exit animation: gradually remove dimming
    applyMapDimming(false)

    // Close the data screen after dimming transition completes
    setTimeout(() => {
      setShowDataScreen(false)
      setDataScreenBloc(null)

      // After screen closes gracefully, zoom to farm view
      setTimeout(() => {
        zoomToFarmView()
        // Keep the bloc selected (blue border, no fill) after returning to farm view
        // selectedAreaId remains unchanged so bloc stays selected
      }, 300) // Longer delay for screen to close gracefully
    }, 400) // Match CSS transition duration for dimming
  }

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading farm data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gray-100">
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
      </div>
    </div>
  )
}
