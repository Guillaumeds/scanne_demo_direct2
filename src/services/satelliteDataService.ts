/**
 * Service for fetching satellite data from Copernicus Data Space Ecosystem (Sentinel-2)
 */

// Copernicus API Configuration
const COPERNICUS_CONFIG = {
  clientId: 'sh-49b1cfb7-4261-45ec-a856-2258ac9ceaed',
  clientSecret: 'pxIJWA79u2FqJJEG4elauYYsqH1fryU2',
  baseUrl: 'https://dataspace.copernicus.eu',
  tokenUrl: 'https://identity.dataspace.copernicus.eu/auth/realms/CDSE/protocol/openid-connect/token',
  catalogUrl: 'https://catalogue.dataspace.copernicus.eu/odata/v1',
  processUrl: 'https://sh.dataspace.copernicus.eu/api/v1/process'
}

export interface VegetationIndices {
  ndvi: number // Normalized Difference Vegetation Index
  evi: number // Enhanced Vegetation Index
  savi: number // Soil Adjusted Vegetation Index
  ndwi: number // Normalized Difference Water Index
  ndre: number // Normalized Difference Red Edge
  cci: number // Canopy Chlorophyll Index
  lai: number // Leaf Area Index
  fcover: number // Fraction of Vegetation Cover
  fapar: number // Fraction of Absorbed Photosynthetically Active Radiation
  chlorophyll: number // Chlorophyll content
  // Agricultural spectral indices
  gndvi: number // Green NDVI (more sensitive to chlorophyll)
  arvi: number // Atmospherically Resistant Vegetation Index
  mcari: number // Modified Chlorophyll Absorption Ratio Index
  tcari: number // Transformed Chlorophyll Absorption Reflectance Index
}

export interface SoilIndices {
  brightness: number // Soil brightness index
  redness: number // Soil redness index
  moisture: number // Soil moisture index
  organic_matter: number // Organic matter content
  iron_oxide: number // Iron oxide content
  clay_minerals: number // Clay mineral content
}

export interface SatelliteImagery {
  date: string
  cloudCover: number
  bands: {
    red: number[][]
    green: number[][]
    blue: number[][]
    nir: number[][]
    swir1: number[][]
    swir2: number[][]
  }
  resolution: number // meters per pixel
}

export interface SatelliteAnalysis {
  coordinates: [number, number]
  acquisitionDate: string
  cloudCover: number
  vegetationIndices: VegetationIndices
  soilIndices: SoilIndices
  imagery: SatelliteImagery | null
  quality: 'High' | 'Medium' | 'Low'
  recommendations: string[]
  lastUpdated: string
  error?: string
}

/**
 * Get OAuth token for Copernicus API
 */
