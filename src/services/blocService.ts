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
  static async saveDrawnAreaAsBloc(drawnArea: DrawnArea, farmId?: string): Promise<Bloc> {
    try {
      // Validate drawn area can be saved
      DrawnAreaUtils.validateForSave(drawnArea)

      // Prevent saving already saved areas
      if (drawnArea.isSaved && drawnArea.uuid) {
        console.warn('⚠️ Attempting to save already saved bloc:', drawnArea.localId)
        throw new Error(`Bloc "${drawnArea.localId}" is already saved to database`)
      }

      // Convert coordinates from DrawnArea format [lng, lat] to PostGIS WKT format
      // PostGIS WKT expects "longitude latitude" format with SRID 4326 for GPS coordinates

      // drawnArea.coordinates is in [lng, lat] format: [[lng, lat], [lng, lat], ...]
      // Convert to PostGIS format: "lng lat, lng lat, ..."
      const coordinatesString = drawnArea.coordinates
        .map(coord => `${coord[0]} ${coord[1]}`) // Use [lng, lat] directly as "lng lat"
        .join(', ')

      // Ensure polygon is properly closed by adding the first coordinate at the end
      const firstCoord = drawnArea.coordinates[0]
      const closingCoord = `${firstCoord[0]} ${firstCoord[1]}` // Keep same [lng, lat] format

      // Create WKT POLYGON string with proper SRID 4326 format
      const polygonWKT = `POLYGON((${coordinatesString}, ${closingCoord}))`

      // Validate farm_id is provided
      if (!farmId) {
        throw new Error('farm_id is required to save bloc')
      }

      // Insert bloc - submit localId as bloc.name, let DB generate UUID
      const { data, error } = await supabase
        .from('blocs')
        .insert({
          farm_id: farmId,
          name: drawnArea.localId, // Submit localId as bloc.name
          coordinates: polygonWKT, // PostGIS will handle the SRID
          area_hectares: drawnArea.area,
          status: 'active'
        })
        .select()
        .single()
      
      if (error) {
        console.error('Error saving bloc:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
          fullError: error
        })
        throw new Error(`Database error saving bloc: ${error.message || 'Unknown error'}`)
      }

      if (!data) {
        throw new Error('No data returned from bloc insertion')
      }

      return data // .single() returns the object directly
    } catch (error) {
      console.error('Failed to save drawn area as bloc:', {
        blocName: drawnArea.localId,
        errorMessage: (error as any)?.message,
        errorDetails: (error as any)?.details,
        fullError: error
      })
      throw error
    }
  }
  
  /**
   * Save multiple drawn areas as blocs
   */
  static async saveMultipleDrawnAreas(drawnAreas: DrawnArea[], farmId: string): Promise<Bloc[]> {
    try {
      const savedBlocs: Bloc[] = []

      for (const drawnArea of drawnAreas) {
        try {
          const bloc = await this.saveDrawnAreaAsBloc(drawnArea, farmId)
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
      // Fetching blocs from database

      // Use RPC function to get blocs with complete data including WKT coordinates
      const { data, error } = await supabase.rpc('get_blocs_with_wkt')

      // RPC blocs query completed

      if (error) throw error

      // Transform database records to DrawnArea format with new naming convention
      // Return raw database objects - transformation happens in calling code

      return data
    } catch (error) {
      console.error('Failed to fetch blocs:', error)
      return []
    }
  }

  /**
   * Get all farms for bloc creation
   */
  static async getFarms() {
    try {
      const { data, error } = await supabase
        .from('farms')
        .select('*')
        .order('created_at', { ascending: true })

      if (error) {
        console.error('❌ Error fetching farms:', error)
        throw error
      }

      // Farms loaded
      return data || []
    } catch (error) {
      console.error('❌ Error fetching farms:', error)
      return []
    }
  }

  /**
   * Get all companies for reference
   */
  static async getCompanies() {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .order('created_at', { ascending: true })

      if (error) {
        console.error('❌ Error fetching companies:', error)
        throw error
      }

      // Companies loaded
      return data || []
    } catch (error) {
      console.error('❌ Error fetching companies:', error)
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
