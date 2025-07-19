/**
 * Master Data: Products
 * Exact data from CSV: products_md.csv
 */

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

export const PRODUCTS: Product[] = [
  // Exact data from CSV: products_md.csv - ALL 40 PRODUCTS
  {
    id: 'npk-13-13-20',
    product_id: 'npk-13-13-20',
    name: '13-13-20+2MgO',
    category: 'Compound and NPK Fertilizers',
    subcategory: 'compound-npk',
    description: null,
    unit: 'kg',
    cost_per_unit: 45,
    active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'npk-13-8-24',
    product_id: 'npk-13-8-24',
    name: '13:08:24',
    category: 'Compound and NPK Fertilizers',
    subcategory: 'compound-npk',
    description: null,
    unit: 'kg',
    cost_per_unit: 42,
    active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'npk-12-8-20',
    product_id: 'npk-12-8-20',
    name: '12:08:20',
    category: 'Compound and NPK Fertilizers',
    subcategory: 'compound-npk',
    description: null,
    unit: 'kg',
    cost_per_unit: 40,
    active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'npk-12-12-17',
    product_id: 'npk-12-12-17',
    name: '12:12:17',
    category: 'Compound and NPK Fertilizers',
    subcategory: 'compound-npk',
    description: null,
    unit: 'kg',
    cost_per_unit: 38,
    active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'npk-19-19-19',
    product_id: 'npk-19-19-19',
    name: '19:19:19',
    category: 'Compound and NPK Fertilizers',
    subcategory: 'compound-npk',
    description: null,
    unit: 'kg',
    cost_per_unit: 50,
    active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'npk-20-20-20',
    product_id: 'npk-20-20-20',
    name: '20:20:20',
    category: 'Compound and NPK Fertilizers',
    subcategory: 'compound-npk',
    description: null,
    unit: 'kg',
    cost_per_unit: 52,
    active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'npk-8-10-40',
    product_id: 'npk-8-10-40',
    name: '08:10:40',
    category: 'Compound and NPK Fertilizers',
    subcategory: 'compound-npk',
    description: null,
    unit: 'kg',
    cost_per_unit: 48,
    active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'npk-11-8-6',
    product_id: 'npk-11-8-6',
    name: '11-8-6 (Co-Vert)',
    category: 'Compound and NPK Fertilizers',
    subcategory: 'compound-npk',
    description: null,
    unit: 'kg',
    cost_per_unit: 35,
    active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'npk-nitrate-blends',
    product_id: 'npk-nitrate-blends',
    name: 'Nitrate Based NPK Blends',
    category: 'Compound and NPK Fertilizers',
    subcategory: 'compound-npk',
    description: null,
    unit: 'kg',
    cost_per_unit: 55,
    active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'azophoska',
    product_id: 'azophoska',
    name: 'Azophoska (13-13-20+2 micro)',
    category: 'Compound and NPK Fertilizers',
    subcategory: 'compound-npk',
    description: null,
    unit: 'kg',
    cost_per_unit: 48,
    active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'bluefficient',
    product_id: 'bluefficient',
    name: 'Bluefficient Fertilizer (10-10-20+2MgO+micro)',
    category: 'Compound and NPK Fertilizers',
    subcategory: 'compound-npk',
    description: null,
    unit: 'kg',
    cost_per_unit: 50,
    active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'fairway-master',
    product_id: 'fairway-master',
    name: 'Fairway Master',
    category: 'Compound and NPK Fertilizers',
    subcategory: 'compound-npk',
    description: null,
    unit: 'kg',
    cost_per_unit: 60,
    active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'icl-sierrablen',
    product_id: 'icl-sierrablen',
    name: 'ICL Sierrablen Plus Granular Fertiliser',
    category: 'Compound and NPK Fertilizers',
    subcategory: 'compound-npk',
    description: null,
    unit: 'kg',
    cost_per_unit: 65,
    active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  // Nitrogen Fertilizers
  {
    id: 'ammonium-sulphate-crystal',
    product_id: 'ammonium-sulphate-crystal',
    name: 'Ammonium Sulphate 21% (Crystal)',
    category: 'Nitrogen Fertilizers',
    subcategory: 'nitrogen',
    description: null,
    unit: 'kg',
    cost_per_unit: 25,
    active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'ammonium-sulphate-granular',
    product_id: 'ammonium-sulphate-granular',
    name: 'Ammonium Sulphate 21% (Granular)',
    category: 'Nitrogen Fertilizers',
    subcategory: 'nitrogen',
    description: null,
    unit: 'kg',
    cost_per_unit: 27,
    active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'urea-46',
    product_id: 'urea-46',
    name: 'Urea (46% N Granular)',
    category: 'Nitrogen Fertilizers',
    subcategory: 'nitrogen',
    description: null,
    unit: 'kg',
    cost_per_unit: 30,
    active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'nano-urea-plus',
    product_id: 'nano-urea-plus',
    name: 'NANO Urea Plus (Kalol)',
    category: 'Nitrogen Fertilizers',
    subcategory: 'nitrogen',
    description: null,
    unit: 'L',
    cost_per_unit: 120,
    active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'nano-dap',
    product_id: 'nano-dap',
    name: 'NANO DAP',
    category: 'Nitrogen Fertilizers',
    subcategory: 'nitrogen',
    description: null,
    unit: 'L',
    cost_per_unit: 125,
    active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  // Phosphorus and Potassium Fertilizers
  {
    id: 'map',
    product_id: 'map',
    name: 'Monoammonium Phosphate (MAP)',
    category: 'Phosphorus and Potassium Fertilizers',
    subcategory: 'phosphorus-potassium',
    description: null,
    unit: 'kg',
    cost_per_unit: 55,
    active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'mkp',
    product_id: 'mkp',
    name: 'Mono Potassium Phosphate (MKP 0-52-34)',
    category: 'Phosphorus and Potassium Fertilizers',
    subcategory: 'phosphorus-potassium',
    description: null,
    unit: 'kg',
    cost_per_unit: 85,
    active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'potassium-nitrate',
    product_id: 'potassium-nitrate',
    name: 'Potassium Nitrate',
    category: 'Phosphorus and Potassium Fertilizers',
    subcategory: 'phosphorus-potassium',
    description: null,
    unit: 'kg',
    cost_per_unit: 90,
    active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'potassium-sulphate',
    product_id: 'potassium-sulphate',
    name: 'Potassium Sulphate (SOP 0-0-50+46SO3)',
    category: 'Phosphorus and Potassium Fertilizers',
    subcategory: 'phosphorus-potassium',
    description: null,
    unit: 'kg',
    cost_per_unit: 80,
    active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  // Calcium and Magnesium Fertilizers
  {
    id: 'nova-calcium-nitrate',
    product_id: 'nova-calcium-nitrate',
    name: 'Nova Calcium Nitrate (15.5-0-0+26.5CaO)',
    category: 'Calcium and Magnesium Fertilizers',
    subcategory: 'calcium-magnesium',
    description: null,
    unit: 'kg',
    cost_per_unit: 45,
    active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'nova-mag-s',
    product_id: 'nova-mag-s',
    name: 'Nova Mag-S (Magnesium Sulphate 0-0-0+16MgO+32SO3)',
    category: 'Calcium and Magnesium Fertilizers',
    subcategory: 'calcium-magnesium',
    description: null,
    unit: 'kg',
    cost_per_unit: 40,
    active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  // Micronutrient and Specialty Fertilizers
  {
    id: 'micro-kanieltra',
    product_id: 'micro-kanieltra',
    name: 'Micro elements (Kanieltra)',
    category: 'Micronutrient and Specialty Fertilizers',
    subcategory: 'micronutrient',
    description: null,
    unit: 'kg',
    cost_per_unit: 150,
    active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'unikey-11-40-10',
    product_id: 'unikey-11-40-10',
    name: 'Unikey Nano Professional 11-40-10+2.5MgO+TE',
    category: 'Micronutrient and Specialty Fertilizers',
    subcategory: 'micronutrient',
    description: null,
    unit: 'kg',
    cost_per_unit: 180,
    active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'unikey-15-5-40',
    product_id: 'unikey-15-5-40',
    name: 'Unikey Nano Professional 15-5-40+TE',
    category: 'Micronutrient and Specialty Fertilizers',
    subcategory: 'micronutrient',
    description: null,
    unit: 'kg',
    cost_per_unit: 175,
    active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'unikey-20-20-20',
    product_id: 'unikey-20-20-20',
    name: 'Unikey Nano Professional 20-20-20+2MgO+TE',
    category: 'Micronutrient and Specialty Fertilizers',
    subcategory: 'micronutrient',
    description: null,
    unit: 'kg',
    cost_per_unit: 185,
    active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'hydro-pack-1',
    product_id: 'hydro-pack-1',
    name: 'Hydro Pack No. 1',
    category: 'Micronutrient and Specialty Fertilizers',
    subcategory: 'micronutrient',
    description: null,
    unit: 'kg',
    cost_per_unit: 200,
    active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'hydro-pack-2',
    product_id: 'hydro-pack-2',
    name: 'Hydro Pack No. 2',
    category: 'Micronutrient and Specialty Fertilizers',
    subcategory: 'micronutrient',
    description: null,
    unit: 'kg',
    cost_per_unit: 200,
    active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'hydro-pack-3',
    product_id: 'hydro-pack-3',
    name: 'Hydro Pack No. 3',
    category: 'Micronutrient and Specialty Fertilizers',
    subcategory: 'micronutrient',
    description: null,
    unit: 'kg',
    cost_per_unit: 200,
    active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  // Organic and Bio Fertilizers
  {
    id: 'organic-all-purpose',
    product_id: 'organic-all-purpose',
    name: 'All-purpose Organic Fertiliser',
    category: 'Organic and Bio Fertilizers',
    subcategory: 'organic-bio',
    description: null,
    unit: 'kg',
    cost_per_unit: 20,
    active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'bat-guano',
    product_id: 'bat-guano',
    name: 'Bat Guano Fertilizer',
    category: 'Organic and Bio Fertilizers',
    subcategory: 'organic-bio',
    description: null,
    unit: 'kg',
    cost_per_unit: 35,
    active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'seabird-guano',
    product_id: 'seabird-guano',
    name: 'Seabird Guano',
    category: 'Organic and Bio Fertilizers',
    subcategory: 'organic-bio',
    description: null,
    unit: 'kg',
    cost_per_unit: 40,
    active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'seaweed-powder',
    product_id: 'seaweed-powder',
    name: 'Fresh Seaweed and Sargassum (Powder)',
    category: 'Organic and Bio Fertilizers',
    subcategory: 'organic-bio',
    description: null,
    unit: 'kg',
    cost_per_unit: 25,
    active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'seaweed-liquid',
    product_id: 'seaweed-liquid',
    name: 'Fresh Seaweed and Sargassum (Liquid)',
    category: 'Organic and Bio Fertilizers',
    subcategory: 'organic-bio',
    description: null,
    unit: 'L',
    cost_per_unit: 30,
    active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'organic-mineral-liquid',
    product_id: 'organic-mineral-liquid',
    name: 'Organic Mineral Liquid Fertilizers (Made in Moris)',
    category: 'Organic and Bio Fertilizers',
    subcategory: 'organic-bio',
    description: null,
    unit: 'L',
    cost_per_unit: 45,
    active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  // Other Fertilizer Products
  {
    id: 'phostrogen',
    product_id: 'phostrogen',
    name: 'Phostrogen (800g)',
    category: 'Other Fertilizer Products',
    subcategory: 'other',
    description: null,
    unit: 'pack',
    cost_per_unit: 85,
    active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'agroleaf-power',
    product_id: 'agroleaf-power',
    name: 'Agroleaf Power',
    category: 'Other Fertilizer Products',
    subcategory: 'other',
    description: null,
    unit: 'kg',
    cost_per_unit: 120,
    active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }
]

// Utility functions for product data
export const productUtils = {
  getById: (id: string) => PRODUCTS.find(p => p.id === id),
  getByProductId: (product_id: string) => PRODUCTS.find(p => p.product_id === product_id),
  getByCategory: (category: string) => PRODUCTS.filter(p => p.category === category),
  getBySubcategory: (subcategory: string) => PRODUCTS.filter(p => p.subcategory === subcategory),
  getActive: () => PRODUCTS.filter(p => p.active === true),
  getCompoundNPK: () => PRODUCTS.filter(p => p.subcategory === 'compound-npk'),
  getNitrogen: () => PRODUCTS.filter(p => p.subcategory === 'nitrogen'),
  getPhosphorusPotassium: () => PRODUCTS.filter(p => p.subcategory === 'phosphorus-potassium'),
  getCalciumMagnesium: () => PRODUCTS.filter(p => p.subcategory === 'calcium-magnesium'),
  getMicronutrient: () => PRODUCTS.filter(p => p.subcategory === 'micronutrient'),
  getOrganicBio: () => PRODUCTS.filter(p => p.subcategory === 'organic-bio'),
  getOther: () => PRODUCTS.filter(p => p.subcategory === 'other'),
  searchByName: (query: string) => PRODUCTS.filter(p =>
    p.name.toLowerCase().includes(query.toLowerCase())
  ),
}
