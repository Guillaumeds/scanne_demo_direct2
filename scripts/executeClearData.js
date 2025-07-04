/**
 * 🗑️ Execute Clear Data SQL Script
 * 
 * This script executes the comprehensive data clearing SQL
 * using your existing Supabase connection
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables')
  console.error('   Make sure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function executeClearDataSQL() {
  console.log('🗑️ Starting comprehensive data cleanup...')
  console.log('⚠️  WARNING: This will delete ALL data tables while preserving configuration!')
  
  try {
    // Step 1: Show current data counts
    console.log('\n📊 Checking current data counts...')
    
    const tables = ['blocs', 'crop_cycles', 'activities', 'observations', 'attachments', 'products', 'resources']
    const beforeCounts = {}
    
    for (const table of tables) {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true })
      
      if (error) {
        console.log(`   ${table}: Error getting count`)
      } else {
        beforeCounts[table] = count || 0
        console.log(`   ${table}: ${count || 0} records`)
      }
    }
    
    // Step 2: Delete in safe order (respecting foreign key constraints)
    console.log('\n🗑️ Deleting data in safe order...')
    
    // Delete attachments first
    const { error: attachmentsError } = await supabase
      .from('attachments')
      .delete()
      .neq('id', 'impossible-id-that-never-exists')
    
    if (attachmentsError) {
      console.error('❌ Error deleting attachments:', attachmentsError.message)
    } else {
      console.log('✅ Deleted all attachments')
    }
    
    // Delete observations
    const { error: observationsError } = await supabase
      .from('observations')
      .delete()
      .neq('id', 'impossible-id-that-never-exists')
    
    if (observationsError) {
      console.error('❌ Error deleting observations:', observationsError.message)
    } else {
      console.log('✅ Deleted all observations')
    }
    
    // Delete activities
    const { error: activitiesError } = await supabase
      .from('activities')
      .delete()
      .neq('id', 'impossible-id-that-never-exists')
    
    if (activitiesError) {
      console.error('❌ Error deleting activities:', activitiesError.message)
    } else {
      console.log('✅ Deleted all activities')
    }
    
    // Delete crop cycles
    const { error: cyclesError } = await supabase
      .from('crop_cycles')
      .delete()
      .neq('id', 'impossible-id-that-never-exists')
    
    if (cyclesError) {
      console.error('❌ Error deleting crop cycles:', cyclesError.message)
    } else {
      console.log('✅ Deleted all crop cycles')
    }
    
    // Delete blocs
    const { error: blocsError } = await supabase
      .from('blocs')
      .delete()
      .neq('id', 'impossible-id-that-never-exists')
    
    if (blocsError) {
      console.error('❌ Error deleting blocs:', blocsError.message)
    } else {
      console.log('✅ Deleted all blocs')
    }
    
    // Delete products
    const { error: productsError } = await supabase
      .from('products')
      .delete()
      .neq('id', 'impossible-id-that-never-exists')
    
    if (productsError) {
      console.error('❌ Error deleting products:', productsError.message)
    } else {
      console.log('✅ Deleted all products')
    }
    
    // Delete resources
    const { error: resourcesError } = await supabase
      .from('resources')
      .delete()
      .neq('id', 'impossible-id-that-never-exists')
    
    if (resourcesError) {
      console.error('❌ Error deleting resources:', resourcesError.message)
    } else {
      console.log('✅ Deleted all resources')
    }
    
    // Step 3: Verify cleanup
    console.log('\n🔍 Verifying cleanup...')
    
    const afterCounts = {}
    let totalRemaining = 0
    
    for (const table of tables) {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true })
      
      if (error) {
        console.log(`   ${table}: Error getting count`)
      } else {
        afterCounts[table] = count || 0
        totalRemaining += count || 0
        console.log(`   ${table}: ${count || 0} records remaining`)
      }
    }
    
    // Step 4: Check configuration tables are preserved
    console.log('\n🛡️ Verifying configuration data is preserved...')
    
    const configTables = ['activity_types', 'observation_types', 'attachment_types']
    
    for (const table of configTables) {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true })
      
      if (error) {
        console.log(`   ${table}: Error getting count`)
      } else {
        console.log(`   ${table}: ${count || 0} config records preserved`)
      }
    }
    
    // Final result
    if (totalRemaining === 0) {
      console.log('\n🎉 SUCCESS: All data tables have been cleared!')
      console.log('🧪 Database is ready for testing')
      console.log('🛡️ Configuration data has been preserved')
    } else {
      console.log('\n⚠️  WARNING: Some data may still remain')
      console.log(`   Total remaining records: ${totalRemaining}`)
    }
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error.message)
    process.exit(1)
  }
}

// Execute the cleanup
executeClearDataSQL()
  .then(() => {
    console.log('\n✅ Cleanup script completed successfully')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Cleanup script failed:', error.message)
    process.exit(1)
  })
