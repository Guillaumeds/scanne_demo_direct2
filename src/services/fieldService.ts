/**
 * Field Service - Database operations for fields
 */

import { supabase } from '@/lib/supabase'
import { FieldData } from '@/types/field'

/**
 * Convert database field to FieldData format
 * Handles PostGIS GEOMETRY(POLYGON, 4326) format
 */
function convertDatabaseFieldToFieldData(dbField: any): FieldData {
  // Parse PostGIS WKT format to coordinates array
  let coordinates: [number, number][] = []

  // Use the WKT format from ST_AsText()
  const wktString = dbField.coordinates_wkt

  if (wktString) {
    try {
      console.log('🔍 Processing WKT for field', dbField.field_id)
      console.log('🔍 WKT string:', wktString.substring(0, 100) + '...')

      // Handle WKT format: POLYGON((lng lat,lng lat,...))
      let coordString = wktString

      // Remove POLYGON(( and )) wrapper
      if (coordString.startsWith('POLYGON((') && coordString.endsWith('))')) {
        coordString = coordString.slice(9, -2) // Remove "POLYGON((" and "))"
        console.log('🔍 Extracted coordinate string:', coordString.substring(0, 100) + '...')
      }

      // Split by comma to get individual coordinate pairs
      const coordPairs = coordString.split(',')
      console.log('🔍 Found', coordPairs.length, 'coordinate pairs')

      coordinates = coordPairs
        .map((pair: string) => {
          // Each pair is "lng lat" format from PostGIS
          const cleanPair = pair.trim()
          const [lng, lat] = cleanPair.split(' ').map(Number)

          if (isNaN(lng) || isNaN(lat)) {
            console.error('❌ Invalid coordinate pair:', cleanPair)
            return null
          }

          // Return as [lng, lat] for internal use (GeoJSON format)
          return [lng, lat] as [number, number]
        })
        .filter(coord => coord !== null) as [number, number][]

      if (coordinates && coordinates.length > 0) {
        console.log('✅ Successfully parsed', coordinates.length, 'coordinate points for field', dbField.field_id)
        console.log('🔍 First coordinate:', coordinates[0])
        console.log('🔍 Last coordinate:', coordinates[coordinates.length - 1])
      } else {
        console.error('❌ No valid coordinates found for field', dbField.field_id)
      }

    } catch (error) {
      console.error('❌ Error parsing WKT coordinates for field:', dbField.field_id, error)
      coordinates = []
    }
  } else {
    console.log('⚠️ No WKT coordinates found for field', dbField.field_id)
  }

  return {
    field_id: dbField.field_id,
    field_name: dbField.field_name,
    coordinates,
    area_hectares: dbField.area_hectares || 0,
    crop_type: 'Sugarcane', // Default for now, will be determined by active crop cycles
    status: dbField.status === 'active' ? 'Active' : 'Inactive',
    osm_id: dbField.osm_id
  }
}

/**
 * Load all active fields from database
 */
export async function loadFieldsFromDatabase(farmId?: string): Promise<FieldData[]> {
  try {
    console.log('🔄 Loading fields from database...')
    
    // Use RPC function to get fields with WKT coordinates
    let data, error

    if (farmId) {
      // Get fields for specific farm
      const result = await supabase.rpc('get_farm_fields_with_wkt', { farm_uuid: farmId })
      data = result.data
      error = result.error
    } else {
      // Get all active fields
      const result = await supabase.rpc('get_fields_with_wkt')
      data = result.data
      error = result.error
    }

    if (error) {
      console.error('❌ Database error loading fields:', error)
      throw error
    }

    if (!data || data.length === 0) {
      console.log('⚠️  No fields found in database')
      return []
    }

    console.log(`✅ Loaded ${data.length} fields from database`)
    
    // Convert database format to FieldData format
    const fieldData = data.map(convertDatabaseFieldToFieldData)
    
    console.log('📊 Sample field data:', fieldData[0])
    
    return fieldData
  } catch (error) {
    console.error('❌ Error loading fields from database:', error)
    throw error
  }
}

/**
 * Load fields for a specific farm (Belle Vue Estate by default)
 */
export async function loadBelleVueFields(): Promise<FieldData[]> {
  const BELLE_VUE_FARM_ID = '550e8400-e29b-41d4-a716-446655440001'
  return loadFieldsFromDatabase(BELLE_VUE_FARM_ID)
}

/**
 * Get field count by status
 */
