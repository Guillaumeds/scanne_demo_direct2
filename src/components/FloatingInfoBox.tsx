'use client'

export default function FloatingInfoBox() {
  return (
    <div className="absolute bottom-6 right-6 z-[1000]">
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 p-4">
        {/* Only Omnicane Logo */}
        <div className="flex items-center justify-center">
          <img
            src="/logo-omnicane.png"
            alt="Omnicane"
            className="h-16 w-auto object-contain"
          />
        </div>
      </div>
    </div>
  )
}
