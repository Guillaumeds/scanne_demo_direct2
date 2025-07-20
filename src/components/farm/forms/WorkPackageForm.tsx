'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Save, X, Calendar, Clock, Users, Truck, Camera, MapPin,
  Thermometer, Wind, Droplets, Sun, Cloud, CloudRain,
  Star, AlertTriangle, CheckCircle, Upload, Trash2,
  Navigation, Smartphone, Timer, Target, Activity
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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

// GPS coordinates schema
const gpsSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  accuracy: z.number().min(0).optional(),
  timestamp: z.date().optional()
})

// Photo attachment schema
const photoSchema = z.object({
  id: z.string(),
  file: z.any(), // File object
  url: z.string().optional(),
  caption: z.string().optional(),
  gpsLocation: gpsSchema.optional(),
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

  // Location & Area
  actualArea: z.number().min(0.01, 'Area must be at least 0.01 hectares'),
  gpsCoordinates: z.array(gpsSchema).default([]),
  fieldConditions: z.string().optional(),

  // Resources
  resourceUsage: resourceUsageSchema.default({
    crewMembers: [],
    equipmentUsed: [],
    materialsUsed: []
  }),

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

interface GPSLocation {
  latitude: number
  longitude: number
  accuracy?: number
}

export function WorkPackageForm() {
  const { bloc, setCurrentScreen, currentOperationId, currentWorkPackageId } = useBlocContext()
  const { isMobile, isTablet } = useResponsive()

  // Form state
  const [activeTab, setActiveTab] = useState('basic')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [photos, setPhotos] = useState<any[]>([])
  const [currentLocation, setCurrentLocation] = useState<GPSLocation | null>(null)
  const [isGettingLocation, setIsGettingLocation] = useState(false)
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
      gpsCoordinates: [],
      fieldConditions: '',
      resourceUsage: {
        crewMembers: [],
        equipmentUsed: [],
        materialsUsed: []
      },
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

  // GPS functionality
  const getCurrentLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by this browser.')
      return
    }

    setIsGettingLocation(true)

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        }
        setCurrentLocation(location)

        // Add to GPS coordinates array
        const currentCoords = form.getValues('gpsCoordinates') || []
        form.setValue('gpsCoordinates', [...currentCoords, {
          ...location,
          timestamp: new Date()
        }])

        setIsGettingLocation(false)
      },
      (error) => {
        console.error('Error getting location:', error)
        setIsGettingLocation(false)
        alert('Unable to get your location. Please check your GPS settings.')
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    )
  }, [form])

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
          gpsLocation: currentLocation || undefined,
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

  // Get current location on component mount and simulate loading
  useEffect(() => {
    const initializeForm = async () => {
      setIsLoading(true)

      // Simulate form initialization
      await new Promise(resolve => setTimeout(resolve, 800))

      if (navigator.geolocation) {
        getCurrentLocation()
      }

      setIsLoading(false)
    }

    initializeForm()
  }, []) // Remove getCurrentLocation from dependencies to prevent infinite loop

  const onSubmit = async (data: WorkPackageFormData) => {
    setIsSubmitting(true)
    try {
      console.log('Saving work package:', data)
      // TODO: Implement save logic with TanStack Query mutation
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
      setCurrentScreen('operations')
    } catch (error) {
      console.error('Error saving work package:', error)
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
              Setting up GPS, camera access, and field data...
            </motion.p>
          </div>
        </motion.div>
      </ResponsiveContainer>
    )
  }

  return (
    <ResponsiveContainer className="h-full overflow-auto bg-background">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
        className="max-w-4xl mx-auto"
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="mb-6 bg-white/95 backdrop-blur-sm rounded-lg p-4 border border-border/50"
        >
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

            {/* Quick Status Indicators */}
            <div className="flex items-center gap-2">
              {currentLocation && (
                <Badge variant="outline" className="text-green-600 border-green-200">
                  <MapPin className="h-3 w-3 mr-1" />
                  GPS
                </Badge>
              )}
              <Badge variant="outline" className="text-sm">
                {bloc.area.toFixed(1)} ha
              </Badge>
            </div>
          </div>
        </motion.div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                <TabsList className={`grid w-full ${isMobile ? 'grid-cols-2' : 'grid-cols-5'} bg-muted/80 bg-white/95`}>
                  {[
                    { value: 'basic', icon: Clock, label: 'Basic', fullLabel: 'Basic Info' },
                    { value: 'location', icon: MapPin, label: 'Location', fullLabel: 'Location & GPS' },
                    { value: 'resources', icon: Users, label: 'Resources', fullLabel: 'Products & Resources' },
                    { value: 'quality', icon: Star, label: 'Quality', fullLabel: 'Quality & Issues' },
                    { value: 'documentation', icon: Camera, label: 'Docs', fullLabel: 'Documentation' }
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
                      {/* Date and Time */}
                      <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-3'}`}>
                        {[
                          { name: 'date', icon: Calendar, label: 'Work Date', type: 'date' },
                          { name: 'startTime', icon: Timer, label: 'Start Time', type: 'time' },
                          { name: 'endTime', icon: Timer, label: 'End Time', type: 'time' }
                        ].map((fieldConfig, index) => {
                          const Icon = fieldConfig.icon
                          return (
                            <motion.div
                              key={fieldConfig.name}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.3, delay: index * 0.1 }}
                            >
                              <FormField
                                control={form.control}
                                name={fieldConfig.name as any}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="flex items-center gap-2">
                                      <motion.div
                                        whileHover={{ scale: 1.1, rotate: 5 }}
                                        transition={{ duration: 0.2 }}
                                      >
                                        <Icon className="h-4 w-4" />
                                      </motion.div>
                                      {fieldConfig.label}
                                    </FormLabel>
                                    <FormControl>
                                      <motion.div
                                        whileFocus={{ scale: 1.02 }}
                                        transition={{ duration: 0.2 }}
                                      >
                                        <Input
                                          type={fieldConfig.type}
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
                          )
                        })}
                      </div>

                      {/* Area and Progress */}
                      <motion.div
                        className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-2'}`}
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

                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          transition={{ duration: 0.2 }}
                        >
                          <FormField
                            control={form.control}
                            name="completionPercentage"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="flex items-center gap-2">
                                  <motion.div
                                    animate={{
                                      rotate: (field.value ?? 0) > 0 ? [0, 360] : 0,
                                      scale: (field.value ?? 0) > 0 ? [1, 1.2, 1] : 1
                                    }}
                                    transition={{ duration: 0.5 }}
                                  >
                                    <Activity className="h-4 w-4" />
                                  </motion.div>
                                  Completion Percentage
                                </FormLabel>
                                <FormControl>
                                  <div className="space-y-3">
                                    <motion.div
                                      whileFocus={{ scale: 1.02 }}
                                      transition={{ duration: 0.2 }}
                                    >
                                      <Input
                                        type="number"
                                        min="0"
                                        max="100"
                                        placeholder="0"
                                        {...field}
                                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                        className={`${isMobile ? 'h-12 text-lg' : ''} transition-all duration-200 focus:ring-2 focus:ring-primary/20`}
                                      />
                                    </motion.div>
                                    <motion.div
                                      initial={{ width: 0 }}
                                      animate={{ width: "100%" }}
                                      transition={{ duration: 0.5, delay: 0.2 }}
                                    >
                                      <Progress
                                        value={field.value}
                                        className={`h-3 ${
                                          (field.value ?? 0) >= 100 ? '[&>div]:bg-green-500' :
                                          (field.value ?? 0) >= 75 ? '[&>div]:bg-blue-500' :
                                          (field.value ?? 0) >= 50 ? '[&>div]:bg-yellow-500' : '[&>div]:bg-blue-500'
                                        }`}
                                      />
                                    </motion.div>
                                    <motion.p
                                      className="text-sm text-muted-foreground text-center"
                                      animate={{
                                        color: (field.value ?? 0) >= 100 ? '#22c55e' : 'hsl(var(--muted-foreground))'
                                      }}
                                      transition={{ duration: 0.3 }}
                                    >
                                      {(field.value ?? 0) >= 100 ? '🎉 Work Complete!' :
                                       (field.value ?? 0) >= 75 ? '🚀 Almost Done!' :
                                       (field.value ?? 0) >= 50 ? '⚡ Good Progress!' :
                                       (field.value ?? 0) > 0 ? '📈 Getting Started!' : 'Ready to Begin'}
                                    </motion.p>
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </motion.div>
                      </motion.div>

                      {/* Status and Field Conditions */}
                      <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-2'}`}>
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

                        <FormField
                          control={form.control}
                          name="soilConditions"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Soil Conditions</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger className={isMobile ? 'h-12 text-lg' : ''}>
                                    <SelectValue placeholder="Select soil condition" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="dry">Dry</SelectItem>
                                  <SelectItem value="moist">Moist</SelectItem>
                                  <SelectItem value="wet">Wet</SelectItem>
                                  <SelectItem value="waterlogged">Waterlogged</SelectItem>
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

              {/* Location & GPS Tab */}
              <TabsContent value="location" className="space-y-6 mt-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-primary" />
                        Location & GPS Tracking
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* GPS Controls */}
                      <motion.div
                        className="relative overflow-hidden p-4 bg-gradient-to-r from-muted/30 to-muted/50 rounded-lg border border-border/50"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.4 }}
                        whileHover={{ scale: 1.02 }}
                      >
                        {/* Background pulse effect when getting location */}
                        <AnimatePresence>
                          {isGettingLocation && (
                            <motion.div
                              className="absolute inset-0 bg-primary/10 rounded-lg"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: [0, 1, 0] }}
                              exit={{ opacity: 0 }}
                              transition={{ duration: 1.5, repeat: Infinity }}
                            />
                          )}
                        </AnimatePresence>

                        <div className="flex items-center justify-between relative z-10">
                          <div className="flex items-center gap-3">
                            <motion.div
                              animate={{
                                rotate: isGettingLocation ? 360 : 0,
                                scale: currentLocation ? [1, 1.2, 1] : 1
                              }}
                              transition={{
                                rotate: { duration: 2, repeat: isGettingLocation ? Infinity : 0, ease: "linear" },
                                scale: { duration: 0.5 }
                              }}
                            >
                              <Navigation className={`h-5 w-5 ${currentLocation ? 'text-green-500' : 'text-primary'}`} />
                            </motion.div>
                            <div>
                              <motion.p
                                className="font-medium"
                                animate={{
                                  color: currentLocation ? '#22c55e' : 'hsl(var(--foreground))'
                                }}
                                transition={{ duration: 0.3 }}
                              >
                                GPS Location
                              </motion.p>
                              <motion.p
                                className="text-sm text-muted-foreground"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.2 }}
                              >
                                {isGettingLocation ? (
                                  <motion.span
                                    animate={{ opacity: [0.5, 1, 0.5] }}
                                    transition={{ duration: 1, repeat: Infinity }}
                                  >
                                    Getting location...
                                  </motion.span>
                                ) : currentLocation ? (
                                  <motion.span
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3 }}
                                  >
                                    {currentLocation.latitude.toFixed(6)}, {currentLocation.longitude.toFixed(6)}
                                    {currentLocation.accuracy && (
                                      <span className="text-xs ml-2 text-green-600">
                                        ±{currentLocation.accuracy.toFixed(0)}m
                                      </span>
                                    )}
                                  </motion.span>
                                ) : (
                                  'Location not available'
                                )}
                              </motion.p>
                            </div>
                          </div>
                          <TouchFriendly>
                            <motion.div
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <Button
                                type="button"
                                variant={currentLocation ? "default" : "outline"}
                                onClick={getCurrentLocation}
                                disabled={isGettingLocation}
                                className={`${isMobile ? 'h-12 px-6' : ''} transition-all duration-200`}
                              >
                                {isGettingLocation ? (
                                  <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                  >
                                    <LoadingSpinner size="sm" />
                                  </motion.div>
                                ) : (
                                  <>
                                    <motion.div
                                      whileHover={{ scale: 1.1 }}
                                      transition={{ duration: 0.2 }}
                                    >
                                      <MapPin className="h-4 w-4 mr-2" />
                                    </motion.div>
                                    {currentLocation ? 'Update' : 'Get'} Location
                                  </>
                                )}
                              </Button>
                            </motion.div>
                          </TouchFriendly>
                        </div>
                      </motion.div>

                      {/* GPS Coordinates List */}
                      {(form.getValues('gpsCoordinates') || []).length > 0 && (
                        <div className="space-y-3">
                          <Label>Recorded GPS Points</Label>
                          <div className="space-y-2 max-h-40 overflow-y-auto">
                            {(form.getValues('gpsCoordinates') || []).map((coord, index) => (
                              <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="flex items-center justify-between p-3 bg-background border border-border rounded-md"
                              >
                                <div className="flex items-center gap-3">
                                  <MapPin className="h-4 w-4 text-primary" />
                                  <div>
                                    <p className="text-sm font-medium">
                                      Point {index + 1}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      {coord.latitude.toFixed(6)}, {coord.longitude.toFixed(6)}
                                    </p>
                                    {coord.accuracy && (
                                      <p className="text-xs text-muted-foreground">
                                        Accuracy: ±{coord.accuracy.toFixed(0)}m
                                      </p>
                                    )}
                                  </div>
                                </div>
                                <Badge variant="outline" className="text-xs">
                                  {coord.timestamp ? new Date(coord.timestamp).toLocaleTimeString() : 'Now'}
                                </Badge>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Weather Conditions */}
                      <div className="space-y-4">
                        <Label className="text-base font-medium">Weather Conditions</Label>

                        <div className={`grid gap-4 ${isMobile ? 'grid-cols-2' : 'grid-cols-3'}`}>
                          <FormField
                            control={form.control}
                            name="weatherConditions.temperature"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="flex items-center gap-2">
                                  <Thermometer className="h-4 w-4" />
                                  Temperature (°C)
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    step="0.1"
                                    placeholder="25.0"
                                    {...field}
                                    onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                                    className={isMobile ? 'h-12 text-lg' : ''}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="weatherConditions.humidity"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="flex items-center gap-2">
                                  <Droplets className="h-4 w-4" />
                                  Humidity (%)
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    min="0"
                                    max="100"
                                    placeholder="65"
                                    {...field}
                                    onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                                    className={isMobile ? 'h-12 text-lg' : ''}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="weatherConditions.windSpeed"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="flex items-center gap-2">
                                  <Wind className="h-4 w-4" />
                                  Wind Speed (km/h)
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    min="0"
                                    step="0.1"
                                    placeholder="10.5"
                                    {...field}
                                    onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                                    className={isMobile ? 'h-12 text-lg' : ''}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-2'}`}>
                          <FormField
                            control={form.control}
                            name="weatherConditions.conditions"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Weather Conditions</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger className={isMobile ? 'h-12 text-lg' : ''}>
                                      <SelectValue placeholder="Select weather" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {weatherConditions.map((condition) => {
                                      const Icon = condition.icon
                                      return (
                                        <SelectItem key={condition.value} value={condition.value}>
                                          <div className="flex items-center gap-2">
                                            <Icon className="h-4 w-4" />
                                            {condition.label}
                                          </div>
                                        </SelectItem>
                                      )
                                    })}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="weatherConditions.visibility"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Visibility</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger className={isMobile ? 'h-12 text-lg' : ''}>
                                      <SelectValue placeholder="Select visibility" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="excellent">Excellent</SelectItem>
                                    <SelectItem value="good">Good</SelectItem>
                                    <SelectItem value="fair">Fair</SelectItem>
                                    <SelectItem value="poor">Poor</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </TabsContent>

              {/* Resources Tab */}
              <TabsContent value="resources" className="space-y-6 mt-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-primary" />
                        Resources & Equipment
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Cost Breakdown */}
                      <div className="space-y-4">
                        <Label className="text-base font-medium">Cost Breakdown</Label>
                        <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-2'}`}>
                          <FormField
                            control={form.control}
                            name="costBreakdown.labor"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Labor Cost (Rs)</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    {...field}
                                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                    className={isMobile ? 'h-12 text-lg' : ''}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="costBreakdown.equipment"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Equipment Cost ($)</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    {...field}
                                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                    className={isMobile ? 'h-12 text-lg' : ''}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="costBreakdown.materials"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Materials Cost (Rs)</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    {...field}
                                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                    className={isMobile ? 'h-12 text-lg' : ''}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="costBreakdown.other"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Other Costs (Rs)</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    {...field}
                                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                    className={isMobile ? 'h-12 text-lg' : ''}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        {/* Total Cost Display */}
                        <div className="p-4 bg-muted/30 rounded-lg">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">Total Actual Cost:</span>
                            <span className="text-xl font-bold text-primary">
                              ${(form.getValues('actualCost') || 0).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </TabsContent>

              {/* Quality & Issues Tab */}
              <TabsContent value="quality" className="space-y-6 mt-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Star className="h-5 w-5 text-primary" />
                        Quality Assessment & Issues
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Quality Rating */}
                      <div className="space-y-4">
                        <FormField
                          control={form.control}
                          name="qualityRating"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-base font-medium">Work Quality Rating</FormLabel>
                              <FormControl>
                                <div className="space-y-3">
                                  <div className="flex items-center gap-2">
                                    <Input
                                      type="range"
                                      min="1"
                                      max="5"
                                      step="1"
                                      {...field}
                                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                                      className="flex-1"
                                    />
                                    <div className="flex items-center gap-1">
                                      {[1, 2, 3, 4, 5].map((star) => (
                                        <Star
                                          key={star}
                                          className={`h-5 w-5 ${
                                            star <= (field.value ?? 0)
                                              ? 'text-yellow-500 fill-yellow-500'
                                              : 'text-muted-foreground'
                                          }`}
                                        />
                                      ))}
                                    </div>
                                  </div>
                                  <p className="text-sm text-muted-foreground">
                                    {field.value === 1 && 'Poor - Below expectations'}
                                    {field.value === 2 && 'Fair - Needs improvement'}
                                    {field.value === 3 && 'Good - Meets expectations'}
                                    {field.value === 4 && 'Very Good - Above expectations'}
                                    {field.value === 5 && 'Excellent - Outstanding work'}
                                  </p>
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="workStandard"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Work Standard</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger className={isMobile ? 'h-12 text-lg' : ''}>
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="below-standard">
                                    <div className="flex items-center gap-2">
                                      <AlertTriangle className="h-4 w-4 text-red-500" />
                                      Below Standard
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="meets-standard">
                                    <div className="flex items-center gap-2">
                                      <CheckCircle className="h-4 w-4 text-green-500" />
                                      Meets Standard
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="exceeds-standard">
                                    <div className="flex items-center gap-2">
                                      <Star className="h-4 w-4 text-yellow-500" />
                                      Exceeds Standard
                                    </div>
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <Separator />

                      {/* Issues Section */}
                      <div className="space-y-4">
                        <Label className="text-base font-medium">Issues Encountered</Label>
                        <Textarea
                          placeholder="Describe any problems, delays, equipment issues, weather challenges, or other obstacles encountered during the work..."
                          className={`min-h-24 ${isMobile ? 'text-lg' : ''}`}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </TabsContent>

              {/* Documentation Tab */}
              <TabsContent value="documentation" className="space-y-6 mt-6">
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
                                onClick={() => cameraInputRef.current?.click()}
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
                                onClick={() => fileInputRef.current?.click()}
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
                                onClick={() => cameraInputRef.current?.click()}
                                className={isMobile ? 'h-12 px-6' : ''}
                              >
                                <Camera className="h-4 w-4 mr-2" />
                                Take Photo
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => fileInputRef.current?.click()}
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

                                    {/* GPS indicator */}
                                    {photo.gpsLocation && (
                                      <motion.div
                                        className="absolute top-2 right-2"
                                        initial={{ opacity: 0, scale: 0 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.3, type: "spring", bounce: 0.6 }}
                                      >
                                        <Badge variant="secondary" className="text-xs shadow-md">
                                          <motion.div
                                            animate={{ scale: [1, 1.2, 1] }}
                                            transition={{ duration: 2, repeat: Infinity }}
                                          >
                                            <MapPin className="h-3 w-3 mr-1" />
                                          </motion.div>
                                          GPS
                                        </Badge>
                                      </motion.div>
                                    )}

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
                              className="aspect-square rounded-lg border-2 border-dashed border-border flex items-center justify-center cursor-pointer relative overflow-hidden group"
                              whileHover={{
                                scale: 1.05,
                                borderColor: 'hsl(var(--primary))',
                                backgroundColor: 'hsl(var(--primary) / 0.05)'
                              }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => fileInputRef.current?.click()}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: photos.length * 0.1 + 0.2 }}
                            >
                              {/* Animated background */}
                              <motion.div
                                className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent"
                                initial={{ opacity: 0, scale: 0 }}
                                whileHover={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.3 }}
                              />

                              <div className="text-center relative z-10">
                                <motion.div
                                  animate={{
                                    y: [0, -5, 0],
                                    rotate: [0, 5, -5, 0]
                                  }}
                                  transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                  }}
                                >
                                  <Camera className="h-8 w-8 text-muted-foreground mx-auto mb-2 group-hover:text-primary transition-colors" />
                                </motion.div>
                                <motion.p
                                  className="text-sm text-muted-foreground group-hover:text-primary transition-colors"
                                  whileHover={{ scale: 1.1 }}
                                  transition={{ duration: 0.2 }}
                                >
                                  Add More
                                </motion.p>
                              </div>
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
                  {currentLocation && (
                    <>
                      {photos.length > 0 && <span>•</span>}
                      <motion.div
                        className="flex items-center gap-1"
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ type: "spring", bounce: 0.5, delay: 0.1 }}
                      >
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          <MapPin className="h-4 w-4 text-green-500" />
                        </motion.div>
                        <span>GPS tracked</span>
                      </motion.div>
                    </>
                  )}
                  {(form.getValues('completionPercentage') || 0) > 0 && (
                    <>
                      {(photos.length > 0 || currentLocation) && <span>•</span>}
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

              <div className="flex gap-3">
                <TouchFriendly className="flex-1">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full"
                  >
                    <Button
                      type="submit"
                      className={`w-full ${isMobile ? 'h-14 text-lg' : 'h-12'} relative overflow-hidden`}
                      disabled={isSubmitting}
                    >
                      {/* Button background animation */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent"
                        initial={{ x: '-100%' }}
                        animate={{ x: isSubmitting ? '100%' : '-100%' }}
                        transition={{ duration: 1, repeat: isSubmitting ? Infinity : 0 }}
                      />

                      <div className="relative z-10 flex items-center justify-center">
                        {isSubmitting ? (
                          <>
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            >
                              <LoadingSpinner size="sm" />
                            </motion.div>
                            <motion.span
                              className="ml-2"
                              animate={{ opacity: [0.5, 1, 0.5] }}
                              transition={{ duration: 1, repeat: Infinity }}
                            >
                              Saving...
                            </motion.span>
                          </>
                        ) : (
                          <>
                            <motion.div
                              whileHover={{ scale: 1.1, rotate: 5 }}
                              transition={{ duration: 0.2 }}
                            >
                              <Save className="h-4 w-4 mr-2" />
                            </motion.div>
                            Save Work Package
                          </>
                        )}
                      </div>
                    </Button>
                  </motion.div>
                </TouchFriendly>

                <TouchFriendly>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCancel}
                      className={`${isMobile ? 'h-14 px-6' : 'h-12'} transition-all duration-200`}
                      disabled={isSubmitting}
                    >
                      <motion.div
                        whileHover={{ rotate: 90 }}
                        transition={{ duration: 0.2 }}
                      >
                        <X className="h-4 w-4 mr-2" />
                      </motion.div>
                      Cancel
                    </Button>
                  </motion.div>
                </TouchFriendly>
              </div>
            </motion.div>
          </form>
        </Form>
      </motion.div>
    </ResponsiveContainer>
  )
}
