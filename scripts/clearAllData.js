/**
 * 🗑️ Clear All Data Tables Script
 * 
 * This script clears all data tables while preserving configuration
 * Executes directly via Supabase client
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables')
  console.error('   Make sure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function clearAllData() {
  console.log('🗑️ Starting comprehensive data cleanup...')
  console.log('⚠️  WARNING: This will delete ALL data tables while preserving configuration!')
  
  try {
    // Step 1: Show current data counts
    console.log('\n📊 Current data counts:')
    
    const tables = ['blocs', 'crop_cycles', 'activities', 'observations', 'attachments', 'products', 'resources']
    const beforeCounts = {}
    
    for (const table of tables) {
      try {
        const { count, error } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true })
        
        if (error) {
          console.log(`   ${table}: Error - ${error.message}`)
        } else {
          beforeCounts[table] = count || 0
          console.log(`   ${table}: ${count || 0} records`)
        }
      } catch (err) {
        console.log(`   ${table}: Table may not exist`)
      }
    }
    
    // Step 2: Delete in safe order (respecting foreign key constraints)
    console.log('\n🗑️ Deleting data in safe order...')
    
    const deletions = [
      { table: 'attachments', description: 'attachments' },
      { table: 'observations', description: 'observations' },
      { table: 'activities', description: 'activities' },
      { table: 'crop_cycles', description: 'crop cycles' },
      { table: 'blocs', description: 'blocs' },
      { table: 'products', description: 'products' },
      { table: 'resources', description: 'resources' }
    ]
    
    for (const { table, description } of deletions) {
      try {
        const { error } = await supabase
          .from(table)
          .delete()
          .neq('id', 'impossible-id-that-never-exists')
        
        if (error) {
          console.error(`❌ Error deleting ${description}: ${error.message}`)
        } else {
          console.log(`✅ Deleted all ${description}`)
        }
      } catch (err) {
        console.log(`⚠️  Table ${table} may not exist or is not accessible`)
      }
    }
    
    // Step 3: Try to delete user-created varieties (if tables exist)
    console.log('\n🌱 Clearing user-created varieties...')
    
    try {
      // Try to delete user-created sugarcane varieties
      const { error: sugarcaneError } = await supabase
        .from('sugarcane_varieties')
        .delete()
        .or('created_by_user.eq.true,created_by_user.is.null')
      
      if (sugarcaneError) {
        console.log(`⚠️  Sugarcane varieties: ${sugarcaneError.message}`)
      } else {
        console.log('✅ Cleared user-created sugarcane varieties')
      }
    } catch (err) {
      console.log('⚠️  Sugarcane varieties table may not exist')
    }
    
    try {
      // Try to delete user-created intercrop varieties
      const { error: intercropError } = await supabase
        .from('intercrop_varieties')
        .delete()
        .or('created_by_user.eq.true,created_by_user.is.null')
      
      if (intercropError) {
        console.log(`⚠️  Intercrop varieties: ${intercropError.message}`)
      } else {
        console.log('✅ Cleared user-created intercrop varieties')
      }
    } catch (err) {
      console.log('⚠️  Intercrop varieties table may not exist')
    }
    
    // Step 4: Verify cleanup
    console.log('\n🔍 Verifying cleanup...')
    
    let totalRemaining = 0
    
    for (const table of tables) {
      try {
        const { count, error } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true })
        
        if (error) {
          console.log(`   ${table}: Error getting count`)
        } else {
          totalRemaining += count || 0
          console.log(`   ${table}: ${count || 0} records remaining`)
        }
      } catch (err) {
        console.log(`   ${table}: Table may not exist`)
      }
    }
    
    // Step 5: Check configuration tables are preserved
    console.log('\n🛡️ Verifying configuration data is preserved...')
    
    const configTables = ['activity_types', 'observation_types', 'attachment_types']
    
    for (const table of configTables) {
      try {
        const { count, error } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true })
        
        if (error) {
          console.log(`   ${table}: Error getting count`)
        } else {
          console.log(`   ${table}: ${count || 0} config records preserved`)
        }
      } catch (err) {
        console.log(`   ${table}: Config table may not exist`)
      }
    }
    
    // Final result
    if (totalRemaining === 0) {
      console.log('\n🎉 SUCCESS: All data tables have been cleared!')
      console.log('🧪 Database is ready for testing')
      console.log('🛡️ Configuration data has been preserved')
    } else {
      console.log('\n⚠️  Some data may still remain')
      console.log(`   Total remaining records: ${totalRemaining}`)
    }
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error.message)
    process.exit(1)
  }
}

// Execute the cleanup
if (require.main === module) {
  clearAllData()
    .then(() => {
      console.log('\n✅ Cleanup script completed successfully')
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ Cleanup script failed:', error.message)
      process.exit(1)
    })
}

module.exports = { clearAllData }
