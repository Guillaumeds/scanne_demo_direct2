// Comprehensive Bloc Data Service
// Fetches ALL bloc-related data in one optimized query following TanStack Query best practices

import { supabase } from '@/lib/supabase'
import { CropCycle } from '@/types/cropCycleManagement'

export interface BlocData {
  blocId: string
  cropCycles: CropCycle[]
  fieldOperations: FieldOperation[]
  workPackages: WorkPackage[]
  products: ProductJoin[]
  equipment: EquipmentJoin[]
  resources: ResourceJoin[]
  lastUpdated: string
}

export interface FieldOperation {
  uuid: string
  cropCycleUuid: string
  operationName: string
  operationType: string
  method?: string
  priority: string
  plannedStartDate: string
  plannedEndDate: string
  actualStartDate?: string
  actualEndDate?: string
  plannedAreaHectares?: number
  actualAreaHectares?: number
  plannedQuantity?: number
  actualQuantity?: number
  status: string
  completionPercentage: number
  estimatedTotalCost: number
  actualTotalCost?: number
  actualRevenue?: number
  totalYield?: number
  yieldPerHectare?: number
  qualityMetrics?: string
  weatherConditions?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface WorkPackage {
  uuid: string
  fieldOperationUuid: string
  packageName?: string
  workDate: string
  shift: string
  plannedAreaHectares?: number
  actualAreaHectares?: number
  plannedQuantity?: number
  actualQuantity?: number
  status: string
  startTime?: string
  endTime?: string
  durationHours?: number
  weatherConditions?: string
  temperatureCelsius?: number
  humidityPercent?: number
  windSpeedKmh?: number
  teamLeader?: string
  numberOfWorkers?: number
  workerNames?: string[]
  supervisor?: string
  notes?: string
  observations?: string
  issuesEncountered?: string
  correctiveActions?: string
  effectivenessRating?: number
  qualityRating?: number
  safetyIncidents?: string
  laborCost?: number
  materialCost?: number
  equipmentCost?: number
  fuelCost?: number
  otherCosts?: number
  totalCost?: number
  dailyAreaCompleted?: number
  dailyYieldTons?: number
  createdAt: string
  updatedAt: string
}

export interface ProductJoin {
  id: string
  operationUuid?: string
  workPackageUuid?: string
  productId: string
  productName: string
  plannedQuantity: number
  actualQuantity?: number
  plannedCost: number
  actualCost?: number
  unit: string
}

export interface EquipmentJoin {
  id: string
  operationUuid?: string
  workPackageUuid?: string
  equipmentId: string
  equipmentName: string
  plannedHours: number
  actualHours?: number
  plannedCost: number
  actualCost?: number
  fuelConsumption?: number
  maintenanceNotes?: string
}

export interface ResourceJoin {
  id: string
  operationUuid?: string
  workPackageUuid?: string
  resourceId: string
  resourceName: string
  plannedQuantity: number
  actualQuantity?: number
  plannedCost: number
  actualCost?: number
  unit: string
}

/**
 * Comprehensive Bloc Data Service
 * Implements TanStack Query best practices for optimal data management
 */
export class BlocDataService {
  
