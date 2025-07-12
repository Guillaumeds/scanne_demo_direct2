import { z } from 'zod'
import { productSchema, equipmentSchema, resourceSchema, attachmentSchema } from './operationsSchema'

// Work package specific schemas
export const workPackageProgressSchema = z.object({
  completionPercentage: z.number().min(0).max(100, "Completion percentage must be between 0 and 100"),
  qualityRating: z.number().min(1).max(5, "Quality rating must be between 1 and 5").optional(),
  issuesEncountered: z.array(z.string()).optional().default([]),
  mitigationActions: z.array(z.string()).optional().default([]),
  nextSteps: z.string().optional(),
})

// Simplified daily work package form schema matching our implementation
export const workPackageFormSchema = z.object({
  // Basic information (General tab)
  date: z.string().min(1, "Date is required"),
  actualArea: z.number().min(0, "Area must be positive").optional(),
  actualQuantity: z.number().min(0, "Quantity must be positive").optional(),
  rate: z.number().min(0, "Rate must be positive").optional(),

  // Status
  status: z.enum(['not-started', 'in-progress', 'completed']).default('not-started'),

  // Additional information
  notes: z.string().optional(),
  attachments: z.array(attachmentSchema).optional().default([]),
}).refine((data) => {
  // Date validation: cannot be in the future
  const workDate = new Date(data.date)
  const today = new Date()
  today.setHours(23, 59, 59, 999) // End of today

  if (workDate > today) {
    return false
  }
  return true
}, {
  message: "Work package date cannot be in the future",
  path: ["date"]
})

// Type inference
export type WorkPackageFormData = z.infer<typeof workPackageFormSchema>
export type WorkPackageProgressData = z.infer<typeof workPackageProgressSchema>

// Validation helpers
export const validateWorkPackage = (data: unknown) => {
  return workPackageFormSchema.safeParse(data)
}

// Create work package schema with operation date validation
export const createWorkPackageSchemaWithOperationDates = (operationStartDate?: string, operationEndDate?: string) => {
  return workPackageFormSchema.refine((data) => {
    // Operation date range validation
    if (operationStartDate && data.date) {
      const workDate = new Date(data.date)
      const opStartDate = new Date(operationStartDate)
      if (workDate < opStartDate) {
        return false
      }
    }
    return true
  }, {
    message: "Work package date cannot be before operation start date",
    path: ["date"]
  }).refine((data) => {
    if (operationEndDate && data.date) {
      const workDate = new Date(data.date)
      const opEndDate = new Date(operationEndDate)
      if (workDate > opEndDate) {
        return false
      }
    }
    return true
  }, {
    message: "Work package date cannot be after operation end date",
    path: ["date"]
  })
}

// Simplified schemas for different form sections
export const basicWorkPackageSchema = workPackageFormSchema.pick({
  date: true,
  actualArea: true,
  actualQuantity: true,
  rate: true,
  status: true,
})

// Status validation
export const workPackageStatusSchema = z.enum(['not-started', 'in-progress', 'completed'])
