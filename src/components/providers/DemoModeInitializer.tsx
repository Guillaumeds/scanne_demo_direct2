'use client'

/**
 * Demo Mode Initializer
 * Community best practice: Initialize demo mode and log configuration on app startup
 */

import { useEffect } from 'react'
import { logDemoMode, isDemoMode, getDemoModeContext } from '@/utils/demoMode'

export default function DemoModeInitializer() {
  useEffect(() => {
    // Initialize demo mode logging
    logDemoMode()
    
    // Initialize demo data if needed
    const initializeDemoData = async () => {
      if (isDemoMode()) {
        const context = getDemoModeContext()
        
        console.log('🎭 Demo Mode Context:', context)
        
        // Check if demo data needs to be seeded
        const hasInitialized = localStorage.getItem('demo-initialized')
        
        if (!hasInitialized && context.config.autoSeedData) {
          console.log('🌱 Seeding initial demo data...')
          
          try {
            // Import and initialize demo storage
            const { DemoStorage } = await import('@/services/demoStorage')
            await DemoStorage.initializeIfEmpty()
            
            localStorage.setItem('demo-initialized', 'true')
            localStorage.setItem('demo-initialized-timestamp', new Date().toISOString())
            
            console.log('✅ Demo data seeded successfully')
          } catch (error) {
            console.error('❌ Failed to seed demo data:', error)
          }
        }
        
        // Add demo mode indicator to document
        if (context.config.showDemoIndicator) {
          document.documentElement.setAttribute('data-demo-mode', 'true')
        }
      }
    }
    
    initializeDemoData()
  }, [])

  // This component doesn't render anything
  return null
}
