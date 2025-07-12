'use client'

import { useState } from 'react'

interface ContentSwitcherOption {
  id: string
  label: string
  icon?: string
}

interface ContentSwitcherProps {
  options: ContentSwitcherOption[]
  selectedId: string
  onChange: (selectedId: string) => void
  className?: string
}

export default function ContentSwitcher({
  options,
  selectedId,
  onChange,
  className = ''
}: ContentSwitcherProps) {
  return (
    <div className={`inline-flex rounded-lg border border-gray-200 bg-gray-50 p-1 ${className}`}>
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          onClick={() => onChange(option.id)}
          className={`
            relative px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ease-in-out
            ${selectedId === option.id
              ? 'bg-white text-green-700 shadow-sm border border-green-200'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }
          `}
        >
          <div className="flex items-center space-x-2">
            {option.icon && <span className="text-base">{option.icon}</span>}
            <span>{option.label}</span>
          </div>
        </button>
      ))}
    </div>
  )
}
