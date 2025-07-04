const { createClient } = require('@supabase/supabase-js')

// Local Supabase configuration
const supabaseUrl = 'http://127.0.0.1:54321'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

const supabase = createClient(supabaseUrl, supabaseKey)

async function createBlocFunction() {
  console.log('🔧 Checking available functions...')

  try {
    // First, let's check what functions are available
    const { data: availableFunctions, error: listError } = await supabase
      .from('information_schema.routines')
      .select('routine_name')
      .eq('routine_schema', 'public')

    if (listError) {
      console.log('❌ Error listing functions:', listError)
    } else {
      console.log('📋 Available functions:', availableFunctions)
    }

    // Check if the function already exists
    const { data: existingFunction, error: checkError } = await supabase
      .from('information_schema.routines')
      .select('routine_name')
      .eq('routine_name', 'insert_bloc_with_geometry')
      .eq('routine_schema', 'public')

    if (checkError) {
      console.log('❌ Error checking function:', checkError)
    } else {
      console.log('🔍 insert_bloc_with_geometry exists:', existingFunction?.length > 0)
    }

    // Check if blocs table exists
    const { data: tables, error: tableError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_name', 'blocs')
      .eq('table_schema', 'public')

    if (tableError) {
      console.log('❌ Error checking tables:', tableError)
    } else {
      console.log('🗄️ blocs table exists:', tables?.length > 0)
    }

  } catch (error) {
    console.error('❌ Error:', error)
  }
}

// Run the function creation
createBlocFunction()
