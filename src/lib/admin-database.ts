/**
 * Database operations for admin functionality
 * Handles system configuration and estate setup data
 */

import { supabase } from './supabase'

// System Configuration Types
export interface SystemConfig {
  id?: string
  config_key: string
  config_group: string
  config_value: any
  description: string
  created_at?: string
  updated_at?: string
}

// Estate Setup Types
export interface Company {
  id?: string
  name: string
  registration_number?: string
  address?: string
  contact_email?: string
  contact_phone?: string
  headquarters_location?: { lat: number; lng: number }
  metadata?: any
  active?: boolean
}

export interface Farm {
  id?: string
  name: string
  description?: string
  farm_boundary: { coordinates: [number, number][] }
  center_location?: { lat: number; lng: number }
  total_area_hectares: number
  company_id: string
  primary_manager_id?: string
  metadata?: any
  active?: boolean
}

export interface Field {
  id?: string
  field_id: string
  field_name: string
  coordinates: { coordinates: [number, number][] }
  area_hectares: number
  status?: string
  osm_id?: number
  farm_id: string
  soil_properties?: any
  aggregated_analytics?: any
}

// System Configuration Operations
export class SystemConfigService {
  static async getAllConfigs(): Promise<SystemConfig[]> {
    const { data, error } = await supabase
      .from('system_config')
      .select('*')
      .order('config_group', { ascending: true })
      .order('config_key', { ascending: true })

    if (error) throw error
    return data || []
  }

  static async getConfigsByGroup(group: string): Promise<SystemConfig[]> {
    const { data, error } = await supabase
      .from('system_config')
      .select('*')
      .eq('config_group', group)
      .order('config_key', { ascending: true })

    if (error) throw error
    return data || []
  }

  static async updateConfig(configKey: string, newValue: any): Promise<void> {
    const { error } = await supabase
      .from('system_config')
      .update({ 
        config_value: newValue,
        updated_at: new Date().toISOString()
      })
      .eq('config_key', configKey)

    if (error) throw error
  }

