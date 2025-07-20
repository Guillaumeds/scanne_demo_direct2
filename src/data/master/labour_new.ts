/**
 * Master Data: Labour Types
 * Exact data from CSV: labour_md.csv
 */

export interface LabourType {
  id: string
  labour_id: string
  name: string
  category: string
  unit: string
  cost_per_unit: number
  description: string | null
  active: boolean
  created_at: string | null
  updated_at: string | null
}

export const LABOUR_TYPES: LabourType[] = [
  // Exact data from CSV: labour_md.csv - ALL 6 LABOUR TYPES
  {
    id: 'supervisor',
    labour_id: 'supervisor',
    name: 'Field Supervisor',
    category: 'labour',
    unit: 'hours',
    cost_per_unit: 60,
    description: null,
    active: true,
    created_at: null,
    updated_at: null
  },
  {
    id: 'field-worker_m',
    labour_id: 'field-worker_m',
    name: 'Field Worker Male',
    category: 'labour',
    unit: 'hours',
    cost_per_unit: 25,
    description: null,
    active: true,
    created_at: null,
    updated_at: null
  },
  {
    id: 'field-worker_fm',
    labour_id: 'field-worker_fm',
    name: 'Field Worker Female',
    category: 'labour',
    unit: 'hours',
    cost_per_unit: 35,
    description: null,
    active: true,
    created_at: null,
    updated_at: null
  },
  {
    id: 'machine_operator',
    labour_id: 'machine_operator',
    name: 'Machine Operator',
    category: 'labour',
    unit: 'hours',
    cost_per_unit: 45,
    description: null,
    active: true,
    created_at: null,
    updated_at: null
  },
  {
    id: 'parttime_worker_m',
    labour_id: 'parttime_worker_m',
    name: 'Field Worker Male (Part time)',
    category: 'labour',
    unit: 'hours',
    cost_per_unit: 30,
    description: null,
    active: true,
    created_at: null,
    updated_at: null
  },
  {
    id: 'parttime_worker_fm',
    labour_id: 'parttime_worker_fm',
    name: 'Field Worker Female (Part time)',
    category: 'labour',
    unit: 'hours',
    cost_per_unit: 40,
    description: null,
    active: true,
    created_at: null,
    updated_at: null
  }
]

// Utility functions for labour data
export const labourUtils = {
  getById: (id: string) => LABOUR_TYPES.find(l => l.id === id),
  getByLabourId: (labour_id: string) => LABOUR_TYPES.find(l => l.labour_id === labour_id),
  getByCategory: (category: string) => LABOUR_TYPES.filter(l => l.category === category),
  getActive: () => LABOUR_TYPES.filter(l => l.active === true),
  getSupervisors: () => LABOUR_TYPES.filter(l => l.name.toLowerCase().includes('supervisor')),
  getFieldWorkers: () => LABOUR_TYPES.filter(l => l.name.toLowerCase().includes('field worker')),
  getMachineOperators: () => LABOUR_TYPES.filter(l => l.name.toLowerCase().includes('machine operator')),
  getPartTimeWorkers: () => LABOUR_TYPES.filter(l => l.name.toLowerCase().includes('part time')),
  searchByName: (query: string) => LABOUR_TYPES.filter(l => 
    l.name.toLowerCase().includes(query.toLowerCase())
  ),
}
