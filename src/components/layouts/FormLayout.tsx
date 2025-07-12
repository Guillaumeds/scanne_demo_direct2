'use client'

import { Button } from '@/components/ui/button'
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from '@/components/ui/breadcrumb'
import { Icon } from '@/components/ui/icon'
import { IconButton } from '@/components/ui/icon'
import { Separator } from '@/components/ui/separator'

interface BreadcrumbItem {
  label: string
  href?: string
}

interface FormLayoutProps {
  title: string
  subtitle?: string
  breadcrumbs: BreadcrumbItem[]
  onBack: () => void
  children: React.ReactNode
  actions?: React.ReactNode
  className?: string
}

export function FormLayout({ 
  title, 
  subtitle,
  breadcrumbs, 
  onBack, 
  children,
  actions,
  className = ''
}: FormLayoutProps) {
  return (
    <div className={`h-full flex flex-col bg-slate-50 ${className}`}>
      {/* Header with Breadcrumbs */}
      <div className="bg-white border-b border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <IconButton
              icon="back"
              variant="ghost"
              onClick={onBack}
              className="text-slate-500 hover:text-slate-700"
            />
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
              {subtitle && (
                <p className="text-sm text-slate-600 mt-1">{subtitle}</p>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {actions}
            <IconButton
              icon="close"
              variant="ghost"
              onClick={onBack}
              className="text-slate-500 hover:text-slate-700"
            />
          </div>
        </div>

        <Breadcrumb>
          <BreadcrumbList>
            {breadcrumbs.map((crumb, index) => (
              <div key={index} className="flex items-center">
                <BreadcrumbItem>
                  {crumb.href ? (
                    <BreadcrumbLink 
                      href={crumb.href} 
                      className="text-slate-600 hover:text-slate-900 transition-colors"
                    >
                      {crumb.label}
                    </BreadcrumbLink>
                  ) : (
                    <BreadcrumbPage className="text-slate-900 font-medium">
                      {crumb.label}
                    </BreadcrumbPage>
                  )}
                </BreadcrumbItem>
                {index < breadcrumbs.length - 1 && (
                  <BreadcrumbSeparator className="text-slate-400" />
                )}
              </div>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {children}
      </div>
    </div>
  )
}

// Specialized layout for table views
interface TableLayoutProps {
  title: string
  subtitle?: string
  breadcrumbs: BreadcrumbItem[]
  onBack: () => void
  children: React.ReactNode
  toolbar?: React.ReactNode
  filters?: React.ReactNode
  className?: string
}

export function TableLayout({
  title,
  subtitle,
  breadcrumbs,
  onBack,
  children,
  toolbar,
  filters,
  className = ''
}: TableLayoutProps) {
  return (
    <div className={`h-full flex flex-col bg-slate-50 ${className}`}>
      {/* Header */}
      <div className="bg-white border-b border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <IconButton
              icon="back"
              variant="ghost"
              onClick={onBack}
              className="text-slate-500 hover:text-slate-700"
            />
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
              {subtitle && (
                <p className="text-sm text-slate-600 mt-1">{subtitle}</p>
              )}
            </div>
          </div>
          
          {toolbar && (
            <div className="flex items-center gap-2">
              {toolbar}
            </div>
          )}
        </div>

        <Breadcrumb>
          <BreadcrumbList>
            {breadcrumbs.map((crumb, index) => (
              <div key={index} className="flex items-center">
                <BreadcrumbItem>
                  {crumb.href ? (
                    <BreadcrumbLink 
                      href={crumb.href} 
                      className="text-slate-600 hover:text-slate-900 transition-colors"
                    >
                      {crumb.label}
                    </BreadcrumbLink>
                  ) : (
                    <BreadcrumbPage className="text-slate-900 font-medium">
                      {crumb.label}
                    </BreadcrumbPage>
                  )}
                </BreadcrumbItem>
                {index < breadcrumbs.length - 1 && (
                  <BreadcrumbSeparator className="text-slate-400" />
                )}
              </div>
            ))}
          </BreadcrumbList>
        </Breadcrumb>

        {/* Filters */}
        {filters && (
          <>
            <Separator className="my-4" />
            <div className="flex items-center gap-4">
              {filters}
            </div>
          </>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {children}
      </div>
    </div>
  )
}

// Dashboard layout for overview screens
interface DashboardLayoutProps {
  title: string
  subtitle?: string
  children: React.ReactNode
  sidebar?: React.ReactNode
  actions?: React.ReactNode
  className?: string
}

export function DashboardLayout({
  title,
  subtitle,
  children,
  sidebar,
  actions,
  className = ''
}: DashboardLayoutProps) {
  return (
    <div className={`h-full flex flex-col bg-slate-50 ${className}`}>
      {/* Header */}
      <div className="bg-white border-b border-slate-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
            {subtitle && (
              <p className="text-sm text-slate-600 mt-1">{subtitle}</p>
            )}
          </div>
          
          {actions && (
            <div className="flex items-center gap-2">
              {actions}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex overflow-hidden">
        {sidebar && (
          <>
            <div className="w-64 bg-white border-r border-slate-200 overflow-y-auto">
              {sidebar}
            </div>
            <Separator orientation="vertical" />
          </>
        )}
        
        <div className="flex-1 overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  )
}

// Modal layout for dialogs and overlays
interface ModalLayoutProps {
  title: string
  subtitle?: string
  children: React.ReactNode
  onClose: () => void
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  className?: string
}

export function ModalLayout({
  title,
  subtitle,
  children,
  onClose,
  size = 'md',
  className = ''
}: ModalLayoutProps) {
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-7xl'
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className={`bg-white rounded-lg shadow-xl ${sizeClasses[size]} w-full max-h-[90vh] flex flex-col ${className}`}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
            {subtitle && (
              <p className="text-sm text-slate-600 mt-1">{subtitle}</p>
            )}
          </div>
          
          <IconButton
            icon="close"
            variant="ghost"
            onClick={onClose}
            className="text-slate-500 hover:text-slate-700"
          />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </div>
    </div>
  )
}
