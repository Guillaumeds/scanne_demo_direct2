import { z } from 'zod'

// Base product schema for operations
export const productSchema = z.object({
  id: z.string().min(1, "Product ID is required"),
  name: z.string().min(1, "Product name is required"),
  quantity: z.number().min(0, "Quantity must be positive").optional(),
  rate: z.number().min(0, "Rate must be positive").optional(),
  unit: z.string().min(1, "Unit is required"),
  estimatedCost: z.number().min(0, "Estimated cost must be positive").optional(),
  actualCost: z.number().min(0, "Actual cost must be positive").optional(),
  category: z.string().optional(),
  supplier: z.string().optional(),
})

// Equipment schema for operations
export const equipmentSchema = z.object({
  id: z.string().min(1, "Equipment ID is required"),
  name: z.string().min(1, "Equipment name is required"),
  type: z.string().optional(),
  estimatedDuration: z.number().min(0, "Duration must be positive").optional(),
  actualDuration: z.number().min(0, "Duration must be positive").optional(),
  costPerHour: z.number().min(0, "Cost per hour must be positive").optional(),
  totalEstimatedCost: z.number().min(0, "Total estimated cost must be positive").optional(),
  totalActualCost: z.number().min(0, "Total actual cost must be positive").optional(),
  operator: z.string().optional(),
  fuelConsumption: z.number().min(0).optional(),
})

// Resource schema for labor/human resources
export const resourceSchema = z.object({
  id: z.string().min(1, "Resource ID is required"),
  name: z.string().min(1, "Resource name is required"),
  type: z.enum(['labor', 'contractor', 'supervisor']),
  estimatedEffort: z.number().min(0, "Estimated effort must be positive").optional(),
  actualEffort: z.number().min(0, "Actual effort must be positive").optional(),
  ratePerHour: z.number().min(0, "Rate per hour must be positive").optional(),
  estimatedCost: z.number().min(0, "Estimated cost must be positive").optional(),
  actualCost: z.number().min(0, "Actual cost must be positive").optional(),
  skills: z.array(z.string()).optional(),
})

// Attachment schema
export const attachmentSchema = z.object({
  id: z.string().min(1, "Attachment ID is required"),
  name: z.string().min(1, "File name is required"),
  url: z.string().url("Invalid URL format").optional(),
  type: z.string().min(1, "File type is required"),
  size: z.number().min(0, "File size must be positive").optional(),
  uploadedAt: z.date().optional(),
  uploadedBy: z.string().optional(),
})

