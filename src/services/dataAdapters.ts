/**
 * Data Transformation Adapters
 * Converts database rows to frontend interfaces
 * Handles field mapping, type conversion, and data transformation
 */

import { Database } from '@/types/supabase'
import { 
  SugarcaneVariety, 
  InterCropPlant, 
  CropVariety,
  Season 
} from '@/types/varieties'
import { Product, ProductCategory } from '@/types/products'
import { Resource, ResourceCategory } from '@/types/resources'

// Database type aliases for cleaner code
type DbSugarcaneVariety = Database['public']['Tables']['sugarcane_varieties']['Row']
type DbIntercropVariety = Database['public']['Tables']['intercrop_varieties']['Row']
type DbProduct = Database['public']['Tables']['products']['Row']
type DbResource = Database['public']['Tables']['labour']['Row']

/**
 * Transform database sugarcane variety to frontend interface
 */
export const transformDbSugarcaneVariety = (dbVariety: DbSugarcaneVariety): SugarcaneVariety => {
  return {
    id: dbVariety.id, // Use database ID
    name: dbVariety.name,
    description: dbVariety.description,
    created_at: dbVariety.created_at,
    updated_at: dbVariety.updated_at,
    // Legacy fields for backward compatibility
    uuid: dbVariety.id, // Add UUID for database operations
    category: 'sugarcane' as const,
    harvestStart: '',
    harvestEnd: '',
    seasons: [] as Season[],
    soilTypes: [],
    image: undefined,
    pdfUrl: undefined,
    characteristics: undefined
  }
}

/**
 * Transform database intercrop variety to frontend interface
 */
export const transformDbIntercropVariety = (dbVariety: DbIntercropVariety): InterCropPlant => {
  return {
    id: dbVariety.id, // Use database ID
    name: dbVariety.name,
    description: dbVariety.description,
    created_at: dbVariety.created_at,
    updated_at: dbVariety.updated_at,
    // Legacy fields for backward compatibility
    uuid: dbVariety.id, // Add UUID for database operations
    scientificName: undefined,
    category: 'intercrop' as const,
    benefits: [],
    plantingTime: undefined,
    harvestTime: undefined,
    image: undefined
  }
}

/**
 * Transform database product to frontend interface
 */
export const transformDbProduct = (dbProduct: DbProduct): Product => {
  return {
    id: dbProduct.id,
    product_id: dbProduct.product_id,
    name: dbProduct.name,
    category: dbProduct.category,
    subcategory: dbProduct.subcategory,
    description: dbProduct.description,
    unit: dbProduct.unit,
    cost_per_unit: dbProduct.cost_per_unit,
    active: dbProduct.active,
    created_at: dbProduct.created_at,
    updated_at: dbProduct.updated_at,
    // Legacy fields for backward compatibility
    defaultRate: (dbProduct as any).recommended_rate_per_ha || undefined,
    cost: dbProduct.cost_per_unit || undefined,
    brand: (dbProduct as any).brand || undefined,
    composition: (dbProduct as any).composition || undefined
  }
}

/**
 * Transform database resource to frontend interface
 */
export const transformDbResource = (dbResource: DbResource): Resource => {
  // Determine cost per unit - prefer cost_per_unit, fallback to cost_per_hour
  const costPerUnit = dbResource.cost_per_unit || (dbResource as any).cost_per_hour || undefined

  return {
    id: dbResource.id,
    labour_id: dbResource.labour_id,
    name: dbResource.name,
    category: dbResource.category,
    description: dbResource.description,
    unit: dbResource.unit,
    cost_per_unit: dbResource.cost_per_unit,
    active: dbResource.active,
    created_at: dbResource.created_at,
    updated_at: dbResource.updated_at,
    // Legacy fields for backward compatibility
    defaultRate: 1, // Default rate for resources (hours/units typically)
    costPerUnit,
    skillLevel: (dbResource as any).skill_level || undefined,
    overtimeMultiplier: (dbResource as any).overtime_multiplier || undefined
  }
}

/**
 * Transform mixed variety types to unified CropVariety array
 */
export const transformDbVarieties = (
  sugarcaneVarieties: DbSugarcaneVariety[],
  intercropVarieties: DbIntercropVariety[]
): CropVariety[] => {
  const transformedSugarcane = sugarcaneVarieties.map(transformDbSugarcaneVariety)
  const transformedIntercrop = intercropVarieties.map(transformDbIntercropVariety)
  
  return [...transformedSugarcane, ...transformedIntercrop]
}

/**
 * Error handling wrapper for transformations
 */
export const safeTransform = <T, R>(
  data: T[],
  transformer: (item: T) => R,
  errorMessage: string
): R[] => {
  try {
    return data.map(transformer)
  } catch (error) {
    console.error(`${errorMessage}:`, error)
    throw new Error(`Data transformation failed: ${errorMessage}`)
  }
}

/**
 * Validation helpers
 */
export const validateTransformedData = {
  /**
   * Validate that all required fields are present in transformed varieties
   */
  varieties: (varieties: CropVariety[]): boolean => {
    return varieties.every(variety => 
      variety.id && 
      variety.name && 
      variety.category &&
      (variety.category === 'sugarcane' || variety.category === 'intercrop')
    )
  },

  /**
   * Validate that all required fields are present in transformed products
   */
  products: (products: Product[]): boolean => {
    return products.every(product =>
      product.id &&
      product.name &&
      product.category &&
      product.unit
    )
  },

  /**
   * Validate that all required fields are present in transformed resources
   */
  resources: (resources: Resource[]): boolean => {
    return resources.every(resource =>
      resource.id &&
      resource.name &&
      resource.category &&
      resource.unit
    )
  }
}

/**
 * Batch transformation with validation
 */
export const transformAndValidate = {
  sugarcaneVarieties: (data: DbSugarcaneVariety[]): SugarcaneVariety[] => {
    const transformed = safeTransform(
      data, 
      transformDbSugarcaneVariety, 
      'Failed to transform sugarcane varieties'
    )
    
    if (!validateTransformedData.varieties(transformed)) {
      throw new Error('Transformed sugarcane varieties failed validation')
    }
    
    return transformed
  },

  intercropVarieties: (data: DbIntercropVariety[]): InterCropPlant[] => {
    const transformed = safeTransform(
      data,
      transformDbIntercropVariety,
      'Failed to transform intercrop varieties'
    )
    
    if (!validateTransformedData.varieties(transformed)) {
      throw new Error('Transformed intercrop varieties failed validation')
    }
    
    return transformed
  },

  products: (data: DbProduct[]): Product[] => {
    const transformed = safeTransform(
      data,
      transformDbProduct,
      'Failed to transform products'
    )
    
    if (!validateTransformedData.products(transformed)) {
      throw new Error('Transformed products failed validation')
    }
    
    return transformed
  },

  resources: (data: DbResource[]): Resource[] => {
    const transformed = safeTransform(
      data,
      transformDbResource,
      'Failed to transform resources'
    )
    
    if (!validateTransformedData.resources(transformed)) {
      throw new Error('Transformed resources failed validation')
    }
    
    return transformed
  }
}
