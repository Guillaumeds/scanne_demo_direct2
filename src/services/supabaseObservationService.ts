import { supabase } from '@/lib/supabase'
import { BlocObservation, ObservationCategory } from '@/types/observations'
import { CropCycleMetricsService } from './cropCycleMetricsService'

export interface CreateObservationRequest {
  name: string
  description?: string
  category: ObservationCategory
  cropCycleId: string
  observationDate: string
  numberOfSamples?: number
  numberOfPlants?: number
  observationData: Record<string, any>
  notes?: string
}

export interface UpdateObservationRequest {
  name?: string
  description?: string
  category?: ObservationCategory
  observationDate?: string
  actualDate?: string
  numberOfSamples?: number
  numberOfPlants?: number
  observationData?: Record<string, any>
  notes?: string
  status?: 'draft' | 'completed' | 'reviewed'
}

export class SupabaseObservationService {
  
  /**
   * Create a new observation
   */
  static async createObservation(request: CreateObservationRequest): Promise<BlocObservation> {
    try {
      console.log('Creating observation:', request)

      const { data: observationData, error: observationError } = await supabase
        .from('observations')
        .insert({
          name: request.name,
          description: request.description,
          category: request.category,
          status: 'draft',
          crop_cycle_id: request.cropCycleId,
          observation_date: request.observationDate,
          number_of_samples: request.numberOfSamples,
          number_of_plants: request.numberOfPlants,
          observation_data: request.observationData,
          notes: request.notes
        })
        .select()
        .single()

      if (observationError) {
        console.error('Error creating observation:', observationError)
        throw new Error(`Failed to create observation: ${observationError.message}`)
      }

      const observation = this.transformDatabaseToObservation(observationData)

      // Update crop cycle metrics if this is a yield observation
      if (request.category === 'sugarcane-yield-quality' || request.category === 'intercrop-yield-quality') {
        try {
          await CropCycleMetricsService.updateCycleMetrics(request.cropCycleId)
        } catch (error) {
          console.error('Failed to update cycle metrics after observation creation:', error)
        }
      }

      return observation
    } catch (error) {
      console.error('Error in createObservation:', error)
      throw error
    }
  }

  /**
   * Get observation by ID
   */
  static async getObservationById(observationId: string): Promise<BlocObservation> {
    try {
      const { data: observationData, error: observationError } = await supabase
        .from('observations')
        .select('*')
        .eq('id', observationId)
        .single()

      if (observationError) {
        throw new Error(`Failed to get observation: ${observationError.message}`)
      }

      return this.transformDatabaseToObservation(observationData)
    } catch (error) {
      console.error('Error getting observation by ID:', error)
      throw error
    }
  }

  /**
   * Get all observations for a crop cycle
   */
  static async getObservationsForCycle(cropCycleId: string): Promise<BlocObservation[]> {
    try {
      console.log('Loading observations for crop cycle:', cropCycleId)

      const { data: observationsData, error: observationsError } = await supabase
        .from('observations')
        .select('*')
        .eq('crop_cycle_id', cropCycleId)
        .order('observation_date', { ascending: false })

      if (observationsError) {
        console.error('Error loading observations:', observationsError)
        throw new Error(`Failed to load observations: ${observationsError.message}`)
      }

      if (!observationsData || observationsData.length === 0) {
        return []
      }

      const observations = observationsData.map(data => this.transformDatabaseToObservation(data))

      console.log(`Loaded ${observations.length} observations from database`)
      return observations
    } catch (error) {
      console.error('Error loading observations for cycle:', error)
      throw error
    }
  }

  /**
   * Update an observation
   */
  static async updateObservation(observationId: string, updates: UpdateObservationRequest): Promise<BlocObservation> {
    try {
      console.log('Updating observation:', observationId, updates)

      const { data: observationData, error: observationError } = await supabase
        .from('observations')
        .update({
          name: updates.name,
          description: updates.description,
          category: updates.category,
          status: updates.status,
          observation_date: updates.observationDate,
          actual_date: updates.actualDate,
          number_of_samples: updates.numberOfSamples,
          number_of_plants: updates.numberOfPlants,
          observation_data: updates.observationData,
          notes: updates.notes,
          updated_at: new Date().toISOString()
        })
        .eq('id', observationId)
        .select()
        .single()

      if (observationError) {
        throw new Error(`Failed to update observation: ${observationError.message}`)
      }

      const observation = this.transformDatabaseToObservation(observationData)

      // Update crop cycle metrics if this is a yield observation
      if (updates.category === 'sugarcane-yield-quality' || updates.category === 'intercrop-yield-quality' ||
          observation.category === 'sugarcane-yield-quality' || observation.category === 'intercrop-yield-quality') {
        try {
          await CropCycleMetricsService.updateCycleMetrics(observation.cropCycleId)
        } catch (error) {
          console.error('Failed to update cycle metrics after observation update:', error)
        }
      }

      return observation
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
      // Get observation data before deletion for metrics update
      const { data: observationData } = await supabase
        .from('observations')
        .select('crop_cycle_id, category')
        .eq('id', observationId)
        .single()

      // Delete observation
      const { error } = await supabase
        .from('observations')
        .delete()
        .eq('id', observationId)

      if (error) {
        throw new Error(`Failed to delete observation: ${error.message}`)
      }

      // Update crop cycle metrics if this was a yield observation
      if (observationData && observationData.category === 'yield') {
        try {
          await CropCycleMetricsService.updateCycleMetrics(observationData.crop_cycle_id)
        } catch (error) {
          console.error('Failed to update cycle metrics after observation deletion:', error)
        }
      }

      console.log('Observation deleted successfully')
    } catch (error) {
      console.error('Error deleting observation:', error)
      throw error
    }
  }

