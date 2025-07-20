/**
 * Mauritius Sugarcane Demo Data Generator
 * Generates realistic demo data for 40 blocs with complete crop cycles, operations, and work packages
 * Based on actual Mauritius sugarcane farming practices and data
 */

// Mauritius sugarcane varieties with realistic data
export const MAURITIUS_VARIETIES = [
  {
    id: 'variety-r579',
    name: 'R579',
    maturity_months: 18,
    yield_potential: 120,
    harvest_period: 'mid-season',
    disease_resistance: 'high',
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'variety-m1176',
    name: 'M1176/77',
    maturity_months: 16,
    yield_potential: 110,
    harvest_period: 'early-season',
    disease_resistance: 'medium',
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'variety-r570',
    name: 'R570',
    maturity_months: 20,
    yield_potential: 135,
    harvest_period: 'late-season',
    disease_resistance: 'high',
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'variety-m2593',
    name: 'M2593/92',
    maturity_months: 15,
    yield_potential: 105,
    harvest_period: 'early-season',
    disease_resistance: 'medium',
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'variety-m387',
    name: 'M387/85',
    maturity_months: 17,
    yield_potential: 115,
    harvest_period: 'mid-season',
    disease_resistance: 'high',
    created_at: '2024-01-01T00:00:00Z'
  }
]

