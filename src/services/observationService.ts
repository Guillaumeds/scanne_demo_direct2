/**
 * Observation Service
 * Handles CRUD operations and persistence for observations
 */

import { BlocObservation } from '@/types/observations'
import { CropCycleMetricsService } from './cropCycleMetricsService'
import { SupabaseObservationService } from './supabaseObservationService'

export class ObservationService {
  private static STORAGE_KEY = 'scanne_observations'
  
  /**
   * Get all observations for a specific bloc
   */
  static async getObservationsForBloc(blocId: string): Promise<BlocObservation[]> {
    const observations = this.getAllObservations()
    return observations.filter(observation => {
      // Observations are linked to crop cycles, which are linked to blocs
      // For now, we'll filter by checking if the observation belongs to any cycle of this bloc
      return true // TODO: Implement proper filtering when crop cycle linking is complete
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }
  
  /**
   * Get all observations for a specific crop cycle
   */
  static async getObservationsForCycle(cycleId: string): Promise<BlocObservation[]> {
    try {
      return await SupabaseObservationService.getObservationsForCycle(cycleId)
    } catch (error) {
      console.error('Error loading observations for cycle:', error)
      return []
    }
  }
  
  /**
   * Create a new observation
   */
  static async createObservation(observation: BlocObservation): Promise<BlocObservation> {
    const observations = this.getAllObservations()

    // Ensure unique ID
    const newObservation: BlocObservation = {
      ...observation,
      id: observation.id || `observation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: observation.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    observations.push(newObservation)
    this.saveObservations(observations)

    // Update crop cycle metrics
    try {
      await CropCycleMetricsService.onObservationChange(newObservation)
    } catch (error) {
      console.error('Failed to update crop cycle metrics after observation creation:', error)
    }

    return newObservation
  }
  
  /**
   * Update an existing observation
   */
  static async updateObservation(observationId: string, updates: Partial<BlocObservation>): Promise<BlocObservation> {
    const observations = this.getAllObservations()
    const index = observations.findIndex(o => o.id === observationId)

    if (index === -1) {
      throw new Error(`Observation not found: ${observationId}`)
    }

    const updatedObservation: BlocObservation = {
      ...observations[index],
      ...updates,
      updatedAt: new Date().toISOString()
    }

    observations[index] = updatedObservation
    this.saveObservations(observations)

    // Update crop cycle metrics
    try {
      await CropCycleMetricsService.onObservationChange(updatedObservation)
    } catch (error) {
      console.error('Failed to update crop cycle metrics after observation update:', error)
    }

    return updatedObservation
  }
  
  /**
   * Delete an observation
   */
  static async deleteObservation(observationId: string): Promise<void> {
    const observations = this.getAllObservations()
    const filteredObservations = observations.filter(o => o.id !== observationId)
    this.saveObservations(filteredObservations)
  }
  
  /**
   * Get observation by ID
   */
  static async getObservationById(observationId: string): Promise<BlocObservation | null> {
    const observations = this.getAllObservations()
    return observations.find(o => o.id === observationId) || null
  }
  
  /**
   * Auto-save observation (creates if new, updates if existing)
   */
  static async autoSaveObservation(observation: BlocObservation): Promise<BlocObservation> {
    const existingObservation = await this.getObservationById(observation.id)
    
    if (existingObservation) {
      return this.updateObservation(observation.id, observation)
    } else {
      return this.createObservation(observation)
    }
  }
  
  // Private helper methods
  private static getAllObservations(): BlocObservation[] {
    if (typeof window === 'undefined') return []
    
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error('Error loading observations:', error)
      return []
    }
  }
  
  private static saveObservations(observations: BlocObservation[]): void {
    if (typeof window === 'undefined') return
    
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(observations))
    } catch (error) {
      console.error('Error saving observations:', error)
    }
  }
}
