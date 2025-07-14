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

  // Handle updating fields directly in the table
  const handleUpdateField = (
    blocId: string,
    productId: string,
    field: string,
    value: any
  ) => {
    const updatedData = data.map(bloc => {
      if (bloc.id === blocId) {
        return {
          ...bloc,
          products: bloc.products?.map(product => {
            if (product.id === productId) {
              return { ...product, [field]: value }
            }
            return product
          })
        }
      }
      return bloc
    })
    onDataUpdate(updatedData)
  }

  // Handle updating work package fields
  const handleUpdateWorkPackageField = (
    blocId: string,
    productId: string,
    workPackageId: string,
    field: string,
    value: any
  ) => {
    const updatedData = data.map(bloc => {
      if (bloc.id === blocId) {
        return {
          ...bloc,
          products: bloc.products?.map(product => {
            if (product.id === productId) {
              return {
                ...product,
                work_packages: product.work_packages?.map(wp => {
                  if (wp.id === workPackageId) {
                    return { ...wp, [field]: value }
                  }
                  return wp
                })
              }
            }
            return product
          })
        }
      }
      return bloc
    })
    onDataUpdate(updatedData)
  }

  // Handle form submissions
  const handleOperationSave = (operationData: any) => {
    console.log('Saving operation:', operationData)
    setViewMode('table')
    setEditingOperation(null)
  }

  const handleWorkPackageSave = (workPackageData: any) => {
    console.log('Saving work package:', workPackageData)
    setViewMode('table')
    setEditingWorkPackage(null)
  }

  const handleCancel = () => {
    setViewMode('table')
    setEditingOperation(null)
    setEditingWorkPackage(null)
  }

  // Operation form view
  if (viewMode === 'operation-form') {
    return (
      <div className="h-full">
        <ModernOperationsForm
          operation={editingOperation}
          activeCycleInfo={activeCycleInfo}
          onSave={handleOperationSave}
          onCancel={handleCancel}
        />
      </div>
    )
  }

  // Work package form view
  if (viewMode === 'work-package-form') {
    return (
      <div className="h-full">
        <ModernWorkPackageForm
          workPackage={editingWorkPackage?.workPackage || null}
          blocId={editingWorkPackage?.blocId || ''}
          productId={editingWorkPackage?.productId || ''}
          activeCycleInfo={activeCycleInfo}
          onSave={handleWorkPackageSave}
          onCancel={handleCancel}
        />
      </div>
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
