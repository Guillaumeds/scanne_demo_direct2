/**
 * Master Data: Sugarcane Varieties
 * Exact data from CSV: sugarcane_varieties_md.csv
 */

export interface SugarcaneVariety {
  id: string
  variety_id: string
  name: string
  category: string
  description: string | null
  maturity_period_months: number
  yield_potential_tons_per_ha: number
  sugar_content_percentage: number
  disease_resistance: string | null
  climate_suitability: string | null
  planting_season: string | null
  active: boolean
  created_at: string | null
  updated_at: string | null
}

export const SUGARCANE_VARIETIES: SugarcaneVariety[] = [
  // Exact data from CSV: sugarcane_varieties_md.csv - ALL 15 VARIETIES
  {
    id: 'r570',
    variety_id: 'r570',
    name: 'R570',
    category: 'Commercial Variety',
    description: null,
    maturity_period_months: 12,
    yield_potential_tons_per_ha: 120,
    sugar_content_percentage: 14.5,
    disease_resistance: 'Moderate',
    climate_suitability: 'Tropical',
    planting_season: 'October-December',
    active: true,
    created_at: null,
    updated_at: null
  },
  {
    id: 'r579',
    variety_id: 'r579',
    name: 'R579',
    category: 'Commercial Variety',
    description: null,
    maturity_period_months: 12,
    yield_potential_tons_per_ha: 130,
    sugar_content_percentage: 15.2,
    disease_resistance: 'High',
    climate_suitability: 'Tropical',
    planting_season: 'October-December',
    active: true,
    created_at: null,
    updated_at: null
  },
  {
    id: 'r585',
    variety_id: 'r585',
    name: 'R585',
    category: 'Commercial Variety',
    description: null,
    maturity_period_months: 11,
    yield_potential_tons_per_ha: 125,
    sugar_content_percentage: 14.8,
    disease_resistance: 'Moderate',
    climate_suitability: 'Tropical',
    planting_season: 'October-December',
    active: true,
    created_at: null,
    updated_at: null
  },
  {
    id: 'r595',
    variety_id: 'r595',
    name: 'R595',
    category: 'Commercial Variety',
    description: null,
    maturity_period_months: 12,
    yield_potential_tons_per_ha: 135,
    sugar_content_percentage: 15.5,
    disease_resistance: 'High',
    climate_suitability: 'Tropical',
    planting_season: 'October-December',
    active: true,
    created_at: null,
    updated_at: null
  },
  {
    id: 'm1176-77',
    variety_id: 'm1176-77',
    name: 'M1176/77',
    category: 'Commercial Variety',
    description: null,
    maturity_period_months: 12,
    yield_potential_tons_per_ha: 110,
    sugar_content_percentage: 14.2,
    disease_resistance: 'Moderate',
    climate_suitability: 'Tropical',
    planting_season: 'October-December',
    active: true,
    created_at: null,
    updated_at: null
  },
  {
    id: 'm2593-92',
    variety_id: 'm2593-92',
    name: 'M2593/92',
    category: 'Commercial Variety',
    description: null,
    maturity_period_months: 11,
    yield_potential_tons_per_ha: 115,
    sugar_content_percentage: 14.0,
    disease_resistance: 'Low',
    climate_suitability: 'Tropical',
    planting_season: 'October-December',
    active: true,
    created_at: null,
    updated_at: null
  },
  {
    id: 'm3035-66',
    variety_id: 'm3035-66',
    name: 'M3035/66',
    category: 'Commercial Variety',
    description: null,
    maturity_period_months: 12,
    yield_potential_tons_per_ha: 105,
    sugar_content_percentage: 13.8,
    disease_resistance: 'Low',
    climate_suitability: 'Tropical',
    planting_season: 'October-December',
    active: true,
    created_at: null,
    updated_at: null
  },
  {
    id: 'co6806',
    variety_id: 'co6806',
    name: 'Co6806',
    category: 'Commercial Variety',
    description: null,
    maturity_period_months: 12,
    yield_potential_tons_per_ha: 140,
    sugar_content_percentage: 15.8,
    disease_resistance: 'High',
    climate_suitability: 'Tropical',
    planting_season: 'October-December',
    active: true,
    created_at: null,
    updated_at: null
  },
  {
    id: 'co86032',
    variety_id: 'co86032',
    name: 'Co86032',
    category: 'Commercial Variety',
    description: null,
    maturity_period_months: 11,
    yield_potential_tons_per_ha: 128,
    sugar_content_percentage: 15.0,
    disease_resistance: 'Moderate',
    climate_suitability: 'Tropical',
    planting_season: 'October-December',
    active: true,
    created_at: null,
    updated_at: null
  },
  {
    id: 'co997',
    variety_id: 'co997',
    name: 'Co997',
    category: 'Commercial Variety',
    description: null,
    maturity_period_months: 12,
    yield_potential_tons_per_ha: 118,
    sugar_content_percentage: 14.3,
    disease_resistance: 'Moderate',
    climate_suitability: 'Tropical',
    planting_season: 'October-December',
    active: true,
    created_at: null,
    updated_at: null
  },
  {
    id: 'nco376',
    variety_id: 'nco376',
    name: 'NCo376',
    category: 'Commercial Variety',
    description: null,
    maturity_period_months: 12,
    yield_potential_tons_per_ha: 100,
    sugar_content_percentage: 13.5,
    disease_resistance: 'Low',
    climate_suitability: 'Tropical',
    planting_season: 'October-December',
    active: true,
    created_at: null,
    updated_at: null
  },
  {
    id: 'cp72-2086',
    variety_id: 'cp72-2086',
    name: 'CP72-2086',
    category: 'Commercial Variety',
    description: null,
    maturity_period_months: 11,
    yield_potential_tons_per_ha: 122,
    sugar_content_percentage: 14.7,
    disease_resistance: 'Moderate',
    climate_suitability: 'Tropical',
    planting_season: 'October-December',
    active: true,
    created_at: null,
    updated_at: null
  },
  {
    id: 'sp70-1143',
    variety_id: 'sp70-1143',
    name: 'SP70-1143',
    category: 'Commercial Variety',
    description: null,
    maturity_period_months: 12,
    yield_potential_tons_per_ha: 132,
    sugar_content_percentage: 15.3,
    disease_resistance: 'High',
    climate_suitability: 'Tropical',
    planting_season: 'October-December',
    active: true,
    created_at: null,
    updated_at: null
  },
  {
    id: 'q117',
    variety_id: 'q117',
    name: 'Q117',
    category: 'Commercial Variety',
    description: null,
    maturity_period_months: 11,
    yield_potential_tons_per_ha: 126,
    sugar_content_percentage: 14.9,
    disease_resistance: 'Moderate',
    climate_suitability: 'Tropical',
    planting_season: 'October-December',
    active: true,
    created_at: null,
    updated_at: null
  },
  {
    id: 'q138',
    variety_id: 'q138',
    name: 'Q138',
    category: 'Commercial Variety',
    description: null,
    maturity_period_months: 12,
    yield_potential_tons_per_ha: 138,
    sugar_content_percentage: 15.6,
    disease_resistance: 'High',
    climate_suitability: 'Tropical',
    planting_season: 'October-December',
    active: true,
    created_at: null,
    updated_at: null
  }
]

// Utility functions for sugarcane variety data
export const varietyUtils = {
  getById: (id: string) => SUGARCANE_VARIETIES.find(v => v.id === id),
  getByVarietyId: (variety_id: string) => SUGARCANE_VARIETIES.find(v => v.variety_id === variety_id),
  getByCategory: (category: string) => SUGARCANE_VARIETIES.filter(v => v.category === category),
  getActive: () => SUGARCANE_VARIETIES.filter(v => v.active === true),
  getHighYield: () => SUGARCANE_VARIETIES.filter(v => v.yield_potential_tons_per_ha >= 130),
  getHighSugar: () => SUGARCANE_VARIETIES.filter(v => v.sugar_content_percentage >= 15.0),
  getHighResistance: () => SUGARCANE_VARIETIES.filter(v => v.disease_resistance === 'High'),
  getEarlyMaturity: () => SUGARCANE_VARIETIES.filter(v => v.maturity_period_months <= 11),
  searchByName: (query: string) => SUGARCANE_VARIETIES.filter(v => 
    v.name.toLowerCase().includes(query.toLowerCase())
  ),
}
