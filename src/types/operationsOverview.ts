// Types for the Operations Overview nested table

export type WorkPackageStatus = 'not-started' | 'in-progress' | 'complete';

export interface WorkPackageNode {
  id: string;
  days_after_planting: number;
  date: string;
  area: number;
  rate: number;
  quantity: number;
  notes?: string;
  completed?: boolean; // Keep for backward compatibility
  status?: WorkPackageStatus; // New status field
  operationName?: string; // Operation name from parent product

  // Additional fields for modern forms
  name?: string;
  start_time?: string;
  end_time?: string;
  duration?: number;
  planned_area?: number;
  actual_area?: number;
  planned_quantity?: number;
  actual_quantity?: number;
  actual_rate?: number;
  actual_cost?: number;

  // Resource tracking
  actualProducts?: Array<{
    id: string;
    name: string;
    quantityUsed: number;
    wastage?: number;
    wastageReason?: string;
  }>;
  actualEquipment?: Array<{
    id: string;
    name: string;
    hoursUsed: number;
    fuelConsumed?: number;
    maintenanceRequired?: boolean;
    maintenanceNotes?: string;
  }>;
  actualResources?: Array<{
    id: string;
    name: string;
    hoursWorked: number;
    overtimeHours?: number;
    performanceRating?: number;
  }>;
}

export interface ProductNode {
  id: string;
  product_name: string;
  days_after_planting: number;
  planned_start_date: string;
  planned_end_date: string;
  planned_rate: number;
  method: string;
  progress: number;
  est_product_cost: number;
  est_resource_cost: number;
  act_product_cost: number;
  act_resource_cost: number;
  status: 'planned' | 'in-progress' | 'completed' | 'cancelled';
  work_packages?: WorkPackageNode[];

  // Additional fields for modern forms
  operation_type?: string;
  actual_start_date?: string;
  actual_end_date?: string;
  planned_area?: number;
  actual_area?: number;
  planned_quantity?: number;
  actual_quantity?: number;
  estimated_total_cost?: number;
  actual_total_cost?: number;
  actual_revenue?: number;
  notes?: string;

  // New fields for multiple products and equipment support
  productsData?: Array<{
    id: string;
    productName: string;
    rate: number;
    quantity: number;
    unit: string;
    estimatedCost: number;
  }>;
  equipmentData?: Array<{
    id: string;
    name: string;
    estimatedDuration: number;
    costPerHour: number;
    totalEstimatedCost: number;
  }>;
}

export interface BlocOverviewNode {
  id: string;
  name: string;
  area_hectares: number;
  cycle_number: number[];
  variety_name: string;
  planned_harvest_date: string;
  expected_yield_tons_ha: number;
  growth_stage: string;
  progress: number;
  total_est_product_cost: number;
  total_est_resource_cost: number;
  total_act_product_cost: number;
  total_act_resource_cost: number;
  cycle_type: 'plantation' | 'ratoon';
  planting_date: string;
  products?: ProductNode[];
}
