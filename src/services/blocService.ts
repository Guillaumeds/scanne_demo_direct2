/**
 * Bloc Service - Database operations for blocs
 * Handles CRUD operations for blocs in Supabase
 */

import { supabase } from '@/lib/supabase'
import type { Bloc } from '@/lib/supabase'
import { DrawnArea, DrawnAreaUtils } from '@/types/drawnArea'
import { EntityIdentifierUtils, UnsavedEntityError } from '@/types/entityIdentifiers'

// Interface for creating a new bloc
interface CreateBlocRequest {
  name: string
  description?: string
  coordinates: [number, number][]
  area_hectares: number
}

export class BlocService {
  
  /**
   * Save a drawn area as a bloc in the database
   */
  static async saveDrawnAreaAsBloc(drawnArea: DrawnArea): Promise<Bloc> {
    try {
      // Validate drawn area can be saved
      DrawnAreaUtils.validateForSave(drawnArea)

      // Prevent saving already saved areas
      if (drawnArea.isSaved && drawnArea.uuid) {
        console.warn('⚠️ Attempting to save already saved bloc:', drawnArea.localId)
        throw new Error(`Bloc "${drawnArea.localId}" is already saved to database`)
      }

      // Convert coordinates from Leaflet format [lat, lng] to PostGIS WKT format
      // PostGIS WKT expects "longitude latitude" format with SRID 4326 for GPS coordinates

      // drawnArea.coordinates is in Leaflet format: [[lat, lng], [lat, lng], ...]
      // Convert to PostGIS format: "lng lat, lng lat, ..."
      const coordinatesString = drawnArea.coordinates
        .map(coord => `${coord[1]} ${coord[0]}`) // Convert [lat, lng] to "lng lat"
        .join(', ')

      // Ensure polygon is properly closed by adding the first coordinate at the end
      const firstCoord = drawnArea.coordinates[0]
      const closingCoord = `${firstCoord[1]} ${firstCoord[0]}`

      // Create WKT POLYGON string with proper SRID 4326 format
      const polygonWKT = `POLYGON((${coordinatesString}, ${closingCoord}))`

      console.log('🔧 Converting coordinates for PostGIS SRID 4326:', {
        localId: drawnArea.localId,
        leafletFormat: drawnArea.coordinates.slice(0, 3), // Show first 3 coords
        postgisWKT: polygonWKT.substring(0, 100) + '...',
        totalCoords: drawnArea.coordinates.length
      })

      // Save bloc directly to database without field association
      console.log('💾 Saving bloc to database:', drawnArea.localId)

      // Insert bloc without field_id (column has been removed)
      const { data, error } = await supabase
        .from('blocs')
        .insert({
          farm_id: '550e8400-e29b-41d4-a716-446655440001', // Demo Farm ID
          name: DrawnAreaUtils.getDisplayName(drawnArea),
          coordinates: polygonWKT, // PostGIS will handle the SRID
          area_hectares: drawnArea.area,
          status: 'active'
        })
        .select()
        .single()
      
      if (error) {
        console.error('Error saving bloc:', error)
        throw error
      }

      if (!data) {
        throw new Error('No data returned from bloc insertion')
      }

      return data // .single() returns the object directly
    } catch (error) {
      console.error('Failed to save drawn area as bloc:', error)
      throw error
    }
  }
  
  /**
   * Save multiple drawn areas as blocs
   */
  static async saveMultipleDrawnAreas(drawnAreas: DrawnArea[]): Promise<Bloc[]> {
    try {
      const savedBlocs: Bloc[] = []

      for (const drawnArea of drawnAreas) {
        try {
          const bloc = await this.saveDrawnAreaAsBloc(drawnArea)
          savedBlocs.push(bloc)
        } catch (error) {
          console.error(`Failed to save bloc ${drawnArea.localId}:`, error)
          // Continue with other blocs even if one fails
        }
      }

      return savedBlocs
    } catch (error) {
      console.error('Failed to save multiple drawn areas:', error)
      throw error
    }
  }
  
