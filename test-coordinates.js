// Test coordinate parsing to debug the square bloc issue

// Sample WKT from CSV_FIELD_POLYGONS (first bloc)
const testWKT1 = 'POLYGON((57.652557 -20.437995, 57.652613 -20.437931, 57.653302 -20.438374, 57.653312 -20.438430, 57.650887 -20.441820, 57.650671 -20.441689, 57.650561 -20.441772, 57.650404 -20.441767, 57.650022 -20.441545, 57.652557 -20.437995))'

// Sample WKT from CSV_FIELD_POLYGONS (second bloc - more complex)
const testWKT2 = 'POLYGON((57.643608 -20.427913, 57.643671 -20.427759, 57.646925 -20.425527, 57.648953 -20.424132, 57.649125 -20.424039, 57.649191 -20.424865, 57.649337 -20.425374, 57.649314 -20.425663, 57.648536 -20.426457, 57.648383 -20.426595, 57.648315 -20.426669, 57.648320 -20.426749, 57.648343 -20.426850, 57.648587 -20.427121, 57.647799 -20.427536, 57.647637 -20.427732, 57.647112 -20.428035, 57.646886 -20.428173, 57.646551 -20.428232, 57.646098 -20.428311, 57.645581 -20.428279, 57.645462 -20.428285, 57.644952 -20.427605, 57.644572 -20.427812, 57.644929 -20.428248, 57.643620 -20.428125, 57.643569 -20.428019, 57.643608 -20.427913))'

// Test a simple square to compare
const testSquare = 'POLYGON((57.65 -20.44, 57.66 -20.44, 57.66 -20.43, 57.65 -20.43, 57.65 -20.44))'

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
    console.log(`   First coord: [${coordinates[0]?.[0]}, ${coordinates[0]?.[1]}]`)
    console.log(`   Last coord: [${coordinates[coordinates.length-1]?.[0]}, ${coordinates[coordinates.length-1]?.[1]}]`)
    
    // Check if it's a square
    const isSquare = coordinates.length === 5 && 
                     coordinates[0] && coordinates[1] && coordinates[2] && coordinates[3] &&
                     Math.abs(coordinates[0][0] - coordinates[3][0]) < 0.001 &&
                     Math.abs(coordinates[1][1] - coordinates[2][1]) < 0.001
    
    console.log(`   Is square: ${isSquare}`)
    
    return coordinates
  } catch (error) {
    console.error('❌ Error parsing WKT:', error, 'WKT:', wkt.substring(0, 50))
    return []
  }
}

console.log('🔍 Testing WKT coordinate parsing...')
console.log('')

// Test all three WKT strings
const testCases = [
  { name: 'Bloc 5316 (Complex)', wkt: testWKT1 },
  { name: 'Bloc 5660 (Very Complex)', wkt: testWKT2 },
  { name: 'Simple Square (Test)', wkt: testSquare }
]

testCases.forEach((testCase, index) => {
  console.log(`\n=== TEST ${index + 1}: ${testCase.name} ===`)
  console.log('Input WKT:', testCase.wkt.substring(0, 80) + '...')

  const result = parseWKTToCoordinates(testCase.wkt)

  console.log('Final result length:', result.length)
  console.log('First 3 coordinates:')
  result.slice(0, 3).forEach((coord, i) => {
    console.log(`  ${i}: [${coord[0]}, ${coord[1]}]`)
  })

  // Check if it's a square
  const isSquare = result.length === 5 &&
                   result[0] && result[1] && result[2] && result[3] &&
                   Math.abs(result[0][0] - result[3][0]) < 0.001 &&
                   Math.abs(result[1][1] - result[2][1]) < 0.001

  console.log('Is square:', isSquare)

  // Calculate bounds
  const lngs = result.map(c => c[0])
  const lats = result.map(c => c[1])
  const bounds = {
    minLng: Math.min(...lngs),
    maxLng: Math.max(...lngs),
    minLat: Math.min(...lats),
    maxLat: Math.max(...lats)
  }
  console.log('Bounds:', bounds)
})