  /**
   * Get observations by category
   */
  static async getObservationsByCategory(cropCycleId: string, category: ObservationCategory): Promise<BlocObservation[]> {
    try {
      const { data: observationsData, error: observationsError } = await supabase
        .from('observations')
        .select('*')
        .eq('crop_cycle_id', cropCycleId)
        .eq('category', category)
        .order('observation_date', { ascending: false })

      if (observationsError) {
        throw new Error(`Failed to load observations: ${observationsError.message}`)
      }

      if (!observationsData || observationsData.length === 0) {
        return []
      }

      return observationsData.map(data => this.transformDatabaseToObservation(data))
    } catch (error) {
      console.error('Error loading observations by category:', error)
      throw error
    }
  }

  /**
   * Get yield observations for metrics calculation
   */
  static async getYieldObservationsForCycle(cropCycleId: string): Promise<BlocObservation[]> {
    return this.getObservationsByCategory(cropCycleId, 'yield')
  }

  /**
   * Transform database record to BlocObservation format
   */
  private static transformDatabaseToObservation(data: any): BlocObservation {
    return {
      id: data.id,
      name: data.name,
      description: data.description || '',
      category: data.category as ObservationCategory,
      status: data.status || 'draft',
      cropCycleId: data.crop_cycle_id,
      observationDate: data.observation_date,
      actualDate: data.actual_date,
      numberOfSamples: data.number_of_samples,
      numberOfPlants: data.number_of_plants,
      observationData: data.observation_data || {},
      notes: data.notes || '',
      createdAt: data.created_at,
      updatedAt: data.updated_at
    }
  }

  /**
   * Extract yield data from observations for metrics calculation
   */
  static extractYieldMetrics(observations: BlocObservation[]): {
    sugarcaneYieldTons: number
    sugarcaneYieldTonsPerHa: number
    intercropYieldTons: number
    intercropYieldTonsPerHa: number
    sugarcaneRevenue: number
    intercropRevenue: number
  } {
    let sugarcaneYieldTons = 0
    let sugarcaneYieldTonsPerHa = 0
    let intercropYieldTons = 0
    let intercropYieldTonsPerHa = 0
    let sugarcaneRevenue = 0
    let intercropRevenue = 0

    observations.forEach(obs => {
      if (obs.category === 'yield' && obs.observationData) {
        const data = obs.observationData

        // Sugarcane yield data
        if (data.yieldType === 'sugarcane' || data.cropType === 'sugarcane') {
          if (data.totalYieldTons) {
            sugarcaneYieldTons += parseFloat(data.totalYieldTons) || 0
          }
          if (data.yieldPerHectare) {
            sugarcaneYieldTonsPerHa += parseFloat(data.yieldPerHectare) || 0
          }
          if (data.sugarcaneRevenue) {
            sugarcaneRevenue += parseFloat(data.sugarcaneRevenue) || 0
          }
        }

        // Intercrop yield data
        if (data.yieldType === 'intercrop' || data.cropType === 'intercrop') {
          if (data.totalYieldTons) {
            intercropYieldTons += parseFloat(data.totalYieldTons) || 0
          }
          if (data.yieldPerHectare) {
            intercropYieldTonsPerHa += parseFloat(data.yieldPerHectare) || 0
          }
          if (data.intercropRevenue) {
            intercropRevenue += parseFloat(data.intercropRevenue) || 0
          }
        }
      }
    })

    return {
      sugarcaneYieldTons,
      sugarcaneYieldTonsPerHa,
      intercropYieldTons,
      intercropYieldTonsPerHa,
      sugarcaneRevenue,
      intercropRevenue
    }
  }
}
