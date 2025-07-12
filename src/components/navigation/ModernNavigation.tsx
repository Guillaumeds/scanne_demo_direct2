'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Icon, IconName } from '@/components/ui/icon'
import { IconButton } from '@/components/ui/icon'
import { cn } from '@/lib/utils'

interface NavigationItem {
  id: string
  name: string
  icon: IconName
  href?: string
  onClick?: () => void
  badge?: string | number
  status?: 'active' | 'disabled' | 'warning'
  children?: NavigationItem[]
}

interface ModernNavigationProps {
  items: NavigationItem[]
  activeItem?: string
  onItemClick?: (item: NavigationItem) => void
  className?: string
  collapsed?: boolean
  onToggleCollapse?: () => void
}

export function ModernNavigation({
  items,
  activeItem,
  onItemClick,
  className = '',
  collapsed = false,
  onToggleCollapse
}: ModernNavigationProps) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())

  const toggleExpanded = (itemId: string) => {
    const newExpanded = new Set(expandedItems)
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId)
    } else {
      newExpanded.add(itemId)
    }
    setExpandedItems(newExpanded)
  }

  const handleItemClick = (item: NavigationItem) => {
    if (item.children && item.children.length > 0) {
      toggleExpanded(item.id)
    } else if (onItemClick) {
      onItemClick(item)
    }
  }

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'active': return 'text-emerald-600'
      case 'disabled': return 'text-slate-400'
      case 'warning': return 'text-amber-600'
      default: return 'text-slate-600'
    }
  }

  const renderNavigationItem = (item: NavigationItem, level = 0) => {
    const isActive = activeItem === item.id
    const isExpanded = expandedItems.has(item.id)
    const hasChildren = item.children && item.children.length > 0
    const isDisabled = item.status === 'disabled'

    return (
      <div key={item.id} className="w-full">
        <Button
          variant={isActive ? 'secondary' : 'ghost'}
          className={cn(
            'w-full justify-start h-auto p-3 text-left',
            level > 0 && 'ml-4 w-[calc(100%-1rem)]',
            isActive && 'bg-emerald-50 text-emerald-700 border-emerald-200',
            isDisabled && 'opacity-50 cursor-not-allowed',
            !collapsed && 'px-3',
            collapsed && 'px-2 justify-center'
          )}
          onClick={() => !isDisabled && handleItemClick(item)}
          disabled={isDisabled}
        >
          <div className="flex items-center gap-3 w-full">
            <Icon 
              name={item.icon} 
              size="sm" 
              className={cn(
                getStatusColor(item.status),
                isActive && 'text-emerald-600'
              )}
            />
            
            {!collapsed && (
              <>
                <span className="flex-1 text-sm font-medium">
                  {item.name}
                </span>
                
                <div className="flex items-center gap-2">
                  {item.badge && (
                    <Badge 
                      variant={item.status === 'warning' ? 'destructive' : 'secondary'}
                      className="text-xs"
                    >
                      {item.badge}
                    </Badge>
                  )}
                  
                  {hasChildren && (
                    <Icon 
                      name={isExpanded ? 'collapse' : 'expand'} 
                      size="sm"
                      className="text-slate-400"
                    />
                  )}
                </div>
              </>
            )}
          </div>
        </Button>

        {/* Children */}
        {hasChildren && !collapsed && isExpanded && (
          <div className="mt-1 space-y-1">
            {item.children!.map(child => renderNavigationItem(child, level + 1))}
          </div>
        )}
      </div>
    )
  }

  return (
    <nav className={cn('flex flex-col bg-white border-r border-slate-200', className)}>
      {/* Header */}
      <div className="p-4 border-b border-slate-200">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <h2 className="text-lg font-semibold text-slate-900">Navigation</h2>
          )}
          {onToggleCollapse && (
            <IconButton
              icon={collapsed ? 'expand' : 'collapse'}
              variant="ghost"
              size="sm"
              onClick={onToggleCollapse}
              className="text-slate-500 hover:text-slate-700"
            />
          )}
        </div>
      </div>

      {/* Navigation Items */}
      <div className="flex-1 overflow-y-auto p-2">
        <div className="space-y-1">
          {items.map(item => renderNavigationItem(item))}
        </div>
      </div>
    </nav>
  )
}

