/**
 * Master Data: Equipment Types
 * Static reference data for agricultural equipment used in demo
 */

export interface EquipmentType {
  id: string
  name: string
  category: 'tractor' | 'implement' | 'harvester' | 'irrigation' | 'transport' | 'specialized'
  type: string
  specifications: {
    power?: string // HP for tractors
    workingWidth?: string // meters for implements
    capacity?: string // various units
    fuelType?: 'diesel' | 'petrol' | 'electric' | 'hybrid'
    weight?: string // kg
  }
  operationalCosts: {
    hourlyRate: number
    fuelConsumption: number // L/hour
    maintenanceCostPerHour: number
    operatorRequired: boolean
  }
  availability: {
    seasonal: string[]
    maintenanceSchedule: string[]
  }
  capabilities: string[]
  attachments: string[]
  active: boolean
  createdAt: string
  updatedAt: string
}

export const EQUIPMENT_TYPES: EquipmentType[] = [
  {
    id: 'equip-001',
    name: 'John Deere 6120M',
    category: 'tractor',
    type: 'Medium Utility Tractor',
    specifications: {
      power: '120 HP',
      fuelType: 'diesel',
      weight: '5,200 kg'
    },
    operationalCosts: {
      hourlyRate: 45.00,
      fuelConsumption: 12.5,
      maintenanceCostPerHour: 8.50,
      operatorRequired: true
    },
    availability: {
      seasonal: ['All Year'],
      maintenanceSchedule: ['Monthly Service', 'Annual Overhaul']
    },
    capabilities: [
      'Field cultivation',
      'Planting operations',
      'Spraying',
      'Light transport'
    ],
    attachments: [
      'Disc Harrow',
      'Planter',
      'Sprayer',
      'Trailer'
    ],
    active: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'equip-002',
    name: 'Case IH Magnum 380',
    category: 'tractor',
    type: 'High Power Tractor',
    specifications: {
      power: '380 HP',
      fuelType: 'diesel',
      weight: '12,500 kg'
    },
    operationalCosts: {
      hourlyRate: 85.00,
      fuelConsumption: 28.0,
      maintenanceCostPerHour: 15.00,
      operatorRequired: true
    },
    availability: {
      seasonal: ['All Year'],
      maintenanceSchedule: ['Weekly Check', 'Monthly Service', 'Annual Overhaul']
    },
    capabilities: [
      'Heavy cultivation',
      'Deep plowing',
      'Large implement operation',
      'Heavy transport'
    ],
    attachments: [
      'Heavy Disc Harrow',
      'Subsoiler',
      'Large Planter',
      'Heavy Trailer'
    ],
    active: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'equip-003',
    name: 'Disc Harrow 24-Disc',
    category: 'implement',
    type: 'Soil Preparation',
    specifications: {
      workingWidth: '6.0 m',
      weight: '2,800 kg'
    },
    operationalCosts: {
      hourlyRate: 25.00,
      fuelConsumption: 0, // Implement doesn't consume fuel directly
      maintenanceCostPerHour: 3.50,
      operatorRequired: false // Operated with tractor
    },
    availability: {
      seasonal: ['All Year'],
      maintenanceSchedule: ['After Each Use', 'Monthly Inspection']
    },
    capabilities: [
      'Soil breaking',
      'Residue incorporation',
      'Seedbed preparation'
    ],
    attachments: [],
    active: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'equip-004',
    name: 'Sugarcane Planter 4-Row',
    category: 'implement',
    type: 'Planting Equipment',
    specifications: {
      workingWidth: '4.8 m',
      capacity: '4 rows',
      weight: '3,200 kg'
    },
    operationalCosts: {
      hourlyRate: 35.00,
      fuelConsumption: 0,
      maintenanceCostPerHour: 5.00,
      operatorRequired: false
    },
    availability: {
      seasonal: ['March-May', 'September-November'],
      maintenanceSchedule: ['Pre-season Check', 'Post-season Service']
    },
    capabilities: [
      'Sugarcane planting',
      'Fertilizer application',
      'Row spacing control'
    ],
    attachments: [
      'Fertilizer Hopper',
      'Seed Cane Cutter'
    ],
    active: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'equip-005',
    name: 'Boom Sprayer 1000L',
    category: 'implement',
    type: 'Crop Protection',
    specifications: {
      workingWidth: '18.0 m',
      capacity: '1000 L',
      weight: '1,800 kg'
    },
    operationalCosts: {
      hourlyRate: 30.00,
      fuelConsumption: 0,
      maintenanceCostPerHour: 4.00,
      operatorRequired: false
    },
    availability: {
      seasonal: ['All Year'],
      maintenanceSchedule: ['After Each Use', 'Weekly Cleaning', 'Monthly Calibration']
    },
    capabilities: [
      'Pesticide application',
      'Herbicide application',
      'Fertilizer spraying',
      'Growth regulator application'
    ],
    attachments: [
      'GPS Guidance System',
      'Auto-boom Height Control',
      'Variable Rate Controller'
    ],
    active: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'equip-006',
    name: 'Sugarcane Harvester CH570',
    category: 'harvester',
    type: 'Self-Propelled Harvester',
    specifications: {
      power: '570 HP',
      workingWidth: '2.0 m',
      capacity: '400 tons/day',
      fuelType: 'diesel',
      weight: '22,000 kg'
    },
    operationalCosts: {
      hourlyRate: 150.00,
      fuelConsumption: 45.0,
      maintenanceCostPerHour: 25.00,
      operatorRequired: true
    },
    availability: {
      seasonal: ['May-November'],
      maintenanceSchedule: ['Daily Check', 'Weekly Service', 'Monthly Overhaul']
    },
    capabilities: [
      'Sugarcane cutting',
      'Cleaning and chopping',
      'Loading into transport',
      'Trash separation'
    ],
    attachments: [
      'GPS Tracking System',
      'Yield Monitoring',
      'Auto-steering'
    ],
    active: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'equip-007',
    name: 'Irrigation Pivot System',
    category: 'irrigation',
    type: 'Center Pivot',
    specifications: {
      workingWidth: '400 m radius',
      capacity: '50 ha coverage',
      power: 'Electric'
    },
    operationalCosts: {
      hourlyRate: 20.00,
      fuelConsumption: 0,
      maintenanceCostPerHour: 2.50,
      operatorRequired: false
    },
    availability: {
      seasonal: ['All Year'],
      maintenanceSchedule: ['Weekly Inspection', 'Monthly Service', 'Annual Overhaul']
    },
    capabilities: [
      'Automated irrigation',
      'Variable rate application',
      'Remote monitoring',
      'Fertigation'
    ],
    attachments: [
      'Soil Moisture Sensors',
      'Weather Station',
      'Remote Control System'
    ],
    active: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'equip-008',
    name: 'Farm Truck 10-Ton',
    category: 'transport',
    type: 'Agricultural Transport',
    specifications: {
      capacity: '10 tons',
      fuelType: 'diesel',
      weight: '8,500 kg'
    },
    operationalCosts: {
      hourlyRate: 35.00,
      fuelConsumption: 18.0,
      maintenanceCostPerHour: 6.00,
      operatorRequired: true
    },
    availability: {
      seasonal: ['All Year'],
      maintenanceSchedule: ['Weekly Check', 'Monthly Service', 'Annual Inspection']
    },
    capabilities: [
      'Cane transport',
      'Equipment transport',
      'Supply delivery',
      'Field access'
    ],
    attachments: [
      'Hydraulic Tipper',
      'Side Rails',
      'Tarpaulin Cover'
    ],
    active: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }
]

