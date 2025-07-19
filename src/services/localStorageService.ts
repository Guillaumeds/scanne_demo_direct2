/**
 * Simple LocalStorage Service
 * Handles two types of localStorage:
 * 1. Config data (products, resources, varieties) - 24h TTL
 * 2. Cycle totals (financial calculations) - cleared when bloc closed
 */

import { MockApiService } from './mockApiService'
import { SugarcaneVariety, InterCropPlant, CropVariety } from '@/types/varieties'
import { Product } from '@/types/products'
import { Resource } from '@/types/resources'
import { CropCycleTotals } from './frontendCalculationService'

interface StorageItem<T> {
  data: T
  timestamp: number
  ttl: number // Time to live in milliseconds
}

export class LocalStorageService {
  private static readonly TTL = 24 * 60 * 60 * 1000 // 24 hours

  private static readonly KEYS = {
    SUGARCANE_VARIETIES: 'scanne_sugarcane_varieties',
    INTERCROP_VARIETIES: 'scanne_intercrop_varieties',
    PRODUCTS: 'scanne_products',
    RESOURCES: 'scanne_resources',
  } as const

  // Storage keys for cycle totals (separate from config data)
  private static readonly CYCLE_TOTALS_PREFIX = 'scanne_cycle_totals_'

  /**
   * Generic method to get data from localStorage or fetch from database
   */
  private static async getOrFetch<T>(
    key: string,
    fetchFunction: () => Promise<T>
  ): Promise<T> {
    try {
      // Try to get from localStorage first
      const stored = this.getFromStorage<T>(key)
      if (stored && this.isValid(stored)) {
        // Using localStorage data
        return stored.data
      }

      // Fetch from database
      console.log(`🔄 Fetching fresh data from database for: ${key}`)
      const data = await fetchFunction()
      
      // Store in localStorage
      this.saveToStorage(key, data)
      
      return data
    } catch (error) {
      console.error(`❌ Error getting data for ${key}:`, error)
      throw error
    }
  }

