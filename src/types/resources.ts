export interface Resource {
  id: string
  name: string
  category: ResourceCategory
  description?: string
  unit: string
  defaultRate?: number
  costPerUnit?: number
  hourlyRate?: number
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

// ❌ REMOVED: Hardcoded RESOURCES array
// Now using database-driven data via ConfigurationService.getResources()