// Field polygons from CSV data (first 40 fields with realistic Mauritius coordinates)
export const FIELD_POLYGONS = [
  { id: 'field1', name: 'Bloc 5316', area: 57.59, wkt: 'POLYGON((57.647 -20.437, 57.648 -20.437, 57.648 -20.438, 57.647 -20.438, 57.647 -20.437))' },
  { id: 'field2', name: 'Bloc 5660', area: 17.34, wkt: 'POLYGON((57.649 -20.437, 57.650 -20.437, 57.650 -20.438, 57.649 -20.438, 57.649 -20.437))' },
  { id: 'field3', name: 'Bloc 5216', area: 20.17, wkt: 'POLYGON((57.651 -20.437, 57.652 -20.437, 57.652 -20.438, 57.651 -20.438, 57.651 -20.437))' },
  { id: 'field4', name: 'Bloc 5555', area: 14.42, wkt: 'POLYGON((57.653 -20.437, 57.654 -20.437, 57.654 -20.438, 57.653 -20.438, 57.653 -20.437))' },
  { id: 'field5', name: 'Bloc 5727', area: 7.02, wkt: 'POLYGON((57.655 -20.437, 57.656 -20.437, 57.656 -20.438, 57.655 -20.438, 57.655 -20.437))' },
  { id: 'field6', name: 'Bloc 5980', area: 6.32, wkt: 'POLYGON((57.657 -20.437, 57.658 -20.437, 57.658 -20.438, 57.657 -20.438, 57.657 -20.437))' },
  { id: 'field7', name: 'Bloc 5123', area: 12.45, wkt: 'POLYGON((57.659 -20.437, 57.660 -20.437, 57.660 -20.438, 57.659 -20.438, 57.659 -20.437))' },
  { id: 'field8', name: 'Bloc 5789', area: 23.67, wkt: 'POLYGON((57.661 -20.437, 57.662 -20.437, 57.662 -20.438, 57.661 -20.438, 57.661 -20.437))' },
  { id: 'field9', name: 'Bloc 5432', area: 18.90, wkt: 'POLYGON((57.663 -20.437, 57.664 -20.437, 57.664 -20.438, 57.663 -20.438, 57.663 -20.437))' },
  { id: 'field10', name: 'Bloc 5876', area: 31.25, wkt: 'POLYGON((57.665 -20.437, 57.666 -20.437, 57.666 -20.438, 57.665 -20.438, 57.665 -20.437))' },
  { id: 'field11', name: 'Bloc 5234', area: 15.78, wkt: 'POLYGON((57.647 -20.439, 57.648 -20.439, 57.648 -20.440, 57.647 -20.440, 57.647 -20.439))' },
  { id: 'field12', name: 'Bloc 5567', area: 28.43, wkt: 'POLYGON((57.649 -20.439, 57.650 -20.439, 57.650 -20.440, 57.649 -20.440, 57.649 -20.439))' },
  { id: 'field13', name: 'Bloc 5890', area: 22.15, wkt: 'POLYGON((57.651 -20.439, 57.652 -20.439, 57.652 -20.440, 57.651 -20.440, 57.651 -20.439))' },
  { id: 'field14', name: 'Bloc 5345', area: 19.67, wkt: 'POLYGON((57.653 -20.439, 57.654 -20.439, 57.654 -20.440, 57.653 -20.440, 57.653 -20.439))' },
  { id: 'field15', name: 'Bloc 5678', area: 26.89, wkt: 'POLYGON((57.655 -20.439, 57.656 -20.439, 57.656 -20.440, 57.655 -20.440, 57.655 -20.439))' },
  { id: 'field16', name: 'Bloc 5901', area: 33.12, wkt: 'POLYGON((57.657 -20.439, 57.658 -20.439, 57.658 -20.440, 57.657 -20.440, 57.657 -20.439))' },
  { id: 'field17', name: 'Bloc 5456', area: 17.34, wkt: 'POLYGON((57.659 -20.439, 57.660 -20.439, 57.660 -20.440, 57.659 -20.440, 57.659 -20.439))' },
  { id: 'field18', name: 'Bloc 5789', area: 24.56, wkt: 'POLYGON((57.661 -20.439, 57.662 -20.439, 57.662 -20.440, 57.661 -20.440, 57.661 -20.439))' },
  { id: 'field19', name: 'Bloc 5012', area: 21.78, wkt: 'POLYGON((57.663 -20.439, 57.664 -20.439, 57.664 -20.440, 57.663 -20.440, 57.663 -20.439))' },
  { id: 'field20', name: 'Bloc 5345', area: 29.90, wkt: 'POLYGON((57.665 -20.439, 57.666 -20.439, 57.666 -20.440, 57.665 -20.440, 57.665 -20.439))' },
  { id: 'field21', name: 'Bloc 5678', area: 16.23, wkt: 'POLYGON((57.647 -20.441, 57.648 -20.441, 57.648 -20.442, 57.647 -20.442, 57.647 -20.441))' },
  { id: 'field22', name: 'Bloc 5901', area: 27.45, wkt: 'POLYGON((57.649 -20.441, 57.650 -20.441, 57.650 -20.442, 57.649 -20.442, 57.649 -20.441))' },
  { id: 'field23', name: 'Bloc 5234', area: 23.67, wkt: 'POLYGON((57.651 -20.441, 57.652 -20.441, 57.652 -20.442, 57.651 -20.442, 57.651 -20.441))' },
  { id: 'field24', name: 'Bloc 5567', area: 20.89, wkt: 'POLYGON((57.653 -20.441, 57.654 -20.441, 57.654 -20.442, 57.653 -20.442, 57.653 -20.441))' },
  { id: 'field25', name: 'Bloc 5890', area: 25.12, wkt: 'POLYGON((57.655 -20.441, 57.656 -20.441, 57.656 -20.442, 57.655 -20.442, 57.655 -20.441))' },
  { id: 'field26', name: 'Bloc 5123', area: 32.34, wkt: 'POLYGON((57.657 -20.441, 57.658 -20.441, 57.658 -20.442, 57.657 -20.442, 57.657 -20.441))' },
  { id: 'field27', name: 'Bloc 5456', area: 18.56, wkt: 'POLYGON((57.659 -20.441, 57.660 -20.441, 57.660 -20.442, 57.659 -20.442, 57.659 -20.441))' },
  { id: 'field28', name: 'Bloc 5789', area: 24.78, wkt: 'POLYGON((57.661 -20.441, 57.662 -20.441, 57.662 -20.442, 57.661 -20.442, 57.661 -20.441))' },
  { id: 'field29', name: 'Bloc 5012', area: 21.90, wkt: 'POLYGON((57.663 -20.441, 57.664 -20.441, 57.664 -20.442, 57.663 -20.442, 57.663 -20.441))' },
  { id: 'field30', name: 'Bloc 5345', area: 28.12, wkt: 'POLYGON((57.665 -20.441, 57.666 -20.441, 57.666 -20.442, 57.665 -20.442, 57.665 -20.441))' },
  { id: 'field31', name: 'Bloc 5678', area: 15.34, wkt: 'POLYGON((57.647 -20.443, 57.648 -20.443, 57.648 -20.444, 57.647 -20.444, 57.647 -20.443))' },
  { id: 'field32', name: 'Bloc 5901', area: 26.56, wkt: 'POLYGON((57.649 -20.443, 57.650 -20.443, 57.650 -20.444, 57.649 -20.444, 57.649 -20.443))' },
  { id: 'field33', name: 'Bloc 5234', area: 22.78, wkt: 'POLYGON((57.651 -20.443, 57.652 -20.443, 57.652 -20.444, 57.651 -20.444, 57.651 -20.443))' },
  { id: 'field34', name: 'Bloc 5567', area: 19.90, wkt: 'POLYGON((57.653 -20.443, 57.654 -20.443, 57.654 -20.444, 57.653 -20.444, 57.653 -20.443))' },
  { id: 'field35', name: 'Bloc 5890', area: 24.12, wkt: 'POLYGON((57.655 -20.443, 57.656 -20.443, 57.656 -20.444, 57.655 -20.444, 57.655 -20.443))' },
  { id: 'field36', name: 'Bloc 5123', area: 31.34, wkt: 'POLYGON((57.657 -20.443, 57.658 -20.443, 57.658 -20.444, 57.657 -20.444, 57.657 -20.443))' },
  { id: 'field37', name: 'Bloc 5456', area: 17.56, wkt: 'POLYGON((57.659 -20.443, 57.660 -20.443, 57.660 -20.444, 57.659 -20.444, 57.659 -20.443))' },
  { id: 'field38', name: 'Bloc 5789', area: 23.78, wkt: 'POLYGON((57.661 -20.443, 57.662 -20.443, 57.662 -20.444, 57.661 -20.444, 57.661 -20.443))' },
  { id: 'field39', name: 'Bloc 5012', area: 20.90, wkt: 'POLYGON((57.663 -20.443, 57.664 -20.443, 57.664 -20.444, 57.663 -20.444, 57.663 -20.443))' },
  { id: 'field40', name: 'Bloc 5345', area: 27.12, wkt: 'POLYGON((57.665 -20.443, 57.666 -20.443, 57.666 -20.444, 57.665 -20.444, 57.665 -20.443))' }
]

