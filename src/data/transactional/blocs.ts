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
  coordinates?: { lat: number; lng: number }
  polygon?: Array<{ lat: number; lng: number }>
}

export const DEMO_BLOCS: Bloc[] = [
  // Exact data from CSV: fields_md.csv - ALL 10 FIELDS
  {
    id: 'field-001',
    field_id: 'field-001',
    name: 'North Field A',
    area: 12.5,
    location: 'Northern Section',
    soil_type: 'Clay Loam',
    irrigation_type: 'Drip Irrigation',
    slope_percentage: 2.5,
    drainage_status: 'Good',
    last_soil_test_date: '2024-01-15',
    ph_level: 6.8,
    organic_matter_percentage: 3.2,
    active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    coordinates: { lat: -20.1234, lng: 57.5678 },
    polygon: [
      { lat: -20.1234, lng: 57.5678 },
      { lat: -20.1244, lng: 57.5688 },
      { lat: -20.1254, lng: 57.5678 },
      { lat: -20.1244, lng: 57.5668 }
    ]
  },
  {
    id: 'field-002',
    field_id: 'field-002',
    name: 'South Field B',
    area: 18.3,
    location: 'Southern Section',
    soil_type: 'Sandy Loam',
    irrigation_type: 'Sprinkler System',
    slope_percentage: 1.8,
    drainage_status: 'Excellent',
    last_soil_test_date: '2024-02-10',
    ph_level: 7.1,
    organic_matter_percentage: 2.8,
    active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    coordinates: { lat: -20.1334, lng: 57.5778 },
    polygon: [
      { lat: -20.1334, lng: 57.5778 },
      { lat: -20.1354, lng: 57.5798 },
      { lat: -20.1374, lng: 57.5778 },
      { lat: -20.1354, lng: 57.5758 }
    ]
  },
  {
    id: 'field-003',
    field_id: 'field-003',
    name: 'East Field C',
    area: 15.7,
    location: 'Eastern Section',
    soil_type: 'Loam',
    irrigation_type: 'Flood Irrigation',
    slope_percentage: 3.2,
    drainage_status: 'Fair',
    last_soil_test_date: '2024-01-25',
    ph_level: 6.5,
    organic_matter_percentage: 3.5,
    active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    coordinates: { lat: -20.1434, lng: 57.5878 },
    polygon: [
      { lat: -20.1434, lng: 57.5878 },
      { lat: -20.1454, lng: 57.5898 },
      { lat: -20.1474, lng: 57.5878 },
      { lat: -20.1454, lng: 57.5858 }
    ]
  },
  {
    id: 'field-004',
    field_id: 'field-004',
    name: 'West Field D',
    area: 22.1,
    location: 'Western Section',
    soil_type: 'Clay',
    irrigation_type: 'Drip Irrigation',
    slope_percentage: 1.5,
    drainage_status: 'Poor',
    last_soil_test_date: '2024-03-05',
    ph_level: 7.3,
    organic_matter_percentage: 2.1,
    active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    coordinates: { lat: -20.1534, lng: 57.5978 },
    polygon: [
      { lat: -20.1534, lng: 57.5978 },
      { lat: -20.1564, lng: 57.6008 },
      { lat: -20.1594, lng: 57.5978 },
      { lat: -20.1564, lng: 57.5948 }
    ]
  },
  {
    id: 'field-005',
    field_id: 'field-005',
    name: 'Central Field E',
    area: 8.9,
    location: 'Central Section',
    soil_type: 'Silt Loam',
    irrigation_type: 'Micro Sprinkler',
    slope_percentage: 2.8,
    drainage_status: 'Good',
    last_soil_test_date: '2024-02-20',
    ph_level: 6.9,
    organic_matter_percentage: 4.1,
    active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    coordinates: { lat: -20.1634, lng: 57.6078 },
    polygon: [
      { lat: -20.1634, lng: 57.6078 },
      { lat: -20.1644, lng: 57.6088 },
      { lat: -20.1654, lng: 57.6078 },
      { lat: -20.1644, lng: 57.6068 }
    ]
  },
  {
    id: 'field-006',
    field_id: 'field-006',
    name: 'Upper Field F',
    area: 14.2,
    location: 'Upper Section',
    soil_type: 'Sandy Clay Loam',
    irrigation_type: 'Center Pivot',
    slope_percentage: 4.1,
    drainage_status: 'Excellent',
    last_soil_test_date: '2024-01-30',
    ph_level: 7.0,
    organic_matter_percentage: 3.0,
    active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    coordinates: { lat: -20.1734, lng: 57.6178 },
    polygon: [
      { lat: -20.1734, lng: 57.6178 },
      { lat: -20.1754, lng: 57.6198 },
      { lat: -20.1774, lng: 57.6178 },
      { lat: -20.1754, lng: 57.6158 }
    ]
  },
  {
    id: 'field-007',
    field_id: 'field-007',
    name: 'Lower Field G',
    area: 19.6,
    location: 'Lower Section',
    soil_type: 'Clay Loam',
    irrigation_type: 'Furrow Irrigation',
    slope_percentage: 1.2,
    drainage_status: 'Fair',
    last_soil_test_date: '2024-03-12',
    ph_level: 6.7,
    organic_matter_percentage: 2.9,
    active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    coordinates: { lat: -20.1834, lng: 57.6278 },
    polygon: [
      { lat: -20.1834, lng: 57.6278 },
      { lat: -20.1864, lng: 57.6308 },
      { lat: -20.1894, lng: 57.6278 },
      { lat: -20.1864, lng: 57.6248 }
    ]
  },
  {
    id: 'field-008',
    field_id: 'field-008',
    name: 'Hillside Field H',
    area: 11.4,
    location: 'Hillside Section',
    soil_type: 'Rocky Loam',
    irrigation_type: 'Drip Irrigation',
    slope_percentage: 6.5,
    drainage_status: 'Excellent',
    last_soil_test_date: '2024-02-28',
    ph_level: 6.4,
    organic_matter_percentage: 3.8,
    active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    coordinates: { lat: -20.1934, lng: 57.6378 },
    polygon: [
      { lat: -20.1934, lng: 57.6378 },
      { lat: -20.1944, lng: 57.6388 },
      { lat: -20.1954, lng: 57.6378 },
      { lat: -20.1944, lng: 57.6368 }
    ]
  },
  {
    id: 'field-009',
    field_id: 'field-009',
    name: 'Valley Field I',
    area: 25.8,
    location: 'Valley Section',
    soil_type: 'Alluvial Loam',
    irrigation_type: 'Flood Irrigation',
    slope_percentage: 0.8,
    drainage_status: 'Poor',
    last_soil_test_date: '2024-03-18',
    ph_level: 7.2,
    organic_matter_percentage: 4.5,
    active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    coordinates: { lat: -20.2034, lng: 57.6478 },
    polygon: [
      { lat: -20.2034, lng: 57.6478 },
      { lat: -20.2074, lng: 57.6518 },
      { lat: -20.2114, lng: 57.6478 },
      { lat: -20.2074, lng: 57.6438 }
    ]
  },
  {
    id: 'field-010',
    field_id: 'field-010',
    name: 'Plateau Field J',
    area: 16.3,
    location: 'Plateau Section',
    soil_type: 'Red Clay',
    irrigation_type: 'Sprinkler System',
    slope_percentage: 2.1,
    drainage_status: 'Good',
    last_soil_test_date: '2024-01-08',
    ph_level: 6.6,
    organic_matter_percentage: 2.7,
    active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    coordinates: { lat: -20.2134, lng: 57.6578 },
    polygon: [
      { lat: -20.2134, lng: 57.6578 },
      { lat: -20.2154, lng: 57.6598 },
      { lat: -20.2174, lng: 57.6578 },
      { lat: -20.2154, lng: 57.6558 }
    ]
  }
]

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
