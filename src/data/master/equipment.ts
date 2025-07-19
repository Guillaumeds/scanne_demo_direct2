/**
 * Master Data: Equipment Types
 * Exact data from CSV: equpment_md.csv
 */

export interface EquipmentType {
  id: string
  equipment_id: string
  name: string
  category: string | null
  description: string | null
  hourly_rate: number | null
  active: boolean | null
  created_at: string | null
  updated_at: string | null
  // Additional fields from CSV
  labour_id?: string
  unit?: string
  cost_per_unit?: number
}

export const EQUIPMENT_TYPES: EquipmentType[] = [
  // Exact data from CSV: equpment_md.csv - ALL 30 EQUIPMENT ITEMS
  {
    id: '726dec4a-ba8a-464f-99c4-c04b598953cd',
    equipment_id: '726dec4a-ba8a-464f-99c4-c04b598953cd',
    name: 'Field Supervisor',
    category: 'labour',
    description: null,
    hourly_rate: 50,
    active: true,
    created_at: null,
    updated_at: null,
    labour_id: 'field supervisor',
    unit: 'Rs',
    cost_per_unit: 50
  },
  {
    id: 'tractor-medium',
    equipment_id: 'tractor-medium',
    name: 'Medium Tractor (60-90 HP)',
    category: 'Fleet & Vehicles',
    description: null,
    hourly_rate: 650,
    active: true,
    created_at: null,
    updated_at: null,
    labour_id: 'Medium Tractor (60-90 HP)',
    unit: 'Rs',
    cost_per_unit: 650
  },
  {
    id: 'tractor-large',
    equipment_id: 'tractor-large',
    name: 'Large Tractor (90+ HP)',
    category: 'Fleet & Vehicles',
    description: null,
    hourly_rate: 850,
    active: true,
    created_at: null,
    updated_at: null,
    labour_id: 'Large Tractor (90+ HP)',
    unit: 'Rs',
    cost_per_unit: 850
  },
  {
    id: 'pickup-truck',
    equipment_id: 'pickup-truck',
    name: 'Pickup Truck',
    category: 'Fleet & Vehicles',
    description: null,
    hourly_rate: 200,
    active: true,
    created_at: null,
    updated_at: null,
    labour_id: 'Pickup Truck',
    unit: 'Rs',
    cost_per_unit: 200
  },
  {
    id: 'utility-vehicle',
    equipment_id: 'utility-vehicle',
    name: 'Utility Vehicle (ATV/UTV)',
    category: 'Fleet & Vehicles',
    description: null,
    hourly_rate: 150,
    active: true,
    created_at: null,
    updated_at: null,
    labour_id: 'Utility Vehicle (ATV/UTV)',
    unit: 'Rs',
    cost_per_unit: 150
  },
  {
    id: 'plow',
    equipment_id: 'plow',
    name: 'Moldboard Plow',
    category: 'Equipment & Tools',
    description: null,
    hourly_rate: 50,
    active: true,
    created_at: null,
    updated_at: null,
    labour_id: 'Moldboard Plow',
    unit: 'Rs',
    cost_per_unit: 50
  },
  {
    id: 'disc-harrow',
    equipment_id: 'disc-harrow',
    name: 'Disc Harrow',
    category: 'Equipment & Tools',
    description: null,
    hourly_rate: 40,
    active: true,
    created_at: null,
    updated_at: null,
    labour_id: 'Disc Harrow',
    unit: 'Rs',
    cost_per_unit: 40
  },
  {
    id: 'cultivator',
    equipment_id: 'cultivator',
    name: 'Field Cultivator',
    category: 'Equipment & Tools',
    description: null,
    hourly_rate: 45,
    active: true,
    created_at: null,
    updated_at: null,
    labour_id: 'Field Cultivator',
    unit: 'Rs',
    cost_per_unit: 45
  },
  {
    id: 'planter',
    equipment_id: 'planter',
    name: 'Sugarcane Planter',
    category: 'Equipment & Tools',
    description: null,
    hourly_rate: 80,
    active: true,
    created_at: null,
    updated_at: null,
    labour_id: 'Sugarcane Planter',
    unit: 'Rs',
    cost_per_unit: 80
  },
  {
    id: 'fertilizer-spreader',
    equipment_id: 'fertilizer-spreader',
    name: 'Fertilizer Spreader',
    category: 'Equipment & Tools',
    description: null,
    hourly_rate: 35,
    active: true,
    created_at: null,
    updated_at: null,
    labour_id: 'Fertilizer Spreader',
    unit: 'Rs',
    cost_per_unit: 35
  },
  {
    id: 'sprayer',
    equipment_id: 'sprayer',
    name: 'Field Sprayer',
    category: 'Equipment & Tools',
    description: null,
    hourly_rate: 60,
    active: true,
    created_at: null,
    updated_at: null,
    labour_id: 'Field Sprayer',
    unit: 'Rs',
    cost_per_unit: 60
  },
  {
    id: 'mower',
    equipment_id: 'mower',
    name: 'Rotary Mower',
    category: 'Equipment & Tools',
    description: null,
    hourly_rate: 40,
    active: true,
    created_at: null,
    updated_at: null,
    labour_id: 'Rotary Mower',
    unit: 'Rs',
    cost_per_unit: 40
  },
  {
    id: 'bulldozer',
    equipment_id: 'bulldozer',
    name: 'Bulldozer',
    category: 'Heavy Machinery',
    description: null,
    hourly_rate: 1200,
    active: true,
    created_at: null,
    updated_at: null,
    labour_id: 'Bulldozer',
    unit: 'Rs',
    cost_per_unit: 1200
  },
  {
    id: 'excavator',
    equipment_id: 'excavator',
    name: 'Excavator',
    category: 'Heavy Machinery',
    description: null,
    hourly_rate: 800,
    active: true,
    created_at: null,
    updated_at: null,
    labour_id: 'Excavator',
    unit: 'Rs',
    cost_per_unit: 800
  },
  {
    id: 'grader',
    equipment_id: 'grader',
    name: 'Motor Grader',
    category: 'Heavy Machinery',
    description: null,
    hourly_rate: 600,
    active: true,
    created_at: null,
    updated_at: null,
    labour_id: 'Motor Grader',
    unit: 'Rs',
    cost_per_unit: 600
  },
  {
    id: 'compactor',
    equipment_id: 'compactor',
    name: 'Soil Compactor',
    category: 'Heavy Machinery',
    description: null,
    hourly_rate: 400,
    active: true,
    created_at: null,
    updated_at: null,
    labour_id: 'Soil Compactor',
    unit: 'Rs',
    cost_per_unit: 400
  },
  {
    id: 'truck-small',
    equipment_id: 'truck-small',
    name: 'Small Transport Truck (3-5 tons)',
    category: 'Transport & Logistics',
    description: null,
    hourly_rate: 300,
    active: true,
    created_at: null,
    updated_at: null,
    labour_id: 'Small Transport Truck (3-5 tons)',
    unit: 'Rs',
    cost_per_unit: 300
  },
  {
    id: 'truck-large',
    equipment_id: 'truck-large',
    name: 'Large Transport Truck (10+ tons)',
    category: 'Transport & Logistics',
    description: null,
    hourly_rate: 500,
    active: true,
    created_at: null,
    updated_at: null,
    labour_id: 'Large Transport Truck (10+ tons)',
    unit: 'Rs',
    cost_per_unit: 500
  },
  {
    id: 'trailer',
    equipment_id: 'trailer',
    name: 'Agricultural Trailer',
    category: 'Transport & Logistics',
    description: null,
    hourly_rate: 100,
    active: true,
    created_at: null,
    updated_at: null,
    labour_id: 'Agricultural Trailer',
    unit: 'Rs',
    cost_per_unit: 100
  },
  // Remaining equipment from CSV
  {
    id: 'forklift',
    equipment_id: 'forklift',
    name: 'Forklift',
    category: 'Transport & Logistics',
    description: null,
    hourly_rate: 250,
    active: true,
    created_at: null,
    updated_at: null,
    labour_id: 'Forklift',
    unit: 'Rs',
    cost_per_unit: 250
  },
  {
    id: 'crane-mobile',
    equipment_id: 'crane-mobile',
    name: 'Mobile Crane',
    category: 'Heavy Machinery',
    description: null,
    hourly_rate: 1000,
    active: true,
    created_at: null,
    updated_at: null,
    labour_id: 'Mobile Crane',
    unit: 'Rs',
    cost_per_unit: 1000
  },
  {
    id: 'generator-diesel',
    equipment_id: 'generator-diesel',
    name: 'Diesel Generator (50kW)',
    category: 'Power & Utilities',
    description: null,
    hourly_rate: 180,
    active: true,
    created_at: null,
    updated_at: null,
    labour_id: 'Diesel Generator (50kW)',
    unit: 'Rs',
    cost_per_unit: 180
  },
  {
    id: 'water-pump',
    equipment_id: 'water-pump',
    name: 'Water Pump (Centrifugal)',
    category: 'Irrigation & Water',
    description: null,
    hourly_rate: 120,
    active: true,
    created_at: null,
    updated_at: null,
    labour_id: 'Water Pump (Centrifugal)',
    unit: 'Rs',
    cost_per_unit: 120
  },
  {
    id: 'irrigation-system',
    equipment_id: 'irrigation-system',
    name: 'Drip Irrigation System',
    category: 'Irrigation & Water',
    description: null,
    hourly_rate: 80,
    active: true,
    created_at: null,
    updated_at: null,
    labour_id: 'Drip Irrigation System',
    unit: 'Rs',
    cost_per_unit: 80
  },
  {
    id: 'harvester-sugarcane',
    equipment_id: 'harvester-sugarcane',
    name: 'Sugarcane Harvester',
    category: 'Harvesting Equipment',
    description: null,
    hourly_rate: 1500,
    active: true,
    created_at: null,
    updated_at: null,
    labour_id: 'Sugarcane Harvester',
    unit: 'Rs',
    cost_per_unit: 1500
  },
  {
    id: 'loader-cane',
    equipment_id: 'loader-cane',
    name: 'Cane Loader',
    category: 'Harvesting Equipment',
    description: null,
    hourly_rate: 400,
    active: true,
    created_at: null,
    updated_at: null,
    labour_id: 'Cane Loader',
    unit: 'Rs',
    cost_per_unit: 400
  },
  {
    id: 'weighbridge',
    equipment_id: 'weighbridge',
    name: 'Weighbridge (Electronic)',
    category: 'Measurement & Testing',
    description: null,
    hourly_rate: 50,
    active: true,
    created_at: null,
    updated_at: null,
    labour_id: 'Weighbridge (Electronic)',
    unit: 'Rs',
    cost_per_unit: 50
  },
  {
    id: 'soil-tester',
    equipment_id: 'soil-tester',
    name: 'Soil Testing Kit',
    category: 'Measurement & Testing',
    description: null,
    hourly_rate: 30,
    active: true,
    created_at: null,
    updated_at: null,
    labour_id: 'Soil Testing Kit',
    unit: 'Rs',
    cost_per_unit: 30
  }
]

