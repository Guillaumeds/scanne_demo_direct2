/**
 * DrawnArea Type Definition
 * 
 * Represents a polygon drawn on the map that can be saved as a bloc in the database.
 * Uses the new identifier naming convention to distinguish between frontend display IDs
 * and database UUIDs.
 */

import { EntityWithIdentifiers } from './entityIdentifiers'

export interface DrawnArea extends EntityWithIdentifiers {
  // Geometry properties
  type: string                        // 'polygon', 'rectangle', etc.
  coordinates: [number, number][]     // Array of [lng, lat] coordinates
  area: number                        // Area in hectares

  // Display properties
  name?: string                       // Optional human-readable name
  description?: string                // Optional description

  // Status properties (inherited from EntityWithIdentifiers)
  // localId: string                  // Frontend display ID (e.g., "bloc-1")
  // uuid?: string                    // Database UUID (only when saved)
  // isSaved: boolean                 // true if exists in database
  // isDirty: boolean                 // true if has unsaved changes
  // createdAt: string
  // updatedAt: string
}

// Helper functions for DrawnArea
export class DrawnAreaUtils {
  
  /**
   * Create a new unsaved drawn area
   */
  static createNew(
    coordinates: [number, number][],
    area: number,
    type: string = 'polygon'
  ): DrawnArea {
    const now = new Date().toISOString()
    const localId = `bloc-${Date.now().toString(36)}`

    return {
      localId,
      uuid: undefined,
      type,
      coordinates,
      area,
      isSaved: false,
      isDirty: true,
      createdAt: now,
      updatedAt: now
    }
  }
  
  /**
   * Mark drawn area as saved with database UUID
   */
  static markAsSaved(drawnArea: DrawnArea, databaseUuid: string): DrawnArea {
    return {
      ...drawnArea,
      uuid: databaseUuid,
      isSaved: true,
      isDirty: false,
      updatedAt: new Date().toISOString()
    }
  }
  
  /**
   * Parse WKT (Well-Known Text) polygon to coordinate array
   * Handles format: "POLYGON((lng lat, lng lat, lng lat, lng lat))"
   */
  static parseWKTToCoordinates(wktString: string): [number, number][] {
    if (!wktString || wktString.trim() === '') {
      return []
    }

    try {
      // Parse WKT format: "POLYGON((lng lat, lng lat, ...))"
      const wktMatch = wktString.match(/POLYGON\(\(([^)]+)\)\)/)
      if (wktMatch) {
        const coordsString = wktMatch[1]
        const coordPairs = coordsString.split(',').map(pair => pair.trim())

        const coordinates = coordPairs
          .map(pair => {
            const [first, second] = pair.split(' ').map(Number)
            // Database WKT is stored as "lng lat" but our existing data might be "lat lng"
            // Check if first value looks like latitude (Mauritius: -20.5 to -19.9)
            if (first >= -21 && first <= -19 && second >= 57 && second <= 58) {
              // Data is stored as "lat lng" - swap to our standard [lng, lat]
              return [second, first] as [number, number] // [lng, lat]
            } else {
              // Data is stored as "lng lat" - use directly
              return [first, second] as [number, number] // [lng, lat]
            }
          })
          .filter(coord => coord !== null) as [number, number][]

        return coordinates
      }
      return []
    } catch (error) {
      console.error('❌ Error parsing WKT coordinates:', error)
      return []
    }
  }

  /**
   * Create drawn area from database bloc
   */
  static fromDatabaseBloc(bloc: any): DrawnArea {
    // Parse PostGIS WKT coordinates from the database
    const coordinates = this.parseWKTToCoordinates(bloc.coordinates_wkt || '')

    return {
      localId: `bloc-${bloc.name?.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase() || 'unknown'}`,
      uuid: bloc.id,
      type: 'polygon',
      coordinates,
      area: Number(bloc.area_hectares) || 0,
      name: bloc.name,
      // description: bloc.description, // Removed - blocs table doesn't have description column
      isSaved: true,
      isDirty: false,
      createdAt: bloc.created_at || new Date().toISOString(),
      updatedAt: bloc.updated_at || new Date().toISOString()
    }
  }
  
  /**
   * Get display name for drawn area
   */
  static getDisplayName(drawnArea: DrawnArea): string {
    // Always prefer the actual name from database
    if (drawnArea.name) {
      return drawnArea.name
    }

    // Fallback: Generate display name from localId for unsaved areas
    const parts = drawnArea.localId.split('-')
    if (parts.length >= 2) {
      return `Bloc ${parts[1]}`
    }

    return `Bloc ${drawnArea.localId}`
  }

  /**
   * Get stable key for React rendering
   * Uses UUID if available, otherwise uses localId
   */
  static getEntityKey(drawnArea: DrawnArea): string {
    return drawnArea.uuid || drawnArea.localId
  }
  
  /**
   * Validate drawn area can be saved to database
   */
  static validateForSave(drawnArea: DrawnArea): void {
    if (drawnArea.coordinates.length < 3) {
      throw new Error(`Cannot save bloc "${drawnArea.localId}": Must have at least 3 coordinates`)
    }
    
    if (drawnArea.area <= 0) {
      throw new Error(`Cannot save bloc "${drawnArea.localId}": Area must be greater than 0`)
    }
  }
  
  /**
   * Validate drawn area can be used for crop cycle creation
   */
  static validateForCropCycle(drawnArea: DrawnArea): string {
    if (!drawnArea.isSaved || !drawnArea.uuid) {
      throw new Error(`Cannot create crop cycle: Bloc "${drawnArea.localId}" must be saved to database first`)
    }
    
    return drawnArea.uuid
  }
}

// Type guards for DrawnArea states
export const DrawnAreaGuards = {
  
  /**
   * Check if drawn area is saved to database
   */
  isSaved: (drawnArea: DrawnArea): drawnArea is DrawnArea & { uuid: string } => {
    return drawnArea.isSaved && !!drawnArea.uuid
  },
  
  /**
   * Check if drawn area is unsaved (local only)
   */
  isUnsaved: (drawnArea: DrawnArea): boolean => {
    return !drawnArea.isSaved || !drawnArea.uuid
  },
  
  /**
   * Check if drawn area has unsaved changes
   */
  isDirty: (drawnArea: DrawnArea): boolean => {
    return drawnArea.isDirty
  }
}
