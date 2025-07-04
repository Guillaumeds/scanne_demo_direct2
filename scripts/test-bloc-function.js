const { createClient } = require('@supabase/supabase-js')

// Local Supabase configuration
const supabaseUrl = 'http://127.0.0.1:54321'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testBlocFunction() {
  console.log('🧪 Testing insert_bloc_with_geometry function...')

  try {
    // Test data
    const testData = {
      bloc_id: '123e4567-e89b-12d3-a456-426614174000',
      bloc_name: 'Test Bloc',
      bloc_description: 'Test bloc description',
      polygon_wkt: 'POLYGON((-20.436777653866045 57.647411541519304, -20.43919089 57.652482629314875, -20.43677765 57.647411541519304, -20.436777653866045 57.647411541519304))',
      bloc_area_hectares: 1.5,
      bloc_field_id: '123e4567-e89b-12d3-a456-426614174001',
      bloc_status: 'active'
    }

    console.log('📤 Calling function with test data...')
    
    const { data, error } = await supabase.rpc('insert_bloc_with_geometry', testData)

    if (error) {
      console.error('❌ Function call failed:', error)
    } else {
      console.log('✅ Function call successful!')
      console.log('📊 Result:', data)
    }

  } catch (error) {
    console.error('❌ Test error:', error)
  }
}

// Run the test
testBlocFunction()