// Realistic Mauritius sugarcane operation types with detailed resource requirements
export const OPERATION_TYPES = [
  {
    type: 'land_preparation',
    name: 'Land Preparation',
    cost_per_hectare: 15000,
    duration_days: 2,
    method: 'mechanical',
    equipment: ['tractor-large', 'plow', 'disc-harrow'],
    labour: [
      { type: 'machine-operator', hours_per_hectare: 6, rate_per_hour: 75 },
      { type: 'field-worker', hours_per_hectare: 4, rate_per_hour: 45 }
    ],
    products: []
  },
  {
    type: 'planting',
    name: 'Sugarcane Planting',
    cost_per_hectare: 25000,
    duration_days: 3,
    method: 'mechanical',
    equipment: ['tractor-medium', 'planter'],
    labour: [
      { type: 'machine-operator', hours_per_hectare: 8, rate_per_hour: 75 },
      { type: 'field-worker', hours_per_hectare: 12, rate_per_hour: 45 },
      { type: 'supervisor', hours_per_hectare: 2, rate_per_hour: 120 }
    ],
    products: []
  },
  {
    type: 'fertilization',
    name: 'Fertilization',
    cost_per_hectare: 18000,
    duration_days: 1,
    method: 'mechanical',
    equipment: ['tractor-medium', 'fertilizer-spreader'],
    labour: [
      { type: 'machine-operator', hours_per_hectare: 3, rate_per_hour: 75 },
      { type: 'field-worker', hours_per_hectare: 2, rate_per_hour: 45 }
    ],
    products: [
      { id: 'npk-12-12-17', name: '12:12:17 NPK', kg_per_hectare: 400, cost_per_kg: 38 },
      { id: 'npk-20-20-20', name: '20:20:20 NPK', kg_per_hectare: 200, cost_per_kg: 52 },
      { id: 'urea', name: 'Urea 46%', kg_per_hectare: 150, cost_per_kg: 35.75 }
    ]
  },
  {
    type: 'weed_control',
    name: 'Weed Control',
    cost_per_hectare: 12000,
    duration_days: 1,
    method: 'chemical',
    equipment: ['tractor-small', 'sprayer'],
    labour: [
      { type: 'machine-operator', hours_per_hectare: 4, rate_per_hour: 75 },
      { type: 'field-worker', hours_per_hectare: 2, rate_per_hour: 45 }
    ],
    products: [
      { id: 'glyphosate', name: 'Glyphosate 41%', liters_per_hectare: 3, cost_per_liter: 85 }
    ]
  },
  {
    type: 'pest_control',
    name: 'Pest Control',
    cost_per_hectare: 8000,
    duration_days: 1,
    method: 'chemical',
    equipment: ['tractor-small', 'sprayer'],
    labour: [
      { type: 'machine-operator', hours_per_hectare: 3, rate_per_hour: 75 },
      { type: 'field-worker', hours_per_hectare: 2, rate_per_hour: 45 }
    ],
    products: [
      { id: 'cypermethrin', name: 'Cypermethrin 10%', liters_per_hectare: 1.5, cost_per_liter: 125 }
    ]
  },
  {
    type: 'irrigation',
    name: 'Irrigation',
    cost_per_hectare: 5000,
    duration_days: 1,
    method: 'manual',
    equipment: ['pump', 'irrigation-pipes'],
    labour: [
      { type: 'field-worker', hours_per_hectare: 6, rate_per_hour: 45 }
    ],
    products: []
  },
  {
    type: 'harvesting',
    name: 'Harvesting',
    cost_per_hectare: 35000,
    duration_days: 5,
    method: 'manual',
    equipment: ['cane-loader', 'field-trailer'],
    labour: [
      { type: 'seasonal-worker', hours_per_hectare: 40, rate_per_hour: 30 },
      { type: 'machine-operator', hours_per_hectare: 8, rate_per_hour: 75 },
      { type: 'supervisor', hours_per_hectare: 5, rate_per_hour: 120 }
    ],
    products: []
  }
]

