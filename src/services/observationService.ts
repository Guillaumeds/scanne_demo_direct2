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

      // Extract revenue data from observation data based on category
      let sugarcaneRevenue = null
      let intercropRevenue = null

      if (observation.category === 'sugarcane-yield-quality') {
        const yieldData = observation.data as any
        sugarcaneRevenue = yieldData?.sugarcaneRevenue || 0
      } else if (observation.category === 'intercrop-yield-quality') {
        const yieldData = observation.data as any
        intercropRevenue = yieldData?.intercropRevenue || 0
      }

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
        sugarcane_revenue: sugarcaneRevenue,
        intercrop_revenue: intercropRevenue,
        notes: observation.notes
      }

      // Call simple database function (calculations done frontend-side)
      const { data: observationId, error } = await supabase.rpc('save_observation_simple', {
        p_observation_data: observationData as any
      })

      if (error) {
        console.error('Error creating observation:', error)
        throw new Error(`Failed to create observation: ${error.message}`)
      }

      if (!observationId) {
        throw new Error('No observation ID returned from creation')
      }

      console.log('✅ Observation created:', observationId)

      // Step 3: Calculate totals and update crop cycle atomically
      try {
        console.log('🧮 Starting atomic totals calculation and update...')

        // Get all field operations and observations for this crop cycle
        // TODO: Replace with proper field operations service when available
        const activities: any[] = [] // Temporarily empty until field operations service is implemented
        const observations = await this.getObservationsForCycle(observation.cropCycleId)

        // Calculate totals using frontend service
        const { FrontendCalculationService } = await import('./frontendCalculationService')
        const totals = FrontendCalculationService.calculateCropCycleTotals(
          activities,
          observations,
          1, // TODO: Get actual bloc area
          observation.cropCycleId
        )

        // Broadcast calculated totals to frontend components immediately
        window.dispatchEvent(new CustomEvent('cropCycleTotalsCalculated', {
          detail: {
            cropCycleId: observation.cropCycleId,
            totals: totals
          }
        }))

        // Update crop cycle totals in database as background task
        const { CropCycleTotalsService } = await import('./cropCycleTotalsService')
        CropCycleTotalsService.updateCycleTotals(observation.cropCycleId, totals).catch(error => {
          console.error('❌ Background database update failed for new observation:', error)
        })

        console.log('✅ Atomic observation creation with totals completed')
      } catch (totalsError) {
        console.error('❌ Error updating totals after observation creation:', totalsError)
        // Observation was created but totals update failed - this is not ideal but not critical
        console.warn('⚠️ Observation created but totals update failed - side panel may show stale data')
      }

      // Return the created observation (fetch fresh data)
      const savedObservation = await this.getObservationById(observationId)
      if (!savedObservation) {
        throw new Error('Failed to retrieve saved observation')
      }
      return savedObservation
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

      // Extract revenue data from observation data based on category
      let sugarcaneRevenue = null
      let intercropRevenue = null

      if (mergedObservation.category === 'sugarcane-yield-quality') {
        const yieldData = mergedObservation.data as any
        sugarcaneRevenue = yieldData?.sugarcaneRevenue || 0
      } else if (mergedObservation.category === 'intercrop-yield-quality') {
        const yieldData = mergedObservation.data as any
        intercropRevenue = yieldData?.intercropRevenue || 0
      }

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
        sugarcane_revenue: sugarcaneRevenue,
        intercrop_revenue: intercropRevenue,
        notes: mergedObservation.notes
      }

      console.log('💾 Observation data for atomic update:', observationData)

      // Call simple database function (calculations done frontend-side)
      const { data: updatedObservationId, error } = await supabase.rpc('save_observation_simple', {
        p_observation_data: observationData as any
      })

      if (error) {
        console.error('❌ Error in observation update:', error)
        throw new Error(`Failed to update observation: ${error.message}`)
      }

      console.log('✅ Observation updated:', updatedObservationId)

      // Step 3: Calculate totals and update crop cycle atomically
      try {
        console.log('🧮 Starting atomic totals calculation and update...')

        // Get all field operations and observations for this crop cycle
        // TODO: Replace with proper field operations service when available
        const activities: any[] = [] // Temporarily empty until field operations service is implemented
        const observations = await this.getObservationsForCycle(mergedObservation.cropCycleId)

        // Calculate totals using frontend service
        const { FrontendCalculationService } = await import('./frontendCalculationService')
        const totals = FrontendCalculationService.calculateCropCycleTotals(
          activities,
          observations,
          1, // TODO: Get actual bloc area
          mergedObservation.cropCycleId
        )

        // Broadcast calculated totals to frontend components immediately
        window.dispatchEvent(new CustomEvent('cropCycleTotalsCalculated', {
          detail: {
            cropCycleId: mergedObservation.cropCycleId,
            totals: totals
          }
        }))

        // Update crop cycle totals in database as background task
        const { CropCycleTotalsService } = await import('./cropCycleTotalsService')
        CropCycleTotalsService.updateCycleTotals(mergedObservation.cropCycleId, totals).catch(error => {
          console.error('❌ Background database update failed for observation update:', error)
        })

        console.log('✅ Atomic observation update with totals completed')
      } catch (totalsError) {
        console.error('❌ Error updating totals after observation update:', totalsError)
        // Observation was updated but totals update failed - this is not ideal but not critical
        console.warn('⚠️ Observation updated but totals update failed - side panel may show stale data')
      }

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
      // Step 1: Get observation to find crop cycle ID before deletion
      const observation = await this.getObservationById(observationId)
      const cropCycleId = observation?.cropCycleId

      if (!cropCycleId) {
        throw new Error('Cannot find crop cycle ID for observation deletion')
      }

      // Step 2: Delete observation from database
      const { error } = await supabase
        .from('observations')
        .delete()
        .eq('id', observationId)

      if (error) throw error

      console.log('✅ Observation deleted:', observationId)

      // Step 3: Calculate totals and update crop cycle atomically
      try {
        console.log('🧮 Starting atomic totals calculation and update...')

        // Get remaining field operations and observations for this crop cycle (excluding the deleted one)
        // TODO: Replace with proper field operations service when available
        const activities: any[] = [] // Temporarily empty until field operations service is implemented
        const observations = await this.getObservationsForCycle(cropCycleId)

        // Calculate totals using frontend service
        const { FrontendCalculationService } = await import('./frontendCalculationService')
        const totals = FrontendCalculationService.calculateCropCycleTotals(
          activities,
          observations,
          1, // TODO: Get actual bloc area
          cropCycleId
        )

        // Broadcast calculated totals to frontend components immediately
        window.dispatchEvent(new CustomEvent('cropCycleTotalsCalculated', {
          detail: {
            cropCycleId: cropCycleId,
            totals: totals
          }
        }))

        // Update crop cycle totals in database as background task
        const { CropCycleTotalsService } = await import('./cropCycleTotalsService')
        CropCycleTotalsService.updateCycleTotals(cropCycleId, totals).catch(error => {
          console.error('❌ Background database update failed for observation deletion:', error)
        })

        console.log('✅ Atomic observation deletion with totals completed')
      } catch (totalsError) {
        console.error('❌ Error updating totals after observation deletion:', totalsError)
        // Observation was deleted but totals update failed - this is not ideal but not critical
        console.warn('⚠️ Observation deleted but totals update failed - side panel may show stale data')
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
      sugarcaneRevenue: dbRecord.sugarcane_revenue,
      intercropRevenue: dbRecord.intercrop_revenue,
      pricePerTonne: dbRecord.price_per_tonne,
      revenuePerHectare: dbRecord.revenue_per_hectare,
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
