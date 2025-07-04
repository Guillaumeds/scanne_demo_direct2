/**
 * 🗑️ Clear All Bloc Data for Testing
 * 
 * This script safely removes all bloc-related data from the database
 * Run this from your development environment
 * 
 * Usage:
 * npx ts-node scripts/clearBlocData.ts
 * 
 * Or add to package.json scripts:
 * "clear-blocs": "ts-node scripts/clearBlocData.ts"
 */

import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

async function clearBlocData() {
  console.log('🗑️ Starting bloc data cleanup...')
  console.log('⚠️  WARNING: This will delete ALL bloc-related data!')
  
  try {
    // Step 1: Count existing data
    const { data: blocsCount } = await supabase.from('blocs').select('id', { count: 'exact', head: true })
    const { data: cyclesCount } = await supabase.from('crop_cycles').select('id', { count: 'exact', head: true })
    const { data: activitiesCount } = await supabase.from('activities').select('id', { count: 'exact', head: true })
    const { data: observationsCount } = await supabase.from('observations').select('id', { count: 'exact', head: true })
    const { data: attachmentsCount } = await supabase.from('attachments').select('id', { count: 'exact', head: true })
    
    console.log('📊 Current data counts:')
    console.log(`   Blocs: ${blocsCount?.length || 0}`)
    console.log(`   Crop Cycles: ${cyclesCount?.length || 0}`)
    console.log(`   Activities: ${activitiesCount?.length || 0}`)
    console.log(`   Observations: ${observationsCount?.length || 0}`)
    console.log(`   Attachments: ${attachmentsCount?.length || 0}`)
    
    if ((blocsCount?.length || 0) === 0) {
      console.log('✅ No bloc data found - database is already clean!')
      return
    }
    
    // Step 2: Delete in correct order (respecting foreign key constraints)
    console.log('\n🗑️ Deleting data in safe order...')
    
    // Delete attachments first (references activities/observations)
    const { error: attachmentsError } = await supabase
      .from('attachments')
      .delete()
      .neq('id', 'impossible-id') // Delete all
    
    if (attachmentsError) {
      console.error('❌ Error deleting attachments:', attachmentsError)
      return
    }
    console.log('✅ Deleted all attachments')
    
    // Delete observations (references crop_cycles)
    const { error: observationsError } = await supabase
      .from('observations')
      .delete()
      .neq('id', 'impossible-id') // Delete all
    
    if (observationsError) {
      console.error('❌ Error deleting observations:', observationsError)
      return
    }
    console.log('✅ Deleted all observations')
    
    // Delete activities (references crop_cycles)
    const { error: activitiesError } = await supabase
      .from('activities')
      .delete()
      .neq('id', 'impossible-id') // Delete all
    
    if (activitiesError) {
      console.error('❌ Error deleting activities:', activitiesError)
      return
    }
    console.log('✅ Deleted all activities')
    
    // Delete crop cycles (references blocs)
    const { error: cyclesError } = await supabase
      .from('crop_cycles')
      .delete()
      .neq('id', 'impossible-id') // Delete all
    
    if (cyclesError) {
      console.error('❌ Error deleting crop cycles:', cyclesError)
      return
    }
    console.log('✅ Deleted all crop cycles')
    
    // Delete blocs (main table)
    const { error: blocsError } = await supabase
      .from('blocs')
      .delete()
      .neq('id', 'impossible-id') // Delete all
    
    if (blocsError) {
      console.error('❌ Error deleting blocs:', blocsError)
      return
    }
    console.log('✅ Deleted all blocs')
    
    // Step 3: Verify cleanup
    console.log('\n🔍 Verifying cleanup...')
    
    const { data: remainingBlocs } = await supabase.from('blocs').select('id', { count: 'exact', head: true })
    const { data: remainingCycles } = await supabase.from('crop_cycles').select('id', { count: 'exact', head: true })
    const { data: remainingActivities } = await supabase.from('activities').select('id', { count: 'exact', head: true })
    const { data: remainingObservations } = await supabase.from('observations').select('id', { count: 'exact', head: true })
    const { data: remainingAttachments } = await supabase.from('attachments').select('id', { count: 'exact', head: true })
    
    console.log('📊 Remaining data counts:')
    console.log(`   Blocs: ${remainingBlocs?.length || 0}`)
    console.log(`   Crop Cycles: ${remainingCycles?.length || 0}`)
    console.log(`   Activities: ${remainingActivities?.length || 0}`)
    console.log(`   Observations: ${remainingObservations?.length || 0}`)
    console.log(`   Attachments: ${remainingAttachments?.length || 0}`)
    
    const totalRemaining = (remainingBlocs?.length || 0) + 
                          (remainingCycles?.length || 0) + 
                          (remainingActivities?.length || 0) + 
                          (remainingObservations?.length || 0) + 
                          (remainingAttachments?.length || 0)
    
    if (totalRemaining === 0) {
      console.log('\n🎉 SUCCESS: All bloc data has been cleared!')
      console.log('🧪 Database is ready for testing')
    } else {
      console.log('\n⚠️  WARNING: Some data may still remain')
    }
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error)
  }
}

// Run the cleanup
if (require.main === module) {
  clearBlocData()
    .then(() => {
      console.log('\n✅ Cleanup script completed')
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ Cleanup script failed:', error)
      process.exit(1)
    })
}

export { clearBlocData }
