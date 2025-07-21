'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Save, X, Calendar, Clock, Users, Truck, Camera,
  Thermometer, Wind, Droplets, Sun, Cloud, CloudRain,
  Star, AlertTriangle, CheckCircle, Upload, Trash2,
  Timer, Target, Activity
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import ProductSelectionManager from '@/components/selectors/ProductSelectionManager'
import EquipmentSelectionManager from '@/components/selectors/EquipmentSelectionManager'
import { SelectedProduct } from '@/components/selectors/ModernProductSelector'
import { SelectedEquipment } from '@/components/selectors/ModernEquipmentSelector'
import { useProducts, useResources } from '@/hooks/useConfigurationData'
import { useDemoCreateWorkPackage } from '@/hooks/useDemoFarmData'
import type { CreateWorkPackageRequest } from '@/schemas/apiSchemas'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
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
import { ResponsiveContainer, useResponsive, TouchFriendly } from '../shared/ResponsiveContainer'
import { LoadingSpinner } from '../shared/LoadingSpinner'
import { useBlocContext } from '../contexts/BlocContext'

// Photo attachment schema
const photoSchema = z.object({
  id: z.string(),
  file: z.any(), // File object
  url: z.string().optional(),
  caption: z.string().optional(),
  timestamp: z.date().default(() => new Date())
})

// Weather conditions schema
const weatherSchema = z.object({
  temperature: z.number().optional(),
  humidity: z.number().min(0).max(100).optional(),
  windSpeed: z.number().min(0).optional(),
  windDirection: z.string().optional(),
  precipitation: z.number().min(0).optional(),
  conditions: z.enum(['sunny', 'cloudy', 'overcast', 'light-rain', 'heavy-rain', 'windy']).optional(),
  visibility: z.enum(['excellent', 'good', 'fair', 'poor']).optional()
})

// Resource usage schema
const resourceUsageSchema = z.object({
  crewMembers: z.array(z.object({
    name: z.string(),
    role: z.string(),
    hoursWorked: z.number().min(0)
  })).default([]),
  equipmentUsed: z.array(z.object({
    name: z.string(),
    type: z.string(),
    hoursUsed: z.number().min(0),
    fuelConsumed: z.number().min(0).optional(),
    operator: z.string().optional()
  })).default([]),
  materialsUsed: z.array(z.object({
    name: z.string(),
    quantity: z.number().min(0),
    unit: z.string(),
    cost: z.number().min(0).optional()
  })).default([])
})

// Comprehensive work package schema
const workPackageSchema = z.object({
  // Basic Information
  date: z.string().min(1, 'Date is required'),
  startTime: z.string().min(1, 'Start time is required'),
  endTime: z.string().min(1, 'End time is required'),

  // Area
  actualArea: z.number().min(0.01, 'Area must be at least 0.01 hectares'),
  fieldConditions: z.string().optional(),

  // Resources
  resourceUsage: resourceUsageSchema.default({
    crewMembers: [],
    equipmentUsed: [],
    materialsUsed: []
  }),

  // Products & Materials
  products: z.array(z.any()).default([]),
  equipment: z.array(z.any()).default([]),

  // Work Quality & Progress
  completionPercentage: z.number().min(0).max(100).default(0),
  qualityRating: z.number().min(1).max(5).default(3),
  workStandard: z.enum(['below-standard', 'meets-standard', 'exceeds-standard']).default('meets-standard'),

  // Environmental Conditions
  weatherConditions: weatherSchema.optional(),
  soilConditions: z.enum(['dry', 'moist', 'wet', 'waterlogged']).optional(),

  // Issues & Observations
  issuesEncountered: z.array(z.object({
    type: z.enum(['equipment', 'weather', 'personnel', 'material', 'other']),
    description: z.string(),
    severity: z.enum(['low', 'medium', 'high']),
    resolution: z.string().optional()
  })).default([]),

  // Financial
  actualCost: z.number().min(0, 'Cost must be positive'),
  costBreakdown: z.object({
    labor: z.number().min(0).default(0),
    equipment: z.number().min(0).default(0),
    materials: z.number().min(0).default(0),
    other: z.number().min(0).default(0)
  }).default({
    labor: 0,
    equipment: 0,
    materials: 0,
    other: 0
  }),

  // Documentation
  photos: z.array(photoSchema).default([]),
  notes: z.string().optional(),
  supervisorNotes: z.string().optional(),

  // Status
  status: z.enum(['not-started', 'in-progress', 'completed', 'on-hold', 'cancelled']).default('not-started')
}).refine((data) => {
  // End time must be after start time
  if (data.startTime && data.endTime) {
    return data.endTime > data.startTime
  }
  return true
}, {
  message: "End time must be after start time",
  path: ["endTime"]
})

