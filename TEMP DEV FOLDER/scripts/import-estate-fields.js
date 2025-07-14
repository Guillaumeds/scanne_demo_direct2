/**
 * Import Estate Fields from CSV to Database
 *
 * This script reads the estate_fields.csv file and imports the field data
 * into the Supabase database, associating them with the Belle Vue Estate farm.
 */

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')
const csv = require('csv-parser')
require('dotenv').config({ path: '.env.local' })

// Database configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'your-supabase-url'
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-key'

const supabase = createClient(supabaseUrl, supabaseKey)

// Constants
const BELLE_VUE_FARM_ID = '550e8400-e29b-41d4-a716-446655440001'

// Type definitions (for documentation)
// CSVRow: { id: string, wkt: string, osm_id: string }
// FieldRecord: { field_id: string, field_name: string, coordinates: string, area_hectares: number, status: string, osm_id: number, farm_id: string }

/**
 * Parse WKT POLYGON to extract coordinates
 */
function parseWKTPolygon(wkt) {
  // Remove POLYGON(( and )) from the WKT string
  const coordString = wkt.replace(/^POLYGON\(\(/, '').replace(/\)\)$/, '')

  // Split coordinates and parse
  const coordinates = coordString
    .split(', ')
    .map(coord => {
      const [lng, lat] = coord.trim().split(' ').map(Number)
      return [lng, lat]
    })

  return coordinates
}



/**
 * Convert coordinates to PostGIS POLYGON format
 */
function coordinatesToPostGIS(coordinates) {
  const coordString = coordinates
    .map(([lng, lat]) => `${lng} ${lat}`)
    .join(',')

  return `POLYGON((${coordString}))`
}

/**
 * Generate a readable field name from field ID
 */
function generateFieldName(fieldId) {
  // Extract number from field ID (e.g., FLD00022 -> 22)
  const match = fieldId.match(/FLD(\d+)/)
  if (match) {
    const number = parseInt(match[1], 10)
    return `Field ${number}`
  }
  return fieldId
}

/**
 * Read and parse CSV file
 */
async function readCSVFile(filePath) {
  return new Promise((resolve, reject) => {
    const results = []

    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', reject)
  })
}

/**
 * Process CSV data and convert to field records
 */
function processCSVData(csvData) {
  const fieldRecords = []

  for (const row of csvData) {
    try {
      const coordinates = parseWKTPolygon(row.wkt)
      const postGISCoords = coordinatesToPostGIS(coordinates)

      const fieldRecord = {
        field_id: row.id,
        field_name: generateFieldName(row.id),
        coordinates: postGISCoords,
        area_hectares: 0, // Will be calculated by DB trigger
        status: 'active',
        osm_id: parseInt(row.osm_id, 10),
        farm_id: BELLE_VUE_FARM_ID
      }

      fieldRecords.push(fieldRecord)
    } catch (error) {
      console.error(`Error processing field ${row.id}:`, error)
    }
  }

  return fieldRecords
}

/**
 * Insert field records into database
 */
async function insertFields(fieldRecords) {
  console.log(`Inserting ${fieldRecords.length} fields into database...`)
  
  // Insert in batches to avoid overwhelming the database
  const batchSize = 50
  let inserted = 0
  
  for (let i = 0; i < fieldRecords.length; i += batchSize) {
    const batch = fieldRecords.slice(i, i + batchSize)
    
    const { data, error } = await supabase
      .from('fields')
      .insert(batch)
      .select('field_id')
    
    if (error) {
      console.error(`Error inserting batch ${Math.floor(i / batchSize) + 1}:`, error)
      throw error
    }
    
    inserted += data?.length || 0
    console.log(`Inserted batch ${Math.floor(i / batchSize) + 1}: ${data?.length || 0} fields`)
  }
  
  console.log(`✅ Successfully inserted ${inserted} fields`)
}

/**
 * Verify farm exists
 */
async function verifyFarm() {
  const { data, error } = await supabase
    .from('farms')
    .select('id, name')
    .eq('id', BELLE_VUE_FARM_ID)
    .single()
  
  if (error || !data) {
    throw new Error(`Farm with ID ${BELLE_VUE_FARM_ID} not found. Please ensure the farm exists in the database.`)
  }
  
  console.log(`✅ Found farm: ${data.name}`)
}

/**
 * Check for existing fields to avoid duplicates
 */
async function checkExistingFields(fieldRecords) {
  const fieldIds = fieldRecords.map(f => f.field_id)
  
  const { data: existingFields, error } = await supabase
    .from('fields')
    .select('field_id')
    .in('field_id', fieldIds)
  
  if (error) {
    console.error('Error checking existing fields:', error)
    throw error
  }
  
  const existingFieldIds = new Set(existingFields?.map(f => f.field_id) || [])
  const newFields = fieldRecords.filter(f => !existingFieldIds.has(f.field_id))
  
  if (existingFieldIds.size > 0) {
    console.log(`⚠️  Found ${existingFieldIds.size} existing fields, skipping duplicates`)
  }
  
  return newFields
}

/**
 * Main function
 */
async function main() {
  try {
    console.log('🚀 Starting estate fields import...')
    
    // Verify environment variables
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing required environment variables: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY')
    }
    
    // Verify farm exists
    await verifyFarm()
    
    // Read CSV file
    const csvPath = path.join(process.cwd(), 'estate_fields.csv')
    console.log(`📖 Reading CSV file: ${csvPath}`)
    
    if (!fs.existsSync(csvPath)) {
      throw new Error(`CSV file not found: ${csvPath}`)
    }
    
    const csvData = await readCSVFile(csvPath)
    console.log(`📊 Loaded ${csvData.length} records from CSV`)
    
    // Process data
    console.log('🔄 Processing field data...')
    const fieldRecords = processCSVData(csvData)
    console.log(`✅ Processed ${fieldRecords.length} field records`)
    
    // Check for existing fields
    const newFields = await checkExistingFields(fieldRecords)
    
    if (newFields.length === 0) {
      console.log('ℹ️  No new fields to insert')
      return
    }
    
    // Insert into database
    await insertFields(newFields)
    
    console.log('🎉 Import completed successfully!')
    
  } catch (error) {
    console.error('❌ Import failed:', error)
    process.exit(1)
  }
}

// Run the script
if (require.main === module) {
  main()
}
