'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { workPackageFormSchema, WorkPackageFormData, createWorkPackageSchemaWithOperationDates } from '@/schemas/workPackageSchema'
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
import { IconButton, StatusIcon } from '@/components/ui/icon'
import { useState, useEffect } from 'react'
import { useBlocNavigation } from '@/contexts/BlocNavigationContext'
import AttachmentUploader, { AttachmentFile } from '@/components/AttachmentUploader'

// Fixed resource types with predefined rates (same as operations form)
const RESOURCE_TYPES = [
  { name: 'Supervisor', ratePerHour: 500 },
  { name: 'Permanent Male', ratePerHour: 300 },
  { name: 'Permanent Female', ratePerHour: 250 },
  { name: 'Contract Male', ratePerHour: 350 },
  { name: 'Contract Female', ratePerHour: 280 }
]

interface ModernWorkPackageFormProps {
  workPackage?: any
  operationId: string
  onSave: (data: WorkPackageFormData) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
  operationStartDate?: string
  operationEndDate?: string
}

export function ModernWorkPackageForm({
  workPackage,
  operationId,
  onSave,
  onCancel,
  isLoading = false,
  operationStartDate,
  operationEndDate
}: ModernWorkPackageFormProps) {
  const [isSaving, setIsSaving] = useState(false)
  const { navigateToForm } = useBlocNavigation()

  // State for resources, notes, and attachments
  const [resourcesData, setResourcesData] = useState(() =>
    RESOURCE_TYPES.map(type => ({
      resource: type.name,
      actualEffort: 0,
      actualCost: 0,
      ratePerHour: type.ratePerHour
    }))
  )
  const [equipmentData, setEquipmentData] = useState<any[]>(workPackage?.equipmentData || [])
  const [notesData, setNotesData] = useState<string[]>([''])
  const [attachmentFiles, setAttachmentFiles] = useState<AttachmentFile[]>([])

  const form = useForm<WorkPackageFormData>({
    resolver: zodResolver(createWorkPackageSchemaWithOperationDates(operationStartDate, operationEndDate)),
    defaultValues: {
      operationId: operationId,
      workPackageName: workPackage?.name || '',
      date: workPackage?.date || '',
      startTime: workPackage?.start_time || '',
      endTime: workPackage?.end_time || '',
      duration: workPackage?.duration || undefined,
      plannedArea: workPackage?.planned_area || undefined,
      actualArea: workPackage?.actual_area || undefined,
      plannedQuantity: workPackage?.planned_quantity || undefined,
      actualQuantity: workPackage?.actual_quantity || undefined,
      rate: workPackage?.rate || undefined,
      actualRate: workPackage?.actual_rate || undefined,
      status: workPackage?.status || 'not-started',
      actualProducts: workPackage?.actualProducts || [],
      actualEquipment: workPackage?.actualEquipment || [],
      actualResources: workPackage?.actualResources || [],
      notes: workPackage?.notes || '',
    }
  })

  // Set form navigation on mount
  useEffect(() => {
    navigateToForm('work-package')
  }, [navigateToForm])

  // Helper functions
  const updateResourceEffort = (index: number, effort: number) => {
    const updatedResources = [...resourcesData]
    updatedResources[index].actualEffort = effort
    updatedResources[index].actualCost = effort * updatedResources[index].ratePerHour
    setResourcesData(updatedResources)
  }

  const updateEquipmentDuration = (equipmentId: string, duration: number) => {
    setEquipmentData(prev => prev.map(eq =>
      eq.id === equipmentId
        ? { ...eq, actualDuration: duration, actualCost: duration * eq.costPerHour }
        : eq
    ))
  }

  const handleSubmit = async (data: WorkPackageFormData) => {
    if (isSaving) return

    setIsSaving(true)
    try {
      // Include all the additional data
      const completeData = {
        ...data,
        resourcesData,
        equipmentData,
        notes: notesData.filter(note => note.trim() !== '').join('\n'),
        attachments: attachmentFiles
      }
      await onSave(completeData)
    } catch (error) {
      console.error('Error saving work package:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'completed': return 'default'
      case 'in-progress': return 'secondary'
      case 'not-started': return 'outline'
      case 'on-hold': return 'secondary'
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
                </Badge>
              </div>
            )}
          </div>
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
              <TabsList className="grid w-full grid-cols-4 bg-white border border-slate-200">
                <TabsTrigger value="general" className="flex items-center gap-2">
                  <span>⚙️</span>
                  General
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
                {/* General Tab */}
                <TabsContent value="general" className="h-full">
                  <div className="space-y-6">
                    {/* Basic Information - 4 columns like old form */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <FormField
                        control={form.control}
                        name="date"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Date *</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="actualArea"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Area (hectares)</FormLabel>
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

                      <FormField
                        control={form.control}
                        name="actualQuantity"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Quantity</FormLabel>
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

                      <FormField
                        control={form.control}
                        name="rate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Rate</FormLabel>
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
                    </div>

                    {/* Status Section */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Status
                      </label>
                      <FormField
                        control={form.control}
                        name="status"
                        render={({ field }) => (
                          <div className="flex items-center space-x-3">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const statuses = ['not-started', 'in-progress', 'completed']
                                const currentIndex = statuses.indexOf(field.value)
                                const nextIndex = (currentIndex + 1) % statuses.length
                                field.onChange(statuses[nextIndex])
                              }}
                              className="w-8 h-8 p-0"
                            >
                              {field.value === 'not-started' && '○'}
                              {field.value === 'in-progress' && '◑'}
                              {field.value === 'completed' && '●'}
                            </Button>
                            <span className="text-sm capitalize">{field.value?.replace('-', ' ')}</span>
                          </div>
                        )}
                      />
                    </div>

                    {/* Products Section - Conditional */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Actual Product Usage</h3>
                      <p className="text-sm text-gray-600 mb-4">
                        Record the actual quantities, rates, areas, and costs for products used in this work package.
                      </p>
                      <div className="text-center py-4 border-2 border-dashed border-blue-300 rounded-lg">
                        <div className="text-blue-500 text-sm">Products will be loaded from parent operation</div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                {/* Resources Tab */}
                <TabsContent value="resources" className="h-full">
                  <div className="space-y-6">
                    {/* Actual Resource Usage Section */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Actual Resource Usage</h3>
                      <p className="text-sm text-gray-600 mb-4">
                        Record the actual hours worked and costs for each resource type.
                      </p>

                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-blue-300">
                              <th className="text-left py-2 px-3 font-medium text-gray-700">Resource</th>
                              <th className="text-left py-2 px-3 font-medium text-gray-700">Actual Effort (hours)</th>
                              <th className="text-left py-2 px-3 font-medium text-gray-700">Rate/Hour (Rs)</th>
                              <th className="text-left py-2 px-3 font-medium text-gray-700">Actual Cost (Rs)</th>
                            </tr>
                          </thead>
                          <tbody>
                            {resourcesData.map((resource, index) => (
                              <tr key={index} className="border-b border-blue-200">
                                <td className="py-2 px-3 font-medium text-gray-900">{resource.resource}</td>
                                <td className="py-2 px-3">
                                  <Input
                                    type="number"
                                    step="0.5"
                                    min="0"
                                    value={resource.actualEffort || ''}
                                    onChange={(e) => updateResourceEffort(index, parseFloat(e.target.value) || 0)}
                                    className="w-20"
                                  />
                                </td>
                                <td className="py-2 px-3">Rs {resource.ratePerHour}</td>
                                <td className="py-2 px-3 font-medium text-blue-600">
                                  Rs {resource.actualCost?.toLocaleString()}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>

                        {/* Total Actual Cost */}
                        <div className="mt-4 pt-4 border-t border-blue-300">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-900">Total Actual Cost:</span>
                            <span className="text-lg font-bold text-blue-600">
                              Rs {resourcesData.reduce((sum, res) => sum + (res.actualCost || 0), 0).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actual Equipment Usage Section */}
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Actual Equipment Usage</h3>
                      <p className="text-sm text-gray-600 mb-4">
                        Record the actual duration and costs for equipment used in this work package.
                      </p>

                      {equipmentData.length === 0 ? (
                        <div className="text-center py-4 border-2 border-dashed border-green-300 rounded-lg">
                          <div className="text-green-500 text-sm">Equipment will be loaded from parent operation</div>
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead>
                              <tr className="border-b border-green-300">
                                <th className="text-left py-2 px-3 font-medium text-gray-700">Equipment</th>
                                <th className="text-left py-2 px-3 font-medium text-gray-700">Actual Duration (hours)</th>
                                <th className="text-left py-2 px-3 font-medium text-gray-700">Rate/Hour (Rs)</th>
                                <th className="text-left py-2 px-3 font-medium text-gray-700">Actual Cost (Rs)</th>
                              </tr>
                            </thead>
                            <tbody>
                              {equipmentData.map((equipment, index) => (
                                <tr key={equipment.id || index} className="border-b border-green-200">
                                  <td className="py-2 px-3 font-medium text-gray-900">{equipment.name}</td>
                                  <td className="py-2 px-3">
                                    <Input
                                      type="number"
                                      step="0.5"
                                      min="0"
                                      value={equipment.actualDuration || ''}
                                      onChange={(e) => updateEquipmentDuration(equipment.id, parseFloat(e.target.value) || 0)}
                                      className="w-20"
                                    />
                                  </td>
                                  <td className="py-2 px-3">Rs {equipment.costPerHour}</td>
                                  <td className="py-2 px-3 font-medium text-green-600">
                                    Rs {equipment.actualCost?.toLocaleString()}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>

                          {/* Total Equipment Cost */}
                          <div className="mt-4 pt-4 border-t border-green-300">
                            <div className="flex justify-between items-center">
                              <span className="font-medium text-gray-900">Total Equipment Cost:</span>
                              <span className="text-lg font-bold text-green-600">
                                Rs {equipmentData.reduce((sum, eq) => sum + (eq.actualCost || 0), 0).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>
                
                {/* Notes Tab */}
                <TabsContent value="notes" className="h-full">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Work Package Notes</h3>

                    {notesData.map((note, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="block text-sm font-medium text-gray-700">
                            Note {index + 1}
                          </label>
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
                        <Textarea
                          value={note}
                          onChange={(e) => {
                            const updatedNotes = [...notesData]
                            updatedNotes[index] = e.target.value
                            setNotesData(updatedNotes)
                          }}
                          placeholder="Enter your notes here..."
                          rows={3}
                          className="w-full"
                        />
                      </div>
                    ))}

                    <Button
                      type="button"
                      onClick={() => setNotesData(prev => [...prev, ''])}
                      variant="outline"
                      className="w-full border-dashed"
                    >
                      + Add Another Note
                    </Button>
                  </div>
                </TabsContent>

                {/* Attachments Tab */}
                <TabsContent value="attachments" className="h-full">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Work Package Attachments</h3>

                    <AttachmentUploader
                      files={attachmentFiles}
                      onFilesChange={setAttachmentFiles}
                      maxFiles={10}
                      maxFileSize={50 * 1024 * 1024} // 50MB
                      acceptedFileTypes={[
                        'image/*',
                        'application/pdf',
                        '.doc,.docx',
                        '.xls,.xlsx',
                        '.txt'
                      ]}
                    />
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
                      Save Work Package
                    </>
                  )}
                </Button>
              </div>
            </Tabs>
          </form>
        </Form>
      </div>
    </div>
  )
}
