'use client'

import { useEffect, useRef } from 'react'
import L from 'leaflet'

interface SVGOverlayProps {
  map: L.Map
  svgUrl: string
  bounds: [[number, number], [number, number]] // [[south, west], [north, east]]
  opacity?: number
  zIndex?: number
  visible?: boolean
  onLoad?: () => void
  onError?: (error: Error) => void
}

/**
 * SVG Overlay Component for Leaflet
 * Displays georeferenced SVG files as map overlays
 */
export default function SVGOverlay({
  map,
  svgUrl,
  bounds,
  opacity = 0.7,
  zIndex = 200,
  visible = true,
  onLoad,
  onError
}: SVGOverlayProps) {
  const overlayRef = useRef<L.SVGOverlay | null>(null)
  const svgElementRef = useRef<SVGElement | null>(null)

  useEffect(() => {
    if (!map || !svgUrl || !bounds) return

    // Clean up existing overlay
    if (overlayRef.current) {
      map.removeLayer(overlayRef.current)
      overlayRef.current = null
    }

    // Load SVG content
    loadSVGContent(svgUrl)
      .then((svgElement) => {
        if (!svgElement) return

        svgElementRef.current = svgElement

        // Create Leaflet SVG overlay
        const overlay = L.svgOverlay(svgElement, bounds, {
          opacity: visible ? opacity : 0,
          interactive: false,
          pane: 'overlayPane'
        })

        // Set z-index
        overlay.on('add', () => {
          const element = overlay.getElement()
          if (element) {
            element.style.zIndex = zIndex.toString()
            element.style.pointerEvents = 'none' // Allow map interaction through overlay
          }
        })

        overlay.addTo(map)
        overlayRef.current = overlay

        onLoad?.()
      })
      .catch((error) => {
        console.error('Failed to load SVG overlay:', error)
        onError?.(error)
      })

    return () => {
      if (overlayRef.current) {
        map.removeLayer(overlayRef.current)
        overlayRef.current = null
      }
    }
  }, [map, svgUrl, bounds])

  // Update opacity when it changes
  useEffect(() => {
    if (overlayRef.current) {
      overlayRef.current.setOpacity(visible ? opacity : 0)
    }
  }, [opacity, visible])

  // Update z-index when it changes
  useEffect(() => {
    if (overlayRef.current) {
      const element = overlayRef.current.getElement()
      if (element) {
        element.style.zIndex = zIndex.toString()
      }
    }
  }, [zIndex])

  return null // This component doesn't render anything directly
}

/**
 * Load SVG content from URL and return as SVG element
 */
async function loadSVGContent(url: string): Promise<SVGElement | null> {
  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Failed to fetch SVG: ${response.statusText}`)
    }

    const svgText = await response.text()
    
    // Parse SVG text into DOM element
    const parser = new DOMParser()
    const doc = parser.parseFromString(svgText, 'image/svg+xml')
    
    // Check for parsing errors
    const parserError = doc.querySelector('parsererror')
    if (parserError) {
      throw new Error('Failed to parse SVG content')
    }

    const svgElement = doc.documentElement as SVGElement
    
    // Ensure it's an SVG element
    if (svgElement.tagName.toLowerCase() !== 'svg') {
      throw new Error('Invalid SVG content')
    }

    // Clone the element to avoid issues with document ownership
    return svgElement.cloneNode(true) as SVGElement
  } catch (error) {
    console.error('Error loading SVG:', error)
    throw error
  }
}

/**
 * Hook for managing multiple SVG overlays
 */
export function useSVGOverlays(map: L.Map | null) {
  const overlaysRef = useRef<Map<string, L.SVGOverlay>>(new Map())

  const addOverlay = (
    id: string,
    svgUrl: string,
    bounds: [[number, number], [number, number]],
    options: {
      opacity?: number
      zIndex?: number
      visible?: boolean
    } = {}
  ) => {
    if (!map) return

    // Remove existing overlay with same ID
    removeOverlay(id)

    loadSVGContent(svgUrl)
      .then((svgElement) => {
        if (!svgElement) return

        const overlay = L.svgOverlay(svgElement, bounds, {
          opacity: options.visible !== false ? (options.opacity || 0.7) : 0,
          interactive: false,
          pane: 'overlayPane'
        })

        overlay.on('add', () => {
          const element = overlay.getElement()
          if (element) {
            element.style.zIndex = (options.zIndex || 200).toString()
            element.style.pointerEvents = 'none'
          }
        })

        overlay.addTo(map)
        overlaysRef.current.set(id, overlay)
      })
      .catch((error) => {
        console.error(`Failed to add SVG overlay ${id}:`, error)
      })
  }

  const removeOverlay = (id: string) => {
    const overlay = overlaysRef.current.get(id)
    if (overlay && map) {
      map.removeLayer(overlay)
      overlaysRef.current.delete(id)
    }
  }

  const setOverlayOpacity = (id: string, opacity: number) => {
    const overlay = overlaysRef.current.get(id)
    if (overlay) {
      overlay.setOpacity(opacity)
    }
  }

  const setOverlayVisibility = (id: string, visible: boolean) => {
    const overlay = overlaysRef.current.get(id)
    if (overlay) {
      overlay.setOpacity(visible ? 0.7 : 0)
    }
  }

  const clearAllOverlays = () => {
    if (map) {
      overlaysRef.current.forEach((overlay) => {
        map.removeLayer(overlay)
      })
      overlaysRef.current.clear()
    }
  }

  return {
    addOverlay,
    removeOverlay,
    setOverlayOpacity,
    setOverlayVisibility,
    clearAllOverlays,
    overlays: overlaysRef.current
  }
}
