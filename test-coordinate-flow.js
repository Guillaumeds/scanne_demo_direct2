// Test the complete coordinate flow from WKT to display
// This tests the exact same pipeline as the app

// Sample WKT from CSV_FIELD_POLYGONS (first bloc)
const testWKT = 'POLYGON((57.652557 -20.437995, 57.652613 -20.437931, 57.653302 -20.438374, 57.653312 -20.438430, 57.650887 -20.441820, 57.650671 -20.441689, 57.650561 -20.441772, 57.650404 -20.441767, 57.650022 -20.441545, 57.652557 -20.437995))'

// Step 1: Parse WKT to coordinates (from mauritiusDemoDataGenerator.ts)
function parseWKTToCoordinates(wkt) {
  try {
    const coordsMatch = wkt.match(/POLYGON\(\(([^)]+)\)\)/)
    if (!coordsMatch) {
      console.error('❌ WKT parsing failed - no POLYGON match:', wkt.substring(0, 50))
      return []
    }

    const coordPairs = coordsMatch[1].split(',').map(pair => pair.trim())
    const coordinates = coordPairs.map(pair => {
      const [lng, lat] = pair.split(' ').map(Number)
      
      // Validate Mauritius coordinates
      if (isNaN(lng) || isNaN(lat)) {
        console.error('❌ Invalid coordinate pair:', pair, '-> lng:', lng, 'lat:', lat)
        return null
      }
      
      if (lng < 57 || lng > 58 || lat < -21 || lat > -19) {
        console.error('❌ Coordinate outside Mauritius bounds:', pair, '-> lng:', lng, 'lat:', lat)
        return null
      }
      
      return [lng, lat]
    }).filter(coord => coord !== null)
    
    console.log(`✅ WKT parsed successfully: ${coordinates.length} coordinates`)
    return coordinates
  } catch (error) {
    console.error('❌ Error parsing WKT:', error, 'WKT:', wkt.substring(0, 50))
    return []
  }
}

// Step 2: Create bloc object (from mauritiusDemoDataGenerator.ts)
function createBlocObject(wkt, name) {
  const parsedCoordinates = parseWKTToCoordinates(wkt)
  
  return {
    id: 'test-bloc-001',
    name: name,
    area_hectares: 57.59,
    coordinates_wkt: wkt,
    coordinates: parsedCoordinates,
    status: 'active',
    farm_id: 'test-farm',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }
}

// Step 3: Transform to DrawnArea (from drawnArea.ts)
function fromDatabaseBloc(bloc) {
  // Use pre-parsed coordinates if available (for performance), otherwise parse WKT
  const coordinates = bloc.coordinates || parseWKTToCoordinatesFromWKT(bloc.coordinates_wkt || '')
  
  console.log(`🔍 fromDatabaseBloc for ${bloc.name}:`, {
    hasPreParsedCoords: !!bloc.coordinates,
    preParsedCount: bloc.coordinates?.length || 0,
    hasWKT: !!bloc.coordinates_wkt,
    finalCoordCount: coordinates.length,
    firstCoord: coordinates[0],
    lastCoord: coordinates[coordinates.length - 1]
  })
  
  return {
    localId: `bloc-${bloc.name?.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase() || 'unknown'}`,
    uuid: bloc.id,
    type: 'polygon',
    coordinates,
    area: Number(bloc.area_hectares) || 0,
    name: bloc.name,
    isSaved: true,
    isDirty: false,
    createdAt: bloc.created_at || new Date().toISOString(),
    updatedAt: bloc.updated_at || new Date().toISOString()
  }
}

function parseWKTToCoordinatesFromWKT(wkt) {
  try {
    const coordsMatch = wkt.match(/POLYGON\(\(([^)]+)\)\)/)
    if (!coordsMatch) return []

    const coordPairs = coordsMatch[1].split(',').map(pair => pair.trim())
    return coordPairs.map(pair => {
      const [first, second] = pair.split(' ').map(Number)
      // Database WKT is stored as "lng lat" but our existing data might be "lat lng"
      // Check if first value looks like latitude (Mauritius: -20.5 to -19.9)
      if (first >= -21 && first <= -19 && second >= 57 && second <= 58) {
        // Data is stored as "lat lng" - swap to our standard [lng, lat]
        return [second, first] // [lng, lat]
      } else {
        // Data is stored as "lng lat" - use directly
        return [first, second] // [lng, lat]
      }
    }).filter(coord => coord !== null)
  } catch (error) {
    console.error('❌ Error parsing WKT coordinates:', error)
    return []
  }
}

// Step 4: Transform for Leaflet (from DrawingManager.tsx)
function transformForLeaflet(drawnArea) {
  // Our coordinates are [lng, lat], but Leaflet expects [lat, lng]
  const leafletCoords = drawnArea.coordinates.map(([lng, lat]) => [lat, lng])
  
  console.log(`🔍 Leaflet transformation for ${drawnArea.name}:`, {
    originalCoords: drawnArea.coordinates.slice(0, 3),
    leafletCoords: leafletCoords.slice(0, 3),
    totalCoords: drawnArea.coordinates.length
  })
  
  return leafletCoords
}

// Test the complete flow
console.log('🔍 Testing complete coordinate flow...')
console.log('')

console.log('=== STEP 1: Parse WKT ===')
const parsedCoords = parseWKTToCoordinates(testWKT)
console.log('Parsed coordinates:', parsedCoords.slice(0, 3))
console.log('')

console.log('=== STEP 2: Create Bloc Object ===')
const blocObject = createBlocObject(testWKT, 'Bloc 5316')
console.log('Bloc coordinates:', blocObject.coordinates.slice(0, 3))
console.log('')

console.log('=== STEP 3: Transform to DrawnArea ===')
const drawnArea = fromDatabaseBloc(blocObject)
console.log('DrawnArea coordinates:', drawnArea.coordinates.slice(0, 3))
console.log('')

console.log('=== STEP 4: Transform for Leaflet ===')
const leafletCoords = transformForLeaflet(drawnArea)
console.log('Leaflet coordinates:', leafletCoords.slice(0, 3))
console.log('')

console.log('=== FINAL ANALYSIS ===')
const isSquare = drawnArea.coordinates.length === 5 &&
                 drawnArea.coordinates[0] && drawnArea.coordinates[1] && drawnArea.coordinates[2] && drawnArea.coordinates[3] &&
                 Math.abs(drawnArea.coordinates[0][0] - drawnArea.coordinates[3][0]) < 0.001 &&
                 Math.abs(drawnArea.coordinates[1][1] - drawnArea.coordinates[2][1]) < 0.001

console.log('Final result:')
console.log('  Coordinate count:', drawnArea.coordinates.length)
console.log('  Is square:', isSquare)
console.log('  First coordinate:', drawnArea.coordinates[0])
console.log('  Last coordinate:', drawnArea.coordinates[drawnArea.coordinates.length - 1])

if (isSquare) {
  console.error('❌ PROBLEM: Result is a square! This should not happen.')
} else {
  console.log('✅ SUCCESS: Result is not a square (irregular polygon)')
}
