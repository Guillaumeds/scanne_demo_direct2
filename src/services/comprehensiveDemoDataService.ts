/**
 * Comprehensive Demo Data Service
 * Generates 40 realistic blocs with complete transactional data for demo purposes
 * Based on actual field polygons from estate_fields.csv
 */

import type {
  FarmGISInitialData,
  BlocData,
  CropCycle,
  FieldOperation,
  WorkPackage,
} from '@/schemas/apiSchemas'

// Sugarcane varieties used in Mauritius
const SUGARCANE_VARIETIES = [
  {
    id: '550e8400-e29b-41d4-a716-446655440030',
    name: 'R570',
    description: 'High-yielding variety, good for plant and ratoon crops',
    maturity_months: 12,
    expected_yield_plant: 130,
    expected_yield_ratoon: 110
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440031', 
    name: 'R579',
    description: 'Excellent ratooning ability, disease resistant',
    maturity_months: 14,
    expected_yield_plant: 125,
    expected_yield_ratoon: 115
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440032',
    name: 'M2593/92',
    description: 'Good for marginal soils, drought tolerant',
    maturity_months: 13,
    expected_yield_plant: 115,
    expected_yield_ratoon: 95
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440033',
    name: 'R585',
    description: 'High sugar content, good for factory processing',
    maturity_months: 12,
    expected_yield_plant: 135,
    expected_yield_ratoon: 120
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440034',
    name: 'M134/32',
    description: 'Traditional variety, reliable performance',
    maturity_months: 13,
    expected_yield_plant: 120,
    expected_yield_ratoon: 105
  }
]

// Field polygons from estate_fields.csv (first 40)
const FIELD_POLYGONS = [
  { id: 'FLD00022', wkt: 'POLYGON((57.652557 -20.437995, 57.652613 -20.437931, 57.653302 -20.438374, 57.653312 -20.438430, 57.650887 -20.441820, 57.650671 -20.441689, 57.650561 -20.441772, 57.650404 -20.441767, 57.650022 -20.441545, 57.652557 -20.437995))' },
  { id: 'FLD00023', wkt: 'POLYGON((57.643608 -20.427913, 57.643671 -20.427759, 57.646925 -20.425527, 57.648953 -20.424132, 57.649125 -20.424039, 57.649191 -20.424865, 57.649337 -20.425374, 57.649314 -20.425663, 57.648536 -20.426457, 57.648383 -20.426595, 57.648315 -20.426669, 57.648320 -20.426749, 57.648343 -20.426850, 57.648587 -20.427121, 57.647799 -20.427536, 57.647637 -20.427732, 57.647112 -20.428035, 57.646886 -20.428173, 57.646551 -20.428232, 57.646098 -20.428311, 57.645581 -20.428279, 57.645462 -20.428285, 57.644952 -20.427605, 57.644572 -20.427812, 57.644929 -20.428248, 57.643620 -20.428125, 57.643569 -20.428019, 57.643608 -20.427913))' },
  { id: 'FLD00024', wkt: 'POLYGON((57.628588 -20.486595, 57.628700 -20.486871, 57.629105 -20.486987, 57.629551 -20.487170, 57.629543 -20.486881, 57.629567 -20.486538, 57.629608 -20.486249, 57.629661 -20.485968, 57.629730 -20.485634, 57.629803 -20.485443, 57.629925 -20.485187, 57.629897 -20.485154, 57.629829 -20.485130, 57.629797 -20.485148, 57.629774 -20.485214, 57.629709 -20.485383, 57.629667 -20.485437, 57.629616 -20.485454, 57.629457 -20.485499, 57.629394 -20.485515, 57.629397 -20.485568, 57.629397 -20.485645, 57.629311 -20.485898, 57.629203 -20.486023, 57.628980 -20.486224, 57.628782 -20.486394, 57.628630 -20.486506, 57.628594 -20.486552, 57.628588 -20.486595))' },
  { id: 'FLD00025', wkt: 'POLYGON((57.629750 -20.488677, 57.629727 -20.488709, 57.629679 -20.488729, 57.628878 -20.488850, 57.628841 -20.488847, 57.628843 -20.488812, 57.628895 -20.488731, 57.628946 -20.488624, 57.628960 -20.488552, 57.628924 -20.488410, 57.628879 -20.488187, 57.628863 -20.488031, 57.628866 -20.487963, 57.628858 -20.487807, 57.628830 -20.487700, 57.628826 -20.487577, 57.628820 -20.487412, 57.628849 -20.487325, 57.628816 -20.487155, 57.628772 -20.487068, 57.628739 -20.486957, 57.628779 -20.486953, 57.629330 -20.487155, 57.629559 -20.487253, 57.629636 -20.487986, 57.629668 -20.488096, 57.629750 -20.488677))' },
  { id: 'FLD00026', wkt: 'POLYGON((57.629732 -20.488171, 57.629821 -20.488685, 57.629884 -20.488700, 57.629956 -20.488683, 57.629966 -20.488668, 57.629732 -20.488171))' }
  // Will add more in next chunk
]

