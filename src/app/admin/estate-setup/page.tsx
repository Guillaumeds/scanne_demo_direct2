'use client'

import { useState, useEffect, useRef } from 'react'
import { Save, Download, RefreshCw, AlertCircle, CheckCircle, MapPin, Square, Trash2, Plus } from 'lucide-react'
import MapComponent from '@/components/MapComponent'
import DrawingToolbar from '@/components/DrawingToolbar'
import DrawingManager from '@/components/DrawingManager'
import LayerSelector from '@/components/LayerSelector'
import SentinelOverlaySelector from '@/components/SentinelOverlaySelector'
import { EstateSetupService } from '@/lib/admin-database'
import { FieldData } from '@/types/field'
import { loadFieldData } from '@/utils/csvParser'
import { loadBelleVueFields, hasFieldsInDatabase } from '@/services/fieldService'
import L from 'leaflet'

// Fix for default markers in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

interface DrawnArea {
  id: string
  type: string
  coordinates: [number, number][]
  area: number
  fieldIds: string[]
}

interface FarmBoundary extends DrawnArea {
  type: 'farm_boundary'
}

export default function EstateSetupPage() {
  // Field and drawing state
  const [fields, setFields] = useState<FieldData[]>([])
  const [selectedFields, setSelectedFields] = useState<Set<string>>(new Set())
  const [farmBoundary, setFarmBoundary] = useState<FarmBoundary | null>(null)
  const [drawnAreas, setDrawnAreas] = useState<DrawnArea[]>([])
  const [activeTool, setActiveTool] = useState<string | null>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [selectedAreaId, setSelectedAreaId] = useState<string | null>(null)
  const [hoveredAreaId, setHoveredAreaId] = useState<string | null>(null)

  // UI state
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [farmName, setFarmName] = useState('')
  const [companyName, setCompanyName] = useState('')

  // Load field data (same as main app)
  useEffect(() => {
    const loadFields = async () => {
      try {
        console.log('🔄 Loading field data for estate setup...')
        setLoading(true)

        // Check if database has fields, otherwise fall back to GeoJSON
        const hasDbFields = await hasFieldsInDatabase()

        let fieldData
        if (hasDbFields) {
          console.log('📊 Loading fields from database...')
          fieldData = await loadBelleVueFields()
        } else {
          console.log('📊 No fields in database, loading from GeoJSON...')
          fieldData = await loadFieldData()
        }

        console.log('✅ Loaded fields for estate setup:', fieldData.length, 'fields')
        setFields(fieldData)
      } catch (error) {
        console.error('❌ Failed to load field data:', error)
        setMessage({ type: 'error', text: 'Failed to load field data. Please check your database connection.' })
      } finally {
        setLoading(false)
      }
    }

    loadFields()
  }, [])

  // Drawing handlers (similar to main app)
  const handleToolSelect = (tool: string | null) => {
    setActiveTool(tool)
    if (tool === 'farm_boundary') {
      setMessage({ type: 'success', text: 'Click on the map to draw farm boundary' })
    }
  }

  const handleAreaDrawn = (area: DrawnArea) => {
    if (activeTool === 'farm_boundary') {
      // Convert to farm boundary
      const boundary: FarmBoundary = {
        ...area,
        type: 'farm_boundary'
      }
      setFarmBoundary(boundary)

      // Auto-select fields within boundary
      autoSelectFieldsInBoundary(area.coordinates)
      setMessage({ type: 'success', text: 'Farm boundary created. Fields within boundary auto-selected.' })
    } else {
      setDrawnAreas(prev => [...prev, area])
    }
    setActiveTool(null)
  }

  const handleAreaUpdated = (areaId: string, newCoordinates: [number, number][]) => {
    if (farmBoundary && farmBoundary.id === areaId) {
      const updatedBoundary = {
        ...farmBoundary,
        coordinates: newCoordinates,
        area: calculatePolygonArea(newCoordinates)
      }
      setFarmBoundary(updatedBoundary)
      autoSelectFieldsInBoundary(newCoordinates)
    } else {
      setDrawnAreas(prev => prev.map(area =>
        area.id === areaId
          ? { ...area, coordinates: newCoordinates, area: calculatePolygonArea(newCoordinates) }
          : area
      ))
    }
  }

  const handlePolygonClick = (areaId: string) => {
    setSelectedAreaId(areaId)
  }

  const handleMapClick = () => {
    setSelectedAreaId(null)
  }

  const handleDrawingStart = () => {
    setIsDrawing(true)
  }

  const handleDrawingEnd = () => {
    setIsDrawing(false)
  }

  const handleAreaSelect = (areaId: string) => {
    setSelectedAreaId(areaId)
  }

  const handleAreaHover = (areaId: string | null) => {
    setHoveredAreaId(areaId)
  }

  // Utility functions
  const calculatePolygonArea = (coordinates: [number, number][]): number => {
    // Simple area calculation - in production use proper geospatial library
    let area = 0
    const n = coordinates.length

    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n
      area += coordinates[i][0] * coordinates[j][1]
      area -= coordinates[j][0] * coordinates[i][1]
    }

    return Math.abs(area) / 2 * 111000 * 111000 / 10000 // Rough conversion to hectares
  }

  const autoSelectFieldsInBoundary = (boundary: [number, number][]) => {
    const newSelectedFields = new Set<string>()

    fields.forEach(field => {
      // Simple point-in-polygon check for field center
      const fieldCenter = getFieldCenter(field.coordinates)
      if (isPointInPolygon(fieldCenter, boundary)) {
        newSelectedFields.add(field.field_id)
      }
    })

    setSelectedFields(newSelectedFields)
  }

  const getFieldCenter = (coordinates: [number, number][]): [number, number] => {
    const lat = coordinates.reduce((sum, coord) => sum + coord[0], 0) / coordinates.length
    const lng = coordinates.reduce((sum, coord) => sum + coord[1], 0) / coordinates.length
    return [lat, lng]
  }

  const isPointInPolygon = (point: [number, number], polygon: [number, number][]): boolean => {
    const [x, y] = point
    let inside = false

    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const [xi, yi] = polygon[i]
      const [xj, yj] = polygon[j]

      if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) {
        inside = !inside
      }
    }

    return inside
  }

  // Field selection functions
  const toggleFieldSelection = (fieldId: string) => {
    const newSelected = new Set(selectedFields)
    if (newSelected.has(fieldId)) {
      newSelected.delete(fieldId)
    } else {
      newSelected.add(fieldId)
    }
    setSelectedFields(newSelected)
  }

  const clearBoundary = () => {
    setFarmBoundary(null)
    setSelectedFields(new Set())
    setDrawnAreas(prev => prev.filter(area => area.type !== 'farm_boundary'))
  }

  const startBoundaryDrawing = () => {
    setActiveTool('farm_boundary')
  }

  const exportToCSV = () => {
    const selectedFieldData = fields.filter(field => selectedFields.has(field.field_id))

    const csvData = [
      ['Field ID', 'Field Name', 'Area (ha)', 'Coordinates'],
      ...selectedFieldData.map(field => [
        field.field_id,
        field.field_name,
        field.area_hectares.toString(),
        JSON.stringify(field.coordinates)
      ])
    ]

    if (farmBoundary) {
      csvData.push(['FARM_BOUNDARY', 'Farm Boundary', farmBoundary.area.toFixed(2), JSON.stringify(farmBoundary.coordinates)])
    }

    const csvContent = csvData.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)

    const a = document.createElement('a')
    a.href = url
    a.download = `estate-setup-${farmName || 'unnamed'}-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const saveToDatabase = async () => {
    if (!farmName.trim() || !companyName.trim()) {
      setMessage({ type: 'error', text: 'Please enter farm name and company name' })
      return
    }

    if (!farmBoundary) {
      setMessage({ type: 'error', text: 'Please draw a farm boundary' })
      return
    }

    if (selectedFields.size === 0) {
      setMessage({ type: 'error', text: 'Please select at least one field' })
      return
    }

    try {
      setSaving(true)

      const selectedFieldData = fields.filter(field => selectedFields.has(field.field_id))

      const result = await EstateSetupService.saveEstateSetup({
        companyName: companyName.trim(),
        farmName: farmName.trim(),
        farmBoundary,
        totalArea: farmBoundary.area,
        selectedFields: selectedFieldData.map(field => ({
          field_id: field.field_id,
          field_name: field.field_name,
          coordinates: field.coordinates,
          area_hectares: field.area_hectares
        }))
      })

      setMessage({
        type: 'success',
        text: `Successfully saved farm "${farmName}" with ${selectedFields.size} fields to database`
      })

      // Clear form after successful save
      setTimeout(() => {
        setFarmName('')
        setCompanyName('')
        clearBoundary()
      }, 2000)

    } catch (error) {
      console.error('Error saving to database:', error)
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to save to database'
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading field data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full w-full flex">
      {/* Sidebar - Estate Setup Panel */}
      <div className="flex-shrink-0 w-80 bg-white shadow-lg border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
            <MapPin className="w-6 h-6 text-blue-600" />
            <span>Estate Setup</span>
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Configure farm boundaries and select fields
          </p>
        </div>

        {/* Status Message */}
        {message && (
          <div className={`mx-6 mt-4 p-3 rounded-lg flex items-center space-x-2 ${
            message.type === 'success'
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              <AlertCircle className="w-4 h-4" />
            )}
            <span className="text-sm">{message.text}</span>
          </div>
        )}

        {/* Farm Details */}
        <div className="p-6 border-b border-gray-200 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Enter company name"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Farm Name</label>
            <input
              type="text"
              value={farmName}
              onChange={(e) => setFarmName(e.target.value)}
              placeholder="Enter farm name"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Drawing Tools */}
        <div className="p-6 border-b border-gray-200">
          <h3 className="font-medium text-gray-900 mb-3">Drawing Tools</h3>
          <div className="space-y-2">
            <button
              type="button"
              onClick={startBoundaryDrawing}
              disabled={activeTool === 'farm_boundary' || isDrawing}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              <Square className="w-4 h-4" />
              <span>{activeTool === 'farm_boundary' ? 'Drawing Boundary...' : 'Draw Farm Boundary'}</span>
            </button>

            {farmBoundary && (
              <div className="space-y-2">
                <div className="text-sm text-gray-600 bg-green-50 p-2 rounded">
                  ✅ Boundary: {farmBoundary.area.toFixed(2)} hectares
                </div>
                <button
                  type="button"
                  onClick={clearBoundary}
                  className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Clear Boundary</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Field Selection Summary */}
        <div className="p-6 border-b border-gray-200">
          <h3 className="font-medium text-gray-900 mb-3">Selected Fields</h3>
          <div className="text-sm text-gray-600 mb-2">
            {selectedFields.size} of {fields.length} fields selected
          </div>
          <div className="text-sm text-gray-600">
            Total area: {fields
              .filter(field => selectedFields.has(field.field_id))
              .reduce((sum, field) => sum + field.area_hectares, 0)
              .toFixed(2)} hectares
          </div>

          {selectedFields.size > 0 && (
            <div className="mt-3 max-h-32 overflow-y-auto">
              <div className="text-xs text-gray-500 mb-1">Selected fields:</div>
              {fields
                .filter(field => selectedFields.has(field.field_id))
                .map(field => (
                  <div key={field.field_id} className="text-xs text-gray-600 flex justify-between">
                    <span>{field.field_name}</span>
                    <span>{field.area_hectares.toFixed(1)} ha</span>
                  </div>
                ))
              }
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex-1 flex flex-col justify-end p-6 space-y-3">
          <button
            type="button"
            onClick={exportToCSV}
            disabled={selectedFields.size === 0}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            onClick={saveToDatabase}
            disabled={saving || !farmBoundary || selectedFields.size === 0}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {saving ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{saving ? 'Saving...' : 'Save to Database'}</span>
          </button>
        </div>
      </div>

      {/* Main Map Area */}
      <div className="flex-1 relative">
        {/* Estate Setup Map Component */}
        <EstateSetupMapComponent
          fields={fields}
          selectedFields={selectedFields}
          onFieldSelect={toggleFieldSelection}
          activeTool={activeTool}
          drawnAreas={farmBoundary ? [farmBoundary, ...drawnAreas] : drawnAreas}
          savedAreas={[]}
          selectedAreaId={selectedAreaId}
          hoveredAreaId={hoveredAreaId}
          onAreaDrawn={handleAreaDrawn}
          onAreaUpdated={handleAreaUpdated}
          onPolygonClick={handlePolygonClick}
          onMapClick={handleMapClick}
          onDrawingStart={handleDrawingStart}
          onDrawingEnd={handleDrawingEnd}
        />

        {/* Drawing Toolbar - Same as main app */}
        <DrawingToolbar
          onToolSelect={handleToolSelect}
          activeTool={activeTool}
          isDrawing={isDrawing}
        />

        {/* Status bar */}
        <div className="absolute bottom-4 left-4 bg-white px-3 py-2 rounded-lg shadow-lg z-[1000]">
          <p className="text-sm text-gray-600">
            {fields.length} fields • {selectedFields.size} selected
            {farmBoundary && <span className="ml-2 text-green-600">• Farm boundary set</span>}
            {activeTool && <span className="ml-2 text-blue-600">• Drawing: {activeTool}</span>}
          </p>
        </div>

        {/* Instructions overlay */}
        {activeTool === 'farm_boundary' && (
          <div className="absolute top-4 left-4 right-4 bg-blue-50 border border-blue-200 rounded-lg p-4 z-[1000]">
            <div className="flex items-center space-x-2 text-blue-700">
              <Square className="w-5 h-5" />
              <span className="font-medium">Drawing Farm Boundary</span>
            </div>
            <p className="text-sm text-blue-600 mt-1">
              Click on the map to draw your farm boundary. Fields within the boundary will be automatically selected.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

// Estate Setup Map Component with field selection enabled
function EstateSetupMapComponent({
  fields,
  selectedFields,
  onFieldSelect,
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
}: {
  fields: FieldData[]
  selectedFields: Set<string>
  onFieldSelect: (fieldId: string) => void
  activeTool?: string | null
  drawnAreas?: DrawnArea[]
  savedAreas?: DrawnArea[]
  selectedAreaId?: string | null
  hoveredAreaId?: string | null
  onAreaDrawn?: (area: DrawnArea) => void
  onAreaUpdated?: (areaId: string, newCoordinates: [number, number][]) => void
  onPolygonClick?: (areaId: string) => void
  onMapClick?: () => void
  onDrawingStart?: () => void
  onDrawingEnd?: () => void
}) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const fieldLayersRef = useRef<L.LayerGroup | null>(null)
  const fieldPolygonsRef = useRef<Map<string, L.Polygon>>(new Map())
  const [mapReady, setMapReady] = useState(false)
  const [currentLayer, setCurrentLayer] = useState('satellite')

  // Initialize map
  useEffect(() => {
    if (!mapRef.current) return

    try {
      console.log('🗺️ Initializing estate setup map...')

      const map = L.map(mapRef.current, {
        center: [-20.4400, 57.6500],
        zoom: 13,
        zoomControl: true,
        attributionControl: true
      })

      // Add satellite layer
      const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri',
        maxZoom: 19
      })
      satelliteLayer.addTo(map)

      // Initialize field layers
      const fieldLayers = L.layerGroup().addTo(map)
      fieldLayersRef.current = fieldLayers

      mapInstanceRef.current = map
      setMapReady(true)

      console.log('✅ Estate setup map initialized')
    } catch (error) {
      console.error('❌ Error initializing estate setup map:', error)
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
      }
    }
  }, [])

  // Update field visualization
  useEffect(() => {
    if (!fieldLayersRef.current || !mapInstanceRef.current || !mapReady) return

    console.log('🎨 Updating field visualization for estate setup...')

    // Clear existing field layers
    fieldLayersRef.current.clearLayers()
    fieldPolygonsRef.current.clear()

    fields.forEach(field => {
      if (field.coordinates && field.coordinates.length > 0) {
        // Convert coordinates to Leaflet format [lat, lng]
        const latlngs = field.coordinates.map(coord => [coord[1], coord[0]] as [number, number])

        const isSelected = selectedFields.has(field.field_id)

        // Create polygon with selection-based styling
        const polygon = L.polygon(latlngs, {
          color: isSelected ? '#22c55e' : '#6b7280',
          fillColor: isSelected ? '#22c55e' : '#6b7280',
          fillOpacity: isSelected ? 0.4 : 0.2,
          weight: isSelected ? 3 : 2,
          opacity: 0.8
        })

        // Enable field selection on click
        polygon.on('click', (e) => {
          e.originalEvent?.stopPropagation()
          console.log('🖱️ Field clicked:', field.field_id)
          onFieldSelect(field.field_id)
        })

        // Add hover effects
        polygon.on('mouseover', () => {
          if (!selectedFields.has(field.field_id)) {
            polygon.setStyle({
              fillOpacity: 0.3,
              weight: 3
            })
          }
        })

        polygon.on('mouseout', () => {
          if (!selectedFields.has(field.field_id)) {
            polygon.setStyle({
              fillOpacity: 0.2,
              weight: 2
            })
          }
        })

        // Add tooltip
        polygon.bindTooltip(`${field.field_name} (${field.area_hectares.toFixed(1)} ha)`, {
          permanent: false,
          direction: 'center'
        })

        fieldLayersRef.current!.addLayer(polygon)
        fieldPolygonsRef.current.set(field.field_id, polygon)
      }
    })

    console.log('✅ Field visualization updated')
  }, [fields, selectedFields, mapReady])

  return (
    <div className="w-full h-full relative">
      <div ref={mapRef} className="w-full h-full" />

      {/* Drawing Manager for boundary drawing */}
      {mapInstanceRef.current && mapReady && (
        <DrawingManager
          map={mapInstanceRef.current}
          fieldPolygons={fieldPolygonsRef.current}
          activeTool={activeTool || null}
          drawnAreas={drawnAreas}
          savedAreas={savedAreas}
          selectedAreaId={selectedAreaId}
          hoveredAreaId={hoveredAreaId}
          onAreaDrawn={onAreaDrawn || (() => {})}
          onAreaUpdated={onAreaUpdated}
          onPolygonClick={onPolygonClick}
          onMapClick={onMapClick}
          onDrawingStart={onDrawingStart || (() => {})}
          onDrawingEnd={onDrawingEnd || (() => {})}
          onDrawingProgress={() => {}}
        />
      )}

      {/* Layer Controls */}
      <div className="absolute top-4 right-4 z-[1000]">
        <LayerSelector
          currentLayer={currentLayer}
          onLayerChange={setCurrentLayer}
        />
      </div>
    </div>
  )
}
