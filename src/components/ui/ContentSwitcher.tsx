'use client'

import { Icon, IconName } from '@/components/ui/icon'
import { cn } from '@/lib/utils'

interface ContentSwitcherView {
  id: string
  name: string
  icon: IconName
}

interface ContentSwitcherProps {
  currentView: string
  onViewChange: (viewId: string) => void
  views: ContentSwitcherView[]
  className?: string
}

export function ContentSwitcher({
  currentView,
  onViewChange,
  views,
  className = ''
}: ContentSwitcherProps) {
  return (
    <div className={cn('inline-flex rounded-lg border border-slate-200 bg-slate-50 p-1', className)}>
      {views.map((view) => (
        <button
          key={view.id}
          type="button"
          onClick={() => onViewChange(view.id)}
          className={cn(
            'relative px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ease-in-out',
            currentView === view.id
              ? 'bg-white text-emerald-700 shadow-sm border border-emerald-200'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          )}
        >
          <div className="flex items-center gap-2">
            <Icon
              name={view.icon}
              size="sm"
              className={currentView === view.id ? 'text-emerald-600' : 'text-slate-500'}
            />
            <span>{view.name}</span>
          </div>
        </button>
      ))}
    </div>
  )
}

// Legacy support - keep the old interface for backward compatibility
interface LegacyContentSwitcherOption {
  id: string
  label: string
  icon?: string
}

interface LegacyContentSwitcherProps {
  options: LegacyContentSwitcherOption[]
  selectedId: string
  onChange: (selectedId: string) => void
  className?: string
}

export default function LegacyContentSwitcher({
  options,
  selectedId,
  onChange,
  className = ''
}: LegacyContentSwitcherProps) {
  return (
    <div className={cn('inline-flex rounded-lg border border-slate-200 bg-slate-50 p-1', className)}>
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          onClick={() => onChange(option.id)}
          className={cn(
            'relative px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ease-in-out',
            selectedId === option.id
              ? 'bg-white text-emerald-700 shadow-sm border border-emerald-200'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          )}
        >
          <div className="flex items-center gap-2">
            {option.icon && <span className="text-base">{option.icon}</span>}
            <span>{option.label}</span>
          </div>
        </button>
      ))}
    </div>
  )
}
