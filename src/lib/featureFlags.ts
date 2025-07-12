/**
 * Feature Flags for Gradual UI Migration
 * 
 * This system allows us to gradually roll out modern components
 * while maintaining the ability to rollback if issues are found.
 */

export interface FeatureFlags {
  // UI Modernization flags
  useModernOverviewTab: boolean
  useModernOperationsForm: boolean
  useModernWorkPackageForm: boolean
  useModernProductSelector: boolean
  useModernNavigation: boolean
  useModernIcons: boolean
  useModernAnimations: boolean
  
  // Testing flags
  enableComponentTesting: boolean
  enablePerformanceMonitoring: boolean
  enableDebugMode: boolean
  
  // Rollout phases
  phase1Complete: boolean // Icons, basic UI components
  phase2Complete: boolean // Forms and validation
  phase3Complete: boolean // Tables and complex components
  phase4Complete: boolean // Full integration
}

// Default feature flags - start conservative
const defaultFlags: FeatureFlags = {
  // UI Modernization - start with false for safety
  useModernOverviewTab: true, // ✅ ENABLED - Modern operations table
  useModernOperationsForm: true, // ✅ ENABLED - Modern form system
  useModernWorkPackageForm: true, // ✅ ENABLED - Modern work package forms
  useModernProductSelector: false,
  useModernNavigation: true, // ✅ ENABLED - Modern navigation system
  useModernIcons: true, // ✅ ENABLED - Safe icon replacements
  useModernAnimations: true, // ✅ ENABLED - Safe animation improvements
  
  // Testing - enable for development
  enableComponentTesting: process.env.NODE_ENV === 'development',
  enablePerformanceMonitoring: true,
  enableDebugMode: process.env.NODE_ENV === 'development',
  
  // Rollout phases
  phase1Complete: false,
  phase2Complete: false,
  phase3Complete: false,
  phase4Complete: false,
}

// Environment-based overrides
const getEnvironmentFlags = (): Partial<FeatureFlags> => {
  if (process.env.NODE_ENV === 'development') {
    return {
      // Enable more features in development
      useModernIcons: true,
      useModernAnimations: true,
      enableComponentTesting: true,
      enableDebugMode: true,
    }
  }
  
  if (process.env.NODE_ENV === 'test') {
    return {
      // Enable all modern components for testing
      useModernOverviewTab: true,
      useModernOperationsForm: true,
      useModernWorkPackageForm: true,
      useModernProductSelector: true,
      useModernNavigation: true,
      useModernIcons: true,
      useModernAnimations: true,
      enableComponentTesting: true,
      enableDebugMode: true,
    }
  }
  
  return {}
}

// URL parameter overrides for testing
const getUrlFlags = (): Partial<FeatureFlags> => {
  if (typeof window === 'undefined') return {}
  
  const params = new URLSearchParams(window.location.search)
  const flags: Partial<FeatureFlags> = {}
  
  // Allow enabling features via URL params
  // e.g., ?modernOverview=true&modernForms=true
  if (params.get('modernOverview') === 'true') {
    flags.useModernOverviewTab = true
  }
  if (params.get('modernForms') === 'true') {
    flags.useModernOperationsForm = true
    flags.useModernWorkPackageForm = true
  }
  if (params.get('modernAll') === 'true') {
    flags.useModernOverviewTab = true
    flags.useModernOperationsForm = true
    flags.useModernWorkPackageForm = true
    flags.useModernProductSelector = true
    flags.useModernNavigation = true
    flags.useModernAnimations = true
  }
  
  return flags
}

// Local storage overrides for persistent testing
const getStorageFlags = (): Partial<FeatureFlags> => {
  if (typeof window === 'undefined') return {}
  
  try {
    const stored = localStorage.getItem('scanne_feature_flags')
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (error) {
    console.warn('Failed to parse stored feature flags:', error)
  }
  
  return {}
}

// Save flags to local storage
export const saveFeatureFlags = (flags: Partial<FeatureFlags>) => {
  if (typeof window === 'undefined') return
  
  try {
    const current = getFeatureFlags()
    const updated = { ...current, ...flags }
    localStorage.setItem('scanne_feature_flags', JSON.stringify(updated))
  } catch (error) {
    console.warn('Failed to save feature flags:', error)
  }
}

// Get final feature flags with all overrides applied
export const getFeatureFlags = (): FeatureFlags => {
  const envFlags = getEnvironmentFlags()
  const urlFlags = getUrlFlags()
  const storageFlags = getStorageFlags()
  
  return {
    ...defaultFlags,
    ...envFlags,
    ...storageFlags,
    ...urlFlags, // URL params have highest priority
  }
}

// Convenience hooks for specific features
export const useFeatureFlag = (flag: keyof FeatureFlags): boolean => {
  const flags = getFeatureFlags()
  return flags[flag]
}

// Migration phase helpers
export const getMigrationPhase = (): 1 | 2 | 3 | 4 | 'complete' => {
  const flags = getFeatureFlags()
  
  if (flags.phase4Complete) return 'complete'
  if (flags.phase3Complete) return 4
  if (flags.phase2Complete) return 3
  if (flags.phase1Complete) return 2
  return 1
}

// Enable next migration phase
export const enableNextPhase = () => {
  const currentPhase = getMigrationPhase()
  const flags = getFeatureFlags()
  
  switch (currentPhase) {
    case 1:
      saveFeatureFlags({
        useModernIcons: true,
        useModernAnimations: true,
        phase1Complete: true,
      })
      break
    case 2:
      saveFeatureFlags({
        useModernOperationsForm: true,
        useModernWorkPackageForm: true,
        phase2Complete: true,
      })
      break
    case 3:
      saveFeatureFlags({
        useModernOverviewTab: true,
        useModernNavigation: true,
        phase3Complete: true,
      })
      break
    case 4:
      saveFeatureFlags({
        useModernProductSelector: true,
        phase4Complete: true,
      })
      break
  }
}

// Reset all flags (for testing)
export const resetFeatureFlags = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('scanne_feature_flags')
  }
}

// Debug helper
export const logFeatureFlags = () => {
  if (process.env.NODE_ENV === 'development') {
    console.log('🚩 Current Feature Flags:', getFeatureFlags())
    console.log('📊 Migration Phase:', getMigrationPhase())
  }
}