  static async createConfig(config: Omit<SystemConfig, 'id' | 'created_at' | 'updated_at'>): Promise<SystemConfig> {
    const { data, error } = await supabase
      .from('system_config')
      .insert([config])
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async deleteConfig(configKey: string): Promise<void> {
    const { error } = await supabase
      .from('system_config')
      .delete()
      .eq('config_key', configKey)

    if (error) throw error
  }

  static async initializeDefaultConfigs(): Promise<void> {
    const defaultConfigs: Omit<SystemConfig, 'id' | 'created_at' | 'updated_at'>[] = [
      // General Settings
      {
        config_key: 'app_name',
        config_group: 'general',
        config_value: { value: 'Scanne Farm Management' },
        description: 'Application display name'
      },
      {
        config_key: 'company_name',
        config_group: 'general',
        config_value: { value: 'Your Farm Company' },
        description: 'Default company name for new farms'
      },
      {
        config_key: 'default_currency',
        config_group: 'general',
        config_value: { value: 'MUR', symbol: 'Rs' },
        description: 'Default currency for financial calculations'
      },
      {
        config_key: 'default_area_unit',
        config_group: 'general',
        config_value: { value: 'hectares', abbreviation: 'ha' },
        description: 'Default unit for area measurements'
      },

      // Activity Categories
      {
        config_key: 'activity_categories',
        config_group: 'categories',
        config_value: {
          categories: [
            { id: 'planting', name: 'Planting', icon: 'Sprout', color: '#22c55e' },
            { id: 'fertilizing', name: 'Fertilizing', icon: 'Droplets', color: '#3b82f6' },
            { id: 'pest_control', name: 'Pest Control', icon: 'Bug', color: '#ef4444' },
            { id: 'irrigation', name: 'Irrigation', icon: 'CloudRain', color: '#06b6d4' },
            { id: 'harvesting', name: 'Harvesting', icon: 'Scissors', color: '#f59e0b' },
            { id: 'maintenance', name: 'Maintenance', icon: 'Wrench', color: '#8b5cf6' }
          ]
        },
        description: 'Categories for farm activities with icons and colors'
      },

      // Observation Categories
      {
        config_key: 'observation_categories',
        config_group: 'categories',
        config_value: {
          categories: [
            { id: 'crop_health', name: 'Crop Health', icon: 'Heart', color: '#22c55e' },
            { id: 'pest_disease', name: 'Pest & Disease', icon: 'AlertTriangle', color: '#ef4444' },
            { id: 'soil_condition', name: 'Soil Condition', icon: 'Mountain', color: '#a3a3a3' },
            { id: 'weather_damage', name: 'Weather Damage', icon: 'CloudLightning', color: '#6366f1' },
            { id: 'equipment', name: 'Equipment', icon: 'Cog', color: '#f59e0b' },
            { id: 'general', name: 'General', icon: 'Eye', color: '#64748b' }
          ]
        },
        description: 'Categories for field observations with icons and colors'
      },

      // Attachment Categories
      {
        config_key: 'attachment_categories',
        config_group: 'categories',
        config_value: {
          categories: [
            { id: 'photos', name: 'Photos', icon: 'Camera', color: '#22c55e' },
            { id: 'documents', name: 'Documents', icon: 'FileText', color: '#3b82f6' },
            { id: 'reports', name: 'Reports', icon: 'BarChart3', color: '#f59e0b' },
            { id: 'certificates', name: 'Certificates', icon: 'Award', color: '#8b5cf6' },
            { id: 'maps', name: 'Maps', icon: 'Map', color: '#06b6d4' },
            { id: 'other', name: 'Other', icon: 'Paperclip', color: '#64748b' }
          ]
        },
        description: 'Categories for file attachments with icons and colors'
      },

      // Map Settings
      {
        config_key: 'default_map_center',
        config_group: 'mapping',
        config_value: { lat: -20.4400, lng: 57.6500 },
        description: 'Default map center coordinates (Mauritius)'
      },
      {
        config_key: 'default_map_zoom',
        config_group: 'mapping',
        config_value: { value: 13 },
        description: 'Default map zoom level'
      },
      {
        config_key: 'field_colors',
        config_group: 'mapping',
        config_value: {
          active: '#22c55e',
          inactive: '#ef4444',
          selected: '#3b82f6',
          hover: '#f59e0b'
        },
        description: 'Color scheme for field polygons on map'
      }
    ]

    const { error } = await supabase
      .from('system_config')
      .insert(defaultConfigs)

    if (error) throw error
  }
}

// Estate Setup Operations
export class EstateSetupService {
  static async createCompany(company: Omit<Company, 'id'>): Promise<Company> {
    const { data, error } = await supabase
      .from('companies')
      .insert([company])
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async getCompanyByName(name: string): Promise<Company | null> {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .eq('name', name)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data || null
  }

  static async createFarm(farm: Omit<Farm, 'id'>): Promise<Farm> {
    // Convert coordinates to PostGIS polygon format
    const polygonCoords = farm.farm_boundary.coordinates.map(coord => `${coord[1]} ${coord[0]}`).join(',')
    const polygonWKT = `POLYGON((${polygonCoords}))`

    const farmData = {
      ...farm,
      farm_boundary: polygonWKT,
      center_location: farm.center_location ? `POINT(${farm.center_location.lng} ${farm.center_location.lat})` : null
    }

    const { data, error } = await supabase
      .from('farms')
      .insert([farmData])
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async createFields(fields: Omit<Field, 'id'>[]): Promise<Field[]> {
    // Convert coordinates to PostGIS polygon format for each field
    const fieldsData = fields.map(field => ({
      ...field,
      coordinates: `POLYGON((${field.coordinates.coordinates.map(coord => `${coord[1]} ${coord[0]}`).join(',')}))`
    }))

    const { data, error } = await supabase
      .from('fields')
      .insert(fieldsData)
      .select()

    if (error) throw error
    return data || []
  }

  static async saveEstateSetup(params: {
    companyName: string
    farmName: string
    farmBoundary: { coordinates: [number, number][] }
    totalArea: number
    selectedFields: Array<{
      field_id: string
      field_name: string
      coordinates: [number, number][]
      area_hectares: number
    }>
  }): Promise<{ company: Company; farm: Farm; fields: Field[] }> {
    try {
      // Start transaction-like operation
      let company = await this.getCompanyByName(params.companyName)
      
      if (!company) {
        company = await this.createCompany({
          name: params.companyName,
          active: true
        })
      }

      // Calculate farm center
      const centerLat = params.farmBoundary.coordinates.reduce((sum, coord) => sum + coord[0], 0) / params.farmBoundary.coordinates.length
      const centerLng = params.farmBoundary.coordinates.reduce((sum, coord) => sum + coord[1], 0) / params.farmBoundary.coordinates.length

      const farm = await this.createFarm({
        name: params.farmName,
        description: `Farm created via Estate Setup on ${new Date().toLocaleDateString()}`,
        farm_boundary: params.farmBoundary,
        center_location: { lat: centerLat, lng: centerLng },
        total_area_hectares: params.totalArea,
        company_id: company.id!,
        active: true
      })

      const fieldsToCreate = params.selectedFields.map(field => ({
        field_id: field.field_id,
        field_name: field.field_name,
        coordinates: { coordinates: field.coordinates },
        area_hectares: field.area_hectares,
        farm_id: farm.id!,
        status: 'active'
      }))

      const fields = await this.createFields(fieldsToCreate)

      return { company, farm, fields }
    } catch (error) {
      console.error('Error saving estate setup:', error)
      throw error
    }
  }
}
