'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Icon, IconButton } from '@/components/ui/icon'
import { Card } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { Trash2, ChevronRight, ChevronDown } from 'lucide-react'
import { BlocOverviewNode, ProductNode, WorkPackageNode, WorkPackageStatus } from '@/types/operationsOverview'

interface ModernOverviewTableProps {
  data: BlocOverviewNode[]
  currentView: 'operations' | 'resources' | 'financial'
  onEditOperation: (operation: ProductNode) => void
  onEditWorkPackage: (workPackage: WorkPackageNode, blocId: string, productId: string) => void
  onUpdateField: (blocId: string, productId: string, field: string, value: any) => void
  onUpdateWorkPackageField: (
    blocId: string,
    productId: string,
    workPackageId: string,
    field: string,
    value: any
  ) => void
  onAddOperation?: (blocId: string) => void
  onAddWorkPackage?: (blocId: string, productId: string) => void
  onDeleteOperation?: (blocId: string, productId: string) => void
  onDeleteWorkPackage?: (blocId: string, productId: string, workPackageId: string) => void
  readOnly?: boolean
}

// Expanded mock operations for multi-select testing
const MOCK_OPERATIONS = [
  'Land Preparation',
  'Planting',
  'Fertilizer Application',
  'Irrigation',
  'Pest Control',
  'Weed Control',
  'Harvesting',
  'Transportation',
  'Soil Testing',
  'Seed Treatment',
  'Mulching',
  'Pruning',
  'Disease Control',
  'Nutrient Management',
  'Water Management',
  'Equipment Maintenance',
  'Field Monitoring',
  'Quality Control',
  'Post-Harvest Processing',
  'Storage Management'
]

// Resource types for consistent calculations
const RESOURCE_TYPES = [
  { name: 'Supervisor', ratePerHour: 500 },
  { name: 'Permanent Male', ratePerHour: 300 },
  { name: 'Permanent Female', ratePerHour: 250 },
  { name: 'Contract Male', ratePerHour: 350 },
  { name: 'Contract Female', ratePerHour: 280 }
]

// Color scheme constants
const DEFAULT_COLORS = {
  bloc: {
    background: 'bg-blue-50',
    border: 'border-blue-200',
    header: 'bg-blue-100',
    titleBox: 'bg-blue-100'
  },
  product: {
    background: 'bg-green-50',
    border: 'border-green-200',
    hover: 'hover:bg-green-100',
    header: 'bg-green-100',
    titleBox: 'bg-green-100'
  },
  workPackage: {
    background: 'bg-gray-50',
    border: 'border-gray-200',
    hover: 'hover:bg-gray-100',
    header: 'bg-gray-100',
    titleBox: 'bg-gray-100'
  }
}

// Column definitions for each view
const columnViews = {
  operations: {
    node2: [
      { key: 'operation', label: 'Operation', width: 'w-32' },
      { key: 'method', label: 'Method', width: 'w-24' },
      { key: 'product', label: 'Product', width: 'w-28' },
      { key: 'start_date', label: 'Start Date', width: 'w-28' },
      { key: 'end_date', label: 'End Date', width: 'w-28' }
    ],
    node3: [
      { key: 'date', label: 'Date', width: 'w-28' },
      { key: 'area', label: 'Area (ha)', width: 'w-24' },
      { key: 'quantity', label: 'Quantity', width: 'w-24' },
      { key: 'rate', label: 'Rate', width: 'w-20' },
      { key: 'status', label: 'Status', width: 'w-16' }
    ]
  },
  resources: {
    node2: [
      { key: 'operation', label: 'Operation', width: 'w-32' },
      ...RESOURCE_TYPES.map(type => ({
        key: type.name.toLowerCase().replace(' ', '_'),
        label: `${type.name} (hrs)`,
        width: 'w-24'
      })),
      { key: 'est_equipment_duration', label: 'Est Equipment Duration (hrs)', width: 'w-32' }
    ],
    node3: [
      { key: 'date', label: 'Date', width: 'w-28' },
      ...RESOURCE_TYPES.map(type => ({
        key: type.name.toLowerCase().replace(' ', '_'),
        label: `${type.name} (hrs)`,
        width: 'w-24'
      })),
      { key: 'act_equipment_duration', label: 'Act Equipment Duration (hrs)', width: 'w-32' }
    ]
  },
  financial: {
    node2: [
      { key: 'operation', label: 'Operation', width: 'w-32' },
      { key: 'est_product_cost', label: 'Estimate Product Cost (Rs)', width: 'w-32' },
      { key: 'est_labour_cost', label: 'Estimate Labour Cost (Rs)', width: 'w-32' },
      { key: 'est_equipment_cost', label: 'Estimate Equipment Cost (Rs)', width: 'w-32' },
      { key: 'actual_revenue', label: 'Actual Revenue (Rs)', width: 'w-28' }
    ],
    node3: [
      { key: 'date', label: 'Date', width: 'w-28' },
      { key: 'act_product_cost', label: 'Act Product Cost (Rs)', width: 'w-28' },
      { key: 'act_labour_cost', label: 'Actual Labour Cost (Rs)', width: 'w-28' },
      { key: 'act_equipment_cost', label: 'Actual Equipment Cost (Rs)', width: 'w-32' }
    ]
  }
}

