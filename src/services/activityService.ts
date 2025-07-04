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
import { CropCycleCalculationService } from './cropCycleCalculationService'
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

      return (data || []).map(this.transformDbToLocal)
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
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .eq('crop_cycle_id', cycleId)
        .order('created_at', { ascending: false })

      if (error) throw error

      return (data || []).map(this.transformDbToLocal)
    } catch (error) {
      console.error('Error loading activities for cycle:', error)
      return []
    }
  }

  /**
   * Create a new activity using atomic database function
   */
  static async createActivity(activity: BlocActivity): Promise<BlocActivity> {
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

      // Prepare products and resources
      const products = (activity.products || []).map(product => ({
        product_id: product.productId,
        product_name: product.productName,
        quantity: product.quantity,
        rate: product.rate,
        unit: product.unit,
        estimated_cost: product.estimatedCost || 0,
        actual_cost: product.actualCost || null
      }))

      const resources = (activity.resources || []).map(resource => ({
        resource_id: resource.resourceId,
        resource_name: resource.resourceName,
        hours: resource.hours,
        cost_per_hour: resource.costPerHour,
        estimated_cost: resource.estimatedCost || 0,
        actual_cost: resource.actualCost || null
      }))

      // Call atomic database function
      const { data, error } = await supabase.rpc('save_activity_with_totals', {
        p_activity_data: activityData,
        p_products: products,
        p_resources: resources
      })

      if (error) {
        console.error('Error creating activity:', error)
        throw new Error(`Failed to create activity: ${error.message}`)
      }

      if (!data || data.length === 0) {
        throw new Error('No data returned from activity creation')
      }

      const result = data[0]
      console.log('✅ Activity created with totals:', result)

      // Return the created activity (fetch fresh data)
      return await this.getActivityById(result.activity_id)
    } catch (error) {
      console.error('Error creating activity:', error)
      throw error
    }
  }
  
  /**
   * Update an existing activity using atomic database function
   */
  static async updateActivity(activityId: string, updates: Partial<BlocActivity>): Promise<BlocActivity> {
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

      // Prepare products and resources
      const products = (mergedActivity.products || []).map(product => ({
        product_id: product.productId,
        product_name: product.productName,
        quantity: product.quantity,
        rate: product.rate,
        unit: product.unit,
        estimated_cost: product.estimatedCost || 0,
        actual_cost: product.actualCost || null
      }))

      const resources = (mergedActivity.resources || []).map(resource => ({
        resource_id: resource.resourceId,
        resource_name: resource.resourceName,
        hours: resource.hours,
        cost_per_hour: resource.costPerHour,
        estimated_cost: resource.estimatedCost || 0,
        actual_cost: resource.actualCost || null
      }))

      // Call atomic database function
      const { data, error } = await supabase.rpc('save_activity_with_totals', {
        p_activity_data: activityData,
        p_products: products,
        p_resources: resources
      })

      if (error) {
        console.error('Error updating activity:', error)
        throw new Error(`Failed to update activity: ${error.message}`)
      }

      const result = data[0]
      console.log('✅ Activity updated with totals:', result)

      // Return the updated activity (fetch fresh data)
      return await this.getActivityById(activityId)
    } catch (error) {
      console.error('Error updating activity:', error)
      throw error
    }
  }

  /**
   * Delete an activity using atomic database function
   */
  static async deleteActivity(activityId: string): Promise<void> {
    try {
      console.log('💾 Deleting activity with atomic transaction:', activityId)

      // Call atomic database function
      const { data, error } = await supabase.rpc('delete_activity_with_totals', {
        p_activity_id: activityId
      })

      if (error) {
        console.error('Error deleting activity:', error)
        throw new Error(`Failed to delete activity: ${error.message}`)
      }

      if (!data || data.length === 0 || !data[0].success) {
        throw new Error('Activity not found or deletion failed')
      }

      const result = data[0]
      console.log('✅ Activity deleted with totals updated:', result)
    } catch (error) {
      console.error('Error deleting activity:', error)
      throw error
    }
  }

  /**
   * Get activity by ID
   */
  static async getActivityById(activityId: string): Promise<BlocActivity | null> {
    try {
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .eq('id', activityId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') return null // No rows returned
        throw error
      }

      return this.transformDbToLocal(data)
    } catch (error) {
      console.error('Error getting activity by ID:', error)
      return null
    }
  }

  /**
   * Auto-save activity (creates if new, updates if existing)
   */
  static async autoSaveActivity(activity: BlocActivity): Promise<BlocActivity> {
    const existingActivity = await this.getActivityById(activity.id)

    if (existingActivity) {
      return this.updateActivity(activity.id, activity)
    } else {
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
    const resourceData = resources.map(resource => ({
      activity_id: activityId,
      resource_id: resource.resourceId,
      resource_name: resource.resourceName,
      hours: resource.hours,
      cost_per_hour: resource.costPerHour,
      estimated_cost: resource.estimatedCost || 0,
      actual_cost: resource.actualCost || null
    }))

    const { error } = await supabase
      .from('activity_resources')
      .insert(resourceData)

    if (error) throw error
  }

  /**
   * Transform database record to local BlocActivity type
   */
  private static transformDbToLocal(dbRecord: any): BlocActivity {
    return {
      id: dbRecord.id,
      name: dbRecord.name,
      description: dbRecord.description,
      phase: dbRecord.phase,
      status: dbRecord.status,
      cropCycleId: dbRecord.crop_cycle_id,
      startDate: dbRecord.start_date,
      endDate: dbRecord.end_date,
      actualDate: dbRecord.actual_date,
      durationHours: dbRecord.duration_hours,
      estimatedTotalCost: dbRecord.estimated_total_cost || 0,
      actualTotalCost: dbRecord.actual_total_cost || 0,
      notes: dbRecord.notes,
      createdAt: dbRecord.created_at,
      updatedAt: dbRecord.updated_at,
      createdBy: dbRecord.created_by || 'system'
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
