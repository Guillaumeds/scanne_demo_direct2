export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      blocs: {
        Row: {
          area_hectares: number | null
          coordinates: unknown | null
          created_at: string | null
          farm_id: string | null
          id: string
          name: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          area_hectares?: number | null
          coordinates?: unknown | null
          created_at?: string | null
          farm_id?: string | null
          id?: string
          name: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          area_hectares?: number | null
          coordinates?: unknown | null
          created_at?: string | null
          farm_id?: string | null
          id?: string
          name?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "blocs_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
        ]
      }
      climatic_data: {
        Row: {
          co2_concentration_ppm: number | null
          evapotranspiration_mm: number | null
          julian_day: number
          observation_day: number | null
          observation_month: number | null
          observation_year: number
          precipitation_mm: string | null
          solar_radiation_mj_per_m2: number | null
          station_id: string
          temperature_max_celsius: number | null
          temperature_min_celsius: number | null
          vapor_pressure_hpa: number | null
          wind_speed_m_per_s: number | null
        }
        Insert: {
          co2_concentration_ppm?: number | null
          evapotranspiration_mm?: number | null
          julian_day: number
          observation_day?: number | null
          observation_month?: number | null
          observation_year: number
          precipitation_mm?: string | null
          solar_radiation_mj_per_m2?: number | null
          station_id: string
          temperature_max_celsius?: number | null
          temperature_min_celsius?: number | null
          vapor_pressure_hpa?: number | null
          wind_speed_m_per_s?: number | null
        }
        Update: {
          co2_concentration_ppm?: number | null
          evapotranspiration_mm?: number | null
          julian_day?: number
          observation_day?: number | null
          observation_month?: number | null
          observation_year?: number
          precipitation_mm?: string | null
          solar_radiation_mj_per_m2?: number | null
          station_id?: string
          temperature_max_celsius?: number | null
          temperature_min_celsius?: number | null
          vapor_pressure_hpa?: number | null
          wind_speed_m_per_s?: number | null
        }
        Relationships: []
      }
      companies: {
        Row: {
          created_at: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      crop_cycles: {
        Row: {
          actual_total_cost: number | null
          bloc_id: string | null
          closure_validated: boolean | null
          created_at: string | null
          cycle_number: number
          days_since_planting: number | null
          estimated_total_cost: number | null
          growth_stage: string | null
          growth_stage_updated_at: string | null
          id: string
          intercrop_planting_date: string | null
          intercrop_revenue: number | null
          intercrop_variety_id: string | null
          net_profit: number | null
          parent_cycle_id: string | null
          profit_margin_percent: number | null
          profit_per_hectare: number | null
          status: string | null
          sugarcane_actual_harvest_date: string | null
          sugarcane_actual_yield_tons_ha: number | null
          sugarcane_expected_yield_tons_ha: number | null
          sugarcane_planned_harvest_date: string | null
          sugarcane_planting_date: string | null
          sugarcane_revenue: number | null
          sugarcane_variety_id: string | null
          total_revenue: number | null
          type: string
          updated_at: string | null
        }
        Insert: {
          actual_total_cost?: number | null
          bloc_id?: string | null
          closure_validated?: boolean | null
          created_at?: string | null
          cycle_number?: number
          days_since_planting?: number | null
          estimated_total_cost?: number | null
          growth_stage?: string | null
          growth_stage_updated_at?: string | null
          id?: string
          intercrop_planting_date?: string | null
          intercrop_revenue?: number | null
          intercrop_variety_id?: string | null
          net_profit?: number | null
          parent_cycle_id?: string | null
          profit_margin_percent?: number | null
          profit_per_hectare?: number | null
          status?: string | null
          sugarcane_actual_harvest_date?: string | null
          sugarcane_actual_yield_tons_ha?: number | null
          sugarcane_expected_yield_tons_ha?: number | null
          sugarcane_planned_harvest_date?: string | null
          sugarcane_planting_date?: string | null
          sugarcane_revenue?: number | null
          sugarcane_variety_id?: string | null
          total_revenue?: number | null
          type: string
          updated_at?: string | null
        }
        Update: {
          actual_total_cost?: number | null
          bloc_id?: string | null
          closure_validated?: boolean | null
          created_at?: string | null
          cycle_number?: number
          days_since_planting?: number | null
          estimated_total_cost?: number | null
          growth_stage?: string | null
          growth_stage_updated_at?: string | null
          id?: string
          intercrop_planting_date?: string | null
          intercrop_revenue?: number | null
          intercrop_variety_id?: string | null
          net_profit?: number | null
          parent_cycle_id?: string | null
          profit_margin_percent?: number | null
          profit_per_hectare?: number | null
          status?: string | null
          sugarcane_actual_harvest_date?: string | null
          sugarcane_actual_yield_tons_ha?: number | null
          sugarcane_expected_yield_tons_ha?: number | null
          sugarcane_planned_harvest_date?: string | null
          sugarcane_planting_date?: string | null
          sugarcane_revenue?: number | null
          sugarcane_variety_id?: string | null
          total_revenue?: number | null
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crop_cycles_bloc_id_fkey"
            columns: ["bloc_id"]
            isOneToOne: false
            referencedRelation: "blocs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crop_cycles_intercrop_variety_id_fkey"
            columns: ["intercrop_variety_id"]
            isOneToOne: false
            referencedRelation: "intercrop_varieties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crop_cycles_parent_cycle_id_fkey"
            columns: ["parent_cycle_id"]
            isOneToOne: false
            referencedRelation: "crop_cycles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crop_cycles_sugarcane_variety_id_fkey"
            columns: ["sugarcane_variety_id"]
            isOneToOne: false
            referencedRelation: "sugarcane_varieties"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_work_packages: {
        Row: {
          actual_area_hectares: number | null
          actual_quantity: number | null
          completion_percentage: number | null
          corrective_actions: string | null
          created_at: string | null
          created_by: string | null
          daily_area_completed: number | null
          daily_yield_tons: number | null
          duration_hours: number | null
          effectiveness_rating: number | null
          end_time: string | null
          equipment_cost: number | null
          field_operation_uuid: string | null
          fuel_cost: number | null
          humidity_percent: number | null
          issues_encountered: string | null
          labor_cost: number | null
          material_cost: number | null
          notes: string | null
          number_of_workers: number | null
          observations: string | null
          other_costs: number | null
          package_name: string | null
          planned_area_hectares: number | null
          planned_quantity: number | null
          quality_rating: number | null
          safety_incidents: string | null
          shift: string | null
          start_time: string | null
          status: string | null
          supervisor: string | null
          team_leader: string | null
          temperature_celsius: number | null
          total_cost: number | null
          updated_at: string | null
          uuid: string
          weather_conditions: string | null
          wind_speed_kmh: number | null
          work_date: string
          worker_names: string[] | null
        }
        Insert: {
          actual_area_hectares?: number | null
          actual_quantity?: number | null
          completion_percentage?: number | null
          corrective_actions?: string | null
          created_at?: string | null
          created_by?: string | null
          daily_area_completed?: number | null
          daily_yield_tons?: number | null
          duration_hours?: number | null
          effectiveness_rating?: number | null
          end_time?: string | null
          equipment_cost?: number | null
          field_operation_uuid?: string | null
          fuel_cost?: number | null
          humidity_percent?: number | null
          issues_encountered?: string | null
          labor_cost?: number | null
          material_cost?: number | null
          notes?: string | null
          number_of_workers?: number | null
          observations?: string | null
          other_costs?: number | null
          package_name?: string | null
          planned_area_hectares?: number | null
          planned_quantity?: number | null
          quality_rating?: number | null
          safety_incidents?: string | null
          shift?: string | null
          start_time?: string | null
          status?: string | null
          supervisor?: string | null
          team_leader?: string | null
          temperature_celsius?: number | null
          total_cost?: number | null
          updated_at?: string | null
          uuid?: string
          weather_conditions?: string | null
          wind_speed_kmh?: number | null
          work_date: string
          worker_names?: string[] | null
        }
        Update: {
          actual_area_hectares?: number | null
          actual_quantity?: number | null
          completion_percentage?: number | null
          corrective_actions?: string | null
          created_at?: string | null
          created_by?: string | null
          daily_area_completed?: number | null
          daily_yield_tons?: number | null
          duration_hours?: number | null
          effectiveness_rating?: number | null
          end_time?: string | null
          equipment_cost?: number | null
          field_operation_uuid?: string | null
          fuel_cost?: number | null
          humidity_percent?: number | null
          issues_encountered?: string | null
          labor_cost?: number | null
          material_cost?: number | null
          notes?: string | null
          number_of_workers?: number | null
          observations?: string | null
          other_costs?: number | null
          package_name?: string | null
          planned_area_hectares?: number | null
          planned_quantity?: number | null
          quality_rating?: number | null
          safety_incidents?: string | null
          shift?: string | null
          start_time?: string | null
          status?: string | null
          supervisor?: string | null
          team_leader?: string | null
          temperature_celsius?: number | null
          total_cost?: number | null
          updated_at?: string | null
          uuid?: string
          weather_conditions?: string | null
          wind_speed_kmh?: number | null
          work_date?: string
          worker_names?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "daily_work_packages_field_operation_uuid_fkey"
            columns: ["field_operation_uuid"]
            isOneToOne: false
            referencedRelation: "field_operations"
            referencedColumns: ["uuid"]
          },
        ]
      }
      equipment: {
        Row: {
          active: boolean | null
          capacity: string | null
          category: string
          created_at: string | null
          description: string | null
          equipment_id: string
          fuel_consumption_per_hour: number | null
          model: string | null
          name: string
          operating_cost_per_hour: number
          status: string | null
          updated_at: string | null
          uuid: string
        }
        Insert: {
          active?: boolean | null
          capacity?: string | null
          category: string
          created_at?: string | null
          description?: string | null
          equipment_id: string
          fuel_consumption_per_hour?: number | null
          model?: string | null
          name: string
          operating_cost_per_hour: number
          status?: string | null
          updated_at?: string | null
          uuid?: string
        }
        Update: {
          active?: boolean | null
          capacity?: string | null
          category?: string
          created_at?: string | null
          description?: string | null
          equipment_id?: string
          fuel_consumption_per_hour?: number | null
          model?: string | null
          name?: string
          operating_cost_per_hour?: number
          status?: string | null
          updated_at?: string | null
          uuid?: string
        }
        Relationships: []
      }
      farms: {
        Row: {
          border_coordinates: unknown | null
          company_id: string | null
          created_at: string | null
          id: string
          location: string | null
          name: string
          total_area_hectares: number | null
          updated_at: string | null
        }
        Insert: {
          border_coordinates?: unknown | null
          company_id?: string | null
          created_at?: string | null
          id?: string
          location?: string | null
          name: string
          total_area_hectares?: number | null
          updated_at?: string | null
        }
        Update: {
          border_coordinates?: unknown | null
          company_id?: string | null
          created_at?: string | null
          id?: string
          location?: string | null
          name?: string
          total_area_hectares?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "farms_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      field_operations: {
        Row: {
          actual_area_hectares: number | null
          actual_end_date: string | null
          actual_quantity: number | null
          actual_revenue: number | null
          actual_start_date: string | null
          actual_total_cost: number | null
          brix_percentage: number | null
          completion_percentage: number | null
          created_at: string | null
          created_by: string | null
          crop_cycle_uuid: string | null
          description: string | null
          effectiveness_rating: number | null
          estimated_revenue: number | null
          estimated_total_cost: number | null
          method: string | null
          notes: string | null
          operation_name: string
          operation_type: string
          optimal_weather_conditions: string | null
          planned_area_hectares: number | null
          planned_end_date: string
          planned_quantity: number | null
          planned_start_date: string
          price_per_tonne: number | null
          priority: string | null
          quality_rating: number | null
          revenue_per_hectare: number | null
          status: string | null
          sugar_content_percentage: number | null
          total_sugarcane_revenue: number | null
          total_yield_tons: number | null
          updated_at: string | null
          uuid: string
          weather_dependency: boolean | null
          yield_per_hectare: number | null
        }
        Insert: {
          actual_area_hectares?: number | null
          actual_end_date?: string | null
          actual_quantity?: number | null
          actual_revenue?: number | null
          actual_start_date?: string | null
          actual_total_cost?: number | null
          brix_percentage?: number | null
          completion_percentage?: number | null
          created_at?: string | null
          created_by?: string | null
          crop_cycle_uuid?: string | null
          description?: string | null
          effectiveness_rating?: number | null
          estimated_revenue?: number | null
          estimated_total_cost?: number | null
          method?: string | null
          notes?: string | null
          operation_name: string
          operation_type: string
          optimal_weather_conditions?: string | null
          planned_area_hectares?: number | null
          planned_end_date: string
          planned_quantity?: number | null
          planned_start_date: string
          price_per_tonne?: number | null
          priority?: string | null
          quality_rating?: number | null
          revenue_per_hectare?: number | null
          status?: string | null
          sugar_content_percentage?: number | null
          total_sugarcane_revenue?: number | null
          total_yield_tons?: number | null
          updated_at?: string | null
          uuid?: string
          weather_dependency?: boolean | null
          yield_per_hectare?: number | null
        }
        Update: {
          actual_area_hectares?: number | null
          actual_end_date?: string | null
          actual_quantity?: number | null
          actual_revenue?: number | null
          actual_start_date?: string | null
          actual_total_cost?: number | null
          brix_percentage?: number | null
          completion_percentage?: number | null
          created_at?: string | null
          created_by?: string | null
          crop_cycle_uuid?: string | null
          description?: string | null
          effectiveness_rating?: number | null
          estimated_revenue?: number | null
          estimated_total_cost?: number | null
          method?: string | null
          notes?: string | null
          operation_name?: string
          operation_type?: string
          optimal_weather_conditions?: string | null
          planned_area_hectares?: number | null
          planned_end_date?: string
          planned_quantity?: number | null
          planned_start_date?: string
          price_per_tonne?: number | null
          priority?: string | null
          quality_rating?: number | null
          revenue_per_hectare?: number | null
          status?: string | null
          sugar_content_percentage?: number | null
          total_sugarcane_revenue?: number | null
          total_yield_tons?: number | null
          updated_at?: string | null
          uuid?: string
          weather_dependency?: boolean | null
          yield_per_hectare?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "field_operations_crop_cycle_uuid_fkey"
            columns: ["crop_cycle_uuid"]
            isOneToOne: false
            referencedRelation: "crop_cycles"
            referencedColumns: ["id"]
          },
        ]
      }
      intercrop_varieties: {
        Row: {
          active: boolean | null
          benefits: string[] | null
          category: string | null
          created_at: string | null
          description: string | null
          harvest_time: string | null
          id: string
          image_url: string | null
          name: string
          planting_time: string | null
          scientific_name: string | null
          updated_at: string | null
          variety_id: string
        }
        Insert: {
          active?: boolean | null
          benefits?: string[] | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          harvest_time?: string | null
          id?: string
          image_url?: string | null
          name: string
          planting_time?: string | null
          scientific_name?: string | null
          updated_at?: string | null
          variety_id: string
        }
        Update: {
          active?: boolean | null
          benefits?: string[] | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          harvest_time?: string | null
          id?: string
          image_url?: string | null
          name?: string
          planting_time?: string | null
          scientific_name?: string | null
          updated_at?: string | null
          variety_id?: string
        }
        Relationships: []
      }
      observations: {
        Row: {
          area_hectares: number | null
          category: string | null
          created_at: string | null
          crop_cycle_id: string | null
          description: string | null
          id: string
          intercrop_revenue: number | null
          name: string
          notes: string | null
          number_of_plants: number | null
          number_of_samples: number | null
          observation_data: Json | null
          observation_date: string | null
          price_per_tonne: number | null
          revenue_per_hectare: number | null
          status: string | null
          sugarcane_revenue: number | null
          total_yield_tons: number | null
          updated_at: string | null
          yield_tons_ha: number | null
        }
        Insert: {
          area_hectares?: number | null
          category?: string | null
          created_at?: string | null
          crop_cycle_id?: string | null
          description?: string | null
          id?: string
          intercrop_revenue?: number | null
          name: string
          notes?: string | null
          number_of_plants?: number | null
          number_of_samples?: number | null
          observation_data?: Json | null
          observation_date?: string | null
          price_per_tonne?: number | null
          revenue_per_hectare?: number | null
          status?: string | null
          sugarcane_revenue?: number | null
          total_yield_tons?: number | null
          updated_at?: string | null
          yield_tons_ha?: number | null
        }
        Update: {
          area_hectares?: number | null
          category?: string | null
          created_at?: string | null
          crop_cycle_id?: string | null
          description?: string | null
          id?: string
          intercrop_revenue?: number | null
          name?: string
          notes?: string | null
          number_of_plants?: number | null
          number_of_samples?: number | null
          observation_data?: Json | null
          observation_date?: string | null
          price_per_tonne?: number | null
          revenue_per_hectare?: number | null
          status?: string | null
          sugarcane_revenue?: number | null
          total_yield_tons?: number | null
          updated_at?: string | null
          yield_tons_ha?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "observations_crop_cycle_id_fkey"
            columns: ["crop_cycle_id"]
            isOneToOne: false
            referencedRelation: "crop_cycles"
            referencedColumns: ["id"]
          },
        ]
      }
      operation_equipment: {
        Row: {
          actual_hours: number | null
          actual_total_cost: number | null
          created_at: string | null
          equipment_uuid: string | null
          estimated_total_cost: number
          field_operation_uuid: string | null
          hourly_rate: number
          notes: string | null
          operator_name: string | null
          planned_hours: number
          status: string | null
          uuid: string
        }
        Insert: {
          actual_hours?: number | null
          actual_total_cost?: number | null
          created_at?: string | null
          equipment_uuid?: string | null
          estimated_total_cost: number
          field_operation_uuid?: string | null
          hourly_rate: number
          notes?: string | null
          operator_name?: string | null
          planned_hours: number
          status?: string | null
          uuid?: string
        }
        Update: {
          actual_hours?: number | null
          actual_total_cost?: number | null
          created_at?: string | null
          equipment_uuid?: string | null
          estimated_total_cost?: number
          field_operation_uuid?: string | null
          hourly_rate?: number
          notes?: string | null
          operator_name?: string | null
          planned_hours?: number
          status?: string | null
          uuid?: string
        }
        Relationships: [
          {
            foreignKeyName: "operation_equipment_equipment_uuid_fkey"
            columns: ["equipment_uuid"]
            isOneToOne: false
            referencedRelation: "equipment"
            referencedColumns: ["uuid"]
          },
          {
            foreignKeyName: "operation_equipment_field_operation_uuid_fkey"
            columns: ["field_operation_uuid"]
            isOneToOne: false
            referencedRelation: "field_operations"
            referencedColumns: ["uuid"]
          },
        ]
      }
      operation_products: {
        Row: {
          actual_quantity: number | null
          actual_total_cost: number | null
          created_at: string | null
          estimated_total_cost: number
          field_operation_uuid: string | null
          notes: string | null
          planned_quantity: number
          product_uuid: string | null
          status: string | null
          unit_cost: number
          uuid: string
        }
        Insert: {
          actual_quantity?: number | null
          actual_total_cost?: number | null
          created_at?: string | null
          estimated_total_cost: number
          field_operation_uuid?: string | null
          notes?: string | null
          planned_quantity: number
          product_uuid?: string | null
          status?: string | null
          unit_cost: number
          uuid?: string
        }
        Update: {
          actual_quantity?: number | null
          actual_total_cost?: number | null
          created_at?: string | null
          estimated_total_cost?: number
          field_operation_uuid?: string | null
          notes?: string | null
          planned_quantity?: number
          product_uuid?: string | null
          status?: string | null
          unit_cost?: number
          uuid?: string
        }
        Relationships: [
          {
            foreignKeyName: "operation_products_field_operation_uuid_fkey"
            columns: ["field_operation_uuid"]
            isOneToOne: false
            referencedRelation: "field_operations"
            referencedColumns: ["uuid"]
          },
          {
            foreignKeyName: "operation_products_product_uuid_fkey"
            columns: ["product_uuid"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      operation_resources: {
        Row: {
          actual_quantity: number | null
          actual_total_cost: number | null
          created_at: string | null
          estimated_total_cost: number
          field_operation_uuid: string | null
          notes: string | null
          planned_quantity: number
          resource_uuid: string | null
          status: string | null
          unit_cost: number
          uuid: string
        }
        Insert: {
          actual_quantity?: number | null
          actual_total_cost?: number | null
          created_at?: string | null
          estimated_total_cost: number
          field_operation_uuid?: string | null
          notes?: string | null
          planned_quantity: number
          resource_uuid?: string | null
          status?: string | null
          unit_cost: number
          uuid?: string
        }
        Update: {
          actual_quantity?: number | null
          actual_total_cost?: number | null
          created_at?: string | null
          estimated_total_cost?: number
          field_operation_uuid?: string | null
          notes?: string | null
          planned_quantity?: number
          resource_uuid?: string | null
          status?: string | null
          unit_cost?: number
          uuid?: string
        }
        Relationships: [
          {
            foreignKeyName: "operation_resources_field_operation_uuid_fkey"
            columns: ["field_operation_uuid"]
            isOneToOne: false
            referencedRelation: "field_operations"
            referencedColumns: ["uuid"]
          },
          {
            foreignKeyName: "operation_resources_resource_uuid_fkey"
            columns: ["resource_uuid"]
            isOneToOne: false
            referencedRelation: "resources"
            referencedColumns: ["id"]
          },
        ]
      }
      operation_type_config: {
        Row: {
          color_class: string | null
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          operation_type: string
          ordr: number
          updated_at: string | null
        }
        Insert: {
          color_class?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          operation_type: string
          ordr: number
          updated_at?: string | null
        }
        Update: {
          color_class?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          operation_type?: string
          ordr?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      operations_method: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          method: string
          ordr: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          method: string
          ordr: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          method?: string
          ordr?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      products: {
        Row: {
          active: boolean | null
          category: string | null
          cost_per_unit: number | null
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          information_leaflet_url: string | null
          name: string
          product_id: string
          subcategory: string | null
          supplier: string | null
          unit: string | null
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          category?: string | null
          cost_per_unit?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          information_leaflet_url?: string | null
          name: string
          product_id: string
          subcategory?: string | null
          supplier?: string | null
          unit?: string | null
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          category?: string | null
          cost_per_unit?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          information_leaflet_url?: string | null
          name?: string
          product_id?: string
          subcategory?: string | null
          supplier?: string | null
          unit?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      resources: {
        Row: {
          active: boolean | null
          category: string | null
          cost_per_unit: number | null
          created_at: string | null
          description: string | null
          id: string
          name: string
          resource_id: string
          subcategory: string | null
          unit: string | null
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          category?: string | null
          cost_per_unit?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          resource_id: string
          subcategory?: string | null
          unit?: string | null
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          category?: string | null
          cost_per_unit?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          resource_id?: string
          subcategory?: string | null
          unit?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      spatial_ref_sys: {
        Row: {
          auth_name: string | null
          auth_srid: number | null
          proj4text: string | null
          srid: number
          srtext: string | null
        }
        Insert: {
          auth_name?: string | null
          auth_srid?: number | null
          proj4text?: string | null
          srid: number
          srtext?: string | null
        }
        Update: {
          auth_name?: string | null
          auth_srid?: number | null
          proj4text?: string | null
          srid?: number
          srtext?: string | null
        }
        Relationships: []
      }
      sugarcane_varieties: {
        Row: {
          active: boolean | null
          category: string | null
          characteristics: Json | null
          created_at: string | null
          description: string | null
          harvest_end_month: string | null
          harvest_start_month: string | null
          id: string
          image_url: string | null
          information_leaflet_url: string | null
          name: string
          seasons: string[] | null
          soil_types: string[] | null
          sugar_content_percent: number | null
          updated_at: string | null
          variety_id: string
        }
        Insert: {
          active?: boolean | null
          category?: string | null
          characteristics?: Json | null
          created_at?: string | null
          description?: string | null
          harvest_end_month?: string | null
          harvest_start_month?: string | null
          id?: string
          image_url?: string | null
          information_leaflet_url?: string | null
          name: string
          seasons?: string[] | null
          soil_types?: string[] | null
          sugar_content_percent?: number | null
          updated_at?: string | null
          variety_id: string
        }
        Update: {
          active?: boolean | null
          category?: string | null
          characteristics?: Json | null
          created_at?: string | null
          description?: string | null
          harvest_end_month?: string | null
          harvest_start_month?: string | null
          id?: string
          image_url?: string | null
          information_leaflet_url?: string | null
          name?: string
          seasons?: string[] | null
          soil_types?: string[] | null
          sugar_content_percent?: number | null
          updated_at?: string | null
          variety_id?: string
        }
        Relationships: []
      }
      work_package_equipment: {
        Row: {
          actual_hours: number | null
          actual_total_cost: number | null
          created_at: string | null
          daily_work_package_uuid: string | null
          equipment_uuid: string | null
          estimated_total_cost: number
          hourly_rate: number
          maintenance_required: boolean | null
          notes: string | null
          operator_name: string | null
          planned_hours: number
          post_operation_check: boolean | null
          pre_operation_check: boolean | null
          status: string | null
          uuid: string
        }
        Insert: {
          actual_hours?: number | null
          actual_total_cost?: number | null
          created_at?: string | null
          daily_work_package_uuid?: string | null
          equipment_uuid?: string | null
          estimated_total_cost: number
          hourly_rate: number
          maintenance_required?: boolean | null
          notes?: string | null
          operator_name?: string | null
          planned_hours: number
          post_operation_check?: boolean | null
          pre_operation_check?: boolean | null
          status?: string | null
          uuid?: string
        }
        Update: {
          actual_hours?: number | null
          actual_total_cost?: number | null
          created_at?: string | null
          daily_work_package_uuid?: string | null
          equipment_uuid?: string | null
          estimated_total_cost?: number
          hourly_rate?: number
          maintenance_required?: boolean | null
          notes?: string | null
          operator_name?: string | null
          planned_hours?: number
          post_operation_check?: boolean | null
          pre_operation_check?: boolean | null
          status?: string | null
          uuid?: string
        }
        Relationships: [
          {
            foreignKeyName: "work_package_equipment_daily_work_package_uuid_fkey"
            columns: ["daily_work_package_uuid"]
            isOneToOne: false
            referencedRelation: "daily_work_packages"
            referencedColumns: ["uuid"]
          },
          {
            foreignKeyName: "work_package_equipment_equipment_uuid_fkey"
            columns: ["equipment_uuid"]
            isOneToOne: false
            referencedRelation: "equipment"
            referencedColumns: ["uuid"]
          },
        ]
      }
      work_package_products: {
        Row: {
          actual_quantity: number | null
          actual_total_cost: number | null
          created_at: string | null
          daily_work_package_uuid: string | null
          estimated_total_cost: number
          notes: string | null
          planned_quantity: number
          product_uuid: string | null
          quality_check_passed: boolean | null
          status: string | null
          unit_cost: number
          uuid: string
        }
        Insert: {
          actual_quantity?: number | null
          actual_total_cost?: number | null
          created_at?: string | null
          daily_work_package_uuid?: string | null
          estimated_total_cost: number
          notes?: string | null
          planned_quantity: number
          product_uuid?: string | null
          quality_check_passed?: boolean | null
          status?: string | null
          unit_cost: number
          uuid?: string
        }
        Update: {
          actual_quantity?: number | null
          actual_total_cost?: number | null
          created_at?: string | null
          daily_work_package_uuid?: string | null
          estimated_total_cost?: number
          notes?: string | null
          planned_quantity?: number
          product_uuid?: string | null
          quality_check_passed?: boolean | null
          status?: string | null
          unit_cost?: number
          uuid?: string
        }
        Relationships: [
          {
            foreignKeyName: "work_package_products_daily_work_package_uuid_fkey"
            columns: ["daily_work_package_uuid"]
            isOneToOne: false
            referencedRelation: "daily_work_packages"
            referencedColumns: ["uuid"]
          },
          {
            foreignKeyName: "work_package_products_product_uuid_fkey"
            columns: ["product_uuid"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      work_package_resources: {
        Row: {
          actual_quantity: number | null
          actual_total_cost: number | null
          created_at: string | null
          daily_work_package_uuid: string | null
          estimated_total_cost: number
          notes: string | null
          planned_quantity: number
          resource_uuid: string | null
          status: string | null
          unit_cost: number
          uuid: string
        }
        Insert: {
          actual_quantity?: number | null
          actual_total_cost?: number | null
          created_at?: string | null
          daily_work_package_uuid?: string | null
          estimated_total_cost: number
          notes?: string | null
          planned_quantity: number
          resource_uuid?: string | null
          status?: string | null
          unit_cost: number
          uuid?: string
        }
        Update: {
          actual_quantity?: number | null
          actual_total_cost?: number | null
          created_at?: string | null
          daily_work_package_uuid?: string | null
          estimated_total_cost?: number
          notes?: string | null
          planned_quantity?: number
          resource_uuid?: string | null
          status?: string | null
          unit_cost?: number
          uuid?: string
        }
        Relationships: [
          {
            foreignKeyName: "work_package_resources_daily_work_package_uuid_fkey"
            columns: ["daily_work_package_uuid"]
            isOneToOne: false
            referencedRelation: "daily_work_packages"
            referencedColumns: ["uuid"]
          },
          {
            foreignKeyName: "work_package_resources_resource_uuid_fkey"
            columns: ["resource_uuid"]
            isOneToOne: false
            referencedRelation: "resources"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      geography_columns: {
        Row: {
          coord_dimension: number | null
          f_geography_column: unknown | null
          f_table_catalog: unknown | null
          f_table_name: unknown | null
          f_table_schema: unknown | null
          srid: number | null
          type: string | null
        }
        Relationships: []
      }
      geometry_columns: {
        Row: {
          coord_dimension: number | null
          f_geometry_column: unknown | null
          f_table_catalog: string | null
          f_table_name: unknown | null
          f_table_schema: unknown | null
          srid: number | null
          type: string | null
        }
        Insert: {
          coord_dimension?: number | null
          f_geometry_column?: unknown | null
          f_table_catalog?: string | null
          f_table_name?: unknown | null
          f_table_schema?: unknown | null
          srid?: number | null
          type?: string | null
        }
        Update: {
          coord_dimension?: number | null
          f_geometry_column?: unknown | null
          f_table_catalog?: string | null
          f_table_name?: unknown | null
          f_table_schema?: unknown | null
          srid?: number | null
          type?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      _postgis_deprecate: {
        Args: { oldname: string; newname: string; version: string }
        Returns: undefined
      }
      _postgis_index_extent: {
        Args: { tbl: unknown; col: string }
        Returns: unknown
      }
      _postgis_pgsql_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      _postgis_scripts_pgsql_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      _postgis_selectivity: {
        Args: { tbl: unknown; att_name: string; geom: unknown; mode?: string }
        Returns: number
      }
      _st_3dintersects: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_bestsrid: {
        Args: { "": unknown }
        Returns: number
      }
      _st_contains: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_containsproperly: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_coveredby: {
        Args:
          | { geog1: unknown; geog2: unknown }
          | { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_covers: {
        Args:
          | { geog1: unknown; geog2: unknown }
          | { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_crosses: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_dwithin: {
        Args: {
          geog1: unknown
          geog2: unknown
          tolerance: number
          use_spheroid?: boolean
        }
        Returns: boolean
      }
      _st_equals: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_intersects: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_linecrossingdirection: {
        Args: { line1: unknown; line2: unknown }
        Returns: number
      }
      _st_longestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      _st_maxdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      _st_orderingequals: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_overlaps: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_pointoutside: {
        Args: { "": unknown }
        Returns: unknown
      }
      _st_sortablehash: {
        Args: { geom: unknown }
        Returns: number
      }
      _st_touches: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_voronoi: {
        Args: {
          g1: unknown
          clip?: unknown
          tolerance?: number
          return_polygons?: boolean
        }
        Returns: unknown
      }
      _st_within: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      addauth: {
        Args: { "": string }
        Returns: boolean
      }
      addgeometrycolumn: {
        Args:
          | {
              catalog_name: string
              schema_name: string
              table_name: string
              column_name: string
              new_srid_in: number
              new_type: string
              new_dim: number
              use_typmod?: boolean
            }
          | {
              schema_name: string
              table_name: string
              column_name: string
              new_srid: number
              new_type: string
              new_dim: number
              use_typmod?: boolean
            }
          | {
              table_name: string
              column_name: string
              new_srid: number
              new_type: string
              new_dim: number
              use_typmod?: boolean
            }
        Returns: string
      }
      box: {
        Args: { "": unknown } | { "": unknown }
        Returns: unknown
      }
      box2d: {
        Args: { "": unknown } | { "": unknown }
        Returns: unknown
      }
      box2d_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      box2d_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      box2df_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      box2df_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      box3d: {
        Args: { "": unknown } | { "": unknown }
        Returns: unknown
      }
      box3d_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      box3d_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      box3dtobox: {
        Args: { "": unknown }
        Returns: unknown
      }
      bytea: {
        Args: { "": unknown } | { "": unknown }
        Returns: string
      }
      disablelongtransactions: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      dropgeometrycolumn: {
        Args:
          | {
              catalog_name: string
              schema_name: string
              table_name: string
              column_name: string
            }
          | { schema_name: string; table_name: string; column_name: string }
          | { table_name: string; column_name: string }
        Returns: string
      }
      dropgeometrytable: {
        Args:
          | { catalog_name: string; schema_name: string; table_name: string }
          | { schema_name: string; table_name: string }
          | { table_name: string }
        Returns: string
      }
      enablelongtransactions: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      equals: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geography: {
        Args: { "": string } | { "": unknown }
        Returns: unknown
      }
      geography_analyze: {
        Args: { "": unknown }
        Returns: boolean
      }
      geography_gist_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      geography_gist_decompress: {
        Args: { "": unknown }
        Returns: unknown
      }
      geography_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      geography_send: {
        Args: { "": unknown }
        Returns: string
      }
      geography_spgist_compress_nd: {
        Args: { "": unknown }
        Returns: unknown
      }
      geography_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      geography_typmod_out: {
        Args: { "": number }
        Returns: unknown
      }
      geometry: {
        Args:
          | { "": string }
          | { "": string }
          | { "": unknown }
          | { "": unknown }
          | { "": unknown }
          | { "": unknown }
          | { "": unknown }
          | { "": unknown }
        Returns: unknown
      }
      geometry_above: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_analyze: {
        Args: { "": unknown }
        Returns: boolean
      }
      geometry_below: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_cmp: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      geometry_contained_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_contains: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_contains_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_distance_box: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      geometry_distance_centroid: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      geometry_eq: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_ge: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_gist_compress_2d: {
        Args: { "": unknown }
        Returns: unknown
      }
      geometry_gist_compress_nd: {
        Args: { "": unknown }
        Returns: unknown
      }
      geometry_gist_decompress_2d: {
        Args: { "": unknown }
        Returns: unknown
      }
      geometry_gist_decompress_nd: {
        Args: { "": unknown }
        Returns: unknown
      }
      geometry_gist_sortsupport_2d: {
        Args: { "": unknown }
        Returns: undefined
      }
      geometry_gt: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_hash: {
        Args: { "": unknown }
        Returns: number
      }
      geometry_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      geometry_le: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_left: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_lt: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      geometry_overabove: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overbelow: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overlaps: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overlaps_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overleft: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overright: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_recv: {
        Args: { "": unknown }
        Returns: unknown
      }
      geometry_right: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_same: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_same_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_send: {
        Args: { "": unknown }
        Returns: string
      }
      geometry_sortsupport: {
        Args: { "": unknown }
        Returns: undefined
      }
      geometry_spgist_compress_2d: {
        Args: { "": unknown }
        Returns: unknown
      }
      geometry_spgist_compress_3d: {
        Args: { "": unknown }
        Returns: unknown
      }
      geometry_spgist_compress_nd: {
        Args: { "": unknown }
        Returns: unknown
      }
      geometry_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      geometry_typmod_out: {
        Args: { "": number }
        Returns: unknown
      }
      geometry_within: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometrytype: {
        Args: { "": unknown } | { "": unknown }
        Returns: string
      }
      geomfromewkb: {
        Args: { "": string }
        Returns: unknown
      }
      geomfromewkt: {
        Args: { "": string }
        Returns: unknown
      }
      get_blocs_with_wkt: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          name: string
          area_hectares: number
          coordinates_wkt: string
          status: string
          created_at: string
          updated_at: string
        }[]
      }
      get_proj4_from_srid: {
        Args: { "": number }
        Returns: string
      }
      gettransactionid: {
        Args: Record<PropertyKey, never>
        Returns: unknown
      }
      gidx_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      gidx_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      json: {
        Args: { "": unknown }
        Returns: Json
      }
      jsonb: {
        Args: { "": unknown }
        Returns: Json
      }
      longtransactionsenabled: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      path: {
        Args: { "": unknown }
        Returns: unknown
      }
      pgis_asflatgeobuf_finalfn: {
        Args: { "": unknown }
        Returns: string
      }
      pgis_asgeobuf_finalfn: {
        Args: { "": unknown }
        Returns: string
      }
      pgis_asmvt_finalfn: {
        Args: { "": unknown }
        Returns: string
      }
      pgis_asmvt_serialfn: {
        Args: { "": unknown }
        Returns: string
      }
      pgis_geometry_clusterintersecting_finalfn: {
        Args: { "": unknown }
        Returns: unknown[]
      }
      pgis_geometry_clusterwithin_finalfn: {
        Args: { "": unknown }
        Returns: unknown[]
      }
      pgis_geometry_collect_finalfn: {
        Args: { "": unknown }
        Returns: unknown
      }
      pgis_geometry_makeline_finalfn: {
        Args: { "": unknown }
        Returns: unknown
      }
      pgis_geometry_polygonize_finalfn: {
        Args: { "": unknown }
        Returns: unknown
      }
      pgis_geometry_union_parallel_finalfn: {
        Args: { "": unknown }
        Returns: unknown
      }
      pgis_geometry_union_parallel_serialfn: {
        Args: { "": unknown }
        Returns: string
      }
      point: {
        Args: { "": unknown }
        Returns: unknown
      }
      polygon: {
        Args: { "": unknown }
        Returns: unknown
      }
      populate_geometry_columns: {
        Args:
          | { tbl_oid: unknown; use_typmod?: boolean }
          | { use_typmod?: boolean }
        Returns: number
      }
      postgis_addbbox: {
        Args: { "": unknown }
        Returns: unknown
      }
      postgis_constraint_dims: {
        Args: { geomschema: string; geomtable: string; geomcolumn: string }
        Returns: number
      }
      postgis_constraint_srid: {
        Args: { geomschema: string; geomtable: string; geomcolumn: string }
        Returns: number
      }
      postgis_constraint_type: {
        Args: { geomschema: string; geomtable: string; geomcolumn: string }
        Returns: string
      }
      postgis_dropbbox: {
        Args: { "": unknown }
        Returns: unknown
      }
      postgis_extensions_upgrade: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_full_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_geos_noop: {
        Args: { "": unknown }
        Returns: unknown
      }
      postgis_geos_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_getbbox: {
        Args: { "": unknown }
        Returns: unknown
      }
      postgis_hasbbox: {
        Args: { "": unknown }
        Returns: boolean
      }
      postgis_index_supportfn: {
        Args: { "": unknown }
        Returns: unknown
      }
      postgis_lib_build_date: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_lib_revision: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_lib_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_libjson_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_liblwgeom_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_libprotobuf_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_libxml_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_noop: {
        Args: { "": unknown }
        Returns: unknown
      }
      postgis_proj_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_scripts_build_date: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_scripts_installed: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_scripts_released: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_svn_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_type_name: {
        Args: {
          geomname: string
          coord_dimension: number
          use_new_name?: boolean
        }
        Returns: string
      }
      postgis_typmod_dims: {
        Args: { "": number }
        Returns: number
      }
      postgis_typmod_srid: {
        Args: { "": number }
        Returns: number
      }
      postgis_typmod_type: {
        Args: { "": number }
        Returns: string
      }
      postgis_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_wagyu_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      save_activity_simple: {
        Args: { p_activity_data: Json; p_products?: Json; p_resources?: Json }
        Returns: string
      }
      save_bloc_with_smart_name: {
        Args: {
          p_farm_id: string
          p_coordinates_wkt: string
          p_area_hectares: number
        }
        Returns: {
          id: string
          name: string
          area_hectares: number
          created_at: string
        }[]
      }
      save_observation_simple: {
        Args: { p_observation_data: Json }
        Returns: string
      }
      spheroid_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      spheroid_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_3dclosestpoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_3ddistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_3dintersects: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_3dlength: {
        Args: { "": unknown }
        Returns: number
      }
      st_3dlongestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_3dmakebox: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_3dmaxdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_3dperimeter: {
        Args: { "": unknown }
        Returns: number
      }
      st_3dshortestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_addpoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_angle: {
        Args:
          | { line1: unknown; line2: unknown }
          | { pt1: unknown; pt2: unknown; pt3: unknown; pt4?: unknown }
        Returns: number
      }
      st_area: {
        Args:
          | { "": string }
          | { "": unknown }
          | { geog: unknown; use_spheroid?: boolean }
        Returns: number
      }
      st_area2d: {
        Args: { "": unknown }
        Returns: number
      }
      st_asbinary: {
        Args: { "": unknown } | { "": unknown }
        Returns: string
      }
      st_asencodedpolyline: {
        Args: { geom: unknown; nprecision?: number }
        Returns: string
      }
      st_asewkb: {
        Args: { "": unknown }
        Returns: string
      }
      st_asewkt: {
        Args: { "": string } | { "": unknown } | { "": unknown }
        Returns: string
      }
      st_asgeojson: {
        Args:
          | { "": string }
          | { geog: unknown; maxdecimaldigits?: number; options?: number }
          | { geom: unknown; maxdecimaldigits?: number; options?: number }
          | {
              r: Record<string, unknown>
              geom_column?: string
              maxdecimaldigits?: number
              pretty_bool?: boolean
            }
        Returns: string
      }
      st_asgml: {
        Args:
          | { "": string }
          | {
              geog: unknown
              maxdecimaldigits?: number
              options?: number
              nprefix?: string
              id?: string
            }
          | { geom: unknown; maxdecimaldigits?: number; options?: number }
          | {
              version: number
              geog: unknown
              maxdecimaldigits?: number
              options?: number
              nprefix?: string
              id?: string
            }
          | {
              version: number
              geom: unknown
              maxdecimaldigits?: number
              options?: number
              nprefix?: string
              id?: string
            }
        Returns: string
      }
      st_ashexewkb: {
        Args: { "": unknown }
        Returns: string
      }
      st_askml: {
        Args:
          | { "": string }
          | { geog: unknown; maxdecimaldigits?: number; nprefix?: string }
          | { geom: unknown; maxdecimaldigits?: number; nprefix?: string }
        Returns: string
      }
      st_aslatlontext: {
        Args: { geom: unknown; tmpl?: string }
        Returns: string
      }
      st_asmarc21: {
        Args: { geom: unknown; format?: string }
        Returns: string
      }
      st_asmvtgeom: {
        Args: {
          geom: unknown
          bounds: unknown
          extent?: number
          buffer?: number
          clip_geom?: boolean
        }
        Returns: unknown
      }
      st_assvg: {
        Args:
          | { "": string }
          | { geog: unknown; rel?: number; maxdecimaldigits?: number }
          | { geom: unknown; rel?: number; maxdecimaldigits?: number }
        Returns: string
      }
      st_astext: {
        Args: { "": string } | { "": unknown } | { "": unknown }
        Returns: string
      }
      st_astwkb: {
        Args:
          | {
              geom: unknown[]
              ids: number[]
              prec?: number
              prec_z?: number
              prec_m?: number
              with_sizes?: boolean
              with_boxes?: boolean
            }
          | {
              geom: unknown
              prec?: number
              prec_z?: number
              prec_m?: number
              with_sizes?: boolean
              with_boxes?: boolean
            }
        Returns: string
      }
      st_asx3d: {
        Args: { geom: unknown; maxdecimaldigits?: number; options?: number }
        Returns: string
      }
      st_azimuth: {
        Args:
          | { geog1: unknown; geog2: unknown }
          | { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_boundary: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_boundingdiagonal: {
        Args: { geom: unknown; fits?: boolean }
        Returns: unknown
      }
      st_buffer: {
        Args:
          | { geom: unknown; radius: number; options?: string }
          | { geom: unknown; radius: number; quadsegs: number }
        Returns: unknown
      }
      st_buildarea: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_centroid: {
        Args: { "": string } | { "": unknown }
        Returns: unknown
      }
      st_cleangeometry: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_clipbybox2d: {
        Args: { geom: unknown; box: unknown }
        Returns: unknown
      }
      st_closestpoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_clusterintersecting: {
        Args: { "": unknown[] }
        Returns: unknown[]
      }
      st_collect: {
        Args: { "": unknown[] } | { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_collectionextract: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_collectionhomogenize: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_concavehull: {
        Args: {
          param_geom: unknown
          param_pctconvex: number
          param_allow_holes?: boolean
        }
        Returns: unknown
      }
      st_contains: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_containsproperly: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_convexhull: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_coorddim: {
        Args: { geometry: unknown }
        Returns: number
      }
      st_coveredby: {
        Args:
          | { geog1: unknown; geog2: unknown }
          | { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_covers: {
        Args:
          | { geog1: unknown; geog2: unknown }
          | { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_crosses: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_curvetoline: {
        Args: { geom: unknown; tol?: number; toltype?: number; flags?: number }
        Returns: unknown
      }
      st_delaunaytriangles: {
        Args: { g1: unknown; tolerance?: number; flags?: number }
        Returns: unknown
      }
      st_difference: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number }
        Returns: unknown
      }
      st_dimension: {
        Args: { "": unknown }
        Returns: number
      }
      st_disjoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_distance: {
        Args:
          | { geog1: unknown; geog2: unknown; use_spheroid?: boolean }
          | { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_distancesphere: {
        Args:
          | { geom1: unknown; geom2: unknown }
          | { geom1: unknown; geom2: unknown; radius: number }
        Returns: number
      }
      st_distancespheroid: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_dump: {
        Args: { "": unknown }
        Returns: Database["public"]["CompositeTypes"]["geometry_dump"][]
      }
      st_dumppoints: {
        Args: { "": unknown }
        Returns: Database["public"]["CompositeTypes"]["geometry_dump"][]
      }
      st_dumprings: {
        Args: { "": unknown }
        Returns: Database["public"]["CompositeTypes"]["geometry_dump"][]
      }
      st_dumpsegments: {
        Args: { "": unknown }
        Returns: Database["public"]["CompositeTypes"]["geometry_dump"][]
      }
      st_dwithin: {
        Args: {
          geog1: unknown
          geog2: unknown
          tolerance: number
          use_spheroid?: boolean
        }
        Returns: boolean
      }
      st_endpoint: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_envelope: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_equals: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_expand: {
        Args:
          | { box: unknown; dx: number; dy: number }
          | { box: unknown; dx: number; dy: number; dz?: number }
          | { geom: unknown; dx: number; dy: number; dz?: number; dm?: number }
        Returns: unknown
      }
      st_exteriorring: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_flipcoordinates: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_force2d: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_force3d: {
        Args: { geom: unknown; zvalue?: number }
        Returns: unknown
      }
      st_force3dm: {
        Args: { geom: unknown; mvalue?: number }
        Returns: unknown
      }
      st_force3dz: {
        Args: { geom: unknown; zvalue?: number }
        Returns: unknown
      }
      st_force4d: {
        Args: { geom: unknown; zvalue?: number; mvalue?: number }
        Returns: unknown
      }
      st_forcecollection: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_forcecurve: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_forcepolygonccw: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_forcepolygoncw: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_forcerhr: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_forcesfs: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_generatepoints: {
        Args:
          | { area: unknown; npoints: number }
          | { area: unknown; npoints: number; seed: number }
        Returns: unknown
      }
      st_geogfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_geogfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_geographyfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_geohash: {
        Args:
          | { geog: unknown; maxchars?: number }
          | { geom: unknown; maxchars?: number }
        Returns: string
      }
      st_geomcollfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_geomcollfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_geometricmedian: {
        Args: {
          g: unknown
          tolerance?: number
          max_iter?: number
          fail_if_not_converged?: boolean
        }
        Returns: unknown
      }
      st_geometryfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_geometrytype: {
        Args: { "": unknown }
        Returns: string
      }
      st_geomfromewkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_geomfromewkt: {
        Args: { "": string }
        Returns: unknown
      }
      st_geomfromgeojson: {
        Args: { "": Json } | { "": Json } | { "": string }
        Returns: unknown
      }
      st_geomfromgml: {
        Args: { "": string }
        Returns: unknown
      }
      st_geomfromkml: {
        Args: { "": string }
        Returns: unknown
      }
      st_geomfrommarc21: {
        Args: { marc21xml: string }
        Returns: unknown
      }
      st_geomfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_geomfromtwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_geomfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_gmltosql: {
        Args: { "": string }
        Returns: unknown
      }
      st_hasarc: {
        Args: { geometry: unknown }
        Returns: boolean
      }
      st_hausdorffdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_hexagon: {
        Args: { size: number; cell_i: number; cell_j: number; origin?: unknown }
        Returns: unknown
      }
      st_hexagongrid: {
        Args: { size: number; bounds: unknown }
        Returns: Record<string, unknown>[]
      }
      st_interpolatepoint: {
        Args: { line: unknown; point: unknown }
        Returns: number
      }
      st_intersection: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number }
        Returns: unknown
      }
      st_intersects: {
        Args:
          | { geog1: unknown; geog2: unknown }
          | { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_isclosed: {
        Args: { "": unknown }
        Returns: boolean
      }
      st_iscollection: {
        Args: { "": unknown }
        Returns: boolean
      }
      st_isempty: {
        Args: { "": unknown }
        Returns: boolean
      }
      st_ispolygonccw: {
        Args: { "": unknown }
        Returns: boolean
      }
      st_ispolygoncw: {
        Args: { "": unknown }
        Returns: boolean
      }
      st_isring: {
        Args: { "": unknown }
        Returns: boolean
      }
      st_issimple: {
        Args: { "": unknown }
        Returns: boolean
      }
      st_isvalid: {
        Args: { "": unknown }
        Returns: boolean
      }
      st_isvaliddetail: {
        Args: { geom: unknown; flags?: number }
        Returns: Database["public"]["CompositeTypes"]["valid_detail"]
      }
      st_isvalidreason: {
        Args: { "": unknown }
        Returns: string
      }
      st_isvalidtrajectory: {
        Args: { "": unknown }
        Returns: boolean
      }
      st_length: {
        Args:
          | { "": string }
          | { "": unknown }
          | { geog: unknown; use_spheroid?: boolean }
        Returns: number
      }
      st_length2d: {
        Args: { "": unknown }
        Returns: number
      }
      st_letters: {
        Args: { letters: string; font?: Json }
        Returns: unknown
      }
      st_linecrossingdirection: {
        Args: { line1: unknown; line2: unknown }
        Returns: number
      }
      st_linefromencodedpolyline: {
        Args: { txtin: string; nprecision?: number }
        Returns: unknown
      }
      st_linefrommultipoint: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_linefromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_linefromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_linelocatepoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_linemerge: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_linestringfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_linetocurve: {
        Args: { geometry: unknown }
        Returns: unknown
      }
      st_locatealong: {
        Args: { geometry: unknown; measure: number; leftrightoffset?: number }
        Returns: unknown
      }
      st_locatebetween: {
        Args: {
          geometry: unknown
          frommeasure: number
          tomeasure: number
          leftrightoffset?: number
        }
        Returns: unknown
      }
      st_locatebetweenelevations: {
        Args: { geometry: unknown; fromelevation: number; toelevation: number }
        Returns: unknown
      }
      st_longestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_m: {
        Args: { "": unknown }
        Returns: number
      }
      st_makebox2d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_makeline: {
        Args: { "": unknown[] } | { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_makepolygon: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_makevalid: {
        Args: { "": unknown } | { geom: unknown; params: string }
        Returns: unknown
      }
      st_maxdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_maximuminscribedcircle: {
        Args: { "": unknown }
        Returns: Record<string, unknown>
      }
      st_memsize: {
        Args: { "": unknown }
        Returns: number
      }
      st_minimumboundingcircle: {
        Args: { inputgeom: unknown; segs_per_quarter?: number }
        Returns: unknown
      }
      st_minimumboundingradius: {
        Args: { "": unknown }
        Returns: Record<string, unknown>
      }
      st_minimumclearance: {
        Args: { "": unknown }
        Returns: number
      }
      st_minimumclearanceline: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_mlinefromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_mlinefromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_mpointfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_mpointfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_mpolyfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_mpolyfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_multi: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_multilinefromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_multilinestringfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_multipointfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_multipointfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_multipolyfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_multipolygonfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_ndims: {
        Args: { "": unknown }
        Returns: number
      }
      st_node: {
        Args: { g: unknown }
        Returns: unknown
      }
      st_normalize: {
        Args: { geom: unknown }
        Returns: unknown
      }
      st_npoints: {
        Args: { "": unknown }
        Returns: number
      }
      st_nrings: {
        Args: { "": unknown }
        Returns: number
      }
      st_numgeometries: {
        Args: { "": unknown }
        Returns: number
      }
      st_numinteriorring: {
        Args: { "": unknown }
        Returns: number
      }
      st_numinteriorrings: {
        Args: { "": unknown }
        Returns: number
      }
      st_numpatches: {
        Args: { "": unknown }
        Returns: number
      }
      st_numpoints: {
        Args: { "": unknown }
        Returns: number
      }
      st_offsetcurve: {
        Args: { line: unknown; distance: number; params?: string }
        Returns: unknown
      }
      st_orderingequals: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_orientedenvelope: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_overlaps: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_perimeter: {
        Args: { "": unknown } | { geog: unknown; use_spheroid?: boolean }
        Returns: number
      }
      st_perimeter2d: {
        Args: { "": unknown }
        Returns: number
      }
      st_pointfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_pointfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_pointm: {
        Args: {
          xcoordinate: number
          ycoordinate: number
          mcoordinate: number
          srid?: number
        }
        Returns: unknown
      }
      st_pointonsurface: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_points: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_pointz: {
        Args: {
          xcoordinate: number
          ycoordinate: number
          zcoordinate: number
          srid?: number
        }
        Returns: unknown
      }
      st_pointzm: {
        Args: {
          xcoordinate: number
          ycoordinate: number
          zcoordinate: number
          mcoordinate: number
          srid?: number
        }
        Returns: unknown
      }
      st_polyfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_polyfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_polygonfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_polygonfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_polygonize: {
        Args: { "": unknown[] }
        Returns: unknown
      }
      st_project: {
        Args: { geog: unknown; distance: number; azimuth: number }
        Returns: unknown
      }
      st_quantizecoordinates: {
        Args: {
          g: unknown
          prec_x: number
          prec_y?: number
          prec_z?: number
          prec_m?: number
        }
        Returns: unknown
      }
      st_reduceprecision: {
        Args: { geom: unknown; gridsize: number }
        Returns: unknown
      }
      st_relate: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: string
      }
      st_removerepeatedpoints: {
        Args: { geom: unknown; tolerance?: number }
        Returns: unknown
      }
      st_reverse: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_segmentize: {
        Args: { geog: unknown; max_segment_length: number }
        Returns: unknown
      }
      st_setsrid: {
        Args: { geog: unknown; srid: number } | { geom: unknown; srid: number }
        Returns: unknown
      }
      st_sharedpaths: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_shiftlongitude: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_shortestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_simplifypolygonhull: {
        Args: { geom: unknown; vertex_fraction: number; is_outer?: boolean }
        Returns: unknown
      }
      st_split: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_square: {
        Args: { size: number; cell_i: number; cell_j: number; origin?: unknown }
        Returns: unknown
      }
      st_squaregrid: {
        Args: { size: number; bounds: unknown }
        Returns: Record<string, unknown>[]
      }
      st_srid: {
        Args: { geog: unknown } | { geom: unknown }
        Returns: number
      }
      st_startpoint: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_subdivide: {
        Args: { geom: unknown; maxvertices?: number; gridsize?: number }
        Returns: unknown[]
      }
      st_summary: {
        Args: { "": unknown } | { "": unknown }
        Returns: string
      }
      st_swapordinates: {
        Args: { geom: unknown; ords: unknown }
        Returns: unknown
      }
      st_symdifference: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number }
        Returns: unknown
      }
      st_symmetricdifference: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_tileenvelope: {
        Args: {
          zoom: number
          x: number
          y: number
          bounds?: unknown
          margin?: number
        }
        Returns: unknown
      }
      st_touches: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_transform: {
        Args:
          | { geom: unknown; from_proj: string; to_proj: string }
          | { geom: unknown; from_proj: string; to_srid: number }
          | { geom: unknown; to_proj: string }
        Returns: unknown
      }
      st_triangulatepolygon: {
        Args: { g1: unknown }
        Returns: unknown
      }
      st_union: {
        Args:
          | { "": unknown[] }
          | { geom1: unknown; geom2: unknown }
          | { geom1: unknown; geom2: unknown; gridsize: number }
        Returns: unknown
      }
      st_voronoilines: {
        Args: { g1: unknown; tolerance?: number; extend_to?: unknown }
        Returns: unknown
      }
      st_voronoipolygons: {
        Args: { g1: unknown; tolerance?: number; extend_to?: unknown }
        Returns: unknown
      }
      st_within: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_wkbtosql: {
        Args: { wkb: string }
        Returns: unknown
      }
      st_wkttosql: {
        Args: { "": string }
        Returns: unknown
      }
      st_wrapx: {
        Args: { geom: unknown; wrap: number; move: number }
        Returns: unknown
      }
      st_x: {
        Args: { "": unknown }
        Returns: number
      }
      st_xmax: {
        Args: { "": unknown }
        Returns: number
      }
      st_xmin: {
        Args: { "": unknown }
        Returns: number
      }
      st_y: {
        Args: { "": unknown }
        Returns: number
      }
      st_ymax: {
        Args: { "": unknown }
        Returns: number
      }
      st_ymin: {
        Args: { "": unknown }
        Returns: number
      }
      st_z: {
        Args: { "": unknown }
        Returns: number
      }
      st_zmax: {
        Args: { "": unknown }
        Returns: number
      }
      st_zmflag: {
        Args: { "": unknown }
        Returns: number
      }
      st_zmin: {
        Args: { "": unknown }
        Returns: number
      }
      text: {
        Args: { "": unknown }
        Returns: string
      }
      unlockrows: {
        Args: { "": string }
        Returns: number
      }
      update_crop_cycle_totals: {
        Args: {
          p_cycle_id: string
          p_estimated_total_cost: number
          p_actual_total_cost: number
          p_total_revenue: number
          p_sugarcane_revenue: number
          p_intercrop_revenue: number
          p_net_profit: number
          p_profit_per_hectare: number
          p_profit_margin_percent: number
          p_sugarcane_actual_yield_tons_ha: number
        }
        Returns: boolean
      }
      updategeometrysrid: {
        Args: {
          catalogn_name: string
          schema_name: string
          table_name: string
          column_name: string
          new_srid_in: number
        }
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      geometry_dump: {
        path: number[] | null
        geom: unknown | null
      }
      valid_detail: {
        valid: boolean | null
        reason: string | null
        location: unknown | null
      }
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
