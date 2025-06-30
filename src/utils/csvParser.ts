import { FieldData, GeoJSONFeatureCollection, GeoJSONFeature } from '@/types/field'

/**
 * Parse CSV field data into FieldData objects
 */
export function parseFieldCSV(csvText: string): FieldData[] {
  const lines = csvText.trim().split('\n')
  const headers = lines[0].split(',')
  
  return lines.slice(1).map(line => {
    const values = parseCSVLine(line)
    const field: any = {}
    
    headers.forEach((header, index) => {
      const key = header.trim()
      let value = values[index]?.trim() || ''
      
      // Parse coordinates from string format
      if (key === 'coordinates') {
        try {
          // Remove quotes and parse JSON array
          value = value.replace(/^"|"$/g, '')
          field[key] = JSON.parse(value)
        } catch (error) {
          console.error(`Error parsing coordinates for field ${field.field_id}:`, error)
          field[key] = []
        }
      }
      // Parse numeric values
      else if (key === 'area_hectares') {
        field[key] = parseFloat(value) || 0
      }
      // Handle status enum
      else if (key === 'status') {
        field[key] = value === 'Active' ? 'Active' : 'Inactive'
      }
      // String values
      else {
        field[key] = value
      }
    })
    
    return field as FieldData
  })
}

/**
 * Parse a single CSV line, handling quoted values
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    
    if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === ',' && !inQuotes) {
      result.push(current)
      current = ''
    } else {
      current += char
    }
  }
  
  result.push(current)
  return result
}

/**
 * Calculate area of a polygon using the shoelace formula
 */
function calculatePolygonArea(coordinates: [number, number][]): number {
  if (coordinates.length < 3) return 0

  let area = 0
  const n = coordinates.length

  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n
    area += coordinates[i][0] * coordinates[j][1]
    area -= coordinates[j][0] * coordinates[i][1]
  }

  // Convert to hectares (approximate conversion from decimal degrees)
  // This is a rough approximation - for precise calculations, use proper geodetic methods
  const areaInSquareMeters = Math.abs(area) * 0.5 * 111320 * 111320 * Math.cos(coordinates[0][1] * Math.PI / 180)
  return areaInSquareMeters / 10000 // Convert to hectares
}

/**
 * Convert GeoJSON feature to FieldData
 */
function convertGeoJSONToFieldData(feature: GeoJSONFeature): FieldData {
  const coordinates = feature.geometry.coordinates[0] // Get outer ring of polygon
  const area = calculatePolygonArea(coordinates)

  return {
    field_id: feature.properties.id,
    field_name: feature.properties.id, // Use ID as name for now
    coordinates: coordinates,
    area_hectares: area,
    crop_type: 'Unassigned', // Default value
    status: 'Active', // Default to active
    osm_id: feature.properties.osm_id
  }
}

/**
 * Load field data from GeoJSON file
 */
export async function loadFieldData(geoJsonPath: string = '/estate_fields.geojson'): Promise<FieldData[]> {
  try {
    console.log('Loading field data from:', geoJsonPath)
    const response = await fetch(geoJsonPath)
    if (!response.ok) {
      throw new Error(`Failed to load GeoJSON: ${response.statusText}`)
    }

    const geoJsonData: GeoJSONFeatureCollection = await response.json()
    console.log('Loaded GeoJSON with', geoJsonData.features.length, 'features')

    const fieldData = geoJsonData.features.map(convertGeoJSONToFieldData)
    console.log('Converted to', fieldData.length, 'field records')

    return fieldData
  } catch (error) {
    console.error('Error loading field data:', error)
    return []
  }
}

/**
 * Load field data from CSV file (legacy function for backward compatibility)
 */
export async function loadFieldDataFromCSV(csvPath: string = '/sample-fields.csv'): Promise<FieldData[]> {
  try {
    const response = await fetch(csvPath)
    if (!response.ok) {
      throw new Error(`Failed to load CSV: ${response.statusText}`)
    }

    const csvText = await response.text()
    return parseFieldCSV(csvText)
  } catch (error) {
    console.error('Error loading field data:', error)
    return []
  }
}
