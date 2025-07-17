'use client'

import { useState, useEffect } from 'react'

/**
 * Custom hook to handle dynamic viewport height
 * Addresses mobile browser address bar issues with 100vh
 */
export function useViewportHeight() {
  const [viewportHeight, setViewportHeight] = useState<number>(0)

  useEffect(() => {
    const updateViewportHeight = () => {
      // Use visualViewport if available (modern browsers)
      if (window.visualViewport) {
        setViewportHeight(window.visualViewport.height)
      } else {
        // Fallback to window.innerHeight
        setViewportHeight(window.innerHeight)
      }
    }

    // Initial calculation
    updateViewportHeight()

    // Listen for viewport changes
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', updateViewportHeight)
      window.visualViewport.addEventListener('scroll', updateViewportHeight)
    } else {
      window.addEventListener('resize', updateViewportHeight)
      window.addEventListener('orientationchange', updateViewportHeight)
    }

    // Cleanup
    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', updateViewportHeight)
        window.visualViewport.removeEventListener('scroll', updateViewportHeight)
      } else {
        window.removeEventListener('resize', updateViewportHeight)
        window.removeEventListener('orientationchange', updateViewportHeight)
      }
    }
  }, [])

  return viewportHeight
}

/**
 * Hook to get CSS custom property for dynamic viewport height
 */
export function useDynamicViewportHeight() {
  const viewportHeight = useViewportHeight()

  useEffect(() => {
    // Set CSS custom property for use in CSS
    document.documentElement.style.setProperty('--vh', `${viewportHeight * 0.01}px`)
  }, [viewportHeight])

  return viewportHeight
}

/**
 * Utility function to calculate safe viewport height
 * Accounts for mobile browser UI elements
 */
export function getSafeViewportHeight(): number {
  if (typeof window === 'undefined') return 0

  // Use visualViewport if available
  if (window.visualViewport) {
    return window.visualViewport.height
  }

  // Fallback calculation
  const windowHeight = window.innerHeight
  const documentHeight = document.documentElement.clientHeight

  // Use the smaller of the two to account for browser UI
  return Math.min(windowHeight, documentHeight)
}
