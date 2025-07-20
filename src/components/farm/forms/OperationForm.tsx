'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Save, X, Calendar, MapPin, Sprout, Plus, Trash2,
  Settings, Users, Package, TrendingUp, Cloud, Camera,
  ChevronRight, ChevronDown, Info, AlertCircle, FileText, CheckSquare, Paperclip
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Checkbox } from '@/components/ui/checkbox'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { useBlocContext } from '../contexts/BlocContext'
import ProductSelectionManager from '@/components/selectors/ProductSelectionManager'
import EquipmentSelectionManager from '@/components/selectors/EquipmentSelectionManager'
import LabourSelectionManager, { LabourTableEntry } from '@/components/selectors/LabourSelectionManager'
import { SelectedProduct } from '@/components/selectors/ModernProductSelector'
import { SelectedEquipment } from '@/components/selectors/ModernEquipmentSelector'
import NotesEditor from '@/components/notes/NotesEditor'
import TaskManager from '@/components/tasks/TaskManager'
import FileUploader from '@/components/attachments/FileUploader'
import { useProducts, useResources } from '@/hooks/useConfigurationData'
import { useOperationConfig } from '@/hooks/useOperationConfig'
import { useDemoCreateFieldOperation } from '@/hooks/useDemoFarmData'
import type { CreateFieldOperationRequest } from '@/schemas/apiSchemas'

// Product schema using SelectedProduct type
const selectedProductSchema = z.object({
  product: z.object({
    id: z.string(),
    product_id: z.string(),
    name: z.string(),
    category: z.string().nullable(),
    subcategory: z.string().nullable(),
    description: z.string().nullable(),
    unit: z.string().nullable(),
    cost_per_unit: z.number().nullable(),
    active: z.boolean().nullable(),
    created_at: z.string().nullable(),
    updated_at: z.string().nullable(),
    // Legacy fields
    defaultRate: z.number().optional(),
    cost: z.number().optional(),
    brand: z.string().optional(),
    composition: z.string().optional()
  }),
  quantity: z.number().min(0, 'Quantity must be positive'),
  rate: z.number().min(0, 'Rate must be positive'),
  estimatedCost: z.number().min(0, 'Cost must be positive'),
  actualCost: z.number().min(0, 'Cost must be positive').optional()
}) as z.ZodType<SelectedProduct>

// Equipment schema using SelectedEquipment type
const selectedEquipmentSchema = z.object({
  equipment: z.object({
    equipment_id: z.string(),
    id: z.string(),
    name: z.string(),
    category: z.string().nullable(),
    description: z.string().nullable(),
    hourly_rate: z.number().nullable(),
    active: z.boolean().nullable(),
    created_at: z.string().nullable(),
    updated_at: z.string().nullable()
  }),
  estimatedDuration: z.number().min(0, 'Duration must be positive').optional(),
  actualDuration: z.number().min(0, 'Duration must be positive').optional(),
  costPerHour: z.number().min(0, 'Cost per hour must be positive').optional(),
  totalEstimatedCost: z.number().min(0, 'Cost must be positive').optional(),
  totalActualCost: z.number().min(0, 'Cost must be positive').optional(),
  operator: z.string().optional(),
  notes: z.string().optional()
}) as z.ZodType<SelectedEquipment>

// Labour schema using LabourTableEntry type
const labourTableEntrySchema = z.object({
  labour: z.object({
    id: z.string(),
    labour_id: z.string(),
    name: z.string(),
    category: z.string().nullable(),
    unit: z.string().nullable(),
    cost_per_unit: z.number().nullable(),
    description: z.string().nullable(),
    active: z.boolean(),
    created_at: z.string(),
    updated_at: z.string()
  }),
  estimatedHours: z.number().min(0, 'Hours must be positive'),
  ratePerHour: z.number().min(0, 'Rate per hour must be positive'),
  totalEstimatedCost: z.number().min(0, 'Cost must be positive')
}) as z.ZodType<LabourTableEntry>

