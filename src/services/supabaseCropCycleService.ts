/**
 * Supabase Crop Cycle Service
 * Database-driven replacement for localStorage-based CropCycleService
 */

import { supabase } from '@/lib/supabase'
import type { 
  CropCycle as LocalCropCycle, 
  CreateCycleRequest, 
  CloseCycleRequest,
  CycleClosureValidation,
  CyclePermissions,
  GrowthStage
} from '@/types/cropCycles'

// Database types from Supabase
import type { CropCycle as DbCropCycle, SugarcaneVariety, IntercropVariety } from '@/lib/supabase'

interface BlocCycleData {
  blocId: string
  blocStatus: 'active' | 'retired'
  hasActiveCycle: boolean
  cycleType?: string
  varietyName?: string
  intercropName?: string
  cycleNumber?: number
  plannedHarvestDate?: string
  growthStage?: string
  growthStageName?: string
  growthStageColor?: string
  growthStageIcon?: string
  daysSincePlanting?: number
}

// Growth stage configuration
const GROWTH_STAGES = [
  {
    stage: 'germination' as GrowthStage,
    name: 'Germination',
    description: 'Sprouting and initial root development',
    dayRange: '0-30 days',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    icon: '🌱'
  },
  {
    stage: 'tillering' as GrowthStage,
    name: 'Tillering',
    description: 'Multiple shoots developing from base',
    dayRange: '30-120 days',
    color: 'bg-green-100 text-green-800 border-green-200',
    icon: '🌿'
  },
  {
    stage: 'grand-growth' as GrowthStage,
    name: 'Grand Growth',
    description: 'Rapid vertical growth and biomass accumulation',
    dayRange: '120-270 days',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: '🎋'
  },
  {
    stage: 'maturation' as GrowthStage,
    name: 'Maturation',
    description: 'Sugar accumulation and stalk hardening',
    dayRange: '270-360 days',
    color: 'bg-orange-100 text-orange-800 border-orange-200',
    icon: '🌾'
  },
  {
    stage: 'ripening' as GrowthStage,
    name: 'Ripening',
    description: 'Maximum sugar content, ready for harvest',
    dayRange: '360+ days',
    color: 'bg-purple-100 text-purple-800 border-purple-200',
    icon: '🏆'
  },
  {
    stage: 'harvested' as GrowthStage,
    name: 'Harvested',
    description: 'Crop has been harvested',
    dayRange: 'Complete',
    color: 'bg-gray-100 text-gray-800 border-gray-200',
    icon: '✅'
  }
]

export class SupabaseCropCycleService {
  
  /**
   * Get all crop cycles from database
   */
  static async getAllCropCycles(): Promise<LocalCropCycle[]> {
    try {
      const { data, error } = await supabase
        .from('crop_cycles')
        .select(`
          *,
          sugarcane_varieties(name, variety_id),
          intercrop_varieties(name, variety_id),
          blocs(name, area_hectares)
        `)
        .order('created_at', { ascending: false })
      
      if (error) {
        console.error('Error fetching crop cycles:', error)
        throw error
      }
      
      // Transform database records to local types
      return (data || []).map(this.transformDbToLocal)
    } catch (error) {
      console.error('Failed to fetch crop cycles:', error)
      return []
    }
  }

  /**
   * Get crop cycles for a specific bloc
   */
  static async getCropCyclesForBloc(blocId: string): Promise<LocalCropCycle[]> {
    try {
      const { data, error } = await supabase
        .from('crop_cycles')
        .select(`
          *,
          sugarcane_varieties(name, variety_id),
          intercrop_varieties(name, variety_id)
        `)
        .eq('bloc_id', blocId)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      
      return (data || []).map(this.transformDbToLocal)
    } catch (error) {
      console.error('Failed to fetch crop cycles for bloc:', error)
      return []
    }
  }

  /**
   * Get active crop cycle for a bloc
   */
  static async getActiveCropCycle(blocId: string): Promise<LocalCropCycle | null> {
    try {
      const { data, error } = await supabase
        .from('crop_cycles')
        .select(`
          *,
          sugarcane_varieties(name, variety_id),
          intercrop_varieties(name, variety_id)
        `)
        .eq('bloc_id', blocId)
        .eq('status', 'active')
        .single()
      
      if (error) {
        if (error.code === 'PGRST116') {
          // No active cycle found
          return null
        }
        throw error
      }
      
      return this.transformDbToLocal(data)
    } catch (error) {
      console.error('Failed to fetch active crop cycle:', error)
      return null
    }
  }

