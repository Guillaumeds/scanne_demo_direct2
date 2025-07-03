import { supabase } from '@/lib/supabase'
import { BlocActivity, ActivityStatus, ActivityPhase, ActivityProduct, ActivityResource } from '@/types/activities'
import { CropCycleMetricsService } from './cropCycleMetricsService'

export interface CreateActivityRequest {
  name: string
  description?: string
  phase: ActivityPhase
  cropCycleId: string
  startDate?: string
  endDate?: string
  estimatedTotalCost?: number
  notes?: string
  products?: ActivityProduct[]
  resources?: ActivityResource[]
}

export interface UpdateActivityRequest {
  name?: string
  description?: string
  phase?: ActivityPhase
  status?: ActivityStatus
  startDate?: string
  endDate?: string
  actualDate?: string
  durationHours?: number
  estimatedTotalCost?: number
  actualTotalCost?: number
  notes?: string
  products?: ActivityProduct[]
  resources?: ActivityResource[]
}

export class SupabaseActivityService {
  
  /**
   * Create a new activity
   */
  static async createActivity(request: CreateActivityRequest): Promise<BlocActivity> {
    try {
      console.log('Creating activity:', request)

      // Insert the main activity record
      const { data: activityData, error: activityError } = await supabase
        .from('activities')
        .insert({
          name: request.name,
          description: request.description,
          phase: request.phase,
          status: 'planned',
          crop_cycle_id: request.cropCycleId,
          start_date: request.startDate,
          end_date: request.endDate,
          estimated_total_cost: request.estimatedTotalCost || 0,
          actual_total_cost: 0,
          notes: request.notes
        })
        .select()
        .single()

      if (activityError) {
        console.error('Error creating activity:', activityError)
        throw new Error(`Failed to create activity: ${activityError.message}`)
      }

      const activityId = activityData.id

      // Insert products if provided
      if (request.products && request.products.length > 0) {
        const productInserts = request.products.map(product => ({
          activity_id: activityId,
          product_id: product.productId,
          quantity: product.quantity,
          rate_per_hectare: product.ratePerHectare,
          unit: product.unit,
          estimated_cost: product.estimatedCost || 0,
          actual_cost: product.actualCost || 0,
          actual_quantity_used: product.actualQuantityUsed
        }))

        const { error: productsError } = await supabase
          .from('activity_products')
          .insert(productInserts)

        if (productsError) {
          console.error('Error creating activity products:', productsError)
          // Don't throw here, just log the error
        }
      }

      // Insert resources if provided
      if (request.resources && request.resources.length > 0) {
        const resourceInserts = request.resources.map(resource => ({
          activity_id: activityId,
          resource_id: resource.resourceId,
          hours_planned: resource.hoursPlanned,
          hours_actual: resource.hoursActual,
          unit: resource.unit,
          estimated_cost: resource.estimatedCost || 0,
          actual_cost: resource.actualCost || 0
        }))

        const { error: resourcesError } = await supabase
          .from('activity_resources')
          .insert(resourceInserts)

        if (resourcesError) {
          console.error('Error creating activity resources:', resourcesError)
          // Don't throw here, just log the error
        }
      }

      // Get the complete activity with products and resources
      const activity = await this.getActivityById(activityId)
      
      // Update crop cycle metrics
      try {
        await CropCycleMetricsService.updateCycleMetrics(request.cropCycleId)
      } catch (error) {
        console.error('Failed to update cycle metrics after activity creation:', error)
      }

      return activity
    } catch (error) {
      console.error('Error in createActivity:', error)
      throw error
    }
  }

  /**
   * Get activity by ID with products and resources
   */
  static async getActivityById(activityId: string): Promise<BlocActivity> {
    try {
      // Get main activity data
      const { data: activityData, error: activityError } = await supabase
        .from('activities')
        .select('*')
        .eq('id', activityId)
        .single()

      if (activityError) {
        throw new Error(`Failed to get activity: ${activityError.message}`)
      }

      // Get products
      const { data: productsData, error: productsError } = await supabase
        .from('activity_products')
        .select(`
          *,
          products (
            id,
            name,
            category,
            unit,
            cost_per_unit
          )
        `)
        .eq('activity_id', activityId)

      if (productsError) {
        console.error('Error loading activity products:', productsError)
      }

      // Get resources
      const { data: resourcesData, error: resourcesError } = await supabase
        .from('activity_resources')
        .select(`
          *,
          resources (
            id,
            name,
            category,
            unit,
            cost_per_hour
          )
        `)
        .eq('activity_id', activityId)

      if (resourcesError) {
        console.error('Error loading activity resources:', resourcesError)
      }

      // Transform to BlocActivity format
      return this.transformDatabaseToActivity(activityData, productsData || [], resourcesData || [])
    } catch (error) {
      console.error('Error getting activity by ID:', error)
      throw error
    }
  }

