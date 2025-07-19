/**
 * Master Data: Products
 * Static reference data for agricultural products used in demo
 */

export interface Product {
  id: string
  name: string
  category: 'fertilizer' | 'pesticide' | 'herbicide' | 'fungicide' | 'growth_regulator' | 'soil_amendment'
  type: string
  brand?: string
  activeIngredient?: string
  concentration?: string
  unit: string
  costPerUnit: number
  applicationRate: {
    min: number
    max: number
    unit: string
  }
  safetyPeriod: number // days before harvest
  restrictions: string[]
  storageRequirements: string[]
  active: boolean
  createdAt: string
  updatedAt: string
}

export const PRODUCTS: Product[] = [
  // Fertilizers
  {
    id: 'prod-001',
    name: 'NPK 12-12-17+2MgO+TE',
    category: 'fertilizer',
    type: 'Compound Fertilizer',
    brand: 'Yara',
    activeIngredient: 'NPK with Magnesium and Trace Elements',
    concentration: '12-12-17+2MgO+TE',
    unit: 'kg',
    costPerUnit: 45.50,
    applicationRate: {
      min: 200,
      max: 400,
      unit: 'kg/ha'
    },
    safetyPeriod: 0,
    restrictions: [],
    storageRequirements: ['Keep dry', 'Store in cool place', 'Avoid direct sunlight'],
    active: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'prod-002',
    name: 'Urea 46%',
    category: 'fertilizer',
    type: 'Nitrogen Fertilizer',
    activeIngredient: 'Urea',
    concentration: '46% N',
    unit: 'kg',
    costPerUnit: 28.75,
    applicationRate: {
      min: 100,
      max: 250,
      unit: 'kg/ha'
    },
    safetyPeriod: 0,
    restrictions: [],
    storageRequirements: ['Keep dry', 'Store in ventilated area'],
    active: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },

  // Pesticides
  {
    id: 'prod-003',
    name: 'Regent 800WG',
    category: 'pesticide',
    type: 'Insecticide',
    brand: 'BASF',
    activeIngredient: 'Fipronil',
    concentration: '800g/kg',
    unit: 'g',
    costPerUnit: 2.85,
    applicationRate: {
      min: 25,
      max: 50,
      unit: 'g/ha'
    },
    safetyPeriod: 14,
    restrictions: ['Do not apply during flowering', 'Avoid drift to water bodies'],
    storageRequirements: ['Store in original container', 'Keep away from children', 'Store below 30°C'],
    active: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },

  // Herbicides
  {
    id: 'prod-004',
    name: 'Roundup PowerMAX',
    category: 'herbicide',
    type: 'Non-selective Herbicide',
    brand: 'Bayer',
    activeIngredient: 'Glyphosate',
    concentration: '540g/L',
    unit: 'L',
    costPerUnit: 18.90,
    applicationRate: {
      min: 2,
      max: 6,
      unit: 'L/ha'
    },
    safetyPeriod: 7,
    restrictions: ['Do not spray in windy conditions', 'Avoid contact with crop'],
    storageRequirements: ['Store in original container', 'Keep away from food', 'Store upright'],
    active: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },

  // Fungicides
  {
    id: 'prod-005',
    name: 'Amistar Top',
    category: 'fungicide',
    type: 'Systemic Fungicide',
    brand: 'Syngenta',
    activeIngredient: 'Azoxystrobin + Difenoconazole',
    concentration: '200+125g/L',
    unit: 'L',
    costPerUnit: 95.50,
    applicationRate: {
      min: 0.5,
      max: 1.0,
      unit: 'L/ha'
    },
    safetyPeriod: 21,
    restrictions: ['Maximum 2 applications per season', 'Do not apply before rain'],
    storageRequirements: ['Store in original container', 'Keep cool and dry', 'Protect from frost'],
    active: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },

  // Growth Regulators
  {
    id: 'prod-006',
    name: 'Moddus',
    category: 'growth_regulator',
    type: 'Plant Growth Regulator',
    brand: 'Syngenta',
    activeIngredient: 'Trinexapac-ethyl',
    concentration: '250g/L',
    unit: 'L',
    costPerUnit: 125.00,
    applicationRate: {
      min: 0.2,
      max: 0.4,
      unit: 'L/ha'
    },
    safetyPeriod: 30,
    restrictions: ['Apply only during active growth', 'Do not apply under stress conditions'],
    storageRequirements: ['Store in original container', 'Keep away from heat', 'Store upright'],
    active: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },

  // Soil Amendments
  {
    id: 'prod-007',
    name: 'Agricultural Lime',
    category: 'soil_amendment',
    type: 'pH Adjuster',
    activeIngredient: 'Calcium Carbonate',
    concentration: '95% CaCO3',
    unit: 'kg',
    costPerUnit: 12.50,
    applicationRate: {
      min: 500,
      max: 2000,
      unit: 'kg/ha'
    },
    safetyPeriod: 0,
    restrictions: [],
    storageRequirements: ['Keep dry', 'Store in covered area'],
    active: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }
]

// Utility functions for product data
export const productUtils = {
  getById: (id: string) => PRODUCTS.find(p => p.id === id),
  getByCategory: (category: Product['category']) => PRODUCTS.filter(p => p.category === category),
  getActive: () => PRODUCTS.filter(p => p.active),
  getFertilizers: () => PRODUCTS.filter(p => p.category === 'fertilizer'),
  getPesticides: () => PRODUCTS.filter(p => p.category === 'pesticide'),
  getHerbicides: () => PRODUCTS.filter(p => p.category === 'herbicide'),
  getFungicides: () => PRODUCTS.filter(p => p.category === 'fungicide'),
  searchByName: (query: string) => PRODUCTS.filter(p => 
    p.name.toLowerCase().includes(query.toLowerCase())
  ),
}
