/**
 * Observation Service
 * Database-only implementation for observation operations
 * Replaces localStorage with Supabase database calls and integrates crop cycle totals calculation
 */

import { BlocObservation } from '@/types/observations'
import { CropCycleCalculationService } from './cropCycleCalculationService'
import { supabase } from '@/lib/supabase'

export class ObservationService {
  
  /**
   * Get all observations for a specific bloc
   */
  static async getObservationsForBloc(blocId: string): Promise<BlocObservation[]> {
    try {
      const { data, error } = await supabase
        .from('observations')
        .select(`
          *,
          crop_cycles!inner(bloc_id)
        `)
        .eq('crop_cycles.bloc_id', blocId)
        .order('created_at', { ascending: false })

      if (error) throw error

      return (data || []).map(this.transformDbToLocal)
    } catch (error) {
      console.error('Error loading observations for bloc:', error)
      return []
    }
  }

  /**
   * Get all observations for a specific crop cycle
   */
  static async getObservationsForCycle(cycleId: string): Promise<BlocObservation[]> {
    try {
      const { data, error } = await supabase
        .from('observations')
        .select('*')
        .eq('crop_cycle_id', cycleId)
        .order('created_at', { ascending: false })

      if (error) throw error

      return (data || []).map(this.transformDbToLocal)
    } catch (error) {
      console.error('Error loading observations for cycle:', error)
      return []
    }
  }

  /**
   * Create a new observation
   */
  static async createObservation(observation: BlocObservation): Promise<BlocObservation> {
    try {
      const { data: observationData, error: observationError } = await supabase
        .from('observations')
        .insert({
          name: observation.name,
          description: observation.description,
          category: observation.category,
          status: 'draft',
          crop_cycle_id: observation.cropCycleId,
          observation_date: observation.observationDate,
          number_of_samples: observation.numberOfSamples,
          number_of_plants: observation.numberOfPlants,
          observation_data: observation.observationData,
          notes: observation.notes
        })
        .select()
        .single()

      if (observationError) {
        console.error('Error creating observation:', observationError)
        throw new Error(`Failed to create observation: ${observationError.message}`)
      }

      const newObservation = this.transformDbToLocal(observationData)

      // Recalculate and update crop cycle totals using database function
      if (observation.cropCycleId) {
        await CropCycleCalculationService.triggerRecalculation(observation.cropCycleId)
      }

      return newObservation
    } catch (error) {
      console.error('Error creating observation:', error)
      throw error
    }
  }
  
  /**
   * Update an existing observation
   */
  static async updateObservation(observationId: string, updates: Partial<BlocObservation>): Promise<BlocObservation> {
    try {
      // Transform local updates to database format
      const dbUpdates = this.transformLocalToDb(updates)

      const { data, error } = await supabase
        .from('observations')
        .update({
          ...dbUpdates,
          updated_at: new Date().toISOString()
        })
        .eq('id', observationId)
        .select()
        .single()

      if (error) throw error

      const updatedObservation = this.transformDbToLocal(data)

      // Recalculate and update crop cycle totals using database function
      if (updatedObservation.cropCycleId) {
        await CropCycleCalculationService.triggerRecalculation(updatedObservation.cropCycleId)
      }

      return updatedObservation
    } catch (error) {
      console.error('Error updating observation:', error)
      throw error
    }
  }

  /**
   * Delete an observation
   */
  static async deleteObservation(observationId: string): Promise<void> {
    try {
      // Get observation to find crop cycle ID before deletion
      const observation = await this.getObservationById(observationId)
      const cropCycleId = observation?.cropCycleId

      // Delete observation from database
      const { error } = await supabase
        .from('observations')
        .delete()
        .eq('id', observationId)

      if (error) throw error

      // Recalculate crop cycle totals after deletion using database function
      if (cropCycleId) {
        await CropCycleCalculationService.triggerRecalculation(cropCycleId)
      }
    } catch (error) {
      console.error('Error deleting observation:', error)
      throw error
    }
  }

  /**
   * Get observation by ID
   */
  static async getObservationById(observationId: string): Promise<BlocObservation | null> {
    try {
      const { data, error } = await supabase
        .from('observations')
        .select('*')
        .eq('id', observationId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') return null // No rows returned
        throw error
      }

      return this.transformDbToLocal(data)
    } catch (error) {
      console.error('Error getting observation by ID:', error)
      return null
    }
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

  /**
   * Transform database record to local BlocObservation type
   */
  private static transformDbToLocal(dbRecord: any): BlocObservation {
    return {
      id: dbRecord.id,
      name: dbRecord.name,
      description: dbRecord.description,
      category: dbRecord.category,
      status: dbRecord.status,
      cropCycleId: dbRecord.crop_cycle_id,
      observationDate: dbRecord.observation_date,
      numberOfSamples: dbRecord.number_of_samples,
      numberOfPlants: dbRecord.number_of_plants,
      observationData: dbRecord.observation_data,
      notes: dbRecord.notes,
      createdAt: dbRecord.created_at,
      updatedAt: dbRecord.updated_at,
      createdBy: dbRecord.created_by || 'system'
    }
  }

  /**
   * Transform local BlocObservation updates to database format
   */
  private static transformLocalToDb(localUpdates: Partial<BlocObservation>): any {
    const dbUpdates: any = {}

    if (localUpdates.name) dbUpdates.name = localUpdates.name
    if (localUpdates.description) dbUpdates.description = localUpdates.description
    if (localUpdates.category) dbUpdates.category = localUpdates.category
    if (localUpdates.status) dbUpdates.status = localUpdates.status
    if (localUpdates.cropCycleId) dbUpdates.crop_cycle_id = localUpdates.cropCycleId
    if (localUpdates.observationDate) dbUpdates.observation_date = localUpdates.observationDate
    if (localUpdates.numberOfSamples) dbUpdates.number_of_samples = localUpdates.numberOfSamples
    if (localUpdates.numberOfPlants) dbUpdates.number_of_plants = localUpdates.numberOfPlants
    if (localUpdates.observationData) dbUpdates.observation_data = localUpdates.observationData
    if (localUpdates.notes) dbUpdates.notes = localUpdates.notes

    return dbUpdates
  }
}