  /**
   * Get all activities for a crop cycle
   */
  static async getActivitiesForCycle(cropCycleId: string): Promise<BlocActivity[]> {
    try {
      console.log('Loading activities for crop cycle:', cropCycleId)

      // Get all activities for the crop cycle
      const { data: activitiesData, error: activitiesError } = await supabase
        .from('activities')
        .select('*')
        .eq('crop_cycle_id', cropCycleId)
        .order('created_at', { ascending: true })

      if (activitiesError) {
        console.error('Error loading activities:', activitiesError)
        throw new Error(`Failed to load activities: ${activitiesError.message}`)
      }

      if (!activitiesData || activitiesData.length === 0) {
        return []
      }

      // Get all activity IDs
      const activityIds = activitiesData.map(a => a.id)

      // Get all products for these activities
      const { data: productsData, error: productsError } = await supabase
        .from('activity_products')
        .select(`
          *,
          products (
            id,
            name,
            category,
            unit,
            cost_per_unit
          )
        `)
        .in('activity_id', activityIds)

      if (productsError) {
        console.error('Error loading activity products:', productsError)
      }

      // Get all resources for these activities
      const { data: resourcesData, error: resourcesError } = await supabase
        .from('activity_resources')
        .select(`
          *,
          resources (
            id,
            name,
            category,
            unit,
            cost_per_hour
          )
        `)
        .in('activity_id', activityIds)

      if (resourcesError) {
        console.error('Error loading activity resources:', resourcesError)
      }

      // Group products and resources by activity ID
      const productsByActivity = new Map<string, any[]>()
      const resourcesByActivity = new Map<string, any[]>()

      if (productsData) {
        productsData.forEach(product => {
          if (!productsByActivity.has(product.activity_id)) {
            productsByActivity.set(product.activity_id, [])
          }
          productsByActivity.get(product.activity_id)!.push(product)
        })
      }

      if (resourcesData) {
        resourcesData.forEach(resource => {
          if (!resourcesByActivity.has(resource.activity_id)) {
            resourcesByActivity.set(resource.activity_id, [])
          }
          resourcesByActivity.get(resource.activity_id)!.push(resource)
        })
      }

      // Transform all activities
      const activities = activitiesData.map(activityData => {
        const products = productsByActivity.get(activityData.id) || []
        const resources = resourcesByActivity.get(activityData.id) || []
        return this.transformDatabaseToActivity(activityData, products, resources)
      })

      console.log(`Loaded ${activities.length} activities from database`)
      return activities
    } catch (error) {
      console.error('Error loading activities for cycle:', error)
      throw error
    }
  }

