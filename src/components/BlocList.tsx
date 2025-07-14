'use client'

import { useRef, useEffect, useState } from 'react'
import { CropCycleService } from '@/services/cropCycleService'
import { DrawnArea, DrawnAreaUtils, DrawnAreaGuards } from '@/types/drawnArea'
import SubmitButton, { SaveButton, CancelButton } from '@/components/ui/SubmitButton'

interface BlocCycleData {
  blocId: string
  blocStatus: 'active' | 'retired' // Bloc status from database (removed 'planned')
  hasActiveCycle: boolean
  cycleType?: string
  varietyName?: string
  intercropName?: string
  cycleNumber?: number
  plannedHarvestDate?: string
  growthStage?: string
  growthStageName?: string
  growthStageColor?: string
  growthStageIcon?: string
  daysSincePlanting?: number
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

  // Crop cycle data for all blocs
  const [cropCycleDataMap, setCropCycleDataMap] = useState<Record<string, BlocCycleData>>({})

  // Load crop cycle data for all saved blocs using optimized batch method
  useEffect(() => {
    const loadCropCycleData = async () => {
      if (savedAreas.length === 0) return

      try {
        // Loading crop cycle data

        // Get all bloc IDs
        const blocIds = savedAreas.map(bloc => DrawnAreaUtils.getEntityKey(bloc))

        // Use optimized batch method to avoid 406 errors
        const batchData = await CropCycleService.getBlocSummariesBatch(blocIds)

        setCropCycleDataMap(batchData)
        // Batch crop cycle data loaded
      } catch (error) {
        console.error('❌ Error loading crop cycle data batch:', error)
        // Fallback: set all blocs as having no cycles
        const fallbackMap: typeof cropCycleDataMap = {}
        savedAreas.forEach(bloc => {
          const blocKey = DrawnAreaUtils.getEntityKey(bloc)
          fallbackMap[blocKey] = {
            blocId: blocKey,
            blocStatus: 'active',
            hasActiveCycle: false
          }
        })
        setCropCycleDataMap(fallbackMap)
      }
    }

    loadCropCycleData()
  }, [savedAreas]) // Re-run when saved areas change

  // Props validation
  if (process.env.NODE_ENV === 'development') {
    // Only log in development if there are issues
    if (allBlocs.length === 0 && (drawnAreas.length > 0 || savedAreas.length > 0)) {
      console.warn('⚠️ BlocList: Areas provided but allBlocs is empty')
    }
  }

  // Refs for scrolling to specific bloc cards
  const listContainerRef = useRef<HTMLDivElement>(null)
  const blocCardRefs = useRef<Map<string, HTMLDivElement>>(new Map())

  // Function to scroll to a specific bloc card
  const scrollToBlocCard = (areaId: string) => {
    const cardElement = blocCardRefs.current.get(areaId)
    const container = listContainerRef.current

    if (cardElement && container) {
      console.log('📜 Scrolling to card element:', cardElement)

      // Calculate positions relative to the container
      const containerRect = container.getBoundingClientRect()
      const cardRect = cardElement.getBoundingClientRect()

      // Calculate the scroll position needed to center the card in the container
      const containerScrollTop = container.scrollTop
      const cardOffsetTop = cardRect.top - containerRect.top + containerScrollTop
      const containerHeight = container.clientHeight
      const cardHeight = cardRect.height

      // Center the card in the container
      const targetScrollTop = cardOffsetTop - (containerHeight / 2) + (cardHeight / 2)

      // Smooth scroll within the container only
      container.scrollTo({
        top: Math.max(0, targetScrollTop),
        behavior: 'smooth'
      })

      // Card will be highlighted through selection state, no need for temporary animation
    } else if (process.env.NODE_ENV === 'development') {
      console.warn('⚠️ Could not find card element for scroll:', areaId)
    }
  }

  // Scroll to bloc when requested externally (from map clicks)
  useEffect(() => {
    if (scrollToBloc) {
      scrollToBlocCard(scrollToBloc)
    }
  }, [scrollToBloc])

  // Also scroll when selection changes (for consistency)
  useEffect(() => {
    if (selectedAreaId) {
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
            <SaveButton
              onClick={onSaveAll}
              className="flex-1"
              size="sm"
              loadingText="Sauvegarde..."
            >
              Sauvegarder
            </SaveButton>
            <CancelButton
              onClick={onCancelAll}
              className="flex-1"
              size="sm"
            >
              Annuler
            </CancelButton>
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
              const blocKey = DrawnAreaUtils.getEntityKey(bloc)
              const isDrawn = drawnAreas.some(a => DrawnAreaUtils.getEntityKey(a) === blocKey)
              const isSaved = savedAreas.some(a => DrawnAreaUtils.getEntityKey(a) === blocKey)
              const isSelected = selectedAreaId === blocKey

              // Debug selection state
              if (blocKey === selectedAreaId) {
                // Rendering selected bloc
              }

              return (
                <div
                  key={blocKey}
                  ref={(el) => {
                    if (el) {
                      blocCardRefs.current.set(blocKey, el)
                    } else {
                      blocCardRefs.current.delete(blocKey)
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
                  onClick={() => handleCardClick(blocKey)}
                  onMouseEnter={() => !isSelected && onAreaHover?.(blocKey)}
                  onMouseLeave={() => !isSelected && onAreaHover?.(null)}
                >
                  {/* Bloc header */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {/* Status indicator */}
                      <div className={`w-3 h-3 rounded-full ${
                        isSaved ? 'bg-green-500' : 'bg-blue-500'
                      }`} />
                      <span className="font-medium text-gray-800">
                        {DrawnAreaUtils.getDisplayName(bloc)}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      {/* Pop-out icon - Only show for saved blocs */}
                      {isSaved && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            onBlocPopOut?.(DrawnAreaUtils.getEntityKey(bloc))
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
                            onAreaDelete?.(blocKey)
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
                      <span className="capitalize text-xs">
                        {(() => {
                          const cycleData = cropCycleDataMap[blocKey]
                          if (!cycleData) return <span className="text-gray-500">No Cycle</span>
                          if (cycleData.hasActiveCycle) {
                            return (
                              <span className="text-green-600">
                                {cycleData.cycleType === 'plantation' ? 'Plantation' : `Ratoon ${cycleData.cycleNumber! - 1}`}
                              </span>
                            )
                          }
                          return <span className="text-gray-500">No Cycle</span>
                        })()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Variety:</span>
                      <span className="text-xs">
                        {(() => {
                          const cycleData = cropCycleDataMap[blocKey]
                          if (cycleData?.varietyName) {
                            return <span className="text-blue-600 font-medium">{cycleData.varietyName}</span>
                          }
                          return <span className="text-gray-500">Not Set</span>
                        })()}
                      </span>
                    </div>
                    {cropCycleDataMap[blocKey]?.hasActiveCycle && cropCycleDataMap[blocKey]?.growthStageName && (
                      <div className="flex justify-between">
                        <span>Stage:</span>
                        <span className="text-xs">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${cropCycleDataMap[blocKey]?.growthStageColor}`}>
                            {cropCycleDataMap[blocKey]?.growthStageIcon} {cropCycleDataMap[blocKey]?.growthStageName}
                          </span>
                        </span>
                      </div>
                    )}
                    {cropCycleDataMap[blocKey]?.plannedHarvestDate && (
                      <div className="flex justify-between">
                        <span>Harvest:</span>
                        <span className="text-xs text-orange-600 font-medium">
                          {new Date(cropCycleDataMap[blocKey].plannedHarvestDate!).toLocaleDateString('en-GB', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                    )}
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
