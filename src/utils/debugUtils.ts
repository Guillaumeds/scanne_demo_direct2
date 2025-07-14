/**
 * Debug utilities for development and performance monitoring
 */

// Performance monitoring
export const performanceMonitor = {
  startTime: Date.now(),
  
  mark(label: string) {
    if (typeof window !== 'undefined' && window.performance) {
      window.performance.mark(label)
    }
  },
  
  measure(name: string, startMark: string, endMark: string) {
    if (typeof window !== 'undefined' && window.performance) {
      try {
        window.performance.measure(name, startMark, endMark)
        const measure = window.performance.getEntriesByName(name)[0]
        console.log(`⏱️ ${name}: ${measure.duration.toFixed(2)}ms`)
      } catch (error) {
        console.warn('Performance measurement failed:', error)
      }
    }
  },
  
  logPageLoad() {
    if (typeof window !== 'undefined') {
      window.addEventListener('load', () => {
        const loadTime = Date.now() - this.startTime
        console.log(`🚀 Page loaded in ${loadTime}ms`)
        
        // Log Core Web Vitals if available
        if ('web-vitals' in window) {
          console.log('📊 Core Web Vitals monitoring active')
        }
      })
    }
  }
}

// Console utilities
export const debugConsole = {
  group(title: string, collapsed = false) {
    if (collapsed) {
      console.groupCollapsed(`🔍 ${title}`)
    } else {
      console.group(`🔍 ${title}`)
    }
  },
  
  groupEnd() {
    console.groupEnd()
  },
  
  success(message: string, ...args: any[]) {
    console.log(`✅ ${message}`, ...args)
  },
  
  error(message: string, ...args: any[]) {
    console.error(`❌ ${message}`, ...args)
  },
  
  warning(message: string, ...args: any[]) {
    console.warn(`⚠️ ${message}`, ...args)
  },
  
  info(message: string, ...args: any[]) {
    console.info(`ℹ️ ${message}`, ...args)
  },
  
  debug(message: string, ...args: any[]) {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`🐛 ${message}`, ...args)
    }
  }
}

// Network monitoring
export const networkMonitor = {
  logFetch(url: string, options?: RequestInit) {
    const startTime = Date.now()
    debugConsole.debug(`🌐 Fetching: ${url}`)
    
    return {
      onComplete: (response: Response) => {
        const duration = Date.now() - startTime
        if (response.ok) {
          debugConsole.success(`Network request completed: ${url} (${duration}ms)`)
        } else {
          debugConsole.error(`Network request failed: ${url} (${response.status}) (${duration}ms)`)
        }
      },
      onError: (error: Error) => {
        const duration = Date.now() - startTime
        debugConsole.error(`Network request error: ${url} (${duration}ms)`, error)
      }
    }
  }
}

// Development helpers
export const devHelpers = {
  clearCache() {
    if (typeof window !== 'undefined') {
      localStorage.clear()
      sessionStorage.clear()
      debugConsole.success('Cache cleared')
    }
  },
  
  logEnvironment() {
    debugConsole.group('Environment Info')
    console.log('NODE_ENV:', process.env.NODE_ENV)
    console.log('Next.js version:', process.env.NEXT_RUNTIME || 'Unknown')
    if (typeof window !== 'undefined') {
      console.log('User Agent:', navigator.userAgent)
      console.log('Viewport:', `${window.innerWidth}x${window.innerHeight}`)
    }
    debugConsole.groupEnd()
  },
  
  logPerformance() {
    if (typeof window !== 'undefined' && window.performance) {
      debugConsole.group('Performance Metrics')
      const navigation = window.performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      if (navigation) {
        console.log('DNS Lookup:', `${navigation.domainLookupEnd - navigation.domainLookupStart}ms`)
        console.log('TCP Connect:', `${navigation.connectEnd - navigation.connectStart}ms`)
        console.log('Request:', `${navigation.responseStart - navigation.requestStart}ms`)
        console.log('Response:', `${navigation.responseEnd - navigation.responseStart}ms`)
        console.log('DOM Loading:', `${navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart}ms`)
      }
      debugConsole.groupEnd()
    }
  }
}

// Initialize debug utilities in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  // Make debug functions globally available
  (window as any).debugUtils = {
    clearCache: devHelpers.clearCache,
    logEnvironment: devHelpers.logEnvironment,
    logPerformance: devHelpers.logPerformance,
    performanceMonitor,
    debugConsole
  }
  
  // Debug utilities available in development
  
  // Start performance monitoring
  performanceMonitor.logPageLoad()
}
