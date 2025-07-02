'use client'

import Image from 'next/image'

export default function FloatingInfoBox() {
  return (
    <div className="absolute bottom-6 right-6 z-[1000]">
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 w-60 h-40 flex items-center justify-center">
        {/* Full size Omnicane logo only - 20% larger with equal borders */}
        <div className="w-48 h-28 flex items-center justify-center">
          <Image
            src="/logo-omnicane.png"
            alt="Omnicane Logo"
            width={192}
            height={120}
            className="object-contain w-full h-full"
            priority
          />
        </div>
      </div>
    </div>
  )
}
