/**
 * Validated API Service Layer
 * Demo-only implementation - redirects to MockApiService
 */

import { MockApiService } from './mockApiService'
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
   * @deprecated Use MockApiService.getFarmGISInitialData() directly
   */
  static async fetchFarmGISInitialData(): Promise<any> {
    const response = await MockApiService.getFarmGISInitialData()
    return response.data
  }

  /**
   * Fetch comprehensive bloc data (bloc level)
   * @deprecated Use MockApiService.getComprehensiveBlocData() directly
   */
  static async fetchComprehensiveBlocData(blocId: string): Promise<any> {
    const response = await MockApiService.getComprehensiveBlocData(blocId)
    return response.data
  }
  
  /**
   * Fetch configuration data with validation
   * @deprecated Use MockApiService methods directly
   */
  static async fetchProducts() {
    const response = await MockApiService.getProducts()
    return response.data
  }

  static async fetchLabour() {
    const response = await MockApiService.getLabourTypes()
    return response.data
  }

  static async fetchSugarcaneVarieties() {
    const response = await MockApiService.getSugarcaneVarieties()
    return response.data
  }
  
  static async fetchIntercropVarieties() {
    // Demo mode returns empty array for intercrop varieties
    return []
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

    // Demo mode - not implemented
    throw new Error('Crop cycle creation not available in demo mode')
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

    // Demo mode - not implemented
    throw new Error('Field operation creation not available in demo mode')
  }
  
  static async createWorkPackage(data: CreateWorkPackageRequest): Promise<WorkPackage> {
    // Work packages table not available - return mock data
    throw new Error('Work packages not implemented yet')
  }

  static async updateFieldOperation(uuid: string, data: Partial<CreateFieldOperationRequest>): Promise<FieldOperation> {
    // Demo mode - not implemented
    throw new Error('Field operation updates not available in demo mode')
  }

  static async updateWorkPackage(uuid: string, data: Partial<CreateWorkPackageRequest>): Promise<WorkPackage> {
    // Work packages not implemented
    throw new Error('Work packages not implemented yet')
  }

  static async deleteFieldOperation(uuid: string): Promise<void> {
    // Demo mode - not implemented
    throw new Error('Field operation deletion not available in demo mode')
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
      // Demo mode always returns healthy
      return { status: 'ok', message: 'Demo API service is healthy' }
    } catch (error) {
      return {
        status: 'error',
        message: `Health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }
  }
}
