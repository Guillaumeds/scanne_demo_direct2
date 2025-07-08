'use client'

import { useState } from 'react'
import { Sprout, Shield } from 'lucide-react'
import Image from 'next/image'
import dynamic from 'next/dynamic'

// Dynamically import the layout component to avoid SSR issues with Leaflet
const FarmGISLayout = dynamic(() => import('@/components/FarmGISLayout'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading Farm GIS...</p>
      </div>
    </div>
  )
})

export default function Home() {
  return (
    <main className="h-screen flex flex-col">
      {/* Header */}
      <header className="bg-gradient-to-r from-green-800 via-green-700 to-green-600 text-white shadow-lg">
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
                  priority
                />
              </div>

              {/* Title and Subtitle */}
              <div className="flex flex-col">
                <h1 className="app-title text-3xl font-bold text-white leading-tight tracking-wide">
                  Scanne
                </h1>
                <p className="text-green-100 text-sm font-medium flex items-center space-x-2">
                  <span className="flex items-center space-x-1">
                    <span>🇲🇺</span>
                    <span>Mauritius</span>
                  </span>
                </p>
              </div>
            </div>

            {/* Module Navigation */}
            <div className="flex items-center space-x-2">
              {/* Agriculture Management Module - Active */}
              <div className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-white bg-opacity-20 text-white shadow-sm">
                <Sprout className="w-4 h-4" />
                <span className="text-sm font-medium">Agriculture Management</span>
              </div>

              {/* HSE Management Module */}
              <a
                href="https://scanne-hse.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-white bg-opacity-10 text-green-100 hover:bg-white hover:bg-opacity-20 hover:text-white transition-all duration-200"
              >
                <Shield className="w-4 h-4" />
                <span className="text-sm font-medium">HSE Management</span>
              </a>
            </div>

            {/* Far Right - Status */}
            <div className="flex flex-col items-end space-y-1 mr-4">
              {/* Status indicator */}
              <div className="flex items-center space-x-2 bg-green-600 bg-opacity-50 px-3 py-1 rounded-full">
                <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">Satellite Services Online</span>
              </div>
            </div>
          </div>
        </div>
      </header>



      {/* Main Content */}
      <div className="flex-1 h-0 overflow-hidden">
        <FarmGISLayout />
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white p-3">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-4">
            <span>🌱 Sustainable Agriculture</span>
            <span>•</span>
            <span>Last sync: Live</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span>System Online</span>
          </div>
        </div>
      </footer>
    </main>
  )
}
