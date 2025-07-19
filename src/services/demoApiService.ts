/**
 * Demo API Service
 * Replaces database calls with localStorage-based operations
 * Maintains the same interface as ValidatedApiService for easy switching
 */

import { z } from 'zod'
import { DemoDataService } from './demoDataService'
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
  type FarmGISInitialData,
  type BlocData,
  type CropCycle,
  type FieldOperation,
  type WorkPackage,
  type CreateCropCycleRequest,
  type CreateFieldOperationRequest,
  type CreateWorkPackageRequest,
} from '@/schemas/apiSchemas'

// Validation helper that mimics the original API service
async function validateDemoResponse<T>(
  dataFetcher: () => Promise<T>,
  schema: z.ZodSchema<T>,
  operationName: string
): Promise<T> {
  try {
    const data = await dataFetcher()
    const validatedData = schema.parse(data)
    
    // Log successful operations in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ ${operationName}:`, validatedData)
    }
    
    return validatedData
  } catch (error) {
    console.error(`❌ ${operationName} failed:`, error)
    
    if (error instanceof z.ZodError) {
      throw new Error(`Validation failed for ${operationName}: ${error.message}`)
    }
    
    throw error
  }
}

export class DemoApiService {
  
  /**
   * Fetch initial farm GIS data (overview level)
   */
  static async fetchFarmGISInitialData(): Promise<any> {
    // Temporarily bypass validation for demo
    return DemoDataService.fetchFarmGISInitialData()
  }
  
  /**
   * Fetch comprehensive bloc data (bloc level)
   */
  static async fetchComprehensiveBlocData(blocId: string): Promise<BlocData> {
    return validateDemoResponse(
      () => DemoDataService.fetchComprehensiveBlocData(blocId),
      BlocDataSchema,
      `Fetch Comprehensive Bloc Data for ${blocId} (Demo)`
    )
  }
  
  /**
   * Configuration data fetchers
   */
  static async fetchProducts() {
    // Temporarily bypass validation for demo
    return DemoDataService.fetchProducts()
  }
  
  static async fetchLabour() {
    // Temporarily bypass validation for demo
    return DemoDataService.fetchLabour()
  }

  static async fetchEquipment() {
    return validateDemoResponse(
      () => DemoDataService.fetchEquipment(),
      z.array(z.object({
        id: z.string(),
        name: z.string(),
        category: z.string(),
        hourly_rate: z.number(),
        active: z.boolean(),
        created_at: z.string(),
      })),
      'Fetch Equipment (Demo)'
    )
  }
  
  static async fetchSugarcaneVarieties() {
    // Temporarily bypass validation for demo
    return DemoDataService.fetchSugarcaneVarieties()
  }
  
  static async fetchIntercropVarieties() {
    return validateDemoResponse(
      () => DemoDataService.fetchIntercropVarieties(),
      z.array(InterCropVarietySchema),
      'Fetch Intercrop Varieties (Demo)'
    )
  }

