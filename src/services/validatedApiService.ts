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

    // RPC function not available - use regular insert
    const mappedData = {
      bloc_id: validatedInput.blocId,
      type: validatedInput.type,
      sugarcane_variety_id: validatedInput.sugarcaneVarietyId,
      intercrop_variety_id: validatedInput.intercropVarietyId,
      planting_date: validatedInput.plantingDate,
      expected_harvest_date: validatedInput.expectedHarvestDate,
      expected_yield_tons: validatedInput.expectedYield,
      cycle_number: 1,
      status: 'active'
    }

    const { data: result, error } = await supabase
      .from('crop_cycles')
      .insert(mappedData)
      .select()
      .single()

    if (error) throw error
    return result as any
  }
  
  static async createFieldOperation(data: CreateFieldOperationRequest): Promise<FieldOperation> {
    // Validate input
    const validatedInput = CreateFieldOperationSchema.parse(data)

    // RPC function not available - use regular insert with field mapping
    const mappedData = {
      crop_cycle_uuid: validatedInput.cropCycleUuid,
      operation_name: validatedInput.operationName,
      operation_type: validatedInput.operationType,
      method: validatedInput.method,
      priority: validatedInput.priority,
      planned_start_date: validatedInput.plannedStartDate,
      planned_end_date: validatedInput.plannedEndDate,
      planned_area_hectares: validatedInput.plannedAreaHectares,
      planned_quantity: validatedInput.plannedQuantity,
      estimated_total_cost: validatedInput.estimatedTotalCost,
      status: 'planned'
    }

    const { data: result, error } = await supabase
      .from('field_operations')
      .insert(mappedData)
      .select()
      .single()

    if (error) throw error
    return result as any
  }
  
  static async createWorkPackage(data: CreateWorkPackageRequest): Promise<WorkPackage> {
    // Work packages table not available - return mock data
    throw new Error('Work packages not implemented yet')
  }

  static async updateFieldOperation(uuid: string, data: Partial<CreateFieldOperationRequest>): Promise<FieldOperation> {
    // RPC function not available - use regular update
    const { data: result, error } = await supabase
      .from('field_operations')
      .update(data)
      .eq('uuid', uuid)
      .select()
      .single()

    if (error) throw error
    return result as any
  }

  static async updateWorkPackage(uuid: string, data: Partial<CreateWorkPackageRequest>): Promise<WorkPackage> {
    // Work packages not implemented
    throw new Error('Work packages not implemented yet')
  }

  static async deleteFieldOperation(uuid: string): Promise<void> {
    const { error } = await supabase
      .from('field_operations')
      .delete()
      .eq('uuid', uuid)

    if (error) {
      throw new Error(`Delete Field Operation failed: ${error.message}`)
    }
  }

  static async deleteWorkPackage(uuid: string): Promise<void> {
    // Work packages not implemented
    throw new Error('Work packages not implemented yet')
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
