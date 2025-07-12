'use client'

import React, { useState } from 'react'
import { ModernBlocScreen } from '@/components/bloc/ModernBlocScreen'
import ModernOverviewTab from '@/components/ModernOverviewTab'
import { ModernOperationsForm } from '@/components/forms/ModernOperationsForm'
import { ModernWorkPackageForm } from '@/components/forms/ModernWorkPackageForm'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Icon } from '@/components/ui/icon'
import { DrawnArea } from '@/types/drawnArea'
import { BlocOverviewNode } from '@/types/operationsOverview'

// Mock data for testing
const mockBloc: DrawnArea = {
  uuid: 'test-bloc-uuid',
  localId: 'B001',
  name: 'Test Bloc Alpha',
  area: 12.5,
  coordinates: [
    [57.5, -20.1],
    [57.51, -20.1],
    [57.51, -20.11],
    [57.5, -20.11],
    [57.5, -20.1]
  ],
  color: '#10b981',
  isVisible: true,
  isSelected: false
}

const mockOperationsData: BlocOverviewNode[] = [
  {
    id: 'bloc-1',
    name: 'Test Bloc Alpha',
    area_hectares: 12.5,
    cycle_number: [1],
    variety_name: 'NCo 376',
    planned_harvest_date: '2024-08-15',
    expected_yield_tons_ha: 80,
    growth_stage: 'tillering',
    progress: 65,
    total_est_product_cost: 15000,
    total_est_resource_cost: 8000,
    total_act_product_cost: 12000,
    total_act_resource_cost: 7500,
    cycle_type: 'plantation',
    planting_date: '2024-02-01',
    products: [
      {
        id: 'op-1',
        product_name: 'Land Preparation',
        days_after_planting: 0,
        planned_start_date: '2024-01-15',
        planned_end_date: '2024-01-30',
        planned_rate: 1.0,
        method: 'Mechanical plowing',
        progress: 100,
        est_product_cost: 3000,
        est_resource_cost: 2000,
        act_product_cost: 2800,
        act_resource_cost: 1900,
        status: 'completed',
        work_packages: [
          {
            id: 'wp-1',
            days_after_planting: 0,
            date: '2024-01-15',
            area: 12.5,
            rate: 1.0,
            quantity: 100,
            status: 'complete',
            operationName: 'Land Preparation'
          }
        ]
      },
      {
        id: 'op-2',
        product_name: 'Planting',
        days_after_planting: 15,
        planned_start_date: '2024-02-01',
        planned_end_date: '2024-02-15',
        planned_rate: 2.5,
        method: 'Manual planting',
        progress: 75,
        est_product_cost: 5000,
        est_resource_cost: 3000,
        act_product_cost: 4800,
        act_resource_cost: 2900,
        status: 'in-progress',
        work_packages: [
          {
            id: 'wp-2',
            days_after_planting: 15,
            date: '2024-02-01',
            area: 6.0,
            rate: 2.5,
            quantity: 150,
            status: 'complete',
            operationName: 'Planting'
          },
          {
            id: 'wp-3',
            days_after_planting: 20,
            date: '2024-02-06',
            area: 6.5,
            rate: 2.5,
            quantity: 162,
            status: 'in-progress',
            operationName: 'Planting'
          }
        ]
      }
    ]
  }
]

type ComponentView = 'bloc-screen' | 'overview-tab' | 'operations-form' | 'workpackage-form'

