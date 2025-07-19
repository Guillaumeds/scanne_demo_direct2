/**
 * Demo Storage Service
 * Type-safe localStorage wrapper for demo data persistence
 * Provides selective persistence and cache management
 */

export interface StorageConfig {
  prefix: string
  version: string
  enableCompression: boolean
  maxSize: number // bytes
}

export class DemoStorage {
  private static config: StorageConfig = {
    prefix: 'scanne_demo',
    version: '2.0.0',
    enableCompression: false,
    maxSize: 5 * 1024 * 1024, // 5MB
  }

  /**
   * Get data from localStorage with type safety
   */
  static get<T>(key: string): T | null {
    try {
      const fullKey = `${this.config.prefix}_${key}`
      const stored = localStorage.getItem(fullKey)
      
      if (!stored) return null
      
      const parsed = JSON.parse(stored)
      
      // Check version compatibility
      if (parsed.version && parsed.version !== this.config.version) {
        console.warn(`Version mismatch for ${key}: stored ${parsed.version}, expected ${this.config.version}`)
        this.remove(key)
        return null
      }
      
      return parsed.data || parsed
    } catch (error) {
      console.error(`Failed to get ${key} from storage:`, error)
      return null
    }
  }

  /**
   * Set data in localStorage with versioning
   */
  static set<T>(key: string, data: T): void {
    const fullKey = `${this.config.prefix}_${key}`
    const payload = {
      version: this.config.version,
      data,
      timestamp: Date.now(),
    }

    const serialized = JSON.stringify(payload)

    try {
      // Check size limits
      if (serialized.length > this.config.maxSize) {
        console.warn(`Data for ${key} exceeds size limit, truncating...`)
        // Could implement compression or selective storage here
      }

      localStorage.setItem(fullKey, serialized)
    } catch (error) {
      console.error(`Failed to set ${key} in storage:`, error)

      // Handle quota exceeded
      if (error instanceof DOMException && error.code === 22) {
        console.warn('Storage quota exceeded, clearing old data...')
        this.clearOldData()

        // Retry once
        try {
          localStorage.setItem(fullKey, serialized)
        } catch (retryError) {
          console.error('Failed to store data even after cleanup:', retryError)
        }
      }
    }
  }

  /**
   * Remove data from localStorage
   */
  static remove(key: string): void {
    try {
      const fullKey = `${this.config.prefix}_${key}`
      localStorage.removeItem(fullKey)
    } catch (error) {
      console.error(`Failed to remove ${key} from storage:`, error)
    }
  }

  /**
   * Clear all demo data
   */
  static clear(): void {
    try {
      const keys = Object.keys(localStorage).filter(key => 
        key.startsWith(this.config.prefix)
      )
      
      keys.forEach(key => localStorage.removeItem(key))
      console.log(`Cleared ${keys.length} demo storage items`)
    } catch (error) {
      console.error('Failed to clear demo storage:', error)
    }
  }

  /**
   * Get all demo storage keys
   */
  static getKeys(): string[] {
    try {
      return Object.keys(localStorage)
        .filter(key => key.startsWith(this.config.prefix))
        .map(key => key.replace(`${this.config.prefix}_`, ''))
    } catch (error) {
      console.error('Failed to get storage keys:', error)
      return []
    }
  }

  /**
   * Get storage usage statistics
   */
  static getUsageStats(): { totalSize: number; itemCount: number; items: Array<{ key: string; size: number }> } {
    try {
      const items: Array<{ key: string; size: number }> = []
      let totalSize = 0
      
      Object.keys(localStorage).forEach(fullKey => {
        if (fullKey.startsWith(this.config.prefix)) {
          const value = localStorage.getItem(fullKey) || ''
          const size = new Blob([value]).size
          const key = fullKey.replace(`${this.config.prefix}_`, '')
          
          items.push({ key, size })
          totalSize += size
        }
      })
      
      return {
        totalSize,
        itemCount: items.length,
        items: items.sort((a, b) => b.size - a.size)
      }
    } catch (error) {
      console.error('Failed to get usage stats:', error)
      return { totalSize: 0, itemCount: 0, items: [] }
    }
  }

