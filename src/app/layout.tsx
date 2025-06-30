import type { Metadata } from 'next'
import { Inter, Comfortaa } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })
const comfortaa = Comfortaa({ subsets: ['latin'], variable: '--font-comfortaa' })

export const metadata: Metadata = {
  title: 'Scanne',
  description: 'Advanced farm field management with GIS capabilities',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} ${comfortaa.variable}`}>{children}</body>
    </html>
  )
}