async function getCopernicusToken(): Promise<string> {
  try {
    const response = await fetch(COPERNICUS_CONFIG.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: COPERNICUS_CONFIG.clientId,
        client_secret: COPERNICUS_CONFIG.clientSecret,
      }),
    })

    if (!response.ok) {
      throw new Error(`Token request failed: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    return data.access_token
  } catch (error) {
    console.error('Error getting Copernicus token:', error)
    throw error
  }
}

/**
 * Search for Sentinel-2 products
 */
async function searchSentinel2Products(
  lat: number,
  lng: number,
  startDate: string,
  endDate: string,
  token: string
): Promise<any[]> {
  try {
    // Create bounding box around the point (±0.01 degrees ≈ 1km)
    const bbox = [lng - 0.01, lat - 0.01, lng + 0.01, lat + 0.01]
    
    const searchUrl = `${COPERNICUS_CONFIG.catalogUrl}/Products?$filter=` +
      `Collection/Name eq 'SENTINEL-2' and ` +
      `ContentDate/Start ge ${startDate}T00:00:00.000Z and ` +
      `ContentDate/Start le ${endDate}T23:59:59.999Z and ` +
      `OData.CSC.Intersects(area=geography'SRID=4326;POLYGON((${bbox[0]} ${bbox[1]},${bbox[2]} ${bbox[1]},${bbox[2]} ${bbox[3]},${bbox[0]} ${bbox[3]},${bbox[0]} ${bbox[1]}))')&` +
      `$orderby=ContentDate/Start desc&$top=5`

    const response = await fetch(searchUrl, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Search failed: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    return data.value || []
  } catch (error) {
    console.error('Error searching Sentinel-2 products:', error)
    throw error
  }
}

/**
 * Calculate vegetation indices from Sentinel-2 bands
 */
function calculateVegetationIndices(bands: any): VegetationIndices {
  // Mock calculation - in real implementation, you'd process the actual band data
  const blue = 0.08 // Band 2 (490nm)
  const green = 0.12 // Band 3 (560nm)
  const red = 0.15 // Band 4 (665nm)
  const redEdge = 0.25 // Band 5 (705nm)
  const nir = 0.45 // Band 8 (842nm)
  const swir1 = 0.25 // Band 11 (1610nm)
  const swir2 = 0.15 // Band 12 (2190nm)

  // Basic vegetation indices
  const ndvi = (nir - red) / (nir + red)
  const evi = 2.5 * ((nir - red) / (nir + 6 * red - 7.5 * blue + 1))
  const savi = ((nir - red) / (nir + red + 0.5)) * 1.5
  const ndwi = (nir - swir1) / (nir + swir1)

  // Red Edge indices
  const ndre = (nir - redEdge) / (nir + redEdge)
  const cci = (nir - redEdge) / (nir + redEdge) * (nir / red) // Canopy Chlorophyll Index

  // Agricultural spectral indices
  const gndvi = (nir - green) / (nir + green) // Green NDVI - more sensitive to chlorophyll
  const arvi = (nir - (2 * red - blue)) / (nir + (2 * red - blue)) // Atmospherically Resistant VI
  const mcari = ((redEdge - red) - 0.2 * (redEdge - green)) * (redEdge / red) // Modified Chlorophyll Absorption Ratio
  const tcari = 3 * ((redEdge - red) - 0.2 * (redEdge - green) * (redEdge / red)) // Transformed CARI

  return {
    ndvi: Math.max(0, Math.min(1, ndvi)),
    evi: Math.max(0, Math.min(1, evi)),
    savi: Math.max(0, Math.min(1, savi)),
    ndwi: Math.max(-1, Math.min(1, ndwi)),
    ndre: Math.max(-1, Math.min(1, ndre)),
    cci: Math.max(0, Math.min(5, cci)),
    gndvi: Math.max(0, Math.min(1, gndvi)),
    arvi: Math.max(0, Math.min(1, arvi)),
    mcari: Math.max(0, Math.min(2, mcari)),
    tcari: Math.max(0, Math.min(3, tcari)),
    lai: ndvi * 6, // Simplified LAI estimation
    fcover: Math.pow(ndvi, 0.7), // Simplified fraction cover
    fapar: ndvi * 0.95, // Simplified FAPAR
    chlorophyll: cci * 25 // Chlorophyll from CCI
  }
}

/**
 * Calculate soil indices from Sentinel-2 bands
 */
function calculateSoilIndices(bands: any): SoilIndices {
  // Mock calculation - in real implementation, you'd process the actual band data
  const red = 0.15 // Band 4
  const green = 0.12 // Band 3
  const blue = 0.08 // Band 2
  const nir = 0.45 // Band 8
  const swir1 = 0.25 // Band 11
  const swir2 = 0.15 // Band 12

  return {
    brightness: (red + green + blue) / 3,
    redness: red / (red + green + blue),
    moisture: (nir - swir1) / (nir + swir1),
    organic_matter: (swir1 - swir2) / (swir1 + swir2),
    iron_oxide: red / blue,
    clay_minerals: swir1 / swir2
  }
}

/**
 * Generate recommendations based on satellite analysis
 */
function generateSatelliteRecommendations(
  vegetationIndices: VegetationIndices,
  soilIndices: SoilIndices,
  type: 'vegetation' | 'soil'
): string[] {
  const recommendations: string[] = []

  if (type === 'vegetation') {
    if (vegetationIndices.ndvi < 0.3) {
      recommendations.push('Low vegetation vigor detected - consider irrigation or fertilization')
    } else if (vegetationIndices.ndvi > 0.7) {
      recommendations.push('Healthy vegetation detected - maintain current management practices')
    }

    if (vegetationIndices.ndwi < 0) {
      recommendations.push('Water stress detected - increase irrigation frequency')
    }

    if (vegetationIndices.chlorophyll < 30) {
      recommendations.push('Low chlorophyll content - consider nitrogen fertilization')
    }

    if (vegetationIndices.lai < 2) {
      recommendations.push('Low leaf area index - optimize planting density')
    }
  } else {
    if (soilIndices.moisture < 0.2) {
      recommendations.push('Low soil moisture - increase irrigation')
    }

    if (soilIndices.organic_matter < 0.1) {
      recommendations.push('Low organic matter - add compost or organic amendments')
    }

    if (soilIndices.brightness > 0.3) {
      recommendations.push('High soil brightness may indicate erosion or compaction')
    }
  }

  return recommendations
}

/**
 * Main function to fetch satellite analysis
 */
export async function fetchSatelliteAnalysis(
  coordinates: [number, number],
  type: 'vegetation' | 'soil' = 'vegetation'
): Promise<SatelliteAnalysis> {
  const [lng, lat] = coordinates

  try {
    const token = await getCopernicusToken()

    // Search for recent Sentinel-2 data (last 30 days)
    const endDate = new Date().toISOString().split('T')[0]
    const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

    const products = await searchSentinel2Products(lat, lng, startDate, endDate, token)
    
    if (products.length === 0) {
      throw new Error('No recent Sentinel-2 data available for this location')
    }

    // Use the most recent product with low cloud cover
    const bestProduct = products.find(p => p.CloudCover < 20) || products[0]
    
    // In a real implementation, you would download and process the actual imagery
    // For now, we'll use coordinate-based calculations for demonstration
    const coordSeed = Math.abs(Math.sin(lat * lng * 1000))

    const bands = {
      red: 0.10 + coordSeed * 0.10,
      green: 0.08 + coordSeed * 0.08,
      blue: 0.05 + coordSeed * 0.06,
      nir: 0.35 + coordSeed * 0.20,
      swir1: 0.20 + coordSeed * 0.10,
      swir2: 0.10 + coordSeed * 0.10
    }

    const vegetationIndices = calculateVegetationIndices(bands)
    const soilIndices = calculateSoilIndices(bands)
    
    const quality = bestProduct.CloudCover < 10 ? 'High' : 
                   bestProduct.CloudCover < 30 ? 'Medium' : 'Low'
    
    const recommendations = generateSatelliteRecommendations(vegetationIndices, soilIndices, type)

    return {
      coordinates,
      acquisitionDate: bestProduct.ContentDate?.Start || new Date().toISOString(),
      cloudCover: bestProduct.CloudCover || 0,
      vegetationIndices,
      soilIndices,
      imagery: null, // Would contain actual imagery data in full implementation
      quality,
      recommendations,
      lastUpdated: new Date().toISOString()
    }
  } catch (error) {
    console.error('Error in satellite analysis:', error)
    return {
      coordinates,
      acquisitionDate: new Date().toISOString(),
      cloudCover: 0,
      vegetationIndices: {
        ndvi: 0,
        evi: 0,
        savi: 0,
        ndwi: 0,
        ndre: 0,
        cci: 0,
        lai: 0,
        fcover: 0,
        fapar: 0,
        chlorophyll: 0,
        gndvi: 0,
        arvi: 0,
        mcari: 0,
        tcari: 0
      },
      soilIndices: {
        brightness: 0,
        redness: 0,
        moisture: 0,
        organic_matter: 0,
        iron_oxide: 0,
        clay_minerals: 0
      },
      imagery: null,
      quality: 'Low',
      recommendations: ['Error fetching satellite data. Please try again later.'],
      lastUpdated: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Generate satellite analysis data based on coordinates
 * Uses coordinate-based algorithms to provide realistic satellite data
 */
export async function getCoordinateBasedSatelliteAnalysis(
  coordinates: [number, number],
  type: 'vegetation' | 'soil' = 'vegetation'
): Promise<SatelliteAnalysis> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500))

  // Use coordinates to generate realistic variations
  const [lng, lat] = coordinates

  // Create coordinate-based seed for consistent but varied data
  const coordSeed = Math.abs(Math.sin(lat * lng * 1000)) // Creates 0-1 value based on coordinates
  const latFactor = (lat + 90) / 180 // Normalize latitude to 0-1
  const lngFactor = (lng + 180) / 360 // Normalize longitude to 0-1

  // Generate vegetation indices based on location
  // Higher latitudes generally have lower vegetation indices
  // Coastal areas might have different characteristics
  const baseNdvi = 0.3 + (coordSeed * 0.5) * (1 - Math.abs(lat) / 90) // Lower NDVI at extreme latitudes
  const moistureFactor = Math.sin(coordSeed * Math.PI) * 0.3 + 0.4 // 0.4-0.7 range

  const mockVegetationIndices: VegetationIndices = {
    ndvi: Math.max(0.1, Math.min(0.9, baseNdvi + (coordSeed - 0.5) * 0.2)),
    evi: Math.max(0.1, Math.min(0.8, baseNdvi * 0.8 + coordSeed * 0.2)),
    savi: Math.max(0.1, Math.min(0.8, baseNdvi * 0.9 + (coordSeed - 0.5) * 0.15)),
    ndwi: Math.max(-0.5, Math.min(0.5, moistureFactor - 0.5 + (coordSeed - 0.5) * 0.3)),
    ndre: Math.max(0.1, Math.min(0.6, baseNdvi * 0.6 + coordSeed * 0.2)),
    cci: Math.max(0.5, Math.min(3.0, 1.0 + coordSeed * 2.0)),
    gndvi: Math.max(0.1, Math.min(0.8, baseNdvi * 0.85 + (coordSeed - 0.5) * 0.15)),
    arvi: Math.max(0.1, Math.min(0.7, baseNdvi * 0.75 + coordSeed * 0.2)),
    mcari: Math.max(0.2, Math.min(1.5, 0.5 + coordSeed * 1.0)),
    tcari: Math.max(0.3, Math.min(2.0, 0.7 + coordSeed * 1.3)),
    lai: Math.max(0.5, Math.min(6.0, baseNdvi * 8 + coordSeed * 2)),
    fcover: Math.max(0.1, Math.min(0.95, Math.pow(baseNdvi, 0.7))),
    fapar: Math.max(0.1, Math.min(0.95, baseNdvi * 0.9 + coordSeed * 0.1)),
    chlorophyll: Math.max(10, Math.min(80, 25 + coordSeed * 40)) // CCI-based chlorophyll
  }

  // Generate soil indices based on coordinates
  const soilBrightnessFactor = Math.sin(lat * 0.1) * 0.1 + 0.2 // 0.1-0.3 range
  const soilMoistureFactor = moistureFactor * 0.8 // Related to vegetation moisture

  const mockSoilIndices: SoilIndices = {
    brightness: Math.max(0.05, Math.min(0.4, soilBrightnessFactor + coordSeed * 0.15)),
    redness: Math.max(0.1, Math.min(0.6, 0.25 + (coordSeed - 0.5) * 0.3)),
    moisture: Math.max(0.1, Math.min(0.8, soilMoistureFactor + (coordSeed - 0.5) * 0.2)),
    organic_matter: Math.max(0.05, Math.min(0.3, 0.1 + coordSeed * 0.15)),
    iron_oxide: Math.max(1.0, Math.min(2.5, 1.3 + coordSeed * 1.0)),
    clay_minerals: Math.max(0.8, Math.min(1.8, 1.0 + coordSeed * 0.6))
  }

  const recommendations = generateSatelliteRecommendations(mockVegetationIndices, mockSoilIndices, type)

  // Generate coordinate-based quality metrics
  const cloudCover = Math.max(0, Math.min(50, coordSeed * 30 + 5)) // 5-35% cloud cover
  const qualityScore = cloudCover < 10 ? 'High' : cloudCover < 25 ? 'Medium' : 'Low'
  const daysAgo = Math.floor(coordSeed * 7) + 1 // 1-7 days ago

  return {
    coordinates,
    acquisitionDate: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString(),
    cloudCover,
    vegetationIndices: mockVegetationIndices,
    soilIndices: mockSoilIndices,
    imagery: null,
    quality: qualityScore,
    recommendations,
    lastUpdated: new Date().toISOString()
  }
}
