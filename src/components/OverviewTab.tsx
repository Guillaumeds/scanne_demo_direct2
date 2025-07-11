'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { ChevronRightIcon, ChevronDownIcon, PlusIcon, TrashIcon, PencilIcon } from '@heroicons/react/24/outline'
import { useCropCycleInfo } from '@/contexts/CropCycleContext'
import { DrawnArea } from '@/types/drawnArea'
import { BlocOverviewNode, ProductNode, WorkPackageNode, WorkPackageStatus } from '@/types/operationsOverview'
import ProductSelector from '@/components/ProductSelector'
import OperationsForm from '@/components/OperationsForm'
import { Product } from '@/types/products'

// Status Badge Component
interface StatusBadgeProps {
  status: WorkPackageStatus;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getStatusConfig = (status: WorkPackageStatus) => {
    switch (status) {
      case 'not-started':
        return {
          label: 'Not Started',
          className: 'bg-gray-100 text-gray-700 border-gray-200',
          icon: '○'
        };
      case 'in-progress':
        return {
          label: 'In Progress',
          className: 'bg-blue-100 text-blue-700 border-blue-200',
          icon: '◐'
        };
      case 'complete':
        return {
          label: 'Complete',
          className: 'bg-green-100 text-green-700 border-green-200',
          icon: '●'
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full border ${config.className}`}>
      <span className="mr-1">{config.icon}</span>
      {config.label}
    </span>
  );
};

// Compact Toggle Component - Perfect for table cells
interface StatusCompactToggleProps {
  status: WorkPackageStatus;
  onChange: (status: WorkPackageStatus) => void;
}

const StatusCompactToggle: React.FC<StatusCompactToggleProps> = ({ status, onChange }) => {
  const getStatusConfig = (statusType: WorkPackageStatus) => {
    switch (statusType) {
      case 'not-started':
        return { icon: '○', color: 'text-gray-500', bg: 'bg-gray-100', hover: 'hover:bg-gray-200', label: 'Not Started' }
      case 'in-progress':
        return { icon: '◐', color: 'text-blue-600', bg: 'bg-blue-100', hover: 'hover:bg-blue-200', label: 'In Progress' }
      case 'complete':
        return { icon: '●', color: 'text-green-600', bg: 'bg-green-100', hover: 'hover:bg-green-200', label: 'Complete' }
    }
  }

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
      className={`
        inline-flex items-center justify-center w-8 h-8 rounded-full transition-all duration-200
        ${config.bg} ${config.color} ${config.hover}
        hover:scale-110 active:scale-95 focus:outline-none
      `}
      title={`Current: ${config.label} - Click to change`}
    >
      <span className="text-lg font-bold">{config.icon}</span>
    </button>
  )
};

const DEFAULT_COLORS = {
  bloc: {
    background: 'bg-blue-50',
    border: 'border-blue-200',
    hover: '', // No hover effect for node 1
    header: 'bg-blue-100', // Darker blue than table background (bg-blue-50)
    titleBox: 'bg-blue-100'
  },
  product: {
    background: 'bg-green-50',
    border: 'border-green-200',
    hover: '', // No hover effect for node 2
    header: 'bg-green-100', // Same as title box
    titleBox: 'bg-green-100'
  },
  workPackage: {
    background: 'bg-gray-50',
    border: 'border-gray-200',
    hover: 'hover:bg-gray-100', // Keep hover effect for node 3
    header: 'bg-gray-100', // Same as title box
    titleBox: 'bg-gray-100'
  }
}

interface OverviewTabProps {
  bloc: DrawnArea
  readOnly?: boolean
}

export default function OverviewTab({ bloc, readOnly = false }: OverviewTabProps) {
  const [data, setData] = useState<BlocOverviewNode[]>([])
  const [expandedBlocs, setExpandedBlocs] = useState<Set<string>>(new Set())
  const [expandedProducts, setExpandedProducts] = useState<Set<string>>(new Set())

  // Auto-expand logic for empty nodes (only expand, never auto-collapse)
  useEffect(() => {
    const newExpandedBlocs = new Set(expandedBlocs) // Start with current state
    const newExpandedProducts = new Set(expandedProducts) // Start with current state

    data.forEach(bloc => {
      // If bloc has no products (node 2 is empty), auto-expand bloc (node 1)
      if (!bloc.products || bloc.products.length === 0) {
        newExpandedBlocs.add(bloc.id)
      } else {
        // Check if any products have no work packages (node 3 is empty)
        bloc.products.forEach(product => {
          if (!product.work_packages || product.work_packages.length === 0) {
            newExpandedBlocs.add(bloc.id) // Expand bloc to show product
            newExpandedProducts.add(product.id) // Expand product to show add work package button
          }
        })
      }
    })

    // Only update if there are new expansions (never auto-collapse)
    if (Array.from(newExpandedBlocs).some(id => !expandedBlocs.has(id))) {
      setExpandedBlocs(newExpandedBlocs)
    }

    if (Array.from(newExpandedProducts).some(id => !expandedProducts.has(id))) {
      setExpandedProducts(newExpandedProducts)
    }
  }, [data]) // Only depend on data, not expansion state to avoid loops

  // Selection modal states
  const [showOperationSelector, setShowOperationSelector] = useState(false)
  const [showMethodSelector, setShowMethodSelector] = useState(false)
  const [showProductSelector, setShowProductSelector] = useState(false)
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null)

  // Operations form state
  const [showOperationsForm, setShowOperationsForm] = useState(false)
  const [editingOperation, setEditingOperation] = useState<ProductNode | null>(null)

  // Get crop cycle information
  const { activeCycle, getActiveCycleInfo } = useCropCycleInfo()
  const activeCycleInfo = getActiveCycleInfo()

  // Calculate months from planting date
  const calculateMonthsFromPlanting = (plantingDate: string | undefined): string => {
    if (!plantingDate) return '0'
    const planting = new Date(plantingDate)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - planting.getTime())
    const diffMonths = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30.44)) // Average days per month
    return diffMonths.toString()
  }

  // Format date to "3 Jan 2025" format
  const formatDate = (dateString: string): string => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  // Smart date parser - converts various formats to ISO date
  const parseSmartDate = (input: string): string => {
    if (!input.trim()) return ''

    // Try various date formats
    const formats = [
      // DD/MM/YYYY or DD/MM/YY
      /^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/,
      // DD-MM-YYYY or DD-MM-YY
      /^(\d{1,2})-(\d{1,2})-(\d{2,4})$/,
      // DD MMM YYYY (e.g., "4 Jan 2025")
      /^(\d{1,2})\s+(\w{3,})\s+(\d{4})$/,
      // MMM DD YYYY (e.g., "Jan 4 2025")
      /^(\w{3,})\s+(\d{1,2})\s+(\d{4})$/
    ]

    const monthNames = ['jan', 'feb', 'mar', 'apr', 'may', 'jun',
                       'jul', 'aug', 'sep', 'oct', 'nov', 'dec']

    // Try to parse the input
    let parsedDate: Date | null = null

    // Try direct Date parsing first
    parsedDate = new Date(input)
    if (!isNaN(parsedDate.getTime())) {
      return parsedDate.toISOString().split('T')[0]
    }

    // Try manual parsing for specific formats
    for (const format of formats) {
      const match = input.toLowerCase().match(format)
      if (match) {
        if (format.source.includes('MMM')) {
          // Handle month name formats
          if (match[2] && match[1] && match[3]) { // MMM DD YYYY
            const monthIndex = monthNames.findIndex(m => match[1].startsWith(m))
            if (monthIndex !== -1) {
              parsedDate = new Date(parseInt(match[3]), monthIndex, parseInt(match[2]))
            }
          } else if (match[1] && match[2] && match[3]) { // DD MMM YYYY
            const monthIndex = monthNames.findIndex(m => match[2].startsWith(m))
            if (monthIndex !== -1) {
              parsedDate = new Date(parseInt(match[3]), monthIndex, parseInt(match[1]))
            }
          }
        } else {
          // Handle numeric formats (DD/MM/YYYY)
          const day = parseInt(match[1])
          const month = parseInt(match[2]) - 1 // Month is 0-indexed
          let year = parseInt(match[3])
          if (year < 100) year += 2000 // Convert 2-digit year
          parsedDate = new Date(year, month, day)
        }
        break
      }
    }

    if (parsedDate && !isNaN(parsedDate.getTime())) {
      return parsedDate.toISOString().split('T')[0]
    }

    return input // Return original if parsing fails
  }

  // Mock data for selections
  const mockOperations = [
    'Land Preparation', 'Planting', 'Fertilizer Application', 'Irrigation',
    'Pest Control', 'Weed Control', 'Harvesting', 'Transportation'
  ]

  const mockMethods = [
    'Manual', 'Mechanical', 'Aerial', 'Drip', 'Sprinkler', 'Broadcast'
  ]

  const mockProducts = [
    'NPK Fertilizer', 'Urea', 'Pesticide A', 'Herbicide B', 'Seeds', 'Water'
  ]

  // Status helper functions
  const getWorkPackageStatus = (workPackage: WorkPackageNode): WorkPackageStatus => {
    // If new status field exists, use it
    if (workPackage.status) {
      return workPackage.status;
    }
    // Fallback to completed field for backward compatibility
    if (workPackage.completed) {
      return 'complete';
    }
    // Default logic: if has date/area/quantity, it's in progress, otherwise not started
    if (workPackage.date || workPackage.area > 0 || workPackage.quantity > 0) {
      return 'in-progress';
    }
    return 'not-started';
  };

  const updateWorkPackageStatus = (blocId: string, productId: string, workPackageId: string, newStatus: WorkPackageStatus) => {
    setData(prev => prev.map(bloc =>
      bloc.id === blocId
        ? {
            ...bloc,
            products: bloc.products?.map(product =>
              product.id === productId
                ? {
                    ...product,
                    work_packages: product.work_packages?.map(wp =>
                      wp.id === workPackageId
                        ? {
                            ...wp,
                            status: newStatus,
                            completed: newStatus === 'complete' // Keep backward compatibility
                          }
                        : wp
                    )
                  }
                : product
            )
          }
        : bloc
    ));
  };

  // Handle real product selection from ProductSelector
  const handleRealProductSelect = (product: Product, quantity: number, rate: number, actualCost?: number) => {
    if (selectedProductId) {
      setData(prev => prev.map(bloc => ({
        ...bloc,
        products: bloc.products?.map(p =>
          p.id === selectedProductId ? {
            ...p,
            product_name: product.name,
            planned_rate: rate
          } : p
        )
      })))
    }
    setShowProductSelector(false)
    setSelectedProductId(null)
  };

  // Calculate progress based on completed work package areas
  const calculateProductProgress = (product: ProductNode, blocArea: number) => {
    if (!product.work_packages || product.work_packages.length === 0) {
      return 0
    }

    // Sum up areas from completed work packages only
    const completedArea = product.work_packages
      .filter(wp => getWorkPackageStatus(wp) === 'complete')
      .reduce((sum, wp) => sum + (wp.area || 0), 0)

    // Calculate percentage based on bloc area (assuming product covers full bloc)
    const progressPercentage = blocArea > 0 ? Math.min((completedArea / blocArea) * 100, 100) : 0
    return Math.round(progressPercentage)
  }

  // Handle operations form
  const handleEditOperation = (operation: ProductNode) => {
    console.log('✏️ Editing operation:', operation.id, operation.product_name)
    setEditingOperation(operation)
    setShowOperationsForm(true)
  };

  const handleOperationSave = async (operationData: any) => {
    console.log('💾 Saving operation:', operationData)

    // Update the operation in the data
    if (editingOperation) {
      setData(prev => prev.map(bloc => ({
        ...bloc,
        products: bloc.products?.map(p =>
          p.id === editingOperation.id ? {
            ...p,
            product_name: operationData.product_name,
            planned_start_date: operationData.planned_start_date,
            planned_end_date: operationData.planned_end_date,
            planned_rate: operationData.planned_rate,
            method: operationData.method,
            status: operationData.status
          } : p
        )
      })))
    }

    setShowOperationsForm(false)
    setEditingOperation(null)
  };

  // Create bloc data from real bloc and crop cycle information
  useEffect(() => {
    if (bloc && activeCycle) {
      const blocOverviewData: BlocOverviewNode = {
        id: bloc.uuid || bloc.localId,
        name: bloc.name || `Bloc ${bloc.localId}`,
        area_hectares: bloc.area,
        cycle_number: [activeCycle.cycleNumber],
        variety_name: activeCycle.sugarcaneVarietyName,
        planned_harvest_date: activeCycle.plannedHarvestDate,
        expected_yield_tons_ha: activeCycle.expectedYield,
        growth_stage: calculateMonthsFromPlanting(activeCycle.plantingDate || activeCycle.ratoonPlantingDate),
        progress: 0, // Will be calculated from activities
        total_est_product_cost: 0,
        total_est_resource_cost: 0,
        total_act_product_cost: 0,
        total_act_resource_cost: 0,
        cycle_type: activeCycle.type,
        planting_date: activeCycle.plantingDate || activeCycle.ratoonPlantingDate || '',
        products: [] // Will be populated from activities
      }

      setData([blocOverviewData])
    } else {
      setData([])
    }
  }, [bloc, activeCycle])

  const toggleBlocExpansion = (blocId: string) => {
    setExpandedBlocs(prev => {
      const newSet = new Set(prev)
      if (newSet.has(blocId)) {
        newSet.delete(blocId)
      } else {
        newSet.add(blocId)
      }
      return newSet
    })
  }

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

  // Update bloc field
  const updateBlocField = (blocId: string, field: keyof BlocOverviewNode, value: any) => {
    setData(prev => prev.map(bloc =>
      bloc.id === blocId ? { ...bloc, [field]: value } : bloc
    ))
  }

  // Update product field
  const updateProductField = (blocId: string, productId: string, field: keyof ProductNode, value: any) => {
    setData(prev => prev.map(bloc =>
      bloc.id === blocId
        ? {
            ...bloc,
            products: bloc.products?.map(product =>
              product.id === productId ? { ...product, [field]: value } : product
            )
          }
        : bloc
    ))
  }

  // Update work package field
  const updateWorkPackageField = (blocId: string, productId: string, workPackageId: string, field: keyof WorkPackageNode, value: any) => {
    setData(prev => prev.map(bloc =>
      bloc.id === blocId
        ? {
            ...bloc,
            products: bloc.products?.map(product =>
              product.id === productId
                ? {
                    ...product,
                    work_packages: product.work_packages?.map(wp =>
                      wp.id === workPackageId ? { ...wp, [field]: value } : wp
                    )
                  }
                : product
            )
          }
        : bloc
    ))
  }

  const addBloc = () => {
    const newBloc: BlocOverviewNode = {
      id: `bloc_${Date.now()}`,
      name: `New Bloc ${data.length + 1}`,
      area_hectares: 10.0,
      cycle_number: [1],
      variety_name: 'NCo 376',
      planned_harvest_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      expected_yield_tons_ha: 80.0,
      growth_stage: 'germination',
      progress: 0,
      total_est_product_cost: 0,
      total_est_resource_cost: 0,
      total_act_product_cost: 0,
      total_act_resource_cost: 0,
      cycle_type: 'plantation',
      planting_date: new Date().toISOString().split('T')[0],
      products: []
    }
    setData(prev => [...prev, newBloc])
  }

  const addProduct = (blocId: string) => {
    const newProduct: ProductNode = {
      id: `product_${Date.now()}`,
      product_name: '', // Empty
      days_after_planting: 0, // Keep for data structure but won't display
      planned_start_date: '', // Empty
      planned_end_date: '', // Empty
      planned_rate: 0, // Empty
      method: '', // Empty
      progress: 0,
      est_product_cost: 1000,
      est_resource_cost: 500,
      act_product_cost: 0,
      act_resource_cost: 0,
      status: 'planned',
      work_packages: []
    }

    setData(prev => prev.map(bloc =>
      bloc.id === blocId
        ? { ...bloc, products: [...(bloc.products || []), newProduct] }
        : bloc
    ))

    // Auto-expand the bloc to show the new product
    setExpandedBlocs(prev => new Set(Array.from(prev).concat(blocId)))
  }

  const addWorkPackage = (blocId: string, productId: string) => {
    const newWorkPackage: WorkPackageNode = {
      id: `wp_${Date.now()}`,
      days_after_planting: 0, // Keep for data structure but won't display
      date: '', // Empty
      area: 0, // Empty
      rate: 0, // Empty
      quantity: 0, // Empty
      notes: '', // Empty
      completed: false,
      status: 'not-started' // Initialize with not-started status
    }

    setData(prev => prev.map(bloc =>
      bloc.id === blocId
        ? {
            ...bloc,
            products: bloc.products?.map(product =>
              product.id === productId
                ? { ...product, work_packages: [...(product.work_packages || []), newWorkPackage] }
                : product
            )
          }
        : bloc
    ))

    // Auto-expand both bloc and product to show the new work package
    setExpandedBlocs(prev => new Set(Array.from(prev).concat(blocId)))
    setExpandedProducts(prev => new Set(Array.from(prev).concat(productId)))
  }

  const deleteBloc = (blocId: string) => {
    if (window.confirm('Are you sure you want to delete this bloc? This action cannot be undone.')) {
      setData(prev => prev.filter(bloc => bloc.id !== blocId))
      // Also remove from expanded sets
      setExpandedBlocs(prev => {
        const newSet = new Set(prev)
        newSet.delete(blocId)
        return newSet
      })
    }
  }

  const deleteProduct = (productId: string) => {
    if (window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      setData(prev => prev.map(bloc => ({
        ...bloc,
        products: bloc.products?.filter(product => product.id !== productId)
      })))
      // Also remove from expanded sets
      setExpandedProducts(prev => {
        const newSet = new Set(prev)
        newSet.delete(productId)
        return newSet
      })
    }
  }

  const deleteWorkPackage = (workPackageId: string) => {
    if (window.confirm('Are you sure you want to delete this work package? This action cannot be undone.')) {
      setData(prev => prev.map(bloc => ({
        ...bloc,
        products: bloc.products?.map(product => ({
          ...product,
          work_packages: product.work_packages?.filter(wp => wp.id !== workPackageId)
        }))
      })))
    }
  }

  // Render Level 1 (Bloc) Table
  const renderBlocTable = () => {
    return (
      <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className={`${DEFAULT_COLORS.bloc.header} border-b-2 ${DEFAULT_COLORS.bloc.border}`}>
              <tr>
                <th className="px-2 py-3 text-left text-xs font-medium text-blue-900 uppercase tracking-wider w-32">
                  Bloc Name
                </th>
                <th className="px-2 py-3 text-left text-xs font-medium text-blue-900 uppercase tracking-wider w-24">
                  Crop Cycle
                </th>
                <th className="px-2 py-3 text-left text-xs font-medium text-blue-900 uppercase tracking-wider w-20">
                  Area
                </th>
                <th className="px-2 py-3 text-left text-xs font-medium text-blue-900 uppercase tracking-wider w-24">
                  Variety
                </th>
                <th className="px-2 py-3 text-left text-xs font-medium text-blue-900 uppercase tracking-wider w-32">
                  Planned Harvest Date
                </th>
                <th className="px-2 py-3 text-left text-xs font-medium text-blue-900 uppercase tracking-wider w-24">
                  Planned Yield
                </th>
                <th className="px-2 py-3 text-left text-xs font-medium text-blue-900 uppercase tracking-wider w-28">
                  Growth Stage (Months)
                </th>
                {!readOnly && (
                  <th className="w-8 px-1"></th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {data.map((bloc) => (
                <React.Fragment key={bloc.id}>
                  {/* Bloc Row */}
                  <tr className={`${DEFAULT_COLORS.bloc.background} ${DEFAULT_COLORS.bloc.hover} group`}>
                    <td className="px-2 py-3 w-32">
                      <div className="flex items-center">
                        {bloc.products && bloc.products.length > 0 && (
                          <button
                            type="button"
                            onClick={() => toggleBlocExpansion(bloc.id)}
                            className="mr-1 p-1 hover:bg-blue-200 rounded flex-shrink-0"
                          >
                            {expandedBlocs.has(bloc.id) ? (
                              <ChevronDownIcon className="h-3 w-3 text-blue-700" />
                            ) : (
                              <ChevronRightIcon className="h-3 w-3 text-blue-700" />
                            )}
                          </button>
                        )}
                        <span className="text-blue-800 truncate text-sm">{bloc.name}</span>
                      </div>
                    </td>
                    <td className="px-2 py-3 text-blue-800 w-24 text-sm">
                      {bloc.cycle_type === 'plantation' ? 'Plantation' : `Ratoon ${bloc.cycle_number[0] - 1}`}
                    </td>
                    <td className="px-2 py-3 text-blue-800 w-20 text-sm">{bloc.area_hectares.toFixed(1)} ha</td>
                    <td className="px-2 py-3 text-blue-800 w-24 truncate text-sm">{bloc.variety_name}</td>
                    <td className="px-2 py-3 w-32">
                      {readOnly ? (
                        <span className="text-blue-800 text-sm">
                          {bloc.planned_harvest_date ? formatDate(bloc.planned_harvest_date) : 'Not set'}
                        </span>
                      ) : (
                        <input
                          type="date"
                          value={bloc.planned_harvest_date || ''}
                          onChange={(e) => updateBlocField(bloc.id, 'planned_harvest_date', e.target.value)}
                          className="w-full text-blue-800 bg-transparent border-none focus:bg-blue-50 focus:outline-none focus:ring-1 focus:ring-blue-300 rounded px-1 py-1 text-xs"
                          title="Select planned harvest date"
                        />
                      )}
                    </td>
                    <td className="px-2 py-3 text-blue-800 w-24 text-sm">{bloc.expected_yield_tons_ha.toFixed(1)} t/ha</td>
                    <td className="px-2 py-3 w-28">
                      <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                        {bloc.growth_stage} months
                      </span>
                    </td>
                    {!readOnly && (
                      <td className="w-8 px-1">
                        <div className="flex justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            title="Edit Crop Cycle"
                            className="p-1 hover:bg-blue-200 rounded text-blue-600"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>

                  {/* Nested Products Table */}
                  {expandedBlocs.has(bloc.id) && (
                    <tr>
                      <td colSpan={readOnly ? 8 : 9} className="p-0">
                        <div className="bg-green-25 border-l-4 border-green-300 ml-8">
                          {/* Field Operations Title - Only show if products exist */}
                          {bloc.products && bloc.products.length > 0 && (
                            <div className="bg-green-100 border-b border-green-300 px-4 py-2 ml-4 mr-4 mt-4 rounded-t-lg flex justify-between items-center">
                              <h3 className="text-sm font-semibold text-green-900">Field Operations</h3>
                              {!readOnly && (
                                <button
                                  type="button"
                                  title="Add Field Operation"
                                  onClick={() => addProduct(bloc.id)}
                                  className="p-1 hover:bg-green-200 rounded text-green-700"
                                >
                                  <PlusIcon className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                          )}
                          {renderProductTable(bloc)}
                        </div>
                      </td>
                    </tr>
                  )}

                  {/* Show empty state when bloc is not expanded but has no products */}
                  {!expandedBlocs.has(bloc.id) && (!bloc.products || bloc.products.length === 0) && (
                    <tr>
                      <td colSpan={readOnly ? 8 : 9} className="p-0">
                        <div className="bg-green-25 border-l-4 border-green-300 ml-8">
                          <div className="p-4 border-2 border-dashed border-green-300 bg-green-50 rounded-lg m-4">
                            <div className="text-center">
                              {!readOnly && (
                                <button
                                  type="button"
                                  onClick={() => addProduct(bloc.id)}
                                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                                >
                                  <PlusIcon className="h-4 w-4 mr-2" />
                                  Add First Field Operation
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  // Render Level 2 (Product) Table
  const renderProductTable = (bloc: BlocOverviewNode) => {
    if (!bloc.products || bloc.products.length === 0) {
      return (
        <div className="p-4 m-4">
          <div className="text-center">
            {!readOnly && (
              <button
                type="button"
                onClick={() => addProduct(bloc.id)}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Add First Field Operation
              </button>
            )}
          </div>
        </div>
      )
    }

    return (
      <div className="m-4 bg-white shadow-sm border border-green-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className={`${DEFAULT_COLORS.product.header} border-b-2 ${DEFAULT_COLORS.product.border}`}>
              <tr>
                <th className="px-2 py-2 text-left text-xs font-medium text-green-900 uppercase tracking-wider w-32">
                  Operation
                </th>
                <th className="px-2 py-2 text-center text-xs font-medium text-green-900 uppercase tracking-wider w-20">
                  Method
                </th>
                <th className="px-2 py-2 text-center text-xs font-medium text-green-900 uppercase tracking-wider w-24">
                  Main Product
                </th>
                <th className="px-2 py-2 text-center text-xs font-medium text-green-900 uppercase tracking-wider w-20">
                  Rate
                </th>
                <th className="px-2 py-2 text-left text-xs font-medium text-green-900 uppercase tracking-wider w-24">
                  Start Date
                </th>
                <th className="px-2 py-2 text-left text-xs font-medium text-green-900 uppercase tracking-wider w-24">
                  End Date
                </th>
                <th className="px-2 py-2 text-center text-xs font-medium text-green-900 uppercase tracking-wider w-28">
                  Progress
                </th>
                {!readOnly && (
                  <th className="w-16"></th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {bloc.products.map((product) => (
                <React.Fragment key={product.id}>
                  {/* Product Row */}
                  <tr className={`${DEFAULT_COLORS.product.background} ${DEFAULT_COLORS.product.hover} group`}>
                    {/* Operation Column */}
                    <td className="px-2 py-2 w-32">
                      <div className="flex items-center">
                        {/* Always show expand/collapse button */}
                        <button
                          type="button"
                          onClick={() => toggleProductExpansion(product.id)}
                          className="mr-1 p-1 hover:bg-green-200 rounded flex-shrink-0"
                        >
                          {expandedProducts.has(product.id) ? (
                            <ChevronDownIcon className="h-3 w-3 text-green-700" />
                          ) : (
                            <ChevronRightIcon className="h-3 w-3 text-green-700" />
                          )}
                        </button>
                        <div
                          className="cursor-pointer hover:bg-green-100 px-1 py-1 rounded border border-transparent hover:border-green-300 min-h-[24px] flex items-center"
                          onClick={() => {
                            setSelectedProductId(product.id)
                            setShowOperationSelector(true)
                          }}
                          title="Select Operation"
                        >
                          <span className="text-green-800 text-xs truncate">
                            {product.product_name || 'Select operation...'}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Method Column */}
                    <td className="px-2 py-2 w-20">
                      <div className="flex items-center justify-center">
                        <div
                          className="cursor-pointer hover:bg-green-100 px-1 py-1 rounded border border-transparent hover:border-green-300 min-h-[24px] flex items-center justify-center w-full"
                          onClick={() => {
                            setSelectedProductId(product.id)
                            setShowMethodSelector(true)
                          }}
                          title="Select Method"
                        >
                          <span className="text-green-800 text-center text-xs">
                            {product.method || 'Method...'}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Main Product Column */}
                    <td className="px-2 py-2 w-24">
                      <div className="flex items-center justify-center">
                        <div
                          className="cursor-pointer hover:bg-green-100 px-1 py-1 rounded border border-transparent hover:border-green-300 min-h-[24px] flex items-center justify-center w-full"
                          onClick={() => {
                            setSelectedProductId(product.id)
                            setShowProductSelector(true)
                          }}
                          title="Select Product"
                        >
                          <span className="text-green-800 text-center text-xs">
                            {product.product_name || 'Product...'}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Planned Rate Column */}
                    <td className="px-2 py-2 w-20">
                      <div className="flex items-center justify-center">
                        {readOnly ? (
                          <span className="text-green-800 text-center text-xs">
                            {product.planned_rate > 0 ? product.planned_rate : '-'}
                          </span>
                        ) : (
                          <input
                            type="number"
                            value={product.planned_rate > 0 ? product.planned_rate : ''}
                            onChange={(e) => updateProductField(bloc.id, product.id, 'planned_rate', parseFloat(e.target.value) || 0)}
                            placeholder="Rate"
                            className="w-full text-center text-green-800 bg-transparent border-none focus:bg-green-50 focus:outline-none focus:ring-1 focus:ring-green-300 rounded px-1 py-1 text-xs [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            title="Enter Planned Rate"
                          />
                        )}
                      </div>
                    </td>

                    {/* Planned Start Date Column */}
                    <td className="px-2 py-2 w-24">
                      {readOnly ? (
                        <span className="text-green-800 text-center block text-xs">
                          {product.planned_start_date ? formatDate(product.planned_start_date) : 'Not set'}
                        </span>
                      ) : (
                        <input
                          type="date"
                          value={product.planned_start_date || ''}
                          onChange={(e) => updateProductField(bloc.id, product.id, 'planned_start_date', e.target.value)}
                          className="w-full text-green-800 bg-transparent border-none focus:bg-green-50 focus:outline-none focus:ring-1 focus:ring-green-300 rounded px-1 py-1 text-xs text-center"
                          title="Select planned start date"
                        />
                      )}
                    </td>

                    {/* Planned End Date Column */}
                    <td className="px-2 py-2 w-24">
                      {readOnly ? (
                        <span className="text-green-800 text-center block text-xs">
                          {product.planned_end_date ? formatDate(product.planned_end_date) : 'Not set'}
                        </span>
                      ) : (
                        <input
                          type="date"
                          value={product.planned_end_date || ''}
                          onChange={(e) => updateProductField(bloc.id, product.id, 'planned_end_date', e.target.value)}
                          className="w-full text-green-800 bg-transparent border-none focus:bg-green-50 focus:outline-none focus:ring-1 focus:ring-green-300 rounded px-1 py-1 text-xs text-center"
                          title="Select planned end date"
                        />
                      )}
                    </td>

                    {/* Progress Column */}
                    <td className="px-2 py-2 w-28">
                      <div className="flex items-center justify-center">
                        {(() => {
                          const progress = calculateProductProgress(product, bloc.area_hectares)
                          return (
                            <div className="w-full">
                              <div className="flex items-center justify-between text-xs text-green-700 mb-1">
                                <span>Progress</span>
                                <span className="font-medium">{progress}%</span>
                              </div>
                              <div className="w-full bg-green-200 rounded-full h-2">
                                <div
                                  className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all duration-300 ease-in-out"
                                  style={{ width: `${progress}%` }}
                                ></div>
                              </div>
                            </div>
                          )
                        })()}
                      </div>
                    </td>

                    {/* Actions Column */}
                    {!readOnly && (
                      <td className="px-1 py-2 w-16">
                        <div className="flex justify-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            title="Edit Field Operation"
                            onClick={() => handleEditOperation(product)}
                            className="p-1 hover:bg-green-200 rounded text-green-600"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            title="Delete Field Operation"
                            onClick={() => deleteProduct(product.id)}
                            className="p-1 hover:bg-green-200 rounded text-red-600"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>

                  {/* Nested Work Packages Table */}
                  {expandedProducts.has(product.id) && (
                    <tr>
                      <td colSpan={readOnly ? 7 : 8} className="p-0">
                        <div className="bg-gray-25 border-l-4 border-gray-300 ml-8">
                          {/* Daily Work Packages Title - Only show if work packages exist */}
                          {product.work_packages && product.work_packages.length > 0 && (
                            <div className="bg-gray-100 border-b border-gray-300 px-3 py-2 ml-3 mr-3 mt-3 rounded-t-lg flex justify-between items-center">
                              <h4 className="text-sm font-semibold text-gray-900">Daily Work Packages</h4>
                              {!readOnly && (
                                <button
                                  type="button"
                                  title="Add Work Package"
                                  onClick={() => addWorkPackage(bloc.id, product.id)}
                                  className="p-1 hover:bg-gray-200 rounded text-gray-700"
                                >
                                  <PlusIcon className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                          )}
                          {renderWorkPackageTable(bloc, product)}
                        </div>
                      </td>
                    </tr>
                  )}


                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>

        {/* Product Footer with Financial Summary */}
        <div className="bg-white border-t border-black px-3 py-2">
          <div className="grid grid-cols-4 gap-3 text-sm">
            <div className="text-center">
              <div className="text-black font-medium">Est. Cost</div>
              <div className="text-black font-bold">
                Rs {(bloc.products?.reduce((acc, p) => acc + p.est_product_cost + p.est_resource_cost, 0) || 0).toLocaleString()}
              </div>
            </div>
            <div className="text-center">
              <div className="text-black font-medium">Act. Cost</div>
              <div className="text-black font-bold">
                Rs {(bloc.products?.reduce((acc, p) => acc + p.act_product_cost + p.act_resource_cost, 0) || 0).toLocaleString()}
              </div>
            </div>
            <div className="text-center">
              <div className="text-black font-medium">Est. Revenue</div>
              <div className="text-black font-bold">
                Rs {(bloc.expected_yield_tons_ha * bloc.area_hectares * 2500).toLocaleString()}
              </div>
            </div>
            <div className="text-center">
              <div className="text-black font-medium">Act. Revenue</div>
              <div className="text-black font-bold">
                Rs {(bloc.expected_yield_tons_ha * bloc.area_hectares * 2500 * (bloc.progress / 100)).toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Render Level 3 (Work Package) Table
  const renderWorkPackageTable = (bloc: BlocOverviewNode, product: ProductNode) => {
    if (!product.work_packages || product.work_packages.length === 0) {
      return (
        <div className="p-3 m-3">
          <div className="text-center">
            {!readOnly && (
              <button
                type="button"
                onClick={() => addWorkPackage(bloc.id, product.id)}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gray-600 hover:bg-gray-700"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Add First Work Package
              </button>
            )}
          </div>
        </div>
      )
    }

    return (
      <div className="m-3 bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className={`${DEFAULT_COLORS.workPackage.header} border-b-2 ${DEFAULT_COLORS.workPackage.border}`}>
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-900 uppercase tracking-wider w-32">
                  Date
                </th>
                <th className="px-3 py-2 text-center text-xs font-medium text-gray-900 uppercase tracking-wider w-24">
                  Area (ha)
                </th>
                <th className="px-3 py-2 text-center text-xs font-medium text-gray-900 uppercase tracking-wider w-24">
                  Quantity
                </th>
                <th className="px-3 py-2 text-center text-xs font-medium text-gray-900 uppercase tracking-wider w-24">
                  Rate
                </th>
                <th className="px-3 py-2 text-center text-xs font-medium text-gray-900 uppercase tracking-wider w-16">
                  Status
                </th>
                {!readOnly && (
                  <th className="w-16"></th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {product.work_packages.map((workPackage) => (
                <tr key={workPackage.id} className={`${DEFAULT_COLORS.workPackage.background} ${DEFAULT_COLORS.workPackage.hover} group`}>
                  {/* Date Column */}
                  <td className="px-3 py-2 w-28">
                    {readOnly ? (
                      <span className="text-gray-800">
                        {workPackage.date ? formatDate(workPackage.date) : 'Not set'}
                      </span>
                    ) : (
                      <input
                        type="date"
                        value={workPackage.date || ''}
                        onChange={(e) => updateWorkPackageField(bloc.id, product.id, workPackage.id, 'date', e.target.value)}
                        className="w-full text-gray-800 bg-transparent border-none focus:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-gray-300 rounded px-2 py-1 text-sm"
                        title="Select work package date"
                      />
                    )}
                  </td>

                  {/* Area Column */}
                  <td className="px-3 py-2 w-24">
                    <div className="flex items-center justify-center">
                      {readOnly ? (
                        <span className="text-gray-800 text-center">
                          {workPackage.area > 0 ? `${workPackage.area} ha` : '-'}
                        </span>
                      ) : (
                        <input
                          type="number"
                          value={workPackage.area > 0 ? workPackage.area : ''}
                          onChange={(e) => updateWorkPackageField(bloc.id, product.id, workPackage.id, 'area', parseFloat(e.target.value) || 0)}
                          placeholder="Area"
                          className="w-full text-center text-gray-800 bg-transparent border-none focus:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-gray-300 rounded px-2 py-1 text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          title="Enter area in hectares"
                        />
                      )}
                    </div>
                  </td>

                  {/* Quantity Column */}
                  <td className="px-3 py-2 w-24">
                    <div className="flex items-center justify-center">
                      {readOnly ? (
                        <span className="text-gray-800 text-center">
                          {workPackage.quantity > 0 ? workPackage.quantity : '-'}
                        </span>
                      ) : (
                        <input
                          type="number"
                          value={workPackage.quantity > 0 ? workPackage.quantity : ''}
                          onChange={(e) => updateWorkPackageField(bloc.id, product.id, workPackage.id, 'quantity', parseFloat(e.target.value) || 0)}
                          placeholder="Qty"
                          className="w-full text-center text-gray-800 bg-transparent border-none focus:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-gray-300 rounded px-2 py-1 text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          title="Enter quantity"
                        />
                      )}
                    </div>
                  </td>

                  {/* Rate Column */}
                  <td className="px-3 py-2 w-24">
                    <div className="flex items-center justify-center">
                      {readOnly ? (
                        <span className="text-gray-800 text-center">
                          {workPackage.rate > 0 ? workPackage.rate : '-'}
                        </span>
                      ) : (
                        <input
                          type="number"
                          value={workPackage.rate > 0 ? workPackage.rate : ''}
                          onChange={(e) => updateWorkPackageField(bloc.id, product.id, workPackage.id, 'rate', parseFloat(e.target.value) || 0)}
                          placeholder="Rate"
                          className="w-full text-center text-gray-800 bg-transparent border-none focus:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-gray-300 rounded px-2 py-1 text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          title="Enter rate"
                        />
                      )}
                    </div>
                  </td>

                  {/* Status Column */}
                  <td className="px-3 py-2 w-16">
                    <div className="flex items-center justify-center">
                      {readOnly ? (
                        <StatusBadge status={getWorkPackageStatus(workPackage)} />
                      ) : (
                        <StatusCompactToggle
                          status={getWorkPackageStatus(workPackage)}
                          onChange={(newStatus) => updateWorkPackageStatus(bloc.id, product.id, workPackage.id, newStatus)}
                        />
                      )}
                    </div>
                  </td>

                  {/* Actions Column */}
                  {!readOnly && (
                    <td className="px-1 py-2 w-16">
                      <div className="flex justify-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          title="Edit Work Package"
                          className="p-1 hover:bg-gray-200 rounded text-gray-600"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          title="Delete Work Package"
                          onClick={() => deleteWorkPackage(workPackage.id)}
                          className="p-1 hover:bg-gray-200 rounded text-red-600"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  const expandAll = () => {
    const allBlocIds = new Set(data.map(bloc => bloc.id))
    const allProductIds = new Set(
      data.flatMap(bloc => bloc.products?.map(product => product.id) || [])
    )
    setExpandedBlocs(allBlocIds)
    setExpandedProducts(allProductIds)
  }

  const collapseAll = () => {
    setExpandedBlocs(new Set())
    setExpandedProducts(new Set())
  }

  return (
    <div className="space-y-4">
      {/* Main Nested Tables */}
      {data.length === 0 ? (
        <div className="p-8 border-2 border-dashed border-blue-300 bg-blue-50 rounded-lg">
          <div className="text-center">
            <p className="text-blue-700 mb-4">No blocs added yet</p>
            {!readOnly && (
              <button
                type="button"
                onClick={addBloc}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Add First Bloc
              </button>
            )}
          </div>
        </div>
      ) : (
        renderBlocTable()
      )}

      {/* Operation Selector Modal */}
      {showOperationSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-h-96 overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Select Operation</h3>
            <div className="space-y-2">
              {mockOperations.map((operation) => (
                <button
                  key={operation}
                  className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded"
                  onClick={() => {
                    if (selectedProductId) {
                      setData(prev => prev.map(bloc => ({
                        ...bloc,
                        products: bloc.products?.map(p =>
                          p.id === selectedProductId ? { ...p, product_name: operation } : p
                        )
                      })))
                    }
                    setShowOperationSelector(false)
                    setSelectedProductId(null)
                  }}
                >
                  {operation}
                </button>
              ))}
            </div>
            <button
              className="mt-4 px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              onClick={() => {
                setShowOperationSelector(false)
                setSelectedProductId(null)
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Method Selector Modal */}
      {showMethodSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-h-96 overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Select Method</h3>
            <div className="space-y-2">
              {mockMethods.map((method) => (
                <button
                  key={method}
                  className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded"
                  onClick={() => {
                    if (selectedProductId) {
                      setData(prev => prev.map(bloc => ({
                        ...bloc,
                        products: bloc.products?.map(p =>
                          p.id === selectedProductId ? { ...p, method: method } : p
                        )
                      })))
                    }
                    setShowMethodSelector(false)
                    setSelectedProductId(null)
                  }}
                >
                  {method}
                </button>
              ))}
            </div>
            <button
              className="mt-4 px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              onClick={() => {
                setShowMethodSelector(false)
                setSelectedProductId(null)
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Real Product Selector Modal */}
      {showProductSelector && (
        <ProductSelector
          onSelect={handleRealProductSelect}
          onClose={() => {
            setShowProductSelector(false)
            setSelectedProductId(null)
          }}
          blocArea={data.find(b => b.products?.some(p => p.id === selectedProductId))?.area_hectares || 1}
        />
      )}

      {/* Operations Form Modal */}
      {showOperationsForm && editingOperation && (
        <OperationsForm
          operation={editingOperation}
          blocArea={data.find(b => b.products?.some(p => p.id === editingOperation.id))?.area_hectares || 1}
          activeCycleInfo={activeCycleInfo}
          onSave={handleOperationSave}
          onCancel={() => {
            setShowOperationsForm(false)
            setEditingOperation(null)
          }}
        />
      )}


    </div>
  )
}
