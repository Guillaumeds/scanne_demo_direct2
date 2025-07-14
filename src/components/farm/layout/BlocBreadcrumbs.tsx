'use client'

import React from 'react'
import { ChevronRight } from 'lucide-react'
import { motion } from 'motion/react'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { useBlocContext } from '../contexts/BlocContext'

export function BlocBreadcrumbs() {
  const { breadcrumbs, setCurrentScreen } = useBlocContext()

  const handleBreadcrumbClick = (index: number) => {
    // Navigate based on breadcrumb level
    if (index === breadcrumbs.length - 2) {
      // Previous level navigation
      if (breadcrumbs.length === 4) {
        // From operation form back to operations
        setCurrentScreen('operations')
      } else if (breadcrumbs.length === 5) {
        // From work package form back to operation form
        setCurrentScreen('operation-form')
      }
    } else if (index === breadcrumbs.length - 3) {
      // Two levels back
      if (breadcrumbs.length === 5) {
        // From work package form back to operations
        setCurrentScreen('operations')
      }
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <Breadcrumb>
        <BreadcrumbList>
          {breadcrumbs.map((item, index) => (
            <React.Fragment key={index}>
              <BreadcrumbItem>
                {item.isActive ? (
                  <BreadcrumbPage className="text-primary font-medium">
                    {item.label}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink
                    onClick={() => handleBreadcrumbClick(index)}
                    className="text-muted-foreground hover:text-primary cursor-pointer transition-colors"
                  >
                    {item.label}
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {index < breadcrumbs.length - 1 && (
                <BreadcrumbSeparator>
                  <ChevronRight className="h-4 w-4" />
                </BreadcrumbSeparator>
              )}
            </React.Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
    </motion.div>
  )
}
