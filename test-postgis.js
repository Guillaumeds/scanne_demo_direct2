// Test PostGIS extension in local Supabase
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'http://127.0.0.1:54321'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testPostGIS() {
  try {
    console.log('🧪 Testing PostGIS extension...')
    
    // Test 1: Check if PostGIS extension is installed
    const { data: extensions, error: extError } = await supabase
      .from('pg_extension')
      .select('extname')
      .eq('extname', 'postgis')
    
    if (extError) {
      console.log('⚠️  Could not query extensions (this is normal):', extError.message)
    } else {
      console.log('✅ PostGIS extension query result:', extensions)
    }
    
    // Test 2: Try to use a PostGIS function
    const { data: versionData, error: versionError } = await supabase
      .rpc('postgis_version')
    
    if (versionError) {
      console.log('❌ PostGIS not available:', versionError.message)
      return false
    } else {
      console.log('✅ PostGIS version:', versionData)
    }
    
    // Test 3: Try to query fields with spatial functions
    const { data: fieldsData, error: fieldsError } = await supabase
      .from('fields')
      .select('field_id, ST_AsText(coordinates) as wkt')
      .limit(1)
    
    if (fieldsError) {
      console.log('❌ Error querying fields with ST_AsText:', fieldsError.message)
      return false
    } else {
      console.log('✅ Successfully queried fields with PostGIS functions:', fieldsData)
    }
    
    return true
    
  } catch (error) {
    console.error('❌ PostGIS test failed:', error)
    return false
  }
}

testPostGIS().then(success => {
  if (success) {
    console.log('🎉 PostGIS is working correctly!')
  } else {
    console.log('💥 PostGIS is not working properly')
  }
  process.exit(success ? 0 : 1)
})
