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
import { Leaf, Clock, CheckCircle, AlertCircle, MapPin } from 'lucide-react'

// Types and Services
import { CropCycle, CropCycleFormData, CreateCropCycleRequest } from '@/types/cropCycleManagement'
import { useSugarcaneVarietiesForSelect } from '@/hooks/useVarieties'

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

      // Hide success message after 3 seconds
      setTimeout(() => setShowSuccess(false), 3000)
    } catch (error) {
      console.error('Error creating crop cycle:', error)
      setIsCreating(false)
    }
  }

  // Check if cycle is saved (has an active cycle)
  const isCycleSaved = !!activeCycle

  return (
    <div className="h-full overflow-auto">
      <div className="p-6 space-y-6">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="bg-gradient-to-r from-primary/20 to-primary/30 border-primary/40 bg-white/90">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl text-primary">
                    Crop Cycle Management
                  </CardTitle>
                  <CardDescription className="text-lg mt-2">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {blocArea} hectares
                      </span>
                      <span className="flex items-center gap-1">
                        <Leaf className="h-4 w-4" />
                        Bloc {blocName}
                      </span>
                    </div>
                  </CardDescription>
                </div>
                <Badge variant="secondary" className="text-lg px-4 py-2">
                  {isCycleSaved ? 'Active Cycle' : 'No Active Cycle'}
                </Badge>
              </div>
            </CardHeader>
          </Card>
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
                <div className="text-center py-8 text-slate-600">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 text-emerald-600" />
                  <h3 className="font-medium text-slate-800 mb-2">Active Crop Cycle</h3>
                  <p>Variety: {activeCycle.sugarcaneVarietyName}</p>
                  <p>Planting Date: {activeCycle.sugarcaneePlantingDate ? new Date(activeCycle.sugarcaneePlantingDate).toLocaleDateString() : 'Not set'}</p>
                  <p>Expected Harvest: {new Date(activeCycle.sugarcaneePlannedHarvestDate).toLocaleDateString()}</p>
                  <p>Expected Yield: {activeCycle.sugarcaneExpectedYieldTonsHa} tons/ha</p>
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
                      {/* Sugarcane Variety with Enhanced Animation */}
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: 0.3 }}
                      >
                        <FormField
                          control={form.control}
                          name="sugarcaneVarietyId"
                          render={({ field, fieldState }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium text-slate-700">
                                Sugarcane Variety *
                              </FormLabel>
                              <Select
                                onValueChange={(value) => {
                                  field.onChange(value)
                                  const variety = sugarcaneVarieties.find((v) => v.id === value)
                                  if (variety) {
                                    form.setValue('sugarcaneVarietyName', variety.name)
                                  }
                                }}
                                value={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger className={`transition-all duration-200 ${
                                    fieldState.error
                                      ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                                      : 'border-slate-300 focus:border-primary focus:ring-primary/20'
                                  }`}>
                                    <SelectValue placeholder="Select sugarcane variety..." />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {varietySelectOptions.map((option, index) => (
                                    <motion.div
                                      key={option.value}
                                      initial={{ opacity: 0, y: -10 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      transition={{ duration: 0.2, delay: index * 0.05 }}
                                    >
                                      <SelectItem value={option.value}>
                                        <div>
                                          <div className="font-medium">{option.label}</div>
                                          {option.description && (
                                            <div className="text-sm text-slate-500">{option.description}</div>
                                          )}
                                        </div>
                                      </SelectItem>
                                    </motion.div>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage className="text-xs" />
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
                            {cycle.sugarcaneActualHarvestDate 
                              ? new Date(cycle.sugarcaneActualHarvestDate).toLocaleDateString()
                              : 'Not recorded'
                            }
                          </div>
                        </div>
                        <div>
                          <span className="text-slate-600">Expected Yield:</span>
                          <div className="font-medium text-slate-800">{cycle.sugarcaneExpectedYieldTonsHa} t/ha</div>
                        </div>
                        <div>
                          <span className="text-slate-600">Actual Yield:</span>
                          <div className="font-medium text-slate-800">
                            {cycle.sugarcaneActualYieldTonsHa ? `${cycle.sugarcaneActualYieldTonsHa} t/ha` : 'Not recorded'}
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