// Helper functions for date calculations
function addDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

function addMonths(date: Date, months: number): Date {
  const result = new Date(date)
  result.setMonth(result.getMonth() + months)
  return result
}

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0]
}

// Generate crop cycle based on variety and current date
function generateCropCycle(blocId: string, variety: any, cycleType: 'plantation' | 'ratoon', cycleNumber: number) {
  const today = new Date('2025-07-20') // Demo date
  const plantingDate = new Date(today)
  
  // Adjust planting date based on cycle type and number
  if (cycleType === 'plantation') {
    plantingDate.setMonth(plantingDate.getMonth() - Math.floor(Math.random() * variety.maturity_months))
  } else {
    // Ratoon cycles start after previous harvest
    plantingDate.setMonth(plantingDate.getMonth() - Math.floor(Math.random() * (variety.maturity_months - 2)))
  }
  
  const harvestDate = addMonths(plantingDate, variety.maturity_months)
  const isActive = harvestDate > today
  
  return {
    id: `cycle-${blocId}-${cycleNumber}`,
    bloc_id: blocId,
    type: cycleType,
    cycle_number: cycleNumber,
    status: isActive ? 'active' : 'closed',
    sugarcane_variety_id: variety.id,
    intercrop_variety_id: null,
    planting_date: formatDate(plantingDate),
    planned_harvest_date: formatDate(harvestDate),
    actual_harvest_date: isActive ? null : formatDate(harvestDate),
    expected_yield_tons_ha: variety.yield_potential + Math.floor(Math.random() * 20) - 10,
    actual_yield_tons_ha: isActive ? null : variety.yield_potential + Math.floor(Math.random() * 15) - 7,
    estimated_total_cost: Math.floor(Math.random() * 50000) + 100000, // 100k-150k MUR
    actual_total_cost: isActive ? null : Math.floor(Math.random() * 45000) + 95000,
    total_revenue: isActive ? null : Math.floor(Math.random() * 100000) + 200000,
    sugarcane_revenue: isActive ? null : Math.floor(Math.random() * 95000) + 190000,
    intercrop_revenue: null,
    profit_loss: null,
    created_at: formatDate(plantingDate),
    updated_at: new Date().toISOString()
  }
}