// Specialized navigation for bloc screens
interface BlocNavigationProps {
  blocName: string
  activeTab: string
  onTabChange: (tab: string) => void
  onBack: () => void
  hasCropCycle?: boolean
  className?: string
}

export function BlocNavigation({
  blocName,
  activeTab,
  onTabChange,
  onBack,
  hasCropCycle = false,
  className = ''
}: BlocNavigationProps) {
  const navigationItems: NavigationItem[] = [
    {
      id: 'general',
      name: 'Information',
      icon: 'settings',
      status: 'active'
    },
    {
      id: 'overview',
      name: 'Crop Management',
      icon: 'overview',
      status: 'active' // Always allow access
    },
    {
      id: 'observations',
      name: 'Observations',
      icon: 'observations',
      status: 'active' // Always allow access
    }
  ]

  return (
    <div className={cn('w-64 bg-white border-r border-slate-200 flex flex-col', className)}>
      {/* Header */}
      <div className="p-6 border-b border-slate-200">
        <div className="flex items-center gap-3 mb-4">
          <IconButton
            icon="back"
            variant="ghost"
            onClick={onBack}
            className="text-slate-500 hover:text-slate-700"
          />
          <div className="flex-1">
            <h1 className="text-lg font-semibold text-slate-900 truncate">
              {blocName}
            </h1>
            <p className="text-sm text-slate-600">Bloc Details</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 p-4">
        <div className="space-y-2">
          {navigationItems.map(item => (
            <Button
              key={item.id}
              variant={activeTab === item.id ? 'secondary' : 'ghost'}
              className={cn(
                'w-full justify-start h-auto p-3',
                activeTab === item.id && 'bg-emerald-50 text-emerald-700',
                item.status === 'disabled' && 'opacity-50 cursor-not-allowed'
              )}
              onClick={() => item.status !== 'disabled' && onTabChange(item.id)}
              disabled={item.status === 'disabled'}
            >
              <Icon 
                name={item.icon} 
                size="sm" 
                className={cn(
                  'mr-3',
                  activeTab === item.id ? 'text-emerald-600' : 'text-slate-600',
                  item.status === 'disabled' && 'text-slate-400'
                )}
              />
              <span className="text-sm font-medium">{item.name}</span>
            </Button>
          ))}
        </div>

        {!hasCropCycle && (
          <div className="mt-6 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start gap-2">
              <Icon name="info" size="sm" className="text-amber-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-800">No Active Crop Cycle</p>
                <p className="text-xs text-amber-700 mt-1">
                  Create a crop cycle in Information for full functionality. Management and observations are still accessible.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-slate-200">
        <Button
          variant="outline"
          size="sm"
          onClick={onBack}
          className="w-full"
        >
          <Icon name="back" size="sm" className="mr-2" />
          Back to Farm
        </Button>
      </div>
    </div>
  )
}

// Breadcrumb navigation component
interface BreadcrumbNavigationProps {
  items: Array<{
    label: string
    href?: string
    onClick?: () => void
  }>
  className?: string
}

export function BreadcrumbNavigation({ items, className = '' }: BreadcrumbNavigationProps) {
  return (
    <nav className={cn('flex items-center space-x-2 text-sm', className)}>
      {items.map((item, index) => (
        <div key={index} className="flex items-center">
          {index > 0 && (
            <Icon name="expand" size="xs" className="mx-2 text-slate-400 rotate-90" />
          )}
          {item.href || item.onClick ? (
            <button
              onClick={item.onClick}
              className="text-slate-600 hover:text-slate-900 transition-colors"
            >
              {item.label}
            </button>
          ) : (
            <span className="text-slate-900 font-medium">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  )
}
