'use client'

import { useState, useEffect } from 'react'
import L from 'leaflet'
import MapComponent from './MapComponent'
import BlocList from './BlocList'
import DrawingToolbar from './DrawingToolbar'
import DrawnAreasList from './DrawnAreasList'
import PolygonInfoModal from './PolygonInfoModal'

import BlocDataScreen from './BlocDataScreen'
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


  // Debug selectedAreaId changes
  useEffect(() => {
    console.log('🔄 selectedAreaId changed to:', selectedAreaId)
  }, [selectedAreaId])

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
        console.log('📊 Field loading disabled - using empty fields array')
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

  // Load saved blocs from database on component mount with deferred polygon rendering
  useEffect(() => {
    const loadSavedBlocs = async () => {
      try {
        const { BlocService } = await import('@/services/blocService')

        // Load bloc data without coordinates first (fast)
        console.log('⚡ Loading bloc metadata first for instant display...')
        const savedBlocs = await BlocService.getAllBlocs()

        // Set blocs immediately for card display (without waiting for polygon rendering)
        setSavedAreas(savedBlocs)
        console.log('✅ Bloc cards displayed instantly:', savedBlocs.length, 'blocs')

        // Polygon rendering will happen in MapComponent when ready
        console.log('🔄 Polygon rendering will be handled by MapComponent...')

      } catch (error) {
        console.warn('⚠️ Could not load saved blocs from database:', error)
        // Don't fail the app if blocs can't be loaded
      }
    }

    loadSavedBlocs()
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
    console.log('Area drawn:', area)
    setDrawnAreas(prev => [...prev, area])

    // Show success message
    console.log(`✅ ${area.type} drawn: ${area.area.toFixed(2)} ha`)
  }

  const handleAreaDelete = (areaKey: string) => {
    setDrawnAreas(prev => prev.filter(area => DrawnAreaUtils.getEntityKey(area) !== areaKey))
    console.log('Area deleted:', areaKey)
  }

  const handleAreaSelect = (areaKey: string) => {
    // Toggle selection - if already selected, deselect
    if (selectedAreaId === areaKey) {
      setSelectedAreaId(null)
    } else {
      setSelectedAreaId(areaKey)
    }
  }

  const handleAreaHover = (areaId: string | null) => {
    setHoveredAreaId(areaId)
  }

  const handleMapClick = () => {
    // Deselect when clicking on empty map area
    console.log('🗺️ Map click - deselecting area')
    setSelectedAreaId(null)
  }

  const handleAreaUpdated = (updatedArea: DrawnArea) => {
    setDrawnAreas(prev => prev.map(area =>
      DrawnAreaUtils.getEntityKey(area) === DrawnAreaUtils.getEntityKey(updatedArea) ? updatedArea : area
    ))
    console.log('Area updated:', updatedArea)
  }

  const handlePolygonClick = (areaId: string) => {
    console.log('🎯 handlePolygonClick called with areaId:', areaId)

    // Toggle selection - if already selected, deselect
    if (selectedAreaId === areaId) {
      console.log('🔄 Deselecting area:', areaId)
      setSelectedAreaId(null)
      setScrollToBlocId(null)
    } else {
      console.log('✅ Selecting area:', areaId)
      setSelectedAreaId(areaId)
      // Trigger scroll to the corresponding bloc card
      setScrollToBlocId(areaId)
      // Clear the scroll trigger after a short delay (but keep selectedAreaId)
      setTimeout(() => setScrollToBlocId(null), 100)
    }
    // Don't open modal automatically - only highlight
  }

  const handleBlocCardClick = (areaId: string) => {
    // Find the bloc in either drawn or saved areas
    const bloc = [...drawnAreas, ...savedAreas].find(area => DrawnAreaUtils.getEntityKey(area) === areaId)
    if (!bloc) return

    // Calculate bounds from coordinates
    const coordinates = bloc.coordinates
    if (coordinates.length === 0) return

    // Find min/max lat/lng
    const lats = coordinates.map(coord => coord[1])
    const lngs = coordinates.map(coord => coord[0])
    const minLat = Math.min(...lats)
    const maxLat = Math.max(...lats)
    const minLng = Math.min(...lngs)
    const maxLng = Math.max(...lngs)

    // Create bounds and add padding
    const bounds = L.latLngBounds([minLat, minLng], [maxLat, maxLng])
    const paddedBounds = bounds.pad(0.2) // 20% padding

    // Get map instance and fit to bounds
    const mapElement = document.querySelector('.leaflet-container')
    if (mapElement && (mapElement as any)._leaflet_map) {
      const map = (mapElement as any)._leaflet_map
      map.fitBounds(paddedBounds, {
        animate: true,
        duration: 1.0,
        easeLinearity: 0.25
      })
    }

    console.log('🗺️ Navigating to bloc:', areaId, 'bounds:', paddedBounds)
  }

  const handlePolygonDelete = (areaId: string) => {
    setDrawnAreas(prev => prev.filter(area => DrawnAreaUtils.getEntityKey(area) !== areaId))
    setSelectedPolygon(null)
    setSelectedAreaId(null)
    console.log('Area deleted:', areaId)
  }

  const handleSaveAll = async () => {
    if (drawnAreas.length === 0) return

    try {
      console.log('💾 Saving blocs to database...', drawnAreas)

      // Import BlocService dynamically to avoid import issues
      const { BlocService } = await import('@/services/blocService')

      // Save all drawn areas to database
      const savedBlocs = await BlocService.saveMultipleDrawnAreas(drawnAreas)
      console.log('✅ Blocs saved successfully:', savedBlocs)

      // Move to saved areas in local state
      setSavedAreas(prev => [...prev, ...drawnAreas])
      setDrawnAreas([])
      setSelectedPolygon(null)
      setSelectedAreaId(null)

      // Show success message
      alert(`Successfully saved ${savedBlocs.length} bloc(s) to database!`)

    } catch (error) {
      console.error('❌ Failed to save blocs:', error)
      alert(`Failed to save blocs: ${error.message}. Please check that the database is properly set up with fields data.`)
    }
  }

  const handleCancelAll = () => {
    setDrawnAreas([])
    setSelectedPolygon(null)
    setSelectedAreaId(null)
    console.log('All areas cancelled')
  }

  const handleBlocPopOut = (areaKey: string) => {
    // Find the bloc in either drawn or saved areas
    const bloc = [...drawnAreas, ...savedAreas].find(area => DrawnAreaUtils.getEntityKey(area) === areaKey)
    if (bloc) {
      setDataScreenBloc(bloc)
      setShowDataScreen(true)
      console.log('Opening data screen for bloc:', areaKey)
    }
  }

  const handleBackToMap = () => {
    setShowDataScreen(false)
    setDataScreenBloc(null)
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
    <div className="h-full w-full flex">
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
              <BlocDataScreen
                bloc={dataScreenBloc}
                onBack={handleBackToMap}
                onDelete={handlePolygonDelete}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
