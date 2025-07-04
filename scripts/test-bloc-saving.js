const { createClient } = require('@supabase/supabase-js')

// Local Supabase configuration
const supabaseUrl = 'http://127.0.0.1:54321'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testBlocSaving() {
  console.log('🧪 Testing bloc saving without field_id...')

  try {
    // Test data - simple polygon
    const testBloc = {
      name: 'Test Bloc 001',
      description: 'Test bloc created from script',
      coordinates: 'POLYGON((-20.436777653866045 57.647411541519304, -20.43919089 57.652482629314875, -20.43677765 57.647411541519304, -20.436777653866045 57.647411541519304))',
      area_hectares: 1.5,
      status: 'active'
    }

    console.log('📤 Inserting bloc directly into table...')
    
    const { data, error } = await supabase
      .from('blocs')
      .insert(testBloc)
      .select()
      .single()

    if (error) {
      console.error('❌ Direct insert failed:', error)
    } else {
      console.log('✅ Direct insert successful!')
      console.log('📊 Result:', data)
    }

    // Test the RPC function as well
    console.log('\n📤 Testing RPC function...')
    
    const { data: rpcData, error: rpcError } = await supabase.rpc('insert_bloc_with_geometry', {
      bloc_name: 'Test Bloc RPC 001',
      bloc_description: 'Test bloc created via RPC',
      polygon_wkt: 'POLYGON((-20.436777653866045 57.647411541519304, -20.43919089 57.652482629314875, -20.43677765 57.647411541519304, -20.436777653866045 57.647411541519304))',
      bloc_area_hectares: 2.0,
      bloc_status: 'active'
    })

    if (rpcError) {
      console.error('❌ RPC function failed:', rpcError)
    } else {
      console.log('✅ RPC function successful!')
      console.log('📊 Result:', rpcData)
    }

    // List all blocs
    console.log('\n📋 Listing all blocs...')
    const { data: allBlocs, error: listError } = await supabase
      .from('blocs')
      .select('*')

    if (listError) {
      console.error('❌ Error listing blocs:', listError)
    } else {
      console.log('✅ All blocs:', allBlocs)
    }

  } catch (error) {
    console.error('❌ Test error:', error)
  }
}

// Run the test
testBlocSaving()
