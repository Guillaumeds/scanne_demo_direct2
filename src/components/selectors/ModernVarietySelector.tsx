'use client'

import { useState } from 'react'
import { motion } from 'motion/react'
import { X, Search, Leaf, ExternalLink, DollarSign } from 'lucide-react'
import { useSugarcaneVarieties } from '@/hooks/useConfigurationData'
import { SugarcaneVariety } from '@/types/varieties'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { fuzzySearch } from '@/utils/fuzzySearch'
import ModernCardSelector from '@/components/selectors/ModernCardSelector'

export interface SelectedVariety {
  variety: SugarcaneVariety
}

interface ModernVarietySelectorProps {
  onSelect: (selectedVariety: SelectedVariety) => void
  onClose: () => void
  title?: string
  subtitle?: string
  varietyType?: 'sugarcane' | 'intercrop' | 'all'
}

export default function ModernVarietySelector({
  onSelect,
  onClose,
  title = "Select Sugarcane Variety",
  subtitle = "Choose from available sugarcane varieties",
  varietyType = 'sugarcane'
}: ModernVarietySelectorProps) {
  const [searchTerm, setSearchTerm] = useState('')

  // Fetch sugarcane varieties using TanStack Query
  const { data: varieties, isLoading, error } = useSugarcaneVarieties()

  // Filter varieties with fuzzy search
  const filteredVarieties = searchTerm
    ? fuzzySearch(varieties || [], searchTerm, {
        keys: ['name', 'description', 'seasons', 'soilTypes', 'characteristics.yield', 'characteristics.sugarContent', 'characteristics.diseaseResistance', 'characteristics.soilSuitability'],
        threshold: 0.2
      })
    : (varieties || [])

  const handleVarietySelect = (value: string | string[]) => {
    const varietyId = Array.isArray(value) ? value[0] : value
    if (!varietyId) return
    const selectedVariety = (varieties || []).find(v => v.id === varietyId)
    if (selectedVariety) {
      onSelect({
        variety: selectedVariety
      })
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100">
          <div className="flex items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
              <p className="text-slate-600 mt-1">{subtitle}</p>
            </div>
            {varietyType === 'sugarcane' && (
              <div className="flex flex-col gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open('http://www.msiri.mu/UserFiles/File/Recommendation_Sheet/Rec197.pdf', '_blank')}
                  className="text-xs"
                >
                  <ExternalLink className="w-3 h-3 mr-1" />
                  Harvest Guide
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open('http://www.msiri.mu/UserFiles/File/Recommendation_Sheet/Rec196.pdf', '_blank')}
                  className="text-xs"
                >
                  <ExternalLink className="w-3 h-3 mr-1" />
                  Soil Guide
                </Button>
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="p-2"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                <p className="text-slate-600">Loading varieties...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center max-w-md">
                <div className="text-red-500 text-6xl mb-4">⚠️</div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Failed to Load Varieties</h3>
                <p className="text-slate-600 mb-4">{typeof error === 'string' ? error : 'Unknown error'}</p>
                <Button onClick={() => window.location.reload()}>
                  Reload Page
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-hidden flex flex-col">
              <div className="p-6 pb-4">
                <div className="flex items-center gap-3">
                  <Search className="w-5 h-5 text-slate-400" />
                  <Input
                    placeholder="Search varieties..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>

              <ScrollArea className="h-[400px] px-6">
                <div className="pb-6">
                  <ModernCardSelector
                    options={filteredVarieties.map((variety) => {
                      const seasonTags = variety.seasons?.map(season =>
                        season.charAt(0).toUpperCase() + season.slice(1)
                      ).join(', ') || 'All seasons'
                      return {
                        id: variety.id,
                        name: variety.name,
                        description: variety.description || `Harvest: ${variety.harvestStart} - ${variety.harvestEnd}`,
                        badge: seasonTags,
                        color: 'bg-green-50',
                        icon: Leaf,
                        sugarContent: variety.sugarContentPercent,
                        soilTypes: variety.soilTypes
                      }
                    })}
                    value=""
                    onChange={handleVarietySelect}
                    layout="grid"
                    columns={2}
                  />
                </div>
                {filteredVarieties.length === 0 && (
                  <div className="text-center py-8">
                    <Leaf className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Varieties Found</h3>
                    <p className="text-muted-foreground">
                      {searchTerm
                        ? 'Try adjusting your search term.'
                        : 'No varieties available in the database.'
                      }
                    </p>
                  </div>
                )}
              </ScrollArea>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}
