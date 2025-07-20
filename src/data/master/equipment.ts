/**
 * Master Data: Equipment Types
 * Exact data from CSV: equpment_md.csv
 */

export interface Equipment {
  id: string
  equipment_id?: string
  name: string
  category: string
  unit?: string
  cost_per_hour: number
  description?: string
  active: boolean
  created_at?: string
  updated_at?: string
  // Legacy fields for backward compatibility
  type?: string
  fuel_consumption?: number
  maintenance_cost?: number
  specifications?: any
}

// Equipment data from equpment_md.csv (note: file has typo in name)
export const EQUIPMENT_TYPES: Equipment[] = [
  {
    id: 'tractor-medium',
    name: 'Medium Tractor (60-90 HP)',
    category: 'Fleet & Vehicles',
    unit: 'Rs',
    cost_per_hour: 650,
    description: '',
    active: true,
    type: 'Agricultural Vehicle'
  },
  {
    id: 'tractor-large',
    name: 'Large Tractor (90+ HP)',
    category: 'Fleet & Vehicles',
    unit: 'Rs',
    cost_per_hour: 850,
    description: '',
    active: true,
    type: 'Agricultural Vehicle'
  },
  {
    id: 'pickup-truck',
    name: 'Pickup Truck',
    category: 'Fleet & Vehicles',
    unit: 'Rs',
    cost_per_hour: 200,
    description: '',
    active: true,
    type: 'Vehicle'
  },
  {
    id: 'utility-vehicle',
    name: 'Utility Vehicle (ATV/UTV)',
    category: 'Fleet & Vehicles',
    unit: 'Rs',
    cost_per_hour: 150,
    description: '',
    active: true,
    type: 'Vehicle'
  },
  {
    id: 'plow',
    name: 'Moldboard Plow',
    category: 'Equipment & Tools',
    unit: 'Rs',
    cost_per_hour: 50,
    description: '',
    active: true,
    type: 'Implement'
  },
  {
    id: 'disc-harrow',
    name: 'Disc Harrow',
    category: 'Equipment & Tools',
    unit: 'Rs',
    cost_per_hour: 40,
    description: '',
    active: true,
    type: 'Implement'
  },
  {
    id: 'cultivator',
    name: 'Field Cultivator',
    category: 'Equipment & Tools',
    unit: 'Rs',
    cost_per_hour: 45,
    description: '',
    active: true,
    type: 'Implement'
  },
  {
    id: 'planter',
    name: 'Sugarcane Planter',
    category: 'Equipment & Tools',
    unit: 'Rs',
    cost_per_hour: 80,
    description: '',
    active: true,
    type: 'Implement'
  },
  {
    id: 'sprayer',
    name: 'Boom Sprayer',
    category: 'Equipment & Tools',
    unit: 'Rs',
    cost_per_hour: 60,
    description: '',
    active: true,
    type: 'Implement'
  },
  {
    id: 'fertilizer-spreader',
    name: 'Fertilizer Spreader',
    category: 'Equipment & Tools',
    unit: 'Rs',
    cost_per_hour: 35,
    description: '',
    active: true,
    type: 'Implement'
  },
  {
    id: 'mower',
    name: 'Rotary Mower',
    category: 'Equipment & Tools',
    unit: 'Rs',
    cost_per_hour: 40,
    description: '',
    active: true,
    type: 'Implement'
  },
  {
    id: 'harvester',
    name: 'Sugarcane Harvester',
    category: 'Equipment & Tools',
    unit: 'Rs',
    cost_per_hour: 1200,
    description: '',
    active: true,
    type: 'Self-Propelled'
  },
  {
    id: 'trailer',
    name: 'Farm Trailer',
    category: 'Equipment & Tools',
    unit: 'Rs',
    cost_per_hour: 25,
    description: '',
    active: true,
    type: 'Trailer'
  },
  {
    id: 'irrigation-pump',
    name: 'Irrigation Pump',
    category: 'Equipment & Tools',
    unit: 'Rs',
    cost_per_hour: 75,
    description: '',
    active: true,
    type: 'Pump'
  },
  {
    id: 'generator',
    name: 'Diesel Generator',
    category: 'Equipment & Tools',
    unit: 'Rs',
    cost_per_hour: 100,
    description: '',
    active: true,
    type: 'Power Equipment'
  },
  {
    id: 'water-tank',
    name: 'Water Tank Trailer',
    category: 'Equipment & Tools',
    unit: 'Rs',
    cost_per_hour: 30,
    description: '',
    active: true,
    type: 'Trailer'
  },
  {
    id: 'loader',
    name: 'Front End Loader',
    category: 'Equipment & Tools',
    unit: 'Rs',
    cost_per_hour: 400,
    description: '',
    active: true,
    type: 'Heavy Equipment'
  },
  {
    id: 'excavator',
    name: 'Mini Excavator',
    category: 'Equipment & Tools',
    unit: 'Rs',
    cost_per_hour: 500,
    description: '',
    active: true,
    type: 'Heavy Equipment'
  },
  {
    id: 'compactor',
    name: 'Soil Compactor',
    category: 'Equipment & Tools',
    unit: 'Rs',
    cost_per_hour: 200,
    description: '',
    active: true,
    type: 'Heavy Equipment'
  },
  {
    id: 'weeder',
    name: 'Mechanical Weeder',
    category: 'Equipment & Tools',
    unit: 'Rs',
    cost_per_hour: 35,
    description: '',
    active: true,
    type: 'Implement'
  },
  {
    id: 'subsoiler',
    name: 'Subsoiler',
    category: 'Equipment & Tools',
    unit: 'Rs',
    cost_per_hour: 55,
    description: '',
    active: true,
    type: 'Implement'
  },
  {
    id: 'chisel-plow',
    name: 'Chisel Plow',
    category: 'Equipment & Tools',
    unit: 'Rs',
    cost_per_hour: 45,
    description: '',
    active: true,
    type: 'Implement'
  },
  {
    id: 'seed-drill',
    name: 'Seed Drill',
    category: 'Equipment & Tools',
    unit: 'Rs',
    cost_per_hour: 70,
    description: '',
    active: true,
    type: 'Implement'
  },
  {
    id: 'rake',
    name: 'Hay Rake',
    category: 'Equipment & Tools',
    unit: 'Rs',
    cost_per_hour: 30,
    description: '',
    active: true,
    type: 'Implement'
  },
  {
    id: 'baler',
    name: 'Round Baler',
    category: 'Equipment & Tools',
    unit: 'Rs',
    cost_per_hour: 150,
    description: '',
    active: true,
    type: 'Implement'
  },
  {
    id: 'tedder',
    name: 'Hay Tedder',
    category: 'Equipment & Tools',
    unit: 'Rs',
    cost_per_hour: 40,
    description: '',
    active: true,
    type: 'Implement'
  },
  {
    id: 'manure-spreader',
    name: 'Manure Spreader',
    category: 'Equipment & Tools',
    unit: 'Rs',
    cost_per_hour: 60,
    description: '',
    active: true,
    type: 'Implement'
  },
  {
    id: 'lime-spreader',
    name: 'Lime Spreader',
    category: 'Equipment & Tools',
    unit: 'Rs',
    cost_per_hour: 45,
    description: '',
    active: true,
    type: 'Implement'
  }
]
