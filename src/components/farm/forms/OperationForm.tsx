'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Save, X, Calendar, MapPin, DollarSign, Sprout, Plus, Trash2,
  Settings, Users, Package, TrendingUp, Cloud, Star, Camera,
  ChevronRight, ChevronDown, Info, AlertCircle
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
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

// Product schema for agricultural inputs
const productSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Product name is required'),
  category: z.enum(['fertilizer', 'pesticide', 'herbicide', 'seed', 'other']),
  quantity: z.number().min(0, 'Quantity must be positive'),
  unit: z.string().min(1, 'Unit is required'),
  rate: z.number().min(0, 'Rate must be positive'),
  estimatedCost: z.number().min(0, 'Cost must be positive'),
  actualCost: z.number().min(0, 'Cost must be positive').optional(),
  supplier: z.string().optional(),
  notes: z.string().optional()
})

// Equipment schema
const equipmentSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Equipment name is required'),
  type: z.enum(['tractor', 'implement', 'sprayer', 'harvester', 'irrigation', 'other']),
  operator: z.string().optional(),
  estimatedHours: z.number().min(0, 'Hours must be positive'),
  actualHours: z.number().min(0, 'Hours must be positive').optional(),
  costPerHour: z.number().min(0, 'Cost per hour must be positive'),
  fuelConsumption: z.number().min(0).optional(),
  notes: z.string().optional()
})

