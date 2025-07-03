'use client'

import { useState, useEffect } from 'react'
import { Settings, Map, ArrowLeft, Home } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface AdminLayoutProps {
  children: React.ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname()
  const [activeTab, setActiveTab] = useState('config')

  useEffect(() => {
    if (pathname === '/admin') {
      setActiveTab('config')
    } else if (pathname === '/admin/estate-setup') {
      setActiveTab('estate')
    }
  }, [pathname])

  return (
    <div className="h-screen flex flex-col">
      {/* Admin Header */}
      <header className="bg-gradient-to-r from-blue-800 via-blue-700 to-blue-600 text-white shadow-lg">
        <div className="w-full px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Left - App Title with Admin Badge */}
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

              {/* Title and Admin Badge */}
              <div className="flex flex-col">
                <div className="flex items-center space-x-3">
                  <h1 className="app-title text-3xl font-bold text-white leading-tight tracking-wide">
                    Scanne
                  </h1>
                  <div className="bg-orange-500 bg-opacity-90 px-3 py-1 rounded-full">
                    <span className="text-sm font-bold text-white">ADMIN</span>
                  </div>
                </div>
                <p className="text-blue-100 text-sm font-medium flex items-center space-x-2">
                  <span className="flex items-center space-x-1">
                    <span>🔧</span>
                    <span>System Administration</span>
                  </span>
                </p>
              </div>
            </div>

            {/* Center - Admin Navigation */}
            <div className="flex items-center space-x-2">
              <Link
                href="/admin"
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                  activeTab === 'config'
                    ? 'bg-white bg-opacity-20 text-white shadow-sm'
                    : 'bg-white bg-opacity-10 text-blue-100 hover:bg-white hover:bg-opacity-20 hover:text-white'
                }`}
                onClick={() => setActiveTab('config')}
              >
                <Settings className="w-4 h-4" />
                <span className="text-sm font-medium">System Config</span>
              </Link>

              <Link
                href="/admin/estate-setup"
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                  activeTab === 'estate'
                    ? 'bg-white bg-opacity-20 text-white shadow-sm'
                    : 'bg-white bg-opacity-10 text-blue-100 hover:bg-white hover:bg-opacity-20 hover:text-white'
                }`}
                onClick={() => setActiveTab('estate')}
              >
                <Map className="w-4 h-4" />
                <span className="text-sm font-medium">Estate Setup</span>
              </Link>
            </div>

            {/* Right - Back to Main App */}
            <div className="flex items-center space-x-2 mr-4">
              <Link
                href="/"
                className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-green-600 bg-opacity-80 text-white hover:bg-green-600 hover:bg-opacity-100 transition-all duration-200"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm font-medium">Back to Farm GIS</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 h-0 overflow-hidden">
        {children}
      </div>
    </div>
  )
}