// Main operations form schema with comprehensive validation
export const operationFormSchema = z.object({
  // Basic operation details
  operationName: z.string().min(1, "Operation name is required"),
  operationType: z.string().min(1, "Operation type is required"),
  method: z.string().min(1, "Method is required"),

  // Dates with validation
  plannedStartDate: z.string().min(1, "Planned start date is required"),
  plannedEndDate: z.string().min(1, "Planned end date is required"),
  actualStartDate: z.string().optional(),
  actualEndDate: z.string().optional(),

  // Area and quantities with validation
  plannedArea: z.number().min(0, "Planned area must be positive").optional(),
  actualArea: z.number().min(0, "Actual area must be positive").optional(),
  plannedQuantity: z.number().min(0, "Planned quantity must be positive").optional(),
  actualQuantity: z.number().min(0, "Actual quantity must be positive").optional(),

  // Yield fields (for harvest operations)
  totalYield: z.number().min(0, "Total yield must be positive").optional(),
  revenuePerHectare: z.number().min(0, "Revenue per hectare must be positive").optional(),

  // Status
  status: z.enum(['planned', 'in-progress', 'completed', 'cancelled']).default('planned'),

  // Related data
  products: z.array(productSchema).optional().default([]),
  equipment: z.array(equipmentSchema).optional().default([]),
  resources: z.array(resourceSchema).optional().default([]),

  // Financial
  estimatedTotalCost: z.number().min(0, "Estimated total cost must be positive").optional(),
  actualTotalCost: z.number().min(0, "Actual total cost must be positive").optional(),
  actualRevenue: z.number().min(0, "Actual revenue must be positive").optional(),

  // Additional information
  notes: z.string().optional(),
  attachments: z.array(attachmentSchema).optional().default([]),

  // Weather conditions (for field operations)
  weatherConditions: z.object({
    temperature: z.number().optional(),
    humidity: z.number().min(0).max(100).optional(),
    windSpeed: z.number().min(0).optional(),
    precipitation: z.number().min(0).optional(),
    conditions: z.string().optional(),
  }).optional(),

  // Quality metrics
  qualityMetrics: z.object({
    completionRate: z.number().min(0).max(100).optional(),
    qualityScore: z.number().min(0).max(10).optional(),
    defectRate: z.number().min(0).max(100).optional(),
    notes: z.string().optional(),
  }).optional(),
}).refine((data) => {
  // Date range validation: end date must be after start date
  if (data.plannedStartDate && data.plannedEndDate) {
    const startDate = new Date(data.plannedStartDate)
    const endDate = new Date(data.plannedEndDate)
    if (endDate <= startDate) {
      return false
    }
  }
  return true
}, {
  message: "Planned end date must be after planned start date",
  path: ["plannedEndDate"]
}).refine((data) => {
  // Actual date range validation
  if (data.actualStartDate && data.actualEndDate) {
    const startDate = new Date(data.actualStartDate)
    const endDate = new Date(data.actualEndDate)
    if (endDate <= startDate) {
      return false
    }
  }
  return true
}, {
  message: "Actual end date must be after actual start date",
  path: ["actualEndDate"]
}).refine((data) => {
  // Actual area cannot exceed planned area
  if (data.plannedArea && data.actualArea && data.actualArea > data.plannedArea) {
    return false
  }
  return true
}, {
  message: "Actual area cannot exceed planned area",
  path: ["actualArea"]
}).refine((data) => {
  // Harvest operation validation: must have yield data
  if (data.operationName?.toLowerCase() === 'harvesting' && data.status === 'completed') {
    if (!data.totalYield || data.totalYield <= 0) {
      return false
    }
  }
  return true
}, {
  message: "Completed harvest operations must have total yield data",
  path: ["totalYield"]
})

// Type inference
export type OperationFormData = z.infer<typeof operationFormSchema>
export type ProductData = z.infer<typeof productSchema>
export type EquipmentData = z.infer<typeof equipmentSchema>
export type ResourceData = z.infer<typeof resourceSchema>
export type AttachmentData = z.infer<typeof attachmentSchema>

// Validation helpers
export const validateOperation = (data: unknown) => {
  return operationFormSchema.safeParse(data)
}

// Create operation schema with bloc area validation
export const createOperationSchemaWithBlocArea = (blocArea: number) => {
  return operationFormSchema.refine((data) => {
    // Planned area cannot exceed bloc area
    if (data.plannedArea && data.plannedArea > blocArea) {
      return false
    }
    return true
  }, {
    message: `Planned area cannot exceed bloc area (${blocArea} hectares)`,
    path: ["plannedArea"]
  }).refine((data) => {
    // Actual area cannot exceed bloc area
    if (data.actualArea && data.actualArea > blocArea) {
      return false
    }
    return true
  }, {
    message: `Actual area cannot exceed bloc area (${blocArea} hectares)`,
    path: ["actualArea"]
  })
}

export const validateProduct = (data: unknown) => {
  return productSchema.safeParse(data)
}

export const validateEquipment = (data: unknown) => {
  return equipmentSchema.safeParse(data)
}

export const validateResource = (data: unknown) => {
  return resourceSchema.safeParse(data)
}

// Form field validation schemas for specific use cases
export const basicOperationSchema = operationFormSchema.pick({
  operationName: true,
  operationType: true,
  method: true,
  plannedStartDate: true,
  plannedEndDate: true,
  status: true,
})

export const operationDatesSchema = operationFormSchema.pick({
  plannedStartDate: true,
  plannedEndDate: true,
  actualStartDate: true,
  actualEndDate: true,
})

export const operationFinancialsSchema = operationFormSchema.pick({
  estimatedTotalCost: true,
  actualTotalCost: true,
  actualRevenue: true,
})
