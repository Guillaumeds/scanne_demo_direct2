/**
 * Data Transformation Adapters
 * Converts database rows to frontend interfaces
 * Handles field mapping, type conversion, and data transformation
 */

import { Database } from '@/lib/database.types'
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
type DbResource = Database['public']['Tables']['resources']['Row']

/**
 * Transform database sugarcane variety to frontend interface
 */
export const transformDbSugarcaneVariety = (dbVariety: DbSugarcaneVariety): SugarcaneVariety => {
  return {
    id: dbVariety.variety_id, // Keep variety_id as the main identifier for UI
    uuid: dbVariety.id, // Add UUID for database operations
    name: dbVariety.name,
    category: 'sugarcane' as const,
    harvestStart: dbVariety.harvest_start_month || '',
    harvestEnd: dbVariety.harvest_end_month || '',
    seasons: (dbVariety.seasons || []) as Season[],
    soilTypes: dbVariety.soil_types || [],
    description: dbVariety.description || undefined,
    image: dbVariety.image_url || undefined,
    pdfUrl: dbVariety.information_leaflet_url || undefined,
    characteristics: dbVariety.characteristics as any || undefined
  }
}

/**
 * Transform database intercrop variety to frontend interface
 */
export const transformDbIntercropVariety = (dbVariety: DbIntercropVariety): InterCropPlant => {
  return {
    id: dbVariety.variety_id, // Keep variety_id as the main identifier for UI
    uuid: dbVariety.id, // Add UUID for database operations
    name: dbVariety.name,
    scientificName: dbVariety.scientific_name || undefined,
    category: 'intercrop' as const,
    benefits: dbVariety.benefits || [],
    plantingTime: dbVariety.planting_time || undefined,
    harvestTime: dbVariety.harvest_time || undefined,
    image: dbVariety.image_url || undefined,
    description: dbVariety.description || undefined
  }
}

/**
 * Transform database product to frontend interface
 */
export const transformDbProduct = (dbProduct: DbProduct): Product => {
  return {
    id: dbProduct.product_id,
    name: dbProduct.name,
    category: dbProduct.category as ProductCategory,
    description: dbProduct.description || undefined,
    unit: dbProduct.unit || '',
    defaultRate: dbProduct.recommended_rate_per_ha || undefined,
    cost: dbProduct.cost_per_unit || undefined,
    brand: dbProduct.brand || undefined,
    composition: dbProduct.composition || undefined
  }
}

/**
 * Transform database resource to frontend interface
 */
export const transformDbResource = (dbResource: DbResource): Resource => {
  // Determine cost per unit - prefer cost_per_unit, fallback to cost_per_hour
  const costPerUnit = dbResource.cost_per_unit || dbResource.cost_per_hour || undefined

  return {
    id: dbResource.resource_id,
    name: dbResource.name,
    category: dbResource.category as ResourceCategory,
    description: dbResource.description || undefined,
    unit: dbResource.unit || '',
    defaultRate: 1, // Default rate for resources (hours/units typically)
    costPerUnit,
    skillLevel: dbResource.skill_level || undefined,
    overtimeMultiplier: dbResource.overtime_multiplier || undefined
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
