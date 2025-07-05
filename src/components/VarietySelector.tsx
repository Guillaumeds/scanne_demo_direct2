'use client'

import { useState, useEffect } from 'react'
import { SugarcaneVariety, InterCropPlant, CropVariety, Season, SEASON_FILTERS, SEASON_CATEGORIES } from '@/types/varieties'
import { useAllVarieties } from '@/hooks/useLocalStorageData'

interface VarietySelectorProps {
  onSelect: (variety: CropVariety) => void
  onClose: () => void
  selectedVariety?: string
  varietyType?: 'sugarcane' | 'intercrop' | 'all'
}

export default function VarietySelector({ onSelect, onClose, selectedVariety, varietyType = 'all' }: VarietySelectorProps) {
  const [selectedFilter, setSelectedFilter] = useState<Season | 'intercrop' | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [showImageViewer, setShowImageViewer] = useState(false)
  const [selectedVarietyForImage, setSelectedVarietyForImage] = useState<CropVariety | null>(null)

  // Use localStorage for varieties data
  const { data: allVarieties, loading, error } = useAllVarieties()

  // Debug: Test direct ConfigurationService call
  const testDirectCall = async () => {
    try {
      console.log('🧪 Testing direct ConfigurationService call...')
      const { ConfigurationService } = await import('@/services/configurationService')
      console.log('✅ ConfigurationService imported:', ConfigurationService)
      const varieties = await ConfigurationService.getSugarcaneVarieties()
      console.log('✅ Direct call successful:', varieties.length, 'varieties')
    } catch (error) {
      console.error('❌ Direct call failed:', error)
    }
  }

  // Filter base varieties by type
  const baseVarieties = varietyType === 'all'
    ? (allVarieties || [])
    : (allVarieties || []).filter(variety => variety.category === varietyType)

  const filteredVarieties = baseVarieties.filter(variety => {
    const matchesFilter = !selectedFilter ||
      (selectedFilter === 'intercrop' && variety.category === 'intercrop') ||
      (selectedFilter !== 'intercrop' && variety.category === 'sugarcane' &&
       (variety as SugarcaneVariety).seasons.includes(selectedFilter))

    const matchesSearch = !searchTerm ||
      variety.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      variety.description?.toLowerCase().includes(searchTerm.toLowerCase())

    return matchesFilter && matchesSearch
  })

  const handleVarietySelect = (variety: CropVariety) => {
    onSelect(variety)
    onClose()
  }

  const getSeasonTags = (variety: CropVariety) => {
    if (variety.category === 'intercrop') {
      return [] // No tags for intercrop
    }

    const sugarcaneVariety = variety as SugarcaneVariety

    // Create tags in fixed positions: Early=0, Mid=1, Late=2
    const tagPositions: ({ name: string; color: string } | null)[] = [null, null, null] // [Early, Mid, Late]
    const seasonOrder = ['early', 'mid', 'late']

    sugarcaneVariety.seasons.forEach(season => {
      const seasonFilter = SEASON_FILTERS.find(filter => filter.id === season)
      const positionIndex = seasonOrder.indexOf(season)

      if (positionIndex !== -1) {
        tagPositions[positionIndex] = {
          name: season.charAt(0).toUpperCase() + season.slice(1),
          color: seasonFilter?.tagColor || 'bg-red-500 text-white'
        }
      }
    })

    return tagPositions
  }

  const getVarietyCount = (filter: Season | 'intercrop' | null) => {
    if (!filter) return baseVarieties.length
    if (filter === 'intercrop') return baseVarieties.filter(v => v.category === 'intercrop').length
    return baseVarieties.filter(v => v.category === 'sugarcane' && (v as SugarcaneVariety).seasons.includes(filter)).length
  }

  const getHeaderText = () => {
    switch (varietyType) {
      case 'sugarcane':
        return { title: 'Select Sugar Cane Variety', subtitle: 'Choose from available sugar cane varieties' }
      case 'intercrop':
        return { title: 'Select Intercrop Variety', subtitle: 'Choose from companion crop plants' }
      default:
        return { title: 'Select Crop Variety', subtitle: 'Choose from sugarcane varieties or intercrop plants' }
    }
  }

  const getAvailableFilters = () => {
    if (varietyType === 'sugarcane') {
      return SEASON_FILTERS.filter(filter => filter.id !== 'intercrop')
    }
    if (varietyType === 'intercrop') {
      return SEASON_FILTERS.filter(filter => filter.id === 'intercrop')
    }
    return SEASON_FILTERS
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading varieties...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl p-8 text-center">
          <h2 className="text-xl font-bold text-red-600 mb-4">Error Loading Varieties</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Close
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50">
          <div className="flex items-center space-x-4">
            <div>
              <div className="flex items-center space-x-3">
                <h2 className="text-2xl font-bold text-gray-900">{getHeaderText().title}</h2>
                {varietyType === 'sugarcane' && (
                  <div className="flex flex-col space-y-1">
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => window.open('http://www.msiri.mu/UserFiles/File/Recommendation_Sheet/Rec197.pdf', '_blank')}
                        className="text-blue-500 hover:text-blue-700 transition-colors"
                        title="Sugarcane variety harvest periods information"
                      >
                        <div className="w-4 h-4 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold hover:bg-blue-600">
                          i
                        </div>
                      </button>
                      <span className="text-xs text-gray-600">Harvest periods guide</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => window.open('http://www.msiri.mu/UserFiles/File/Recommendation_Sheet/Rec196.pdf', '_blank')}
                        className="text-green-500 hover:text-green-700 transition-colors"
                        title="Sugarcane varieties and soil properties information"
                      >
                        <div className="w-4 h-4 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold hover:bg-green-600">
                          i
                        </div>
                      </button>
                      <span className="text-xs text-gray-600">Soil compatibility guide</span>
                    </div>
                  </div>
                )}
              </div>
              <p className="text-gray-600 mt-1">{getHeaderText().subtitle}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={testDirectCall}
              className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
              title="Test direct database call"
            >
              Test DB
            </button>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Close variety selector"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Filters Sidebar */}
          <div className="w-80 bg-gray-50 border-r border-gray-200 p-4 overflow-y-auto">
            <div className="mb-4">
              <input
                type="text"
                placeholder="Search varieties..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setSelectedFilter(null)}
                className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                  selectedFilter === null
                    ? 'bg-green-100 text-green-800 border border-green-200'
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-lg">🌟</span>
                  <div>
                    <div className="font-medium">All Varieties</div>
                    <div className="text-xs text-gray-500">{getVarietyCount(null)} varieties</div>
                  </div>
                </div>
              </button>

              {getAvailableFilters().map(category => {
                const varietyCount = getVarietyCount(category.id as Season | 'intercrop')
                return (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => setSelectedFilter(category.id as Season | 'intercrop')}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                      selectedFilter === category.id
                        ? 'bg-green-100 text-green-800 border border-green-200'
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-lg">{category.icon}</span>
                      <div>
                        <div className="font-medium text-sm">{category.name}</div>
                        <div className="text-xs text-gray-500">{varietyCount} varieties</div>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Varieties Grid */}
          <div className="flex-1 p-6 overflow-y-auto">
            {/* Loading State */}
            {loading && (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading varieties...</p>
                </div>
              </div>
            )}

            {/* Error State */}
            {error && !loading && (
              <div className="flex items-center justify-center h-64">
                <div className="text-center max-w-md">
                  <div className="text-red-500 text-6xl mb-4">⚠️</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to Load Varieties</h3>
                  <p className="text-gray-600 mb-4">{typeof error === 'string' ? error : error?.message || 'Unknown error'}</p>
                  <button
                    type="button"
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Reload Page
                  </button>
                </div>
              </div>
            )}

            {/* Varieties Grid */}
            {!loading && !error && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pr-24">
                {filteredVarieties.length === 0 ? (
                  <div className="col-span-full text-center py-12">
                    <div className="text-gray-400 text-6xl mb-4">🌱</div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Varieties Found</h3>
                    <p className="text-gray-600">
                      {searchTerm || selectedFilter
                        ? 'Try adjusting your search or filter.'
                        : 'No varieties are available in the database.'
                      }
                    </p>
                  </div>
                ) : (
                  filteredVarieties.map(variety => {
                const tags = getSeasonTags(variety)
                const isSelected = selectedVariety === variety.id

                return (
                  <div
                    key={variety.id}
                    onClick={() => handleVarietySelect(variety)}
                    className={`bg-white border rounded-lg p-4 hover:shadow-lg transition-all duration-200 cursor-pointer group min-h-[160px] flex flex-col relative overflow-visible ${
                      isSelected
                        ? 'border-green-500 ring-2 ring-green-200 bg-green-50'
                        : 'border-gray-200 hover:border-green-300'
                    }`}
                  >
                    {/* Bookmark-style season tags - only for sugarcane */}
                    {variety.category === 'sugarcane' && (
                      <div className="absolute top-0 right-0 flex flex-col space-y-0 z-20">
                        {tags.map((tag, index) => (
                          <div key={index} className="relative min-w-[70px] h-6">
                            {tag && (
                              <div
                                className={`${tag.color} text-[10px] font-medium px-2 py-0.5 shadow-md relative min-w-[70px] text-center`}
                                style={{
                                  clipPath: 'polygon(0 0, 100% 0, calc(100% - 6px) 50%, 100% 100%, 0 100%)'
                                }}
                              >
                                {tag.name}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Header with icon and action buttons */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl">
                          {variety.category === 'intercrop'
                            ? (variety.id === 'none' ? '🚫' : '🌿')
                            : '🎋'
                          }
                        </span>
                        {variety.category === 'sugarcane' && (variety as SugarcaneVariety).pdfUrl && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              window.open((variety as SugarcaneVariety).pdfUrl, '_blank')
                            }}
                            className="text-gray-400 hover:text-blue-600 hover:bg-blue-50 p-1.5 rounded-md transition-all duration-200 hover:shadow-md"
                            title="View variety information leaflet"
                          >
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <circle cx="12" cy="12" r="10"></circle>
                              <line x1="12" y1="16" x2="12" y2="12"></line>
                              <line x1="12" y1="8" x2="12.01" y2="8"></line>
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Variety name */}
                    <h3 className="font-semibold text-gray-900 mb-3 group-hover:text-green-700 transition-colors text-lg">
                      {variety.name}
                    </h3>

                    {/* Harvest information */}
                    {variety.category === 'sugarcane' ? (
                      <div className="space-y-2 text-sm text-gray-600 mb-4">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-500">Harvest Period:</span>
                          <span className="font-medium text-gray-900">
                            {(variety as SugarcaneVariety).harvestStart} - {(variety as SugarcaneVariety).harvestEnd}
                          </span>
                        </div>
                        {/* Soil types information */}
                        {(variety as SugarcaneVariety).soilTypes && (variety as SugarcaneVariety).soilTypes!.length > 0 ? (
                          <div className="text-xs text-gray-500">
                            Recommended soils: <span className="font-medium">{(variety as SugarcaneVariety).soilTypes!.join(', ')}</span>
                          </div>
                        ) : (
                          <div className="text-xs text-gray-400">
                            No soil recommendations available
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-2 text-sm text-gray-600 mb-4">
                        {variety.id === 'none' ? (
                          <div className="flex justify-between items-center">
                            <span className="text-gray-500">Selection:</span>
                            <span className="font-medium text-gray-900">No Intercrop</span>
                          </div>
                        ) : (
                          <>
                            <div className="flex justify-between items-center">
                              <span className="text-gray-500">Harvest Time:</span>
                              <span className="font-medium text-gray-900">{(variety as InterCropPlant).harvestTime}</span>
                            </div>
                            <div>
                              <div className="text-xs text-gray-500 mb-1">Key Benefits:</div>
                              <div className="text-xs text-green-600 font-medium">
                                {(variety as InterCropPlant).benefits.slice(0, 2).join(', ')}
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    )}

                    {/* Description */}
                    {variety.description && (
                      <div className="mb-4">
                        <p className="text-xs text-gray-500 line-clamp-2">{variety.description}</p>
                      </div>
                    )}

                    {/* Footer */}
                    <div className="mt-auto pt-3 border-t border-gray-100">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">Click to select</span>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400 group-hover:text-green-500 transition-colors">
                          <polyline points="9,18 15,12 9,6"></polyline>
                        </svg>
                      </div>
                    </div>
                    </div>
                  )
                })
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Image Viewer Modal */}
      {showImageViewer && selectedVarietyForImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h3 className="text-xl font-bold text-gray-900">{selectedVarietyForImage.name} - Variety Images</h3>
                <p className="text-gray-600 mt-1">Detailed view of stalk, leaves, and buds</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowImageViewer(false)
                  setSelectedVarietyForImage(null)
                }}
                className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Close image viewer"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            {/* Image Content */}
            <div className="flex-1 p-6 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Placeholder for variety images */}
                <div className="text-center">
                  <div className="bg-gray-100 rounded-lg p-8 mb-3 flex items-center justify-center h-48">
                    <div className="text-center">
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="mx-auto mb-2 text-gray-400">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                        <circle cx="8.5" cy="8.5" r="1.5"></circle>
                        <polyline points="21,15 16,10 5,21"></polyline>
                      </svg>
                      <p className="text-gray-500 text-sm">Stalk Image</p>
                      <p className="text-xs text-gray-400 mt-1">Coming Soon</p>
                    </div>
                  </div>
                  <h4 className="font-medium text-gray-900">Stalk Structure</h4>
                  <p className="text-sm text-gray-600">Detailed view of cane stalk and internodes</p>
                </div>

                <div className="text-center">
                  <div className="bg-gray-100 rounded-lg p-8 mb-3 flex items-center justify-center h-48">
                    <div className="text-center">
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="mx-auto mb-2 text-gray-400">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                        <circle cx="8.5" cy="8.5" r="1.5"></circle>
                        <polyline points="21,15 16,10 5,21"></polyline>
                      </svg>
                      <p className="text-gray-500 text-sm">Leaves Image</p>
                      <p className="text-xs text-gray-400 mt-1">Coming Soon</p>
                    </div>
                  </div>
                  <h4 className="font-medium text-gray-900">Leaf Characteristics</h4>
                  <p className="text-sm text-gray-600">Leaf shape, size, and arrangement patterns</p>
                </div>

                <div className="text-center">
                  <div className="bg-gray-100 rounded-lg p-8 mb-3 flex items-center justify-center h-48">
                    <div className="text-center">
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="mx-auto mb-2 text-gray-400">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                        <circle cx="8.5" cy="8.5" r="1.5"></circle>
                        <polyline points="21,15 16,10 5,21"></polyline>
                      </svg>
                      <p className="text-gray-500 text-sm">Buds Image</p>
                      <p className="text-xs text-gray-400 mt-1">Coming Soon</p>
                    </div>
                  </div>
                  <h4 className="font-medium text-gray-900">Bud Details</h4>
                  <p className="text-sm text-gray-600">Bud formation and growth characteristics</p>
                </div>
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-start space-x-3">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-600 mt-0.5">
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M9,9h0a3,3,0,0,1,3-3h0a3,3,0,0,1,3,3v1a2,2,0,0,1-2,2h-1"></path>
                    <path d="M12,17h0"></path>
                  </svg>
                  <div>
                    <h5 className="font-medium text-blue-900">Image Collection in Progress</h5>
                    <p className="text-sm text-blue-700 mt-1">
                      High-quality images of stalk, leaves, and buds for {selectedVarietyForImage.name} are being collected
                      from field research and variety documentation. These will be added to provide detailed visual
                      identification guides for farmers and researchers.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
