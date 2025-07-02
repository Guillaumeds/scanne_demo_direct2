/**
 * Crop Cycle Service
 * Handles CRUD operations and business logic for crop cycles
 */

import { 
  CropCycle, 
  CreateCycleRequest, 
  CloseCycleRequest,
  CycleClosureValidation,
  CyclePermissions,
  getCyclePermissions,
  formatCycleDisplayName
} from '@/types/cropCycles'
import { BlocActivity } from '@/types/activities'
import { BlocObservation } from '@/types/observations'
import { SUGARCANE_VARIETIES, INTERCROP_PLANTS } from '@/types/varieties'
import { BlocAttachment } from '@/types/attachments'
import { CropCycleValidationService } from './cropCycleValidationService'

export class CropCycleService {
  private static STORAGE_KEY = 'scanne_crop_cycles'
  
  /**
   * Get all crop cycles for a specific bloc
   */
  static async getCropCyclesForBloc(blocId: string): Promise<CropCycle[]> {
    const cycles = this.getAllCropCycles()
    return cycles.filter(cycle => cycle.blocId === blocId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }
  
  /**
   * Get the active crop cycle for a bloc
   */
  static async getActiveCropCycle(blocId: string): Promise<CropCycle | null> {
    const cycles = await this.getCropCyclesForBloc(blocId)
    return cycles.find(cycle => cycle.status === 'active') || null
  }
  
  /**
   * Create a new crop cycle
   */
  static async createCropCycle(request: CreateCycleRequest): Promise<CropCycle> {
    // Validate that only one active cycle exists per bloc
    const activeCycle = await this.getActiveCropCycle(request.blocId)
    if (activeCycle) {
      throw new Error('Cannot create new cycle: An active cycle already exists for this bloc. Please close the current cycle first.')
    }
    
    // For ratoon cycles, validate parent cycle exists and is closed
    if (request.type === 'ratoon') {
      if (!request.parentCycleId) {
        throw new Error('Parent cycle ID is required for ratoon cycles')
      }
      
      const parentCycle = await this.getCropCycleById(request.parentCycleId)
      if (!parentCycle) {
        throw new Error('Parent cycle not found')
      }
      
      if (parentCycle.status !== 'closed') {
        throw new Error('Parent cycle must be closed before creating ratoon cycle')
      }
    }
    
    // Determine cycle number
    const existingCycles = await this.getCropCyclesForBloc(request.blocId)
    const cycleNumber = request.type === 'plantation' ? 1 : 
      Math.max(...existingCycles.map(c => c.cycleNumber), 0) + 1
    
    // Get variety name from varieties data
    // In a real app, this would fetch from a varieties service
    const sugarcaneVarietyName = this.getSugarcaneVarietyName(request.sugarcaneVarietyId)
    const intercropVarietyName = request.intercropVarietyId ? 
      this.getIntercropVarietyName(request.intercropVarietyId) : undefined
    
    const newCycle: CropCycle = {
      id: `cycle_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      blocId: request.blocId,
      type: request.type,
      status: 'active',
      cycleNumber,
      sugarcaneVarietyId: request.sugarcaneVarietyId,
      sugarcaneVarietyName,
      plantingDate: request.plantingDate,
      plannedHarvestDate: request.plannedHarvestDate,
      expectedYield: request.expectedYield,
      intercropVarietyId: request.intercropVarietyId,
      intercropVarietyName,
      parentCycleId: request.parentCycleId,
      ratoonPlantingDate: request.type === 'ratoon' ? new Date().toISOString().split('T')[0] : undefined,
      closureValidated: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'current_user' // In real app, get from auth context
    }
    
    // Save to storage
    const cycles = this.getAllCropCycles()
    cycles.push(newCycle)
    this.saveCropCycles(cycles)
    
    return newCycle
  }
  
  /**
   * Validate crop cycle for closure
   */
  static async validateCycleForClosure(
    cycleId: string,
    blocArea: number
  ): Promise<CycleClosureValidation> {
    const cycle = await this.getCropCycleById(cycleId)
    if (!cycle) {
      throw new Error('Crop cycle not found')
    }
    
    if (cycle.status !== 'active') {
      throw new Error('Only active cycles can be validated for closure')
    }
    
    // Get related data - in real app, these would be fetched from respective services
    const activities = await this.getActivitiesForCycle(cycleId)
    const observations = await this.getObservationsForCycle(cycleId)
    
    return CropCycleValidationService.validateCycleForClosure(
      cycle,
      activities,
      observations,
      blocArea
    )
  }
  
  /**
   * Close a crop cycle
   */
  static async closeCropCycle(request: CloseCycleRequest): Promise<CropCycle> {
    const cycle = await this.getCropCycleById(request.cycleId)
    if (!cycle) {
      throw new Error('Crop cycle not found')
    }
    
    if (cycle.status !== 'active') {
      throw new Error('Only active cycles can be closed')
    }
    
    // Validate cycle can be closed
    const validation = await this.validateCycleForClosure(request.cycleId, 1) // TODO: Get actual bloc area
    if (!validation.canClose) {
      throw new Error('Cycle cannot be closed due to validation errors')
    }
    
    // Update cycle with closure data
    const updatedCycle: CropCycle = {
      ...cycle,
      status: 'closed',
      actualHarvestDate: request.actualHarvestDate,
      closureDate: new Date().toISOString(),
      closedBy: 'current_user', // In real app, get from auth context
      closureValidated: true,
      updatedAt: new Date().toISOString(),
      
      // Add summary data from validation
      ...(validation.summary && {
        totalCosts: validation.summary.costs.total,
        totalRevenue: validation.summary.revenue.total,
        netProfit: validation.summary.profitability.netProfit,
        profitPerHectare: validation.summary.profitability.profitPerHectare,
        sugarcaneYieldTons: validation.summary.yields.sugarcane.total,
        sugarcaneYieldTonsPerHa: validation.summary.yields.sugarcane.perHectare,
        sugarYieldTons: validation.summary.yields.sugar.total,
        sugarYieldTonsPerHa: validation.summary.yields.sugar.perHectare,
        electricityYieldTons: validation.summary.yields.electricity.total,
        electricityYieldTonsPerHa: validation.summary.yields.electricity.perHectare,
        intercropYieldTons: validation.summary.yields.intercrop?.total,
        intercropYieldTonsPerHa: validation.summary.yields.intercrop?.perHectare,
        sugarcaneRevenue: validation.summary.revenue.sugarcane,
        sugarRevenue: validation.summary.revenue.sugar,
        electricityRevenue: validation.summary.revenue.electricity,
        intercropRevenue: validation.summary.revenue.intercrop
      })
    }
    
    // Save updated cycle
    const cycles = this.getAllCropCycles()
    const index = cycles.findIndex(c => c.id === cycle.id)
    if (index !== -1) {
      cycles[index] = updatedCycle
      this.saveCropCycles(cycles)
    }
    
    return updatedCycle
  }
  
  /**
   * Get crop cycle by ID
   */
  static async getCropCycleById(cycleId: string): Promise<CropCycle | null> {
    const cycles = this.getAllCropCycles()
    return cycles.find(cycle => cycle.id === cycleId) || null
  }
  
  /**
   * Get permissions for a crop cycle
   */
  static getCyclePermissions(cycle: CropCycle, userRole: 'user' | 'admin' | 'super' = 'user'): CyclePermissions {
    return getCyclePermissions(cycle, userRole)
  }
  
  /**
   * Update crop cycle
   */
  static async updateCropCycle(cycleId: string, updates: Partial<CropCycle>): Promise<CropCycle> {
    const cycle = await this.getCropCycleById(cycleId)
    if (!cycle) {
      throw new Error('Crop cycle not found')
    }
    
    // Check permissions
    const permissions = this.getCyclePermissions(cycle)
    if (!permissions.canEdit) {
      throw new Error('Cycle cannot be edited in its current state')
    }
    
    const updatedCycle: CropCycle = {
      ...cycle,
      ...updates,
      updatedAt: new Date().toISOString()
    }
    
    // Save updated cycle
    const cycles = this.getAllCropCycles()
    const index = cycles.findIndex(c => c.id === cycle.id)
    if (index !== -1) {
      cycles[index] = updatedCycle
      this.saveCropCycles(cycles)
    }
    
    return updatedCycle
  }
  
  /**
   * Delete crop cycle (only if no activities/observations linked)
   */
  static async deleteCropCycle(cycleId: string): Promise<void> {
    const cycle = await this.getCropCycleById(cycleId)
    if (!cycle) {
      throw new Error('Crop cycle not found')
    }
    
    if (cycle.status === 'closed') {
      throw new Error('Closed cycles cannot be deleted')
    }
    
    // Check if there are linked activities or observations
    const activities = await this.getActivitiesForCycle(cycleId)
    const observations = await this.getObservationsForCycle(cycleId)
    
    if (activities.length > 0 || observations.length > 0) {
      throw new Error('Cannot delete cycle with linked activities or observations')
    }
    
    // Remove from storage
    const cycles = this.getAllCropCycles()
    const filteredCycles = cycles.filter(c => c.id !== cycleId)
    this.saveCropCycles(filteredCycles)
  }
  
  // Private helper methods
  private static getAllCropCycles(): CropCycle[] {
    if (typeof window === 'undefined') return []
    
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error('Error loading crop cycles:', error)
      return []
    }
  }
  
  private static saveCropCycles(cycles: CropCycle[]): void {
    if (typeof window === 'undefined') return
    
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(cycles))
    } catch (error) {
      console.error('Error saving crop cycles:', error)
    }
  }
  
  private static getSugarcaneVarietyName(varietyId: string): string {
    const variety = SUGARCANE_VARIETIES.find(v => v.id === varietyId)
    return variety ? variety.name : 'Unknown Variety'
  }
  
  private static getIntercropVarietyName(varietyId: string): string {
    const variety = INTERCROP_PLANTS.find(v => v.id === varietyId)
    return variety ? variety.name : 'Unknown Intercrop'
  }
  
  private static async getActivitiesForCycle(cycleId: string): Promise<BlocActivity[]> {
    // In real app, this would fetch from activities service
    // For now, return empty array - activities will be linked to cycles later
    return []
  }
  
  private static async getObservationsForCycle(cycleId: string): Promise<BlocObservation[]> {
    // In real app, this would fetch from observations service
    // For now, return empty array - observations will be linked to cycles later
    return []
  }
}
