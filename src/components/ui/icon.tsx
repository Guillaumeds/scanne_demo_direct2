import React from 'react'
import { Icons, IconName } from './icons'
import { cn } from '@/lib/utils'

interface IconProps {
  name: IconName
  className?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  color?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'muted'
  variant?: 'default' | 'outline' | 'ghost'
}

export function Icon({ 
  name, 
  className, 
  size = 'md', 
  color = 'default',
  variant = 'default'
}: IconProps) {
  const IconComponent = Icons[name]
  
  if (!IconComponent) {
    console.warn(`Icon "${name}" not found in Icons mapping`)
    return null
  }
  
  const sizeClasses = {
    xs: 'h-3 w-3',
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
    xl: 'h-8 w-8',
    '2xl': 'h-10 w-10'
  }
  
  const colorClasses = {
    default: 'text-slate-700',
    primary: 'text-emerald-600',
    secondary: 'text-slate-500',
    success: 'text-green-600',
    warning: 'text-amber-600',
    error: 'text-red-600',
    muted: 'text-slate-400'
  }
  
  const variantClasses = {
    default: '',
    outline: 'stroke-2',
    ghost: 'opacity-60'
  }
  
  return (
    <IconComponent 
      className={cn(
        sizeClasses[size],
        colorClasses[color],
        variantClasses[variant],
        className
      )} 
    />
  )
}

// Convenience components for common icon patterns
export function StatusIcon({ 
  status, 
  className, 
  size = 'sm' 
}: { 
  status: 'pending' | 'completed' | 'cancelled' | 'in-progress' | 'alert'
  className?: string
  size?: IconProps['size']
}) {
  const statusConfig = {
    pending: { name: 'pending' as IconName, color: 'warning' as const },
    completed: { name: 'completed' as IconName, color: 'success' as const },
    cancelled: { name: 'cancelled' as IconName, color: 'error' as const },
    'in-progress': { name: 'play' as IconName, color: 'primary' as const },
    alert: { name: 'alert' as IconName, color: 'error' as const }
  }
  
  const config = statusConfig[status]
  
  return (
    <Icon 
      name={config.name}
      color={config.color}
      size={size}
      className={className}
    />
  )
}

export function WeatherIcon({ 
  condition, 
  className, 
  size = 'md' 
}: { 
  condition: 'sunny' | 'cloudy' | 'rainy' | 'stormy' | 'snow'
  className?: string
  size?: IconProps['size']
}) {
  const weatherConfig = {
    sunny: 'weather',
    cloudy: 'cloudy',
    rainy: 'rain',
    stormy: 'wind',
    snow: 'snow'
  } as const
  
  return (
    <Icon 
      name={weatherConfig[condition]}
      size={size}
      className={className}
    />
  )
}

export function OperationIcon({ 
  operation, 
  className, 
  size = 'md' 
}: { 
  operation: 'planting' | 'irrigation' | 'harvest' | 'maintenance' | 'pest_control'
  className?: string
  size?: IconProps['size']
}) {
  const operationConfig = {
    planting: 'planting',
    irrigation: 'irrigation',
    harvest: 'harvest',
    maintenance: 'maintenance',
    pest_control: 'pest'
  } as const
  
  return (
    <Icon 
      name={operationConfig[operation]}
      color="primary"
      size={size}
      className={className}
    />
  )
}

// Icon button component
export function IconButton({
  icon,
  onClick,
  variant = 'ghost',
  size = 'md',
  className,
  disabled = false,
  ...props
}: {
  icon: IconName
  onClick?: () => void
  variant?: 'default' | 'ghost' | 'outline'
  size?: IconProps['size']
  className?: string
  disabled?: boolean
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  
  const variantClasses = {
    default: 'bg-emerald-600 text-white hover:bg-emerald-700',
    ghost: 'text-slate-600 hover:text-slate-900 hover:bg-slate-100',
    outline: 'border border-slate-300 text-slate-700 hover:bg-slate-50'
  }
  
  const sizeClasses = {
    xs: 'p-1',
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-2.5',
    xl: 'p-3',
    '2xl': 'p-4'
  }
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'inline-flex items-center justify-center rounded-md transition-colors',
        'focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    >
      <Icon name={icon} size={size} />
    </button>
  )
}

// Icon with text component
export function IconWithText({
  icon,
  children,
  iconPosition = 'left',
  gap = 'sm',
  className
}: {
  icon: IconName
  children: React.ReactNode
  iconPosition?: 'left' | 'right'
  gap?: 'xs' | 'sm' | 'md' | 'lg'
  className?: string
}) {
  const gapClasses = {
    xs: 'gap-1',
    sm: 'gap-2',
    md: 'gap-3',
    lg: 'gap-4'
  }
  
  return (
    <div className={cn('flex items-center', gapClasses[gap], className)}>
      {iconPosition === 'left' && <Icon name={icon} size="sm" />}
      {children}
      {iconPosition === 'right' && <Icon name={icon} size="sm" />}
    </div>
  )
}
