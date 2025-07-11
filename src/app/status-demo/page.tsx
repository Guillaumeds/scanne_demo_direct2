'use client'

import React, { useState } from 'react'
import { CheckCircleIcon, ClockIcon, PlayIcon } from '@heroicons/react/24/outline'

type StatusType = 'not-started' | 'in-progress' | 'complete'

interface StatusDemoProps {
  title: string
  description: string
  children: React.ReactNode
}

const StatusDemo: React.FC<StatusDemoProps> = ({ title, description, children }) => (
  <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
    <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
    <p className="text-sm text-gray-600 mb-4">{description}</p>
    <div className="space-y-3">
      {children}
    </div>
  </div>
)

export default function StatusDemoPage() {
  const [segmentedStatus, setSegmentedStatus] = useState<StatusType>('not-started')
  const [badgeStatus, setBadgeStatus] = useState<StatusType>('in-progress')
  const [progressStatus, setProgressStatus] = useState<StatusType>('complete')
  const [compactStatus, setCompactStatus] = useState<StatusType>('not-started')

  // 1. Segmented Control Component
  const SegmentedControl: React.FC<{ status: StatusType; onChange: (status: StatusType) => void }> = ({ status, onChange }) => {
    const options: { value: StatusType; label: string; icon: string }[] = [
      { value: 'not-started', label: 'Not Started', icon: '○' },
      { value: 'in-progress', label: 'In Progress', icon: '◐' },
      { value: 'complete', label: 'Complete', icon: '●' }
    ]

    return (
      <div className="inline-flex rounded-lg border border-gray-200 bg-gray-50 p-1">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`
              relative px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 ease-in-out
              ${status === option.value
                ? option.value === 'not-started'
                  ? 'bg-white text-gray-700 shadow-sm border border-gray-200'
                  : option.value === 'in-progress'
                  ? 'bg-blue-500 text-white shadow-sm'
                  : 'bg-green-500 text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }
            `}
          >
            <span className="flex items-center space-x-1">
              <span>{option.icon}</span>
              <span>{option.label}</span>
            </span>
          </button>
        ))}
      </div>
    )
  }

  // 2. Status Badges Component
  const StatusBadges: React.FC<{ status: StatusType; onChange: (status: StatusType) => void }> = ({ status, onChange }) => {
    const getStatusConfig = (statusType: StatusType) => {
      switch (statusType) {
        case 'not-started':
          return { label: 'Not Started', className: 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200', icon: '○' }
        case 'in-progress':
          return { label: 'In Progress', className: 'bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200', icon: '◐' }
        case 'complete':
          return { label: 'Complete', className: 'bg-green-100 text-green-700 border-green-200 hover:bg-green-200', icon: '●' }
      }
    }

    const options: StatusType[] = ['not-started', 'in-progress', 'complete']
    
    return (
      <div className="flex space-x-2">
        {options.map((option) => {
          const config = getStatusConfig(option)
          const isSelected = status === option
          return (
            <button
              key={option}
              type="button"
              onClick={() => onChange(option)}
              className={`
                inline-flex items-center px-3 py-1 text-xs font-medium rounded-full border transition-all duration-200
                ${isSelected 
                  ? config.className + ' ring-2 ring-offset-1 ' + (option === 'not-started' ? 'ring-gray-300' : option === 'in-progress' ? 'ring-blue-300' : 'ring-green-300')
                  : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'
                }
              `}
            >
              <span className="mr-1">{config.icon}</span>
              {config.label}
            </button>
          )
        })}
      </div>
    )
  }

  // 3. Progress Indicators Component
  const ProgressIndicators: React.FC<{ status: StatusType; onChange: (status: StatusType) => void }> = ({ status, onChange }) => {
    const steps = [
      { key: 'not-started', label: 'Not Started', icon: ClockIcon },
      { key: 'in-progress', label: 'In Progress', icon: PlayIcon },
      { key: 'complete', label: 'Complete', icon: CheckCircleIcon }
    ]

    const currentIndex = steps.findIndex(step => step.key === status)

    return (
      <div className="flex items-center space-x-2">
        {steps.map((step, index) => {
          const Icon = step.icon
          const isActive = index <= currentIndex
          const isCurrent = index === currentIndex
          
          return (
            <React.Fragment key={step.key}>
              <button
                type="button"
                onClick={() => onChange(step.key as StatusType)}
                className={`
                  flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-200
                  ${isActive
                    ? index === 0 ? 'bg-gray-500 border-gray-500 text-white'
                      : index === 1 ? 'bg-blue-500 border-blue-500 text-white'
                      : 'bg-green-500 border-green-500 text-white'
                    : 'bg-white border-gray-300 text-gray-400 hover:border-gray-400'
                  }
                  ${isCurrent ? 'ring-2 ring-offset-1 ' + (index === 0 ? 'ring-gray-300' : index === 1 ? 'ring-blue-300' : 'ring-green-300') : ''}
                `}
                title={step.label}
              >
                <Icon className="w-4 h-4" />
              </button>
              {index < steps.length - 1 && (
                <div className={`flex-1 h-0.5 ${index < currentIndex ? 'bg-green-500' : 'bg-gray-300'}`} />
              )}
            </React.Fragment>
          )
        })}
      </div>
    )
  }

  // 4. Compact Toggle Component
  const CompactToggle: React.FC<{ status: StatusType; onChange: (status: StatusType) => void }> = ({ status, onChange }) => {
    const getStatusConfig = (statusType: StatusType) => {
      switch (statusType) {
        case 'not-started':
          return { icon: '○', color: 'text-gray-500', bg: 'bg-gray-100', hover: 'hover:bg-gray-200' }
        case 'in-progress':
          return { icon: '◐', color: 'text-blue-600', bg: 'bg-blue-100', hover: 'hover:bg-blue-200' }
        case 'complete':
          return { icon: '●', color: 'text-green-600', bg: 'bg-green-100', hover: 'hover:bg-green-200' }
      }
    }

    const config = getStatusConfig(status)
    const options: StatusType[] = ['not-started', 'in-progress', 'complete']
    const currentIndex = options.indexOf(status)
    
    const nextStatus = () => {
      const nextIndex = (currentIndex + 1) % options.length
      onChange(options[nextIndex])
    }

    return (
      <button
        type="button"
        onClick={nextStatus}
        className={`
          inline-flex items-center justify-center w-8 h-8 rounded-full transition-all duration-200
          ${config.bg} ${config.color} ${config.hover}
          hover:scale-110 active:scale-95
        `}
        title={`Current: ${status.replace('-', ' ')} - Click to change`}
      >
        <span className="text-lg font-bold">{config.icon}</span>
      </button>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Status Component Demo</h1>
          <p className="text-gray-600">Compare different status component styles for your work packages</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <StatusDemo
            title="1. Segmented Control"
            description="Best for equal-weight options. Clean, modern toggle with clear states."
          >
            <SegmentedControl status={segmentedStatus} onChange={setSegmentedStatus} />
            <p className="text-xs text-gray-500">Current: {segmentedStatus.replace('-', ' ')}</p>
          </StatusDemo>

          <StatusDemo
            title="2. Status Badges"
            description="Most common for task/project status. Individual clickable badges."
          >
            <StatusBadges status={badgeStatus} onChange={setBadgeStatus} />
            <p className="text-xs text-gray-500">Current: {badgeStatus.replace('-', ' ')}</p>
          </StatusDemo>

          <StatusDemo
            title="3. Progress Indicators"
            description="Good for sequential workflows. Shows progression through stages."
          >
            <ProgressIndicators status={progressStatus} onChange={setProgressStatus} />
            <p className="text-xs text-gray-500">Current: {progressStatus.replace('-', ' ')}</p>
          </StatusDemo>

          <StatusDemo
            title="4. Compact Toggle"
            description="Ultra-compact single button. Perfect for tight spaces like table cells."
          >
            <div className="flex items-center space-x-4">
              <CompactToggle status={compactStatus} onChange={setCompactStatus} />
              <span className="text-sm text-gray-600">Click to cycle through states</span>
            </div>
            <p className="text-xs text-gray-500">Current: {compactStatus.replace('-', ' ')}</p>
          </StatusDemo>
        </div>

        <div className="mt-8 bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommendations for Table Use:</h3>
          <div className="space-y-2 text-sm text-gray-600">
            <p><strong>Compact Toggle:</strong> Best for table cells - minimal space, intuitive click-to-cycle</p>
            <p><strong>Segmented Control:</strong> Good for forms or detailed views - clear but takes more space</p>
            <p><strong>Status Badges:</strong> Good for read-only displays or when you want all options visible</p>
            <p><strong>Progress Indicators:</strong> Best when status represents a sequential workflow</p>
          </div>
        </div>
      </div>
    </div>
  )
}
