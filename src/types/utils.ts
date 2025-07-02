/**
 * Advanced TypeScript Utility Types for Scanne App
 * 
 * This file contains advanced TypeScript features and utility types
 * that improve type safety and developer experience across the application.
 */

// Branded types for better type safety
export type Brand<T, B> = T & { readonly __brand: B }

// ID types with branding
export type BlocId = Brand<string, 'BlocId'>
export type ActivityId = Brand<string, 'ActivityId'>
export type ObservationId = Brand<string, 'ObservationId'>
export type AttachmentId = Brand<string, 'AttachmentId'>
export type CropCycleId = Brand<string, 'CropCycleId'>

// Utility functions to create branded IDs
export const createBlocId = (id: string): BlocId => id as BlocId
export const createActivityId = (id: string): ActivityId => id as ActivityId
export const createObservationId = (id: string): ObservationId => id as ObservationId
export const createAttachmentId = (id: string): AttachmentId => id as AttachmentId
export const createCropCycleId = (id: string): CropCycleId => id as CropCycleId

// Result types for better error handling
export type Result<T, E = string> = 
  | { success: true; data: T }
  | { success: false; error: E; code?: string }

// API Response types
export type ApiResponse<T> = Result<T, {
  message: string
  details?: unknown
  timestamp: string
}>

// Async result type
export type AsyncResult<T, E = string> = Promise<Result<T, E>>

// Pagination types
export interface PaginationParams {
  page: number
  limit: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

// Deep partial type for nested updates
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

// Required fields type
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>

// Optional fields type
export type OptionalFields<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

// Timestamp mixin
export interface Timestamps {
  createdAt: string
  updatedAt: string
}

// User tracking mixin
export interface UserTracking {
  createdBy: string
  updatedBy?: string
}

// Soft delete mixin
export interface SoftDelete {
  deletedAt?: string
  deletedBy?: string
}

// Complete audit trail
export type AuditTrail = Timestamps & UserTracking & SoftDelete

// Entity base type
export interface BaseEntity {
  id: string
}

// Full entity with audit trail
export type Entity<T = {}> = BaseEntity & T & AuditTrail

// Update payload type (excludes audit fields)
export type UpdatePayload<T> = Omit<Partial<T>, keyof (BaseEntity & AuditTrail)>

// Create payload type (excludes id and audit fields)
export type CreatePayload<T> = Omit<T, keyof (BaseEntity & AuditTrail)>

// Query builder types
export type FilterOperator = 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'nin' | 'like' | 'ilike'

export interface QueryFilter<T = any> {
  field: string
  operator: FilterOperator
  value: T
}

export interface QueryOptions {
  filters?: QueryFilter[]
  sort?: Array<{ field: string; order: 'asc' | 'desc' }>
  pagination?: PaginationParams
  include?: string[]
}

// Type-safe event system
export interface TypedEvent<T = any> {
  type: string
  payload: T
  timestamp: string
  source?: string
}

// Service interface pattern
export interface CRUDService<T, CreateT = CreatePayload<T>, UpdateT = UpdatePayload<T>> {
  create(data: CreateT): AsyncResult<T>
  getById(id: string): AsyncResult<T | null>
  update(id: string, data: UpdateT): AsyncResult<T>
  delete(id: string): AsyncResult<void>
  list(options?: QueryOptions): AsyncResult<PaginatedResponse<T>>
}

// Validation types
export interface ValidationRule<T = any> {
  field: keyof T
  required?: boolean
  type?: 'string' | 'number' | 'boolean' | 'date' | 'email' | 'url'
  min?: number
  max?: number
  pattern?: RegExp
  custom?: (value: any) => boolean | string
}

export interface ValidationResult {
  valid: boolean
  errors: Array<{
    field: string
    message: string
    code?: string
  }>
}

// Type-safe configuration
export interface AppConfig {
  database: {
    url: string
    maxConnections: number
  }
  storage: {
    provider: 'local' | 'supabase' | 's3'
    bucket?: string
  }
  features: {
    enableOfflineMode: boolean
    enableRealTimeSync: boolean
    enableAdvancedAnalytics: boolean
  }
}

// Environment-specific config
export type Environment = 'development' | 'staging' | 'production'
export type EnvConfig<T> = Record<Environment, T>

// Type-safe localStorage wrapper
export interface TypedStorage {
  get<T>(key: string): T | null
  set<T>(key: string, value: T): void
  remove(key: string): void
  clear(): void
}

// Permission system types
export type Permission = 
  | 'read:activities' | 'write:activities' | 'delete:activities'
  | 'read:observations' | 'write:observations' | 'delete:observations'
  | 'read:attachments' | 'write:attachments' | 'delete:attachments'
  | 'read:cycles' | 'write:cycles' | 'delete:cycles'
  | 'admin:all'

export interface UserRole {
  id: string
  name: string
  permissions: Permission[]
}

export interface User {
  id: string
  email: string
  name: string
  roles: UserRole[]
}

// Type guard utilities
export const isString = (value: unknown): value is string => typeof value === 'string'
export const isNumber = (value: unknown): value is number => typeof value === 'number' && !isNaN(value)
export const isBoolean = (value: unknown): value is boolean => typeof value === 'boolean'
export const isObject = (value: unknown): value is object => typeof value === 'object' && value !== null
export const isArray = (value: unknown): value is unknown[] => Array.isArray(value)

// Async utilities
export const delay = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms))

export const retry = async <T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  delayMs: number = 1000
): Promise<T> => {
  let lastError: Error
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error as Error
      if (attempt < maxAttempts) {
        await delay(delayMs * attempt)
      }
    }
  }
  
  throw lastError!
}

// Type-safe error handling
export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public details?: unknown
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export const createError = (
  message: string,
  code: string,
  statusCode?: number,
  details?: unknown
): AppError => new AppError(message, code, statusCode, details)
