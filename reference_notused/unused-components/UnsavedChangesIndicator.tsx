'use client'

import { formatDistanceToNow } from 'date-fns'

interface UnsavedChangesIndicatorProps {
  isDirty: boolean
  isSaving: boolean
  lastSaved: Date | null
  className?: string
  showLastSaved?: boolean
}

function UnsavedChangesIndicator({
  isDirty,
  isSaving,
  lastSaved,
  className = '',
  showLastSaved = true
}: UnsavedChangesIndicatorProps) {
  if (isSaving) {
    return (
      <div className={`flex items-center gap-2 text-sm text-blue-600 ${className}`}>
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
        <span>Saving...</span>
      </div>
    )
  }

  if (isDirty) {
    return (
      <div className={`flex items-center gap-2 text-sm text-amber-600 ${className}`}>
        <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
        <span>Unsaved changes</span>
      </div>
    )
  }

  if (showLastSaved && lastSaved) {
    return (
      <div className={`flex items-center gap-2 text-sm text-green-600 ${className}`}>
        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
        <span>Saved {formatDistanceToNow(lastSaved)} ago</span>
      </div>
    )
  }

  return null
}

/**
 * Tab indicator that shows unsaved changes status
 */
interface TabUnsavedIndicatorProps {
  isDirty: boolean
  className?: string
}

export function TabUnsavedIndicator({ isDirty, className = '' }: TabUnsavedIndicatorProps) {
  if (!isDirty) return null

  return (
    <span className={`w-2 h-2 bg-amber-500 rounded-full ${className}`} title="Unsaved changes">
    </span>
  )
}

/**
 * Form save status bar component
 */
interface FormSaveStatusProps {
  isDirty: boolean
  isSaving: boolean
  lastSaved: Date | null
  onSave?: () => void
  onReset?: () => void
  saveButtonText?: string
  showResetButton?: boolean
  className?: string
}

export function FormSaveStatus({
  isDirty,
  isSaving,
  lastSaved,
  onSave,
  onReset,
  saveButtonText = 'Save',
  showResetButton = false,
  className = ''
}: FormSaveStatusProps) {
  return (
    <div className={`flex items-center justify-between p-3 bg-gray-50 border-t border-gray-200 ${className}`}>
      <UnsavedChangesIndicator
        isDirty={isDirty}
        isSaving={isSaving}
        lastSaved={lastSaved}
      />
      
      <div className="flex items-center gap-2">
        {showResetButton && onReset && (
          <button
            type="button"
            onClick={onReset}
            disabled={!isDirty || isSaving}
            className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 disabled:opacity-50"
          >
            Reset
          </button>
        )}
        
        {onSave && (
          <button
            type="button"
            onClick={onSave}
            disabled={!isDirty || isSaving}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white text-sm rounded-lg font-medium transition-colors duration-200"
          >
            {isSaving ? 'Saving...' : saveButtonText}
          </button>
        )}
      </div>
    </div>
  )
}
