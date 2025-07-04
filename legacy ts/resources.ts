export interface Resource {
  id: string
  name: string
  category: ResourceCategory
  description?: string
  unit: string
  defaultRate?: number
  costPerUnit?: number
  skillLevel?: string
  overtimeMultiplier?: number
}

export type ResourceCategory = 
  | 'fleet'
  | 'labour'
  | 'equipment'
  | 'machinery'
  | 'transport'
  | 'irrigation'
  | 'harvesting'
  | 'processing'

export const RESOURCE_CATEGORIES = [
  {
    id: 'fleet' as ResourceCategory,
    name: 'Fleet & Vehicles',
    icon: '🚜',
    color: 'bg-blue-100 text-blue-800 border-blue-200'
  },
  {
    id: 'labour' as ResourceCategory,
    name: 'Labour & Personnel',
    icon: '👷',
    color: 'bg-green-100 text-green-800 border-green-200'
  },
  {
    id: 'equipment' as ResourceCategory,
    name: 'Equipment & Tools',
    icon: '🔧',
    color: 'bg-purple-100 text-purple-800 border-purple-200'
  },
  {
    id: 'machinery' as ResourceCategory,
    name: 'Heavy Machinery',
    icon: '🏗️',
    color: 'bg-orange-100 text-orange-800 border-orange-200'
  },
  {
    id: 'transport' as ResourceCategory,
    name: 'Transport & Logistics',
    icon: '🚛',
    color: 'bg-indigo-100 text-indigo-800 border-indigo-200'
  },
  {
    id: 'irrigation' as ResourceCategory,
    name: 'Irrigation Systems',
    icon: '💧',
    color: 'bg-cyan-100 text-cyan-800 border-cyan-200'
  },
  {
    id: 'harvesting' as ResourceCategory,
    name: 'Harvesting Equipment',
    icon: '🌾',
    color: 'bg-amber-100 text-amber-800 border-amber-200'
  },
  {
    id: 'processing' as ResourceCategory,
    name: 'Processing Equipment',
    icon: '⚙️',
    color: 'bg-gray-100 text-gray-800 border-gray-200'
  }
]

