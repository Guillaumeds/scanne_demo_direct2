/**
 * Supabase Client Configuration
 * Handles database connection and type definitions
 */

import { createClient } from '@supabase/supabase-js'
import { Database } from './database.types'

// Environment variables with runtime validation
function getSupabaseConfig() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Debug logging for production troubleshooting
  if (typeof window !== 'undefined') {
    console.log('🔍 Supabase Config Debug:', {
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseAnonKey,
      urlPrefix: supabaseUrl ? supabaseUrl.substring(0, 20) + '...' : 'undefined',
      keyPrefix: supabaseAnonKey ? supabaseAnonKey.substring(0, 20) + '...' : 'undefined'
    })
  }

  if (!supabaseUrl) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable')
  }

  if (!supabaseAnonKey) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable')
  }

  return { supabaseUrl, supabaseAnonKey }
}

// Create Supabase client with proper typing and runtime validation
function createSupabaseClient() {
  const { supabaseUrl, supabaseAnonKey } = getSupabaseConfig()

  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  })
}

// Export the client - will be created on first access
export const supabase = createSupabaseClient()

// Helper types for easy access to database types
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Inserts<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type Updates<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']

// Specific table types for easy import (operational tables only)
export type Company = Tables<'companies'>
export type Farm = Tables<'farms'>
// Field functionality removed - blocs are the primary entities
export type Bloc = Tables<'blocs'>
export type CropCycle = Tables<'crop_cycles'>
export type Activity = Tables<'activities'>
export type Observation = Tables<'observations'>
export type Attachment = Tables<'attachments'>

// Note: Configuration table types (varieties, products, resources, categories, system_config)
// have been removed as the app now uses hardcoded arrays for configuration data
// and the admin panel has been removed from the demo version


