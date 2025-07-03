'use client'

import { useState, useCallback, useRef, useImperativeHandle, forwardRef } from 'react'

export interface FormCommitOptions {
  commitOnTabChange?: boolean
  commitOnDelete?: boolean
  resetOnSave?: boolean
  validateBeforeSave?: (data: any) => boolean
}

export interface FormCommitRef {
  commitOnTabChange: () => Promise<void>
  isDirty: boolean
  save: () => Promise<void>
}

/**
 * Hook for managing form data with manual save + strategic auto-commit
 * Perfect for Scanne's simple forms with minimal API calls
 */
export function useFormWithAutoCommit<T>(
  initialData: T,
  onSave: (data: T) => Promise<void>,
  options: FormCommitOptions = {}
) {
  const [formData, setFormData] = useState<T>(initialData)
  const [isDirty, setIsDirty] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  // Manual save function
  const save = useCallback(async () => {
    if (!isDirty) return

    // Validate before save if validator provided
    if (options.validateBeforeSave && !options.validateBeforeSave(formData)) {
      throw new Error('Validation failed')
    }

    setIsSaving(true)
    try {
      await onSave(formData)
      setIsDirty(false)
      setLastSaved(new Date())
      
      if (options.resetOnSave) {
        setFormData(initialData)
      }
    } catch (error) {
      console.error('Save failed:', error)
      throw error
    } finally {
      setIsSaving(false)
    }
  }, [formData, isDirty, onSave, initialData, options])

  // Auto-commit on tab change
  const commitOnTabChange = useCallback(async () => {
    if (options.commitOnTabChange && isDirty) {
      console.log('Auto-committing on tab change...')
      await save()
    }
  }, [save, isDirty, options.commitOnTabChange])

  // Update form data
  const updateData = useCallback((updates: Partial<T> | ((prev: T) => T)) => {
    if (typeof updates === 'function') {
      setFormData(prev => {
        const newData = updates(prev)
        setIsDirty(true)
        return newData
      })
    } else {
      setFormData(prev => {
        const newData = { ...prev, ...updates }
        setIsDirty(true)
        return newData
      })
    }
  }, [])

  // Reset form to initial state
  const reset = useCallback(() => {
    setFormData(initialData)
    setIsDirty(false)
    setLastSaved(null)
  }, [initialData])

  // Check if form has unsaved changes
  const hasUnsavedChanges = useCallback(() => {
    return isDirty
  }, [isDirty])

  return {
    formData,
    updateData,
    save,
    commitOnTabChange,
    reset,
    hasUnsavedChanges,
    isDirty,
    isSaving,
    lastSaved
  }
}

/**
 * Component wrapper that exposes form commit methods to parent
 * Note: This is a utility function - actual implementation should be done
 * directly in components using forwardRef and useImperativeHandle
 */
export const withFormCommit = <P extends object>(
  Component: React.ComponentType<P>
) => {
  // This is a placeholder - implement directly in components instead
  return Component
}
