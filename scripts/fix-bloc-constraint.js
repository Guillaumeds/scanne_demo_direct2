const { createClient } = require('@supabase/supabase-js')

// Local Supabase configuration
const supabaseUrl = 'http://127.0.0.1:54321'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

const supabase = createClient(supabaseUrl, supabaseKey)

async function fixBlocConstraint() {
  console.log('🔧 Temporarily making field_id nullable in blocs table...')

  try {
    // Use raw SQL to modify the constraint
    const { error } = await supabase.rpc('exec_sql', {
      sql: `
        -- Drop the foreign key constraint temporarily
        ALTER TABLE blocs DROP CONSTRAINT IF EXISTS blocs_field_id_fkey;
        
        -- Make field_id nullable
        ALTER TABLE blocs ALTER COLUMN field_id DROP NOT NULL;
        
        -- Add the foreign key constraint back but allow nulls
        ALTER TABLE blocs ADD CONSTRAINT blocs_field_id_fkey 
        FOREIGN KEY (field_id) REFERENCES fields(id) ON DELETE SET NULL;
      `
    })

    if (error) {
      console.error('❌ Error modifying constraint:', error)
      
      // Try alternative approach using direct SQL execution
      console.log('🔄 Trying alternative approach...')
      
      // Try to execute each statement separately
      const statements = [
        'ALTER TABLE blocs DROP CONSTRAINT IF EXISTS blocs_field_id_fkey;',
        'ALTER TABLE blocs ALTER COLUMN field_id DROP NOT NULL;',
        'ALTER TABLE blocs ADD CONSTRAINT blocs_field_id_fkey FOREIGN KEY (field_id) REFERENCES fields(id) ON DELETE SET NULL;'
      ]
      
      for (const sql of statements) {
        console.log(`Executing: ${sql}`)
        const { error: stmtError } = await supabase.rpc('exec_sql', { sql })
        if (stmtError) {
          console.error(`❌ Error with statement "${sql}":`, stmtError)
        } else {
          console.log(`✅ Success: ${sql}`)
        }
      }
      
      return
    }

    console.log('✅ Successfully modified blocs table constraints!')
    console.log('📝 field_id is now nullable and has proper foreign key constraint')

  } catch (error) {
    console.error('❌ Error:', error)
  }
}

// Run the function
fixBlocConstraint()