  /**
   * Get data from localStorage
   */
  private static getFromStorage<T>(key: string): StorageItem<T> | null {
    if (typeof window === 'undefined') return null
    
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : null
    } catch (error) {
      console.warn(`Error reading from localStorage for ${key}:`, error)
      return null
    }
  }

  /**
   * Save data to localStorage with timestamp
   */
  private static saveToStorage<T>(key: string, data: T): void {
    if (typeof window === 'undefined') return
    
    try {
      const item: StorageItem<T> = {
        data,
        timestamp: Date.now(),
        ttl: this.TTL
      }
      localStorage.setItem(key, JSON.stringify(item))
      console.log(`💾 Saved to localStorage: ${key}`)
    } catch (error) {
      console.warn(`Error saving to localStorage for ${key}:`, error)
    }
  }

  /**
   * Check if stored data is still valid (not expired)
   */
  private static isValid<T>(item: StorageItem<T>): boolean {
    const now = Date.now()
    const age = now - item.timestamp
    return age < item.ttl
  }

  /**
   * Clear specific item from localStorage
   */
  private static clearItem(key: string): void {
    if (typeof window === 'undefined') return
    localStorage.removeItem(key)
    console.log(`🗑️ Cleared localStorage: ${key}`)
  }

  /**
   * Clear all configuration data from localStorage
   */
  static clearAll(): void {
    Object.values(this.KEYS).forEach(key => this.clearItem(key))
    console.log('🗑️ Cleared all configuration data from localStorage')
  }

  // =============================================================================
  // PUBLIC API METHODS (Replace React Query hooks)
  // =============================================================================

  /**
   * Get sugarcane varieties (localStorage + DB fallback)
   */
  static async getSugarcaneVarieties(): Promise<any[]> {
    return this.getOrFetch(
      this.KEYS.SUGARCANE_VARIETIES,
      async () => {
        const response = await MockApiService.getSugarcaneVarieties()
        return response.data
      }
    )
  }

  /**
   * Get intercrop varieties (localStorage + DB fallback)
   */
  static async getIntercropVarieties(): Promise<InterCropPlant[]> {
    return this.getOrFetch(
      this.KEYS.INTERCROP_VARIETIES,
      async () => {
        // Demo mode returns empty array for intercrop varieties
        return []
      }
    )
  }

  /**
   * Get all varieties (localStorage + DB fallback)
   */
  static async getAllVarieties(): Promise<CropVariety[]> {
    const [sugarcane, intercrop] = await Promise.all([
      this.getSugarcaneVarieties(),
      this.getIntercropVarieties()
    ])
    return [...sugarcane, ...intercrop]
  }

  /**
   * Get products (localStorage + DB fallback)
   */
  static async getProducts(): Promise<any[]> {
    return this.getOrFetch(
      this.KEYS.PRODUCTS,
      async () => {
        const response = await MockApiService.getProducts()
        return response.data
      }
    )
  }

  /**
   * Get resources (localStorage + DB fallback)
   */
  static async getResources(): Promise<any[]> {
    return this.getOrFetch(
      this.KEYS.RESOURCES,
      async () => {
        const response = await MockApiService.getLabourTypes()
        return response.data
      }
    )
  }

  /**
   * Force refresh data from database (bypass localStorage)
   */
  static async refreshData(): Promise<void> {
    console.log('🔄 Force refreshing all configuration data...')
    
    // Clear localStorage
    this.clearAll()
    
    // Fetch fresh data (will automatically save to localStorage)
    await Promise.all([
      this.getSugarcaneVarieties(),
      this.getIntercropVarieties(),
      this.getProducts(),
      this.getResources()
    ])
    
    console.log('✅ All configuration data refreshed')
  }

  /**
   * Get storage statistics for debugging
   */
  static getStorageStats(): Record<string, any> {
    const stats: Record<string, any> = {}

    Object.entries(this.KEYS).forEach(([name, key]) => {
      const item = this.getFromStorage(key)
      if (item) {
        const age = Date.now() - item.timestamp
        const ageHours = Math.round(age / (1000 * 60 * 60))
        stats[name] = {
          exists: true,
          ageHours,
          isValid: this.isValid(item),
          dataLength: Array.isArray(item.data) ? item.data.length : 'N/A'
        }
      } else {
        stats[name] = { exists: false }
      }
    })

    return stats
  }

  /**
   * Clear all cached data (useful for debugging or when database is reset)
   */
  static clearAllCache(): void {
    Object.values(this.KEYS).forEach(key => {
      localStorage.removeItem(key)
    })
    console.log('🧹 Cleared all localStorage cache')
  }

  /**
   * Force refresh all data from database (clears cache and reloads)
   */
  static async refreshAllData(): Promise<void> {
    console.log('🔄 Force refreshing all localStorage data...')
    this.clearAllCache()

    // Reload all data from database
    await Promise.all([
      this.getSugarcaneVarieties(),
      this.getIntercropVarieties(),
      this.getProducts(),
      this.getResources()
    ])

    console.log('✅ All localStorage data refreshed from database')
  }

  /**
   * Auto-refresh cache if stale (called on app initialization)
   */
  static async autoRefreshIfStale(): Promise<void> {
    try {
      const stats = this.getStorageStats()
      let needsRefresh = false

      // Check if any cache is missing or stale (older than 1 hour)
      Object.entries(stats).forEach(([name, stat]) => {
        if (!stat.exists || !stat.isValid || stat.ageHours > 1) {
          console.log(`🔄 Cache ${name} needs refresh: exists=${stat.exists}, valid=${stat.isValid}, age=${stat.ageHours}h`)
          needsRefresh = true
        }
      })

      if (needsRefresh) {
        await this.refreshAllData()
      } else {
        // Cache is fresh
      }
    } catch (error) {
      console.error('❌ Error during auto-refresh check:', error)
      // If there's an error, refresh anyway to be safe
      await this.refreshAllData()
    }
  }

  /**
   * Check if error indicates UUID mismatch or foreign key violation
   */
  static isUuidMismatchError(error: any): boolean {
    if (!error) return false

    // PostgreSQL error codes for foreign key violations
    const foreignKeyErrorCodes = ['23503', '23505', 'PGRST116']

    // Check error code
    if (foreignKeyErrorCodes.includes(error.code)) return true

    // Check error message for common UUID mismatch patterns
    const errorMessage = error.message?.toLowerCase() || ''
    const uuidMismatchPatterns = [
      'does not exist',
      'violates foreign key constraint',
      'invalid uuid',
      'uuid not found',
      'foreign key violation',
      'constraint violation'
    ]

    return uuidMismatchPatterns.some(pattern => errorMessage.includes(pattern))
  }

  /**
   * Auto-recovery wrapper for database operations that use cached UUIDs
   * Automatically refreshes cache and retries once if UUID mismatch is detected
   */
  static async withAutoRecovery<T>(
    operation: () => Promise<T>,
    operationName: string = 'database operation'
  ): Promise<T> {
    try {
      console.log(`🔄 Starting ${operationName}...`)
      return await operation()
    } catch (error) {
      console.log(`🚨 Error in ${operationName}:`, {
        error,
        errorMessage: (error as any)?.message,
        errorCode: (error as any)?.code,
        isUuidMismatch: this.isUuidMismatchError(error)
      })

      if (this.isUuidMismatchError(error)) {
        console.log(`🔄 UUID mismatch detected in ${operationName}, refreshing cache and retrying...`)
        console.log('🚨 Original error:', (error as any)?.message)

        // Refresh cache
        await this.refreshAllData()

        // Retry operation once
        try {
          console.log(`🔁 Retrying ${operationName} after cache refresh...`)
          const result = await operation()
          console.log(`✅ ${operationName} succeeded after auto-recovery`)
          return result
        } catch (retryError) {
          console.error(`❌ ${operationName} failed even after auto-recovery:`, {
            retryError,
            originalError: error,
            operationName
          })
          throw new Error(`${operationName} failed: ${(retryError as any)?.message || 'Unknown error after auto-recovery'}`)
        }
      }

      // If not a UUID mismatch error, throw original error
      console.log(`❌ ${operationName} failed with non-UUID error, not retrying`)
      throw error
    }
  }

  // =====================================================
  // CYCLE TOTALS MANAGEMENT (separate from config data)
  // =====================================================

  /**
   * Store cycle totals in localStorage (no TTL - cleared when bloc closed)
   */
  static storeCycleTotals(cycleId: string, totals: CropCycleTotals): void {
    try {
      const key = this.CYCLE_TOTALS_PREFIX + cycleId
      localStorage.setItem(key, JSON.stringify(totals))
      console.log('💾 Stored cycle totals in localStorage:', cycleId)
    } catch (error) {
      console.error('❌ Error storing cycle totals:', error)
    }
  }

  /**
   * Get cycle totals from localStorage
   */
  static getCycleTotals(cycleId: string): CropCycleTotals | null {
    try {
      const key = this.CYCLE_TOTALS_PREFIX + cycleId
      const stored = localStorage.getItem(key)
      if (stored) {
        const totals = JSON.parse(stored) as CropCycleTotals
        console.log('📊 Retrieved cycle totals from localStorage:', cycleId)
        return totals
      }
      return null
    } catch (error) {
      console.error('❌ Error retrieving cycle totals:', error)
      return null
    }
  }

  /**
   * Clear cycle totals from localStorage
   */
  static clearCycleTotals(cycleId: string): void {
    try {
      const key = this.CYCLE_TOTALS_PREFIX + cycleId
      localStorage.removeItem(key)
      console.log('🧹 Cleared cycle totals from localStorage:', cycleId)
    } catch (error) {
      console.error('❌ Error clearing cycle totals:', error)
    }
  }

  /**
   * Clear all cycle totals (when bloc is closed)
   */
  static clearAllCycleTotals(): void {
    try {
      const keys = Object.keys(localStorage).filter(key =>
        key.startsWith(this.CYCLE_TOTALS_PREFIX)
      )

      keys.forEach(key => localStorage.removeItem(key))
      console.log('🧹 Cleared all cycle totals from localStorage:', keys.length, 'items')
    } catch (error) {
      console.error('❌ Error clearing all cycle totals:', error)
    }
  }

  /**
   * Get all stored cycle totals (for debugging)
   */
  static getAllCycleTotals(): Record<string, CropCycleTotals> {
    try {
      const result: Record<string, CropCycleTotals> = {}
      const keys = Object.keys(localStorage).filter(key =>
        key.startsWith(this.CYCLE_TOTALS_PREFIX)
      )

      keys.forEach(key => {
        const cycleId = key.replace(this.CYCLE_TOTALS_PREFIX, '')
        const stored = localStorage.getItem(key)
        if (stored) {
          result[cycleId] = JSON.parse(stored)
        }
      })

      return result
    } catch (error) {
      console.error('❌ Error getting all cycle totals:', error)
      return {}
    }
  }
}