  /**
   * Fetch ALL bloc-related data in one optimized query
   * This is called once when bloc opens and provides all data for the session
   */
  static async fetchComprehensiveBlocData(blocId: string): Promise<BlocData> {
    console.log(`🔄 Loading comprehensive bloc data for ${blocId}...`)
    
    try {
      // Fetch crop cycles for this bloc
      const { data: cropCycles, error: cropCyclesError } = await supabase
        .from('crop_cycles')
        .select(`
          *,
          sugarcane_varieties!inner(name),
          intercrop_varieties(name)
        `)
        .eq('bloc_id', blocId)
        .order('created_at', { ascending: false })

      if (cropCyclesError) {
        console.warn('No crop_cycles table found, using empty array')
        // Return minimal structure if crop_cycles table doesn't exist yet
        return {
          blocId,
          cropCycles: [],
          fieldOperations: [],
          workPackages: [],
          products: [],
          equipment: [],
          resources: [],
          lastUpdated: new Date().toISOString()
        }
      }

      const cropCycleUuids = cropCycles?.map(cycle => cycle.id) || []
      
      // Fetch field operations for all crop cycles
      const { data: fieldOperations, error: operationsError } = await supabase
        .from('field_operations')
        .select('*')
        .in('crop_cycle_uuid', cropCycleUuids)
        .order('planned_start_date', { ascending: true })

      if (operationsError) throw operationsError

      const operationUuids = fieldOperations?.map(op => op.uuid) || []
      
      // Fetch work packages for all operations
      const { data: workPackages, error: workPackagesError } = await supabase
        .from('daily_work_packages')
        .select('*')
        .in('field_operation_uuid', operationUuids)
        .order('work_date', { ascending: true })

      if (workPackagesError) throw workPackagesError

      // Fetch all related joins in parallel
      const [
        { data: operationProducts },
        { data: operationEquipment },
        { data: operationResources },
        { data: workPackageProducts },
        { data: workPackageEquipment },
        { data: workPackageResources }
      ] = await Promise.all([
        supabase.from('operation_products').select('*, products(name)').in('field_operation_uuid', operationUuids),
        supabase.from('operation_equipment').select('*, equipment(name)').in('field_operation_uuid', operationUuids),
        supabase.from('operation_resources').select('*, resources(name)').in('field_operation_uuid', operationUuids),
        supabase.from('work_package_products').select('*, products(name)').in('daily_work_package_uuid', workPackages?.map(wp => wp.uuid) || []),
        supabase.from('work_package_equipment').select('*, equipment(name)').in('daily_work_package_uuid', workPackages?.map(wp => wp.uuid) || []),
        supabase.from('work_package_resources').select('*, resources(name)').in('daily_work_package_uuid', workPackages?.map(wp => wp.uuid) || [])
      ])

      // Transform and combine all data
      const transformedCropCycles = cropCycles?.map(this.transformDbToCropCycle) || []
      const transformedOperations = fieldOperations?.map(this.transformDbToFieldOperation) || []
      const transformedWorkPackages = workPackages?.map(this.transformDbToWorkPackage) || []
      
      // Combine all product/equipment/resource joins
      const allProducts = [
        ...(operationProducts?.map(p => this.transformDbToProductJoin(p, 'operation')) || []),
        ...(workPackageProducts?.map(p => this.transformDbToProductJoin(p, 'workPackage')) || [])
      ]
      
      const allEquipment = [
        ...(operationEquipment?.map(e => this.transformDbToEquipmentJoin(e, 'operation')) || []),
        ...(workPackageEquipment?.map(e => this.transformDbToEquipmentJoin(e, 'workPackage')) || [])
      ]
      
      const allResources = [
        ...(operationResources?.map(r => this.transformDbToResourceJoin(r, 'operation')) || []),
        ...(workPackageResources?.map(r => this.transformDbToResourceJoin(r, 'workPackage')) || [])
      ]

      const result: BlocData = {
        blocId,
        cropCycles: transformedCropCycles,
        fieldOperations: transformedOperations,
        workPackages: transformedWorkPackages,
        products: allProducts,
        equipment: allEquipment,
        resources: allResources,
        lastUpdated: new Date().toISOString()
      }

      console.log(`✅ Loaded comprehensive bloc data:`, {
        cropCycles: result.cropCycles.length,
        fieldOperations: result.fieldOperations.length,
        workPackages: result.workPackages.length,
        products: result.products.length,
        equipment: result.equipment.length,
        resources: result.resources.length
      })

      return result

    } catch (error) {
      console.error('❌ Error fetching comprehensive bloc data:', error)
      throw new Error(`Failed to fetch bloc data: ${error.message}`)
    }
  }

  /**
   * Transform database crop cycle to frontend type
   */
  private static transformDbToCropCycle(data: any): CropCycle {
    return {
      id: data.id,
      blocId: data.bloc_id,
      type: data.type,
      cycleNumber: data.cycle_number,
      status: data.status,
      sugarcaneVarietyId: data.sugarcane_variety_id,
      sugarcaneVarietyName: data.sugarcane_varieties?.name || '',
      intercropVarietyId: data.intercrop_variety_id,
      intercropVarietyName: data.intercrop_varieties?.name,
      sugarcaneePlantingDate: data.sugarcane_planting_date,
      sugarcaneePlannedHarvestDate: data.sugarcane_planned_harvest_date,
      sugarcaneActualHarvestDate: data.sugarcane_actual_harvest_date,
      sugarcaneExpectedYieldTonsHa: data.sugarcane_expected_yield_tons_ha || 0,
      sugarcaneActualYieldTonsHa: data.sugarcane_actual_yield_tons_ha,
      estimatedTotalCost: data.estimated_total_cost || 0,
      actualTotalCost: data.actual_total_cost || 0,
      sugarcaneeRevenue: data.sugarcane_revenue || 0,
      intercropRevenue: data.intercrop_revenue || 0,
      totalRevenue: data.total_revenue || 0,
      netProfit: data.net_profit || 0,
      profitPerHectare: data.profit_per_hectare || 0,
      profitMarginPercent: data.profit_margin_percent || 0,
      growthStage: data.growth_stage,
      growthStageUpdatedAt: data.growth_stage_updated_at,
      daysSincePlanting: data.days_since_planting || 0,
      closureValidated: data.closure_validated || false,
      parentCycleId: data.parent_cycle_id,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    }
  }