  /**
   * Get all blocs from database with WKT coordinates
   */
  static async getAllBlocs(): Promise<any[]> {
    try {
      console.log('🔍 Fetching blocs from database...')

      // First try simple query to see if blocs table is accessible
      const { data: simpleData, error: simpleError } = await supabase
        .from('blocs')
        .select('id, name, area_hectares')

      console.log('🔍 Simple blocs query result:', { data: simpleData, error: simpleError })

      // Use RPC function to get blocs with WKT coordinates for easier parsing
      const { data, error } = await supabase.rpc('get_blocs_with_wkt')

      console.log('🔍 RPC blocs query result:', { data, error })

      if (error) throw error

      // Transform database records to DrawnArea format with new naming convention
      console.log('🔄 Raw database data:', data)

      // Return raw database objects - transformation happens in calling code
      console.log('🔄 Returning raw blocs:', data.length, 'blocs')

      return data
    } catch (error) {
      console.error('Failed to fetch blocs:', error)
      return []
    }
  }

  /**
   * Transform database bloc record to DrawnArea format
   */
  private static transformDbToDrawnArea(dbRecord: any, index?: number): DrawnArea {
    // Parse WKT coordinates to coordinate array
    const coordinates = DrawnAreaUtils.parseWKTToCoordinates(dbRecord.coordinates_wkt || '')

    // Generate simple sequential local ID for internal use
    const localId = `bloc-${(index ?? 0) + 1}`

    return {
      localId,
      uuid: dbRecord.id,
      type: 'polygon',
      coordinates,
      area: dbRecord.area_hectares || 0,
      name: dbRecord.name, // Use actual database name for display
      isSaved: true,
      isDirty: false,
      createdAt: dbRecord.created_at || new Date().toISOString(),
      updatedAt: dbRecord.updated_at || new Date().toISOString()
    }
  }

  /**
   * Get bloc with crop cycle data
   */
  static async getBlocWithCropCycle(blocId: string): Promise<any> {
    try {
      // First get the bloc data
      const { data: blocData, error: blocError } = await supabase
        .from('blocs')
        .select('*')
        .eq('id', blocId)
        .single()

      if (blocError) throw blocError

      // Then get crop cycles separately to avoid join issues
      const { data: cropCycles, error: cycleError } = await supabase
        .from('crop_cycles')
        .select('*')
        .eq('bloc_id', blocId)

      if (cycleError) {
        console.warn('⚠️ Error fetching crop cycles for bloc:', cycleError)
        return { ...blocData, crop_cycles: [] }
      }

      return { ...blocData, crop_cycles: cropCycles || [] }
    } catch (error) {
      console.error('Failed to fetch bloc with crop cycle:', error)
      throw error
    }
  }
  
  /**
   * Update bloc status
   */
  static async updateBlocStatus(blocId: string, status: 'active' | 'retired'): Promise<void> {
    try {
      const { error } = await supabase
        .from('blocs')
        .update({ 
          status, 
          updated_at: new Date().toISOString(),
          retired_date: status === 'retired' ? new Date().toISOString() : null
        })
        .eq('id', blocId)
      
      if (error) throw error
    } catch (error) {
      console.error('Failed to update bloc status:', error)
      throw error
    }
  }
  
  /**
   * Delete a bloc
   */
  static async deleteBloc(blocId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('blocs')
        .delete()
        .eq('id', blocId)
      
      if (error) throw error
    } catch (error) {
      console.error('Failed to delete bloc:', error)
      throw error
    }
  }
  
  /**
   * Convert database bloc to drawn area format for map display
   */
  static convertBlocToDrawnArea(bloc: any): DrawnArea {
    console.log('🔍 Converting database bloc to drawn area:', {
      databaseUuid: bloc.id,
      name: bloc.name,
      coordinates_wkt: bloc.coordinates_wkt,
      area_hectares: bloc.area_hectares
    })

    // Use the utility function to create from database bloc
    return DrawnAreaUtils.fromDatabaseBloc(bloc)
  }
}
