'use client'

import React, { useState, useMemo } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getExpandedRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  createColumnHelper,
  ExpandedState
} from '@tanstack/react-table'
import { ChevronDown, ChevronRight, Edit } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useBlocContext } from '../contexts/BlocContext'

type Perspective = 'operations' | 'resources' | 'financial'

interface Operation {
  id: string
  type: string
  operationType: string
  method: string
  mainProduct: string
  status: string
  plannedStartDate: string
  plannedEndDate: string
  actualStartDate: string | null
  actualEndDate: string | null
  area: number
  blocArea: number
  estimatedCost: number
  actualCost: number
  progress: number
  equipmentNames: string
  equipmentEffort: number
  labourEffort: number
  estimatedProductCost: number
  estimatedEquipmentCost: number
  estimatedLabourCost: number
  products: any[]
  equipment: any[]
  labour: any[]
  workPackages: WorkPackage[]
}

interface WorkPackage {
  id: string
  work_date: string
  date: string
  area: number
  hours: number
  cost: number
  status: string
  products: any[]
  equipment: any[]
  labour: any[]
  productActualCost: number
  equipmentActualCost: number
  labourActualCost: number
  equipmentEffort: number
  labourEffort: number
}

interface OperationsTableProps {
  data: Operation[]
  perspective: Perspective
  searchQuery: string
  footerTotals?: {
    totalEstimatedCost: number
    totalActualCost: number
    totalEstimatedRevenue: number
    totalActualRevenue: number
    profitPercent: number
  }
  // Configuration for reusability
  showBlocColumn?: boolean  // Show bloc name column
  groupByBloc?: boolean     // Group operations by bloc with headers
  // Optional handlers for context-free usage
  onEditOperation?: (operation: Operation) => void
  onEditWorkPackage?: (workPackage: WorkPackage, operationId: string) => void
}

const columnHelper = createColumnHelper<Operation>()