  /**
   * Transform database field operation to frontend type
   */
  private static transformDbToFieldOperation(data: any): FieldOperation {
    return {
      uuid: data.uuid,
      cropCycleUuid: data.crop_cycle_uuid,
      operationName: data.operation_name,
      operationType: data.operation_type,
      method: data.method,
      priority: data.priority,
      plannedStartDate: data.planned_start_date,
      plannedEndDate: data.planned_end_date,
      actualStartDate: data.actual_start_date,
      actualEndDate: data.actual_end_date,
      plannedAreaHectares: data.planned_area_hectares,
      actualAreaHectares: data.actual_area_hectares,
      plannedQuantity: data.planned_quantity,
      actualQuantity: data.actual_quantity,
      status: data.status,
      completionPercentage: data.completion_percentage || 0,
      estimatedTotalCost: data.estimated_total_cost || 0,
      actualTotalCost: data.actual_total_cost,
      actualRevenue: data.actual_revenue,
      totalYield: data.total_yield,
      yieldPerHectare: data.yield_per_hectare,
      qualityMetrics: data.quality_metrics,
      weatherConditions: data.weather_conditions,
      notes: data.notes,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    }
  }

  /**
   * Transform database work package to frontend type
   */
  private static transformDbToWorkPackage(data: any): WorkPackage {
    return {
      uuid: data.uuid,
      fieldOperationUuid: data.field_operation_uuid,
      packageName: data.package_name,
      workDate: data.work_date,
      shift: data.shift || 'day',
      plannedAreaHectares: data.planned_area_hectares,
      actualAreaHectares: data.actual_area_hectares,
      plannedQuantity: data.planned_quantity,
      actualQuantity: data.actual_quantity,
      status: data.status || 'not-started',
      startTime: data.start_time,
      endTime: data.end_time,
      durationHours: data.duration_hours,
      weatherConditions: data.weather_conditions,
      temperatureCelsius: data.temperature_celsius,
      humidityPercent: data.humidity_percent,
      windSpeedKmh: data.wind_speed_kmh,
      teamLeader: data.team_leader,
      numberOfWorkers: data.number_of_workers,
      workerNames: data.worker_names,
      supervisor: data.supervisor,
      notes: data.notes,
      observations: data.observations,
      issuesEncountered: data.issues_encountered,
      correctiveActions: data.corrective_actions,
      effectivenessRating: data.effectiveness_rating,
      qualityRating: data.quality_rating,
      safetyIncidents: data.safety_incidents,
      laborCost: data.labor_cost,
      materialCost: data.material_cost,
      equipmentCost: data.equipment_cost,
      fuelCost: data.fuel_cost,
      otherCosts: data.other_costs,
      totalCost: data.total_cost,
      dailyAreaCompleted: data.daily_area_completed,
      dailyYieldTons: data.daily_yield_tons,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    }
  }

  private static transformDbToProductJoin(data: any, type: 'operation' | 'workPackage'): ProductJoin {
    return {
      id: data.uuid,
      operationUuid: type === 'operation' ? data.field_operation_uuid : undefined,
      workPackageUuid: type === 'workPackage' ? data.daily_work_package_uuid : undefined,
      productId: data.product_uuid,
      productName: data.products?.name || 'Unknown Product',
      plannedQuantity: data.planned_quantity || 0,
      actualQuantity: data.actual_quantity,
      plannedCost: data.planned_cost || 0,
      actualCost: data.actual_cost,
      unit: data.unit || 'units'
    }
  }

  private static transformDbToEquipmentJoin(data: any, type: 'operation' | 'workPackage'): EquipmentJoin {
    return {
      id: data.uuid,
      operationUuid: type === 'operation' ? data.field_operation_uuid : undefined,
      workPackageUuid: type === 'workPackage' ? data.daily_work_package_uuid : undefined,
      equipmentId: data.equipment_uuid,
      equipmentName: data.equipment?.name || 'Unknown Equipment',
      plannedHours: data.planned_hours || 0,
      actualHours: data.actual_hours,
      plannedCost: data.planned_cost || 0,
      actualCost: data.actual_cost,
      fuelConsumption: data.fuel_consumption,
      maintenanceNotes: data.maintenance_notes
    }
  }

  private static transformDbToResourceJoin(data: any, type: 'operation' | 'workPackage'): ResourceJoin {
    return {
      id: data.uuid,
      operationUuid: type === 'operation' ? data.field_operation_uuid : undefined,
      workPackageUuid: type === 'workPackage' ? data.daily_work_package_uuid : undefined,
      resourceId: data.resource_uuid,
      resourceName: data.resources?.name || 'Unknown Resource',
      plannedQuantity: data.planned_quantity || 0,
      actualQuantity: data.actual_quantity,
      plannedCost: data.planned_cost || 0,
      actualCost: data.actual_cost,
      unit: data.unit || 'units'
    }
  }
}
