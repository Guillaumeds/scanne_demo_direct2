const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
require('dotenv').config({ path: '.env.local' })

// Configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const BELLE_VUE_FARM_ID = '550e8400-e29b-41d4-a716-446655440001'

console.log('🚀 Starting simple field import...')

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

// Parse WKT to coordinates
function parseWKT(wkt) {
  const coordString = wkt.replace(/^POLYGON\(\(/, '').replace(/\)\)$/, '')
  return coordString.split(', ').map(coord => {
    const [lng, lat] = coord.trim().split(' ').map(Number)
    return [lng, lat]
  })
}

// Convert to PostGIS format
function toPostGIS(coordinates) {
  const coordString = coordinates.map(([lng, lat]) => `${lng} ${lat}`).join(',')
  return `POLYGON((${coordString}))`
}

// Generate field name
function generateFieldName(fieldId) {
  const match = fieldId.match(/FLD(\d+)/)
  if (match) {
    const number = parseInt(match[1], 10)
    return `Field ${number}`
  }
  return fieldId
}

async function main() {
  try {
    // Test connection
    console.log('🔗 Testing database connection...')
    const { data: farmData, error: farmError } = await supabase
      .from('farms')
      .select('id, name')
      .eq('id', BELLE_VUE_FARM_ID)
      .single()
    
    if (farmError) {
      console.error('❌ Farm not found:', farmError)
      return
    }
    
    console.log('✅ Found farm:', farmData.name)
    
    // Read CSV file
    console.log('📖 Reading CSV file...')
    const csvContent = fs.readFileSync('estate_fields.csv', 'utf8')
    const lines = csvContent.trim().split('\n')
    const headers = lines[0].split(',')
    
    console.log('📊 CSV headers:', headers)
    console.log('📊 Total rows:', lines.length - 1)
    
    // Process first few rows as test
    const testRows = lines.slice(1, 6) // First 5 rows
    const fieldRecords = []
    
    for (const line of testRows) {
      const values = line.split(',')
      const row = {}
      headers.forEach((header, index) => {
        row[header] = values[index]?.replace(/^"|"$/g, '') // Remove quotes
      })
      
      try {
        const coordinates = parseWKT(row.wkt)
        const postGISCoords = toPostGIS(coordinates)
        
        const fieldRecord = {
          field_id: row.id,
          field_name: generateFieldName(row.id),
          coordinates: postGISCoords,
          area_hectares: 0, // Will be calculated by DB
          status: 'active',
          osm_id: parseInt(row.osm_id, 10),
          farm_id: BELLE_VUE_FARM_ID
        }
        
        fieldRecords.push(fieldRecord)
        console.log('✅ Processed field:', row.id)
      } catch (error) {
        console.error('❌ Error processing field:', row.id, error.message)
      }
    }
    
    console.log(`🔄 Inserting ${fieldRecords.length} test fields...`)
    
    // Insert fields
    const { data, error } = await supabase
      .from('fields')
      .insert(fieldRecords)
      .select('field_id')
    
    if (error) {
      console.error('❌ Insert error:', error)
      return
    }
    
    console.log('🎉 Successfully inserted fields:', data?.map(f => f.field_id))
    
  } catch (error) {
    console.error('❌ Script error:', error)
  }
}

main()
