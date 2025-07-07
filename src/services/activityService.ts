/**
 * Activity Service
 * Database-only implementation for activity operations
 * Replaces localStorage with Supabase database calls and integrates crop cycle totals calculation
 */

import { BlocActivity } from '@/types/activities'
import {
  Result,
  AsyncResult,
  CreatePayload,
  UpdatePayload,
  ActivityId,
  createActivityId,
  AppError,
  retry
} from '@/types/utils'
import { FrontendCalculationService } from '@/services/frontendCalculationService'
import { CropCycleTotalsService } from '@/services/cropCycleTotalsService'
import { supabase } from '@/lib/supabase'

export class ActivityService {

  /**
   * Enhanced error handling with Result types
   */
  private static handleError(error: unknown, operation: string): never {
    const message = error instanceof Error ? error.message : 'Unknown error'
    throw new AppError(`Activity ${operation} failed: ${message}`, 'ACTIVITY_ERROR')
  }

  /**
   * Get all activities for a specific bloc
   */
  static async getActivitiesForBloc(blocId: string): Promise<BlocActivity[]> {
    try {
      const { data, error } = await supabase
        .from('activities')
        .select(`
          *,
          crop_cycles!inner(bloc_id)
        `)
        .eq('crop_cycles.bloc_id', blocId)
        .order('created_at', { ascending: false })

      if (error) throw error

      return await Promise.all((data || []).map(record => this.transformDbToLocal(record)))
    } catch (error) {
      console.error('Error loading activities for bloc:', error)
      return []
    }
  }

  /**
   * Get all activities for a specific crop cycle
   */
  static async getActivitiesForCycle(cycleId: string): Promise<BlocActivity[]> {
    try {
      console.log('📋 Loading activities for cycle:', cycleId)

      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .eq('crop_cycle_id', cycleId)
        .order('created_at', { ascending: false })

      if (error) throw error

      console.log('📋 Raw activities from DB:', data?.length || 0, 'activities')

      const transformedActivities = await Promise.all((data || []).map(record => this.transformDbToLocal(record)))

      console.log('📋 Transformed activities:', transformedActivities.length, 'activities with products/resources loaded')

      return transformedActivities
    } catch (error) {
      console.error('Error loading activities for cycle:', error)
      return []
    }
  }

  /**
   * Create a new activity using simple database function
   */
  static async createActivity(activity: BlocActivity): Promise<BlocActivity> {
    return this._createActivityInternal(activity)
  }