type WorkPackageFormData = z.infer<typeof workPackageSchema>

export function WorkPackageForm() {
  const { bloc, setCurrentScreen, currentOperationId, currentWorkPackageId, fieldOperations } = useBlocContext()
  const { isMobile, isTablet } = useResponsive()

  // Form state
  const [activeTab, setActiveTab] = useState('basic')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [photos, setPhotos] = useState<any[]>([])
  const [weatherData, setWeatherData] = useState<any>(null)

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  const form = useForm({
    resolver: zodResolver(workPackageSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      startTime: '08:00',
      endTime: '17:00',
      actualArea: 0,
      fieldConditions: '',
      resourceUsage: {
        crewMembers: [],
        equipmentUsed: [],
        materialsUsed: []
      },
      products: [],
      equipment: [],
      completionPercentage: 0,
      qualityRating: 3,
      workStandard: 'meets-standard' as const,
      weatherConditions: undefined,
      soilConditions: undefined,
      issuesEncountered: [],
      actualCost: 0,
      costBreakdown: {
        labor: 0,
        equipment: 0,
        materials: 0,
        other: 0
      },
      photos: [],
      notes: '',
      supervisorNotes: '',
      status: 'not-started' as const
    }
  })

  // Fetch configuration data for error handling
  const { isLoading: productsLoading, error: productsError } = useProducts()
  const { isLoading: resourcesLoading, error: resourcesError } = useResources()

  // Demo mutation hook for creating work packages
  const createWorkPackageMutation = useDemoCreateWorkPackage()

  // Predefined options
  const crewOptions = [
    { id: 'team-a', name: 'Team A', members: 4 },
    { id: 'team-b', name: 'Team B', members: 3 },
    { id: 'team-c', name: 'Team C', members: 5 },
    { id: 'contractor', name: 'External Contractor', members: 2 }
  ]

  const equipmentOptions = [
    { id: 'tractor-t1', name: 'Tractor T1', type: 'tractor', costPerHour: 45 },
    { id: 'tractor-t2', name: 'Tractor T2', type: 'tractor', costPerHour: 50 },
    { id: 'sprayer-s1', name: 'Sprayer S1', type: 'sprayer', costPerHour: 35 },
    { id: 'irrigation', name: 'Irrigation System', type: 'irrigation', costPerHour: 25 },
    { id: 'harvester-h1', name: 'Harvester H1', type: 'harvester', costPerHour: 80 }
  ]

  const weatherConditions = [
    { value: 'sunny', label: 'Sunny', icon: Sun },
    { value: 'cloudy', label: 'Cloudy', icon: Cloud },
    { value: 'overcast', label: 'Overcast', icon: Cloud },
    { value: 'light-rain', label: 'Light Rain', icon: CloudRain },
    { value: 'heavy-rain', label: 'Heavy Rain', icon: CloudRain },
    { value: 'windy', label: 'Windy', icon: Wind }
  ]



  // Photo functionality
  const handlePhotoCapture = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    Array.from(files).forEach((file) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const newPhoto = {
          id: `photo-${Date.now()}-${Math.random()}`,
          file,
          url: e.target?.result as string,
          caption: '',
          timestamp: new Date()
        }

        setPhotos(prev => [...prev, newPhoto])
        const currentPhotos = form.getValues('photos') || []
        form.setValue('photos', [...currentPhotos, newPhoto])
      }
      reader.readAsDataURL(file)
    })
  }

  const removePhoto = (photoId: string) => {
    setPhotos(prev => prev.filter(p => p.id !== photoId))
    const currentPhotos = form.getValues('photos') || []
    form.setValue('photos', currentPhotos.filter(p => p.id !== photoId))
  }

  const updatePhotoCaption = (photoId: string, caption: string) => {
    setPhotos(prev => prev.map(p => p.id === photoId ? { ...p, caption } : p))
    const currentPhotos = form.getValues('photos') || []
    form.setValue('photos', currentPhotos.map(p => p.id === photoId ? { ...p, caption } : p))
  }

  // Auto-calculate costs based on resource usage - removed to prevent infinite loops
  // This will be handled manually when users update resource fields

  // Initialize form with loading simulation
  useEffect(() => {
    const initializeForm = async () => {
      setIsLoading(true)

      // Simulate form initialization
      await new Promise(resolve => setTimeout(resolve, 800))

      setIsLoading(false)
    }

    initializeForm()
  }, [])

  const onSubmit = async (data: WorkPackageFormData) => {
    setIsSubmitting(true)
    try {
      console.log('💾 Saving work package to demo data:', data)

      // Get the current field operation from context - simplified for demo
      let targetFieldOperation = null

      if (currentOperationId) {
        targetFieldOperation = fieldOperations.data.find((op: any) => op.uuid === currentOperationId)
      } else {
        // Get the most recent operation for demo
        targetFieldOperation = fieldOperations.data[fieldOperations.data.length - 1]
      }

      if (!targetFieldOperation) {
        console.log('No field operation found - creating demo work package anyway')
        // For demo, just continue with a placeholder
        targetFieldOperation = { uuid: 'demo-operation-' + Date.now() }
      }

      // Create work package request - simplified for demo
      const workPackageRequest: CreateWorkPackageRequest = {
        fieldOperationUuid: targetFieldOperation.uuid,
        workDate: data.date,
        shift: 'day',
        plannedAreaHectares: data.actualArea || null,
        plannedQuantity: null
      }

      // Save directly to demo data - no validation, no error handling
      await createWorkPackageMutation.mutateAsync(workPackageRequest)

      console.log('✅ Work package saved successfully for demo')
      setCurrentScreen('operations')
    } catch (error) {
      // For demo - just log and continue
      console.log('Demo save completed (ignoring any errors):', error)
      setCurrentScreen('operations')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    if (currentOperationId) {
      setCurrentScreen('operation-form')
    } else {
      setCurrentScreen('operations')
    }
  }

  // Handlers for products and equipment
  const handleProductsChange = (products: SelectedProduct[]) => {
    form.setValue('products', products as any)
    // Update estimated total cost
    const totalProductCost = products.reduce((sum, p) => sum + ((p as any).actualCost || p.estimatedCost), 0)
    const equipmentData = form.getValues('equipment') as SelectedEquipment[] || []
    const equipmentCost = equipmentData.reduce((sum, e) => sum + ((e as any).totalActualCost || e.totalEstimatedCost || 0), 0)
    form.setValue('actualCost', totalProductCost + equipmentCost)
  }

  const handleEquipmentChange = (equipment: SelectedEquipment[]) => {
    form.setValue('equipment', equipment as any)
    // Update estimated total cost
    const equipmentCost = equipment.reduce((sum, e) => sum + ((e as any).totalActualCost || e.totalEstimatedCost || 0), 0)
    const productsData = form.getValues('products') as SelectedProduct[] || []
    const productCost = productsData.reduce((sum, p) => sum + ((p as any).actualCost || p.estimatedCost), 0)
    form.setValue('actualCost', equipmentCost + productCost)
  }

  if (isLoading) {
    return (
      <ResponsiveContainer className="h-full overflow-auto bg-background">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="max-w-4xl mx-auto flex items-center justify-center min-h-96"
        >
          <div className="text-center">
            <motion.div
              animate={{
                rotate: 360,
                scale: [1, 1.2, 1]
              }}
              transition={{
                rotate: { duration: 2, repeat: Infinity, ease: "linear" },
                scale: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
              }}
              className="mb-4"
            >
              <Activity className="h-12 w-12 text-primary mx-auto" />
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl font-semibold mb-2"
            >
              Preparing Work Package Form
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-muted-foreground"
            >
              Setting up camera access and field data...
            </motion.p>
          </div>
        </motion.div>
      </ResponsiveContainer>
    )
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
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                  <Activity className="h-6 w-6 text-primary" />
                  {currentWorkPackageId ? 'Edit Work Package' : 'New Work Package'}
                </h1>
                <p className="text-muted-foreground mt-1">
                  Record daily field work progress for {bloc.name || `Bloc ${bloc.localId}`}
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                className="bg-white/80 backdrop-blur-sm border-border/50 hover:bg-white/90"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
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
                <TabsList className={`grid w-full ${isMobile ? 'grid-cols-2' : 'grid-cols-3'} bg-muted/80 bg-white/95`}>
                  {[
                    { value: 'basic', icon: Clock, label: 'Basic', fullLabel: 'Basic Info' },
                    { value: 'resources', icon: Users, label: 'Resources', fullLabel: 'Products & Resources' },
                    { value: 'attachments', icon: Camera, label: 'Attachments', fullLabel: 'Attachments' }
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
                          <span className={isMobile ? 'text-xs' : 'text-sm'}>
                            {isMobile ? tab.label : tab.fullLabel}
                          </span>

                          {/* Active tab indicator */}
                          {activeTab === tab.value && (
                            <motion.div
                              layoutId="activeWorkPackageTab"
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
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-primary" />
                        Work Session Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Work Date */}
                      <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-1'}`}>
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <FormField
                            control={form.control}
                            name="date"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="flex items-center gap-2">
                                  <motion.div
                                    whileHover={{ scale: 1.1, rotate: 5 }}
                                    transition={{ duration: 0.2 }}
                                  >
                                    <Calendar className="h-4 w-4" />
                                  </motion.div>
                                  Work Date
                                </FormLabel>
                                <FormControl>
                                  <motion.div
                                    whileFocus={{ scale: 1.02 }}
                                    transition={{ duration: 0.2 }}
                                  >
                                    <Input
                                      type="date"
                                      {...field}
                                      className={`${isMobile ? 'h-12 text-lg' : ''} transition-all duration-200 focus:ring-2 focus:ring-primary/20`}
                                    />
                                  </motion.div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </motion.div>
                      </div>

                      {/* Area */}
                      <motion.div
                        className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-1'}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.3 }}
                      >
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          transition={{ duration: 0.2 }}
                        >
                          <FormField
                            control={form.control}
                            name="actualArea"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="flex items-center gap-2">
                                  <motion.div
                                    whileHover={{ scale: 1.2, rotate: 10 }}
                                    transition={{ duration: 0.2 }}
                                  >
                                    <Target className="h-4 w-4" />
                                  </motion.div>
                                  Area Covered (hectares)
                                </FormLabel>
                                <FormControl>
                                  <motion.div
                                    whileFocus={{ scale: 1.02 }}
                                    transition={{ duration: 0.2 }}
                                  >
                                    <Input
                                      type="number"
                                      step="0.01"
                                      min="0.01"
                                      max={bloc.area}
                                      placeholder="0.00"
                                      {...field}
                                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                      className={`${isMobile ? 'h-12 text-lg' : ''} transition-all duration-200 focus:ring-2 focus:ring-primary/20`}
                                    />
                                  </motion.div>
                                </FormControl>
                                <FormDescription>
                                  Maximum: {bloc.area.toFixed(2)} ha (total bloc area)
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </motion.div>
                      </motion.div>

                      {/* Status */}
                      <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-1'}`}>
                        <FormField
                          control={form.control}
                          name="status"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Work Status</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger className={isMobile ? 'h-12 text-lg' : ''}>
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="not-started">
                                    <div className="flex items-center gap-2">
                                      <div className="w-2 h-2 rounded-full bg-gray-500" />
                                      Not Started
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="in-progress">
                                    <div className="flex items-center gap-2">
                                      <div className="w-2 h-2 rounded-full bg-yellow-500" />
                                      In Progress
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="completed">
                                    <div className="flex items-center gap-2">
                                      <div className="w-2 h-2 rounded-full bg-green-500" />
                                      Completed
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="on-hold">
                                    <div className="flex items-center gap-2">
                                      <div className="w-2 h-2 rounded-full bg-orange-500" />
                                      On Hold
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="cancelled">
                                    <div className="flex items-center gap-2">
                                      <div className="w-2 h-2 rounded-full bg-red-500" />
                                      Cancelled
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
                        name="fieldConditions"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Field Conditions & Notes</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Describe field conditions, accessibility, any observations..."
                                className={`min-h-20 ${isMobile ? 'text-lg' : ''}`}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>
                </motion.div>
              </TabsContent>



              {/* Products & Resources Tab */}
              <TabsContent value="resources" className="space-y-6 mt-6">
                {/* Products Table */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <div className="h-4 w-4 rounded bg-primary/20" />
                      </div>
                      Products & Materials
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="border rounded-lg overflow-hidden">
                      <div className="bg-muted/50 px-4 py-3 border-b">
                        <div className="grid grid-cols-6 gap-4 text-sm font-semibold">
                          <div>Product</div>
                          <div className="text-center">Area (ha)</div>
                          <div className="text-center">Rate</div>
                          <div className="text-center">Quantity</div>
                          <div className="text-center">Unit Cost</div>
                          <div className="text-right">Actual Cost</div>
                        </div>
                      </div>
                      <div className="p-4 text-center text-muted-foreground">
                        Products table will be implemented here
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Equipment Table */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Truck className="h-4 w-4" />
                      </div>
                      Equipment & Machinery
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="border rounded-lg overflow-hidden">
                      <div className="bg-muted/50 px-4 py-3 border-b">
                        <div className="grid grid-cols-4 gap-4 text-sm font-semibold">
                          <div>Equipment</div>
                          <div className="text-center">Actual Duration (hrs)</div>
                          <div className="text-center">Rate (Rs/hr)</div>
                          <div className="text-right">Actual Total (Rs)</div>
                        </div>
                      </div>
                      <div className="p-4 text-center text-muted-foreground">
                        Equipment table will be implemented here
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Labour Table */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Users className="h-4 w-4" />
                      </div>
                      Labour & Human Resources
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="border rounded-lg overflow-hidden">
                      <div className="bg-muted/50 px-4 py-3 border-b">
                        <div className="grid grid-cols-4 gap-4 text-sm font-semibold">
                          <div>Labour</div>
                          <div className="text-center">Actual Effort (hrs)</div>
                          <div className="text-center">Rate (Rs/hr)</div>
                          <div className="text-right">Actual Total (Rs)</div>
                        </div>
                      </div>
                      <div className="p-4 text-center text-muted-foreground">
                        Labour table will be implemented here
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Total Actual Cost Display */}
                <Card>
                  <CardContent className="p-6">
                    <div className="p-4 bg-muted/30 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Total Actual Cost:</span>
                        <span className="text-xl font-bold text-primary">
                          Rs {(form.getValues('actualCost') || 0).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Attachments Tab */}
              <TabsContent value="attachments" className="space-y-6 mt-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Camera className="h-5 w-5 text-primary" />
                        Photos & Documentation
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Photo Upload Section */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Label className="text-base font-medium">Field Photos</Label>
                          <div className="flex gap-2">
                            <TouchFriendly>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  cameraInputRef.current?.click()
                                }}
                                className={isMobile ? 'h-10 px-4' : ''}
                              >
                                <Camera className="h-4 w-4 mr-2" />
                                Camera
                              </Button>
                            </TouchFriendly>
                            <TouchFriendly>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  fileInputRef.current?.click()
                                }}
                                className={isMobile ? 'h-10 px-4' : ''}
                              >
                                <Upload className="h-4 w-4 mr-2" />
                                Upload
                              </Button>
                            </TouchFriendly>
                          </div>
                        </div>

                        {/* Hidden file inputs */}
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handlePhotoCapture}
                          className="hidden"
                        />
                        <input
                          ref={cameraInputRef}
                          type="file"
                          accept="image/*"
                          capture="environment"
                          multiple
                          onChange={handlePhotoCapture}
                          className="hidden"
                        />

                        {/* Photo Upload Drop Zone */}
                        {photos.length === 0 ? (
                          <motion.div
                            className="border-2 border-dashed border-border rounded-lg p-8 text-center bg-muted/20"
                            whileHover={{ borderColor: 'hsl(var(--primary))' }}
                            transition={{ duration: 0.2 }}
                          >
                            <Camera className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-lg font-medium mb-2">Add Field Photos</p>
                            <p className="text-sm text-muted-foreground mb-4">
                              Document work progress, field conditions, and results
                            </p>
                            <div className="flex gap-2 justify-center">
                              <Button
                                type="button"
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  cameraInputRef.current?.click()
                                }}
                                className={isMobile ? 'h-12 px-6' : ''}
                              >
                                <Camera className="h-4 w-4 mr-2" />
                                Take Photo
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  fileInputRef.current?.click()
                                }}
                                className={isMobile ? 'h-12 px-6' : ''}
                              >
                                <Upload className="h-4 w-4 mr-2" />
                                Choose Files
                              </Button>
                            </div>
                          </motion.div>
                        ) : (
                          /* Photo Gallery */
                          <motion.div
                            className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-2 lg:grid-cols-3'}`}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3 }}
                          >
                            <AnimatePresence>
                              {photos.map((photo, index) => (
                                <motion.div
                                  key={photo.id}
                                  layout
                                  initial={{ opacity: 0, scale: 0.8, rotateY: -90 }}
                                  animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                                  exit={{ opacity: 0, scale: 0.8, rotateY: 90 }}
                                  transition={{
                                    duration: 0.5,
                                    delay: index * 0.1,
                                    type: "spring",
                                    bounce: 0.4
                                  }}
                                  className="relative group"
                                  whileHover={{
                                    scale: 1.05,
                                    rotateY: 5,
                                    transition: { duration: 0.2 }
                                  }}
                                >
                                  <motion.div
                                    className="aspect-square rounded-lg overflow-hidden bg-muted shadow-lg"
                                    whileHover={{
                                      boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
                                    }}
                                    transition={{ duration: 0.2 }}
                                  >
                                    <motion.img
                                      src={photo.url}
                                      alt={`Field photo ${index + 1}`}
                                      className="w-full h-full object-cover"
                                      initial={{ scale: 1.2 }}
                                      animate={{ scale: 1 }}
                                      transition={{ duration: 0.5 }}
                                      whileHover={{ scale: 1.1 }}
                                    />

                                    {/* Photo overlay */}
                                    <motion.div
                                      className="absolute inset-0 bg-black/50 flex items-center justify-center"
                                      initial={{ opacity: 0 }}
                                      whileHover={{ opacity: 1 }}
                                      transition={{ duration: 0.2 }}
                                    >
                                      <motion.div
                                        initial={{ scale: 0 }}
                                        whileHover={{ scale: 1 }}
                                        transition={{ delay: 0.1, type: "spring", bounce: 0.5 }}
                                      >
                                        <Button
                                          type="button"
                                          variant="destructive"
                                          size="sm"
                                          onClick={() => removePhoto(photo.id)}
                                          className="shadow-lg"
                                        >
                                          <motion.div
                                            whileHover={{ rotate: 90 }}
                                            transition={{ duration: 0.2 }}
                                          >
                                            <Trash2 className="h-4 w-4" />
                                          </motion.div>
                                        </Button>
                                      </motion.div>
                                    </motion.div>



                                    {/* Photo timestamp */}
                                    <motion.div
                                      className="absolute bottom-2 left-2"
                                      initial={{ opacity: 0, y: 10 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      transition={{ delay: 0.4 }}
                                    >
                                      <Badge variant="outline" className="text-xs bg-background/80 backdrop-blur-sm">
                                        {new Date(photo.timestamp).toLocaleTimeString()}
                                      </Badge>
                                    </motion.div>
                                  </motion.div>

                                  {/* Photo caption */}
                                  <motion.div
                                    className="mt-2"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                  >
                                    <motion.div
                                      whileFocus={{ scale: 1.02 }}
                                      transition={{ duration: 0.2 }}
                                    >
                                      <Input
                                        placeholder="Add caption..."
                                        value={photo.caption || ''}
                                        onChange={(e) => updatePhotoCaption(photo.id, e.target.value)}
                                        className="text-sm transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                                      />
                                    </motion.div>
                                  </motion.div>
                                </motion.div>
                              ))}
                            </AnimatePresence>

                            {/* Add more photos button */}
                            <motion.div
                              layout
                              className="aspect-square rounded-lg border-2 border-dashed border-border flex items-center justify-center relative overflow-hidden group"
                              whileHover={{
                                scale: 1.05,
                                borderColor: 'hsl(var(--primary))',
                                backgroundColor: 'hsl(var(--primary) / 0.05)'
                              }}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: photos.length * 0.1 + 0.2 }}
                            >
                              <Button
                                type="button"
                                variant="outline"
                                className="w-full h-full border-dashed"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  fileInputRef.current?.click()
                                }}
                              >
                                <div className="text-center">
                                  <Camera className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                                  <p className="text-sm text-muted-foreground">Add More</p>
                                </div>
                              </Button>
                            </motion.div>
                          </motion.div>
                        )}
                      </div>

                      <Separator />

                      {/* Notes Section */}
                      <div className="space-y-4">
                        <FormField
                          control={form.control}
                          name="notes"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-base font-medium">Work Notes</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Record observations, progress notes, challenges, and any important details about the work performed..."
                                  className={`min-h-32 ${isMobile ? 'text-lg' : ''}`}
                                  {...field}
                                />
                              </FormControl>
                              <FormDescription>
                                Document important observations and details about the work
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="supervisorNotes"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-base font-medium">Supervisor Notes</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Supervisor feedback, quality assessment, recommendations..."
                                  className={`min-h-24 ${isMobile ? 'text-lg' : ''}`}
                                  {...field}
                                />
                              </FormControl>
                              <FormDescription>
                                Supervisor feedback and quality assessment
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </TabsContent>
            </Tabs>

            {/* Form Actions - Sticky Bottom */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.4 }}
              className={`sticky bottom-0 bg-background/95 backdrop-blur-sm border-t border-border p-4 -mx-4 ${isMobile ? '-mb-4' : ''}`}
            >
              {/* Progress Indicator */}
              <motion.div
                className="mb-4 flex items-center justify-center gap-2 text-sm text-muted-foreground"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <div className="flex items-center gap-1">
                  {photos.length > 0 && (
                    <motion.div
                      className="flex items-center gap-1"
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ type: "spring", bounce: 0.5 }}
                    >
                      <motion.div
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <Camera className="h-4 w-4" />
                      </motion.div>
                      <span>{photos.length} photo{photos.length !== 1 ? 's' : ''}</span>
                    </motion.div>
                  )}

                  {(form.getValues('completionPercentage') || 0) > 0 && (
                    <>
                      {photos.length > 0 && <span>•</span>}
                      <motion.div
                        className="flex items-center gap-1"
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ type: "spring", bounce: 0.5, delay: 0.2 }}
                      >
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                        >
                          <Activity className="h-4 w-4" />
                        </motion.div>
                        <span>{form.getValues('completionPercentage') || 0}% complete</span>
                      </motion.div>
                    </>
                  )}
                </div>
              </motion.div>

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
                  <Button type="submit" className="bg-primary hover:bg-primary/90" disabled={isSubmitting}>
                    <Save className="h-4 w-4 mr-2" />
                    {isSubmitting ? 'Saving...' : (currentWorkPackageId ? 'Update Work Package' : 'Save Work Package')}
                  </Button>
                </div>
              </motion.div>
            </motion.div>
            </form>
          </Form>
        </motion.div>
      </div>
    </div>
  )
}
