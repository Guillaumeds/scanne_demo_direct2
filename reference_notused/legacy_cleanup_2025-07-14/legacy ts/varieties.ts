export interface SugarcaneVariety {
  id: string
  name: string
  category: VarietyCategory
  harvestStart: string // Month abbreviation (Jun, Jul, Aug, etc.)
  harvestEnd: string // Month abbreviation
  seasons: Season[]
  description?: string
  image?: string
  pdfUrl?: string // Link to variety leaflet/pamphlet
  soilTypes?: string[] // Recommended soil types (B1, B2, F1, F2, H1, H2, L1, L2, P1, P2, P3)
  characteristics?: {
    yield?: string
    sugarContent?: string
    diseaseResistance?: string
    soilSuitability?: string
  }
}

export interface InterCropPlant {
  id: string
  name: string
  scientificName?: string
  category: 'intercrop'
  benefits: string[]
  plantingTime?: string
  harvestTime?: string
  image?: string
  description?: string
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

export const SUGARCANE_VARIETIES: SugarcaneVariety[] = [
  { id: 'm-1176-77', name: 'M 1176/77', category: 'sugarcane', harvestStart: 'Aug', harvestEnd: 'Sep', seasons: getSeasons('Aug', 'Sep'), soilTypes: ['L1', 'L2', 'P1', 'P2', 'P3'] },
  { id: 'm-52-78', name: 'M 52/78', category: 'sugarcane', harvestStart: 'Jun', harvestEnd: 'Aug', seasons: getSeasons('Jun', 'Aug'), soilTypes: ['B1', 'B2', 'F1', 'F2', 'H1', 'H2', 'L2'] },
  { id: 'm-387-85', name: 'M 387/85', category: 'sugarcane', harvestStart: 'Jul', harvestEnd: 'Oct', seasons: getSeasons('Jul', 'Oct'), soilTypes: ['B1', 'B2'] },
  { id: 'm-1400-86', name: 'M 1400/86', category: 'sugarcane', harvestStart: 'Aug', harvestEnd: 'Sep', seasons: getSeasons('Aug', 'Sep'), soilTypes: ['B1', 'B2', 'F1', 'F2', 'H1', 'H2', 'L1', 'L2', 'P1', 'P2', 'P3'] },
  { id: 'm-2256-88', name: 'M 2256/88', category: 'sugarcane', harvestStart: 'Jun', harvestEnd: 'Sep', seasons: getSeasons('Jun', 'Sep'), soilTypes: ['B1', 'B2', 'F1', 'F2', 'H1', 'H2', 'L1', 'L2', 'P1', 'P2', 'P3'] },
  { id: 'm-703-89', name: 'M 703/89', category: 'sugarcane', harvestStart: 'Jun', harvestEnd: 'Jul', seasons: getSeasons('Jun', 'Jul'), soilTypes: ['H1', 'H2', 'L1', 'L2'] },
  { id: 'm-1861-89', name: 'M 1861/89', category: 'sugarcane', harvestStart: 'Aug', harvestEnd: 'Nov', seasons: getSeasons('Aug', 'Nov'), soilTypes: ['B1', 'B2', 'F1', 'F2', 'H1', 'H2'] },
  { id: 'm-1672-90', name: 'M 1672/90', category: 'sugarcane', harvestStart: 'Aug', harvestEnd: 'Nov', seasons: getSeasons('Aug', 'Nov'), soilTypes: ['L1', 'L2', 'P1', 'P2', 'P3'] },
  { id: 'm-2593-92', name: 'M 2593/92', category: 'sugarcane', harvestStart: 'Aug', harvestEnd: 'Nov', seasons: getSeasons('Aug', 'Nov'), pdfUrl: '/sugarcane_varieties_leaflets/m2593.pdf', soilTypes: ['H1', 'H2', 'L1', 'L2', 'P1', 'P2', 'P3'] },
  { id: 'm-2283-98', name: 'M 2283/98', category: 'sugarcane', harvestStart: 'Aug', harvestEnd: 'Nov', seasons: getSeasons('Aug', 'Nov'), image: '/images/varieties/m-2283-98.jpg', pdfUrl: 'http://www.msiri.mu/UserFiles/File/sugarcane%20pamphlets/M%2283-98.pdf', soilTypes: ['B1', 'B2', 'F1', 'F2'] },
  { id: 'm-683-99', name: 'M 683/99', category: 'sugarcane', harvestStart: 'Aug', harvestEnd: 'Nov', seasons: getSeasons('Aug', 'Nov'), pdfUrl: 'http://www.msiri.mu/UserFiles/File/sugarcane%20pamphlets/M%20683-99.pdf', soilTypes: ['L1', 'L2', 'P1', 'P2', 'P3'] },
  { id: 'm-1989-99', name: 'M 1989/99', category: 'sugarcane', harvestStart: 'Aug', harvestEnd: 'Oct', seasons: getSeasons('Aug', 'Oct'), pdfUrl: 'http://www.msiri.mu/UserFiles/File/sugarcane%20pamphlets/M%201989-99.pdf', soilTypes: ['L1', 'L2', 'P1', 'P2', 'P3'] },
  { id: 'm-2502-99', name: 'M 2502/99', category: 'sugarcane', harvestStart: 'Aug', harvestEnd: 'Oct', seasons: getSeasons('Aug', 'Oct'), pdfUrl: 'http://www.msiri.mu/UserFiles/File/sugarcane%20pamphlets/M%202502-99.pdf', soilTypes: ['B1', 'B2', 'F1', 'F2', 'P1', 'P2', 'P3'] },
  { id: 'm-1392-00', name: 'M 1392/00', category: 'sugarcane', harvestStart: 'Jul', harvestEnd: 'Oct', seasons: getSeasons('Jul', 'Oct'), image: '/images/varieties/m-1392-00.jpg', pdfUrl: 'http://www.msiri.mu/UserFiles/File/sugarcane%20pamphlets/M%201392-00.pdf', soilTypes: ['B1', 'B2', 'F1', 'F2', 'L1', 'L2', 'P1', 'P2', 'P3'] },
  { id: 'm-63', name: 'M 63', category: 'sugarcane', harvestStart: 'Aug', harvestEnd: 'Oct', seasons: getSeasons('Aug', 'Oct'), soilTypes: ['L1', 'L2', 'P1', 'P2', 'P3'] },
  { id: 'm-1561-01', name: 'M 1561/01', category: 'sugarcane', harvestStart: 'Jun', harvestEnd: 'Oct', seasons: getSeasons('Jun', 'Oct'), soilTypes: ['B1', 'B2'] },
  { id: 'm-216-02', name: 'M 216/02', category: 'sugarcane', harvestStart: 'Jun', harvestEnd: 'Oct', seasons: getSeasons('Jun', 'Oct'), soilTypes: ['L1', 'L2', 'P1', 'P2', 'P3'] },
  { id: 'm-1002-02', name: 'M 1002/02', category: 'sugarcane', harvestStart: 'Aug', harvestEnd: 'Nov', seasons: getSeasons('Aug', 'Nov'), pdfUrl: 'http://www.msiri.mu/UserFiles/File/sugarcane%20pamphlets/M%201002-02.pdf', soilTypes: ['L1', 'L2', 'P1', 'P2', 'P3'] },
  { id: 'm-1698-02', name: 'M 1698/02', category: 'sugarcane', harvestStart: 'Aug', harvestEnd: 'Nov', seasons: getSeasons('Aug', 'Nov'), soilTypes: ['L1', 'L2', 'P1', 'P2', 'P3'] },
  { id: 'm-64', name: 'M 64', category: 'sugarcane', harvestStart: 'Aug', harvestEnd: 'Nov', seasons: getSeasons('Aug', 'Nov'), soilTypes: ['B1', 'B2', 'F1', 'F2'] },
  { id: 'm-1256-04', name: 'M 1256/04', category: 'sugarcane', harvestStart: 'Aug', harvestEnd: 'Oct', seasons: getSeasons('Aug', 'Oct'), pdfUrl: 'http://www.msiri.mu/UserFiles/File/sugarcane%20pamphlets/M%201256-04.pdf', soilTypes: ['L1', 'L2', 'P1', 'P2', 'P3'] },
  { id: 'm-915-05', name: 'M 915/05', category: 'sugarcane', harvestStart: 'Aug', harvestEnd: 'Nov', seasons: getSeasons('Aug', 'Nov'), pdfUrl: 'http://www.msiri.mu/UserFiles/File/sugarcane%20pamphlets/M%20915-05.pdf', soilTypes: ['B1', 'B2', 'F1', 'F2', 'H1', 'H2', 'L1', 'L2', 'P1', 'P2', 'P3'] },
  { id: 'm-65', name: 'M 65', category: 'sugarcane', harvestStart: 'Aug', harvestEnd: 'Oct', seasons: getSeasons('Aug', 'Oct'), soilTypes: ['B1', 'B2', 'P1', 'P2', 'P3'] },
  { id: 'r573', name: 'R573', category: 'sugarcane', harvestStart: 'Jul', harvestEnd: 'Sep', seasons: getSeasons('Jul', 'Sep'), soilTypes: ['H1', 'H2', 'L1', 'L2', 'P1', 'P2', 'P3'] },
  { id: 'r575', name: 'R575', category: 'sugarcane', harvestStart: 'Jun', harvestEnd: 'Aug', seasons: getSeasons('Jun', 'Aug'), pdfUrl: 'https://www.ercane.re/nos-varietes/r-575/', soilTypes: ['H1', 'H2', 'L1', 'L2', 'P1', 'P2', 'P3'] },
  { id: 'r579', name: 'R579', category: 'sugarcane', harvestStart: 'Oct', harvestEnd: 'Dec', seasons: getSeasons('Oct', 'Dec'), pdfUrl: 'https://www.ercane.re/nos-varietes/r-579/', soilTypes: ['H1', 'H2', 'L2', 'P1', 'P2', 'P3'] },
  { id: 'm-3035-66', name: 'M 3035/66', category: 'sugarcane', harvestStart: 'Aug', harvestEnd: 'Dec', seasons: getSeasons('Aug', 'Dec'), soilTypes: ['B1', 'B2', 'F1', 'F2', 'H1', 'H2'] },
  { id: 'm-1246-84', name: 'M 1246/84', category: 'sugarcane', harvestStart: 'Aug', harvestEnd: 'Sep', seasons: getSeasons('Aug', 'Sep'), soilTypes: ['H1', 'H2', 'L1', 'L2', 'P1', 'P2', 'P3'] },
  { id: 'm-1394-86', name: 'M 1394/86', category: 'sugarcane', harvestStart: 'Aug', harvestEnd: 'Nov', seasons: getSeasons('Aug', 'Nov'), soilTypes: ['B1', 'B2', 'F1', 'F2', 'H1', 'H2'] },
  { id: 'm-2024-88', name: 'M 2024/88', category: 'sugarcane', harvestStart: 'Jun', harvestEnd: 'Aug', seasons: getSeasons('Jun', 'Aug'), soilTypes: ['L1', 'L2', 'P1', 'P2', 'P3'] },
  { id: 'm-2238-89', name: 'M 2238/89', category: 'sugarcane', harvestStart: 'Aug', harvestEnd: 'Nov', seasons: getSeasons('Aug', 'Nov'), soilTypes: ['B1', 'B2'] },
  { id: 'r570', name: 'R570', category: 'sugarcane', harvestStart: 'Sep', harvestEnd: 'Dec', seasons: getSeasons('Sep', 'Dec'), pdfUrl: 'https://www.ercane.re/nos-varietes/r-570/', soilTypes: ['H1', 'H2', 'L1', 'L2', 'P1', 'P2', 'P3'] },
  { id: 'r585', name: 'R585', category: 'sugarcane', harvestStart: 'Aug', harvestEnd: 'Nov', seasons: getSeasons('Aug', 'Nov'), pdfUrl: 'https://www.ercane.re/nos-varietes/r-585/' }
]

export const INTERCROP_PLANTS: InterCropPlant[] = [
  {
    id: 'none',
    name: 'None',
    scientificName: '',
    category: 'intercrop',
    benefits: ['No intercrop selected', 'Monoculture sugarcane'],
    plantingTime: '',
    harvestTime: '',
    description: 'No intercrop companion plant selected'
  },
  {
    id: 'cowpea',
    name: 'Cowpea',
    scientificName: 'Vigna unguiculata',
    category: 'intercrop',
    benefits: ['Nitrogen fixation', 'Soil improvement', 'Additional income', 'Ground cover'],
    plantingTime: 'Early rainy season',
    harvestTime: '60-90 days',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Vigna_unguiculata_Blanco2.286-cropped.jpg/300px-Vigna_unguiculata_Blanco2.286-cropped.jpg',
    description: 'Fast-growing legume that fixes nitrogen and provides ground cover'
  },
  {
    id: 'soybean',
    name: 'Soybean',
    scientificName: 'Glycine max',
    category: 'intercrop',
    benefits: ['High nitrogen fixation', 'Protein-rich crop', 'Market value', 'Soil structure improvement'],
    plantingTime: 'Beginning of rainy season',
    harvestTime: '90-120 days',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fc/Soybeanvarieties.jpg/300px-Soybeanvarieties.jpg',
    description: 'High-value legume crop with excellent nitrogen fixation capacity'
  },
  {
    id: 'groundnut',
    name: 'Groundnut (Peanut)',
    scientificName: 'Arachis hypogaea',
    category: 'intercrop',
    benefits: ['Nitrogen fixation', 'High economic value', 'Oil production', 'Soil aeration'],
    plantingTime: 'Start of rainy season',
    harvestTime: '90-120 days',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Groundnut_%28Arachis_hypogaea%29.jpg/300px-Groundnut_%28Arachis_hypogaea%29.jpg',
    description: 'Valuable cash crop that improves soil fertility through nitrogen fixation'
  },
  {
    id: 'blackgram',
    name: 'Black Gram',
    scientificName: 'Vigna mungo',
    category: 'intercrop',
    benefits: ['Nitrogen fixation', 'Short duration', 'Drought tolerance', 'Soil enrichment'],
    plantingTime: 'Post-monsoon',
    harvestTime: '60-90 days',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Vigna_unguiculata_Blanco2.286-cropped.jpg/300px-Vigna_unguiculata_Blanco2.286-cropped.jpg',
    description: 'Short-duration pulse crop suitable for intercropping'
  },
  {
    id: 'greengram',
    name: 'Green Gram (Mung Bean)',
    scientificName: 'Vigna radiata',
    category: 'intercrop',
    benefits: ['Quick nitrogen fixation', 'Fast growing', 'Multiple harvests', 'Market demand'],
    plantingTime: 'Multiple seasons',
    harvestTime: '60-75 days',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Vigna_unguiculata_Blanco2.286-cropped.jpg/300px-Vigna_unguiculata_Blanco2.286-cropped.jpg',
    description: 'Fast-growing legume with high market value and quick returns'
  },
  {
    id: 'pigeonpea',
    name: 'Pigeon Pea',
    scientificName: 'Cajanus cajan',
    category: 'intercrop',
    benefits: ['Long-term nitrogen fixation', 'Deep root system', 'Windbreak', 'Perennial benefits'],
    plantingTime: 'Beginning of rainy season',
    harvestTime: '150-180 days',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Vigna_unguiculata_Blanco2.286-cropped.jpg/300px-Vigna_unguiculata_Blanco2.286-cropped.jpg',
    description: 'Long-duration legume that provides sustained soil improvement'
  },
  {
    id: 'chickpea',
    name: 'Chickpea',
    scientificName: 'Cicer arietinum',
    category: 'intercrop',
    benefits: ['Nitrogen fixation', 'Drought tolerance', 'High protein', 'Cool season crop'],
    plantingTime: 'Post-monsoon/Winter',
    harvestTime: '90-120 days',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Vigna_unguiculata_Blanco2.286-cropped.jpg/300px-Vigna_unguiculata_Blanco2.286-cropped.jpg',
    description: 'Cool season legume suitable for winter intercropping'
  },
  {
    id: 'fieldpea',
    name: 'Field Pea',
    scientificName: 'Pisum arvense',
    category: 'intercrop',
    benefits: ['Nitrogen fixation', 'Cool season adaptation', 'Fodder value', 'Soil improvement'],
    plantingTime: 'Winter season',
    harvestTime: '90-110 days',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Vigna_unguiculata_Blanco2.286-cropped.jpg/300px-Vigna_unguiculata_Blanco2.286-cropped.jpg',
    description: 'Cool season legume that provides both grain and fodder'
  }
]

export type CropVariety = SugarcaneVariety | InterCropPlant

export const ALL_VARIETIES: CropVariety[] = [
  ...SUGARCANE_VARIETIES,
  ...INTERCROP_PLANTS
]
