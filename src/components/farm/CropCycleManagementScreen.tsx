'use client'

import React, { useState } from 'react'
import { motion } from 'motion/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
// Data Management
import { useCreateCropCycle } from '@/hooks/useBlocData'
import { useBlocContext } from '@/components/farm/contexts/BlocContext'

// UI Components
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

// Icons
import { Leaf, Clock, CheckCircle, AlertCircle, MapPin, Sprout } from 'lucide-react'

// Types and Services
import { CropCycle, CropCycleFormData, CreateCropCycleRequest } from '@/types/cropCycleManagement'
import { useSugarcaneVarietiesForSelect } from '@/hooks/useVarieties'

// Crop Cycle Components
import { SolarRadiationCard } from './crop-cycle/SolarRadiationCard'
import { PrecipitationCard } from './crop-cycle/PrecipitationCard'
import VarietySelectionManager from '@/components/selectors/VarietySelectionManager'

// Form validation schema
const cropCycleFormSchema = z.object({
  sugarcaneVarietyId: z.string().min(1, 'Sugarcane variety is required'),
  sugarcaneVarietyName: z.string().min(1, 'Sugarcane variety name is required'),
  plantingDate: z.string().min(1, 'Planting date is required'),
  expectedHarvestDate: z.string().min(1, 'Expected harvest date is required'),
  expectedYield: z.number().min(0.1, 'Expected yield must be greater than 0'),
})

interface CropCycleManagementScreenProps {
  blocId: string
  blocName: string
  blocArea: number
}