// Generate field operations based on crop cycle stage
function generateFieldOperations(cropCycle: any, blocArea: number) {
  const operations: any[] = []
  const plantingDate = new Date(cropCycle.planting_date)
  const today = new Date('2025-07-20')
  const daysSincePlanting = Math.floor((today.getTime() - plantingDate.getTime()) / (1000 * 60 * 60 * 24))

  // Determine which operations should have occurred by now
  const operationSchedule = [
    { type: 'land_preparation', daysAfterPlanting: -7, status: 'completed' },
    { type: 'planting', daysAfterPlanting: 0, status: 'completed' },
    { type: 'fertilization', daysAfterPlanting: 30, status: daysSincePlanting > 30 ? 'completed' : 'planned' },
    { type: 'weed_control', daysAfterPlanting: 60, status: daysSincePlanting > 60 ? 'completed' : 'planned' },
    { type: 'fertilization', daysAfterPlanting: 120, status: daysSincePlanting > 120 ? 'completed' : 'planned' },
    { type: 'pest_control', daysAfterPlanting: 180, status: daysSincePlanting > 180 ? 'completed' : 'planned' },
    { type: 'weed_control', daysAfterPlanting: 240, status: daysSincePlanting > 240 ? 'completed' : 'planned' },
    { type: 'irrigation', daysAfterPlanting: 300, status: daysSincePlanting > 300 ? 'completed' : 'planned' },
    { type: 'harvesting', daysAfterPlanting: cropCycle.type === 'plantation' ? 540 : 365, status: 'planned' }
  ]

  operationSchedule.forEach((schedule, index) => {
    const operationType = OPERATION_TYPES.find(op => op.type === schedule.type)
    if (!operationType) return

    const operationDate = addDays(plantingDate, schedule.daysAfterPlanting)
    const endDate = addDays(operationDate, operationType.duration_days)

    // Check if this is a harvesting operation and should be in progress
    let status = schedule.status
    if (schedule.type === 'harvesting' && daysSincePlanting > schedule.daysAfterPlanting - 30) {
      status = 'in-progress' // Harvesting operations currently in progress
    }

    // Calculate costs based on detailed resource requirements
    const productCost = operationType.products.reduce((sum, product: any) => {
      const quantity = product.kg_per_hectare || product.liters_per_hectare || 0
      const cost = product.cost_per_kg || product.cost_per_liter || 0
      return sum + (quantity * cost * blocArea)
    }, 0)

    const labourCost = operationType.labour.reduce((sum, labour) => {
      return sum + (labour.hours_per_hectare * labour.rate_per_hour * blocArea)
    }, 0)

    const equipmentCost = operationType.equipment.length * 200 * blocArea // Estimated equipment cost
    const estimatedCost = Math.floor(productCost + labourCost + equipmentCost)
    const actualCost = status === 'completed' ? Math.floor(estimatedCost * (0.9 + Math.random() * 0.2)) : null

    operations.push({
      uuid: `op-${cropCycle.id}-${index}`,
      crop_cycle_uuid: cropCycle.id,
      operation_name: operationType.name,
      operation_type: schedule.type,
      method: operationType.method,
      priority: schedule.type === 'harvesting' ? 'high' : 'normal',
      planned_start_date: formatDate(operationDate),
      planned_end_date: formatDate(endDate),
      actual_start_date: status === 'completed' || status === 'in-progress' ? formatDate(operationDate) : null,
      actual_end_date: status === 'completed' ? formatDate(endDate) : null,
      planned_area_hectares: blocArea,
      actual_area_hectares: status === 'completed' ? blocArea : status === 'in-progress' ? blocArea * 0.6 : null,
      planned_quantity: null,
      actual_quantity: null,
      status: status,
      completion_percentage: status === 'completed' ? 100 : status === 'in-progress' ? 60 : 0,
      estimated_total_cost: estimatedCost,
      actual_total_cost: actualCost,
      actual_revenue: null,
      total_yield: null,
      yield_per_hectare: null,
      quality_metrics: null,
      weather_conditions: null,
      notes: null,
      // Add resource details
      products: operationType.products.map((product: any) => ({
        id: product.id,
        name: product.name,
        planned_quantity: (product.kg_per_hectare || product.liters_per_hectare || 0) * blocArea,
        actual_quantity: status === 'completed' ? (product.kg_per_hectare || product.liters_per_hectare || 0) * blocArea * (0.95 + Math.random() * 0.1) : null,
        unit: product.kg_per_hectare ? 'kg' : 'L',
        planned_cost: (product.kg_per_hectare || product.liters_per_hectare || 0) * (product.cost_per_kg || product.cost_per_liter || 0) * blocArea,
        actual_cost: status === 'completed' ? (product.kg_per_hectare || product.liters_per_hectare || 0) * (product.cost_per_kg || product.cost_per_liter || 0) * blocArea * (0.95 + Math.random() * 0.1) : null
      })),
      equipment: operationType.equipment.map((equipmentId: any) => ({
        id: equipmentId,
        name: equipmentId.replace('-', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
        planned_hours: operationType.duration_days * 8,
        actual_hours: status === 'completed' ? operationType.duration_days * 8 * (0.9 + Math.random() * 0.2) : null,
        cost_per_hour: 200 + Math.random() * 300,
        planned_cost: operationType.duration_days * 8 * (200 + Math.random() * 300),
        actual_cost: status === 'completed' ? operationType.duration_days * 8 * (200 + Math.random() * 300) * (0.9 + Math.random() * 0.2) : null
      })),
      labour: operationType.labour.map((labour: any) => ({
        id: labour.type,
        name: labour.type.replace('-', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
        planned_hours: labour.hours_per_hectare * blocArea,
        actual_hours: status === 'completed' ? labour.hours_per_hectare * blocArea * (0.9 + Math.random() * 0.2) : null,
        rate_per_hour: labour.rate_per_hour,
        planned_cost: labour.hours_per_hectare * labour.rate_per_hour * blocArea,
        actual_cost: status === 'completed' ? labour.hours_per_hectare * labour.rate_per_hour * blocArea * (0.9 + Math.random() * 0.2) : null
      })),
      created_at: formatDate(operationDate),
      updated_at: new Date().toISOString()
    })
  })

  return operations
}

// Generate work packages for each operation
function generateWorkPackages(operation: any) {
  const workPackages: any[] = []
  const startDate = new Date(operation.planned_start_date)
  const endDate = new Date(operation.planned_end_date)
  const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))

  // Create daily work packages
  for (let day = 0; day < daysDiff; day++) {
    const workDate = addDays(startDate, day)
    const isCompleted = operation.status === 'completed' ||
                       (operation.status === 'in-progress' && day < daysDiff * 0.6)

    const plannedArea = operation.planned_area_hectares / daysDiff
    const actualArea = isCompleted ? plannedArea * (0.9 + Math.random() * 0.2) : null

    const estimatedCost = operation.estimated_total_cost / daysDiff
    const actualCost = isCompleted ? estimatedCost * (0.9 + Math.random() * 0.2) : null

    workPackages.push({
      uuid: `wp-${operation.uuid}-${day}`,
      field_operation_uuid: operation.uuid,
      package_name: `${operation.operation_name} - Day ${day + 1}`,
      work_date: formatDate(workDate),
      shift: 'day',
      planned_area_hectares: plannedArea,
      actual_area_hectares: actualArea,
      planned_quantity: null,
      actual_quantity: null,
      status: isCompleted ? 'completed' : operation.status === 'in-progress' ? 'in-progress' : 'not-started',
      start_time: '08:00',
      end_time: '17:00',
      duration_hours: isCompleted ? 8 + Math.floor(Math.random() * 2) : null,
      weather_conditions: isCompleted ? ['sunny', 'partly_cloudy', 'overcast'][Math.floor(Math.random() * 3)] : null,
      temperature_celsius: isCompleted ? 25 + Math.floor(Math.random() * 10) : null,
      humidity_percent: isCompleted ? 60 + Math.floor(Math.random() * 30) : null,
      wind_speed_kmh: isCompleted ? Math.floor(Math.random() * 20) : null,
      rainfall_mm: isCompleted && Math.random() > 0.8 ? Math.floor(Math.random() * 10) : null,
      soil_conditions: isCompleted ? ['dry', 'moist', 'wet'][Math.floor(Math.random() * 3)] : null,
      estimated_cost: estimatedCost,
      actual_cost: actualCost,
      // Add resource details for work packages
      products: operation.products ? operation.products.map((product: any) => ({
        ...product,
        actual_quantity: isCompleted ? product.planned_quantity * (0.95 + Math.random() * 0.1) / daysDiff : null,
        actual_cost: isCompleted ? product.planned_cost * (0.95 + Math.random() * 0.1) / daysDiff : null
      })) : [],
      equipment: operation.equipment ? operation.equipment.map((equipment: any) => ({
        ...equipment,
        actual_hours: isCompleted ? equipment.planned_hours * (0.9 + Math.random() * 0.2) / daysDiff : null,
        actual_cost: isCompleted ? equipment.planned_cost * (0.9 + Math.random() * 0.2) / daysDiff : null
      })) : [],
      labour: operation.labour ? operation.labour.map((labour: any) => ({
        ...labour,
        actual_hours: isCompleted ? labour.planned_hours * (0.9 + Math.random() * 0.2) / daysDiff : null,
        actual_cost: isCompleted ? labour.planned_cost * (0.9 + Math.random() * 0.2) / daysDiff : null
      })) : [],
      notes: null,
      created_at: formatDate(workDate),
      updated_at: new Date().toISOString()
    })
  }

  return workPackages
}