// Calculate area from WKT polygon (simplified calculation)
function calculateAreaFromWKT(wkt: string): number {
  // Extract coordinates and calculate approximate area in hectares
  // This is a simplified calculation for demo purposes
  const coordMatch = wkt.match(/POLYGON\(\((.*?)\)\)/)
  if (!coordMatch) return 50 // Default area
  
  const coords = coordMatch[1].split(', ').map(coord => {
    const [lng, lat] = coord.split(' ').map(Number)
    return [lng, lat]
  })
  
  // Simple polygon area calculation (not geodesically accurate but good for demo)
  let area = 0
  for (let i = 0; i < coords.length - 1; i++) {
    area += (coords[i][0] * coords[i + 1][1]) - (coords[i + 1][0] * coords[i][1])
  }
  area = Math.abs(area) / 2
  
  // Convert to hectares (very rough approximation)
  return Math.round(area * 10000 * 100) / 100 // Convert to hectares and round
}

// Generate crop cycle based on variety and current date
function generateCropCycle(
  blocId: string, 
  varietyId: string, 
  cycleType: 'plantation' | 'ratoon',
  cycleNumber: number,
  blocArea: number
): CropCycle {
  const variety = SUGARCANE_VARIETIES.find(v => v.id === varietyId)!
  const today = new Date('2025-07-20') // Demo date
  
  // Calculate planting date based on cycle stage
  let plantingDate: Date
  let harvestDate: Date
  let growthStage: string
  let daysSincePlanting: number
  
  if (cycleType === 'plantation') {
    // Plant cycles: 12-18 months old
    const monthsOld = Math.floor(Math.random() * 7) + 12 // 12-18 months
    plantingDate = new Date(today)
    plantingDate.setMonth(plantingDate.getMonth() - monthsOld)
    
    harvestDate = new Date(plantingDate)
    harvestDate.setMonth(harvestDate.getMonth() + variety.maturity_months)
    
    daysSincePlanting = Math.floor((today.getTime() - plantingDate.getTime()) / (1000 * 60 * 60 * 24))
    
    // Determine growth stage based on age
    if (daysSincePlanting < 90) growthStage = 'germination'
    else if (daysSincePlanting < 180) growthStage = 'tillering'
    else if (daysSincePlanting < 270) growthStage = 'grand_growth'
    else if (daysSincePlanting < 360) growthStage = 'maturation'
    else growthStage = 'ripening'
    
  } else {
    // Ratoon cycles: 8-14 months old
    const monthsOld = Math.floor(Math.random() * 7) + 8 // 8-14 months
    plantingDate = new Date(today)
    plantingDate.setMonth(plantingDate.getMonth() - monthsOld)
    
    harvestDate = new Date(plantingDate)
    harvestDate.setMonth(harvestDate.getMonth() + (variety.maturity_months - 1)) // Ratoons mature faster
    
    daysSincePlanting = Math.floor((today.getTime() - plantingDate.getTime()) / (1000 * 60 * 60 * 24))
    
    // Ratoon growth stages
    if (daysSincePlanting < 60) growthStage = 'sprouting'
    else if (daysSincePlanting < 150) growthStage = 'tillering'
    else if (daysSincePlanting < 240) growthStage = 'grand_growth'
    else if (daysSincePlanting < 300) growthStage = 'maturation'
    else growthStage = 'ripening'
  }
  
  const expectedYield = cycleType === 'plantation' ? variety.expected_yield_plant : variety.expected_yield_ratoon
  const estimatedCost = Math.round(blocArea * (cycleType === 'plantation' ? 180000 : 120000)) // MUR per hectare
  
  return {
    id: `crop-cycle-${blocId}-${cycleNumber}`,
    bloc_id: blocId,
    type: cycleType,
    cycle_number: cycleNumber,
    status: 'active',
    sugarcane_variety_id: varietyId,
    intercrop_variety_id: null,
    planting_date: plantingDate.toISOString().split('T')[0],
    planned_harvest_date: harvestDate.toISOString().split('T')[0],
    actual_harvest_date: null,
    expected_yield_tons_ha: expectedYield,
    actual_yield_tons_ha: null,
    estimated_total_cost: estimatedCost,
    actual_total_cost: null,
    total_revenue: null,
    sugarcane_revenue: null,
    intercrop_revenue: null,
    net_profit: null,
    profit_per_hectare: null,
    profit_margin_percent: null,
    growth_stage: growthStage,
    days_since_planting: daysSincePlanting,
    created_at: plantingDate.toISOString(),
    updated_at: new Date().toISOString()
  }
}

