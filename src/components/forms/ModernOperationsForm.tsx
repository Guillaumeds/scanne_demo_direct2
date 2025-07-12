'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { operationFormSchema, OperationFormData, createOperationSchemaWithBlocArea } from '@/schemas/operationsSchema'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Icon } from '@/components/ui/icon'
import { IconButton } from '@/components/ui/icon'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useBlocNavigation } from '@/contexts/BlocNavigationContext'
import AttachmentUploader, { AttachmentFile } from '@/components/AttachmentUploader'
import ProductSelector from '@/components/ProductSelector'
import EquipmentSelector from '@/components/EquipmentSelector'

// Fixed resource types with predefined rates
const RESOURCE_TYPES = [
  { name: 'Supervisor', ratePerHour: 500 },
  { name: 'Permanent Male', ratePerHour: 300 },
  { name: 'Permanent Female', ratePerHour: 250 },
  { name: 'Contract Male', ratePerHour: 350 },
  { name: 'Contract Female', ratePerHour: 280 }
]

// Operation and method options
const OPERATION_OPTIONS = ['Planting', 'Fertilizing', 'Weeding', 'Irrigation', 'Harvesting', 'Spraying']
const METHOD_OPTIONS = ['Manual', 'Mechanical', 'Chemical', 'Biological', 'Integrated']
const OPERATION_TYPE_OPTIONS = ['Field Preparation', 'Planting', 'Maintenance', 'Harvesting', 'Post-Harvest']

interface ModernOperationsFormProps {
  operation?: any
  onSave: (data: OperationFormData) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
  blocArea: number
}

