'use client'

import { useCropCycle } from '@/contexts/CropCycleContext'
import { useSelectedCropCycle } from '@/contexts/SelectedCropCycleContext'

export default function CropCycleSelector() {
  const { allCycles, activeCycle } = useCropCycle()
  const { selectedCycleId, setSelectedCycleId, getSelectedCycleInfo } = useSelectedCropCycle()

  if (allCycles.length === 0) {
    return (
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Crop Cycle</h3>
        <div className="text-center py-4 text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
          <div className="text-lg mb-2">🌱</div>
          <p className="text-sm font-medium">No Crop Cycles</p>
          <p className="text-xs">Create a crop cycle in General Info to get started</p>
        </div>
      </div>
    )
  }

  const selectedCycleInfo = getSelectedCycleInfo()

  return (
    <div className="p-6 border-b border-gray-200">
      <h3 className="text-sm font-semibold text-gray-900 mb-3">Crop Cycle</h3>
      <div className="space-y-3">
        <select
          value={selectedCycleId || ''}
          onChange={(e) => setSelectedCycleId(e.target.value || null)}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
          title="Select crop cycle"
        >
          <option value="">Select a cycle...</option>
          {allCycles.map((cycle) => (
            <option key={cycle.id} value={cycle.id}>
              {cycle.type === 'plantation' 
                ? 'Plantation Cycle' 
                : `Ratoon Cycle ${cycle.cycleNumber - 1}`}
              {cycle.status === 'active' && ' (Active)'}
              {cycle.status === 'closed' && ' (Closed)'}
            </option>
          ))}
        </select>

        {/* Selected Cycle Info - Status/Variety info removed, only show read-only warning */}
        {selectedCycleInfo && selectedCycleInfo.status === 'closed' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="flex items-center space-x-1 text-yellow-800">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"/>
              </svg>
              <span className="text-xs">Read-only: Cycle is closed</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
