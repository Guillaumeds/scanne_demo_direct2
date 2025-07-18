/**
 * Comprehensive Zod Schemas for API Validation
 * Single source of truth for all API data structures
 */

import { z } from 'zod'

// Base entity schemas
export const CompanySchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
})

export const FarmSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  company_id: z.string().uuid(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
})

export const BlocSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  area_hectares: z.number().positive(),
  coordinates_wkt: z.string(),
  status: z.enum(['active', 'inactive']),
  farm_id: z.string().uuid(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
})

export const SugarcaneVarietySchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  description: z.string().nullable(),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
})

export const InterCropVarietySchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  description: z.string().nullable(),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
})

export const CropCycleSchema = z.object({
  id: z.string().uuid(),
  bloc_id: z.string().uuid(),
  type: z.enum(['plantation', 'ratoon']),
  cycle_number: z.number().int().positive(),
  status: z.enum(['active', 'closed']),
  sugarcane_variety_id: z.string().uuid(),
  intercrop_variety_id: z.string().uuid().nullable(),
  planting_date: z.string().date().nullable(),
  planned_harvest_date: z.string().date(),
  actual_harvest_date: z.string().date().nullable(),
  expected_yield_tons_ha: z.number().positive(),
  actual_yield_tons_ha: z.number().positive().nullable(),
  estimated_total_cost: z.number().min(0),
  actual_total_cost: z.number().min(0).nullable(),
  total_revenue: z.number().min(0).nullable(),
  sugarcane_revenue: z.number().min(0).nullable(),
  intercrop_revenue: z.number().min(0).nullable(),
  net_profit: z.number().nullable(),
  profit_per_hectare: z.number().nullable(),
  profit_margin_percent: z.number().nullable(),
  growth_stage: z.string().nullable(),
  days_since_planting: z.number().int().min(0).nullable(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
})

export const ProductSchema = z.object({
  id: z.string().uuid(),
  product_id: z.string(),
  name: z.string().min(1),
  category: z.string().nullable(),
  subcategory: z.string().nullable(),
  unit: z.string().nullable(),
  cost_per_unit: z.number().min(0).nullable(),
  supplier: z.string().nullable(),
  description: z.string().nullable(),
  active: z.boolean().default(true),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
})

export const LabourSchema = z.object({
  id: z.string().uuid(),
  labour_id: z.string(),
  name: z.string().min(1),
  category: z.string().nullable(),
  unit: z.string().nullable(),
  cost_per_unit: z.number().min(0).nullable(),
  description: z.string().nullable(),
  active: z.boolean().default(true),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
})

export const FieldOperationSchema = z.object({
  uuid: z.string().uuid(),
  crop_cycle_uuid: z.string().uuid(),
  operation_name: z.string().min(1),
  operation_type: z.string().min(1),
  method: z.string().nullable(),
  priority: z.enum(['low', 'normal', 'high']),
  planned_start_date: z.string().date(),
  planned_end_date: z.string().date(),
  actual_start_date: z.string().date().nullable(),
  actual_end_date: z.string().date().nullable(),
  planned_area_hectares: z.number().positive().nullable(),
  actual_area_hectares: z.number().positive().nullable(),
  planned_quantity: z.number().min(0).nullable(),
  actual_quantity: z.number().min(0).nullable(),
  status: z.enum(['planned', 'in-progress', 'completed', 'cancelled']),
  completion_percentage: z.number().min(0).max(100),
  estimated_total_cost: z.number().min(0),
  actual_total_cost: z.number().min(0).nullable(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
})

export const WorkPackageSchema = z.object({
  uuid: z.string().uuid(),
  field_operation_uuid: z.string().uuid(),
  package_name: z.string().nullable(),
  work_date: z.string().date(),
  shift: z.enum(['day', 'night']).default('day'),
  planned_area_hectares: z.number().positive().nullable(),
  actual_area_hectares: z.number().positive().nullable(),
  planned_quantity: z.number().min(0).nullable(),
  actual_quantity: z.number().min(0).nullable(),
  status: z.enum(['not-started', 'in-progress', 'completed', 'cancelled']),
  start_time: z.string().nullable(),
  end_time: z.string().nullable(),
  duration_hours: z.number().min(0).nullable(),
  weather_conditions: z.string().nullable(),
  temperature_celsius: z.number().nullable(),
  humidity_percent: z.number().min(0).max(100).nullable(),
  wind_speed_kmh: z.number().min(0).nullable(),
  notes: z.string().nullable(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
})

// Composite schemas for API responses
export const FarmGISInitialDataSchema = z.object({
  blocs: z.array(BlocSchema),
  farms: z.array(FarmSchema),
  companies: z.array(CompanySchema),
  activeCropCycles: z.array(CropCycleSchema),
})

export const BlocDataSchema = z.object({
  blocId: z.string().uuid(),
  cropCycles: z.array(CropCycleSchema),
  fieldOperations: z.array(FieldOperationSchema),
  workPackages: z.array(WorkPackageSchema),
  products: z.array(z.object({
    id: z.string().uuid(),
    operationUuid: z.string().uuid().optional(),
    workPackageUuid: z.string().uuid().optional(),
    productId: z.string().uuid(),
    productName: z.string(),
    plannedQuantity: z.number().min(0),
    actualQuantity: z.number().min(0).optional(),
    plannedCost: z.number().min(0),
    actualCost: z.number().min(0).optional(),
    unit: z.string(),
  })),
  equipment: z.array(z.object({
    id: z.string().uuid(),
    operationUuid: z.string().uuid().optional(),
    workPackageUuid: z.string().uuid().optional(),
    equipmentId: z.string().uuid(),
    equipmentName: z.string(),
    plannedHours: z.number().min(0),
    actualHours: z.number().min(0).optional(),
    plannedCost: z.number().min(0),
    actualCost: z.number().min(0).optional(),
  })),
  labour: z.array(z.object({
    id: z.string().uuid(),
    operationUuid: z.string().uuid().optional(),
    workPackageUuid: z.string().uuid().optional(),
    labourId: z.string().uuid(),
    labourName: z.string(),
    plannedQuantity: z.number().min(0),
    actualQuantity: z.number().min(0).optional(),
    plannedCost: z.number().min(0),
    actualCost: z.number().min(0).optional(),
    unit: z.string(),
  })),
  lastUpdated: z.string().datetime(),
})

// Request schemas for mutations
export const CreateCropCycleSchema = z.object({
  blocId: z.string().uuid(),
  type: z.enum(['plantation', 'ratoon']),
  sugarcaneVarietyId: z.string().uuid(),
  intercropVarietyId: z.string().uuid().nullable(),
  plantingDate: z.string().date().nullable(),
  expectedHarvestDate: z.string().date(),
  expectedYield: z.number().positive(),
})

export const CreateFieldOperationSchema = z.object({
  cropCycleUuid: z.string().uuid(),
  operationName: z.string().min(1),
  operationType: z.string().min(1),
  method: z.string().nullable(),
  priority: z.enum(['low', 'normal', 'high']),
  plannedStartDate: z.string().date(),
  plannedEndDate: z.string().date(),
  plannedAreaHectares: z.number().positive().nullable(),
  plannedQuantity: z.number().min(0).nullable(),
  estimatedTotalCost: z.number().min(0),
})

export const CreateWorkPackageSchema = z.object({
  fieldOperationUuid: z.string().uuid(),
  workDate: z.string().date(),
  shift: z.enum(['day', 'night']).default('day'),
  plannedAreaHectares: z.number().positive().nullable(),
  plannedQuantity: z.number().min(0).nullable(),
})

// Type exports
export type Company = z.infer<typeof CompanySchema>
export type Farm = z.infer<typeof FarmSchema>
export type Bloc = z.infer<typeof BlocSchema>
export type CropCycle = z.infer<typeof CropCycleSchema>
export type Product = z.infer<typeof ProductSchema>
export type Labour = z.infer<typeof LabourSchema>
export type FieldOperation = z.infer<typeof FieldOperationSchema>
export type WorkPackage = z.infer<typeof WorkPackageSchema>
export type FarmGISInitialData = z.infer<typeof FarmGISInitialDataSchema>
export type BlocData = z.infer<typeof BlocDataSchema>
export type CreateCropCycleRequest = z.infer<typeof CreateCropCycleSchema>
export type CreateFieldOperationRequest = z.infer<typeof CreateFieldOperationSchema>
export type CreateWorkPackageRequest = z.infer<typeof CreateWorkPackageSchema>