export function ModernOperationsForm({
  operation,
  onSave,
  onCancel,
  isLoading = false,
  blocArea
}: ModernOperationsFormProps) {
  const [isSaving, setIsSaving] = useState(false)
  const { navigateToForm } = useBlocNavigation()

  // Modal states
  const [showOperationSelector, setShowOperationSelector] = useState(false)
  const [showMethodSelector, setShowMethodSelector] = useState(false)
  const [showProductSelector, setShowProductSelector] = useState(false)
  const [showEquipmentSelector, setShowEquipmentSelector] = useState(false)

  // Data states
  const [mainProduct, setMainProduct] = useState<any>(operation?.mainProduct || null)
  const [productsData, setProductsData] = useState<any[]>(operation?.productsData || [])
  const [equipmentData, setEquipmentData] = useState<any[]>(operation?.equipmentData || [])
  const [resourcesData, setResourcesData] = useState(() =>
    RESOURCE_TYPES.map(type => ({
      resource: type.name,
      estimatedEffort: 0,
      estimatedCost: 0,
      ratePerHour: type.ratePerHour
    }))
  )
  const [notesData, setNotesData] = useState<string[]>([''])
  const [attachmentFiles, setAttachmentFiles] = useState<AttachmentFile[]>([])

  const form = useForm<OperationFormData>({
    resolver: zodResolver(createOperationSchemaWithBlocArea(blocArea)),
    defaultValues: {
      operationName: operation?.product_name || '',
      operationType: operation?.operation_type || '',
      method: operation?.method || '',
      plannedStartDate: operation?.planned_start_date || '',
      plannedEndDate: operation?.planned_end_date || '',
      actualStartDate: operation?.actual_start_date || '',
      actualEndDate: operation?.actual_end_date || '',
      plannedArea: operation?.planned_area || undefined,
      actualArea: operation?.actual_area || undefined,
      plannedQuantity: operation?.planned_quantity || undefined,
      actualQuantity: operation?.actual_quantity || undefined,
      status: operation?.status || 'planned',
      products: operation?.productsData || [],
      equipment: operation?.equipmentData || [],
      resources: operation?.resourcesData || [],
      estimatedTotalCost: operation?.estimated_total_cost || undefined,
      actualTotalCost: operation?.actual_total_cost || undefined,
      actualRevenue: operation?.actual_revenue || undefined,
      notes: operation?.notes || '',
      attachments: operation?.attachments || []
    }
  })

  // Set form navigation on mount
  useEffect(() => {
    navigateToForm('operation')
  }, [navigateToForm])

  // Helper functions
  const isHarvestOperation = (operationName: string) => {
    return operationName?.toLowerCase() === 'harvesting'
  }

  // Resource calculation functions
  const updateResourceEffort = (index: number, effort: number) => {
    const updatedResources = [...resourcesData]
    updatedResources[index].estimatedEffort = effort
    updatedResources[index].estimatedCost = effort * updatedResources[index].ratePerHour
    setResourcesData(updatedResources)
  }

  // Equipment calculation functions
  const updateEquipmentDuration = (equipmentId: string, duration: number) => {
    setEquipmentData(prev => prev.map(eq =>
      eq.id === equipmentId
        ? { ...eq, estimatedDuration: duration, totalEstimatedCost: duration * eq.costPerHour }
        : eq
    ))
  }

  // Product selector handlers
  const handleProductSelect = (product: any, quantity: number, rate: number, actualCost?: number) => {
    const newProduct = {
      id: `prod_${Date.now()}`,
      productId: product.id,
      productName: product.name,
      quantity,
      rate,
      unit: product.unit,
      estimatedCost: actualCost || (quantity * rate),
      actualCost
    }
    setProductsData(prev => [...prev, newProduct])
    setShowProductSelector(false)
  }

  // Equipment selector handlers
  const handleEquipmentSelect = (equipment: any) => {
    const newEquipment = {
      id: equipment.id,
      name: equipment.name,
      estimatedDuration: 0,
      costPerHour: equipment.defaultRate,
      totalEstimatedCost: 0
    }
    setEquipmentData(prev => [...prev, newEquipment])
    setShowEquipmentSelector(false)
  }

  const handleSubmit = async (data: OperationFormData) => {
    if (isSaving) return

    setIsSaving(true)
    try {
      // Include all the additional data
      const completeData = {
        ...data,
        mainProduct,
        productsData,
        equipmentData,
        resourcesData,
        notes: notesData.filter(note => note.trim() !== '').join('\n'),
        attachments: attachmentFiles
      }
      await onSave(completeData)
    } catch (error) {
      console.error('Error saving operation:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'completed': return 'default'
      case 'in-progress': return 'secondary'
      case 'planned': return 'outline'
      case 'cancelled': return 'destructive'
      default: return 'outline'
    }
  }

  return (
    <div className="h-full flex flex-col bg-slate-50">
      {/* No header - integrated with main breadcrumbs */}
      <div className="flex-1 flex flex-col">
        <div className="bg-white border-b border-slate-200 p-2">
          <div className="flex items-center justify-end">
            <IconButton
              icon="close"
              variant="ghost"
            onClick={onCancel}
            className="text-slate-500 hover:text-slate-700"
          />
        </div>
      </div>

      {/* Form Content */}
      <div className="flex-1 p-6 overflow-auto">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="h-full">
            <Tabs defaultValue="general" className="h-full flex flex-col">
              <TabsList className="grid w-full grid-cols-5 bg-white border border-slate-200">
                <TabsTrigger value="general" className="flex items-center gap-2">
                  <span>⚙️</span>
                  General
                </TabsTrigger>
                <TabsTrigger
                  value="yield"
                  className="flex items-center gap-2"
                  disabled={!isHarvestOperation(form.watch('operationName'))}
                >
                  <span>🌾</span>
                  Yield
                </TabsTrigger>
                <TabsTrigger value="resources" className="flex items-center gap-2">
                  <span>👥</span>
                  Resources
                </TabsTrigger>
                <TabsTrigger value="notes" className="flex items-center gap-2">
                  <span>📝</span>
                  Notes
                </TabsTrigger>
                <TabsTrigger value="attachments" className="flex items-center gap-2">
                  <span>📎</span>
                  Attachments
                </TabsTrigger>
              </TabsList>
              
              <div className="flex-1 mt-6">
                {/* General Tab - Contains Basic Info + Products + Equipment */}
                <TabsContent value="general" className="h-full">
                  <div className="space-y-6">
                    {/* Basic Information Section */}
                    <div className="space-y-4">
                      {/* Row 1: Operation Name, Method (2 columns like old form) */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Operation Name - Button with Modal */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Operation *
                          </label>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setShowOperationSelector(true)}
                            className="w-full justify-start min-h-[42px]"
                          >
                            {form.watch('operationName') || 'Select operation...'}
                          </Button>
                        </div>

                        {/* Method - Button with Modal */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Method *
                          </label>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setShowMethodSelector(true)}
                            className="w-full justify-start min-h-[42px]"
                          >
                            {form.watch('method') || 'Select method...'}
                          </Button>
                        </div>
                      </div>

                      {/* Row 2: Dates (2 columns like old form) */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                              <FormLabel>Planned End Date *</FormLabel>
                              <FormControl>
                                <Input type="date" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    {/* Products Section - Hidden for Harvest Operations */}
                    {!isHarvestOperation(form.watch('operationName')) && (
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <label className="block text-sm font-medium text-gray-700">
                            Products
                          </label>
                          {productsData.length > 0 ? (
                            <Button
                              type="button"
                              onClick={() => setShowProductSelector(true)}
                              size="sm"
                              className="text-blue-600 hover:text-blue-700"
                            >
                              <Icon name="add" className="mr-2" />
                              Add Product
                            </Button>
                          ) : (
                            <Button
                              type="button"
                              onClick={() => setShowProductSelector(true)}
                              variant="outline"
                              size="sm"
                              className="border-dashed border-blue-300 text-blue-600 hover:text-blue-700"
                            >
                              <Icon name="add" className="mr-2" />
                              Add Product
                            </Button>
                          )}
                        </div>

                        <div className="space-y-3">
                          {productsData.length > 0 ? (
                            productsData.map((product, index) => (
                              <div key={index} className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-3">
                                    <span className="text-lg">🧪</span>
                                    <div className="flex-1">
                                      <div className="font-medium text-gray-900">{product.productName}</div>
                                      <div className="text-sm text-gray-600">
                                        Rate: {product.rate} {product.unit}/ha • Qty: {product.quantity} {product.unit}
                                        <br />
                                        <span className="text-blue-600">Est: Rs {product.estimatedCost?.toLocaleString()}</span>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex space-x-1">
                                    <Button
                                      type="button"
                                      size="sm"
                                      variant="ghost"
                                      className="p-1 text-gray-400 hover:text-blue-600"
                                    >
                                      <Icon name="edit" />
                                    </Button>
                                    <Button
                                      type="button"
                                      size="sm"
                                      variant="ghost"
                                      className="p-1 text-gray-400 hover:text-red-600"
                                      onClick={() => {
                                        setProductsData(prev => prev.filter((_, i) => i !== index))
                                      }}
                                    >
                                      <Icon name="delete" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="text-center py-4 border-2 border-dashed border-gray-300 rounded-lg">
                              <div className="text-gray-500 text-sm">No products selected</div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Equipment Section - Matching Product UX */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <label className="block text-sm font-medium text-gray-700">
                          Equipment
                        </label>
                        {equipmentData.length > 0 ? (
                          <Button
                            type="button"
                            onClick={() => setShowEquipmentSelector(true)}
                            size="sm"
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <Icon name="add" className="mr-2" />
                            Add Equipment
                          </Button>
                        ) : (
                          <Button
                            type="button"
                            onClick={() => setShowEquipmentSelector(true)}
                            variant="outline"
                            size="sm"
                            className="border-dashed border-blue-300 text-blue-600 hover:text-blue-700"
                          >
                            <Icon name="add" className="mr-2" />
                            Add Equipment
                          </Button>
                        )}
                      </div>

                      <div className="space-y-3">
                        {equipmentData.length > 0 ? (
                          equipmentData.map((equipment, index) => (
                            <div key={equipment.id || index} className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  <span className="text-lg">🚜</span>
                                  <div className="flex-1">
                                    <div className="font-medium text-gray-900">{equipment.name}</div>
                                    <div className="text-sm text-gray-600">
                                      Duration: {equipment.estimatedDuration}h • Rate: Rs {equipment.costPerHour}/h
                                      <br />
                                      <span className="text-blue-600">Est: Rs {equipment.totalEstimatedCost?.toLocaleString()}</span>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex space-x-1">
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="ghost"
                                    className="p-1 text-gray-400 hover:text-blue-600"
                                  >
                                    <Icon name="edit" />
                                  </Button>
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="ghost"
                                    className="p-1 text-gray-400 hover:text-red-600"
                                    onClick={() => {
                                      setEquipmentData(prev => prev.filter((_, i) => i !== index))
                                    }}
                                  >
                                    <Icon name="delete" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-4 border-2 border-dashed border-gray-300 rounded-lg">
                            <div className="text-gray-500 text-sm">No equipment selected</div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Yield Tab - Only for Harvest Operations */}
                <TabsContent value="yield" className="h-full">
                  <div className="space-y-6">
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <h3 className="text-sm font-medium text-gray-900 mb-4">Main Yield Section</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField
                          control={form.control}
                          name="totalYield"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Total Yield (tons) *</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  step="0.1"
                                  min="0"
                                  placeholder="0.0"
                                  {...field}
                                  onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Yield per Hectare (t/ha)
                          </label>
                          <div className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-700">
                            {form.watch('totalYield') && form.watch('actualArea')
                              ? (form.watch('totalYield') / form.watch('actualArea')).toFixed(2)
                              : '0.00'
                            }
                          </div>
                        </div>

                        <FormField
                          control={form.control}
                          name="revenuePerHectare"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Revenue per Hectare (Rs/ha)</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  placeholder="0.00"
                                  {...field}
                                  onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Price per Tonne (Rs/t)
                          </label>
                          <div className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-700">
                            {form.watch('revenuePerHectare') && form.watch('actualArea') && form.watch('totalYield')
                              ? ((form.watch('revenuePerHectare') * form.watch('actualArea')) / form.watch('totalYield')).toFixed(2)
                              : '0.00'
                            }
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Total Revenue (Rs)
                          </label>
                          <div className="w-full px-3 py-2 bg-green-100 border border-green-300 rounded-md text-green-700 font-medium">
                            Rs {form.watch('revenuePerHectare') && form.watch('actualArea')
                              ? (form.watch('revenuePerHectare') * form.watch('actualArea')).toLocaleString()
                              : '0'
                            }
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                {/* Resources Tab */}
                <TabsContent value="resources" className="h-full">
                  <div className="space-y-6">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Estimated Resource Usage</h3>
                      <p className="text-sm text-gray-600 mb-4">
                        Plan the estimated hours and costs for each resource type.
                      </p>

                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left py-2 px-3 font-medium">Resource Type</th>
                              <th className="text-left py-2 px-3 font-medium">Est. Effort (hours)</th>
                              <th className="text-left py-2 px-3 font-medium">Rate/Hour (Rs)</th>
                              <th className="text-left py-2 px-3 font-medium">Est. Cost (Rs)</th>
                            </tr>
                          </thead>
                          <tbody>
                            {resourcesData.map((resource, index) => (
                              <tr key={index} className="border-b">
                                <td className="py-2 px-3 font-medium">{resource.resource}</td>
                                <td className="py-2 px-3">
                                  <Input
                                    type="number"
                                    step="0.5"
                                    min="0"
                                    value={resource.estimatedEffort || ''}
                                    onChange={(e) => updateResourceEffort(index, parseFloat(e.target.value) || 0)}
                                    className="w-20"
                                  />
                                </td>
                                <td className="py-2 px-3">Rs {resource.ratePerHour}</td>
                                <td className="py-2 px-3 font-medium text-blue-600">
                                  Rs {resource.estimatedCost?.toLocaleString()}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>

                        {/* Total Resources Cost */}
                        <div className="mt-4 pt-4 border-t">
                          <div className="flex justify-between items-center">
                            <span className="font-medium">Total Estimated Resource Cost:</span>
                            <span className="text-lg font-bold text-blue-600">
                              Rs {resourcesData.reduce((sum, res) => sum + (res.estimatedCost || 0), 0).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                {/* Notes Tab */}
                <TabsContent value="notes" className="h-full">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium text-gray-900">Notes</h3>
                      <Button
                        type="button"
                        onClick={() => setNotesData(prev => [...prev, ''])}
                        size="sm"
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <Icon name="add" className="mr-2" />
                        Add Note
                      </Button>
                    </div>

                    <div className="space-y-4">
                      {notesData.map((note, index) => (
                        <div key={index} className="relative">
                          <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-medium text-blue-600">
                              {index + 1}
                            </div>
                            <div className="flex-1">
                              <Textarea
                                value={note}
                                onChange={(e) => {
                                  const updatedNotes = [...notesData]
                                  updatedNotes[index] = e.target.value
                                  setNotesData(updatedNotes)
                                }}
                                placeholder={`Note ${index + 1}...`}
                                rows={3}
                                className="w-full"
                              />
                            </div>
                            {notesData.length > 1 && (
                              <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setNotesData(prev => prev.filter((_, i) => i !== index))
                                }}
                                className="text-gray-400 hover:text-red-600"
                              >
                                <Icon name="delete" />
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                {/* Attachments Tab */}
                <TabsContent value="attachments" className="h-full">
                  <div className="space-y-6">
                    <h3 className="text-lg font-medium text-gray-900">Attachments</h3>

                    <div>
                      <AttachmentUploader
                        files={attachmentFiles}
                        onFilesChange={setAttachmentFiles}
                        maxFiles={10}
                        maxSize={50} // 50MB
                        acceptedFileTypes={[
                          'image/*',
                          'application/pdf',
                          '.doc,.docx',
                          '.xls,.xlsx',
                          '.txt'
                        ]}
                      />
                    </div>
                  </div>
                </TabsContent>
              </div>
              
              {/* Footer Actions */}
              <div className="flex justify-end gap-3 pt-6 border-t border-slate-200 bg-white px-6 py-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={onCancel}
                  disabled={isSaving}
                  className="border-slate-300 text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={isSaving || isLoading}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  {isSaving ? (
                    <>
                      <Icon name="pending" className="mr-2 animate-spin" size="sm" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Icon name="save" className="mr-2" size="sm" />
                      Save Operation
                    </>
                  )}
                </Button>
              </div>
            </Tabs>
          </form>
        </Form>
      </div>
      </div>

      {/* Modal Selectors */}
      <AnimatePresence>
      {/* Operation Selector Modal */}
      {showOperationSelector && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowOperationSelector(false)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-lg p-6 w-96 max-w-[90vw]"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-medium mb-4">Select Operation</h3>
            <div className="grid gap-2">
              {OPERATION_OPTIONS.map((operation) => (
                <Button
                  key={operation}
                  type="button"
                  variant="outline"
                  onClick={() => {
                    form.setValue('operationName', operation)
                    setShowOperationSelector(false)
                  }}
                  className="justify-start hover:bg-blue-50"
                >
                  {operation}
                </Button>
              ))}
            </div>
            <div className="flex justify-end mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowOperationSelector(false)}
              >
                Cancel
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Method Selector Modal */}
      {showMethodSelector && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowMethodSelector(false)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-lg p-6 w-96 max-w-[90vw]"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-medium mb-4">Select Method</h3>
            <div className="grid gap-2">
              {METHOD_OPTIONS.map((method) => (
                <Button
                  key={method}
                  type="button"
                  variant="outline"
                  onClick={() => {
                    form.setValue('method', method)
                    setShowMethodSelector(false)
                  }}
                  className="justify-start hover:bg-blue-50"
                >
                  {method}
                </Button>
              ))}
            </div>
            <div className="flex justify-end mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowMethodSelector(false)}
              >
                Cancel
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Product Selector Modal */}
      {showProductSelector && (
        <ProductSelector
          onSelect={handleProductSelect}
          onClose={() => setShowProductSelector(false)}
          blocArea={blocArea}
        />
      )}

      {/* Equipment Selector Modal */}
      {showEquipmentSelector && (
        <EquipmentSelector
          onSelect={handleEquipmentSelect}
          onClose={() => setShowEquipmentSelector(false)}
        />
      )}
    </AnimatePresence>
    </div>
  )
}
