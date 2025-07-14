/**
 * @jest-environment jsdom
 */

import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import ModernOverviewTab from '../ModernOverviewTab'
import { BlocOverviewNode } from '@/types/operationsOverview'

// Mock the dependencies
jest.mock('@/components/tables/ModernOverviewTable', () => {
  return function MockModernOverviewTable({ onEditOperation, onEditWorkPackage }: any) {
    return (
      <div data-testid="modern-overview-table">
        <button onClick={() => onEditOperation({ id: 'test-op', product_name: 'Test Operation' })}>
          Edit Operation
        </button>
        <button onClick={() => onEditWorkPackage({ id: 'test-wp', date: '2024-01-01' }, 'bloc-1', 'op-1')}>
          Edit Work Package
        </button>
      </div>
    )
  }
})

jest.mock('@/components/forms/ModernOperationsForm', () => {
  return function MockModernOperationsForm({ onSave, onCancel }: any) {
    return (
      <div data-testid="modern-operations-form">
        <button onClick={() => onSave({ operationName: 'Updated Operation' })}>
          Save Operation
        </button>
        <button onClick={onCancel}>Cancel</button>
      </div>
    )
  }
})

jest.mock('@/components/forms/ModernWorkPackageForm', () => {
  return function MockModernWorkPackageForm({ onSave, onCancel }: any) {
    return (
      <div data-testid="modern-workpackage-form">
        <button onClick={() => onSave({ workPackageName: 'Updated Work Package' })}>
          Save Work Package
        </button>
        <button onClick={onCancel}>Cancel</button>
      </div>
    )
  }
})

jest.mock('@/components/layouts/FormLayout', () => {
  return function MockFormLayout({ children, onBack }: any) {
    return (
      <div data-testid="form-layout">
        <button onClick={onBack}>Back</button>
        {children}
      </div>
    )
  }
})

jest.mock('@/components/ui/page-transition', () => {
  return {
    PageTransition: function MockPageTransition({ children }: any) {
      return <div data-testid="page-transition">{children}</div>
    }
  }
})

jest.mock('@/components/ui/ContentSwitcher', () => {
  return {
    ContentSwitcher: function MockContentSwitcher({ onViewChange, views }: any) {
      return (
        <div data-testid="content-switcher">
          {views.map((view: any) => (
            <button key={view.id} onClick={() => onViewChange(view.id)}>
              {view.name}
            </button>
          ))}
        </div>
      )
    }
  }
})

describe('ModernOverviewTab', () => {
  const mockData: BlocOverviewNode[] = [
    {
      id: 'bloc-1',
      name: 'Test Bloc',
      area_hectares: 10,
      cycle_number: [1],
      variety_name: 'NCo 376',
      planned_harvest_date: '2024-08-15',
      expected_yield_tons_ha: 80,
      growth_stage: 'tillering',
      progress: 50,
      total_est_product_cost: 10000,
      total_est_resource_cost: 5000,
      total_act_product_cost: 9000,
      total_act_resource_cost: 4500,
      cycle_type: 'plantation',
      planting_date: '2024-02-01',
      products: [
        {
          id: 'product-1',
          product_name: 'Test Operation',
          days_after_planting: 30,
          planned_start_date: '2024-03-01',
          planned_end_date: '2024-03-15',
          planned_rate: 2.5,
          method: 'manual',
          progress: 75,
          est_product_cost: 5000,
          est_resource_cost: 2500,
          act_product_cost: 4800,
          act_resource_cost: 2300,
          status: 'in-progress',
          work_packages: [
            {
              id: 'wp-1',
              days_after_planting: 30,
              date: '2024-03-01',
              area: 2.5,
              rate: 1.0,
              quantity: 100,
              status: 'complete'
            }
          ]
        }
      ]
    }
  ]

  const mockProps = {
    data: mockData,
    activeCycleInfo: {},
    onDataUpdate: jest.fn()
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders table view by default', () => {
    render(<ModernOverviewTab {...mockProps} />)

    expect(screen.getByTestId('content-switcher')).toBeInTheDocument()
    expect(screen.getByTestId('modern-overview-table')).toBeInTheDocument()
    expect(screen.getByText('Operations')).toBeInTheDocument()
    expect(screen.getByText('Resources')).toBeInTheDocument()
    expect(screen.getByText('Financial')).toBeInTheDocument()
  })

  it('switches to operation form when editing operation', () => {
    render(<ModernOverviewTab {...mockProps} />)

    const editOperationButton = screen.getByText('Edit Operation')
    fireEvent.click(editOperationButton)

    expect(screen.getByTestId('form-layout')).toBeInTheDocument()
    expect(screen.getByTestId('modern-operations-form')).toBeInTheDocument()
  })

  it('switches to work package form when editing work package', () => {
    render(<ModernOverviewTab {...mockProps} />)

    const editWorkPackageButton = screen.getByText('Edit Work Package')
    fireEvent.click(editWorkPackageButton)

    expect(screen.getByTestId('form-layout')).toBeInTheDocument()
    expect(screen.getByTestId('modern-workpackage-form')).toBeInTheDocument()
  })

  it('saves operation and returns to table view', () => {
    render(<ModernOverviewTab {...mockProps} />)

    // Switch to operation form
    const editOperationButton = screen.getByText('Edit Operation')
    fireEvent.click(editOperationButton)

    // Save operation
    const saveButton = screen.getByText('Save Operation')
    fireEvent.click(saveButton)

    // Should return to table view
    expect(screen.getByTestId('modern-overview-table')).toBeInTheDocument()
    expect(mockProps.onDataUpdate).toHaveBeenCalled()
  })

  it('saves work package and returns to table view', () => {
    render(<ModernOverviewTab {...mockProps} />)

    // Switch to work package form
    const editWorkPackageButton = screen.getByText('Edit Work Package')
    fireEvent.click(editWorkPackageButton)

    // Save work package
    const saveButton = screen.getByText('Save Work Package')
    fireEvent.click(saveButton)

    // Should return to table view
    expect(screen.getByTestId('modern-overview-table')).toBeInTheDocument()
    expect(mockProps.onDataUpdate).toHaveBeenCalled()
  })

  it('cancels form and returns to table view', () => {
    render(<ModernOverviewTab {...mockProps} />)

    // Switch to operation form
    const editOperationButton = screen.getByText('Edit Operation')
    fireEvent.click(editOperationButton)

    // Cancel form
    const cancelButton = screen.getByText('Cancel')
    fireEvent.click(cancelButton)

    // Should return to table view
    expect(screen.getByTestId('modern-overview-table')).toBeInTheDocument()
  })

  it('switches between different views', () => {
    render(<ModernOverviewTab {...mockProps} />)

    const resourcesButton = screen.getByText('Resources')
    fireEvent.click(resourcesButton)

    const financialButton = screen.getByText('Financial')
    fireEvent.click(financialButton)

    // Should still show the table
    expect(screen.getByTestId('modern-overview-table')).toBeInTheDocument()
  })
})
