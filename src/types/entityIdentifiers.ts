/**
 * Entity Identifier Types and Conventions
 * 
 * This file defines the clear naming convention for identifiers throughout the application
 * to solve the confusion between frontend display IDs and database UUIDs.
 * 
 * NAMING CONVENTION:
 * - localId: Human-readable identifier for frontend display (e.g., "bloc-1", "field-A")
 * - uuid: Database UUID for foreign key relationships (e.g., "550e8400-e29b-41d4-a716-446655440001")
 * - isSaved: Boolean flag indicating if entity exists in database
 * - isDirty: Boolean flag indicating if entity has unsaved changes
 */

// Base interface for all entities with dual identifier system
export interface EntityWithIdentifiers {
  // Frontend display identifier (human-readable)
  localId: string
  
  // Database identifier (UUID) - only present if saved to database
  uuid?: string
  
  // Status flags
  isSaved: boolean    // true if entity exists in database
  isDirty: boolean    // true if entity has unsaved changes
  
  // Metadata
  createdAt: string
  updatedAt: string
}

// Validation helper functions
export class EntityIdentifierUtils {
  
  /**
   * Check if entity is saved to database
   */
  static isSaved(entity: EntityWithIdentifiers): boolean {
    return entity.isSaved && !!entity.uuid
  }
  
  /**
   * Validate entity can be used for database operations
   */
  static validateForDatabaseOperation(entity: EntityWithIdentifiers, operationName: string): void {
    if (!this.isSaved(entity)) {
      throw new Error(`Cannot ${operationName}: Entity must be saved to database first. Entity localId: ${entity.localId}`)
    }
    
    if (!entity.uuid) {
      throw new Error(`Cannot ${operationName}: Entity missing database UUID. Entity localId: ${entity.localId}`)
    }
  }
  
  /**
   * Validate entity can be used for foreign key relationships
   */
  static validateForForeignKey(entity: EntityWithIdentifiers, relationshipName: string): string {
    this.validateForDatabaseOperation(entity, `create ${relationshipName}`)
    return entity.uuid!
  }
  
  /**
   * Generate a human-readable local ID
   */
  static generateLocalId(prefix: string, counter?: number): string {
    if (counter !== undefined) {
      return `${prefix}-${counter}`
    }
    
    // Generate with timestamp for uniqueness
    const timestamp = Date.now().toString(36)
    return `${prefix}-${timestamp}`
  }
  
  /**
   * Check if a string is a valid UUID format
   */
  static isValidUUID(str: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    return uuidRegex.test(str)
  }
  
  /**
   * Mark entity as saved with database UUID
   */
  static markAsSaved<T extends EntityWithIdentifiers>(entity: T, databaseUuid: string): T {
    return {
      ...entity,
      uuid: databaseUuid,
      isSaved: true,
      isDirty: false,
      updatedAt: new Date().toISOString()
    }
  }
  
  /**
   * Mark entity as dirty (has unsaved changes)
   */
  static markAsDirty<T extends EntityWithIdentifiers>(entity: T): T {
    return {
      ...entity,
      isDirty: true,
      updatedAt: new Date().toISOString()
    }
  }
  
  /**
   * Create a new unsaved entity
   */
  static createUnsaved<T extends EntityWithIdentifiers>(
    baseEntity: Omit<T, keyof EntityWithIdentifiers>,
    localId: string
  ): T {
    const now = new Date().toISOString()
    
    return {
      ...baseEntity,
      localId,
      uuid: undefined,
      isSaved: false,
      isDirty: true,
      createdAt: now,
      updatedAt: now
    } as T
  }
}

// Type guards for entity states
export const EntityStateGuards = {
  
  /**
   * Check if entity is saved to database
   */
  isSaved: (entity: EntityWithIdentifiers): entity is EntityWithIdentifiers & { uuid: string } => {
    return entity.isSaved && !!entity.uuid
  },
  
  /**
   * Check if entity is unsaved (local only)
   */
  isUnsaved: (entity: EntityWithIdentifiers): boolean => {
    return !entity.isSaved || !entity.uuid
  },
  
  /**
   * Check if entity has unsaved changes
   */
  isDirty: (entity: EntityWithIdentifiers): boolean => {
    return entity.isDirty
  },
  
  /**
   * Check if entity is clean (no unsaved changes)
   */
  isClean: (entity: EntityWithIdentifiers): boolean => {
    return !entity.isDirty
  }
}

// Error types for identifier-related issues
export class EntityIdentifierError extends Error {
  constructor(
    message: string,
    public entityLocalId: string,
    public operationType: string
  ) {
    super(message)
    this.name = 'EntityIdentifierError'
  }
}

export class UnsavedEntityError extends EntityIdentifierError {
  constructor(entityLocalId: string, operationType: string) {
    super(
      `Cannot ${operationType}: Entity "${entityLocalId}" must be saved to database first`,
      entityLocalId,
      operationType
    )
    this.name = 'UnsavedEntityError'
  }
}

export class MissingUUIDError extends EntityIdentifierError {
  constructor(entityLocalId: string, operationType: string) {
    super(
      `Cannot ${operationType}: Entity "${entityLocalId}" is missing database UUID`,
      entityLocalId,
      operationType
    )
    this.name = 'MissingUUIDError'
  }
}

// Constants for common prefixes
export const ENTITY_PREFIXES = {
  BLOC: 'bloc',
  CROP_CYCLE: 'cycle',
  ACTIVITY: 'activity',
  OBSERVATION: 'obs',
  ATTACHMENT: 'attach',
  FIELD: 'field',
  FARM: 'farm'
} as const

export type EntityPrefix = typeof ENTITY_PREFIXES[keyof typeof ENTITY_PREFIXES]
