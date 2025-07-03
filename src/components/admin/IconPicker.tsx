'use client'

import { useState } from 'react'
import { X, Search } from 'lucide-react'
import * as LucideIcons from 'lucide-react'

interface IconPickerProps {
  onSelect: (iconName: string) => void
  onClose: () => void
  currentIcon?: string
}

// Popular icons for farm management
const POPULAR_ICONS = [
  'Sprout', 'Droplets', 'Bug', 'CloudRain', 'Scissors', 'Wrench',
  'Heart', 'AlertTriangle', 'Mountain', 'CloudLightning', 'Cog', 'Eye',
  'Camera', 'FileText', 'BarChart3', 'Award', 'Map', 'Paperclip',
  'Tractor', 'Wheat', 'Apple', 'TreePine', 'Sun', 'Thermometer',
  'Calendar', 'Clock', 'MapPin', 'Target', 'TrendingUp', 'Activity',
  'Shield', 'Users', 'Settings', 'Database', 'Layers', 'Grid3x3'
]

// Get all available Lucide icons
const getAllIcons = () => {
  return Object.keys(LucideIcons).filter(key => 
    key !== 'default' && 
    key !== 'createLucideIcon' &&
    typeof (LucideIcons as any)[key] === 'function'
  )
}

export default function IconPicker({ onSelect, onClose, currentIcon }: IconPickerProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<'popular' | 'all'>('popular')
  
  const allIcons = getAllIcons()
  const filteredIcons = selectedCategory === 'popular' 
    ? POPULAR_ICONS.filter(icon => 
        icon.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : allIcons.filter(icon => 
        icon.toLowerCase().includes(searchTerm.toLowerCase())
      )

  const renderIcon = (iconName: string) => {
    const IconComponent = (LucideIcons as any)[iconName]
    if (!IconComponent) return null
    return <IconComponent className="w-6 h-6" />
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Select Icon</h3>
            <p className="text-sm text-gray-600">Choose an icon for this category</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search and Filter */}
        <div className="p-6 border-b border-gray-200 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search icons..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex space-x-2">
            <button
              onClick={() => setSelectedCategory('popular')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedCategory === 'popular'
                  ? 'bg-blue-100 text-blue-700 border border-blue-200'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Popular ({POPULAR_ICONS.length})
            </button>
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-blue-100 text-blue-700 border border-blue-200'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Icons ({allIcons.length})
            </button>
          </div>
        </div>

        {/* Icon Grid */}
        <div className="flex-1 overflow-auto p-6">
          <div className="grid grid-cols-8 gap-3">
            {filteredIcons.map((iconName) => (
              <button
                key={iconName}
                onClick={() => onSelect(iconName)}
                className={`p-4 rounded-lg border-2 transition-all duration-200 hover:shadow-md group ${
                  currentIcon === iconName
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
                title={iconName}
              >
                <div className="flex flex-col items-center space-y-2">
                  <div className={`transition-colors ${
                    currentIcon === iconName
                      ? 'text-blue-600'
                      : 'text-gray-600 group-hover:text-gray-800'
                  }`}>
                    {renderIcon(iconName)}
                  </div>
                  <span className={`text-xs font-medium truncate w-full text-center ${
                    currentIcon === iconName
                      ? 'text-blue-600'
                      : 'text-gray-500 group-hover:text-gray-700'
                  }`}>
                    {iconName}
                  </span>
                </div>
              </button>
            ))}
          </div>

          {filteredIcons.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-2">
                <Search className="w-12 h-12 mx-auto" />
              </div>
              <p className="text-gray-600">No icons found matching "{searchTerm}"</p>
              <p className="text-sm text-gray-500 mt-1">Try a different search term</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex justify-between items-center">
          <div className="text-sm text-gray-500">
            {filteredIcons.length} icon{filteredIcons.length !== 1 ? 's' : ''} available
          </div>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
