/**
 * Service for fetching soil data from various APIs
 */

export interface SoilGridsData {
  phh2o: number // pH in H2O
  sand: number // Sand content (%)
  silt: number // Silt content (%)
  clay: number // Clay content (%)
  soc: number // Soil Organic Carbon (g/kg)
  nitrogen: number // Total Nitrogen (g/kg)
  cec: number // Cation Exchange Capacity (cmol/kg)
  bdod: number // Bulk Density (kg/dm³)
  cfvo: number // Coarse fragments (% volume)
}

export type SoilDepth = '0-5cm' | '5-15cm' | '15-30cm' | '30-60cm' | '60-100cm' | '100-200cm'

export const SOIL_DEPTHS: { id: SoilDepth; name: string; description: string }[] = [
  { id: '0-5cm', name: '0-5 cm', description: 'Surface layer' },
  { id: '5-15cm', name: '5-15 cm', description: 'Topsoil' },
  { id: '15-30cm', name: '15-30 cm', description: 'Upper subsoil' },
  { id: '30-60cm', name: '30-60 cm', description: 'Middle subsoil' },
  { id: '60-100cm', name: '60-100 cm', description: 'Lower subsoil' },
  { id: '100-200cm', name: '100-200 cm', description: 'Deep subsoil' }
]

export interface SoilAnalysis {
  coordinates: [number, number]
  soilGridsData: SoilGridsData | null
  soilType: string
  fertility: 'Low' | 'Medium' | 'High'
  recommendations: string[]
  lastUpdated: string
  error?: string
}

/**
 * Fetch soil data from SoilGrids API
 * @param lat Latitude
 * @param lng Longitude
 * @param depth Soil depth layer
 * @returns Promise<SoilGridsData | null>
 */
