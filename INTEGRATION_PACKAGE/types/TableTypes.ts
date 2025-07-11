// TypeScript interfaces for the Agricultural Nested Table Component

export interface WorkPackageNode {
  id: string;
  days_after_planting: number;
  date: string;
  area: number;
  rate: number;
  quantity: number;
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
  work_packages?: WorkPackageNode[];
}

export interface BlocNode {
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
  products?: ProductNode[];
}

// Props interface for the main component
export interface NestedTableApproachProps {
  initialData?: BlocNode[];
  onDataChange?: (data: BlocNode[]) => void;
  readOnly?: boolean;
  showSummary?: boolean;
}

// Configuration interfaces
export interface TableColors {
  bloc: {
    primary: string;
    secondary: string;
    background: string;
  };
  product: {
    primary: string;
    secondary: string;
    background: string;
  };
  workPackage: {
    primary: string;
    secondary: string;
    background: string;
  };
}

export interface TableConfig {
  enableAdd: boolean;
  enableDelete: boolean;
  enableEdit: boolean;
  showProgress: boolean;
  showCosts: boolean;
  colors?: Partial<TableColors>;
}
