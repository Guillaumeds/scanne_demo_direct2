'use client'

import { useState } from 'react'

interface SubmitButtonProps {
  children: React.ReactNode
  onClick?: () => void | Promise<void>
  type?: 'button' | 'submit'
  disabled?: boolean
  variant?: 'primary' | 'secondary' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  loadingText?: string
  preventDoubleClick?: boolean
}

export default function SubmitButton({
  children,
  onClick,
  type = 'button',
  disabled = false,
  variant = 'primary',
  size = 'md',
  className = '',
  loadingText = 'Saving...',
  preventDoubleClick = true
}: SubmitButtonProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleClick = async () => {
    if (isLoading || disabled) return
    
    if (onClick) {
      try {
        setIsLoading(true)
        await onClick()
      } catch (error) {
        console.error('Submit button error:', error)
        throw error // Re-throw to allow parent error handling
      } finally {
        setIsLoading(false)
      }
    }
  }

  // Base styles
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed'
  
  // Size styles
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  }
  
  // Variant styles
  const variantStyles = {
    primary: isLoading 
      ? 'bg-green-400 text-white cursor-wait'
      : disabled
        ? 'bg-gray-300 text-gray-500'
        : 'bg-green-600 hover:bg-green-700 text-white focus:ring-green-500 active:bg-green-800',
    secondary: isLoading
      ? 'bg-gray-400 text-white cursor-wait'
      : disabled
        ? 'bg-gray-200 text-gray-400'
        : 'bg-gray-100 hover:bg-gray-200 text-gray-700 focus:ring-gray-500 active:bg-gray-300',
    danger: isLoading
      ? 'bg-red-400 text-white cursor-wait'
      : disabled
        ? 'bg-gray-300 text-gray-500'
        : 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500 active:bg-red-800'
  }

  const combinedClassName = `${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`

  return (
    <button
      type={type}
      onClick={handleClick}
      disabled={disabled || (preventDoubleClick && isLoading)}
      className={combinedClassName}
    >
      {isLoading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {isLoading ? loadingText : children}
    </button>
  )
}

// Specialized variants for common use cases
export function SaveButton(props: Omit<SubmitButtonProps, 'variant'>) {
  return <SubmitButton {...props} variant="primary" loadingText="Saving..." />
}

export function CancelButton(props: Omit<SubmitButtonProps, 'variant'>) {
  return <SubmitButton {...props} variant="secondary" />
}

export function DeleteButton(props: Omit<SubmitButtonProps, 'variant'>) {
  return <SubmitButton {...props} variant="danger" loadingText="Deleting..." />
}
