'use client'

interface DrawingProgressProps {
  pointCount: number
  isDrawing: boolean
  activeTool: string | null
  onCancel?: () => void
}

export default function DrawingProgress({ pointCount, isDrawing, activeTool, onCancel }: DrawingProgressProps) {
  if (activeTool !== 'polygon' || !isDrawing) return null

  return (
    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[1600]">
      <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-lg shadow-lg px-4 py-3 border border-blue-200">
        <div className="flex items-center space-x-3">
          {/* Progress indicator */}
          <div className="flex items-center space-x-2">
            {/* Step indicators */}
            {[1, 2].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${
                  (step === 1 && pointCount === 0) || (step === 2 && pointCount > 0)
                    ? 'bg-blue-500 text-white animate-pulse'
                    : pointCount > 0 && step === 1
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-500'
                }`}>
                  {(step === 1 && pointCount > 0) ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20,6 9,17 4,12"/>
                    </svg>
                  ) : (
                    step
                  )}
                </div>
                {step < 2 && (
                  <div className={`w-8 h-0.5 mx-1 transition-all duration-300 ${
                    pointCount > 0 ? 'bg-green-500' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>

          {/* Status text */}
          <div className="text-sm">
            {pointCount === 0 && (
              <span className="text-blue-600 font-medium">Cliquez pour commencer à dessiner le bloc</span>
            )}
            {pointCount > 0 && (
              <div className="flex items-center space-x-2">
                <span className="text-green-600 font-medium">{pointCount} points</span>
                <div className="flex items-center space-x-1 text-xs text-gray-600">
                  <span>•</span>
                  <span>Clic droit pour terminer</span>
                </div>
              </div>
            )}
          </div>

          {/* Cancel button */}
          <button
            type="button"
            onClick={() => {
              onCancel?.()
            }}
            className="text-gray-400 hover:text-red-500 transition-colors duration-200"
            title="Annuler le dessin (ESC)"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
