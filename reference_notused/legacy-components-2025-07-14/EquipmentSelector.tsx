'use client'

import { useState } from 'react'

interface Equipment {
  id: string
  name: string
  category: string
  icon: string
  defaultRate: number
  unit: string
  description?: string
}

interface EquipmentCategory {
  id: string
  name: string
  icon: string
  color: string
}

const EQUIPMENT_CATEGORIES: EquipmentCategory[] = [
  { id: 'tractors', name: 'Tractors', icon: '🚜', color: 'bg-green-100 text-green-800' },
  { id: 'harvesters', name: 'Harvesters', icon: '🌾', color: 'bg-yellow-100 text-yellow-800' },
  { id: 'sprayers', name: 'Sprayers', icon: '💧', color: 'bg-blue-100 text-blue-800' },
  { id: 'tillers', name: 'Tillers', icon: '⚙️', color: 'bg-gray-100 text-gray-800' },
  { id: 'trucks', name: 'Trucks', icon: '🚛', color: 'bg-orange-100 text-orange-800' }
]

const MOCK_EQUIPMENT: Equipment[] = [
  { id: 'eq1', name: 'John Deere 5075E', category: 'tractors', icon: '🚜', defaultRate: 800, unit: 'Rs/hour', description: '75HP utility tractor' },
  { id: 'eq2', name: 'Massey Ferguson 4710', category: 'tractors', icon: '🚜', defaultRate: 900, unit: 'Rs/hour', description: '110HP agricultural tractor' },
  { id: 'eq3', name: 'Case IH Axial-Flow 250', category: 'harvesters', icon: '🌾', defaultRate: 1500, unit: 'Rs/hour', description: 'Combine harvester' },
  { id: 'eq4', name: 'New Holland FX58', category: 'harvesters', icon: '🌾', defaultRate: 1200, unit: 'Rs/hour', description: 'Forage harvester' },
  { id: 'eq5', name: 'Apache AS1240', category: 'sprayers', icon: '💧', defaultRate: 600, unit: 'Rs/hour', description: 'Self-propelled sprayer' },
  { id: 'eq6', name: 'Kubota L3901', category: 'tillers', icon: '⚙️', defaultRate: 500, unit: 'Rs/hour', description: 'Compact utility tractor' },
  { id: 'eq7', name: 'Ford F-350', category: 'trucks', icon: '🚛', defaultRate: 400, unit: 'Rs/hour', description: 'Heavy duty pickup truck' }
]

interface EquipmentSelectorProps {
  onSelect: (equipment: Equipment) => void
  onClose: () => void
}

export default function EquipmentSelector({ onSelect, onClose }: EquipmentSelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  const filteredEquipment = MOCK_EQUIPMENT.filter(equipment => {
    const matchesCategory = !selectedCategory || equipment.category === selectedCategory
    const matchesSearch = !searchTerm ||
      equipment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      equipment.description?.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const handleEquipmentSelect = (equipment: Equipment) => {
    onSelect(equipment)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Select Equipment</h2>
              <p className="text-sm text-gray-600 mt-1">Choose equipment for this operation</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
              title="Close"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="w-64 bg-gray-50 border-r border-gray-200 p-4 overflow-y-auto">
            {/* Search */}
            <div className="mb-4">
              <input
                type="text"
                placeholder="Search equipment..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
              />
            </div>

            {/* Categories */}
            <div className="space-y-1">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                  !selectedCategory
                    ? 'bg-green-100 text-green-700 font-medium'
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-lg">🔧</span>
                  <div>
                    <div className="font-medium text-sm">All Equipment</div>
                    <div className="text-xs text-gray-500">{MOCK_EQUIPMENT.length} items</div>
                  </div>
                </div>
              </button>

              {EQUIPMENT_CATEGORIES.map(category => {
                const equipmentCount = MOCK_EQUIPMENT.filter(eq => eq.category === category.id).length
                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                      selectedCategory === category.id
                        ? 'bg-green-100 text-green-700 font-medium'
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-lg">{category.icon}</span>
                      <div>
                        <div className="font-medium text-sm">{category.name}</div>
                        <div className="text-xs text-gray-500">{equipmentCount} items</div>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Equipment Grid */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredEquipment.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <div className="text-gray-400 text-6xl mb-4">🚜</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Equipment Found</h3>
                  <p className="text-gray-600">
                    {searchTerm || selectedCategory
                      ? 'Try adjusting your search or category filter.'
                      : 'No equipment is available.'
                    }
                  </p>
                </div>
              ) : (
                filteredEquipment.map(equipment => {
                  const category = EQUIPMENT_CATEGORIES.find(c => c.id === equipment.category)
                  return (
                    <div
                      key={equipment.id}
                      onClick={() => handleEquipmentSelect(equipment)}
                      className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-lg hover:border-green-300 transition-all duration-200 cursor-pointer group"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <span className="text-2xl">{equipment.icon}</span>
                        <span className={`px-2 py-1 text-xs rounded-full ${category?.color}`}>
                          {category?.name.split(' ')[0]}
                        </span>
                      </div>
                      
                      <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-green-700 transition-colors">
                        {equipment.name}
                      </h3>
                      
                      <div className="space-y-1 text-sm text-gray-600">
                        <div className="flex justify-between">
                          <span>Default Rate:</span>
                          <span className="font-medium">{equipment.defaultRate} {equipment.unit}</span>
                        </div>
                        {equipment.description && (
                          <div className="text-xs text-gray-500 mt-2">
                            {equipment.description}
                          </div>
                        )}
                      </div>
                      
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">Click to select</span>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400 group-hover:text-green-500 transition-colors">
                            <polyline points="9,18 15,12 9,6"></polyline>
                          </svg>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
