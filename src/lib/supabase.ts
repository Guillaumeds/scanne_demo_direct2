/**
 * Supabase Client Configuration
 * Handles database connection and type definitions
 */

import { createClient } from '@supabase/supabase-js'
import { Database } from './database.types'

// Environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Create Supabase client with proper typing
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
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

// Helper types for easy access to database types
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Inserts<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type Updates<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']

// Specific table types for easy import
export type Company = Tables<'companies'>
export type Farm = Tables<'farms'>
export type Field = Tables<'fields'>
export type Bloc = Tables<'blocs'>
export type CropCycle = Tables<'crop_cycles'>
export type SugarcaneVariety = Tables<'sugarcane_varieties'>
export type IntercropVariety = Tables<'intercrop_varieties'>
export type Product = Tables<'products'>
export type Resource = Tables<'resources'>
export type ActivityCategory = Tables<'activity_categories'>
export type ObservationCategory = Tables<'observation_categories'>
export type AttachmentCategory = Tables<'attachment_categories'>


