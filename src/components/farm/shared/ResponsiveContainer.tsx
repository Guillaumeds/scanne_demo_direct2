'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'motion/react'

interface ResponsiveContainerProps {
  children: React.ReactNode
  className?: string
}

export function ResponsiveContainer({ children, className = '' }: ResponsiveContainerProps) {
  const [isMobile, setIsMobile] = useState(false)
  const [isTablet, setIsTablet] = useState(false)

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768)
      setIsTablet(window.innerWidth >= 768 && window.innerWidth < 1024)
    }

    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])

  return (
    <motion.div
      className={`${className} ${
        isMobile ? 'px-4 py-2' : isTablet ? 'px-6 py-4' : 'px-8 py-6'
      }`}
      layout
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.div>
  )
}

// Hook for responsive behavior
export function useResponsive() {
  const [screenSize, setScreenSize] = useState({
    isMobile: false,
    isTablet: false,
    isDesktop: false
  })

  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth
      setScreenSize({
        isMobile: width < 768,
        isTablet: width >= 768 && width < 1024,
        isDesktop: width >= 1024
      })
    }

    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])

  return screenSize
}

// Responsive grid component
interface ResponsiveGridProps {
  children: React.ReactNode
  mobileColumns?: number
  tabletColumns?: number
  desktopColumns?: number
  gap?: number
  className?: string
}

export function ResponsiveGrid({
  children,
  mobileColumns = 1,
  tabletColumns = 2,
  desktopColumns = 3,
  gap = 4,
  className = ''
}: ResponsiveGridProps) {
  const { isMobile, isTablet } = useResponsive()

  const columns = isMobile ? mobileColumns : isTablet ? tabletColumns : desktopColumns

  return (
    <motion.div
      className={`grid gap-${gap} ${className}`}
      style={{
        gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`
      }}
      layout
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  )
}

// Touch-friendly button wrapper
interface TouchFriendlyProps {
  children: React.ReactNode
  onTap?: () => void
  className?: string
}

export function TouchFriendly({ children, onTap, className = '' }: TouchFriendlyProps) {
  const { isMobile } = useResponsive()

  return (
    <motion.div
      className={`${className} ${isMobile ? 'min-h-12 min-w-12' : ''}`}
      whileTap={{ scale: 0.95 }}
      onTap={onTap}
      style={{
        touchAction: 'manipulation'
      }}
    >
      {children}
    </motion.div>
  )
}