// Status configuration for toggle buttons
const getStatusConfig = (status: WorkPackageStatus) => {
  switch (status) {
    case 'not-started':
      return {
        icon: '○',
        label: 'Not Started',
        bg: 'bg-gray-100',
        color: 'text-gray-600',
        hover: 'hover:bg-gray-200'
      }
    case 'in-progress':
      return {
        icon: '◐',
        label: 'In Progress',
        bg: 'bg-yellow-100',
        color: 'text-yellow-600',
        hover: 'hover:bg-yellow-200'
      }
    case 'complete':
      return {
        icon: '●',
        label: 'Complete',
        bg: 'bg-green-100',
        color: 'text-green-600',
        hover: 'hover:bg-green-200'
      }
    default:
      return {
        icon: '○',
        label: 'Not Started',
        bg: 'bg-gray-100',
        color: 'text-gray-600',
        hover: 'hover:bg-gray-200'
      }
  }
}

// Status compact toggle component
const StatusCompactToggle = ({
  status,
  onChange
}: {
  status: WorkPackageStatus
  onChange: (status: WorkPackageStatus) => void
}) => {
  const config = getStatusConfig(status)
  const options: WorkPackageStatus[] = ['not-started', 'in-progress', 'complete']
  const currentIndex = options.indexOf(status)

  const nextStatus = () => {
    const nextIndex = (currentIndex + 1) % options.length
    onChange(options[nextIndex])
  }

  return (
    <button
      type="button"
      onClick={nextStatus}
      className={cn(
        'inline-flex items-center justify-center w-8 h-8 rounded-full transition-all duration-200',
        config.bg,
        config.color,
        config.hover,
        'hover:scale-110 active:scale-95 focus:outline-none'
      )}
      title={`Current: ${config.label} - Click to change`}
    >
      <span className="text-lg font-bold">{config.icon}</span>
    </button>
  )
}

// Progress bar component
const ProgressBar = ({ progress }: { progress: number }) => (
  <div className="w-full">
    <div className="flex items-center justify-between text-xs text-green-700 mb-1">
      <span>Progress</span>
      <span className="font-medium">{progress}%</span>
    </div>
    <Progress
      value={progress}
      className="h-2 bg-green-200 [&>div]:bg-green-600"
    />
  </div>
)

