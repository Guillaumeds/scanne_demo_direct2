'use client'

import { useState, useEffect } from 'react'
import { ActivityTemplate, ActivityPhase, SUGARCANE_PHASES, ACTIVITY_TEMPLATES } from '@/types/activities'

interface ActivitySelectorProps {
  onSelect: (activity: ActivityTemplate) => void
  onClose: () => void
  selectedPhase?: ActivityPhase | 'all'
}

export default function ActivitySelector({ onSelect, onClose, selectedPhase = 'all' }: ActivitySelectorProps) {
  const [currentPhase, setCurrentPhase] = useState<ActivityPhase | 'all'>(selectedPhase)
  const [searchTerm, setSearchTerm] = useState('')

  // Filter activities based on selected phase and search term
  const filteredActivities = ACTIVITY_TEMPLATES.filter(activity => {
    const matchesPhase = currentPhase === 'all' || activity.phase === currentPhase
    const matchesSearch = activity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         activity.description.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesPhase && matchesSearch
  })

  const handleActivitySelect = (activity: ActivityTemplate) => {
    onSelect(activity)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Select Activity</h2>
            <p className="text-sm text-gray-600 mt-1">Choose an activity to add to this bloc</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Left Sidebar - Phase Filters */}
          <div className="w-80 border-r border-gray-200 bg-gray-50 overflow-y-auto">
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 mb-4">Phases</h3>
              
              {/* Search */}
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Search activities..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                />
              </div>

              {/* All Activities */}
              <button
                type="button"
                onClick={() => setCurrentPhase('all')}
                className={`w-full text-left px-4 py-3 rounded-lg transition-colors mb-2 ${
                  currentPhase === 'all'
                    ? 'bg-orange-100 text-orange-800 border border-orange-200'
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-lg">📋</span>
                  <div>
                    <div className="font-medium text-sm">All Activities</div>
                    <div className="text-xs text-gray-500">{ACTIVITY_TEMPLATES.length} activities</div>
                  </div>
                </div>
              </button>

              {/* Phase Categories */}
              {SUGARCANE_PHASES.map(phase => {
                const activityCount = ACTIVITY_TEMPLATES.filter(a => a.phase === phase.id).length
                return (
                  <button
                    key={phase.id}
                    type="button"
                    onClick={() => setCurrentPhase(phase.id)}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-colors mb-2 ${
                      currentPhase === phase.id
                        ? 'bg-orange-100 text-orange-800 border border-orange-200'
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-lg">{phase.icon}</span>
                      <div>
                        <div className="font-medium text-sm">{phase.name}</div>
                        <div className="text-xs text-gray-500">{activityCount} activities</div>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Activities Grid */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredActivities.map(activity => {
                const phase = SUGARCANE_PHASES.find(p => p.id === activity.phase)
                return (
                  <div
                    key={activity.id}
                    onClick={() => handleActivitySelect(activity)}
                    className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-lg hover:border-orange-300 transition-all duration-200 cursor-pointer group"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <span className="text-2xl">{phase?.icon}</span>
                      <span className={`px-2 py-1 text-xs rounded-full ${phase?.color}`}>
                        {phase?.name.split(' ')[0]}
                      </span>
                    </div>

                    <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors">
                      {activity.name}
                    </h3>

                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {activity.description}
                    </p>

                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>⏱️ {activity.estimatedDuration}h</span>
                      <span>💰 Rs {activity.estimatedCost}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
