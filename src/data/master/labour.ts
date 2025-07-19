/**
 * Master Data: Labour Types
 * Static reference data for labour categories and rates used in demo
 */

export interface LabourType {
  id: string
  name: string
  category: 'field_operations' | 'maintenance' | 'harvesting' | 'supervision' | 'specialized'
  skillLevel: 'unskilled' | 'semi_skilled' | 'skilled' | 'supervisor'
  hourlyRate: number
  dailyRate: number
  overtimeMultiplier: number
  benefits: {
    healthInsurance: boolean
    transportAllowance: number
    mealAllowance: number
    safetyEquipment: boolean
  }
  workingHours: {
    standard: number
    maximum: number
  }
  seasonalAvailability: string[]
  certificationRequired: string[]
  active: boolean
  createdAt: string
  updatedAt: string
}

export const LABOUR_TYPES: LabourType[] = [
  {
    id: 'labour-001',
    name: 'Field Worker - General',
    category: 'field_operations',
    skillLevel: 'unskilled',
    hourlyRate: 8.50,
    dailyRate: 68.00,
    overtimeMultiplier: 1.5,
    benefits: {
      healthInsurance: true,
      transportAllowance: 5.00,
      mealAllowance: 8.00,
      safetyEquipment: true
    },
    workingHours: {
      standard: 8,
      maximum: 10
    },
    seasonalAvailability: ['All Year'],
    certificationRequired: [],
    active: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'labour-002',
    name: 'Tractor Operator',
    category: 'field_operations',
    skillLevel: 'skilled',
    hourlyRate: 15.00,
    dailyRate: 120.00,
    overtimeMultiplier: 1.5,
    benefits: {
      healthInsurance: true,
      transportAllowance: 8.00,
      mealAllowance: 10.00,
      safetyEquipment: true
    },
    workingHours: {
      standard: 8,
      maximum: 12
    },
    seasonalAvailability: ['All Year'],
    certificationRequired: ['Heavy Vehicle License', 'Tractor Operation Certificate'],
    active: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'labour-003',
    name: 'Irrigation Specialist',
    category: 'specialized',
    skillLevel: 'skilled',
    hourlyRate: 18.50,
    dailyRate: 148.00,
    overtimeMultiplier: 1.5,
    benefits: {
      healthInsurance: true,
      transportAllowance: 10.00,
      mealAllowance: 12.00,
      safetyEquipment: true
    },
    workingHours: {
      standard: 8,
      maximum: 10
    },
    seasonalAvailability: ['All Year'],
    certificationRequired: ['Irrigation Systems Certificate', 'Water Management Training'],
    active: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'labour-004',
    name: 'Harvest Crew Leader',
    category: 'harvesting',
    skillLevel: 'supervisor',
    hourlyRate: 22.00,
    dailyRate: 176.00,
    overtimeMultiplier: 1.5,
    benefits: {
      healthInsurance: true,
      transportAllowance: 12.00,
      mealAllowance: 15.00,
      safetyEquipment: true
    },
    workingHours: {
      standard: 8,
      maximum: 12
    },
    seasonalAvailability: ['May-November'],
    certificationRequired: ['Team Leadership Certificate', 'Safety Training'],
    active: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'labour-005',
    name: 'Harvest Worker',
    category: 'harvesting',
    skillLevel: 'semi_skilled',
    hourlyRate: 12.00,
    dailyRate: 96.00,
    overtimeMultiplier: 1.5,
    benefits: {
      healthInsurance: true,
      transportAllowance: 6.00,
      mealAllowance: 10.00,
      safetyEquipment: true
    },
    workingHours: {
      standard: 8,
      maximum: 12
    },
    seasonalAvailability: ['May-November'],
    certificationRequired: ['Basic Safety Training'],
    active: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'labour-006',
    name: 'Equipment Mechanic',
    category: 'maintenance',
    skillLevel: 'skilled',
    hourlyRate: 20.00,
    dailyRate: 160.00,
    overtimeMultiplier: 1.5,
    benefits: {
      healthInsurance: true,
      transportAllowance: 10.00,
      mealAllowance: 12.00,
      safetyEquipment: true
    },
    workingHours: {
      standard: 8,
      maximum: 10
    },
    seasonalAvailability: ['All Year'],
    certificationRequired: ['Mechanical Engineering Certificate', 'Equipment Maintenance Training'],
    active: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'labour-007',
    name: 'Field Supervisor',
    category: 'supervision',
    skillLevel: 'supervisor',
    hourlyRate: 25.00,
    dailyRate: 200.00,
    overtimeMultiplier: 1.5,
    benefits: {
      healthInsurance: true,
      transportAllowance: 15.00,
      mealAllowance: 18.00,
      safetyEquipment: true
    },
    workingHours: {
      standard: 8,
      maximum: 10
    },
    seasonalAvailability: ['All Year'],
    certificationRequired: ['Agricultural Management Certificate', 'Leadership Training'],
    active: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'labour-008',
    name: 'Pesticide Applicator',
    category: 'specialized',
    skillLevel: 'skilled',
    hourlyRate: 16.50,
    dailyRate: 132.00,
    overtimeMultiplier: 1.5,
    benefits: {
      healthInsurance: true,
      transportAllowance: 8.00,
      mealAllowance: 10.00,
      safetyEquipment: true
    },
    workingHours: {
      standard: 8,
      maximum: 10
    },
    seasonalAvailability: ['All Year'],
    certificationRequired: ['Pesticide Application License', 'Chemical Safety Training'],
    active: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }
]

// Utility functions for labour data
export const labourUtils = {
  getById: (id: string) => LABOUR_TYPES.find(l => l.id === id),
  getByCategory: (category: LabourType['category']) => LABOUR_TYPES.filter(l => l.category === category),
  getBySkillLevel: (skillLevel: LabourType['skillLevel']) => LABOUR_TYPES.filter(l => l.skillLevel === skillLevel),
  getActive: () => LABOUR_TYPES.filter(l => l.active),
  getAvailableInSeason: (season: string) => LABOUR_TYPES.filter(l => 
    l.seasonalAvailability.includes(season) || l.seasonalAvailability.includes('All Year')
  ),
  getByHourlyRateRange: (min: number, max: number) => LABOUR_TYPES.filter(l => 
    l.hourlyRate >= min && l.hourlyRate <= max
  ),
  calculateDailyCost: (labourId: string, hours: number = 8) => {
    const labour = labourUtils.getById(labourId)
    if (!labour) return 0
    
    const standardHours = Math.min(hours, labour.workingHours.standard)
    const overtimeHours = Math.max(0, hours - labour.workingHours.standard)
    
    const standardCost = standardHours * labour.hourlyRate
    const overtimeCost = overtimeHours * labour.hourlyRate * labour.overtimeMultiplier
    const benefitsCost = labour.benefits.transportAllowance + labour.benefits.mealAllowance
    
    return standardCost + overtimeCost + benefitsCost
  },
}
