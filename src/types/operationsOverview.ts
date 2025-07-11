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
