// Comprehensive Bloc Data Service
// Demo-only implementation - redirects to MockApiService

import { MockApiService } from './mockApiService'
import type { Bloc, CropCycle, FieldOperation, WorkPackage } from '@/data/transactional/blocs'

// Export BlocData interface for compatibility
export interface BlocData {
  bloc: Bloc
  cropCycles: CropCycle[]
  activeCropCycle: CropCycle | null
  fieldOperations: FieldOperation[]
  workPackages: WorkPackage[]
  lastUpdated: string
}

export interface ProductJoin {
  id: string
  operationUuid?: string
  workPackageUuid?: string
  productId: string
  productName: string
  plannedQuantity: number
  actualQuantity?: number
  plannedCost: number
  actualCost?: number
  unit: string
}

export interface EquipmentJoin {
  id: string
  operationUuid?: string
  workPackageUuid?: string
  equipmentId: string
  equipmentName: string
  plannedHours: number
  actualHours?: number
  plannedCost: number
  actualCost?: number
  fuelConsumption?: number
  maintenanceNotes?: string
}

export interface LabourJoin {
  id: string
  operationUuid?: string
  workPackageUuid?: string
  labourId: string
  labourName: string
  plannedQuantity: number
  actualQuantity?: number
  plannedCost: number
  actualCost?: number
  unit: string
}

// @deprecated - Use LabourJoin instead
export interface ResourceJoin {
  id: string
  operationUuid?: string
  workPackageUuid?: string
  resourceId: string
  resourceName: string
  plannedQuantity: number
  actualQuantity?: number
  plannedCost: number
  actualCost?: number
  unit: string
}

/**
 * Comprehensive Bloc Data Service
 * Demo-only implementation - redirects to MockApiService
 */
export class BlocDataService {

  /**
   * Fetch ALL bloc-related data in one optimized query
   * Demo-only implementation - redirects to MockApiService
   */
  static async fetchComprehensiveBlocData(blocId: string): Promise<BlocData> {
    console.log(`🔄 Loading comprehensive bloc data for ${blocId}...`)

    try {
      const response = await MockApiService.getComprehensiveBlocData(blocId)
      console.log(`✅ Loaded bloc data for ${blocId}`)
      return response.data
    } catch (error) {
      console.warn(`⚠️ Error loading bloc ${blocId}, returning empty structure`)
      return {
        bloc: { id: blocId, name: 'Unknown Bloc' } as Bloc,
        cropCycles: [],
        activeCropCycle: null,
        fieldOperations: [],
        workPackages: [],
        lastUpdated: new Date().toISOString()
      }
    }
  }

}

// Re-export interfaces for compatibility
export type { Bloc, CropCycle, FieldOperation, WorkPackage } from '@/data/transactional/blocs'
