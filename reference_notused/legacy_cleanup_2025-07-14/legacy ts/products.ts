export interface Product {
  id: string
  name: string
  category: ProductCategory
  description?: string
  unit: string
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

export const PRODUCTS: Product[] = [
  // Compound and NPK Fertilizers
  { id: 'npk-13-13-20', name: '13-13-20+2MgO', category: 'compound-npk', unit: 'kg', defaultRate: 250, cost: 45 },
  { id: 'npk-13-8-24', name: '13:8:24', category: 'compound-npk', unit: 'kg', defaultRate: 250, cost: 42 },
  { id: 'npk-12-8-20', name: '12:8:20', category: 'compound-npk', unit: 'kg', defaultRate: 250, cost: 40 },
  { id: 'npk-12-12-17', name: '12:12:17', category: 'compound-npk', unit: 'kg', defaultRate: 250, cost: 38 },
  { id: 'npk-19-19-19', name: '19:19:19', category: 'compound-npk', unit: 'kg', defaultRate: 200, cost: 50 },
  { id: 'npk-20-20-20', name: '20:20:20', category: 'compound-npk', unit: 'kg', defaultRate: 200, cost: 52 },
  { id: 'npk-8-10-40', name: '8:10:40', category: 'compound-npk', unit: 'kg', defaultRate: 300, cost: 48 },
  { id: 'npk-11-8-6', name: '11-8-6 (Co-Vert)', category: 'compound-npk', unit: 'kg', defaultRate: 300, cost: 35 },
  { id: 'npk-nitrate-blends', name: 'Nitrate Based NPK Blends', category: 'compound-npk', unit: 'kg', defaultRate: 250, cost: 55 },
  { id: 'azophoska', name: 'Azophoska (13-13-20+2 micro)', category: 'compound-npk', unit: 'kg', defaultRate: 250, cost: 48 },
  { id: 'bluefficient', name: 'Bluefficient Fertilizer (10-10-20+2MgO+micro)', category: 'compound-npk', unit: 'kg', defaultRate: 250, cost: 50 },
  { id: 'fairway-master', name: 'Fairway Master', category: 'compound-npk', unit: 'kg', defaultRate: 200, cost: 60 },
  { id: 'icl-sierrablen', name: 'ICL Sierrablen Plus Granular Fertiliser', category: 'compound-npk', unit: 'kg', defaultRate: 200, cost: 65 },

  // Nitrogen Fertilizers
  { id: 'ammonium-sulphate-crystal', name: 'Ammonium Sulphate 21% (Crystal)', category: 'nitrogen', unit: 'kg', defaultRate: 150, cost: 25 },
  { id: 'ammonium-sulphate-granular', name: 'Ammonium Sulphate 21% (Granular)', category: 'nitrogen', unit: 'kg', defaultRate: 150, cost: 27 },
  { id: 'urea-46', name: 'Urea (46% N, Granular)', category: 'nitrogen', unit: 'kg', defaultRate: 130, cost: 30 },
  { id: 'nano-urea-plus', name: 'NANO Urea Plus (Kalol)', category: 'nitrogen', unit: 'L', defaultRate: 2, cost: 120 },
  { id: 'nano-dap', name: 'NANO DAP', category: 'nitrogen', unit: 'L', defaultRate: 2, cost: 125 },

  // Phosphorus and Potassium Fertilizers
  { id: 'map', name: 'Monoammonium Phosphate (MAP)', category: 'phosphorus-potassium', unit: 'kg', defaultRate: 100, cost: 55 },
  { id: 'mkp', name: 'Mono Potassium Phosphate (MKP, 0-52-34)', category: 'phosphorus-potassium', unit: 'kg', defaultRate: 50, cost: 85 },
  { id: 'potassium-nitrate', name: 'Potassium Nitrate', category: 'phosphorus-potassium', unit: 'kg', defaultRate: 75, cost: 90 },
  { id: 'potassium-sulphate', name: 'Potassium Sulphate (SOP, 0-0-50+46SO3)', category: 'phosphorus-potassium', unit: 'kg', defaultRate: 100, cost: 80 },

  // Calcium and Magnesium Fertilizers
  { id: 'nova-calcium-nitrate', name: 'Nova Calcium Nitrate (15.5-0-0+26.5CaO)', category: 'calcium-magnesium', unit: 'kg', defaultRate: 100, cost: 45 },
  { id: 'nova-mag-s', name: 'Nova Mag-S (Magnesium Sulphate, 0-0-0+16MgO+32SO3)', category: 'calcium-magnesium', unit: 'kg', defaultRate: 50, cost: 40 },

  // Micronutrient and Specialty Fertilizers
  { id: 'micro-kanieltra', name: 'Micro elements (Kanieltra)', category: 'micronutrient', unit: 'kg', defaultRate: 5, cost: 150 },
  { id: 'unikey-11-40-10', name: 'Unikey Nano Professional 11-40-10+2.5MgO+TE', category: 'micronutrient', unit: 'kg', defaultRate: 2, cost: 180 },
  { id: 'unikey-15-5-40', name: 'Unikey Nano Professional 15-5-40+TE', category: 'micronutrient', unit: 'kg', defaultRate: 2, cost: 175 },
  { id: 'unikey-20-20-20', name: 'Unikey Nano Professional 20-20-20+2MgO+TE', category: 'micronutrient', unit: 'kg', defaultRate: 2, cost: 185 },
  { id: 'hydro-pack-1', name: 'Hydro Pack No. 1', category: 'micronutrient', unit: 'kg', defaultRate: 1, cost: 200 },
  { id: 'hydro-pack-2', name: 'Hydro Pack No. 2', category: 'micronutrient', unit: 'kg', defaultRate: 1, cost: 200 },
  { id: 'hydro-pack-3', name: 'Hydro Pack No. 3', category: 'micronutrient', unit: 'kg', defaultRate: 1, cost: 200 },

  // Organic and Bio Fertilizers
  { id: 'organic-all-purpose', name: 'All-purpose Organic Fertiliser', category: 'organic-bio', unit: 'kg', defaultRate: 500, cost: 20 },
  { id: 'bat-guano', name: 'Bat Guano Fertilizer', category: 'organic-bio', unit: 'kg', defaultRate: 200, cost: 35 },
  { id: 'seabird-guano', name: 'Seabird Guano', category: 'organic-bio', unit: 'kg', defaultRate: 200, cost: 40 },
  { id: 'seaweed-powder', name: 'Fresh Seaweed and Sargassum (Powder)', category: 'organic-bio', unit: 'kg', defaultRate: 100, cost: 25 },
  { id: 'seaweed-liquid', name: 'Fresh Seaweed and Sargassum (Liquid)', category: 'organic-bio', unit: 'L', defaultRate: 10, cost: 30 },
  { id: 'organic-mineral-liquid', name: 'Organic Mineral Liquid Fertilizers (Made in Moris)', category: 'organic-bio', unit: 'L', defaultRate: 5, cost: 45 },

  // Other Fertilizer Products
  { id: 'phostrogen', name: 'Phostrogen (800g)', category: 'other', unit: 'pack', defaultRate: 1, cost: 85 },
  { id: 'agroleaf-power', name: 'Agroleaf Power', category: 'other', unit: 'kg', defaultRate: 2, cost: 120 },
  { id: 'agroleaf-power-high-p', name: 'Agroleaf Power High P', category: 'other', unit: 'kg', defaultRate: 2, cost: 125 },
  { id: 'agroblen', name: 'Agroblen', category: 'other', unit: 'kg', defaultRate: 100, cost: 95 }
]
