/**
 * Supabase Client Configuration
 * Handles database connection and type definitions
 */

import { createClient } from '@supabase/supabase-js'
import { Database } from '../types/supabase'

// Environment variables with runtime validation
function getSupabaseConfig() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Debug logging for production troubleshooting
  if (typeof window !== 'undefined') {
    // Supabase config validated
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

// Specific table types for easy import - all generated from actual database schema
export type Company = Tables<'companies'>
export type Farm = Tables<'farms'>
export type Bloc = Tables<'blocs'>
export type CropCycle = Tables<'crop_cycles'>
export type FieldOperation = Tables<'field_operations'>
// export type Observation = Tables<'observations'> // TODO: Enable when observations table is available
export type Equipment = Tables<'equipment'>
export type Labour = Tables<'labour'>
export type Product = Tables<'products'>
export type SugarcaneVariety = Tables<'sugarcane_varieties'>
export type IntercropVariety = Tables<'intercrop_varieties'>
export type DailyWorkPackage = Tables<'daily_work_packages'>
export type OperationEquipment = Tables<'operation_equipment'>
export type OperationLabour = Tables<'operation_labour'>
export type OperationProduct = Tables<'operation_products'>
export type WorkPackageEquipment = Tables<'work_package_equipment'>
export type WorkPackageLabour = Tables<'work_package_labour'>
export type WorkPackageProduct = Tables<'work_package_products'>
export type OperationTypeConfig = Tables<'operation_type_config'>
export type OperationMethodConfig = Tables<'operations_method'>
export type ClimaticData = Tables<'climatic_data'>

// Note: All types are now generated from the actual database schema via Supabase CLI


