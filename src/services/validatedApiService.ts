/**
 * Validated API Service Layer
 * All API calls go through Zod validation for runtime type safety
 */

import { supabase } from '@/lib/supabase'
import { z } from 'zod'
import {
  FarmGISInitialDataSchema,
  BlocDataSchema,
  CropCycleSchema,
  FieldOperationSchema,
  WorkPackageSchema,
  ProductSchema,
  LabourSchema,
  SugarcaneVarietySchema,
  InterCropVarietySchema,
  CreateCropCycleSchema,
  CreateFieldOperationSchema,
  CreateWorkPackageSchema,
  FieldOperation,
  WorkPackage,
  type FarmGISInitialData,
  type BlocData,
  type CropCycle,
  type CreateCropCycleRequest,
  type CreateFieldOperationRequest,
  type CreateWorkPackageRequest,
} from '@/schemas/apiSchemas'

/**
 * Generic validated API call wrapper
 */
async function validateApiResponse<T>(
  apiCall: () => Promise<{ data: any; error: any }>,
  schema: z.ZodSchema<T>,
  operationName: string
): Promise<T> {
  try {
    console.log(`🔄 ${operationName}...`)
    
    const response = await apiCall()
    
    if (response.error) {
      console.error(`❌ ${operationName} failed:`, response.error)
      throw new Error(`${operationName} failed: ${response.error.message}`)
    }
    
    // Validate response with Zod
    const result = schema.safeParse(response.data)
    
    if (!result.success) {
      console.error(`❌ ${operationName} validation failed:`, result.error.issues)
      console.error('Raw response data:', response.data)
      throw new Error(`${operationName} returned invalid data structure`)
    }
    
    console.log(`✅ ${operationName} completed successfully`)
    return result.data
  } catch (error) {
    console.error(`❌ ${operationName} error:`, error)
    throw error
  }
}

export class ValidatedApiService {
  
  /**
   * Fetch initial farm GIS data (overview level)
   */
  static async fetchFarmGISInitialData(): Promise<FarmGISInitialData> {
    return validateApiResponse(
      async () => await supabase.rpc('get_farm_gis_initial_data'),
      FarmGISInitialDataSchema,
      'Fetch Farm GIS Initial Data'
    )
  }
  
  /**
   * Fetch comprehensive bloc data (bloc level)
   */
  static async fetchComprehensiveBlocData(blocId: string): Promise<BlocData> {
    return validateApiResponse(
      async () => await supabase.rpc('get_comprehensive_bloc_data', { p_bloc_id: blocId }),
      BlocDataSchema,
      `Fetch Comprehensive Bloc Data for ${blocId}`
    )
  }
  
  /**
   * Fetch configuration data with validation
   */
  static async fetchProducts() {
    return validateApiResponse(
      async () => await supabase.from('products').select('*').eq('active', true).order('name'),
      z.array(ProductSchema),
      'Fetch Products'
    )
  }
  
  static async fetchLabour() {
    return validateApiResponse(
      async () => await supabase.from('labour').select('*').eq('active', true).order('name'),
      z.array(LabourSchema),
      'Fetch Labour'
    )
  }
  
  static async fetchSugarcaneVarieties() {
    return validateApiResponse(
      async () => await supabase.from('sugarcane_varieties').select('*').order('name'),
      z.array(SugarcaneVarietySchema),
      'Fetch Sugarcane Varieties'
    )
  }
  
  static async fetchIntercropVarieties() {
    return validateApiResponse(
      async () => await supabase.from('intercrop_varieties').select('*').order('name'),
      z.array(InterCropVarietySchema),
      'Fetch Intercrop Varieties'
    )
  }
  
  /**
   * Validated mutation operations
   */
  static async createCropCycle(data: CreateCropCycleRequest): Promise<CropCycle> {
    // Validate input
    const validatedInput = CreateCropCycleSchema.parse(data)

    return validateApiResponse(
      async () => await supabase.rpc('create_crop_cycle', { p_cycle_data: validatedInput }),
      CropCycleSchema,
      'Create Crop Cycle'
    )
  }
  
  static async createFieldOperation(data: CreateFieldOperationRequest): Promise<FieldOperation> {
    // Validate input
    const validatedInput = CreateFieldOperationSchema.parse(data)
    
    return validateApiResponse(
      async () => await supabase.rpc('create_field_operation', { p_operation_data: validatedInput }),
      FieldOperationSchema,
      'Create Field Operation'
    )
  }
  
  static async createWorkPackage(data: CreateWorkPackageRequest): Promise<WorkPackage> {
    // Validate input
    const validatedInput = CreateWorkPackageSchema.parse(data)
    
    return validateApiResponse(
      async () => await supabase.rpc('create_work_package', { p_package_data: validatedInput }),
      WorkPackageSchema,
      'Create Work Package'
    )
  }
  
  static async updateFieldOperation(uuid: string, data: Partial<CreateFieldOperationRequest>): Promise<FieldOperation> {
    return validateApiResponse(
      async () => await supabase.rpc('update_field_operation', {
        p_operation_uuid: uuid,
        p_operation_data: data
      }),
      FieldOperationSchema,
      'Update Field Operation'
    )
  }
  
  static async updateWorkPackage(uuid: string, data: Partial<CreateWorkPackageRequest>): Promise<WorkPackage> {
    return validateApiResponse(
      async () => await supabase.rpc('update_work_package', {
        p_package_uuid: uuid,
        p_package_data: data
      }),
      WorkPackageSchema,
      'Update Work Package'
    )
  }
  
  static async deleteFieldOperation(uuid: string): Promise<void> {
    const response = await supabase.rpc('delete_field_operation', { p_operation_uuid: uuid })
    
    if (response.error) {
      throw new Error(`Delete Field Operation failed: ${response.error.message}`)
    }
  }
  
  static async deleteWorkPackage(uuid: string): Promise<void> {
    const response = await supabase.rpc('delete_work_package', { p_package_uuid: uuid })
    
    if (response.error) {
      throw new Error(`Delete Work Package failed: ${response.error.message}`)
    }
  }
  
  /**
   * Health check for API connectivity and validation
   */
  static async healthCheck(): Promise<{ status: 'ok' | 'error'; message: string }> {
    try {
      // Test basic connectivity
      const { data, error } = await supabase.from('companies').select('count').limit(1)
      
      if (error) {
        return { status: 'error', message: `Database connection failed: ${error.message}` }
      }
      
      return { status: 'ok', message: 'API service is healthy' }
    } catch (error) {
      return { 
        status: 'error', 
        message: `Health check failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
      }
    }
  }
}