// Main function to generate complete demo data
export function generateCompleteMauritiusDemoData() {
  const farms = [
    {
      id: '550e8400-e29b-41d4-a716-446655440001',
      name: 'Omnicane Estate - North',
      company_id: '550e8400-e29b-41d4-a716-446655440000',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440002',
      name: 'Omnicane Estate - South',
      company_id: '550e8400-e29b-41d4-a716-446655440000',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    }
  ]

  const blocs: any[] = []
  const cropCycles: any[] = []
  const fieldOperations: any[] = []
  const workPackages: any[] = []

  // Generate 40 blocs with complete data
  FIELD_POLYGONS.forEach((field, index) => {
    const blocId = `550e8400-e29b-41d4-a716-44665544${String(index + 10).padStart(4, '0')}`
    const farmId = index < 20 ? farms[0].id : farms[1].id
    const variety = MAURITIUS_VARIETIES[index % MAURITIUS_VARIETIES.length]

    // Create bloc
    blocs.push({
      id: blocId,
      name: field.name,
      area_hectares: field.area,
      coordinates_wkt: field.wkt,
      status: 'active',
      farm_id: farmId,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    })

    // Generate crop cycles (current + historical)
    const currentCycleType = Math.random() > 0.3 ? 'ratoon' : 'plantation'
    const currentCycleNumber = currentCycleType === 'plantation' ? 1 : Math.floor(Math.random() * 4) + 2

    // Current active cycle
    const currentCycle = generateCropCycle(blocId, variety, currentCycleType, currentCycleNumber)
    cropCycles.push(currentCycle)

    // Generate historical cycles if this is a ratoon
    if (currentCycleType === 'ratoon') {
      for (let i = 1; i < currentCycleNumber; i++) {
        const historicalType = i === 1 ? 'plantation' : 'ratoon'
        const historicalCycle = generateCropCycle(blocId, variety, historicalType, i)
        historicalCycle.status = 'closed'
        historicalCycle.actual_harvest_date = historicalCycle.planned_harvest_date
        historicalCycle.actual_yield_tons_ha = variety.yield_potential + Math.floor(Math.random() * 15) - 7
        historicalCycle.actual_total_cost = Math.floor(Math.random() * 45000) + 95000
        historicalCycle.total_revenue = Math.floor(Math.random() * 100000) + 200000
        historicalCycle.sugarcane_revenue = Math.floor(Math.random() * 95000) + 190000
        cropCycles.push(historicalCycle)
      }
    }

    // Generate field operations for current cycle
    const operations = generateFieldOperations(currentCycle, field.area)
    fieldOperations.push(...operations)

    // Generate work packages for each operation
    operations.forEach(operation => {
      const packages = generateWorkPackages(operation)
      workPackages.push(...packages)
    })
  })

  // Ensure 4 blocs are currently harvesting
  const harvestingOperations = fieldOperations.filter(op => op.operation_type === 'harvesting')
  for (let i = 0; i < Math.min(4, harvestingOperations.length); i++) {
    harvestingOperations[i].status = 'in-progress'
    harvestingOperations[i].completion_percentage = 40 + Math.floor(Math.random() * 40)
    harvestingOperations[i].actual_start_date = harvestingOperations[i].planned_start_date
    harvestingOperations[i].actual_area_hectares = harvestingOperations[i].planned_area_hectares * 0.6
  }

  return {
    version: '2.0.0',
    farms,
    blocs,
    cropCycles,
    fieldOperations,
    workPackages,
    products: [], // Will be filled from existing data
    labour: [], // Will be filled from existing data
    equipment: [], // Will be filled from existing data
    sugarcaneVarieties: MAURITIUS_VARIETIES,
    intercropVarieties: [],
    lastUpdated: new Date().toISOString()
  }
}
