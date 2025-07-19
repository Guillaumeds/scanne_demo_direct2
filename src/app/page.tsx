/**
 * Main Application Entry Point
 * Demo-only farm management system with full GIS functionality
 */

'use client'

import { Sprout, Shield, Menu } from 'lucide-react'
import { useDynamicViewportHeight } from '@/hooks/useViewportHeight'
import Image from 'next/image'
import dynamic from 'next/dynamic'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'

// Dynamically import the layout component to avoid SSR issues with Leaflet
const FarmGISLayout = dynamic(() => import('@/components/FarmGISLayout'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading Demo Farm GIS...</p>
      </div>
    </div>
  )
})

export default function HomePage() {
  // Initialize dynamic viewport height for mobile compatibility
  useDynamicViewportHeight()

  return (
    <main className="h-screen-dynamic flex flex-col">
      {/* Header */}
      <header className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 text-white shadow-lg">
        <div className="w-full px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Far Left - App Title with Scanne Logo */}
            <div className="flex items-center space-x-4 ml-4">
              {/* Scanne Logo */}
              <div className="flex-shrink-0">
                <Image
                  src="/scanne-logo.png"
                  alt="Scanne Logo"
                  width={48}
                  height={48}
                  className="drop-shadow-lg brightness-0 invert"
                  style={{ width: "auto", height: "auto" }}
                  priority
                />
              </div>

              {/* Title and Subtitle */}
              <div className="flex flex-col">
                <h1 className="app-title text-3xl font-bold text-white leading-tight tracking-wide">
                  Scanne
                </h1>
                <div className="flex items-center space-x-3">
                  <p className="text-slate-100 text-sm font-medium flex items-center space-x-2">
                    <span className="flex items-center space-x-1">
                      <span>🇲🇺</span>
                      <span>Mauritius</span>
                    </span>
                  </p>
                  <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                    Demo Mode
                  </Badge>
                </div>
              </div>
            </div>

            {/* Far Right - Menu */}
            <div className="mr-4">
              <Sheet>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="bg-white bg-opacity-10 text-slate-100 hover:bg-white hover:bg-opacity-20 hover:text-white transition-all duration-200"
                  >
                    <Menu className="w-5 h-5" />
                    <span className="sr-only">Open menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-80">
                  <SheetHeader>
                    <SheetTitle className="flex items-center gap-2">
                      <Sprout className="w-5 h-5 text-emerald-600" />
                      Scanne Applications
                    </SheetTitle>
                    <SheetDescription>
                      Demo farm management system
                    </SheetDescription>
                  </SheetHeader>

                  <div className="mt-6 space-y-4">
                    {/* Current Application */}
                    <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Sprout className="w-5 h-5 text-emerald-600" />
                          <div>
                            <h3 className="font-medium text-emerald-900">Agriculture Management</h3>
                            <p className="text-sm text-emerald-700">Demo Farm GIS & Operations</p>
                          </div>
                        </div>
                        <span className="text-xs bg-emerald-600 text-white px-2 py-1 rounded-full font-medium">
                          Active
                        </span>
                      </div>
                    </div>

                    {/* Demo Information */}
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-slate-700 mb-3">Demo Information</h4>
                      <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                        <div className="flex items-center gap-3">
                          <Shield className="w-5 h-5 text-blue-600" />
                          <div>
                            <h3 className="font-medium text-blue-900">Demo System</h3>
                            <p className="text-sm text-blue-700">All data is simulated and stored locally</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <FarmGISLayout />
      </div>
    </main>
  )
}