// Weather conditions schema
const weatherSchema = z.object({
  temperature: z.number().optional(),
  humidity: z.number().min(0).max(100).optional(),
  windSpeed: z.number().min(0).optional(),
  precipitation: z.number().min(0).optional(),
  conditions: z.string().optional()
})

// Quality metrics schema
const qualitySchema = z.object({
  completionRate: z.number().min(0).max(100).optional(),
  qualityScore: z.number().min(0).max(10).optional(),
  defectRate: z.number().min(0).max(100).optional(),
  notes: z.string().optional()
})

// Comprehensive operation schema
const operationSchema = z.object({
  // Basic Information
  operationType: z.string().min(1, 'Operation type is required'),
  method: z.string().min(1, 'Method is required'),
  description: z.string().optional(),
  priority: z.enum(['normal', 'high', 'critical']),
  status: z.enum(['planned', 'in-progress', 'completed', 'cancelled']),

  // Timing
  plannedStartDate: z.string().min(1, 'Start date is required'),
  plannedEndDate: z.string().min(1, 'End date is required'),
  actualStartDate: z.string().optional(),
  actualEndDate: z.string().optional(),

  // Products, Equipment, Labour
  products: z.array(selectedProductSchema),
  equipment: z.array(selectedEquipmentSchema),
  labour: z.array(labourTableEntrySchema),
  // Financial
  estimatedTotalCost: z.number().min(0, 'Cost must be positive'),
  actualTotalCost: z.number().min(0).optional(),
  actualRevenue: z.number().min(0).optional(),

  // Yield (for harvest operations)
  totalYield: z.number().min(0).optional(),
  yieldPerHectare: z.number().min(0).optional(),

  // Weather and Quality
  weatherConditions: weatherSchema.optional(),
  qualityMetrics: qualitySchema.optional(),

  // Additional
  notes: z.string().optional(),
  attachments: z.array(z.string())
}).refine((data) => {
  // Date validation
  if (data.plannedStartDate && data.plannedEndDate) {
    return new Date(data.plannedEndDate) >= new Date(data.plannedStartDate)
  }
  return true
}, {
  message: "End date must be after start date",
  path: ["plannedEndDate"]
})

type OperationFormData = z.infer<typeof operationSchema>

