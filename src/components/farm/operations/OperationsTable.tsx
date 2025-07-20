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
  status: string
  plannedStartDate: string
  plannedEndDate: string
  actualStartDate: string | null
  actualEndDate: string | null
  area: number
  estimatedCost: number
  actualCost: number
  progress: number
  workPackages: WorkPackage[]
}

interface WorkPackage {
  id: string
  date: string
  area: number
  hours: number
  cost: number
  crew: string
  equipment: string
  status: string
}

interface OperationsTableProps {
  data: Operation[]
  perspective: Perspective
  searchQuery: string
}

const columnHelper = createColumnHelper<Operation>()

export function OperationsTable({ data, perspective, searchQuery }: OperationsTableProps) {
  const { setCurrentScreen, setCurrentOperationId, setCurrentWorkPackageId } = useBlocContext()
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
    setCurrentOperationId(operation.id)
    setCurrentScreen('operation-form')
  }

  const handleEditWorkPackage = (workPackage: WorkPackage, operationId: string) => {
    setCurrentOperationId(operationId)
    setCurrentWorkPackageId(workPackage.id)
    setCurrentScreen('work-package-form')
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
          id: 'method',
          header: 'Method / Date',
          cell: ({ row }) => {
            const isWorkPackage = row.depth > 0
            if (isWorkPackage) {
              return (
                <div className="text-sm pl-4">
                  {(row.original as any).work_date || (row.original as any).workDate || 'N/A'}
                </div>
              )
            }
            return (
              <div className="text-sm">
                {(row.original as any).method || 'Manual'}
              </div>
            )
          }
        }),
        columnHelper.display({
          id: 'mainProduct',
          header: 'Main Product / Area',
          cell: ({ row }) => {
            const isWorkPackage = row.depth > 0
            if (isWorkPackage) {
              return (
                <div className="text-sm pl-4">
                  {((row.original as any).area || (row.original as any).actual_area_hectares || 0).toFixed(1)} ha
                </div>
              )
            }
            return (
              <div className="text-sm">
                {row.original.workPackages?.[0]?.equipment || 'NPK Fertilizer'}
              </div>
            )
          }
        }),
        columnHelper.accessor('area', {
          header: 'Bloc Area / Status',
          cell: ({ getValue, row }) => {
            const isWorkPackage = row.depth > 0
            if (isWorkPackage) {
              return (
                <div className="text-sm pl-4">
                  <Badge variant="outline" className={getStatusColor(row.original.status)}>
                    {row.original.status}
                  </Badge>
                </div>
              )
            }
            return getValue().toFixed(1)
          }
        }),
        columnHelper.accessor('progress', {
          header: 'Progress (%)',
          cell: ({ getValue, row }) => {
            // Calculate progress as % of work packages area completed vs bloc area
            const completedArea = row.original.workPackages
              ?.filter(wp => wp.status === 'completed')
              ?.reduce((sum, wp) => sum + (wp.area || 0), 0) || 0
            const totalArea = row.original.area || 1
            const progressPercent = Math.round((completedArea / totalArea) * 100)

            return (
              <div className="w-20">
                <Progress value={progressPercent} className="h-2" />
                <div className="text-xs text-center mt-1">{progressPercent}%</div>
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
          cell: ({ row }) => (
            <div className="text-sm">
              {row.original.workPackages?.map(wp => wp.equipment).filter(Boolean).join(', ') ||
               'Tractor, Planter, Spreader'}
            </div>
          )
        }),
        columnHelper.display({
          id: 'equipmentEffort',
          header: 'Equipment Effort',
          cell: ({ row }) => (
            <div className="text-sm">
              {row.original.workPackages?.reduce((acc, wp) => acc + (wp.hours || 8), 0) || 24}h
            </div>
          )
        }),
        columnHelper.display({
          id: 'labourEffort',
          header: 'Labour Effort (Total Est.)',
          cell: ({ row }) => (
            <div className="text-sm">
              {row.original.workPackages?.reduce((acc, wp) => acc + (wp.hours || 8), 0) || 32}h
              <div className="text-xs text-muted-foreground">
                Rs {((row.original.estimatedCost || 0) * 0.3).toLocaleString()}
              </div>
            </div>
          )
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
        header: 'Est. Product Cost',
        cell: ({ row }) => {
          const productCost = (row.original.estimatedCost || 0) * 0.4 // 40% for products
          return `Rs ${productCost.toLocaleString()}`
        }
      }),
      columnHelper.display({
        id: 'estEquipmentCost',
        header: 'Est. Equipment Cost',
        cell: ({ row }) => {
          const equipmentCost = (row.original.estimatedCost || 0) * 0.35 // 35% for equipment
          return `Rs ${equipmentCost.toLocaleString()}`
        }
      }),
      columnHelper.display({
        id: 'estLabourCost',
        header: 'Est. Labour Cost',
        cell: ({ row }) => {
          const labourCost = (row.original.estimatedCost || 0) * 0.25 // 25% for labour
          return `Rs ${labourCost.toLocaleString()}`
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
      </Table>
    </div>
  )
}
