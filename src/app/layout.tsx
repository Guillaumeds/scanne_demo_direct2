import type { Metadata, Viewport } from 'next'
import { Inter, Comfortaa } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })
const comfortaa = Comfortaa({ subsets: ['latin'], variable: '--font-comfortaa' })

export const metadata: Metadata = {
  title: 'Scanne',
  description: 'Advanced farm field management with GIS capabilities',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1.0,
  minimumScale: 1.0,
  maximumScale: 1.0,
  userScalable: false,
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} ${comfortaa.variable}`}>
        <div className="h-screen bg-gray-50 overflow-hidden">
          {children}
        </div>
      </body>
    </html>
  )
}