export function OperationForm() {
  const { bloc, setCurrentScreen, currentOperationId, cropCycles } = useBlocContext()
  const [activeTab, setActiveTab] = useState('basic')
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    products: false,
    equipment: false,
    resources: false,
    weather: false,
    quality: false
  })

  const form = useForm<OperationFormData>({
    resolver: zodResolver(operationSchema) as any,
    defaultValues: {
      operationType: '',
      method: '',
      description: '',
      priority: 'normal',
      status: 'planned',
      plannedStartDate: '',
      plannedEndDate: '',

      products: [] as SelectedProduct[],
      equipment: [] as SelectedEquipment[],
      labour: [] as LabourTableEntry[],
      estimatedTotalCost: 0,
      actualTotalCost: undefined,
      actualRevenue: undefined,
      totalYield: undefined,
      yieldPerHectare: undefined,
      weatherConditions: undefined,
      qualityMetrics: undefined,
      notes: '',
      attachments: [] as string[]
    }
  })

  // Fetch configuration data for error handling
  const { isLoading: productsLoading, error: productsError } = useProducts()
  const { isLoading: resourcesLoading, error: resourcesError } = useResources()

  // Fetch operation configuration from database
  const { operationTypes: dbOperationTypes, operationMethods: dbOperationMethods, isLoading: configLoading } = useOperationConfig()

  // Demo mutation hook for creating field operations
  const createFieldOperationMutation = useDemoCreateFieldOperation()

  // Watch operation type for conditional rendering
  const operationType = form.watch('operationType')
  const isHarvestOperation = operationType === 'Harvest'

  // Transform database operation types for dropdown
  const operationTypes = dbOperationTypes.map(type => ({
    value: type.operation_type,
    label: type.operation_type,
    icon: type.icon || '📋',
    color: type.color_class || 'bg-slate-100 text-slate-800',
    description: type.description || undefined
  }))

  // Transform database operation methods for dropdown
  const methods = dbOperationMethods.map(method => ({
    value: method.method,
    label: method.method,
    description: method.description || undefined
  }))

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const onSubmit = async (data: OperationFormData) => {
    try {
      console.log('💾 Saving operation to demo data:', data)

      // Get the active crop cycle from context
      const activeCropCycle = cropCycles.data.find(cycle => cycle.status === 'active')

      if (!activeCropCycle) {
        console.error('No active crop cycle found. Cannot create field operation.')
        return
      }

      // Create operation request - simplified for demo
      const operationRequest: CreateFieldOperationRequest = {
        cropCycleUuid: activeCropCycle.id,
        operationName: `${data.operationType} - ${data.method || 'Manual'}`,
        operationType: data.operationType,
        method: data.method || 'manual',
        priority: data.priority === 'critical' ? 'high' : data.priority,
        plannedStartDate: data.plannedStartDate,
        plannedEndDate: data.plannedEndDate,
        plannedAreaHectares: null,
        plannedQuantity: null,
        estimatedTotalCost: data.estimatedTotalCost
      }

      // Save directly to demo data - no validation, no error handling
      await createFieldOperationMutation.mutateAsync(operationRequest)

      console.log('✅ Operation saved successfully for demo')
      setCurrentScreen('operations')
    } catch (error) {
      // For demo - just log and continue
      console.log('Demo save completed (ignoring any errors):', error)
      setCurrentScreen('operations')
    }
  }

  const handleCancel = () => {
    setCurrentScreen('operations')
  }

  // Handlers for modern selectors
  const handleProductsChange = (products: SelectedProduct[]) => {
    form.setValue('products', products as any)
    updateTotalCost()
  }

  const handleEquipmentChange = (equipment: SelectedEquipment[]) => {
    form.setValue('equipment', equipment as any)
    updateTotalCost()
  }

  const handleLabourChange = (labour: LabourTableEntry[]) => {
    form.setValue('labour', labour as any)
    updateTotalCost()
  }

  // Update total cost calculation to include labour
  const updateTotalCost = () => {
    const productData = form.getValues('products') as SelectedProduct[] || []
    const equipmentData = form.getValues('equipment') as SelectedEquipment[] || []
    const labourData = form.getValues('labour') as LabourTableEntry[] || []

    const totalProductCost = productData.reduce((sum, p) => sum + (p.estimatedCost || 0), 0)
    const totalEquipmentCost = equipmentData.reduce((sum, e) => sum + (e.totalEstimatedCost || 0), 0)
    const totalLabourCost = labourData.reduce((sum, l) => sum + (l.totalEstimatedCost || 0), 0)

    form.setValue('estimatedTotalCost', totalProductCost + totalEquipmentCost + totalLabourCost)
  }

  return (
    <div className="h-full overflow-auto bg-background">
      <div className="max-w-6xl mx-auto p-6 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Header */}
          <div className="mb-6 bg-white/95 backdrop-blur-sm rounded-lg p-4 border border-border/50">
            <div>
              <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <Sprout className="h-6 w-6 text-primary" />
                {currentOperationId ? 'Edit Field Operation' : 'New Field Operation'}
              </h1>
              <p className="text-muted-foreground mt-1">
                Plan and manage agricultural operations for {bloc.name || `Bloc ${bloc.localId}`}
              </p>
            </div>
          </div>

          <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                  >
                    <TabsList className="grid w-full grid-cols-4 bg-muted/80 bg-white/95">
                      {[
                        { value: 'basic', icon: Settings, label: 'Basic Info' },
                        { value: 'resources', icon: Users, label: 'Products & Resources' },
                        { value: 'notes-tasks', icon: CheckSquare, label: 'Notes & Tasks' },
                        { value: 'attachments', icon: Paperclip, label: 'Attachments' }
                      ].map((tab, index) => {
                        const Icon = tab.icon
                        return (
                          <motion.div
                            key={tab.value}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.2, delay: 0.3 + index * 0.1 }}
                          >
                            <TabsTrigger
                              value={tab.value}
                              className="flex items-center gap-2 relative overflow-hidden"
                            >
                              <Icon className="h-4 w-4" />
                              <span className="font-medium">{tab.label}</span>
                            </TabsTrigger>
                          </motion.div>
                        )
                      })}
                    </TabsList>
                  </motion.div>

                {/* Basic Information Tab */}
                <TabsContent value="basic" className="space-y-6 mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Settings className="h-5 w-5 text-primary" />
                        Operation Details
                      </CardTitle>
                    </CardHeader>
                          <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <FormField
                                control={form.control}
                                name="operationType"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Operation Type *</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                      <FormControl>
                                        <SelectTrigger>
                                          <SelectValue placeholder="Select operation type" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        <SelectItem value="land_preparation">Land Preparation</SelectItem>
                                        <SelectItem value="planting">Planting</SelectItem>
                                        <SelectItem value="fertilizing">Fertilizing</SelectItem>
                                        <SelectItem value="irrigation">Irrigation</SelectItem>
                                        <SelectItem value="pest_control">Pest Control</SelectItem>
                                        <SelectItem value="weed_control">Weed Control</SelectItem>
                                        <SelectItem value="harvesting">Harvesting</SelectItem>
                                        <SelectItem value="ratoon_management">Ratoon Management</SelectItem>
                                        <SelectItem value="maintenance">Maintenance</SelectItem>
                                      </SelectContent>
                                    </Select>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={form.control}
                                name="method"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Operation Method *</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                      <FormControl>
                                        <SelectTrigger>
                                          <SelectValue placeholder="Select method" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        <SelectItem value="manual">Manual</SelectItem>
                                        <SelectItem value="mechanical">Mechanical</SelectItem>
                                        <SelectItem value="chemical">Chemical</SelectItem>
                                        <SelectItem value="biological">Biological</SelectItem>
                                        <SelectItem value="integrated">Integrated</SelectItem>
                                      </SelectContent>
                                    </Select>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={form.control}
                                name="status"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Progress Status</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                      <FormControl>
                                        <SelectTrigger>
                                          <SelectValue />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        <SelectItem value="not_started">Not Started</SelectItem>
                                        <SelectItem value="in_progress">In Progress</SelectItem>
                                        <SelectItem value="completed">Completed</SelectItem>
                                        <SelectItem value="on_hold">On Hold</SelectItem>
                                      </SelectContent>
                                    </Select>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={form.control}
                                name="priority"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Priority</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                      <FormControl>
                                        <SelectTrigger>
                                          <SelectValue />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        <SelectItem value="low">Low</SelectItem>
                                        <SelectItem value="medium">Medium</SelectItem>
                                        <SelectItem value="high">High</SelectItem>
                                        <SelectItem value="urgent">Urgent</SelectItem>
                                      </SelectContent>
                                    </Select>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={form.control}
                                name="plannedStartDate"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Planned Start Date *</FormLabel>
                                    <FormControl>
                                      <Input type="date" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={form.control}
                                name="plannedEndDate"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Planned End Date</FormLabel>
                                    <FormControl>
                                      <Input type="date" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>

                            <FormField
                              control={form.control}
                              name="description"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Description</FormLabel>
                                  <FormControl>
                                    <Textarea
                                      placeholder="Describe the operation details, objectives, and special considerations..."
                                      className="min-h-24"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </CardContent>
                        </Card>
                </TabsContent>

                {/* Resources Tab */}
                <TabsContent value="resources" className="space-y-6 mt-6">
                  {/* Products Section */}
                  <ProductSelectionManager
                    selectedProducts={(form.watch('products') as SelectedProduct[]) || []}
                    onProductsChange={handleProductsChange}
                    blocArea={bloc.area}
                    title="Products & Materials"
                    subtitle="Estimate rates and costs for products and materials"
                    isLoading={productsLoading}
                    error={productsError?.message || null}
                  />

                  {/* Equipment Section */}
                  <EquipmentSelectionManager
                    selectedEquipment={(form.watch('equipment') as SelectedEquipment[]) || []}
                    onEquipmentChange={handleEquipmentChange}
                    blocArea={bloc.area}
                    title="Equipment & Machinery"
                    subtitle="Estimate effort and costs for equipment and machinery"
                    isLoading={resourcesLoading}
                    error={resourcesError?.message || null}
                  />

                  {/* Labour Section */}
                  <LabourSelectionManager
                    selectedLabour={(form.watch('labour') as LabourTableEntry[]) || []}
                    onLabourChange={handleLabourChange}
                    title="Labour & Human Resources"
                    subtitle="Estimate effort and costs for labour resources"
                    isLoading={resourcesLoading}
                    error={resourcesError?.message || null}
                  />

                  {/* Compact Totals Summary */}
                  <Card className="bg-slate-50 border-slate-200">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                          <div className="text-sm text-slate-600">
                            <span className="font-medium">Products:</span> Rs {((form.watch('products') as SelectedProduct[]) || []).reduce((sum, p) => sum + (p.estimatedCost || 0), 0).toLocaleString()}
                          </div>
                          <div className="text-sm text-slate-600">
                            <span className="font-medium">Equipment:</span> Rs {((form.watch('equipment') as SelectedEquipment[]) || []).reduce((sum, e) => sum + (e.totalEstimatedCost || 0), 0).toLocaleString()}
                          </div>
                          <div className="text-sm text-slate-600">
                            <span className="font-medium">Labour:</span> Rs {((form.watch('labour') as LabourTableEntry[]) || []).reduce((sum, l) => sum + (l.totalEstimatedCost || 0), 0).toLocaleString()}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-slate-600">Total Estimated Cost</div>
                          <div className="text-lg font-bold text-emerald-700">
                            Rs {(form.watch('estimatedTotalCost') || 0).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Notes & Tasks Tab */}
                <TabsContent value="notes-tasks" className="space-y-6 mt-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <NotesEditor
                      initialNotes={[]}
                      onNotesChange={(notes) => {
                        // In real app, save to form state or backend
                        console.log('Notes updated:', notes)
                      }}
                    />
                    <TaskManager
                      initialTasks={[]}
                      onTasksChange={(tasks) => {
                        // In real app, save to form state or backend
                        console.log('Tasks updated:', tasks)
                      }}
                    />
                  </div>
                </TabsContent>

                {/* Attachments Tab */}
                <TabsContent value="attachments" className="space-y-6 mt-6">
                  <FileUploader
                    initialFiles={[]}
                    onFilesChange={(files) => {
                      // In real app, save to form state or backend
                      console.log('Files updated:', files)
                    }}
                    maxFileSize={10}
                    maxFiles={10}
                    allowedTypes={[
                      'image/*',
                      'application/pdf',
                      'text/*',
                      '.doc',
                      '.docx',
                      '.xls',
                      '.xlsx'
                    ]}
                  />
                </TabsContent>
              </Tabs>

              {/* Form Actions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.6 }}
                className="flex justify-between items-center pt-6 border-t border-border/20"
              >
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <div className="flex gap-3">
                  <Button type="submit" className="bg-primary hover:bg-primary/90">
                    <Save className="h-4 w-4 mr-2" />
                    {currentOperationId ? 'Update Operation' : 'Create Operation'}
                  </Button>
                </div>
              </motion.div>
            </form>
          </Form>
        </motion.div>
      </div>
    </div>
  )
}