export function ModernOverviewTable({
  data,
  currentView,
  onEditOperation,
  onEditWorkPackage,
  onUpdateField,
  onUpdateWorkPackageField,
  onAddOperation,
  onAddWorkPackage,
  onDeleteOperation,
  onDeleteWorkPackage,
  readOnly = false
}: ModernOverviewTableProps) {
  const [expandedProducts, setExpandedProducts] = useState<Set<string>>(new Set())

  // Auto-expansion logic (like original table)
  useEffect(() => {
    const newExpandedProducts = new Set<string>()

    data.forEach(bloc => {
      bloc.products?.forEach(product => {
        // If product has no work packages, auto-expand to show add work package button
        if (!product.work_packages || product.work_packages.length === 0) {
          newExpandedProducts.add(product.id)
        }
      })
    })

    // Only update if there are new expansions (never auto-collapse)
    if (Array.from(newExpandedProducts).some(id => !expandedProducts.has(id))) {
      setExpandedProducts(prev => {
        const newSet = new Set(prev)
        newExpandedProducts.forEach(id => newSet.add(id))
        return newSet
      })
    }
  }, [data, expandedProducts])

  // Toggle product expansion
  const toggleProductExpansion = (productId: string) => {
    setExpandedProducts(prev => {
      const newSet = new Set(prev)
      if (newSet.has(productId)) {
        newSet.delete(productId)
      } else {
        newSet.add(productId)
      }
      return newSet
    })
  }

  // Calculate progress for a product
  const calculateProductProgress = (product: ProductNode, blocArea: number): number => {
    if (!product.work_packages || product.work_packages.length === 0) return 0

    const completedPackages = product.work_packages.filter(wp => wp.status === 'complete').length
    const totalPackages = product.work_packages.length

    if (totalPackages === 0) return 0
    return Math.round((completedPackages / totalPackages) * 100)
  }

  // Get financial data for work package
  const getWorkPackageFinancialData = (workPackage: WorkPackageNode, operation?: ProductNode) => {
    const productCost = (workPackage.quantity || 0) * (workPackage.rate || 0)
    const labourCost = RESOURCE_TYPES.reduce((total, type) => {
      const key = type.name.toLowerCase().replace(' ', '_')
      const hours = (workPackage as any)[key] || 0
      return total + (hours * type.ratePerHour)
    }, 0)
    const equipmentCost = ((workPackage as any).act_equipment_duration || 0) * 100

    return {
      act_product_cost: productCost,
      act_labour_cost: labourCost,
      act_equipment_cost: equipmentCost
    }
  }

  // Get financial data for product/operation
  const getFinancialData = (product: ProductNode, isEstimate: boolean = true) => {
    // This would come from actual data - for now return mock structure
    return {
      actual_revenue: 0 // Will be calculated from actual data
    }
  }

  // Format currency
  const formatCurrency = (value: number) => `Rs ${value.toLocaleString()}`

  // Format date
  const formatDate = (dateString: string): string => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  // Section header component (like original table)
  const SectionHeader = ({
    title,
    onAdd,
    colorScheme = 'green'
  }: {
    title: string
    onAdd?: () => void
    colorScheme?: 'blue' | 'green' | 'gray'
  }) => (
    <div className={cn(
      'rounded-lg p-4 border',
      colorScheme === 'blue' && 'bg-blue-100 border-blue-200',
      colorScheme === 'green' && 'bg-green-100 border-green-200',
      colorScheme === 'gray' && 'bg-gray-100 border-gray-200'
    )}>
      <div className="flex justify-between items-center">
        <h3 className={cn(
          'text-lg font-semibold',
          colorScheme === 'blue' && 'text-blue-900',
          colorScheme === 'green' && 'text-green-900',
          colorScheme === 'gray' && 'text-gray-900'
        )}>
          {title}
        </h3>
        {onAdd && (
          <button
            type="button"
            title={`Add ${title.includes('Operations') ? 'Operation' : 'Work Package'}`}
            onClick={onAdd}
            className={cn(
              'p-2 rounded hover:bg-opacity-80',
              colorScheme === 'blue' && 'hover:bg-blue-200 text-blue-700',
              colorScheme === 'green' && 'hover:bg-green-200 text-green-700',
              colorScheme === 'gray' && 'hover:bg-gray-200 text-gray-700'
            )}
          >
            <Icon name="add" size="sm" />
          </button>
        )}
      </div>
    </div>
  )

  // Work package header component (like original table)
  const WorkPackageHeader = ({
    productId,
    onAddWorkPackage
  }: {
    productId: string
    onAddWorkPackage?: (productId: string) => void
  }) => (
    <div className="bg-gray-100 border-b border-gray-300 px-3 py-2 ml-3 mr-3 mt-3 rounded-t-lg flex justify-between items-center">
      <h4 className="text-sm font-semibold text-gray-900">Daily Work Packages</h4>
      {onAddWorkPackage && (
        <button
          type="button"
          title="Add Work Package"
          onClick={() => onAddWorkPackage(productId)}
          className="p-1 hover:bg-gray-200 rounded text-gray-700"
        >
          <Icon name="add" size="sm" />
        </button>
      )}
    </div>
  )

  // Render editable cell
  const renderEditableCell = (
    value: any,
    onChange: (value: any) => void,
    type: 'text' | 'number' | 'date' = 'text'
  ) => {
    return (
      <Input
        type={type}
        value={value || ''}
        onChange={(e) => {
          const newValue = type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value
          onChange(newValue)
        }}
        className="h-8 text-sm border-0 bg-transparent hover:bg-slate-50 focus:bg-white focus:border-slate-300"
      />
    )
  }

  // Render dynamic headers for tables
  const renderDynamicHeaders = (level: 'node2' | 'node3', colorClass: string) => {
    const columns = columnViews[currentView][level]
    return columns.map((column) => (
      <TableHead
        key={column.key}
        className={cn(
          'text-left text-xs font-medium uppercase tracking-wider',
          colorClass,
          column.width
        )}
      >
        {column.label}
      </TableHead>
    ))
  }

  // Render cell content based on view and column
  const renderCellContent = (
    item: ProductNode | WorkPackageNode,
    column: any,
    blocId: string,
    productId?: string
  ) => {
    const isProduct = 'product_name' in item
    const isWorkPackage = !isProduct

    switch (column.key) {
      case 'operation':
        if (isProduct) {
          return readOnly ? (
            <span className="text-green-800 text-xs truncate">
              {item.product_name || 'Select operation...'}
            </span>
          ) : (
            <Select
              value={item.product_name || ''}
              onValueChange={(value) => onUpdateField(blocId, item.id, 'product_name', value)}
            >
              <SelectTrigger className="h-7 text-xs border-0 shadow-none p-1 min-w-[120px]">
                <SelectValue placeholder="Select operation..." />
              </SelectTrigger>
              <SelectContent>
                {MOCK_OPERATIONS.map((operation) => (
                  <SelectItem key={operation} value={operation} className="text-xs">
                    {operation}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )
        }
        return <span className="text-gray-600 text-xs">-</span>

      case 'method':
        if (isProduct) {
          return renderEditableCell(
            item.method,
            (value) => onUpdateField(blocId, item.id, 'method', value)
          )
        }
        return <span className="text-gray-400">-</span>

      case 'product':
        if (isProduct) {
          return (
            <span className="text-green-700 text-xs">
              {item.product_name || 'Not set'}
            </span>
          )
        }
        return <span className="text-gray-400">-</span>

      case 'start_date':
        if (isProduct) {
          return renderEditableCell(
            item.planned_start_date,
            (value) => onUpdateField(blocId, item.id, 'planned_start_date', value),
            'date'
          )
        }
        return <span className="text-gray-400">-</span>

      case 'end_date':
        if (isProduct) {
          return renderEditableCell(
            item.planned_end_date,
            (value) => onUpdateField(blocId, item.id, 'planned_end_date', value),
            'date'
          )
        }
        return <span className="text-gray-400">-</span>

      case 'date':
        if (isWorkPackage) {
          return renderEditableCell(
            item.date,
            (value) => onUpdateWorkPackageField(blocId, productId!, item.id, 'date', value),
            'date'
          )
        }
        return <span className="text-gray-400">-</span>

      case 'area':
        if (isWorkPackage) {
          return renderEditableCell(
            item.area,
            (value) => onUpdateWorkPackageField(blocId, productId!, item.id, 'area', value),
            'number'
          )
        }
        return <span className="text-gray-400">-</span>

      case 'quantity':
        if (isWorkPackage) {
          return renderEditableCell(
            item.quantity,
            (value) => onUpdateWorkPackageField(blocId, productId!, item.id, 'quantity', value),
            'number'
          )
        }
        return <span className="text-gray-400">-</span>

      case 'rate':
        if (isWorkPackage) {
          return renderEditableCell(
            item.rate,
            (value) => onUpdateWorkPackageField(blocId, productId!, item.id, 'rate', value),
            'number'
          )
        }
        return <span className="text-gray-400">-</span>

      case 'status':
        if (isWorkPackage) {
          return (
            <StatusCompactToggle
              status={item.status || 'not-started'}
              onChange={(newStatus) =>
                onUpdateWorkPackageField(blocId, productId!, item.id, 'status', newStatus)
              }
            />
          )
        }
        return <span className="text-gray-400">-</span>

      // Resource columns
      case 'supervisor':
      case 'permanent_male':
      case 'permanent_female':
      case 'contract_male':
      case 'contract_female':
        const resourceValue = (item as any)[column.key] || 0
        if (isWorkPackage) {
          return renderEditableCell(
            resourceValue,
            (value) => onUpdateWorkPackageField(blocId, productId!, item.id, column.key, value),
            'number'
          )
        }
        return <span className="text-gray-400">-</span>

      case 'est_equipment_duration':
        if (isProduct) {
          return renderEditableCell(
            (item as any).est_equipment_duration || 0,
            (value) => onUpdateField(blocId, item.id, 'est_equipment_duration', value),
            'number'
          )
        }
        return <span className="text-gray-400">-</span>

      case 'act_equipment_duration':
        if (isWorkPackage) {
          return renderEditableCell(
            (item as any).act_equipment_duration || 0,
            (value) => onUpdateWorkPackageField(blocId, productId!, item.id, 'act_equipment_duration', value),
            'number'
          )
        }
        return <span className="text-gray-400">-</span>

      // Financial columns
      case 'est_product_cost':
      case 'est_labour_cost':
      case 'est_equipment_cost':
      case 'actual_revenue':
        if (isProduct) {
          const value = (item as any)[column.key] || 0
          return (
            <span className="text-green-700 text-xs">
              {formatCurrency(value)}
            </span>
          )
        }
        return <span className="text-gray-400">-</span>

      case 'act_product_cost':
      case 'act_labour_cost':
      case 'act_equipment_cost':
        if (isWorkPackage) {
          const financialData = getWorkPackageFinancialData(item)
          const value = financialData[column.key as keyof typeof financialData] || 0
          return (
            <span className="text-gray-700 text-xs">
              {formatCurrency(value)}
            </span>
          )
        }
        return <span className="text-gray-400">-</span>

      default:
        return <span className="text-gray-400">-</span>
    }
  }

  // Render product table (Level 2)
  const renderProductTable = (bloc: BlocOverviewNode) => {
    if (!bloc.products || bloc.products.length === 0) {
      return (
        <div className="p-4 m-4">
          <div className="text-center text-gray-500">
            No field operations added yet
          </div>
        </div>
      )
    }

    return (
      <div className="m-4 bg-white shadow-sm border border-green-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className={cn(DEFAULT_COLORS.product.header, 'border-b-2', DEFAULT_COLORS.product.border)}>
              <TableRow>
                {renderDynamicHeaders('node2', 'text-green-900')}
                {currentView === 'operations' && (
                  <TableHead className="text-center text-xs font-medium text-green-900 uppercase tracking-wider w-28">
                    Progress
                  </TableHead>
                )}
                {!readOnly && (
                  <TableHead className="w-16 text-xs font-medium text-green-900 uppercase tracking-wider">Actions</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-200">
              {bloc.products.map((product) => (
                <React.Fragment key={product.id}>
                  {/* Product Row */}
                  <TableRow className={cn(DEFAULT_COLORS.product.background, DEFAULT_COLORS.product.hover, 'group')}>
                    {/* First column with expand/collapse button */}
                    <TableCell className="w-32">
                      <div className="flex items-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleProductExpansion(product.id)}
                          className="mr-1 p-1 h-6 w-6 hover:bg-green-200 rounded flex-shrink-0"
                        >
                          {expandedProducts.has(product.id) ? (
                            <ChevronDown className="h-3 w-3 text-green-700" />
                          ) : (
                            <ChevronRight className="h-3 w-3 text-green-700" />
                          )}
                        </Button>
                        {renderCellContent(product, columnViews[currentView].node2[0], bloc.id)}
                      </div>
                    </TableCell>

                    {/* Dynamic columns based on current view */}
                    {columnViews[currentView].node2.slice(1).map((column) => (
                      <TableCell key={column.key}>
                        {renderCellContent(product, column, bloc.id)}
                      </TableCell>
                    ))}

                    {/* Progress Column - only show in operations view */}
                    {currentView === 'operations' && (
                      <TableCell className="w-28">
                        <div className="flex items-center justify-center">
                          <ProgressBar progress={calculateProductProgress(product, bloc.area_hectares)} />
                        </div>
                      </TableCell>
                    )}

                    {/* Actions Column */}
                    {!readOnly && (
                      <TableCell className="w-20">
                        <div className="flex justify-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <IconButton
                            icon="edit"
                            variant="ghost"
                            size="sm"
                            onClick={() => onEditOperation(product)}
                            className="h-8 w-8 text-green-600 hover:bg-green-200"
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              if (window.confirm('Are you sure you want to delete this operation?')) {
                                onDeleteOperation?.(bloc.id, product.id)
                              }
                            }}
                            className="h-8 w-8 p-0 text-red-600 hover:bg-red-100"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>

                  {/* Nested Work Packages Table */}
                  {expandedProducts.has(product.id) && (
                    <TableRow>
                      <TableCell colSpan={readOnly ? 7 : 8} className="p-0">
                        <div className="bg-gray-25 border-l-4 border-gray-300 ml-8">
                          <WorkPackageHeader
                            productId={product.id}
                            onAddWorkPackage={onAddWorkPackage ? (productId) => onAddWorkPackage(bloc.id, productId) : undefined}
                          />
                          {renderWorkPackageTable(bloc, product)}
                          {renderProductFooterSummary(bloc, product)}
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    )
  }

  // Render Node 2 footer summary (Product level financial summary)
  const renderProductFooterSummary = (bloc: BlocOverviewNode, product: ProductNode) => {
    // Only show in financial view and when product has work packages
    if (currentView !== 'financial' || !product.work_packages || product.work_packages.length === 0) {
      return null
    }

    return (
      <div className="bg-white border-t border-black px-3 py-2">
        <div className="grid grid-cols-4 gap-3 text-sm">
          <div className="text-center">
            <div className="text-black font-medium">Total Act. Product</div>
            <div className="text-black font-bold">
              Rs {(() => {
                const total = product.work_packages?.reduce((acc, dwp) => {
                  const dwpData = getWorkPackageFinancialData(dwp, product)
                  return acc + dwpData.act_product_cost
                }, 0) || 0
                return total.toLocaleString()
              })()}
            </div>
          </div>
          <div className="text-center">
            <div className="text-black font-medium">Total Act. Labour</div>
            <div className="text-black font-bold">
              Rs {(() => {
                const total = product.work_packages?.reduce((acc, dwp) => {
                  const dwpData = getWorkPackageFinancialData(dwp, product)
                  return acc + dwpData.act_labour_cost
                }, 0) || 0
                return total.toLocaleString()
              })()}
            </div>
          </div>
          <div className="text-center">
            <div className="text-black font-medium">Total Act. Equipment</div>
            <div className="text-black font-bold">
              Rs {(() => {
                const total = product.work_packages?.reduce((acc, dwp) => {
                  const dwpData = getWorkPackageFinancialData(dwp, product)
                  return acc + dwpData.act_equipment_cost
                }, 0) || 0
                return total.toLocaleString()
              })()}
            </div>
          </div>
          <div className="text-center">
            <div className="text-black font-medium">Total Act. Cost</div>
            <div className="text-black font-bold">
              Rs {(() => {
                const total = product.work_packages?.reduce((acc, dwp) => {
                  const dwpData = getWorkPackageFinancialData(dwp, product)
                  return acc + dwpData.act_product_cost + dwpData.act_labour_cost + dwpData.act_equipment_cost
                }, 0) || 0
                return total.toLocaleString()
              })()}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Render work package table (Level 3)
  const renderWorkPackageTable = (bloc: BlocOverviewNode, product: ProductNode) => {
    if (!product.work_packages || product.work_packages.length === 0) {
      return null // Don't render anything when no work packages exist
    }

    return (
      <div className="m-3 bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className={cn(DEFAULT_COLORS.workPackage.header, 'border-b-2', DEFAULT_COLORS.workPackage.border)}>
              <TableRow>
                {renderDynamicHeaders('node3', 'text-gray-900')}
                {!readOnly && (
                  <TableHead className="w-16 text-xs font-medium text-gray-900 uppercase tracking-wider">Actions</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-200">
              {product.work_packages.map((workPackage) => (
                <TableRow key={workPackage.id} className={cn(DEFAULT_COLORS.workPackage.background, DEFAULT_COLORS.workPackage.hover, 'group')}>
                  {/* Dynamic columns based on current view */}
                  {columnViews[currentView].node3.map((column) => (
                    <TableCell key={column.key}>
                      {renderCellContent(workPackage, column, bloc.id, product.id)}
                    </TableCell>
                  ))}

                  {/* Actions Column */}
                  {!readOnly && (
                    <TableCell className="w-20">
                      <div className="flex justify-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <IconButton
                          icon="edit"
                          variant="ghost"
                          size="sm"
                          onClick={() => onEditWorkPackage(workPackage, bloc.id, product.id)}
                          className="h-8 w-8 text-gray-600 hover:bg-gray-200"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (window.confirm('Are you sure you want to delete this work package?')) {
                              onDeleteWorkPackage?.(bloc.id, product.id, workPackage.id)
                            }
                          }}
                          className="h-8 w-8 p-0 text-red-600 hover:bg-red-100"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Node 2 Footer - Work Package Footer - Only show in financial view */}
        {currentView === 'financial' && (
          <div className="bg-white border-t border-black px-3 py-2">
            <div className="grid grid-cols-4 gap-3 text-sm">
              <div className="text-center">
                <div className="text-black font-medium">Total Act. Product</div>
                <div className="text-black font-bold">
                  Rs {(() => {
                    const total = product.work_packages?.reduce((acc, dwp) => {
                      const dwpData = getWorkPackageFinancialData(dwp, product)
                      return acc + dwpData.act_product_cost
                    }, 0) || 0
                    return total.toLocaleString()
                  })()}
                </div>
              </div>
              <div className="text-center">
                <div className="text-black font-medium">Total Act. Labour</div>
                <div className="text-black font-bold">
                  Rs {(() => {
                    const total = product.work_packages?.reduce((acc, dwp) => {
                      const dwpData = getWorkPackageFinancialData(dwp, product)
                      return acc + dwpData.act_labour_cost
                    }, 0) || 0
                    return total.toLocaleString()
                  })()}
                </div>
              </div>
              <div className="text-center">
                <div className="text-black font-medium">Total Act. Equipment</div>
                <div className="text-black font-bold">
                  Rs {(() => {
                    const total = product.work_packages?.reduce((acc, dwp) => {
                      const dwpData = getWorkPackageFinancialData(dwp, product)
                      return acc + dwpData.act_equipment_cost
                    }, 0) || 0
                    return total.toLocaleString()
                  })()}
                </div>
              </div>
              <div className="text-center">
                <div className="text-black font-medium">Total Act. Cost</div>
                <div className="text-black font-bold">
                  Rs {(() => {
                    const total = product.work_packages?.reduce((acc, dwp) => {
                      const dwpData = getWorkPackageFinancialData(dwp, product)
                      return acc + dwpData.act_product_cost + dwpData.act_labour_cost + dwpData.act_equipment_cost
                    }, 0) || 0
                    return total.toLocaleString()
                  })()}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  // Check if we have any data
  if (!data || data.length === 0) {
    return (
      <Card className="p-8 text-center">
        <Icon name="overview" size="xl" className="mx-auto mb-4 text-slate-400" />
        <h3 className="text-lg font-medium text-slate-900 mb-2">No Bloc Data</h3>
        <p className="text-slate-600">Create a bloc to start managing operations.</p>
      </Card>
    )
  }

  // Check if bloc has no operations
  const hasOperations = data.some(bloc => bloc.products && bloc.products.length > 0)

  if (!hasOperations) {
    return (
      <div className="space-y-6">
        {/* Field Operations Section */}
        <SectionHeader
          title="Field Operations"
          onAdd={onAddOperation ? () => onAddOperation(data[0].id) : undefined}
          colorScheme="green"
        />

        {/* Scrollable container for empty state - Use flexible height */}
        <div className="flex-1 overflow-auto border border-gray-200 rounded-lg min-h-0">
          <div className="p-4 space-y-6">
            {/* Empty State for Operations */}
            <Card className="p-8 text-center border-2 border-dashed border-green-300 bg-green-50">
              <Icon name="settings" size="xl" className="mx-auto mb-4 text-green-400" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">No Field Operations</h3>
              <p className="text-slate-600 mb-4">
                Start by adding your first field operation to track activities and progress.
              </p>
              {!readOnly && onAddOperation && (
                <Button
                  onClick={() => onAddOperation(data[0].id)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Icon name="add" size="sm" className="mr-2" />
                  Add First Operation
                </Button>
              )}
            </Card>

            {/* Work Packages Section Header (Disabled) */}
            <div className="bg-gray-100 border border-gray-200 rounded-lg p-4 opacity-60">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Daily Work Packages</h3>
                <Button
                  size="sm"
                  variant="outline"
                  disabled
                  className="bg-gray-300 text-gray-500 cursor-not-allowed"
                >
                  <Icon name="add" size="sm" className="mr-2" />
                  Add Work Package
                </Button>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Work packages will be available after adding field operations
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Render Node 1 footer summary (Bloc level financial summary)
  const renderBlocFooterSummary = (bloc: BlocOverviewNode) => {
    return (
      <div className="bg-white border border-gray-200 rounded-lg px-3 py-2">
        <div className="grid grid-cols-5 gap-3 text-sm">
          <div className="text-center">
            <div className="text-black font-medium">Total Act. Product</div>
            <div className="text-black font-bold">
              Rs {(() => {
                const total = bloc.products?.reduce((acc, product) => {
                  const dwpTotal = product.work_packages?.reduce((dwpAcc, dwp) => {
                    const dwpData = getWorkPackageFinancialData(dwp, product)
                    return dwpAcc + dwpData.act_product_cost
                  }, 0) || 0
                  return acc + dwpTotal
                }, 0) || 0
                return total.toLocaleString()
              })()}
            </div>
          </div>
          <div className="text-center">
            <div className="text-black font-medium">Total Act. Labour</div>
            <div className="text-black font-bold">
              Rs {(() => {
                const total = bloc.products?.reduce((acc, product) => {
                  const dwpTotal = product.work_packages?.reduce((dwpAcc, dwp) => {
                    const dwpData = getWorkPackageFinancialData(dwp, product)
                    return dwpAcc + dwpData.act_labour_cost
                  }, 0) || 0
                  return acc + dwpTotal
                }, 0) || 0
                return total.toLocaleString()
              })()}
            </div>
          </div>
          <div className="text-center">
            <div className="text-black font-medium">Total Act. Equipment</div>
            <div className="text-black font-bold">
              Rs {(() => {
                const total = bloc.products?.reduce((acc, product) => {
                  const dwpTotal = product.work_packages?.reduce((dwpAcc, dwp) => {
                    const dwpData = getWorkPackageFinancialData(dwp, product)
                    return dwpAcc + dwpData.act_equipment_cost
                  }, 0) || 0
                  return acc + dwpTotal
                }, 0) || 0
                return total.toLocaleString()
              })()}
            </div>
          </div>
          <div className="text-center">
            <div className="text-black font-medium">Total Act. Cost</div>
            <div className="text-black font-bold">
              Rs {(() => {
                const total = bloc.products?.reduce((acc, product) => {
                  const dwpTotal = product.work_packages?.reduce((dwpAcc, dwp) => {
                    const dwpData = getWorkPackageFinancialData(dwp, product)
                    return dwpAcc + dwpData.act_product_cost + dwpData.act_labour_cost + dwpData.act_equipment_cost
                  }, 0) || 0
                  return acc + dwpTotal
                }, 0) || 0
                return total.toLocaleString()
              })()}
            </div>
          </div>
          <div className="text-center">
            <div className="text-black font-medium">Total Act. Revenue</div>
            <div className="text-black font-bold">
              Rs {(() => {
                const total = bloc.products?.reduce((acc, product) => {
                  const financialData = getFinancialData(product, false)
                  return acc + financialData.actual_revenue
                }, 0) || 0
                return total.toLocaleString()
              })()}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <SectionHeader
        title="Field Operations"
        onAdd={onAddOperation ? () => onAddOperation(data[0].id) : undefined}
        colorScheme="green"
      />

      {/* Scrollable table container - Use flexible height with proper scrolling */}
      <div className="flex-1 overflow-auto border border-gray-200 rounded-lg min-h-0">
        <div className="space-y-4 p-4">
          {/* Render each bloc's operations */}
          {data.map((bloc) => (
            <div key={bloc.id} className="space-y-4">
              {renderProductTable(bloc)}
            </div>
          ))}
        </div>
      </div>

      {/* Node 1 Footer - Bloc Financial Summary - Always show when data exists */}
      {data.length > 0 && (
        <div className="flex-shrink-0 mt-4">
          {renderBlocFooterSummary(data[0])}
        </div>
      )}
    </div>
  )
}
