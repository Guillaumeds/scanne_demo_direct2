/**
 * UUID Helper Utilities
 * Common operations for UUID-based transactional data
 */

import { BlocActivity } from '@/types/activities'
import { BlocObservation } from '@/types/observations'
import { BlocAttachment } from '@/types/attachments'
import { CropCycle } from '@/types/cropCycles'

// Type for any entity with UUID
export type UUIDEntity = {
  uuid?: string
  isNew?: boolean
  isDirty?: boolean
}

/**
 * Check if an entity is saved to the database
 */
export function isSaved(entity: UUIDEntity): boolean {
  return !!entity.uuid && !entity.isNew
}

/**
 * Check if an entity is new (not yet saved)
 */
export function isNew(entity: UUIDEntity): boolean {
  return entity.isNew || !entity.uuid
}

/**
 * Check if an entity has unsaved changes
 */
export function isDirty(entity: UUIDEntity): boolean {
  return entity.isDirty || false
}

/**
 * Check if an entity can be deleted (must be saved first)
 */
export function canDelete(entity: UUIDEntity): boolean {
  return isSaved(entity)
}

/**
 * Check if an entity can be edited
 */
export function canEdit(entity: UUIDEntity): boolean {
  return true // All entities can be edited
}

/**
 * Get a stable key for React rendering
 * Uses UUID if available, otherwise generates a temporary key
 */
export function getEntityKey(entity: UUIDEntity, fallbackName?: string): string {
  if (entity.uuid) {
    return entity.uuid
  }
  
  // Generate temporary key for new entities
  const timestamp = Date.now()
  const random = Math.random().toString(36).substr(2, 9)
  const name = fallbackName ? `-${fallbackName.replace(/[^a-zA-Z0-9]/g, '-')}` : ''
  
  return `temp${name}-${timestamp}-${random}`
}

/**
 * Get display status for an entity
 */
export function getEntityStatus(entity: UUIDEntity): {
  status: 'new' | 'saved' | 'dirty'
  label: string
  color: string
} {
  if (isNew(entity)) {
    return {
      status: 'new',
      label: 'Not Saved',
      color: 'text-orange-600 bg-orange-50 border-orange-200'
    }
  }
  
  if (isDirty(entity)) {
    return {
      status: 'dirty',
      label: 'Unsaved Changes',
      color: 'text-yellow-600 bg-yellow-50 border-yellow-200'
    }
  }
  
  return {
    status: 'saved',
    label: 'Saved',
    color: 'text-green-600 bg-green-50 border-green-200'
  }
}

/**
 * Activity-specific helpers
 */
export const ActivityHelpers = {
  /**
   * Get activity key for React rendering
   */
  getKey: (activity: BlocActivity): string => {
    return getEntityKey(activity, activity.name)
  },

  /**
   * Check if activity can be moved/reordered
   */
  canReorder: (activity: BlocActivity): boolean => {
    return true // All activities can be reordered
  },

  /**
   * Check if activity can have status changed
   */
  canChangeStatus: (activity: BlocActivity): boolean => {
    return isSaved(activity) // Only saved activities can have status changed
  }
}

/**
 * Observation-specific helpers
 */
export const ObservationHelpers = {
  /**
   * Get observation key for React rendering
   */
  getKey: (observation: BlocObservation): string => {
    return getEntityKey(observation, observation.name)
  },

  /**
   * Check if observation affects yield calculations
   */
  affectsYield: (observation: BlocObservation): boolean => {
    return (observation.category === 'sugarcane-yield-quality' || observation.category === 'intercrop-yield-quality') && isSaved(observation)
  }
}

/**
 * Attachment-specific helpers
 */
export const AttachmentHelpers = {
  /**
   * Get attachment key for React rendering
   */
  getKey: (attachment: BlocAttachment): string => {
    return getEntityKey(attachment, attachment.name)
  },

  /**
   * Check if attachment can be downloaded
   */
  canDownload: (attachment: BlocAttachment): boolean => {
    return isSaved(attachment) // Only saved attachments can be downloaded
  }
}

/**
 * Crop Cycle-specific helpers
 */
export const CropCycleHelpers = {
  /**
   * Get crop cycle key for React rendering
   */
  getKey: (cycle: CropCycle): string => {
    const displayName = cycle.type === 'plantation' 
      ? 'Plantation' 
      : `Ratoon-${cycle.cycleNumber - 1}`
    return getEntityKey(cycle, displayName)
  },

  /**
   * Check if cycle can be closed
   */
  canClose: (cycle: CropCycle): boolean => {
    return isSaved(cycle) && cycle.status === 'active'
  },

  /**
   * Check if cycle can have activities added
   */
  canAddActivities: (cycle: CropCycle): boolean => {
    return isSaved(cycle) && cycle.status === 'active'
  }
}

/**
 * Batch operations for arrays of entities
 */
export const BatchHelpers = {
  /**
   * Filter only saved entities
   */
  onlySaved: <T extends UUIDEntity>(entities: T[]): T[] => {
    return entities.filter(isSaved)
  },

  /**
   * Filter only new entities
   */
  onlyNew: <T extends UUIDEntity>(entities: T[]): T[] => {
    return entities.filter(isNew)
  },

  /**
   * Filter only dirty entities
   */
  onlyDirty: <T extends UUIDEntity>(entities: T[]): T[] => {
    return entities.filter(isDirty)
  },

  /**
   * Get count of entities by status
   */
  getCounts: <T extends UUIDEntity>(entities: T[]) => {
    return {
      total: entities.length,
      saved: entities.filter(isSaved).length,
      new: entities.filter(isNew).length,
      dirty: entities.filter(isDirty).length
    }
  }
}

/**
 * Validation helpers
 */
export const ValidationHelpers = {
  /**
   * Validate that an entity has required UUID for database operations
   */
  requiresUUID: (entity: UUIDEntity, operation: string): void => {
    if (!entity.uuid) {
      throw new Error(`Cannot ${operation}: Entity must be saved to database first`)
    }
  },

  /**
   * Validate that a crop cycle UUID is provided for foreign key operations
   */
  requiresCropCycleUUID: (cropCycleUuid: string | undefined, operation: string): void => {
    if (!cropCycleUuid) {
      throw new Error(`Cannot ${operation}: Valid crop cycle must be selected`)
    }
  }
}