  /**
   * Internal activity creation method
   */
  private static async _createActivityInternal(activity: BlocActivity): Promise<BlocActivity> {
    try {
      console.log('💾 Creating activity with atomic transaction:', activity.name)

      // Prepare activity data
      const activityData = {
        crop_cycle_id: activity.cropCycleId,
        name: activity.name,
        description: activity.description,
        phase: activity.phase,
        status: activity.status || 'planned',
        start_date: activity.startDate,
        end_date: activity.endDate,
        duration: activity.duration,
        notes: activity.notes
      }

      // Convert product string IDs to UUIDs and prepare products
      const products = await Promise.all((activity.products || []).map(async product => {
        const productUuid = await this.getProductUuidById(product.productId)
        return {
          product_id: productUuid,
          product_name: product.productName,
          quantity: product.quantity,
          rate: product.rate,
          unit: product.unit,
          estimated_cost: product.estimatedCost || 0,
          actual_cost: product.actualCost || null
        }
      }))

      // Convert resource string IDs to UUIDs and prepare resources
      const resources = await Promise.all((activity.resources || []).map(async resource => {
        const resourceUuid = await this.getResourceUuidById(resource.resourceId)
        // Calculate cost per hour from estimated cost and hours
        const costPerHour = resource.hours > 0 ? (resource.estimatedCost || 0) / resource.hours : 0
        return {
          resource_id: resourceUuid,
          resource_name: resource.resourceName,
          hours: resource.hours,
          cost_per_hour: costPerHour,
          estimated_cost: resource.estimatedCost || 0,
          actual_cost: resource.actualCost || null
        }
      }))

      // Atomic operation: Save activity + calculate and update totals
      console.log('🔄 Starting atomic activity creation with totals update...')

      // Step 1: Save activity to database
      const { data, error } = await supabase.rpc('save_activity_simple', {
        p_activity_data: activityData,
        p_products: products,
        p_resources: resources
      })

      if (error) {
        console.error('Error creating activity:', error)
        throw new Error(`Failed to create activity: ${error.message}`)
      }

      if (!data) {
        throw new Error('No data returned from activity creation')
      }

      const activityId = data
      console.log('✅ Activity created:', activityId)

      // Get the created activity
      const createdActivity = await this.getActivityById(activityId)

      if (!createdActivity || !createdActivity.cropCycleId) {
        throw new Error('Failed to retrieve created activity or missing crop cycle ID')
      }

      // Step 2: Calculate totals and update crop cycle atomically
      try {
        console.log('🧮 Starting atomic totals calculation and update...')

        // Get all activities for this crop cycle (including the one we just created)
        const activities = await this.getActivitiesForCycle(createdActivity.cropCycleId)
        console.log('🔍 Activities fetched for calculation:', activities.length, 'activities')
        console.log('🔍 Activity IDs:', activities.map(a => `${a.id.substring(0, 8)}... (${a.name})`))

        const observations: any[] = [] // TODO: Get observations when available

        // Clear any cached calculations first
        console.log('🧹 Clearing localStorage cache for cycle:', createdActivity.cropCycleId)
        FrontendCalculationService.clearCycleTotals(createdActivity.cropCycleId)

        // Calculate totals using frontend service
        console.log('🧮 Calculating totals with', activities.length, 'activities')
        const totals = FrontendCalculationService.calculateCropCycleTotals(
          activities,
          observations,
          1, // TODO: Get actual bloc area
          createdActivity.cropCycleId
        )
        console.log('💰 Calculated totals:', {
          estimated: totals.estimatedTotalCost,
          actual: totals.actualTotalCost,
          revenue: totals.totalRevenue
        })

        // Update crop cycle totals in database
        await CropCycleTotalsService.updateCycleTotals(createdActivity.cropCycleId, totals)

        console.log('✅ Atomic activity creation with totals completed')
        return createdActivity

      } catch (totalsError) {
        console.error('❌ Error updating totals after activity creation:', totalsError)
        // Activity was saved but totals update failed - this is not ideal but not critical
        // We could implement compensation logic here if needed
        console.warn('⚠️ Activity saved but totals update failed - side panel may show stale data')
        return createdActivity
      }
    } catch (error) {
      console.error('Error creating activity:', error)
      throw error
    }
  }
  
  /**
   * Update an existing activity using simple database function
   */
  static async updateActivity(activityId: string, updates: Partial<BlocActivity>): Promise<BlocActivity> {
    return this._updateActivityInternal(activityId, updates)
  }

