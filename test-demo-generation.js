// Test demo data generation directly
// This will help us see if the generation function works

console.log('🔍 Testing demo data generation...')

// Import the demo data generator (simulate the import)
// We'll recreate the key parts here for testing

// Sample WKT from CSV_FIELD_POLYGONS (first few)
const CSV_FIELD_POLYGONS = [
  { id: 'field1', name: 'Bloc 5316', area: 57.59, wkt: 'POLYGON((57.652557 -20.437995, 57.652613 -20.437931, 57.653302 -20.438374, 57.653312 -20.438430, 57.650887 -20.441820, 57.650671 -20.441689, 57.650561 -20.441772, 57.650404 -20.441767, 57.650022 -20.441545, 57.652557 -20.437995))' },
  { id: 'field2', name: 'Bloc 5660', area: 17.34, wkt: 'POLYGON((57.643608 -20.427913, 57.643671 -20.427759, 57.646925 -20.425527, 57.648953 -20.424132, 57.649125 -20.424039, 57.649191 -20.424865, 57.649337 -20.425374, 57.649314 -20.425663, 57.648536 -20.426457, 57.648383 -20.426595, 57.648315 -20.426669, 57.648320 -20.426749, 57.648343 -20.426850, 57.648587 -20.427121, 57.647799 -20.427536, 57.647637 -20.427732, 57.647112 -20.428035, 57.646886 -20.428173, 57.646551 -20.428232, 57.646098 -20.428311, 57.645581 -20.428279, 57.645462 -20.428285, 57.644952 -20.427605, 57.644572 -20.427812, 57.644929 -20.428248, 57.643620 -20.428125, 57.643569 -20.428019, 57.643608 -20.427913))' },
  { id: 'field3', name: 'Bloc 5216', area: 20.17, wkt: 'POLYGON((57.628588 -20.486595, 57.628700 -20.486871, 57.629105 -20.486987, 57.629551 -20.487170, 57.629543 -20.486881, 57.629567 -20.486538, 57.629608 -20.486249, 57.629661 -20.485968, 57.629730 -20.485634, 57.629803 -20.485443, 57.629925 -20.485187, 57.629897 -20.485154, 57.629829 -20.485130, 57.629797 -20.485148, 57.629774 -20.485214, 57.629709 -20.485383, 57.629667 -20.485437, 57.629616 -20.485454, 57.629457 -20.485499, 57.629394 -20.485515, 57.629397 -20.485568, 57.629397 -20.485645, 57.629311 -20.485898, 57.629203 -20.486023, 57.628980 -20.486224, 57.628782 -20.486394, 57.628630 -20.486506, 57.628594 -20.486552, 57.628588 -20.486595))' }
]

// Demo farms
const DEMO_FARMS = [
  {
    id: 'farm-001',
    name: 'Omnicane Estate - North',
    companyId: 'comp-001',
    active: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'farm-002', 
    name: 'Omnicane Estate - South',
    companyId: 'comp-001',
    active: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }
]

// Parse WKT function (from demo generator)
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

// Generate demo data (simplified version)
function generateDemoData() {
  console.log('🔄 Generating demo data...')
  
  const blocs = []
  const farms = DEMO_FARMS
  
  // Generate blocs from CSV data
  CSV_FIELD_POLYGONS.forEach((field, index) => {
    const blocId = `550e8400-e29b-41d4-a716-44665544${String(index + 10).padStart(4, '0')}`
    const farmId = index < 2 ? farms[0].id : farms[1].id
    
    // Parse coordinates
    const parsedCoordinates = parseWKTToCoordinates(field.wkt)
    
    console.log(`🔍 Creating bloc ${field.name}:`)
    console.log(`   Parsed coordinates count: ${parsedCoordinates.length}`)
    console.log(`   First coordinate: [${parsedCoordinates[0]?.[0]}, ${parsedCoordinates[0]?.[1]}]`)
    
    // Create bloc object
    const bloc = {
      id: blocId,
      name: field.name,
      area_hectares: field.area,
      coordinates_wkt: field.wkt,
      coordinates: parsedCoordinates,
      status: 'active',
      farm_id: farmId,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    }
    
    blocs.push(bloc)
  })
  
  console.log(`✅ Generated ${blocs.length} blocs`)
  
  return {
    farms,
    blocs,
    cropCycles: [],
    fieldOperations: [],
    workPackages: []
  }
}

// Test storage simulation
function testStorage(data) {
  console.log('💾 Testing storage simulation...')
  
  // Simulate JSON serialization (what localStorage does)
  const serialized = JSON.stringify(data.blocs)
  console.log(`Serialized size: ${serialized.length} characters`)
  
  // Simulate deserialization
  const deserialized = JSON.parse(serialized)
  console.log(`Deserialized ${deserialized.length} blocs`)
  
  // Check first bloc integrity
  if (deserialized.length > 0) {
    const firstBloc = deserialized[0]
    console.log('First bloc after round-trip:')
    console.log(`  Name: ${firstBloc.name}`)
    console.log(`  Coordinates count: ${firstBloc.coordinates?.length || 0}`)
    console.log(`  First coord: [${firstBloc.coordinates?.[0]?.[0]}, ${firstBloc.coordinates?.[0]?.[1]}]`)
    
    // Check if it's a square
    const coords = firstBloc.coordinates
    if (coords && coords.length > 0) {
      const isSquare = coords.length === 5 && 
                       coords[0] && coords[1] && coords[2] && coords[3] &&
                       Math.abs(coords[0][0] - coords[3][0]) < 0.001 &&
                       Math.abs(coords[1][1] - coords[2][1]) < 0.001
      
      if (isSquare) {
        console.error('❌ PROBLEM: Bloc became a square after storage!')
      } else {
        console.log('✅ SUCCESS: Bloc remains irregular after storage')
      }
    }
  }
  
  return deserialized
}

// Run the test
console.log('=== DEMO DATA GENERATION TEST ===')
const demoData = generateDemoData()

console.log('\n=== STORAGE ROUND-TRIP TEST ===')
const storedBlocs = testStorage(demoData)

console.log('\n=== SUMMARY ===')
console.log(`Generated: ${demoData.blocs.length} blocs`)
console.log(`Stored: ${storedBlocs.length} blocs`)
console.log('Test completed!')
