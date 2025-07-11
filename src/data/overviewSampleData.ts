import { BlocOverviewNode } from '@/types/operationsOverview';

// Sample data for the Operations Overview nested table
// Adapted for sugarcane farming operations in Mauritius
export const sampleOverviewData: BlocOverviewNode[] = [
  {
    id: 'bloc_north_a',
    name: 'North Field A',
    area_hectares: 25.5,
    cycle_number: [1],
    variety_name: 'NCo 376',
    planned_harvest_date: '2024-08-15',
    expected_yield_tons_ha: 85.2,
    growth_stage: 'tillering',
    progress: 65,
    total_est_product_cost: 45000,
    total_est_resource_cost: 25000,
    total_act_product_cost: 42000,
    total_act_resource_cost: 23000,
    cycle_type: 'plantation',
    planting_date: '2024-02-01',
    products: [
      {
        id: 'prod_land_prep_1',
        product_name: 'Land Preparation',
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
        status: 'completed',
        work_packages: [
          {
            id: 'wp_plowing_1',
            days_after_planting: -30,
            date: '2024-01-15',
            area: 12.5,
            rate: 2.5,
            quantity: 31.25,
            notes: 'Deep plowing completed',
            completed: true
          },
          {
            id: 'wp_harrowing_1',
            days_after_planting: -25,
            date: '2024-01-20',
            area: 13.0,
            rate: 2.5,
            quantity: 32.5,
            notes: 'Secondary tillage',
            completed: true
          }
        ]
      },
      {
        id: 'prod_fertilizer_1',
        product_name: 'NPK 14-20-20 Base Fertilizer',
        days_after_planting: 0,
        planned_start_date: '2024-02-01',
        planned_end_date: '2024-02-05',
        planned_rate: 150,
        method: 'manual',
        progress: 100,
        est_product_cost: 18000,
        est_resource_cost: 12000,
        act_product_cost: 17200,
        act_resource_cost: 11500,
        status: 'completed',
        work_packages: [
          {
            id: 'wp_base_fert_1',
            days_after_planting: 0,
            date: '2024-02-01',
            area: 25.5,
            rate: 150,
            quantity: 3825,
            notes: 'Base fertilizer application',
            completed: true
          }
        ]
      },
      {
        id: 'prod_fertilizer_2',
        product_name: 'NPK 20-46-60 Top Dressing',
        days_after_planting: 45,
        planned_start_date: '2024-03-15',
        planned_end_date: '2024-03-20',
        planned_rate: 100,
        method: 'manual',
        progress: 75,
        est_product_cost: 12000,
        est_resource_cost: 5000,
        act_product_cost: 10300,
        act_resource_cost: 4200,
        status: 'in-progress',
        work_packages: [
          {
            id: 'wp_top_dress_1',
            days_after_planting: 45,
            date: '2024-03-15',
            area: 20.0,
            rate: 100,
            quantity: 2000,
            notes: 'First top dressing application',
            completed: true
          },
          {
            id: 'wp_top_dress_2',
            days_after_planting: 47,
            date: '2024-03-17',
            area: 5.5,
            rate: 100,
            quantity: 550,
            notes: 'Remaining area - in progress',
            completed: false
          }
        ]
      }
    ]
  },
  {
    id: 'bloc_south_b',
    name: 'South Field B',
    area_hectares: 18.3,
    cycle_number: [2],
    variety_name: 'CP 72-2086',
    planned_harvest_date: '2024-09-10',
    expected_yield_tons_ha: 78.5,
    growth_stage: 'grand-growth',
    progress: 40,
    total_est_product_cost: 28000,
    total_est_resource_cost: 18000,
    total_act_product_cost: 25000,
    total_act_resource_cost: 16000,
    cycle_type: 'ratoon',
    planting_date: '2023-08-15',
    products: [
      {
        id: 'prod_ratoon_mgmt_1',
        product_name: 'Ratoon Management',
        days_after_planting: 30,
        planned_start_date: '2024-01-15',
        planned_end_date: '2024-01-25',
        planned_rate: 1.0,
        method: 'mechanical',
        progress: 100,
        est_product_cost: 8000,
        est_resource_cost: 5000,
        act_product_cost: 7500,
        act_resource_cost: 4800,
        status: 'completed',
        work_packages: [
          {
            id: 'wp_ratoon_cut_1',
            days_after_planting: 30,
            date: '2024-01-15',
            area: 18.3,
            rate: 1.0,
            quantity: 18.3,
            notes: 'Ratoon cutting and cleanup',
            completed: true
          }
        ]
      },
      {
        id: 'prod_weed_control_1',
        product_name: 'Herbicide Application',
        days_after_planting: 60,
        planned_start_date: '2024-02-15',
        planned_end_date: '2024-02-20',
        planned_rate: 2.5,
        method: 'manual',
        progress: 100,
        est_product_cost: 12000,
        est_resource_cost: 8000,
        act_product_cost: 11000,
        act_resource_cost: 7200,
        status: 'completed',
        work_packages: [
          {
            id: 'wp_herbicide_1',
            days_after_planting: 60,
            date: '2024-02-15',
            area: 18.3,
            rate: 2.5,
            quantity: 45.75,
            notes: 'Pre-emergence herbicide',
            completed: true
          }
        ]
      },
      {
        id: 'prod_irrigation_1',
        product_name: 'Irrigation Management',
        days_after_planting: 90,
        planned_start_date: '2024-03-01',
        planned_end_date: '2024-07-31',
        planned_rate: 25,
        method: 'mechanical',
        progress: 30,
        est_product_cost: 8000,
        est_resource_cost: 5000,
        act_product_cost: 6500,
        act_resource_cost: 4000,
        status: 'in-progress',
        work_packages: [
          {
            id: 'wp_irrigation_setup',
            days_after_planting: 90,
            date: '2024-03-01',
            area: 18.3,
            rate: 25,
            quantity: 457.5,
            notes: 'Irrigation system setup and initial watering',
            completed: true
          },
          {
            id: 'wp_irrigation_ongoing',
            days_after_planting: 120,
            date: '2024-04-01',
            area: 18.3,
            rate: 25,
            quantity: 457.5,
            notes: 'Ongoing irrigation schedule - monthly',
            completed: false
          }
        ]
      }
    ]
  },
  {
    id: 'bloc_east_c',
    name: 'East Field C',
    area_hectares: 32.1,
    cycle_number: [1],
    variety_name: 'R 570',
    planned_harvest_date: '2024-12-15',
    expected_yield_tons_ha: 92.0,
    growth_stage: 'germination',
    progress: 15,
    total_est_product_cost: 65000,
    total_est_resource_cost: 35000,
    total_act_product_cost: 12000,
    total_act_resource_cost: 8000,
    cycle_type: 'plantation',
    planting_date: '2024-03-01',
    products: [
      {
        id: 'prod_planting_1',
        product_name: 'Sugarcane Planting',
        days_after_planting: 0,
        planned_start_date: '2024-03-01',
        planned_end_date: '2024-03-15',
        planned_rate: 3.5,
        method: 'manual',
        progress: 100,
        est_product_cost: 25000,
        est_resource_cost: 15000,
        act_product_cost: 24000,
        act_resource_cost: 14500,
        status: 'completed',
        work_packages: [
          {
            id: 'wp_seed_prep',
            days_after_planting: -5,
            date: '2024-02-25',
            area: 32.1,
            rate: 3.5,
            quantity: 112.35,
            notes: 'Seed cane preparation',
            completed: true
          },
          {
            id: 'wp_planting',
            days_after_planting: 0,
            date: '2024-03-01',
            area: 32.1,
            rate: 3.5,
            quantity: 112.35,
            notes: 'Manual planting completed',
            completed: true
          }
        ]
      },
      {
        id: 'prod_pest_control_1',
        product_name: 'Pest Control Program',
        days_after_planting: 30,
        planned_start_date: '2024-04-01',
        planned_end_date: '2024-04-05',
        planned_rate: 1.5,
        method: 'manual',
        progress: 0,
        est_product_cost: 15000,
        est_resource_cost: 8000,
        act_product_cost: 0,
        act_resource_cost: 0,
        status: 'planned',
        work_packages: [
          {
            id: 'wp_pest_spray_1',
            days_after_planting: 30,
            date: '2024-04-01',
            area: 32.1,
            rate: 1.5,
            quantity: 48.15,
            notes: 'Scheduled pest control application',
            completed: false
          }
        ]
      }
    ]
  }
];

// Product options for dropdown (common sugarcane operations)
export const productOptions = [
  'Land Preparation',
  'Sugarcane Planting',
  'NPK 14-20-20 Base Fertilizer',
  'NPK 20-46-60 Top Dressing',
  'Herbicide Application',
  'Pest Control Program',
  'Irrigation Management',
  'Ratoon Management',
  'Harvest Operations',
  'Post-Harvest Processing'
];

// Method options for dropdown
export const methodOptions = [
  'mechanical',
  'manual',
  'mixed'
];

// Growth stage options
export const growthStageOptions = [
  'germination',
  'tillering',
  'grand-growth',
  'maturation',
  'ripening',
  'harvested'
];
