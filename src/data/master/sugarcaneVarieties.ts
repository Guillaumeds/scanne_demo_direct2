/**
 * Master Data: Sugarcane Varieties
 * Exact data from CSV: sugarcane_varieties_md.csv
 */

export interface SugarcaneVariety {
  id: string
  variety_id?: string
  name: string
  description?: string
  created_at?: string
  updated_at?: string
  // Additional fields from CSV
  category?: string
  category_enum?: string
  harvest_start_month?: string
  harvest_end_month?: string
  seasons?: string
  soil_types?: string
  sugar_content_percent?: string
  characteristics?: string
  icon?: string
  image_url?: string
  information_leaflet_url?: string
  active?: boolean
}

// Sugarcane varieties from sugarcane_varieties_md.csv
export const SUGARCANE_VARIETIES: SugarcaneVariety[] = [
  {
    id: 'm-1176-77',
    variety_id: 'm-1176-77',
    name: 'M 1176/77',
    description: '',
    category: 'Sugarcane Variety',
    category_enum: 'sugarcane',
    harvest_start_month: 'Aug',
    harvest_end_month: 'Sep',
    seasons: '{Aug,Sep}',
    soil_types: '{L1,L2,P1,P2,P3}',
    sugar_content_percent: '',
    characteristics: '{}',
    icon: '',
    image_url: '',
    information_leaflet_url: '',
    active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'm-52-78',
    variety_id: 'm-52-78',
    name: 'M 52/78',
    description: '',
    category: 'Sugarcane Variety',
    category_enum: 'sugarcane',
    harvest_start_month: 'Jun',
    harvest_end_month: 'Aug',
    seasons: '{Jun,Jul,Aug}',
    soil_types: '{B1,B2,F1,F2,H1,H2,L2}',
    sugar_content_percent: '',
    characteristics: '{}',
    icon: '',
    image_url: '',
    information_leaflet_url: '',
    active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'm-387-85',
    variety_id: 'm-387-85',
    name: 'M 387/85',
    description: '',
    category: 'Sugarcane Variety',
    category_enum: 'sugarcane',
    harvest_start_month: 'Jul',
    harvest_end_month: 'Oct',
    seasons: '{Jul,Aug,Sep,Oct}',
    soil_types: '{B1,B2}',
    sugar_content_percent: '',
    characteristics: '{}',
    icon: '',
    image_url: '',
    information_leaflet_url: '',
    active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'm-1400-86',
    variety_id: 'm-1400-86',
    name: 'M 1400/86',
    description: '',
    category: 'Sugarcane Variety',
    category_enum: 'sugarcane',
    harvest_start_month: 'Aug',
    harvest_end_month: 'Sep',
    seasons: '{Aug,Sep}',
    soil_types: '{B1,B2,F1,F2,H1,H2,L1,L2,P1,P2,P3}',
    sugar_content_percent: '',
    characteristics: '{}',
    icon: '',
    image_url: '',
    information_leaflet_url: '',
    active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'm-2256-88',
    variety_id: 'm-2256-88',
    name: 'M 2256/88',
    description: '',
    category: 'Sugarcane Variety',
    category_enum: 'sugarcane',
    harvest_start_month: 'Jun',
    harvest_end_month: 'Sep',
    seasons: '{Jun,Jul,Aug,Sep}',
    soil_types: '{B1,B2,F1,F2,H1,H2,L1,L2,P1,P2,P3}',
    sugar_content_percent: '',
    characteristics: '{}',
    icon: '',
    image_url: '',
    information_leaflet_url: '',
    active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'm-703-89',
    variety_id: 'm-703-89',
    name: 'M 703/89',
    description: '',
    category: 'Sugarcane Variety',
    category_enum: 'sugarcane',
    harvest_start_month: 'Jun',
    harvest_end_month: 'Jul',
    seasons: '{Jun,Jul}',
    soil_types: '{H1,H2,L1,L2}',
    sugar_content_percent: '',
    characteristics: '{}',
    icon: '',
    image_url: '',
    information_leaflet_url: '',
    active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'm-1861-89',
    variety_id: 'm-1861-89',
    name: 'M 1861/89',
    description: '',
    category: 'Sugarcane Variety',
    category_enum: 'sugarcane',
    harvest_start_month: 'Aug',
    harvest_end_month: 'Nov',
    seasons: '{Aug,Sep,Oct,Nov}',
    soil_types: '{B1,B2,F1,F2,H1,H2}',
    sugar_content_percent: '',
    characteristics: '{}',
    icon: '',
    image_url: '',
    information_leaflet_url: '',
    active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'm-1672-90',
    variety_id: 'm-1672-90',
    name: 'M 1672/90',
    description: '',
    category: 'Sugarcane Variety',
    category_enum: 'sugarcane',
    harvest_start_month: 'Aug',
    harvest_end_month: 'Nov',
    seasons: '{Aug,Sep,Oct,Nov}',
    soil_types: '{L1,L2,P1,P2,P3}',
    sugar_content_percent: '',
    characteristics: '{}',
    icon: '',
    image_url: '',
    information_leaflet_url: '',
    active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'm-2593-92',
    variety_id: 'm-2593-92',
    name: 'M 2593/92',
    description: '',
    category: 'Sugarcane Variety',
    category_enum: 'sugarcane',
    harvest_start_month: 'Aug',
    harvest_end_month: 'Nov',
    seasons: '{Aug,Sep,Oct,Nov}',
    soil_types: '{H1,H2,L1,L2,P1,P2,P3}',
    sugar_content_percent: '',
    characteristics: '{}',
    icon: '',
    image_url: '',
    information_leaflet_url: '/sugarcane_varieties_leaflets/m2593.pdf',
    active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }
]
