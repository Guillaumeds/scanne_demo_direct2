'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { persistQueryClient } from '@tanstack/react-query-persist-client'
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'
import { useState, useEffect } from 'react'
import { z } from 'zod'

// Create persister for localStorage
const persister = createSyncStoragePersister({
  storage: typeof window !== 'undefined' ? window.localStorage : undefined,
  key: 'farm-management-cache',
  serialize: JSON.stringify,
  deserialize: JSON.parse,
})

export default function QueryProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes - data stays fresh longer
            gcTime: 24 * 60 * 60 * 1000, // 24 hours - keep in cache longer for persistence
            retry: (failureCount, error) => {
              // Don't retry on Zod validation errors
              if (error instanceof z.ZodError) {
                console.error('Zod validation error:', error.issues)
                return false
              }

              // Don't retry on 4xx errors
              if (error && typeof error === 'object' && 'status' in error) {
                const status = (error as any).status
                if (status >= 400 && status < 500) {
                  return false
                }
              }

              // Retry up to 3 times for other errors
              return failureCount < 3
            },
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
          },
          mutations: {
            retry: (failureCount, error) => {
              // Don't retry validation errors
              if (error instanceof z.ZodError) return false
              return failureCount < 2
            },
            retryDelay: 1000,
          },
        },
      })
  )

  // Initialize persistence
  useEffect(() => {
    if (typeof window !== 'undefined') {
      persistQueryClient({
        queryClient,
        persister,
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        buster: process.env.NODE_ENV === 'development' ? Date.now().toString() : '1.0.0',
      })
    }
  }, [queryClient])

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
