'use client'

import Image from 'next/image'

export default function FloatingInfoBox() {
  return (
    <div className="absolute bottom-6 right-6 z-[1000]">
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 w-60 h-40 flex items-center justify-center">
        {/* Full size Omnicane logo only - equal padding on all sides */}
        <div className="w-48 flex items-center justify-center p-4">
          <Image
            src="/logo-omnicane.png"
            alt="Omnicane Logo"
            width={176}
            height={112}
            className="object-contain"
            style={{ width: "auto", height: "auto" }}
            priority
          />
        </div>
      </div>
    </div>
  )
}
