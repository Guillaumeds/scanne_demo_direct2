'use client'

import { useState } from 'react'
import { Sprout, Shield, Menu } from 'lucide-react'
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
  const [showMenu, setShowMenu] = useState(false)

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
                  style={{ width: "auto", height: "auto" }}
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

            {/* Far Right - Menu */}
            <div className="relative mr-4">
              <button
                type="button"
                onClick={() => setShowMenu(!showMenu)}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-white bg-opacity-10 text-green-100 hover:bg-white hover:bg-opacity-20 hover:text-white transition-all duration-200"
              >
                <Menu className="w-5 h-5" />
              </button>

              {/* Dropdown Menu */}
              {showMenu && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  <div className="flex items-center space-x-2 px-4 py-2 text-gray-700 bg-gray-50">
                    <Sprout className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium">Agriculture Management</span>
                    <span className="ml-auto text-xs text-green-600 font-medium">Active</span>
                  </div>
                  <a
                    href="https://scanne-hse.vercel.app/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                    onClick={() => setShowMenu(false)}
                  >
                    <Shield className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium">HSE Management</span>
                  </a>

                </div>
              )}
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
