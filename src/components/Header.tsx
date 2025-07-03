'use client'

import Image from 'next/image'

export default function Header() {

  return (
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

          {/* Spacer for center alignment */}
          <div className="flex-1"></div>

          {/* Far Right - Status */}
          <div className="flex flex-col items-end space-y-1 mr-4">

            {/* Status indicator - Bottom */}
            <div className="flex items-center space-x-2 bg-green-600 bg-opacity-50 px-3 py-1 rounded-full">
              <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">Satellite Services Online</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