  /**
   * Get bloc summary data for bloc cards
   */
  static async getBlocSummary(blocId: string): Promise<BlocCycleData> {
    try {
      // Single query to get all bloc card data
      const { data, error } = await supabase
        .from('blocs')
        .select(`
          id,
          status,
          crop_cycles!inner(
            type,
            cycle_number,
            growth_stage,
            days_since_planting,
            sugarcane_planned_harvest_date,
            sugarcane_varieties(name, variety_id),
            intercrop_varieties(name, variety_id)
          )
        `)
        .eq('id', blocId)
        .eq('crop_cycles.status', 'active')
        .single()
      
      if (error || !data) {
        return {
          blocId,
          blocStatus: 'active', // Default status
          hasActiveCycle: false
        }
      }
      
      const cycle = data.crop_cycles[0]
      const growthStageInfo = GROWTH_STAGES.find(stage => stage.stage === cycle.growth_stage)
      
      return {
        blocId,
        blocStatus: data.status as 'active' | 'retired',
        hasActiveCycle: true,
        cycleType: cycle.type,
        varietyName: cycle.sugarcane_varieties?.name,
        intercropName: cycle.intercrop_varieties?.name,
        cycleNumber: cycle.cycle_number,
        plannedHarvestDate: cycle.sugarcane_planned_harvest_date,
        growthStage: cycle.growth_stage || undefined,
        growthStageName: growthStageInfo?.name,
        growthStageColor: growthStageInfo?.color,
        growthStageIcon: growthStageInfo?.icon,
        daysSincePlanting: cycle.days_since_planting || undefined
      }
    } catch (error) {
      console.error('Failed to fetch bloc summary:', error)
      return {
        blocId,
        blocStatus: 'active',
        hasActiveCycle: false
      }
    }
  }

  /**
   * Create a new crop cycle
   */
  static async createCropCycle(request: CreateCycleRequest): Promise<LocalCropCycle> {
    try {
      // Calculate initial growth stage
      const plantingDate = new Date(request.plantingDate || new Date())
      const daysSincePlanting = Math.floor((new Date().getTime() - plantingDate.getTime()) / (1000 * 60 * 60 * 24))
      const initialGrowthStage = this.calculateGrowthStage(daysSincePlanting)

      const { data, error } = await supabase
        .from('crop_cycles')
        .insert({
          bloc_id: request.blocId,
          type: request.type,
          cycle_number: request.type === 'plantation' ? 1 : 2, // Calculate based on type
          sugarcane_variety_id: request.sugarcaneVarietyId,
          intercrop_variety_id: request.intercropVarietyId || null,
          parent_cycle_id: request.parentCycleId || null,
          sugarcane_planting_date: request.plantingDate,
          sugarcane_planned_harvest_date: request.plannedHarvestDate,
          growth_stage: initialGrowthStage,
          days_since_planting: daysSincePlanting,
          estimated_total_cost: 0,
          actual_total_cost: 0,
          sugarcane_revenue: 0,
          intercrop_revenue: 0,
          total_revenue: 0,
          net_profit: 0,
          profit_margin_percent: 0,
          closure_validated: false
        })
        .select(`
          *,
          sugarcane_varieties(name, variety_id),
          intercrop_varieties(name, variety_id)
        `)
        .single()

      if (error) throw error
      
      return this.transformDbToLocal(data)
    } catch (error) {
      console.error('Failed to create crop cycle:', error)
      throw error
    }
  }

  /**
   * Transform database record to local type
   */
  private static transformDbToLocal(dbRecord: any): LocalCropCycle {
    return {
      id: dbRecord.id,
      blocId: dbRecord.bloc_id,
      type: dbRecord.type,
      status: dbRecord.status,
      cycleNumber: dbRecord.cycle_number,
      sugarcaneVarietyId: dbRecord.sugarcane_variety_id,
      sugarcaneVarietyName: dbRecord.sugarcane_varieties?.name || '',
      intercropVarietyId: dbRecord.intercrop_variety_id,
      intercropVarietyName: dbRecord.intercrop_varieties?.name || '',
      parentCycleId: dbRecord.parent_cycle_id,
      plantingDate: dbRecord.sugarcane_planting_date,
      plannedHarvestDate: dbRecord.sugarcane_planned_harvest_date,
      actualHarvestDate: dbRecord.sugarcane_actual_harvest_date,
      sugarcaneYieldTonsPerHa: dbRecord.sugarcane_actual_yield_tons_ha,
      expectedYield: 0, // Will need to add this field to database
      ratoonPlantingDate: dbRecord.intercrop_planting_date,
      growthStage: dbRecord.growth_stage,
      growthStageUpdatedAt: dbRecord.growth_stage_updated_at,
      daysSincePlanting: dbRecord.days_since_planting,
      closureValidated: dbRecord.closure_validated,
      createdAt: dbRecord.created_at,
      updatedAt: dbRecord.updated_at,
      createdBy: 'current_user' // Will implement with auth
    }
  }

  /**
   * Calculate growth stage based on days since planting
   */
  private static calculateGrowthStage(daysSincePlanting: number): GrowthStage {
    if (daysSincePlanting <= 30) return 'germination'
    if (daysSincePlanting <= 120) return 'tillering'
    if (daysSincePlanting <= 270) return 'grand-growth'
    if (daysSincePlanting <= 360) return 'maturation'
    return 'ripening'
  }

  /**
   * Get growth stage display information
   */
  static getGrowthStageInfo(stage: GrowthStage) {
    return GROWTH_STAGES.find(s => s.stage === stage)
  }

  /**
   * Update growth stages for all active cycles (called by scheduled job)
   */
  static async updateGrowthStages(): Promise<void> {
    try {
      // This would be implemented as a database function/trigger
      // For now, we can call it manually when needed
      console.log('Growth stage update would be handled by database triggers')
    } catch (error) {
      console.error('Failed to update growth stages:', error)
    }
  }
}
