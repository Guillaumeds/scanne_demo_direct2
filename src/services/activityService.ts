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
   * Create a new activity
   */
  static async createActivity(activity: BlocActivity): Promise<BlocActivity> {
    try {
      // Insert the main activity record
      const { data: activityData, error: activityError } = await supabase
        .from('activities')
        .insert({
          name: activity.name,
          description: activity.description,
          phase: activity.phase,
          status: 'planned',
          crop_cycle_id: activity.cropCycleId,
          start_date: activity.startDate,
          end_date: activity.endDate,
          estimated_total_cost: activity.estimatedTotalCost || 0,
          actual_total_cost: 0,
          notes: activity.notes
        })
        .select()
        .single()

      if (activityError) {
        console.error('Error creating activity:', activityError)
        throw new Error(`Failed to create activity: ${activityError.message}`)
      }

      const newActivity = this.transformDbToLocal(activityData)

      // Recalculate and update crop cycle totals using database function
      if (activity.cropCycleId) {
        await CropCycleCalculationService.triggerRecalculation(activity.cropCycleId)
      }

      return newActivity
    } catch (error) {
      console.error('Error creating activity:', error)
      throw error
    }
  }
  
  /**
   * Update an existing activity
   */
  static async updateActivity(activityId: string, updates: Partial<BlocActivity>): Promise<BlocActivity> {
    try {
      // Transform local updates to database format
      const dbUpdates = this.transformLocalToDb(updates)

      const { data, error } = await supabase
        .from('activities')
        .update({
          ...dbUpdates,
          updated_at: new Date().toISOString()
        })
        .eq('id', activityId)
        .select()
        .single()

      if (error) throw error

      const updatedActivity = this.transformDbToLocal(data)

      // Recalculate and update crop cycle totals using database function
      if (updatedActivity.cropCycleId) {
        await CropCycleCalculationService.triggerRecalculation(updatedActivity.cropCycleId)
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
      // Get activity to find crop cycle ID before deletion
      const activity = await this.getActivityById(activityId)
      const cropCycleId = activity?.cropCycleId

      // Delete activity from database
      const { error } = await supabase
        .from('activities')
        .delete()
        .eq('id', activityId)

      if (error) throw error

      // Recalculate crop cycle totals after deletion using database function
      if (cropCycleId) {
        await CropCycleCalculationService.triggerRecalculation(cropCycleId)
      }
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
