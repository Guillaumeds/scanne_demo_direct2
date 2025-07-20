/**
 * Master Data: Labour Types
 * Exact data from CSV: labour_md.csv
 */

export interface Labour {
  id: string
  labour_id: string
  name: string
  category: string
  unit: string
  cost_per_unit: number
  description?: string
  active: boolean
  created_at?: string
  updated_at?: string
  // Legacy fields for backward compatibility
  cost_per_hour?: number
  hourly_rate?: number
  daily_rate?: number
  skills?: string[]
  skill_level?: string
  responsibilities?: string[]
}

// Labour data from labour_md.csv
export const LABOUR_TYPES: Labour[] = [
  {
    id: 'supervisor',
    labour_id: 'supervisor',
    name: 'Field Supervisor',
    category: 'labour',
    unit: 'hours',
    cost_per_unit: 60,
    cost_per_hour: 60,
    description: '',
    active: true,
    created_at: '',
    updated_at: ''
  },
  {
    id: 'field-worker_m',
    labour_id: 'field-worker_m',
    name: 'Field Worker Male',
    category: 'labour',
    unit: 'hours',
    cost_per_unit: 25,
    cost_per_hour: 25,
    description: '',
    active: true,
    created_at: '',
    updated_at: ''
  },
  {
    id: 'field-worker_fm',
    labour_id: 'field-worker_fm',
    name: 'Field Worker Female',
    category: 'labour',
    unit: 'hours',
    cost_per_unit: 35,
    cost_per_hour: 35,
    description: '',
    active: true,
    created_at: '',
    updated_at: ''
  },
  {
    id: 'machine_operator',
    labour_id: 'machine_operator',
    name: 'Machine Operator',
    category: 'labour',
    unit: 'hours',
    cost_per_unit: 45,
    cost_per_hour: 45,
    description: '',
    active: true,
    created_at: '',
    updated_at: ''
  },
  {
    id: 'parttime_worker_m',
    labour_id: 'parttime_worker_m',
    name: 'Field Worker Male (Part time)',
    category: 'labour',
    unit: 'hours',
    cost_per_unit: 30,
    cost_per_hour: 30,
    description: '',
    active: true,
    created_at: '',
    updated_at: ''
  },
  {
    id: 'parttime_worker_fm',
    labour_id: 'parttime_worker_fm',
    name: 'Field Worker Female (Part time)',
    category: 'labour',
    unit: 'hours',
    cost_per_unit: 40,
    cost_per_hour: 40,
    description: '',
    active: true,
    created_at: '',
    updated_at: ''
  }
]