export default function CropCycleManagementScreen({ 
  blocId, 
  blocName, 
  blocArea 
}: CropCycleManagementScreenProps) {
  const [isCreating, setIsCreating] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  // Get bloc context with comprehensive data
  const { cropCycles, isLoadingBlocData, blocDataError } = useBlocContext()

  // Form setup
  const form = useForm<CropCycleFormData>({
    resolver: zodResolver(cropCycleFormSchema),
    defaultValues: {
      sugarcaneVarietyId: '',
      sugarcaneVarietyName: '',
      plantingDate: '',
      expectedHarvestDate: '',
      expectedYield: 0,
    },
  })

  // Get active cycle and history from cached bloc data
  const activeCycle = cropCycles.data.find(cycle => cycle.status === 'active') || null
  const cycleHistory = cropCycles.data.filter(cycle => cycle.status === 'closed')

  // Fetch sugarcane varieties using our typed hook
  const {
    data: sugarcaneVarieties = [],
    error: varietiesError,
    isLoading: isLoadingVarieties,
    selectOptions: varietySelectOptions
  } = useSugarcaneVarietiesForSelect()

  // Optimistic crop cycle creation
  const createCropCycleMutation = useCreateCropCycle(blocId)

  // Form submission handler
  const onSubmit = async (data: CropCycleFormData) => {
    setIsCreating(true)

    const request: CreateCropCycleRequest = {
      blocId,
      type: cycleHistory.length === 0 ? 'plantation' : 'ratoon',
      sugarcaneVarietyId: data.sugarcaneVarietyId,
      plantingDate: data.plantingDate,
      expectedHarvestDate: data.expectedHarvestDate,
      expectedYield: data.expectedYield,
      parentCycleId: cycleHistory.length > 0 ? cycleHistory[0]?.id : undefined,
    }

    try {
      await createCropCycleMutation.mutateAsync(request)

      // Reset form and show success
      form.reset()
      setIsCreating(false)
      setShowSuccess(true)

      // Hide success message immediately (no delay)
      setShowSuccess(false)
    } catch (error) {
      console.error('Error creating crop cycle:', error)
      setIsCreating(false)
    }
  }

  // Check if cycle is saved (has an active cycle)
  const isCycleSaved = !!activeCycle

  return (
    <div className="h-full overflow-auto">
      <div className="p-6 space-y-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="bg-white/95 backdrop-blur-sm rounded-lg p-4 border border-border/50">
            <div>
              <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <Sprout className="h-6 w-6 text-primary" />
                Crop Cycle Management
              </h1>
              <p className="text-muted-foreground mt-1">
                Crop cycle planning and history for {blocName}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Current Crop Cycle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Leaf className="h-5 w-5" />
                Current Crop Cycle
              </CardTitle>
              <CardDescription>
                {isCycleSaved 
                  ? 'Active crop cycle information' 
                  : 'Create or edit the current crop cycle'
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {isLoadingBlocData ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
                </div>
              ) : blocDataError ? (
                <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium text-red-800">Failed to load bloc data</h3>
                    <p className="text-sm text-red-600 mt-1">{blocDataError.message}</p>
                  </div>
                </div>
              ) : isCycleSaved && activeCycle ? (
                <div className="flex items-center gap-4 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                  {/* Active Icon */}
                  <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>

                  {/* Crop Cycle Information */}
                  <div className="flex-1">
                    <div className="grid grid-cols-2 gap-x-6 gap-y-1">
                      {/* Top Row */}
                      <div>
                        <span className="text-sm font-medium text-slate-600">Variety:</span>
                        <span className="ml-2 text-sm text-slate-800">{activeCycle.sugarcaneVarietyName || 'R579'}</span>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-slate-600">Expected Yield:</span>
                        <span className="ml-2 text-sm text-slate-800">{activeCycle.expectedYield} tons/ha</span>
                      </div>

                      {/* Bottom Row */}
                      <div>
                        <span className="text-sm font-medium text-slate-600">
                          {activeCycle.type === 'ratoon' ? 'Previous Harvest:' : 'Planting Date:'}
                        </span>
                        <span className="ml-2 text-sm text-slate-800">
                          {activeCycle.plantingDate ? new Date(activeCycle.plantingDate).toLocaleDateString() : '01/04/2024'}
                        </span>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-slate-600">Expected Harvest:</span>
                        <span className="ml-2 text-sm text-slate-800">
                          {new Date(activeCycle.plannedHarvestDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : isLoadingVarieties ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
                  <span className="ml-3 text-slate-600">Loading varieties...</span>
                </div>
              ) : varietiesError ? (
                <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium text-red-800">Cannot load crop cycle form</h3>
                    <p className="text-sm text-red-600 mt-1">
                      Failed to load sugarcane varieties: {varietiesError.message}
                    </p>
                  </div>
                </div>
              ) : (
                // Show form for creating new cycle with enhanced animations
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                >
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      {/* Enhanced Error Display with Animation */}
                      {createCropCycleMutation.error && (
                        <motion.div
                          initial={{ opacity: 0, y: -10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -10, scale: 0.95 }}
                          transition={{ duration: 0.3 }}
                          className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg"
                        >
                          <motion.div
                            initial={{ rotate: 0 }}
                            animate={{ rotate: [0, -10, 10, -10, 0] }}
                            transition={{ duration: 0.5 }}
                          >
                            <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0" />
                          </motion.div>
                          <div>
                            <h3 className="font-medium text-red-800">Failed to create crop cycle</h3>
                            <p className="text-sm text-red-600 mt-1">{createCropCycleMutation.error.message}</p>
                          </div>
                        </motion.div>
                      )}

                      {/* Success Message with Animation */}
                      {showSuccess && (
                        <motion.div
                          initial={{ opacity: 0, y: -10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -10, scale: 0.95 }}
                          transition={{ duration: 0.3 }}
                          className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-lg"
                        >
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 0.3, delay: 0.1 }}
                          >
                            <CheckCircle className="h-6 w-6 text-emerald-600 flex-shrink-0" />
                          </motion.div>
                          <div>
                            <h3 className="font-medium text-emerald-800">Crop cycle created successfully!</h3>
                            <p className="text-sm text-emerald-600 mt-1">Your new crop cycle has been saved and is now active.</p>
                          </div>
                        </motion.div>
                      )}

                    {/* Animated Form Grid */}
                    <motion.div
                      className="grid grid-cols-1 md:grid-cols-2 gap-6"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.4, delay: 0.2 }}
                    >
                      {/* Sugarcane Variety with Modern Selector */}
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: 0.3 }}
                        className="md:col-span-2"
                      >
                        <FormField
                          control={form.control}
                          name="sugarcaneVarietyId"
                          render={({ field, fieldState }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium text-slate-700">
                                Sugarcane Variety *
                              </FormLabel>
                              <div className="mt-2">
                                <VarietySelectionManager
                                  selectedVariety={field.value ? {
                                    variety: sugarcaneVarieties.find(v => v.id === field.value) || sugarcaneVarieties[0]
                                  } : null}
                                  onVarietyChange={(selectedVariety) => {
                                    if (selectedVariety) {
                                      field.onChange(selectedVariety.variety.id)
                                      form.setValue('sugarcaneVarietyName', selectedVariety.variety.name)
                                    } else {
                                      field.onChange('')
                                      form.setValue('sugarcaneVarietyName', '')
                                    }
                                  }}
                                  cycleType="plantation"
                                  title="Select Sugarcane Variety"
                                  subtitle="Choose the variety for this crop cycle with harvest period labels"
                                />
                              </div>
                              {fieldState.error && (
                                <p className="text-sm text-red-600 mt-1">{fieldState.error.message}</p>
                              )}
                            </FormItem>
                          )}
                        />
                      </motion.div>

                      {/* Expected Yield with Animation */}
                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: 0.4 }}
                      >
                        <FormField
                          control={form.control}
                          name="expectedYield"
                          render={({ field, fieldState }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium text-slate-700">
                                Expected Yield (tons/ha) *
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  step="0.1"
                                  min="0"
                                  placeholder="e.g., 85.5"
                                  className={`transition-all duration-200 ${
                                    fieldState.error
                                      ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                                      : 'border-slate-300 focus:border-primary focus:ring-primary/20'
                                  }`}
                                  {...field}
                                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                />
                              </FormControl>
                              <FormMessage className="text-xs" />
                            </FormItem>
                          )}
                        />
                      </motion.div>

                      {/* Planting Date with Animation */}
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: 0.5 }}
                      >
                        <FormField
                          control={form.control}
                          name="plantingDate"
                          render={({ field, fieldState }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium text-slate-700">
                                Planting Date *
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type="date"
                                  className={`transition-all duration-200 ${
                                    fieldState.error
                                      ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                                      : 'border-slate-300 focus:border-primary focus:ring-primary/20'
                                  }`}
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage className="text-xs" />
                            </FormItem>
                          )}
                        />
                      </motion.div>

                      {/* Expected Harvest Date with Animation */}
                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: 0.6 }}
                      >
                        <FormField
                          control={form.control}
                          name="expectedHarvestDate"
                          render={({ field, fieldState }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium text-slate-700">
                                Expected Harvest Date *
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type="date"
                                  className={`transition-all duration-200 ${
                                    fieldState.error
                                      ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                                      : 'border-slate-300 focus:border-primary focus:ring-primary/20'
                                  }`}
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage className="text-xs" />
                            </FormItem>
                          )}
                        />
                      </motion.div>
                    </motion.div>



                    {/* Enhanced Form Actions with Animation */}
                    <motion.div
                      className="flex items-center justify-between pt-6 border-t border-slate-200"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.8 }}
                    >
                      <div className="text-sm text-slate-600 flex items-center gap-2">
                        <span className="text-red-500">*</span>
                        Required fields
                      </div>
                      <div className="flex items-center gap-3">
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => form.reset()}
                            disabled={isCreating}
                            className="transition-all duration-200 hover:bg-slate-50"
                          >
                            Reset
                          </Button>
                        </motion.div>
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Button
                            type="submit"
                            disabled={isCreating || !form.formState.isValid}
                            className="min-w-[140px] transition-all duration-200 bg-primary hover:bg-primary/90"
                          >
                            {isCreating ? (
                              <motion.div
                                className="flex items-center"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.2 }}
                              >
                                <motion.div
                                  className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"
                                  animate={{ rotate: 360 }}
                                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                />
                                Creating...
                              </motion.div>
                            ) : (
                              <motion.span
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.2 }}
                              >
                                Create Crop Cycle
                              </motion.span>
                            )}
                          </Button>
                        </motion.div>
                      </div>
                    </motion.div>
                  </form>
                </Form>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Climate Data Cards */}
        {isCycleSaved && activeCycle && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Solar Radiation Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <SolarRadiationCard
                plantingDate={activeCycle.plantingDate || '2024-04-01'}
                harvestDate={activeCycle.plannedHarvestDate}
              />
            </motion.div>

            {/* Precipitation Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <PrecipitationCard
                plantingDate={activeCycle.plantingDate || '2024-04-01'}
                harvestDate={activeCycle.plannedHarvestDate}
              />
            </motion.div>
          </div>
        )}

        {/* Crop Cycle History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Crop Cycle History
              </CardTitle>
              <CardDescription>
                View all closed crop cycles for this bloc
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {isLoadingBlocData ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-600"></div>
                </div>
              ) : blocDataError ? (
                <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium text-red-800">Failed to load bloc data</h3>
                    <p className="text-sm text-red-600 mt-1">{blocDataError.message}</p>
                  </div>
                </div>
              ) : cycleHistory.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <Clock className="h-12 w-12 mx-auto mb-4 text-slate-400" />
                  <p>No closed cycles yet</p>
                  <p className="text-sm">Close your first cycle to see history</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cycleHistory.map((cycle) => (
                    <div key={cycle.id} className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-slate-800">
                          {cycle.type === 'plantation' ? 'Plantation' : `Ratoon ${cycle.cycleNumber - 1}`}
                        </h4>
                        <Badge variant="outline" className="text-slate-600 border-slate-300">
                          Closed
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        <div>
                          <span className="text-slate-600">Variety:</span>
                          <div className="font-medium text-slate-800">{cycle.sugarcaneVarietyName}</div>
                        </div>
                        <div>
                          <span className="text-slate-600">Harvest Date:</span>
                          <div className="font-medium text-slate-800">
                            {cycle.actualHarvestDate
                              ? new Date(cycle.actualHarvestDate).toLocaleDateString()
                              : 'Not recorded'
                            }
                          </div>
                        </div>
                        <div>
                          <span className="text-slate-600">Expected Yield:</span>
                          <div className="font-medium text-slate-800">{cycle.expectedYield} t/ha</div>
                        </div>
                        <div>
                          <span className="text-slate-600">Actual Yield:</span>
                          <div className="font-medium text-slate-800">
                            {cycle.actualYield ? `${cycle.actualYield} t/ha` : 'Not recorded'}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
