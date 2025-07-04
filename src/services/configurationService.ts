import { supabase } from '@/lib/supabase'

// Database types
export interface SugarcaneVariety {
  id: string
  variety_id: string
  name: string
  category: string
  harvest_start_month: string
  harvest_end_month: string
  seasons: string[]
  soil_types: string[]
  sugar_content_percent: number
  characteristics: any
  description: string
  icon: string
  information_leaflet_url?: string
  active: boolean
}

export interface IntercropVariety {
  id: string
  variety_id: string
  name: string
  scientific_name: string
  benefits: string[]
  planting_time: string
  harvest_time: string
  description: string
  icon: string
  image_url?: string
  active: boolean
}

export interface ActivityCategory {
  id: string
  category_id: string
  name: string
  description: string
  icon: string
  color: string
  active: boolean
  sort_order?: number
}

export interface ActivityTemplate {
  id: string
  template_id: string
  name: string
  description: string
  phase: string
  estimated_duration_hours: number
  resource_type: string
  estimated_cost: number
  typical_products?: any[]
  icon: string
  color: string
  active: boolean
  sort_order?: number
}

export interface ActivityPhase {
  id: string
  phase_id: string
  name: string
  description: string
  color: string
  icon: string
  duration_description: string
  sort_order?: number
  active: boolean
}

export interface ObservationCategory {
  id: string
  category_id: string
  name: string
  description: string
  icon: string
  color: string
  active: boolean
}

export interface AttachmentCategory {
  id: string
  category_id: string
  name: string
  description: string
  icon: string
  color: string
  active: boolean
}

export interface Product {
  id: string
  product_id: string
  name: string
  category: string
  description: string
  unit: string
  recommended_rate_per_ha: number
  cost_per_unit: number
  brand: string
  composition: string
  icon: string
  active: boolean
}

export interface Resource {
  id: string
  resource_id: string
  name: string
  category: string
  description: string
  unit: string
  cost_per_hour: number
  cost_per_unit: number
  skill_level: string
  overtime_multiplier: number
  icon: string
  active: boolean
}

export interface ConfigurationData {
  sugarcaneVarieties: SugarcaneVariety[]
  intercropVarieties: IntercropVariety[]
  activityCategories: ActivityCategory[]
  observationCategories: ObservationCategory[]
  attachmentCategories: AttachmentCategory[]
  products: Product[]
  resources: Resource[]
}

export class ConfigurationService {
  private static cache: ConfigurationData | null = null
  private static cacheTimestamp: number = 0
  private static readonly CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

  /**
   * Get all configuration data with caching
   */
  static async getAllConfiguration(): Promise<ConfigurationData> {
    const now = Date.now()
    
    // Return cached data if still valid
    if (this.cache && (now - this.cacheTimestamp) < this.CACHE_DURATION) {
      return this.cache
    }

    try {
      console.log('Loading configuration data from database...')

      // Load all configuration data in parallel
      const [
        sugarcaneVarieties,
        intercropVarieties,
        activityCategories,
        observationCategories,
        attachmentCategories,
        products,
        resources
      ] = await Promise.all([
        this.getSugarcaneVarieties(),
        this.getIntercropVarieties(),
        this.getActivityCategories(),
        this.getObservationCategories(),
        this.getAttachmentCategories(),
        this.getProducts(),
        this.getResources()
      ])

      this.cache = {
        sugarcaneVarieties,
        intercropVarieties,
        activityCategories,
        observationCategories,
        attachmentCategories,
        products,
        resources
      }
      this.cacheTimestamp = now

      console.log('Configuration data loaded successfully')
      return this.cache
    } catch (error) {
      console.error('Error loading configuration data:', error)
      throw error
    }
  }

