/**
 * Database Types - Generated from Supabase Schema
 * This file contains TypeScript types that match the database schema exactly
 * Updated: 2025-01-04 - Matches minimal working schema
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      // =====================================================
      // CORE FARM STRUCTURE
      // =====================================================
      companies: {
        Row: {
          id: string
          name: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          created_at?: string
          updated_at?: string
        }
      }
      farms: {
        Row: {
          id: string
          company_id: string | null
          name: string
          location: string | null
          total_area_hectares: number | null
          border_coordinates: unknown | null // PostGIS GEOMETRY(POLYGON, 4326)
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id?: string | null
          name: string
          location?: string | null
          total_area_hectares?: number | null
          border_coordinates?: unknown | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string | null
          name?: string
          location?: string | null
          total_area_hectares?: number | null
          border_coordinates?: unknown | null
          created_at?: string
          updated_at?: string
        }
      }
      blocs: {
        Row: {
          id: string
          farm_id: string | null
          name: string
          area_hectares: number | null
          coordinates: unknown | null // PostGIS GEOMETRY(POLYGON, 4326)
          status: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          farm_id?: string | null
          name: string
          area_hectares?: number | null
          coordinates?: unknown | null
          status?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          farm_id?: string | null
          name?: string
          area_hectares?: number | null
          coordinates?: unknown | null
          status?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      
      // =====================================================
      // VARIETY CONFIGURATION TABLES
      // =====================================================
      sugarcane_varieties: {
        Row: {
          id: string
          variety_id: string
          name: string
          category: string | null
          harvest_start_month: string | null
          harvest_end_month: string | null
          seasons: string[] | null
          soil_types: string[] | null
          sugar_content_percent: number | null
          characteristics: Json | null
          description: string | null
          image_url: string | null
          information_leaflet_url: string | null
          active: boolean | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          variety_id: string
          name: string
          category?: string | null
          harvest_start_month?: string | null
          harvest_end_month?: string | null
          seasons?: string[] | null
          soil_types?: string[] | null
          sugar_content_percent?: number | null
          characteristics?: Json | null
          description?: string | null
          image_url?: string | null
          information_leaflet_url?: string | null
          active?: boolean | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          variety_id?: string
          name?: string
          category?: string | null
          harvest_start_month?: string | null
          harvest_end_month?: string | null
          seasons?: string[] | null
          soil_types?: string[] | null
          sugar_content_percent?: number | null
          characteristics?: Json | null
          description?: string | null
          image_url?: string | null
          information_leaflet_url?: string | null
          active?: boolean | null
          created_at?: string
          updated_at?: string
        }
      }
      intercrop_varieties: {
        Row: {
          id: string
          variety_id: string
          name: string
          scientific_name: string | null
          category: string | null
          benefits: string[] | null
          planting_time: string | null
          harvest_time: string | null
          description: string | null
          image_url: string | null
          active: boolean | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          variety_id: string
          name: string
          scientific_name?: string | null
          category?: string | null
          benefits?: string[] | null
          planting_time?: string | null
          harvest_time?: string | null
          description?: string | null
          image_url?: string | null
          active?: boolean | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          variety_id?: string
          name?: string
          scientific_name?: string | null
          category?: string | null
          benefits?: string[] | null
          planting_time?: string | null
          harvest_time?: string | null
          description?: string | null
          image_url?: string | null
          active?: boolean | null
          created_at?: string
          updated_at?: string
        }
      }
      products: {
        Row: {
          id: string
          product_id: string
          name: string
          category: string | null
          subcategory: string | null
          unit: string | null
          cost_per_unit: number | null
          supplier: string | null
          description: string | null
          image_url: string | null
          information_leaflet_url: string | null
          active: boolean | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          product_id: string
          name: string
          category?: string | null
          subcategory?: string | null
          unit?: string | null
          cost_per_unit?: number | null
          supplier?: string | null
          description?: string | null
          image_url?: string | null
          information_leaflet_url?: string | null
          active?: boolean | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          name?: string
          category?: string | null
          subcategory?: string | null
          unit?: string | null
          cost_per_unit?: number | null
          supplier?: string | null
          description?: string | null
          image_url?: string | null
          information_leaflet_url?: string | null
          active?: boolean | null
          created_at?: string
          updated_at?: string
        }
      }
      resources: {
        Row: {
          id: string
          resource_id: string
          name: string
          category: string | null
          subcategory: string | null
          unit: string | null
          cost_per_unit: number | null
          description: string | null
          active: boolean | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          resource_id: string
          name: string
          category?: string | null
          subcategory?: string | null
          unit?: string | null
          cost_per_unit?: number | null
          description?: string | null
          active?: boolean | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          resource_id?: string
          name?: string
          category?: string | null
          subcategory?: string | null
          unit?: string | null
          cost_per_unit?: number | null
          description?: string | null
          active?: boolean | null
          created_at?: string
          updated_at?: string
        }
      }

      // =====================================================
      // CROP CYCLES - SIMPLIFIED
      // =====================================================
      crop_cycles: {
        Row: {
          id: string
          bloc_id: string | null
          type: string // 'plantation' or 'ratoon'
          cycle_number: number
          status: string | null // 'active', 'closed'
          sugarcane_variety_id: string | null
          intercrop_variety_id: string | null
          parent_cycle_id: string | null
          sugarcane_planting_date: string | null
          sugarcane_planned_harvest_date: string | null
          sugarcane_actual_harvest_date: string | null
          intercrop_planting_date: string | null
          growth_stage: string | null
          growth_stage_updated_at: string | null
          days_since_planting: number | null
          sugarcane_actual_yield_tons_ha: number | null
          estimated_total_cost: number | null
          actual_total_cost: number | null
          sugarcane_revenue: number | null
          intercrop_revenue: number | null
          total_revenue: number | null
          net_profit: number | null
          profit_margin_percent: number | null
          closure_validated: boolean | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          bloc_id?: string | null
          type: string
          cycle_number?: number
          status?: string | null
          sugarcane_variety_id?: string | null
          intercrop_variety_id?: string | null
          parent_cycle_id?: string | null
          sugarcane_planting_date?: string | null
          sugarcane_planned_harvest_date?: string | null
          sugarcane_actual_harvest_date?: string | null
          intercrop_planting_date?: string | null
          growth_stage?: string | null
          growth_stage_updated_at?: string | null
          days_since_planting?: number | null
          sugarcane_actual_yield_tons_ha?: number | null
          estimated_total_cost?: number | null
          actual_total_cost?: number | null
          sugarcane_revenue?: number | null
          intercrop_revenue?: number | null
          total_revenue?: number | null
          net_profit?: number | null
          profit_margin_percent?: number | null
          closure_validated?: boolean | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          bloc_id?: string | null
          type?: string
          cycle_number?: number
          status?: string | null
          sugarcane_variety_id?: string | null
          intercrop_variety_id?: string | null
          parent_cycle_id?: string | null
          sugarcane_planting_date?: string | null
          sugarcane_planned_harvest_date?: string | null
          sugarcane_actual_harvest_date?: string | null
          intercrop_planting_date?: string | null
          growth_stage?: string | null
          growth_stage_updated_at?: string | null
          days_since_planting?: number | null
          sugarcane_actual_yield_tons_ha?: number | null
          estimated_total_cost?: number | null
          actual_total_cost?: number | null
          sugarcane_revenue?: number | null
          intercrop_revenue?: number | null
          total_revenue?: number | null
          net_profit?: number | null
          profit_margin_percent?: number | null
          closure_validated?: boolean | null
          created_at?: string
          updated_at?: string
        }
      }

      // =====================================================
      // RELATED TABLES (SIMPLIFIED)
      // =====================================================
      activities: {
        Row: {
          id: string
          crop_cycle_id: string | null
          name: string
          description: string | null
          phase: string | null
          activity_date: string | null
          start_date: string | null
          end_date: string | null
          duration: number | null
          status: string | null // 'planned', 'in-progress', 'completed'
          estimated_total_cost: number | null
          actual_total_cost: number | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          crop_cycle_id?: string | null
          name: string
          description?: string | null
          phase?: string | null
          activity_date?: string | null
          start_date?: string | null
          end_date?: string | null
          duration?: number | null
          status?: string | null
          estimated_total_cost?: number | null
          actual_total_cost?: number | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          crop_cycle_id?: string | null
          name?: string
          description?: string | null
          phase?: string | null
          activity_date?: string | null
          start_date?: string | null
          end_date?: string | null
          duration?: number | null
          status?: string | null
          estimated_total_cost?: number | null
          actual_total_cost?: number | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      observations: {
        Row: {
          id: string
          crop_cycle_id: string | null
          name: string
          description: string | null
          category: string | null
          status: string | null // 'draft', 'completed'
          observation_date: string | null
          number_of_samples: number | null
          number_of_plants: number | null
          observation_data: Json | null
          yield_tons_ha: number | null
          area_hectares: number | null
          total_yield_tons: number | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          crop_cycle_id?: string | null
          name: string
          description?: string | null
          category?: string | null
          status?: string | null
          observation_date?: string | null
          number_of_samples?: number | null
          number_of_plants?: number | null
          observation_data?: Json | null
          yield_tons_ha?: number | null
          area_hectares?: number | null
          total_yield_tons?: number | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          crop_cycle_id?: string | null
          name?: string
          description?: string | null
          category?: string | null
          status?: string | null
          observation_date?: string | null
          number_of_samples?: number | null
          number_of_plants?: number | null
          observation_data?: Json | null
          yield_tons_ha?: number | null
          area_hectares?: number | null
          total_yield_tons?: number | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      attachments: {
        Row: {
          id: string
          crop_cycle_id: string | null
          name: string
          file_url: string
          file_type: string | null
          file_size: number | null
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          crop_cycle_id?: string | null
          name: string
          file_url: string
          file_type?: string | null
          file_size?: number | null
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          crop_cycle_id?: string | null
          name?: string
          file_url?: string
          file_type?: string | null
          file_size?: number | null
          description?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      activity_products: {
        Row: {
          id: string
          activity_id: string | null
          product_id: string | null
          product_name: string
          quantity: number
          rate: number
          unit: string
          estimated_cost: number | null
          actual_cost: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          activity_id?: string | null
          product_id?: string | null
          product_name: string
          quantity: number
          rate: number
          unit: string
          estimated_cost?: number | null
          actual_cost?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          activity_id?: string | null
          product_id?: string | null
          product_name?: string
          quantity?: number
          rate?: number
          unit?: string
          estimated_cost?: number | null
          actual_cost?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      activity_resources: {
        Row: {
          id: string
          activity_id: string | null
          resource_id: string | null
          resource_name: string
          hours: number
          cost_per_hour: number
          estimated_cost: number | null
          actual_cost: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          activity_id?: string | null
          resource_id?: string | null
          resource_name: string
          hours: number
          cost_per_hour: number
          estimated_cost?: number | null
          actual_cost?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          activity_id?: string | null
          resource_id?: string | null
          resource_name?: string
          hours?: number
          cost_per_hour?: number
          estimated_cost?: number | null
          actual_cost?: number | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Helper types for easier usage
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']
