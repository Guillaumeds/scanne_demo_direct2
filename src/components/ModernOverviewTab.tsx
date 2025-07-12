'use client'

import { useState } from 'react'
import { ModernOverviewTable } from '@/components/tables/ModernOverviewTable'
import { ModernOperationsForm } from '@/components/forms/ModernOperationsForm'
import { ModernWorkPackageForm } from '@/components/forms/ModernWorkPackageForm'
import { FormLayout } from '@/components/layouts/FormLayout'
import { PageTransition } from '@/components/ui/page-transition'
import { ContentSwitcher } from '@/components/ui/ContentSwitcher'
import { BlocOverviewNode, ProductNode, WorkPackageNode } from '@/types/operationsOverview'

interface ModernOverviewTabProps {
  data: BlocOverviewNode[]
  activeCycleInfo: any
  onDataUpdate: (data: BlocOverviewNode[]) => void
}

export default function ModernOverviewTab({ 
  data, 
  activeCycleInfo, 
  onDataUpdate 
}: ModernOverviewTabProps) {
  const [currentView, setCurrentView] = useState<'operations' | 'resources' | 'financial'>('operations')
  const [editingOperation, setEditingOperation] = useState<ProductNode | null>(null)
  const [editingWorkPackage, setEditingWorkPackage] = useState<{
    workPackage: WorkPackageNode
    blocId: string
    productId: string
  } | null>(null)

  // Form mode state
  const [formMode, setFormMode] = useState<'table' | 'operation-form' | 'workpackage-form'>('table')

  const handleEditOperation = (operation: ProductNode) => {
    setEditingOperation(operation)
    setFormMode('operation-form')
  }

  const handleAddOperation = (blocId: string) => {
    // Create a new empty operation (like original table)
    const newOperation: ProductNode = {
      id: `operation_${Date.now()}`,
      product_name: '', // Empty - user will click to select operation
      days_after_planting: 0,
      planned_start_date: '', // Empty
      planned_end_date: '', // Empty
      planned_rate: 0, // Empty
      method: '', // Empty
      progress: 0,
      est_product_cost: 0,
      est_resource_cost: 0,
      act_product_cost: 0,
      act_resource_cost: 0,
      status: 'planned',
      work_packages: []
    }

    // Add to data
    const updatedData = data.map(bloc => {
      if (bloc.id === blocId) {
        return {
          ...bloc,
          products: [...(bloc.products || []), newOperation]
        }
      }
      return bloc
    })

    onDataUpdate(updatedData)
    // Don't open form - just add empty line like original table
  }

  const handleAddWorkPackage = (blocId: string, productId: string) => {
    // Find the product to get its operation name
    const product = data
      .find(bloc => bloc.id === blocId)
      ?.products?.find(p => p.id === productId)

    // Create a new empty work package (like original table)
    const newWorkPackage: WorkPackageNode = {
      id: `workpackage_${Date.now()}`,
      days_after_planting: 0,
      date: '', // Empty
      area: 0, // Empty
      rate: 0, // Empty
      quantity: 0, // Empty
      status: 'not-started',
      operationName: product?.product_name || '' // Set operation name from parent product
    }

    // Add to data
    const updatedData = data.map(bloc => {
      if (bloc.id === blocId) {
        return {
          ...bloc,
          products: bloc.products?.map(product => {
            if (product.id === productId) {
              return {
                ...product,
                work_packages: [...(product.work_packages || []), newWorkPackage]
              }
            }
            return product
          })
        }
      }
      return bloc
    })

    onDataUpdate(updatedData)
    // Don't open form - just add empty line like original table
  }

  const handleEditWorkPackage = (workPackage: WorkPackageNode, blocId: string, productId: string) => {
    setEditingWorkPackage({ workPackage, blocId, productId })
    setFormMode('workpackage-form')
  }

  const handleDeleteOperation = (blocId: string, productId: string) => {
    const updatedData = data.map(bloc => {
      if (bloc.id === blocId) {
        return {
          ...bloc,
          products: bloc.products?.filter(product => product.id !== productId) || []
        }
      }
      return bloc
    })

    onDataUpdate(updatedData)
  }

  const handleDeleteWorkPackage = (blocId: string, productId: string, workPackageId: string) => {
    const updatedData = data.map(bloc => {
      if (bloc.id === blocId) {
        const updatedProducts = bloc.products?.map(product => {
          if (product.id === productId) {
            return {
              ...product,
              work_packages: product.work_packages?.filter(wp => wp.id !== workPackageId) || []
            }
          }
          return product
        }) || []

        return { ...bloc, products: updatedProducts }
      }
      return bloc
    })

    onDataUpdate(updatedData)
  }

  const handleOperationSave = async (operationData: any) => {
    console.log('💾 Saving operation:', operationData)
    
    // Update the operation in the data
    if (editingOperation) {
      const updatedData = data.map(bloc => ({
        ...bloc,
        products: bloc.products?.map(p =>
          p.id === editingOperation.id ? {
            ...p,
            product_name: operationData.operationName,
            operation_type: operationData.operationType,
            method: operationData.method,
            planned_start_date: operationData.plannedStartDate,
            planned_end_date: operationData.plannedEndDate,
            actual_start_date: operationData.actualStartDate,
            actual_end_date: operationData.actualEndDate,
            planned_area: operationData.plannedArea,
            actual_area: operationData.actualArea,
            planned_quantity: operationData.plannedQuantity,
            actual_quantity: operationData.actualQuantity,
            status: operationData.status,
            estimated_total_cost: operationData.estimatedTotalCost,
            actual_total_cost: operationData.actualTotalCost,
            actual_revenue: operationData.actualRevenue,
            notes: operationData.notes,
            // Save the products data and equipment data from the form
            productsData: operationData.products || [],
            equipmentData: operationData.equipment || [],
            // Update operation name in all work packages
            work_packages: p.work_packages?.map(wp => ({
              ...wp,
              operationName: operationData.operationName
            }))
          } : p
        )
      }))
      
      onDataUpdate(updatedData)
    }

    setFormMode('table')
    setEditingOperation(null)
  }

  const handleWorkPackageSave = async (workPackageData: any) => {
    console.log('💾 Saving work package:', workPackageData)

    // Update the work package in the data
    if (editingWorkPackage) {
      const updatedData = data.map(bloc =>
        bloc.id === editingWorkPackage.blocId ? {
          ...bloc,
          products: bloc.products?.map(product =>
            product.id === editingWorkPackage.productId ? {
              ...product,
              work_packages: product.work_packages?.map(wp =>
                wp.id === editingWorkPackage.workPackage.id ? {
                  ...wp,
                  name: workPackageData.workPackageName,
                  date: workPackageData.date,
                  start_time: workPackageData.startTime,
                  end_time: workPackageData.endTime,
                  duration: workPackageData.duration,
                  planned_area: workPackageData.plannedArea,
                  actual_area: workPackageData.actualArea,
                  planned_quantity: workPackageData.plannedQuantity,
                  actual_quantity: workPackageData.actualQuantity,
                  rate: workPackageData.rate,
                  actual_rate: workPackageData.actualRate,
                  status: workPackageData.status,
                  notes: workPackageData.notes,
                  actualProducts: workPackageData.actualProducts || [],
                  actualEquipment: workPackageData.actualEquipment || [],
                  actualResources: workPackageData.actualResources || []
                } : wp
              )
            } : product
          )
        } : bloc
      )
      
      onDataUpdate(updatedData)
    }

    setFormMode('table')
    setEditingWorkPackage(null)
  }

  const handleBack = () => {
    setFormMode('table')
    setEditingOperation(null)
    setEditingWorkPackage(null)
  }

  const handleUpdateField = (blocId: string, productId: string, field: string, value: any) => {
    console.log('🔄 Updating field:', { blocId, productId, field, value })
    
    const updatedData = data.map(bloc =>
      bloc.id === blocId ? {
        ...bloc,
        products: bloc.products?.map(product =>
          product.id === productId ? {
            ...product,
            [field]: value
          } : product
        )
      } : bloc
    )
    
    onDataUpdate(updatedData)
  }

  const handleUpdateWorkPackageField = (
    blocId: string,
    productId: string,
    workPackageId: string,
    field: string,
    value: any
  ) => {
    console.log('🔄 Updating work package field:', { blocId, productId, workPackageId, field, value })
    
    const updatedData = data.map(bloc =>
      bloc.id === blocId ? {
        ...bloc,
        products: bloc.products?.map(product =>
          product.id === productId ? {
            ...product,
            work_packages: product.work_packages?.map(wp =>
              wp.id === workPackageId ? {
                ...wp,
                [field]: value
              } : wp
            )
          } : product
        )
      } : bloc
    )
    
    onDataUpdate(updatedData)
  }

  // Get breadcrumbs based on current form
  const getBreadcrumbs = () => {
    const baseBreadcrumbs = [
      { label: data[0]?.name || 'Bloc' },
      { label: 'Crop Management' }
    ]

    if (formMode === 'operation-form' && editingOperation) {
      return [
        ...baseBreadcrumbs,
        { label: editingOperation.product_name || 'Field Operation' }
      ]
    }

    if (formMode === 'workpackage-form' && editingWorkPackage) {
      const operation = data
        .find(bloc => bloc.id === editingWorkPackage.blocId)
        ?.products?.find(product => product.id === editingWorkPackage.productId)

      const workPackageDate = editingWorkPackage.workPackage.date
      const formattedDate = workPackageDate
        ? new Date(workPackageDate).toLocaleDateString('en-GB', {
            weekday: 'long',
            day: 'numeric',
            month: 'short',
            year: 'numeric'
          })
        : 'Daily Work Package'

      return [
        ...baseBreadcrumbs,
        { label: operation?.product_name || 'Field Operation' },
        { label: `Daily Work Package: ${formattedDate}` }
      ]
    }

    return baseBreadcrumbs
  }

  // Render based on current mode
  if (formMode === 'operation-form' && editingOperation) {
    return (
      <PageTransition key="operation-form">
        <FormLayout
          title="Field Operation"
          breadcrumbs={getBreadcrumbs()}
          onBack={handleBack}
        >
          <ModernOperationsForm
            operation={editingOperation}
            onSave={handleOperationSave}
            onCancel={handleBack}
            blocArea={5.2}
          />
        </FormLayout>
      </PageTransition>
    )
  }

  if (formMode === 'workpackage-form' && editingWorkPackage) {
    return (
      <PageTransition key="workpackage-form">
        <FormLayout
          title="Daily Work Package"
          breadcrumbs={getBreadcrumbs()}
          onBack={handleBack}
        >
          <ModernWorkPackageForm
            workPackage={editingWorkPackage.workPackage}
            operationId={editingWorkPackage.productId}
            onSave={handleWorkPackageSave}
            onCancel={handleBack}
          />
        </FormLayout>
      </PageTransition>
    )
  }

  // Default table view
  return (
    <PageTransition key="table-view">
      <div className="flex flex-col h-full p-6">
        {/* View Switcher */}
        <div className="flex-shrink-0 mb-6">
          <ContentSwitcher
            currentView={currentView}
            onViewChange={(viewId) => setCurrentView(viewId as 'operations' | 'resources' | 'financial')}
            views={[
              { id: 'operations', name: 'Operations', icon: 'settings' },
              { id: 'resources', name: 'Resources', icon: 'resources' },
              { id: 'financial', name: 'Financial', icon: 'currency' }
            ]}
          />
        </div>

        {/* Modern Table - Allow it to expand and scroll */}
        <div className="flex-1 min-h-0">
          <ModernOverviewTable
            data={data}
            currentView={currentView}
            onEditOperation={handleEditOperation}
            onEditWorkPackage={handleEditWorkPackage}
            onUpdateField={handleUpdateField}
            onUpdateWorkPackageField={handleUpdateWorkPackageField}
            onAddOperation={handleAddOperation}
            onAddWorkPackage={handleAddWorkPackage}
            onDeleteOperation={handleDeleteOperation}
            onDeleteWorkPackage={handleDeleteWorkPackage}
            readOnly={false}
          />
        </div>
      </div>
    </PageTransition>
  )
}
