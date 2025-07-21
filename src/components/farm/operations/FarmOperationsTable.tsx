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

type Perspective = 'operations' | 'resources' | 'financial'

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

interface BlocData {
  id: string
  name: string
  area: number
  operations: Operation[]
  completedOperations: number
  totalOperations: number
  completedWorkPackages: number
  totalWorkPackages: number
}

interface FarmOperationsTableProps {
  data: BlocData[]
  perspective: Perspective
  searchQuery: string
}

// Create a hierarchical structure for the table
type TableRow = BlocData | (Operation & { subRows?: WorkPackage[] }) | WorkPackage

const columnHelper = createColumnHelper<TableRow>()

export function FarmOperationsTable({ data, perspective, searchQuery }: FarmOperationsTableProps) {
  const [expanded, setExpanded] = useState<ExpandedState>({})

  const handleEditOperation = (operation: any) => {
    console.log('Edit operation:', operation)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200'
      case 'in-progress': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'planned': return 'bg-gray-100 text-gray-800 border-gray-200'
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  // Transform data to hierarchical structure for TanStack Table
  const hierarchicalData = useMemo(() => {
    return data.map(bloc => ({
      ...bloc,
      subRows: bloc.operations.map(operation => ({
        ...operation,
        subRows: operation.workPackages
      }))
    })) as TableRow[]
  }, [data])

  // Type guard functions
  const isBlocData = (row: TableRow): row is BlocData => {
    return 'operations' in row && 'completedOperations' in row
  }

  const isOperation = (row: TableRow): row is Operation => {
    return 'operationType' in row && 'workPackages' in row && !('operations' in row)
  }

  const isWorkPackage = (row: TableRow): row is WorkPackage => {
    return 'work_date' in row || ('date' in row && !('operationType' in row))
  }

  const columns = useMemo(() => {
    const baseColumns = [
      columnHelper.display({
        id: 'expander',
        header: '',
        size: 50,
        cell: ({ row }) => {
          // Always show expand button for bloc rows (depth 0), even if no operations
          // Show expand button for operation rows (depth 1) only if they have work packages
          const shouldShowExpander = row.depth === 0 || (row.depth === 1 && row.getCanExpand())

          if (!shouldShowExpander) return null

          return (
            <Button
              variant="ghost"
              size="sm"
              onClick={row.getToggleExpandedHandler()}
              className="h-6 w-6 p-0"
            >
              {row.getIsExpanded() ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          )
        }
      }),
      columnHelper.display({
        id: 'name',
        header: 'Name / Type',
        cell: ({ row }) => {
          const paddingClass = row.depth === 0 ? '' : row.depth === 1 ? 'pl-6' : 'pl-12'

          if (row.depth === 0 && isBlocData(row.original)) {
            // Bloc level
            const bloc = row.original
            return (
              <div className={`flex items-center gap-2 ${paddingClass}`}>
                <div>
                  <div className="font-medium text-lg">{bloc.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {bloc.area.toFixed(2)} ha • {bloc.completedOperations}/{bloc.totalOperations} operations
                  </div>
                </div>
              </div>
            )
          }

          if (row.depth === 1 && isOperation(row.original)) {
            // Operation level
            const operation = row.original
            return (
              <div className={`flex items-center gap-2 ${paddingClass}`}>
                <div>
                  <div className="font-medium">{operation.type}</div>
                  <Badge variant="outline" className={getStatusColor(operation.status)}>
                    {operation.status}
                  </Badge>
                </div>
              </div>
            )
          }

          if (isWorkPackage(row.original)) {
            // Work package level
            const workPackage = row.original
            return (
              <div className={`flex items-center gap-2 ${paddingClass}`}>
                <div>
                  <div className="text-sm font-medium">Work Package</div>
                  <Badge variant="outline" className={getStatusColor(workPackage.status)}>
                    {workPackage.status}
                  </Badge>
                </div>
              </div>
            )
          }

          return <div>Unknown row type</div>
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
            if (row.depth === 0) return <div className="text-sm text-muted-foreground">-</div>
            if (row.depth === 1 && isOperation(row.original)) {
              const operation = row.original
              return (
                <div className="text-sm font-medium">
                  {operation.operationType?.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()) || 'Unknown'}
                </div>
              )
            }
            return <div className="text-sm text-muted-foreground">Work Package</div>
          }
        }),
        columnHelper.display({
          id: 'method',
          header: 'Method',
          cell: ({ row }) => {
            if (row.depth === 0) return <div className="text-sm text-muted-foreground">-</div>
            if (row.depth === 1 && isOperation(row.original)) {
              const operation = row.original
              return <div className="text-sm">{operation.method || 'Not specified'}</div>
            }
            return <div className="text-sm text-muted-foreground">-</div>
          }
        }),
        columnHelper.display({
          id: 'productName',
          header: 'Product Name',
          cell: ({ row }) => {
            if (row.depth === 0) return <div className="text-sm text-muted-foreground">-</div>
            if (row.depth === 1 && isOperation(row.original)) {
              const operation = row.original
              return <div className="text-sm">{operation.mainProduct || 'No product'}</div>
            }
            return <div className="text-sm text-muted-foreground">-</div>
          }
        }),
        columnHelper.display({
          id: 'dateRange',
          header: 'Date Range',
          cell: ({ row }) => {
            if (row.depth === 0) return <div className="text-sm text-muted-foreground">-</div>
            if (row.depth === 1 && isOperation(row.original)) {
              const operation = row.original
              const startDate = operation.plannedStartDate
              const endDate = operation.plannedEndDate
              return (
                <div className="text-sm">
                  {startDate && endDate ? `${startDate} - ${endDate}` : 'No dates'}
                </div>
              )
            }
            // Work package
            if (isWorkPackage(row.original)) {
              const workPackage = row.original
              return (
                <div className="text-sm">
                  {workPackage.date || workPackage.work_date || 'No date'}
                </div>
              )
            }
            return <div className="text-sm text-muted-foreground">-</div>
          }
        }),
        columnHelper.display({
          id: 'area',
          header: 'Area',
          cell: ({ row }) => {
            if (row.depth === 0 && isBlocData(row.original)) {
              const bloc = row.original
              return <div className="text-sm font-medium">{bloc.area.toFixed(2)} ha</div>
            }
            if (row.depth === 1 && isOperation(row.original)) {
              const operation = row.original
              return <div className="text-sm">{operation.blocArea.toFixed(2)} ha</div>
            }
            // Work package
            if (isWorkPackage(row.original)) {
              const workPackage = row.original
              return <div className="text-sm">{workPackage.area.toFixed(2)} ha</div>
            }
            return <div className="text-sm text-muted-foreground">-</div>
          }
        }),
        columnHelper.display({
          id: 'progress',
          header: 'Progress / Status',
          cell: ({ row }) => {
            if (row.depth === 0 && isBlocData(row.original)) {
              const bloc = row.original
              const progressPercent = bloc.totalOperations > 0 ?
                Math.round((bloc.completedOperations / bloc.totalOperations) * 100) : 0
              return (
                <div className="text-sm">
                  <div className="flex items-center gap-2">
                    <Progress value={progressPercent} className="w-16 h-2" />
                    <span className="text-xs">{progressPercent}%</span>
                  </div>
                </div>
              )
            }
            if (row.depth === 1 && isOperation(row.original)) {
              const operation = row.original
              const completedArea = operation.workPackages
                ?.filter(wp => wp.status === 'completed')
                ?.reduce((sum, wp) => sum + (wp.area || 0), 0) || 0
              const totalArea = operation.blocArea || 1
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
            // Work package - show status
            if (isWorkPackage(row.original)) {
              const workPackage = row.original
              return (
                <Badge variant="outline" className={getStatusColor(workPackage.status)}>
                  {workPackage.status}
                </Badge>
              )
            }
            return <div className="text-sm text-muted-foreground">-</div>
          }
        }),
        columnHelper.display({
          id: 'actions',
          header: 'Actions',
          cell: ({ row }) => {
            if (row.depth === 1) {
              return (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEditOperation(row.original)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              )
            }
            return null
          }
        })
      ]
    }

    // Add other perspectives (resources, financial) here if needed
    return baseColumns
  }, [perspective])

  const table = useReactTable({
    data: hierarchicalData,
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
    getSubRows: (row) => {
      if (isBlocData(row)) {
        // Always return an array for blocs, even if operations is empty
        // This ensures blocs are always considered expandable
        return (row.operations || []).map(op => ({ ...op, subRows: op.workPackages || [] })) as TableRow[]
      }
      if (isOperation(row)) {
        return (row.workPackages || []) as TableRow[]
      }
      return undefined
    },
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
                row.depth === 0 ? 'bg-muted/10 font-medium' : 
                row.depth === 1 ? 'bg-muted/5' : 
                'bg-muted/20'
              }`}
            >
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