// Utility functions for equipment data
export const equipmentUtils = {
  getById: (id: string) => EQUIPMENT_TYPES.find(e => e.id === id),
  getByEquipmentId: (equipment_id: string) => EQUIPMENT_TYPES.find(e => e.equipment_id === equipment_id),
  getByCategory: (category: string) => EQUIPMENT_TYPES.filter(e => e.category === category),
  getActive: () => EQUIPMENT_TYPES.filter(e => e.active === true),
  getFleetVehicles: () => EQUIPMENT_TYPES.filter(e => e.category === 'Fleet & Vehicles'),
  getEquipmentTools: () => EQUIPMENT_TYPES.filter(e => e.category === 'Equipment & Tools'),
  getHeavyMachinery: () => EQUIPMENT_TYPES.filter(e => e.category === 'Heavy Machinery'),
  getTransportLogistics: () => EQUIPMENT_TYPES.filter(e => e.category === 'Transport & Logistics'),
  getIrrigationWater: () => EQUIPMENT_TYPES.filter(e => e.category === 'Irrigation & Water'),
  getHarvestingEquipment: () => EQUIPMENT_TYPES.filter(e => e.category === 'Harvesting Equipment'),
  getMeasurementTesting: () => EQUIPMENT_TYPES.filter(e => e.category === 'Measurement & Testing'),
  getPowerUtilities: () => EQUIPMENT_TYPES.filter(e => e.category === 'Power & Utilities'),
  getLabour: () => EQUIPMENT_TYPES.filter(e => e.category === 'labour'),
  searchByName: (query: string) => EQUIPMENT_TYPES.filter(e =>
    e.name.toLowerCase().includes(query.toLowerCase())
  ),
}
