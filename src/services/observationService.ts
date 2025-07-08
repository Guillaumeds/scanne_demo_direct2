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
      console.log('📋 Loading observations for cycle:', cycleId)

      const { data, error } = await supabase
        .from('observations')
        .select('*')
        .eq('crop_cycle_id', cycleId)
        .order('created_at', { ascending: false })

      if (error) throw error

      console.log('📋 Raw observations from DB:', data?.length || 0, 'observations')

      const transformedObservations = (data || []).map(this.transformDbToLocal)

      console.log('📋 Transformed observations:', transformedObservations.length, 'observations')

      return transformedObservations
    } catch (error) {
      console.error('Error loading observations for cycle:', error)
      return []
    }
  }

  /**
   * Create a new observation using atomic database function
   */
  static async createObservation(observation: BlocObservation): Promise<BlocObservation> {
    try {
      console.log('💾 Creating observation with atomic transaction:', observation.name)

      // Prepare observation data
      const observationData = {
        crop_cycle_id: observation.cropCycleId,
        name: observation.name,
        description: observation.description,
        category: observation.category,
        status: observation.status || 'draft',
        observation_date: observation.observationDate,
        number_of_samples: observation.numberOfSamples,
        number_of_plants: observation.numberOfPlants,
        observation_data: observation.data || {},
        yield_tons_ha: observation.yieldTonsHa,
        area_hectares: observation.areaHectares,
        total_yield_tons: observation.totalYieldTons,
        notes: observation.notes
      }

      // Call atomic database function
      const { data, error } = await supabase.rpc('save_observation_with_totals', {
        p_observation_data: observationData
      })

      if (error) {
        console.error('Error creating observation:', error)
        throw new Error(`Failed to create observation: ${error.message}`)
      }

      if (!data || data.length === 0) {
        throw new Error('No data returned from observation creation')
      }

      const result = data[0]
      console.log('✅ Observation created with totals:', result)

      // Return the created observation (fetch fresh data)
      return await this.getObservationById(result.observation_id)
    } catch (error) {
      console.error('Error creating observation:', error)
      throw error
    }
  }
  
  /**
   * Update an existing observation using atomic database function
   */
  static async updateObservation(observationId: string, updates: Partial<BlocObservation>): Promise<BlocObservation> {
    try {
      console.log('💾 Updating observation with atomic transaction:', observationId)

      // Get existing observation to merge with updates
      const existingObservation = await this.getObservationById(observationId)
      if (!existingObservation) {
        throw new Error(`Observation with ID ${observationId} not found`)
      }

      // Merge existing data with updates
      const mergedObservation = { ...existingObservation, ...updates }

      // Prepare observation data for atomic function
      const observationData = {
        id: observationId, // Include ID for update
        crop_cycle_id: mergedObservation.cropCycleId,
        name: mergedObservation.name,
        description: mergedObservation.description,
        category: mergedObservation.category,
        status: mergedObservation.status || 'draft',
        observation_date: mergedObservation.observationDate,
        number_of_samples: mergedObservation.numberOfSamples,
        number_of_plants: mergedObservation.numberOfPlants,
        observation_data: mergedObservation.data || {},
        yield_tons_ha: mergedObservation.yieldTonsHa,
        area_hectares: mergedObservation.areaHectares,
        total_yield_tons: mergedObservation.totalYieldTons,
        notes: mergedObservation.notes
      }

      console.log('💾 Observation data for atomic update:', observationData)

      // Call atomic database function
      const { data, error } = await supabase.rpc('save_observation_with_totals', {
        p_observation_data: observationData
      })

      if (error) {
        console.error('❌ Error in atomic observation update:', error)
        throw new Error(`Failed to update observation: ${error.message}`)
      }

      console.log('✅ Observation updated with totals:', data)

      // Return the updated observation
      return await this.getObservationById(observationId) || mergedObservation
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

      // Recalculate crop cycle totals after deletion
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
    console.log('🔄 Transforming observation:', dbRecord.id, dbRecord.name)
    console.log('🗃️ Raw database record:', dbRecord)
    console.log('📊 Raw observation_data:', dbRecord.observation_data)
    console.log('🌾 Raw yield fields:', {
      yield_tons_ha: dbRecord.yield_tons_ha,
      area_hectares: dbRecord.area_hectares,
      total_yield_tons: dbRecord.total_yield_tons
    })

    const observation = {
      id: dbRecord.id,
      name: dbRecord.name,
      description: dbRecord.description,
      category: dbRecord.category,
      status: dbRecord.status,
      cropCycleId: dbRecord.crop_cycle_id,
      cropCycleType: 'plantation' as const, // Default, could be enhanced
      observationDate: dbRecord.observation_date,
      actualDate: dbRecord.actual_date,
      numberOfSamples: dbRecord.number_of_samples,
      numberOfPlants: dbRecord.number_of_plants,
      data: dbRecord.observation_data || {}, // Map observation_data to data field
      yieldTonsHa: dbRecord.yield_tons_ha,
      areaHectares: dbRecord.area_hectares,
      totalYieldTons: dbRecord.total_yield_tons,
      notes: dbRecord.notes,
      createdAt: dbRecord.created_at,
      updatedAt: dbRecord.updated_at,
      createdBy: dbRecord.created_by || 'system'
    }

    console.log('✅ Transformed observation:', observation)
    return observation
  }

  /**
   * Transform local BlocObservation updates to database format
   */
  private static transformLocalToDb(localUpdates: Partial<BlocObservation>): any {
    console.log('🔄 Transforming local updates to DB format:', localUpdates)

    const dbUpdates: any = {}

    if (localUpdates.name) dbUpdates.name = localUpdates.name
    if (localUpdates.description) dbUpdates.description = localUpdates.description
    if (localUpdates.category) dbUpdates.category = localUpdates.category
    if (localUpdates.status) dbUpdates.status = localUpdates.status
    if (localUpdates.cropCycleId) dbUpdates.crop_cycle_id = localUpdates.cropCycleId
    if (localUpdates.observationDate) dbUpdates.observation_date = localUpdates.observationDate
    if (localUpdates.actualDate) dbUpdates.actual_date = localUpdates.actualDate
    if (localUpdates.numberOfSamples) dbUpdates.number_of_samples = localUpdates.numberOfSamples
    if (localUpdates.numberOfPlants) dbUpdates.number_of_plants = localUpdates.numberOfPlants
    if (localUpdates.data) dbUpdates.observation_data = localUpdates.data // Map data to observation_data
    if (localUpdates.notes) dbUpdates.notes = localUpdates.notes

    // Add yield fields - these are critical!
    if (localUpdates.yieldTonsHa !== undefined) dbUpdates.yield_tons_ha = localUpdates.yieldTonsHa
    if (localUpdates.areaHectares !== undefined) dbUpdates.area_hectares = localUpdates.areaHectares
    if (localUpdates.totalYieldTons !== undefined) dbUpdates.total_yield_tons = localUpdates.totalYieldTons

    console.log('✅ Transformed DB updates:', dbUpdates)
    return dbUpdates
    if (localUpdates.notes) dbUpdates.notes = localUpdates.notes

    return dbUpdates
  }
}