  /**
   * Internal activity update method
   */
  private static async _updateActivityInternal(activityId: string, updates: Partial<BlocActivity>): Promise<BlocActivity> {
    try {
      console.log('💾 Updating activity with atomic transaction:', activityId)

      // Get existing activity to merge with updates
      const existingActivity = await this.getActivityById(activityId)
      const mergedActivity = { ...existingActivity, ...updates }

      // Prepare activity data with ID for update
      const activityData = {
        id: activityId,
        crop_cycle_id: mergedActivity.cropCycleId,
        name: mergedActivity.name,
        description: mergedActivity.description,
        phase: mergedActivity.phase,
        status: mergedActivity.status,
        start_date: mergedActivity.startDate,
        end_date: mergedActivity.endDate,
        duration: mergedActivity.duration,
        notes: mergedActivity.notes
      }

      // Convert product string IDs to UUIDs and prepare products
      const products = await Promise.all((mergedActivity.products || []).map(async product => {
        const productUuid = await this.getProductUuidById(product.productId)
        return {
          product_id: productUuid,
          product_name: product.productName,
          quantity: product.quantity,
          rate: product.rate,
          unit: product.unit,
          estimated_cost: product.estimatedCost || 0,
          actual_cost: product.actualCost || null
        }
      }))

      // Convert resource string IDs to UUIDs and prepare resources
      const resources = await Promise.all((mergedActivity.resources || []).map(async resource => {
        const resourceUuid = await this.getResourceUuidById(resource.resourceId)
        // Calculate cost per hour from estimated cost and hours
        const costPerHour = resource.hours > 0 ? (resource.estimatedCost || 0) / resource.hours : 0
        return {
          resource_id: resourceUuid,
          resource_name: resource.resourceName,
          hours: resource.hours,
          cost_per_hour: costPerHour,
          estimated_cost: resource.estimatedCost || 0,
          actual_cost: resource.actualCost || null
        }
      }))

      // Atomic operation: Update activity + calculate and update totals
      console.log('🔄 Starting atomic activity update with totals update...')

      // Step 1: Update activity in database
      const { data, error } = await supabase.rpc('save_activity_simple', {
        p_activity_data: activityData,
        p_products: products,
        p_resources: resources
      })

      if (error) {
        console.error('Error updating activity:', error)
        throw new Error(`Failed to update activity: ${error.message}`)
      }

      const updatedActivityId = data
      console.log('✅ Activity updated:', updatedActivityId)

      // Get the updated activity
      const updatedActivity = await this.getActivityById(activityId)

      if (!updatedActivity || !updatedActivity.cropCycleId) {
        throw new Error('Failed to retrieve updated activity or missing crop cycle ID')
      }

      // Step 2: Calculate totals and update crop cycle atomically
      try {
        console.log('🧮 Starting atomic totals calculation and update...')

        // Get all activities for this crop cycle (including the updated one)
        const activities = await this.getActivitiesForCycle(updatedActivity.cropCycleId)
        const observations: any[] = [] // TODO: Get observations when available

        // Calculate totals using frontend service
        const totals = FrontendCalculationService.calculateCropCycleTotals(
          activities,
          observations,
          1, // TODO: Get actual bloc area
          updatedActivity.cropCycleId
        )

        // Update crop cycle totals in database
        await CropCycleTotalsService.updateCycleTotals(updatedActivity.cropCycleId, totals)

        // Broadcast calculated totals to frontend components
        window.dispatchEvent(new CustomEvent('cropCycleTotalsCalculated', {
          detail: {
            cropCycleId: updatedActivity.cropCycleId,
            totals: totals
          }
        }))

        console.log('✅ Atomic activity update with totals completed')
        return updatedActivity

      } catch (totalsError) {
        console.error('❌ Error updating totals after activity update:', totalsError)
        // Activity was updated but totals update failed - this is not ideal but not critical
        console.warn('⚠️ Activity updated but totals update failed - side panel may show stale data')
        return updatedActivity
      }
    } catch (error) {
      console.error('Error updating activity:', error)
      throw error
    }
  }

  /**
   * Delete an activity using simple database function
   */
  static async deleteActivity(activityId: string): Promise<void> {
    return this._deleteActivityInternal(activityId)
  }

  /**
   * Internal activity deletion method
   */
  private static async _deleteActivityInternal(activityId: string): Promise<void> {
    try {
      console.log('💾 Deleting activity (simple deletion):', activityId)

      // Atomic operation: Delete activity + calculate and update totals
      console.log('🔄 Starting atomic activity deletion with totals update...')

      // Step 1: Get activity before deletion to get crop cycle ID
      const activity = await this.getActivityById(activityId)
      if (!activity || !activity.cropCycleId) {
        throw new Error('Activity not found or missing crop cycle ID')
      }

      const cropCycleId = activity.cropCycleId

      // Step 2: Delete activity from database
      const { error } = await supabase
        .from('activities')
        .delete()
        .eq('id', activityId)

      if (error) {
        console.error('Error deleting activity:', error)
        throw new Error(`Failed to delete activity: ${error.message}`)
      }

      console.log('✅ Activity deleted:', activityId)

      // Step 3: Calculate totals and update crop cycle atomically
      try {
        console.log('🧮 Starting atomic totals calculation and update...')

        // Get remaining activities for this crop cycle (excluding the deleted one)
        const activities = await this.getActivitiesForCycle(cropCycleId)
        const observations: any[] = [] // TODO: Get observations when available

        // Calculate totals using frontend service
        const totals = FrontendCalculationService.calculateCropCycleTotals(
          activities,
          observations,
          1, // TODO: Get actual bloc area
          cropCycleId
        )

        // Update crop cycle totals in database
        await CropCycleTotalsService.updateCycleTotals(cropCycleId, totals)

        console.log('✅ Atomic activity deletion with totals completed')

      } catch (totalsError) {
        console.error('❌ Error updating totals after activity deletion:', totalsError)
        // Activity was deleted but totals update failed - this is not ideal but not critical
        console.warn('⚠️ Activity deleted but totals update failed - side panel may show stale data')
      }
    } catch (error) {
      console.error('Error deleting activity:', error)
      throw error
    }
  }