export const RESOURCES: Resource[] = [
  // Fleet & Vehicles
  { id: 'tractor-small', name: 'Small Tractor (40-60 HP)', category: 'fleet', unit: 'hours', defaultRate: 1, costPerUnit: 450 },
  { id: 'tractor-medium', name: 'Medium Tractor (60-90 HP)', category: 'fleet', unit: 'hours', defaultRate: 1, costPerUnit: 650 },
  { id: 'tractor-large', name: 'Large Tractor (90+ HP)', category: 'fleet', unit: 'hours', defaultRate: 1, costPerUnit: 850 },
  { id: 'pickup-truck', name: 'Pickup Truck', category: 'fleet', unit: 'hours', defaultRate: 1, costPerUnit: 200 },
  { id: 'utility-vehicle', name: 'Utility Vehicle (ATV/UTV)', category: 'fleet', unit: 'hours', defaultRate: 1, costPerUnit: 150 },

  // Labour & Personnel
  { id: 'field-worker', name: 'Field Worker', category: 'labour', unit: 'hours', defaultRate: 8, costPerUnit: 25, skillLevel: 'Basic' },
  { id: 'skilled-worker', name: 'Skilled Agricultural Worker', category: 'labour', unit: 'hours', defaultRate: 8, costPerUnit: 35, skillLevel: 'Skilled' },
  { id: 'machine-operator', name: 'Machine Operator', category: 'labour', unit: 'hours', defaultRate: 8, costPerUnit: 45, skillLevel: 'Specialized' },
  { id: 'supervisor', name: 'Field Supervisor', category: 'labour', unit: 'hours', defaultRate: 8, costPerUnit: 60, skillLevel: 'Management' },
  { id: 'overtime-worker', name: 'Field Worker (Overtime)', category: 'labour', unit: 'hours', defaultRate: 4, costPerUnit: 37.5, skillLevel: 'Basic', overtimeMultiplier: 1.5 },
  { id: 'overtime-skilled', name: 'Skilled Worker (Overtime)', category: 'labour', unit: 'hours', defaultRate: 4, costPerUnit: 52.5, skillLevel: 'Skilled', overtimeMultiplier: 1.5 },
  { id: 'seasonal-worker', name: 'Seasonal Harvest Worker', category: 'labour', unit: 'hours', defaultRate: 10, costPerUnit: 30, skillLevel: 'Seasonal' },

  // Equipment & Tools
  { id: 'plow', name: 'Moldboard Plow', category: 'equipment', unit: 'hours', defaultRate: 1, costPerUnit: 50 },
  { id: 'disc-harrow', name: 'Disc Harrow', category: 'equipment', unit: 'hours', defaultRate: 1, costPerUnit: 40 },
  { id: 'cultivator', name: 'Field Cultivator', category: 'equipment', unit: 'hours', defaultRate: 1, costPerUnit: 45 },
  { id: 'planter', name: 'Sugarcane Planter', category: 'equipment', unit: 'hours', defaultRate: 1, costPerUnit: 80 },
  { id: 'fertilizer-spreader', name: 'Fertilizer Spreader', category: 'equipment', unit: 'hours', defaultRate: 1, costPerUnit: 35 },
  { id: 'sprayer', name: 'Field Sprayer', category: 'equipment', unit: 'hours', defaultRate: 1, costPerUnit: 60 },
  { id: 'mower', name: 'Rotary Mower', category: 'equipment', unit: 'hours', defaultRate: 1, costPerUnit: 40 },

  // Heavy Machinery
  { id: 'bulldozer', name: 'Bulldozer', category: 'machinery', unit: 'hours', defaultRate: 1, costPerUnit: 1200 },
  { id: 'excavator', name: 'Excavator', category: 'machinery', unit: 'hours', defaultRate: 1, costPerUnit: 800 },
  { id: 'grader', name: 'Motor Grader', category: 'machinery', unit: 'hours', defaultRate: 1, costPerUnit: 600 },
  { id: 'compactor', name: 'Soil Compactor', category: 'machinery', unit: 'hours', defaultRate: 1, costPerUnit: 400 },

  // Transport & Logistics
  { id: 'truck-small', name: 'Small Transport Truck (3-5 tons)', category: 'transport', unit: 'hours', defaultRate: 1, costPerUnit: 300 },
  { id: 'truck-large', name: 'Large Transport Truck (10+ tons)', category: 'transport', unit: 'hours', defaultRate: 1, costPerUnit: 500 },
  { id: 'trailer', name: 'Agricultural Trailer', category: 'transport', unit: 'hours', defaultRate: 1, costPerUnit: 100 },
  { id: 'cane-trailer', name: 'Sugarcane Transport Trailer', category: 'transport', unit: 'hours', defaultRate: 1, costPerUnit: 150 },

  // Irrigation Systems
  { id: 'drip-system', name: 'Drip Irrigation System', category: 'irrigation', unit: 'hours', defaultRate: 1, costPerUnit: 25 },
  { id: 'sprinkler-system', name: 'Sprinkler Irrigation System', category: 'irrigation', unit: 'hours', defaultRate: 1, costPerUnit: 35 },
  { id: 'pump-electric', name: 'Electric Water Pump', category: 'irrigation', unit: 'hours', defaultRate: 1, costPerUnit: 15 },
  { id: 'pump-diesel', name: 'Diesel Water Pump', category: 'irrigation', unit: 'hours', defaultRate: 1, costPerUnit: 25 },

  // Harvesting Equipment
  { id: 'cane-harvester', name: 'Sugarcane Harvester', category: 'harvesting', unit: 'hours', defaultRate: 1, costPerUnit: 1500 },
  { id: 'cane-loader', name: 'Sugarcane Loader', category: 'harvesting', unit: 'hours', defaultRate: 1, costPerUnit: 400 },
  { id: 'cutting-tools', name: 'Manual Cutting Tools', category: 'harvesting', unit: 'hours', defaultRate: 1, costPerUnit: 10 },

  // Processing Equipment
  { id: 'weighbridge', name: 'Weighbridge Scale', category: 'processing', unit: 'hours', defaultRate: 1, costPerUnit: 50 },
  { id: 'cleaning-station', name: 'Cane Cleaning Station', category: 'processing', unit: 'hours', defaultRate: 1, costPerUnit: 75 }
]
