import { BlocNode } from '../types/TableTypes';

// Sample data for the Agricultural Nested Table Component
export const sampleBlocData: BlocNode[] = [
  {
    id: 'bloc_1',
    name: 'North Field A',
    area_hectares: 25.5,
    cycle_number: [1],
    variety_name: 'NCo 376',
    planned_harvest_date: '2024-08-15',
    expected_yield_tons_ha: 85.2,
    growth_stage: 'Tillering',
    progress: 65,
    total_est_product_cost: 45000,
    total_est_resource_cost: 25000,
    total_act_product_cost: 42000,
    total_act_resource_cost: 23000,
    products: [
      {
        id: 'prod_1',
        product_name: 'Prepare Land',
        days_after_planting: -30,
        planned_start_date: '2024-01-15',
        planned_end_date: '2024-01-25',
        planned_rate: 2.5,
        method: 'mechanical',
        progress: 100,
        est_product_cost: 15000,
        est_resource_cost: 8000,
        act_product_cost: 14500,
        act_resource_cost: 7800,
        work_packages: [
          {
            id: 'wp_1',
            days_after_planting: -30,
            date: '2024-01-15',
            area: 5.0,
            rate: 2.5,
            quantity: 12.5
          }
        ]
      },
      {
        id: 'prod_2',
        product_name: 'NPK 14-20-20',
        days_after_planting: 45,
        planned_start_date: '2024-03-15',
        planned_end_date: '2024-03-20',
        planned_rate: 150,
        method: 'manual',
        progress: 75,
        est_product_cost: 30000,
        est_resource_cost: 17000,
        act_product_cost: 27500,
        act_resource_cost: 15200,
        work_packages: [
          {
            id: 'wp_2',
            days_after_planting: 45,
            date: '2024-03-15',
            area: 8.5,
            rate: 150,
            quantity: 1275
          }
        ]
      }
    ]
  },
  {
    id: 'bloc_2',
    name: 'South Field B',
    area_hectares: 18.3,
    cycle_number: [1],
    variety_name: 'CP 72-2086',
    planned_harvest_date: '2024-09-10',
    expected_yield_tons_ha: 78.5,
    growth_stage: 'Grand Growth',
    progress: 30,
    total_est_product_cost: 20000,
    total_est_resource_cost: 15000,
    total_act_product_cost: 18000,
    total_act_resource_cost: 12000,
    products: [
      {
        id: 'prod_3',
        product_name: 'Place Sets',
        days_after_planting: 0,
        planned_start_date: '2024-02-01',
        planned_end_date: '2024-02-10',
        planned_rate: 3.5,
        method: 'manual',
        progress: 100,
        est_product_cost: 20000,
        est_resource_cost: 15000,
        act_product_cost: 18000,
        act_resource_cost: 12000,
        work_packages: [
          {
            id: 'wp_3',
            days_after_planting: 0,
            date: '2024-02-01',
            area: 18.3,
            rate: 3.5,
            quantity: 64.05
          }
        ]
      }
    ]
  }
];

// Product options for dropdown
export const productOptions = [
  'Prepare Land',
  'Prepare Sets', 
  'Place Sets',
  'Weed Killer',
  'NPK 14-20-20',
  'NPK 20-46-60',
  'Bagasse Ash',
  'Poultry Manure'
];

// Method options for dropdown
export const methodOptions = [
  'Mechanical',
  'Manual',
  'Mixed'
];
