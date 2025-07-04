// =====================================================
// ARCHIVED DATABASE TYPES
// =====================================================
// This file contains the TypeScript types for configuration tables
// that were removed from the main application. These are preserved
// for reference and potential future use.
//
// The original src/types/database.ts file contained these types
// but has been simplified to only include operational tables.
// =====================================================

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// Configuration table types that were archived
export interface ArchivedConfigTables {
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
      icon: string | null
      image_url: string | null
      information_leaflet_url: string | null
      active: boolean | null
      sort_order: number | null
      created_at: string | null
      updated_at: string | null
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
      icon?: string | null
      image_url?: string | null
      information_leaflet_url?: string | null
      active?: boolean | null
      sort_order?: number | null
      created_at?: string | null
      updated_at?: string | null
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
      icon?: string | null
      image_url?: string | null
      information_leaflet_url?: string | null
      active?: boolean | null
      sort_order?: number | null
      created_at?: string | null
      updated_at?: string | null
    }
    Relationships: []
  }
  
  intercrop_varieties: {
    Row: {
      id: string
      variety_id: string
      name: string
      scientific_name: string | null
      benefits: string[] | null
      planting_time: string | null
      harvest_time: string | null
      description: string | null
      icon: string | null
      image_url: string | null
      information_leaflet_url: string | null
      active: boolean | null
      sort_order: number | null
      created_at: string | null
      updated_at: string | null
    }
    Insert: {
      id?: string
      variety_id: string
      name: string
      scientific_name?: string | null
      benefits?: string[] | null
      planting_time?: string | null
      harvest_time?: string | null
      description?: string | null
      icon?: string | null
      image_url?: string | null
      information_leaflet_url?: string | null
      active?: boolean | null
      sort_order?: number | null
      created_at?: string | null
      updated_at?: string | null
    }
    Update: {
      id?: string
      variety_id?: string
      name?: string
      scientific_name?: string | null
      benefits?: string[] | null
      planting_time?: string | null
      harvest_time?: string | null
      description?: string | null
      icon?: string | null
      image_url?: string | null
      information_leaflet_url?: string | null
      active?: boolean | null
      sort_order?: number | null
      created_at?: string | null
      updated_at?: string | null
    }
    Relationships: []
  }

  products: {
    Row: {
      id: string
      product_id: string
      name: string
      category: string | null
      description: string | null
      unit: string
      recommended_rate_per_ha: number | null
      cost_per_unit: number | null
      brand: string | null
      composition: string | null
      icon: string | null
      image_url: string | null
      information_url: string | null
      specifications: Json | null
      safety_datasheet_url: string | null
      active: boolean | null
      created_at: string | null
      updated_at: string | null
    }
    Insert: {
      id?: string
      product_id: string
      name: string
      category?: string | null
      description?: string | null
      unit: string
      recommended_rate_per_ha?: number | null
      cost_per_unit?: number | null
      brand?: string | null
      composition?: string | null
      icon?: string | null
      image_url?: string | null
      information_url?: string | null
      specifications?: Json | null
      safety_datasheet_url?: string | null
      active?: boolean | null
      created_at?: string | null
      updated_at?: string | null
    }
    Update: {
      id?: string
      product_id?: string
      name?: string
      category?: string | null
      description?: string | null
      unit?: string
      recommended_rate_per_ha?: number | null
      cost_per_unit?: number | null
      brand?: string | null
      composition?: string | null
      icon?: string | null
      image_url?: string | null
      information_url?: string | null
      specifications?: Json | null
      safety_datasheet_url?: string | null
      active?: boolean | null
      created_at?: string | null
      updated_at?: string | null
    }
    Relationships: []
  }

  resources: {
    Row: {
      id: string
      resource_id: string
      name: string
      category: string | null
      description: string | null
      unit: string
      cost_per_hour: number | null
      cost_per_unit: number | null
      skill_level: string | null
      overtime_multiplier: number | null
      icon: string | null
      specifications: Json | null
      active: boolean | null
      created_at: string | null
      updated_at: string | null
    }
    Insert: {
      id?: string
      resource_id: string
      name: string
      category?: string | null
      description?: string | null
      unit: string
      cost_per_hour?: number | null
      cost_per_unit?: number | null
      skill_level?: string | null
      overtime_multiplier?: number | null
      icon?: string | null
      specifications?: Json | null
      active?: boolean | null
      created_at?: string | null
      updated_at?: string | null
    }
    Update: {
      id?: string
      resource_id?: string
      name?: string
      category?: string | null
      description?: string | null
      unit?: string
      cost_per_hour?: number | null
      cost_per_unit?: number | null
      skill_level?: string | null
      overtime_multiplier?: number | null
      icon?: string | null
      specifications?: Json | null
      active?: boolean | null
      created_at?: string | null
      updated_at?: string | null
    }
    Relationships: []
  }

  activity_categories: {
    Row: {
      id: string
      category_id: string
      name: string
      description: string | null
      icon: string | null
      color: string | null
      active: boolean | null
      sort_order: number | null
      created_at: string | null
      updated_at: string | null
    }
    Insert: {
      id?: string
      category_id: string
      name: string
      description?: string | null
      icon?: string | null
      color?: string | null
      active?: boolean | null
      sort_order?: number | null
      created_at?: string | null
      updated_at?: string | null
    }
    Update: {
      id?: string
      category_id?: string
      name?: string
      description?: string | null
      icon?: string | null
      color?: string | null
      active?: boolean | null
      sort_order?: number | null
      created_at?: string | null
      updated_at?: string | null
    }
    Relationships: []
  }

  observation_categories: {
    Row: {
      id: string
      category_id: string
      name: string
      description: string | null
      icon: string | null
      color: string | null
      active: boolean | null
      created_at: string | null
      updated_at: string | null
    }
    Insert: {
      id?: string
      category_id: string
      name: string
      description?: string | null
      icon?: string | null
      color?: string | null
      active?: boolean | null
      created_at?: string | null
      updated_at?: string | null
    }
    Update: {
      id?: string
      category_id?: string
      name?: string
      description?: string | null
      icon?: string | null
      color?: string | null
      active?: boolean | null
      created_at?: string | null
      updated_at?: string | null
    }
    Relationships: []
  }

  attachment_categories: {
    Row: {
      id: string
      category_id: string
      name: string
      description: string | null
      icon: string | null
      color: string | null
      max_file_size_mb: number | null
      accepted_file_types: string[] | null
      active: boolean | null
      created_at: string | null
      updated_at: string | null
    }
    Insert: {
      id?: string
      category_id: string
      name: string
      description?: string | null
      icon?: string | null
      color?: string | null
      max_file_size_mb?: number | null
      accepted_file_types?: string[] | null
      active?: boolean | null
      created_at?: string | null
      updated_at?: string | null
    }
    Update: {
      id?: string
      category_id?: string
      name?: string
      description?: string | null
      icon?: string | null
      color?: string | null
      max_file_size_mb?: number | null
      accepted_file_types?: string[] | null
      active?: boolean | null
      created_at?: string | null
      updated_at?: string | null
    }
    Relationships: []
  }
}