// Utility functions for equipment data
export const equipmentUtils = {
  getById: (id: string) => EQUIPMENT_TYPES.find(e => e.id === id),
  getByCategory: (category: EquipmentType['category']) => EQUIPMENT_TYPES.filter(e => e.category === category),
  getActive: () => EQUIPMENT_TYPES.filter(e => e.active),
  getAvailableInSeason: (season: string) => EQUIPMENT_TYPES.filter(e => 
    e.availability.seasonal.includes(season) || e.availability.seasonal.includes('All Year')
  ),
  getByHourlyRateRange: (min: number, max: number) => EQUIPMENT_TYPES.filter(e => 
    e.operationalCosts.hourlyRate >= min && e.operationalCosts.hourlyRate <= max
  ),
  getTractors: () => EQUIPMENT_TYPES.filter(e => e.category === 'tractor'),
  getImplements: () => EQUIPMENT_TYPES.filter(e => e.category === 'implement'),
  getHarvesters: () => EQUIPMENT_TYPES.filter(e => e.category === 'harvester'),
  calculateOperationalCost: (equipmentId: string, hours: number) => {
    const equipment = equipmentUtils.getById(equipmentId)
    if (!equipment) return 0
    
    const { hourlyRate, fuelConsumption, maintenanceCostPerHour } = equipment.operationalCosts
    const fuelCost = fuelConsumption * 1.25 // Assuming $1.25 per liter
    
    return hours * (hourlyRate + fuelCost + maintenanceCostPerHour)
  },
}