export default function TestModernPage() {
  const [currentView, setCurrentView] = useState<ComponentView>('bloc-screen')
  const [showBlocScreen, setShowBlocScreen] = useState(false)

  const handleBlocBack = () => {
    setShowBlocScreen(false)
  }

  const handleOperationSave = async (data: any) => {
    console.log('💾 Operation saved:', data)
    alert('Operation saved successfully!')
  }

  const handleWorkPackageSave = async (data: any) => {
    console.log('💾 Work package saved:', data)
    alert('Work package saved successfully!')
  }

  const handleDataUpdate = (data: BlocOverviewNode[]) => {
    console.log('📊 Data updated:', data)
  }

  if (showBlocScreen) {
    return (
      <div className="h-screen">
        <ModernBlocScreen
          bloc={mockBloc}
          onBack={handleBlocBack}
          onDelete={() => alert('Delete bloc functionality')}
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 mb-2">
                🧪 Modern Components Test Lab
              </h1>
              <p className="text-slate-600">
                Preview and test all the new modern UI components before migration
              </p>
            </div>
            <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">
              Development Preview
            </Badge>
          </div>
        </div>

        {/* Component Selector */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="settings" className="text-emerald-600" />
              Component Selector
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button
                variant={currentView === 'bloc-screen' ? 'default' : 'outline'}
                onClick={() => setShowBlocScreen(true)}
                className="h-auto p-4 flex flex-col items-center gap-2"
              >
                <Icon name="location" size="lg" />
                <div className="text-center">
                  <div className="font-medium">Bloc Screen</div>
                  <div className="text-xs text-slate-600">Full screen experience</div>
                </div>
              </Button>

              <Button
                variant={currentView === 'overview-tab' ? 'default' : 'outline'}
                onClick={() => setCurrentView('overview-tab')}
                className="h-auto p-4 flex flex-col items-center gap-2"
              >
                <Icon name="overview" size="lg" />
                <div className="text-center">
                  <div className="font-medium">Overview Tab</div>
                  <div className="text-xs text-slate-600">Operations table</div>
                </div>
              </Button>

              <Button
                variant={currentView === 'operations-form' ? 'default' : 'outline'}
                onClick={() => setCurrentView('operations-form')}
                className="h-auto p-4 flex flex-col items-center gap-2"
              >
                <Icon name="settings" size="lg" />
                <div className="text-center">
                  <div className="font-medium">Operations Form</div>
                  <div className="text-xs text-slate-600">Field operations</div>
                </div>
              </Button>

              <Button
                variant={currentView === 'workpackage-form' ? 'default' : 'outline'}
                onClick={() => setCurrentView('workpackage-form')}
                className="h-auto p-4 flex flex-col items-center gap-2"
              >
                <Icon name="calendar" size="lg" />
                <div className="text-center">
                  <div className="font-medium">Work Package</div>
                  <div className="text-xs text-slate-600">Daily work</div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Component Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="view" className="text-blue-600" />
              Component Preview
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              {currentView === 'overview-tab' && (
                <div className="h-[600px]">
                  <ModernOverviewTab
                    data={mockOperationsData}
                    activeCycleInfo={{
                      uuid: 'cycle-1',
                      variety_name: 'NCo 376',
                      cycle_number: 1,
                      cycle_type: 'plantation',
                      planting_date: '2024-02-01',
                      planned_harvest_date: '2024-08-15',
                      growth_stage: 'tillering'
                    }}
                    onDataUpdate={handleDataUpdate}
                  />
                </div>
              )}

              {currentView === 'operations-form' && (
                <div className="h-[600px]">
                  <ModernOperationsForm
                    operation={mockOperationsData[0].products?.[0]}
                    onSave={handleOperationSave}
                    onCancel={() => alert('Form cancelled')}
                    blocArea={5.2}
                  />
                </div>
              )}

              {currentView === 'workpackage-form' && (
                <div className="h-[600px]">
                  <ModernWorkPackageForm
                    workPackage={mockOperationsData[0].products?.[0]?.work_packages?.[0]}
                    operationId="op-1"
                    onSave={handleWorkPackageSave}
                    onCancel={() => alert('Form cancelled')}
                  />
                </div>
              )}

              {currentView === 'bloc-screen' && (
                <div className="p-8 text-center">
                  <Icon name="location" size="xl" className="mx-auto mb-4 text-slate-400" />
                  <h3 className="text-lg font-medium text-slate-900 mb-2">
                    Full Bloc Screen Experience
                  </h3>
                  <p className="text-slate-600 mb-4">
                    Click the "Bloc Screen" button above to open the full modern bloc screen experience.
                  </p>
                  <Button 
                    onClick={() => setShowBlocScreen(true)}
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
                    <Icon name="view" size="sm" className="mr-2" />
                    Open Bloc Screen
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Feature Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="info" className="text-blue-600" />
              What's New in Modern Components
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-slate-900 mb-3">🎨 Design Improvements</h4>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li className="flex items-center gap-2">
                    <Icon name="confirm" size="sm" className="text-emerald-600" />
                    Consistent Emerald/Slate color palette
                  </li>
                  <li className="flex items-center gap-2">
                    <Icon name="confirm" size="sm" className="text-emerald-600" />
                    Professional Lucide React icons
                  </li>
                  <li className="flex items-center gap-2">
                    <Icon name="confirm" size="sm" className="text-emerald-600" />
                    Smooth Framer Motion animations
                  </li>
                  <li className="flex items-center gap-2">
                    <Icon name="confirm" size="sm" className="text-emerald-600" />
                    Responsive Shadcn/UI components
                  </li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium text-slate-900 mb-3">⚡ Technical Improvements</h4>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li className="flex items-center gap-2">
                    <Icon name="confirm" size="sm" className="text-emerald-600" />
                    React Hook Form with Zod validation
                  </li>
                  <li className="flex items-center gap-2">
                    <Icon name="confirm" size="sm" className="text-emerald-600" />
                    TanStack Table for advanced tables
                  </li>
                  <li className="flex items-center gap-2">
                    <Icon name="confirm" size="sm" className="text-emerald-600" />
                    Context-driven navigation state
                  </li>
                  <li className="flex items-center gap-2">
                    <Icon name="confirm" size="sm" className="text-emerald-600" />
                    Comprehensive TypeScript types
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* URL Testing Instructions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="settings" className="text-purple-600" />
              URL Testing Parameters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-slate-100 rounded-lg p-4">
              <p className="text-sm text-slate-700 mb-3">
                You can also test components by adding URL parameters:
              </p>
              <div className="space-y-2 text-sm font-mono">
                <div><code>?modernBloc=true</code> - Enable modern bloc screen</div>
                <div><code>?modernOverview=true</code> - Enable modern overview tab</div>
                <div><code>?modernForms=true</code> - Enable modern forms</div>
                <div><code>?modernAll=true</code> - Enable all modern components</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