  /**
   * Get activity by ID with products and resources
   */
  static async getActivityById(activityId: string): Promise<BlocActivity | null> {
    try {
      // BEST PRACTICE: Assume caller has validated UUID format
      // This method should only be called with valid UUIDs
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .eq('id', activityId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') return null // No rows returned
        throw error
      }

      return await this.transformDbToLocal(data)
    } catch (error) {
      console.error('Error getting activity by ID:', error)
      return null
    }
  }

  /**
   * Validate if a string is a valid UUID format
   */
  private static isValidUUID(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    return uuidRegex.test(uuid)
  }

  /**
   * Get product UUID by string ID
   */
  private static async getProductUuidById(productId: string): Promise<string> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id')
        .eq('product_id', productId)
        .eq('active', true)
        .single()

      if (error) {
        throw new Error(`Failed to find product UUID for ID '${productId}': ${error.message}`)
      }

      if (!data) {
        throw new Error(`Product with ID '${productId}' not found in database`)
      }

      return data.id
    } catch (error) {
      console.error('Error getting product UUID:', error)
      throw error
    }
  }

  /**
   * Get resource UUID by string ID
   */
  private static async getResourceUuidById(resourceId: string): Promise<string> {
    try {
      const { data, error } = await supabase
        .from('resources')
        .select('id')
        .eq('resource_id', resourceId)
        .eq('active', true)
        .single()

      if (error) {
        throw new Error(`Failed to find resource UUID for ID '${resourceId}': ${error.message}`)
      }

      if (!data) {
        throw new Error(`Resource with ID '${resourceId}' not found in database`)
      }

      return data.id
    } catch (error) {
      console.error('Error getting resource UUID:', error)
      throw error
    }
  }

  /**
   * Get product string ID by UUID (reverse lookup)
   */
  private static async getProductStringIdByUuid(productUuid: string): Promise<string> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('product_id')
        .eq('id', productUuid)
        .eq('active', true)
        .single()

      if (error) {
        throw new Error(`Failed to find product string ID for UUID '${productUuid}': ${error.message}`)
      }

      if (!data) {
        throw new Error(`Product with UUID '${productUuid}' not found in database`)
      }

      return data.product_id
    } catch (error) {
      console.error('Error getting product string ID:', error)
      throw error
    }
  }

  /**
   * Get resource string ID by UUID (reverse lookup)
   */
  private static async getResourceStringIdByUuid(resourceUuid: string): Promise<string> {
    try {
      const { data, error } = await supabase
        .from('resources')
        .select('resource_id')
        .eq('id', resourceUuid)
        .eq('active', true)
        .single()

      if (error) {
        throw new Error(`Failed to find resource string ID for UUID '${resourceUuid}': ${error.message}`)
      }

      if (!data) {
        throw new Error(`Resource with UUID '${resourceUuid}' not found in database`)
      }

      return data.resource_id
    } catch (error) {
      console.error('Error getting resource string ID:', error)
      throw error
    }
  }

  /**
   * Auto-save activity (creates if new, updates if existing)
   */
  static async autoSaveActivity(activity: BlocActivity): Promise<BlocActivity> {
    // BEST PRACTICE: Validate UUID format before database query
    if (!activity.id || activity.id.trim() === '' || !this.isValidUUID(activity.id)) {
      console.log('🆕 Creating new activity (invalid/empty ID):', activity.id)
      return this.createActivity(activity)
    }

    // Only query database with valid UUID
    const existingActivity = await this.getActivityById(activity.id)

    if (existingActivity) {
      console.log('📝 Updating existing activity:', activity.id)
      return this.updateActivity(activity.id, activity)
    } else {
      console.log('🆕 Creating new activity (valid ID not found):', activity.id)
      return this.createActivity(activity)
    }
  }

  /**
   * Calculate estimated cost from products and resources
   */
  private static calculateEstimatedCost(activity: BlocActivity): number {
    const productCosts = (activity.products || []).reduce((sum, product) => {
      return sum + (product.estimatedCost || 0)
    }, 0)

    const resourceCosts = (activity.resources || []).reduce((sum, resource) => {
      return sum + (resource.estimatedCost || 0)
    }, 0)

    return Math.round((productCosts + resourceCosts) * 100) / 100 // Round to 2 decimals
  }

  /**
   * Save activity products to database
   */
  private static async saveActivityProducts(activityId: string, products: any[]): Promise<void> {
    if (!products || products.length === 0) return

    // Delete existing products
    await supabase
      .from('activity_products')
      .delete()
      .eq('activity_id', activityId)

    // Insert new products
    const productData = products.map(product => ({
      activity_id: activityId,
      product_id: product.productId,
      product_name: product.productName,
      quantity: product.quantity,
      rate: product.rate,
      unit: product.unit,
      estimated_cost: product.estimatedCost || 0,
      actual_cost: product.actualCost || null
    }))

    const { error } = await supabase
      .from('activity_products')
      .insert(productData)

    if (error) throw error
  }

  /**
   * Save activity resources to database
   */
  private static async saveActivityResources(activityId: string, resources: any[]): Promise<void> {
    if (!resources || resources.length === 0) return

    // Delete existing resources
    await supabase
      .from('activity_resources')
      .delete()
      .eq('activity_id', activityId)

    // Insert new resources
    const resourceData = resources.map(resource => {
      // Calculate cost per hour from estimated cost and hours
      const costPerHour = resource.hours > 0 ? (resource.estimatedCost || 0) / resource.hours : 0
      return {
        activity_id: activityId,
        resource_id: resource.resourceId,
        resource_name: resource.resourceName,
        hours: resource.hours,
        cost_per_hour: costPerHour,
        estimated_cost: resource.estimatedCost || 0,
        actual_cost: resource.actualCost || null
      }
    })

    const { error } = await supabase
      .from('activity_resources')
      .insert(resourceData)

    if (error) throw error
  }

  /**
   * Transform database record to local BlocActivity type
   */
  private static async transformDbToLocal(dbRecord: any): Promise<BlocActivity> {
    console.log('🔄 Transforming activity:', dbRecord.id, dbRecord.name)

    // Get products and resources separately to avoid JOIN complexity
    const products = await this.getActivityProducts(dbRecord.id)
    const resources = await this.getActivityResources(dbRecord.id)

    const activity = {
      id: dbRecord.id,
      name: dbRecord.name,
      description: dbRecord.description,
      phase: dbRecord.phase,
      status: dbRecord.status,
      cropCycleId: dbRecord.crop_cycle_id,
      cropCycleType: 'plantation', // Default, could be enhanced
      startDate: dbRecord.start_date,
      endDate: dbRecord.end_date,
      actualDate: dbRecord.actual_date,
      duration: dbRecord.duration || 0,
      products,
      resources,
      notes: dbRecord.notes,
      createdAt: dbRecord.created_at,
      updatedAt: dbRecord.updated_at,
      createdBy: dbRecord.created_by || 'system'
    }

    console.log('✅ Transformed activity with', products.length, 'products and', resources.length, 'resources')
    return activity
  }

  /**
   * Get products for an activity
   */
  private static async getActivityProducts(activityId: string): Promise<any[]> {
    try {
      console.log('🔍 Loading products for activity:', activityId)

      // Step 1: Get activity_products records
      const { data: activityProductsData, error: apError } = await supabase
        .from('activities')
        .select(`
          activity_products:activity_products!activity_id (
            product_id,
            product_name,
            quantity,
            rate,
            unit,
            estimated_cost,
            actual_cost
          )
        `)
        .eq('id', activityId)
        .single()

      if (apError) {
        console.error('❌ Error getting activity products:', apError)
        return []
      }

      console.log('📦 Raw activity_products data:', activityProductsData)

      const activityProducts = (activityProductsData as any)?.activity_products || []

      if (activityProducts.length === 0) {
        console.log('📦 No products found for activity')
        return []
      }

      // Step 2: Convert product UUIDs to string IDs
      const products = await Promise.all(activityProducts.map(async (ap: any) => {
        try {
          const productStringId = await this.getProductStringIdByUuid(ap.product_id)
          return {
            productId: productStringId,
            productName: ap.product_name,
            quantity: parseFloat(ap.quantity) || 0,
            rate: parseFloat(ap.rate) || 0,
            unit: ap.unit,
            estimatedCost: parseFloat(ap.estimated_cost) || 0,
            actualCost: ap.actual_cost ? parseFloat(ap.actual_cost) : undefined
          }
        } catch (error) {
          console.error('❌ Error converting product UUID:', ap.product_id, error)
          return null
        }
      }))

      const validProducts = products.filter(p => p !== null)
      console.log('✅ Transformed products:', validProducts)
      return validProducts
    } catch (error) {
      console.error('❌ Error getting activity products:', error)
      return []
    }
  }

  /**
   * Get resources for an activity
   */
  private static async getActivityResources(activityId: string): Promise<any[]> {
    try {
      console.log('🔍 Loading resources for activity:', activityId)

      // Step 1: Get activity_resources records
      const { data: activityResourcesData, error: arError } = await supabase
        .from('activities')
        .select(`
          activity_resources:activity_resources!activity_id (
            resource_id,
            resource_name,
            hours,
            estimated_cost,
            actual_cost
          )
        `)
        .eq('id', activityId)
        .single()

      if (arError) {
        console.error('❌ Error getting activity resources:', arError)
        return []
      }

      console.log('🔧 Raw activity_resources data:', activityResourcesData)

      const activityResources = (activityResourcesData as any)?.activity_resources || []

      if (activityResources.length === 0) {
        console.log('🔧 No resources found for activity')
        return []
      }

      // Step 2: Convert resource UUIDs to string IDs
      const resources = await Promise.all(activityResources.map(async (ar: any) => {
        try {
          const resourceStringId = await this.getResourceStringIdByUuid(ar.resource_id)
          return {
            resourceId: resourceStringId,
            resourceName: ar.resource_name,
            hours: parseFloat(ar.hours) || 0,
            unit: 'hours',
            estimatedCost: parseFloat(ar.estimated_cost) || 0,
            actualCost: ar.actual_cost ? parseFloat(ar.actual_cost) : undefined,
            category: 'general'
          }
        } catch (error) {
          console.error('❌ Error converting resource UUID:', ar.resource_id, error)
          return null
        }
      }))

      const validResources = resources.filter(r => r !== null)
      console.log('✅ Transformed resources:', validResources)
      return validResources
    } catch (error) {
      console.error('❌ Error getting activity resources:', error)
      return []
    }
  }

  /**
   * Transform local BlocActivity updates to database format
   */
  private static transformLocalToDb(localUpdates: Partial<BlocActivity>): any {
    const dbUpdates: any = {}

    if (localUpdates.name) dbUpdates.name = localUpdates.name
    if (localUpdates.description) dbUpdates.description = localUpdates.description
    if (localUpdates.phase) dbUpdates.phase = localUpdates.phase
    if (localUpdates.status) dbUpdates.status = localUpdates.status
    if (localUpdates.cropCycleId) dbUpdates.crop_cycle_id = localUpdates.cropCycleId
    if (localUpdates.startDate) dbUpdates.start_date = localUpdates.startDate
    if (localUpdates.endDate) dbUpdates.end_date = localUpdates.endDate
    if (localUpdates.actualDate) dbUpdates.actual_date = localUpdates.actualDate
    if (localUpdates.durationHours) dbUpdates.duration_hours = localUpdates.durationHours
    if (localUpdates.estimatedTotalCost !== undefined) dbUpdates.estimated_total_cost = localUpdates.estimatedTotalCost
    if (localUpdates.actualTotalCost !== undefined) dbUpdates.actual_total_cost = localUpdates.actualTotalCost
    if (localUpdates.notes) dbUpdates.notes = localUpdates.notes

    return dbUpdates
  }


}
