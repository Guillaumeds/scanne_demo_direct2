'use client'

import { useState } from 'react'

interface LayerSelectorProps {
  onLayerChange: (layerType: string) => void
  currentLayer: string
}

export default function LayerSelector({ onLayerChange, currentLayer }: LayerSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)

  const layers = [
    { id: 'osm', name: 'OpenStreetMap', icon: '🗺️' },
    { id: 'satellite', name: 'Satellite', icon: '🛰️' },
    { id: 'soil', name: 'MSIRI Soil Map', icon: '🌱' }
  ]

  const currentLayerInfo = layers.find(layer => layer.id === currentLayer) || layers[0]

  return (
    <div className="absolute top-4 right-4 z-[1000]">
      <div className="relative">
        {/* Layer selector button */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center space-x-2 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 shadow-md transition-colors duration-200"
          title="Change map layer"
        >
          <span className="text-lg">{currentLayerInfo.icon}</span>
          <span className="text-sm font-medium text-gray-700">{currentLayerInfo.name}</span>
          <svg 
            width="16" 
            height="16" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2"
            className={`transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          >
            <polyline points="6,9 12,15 18,9"/>
          </svg>
        </button>

        {/* Dropdown menu */}
        {isOpen && (
          <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
            {layers.map((layer) => (
              <button
                key={layer.id}
                type="button"
                onClick={() => {
                  onLayerChange(layer.id)
                  setIsOpen(false)
                }}
                className={`w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors duration-200 ${
                  currentLayer === layer.id ? 'bg-green-50 text-green-700' : 'text-gray-700'
                }`}
              >
                <span className="text-lg">{layer.icon}</span>
                <div className="flex-1">
                  <div className="font-medium">{layer.name}</div>
                  <div className="text-xs text-gray-500">
                    {layer.id === 'osm' && 'Standard map view'}
                    {layer.id === 'satellite' && 'Satellite imagery'}
                    {layer.id === 'soil' && 'Soil classification map'}
                  </div>
                </div>
                {currentLayer === layer.id && (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20,6 9,17 4,12"/>
                  </svg>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Click outside to close */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-[-1]" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}