  /**
   * Create operations (simulate database inserts)
   */
  static async createCropCycle(request: CreateCropCycleRequest): Promise<CropCycle> {
    // Validate input
    const validatedRequest = CreateCropCycleSchema.parse(request)

    // Generate new crop cycle
    const newCycle: CropCycle = {
      id: `cycle-${Date.now()}`,
      bloc_id: validatedRequest.blocId,
      type: validatedRequest.type,
      cycle_number: 1,
      status: 'active',
      sugarcane_variety_id: validatedRequest.sugarcaneVarietyId,
      intercrop_variety_id: validatedRequest.intercropVarietyId,
      planting_date: validatedRequest.plantingDate,
      planned_harvest_date: validatedRequest.expectedHarvestDate,
      actual_harvest_date: null,
      expected_yield_tons_ha: validatedRequest.expectedYield,
      actual_yield_tons_ha: null,
      estimated_total_cost: 0,
      actual_total_cost: null,
      total_revenue: null,
      sugarcane_revenue: null,
      intercrop_revenue: null,
      net_profit: null,
      profit_per_hectare: null,
      profit_margin_percent: null,
      growth_stage: 'germination',
      days_since_planting: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    // Update demo data
    const demoData = DemoDataService.getDemoData()
    demoData.cropCycles.push(newCycle)
    DemoDataService.updateDemoData({ cropCycles: demoData.cropCycles })

    // No delay for demo performance

    return validateDemoResponse(
      () => Promise.resolve(newCycle),
      CropCycleSchema,
      'Create Crop Cycle (Demo)'
    )
  }

  static async createFieldOperation(request: CreateFieldOperationRequest): Promise<FieldOperation> {
    // Validate input
    const validatedRequest = CreateFieldOperationSchema.parse(request)

    // Generate new field operation
    const newOperation: FieldOperation = {
      uuid: `op-${Date.now()}`,
      crop_cycle_uuid: validatedRequest.cropCycleUuid,
      operation_name: validatedRequest.operationName,
      operation_type: validatedRequest.operationType,
      method: validatedRequest.method,
      priority: validatedRequest.priority,
      planned_start_date: validatedRequest.plannedStartDate,
      planned_end_date: validatedRequest.plannedEndDate,
      actual_start_date: null,
      actual_end_date: null,
      planned_area_hectares: validatedRequest.plannedAreaHectares,
      actual_area_hectares: null,
      planned_quantity: validatedRequest.plannedQuantity,
      actual_quantity: null,
      status: 'planned',
      completion_percentage: 0,
      estimated_total_cost: validatedRequest.estimatedTotalCost,
      actual_total_cost: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    // Update demo data
    const demoData = DemoDataService.getDemoData()
    demoData.fieldOperations.push(newOperation)
    DemoDataService.updateDemoData({ fieldOperations: demoData.fieldOperations })

    // No delay for demo performance

    return newOperation
  }

  static async createWorkPackage(request: CreateWorkPackageRequest): Promise<WorkPackage> {
    // Validate input
    const validatedRequest = CreateWorkPackageSchema.parse(request)

    // Generate new work package
    const newWorkPackage: WorkPackage = {
      uuid: `wp-${Date.now()}`,
      field_operation_uuid: validatedRequest.fieldOperationUuid,
      package_name: null,
      work_date: validatedRequest.workDate,
      shift: validatedRequest.shift,
      planned_area_hectares: validatedRequest.plannedAreaHectares,
      actual_area_hectares: null,
      planned_quantity: validatedRequest.plannedQuantity,
      actual_quantity: null,
      status: 'not-started',
      start_time: null,
      end_time: null,
      duration_hours: null,
      weather_conditions: null,
      temperature_celsius: null,
      humidity_percent: null,
      wind_speed_kmh: null,
      notes: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    // Update demo data
    const demoData = DemoDataService.getDemoData()
    demoData.workPackages.push(newWorkPackage)
    DemoDataService.updateDemoData({ workPackages: demoData.workPackages })

    // No delay for demo performance

    return validateDemoResponse(
      () => Promise.resolve(newWorkPackage),
      WorkPackageSchema,
      'Create Work Package (Demo)'
    )
  }

  /**
   * Update operations (simulate database updates)
   */
  static async updateCropCycle(cycleId: string, updates: Partial<CropCycle>): Promise<CropCycle> {
    const demoData = DemoDataService.getDemoData()
    const cycleIndex = demoData.cropCycles.findIndex(c => c.id === cycleId)
    
    if (cycleIndex === -1) {
      throw new Error(`Crop cycle ${cycleId} not found`)
    }

    // Update the cycle
    const updatedCycle = {
      ...demoData.cropCycles[cycleIndex],
      ...updates,
      updated_at: new Date().toISOString(),
    }

    demoData.cropCycles[cycleIndex] = updatedCycle
    DemoDataService.updateDemoData({ cropCycles: demoData.cropCycles })

    // No delay for demo performance

    return validateDemoResponse(
      () => Promise.resolve(updatedCycle),
      CropCycleSchema,
      'Update Crop Cycle (Demo)'
    )
  }

  /**
   * Delete operations (simulate database deletes)
   */
  static async deleteCropCycle(cycleId: string): Promise<void> {
    const demoData = DemoDataService.getDemoData()
    const filteredCycles = demoData.cropCycles.filter(c => c.id !== cycleId)
    
    if (filteredCycles.length === demoData.cropCycles.length) {
      throw new Error(`Crop cycle ${cycleId} not found`)
    }

    // Also remove related field operations and work packages
    const filteredOperations = demoData.fieldOperations.filter(op => op.crop_cycle_id !== cycleId)
    const filteredWorkPackages = demoData.workPackages.filter(wp => wp.crop_cycle_id !== cycleId)

    DemoDataService.updateDemoData({
      cropCycles: filteredCycles,
      fieldOperations: filteredOperations,
      workPackages: filteredWorkPackages,
    })

    // No delay for demo performance
  }

  /**
   * Utility methods for demo management
   */
  static async resetDemoData(): Promise<void> {
    DemoDataService.resetDemoData()
    // No delay for demo performance
  }

  static async exportDemoData(): Promise<string> {
    const demoData = DemoDataService.getDemoData()
    return JSON.stringify(demoData, null, 2)
  }

  static async importDemoData(jsonData: string): Promise<void> {
    try {
      const parsedData = JSON.parse(jsonData)
      DemoDataService.updateDemoData(parsedData)
      // No delay for demo performance
    } catch (error) {
      throw new Error('Invalid JSON data for import')
    }
  }
}
