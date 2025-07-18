

// Simple variety type matching actual database schema
export interface SugarcaneVariety {
  id: string // Database ID
  name: string
  description: string | null
  created_at: string | null
  updated_at: string | null
  // Legacy fields for backward compatibility
  uuid?: string
  category?: VarietyCategory
  harvestStart?: string
  harvestEnd?: string
  seasons?: Season[]
  image?: string
  pdfUrl?: string
  soilTypes?: string[]
  characteristics?: {
    yield?: string
    sugarContent?: string
    diseaseResistance?: string
    soilSuitability?: string
  }
  yieldPotential?: number
  sugarContentPercent?: number
  informationLeafletUrl?: string
}

// Simple intercrop type matching actual database schema
export interface InterCropPlant {
  id: string // Database ID
  name: string
  description: string | null
  created_at: string | null
  updated_at: string | null
  // Legacy fields for backward compatibility
  uuid?: string
  scientificName?: string
  category?: 'intercrop'
  benefits?: string[]
  plantingTime?: string
  harvestTime?: string
  image?: string
}

export type VarietyCategory = 'sugarcane' | 'intercrop'

export type Season = 'early' | 'mid' | 'late'

export const SEASON_CATEGORIES = [
  {
    id: 'early' as Season,
    name: 'Early Season Harvest',
    icon: '🌱',
    color: 'bg-green-100 text-green-800 border-green-200',
    tagColor: 'bg-green-500 text-white'
  },
  {
    id: 'mid' as Season,
    name: 'Mid Season Harvest',
    icon: '🌾',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    tagColor: 'bg-blue-500 text-white'
  },
  {
    id: 'late' as Season,
    name: 'Late Season Harvest',
    icon: '🌰',
    color: 'bg-orange-100 text-orange-800 border-orange-200',
    tagColor: 'bg-orange-500 text-white'
  },
  {
    id: 'intercrop' as const,
    name: 'Inter-Crop',
    icon: '🌿',
    color: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    tagColor: 'bg-emerald-500 text-white'
  }
]

// Export SEASON_FILTERS as an alias for SEASON_CATEGORIES for backward compatibility
export const SEASON_FILTERS = SEASON_CATEGORIES

// Helper function to determine seasons based on harvest months
function getSeasons(start: string, end: string): Season[] {
  const monthToSeason: Record<string, Season> = {
    'Jun': 'early',
    'Jul': 'early',
    'Aug': 'mid',
    'Sep': 'mid',
    'Oct': 'mid',
    'Nov': 'late',
    'Dec': 'late'
  }

  const startSeason = monthToSeason[start]
  const endSeason = monthToSeason[end]

  if (!startSeason || !endSeason) {
    return []
  }

  if (startSeason === endSeason) {
    return [startSeason]
  }

  // Handle ranges that span multiple seasons
  const seasons: Season[] = []

  // Add all seasons between start and end
  const seasonOrder: Season[] = ['early', 'mid', 'late']
  const startIndex = seasonOrder.indexOf(startSeason)
  const endIndex = seasonOrder.indexOf(endSeason)

  if (startIndex !== -1 && endIndex !== -1) {
    for (let i = startIndex; i <= endIndex; i++) {
      if (!seasons.includes(seasonOrder[i])) {
        seasons.push(seasonOrder[i])
      }
    }
  }

  return seasons
}

// ❌ REMOVED: Hardcoded SUGARCANE_VARIETIES array
// Now using database-driven data via ConfigurationService.getSugarcaneVarieties()

// ❌ REMOVED: Hardcoded INTERCROP_PLANTS array
// Now using database-driven data via ConfigurationService.getIntercropVarieties()

export type CropVariety = SugarcaneVariety | InterCropPlant



// ❌ REMOVED: Hardcoded ALL_VARIETIES array
// Now using database-driven data via ConfigurationService.getAllVarieties()