  /**
   * Get sugarcane varieties
   */
  static async getSugarcaneVarieties(): Promise<SugarcaneVariety[]> {
    const { data, error } = await supabase
      .from('sugarcane_varieties')
      .select('*')
      .eq('active', true)
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true })

    if (error) {
      console.error('Error loading sugarcane varieties:', error)
      throw new Error(`Failed to load sugarcane varieties: ${error.message}`)
    }

    return data || []
  }

  /**
   * Get intercrop varieties
   */
  static async getIntercropVarieties(): Promise<IntercropVariety[]> {
    const { data, error } = await supabase
      .from('intercrop_varieties')
      .select('*')
      .eq('active', true)
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true })

    if (error) {
      console.error('Error loading intercrop varieties:', error)
      throw new Error(`Failed to load intercrop varieties: ${error.message}`)
    }

    return data || []
  }

  /**
   * Get activity categories
   */
  static async getActivityCategories(): Promise<ActivityCategory[]> {
    const { data, error } = await supabase
      .from('activity_categories')
      .select('*')
      .eq('active', true)
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true })

    if (error) {
      console.error('Error loading activity categories:', error)
      throw new Error(`Failed to load activity categories: ${error.message}`)
    }

    return data || []
  }

  /**
   * Get observation categories
   */
  static async getObservationCategories(): Promise<ObservationCategory[]> {
    const { data, error } = await supabase
      .from('observation_categories')
      .select('*')
      .eq('active', true)
      .order('name')

    if (error) {
      console.error('Error loading observation categories:', error)
      throw new Error(`Failed to load observation categories: ${error.message}`)
    }

    return data || []
  }

  /**
   * Get attachment categories
   */
  static async getAttachmentCategories(): Promise<AttachmentCategory[]> {
    const { data, error } = await supabase
      .from('attachment_categories')
      .select('*')
      .eq('active', true)
      .order('name')

    if (error) {
      console.error('Error loading attachment categories:', error)
      throw new Error(`Failed to load attachment categories: ${error.message}`)
    }

    return data || []
  }

  /**
   * Get products
   */
  static async getProducts(): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('active', true)
      .order('category', { ascending: true })
      .order('name', { ascending: true })

    if (error) {
      console.error('Error loading products:', error)
      throw new Error(`Failed to load products: ${error.message}`)
    }

    return data || []
  }

  /**
   * Get resources
   */
  static async getResources(): Promise<Resource[]> {
    const { data, error } = await supabase
      .from('resources')
      .select('*')
      .eq('active', true)
      .order('category', { ascending: true })
      .order('name', { ascending: true })

    if (error) {
      console.error('Error loading resources:', error)
      throw new Error(`Failed to load resources: ${error.message}`)
    }

    return data || []
  }

  /**
   * Get products by category
   */
  static async getProductsByCategory(category: string): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('active', true)
      .eq('category', category)
      .order('name')

    if (error) {
      console.error('Error loading products by category:', error)
      throw new Error(`Failed to load products: ${error.message}`)
    }

    return data || []
  }

  /**
   * Get resources by category
   */
  static async getResourcesByCategory(category: string): Promise<Resource[]> {
    const { data, error } = await supabase
      .from('resources')
      .select('*')
      .eq('active', true)
      .eq('category', category)
      .order('name')

    if (error) {
      console.error('Error loading resources by category:', error)
      throw new Error(`Failed to load resources: ${error.message}`)
    }

    return data || []
  }

  /**
   * Clear cache (useful for testing or when data is updated)
   */
  static clearCache(): void {
    this.cache = null
    this.cacheTimestamp = 0
    console.log('Configuration cache cleared')
  }

  /**
   * Get sugarcane variety by ID
   */
  static async getSugarcaneVarietyById(varietyId: string): Promise<SugarcaneVariety | null> {
    const varieties = await this.getSugarcaneVarieties()
    return varieties.find(v => v.variety_id === varietyId) || null
  }

  /**
   * Get intercrop variety by ID
   */
  static async getIntercropVarietyById(varietyId: string): Promise<IntercropVariety | null> {
    const varieties = await this.getIntercropVarieties()
    return varieties.find(v => v.variety_id === varietyId) || null
  }

  /**
   * Get activity category by ID
   */
  static async getActivityCategoryById(categoryId: string): Promise<ActivityCategory | null> {
    const categories = await this.getActivityCategories()
    return categories.find(c => c.category_id === categoryId) || null
  }

  /**
   * Get observation category by ID
   */
  static async getObservationCategoryById(categoryId: string): Promise<ObservationCategory | null> {
    const categories = await this.getObservationCategories()
    return categories.find(c => c.category_id === categoryId) || null
  }

  /**
   * Transform database sugarcane variety to frontend format
   */
  static transformSugarcaneVariety(dbVariety: SugarcaneVariety): any {
    return {
      id: dbVariety.variety_id,
      name: dbVariety.name,
      category: 'sugarcane',
      harvestStart: dbVariety.harvest_start_month,
      harvestEnd: dbVariety.harvest_end_month,
      seasons: dbVariety.seasons || [],
      soilTypes: dbVariety.soil_types || [],
      sugarContent: dbVariety.sugar_content_percent,
      characteristics: dbVariety.characteristics,
      description: dbVariety.description,
      icon: dbVariety.icon
    }
  }

  /**
   * Transform database intercrop variety to frontend format
   */
  static transformIntercropVariety(dbVariety: IntercropVariety): any {
    return {
      id: dbVariety.variety_id,
      name: dbVariety.name,
      scientificName: dbVariety.scientific_name,
      category: 'intercrop',
      benefits: dbVariety.benefits || [],
      plantingTime: dbVariety.planting_time,
      harvestTime: dbVariety.harvest_time,
      description: dbVariety.description,
      icon: dbVariety.icon,
      image: dbVariety.image_url
    }
  }

  /**
   * Get all varieties in frontend format
   */
  static async getAllVarietiesForFrontend(): Promise<any[]> {
    const config = await this.getAllConfiguration()

    const sugarcaneVarieties = config.sugarcaneVarieties.map(v => this.transformSugarcaneVariety(v))
    const intercropVarieties = config.intercropVarieties.map(v => this.transformIntercropVariety(v))

    return [...sugarcaneVarieties, ...intercropVarieties]
  }

  /**
   * Get activity templates from database
   */
  static async getActivityTemplates(): Promise<ActivityTemplate[]> {
    const { data, error } = await supabase
      .from('activity_templates')
      .select('*')
      .eq('active', true)
      .order('sort_order', { ascending: true })

    if (error) {
      console.error('Error loading activity templates:', error)
      throw new Error(`Failed to load activity templates: ${error.message}`)
    }

    return data || []
  }

  /**
   * Get activity phases from database
   */
  static async getActivityPhases(): Promise<ActivityPhase[]> {
    const { data, error } = await supabase
      .from('activity_phases')
      .select('*')
      .eq('active', true)
      .order('sort_order', { ascending: true })

    if (error) {
      console.error('Error loading activity phases:', error)
      throw new Error(`Failed to load activity phases: ${error.message}`)
    }

    return data || []
  }

  /**
   * Get activity template by ID
   */
  static async getActivityTemplateById(templateId: string): Promise<ActivityTemplate | null> {
    const templates = await this.getActivityTemplates()
    return templates.find(t => t.template_id === templateId) || null
  }

  /**
   * Get activity phase by ID
   */
  static async getActivityPhaseById(phaseId: string): Promise<ActivityPhase | null> {
    const phases = await this.getActivityPhases()
    return phases.find(p => p.phase_id === phaseId) || null
  }
}
