/**
 * Master Data: Sugarcane Varieties
 * Static reference data for sugarcane varieties used in demo
 */

export interface SugarcaneVariety {
  id: string
  name: string
  code: string
  description: string
  maturityPeriod: number // months
  yieldPotential: number // tons per hectare
  sugarContent: number // percentage
  diseaseResistance: string[]
  climateAdaptation: string[]
  plantingRecommendations: {
    season: string[]
    spacing: string
    soilType: string[]
  }
  active: boolean
  createdAt: string
  updatedAt: string
}

export const SUGARCANE_VARIETIES: SugarcaneVariety[] = [
  {
    id: 'var-001',
    name: 'R570',
    code: 'R570',
    description: 'High-yielding variety with excellent sugar content and disease resistance',
    maturityPeriod: 12,
    yieldPotential: 85,
    sugarContent: 14.2,
    diseaseResistance: ['Smut', 'Red Rot', 'Mosaic'],
    climateAdaptation: ['Tropical', 'Sub-tropical'],
    plantingRecommendations: {
      season: ['March-May', 'September-November'],
      spacing: '1.2m x 0.6m',
      soilType: ['Loamy', 'Clay Loam', 'Sandy Loam']
    },
    active: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'var-002',
    name: 'R579',
    code: 'R579',
    description: 'Early maturing variety suitable for mechanized harvesting',
    maturityPeriod: 10,
    yieldPotential: 78,
    sugarContent: 13.8,
    diseaseResistance: ['Smut', 'Yellow Leaf'],
    climateAdaptation: ['Tropical'],
    plantingRecommendations: {
      season: ['March-May'],
      spacing: '1.5m x 0.5m',
      soilType: ['Loamy', 'Sandy Loam']
    },
    active: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'var-003',
    name: 'M1176/77',
    code: 'M1176',
    description: 'Drought-tolerant variety with good ratooning ability',
    maturityPeriod: 14,
    yieldPotential: 72,
    sugarContent: 15.1,
    diseaseResistance: ['Red Rot', 'Wilt'],
    climateAdaptation: ['Semi-arid', 'Tropical'],
    plantingRecommendations: {
      season: ['February-April', 'October-December'],
      spacing: '1.2m x 0.6m',
      soilType: ['Sandy', 'Sandy Loam', 'Clay']
    },
    active: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'var-004',
    name: 'R585',
    code: 'R585',
    description: 'High sugar content variety for premium sugar production',
    maturityPeriod: 13,
    yieldPotential: 80,
    sugarContent: 15.8,
    diseaseResistance: ['Smut', 'Mosaic', 'Red Rot'],
    climateAdaptation: ['Tropical', 'Sub-tropical'],
    plantingRecommendations: {
      season: ['March-May', 'September-October'],
      spacing: '1.2m x 0.6m',
      soilType: ['Loamy', 'Clay Loam']
    },
    active: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'var-005',
    name: 'R582',
    code: 'R582',
    description: 'Versatile variety suitable for various soil conditions',
    maturityPeriod: 11,
    yieldPotential: 76,
    sugarContent: 14.5,
    diseaseResistance: ['Yellow Leaf', 'Wilt'],
    climateAdaptation: ['Tropical'],
    plantingRecommendations: {
      season: ['March-June'],
      spacing: '1.3m x 0.6m',
      soilType: ['Loamy', 'Sandy Loam', 'Clay Loam']
    },
    active: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }
]

// Utility functions for variety data
export const varietyUtils = {
  getByCode: (code: string) => SUGARCANE_VARIETIES.find(v => v.code === code),
  getById: (id: string) => SUGARCANE_VARIETIES.find(v => v.id === id),
  getActive: () => SUGARCANE_VARIETIES.filter(v => v.active),
  getByMaturityPeriod: (months: number) => SUGARCANE_VARIETIES.filter(v => v.maturityPeriod <= months),
  getHighYield: (minYield: number = 80) => SUGARCANE_VARIETIES.filter(v => v.yieldPotential >= minYield),
  getHighSugar: (minSugar: number = 15) => SUGARCANE_VARIETIES.filter(v => v.sugarContent >= minSugar),
}
