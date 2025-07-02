'use client'

import { useRef, useEffect } from 'react'


interface DrawnArea {
  id: string
  type: string
  coordinates: [number, number][]
  area: number
  fieldIds: string[]
}

interface BlocListProps {
  drawnAreas: DrawnArea[]
  savedAreas: DrawnArea[]
  selectedAreaId?: string | null
  onAreaSelect?: (areaId: string) => void
  onAreaDelete?: (areaId: string) => void
  onAreaHover?: (areaId: string | null) => void
  onSaveAll?: () => void
  onCancelAll?: () => void
  onBlocCardClick?: (areaId: string) => void
  onBlocPopOut?: (areaId: string) => void
  onToolSelect?: (tool: string) => void
  scrollToBloc?: string | null

}

// Individual bloc card component
function BlocCard({
  bloc,
  isDrawn,
  isSaved,
  isSelected,
  onAreaSelect,
  onAreaDelete,
  onAreaHover,
  onBlocCardClick,
  onBlocPopOut
}: {
  bloc: DrawnArea
  isDrawn: boolean
  isSaved: boolean
  isSelected: boolean
  onAreaSelect?: (areaId: string) => void
  onAreaDelete?: (areaId: string) => void
  onAreaHover?: (areaId: string | null) => void
  onBlocCardClick?: (areaId: string) => void
  onBlocPopOut?: (areaId: string) => void
}) {
  // Note: Crop cycle info will be loaded when the bloc data screen opens
  // This component only shows basic bloc information

  return (
    <div
      key={bloc.id}
      className={`
        relative p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:shadow-md
        ${isSelected
          ? 'border-blue-500 bg-blue-50 shadow-lg'
          : isDrawn
            ? 'border-blue-300 bg-blue-50/50 hover:border-blue-400'
            : 'border-gray-200 bg-white hover:border-gray-300'
        }
      `}
      onClick={() => {
        onAreaSelect?.(bloc.id)
        onBlocCardClick?.(bloc.id)
      }}
      onMouseEnter={() => onAreaHover?.(bloc.id)}
      onMouseLeave={() => onAreaHover?.(null)}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${
            isSaved ? 'bg-green-500' : 'bg-blue-500'
          }`}></div>
          <h3 className="font-semibold text-gray-900">
            Bloc {bloc.id}
          </h3>
        </div>

        <div className="flex items-center gap-1">
          {/* Pop-out icon - Only show for saved blocs */}
          {isSaved && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onBlocPopOut?.(bloc.id)
              }}
              className="text-gray-400 hover:text-blue-600 hover:bg-blue-50 p-1.5 rounded-md transition-all duration-200 hover:shadow-md"
              title="Pop out bloc details"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 9V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2-2v-2"/>
                <polyline points="7,13 12,8 21,8"/>
                <polyline points="16,3 21,8 16,13"/>
              </svg>
            </button>
          )}

          {/* Delete button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              if (confirm(`Delete Bloc ${bloc.id}?`)) {
                onAreaDelete?.(bloc.id)
              }
            }}
            className="text-gray-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded-md transition-all duration-200"
            title="Delete bloc"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="3,6 5,6 21,6"></polyline>
              <path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"></path>
              <line x1="10" y1="11" x2="10" y2="17"></line>
              <line x1="14" y1="11" x2="14" y2="17"></line>
            </svg>
          </button>
        </div>
      </div>

      {/* Bloc details */}
      <div className="space-y-1 text-sm text-gray-600">
        <div className="flex justify-between">
          <span>Area:</span>
          <span className="font-medium text-green-600">
            {bloc.area.toFixed(2)} ha
          </span>
        </div>
        <div className="flex justify-between">
          <span>Cycle:</span>
          <span className="capitalize">
            No Cycle
          </span>
        </div>
        <div className="flex justify-between">
          <span>Variety:</span>
          <span className="text-xs">
            Not Set
          </span>
        </div>
        <div className="flex justify-between">
          <span>Status:</span>
          <span className={`font-medium ${
            isSaved ? 'text-green-600' : 'text-orange-600'
          }`}>
            {isSaved ? 'Saved' : 'Draft'}
          </span>
        </div>
      </div>
    </div>
  )
}

export default function BlocList({
  drawnAreas,
  savedAreas,
  selectedAreaId,
  onAreaSelect,
  onAreaDelete,
  onAreaHover,
  onSaveAll,
  onCancelAll,
  onBlocCardClick,
  onBlocPopOut,
  onToolSelect,
  scrollToBloc
}: BlocListProps) {
  const allBlocs = [...drawnAreas, ...savedAreas]
  const totalArea = allBlocs.reduce((sum, bloc) => sum + bloc.area, 0)

  // Debug props
  console.log('📋 BlocList props:', {
    selectedAreaId,
    drawnAreasCount: drawnAreas.length,
    savedAreasCount: savedAreas.length,
    allBlocsCount: allBlocs.length,
    allBlocIds: allBlocs.map(b => b.id)
  })

  // Refs for scrolling to specific bloc cards
  const listContainerRef = useRef<HTMLDivElement>(null)
  const blocCardRefs = useRef<Map<string, HTMLDivElement>>(new Map())

  // Function to scroll to a specific bloc card
  const scrollToBlocCard = (areaId: string) => {
    console.log('📜 Attempting to scroll to bloc card:', areaId)
    const cardElement = blocCardRefs.current.get(areaId)
    if (cardElement && listContainerRef.current) {
      console.log('📜 Scrolling to card element:', cardElement)
      cardElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      })

      // Card will be highlighted through selection state, no need for temporary animation
    } else {
      console.log('❌ Could not find card element for:', areaId, {
        cardElement,
        listContainer: listContainerRef.current,
        availableCards: Array.from(blocCardRefs.current.keys())
      })
    }
  }

  // Scroll to bloc when requested externally (from map clicks)
  useEffect(() => {
    if (scrollToBloc) {
      console.log('📜 External scroll trigger for:', scrollToBloc)
      scrollToBlocCard(scrollToBloc)
    }
  }, [scrollToBloc])

  // Also scroll when selection changes (for consistency)
  useEffect(() => {
    if (selectedAreaId) {
      console.log('📜 Selection scroll trigger for:', selectedAreaId)
      scrollToBlocCard(selectedAreaId)
    }
  }, [selectedAreaId])

  const handleCardClick = (areaId: string) => {
    // Call both selection and navigation handlers
    onAreaSelect?.(areaId)
    onBlocCardClick?.(areaId)
  }



  return (
    <div className="w-80 h-full bg-white border-r border-gray-200 flex flex-col transition-all duration-300">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-bold text-gray-800">Blocs</h2>

          <div className="flex items-center space-x-2">
            {/* Add Bloc Button */}
            <button
              type="button"
              onClick={() => onToolSelect?.('polygon')}
              className="flex items-center justify-center w-8 h-8 bg-green-600 hover:bg-green-700 text-white rounded-full transition-colors duration-200 shadow-md hover:shadow-lg"
              title="Ajouter un bloc"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
            </button>
          </div>
        </div>
        <p className="text-sm text-gray-600">
          {allBlocs.length} blocs • {totalArea.toFixed(2)} ha total
        </p>
      </div>

      {/* Action buttons for drawn areas */}
      {drawnAreas.length > 0 && (
        <div className="p-4 border-b border-gray-200 bg-blue-50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-blue-800">
              {drawnAreas.length} unsaved bloc{drawnAreas.length !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onSaveAll}
              className="flex-1 bg-green-600 text-white px-3 py-2 rounded text-sm font-medium hover:bg-green-700 transition-colors"
            >
              Sauvegarder
            </button>
            <button
              type="button"
              onClick={onCancelAll}
              className="flex-1 bg-gray-600 text-white px-3 py-2 rounded text-sm font-medium hover:bg-gray-700 transition-colors"
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* Bloc list */}
      <div ref={listContainerRef} className="flex-1 overflow-y-auto">
        {allBlocs.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <div className="text-4xl mb-4">🎯</div>
            <p className="text-lg font-medium mb-2">No blocs yet</p>
            <p className="text-sm">Use the drawing tools to create cultivation blocs</p>
          </div>
        ) : (
          <div className="p-4 space-y-3">
            {allBlocs.map((bloc, index) => {
              const isDrawn = drawnAreas.some(a => a.id === bloc.id)
              const isSaved = savedAreas.some(a => a.id === bloc.id)
              const isSelected = selectedAreaId === bloc.id

              // Debug selection state
              if (bloc.id === selectedAreaId) {
                console.log('🎨 Rendering selected bloc:', {
                  blocId: bloc.id,
                  selectedAreaId,
                  isSelected,
                  isDrawn,
                  isSaved
                })
              }

              return (
                <div
                  key={bloc.id}
                  ref={(el) => {
                    if (el) {
                      blocCardRefs.current.set(bloc.id, el)
                    } else {
                      blocCardRefs.current.delete(bloc.id)
                    }
                  }}
                  className={`border rounded-lg p-3 transition-all duration-300 cursor-pointer ${
                    isSelected
                      ? 'border-blue-300 bg-blue-100 shadow-md'
                      : 'border-gray-200 hover:bg-gray-50 hover:border-gray-300 hover:shadow-sm'
                  }`}
                  style={{
                    backgroundColor: isSelected ? '#dbeafe' : undefined,
                    borderColor: isSelected ? '#93c5fd' : undefined
                  }}
                  onClick={() => handleCardClick(bloc.id)}
                  onMouseEnter={() => onAreaHover?.(bloc.id)}
                  onMouseLeave={() => onAreaHover?.(null)}
                >
                  {/* Bloc header */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {/* Status indicator */}
                      <div className={`w-3 h-3 rounded-full ${
                        isSaved ? 'bg-green-500' : 'bg-blue-500'
                      }`} />
                      <span className="font-medium text-gray-800">
                        Bloc {index + 1}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      {/* Pop-out icon - Only show for saved blocs */}
                      {isSaved && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            onBlocPopOut?.(bloc.id)
                          }}
                          className="text-gray-400 hover:text-blue-600 hover:bg-blue-50 p-1.5 rounded-md transition-all duration-200 hover:shadow-md"
                          title="Pop out bloc details"
                        >
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M21 9V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"/>
                            <polyline points="7,13 12,8 21,8"/>
                            <polyline points="16,3 21,8 16,13"/>
                          </svg>
                        </button>
                      )}

                      {/* Delete button for drawn areas */}
                      {isDrawn && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            onAreaDelete?.(bloc.id)
                          }}
                          className="text-red-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded-md transition-all duration-200 hover:shadow-md"
                          title="Delete bloc"
                        >
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <polyline points="3,6 5,6 21,6"/>
                            <path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"/>
                            <line x1="10" y1="11" x2="10" y2="17"/>
                            <line x1="14" y1="11" x2="14" y2="17"/>
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Bloc details */}
                  <div className="space-y-1 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>Area:</span>
                      <span className="font-medium text-green-600">
                        {bloc.area.toFixed(2)} ha
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Cycle:</span>
                      <span className="capitalize text-gray-500">
                        Not Set
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Variety:</span>
                      <span className="text-xs text-gray-500">
                        Not Set
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Status:</span>
                      <span className={`font-medium ${
                        isSaved ? 'text-green-600' : 'text-orange-600'
                      }`}>
                        {isSaved ? 'Saved' : 'Draft'}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Footer with summary */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="text-xs text-gray-600 space-y-1">
          <div className="flex justify-between font-medium">
            <span>Total blocs:</span>
            <span>{allBlocs.length}</span>
          </div>
          <div className="flex justify-between font-medium">
            <span>Total area:</span>
            <span>{totalArea.toFixed(2)} ha</span>
          </div>
        </div>
      </div>
    </div>
  )
}