export async function getFieldStats(farmId?: string) {
  try {
    let query = supabase
      .from('fields')
      .select('status', { count: 'exact' })

    if (farmId) {
      query = query.eq('farm_id', farmId)
    }

    const { data, error, count } = await query

    if (error) throw error

    const stats = {
      total: count || 0,
      active: 0,
      inactive: 0
    }

    if (data) {
      stats.active = data.filter(f => f.status === 'active').length
      stats.inactive = data.filter(f => f.status !== 'active').length
    }

    return stats
  } catch (error) {
    console.error('Error getting field stats:', error)
    return { total: 0, active: 0, inactive: 0 }
  }
}

/**
 * Import fields from CSV data
 */
export async function importFieldsFromCSV(csvData: any[], farmId: string): Promise<{ success: number, errors: string[] }> {
  const results = { success: 0, errors: [] as string[] }
  
  try {
    // Process CSV data
    const fieldRecords = []
    
    for (const row of csvData) {
      try {
        // Parse WKT POLYGON
        const coordString = row.wkt.replace(/^POLYGON\(\(/, '').replace(/\)\)$/, '')
        const coordinates = coordString
          .split(', ')
          .map((coord: string) => {
            const [lng, lat] = coord.trim().split(' ').map(Number)
            return [lng, lat]
          })
        
        // Convert to PostGIS format - ensure polygon is closed by repeating first coordinate
        const coordsWithClosure = [...coordinates]
        if (coordinates.length > 0 &&
            (coordinates[0][0] !== coordinates[coordinates.length - 1][0] ||
             coordinates[0][1] !== coordinates[coordinates.length - 1][1])) {
          coordsWithClosure.push(coordinates[0]) // Close the polygon
        }
        // Use the same format as admin-database.ts - ensure proper spacing between coordinates
        const postGISCoords = `POLYGON((${coordsWithClosure.map(([lng, lat]) => `${lng} ${lat}`).join(', ')}))`

        // Debug: log the first few coordinates to check format
        if (fieldRecords.length < 3) {
          console.log(`🔍 Field ${row.id} WKT:`, postGISCoords.substring(0, 100) + '...')
        }
        
        // Generate field name
        const match = row.id.match(/FLD(\d+)/)
        const fieldName = match ? `Field ${parseInt(match[1], 10)}` : row.id
        
        const fieldRecord = {
          field_id: row.id,
          field_name: fieldName,
          coordinates: postGISCoords,
          area_hectares: 0, // Will be calculated by DB trigger
          status: 'active',
          osm_id: parseInt(row.osm_id, 10),
          farm_id: farmId
        }
        
        fieldRecords.push(fieldRecord)
      } catch (error) {
        results.errors.push(`Error processing field ${row.id}: ${error}`)
      }
    }
    
    // Check for existing fields
    const fieldIds = fieldRecords.map(f => f.field_id)
    const { data: existingFields } = await supabase
      .from('fields')
      .select('field_id')
      .in('field_id', fieldIds)
    
    const existingFieldIds = new Set(existingFields?.map(f => f.field_id) || [])
    const newFields = fieldRecords.filter(f => !existingFieldIds.has(f.field_id))
    
    if (newFields.length === 0) {
      results.errors.push('No new fields to import (all fields already exist)')
      return results
    }
    
    // Insert fields using SQL with ST_GeomFromText function
    for (let i = 0; i < newFields.length; i++) {
      const field = newFields[i]

      try {
        // Use raw SQL to insert with PostGIS function
        const { data, error } = await supabase.rpc('exec_sql', {
          sql: `
            INSERT INTO fields (field_id, field_name, coordinates, area_hectares, status, osm_id, farm_id)
            VALUES ($1, $2, ST_GeomFromText($3, 4326), $4, $5, $6, $7)
            RETURNING field_id
          `,
          params: [
            field.field_id,
            field.field_name,
            field.coordinates,
            field.area_hectares,
            field.status,
            field.osm_id,
            field.farm_id
          ]
        })

        if (error) {
          results.errors.push(`Field ${field.field_id}: ${error.message}`)
          console.error(`❌ Failed to insert field ${field.field_id}:`, error)
        } else {
          results.success += 1
          if (results.success % 10 === 0) {
            console.log(`✅ Inserted ${results.success} fields so far...`)
          }
        }
      } catch (error) {
        results.errors.push(`Field ${field.field_id}: ${error}`)
        console.error(`❌ Exception inserting field ${field.field_id}:`, error)
      }
    }
    
    return results
  } catch (error) {
    results.errors.push(`Import failed: ${error}`)
    return results
  }
}

/**
 * Check if database has any fields
 */
export async function hasFieldsInDatabase(): Promise<boolean> {
  try {
    const { count, error } = await supabase
      .from('fields')
      .select('*', { count: 'exact', head: true })
      .limit(1)
    
    if (error) throw error
    return (count || 0) > 0
  } catch (error) {
    console.error('Error checking for fields in database:', error)
    return false
  }
}
