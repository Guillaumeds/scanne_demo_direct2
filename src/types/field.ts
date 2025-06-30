// Type definitions for field data
export interface FieldData {
  field_id: string
  field_name: string
  coordinates: [number, number][] // Array of [longitude, latitude] pairs
  area_hectares: number
  crop_type: string
  status: 'Active' | 'Inactive'
  osm_id?: number // Optional OSM ID from the original data
}

export interface FieldProperties {
  field_id: string
  field_name: string
  area_hectares: number
  crop_type: string
  status: 'Active' | 'Inactive'
  osm_id?: number
}

// GeoJSON types for loading real field data
export interface GeoJSONFeature {
  type: 'Feature'
  properties: {
    id: string
    osm_id: number
  }
  geometry: {
    type: 'Polygon'
    coordinates: [number, number][][]
  }
}

export interface GeoJSONFeatureCollection {
  type: 'FeatureCollection'
  features: GeoJSONFeature[]
}

// Map interaction types
export interface MapClickEvent {
  field?: FieldData
  latlng: [number, number]
}

export interface FieldSelectionState {
  selectedFields: string[] // Array of field IDs
  activeField?: string // Currently highlighted field
}
