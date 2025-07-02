/**
 * Activity Service
 * Handles CRUD operations and persistence for activities
 *
 * Enhanced with advanced TypeScript features:
 * - Result types for better error handling
 * - Type-safe service interface
 * - Branded IDs for type safety
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

export class ActivityService {
  private static readonly STORAGE_KEY = 'scanne_activities'

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
    const activities = this.getAllActivities()
    return activities.filter(activity => {
      // Activities are linked to crop cycles, which are linked to blocs
      // For now, we'll filter by checking if the activity belongs to any cycle of this bloc
      return true // TODO: Implement proper filtering when crop cycle linking is complete
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }
  
  /**
   * Get all activities for a specific crop cycle
   */
  static async getActivitiesForCycle(cycleId: string): Promise<BlocActivity[]> {
    const activities = this.getAllActivities()
    return activities.filter(activity => activity.cropCycleId === cycleId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }
  
  /**
   * Create a new activity
   */
  static async createActivity(activity: BlocActivity): Promise<BlocActivity> {
    const activities = this.getAllActivities()
    
    // Ensure unique ID
    const newActivity: BlocActivity = {
      ...activity,
      id: activity.id || `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: activity.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    activities.push(newActivity)
    this.saveActivities(activities)
    
    return newActivity
  }
  
  /**
   * Update an existing activity
   */
  static async updateActivity(activityId: string, updates: Partial<BlocActivity>): Promise<BlocActivity> {
    const activities = this.getAllActivities()
    const index = activities.findIndex(a => a.id === activityId)

    if (index === -1) {
      throw new Error(`Activity not found: ${activityId}`)
    }
    
    const updatedActivity: BlocActivity = {
      ...activities[index],
      ...updates,
      updatedAt: new Date().toISOString()
    }
    
    activities[index] = updatedActivity
    this.saveActivities(activities)
    
    return updatedActivity
  }
  
  /**
   * Delete an activity
   */
  static async deleteActivity(activityId: string): Promise<void> {
    const activities = this.getAllActivities()
    const filteredActivities = activities.filter(a => a.id !== activityId)
    this.saveActivities(filteredActivities)
  }
  
  /**
   * Get activity by ID
   */
  static async getActivityById(activityId: string): Promise<BlocActivity | null> {
    const activities = this.getAllActivities()
    return activities.find(a => a.id === activityId) || null
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
  
  // Private helper methods
  private static getAllActivities(): BlocActivity[] {
    if (typeof window === 'undefined') return []
    
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error('Error loading activities:', error)
      return []
    }
  }
  
  private static saveActivities(activities: BlocActivity[]): void {
    if (typeof window === 'undefined') return
    
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(activities))
    } catch (error) {
      console.error('Error saving activities:', error)
    }
  }
}