// Resource schema for labor
const resourceSchema = z.object({
  id: z.string(),
  type: z.enum(['supervisor', 'operator', 'laborer', 'specialist']),
  name: z.string().min(1, 'Resource name is required'),
  estimatedHours: z.number().min(0, 'Hours must be positive'),
  actualHours: z.number().min(0, 'Hours must be positive').optional(),
  ratePerHour: z.number().min(0, 'Rate per hour must be positive'),
  notes: z.string().optional()
})

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
  operationName: z.string().min(1, 'Operation name is required'),
  operationType: z.enum(['field-preparation', 'planting', 'fertilization', 'irrigation', 'pest-control', 'weed-control', 'harvesting', 'post-harvest']),
  method: z.enum(['manual', 'mechanical', 'chemical', 'biological', 'integrated']),
  description: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  status: z.enum(['planned', 'in-progress', 'completed', 'cancelled']).default('planned'),

  // Timing
  plannedStartDate: z.string().min(1, 'Start date is required'),
  plannedEndDate: z.string().min(1, 'End date is required'),
  actualStartDate: z.string().optional(),
  actualEndDate: z.string().optional(),

  // Area and Quantities
  plannedArea: z.number().min(0.1, 'Area must be at least 0.1 hectares'),
  actualArea: z.number().min(0).optional(),
  plannedQuantity: z.number().min(0).optional(),
  actualQuantity: z.number().min(0).optional(),

  // Products, Equipment, Resources
  products: z.array(productSchema).default([]),
  equipment: z.array(equipmentSchema).default([]),
  resources: z.array(resourceSchema).default([]),

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
  attachments: z.array(z.string()).default([])
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
  const { bloc, setCurrentScreen, currentOperationId } = useBlocContext()
  const [activeTab, setActiveTab] = useState('basic')
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    products: false,
    equipment: false,
    resources: false,
    weather: false,
    quality: false
  })

  const form = useForm({
    resolver: zodResolver(operationSchema),
    defaultValues: {
      operationName: '',
      operationType: 'fertilization' as const,
      method: 'mechanical' as const,
      description: '',
      priority: 'medium' as const,
      status: 'planned' as const,
      plannedStartDate: '',
      plannedEndDate: '',
      plannedArea: bloc.area,
      actualArea: undefined,
      plannedQuantity: undefined,
      actualQuantity: undefined,
      products: [],
      equipment: [],
      resources: [],
      estimatedTotalCost: 0,
      actualTotalCost: undefined,
      actualRevenue: undefined,
      totalYield: undefined,
      yieldPerHectare: undefined,
      weatherConditions: undefined,
      qualityMetrics: undefined,
      notes: '',
      attachments: []
    }
  })

  // Watch operation type for conditional rendering
  const operationType = form.watch('operationType')
  const isHarvestOperation = operationType === 'harvesting'

  const operationTypes = [
    { value: 'field-preparation', label: 'Field Preparation', icon: '🚜', color: 'bg-orange-100 text-orange-800' },
    { value: 'planting', label: 'Planting', icon: '🌱', color: 'bg-green-100 text-green-800' },
    { value: 'fertilization', label: 'Fertilization', icon: '🧪', color: 'bg-blue-100 text-blue-800' },
    { value: 'irrigation', label: 'Irrigation', icon: '💧', color: 'bg-cyan-100 text-cyan-800' },
    { value: 'pest-control', label: 'Pest Control', icon: '🐛', color: 'bg-red-100 text-red-800' },
    { value: 'weed-control', label: 'Weed Control', icon: '🌿', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'harvesting', label: 'Harvesting', icon: '🌾', color: 'bg-amber-100 text-amber-800' },
    { value: 'post-harvest', label: 'Post-Harvest', icon: '📦', color: 'bg-purple-100 text-purple-800' }
  ]

  const methods = [
    { value: 'manual', label: 'Manual', description: 'Hand labor operations' },
    { value: 'mechanical', label: 'Mechanical', description: 'Machine-based operations' },
    { value: 'chemical', label: 'Chemical', description: 'Chemical applications' },
    { value: 'biological', label: 'Biological', description: 'Biological control methods' },
    { value: 'integrated', label: 'Integrated', description: 'Combined approach' }
  ]

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const onSubmit = (data: OperationFormData) => {
    console.log('Saving operation:', data)
    // TODO: Implement save logic with TanStack Query mutation
    setCurrentScreen('operations')
  }

  const handleCancel = () => {
    setCurrentScreen('operations')
  }

  const addProduct = () => {
    const newProduct = {
      id: `product-${Date.now()}`,
      name: '',
      category: 'fertilizer' as const,
      quantity: 0,
      unit: 'kg',
      rate: 0,
      estimatedCost: 0,
      supplier: '',
      notes: ''
    }
    const currentProducts = form.getValues('products') || []
    form.setValue('products', [...currentProducts, newProduct])
  }

  const removeProduct = (index: number) => {
    const products = form.getValues('products') || []
    form.setValue('products', products.filter((_, i) => i !== index))
  }

  const addEquipment = () => {
    const newEquipment = {
      id: `equipment-${Date.now()}`,
      name: '',
      type: 'tractor' as const,
      operator: '',
      estimatedHours: 0,
      costPerHour: 0,
      fuelConsumption: 0,
      notes: ''
    }
    const currentEquipment = form.getValues('equipment') || []
    form.setValue('equipment', [...currentEquipment, newEquipment])
  }

  const removeEquipment = (index: number) => {
    const equipment = form.getValues('equipment') || []
    form.setValue('equipment', equipment.filter((_, i) => i !== index))
  }

  const addResource = () => {
    const newResource = {
      id: `resource-${Date.now()}`,
      type: 'laborer' as const,
      name: '',
      estimatedHours: 0,
      ratePerHour: 0,
      notes: ''
    }
    const currentResources = form.getValues('resources') || []
    form.setValue('resources', [...currentResources, newResource])
  }

  const removeResource = (index: number) => {
    const resources = form.getValues('resources') || []
    form.setValue('resources', resources.filter((_, i) => i !== index))
  }

  return (
    <div className="h-full overflow-auto bg-background">
      <div className="max-w-6xl mx-auto p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                  <Sprout className="h-6 w-6 text-primary" />
                  {currentOperationId ? 'Edit Field Operation' : 'New Field Operation'}
                </h1>
                <p className="text-muted-foreground mt-1">
                  Plan and manage agricultural operations for {bloc.name || `Bloc ${bloc.localId}`}
                </p>
              </div>
              <Badge variant="outline" className="text-sm">
                {bloc.area.toFixed(1)} hectares
              </Badge>
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
                  <TabsList className="grid w-full grid-cols-4 bg-muted/50">
                    {[
                      { value: 'basic', icon: Settings, label: 'Basic Info' },
                      { value: 'resources', icon: Users, label: 'Resources' },
                      { value: 'financial', icon: DollarSign, label: 'Financial' },
                      { value: 'additional', icon: Star, label: 'Additional' }
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
                            <motion.div
                              whileHover={{ scale: 1.1 }}
                              transition={{ duration: 0.2 }}
                            >
                              <Icon className="h-4 w-4" />
                            </motion.div>
                            <span className="hidden sm:inline">{tab.label}</span>

                            {/* Active tab indicator */}
                            {activeTab === tab.value && (
                              <motion.div
                                layoutId="activeTabIndicator"
                                className="absolute inset-0 bg-background rounded-md border border-border/50"
                                style={{ zIndex: -1 }}
                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                              />
                            )}
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
                      {/* Operation Type Selection */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="operationType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Operation Type</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select operation type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {operationTypes.map((type) => (
                                    <SelectItem key={type.value} value={type.value}>
                                      <div className="flex items-center gap-2">
                                        <span>{type.icon}</span>
                                        {type.label}
                                      </div>
                                    </SelectItem>
                                  ))}
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
                              <FormLabel>Method</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select method" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {methods.map((method) => (
                                    <SelectItem key={method.value} value={method.value}>
                                      <div>
                                        <div className="font-medium">{method.label}</div>
                                        <div className="text-xs text-muted-foreground">{method.description}</div>
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Operation Name and Priority */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-2">
                          <FormField
                            control={form.control}
                            name="operationName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Operation Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="e.g., Spring Fertilization 2024" {...field} />
                                </FormControl>
                                <FormDescription>
                                  Give this operation a descriptive name
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={form.control}
                          name="priority"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Priority</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="low">
                                    <div className="flex items-center gap-2">
                                      <div className="w-2 h-2 rounded-full bg-green-500" />
                                      Low
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="medium">
                                    <div className="flex items-center gap-2">
                                      <div className="w-2 h-2 rounded-full bg-yellow-500" />
                                      Medium
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="high">
                                    <div className="flex items-center gap-2">
                                      <div className="w-2 h-2 rounded-full bg-red-500" />
                                      High
                                    </div>
                                  </SelectItem>
                                </SelectContent>
                              </Select>
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
                                className="min-h-20"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>

                  {/* Timing Card */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-primary" />
                        Timing & Schedule
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="plannedStartDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Planned Start Date</FormLabel>
                              <FormControl>
                                <Input type="date" {...field} />
                              </FormControl>
                              <FormDescription>
                                When do you plan to start this operation?
                              </FormDescription>
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
                              <FormDescription>
                                When do you expect to complete this operation?
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Area & Quantities Card */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-primary" />
                        Area & Quantities
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="plannedArea"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Planned Area (hectares)</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  step="0.1"
                                  min="0.1"
                                  max={bloc.area}
                                  {...field}
                                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                />
                              </FormControl>
                              <FormDescription>
                                Maximum: {bloc.area.toFixed(1)} ha (total bloc area)
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="plannedQuantity"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Planned Quantity (optional)</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  step="0.1"
                                  min="0"
                                  placeholder="e.g., 1000 kg"
                                  {...field}
                                  onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                                />
                              </FormControl>
                              <FormDescription>
                                Total quantity for this operation
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Resources Tab */}
                <TabsContent value="resources" className="space-y-6 mt-6">
                  {/* Products Section */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          <Package className="h-5 w-5 text-primary" />
                          Products & Materials
                        </CardTitle>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={addProduct}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Product
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {(form.watch('products') || []).length === 0 ? (
                        <div className="text-center py-8 border-2 border-dashed border-border rounded-lg">
                          <Package className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                          <p className="text-muted-foreground">No products added yet</p>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={addProduct}
                            className="mt-2"
                          >
                            Add your first product
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {(form.watch('products') || []).map((product, index) => (
                            <motion.div
                              key={product.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -20 }}
                              className="p-4 border border-border rounded-lg bg-muted/30"
                            >
                              <div className="flex items-center justify-between mb-4">
                                <h4 className="font-medium">Product {index + 1}</h4>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeProduct(index)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <FormField
                                  control={form.control}
                                  name={`products.${index}.name`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Product Name</FormLabel>
                                      <FormControl>
                                        <Input placeholder="e.g., NPK 15-15-15" {...field} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />

                                <FormField
                                  control={form.control}
                                  name={`products.${index}.category`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Category</FormLabel>
                                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                          <SelectTrigger>
                                            <SelectValue />
                                          </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                          <SelectItem value="fertilizer">Fertilizer</SelectItem>
                                          <SelectItem value="pesticide">Pesticide</SelectItem>
                                          <SelectItem value="herbicide">Herbicide</SelectItem>
                                          <SelectItem value="seed">Seed</SelectItem>
                                          <SelectItem value="other">Other</SelectItem>
                                        </SelectContent>
                                      </Select>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />

                                <FormField
                                  control={form.control}
                                  name={`products.${index}.unit`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Unit</FormLabel>
                                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                          <SelectTrigger>
                                            <SelectValue />
                                          </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                          <SelectItem value="kg">Kilograms (kg)</SelectItem>
                                          <SelectItem value="l">Liters (l)</SelectItem>
                                          <SelectItem value="bags">Bags</SelectItem>
                                          <SelectItem value="units">Units</SelectItem>
                                        </SelectContent>
                                      </Select>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                                <FormField
                                  control={form.control}
                                  name={`products.${index}.quantity`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Quantity</FormLabel>
                                      <FormControl>
                                        <Input
                                          type="number"
                                          step="0.1"
                                          min="0"
                                          {...field}
                                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />

                                <FormField
                                  control={form.control}
                                  name={`products.${index}.rate`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Rate per ha</FormLabel>
                                      <FormControl>
                                        <Input
                                          type="number"
                                          step="0.1"
                                          min="0"
                                          {...field}
                                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />

                                <FormField
                                  control={form.control}
                                  name={`products.${index}.estimatedCost`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Cost ($)</FormLabel>
                                      <FormControl>
                                        <Input
                                          type="number"
                                          step="0.01"
                                          min="0"
                                          {...field}
                                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />

                                <FormField
                                  control={form.control}
                                  name={`products.${index}.supplier`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Supplier</FormLabel>
                                      <FormControl>
                                        <Input placeholder="Supplier name" {...field} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Financial Tab */}
                <TabsContent value="financial" className="space-y-6 mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5 text-primary" />
                        Financial Planning
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="estimatedTotalCost"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Estimated Total Cost ($)</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  {...field}
                                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                />
                              </FormControl>
                              <FormDescription>
                                Total estimated cost for this operation
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {isHarvestOperation && (
                          <FormField
                            control={form.control}
                            name="actualRevenue"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Expected Revenue ($)</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    {...field}
                                    onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                                  />
                                </FormControl>
                                <FormDescription>
                                  Expected revenue from harvest
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}
                      </div>

                      {isHarvestOperation && (
                        <div className="mt-6 p-4 bg-muted/30 rounded-lg">
                          <h4 className="font-medium mb-4">Yield Expectations</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="totalYield"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Expected Total Yield (tons)</FormLabel>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      step="0.1"
                                      min="0"
                                      {...field}
                                      onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="yieldPerHectare"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Yield per Hectare (t/ha)</FormLabel>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      step="0.1"
                                      min="0"
                                      {...field}
                                      onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Additional Tab */}
                <TabsContent value="additional" className="space-y-6 mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Star className="h-5 w-5 text-primary" />
                        Additional Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <FormField
                        control={form.control}
                        name="notes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Notes & Instructions</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Add any additional notes, special instructions, or observations..."
                                className="min-h-32"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Photo Upload Section */}
                      <div className="space-y-4">
                        <Label>Attachments & Photos</Label>
                        <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                          <Camera className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                          <p className="text-sm text-muted-foreground mb-2">
                            Upload planning documents, photos, or reference materials
                          </p>
                          <Button variant="outline" size="sm" type="button">
                            <Plus className="h-4 w-4 mr-2" />
                            Choose Files
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>

              {/* Form Actions */}
              <div className="flex gap-3 pt-6 border-t border-border">
                <Button type="submit" className="flex-1" size="lg">
                  <Save className="h-4 w-4 mr-2" />
                  Save Operation
                </Button>
                <Button type="button" variant="outline" onClick={handleCancel} size="lg">
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </form>
          </Form>
        </motion.div>
      </div>
    </div>
  )
}
