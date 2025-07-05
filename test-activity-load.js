// Simple test script to verify activity loading with products/resources
// Run this in the browser console to test the fix

async function testActivityLoad() {
  console.log('🧪 Testing activity loading with products/resources...')
  
  try {
    // Get the ActivityService from the global scope (if available)
    if (typeof window !== 'undefined' && window.ActivityService) {
      const ActivityService = window.ActivityService
      
      // Try to get activities for a cycle
      console.log('📋 Loading activities...')
      const activities = await ActivityService.getActivitiesForCycle('some-cycle-id')
      console.log('✅ Activities loaded:', activities)
      
      // Check if any activity has products or resources
      const activityWithData = activities.find(a => a.products?.length > 0 || a.resources?.length > 0)
      if (activityWithData) {
        console.log('🎯 Found activity with products/resources:', activityWithData)
        console.log('📦 Products:', activityWithData.products)
        console.log('🔧 Resources:', activityWithData.resources)
      } else {
        console.log('⚠️ No activities found with products/resources')
      }
      
    } else {
      console.log('❌ ActivityService not available in global scope')
      console.log('💡 Try running this in the browser console on the app page')
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

// Auto-run if in browser
if (typeof window !== 'undefined') {
  testActivityLoad()
} else {
  console.log('📝 Copy this script and run it in the browser console')
}