  /**
   * Clear old data based on timestamp
   */
  private static clearOldData(): void {
    try {
      const cutoffTime = Date.now() - (7 * 24 * 60 * 60 * 1000) // 7 days ago
      const keysToRemove: string[] = []
      
      Object.keys(localStorage).forEach(fullKey => {
        if (fullKey.startsWith(this.config.prefix)) {
          try {
            const stored = localStorage.getItem(fullKey)
            if (stored) {
              const parsed = JSON.parse(stored)
              if (parsed.timestamp && parsed.timestamp < cutoffTime) {
                keysToRemove.push(fullKey)
              }
            }
          } catch (parseError) {
            // If we can't parse it, it's probably old format, remove it
            keysToRemove.push(fullKey)
          }
        }
      })
      
      keysToRemove.forEach(key => localStorage.removeItem(key))
      console.log(`Cleared ${keysToRemove.length} old storage items`)
    } catch (error) {
      console.error('Failed to clear old data:', error)
    }
  }

  /**
   * Export all demo data
   */
  static exportData(): string {
    try {
      const data: Record<string, any> = {}
      
      Object.keys(localStorage).forEach(fullKey => {
        if (fullKey.startsWith(this.config.prefix)) {
          const key = fullKey.replace(`${this.config.prefix}_`, '')
          const value = localStorage.getItem(fullKey)
          if (value) {
            try {
              data[key] = JSON.parse(value)
            } catch {
              data[key] = value
            }
          }
        }
      })
      
      return JSON.stringify({
        version: this.config.version,
        exportedAt: new Date().toISOString(),
        data
      }, null, 2)
    } catch (error) {
      console.error('Failed to export data:', error)
      return '{}'
    }
  }

  /**
   * Import demo data
   */
  static importData(jsonData: string): void {
    try {
      const imported = JSON.parse(jsonData)
      
      if (imported.version && imported.version !== this.config.version) {
        console.warn(`Importing data from different version: ${imported.version}`)
      }
      
      const data = imported.data || imported
      
      Object.entries(data).forEach(([key, value]) => {
        this.set(key, value)
      })
      
      console.log(`Imported ${Object.keys(data).length} storage items`)
    } catch (error) {
      console.error('Failed to import data:', error)
      throw new Error('Invalid import data format')
    }
  }

  /**
   * Check if storage is available
   */
  static isAvailable(): boolean {
    try {
      const testKey = `${this.config.prefix}_test`
      localStorage.setItem(testKey, 'test')
      localStorage.removeItem(testKey)
      return true
    } catch {
      return false
    }
  }

  /**
   * Update storage configuration
   */
  static configure(newConfig: Partial<StorageConfig>): void {
    this.config = { ...this.config, ...newConfig }
  }

  /**
   * Initialize demo data if storage is empty
   * This method seeds the storage with initial demo data
   */
  static async initializeIfEmpty(): Promise<void> {
    try {
      // Check if we already have demo data
      const existingKeys = this.getKeys()
      if (existingKeys.length > 0) {
        console.log('📦 Demo storage already has data, skipping initialization')
        return
      }

      console.log('🌱 Initializing demo storage with seed data...')

      // Import demo data services
      const { PRODUCTS } = await import('@/data/master/products')
      const { EQUIPMENT_TYPES } = await import('@/data/master/equipment')
      const { LABOUR_TYPES } = await import('@/data/master/labour')
      const { SUGARCANE_VARIETIES } = await import('@/data/master/sugarcaneVarieties')
      const { FIELDS } = await import('@/data/master/fields')
      const { OPERATION_TYPES } = await import('@/data/configuration/operationTypes')
      const { OPERATION_METHODS } = await import('@/data/configuration/operationMethods')

      // Store initial demo data
      this.set('blocs', []) // No blocs - fields are displayed as map polygons
      this.set('products', PRODUCTS)
      this.set('equipment', EQUIPMENT_TYPES)
      this.set('labour', LABOUR_TYPES)
      this.set('varieties', SUGARCANE_VARIETIES)
      this.set('fields', FIELDS)
      this.set('operation_types', OPERATION_TYPES)
      this.set('operation_methods', OPERATION_METHODS)

      // Initialize empty collections for user data
      this.set('operations', [])
      this.set('crop_cycles', [])
      this.set('work_packages', [])

      console.log('✅ Demo storage initialized successfully')
    } catch (error) {
      console.error('❌ Failed to initialize demo storage:', error)
      throw error
    }
  }
}
