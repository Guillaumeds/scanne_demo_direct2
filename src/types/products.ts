// Product type matching actual database schema
export interface Product {
  id: string
  product_id: string
  name: string
  category: string | null
  subcategory: string | null
  description: string | null
  unit: string | null
  cost_per_unit: number | null
  active: boolean | null
  created_at: string | null
  updated_at: string | null
  // Legacy fields for backward compatibility
  defaultRate?: number
  cost?: number
  brand?: string
  composition?: string
}

export type ProductCategory =
  | 'compound-npk'
  | 'nitrogen'
  | 'phosphorus-potassium'
  | 'calcium-magnesium'
  | 'micronutrient'
  | 'organic-bio'
  | 'other'

export const PRODUCT_CATEGORIES = [
  {
    id: 'compound-npk' as ProductCategory,
    name: 'Compound and NPK Fertilizers',
    icon: '🧪',
    color: 'bg-blue-100 text-blue-800 border-blue-200'
  },
  {
    id: 'nitrogen' as ProductCategory,
    name: 'Nitrogen Fertilizers',
    icon: '🌿',
    color: 'bg-green-100 text-green-800 border-green-200'
  },
  {
    id: 'phosphorus-potassium' as ProductCategory,
    name: 'Phosphorus and Potassium Fertilizers',
    icon: '⚡',
    color: 'bg-purple-100 text-purple-800 border-purple-200'
  },
  {
    id: 'calcium-magnesium' as ProductCategory,
    name: 'Calcium and Magnesium Fertilizers',
    icon: '🦴',
    color: 'bg-orange-100 text-orange-800 border-orange-200'
  },
  {
    id: 'micronutrient' as ProductCategory,
    name: 'Micronutrient and Specialty Fertilizers',
    icon: '💎',
    color: 'bg-indigo-100 text-indigo-800 border-indigo-200'
  },
  {
    id: 'organic-bio' as ProductCategory,
    name: 'Organic and Bio Fertilizers',
    icon: '🌱',
    color: 'bg-emerald-100 text-emerald-800 border-emerald-200'
  },
  {
    id: 'other' as ProductCategory,
    name: 'Other Fertilizer Products',
    icon: '📦',
    color: 'bg-gray-100 text-gray-800 border-gray-200'
  }
]


// ❌ REMOVED: Hardcoded PRODUCTS array
// Now using database-driven data via ConfigurationService.getProducts()