export class ComprehensiveDemoDataService {
  
  static generateComprehensiveData(): FarmGISInitialData {
    const blocs = []
    const cropCycles = []
    
    // Generate 40 blocs using field polygons
    for (let i = 0; i < Math.min(40, FIELD_POLYGONS.length); i++) {
      const field = FIELD_POLYGONS[i]
      const area = calculateAreaFromWKT(field.wkt)
      const varietyIndex = i % SUGARCANE_VARIETIES.length
      const variety = SUGARCANE_VARIETIES[varietyIndex]
      
      const blocId = `bloc-${field.id.toLowerCase()}`
      const blocName = `Bloc ${field.id.replace('FLD', '')}`
      
      // Create bloc
      blocs.push({
        id: blocId,
        name: blocName,
        area_hectares: area,
        coordinates_wkt: field.wkt,
        status: 'active',
        farm_id: '550e8400-e29b-41d4-a716-446655440001',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      })
      
      // Determine cycle type and number based on index
      let cycleType: 'plantation' | 'ratoon'
      let cycleNumber: number
      
      if (i < 15) {
        // First 15 blocs: plantation (cycle 1)
        cycleType = 'plantation'
        cycleNumber = 1
      } else if (i < 30) {
        // Next 15 blocs: first ratoon (cycle 2)
        cycleType = 'ratoon'
        cycleNumber = 2
      } else {
        // Last 10 blocs: second ratoon (cycle 3)
        cycleType = 'ratoon'
        cycleNumber = 3
      }
      
      // Generate current crop cycle
      const currentCycle = generateCropCycle(blocId, variety.id, cycleType, cycleNumber, area)
      cropCycles.push(currentCycle)
    }
    
    return {
      farms: [{
        id: '550e8400-e29b-41d4-a716-446655440001',
        name: 'Belle Vue Estate',
        area_hectares: 2500,
        coordinates_wkt: 'POLYGON((57.6 -20.4, 57.7 -20.4, 57.7 -20.5, 57.6 -20.5, 57.6 -20.4))',
        status: 'active',
        company_id: 'company-1',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      }],
      blocs,
      activeCropCycles: cropCycles,
      companies: [{
        id: 'company-1',
        name: 'Omnicane Ltd',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      }]
    }
  }
}
