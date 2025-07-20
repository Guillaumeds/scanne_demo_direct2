/**
 * Cache Management Dashboard (Development Only)
 * Provides debugging tools for TanStack Query cache
 */

import React, { useState } from 'react'
import { useCacheManagement, useDevTools } from '@/hooks/useGlobalState'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Database, 
  Trash2, 
  RefreshCw, 
  Bug, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  Loader2,
  X
} from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'

export function CacheManagementDashboard() {
  const [isOpen, setIsOpen] = useState(false)
  const {
    cacheStats,
    clearCache,
    invalidateAll,
    invalidateStaleQueries,
    getQueryDetails,
    invalidateFarmData,
    invalidateBlocData,
    invalidateConfigData,
  } = useCacheManagement()
  
  const devTools = useDevTools()

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        variant="outline"
        size="sm"
        className="fixed bottom-4 right-4 z-50 bg-background/95 backdrop-blur-sm"
      >
        <Database className="h-4 w-4 mr-2" />
        Cache Debug
      </Button>
    )
  }

  const queryDetails = getQueryDetails()

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        className="fixed bottom-4 right-4 z-50 w-96 max-h-[80vh] overflow-hidden"
      >
        <Card className="bg-background/95 backdrop-blur-sm border shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Database className="h-5 w-5" />
                Cache Debug
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <CardDescription>
              TanStack Query cache management and debugging
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4 max-h-[60vh] overflow-y-auto">
            <Tabs defaultValue="stats" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="stats">Stats</TabsTrigger>
                <TabsTrigger value="queries">Queries</TabsTrigger>
                <TabsTrigger value="actions">Actions</TabsTrigger>
              </TabsList>
              
              <TabsContent value="stats" className="space-y-3">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Success: {cacheStats.successQueries}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                    <span>Error: {cacheStats.errorQueries}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 text-blue-500" />
                    <span>Loading: {cacheStats.loadingQueries}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Database className="h-4 w-4 text-gray-500" />
                    <span>Total: {cacheStats.totalQueries}</span>
                  </div>
                </div>
                
                <div className="text-sm">
                  <span className="text-muted-foreground">Cache Size: </span>
                  <Badge variant="secondary">{cacheStats.staleCacheSize}</Badge>
                </div>
              </TabsContent>
              
              <TabsContent value="queries" className="space-y-2">
                <div className="max-h-48 overflow-y-auto space-y-2">
                  {queryDetails.map((query, index) => (
                    <div
                      key={index}
                      className="p-2 border rounded text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <Badge 
                          variant={
                            query.status === 'success' ? 'default' :
                            query.status === 'error' ? 'destructive' :
                            'secondary'
                          }
                          className="text-xs"
                        >
                          {query.status}
                        </Badge>
                        {query.isStale && (
                          <Badge variant="outline" className="text-xs">
                            Stale
                          </Badge>
                        )}
                      </div>
                      <div className="font-mono text-xs text-muted-foreground">
                        {JSON.stringify(query.queryKey)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Updated: {query.dataUpdatedAt.toLocaleTimeString()}
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="actions" className="space-y-3">
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Cache Actions</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={invalidateAll}
                      className="text-xs"
                    >
                      <RefreshCw className="h-3 w-3 mr-1" />
                      Invalidate All
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={invalidateStaleQueries}
                      className="text-xs"
                    >
                      <Clock className="h-3 w-3 mr-1" />
                      Refresh Stale
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={clearCache}
                      className="text-xs"
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      Clear Cache
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Specific Invalidations</h4>
                  <div className="space-y-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={invalidateFarmData}
                      className="w-full text-xs justify-start"
                    >
                      Farm Data
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={invalidateConfigData}
                      className="w-full text-xs justify-start"
                    >
                      Config Data
                    </Button>
                  </div>
                </div>
                
                {devTools && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Dev Tools</h4>
                    <div className="space-y-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={devTools.logCacheState}
                        className="w-full text-xs justify-start"
                      >
                        <Bug className="h-3 w-3 mr-1" />
                        Log Cache State
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={async () => {
                          console.log('🔄 Force refreshing demo data...')
                          localStorage.clear()
                          const { MockApiService } = await import('@/services/mockApiService')
                          await MockApiService.refreshWithNewData()
                          window.location.reload()
                        }}
                        className="w-full text-xs justify-start text-red-600 hover:text-red-700"
                      >
                        🔄 Refresh Demo Data
                      </Button>
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  )
}

/**
 * Query Inspector Component
 */
export function QueryInspector({ queryKey }: { queryKey: readonly unknown[] }) {
  const { getQueryDetails } = useCacheManagement()
  const [isExpanded, setIsExpanded] = useState(false)
  
  if (process.env.NODE_ENV !== 'development') {
    return null
  }
  
  const queryDetails = getQueryDetails()
  const query = queryDetails.find(q => 
    JSON.stringify(q.queryKey) === JSON.stringify(queryKey)
  )
  
  if (!query) return null
  
  return (
    <div className="border rounded p-2 text-xs bg-muted/50">
      <div 
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span className="font-mono">{JSON.stringify(queryKey)}</span>
        <Badge variant={
          query.status === 'success' ? 'default' :
          query.status === 'error' ? 'destructive' :
          'secondary'
        }>
          {query.status}
        </Badge>
      </div>
      
      {isExpanded && (
        <div className="mt-2 space-y-1 text-muted-foreground">
          <div>Status: {query.status}</div>
          <div>Fetch Status: {query.fetchStatus}</div>
          <div>Is Stale: {query.isStale ? 'Yes' : 'No'}</div>
          <div>Is Invalidated: {query.isInvalidated ? 'Yes' : 'No'}</div>
          <div>Last Updated: {query.dataUpdatedAt.toLocaleString()}</div>
          {query.errorUpdatedAt && (
            <div>Last Error: {query.errorUpdatedAt.toLocaleString()}</div>
          )}
        </div>
      )}
    </div>
  )
}
