/**
 * Global Error Handler
 * Displays and manages global errors from TanStack Query operations
 */

import React from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useGlobalErrors } from '@/hooks/useGlobalState'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { X, AlertTriangle, RefreshCw, Trash2 } from 'lucide-react'
import { z } from 'zod'

export function GlobalErrorHandler() {
  const { 
    hasErrors, 
    errors, 
    validationErrors, 
    networkErrors,
    dismissError, 
    clearAllErrors, 
    retryFailedQueries 
  } = useGlobalErrors()

  if (!hasErrors) return null

  return (
    <div className="fixed top-4 left-4 z-50 max-w-md space-y-2">
      <AnimatePresence>
        {/* Network Errors */}
        {networkErrors.map((error) => (
          <motion.div
            key={error.id}
            initial={{ opacity: 0, x: -300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -300 }}
            transition={{ duration: 0.3 }}
          >
            <Alert variant="destructive" className="bg-destructive/10 border-destructive/20">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle className="flex items-center justify-between">
                Network Error
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => dismissError(error.id)}
                  className="h-6 w-6 p-0 hover:bg-destructive/20"
                >
                  <X className="h-3 w-3" />
                </Button>
              </AlertTitle>
              <AlertDescription className="text-sm">
                <p className="mb-2">{error.error.message}</p>
                <p className="text-xs text-muted-foreground mb-2">
                  Query: {JSON.stringify(error.queryKey)}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={retryFailedQueries}
                    className="h-7 text-xs"
                  >
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Retry
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          </motion.div>
        ))}

        {/* Validation Errors */}
        {validationErrors.map((error) => (
          <motion.div
            key={error.id}
            initial={{ opacity: 0, x: -300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -300 }}
            transition={{ duration: 0.3 }}
          >
            <Alert variant="destructive" className="bg-yellow-50 border-yellow-200 dark:bg-yellow-900/10 dark:border-yellow-800">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <AlertTitle className="flex items-center justify-between text-yellow-800 dark:text-yellow-200">
                Data Validation Error
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => dismissError(error.id)}
                  className="h-6 w-6 p-0 hover:bg-yellow-200/20"
                >
                  <X className="h-3 w-3" />
                </Button>
              </AlertTitle>
              <AlertDescription className="text-sm text-yellow-700 dark:text-yellow-300">
                <p className="mb-2">API response does not match expected format</p>
                {error.error instanceof z.ZodError && (
                  <div className="text-xs space-y-1">
                    {error.error.issues.slice(0, 3).map((issue, idx) => (
                      <p key={idx} className="font-mono bg-yellow-100 dark:bg-yellow-900/20 p-1 rounded">
                        {issue.path.join('.')}: {issue.message}
                      </p>
                    ))}
                    {error.error.issues.length > 3 && (
                      <p className="text-muted-foreground">
                        +{error.error.issues.length - 3} more issues
                      </p>
                    )}
                  </div>
                )}
                <p className="text-xs text-muted-foreground mt-2">
                  This error will auto-dismiss in 10 seconds
                </p>
              </AlertDescription>
            </Alert>
          </motion.div>
        ))}

        {/* Global Actions */}
        {errors.length > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="flex gap-2 pt-2"
          >
            <Button
              variant="outline"
              size="sm"
              onClick={clearAllErrors}
              className="h-7 text-xs"
            >
              <Trash2 className="h-3 w-3 mr-1" />
              Clear All
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={retryFailedQueries}
              className="h-7 text-xs"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Retry All
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/**
 * Error boundary for React errors
 */
interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

export class GlobalErrorBoundary extends React.Component<
  React.PropsWithChildren<{}>,
  ErrorBoundaryState
> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('🚨 React Error Boundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="max-w-md mx-auto p-6">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Something went wrong</AlertTitle>
              <AlertDescription className="space-y-4">
                <p>The application encountered an unexpected error.</p>
                {this.state.error && (
                  <details className="text-xs">
                    <summary className="cursor-pointer">Error Details</summary>
                    <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto">
                      {this.state.error.message}
                      {'\n'}
                      {this.state.error.stack}
                    </pre>
                  </details>
                )}
                <Button
                  onClick={() => window.location.reload()}
                  className="w-full"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reload Application
                </Button>
              </AlertDescription>
            </Alert>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

/**
 * Simple error display component
 */
export function ErrorDisplay({ 
  error, 
  onRetry, 
  onDismiss 
}: { 
  error: Error
  onRetry?: () => void
  onDismiss?: () => void 
}) {
  return (
    <Alert variant="destructive" className="m-4">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle className="flex items-center justify-between">
        Error
        {onDismiss && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onDismiss}
            className="h-6 w-6 p-0"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </AlertTitle>
      <AlertDescription>
        <p className="mb-2">{error.message}</p>
        {onRetry && (
          <Button variant="outline" size="sm" onClick={onRetry}>
            <RefreshCw className="h-3 w-3 mr-1" />
            Try Again
          </Button>
        )}
      </AlertDescription>
    </Alert>
  )
}
