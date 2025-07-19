/**
 * Demo Mode Detection and Configuration
 * Community best practice: Centralized demo mode detection
 */

// Demo mode detection strategies (in order of preference)
export const isDemoMode = (): boolean => {
  // 1. Explicit environment variable
  if (process.env.NEXT_PUBLIC_DEMO_MODE === 'true') {
    return true
  }
  
  // 2. Development environment default
  if (process.env.NODE_ENV === 'development') {
    return true
  }
  
  // 3. No database URL configured
  if (!process.env.DATABASE_URL && !process.env.SUPABASE_URL) {
    return true
  }
  
  // 4. Localhost detection
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    return true
  }
  
  return false
}

// Demo configuration
export const demoConfig = {
  // Performance optimizations for demos
  enableCaching: true,
  instantResponses: true,
  skipValidation: false,
  
  // Demo data settings
  autoSeedData: true,
  persistToLocalStorage: true,
  
  // UI indicators
  showDemoIndicator: true,
  allowDataReset: true,
} as const

// Demo mode logging
export const logDemoMode = () => {
  if (isDemoMode()) {
    console.log('🎭 Demo Mode Active:', {
      reason: getDemoModeReason(),
      config: demoConfig
    })
  }
}

// Get the reason why demo mode is active (for debugging)
export const getDemoModeReason = (): string => {
  if (process.env.NEXT_PUBLIC_DEMO_MODE === 'true') return 'EXPLICIT_ENV_VAR'
  if (process.env.NODE_ENV === 'development') return 'DEVELOPMENT_ENV'
  if (!process.env.DATABASE_URL && !process.env.SUPABASE_URL) return 'NO_DATABASE_CONFIG'
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') return 'LOCALHOST'
  return 'UNKNOWN'
}

// Type for demo mode context
export interface DemoModeContext {
  isDemo: boolean
  config: typeof demoConfig
  reason?: string
}

export const getDemoModeContext = (): DemoModeContext => ({
  isDemo: isDemoMode(),
  config: demoConfig,
  reason: isDemoMode() ? getDemoModeReason() : undefined
})
