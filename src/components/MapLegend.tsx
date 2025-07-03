'use client'

import { useState } from 'react'

interface MapLegendProps {
  layerType: string
}

interface LegendItem {
  color: string
  label: string
  description?: string
}

const CROP_CYCLE_LEGEND: LegendItem[] = [
  { color: '#22c55e', label: 'Plantation', description: 'New plantation cycle' },
  { color: '#3b82f6', label: 'Ratoon 1', description: 'First ratoon cycle' },
  { color: '#8b5cf6', label: 'Ratoon 2', description: 'Second ratoon cycle' },
  { color: '#f59e0b', label: 'Ratoon 3', description: 'Third ratoon cycle' },
  { color: '#ef4444', label: 'Ratoon 4+', description: 'Fourth ratoon cycle or higher' },
  { color: '#6b7280', label: 'No Active Cycle', description: 'No current crop cycle' }
]

const VARIETY_LEGEND: LegendItem[] = [
  { color: '#22c55e', label: 'Early Season', description: 'Early harvest varieties' },
  { color: '#3b82f6', label: 'Mid Season', description: 'Mid harvest varieties' },
  { color: '#f59e0b', label: 'Late Season', description: 'Late harvest varieties' },
  { color: '#8b5cf6', label: 'Inter-crop', description: 'Inter-crop varieties' },
  { color: '#6b7280', label: 'No Variety', description: 'No variety assigned' }
]

const GROWTH_STAGES_LEGEND: LegendItem[] = [
  { color: '#22c55e', label: 'Germination', description: 'Seeds sprouting (0-2 months)' },
  { color: '#3b82f6', label: 'Tillering', description: 'Shoot development (2-4 months)' },
  { color: '#8b5cf6', label: 'Grand Growth', description: 'Rapid growth phase (4-8 months)' },
  { color: '#f59e0b', label: 'Maturation', description: 'Sugar accumulation (8-12 months)' },
  { color: '#ef4444', label: 'Ripening', description: 'Ready for harvest (12+ months)' },
  { color: '#6b7280', label: 'No Stage', description: 'Growth stage not determined' }
]

const HARVEST_PLANNING_LEGEND: LegendItem[] = [
  { color: '#1e3a8a', label: '< 1 Month', description: 'Harvest within 1 month' },
  { color: '#1e40af', label: '1-2 Months', description: 'Harvest in 1-2 months' },
  { color: '#2563eb', label: '2-3 Months', description: 'Harvest in 2-3 months' },
  { color: '#3b82f6', label: '3-4 Months', description: 'Harvest in 3-4 months' },
  { color: '#60a5fa', label: '4-5 Months', description: 'Harvest in 4-5 months' },
  { color: '#6b7280', label: 'Not Planned', description: 'No harvest planned or > 5 months' }
]

export default function MapLegend({ layerType }: MapLegendProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  // Only show legend for specific layers
  if (!['crop_cycles', 'variety', 'growth_stages', 'harvest_planning'].includes(layerType)) {
    return null
  }

  const getLegendData = () => {
    switch (layerType) {
      case 'crop_cycles':
        return { items: CROP_CYCLE_LEGEND, title: 'Crop Cycle Phases', icon: '🌾' }
      case 'variety':
        return { items: VARIETY_LEGEND, title: 'Variety Types', icon: '🌿' }
      case 'growth_stages':
        return { items: GROWTH_STAGES_LEGEND, title: 'Growth Stages', icon: '🌱' }
      case 'harvest_planning':
        return { items: HARVEST_PLANNING_LEGEND, title: 'Harvest Planning', icon: '🚜' }
      default:
        return { items: [], title: '', icon: '' }
    }
  }

  const { items: legendItems, title, icon } = getLegendData()

  return (
    <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg border border-gray-200 z-[1000] max-w-xs">
      {/* Header */}
      <div 
        className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50 rounded-t-lg"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <div className="flex items-center space-x-2">
          <span className="text-lg">{icon}</span>
          <span className="font-medium text-gray-900 text-sm">{title}</span>
        </div>
        <svg 
          width="16" 
          height="16" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2"
          className={`transform transition-transform duration-200 text-gray-500 ${isCollapsed ? 'rotate-180' : ''}`}
        >
          <polyline points="6,9 12,15 18,9"/>
        </svg>
      </div>

      {/* Legend Items */}
      {!isCollapsed && (
        <div className="px-3 pb-3 space-y-2">
          {legendItems.map((item, index) => (
            <div key={index} className="flex items-center space-x-3">
              {/* Color indicator */}
              <div 
                className="w-4 h-4 rounded border border-gray-300 flex-shrink-0"
                style={{ backgroundColor: item.color }}
              />
              
              {/* Label and description */}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900">{item.label}</div>
                {item.description && (
                  <div className="text-xs text-gray-500">{item.description}</div>
                )}
              </div>
            </div>
          ))}
          
          {/* Footer note */}
          <div className="pt-2 mt-2 border-t border-gray-100">
            <div className="text-xs text-gray-500">
              Polygon colors represent {
                layerType === 'crop_cycles' ? 'crop cycle phases' :
                layerType === 'variety' ? 'variety categories' :
                layerType === 'growth_stages' ? 'growth stages' :
                layerType === 'harvest_planning' ? 'harvest timeline' :
                'data categories'
              }
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