export function OperationsTable({
  data,
  perspective,
  searchQuery,
  footerTotals,
  showBlocColumn = false,
  groupByBloc = false,
  onEditOperation,
  onEditWorkPackage
}: OperationsTableProps) {
  // Try to use BlocContext, but don't crash if it's not available
  let blocContext = null
  try {
    blocContext = useBlocContext()
  } catch (error) {
    // Context not available - that's okay for farm view
    blocContext = null
  }

  const [expanded, setExpanded] = useState<ExpandedState>({})

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800'
      case 'planned':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })
  }

  const handleEditOperation = (operation: Operation) => {
    if (onEditOperation) {
      // Farm view: use prop handler
      onEditOperation(operation)
    } else if (blocContext) {
      // Bloc view: use context
      blocContext.setCurrentOperationId(operation.id)
      blocContext.setCurrentScreen('operation-form')
    }
  }

  const handleEditWorkPackage = (workPackage: WorkPackage, operationId: string) => {
    if (onEditWorkPackage) {
      // Farm view: use prop handler
      onEditWorkPackage(workPackage, operationId)
    } else if (blocContext) {
      // Bloc view: use context
      blocContext.setCurrentOperationId(operationId)
      blocContext.setCurrentWorkPackageId(workPackage.id)
      blocContext.setCurrentScreen('work-package-form')
    }
  }

  // Define columns based on perspective
  const columns = useMemo(() => {
    const baseColumns = [
      columnHelper.display({
        id: 'expander',
        header: '',
        cell: ({ row }) => (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => row.toggleExpanded()}
            className="h-6 w-6 p-0"
          >
            {row.getIsExpanded() ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        ),
        size: 40
      }),
      // Conditionally add bloc column
      ...(showBlocColumn ? [
        columnHelper.display({
          id: 'bloc',
          header: 'Bloc',
          cell: ({ row }) => {
            const isWorkPackage = row.depth > 0
            if (isWorkPackage) {
              return <div className="text-sm text-muted-foreground pl-4">-</div>
            }
            return (
              <div className="text-sm font-medium">
                {(row.original as any).blocName || 'Unknown Bloc'}
              </div>
            )
          }
        })
      ] : []),
      columnHelper.accessor('type', {
        header: 'Operation',
        cell: ({ row }) => {
          // Check if this is a work package row (sub-row)
          const isWorkPackage = row.depth > 0

          if (isWorkPackage) {
            // Work package display
            return (
              <div className="flex items-center gap-2 pl-4">
                <div>
                  <div className="font-medium text-sm">Work Package - {(row.original as any).work_date || (row.original as any).workDate || 'N/A'}</div>
                  <Badge variant="outline" className={getStatusColor(row.original.status)}>
                    {row.original.status}
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEditWorkPackage(row.original as any, (row.getParentRow()?.original as any)?.id)}
                  className="h-6 w-6 p-0 ml-2"
                >
                  <Edit className="h-3 w-3" />
                </Button>
              </div>
            )
          }

          // Operation display
          return (
            <div className="flex items-center gap-2">
              <div>
                <div className="font-medium">{row.original.type}</div>
                <Badge variant="outline" className={getStatusColor(row.original.status)}>
                  {row.original.status}
                </Badge>
              </div>
            </div>
          )
        }
      })
    ]

    if (perspective === 'operations') {
      return [
        ...baseColumns,
        columnHelper.display({
          id: 'operationType',
          header: 'Operation Type',
          cell: ({ row }) => {
            const isWorkPackage = row.depth > 0
            if (isWorkPackage) {
              return (
                <div className="text-sm pl-4 text-muted-foreground">
                  Work Package
                </div>
              )
            }
            return (
              <div className="text-sm font-medium">
                {(row.original as any).operationType?.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()) || 'Unknown'}
              </div>
            )
          }
        }),
        columnHelper.display({
          id: 'method',
          header: 'Method',
          cell: ({ row }) => {
            const isWorkPackage = row.depth > 0
            if (isWorkPackage) {
              return (
                <div className="text-sm pl-4 text-muted-foreground">
                  -
                </div>
              )
            }
            return (
              <div className="text-sm">
                {(row.original as any).method || 'Not specified'}
              </div>
            )
          }
        }),
        columnHelper.display({
          id: 'productName',
          header: 'Product Name',
          cell: ({ row }) => {
            const isWorkPackage = row.depth > 0
            if (isWorkPackage) {
              return (
                <div className="text-sm pl-4 text-muted-foreground">
                  -
                </div>
              )
            }
            return (
              <div className="text-sm">
                {(row.original as any).mainProduct || 'No product'}
              </div>
            )
          }
        }),
        columnHelper.display({
          id: 'dateRange',
          header: 'Date Range',
          cell: ({ row }) => {
            const isWorkPackage = row.depth > 0
            if (isWorkPackage) {
              return (
                <div className="text-sm pl-4">
                  {(row.original as any).date || (row.original as any).work_date || 'No date'}
                </div>
              )
            }
            const startDate = (row.original as any).plannedStartDate
            const endDate = (row.original as any).plannedEndDate
            return (
              <div className="text-sm">
                {startDate && endDate ? `${startDate} - ${endDate}` : 'No dates'}
              </div>
            )
          }
        }),
        columnHelper.display({
          id: 'blocArea',
          header: 'Bloc Area',
          cell: ({ row }) => {
            const isWorkPackage = row.depth > 0
            if (isWorkPackage) {
              return (
                <div className="text-sm pl-4">
                  {((row.original as any).area || 0).toFixed(2)} ha
                </div>
              )
            }
            return (
              <div className="text-sm">
                {((row.original as any).blocArea || 0).toFixed(2)} ha
              </div>
            )
          }
        }),
        columnHelper.display({
          id: 'progress',
          header: 'Progress',
          cell: ({ row }) => {
            const isWorkPackage = row.depth > 0
            if (isWorkPackage) {
              return <div className="text-sm pl-4">-</div>
            }
            // Calculate progress as % of work packages area completed vs bloc area
            const completedArea = row.original.workPackages
              ?.filter((wp: any) => wp.status === 'completed')
              ?.reduce((sum: number, wp: any) => sum + (wp.area || 0), 0) || 0
            const totalArea = (row.original as any).blocArea || 1
            const progressPercent = Math.round((completedArea / totalArea) * 100)

            return (
              <div className="text-sm">
                <div className="flex items-center gap-2">
                  <Progress value={progressPercent} className="w-16 h-2" />
                  <span className="text-xs">{progressPercent}%</span>
                </div>
              </div>
            )
          }
        }),
        columnHelper.display({
          id: 'actions',
          header: 'Actions',
          cell: ({ row }) => (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleEditOperation(row.original)}
            >
              <Edit className="h-4 w-4" />
            </Button>
          )
        })
      ]
    }

    if (perspective === 'resources') {
      return [
        ...baseColumns,
        columnHelper.display({
          id: 'equipment',
          header: 'Equipment',
          cell: ({ row }) => {
            const isWorkPackage = row.depth > 0
            if (isWorkPackage) {
              const equipmentNames = (row.original as any).equipment?.map((e: any) => e.name).join(', ') || 'No Equipment'
              return (
                <div className="text-sm pl-4">
                  {equipmentNames}
                </div>
              )
            }
            return (
              <div className="text-sm">
                {(row.original as any).equipmentNames || 'No Equipment'}
              </div>
            )
          }
        }),
        columnHelper.display({
          id: 'equipmentEffort',
          header: 'Equipment Effort',
          cell: ({ row }) => {
            const isWorkPackage = row.depth > 0
            if (isWorkPackage) {
              return (
                <div className="text-sm pl-4">
                  {((row.original as any).equipmentEffort || 0).toFixed(1)}h
                </div>
              )
            }
            return (
              <div className="text-sm">
                {((row.original as any).equipmentEffort || 0).toFixed(1)}h
              </div>
            )
          }
        }),
        columnHelper.display({
          id: 'labourEffort',
          header: 'Labour Effort (Total Est.)',
          cell: ({ row }) => {
            const isWorkPackage = row.depth > 0
            if (isWorkPackage) {
              return (
                <div className="text-sm pl-4">
                  {((row.original as any).labourEffort || 0).toFixed(1)}h
                </div>
              )
            }
            return (
              <div className="text-sm">
                {((row.original as any).labourEffort || 0).toFixed(1)}h
                <div className="text-xs text-muted-foreground">
                  Rs {((row.original as any).estimatedLabourCost || 0).toLocaleString()}
                </div>
              </div>
            )
          }
        }),
        columnHelper.display({
          id: 'actions',
          header: 'Actions',
          cell: ({ row }) => (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleEditOperation(row.original)}
            >
              <Edit className="h-4 w-4" />
            </Button>
          )
        })
      ]
    }

    // Financial perspective
    return [
      ...baseColumns,
      columnHelper.display({
        id: 'estimateProductCost',
        header: 'Est. Product Cost / Product Act Cost',
        cell: ({ row }) => {
          const isWorkPackage = row.depth > 0
          if (isWorkPackage) {
            return (
              <div className="text-sm pl-4">
                Rs {((row.original as any).productActualCost || 0).toLocaleString()}
              </div>
            )
          }
          return (
            <div className="text-sm">
              Rs {((row.original as any).estimatedProductCost || 0).toLocaleString()}
            </div>
          )
        }
      }),
      columnHelper.display({
        id: 'estEquipmentCost',
        header: 'Est. Equipment Cost / Equipment Act Cost',
        cell: ({ row }) => {
          const isWorkPackage = row.depth > 0
          if (isWorkPackage) {
            return (
              <div className="text-sm pl-4">
                Rs {((row.original as any).equipmentActualCost || 0).toLocaleString()}
              </div>
            )
          }
          return (
            <div className="text-sm">
              Rs {((row.original as any).estimatedEquipmentCost || 0).toLocaleString()}
            </div>
          )
        }
      }),
      columnHelper.display({
        id: 'estLabourCost',
        header: 'Est. Labour Cost / Labour Act Cost',
        cell: ({ row }) => {
          const isWorkPackage = row.depth > 0
          if (isWorkPackage) {
            return (
              <div className="text-sm pl-4">
                Rs {((row.original as any).labourActualCost || 0).toLocaleString()}
              </div>
            )
          }
          return (
            <div className="text-sm">
              Rs {((row.original as any).estimatedLabourCost || 0).toLocaleString()}
            </div>
          )
        }
      }),
      columnHelper.display({
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEditOperation(row.original)}
          >
            <Edit className="h-4 w-4" />
          </Button>
        )
      })
    ]
  }, [perspective])

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      expanded,
      globalFilter: searchQuery
    },
    onExpandedChange: setExpanded,
    getSubRows: (row) => row.workPackages as any,
  })

  return (
    <div className="h-full overflow-auto">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id} style={{ width: header.getSize() }}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow
              key={row.id}
              className={`hover:bg-muted/50 ${
                row.depth > 0 ? 'bg-muted/20' : ''
              }`}
            >
              {row.getVisibleCells().map((cell) => (
                <TableCell 
                  key={cell.id}
                  className={row.depth > 0 ? 'pl-12' : ''}
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
        {footerTotals && (
          <tfoot>
            <tr className="border-t-2 border-primary bg-muted/30">
              <td colSpan={table.getHeaderGroups()[0]?.headers.length || 6} className="p-4">
                <div className="flex justify-between items-center text-sm font-medium">
                  <div className="flex gap-6">
                    <div>
                      <span className="text-muted-foreground">Total Est. Cost: </span>
                      <span className="text-foreground">Rs {footerTotals.totalEstimatedCost.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Total Act. Cost: </span>
                      <span className="text-foreground">Rs {footerTotals.totalActualCost.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Total Est. Revenue: </span>
                      <span className="text-green-600">Rs {footerTotals.totalEstimatedRevenue.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Total Act. Revenue: </span>
                      <span className="text-green-600">Rs {footerTotals.totalActualRevenue.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-muted-foreground">Profit %: </span>
                    <span className={`font-bold ${footerTotals.profitPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {footerTotals.profitPercent.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </td>
            </tr>
          </tfoot>
        )}
      </Table>
    </div>
  )
}
