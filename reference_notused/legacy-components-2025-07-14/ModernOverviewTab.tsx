'use client'

import React, { useState } from 'react'
import { BlocOverviewNode, ProductNode, WorkPackageNode } from '@/types/operationsOverview'
import { ContentSwitcher } from '@/components/ui/ContentSwitcher'
import { ModernOverviewTable } from '@/components/tables/ModernOverviewTable'
import { ModernOperationsForm } from '@/components/forms/ModernOperationsForm'
import { ModernWorkPackageForm } from '@/components/forms/ModernWorkPackageForm'

interface ModernOverviewTabProps {
  data: BlocOverviewNode[]
  activeCycleInfo: any
  onDataUpdate: (updatedData: BlocOverviewNode[]) => void
}

type ViewMode = 'table' | 'operation-form' | 'work-package-form'
type CurrentView = 'operations' | 'resources' | 'financial'

export default function ModernOverviewTab({
  data,
  activeCycleInfo,
  onDataUpdate
}: ModernOverviewTabProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('table')
  const [currentView, setCurrentView] = useState<CurrentView>('operations')
  const [editingOperation, setEditingOperation] = useState<ProductNode | null>(null)
  const [editingWorkPackage, setEditingWorkPackage] = useState<{
    workPackage: WorkPackageNode
    blocId: string
    productId: string
  } | null>(null)

  // Content switcher views
  const views = [
    { id: 'operations', name: 'Operations', icon: 'settings' as const },
    { id: 'resources', name: 'Resources', icon: 'user' as const },
    { id: 'financial', name: 'Financial', icon: 'currency' as const }
  ]

  // Handle editing operations
  const handleEditOperation = (operation: ProductNode) => {
    setEditingOperation(operation)
    setViewMode('operation-form')
  }

  // Handle editing work packages
  const handleEditWorkPackage = (workPackage: WorkPackageNode, blocId: string, productId: string) => {
    setEditingWorkPackage({ workPackage, blocId, productId })
    setViewMode('work-package-form')
  }

  // Handle operation form save
  const handleOperationSave = async (formData: any) => {
    // Update the data with the new operation data
    const updatedData = data.map(bloc => ({
      ...bloc,
      products: bloc.products?.map(product =>
        product.id === editingOperation?.id
          ? { ...product, ...formData }
          : product
      ) || []
    }))
    
    onDataUpdate(updatedData)
    setViewMode('table')
    setEditingOperation(null)
  }

  // Handle work package form save
  const handleWorkPackageSave = async (formData: any) => {
    if (!editingWorkPackage) return

    // Update the data with the new work package data
    const updatedData = data.map(bloc => 
      bloc.id === editingWorkPackage.blocId
        ? {
            ...bloc,
            products: bloc.products?.map(product =>
              product.id === editingWorkPackage.productId
                ? {
                    ...product,
                    work_packages: product.work_packages?.map(wp =>
                      wp.id === editingWorkPackage.workPackage.id
                        ? { ...wp, ...formData }
                        : wp
                    ) || []
                  }
                : product
            ) || []
          }
        : bloc
    )
    
    onDataUpdate(updatedData)
    setViewMode('table')
    setEditingWorkPackage(null)
  }

  // Handle form cancellation
  const handleCancel = () => {
    setViewMode('table')
    setEditingOperation(null)
    setEditingWorkPackage(null)
  }

  // Handle field updates directly in table
  const handleUpdateField = (blocId: string, productId: string, field: string, value: any) => {
    const updatedData = data.map(bloc =>
      bloc.id === blocId
        ? {
            ...bloc,
            products: bloc.products?.map(product =>
              product.id === productId
                ? { ...product, [field]: value }
                : product
            ) || []
          }
        : bloc
    )
    onDataUpdate(updatedData)
  }

  // Handle work package field updates directly in table
  const handleUpdateWorkPackageField = (
    blocId: string,
    productId: string,
    workPackageId: string,
    field: string,
    value: any
  ) => {
    const updatedData = data.map(bloc =>
      bloc.id === blocId
        ? {
            ...bloc,
            products: bloc.products?.map(product =>
              product.id === productId
                ? {
                    ...product,
                    work_packages: product.work_packages?.map(wp =>
                      wp.id === workPackageId
                        ? { ...wp, [field]: value }
                        : wp
                    ) || []
                  }
                : product
            ) || []
          }
        : bloc
    )
    onDataUpdate(updatedData)
  }

  // Render based on current view mode
  if (viewMode === 'operation-form' && editingOperation) {
    return (
      <ModernOperationsForm
        operation={editingOperation}
        onSave={handleOperationSave}
        onCancel={handleCancel}
        blocArea={data[0]?.area_hectares || 0}
      />
    )
  }

  if (viewMode === 'work-package-form' && editingWorkPackage) {
    return (
      <ModernWorkPackageForm
        workPackage={editingWorkPackage.workPackage}
        operationId={editingWorkPackage.productId}
        onSave={handleWorkPackageSave}
        onCancel={handleCancel}
      />
    )
  }

  // Default table view
  return (
    <div className="h-full flex flex-col">
      {/* Content Switcher */}
      <div className="flex-shrink-0 p-4 border-b border-slate-200">
        <ContentSwitcher
          currentView={currentView}
          onViewChange={(viewId) => setCurrentView(viewId as CurrentView)}
          views={views}
          data-testid="content-switcher"
        />
      </div>

      {/* Table Content */}
      <div className="flex-1 overflow-hidden">
        <ModernOverviewTable
          data={data}
          currentView={currentView}
          onEditOperation={handleEditOperation}
          onEditWorkPackage={handleEditWorkPackage}
          onUpdateField={handleUpdateField}
          onUpdateWorkPackageField={handleUpdateWorkPackageField}
          readOnly={false}
        />
      </div>
    </div>
  )
}
