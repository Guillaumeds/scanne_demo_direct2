'use client'

import { useState } from 'react'

interface DrawingToolbarProps {
  onToolSelect: (tool: string | null) => void
  activeTool: string | null
  isDrawing: boolean
}

export default function DrawingToolbar({ 
  onToolSelect, 
  activeTool, 
  isDrawing 
}: DrawingToolbarProps) {
  const tools = [
    {
      id: 'polygon',
      name: 'Draw Area',
      icon: '⬟',
      description: 'Draw cultivation area'
    },
    {
      id: 'farm_boundary',
      name: 'Farm Boundary',
      icon: '🏞️',
      description: 'Draw farm boundary'
    },
    {
      id: 'select',
      name: 'Select',
      icon: '👆',
      description: 'Select multiple fields'
    }
  ]

  return (
    <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg z-[1000] p-2">
      <div className="flex flex-col space-y-2">
        {/* Header */}
        <div className="text-sm font-semibold text-gray-700 px-2 py-1 border-b border-gray-200">
          Drawing Tools
        </div>

        {/* Tool buttons */}
        {tools.map(tool => (
          <button
            key={tool.id}
            type="button"
            onClick={() => onToolSelect(activeTool === tool.id ? null : tool.id)}
            className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm transition-colors ${
              activeTool === tool.id
                ? 'bg-blue-100 text-blue-800 border border-blue-300'
                : 'hover:bg-gray-100 text-gray-700'
            } ${isDrawing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            disabled={isDrawing}
            title={tool.description}
          >
            <span className="text-lg">{tool.icon}</span>
            <span className="font-medium">{tool.name}</span>
          </button>
        ))}

        {/* Cancel drawing button */}
        {isDrawing && (
          <button
            type="button"
            onClick={() => onToolSelect(null)}
            className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm bg-red-100 text-red-800 border border-red-300 hover:bg-red-200 transition-colors"
          >
            <span className="text-lg">✕</span>
            <span className="font-medium">Cancel</span>
          </button>
        )}

        {/* Instructions */}
        {activeTool && (
          <div className="text-xs text-gray-600 px-2 py-2 bg-blue-50 rounded border border-blue-200">
            {activeTool === 'polygon' && (
              <div>
                <div className="font-medium text-blue-800 mb-1">Drawing Polygon:</div>
                <div>• Click to add points</div>
                <div>• Snaps to field edges</div>
                <div>• Right-click or double-click to finish</div>
                <div>• ESC to cancel</div>
              </div>
            )}

            {activeTool === 'farm_boundary' && (
              <div>
                <div className="font-medium text-blue-800 mb-1">Drawing Farm Boundary:</div>
                <div>• Click to add boundary points</div>
                <div>• Fields inside will be auto-selected</div>
                <div>• Right-click or double-click to finish</div>
                <div>• ESC to cancel</div>
              </div>
            )}

            {activeTool === 'select' && 'Click fields to select multiple areas.'}
          </div>
        )}
      </div>
    </div>
  )
}