async function fetchSoilGridsData(lat: number, lng: number, depth: SoilDepth = '0-5cm'): Promise<SoilGridsData | null> {
  try {
    // SoilGrids REST API endpoint
    const properties = [
      'phh2o', // pH in H2O
      'sand', // Sand content
      'silt', // Silt content
      'clay', // Clay content
      'soc', // Soil Organic Carbon
      'nitrogen', // Total Nitrogen
      'cec', // Cation Exchange Capacity
      'bdod', // Bulk Density
      'cfvo' // Coarse fragments
    ]

    const baseUrl = 'https://rest.isric.org/soilgrids/v2.0/properties/query'
    const url = `${baseUrl}?lon=${lng}&lat=${lat}&property=${properties.join('&property=')}&depth=${depth}&value=mean`

    console.log('Fetching soil data from:', url)

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      }
    })

    if (!response.ok) {
      throw new Error(`SoilGrids API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    console.log('SoilGrids API response:', data)

    // Check if we have valid data
    if (!data.properties || !data.properties.layers || data.properties.layers.length === 0) {
      console.warn('No soil data available for coordinates:', lat, lng)
      return null
    }

    // Check if all values are null (e.g., over water or outside coverage area)
    const hasValidData = data.properties.layers.some((layer: any) =>
      layer.depths?.[0]?.values?.mean !== null && layer.depths?.[0]?.values?.mean !== undefined
    )

    if (!hasValidData) {
      console.warn('SoilGrids returned null values for coordinates:', lat, lng, '(possibly over water or outside coverage)')
      return null
    }

    // Extract values from the response - the API returns data in a different structure
    const extractValue = (propertyName: string): number => {
      const layer = data.properties.layers.find((layer: any) =>
        layer.name === propertyName
      )

      if (!layer || !layer.depths || layer.depths.length === 0) {
        console.warn(`No data found for property: ${propertyName}`)
        return 0
      }

      const depthData = layer.depths[0]
      if (!depthData.values || depthData.values.mean === null || depthData.values.mean === undefined) {
        console.warn(`No mean value found for property: ${propertyName}`)
        return 0
      }

      return depthData.values.mean
    }

    const soilData = {
      phh2o: extractValue('phh2o') / 10, // Convert from pH*10 to pH
      sand: extractValue('sand') / 10, // Convert from g/kg to %
      silt: extractValue('silt') / 10, // Convert from g/kg to %
      clay: extractValue('clay') / 10, // Convert from g/kg to %
      soc: extractValue('soc') / 10, // Convert from dg/kg to g/kg
      nitrogen: extractValue('nitrogen') / 100, // Convert from cg/kg to g/kg
      cec: extractValue('cec') / 10, // Convert from mmol/kg to cmol/kg
      bdod: extractValue('bdod') / 100, // Convert from cg/cm³ to kg/dm³
      cfvo: extractValue('cfvo') / 10 // Convert from cm3/dm3 to %
    }

    console.log('Processed soil data:', soilData)
    return soilData

  } catch (error) {
    console.error('Error fetching SoilGrids data:', error)
    return null
  }
}

/**
 * Determine soil type based on sand, silt, clay percentages
 * @param sand Sand percentage
 * @param silt Silt percentage  
 * @param clay Clay percentage
 * @returns Soil type classification
 */
function determineSoilType(sand: number, silt: number, clay: number): string {
  // USDA Soil Texture Classification
  if (clay >= 40) {
    if (sand >= 45) return 'Sandy Clay'
    if (silt >= 40) return 'Silty Clay'
    return 'Clay'
  }
  
  if (clay >= 27) {
    if (sand >= 20 && sand < 45) return 'Clay Loam'
    if (sand >= 45) return 'Sandy Clay Loam'
    return 'Silty Clay Loam'
  }
  
  if (clay >= 7 && clay < 27) {
    if (sand >= 43) {
      if (silt >= 28) return 'Loam'
      return 'Sandy Loam'
    }
    if (silt >= 50) return 'Silt Loam'
    return 'Loam'
  }
  
  if (silt >= 80) return 'Silt'
  if (sand >= 85) return 'Sand'
  if (sand >= 70) return 'Loamy Sand'
  
  return 'Sandy Loam'
}

/**
 * Assess soil fertility based on various parameters
 * @param soilData SoilGrids data
 * @returns Fertility level
 */
function assessFertility(soilData: SoilGridsData): 'Low' | 'Medium' | 'High' {
  let score = 0
  
  // pH score (optimal range 6.0-7.5 for sugarcane)
  if (soilData.phh2o >= 6.0 && soilData.phh2o <= 7.5) score += 2
  else if (soilData.phh2o >= 5.5 && soilData.phh2o <= 8.0) score += 1
  
  // Organic carbon score (higher is better)
  if (soilData.soc >= 20) score += 2
  else if (soilData.soc >= 10) score += 1
  
  // CEC score (higher is better for nutrient retention)
  if (soilData.cec >= 15) score += 2
  else if (soilData.cec >= 10) score += 1
  
  // Nitrogen score
  if (soilData.nitrogen >= 2) score += 2
  else if (soilData.nitrogen >= 1) score += 1
  
  if (score >= 6) return 'High'
  if (score >= 3) return 'Medium'
  return 'Low'
}

/**
 * Generate recommendations based on soil analysis
 * @param soilData SoilGrids data
 * @param soilType Soil type classification
 * @param fertility Fertility level
 * @returns Array of recommendations
 */
function generateRecommendations(
  soilData: SoilGridsData, 
  soilType: string, 
  fertility: 'Low' | 'Medium' | 'High'
): string[] {
  const recommendations: string[] = []
  
  // pH recommendations
  if (soilData.phh2o < 5.5) {
    recommendations.push('Apply lime to increase soil pH for optimal sugarcane growth')
  } else if (soilData.phh2o > 8.0) {
    recommendations.push('Consider sulfur application to lower soil pH')
  }
  
  // Organic matter recommendations
  if (soilData.soc < 10) {
    recommendations.push('Increase organic matter through compost or green manure')
  }
  
  // Texture-based recommendations
  if (soilData.clay > 50) {
    recommendations.push('Improve drainage and avoid compaction in heavy clay soil')
  } else if (soilData.sand > 70) {
    recommendations.push('Increase water retention with organic amendments')
  }
  
  // Fertility-based recommendations
  if (fertility === 'Low') {
    recommendations.push('Apply balanced NPK fertilizer before planting')
    recommendations.push('Consider soil testing for micronutrients')
  } else if (fertility === 'Medium') {
    recommendations.push('Maintain current fertility with regular fertilization')
  }
  
  // Nitrogen recommendations
  if (soilData.nitrogen < 1) {
    recommendations.push('Apply nitrogen-rich fertilizer or organic amendments')
  }
  
  return recommendations
}

/**
 * Main function to fetch and analyze soil data
 * @param coordinates [longitude, latitude]
 * @param depth Soil depth layer
 * @returns Promise<SoilAnalysis>
 */
export async function fetchSoilAnalysis(coordinates: [number, number], depth: SoilDepth = '0-5cm'): Promise<SoilAnalysis> {
  const [lng, lat] = coordinates

  try {
    const soilGridsData = await fetchSoilGridsData(lat, lng, depth)

    if (!soilGridsData) {
      return {
        coordinates,
        soilGridsData: null,
        soilType: 'Unknown',
        fertility: 'Medium',
        recommendations: ['Unable to fetch soil data. Consider local soil testing.'],
        lastUpdated: new Date().toISOString(),
        error: 'Failed to fetch soil data from SoilGrids API'
      }
    }

    const soilType = determineSoilType(soilGridsData.sand, soilGridsData.silt, soilGridsData.clay)
    const fertility = assessFertility(soilGridsData)
    const recommendations = generateRecommendations(soilGridsData, soilType, fertility)

    return {
      coordinates,
      soilGridsData,
      soilType,
      fertility,
      recommendations,
      lastUpdated: new Date().toISOString()
    }
  } catch (error) {
    console.error('Error in soil analysis:', error)
    return {
      coordinates,
      soilGridsData: null,
      soilType: 'Unknown',
      fertility: 'Medium',
      recommendations: ['Error fetching soil data. Please try again later.'],
      lastUpdated: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}


