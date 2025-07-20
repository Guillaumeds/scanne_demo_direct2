/**
 * Transactional Data: Blocs (Fields)
 * Exact data from CSV: fields_md.csv
 */

export interface Bloc {
  id: string
  field_id: string
  name: string
  area: number
  location: string | null
  soil_type: string | null
  irrigation_type: string | null
  slope_percentage: number | null
  drainage_status: string | null
  last_soil_test_date: string | null
  ph_level: number | null
  organic_matter_percentage: number | null
  active: boolean
  created_at: string | null
  updated_at: string | null
  // Additional computed fields
  coordinates?: [number, number][] | { lat: number; lng: number }
  polygon?: Array<{ lat: number; lng: number }>
  uuid?: string
  farmId?: string
  createdAt?: string
  updatedAt?: string
}

// Re-export types from their proper locations
export type { CropCycle, FieldOperation, WorkPackage } from '@/schemas/apiSchemas'
export type { BlocData } from '@/services/blocDataService'

export const DEMO_BLOCS: Bloc[] = [
  // No blocs in transactional data - fields are now displayed as map polygons
]

// Demo data for other types (empty arrays for now)
export const DEMO_CROP_CYCLES: any[] = []
export const DEMO_FIELD_OPERATIONS: any[] = []
export const DEMO_WORK_PACKAGES: any[] = []

// Utility functions for bloc data
export const blocUtils = {
  getById: (id: string) => DEMO_BLOCS.find(b => b.id === id),
  getByFieldId: (field_id: string) => DEMO_BLOCS.find(b => b.field_id === field_id),
  getActive: () => DEMO_BLOCS.filter(b => b.active === true),
  getBySoilType: (soil_type: string) => DEMO_BLOCS.filter(b => b.soil_type === soil_type),
  getByIrrigationType: (irrigation_type: string) => DEMO_BLOCS.filter(b => b.irrigation_type === irrigation_type),
  getByDrainageStatus: (drainage_status: string) => DEMO_BLOCS.filter(b => b.drainage_status === drainage_status),
  getLargeFields: () => DEMO_BLOCS.filter(b => b.area >= 20),
  getSmallFields: () => DEMO_BLOCS.filter(b => b.area < 15),
  getTotalArea: () => DEMO_BLOCS.reduce((total, bloc) => total + bloc.area, 0),
  searchByName: (query: string) => DEMO_BLOCS.filter(b => 
    b.name.toLowerCase().includes(query.toLowerCase())
  ),
}