  /**
   * Update an activity
   */
  static async updateActivity(activityId: string, updates: UpdateActivityRequest): Promise<BlocActivity> {
    try {
      console.log('Updating activity:', activityId, updates)

      // Update main activity record
      const { data: activityData, error: activityError } = await supabase
        .from('activities')
        .update({
          name: updates.name,
          description: updates.description,
          phase: updates.phase,
          status: updates.status,
          start_date: updates.startDate,
          end_date: updates.endDate,
          actual_date: updates.actualDate,
          duration_hours: updates.durationHours,
          estimated_total_cost: updates.estimatedTotalCost,
          actual_total_cost: updates.actualTotalCost,
          notes: updates.notes,
          updated_at: new Date().toISOString()
        })
        .eq('id', activityId)
        .select()
        .single()

      if (activityError) {
        throw new Error(`Failed to update activity: ${activityError.message}`)
      }

      // Handle products updates if provided
      if (updates.products !== undefined) {
        // Delete existing products
        await supabase
          .from('activity_products')
          .delete()
          .eq('activity_id', activityId)

        // Insert new products
        if (updates.products.length > 0) {
          const productInserts = updates.products.map(product => ({
            activity_id: activityId,
            product_id: product.productId,
            quantity: product.quantity,
            rate_per_hectare: product.ratePerHectare,
            unit: product.unit,
            estimated_cost: product.estimatedCost || 0,
            actual_cost: product.actualCost || 0,
            actual_quantity_used: product.actualQuantityUsed
          }))

          await supabase
            .from('activity_products')
            .insert(productInserts)
        }
      }

      // Handle resources updates if provided
      if (updates.resources !== undefined) {
        // Delete existing resources
        await supabase
          .from('activity_resources')
          .delete()
          .eq('activity_id', activityId)

        // Insert new resources
        if (updates.resources.length > 0) {
          const resourceInserts = updates.resources.map(resource => ({
            activity_id: activityId,
            resource_id: resource.resourceId,
            hours_planned: resource.hoursPlanned,
            hours_actual: resource.hoursActual,
            unit: resource.unit,
            estimated_cost: resource.estimatedCost || 0,
            actual_cost: resource.actualCost || 0
          }))

          await supabase
            .from('activity_resources')
            .insert(resourceInserts)
        }
      }

      // Get updated activity
      const updatedActivity = await this.getActivityById(activityId)

      // Update crop cycle metrics
      try {
        await CropCycleMetricsService.updateCycleMetrics(activityData.crop_cycle_id)
      } catch (error) {
        console.error('Failed to update cycle metrics after activity update:', error)
      }

      return updatedActivity
    } catch (error) {
      console.error('Error updating activity:', error)
      throw error
    }
  }

  /**
   * Delete an activity
   */
  static async deleteActivity(activityId: string): Promise<void> {
    try {
      // Get crop cycle ID before deletion for metrics update
      const { data: activityData } = await supabase
        .from('activities')
        .select('crop_cycle_id')
        .eq('id', activityId)
        .single()

      // Delete activity (cascade will handle products and resources)
      const { error } = await supabase
        .from('activities')
        .delete()
        .eq('id', activityId)

      if (error) {
        throw new Error(`Failed to delete activity: ${error.message}`)
      }

      // Update crop cycle metrics
      if (activityData) {
        try {
          await CropCycleMetricsService.updateCycleMetrics(activityData.crop_cycle_id)
        } catch (error) {
          console.error('Failed to update cycle metrics after activity deletion:', error)
        }
      }

      console.log('Activity deleted successfully')
    } catch (error) {
      console.error('Error deleting activity:', error)
      throw error
    }
  }

  /**
   * Transform database records to BlocActivity format
   */
  private static transformDatabaseToActivity(
    activityData: any,
    productsData: any[],
    resourcesData: any[]
  ): BlocActivity {
    const products: ActivityProduct[] = productsData.map(p => ({
      id: p.id,
      productId: p.product_id,
      productName: p.products?.name || 'Unknown Product',
      quantity: p.quantity,
      ratePerHectare: p.rate_per_hectare,
      unit: p.unit,
      estimatedCost: p.estimated_cost,
      actualCost: p.actual_cost,
      actualQuantityUsed: p.actual_quantity_used
    }))

    const resources: ActivityResource[] = resourcesData.map(r => ({
      id: r.id,
      resourceId: r.resource_id,
      resourceName: r.resources?.name || 'Unknown Resource',
      hoursPlanned: r.hours_planned,
      hoursActual: r.hours_actual,
      unit: r.unit,
      estimatedCost: r.estimated_cost,
      actualCost: r.actual_cost
    }))

    return {
      id: activityData.id,
      name: activityData.name,
      description: activityData.description || '',
      phase: activityData.phase as ActivityPhase,
      status: activityData.status as ActivityStatus,
      cropCycleId: activityData.crop_cycle_id,
      startDate: activityData.start_date,
      endDate: activityData.end_date,
      actualDate: activityData.actual_date,
      durationHours: activityData.duration_hours,
      estimatedTotalCost: activityData.estimated_total_cost || 0,
      actualTotalCost: activityData.actual_total_cost || 0,
      notes: activityData.notes || '',
      products,
      resources,
      createdAt: activityData.created_at,
      updatedAt: activityData.updated_at
    }
  }
}
