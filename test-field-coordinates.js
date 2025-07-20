// Test what the actual field coordinates look like after parsing

// Import the field data (simulate)
const RAW_FIELD_DATA = [
  { field_id: 'field1', name: '5316', area: 57.59, coordinates: '0103000020E610000001000000050000006FCFC229947234C0AA852AE82FD24C40F3B04F710A7134C0A429D033F6D04C40AE788623087234C08656267BA4D04C40A450D323797334C0BE123975E3D14C406FCFC229947234C0AA852AE82FD24C40' }
]

// Simplified EWKB parsing (based on coordinateTransform.ts)
function parseEWKBToCoordinates(ewkbHex) {
  if (!ewkbHex || ewkbHex.length < 50) {
    throw new Error(`Invalid EWKB hex string: length ${ewkbHex?.length || 0}`)
  }

  console.log(`🔍 Parsing EWKB: ${ewkbHex.substring(0, 50)}...`)

  function hexToDouble(hex) {
    const bytes = []
    for (let i = 0; i < hex.length; i += 2) {
      bytes.push(parseInt(hex.substr(i, 2), 16))
    }
    
    const buffer = new ArrayBuffer(8)
    const view = new DataView(buffer)
    
    for (let i = 0; i < 8; i++) {
      view.setUint8(i, bytes[i])
    }
    
    return view.getFloat64(0, true) // little endian
  }

  function reverseHex(hex) {
    const result = []
    for (let i = hex.length - 2; i >= 0; i -= 2) {
      result.push(hex.substring(i, i + 2))
    }
    return result.join('')
  }

  try {
    let offset = 18 // Skip endian + type + SRID
    offset += 8 // Skip ring count
    
    // Get point count
    const pointCountHex = ewkbHex.substring(offset, offset + 8)
    const pointCount = parseInt(reverseHex(pointCountHex), 16)
    offset += 8

    console.log(`🔍 EWKB parsing: ${pointCount} points expected`)

    const coordinates = []

    for (let i = 0; i < pointCount && offset + 32 <= ewkbHex.length; i++) {
      const xHex = ewkbHex.substring(offset, offset + 16)
      const yHex = ewkbHex.substring(offset + 16, offset + 32)

      const x = hexToDouble(xHex)
      const y = hexToDouble(yHex)

      // Based on our analysis: X=latitude, Y=longitude
      const lat = x
      const lng = y

      console.log(`🔍 Coordinate ${i}: X=${x} (lat), Y=${y} (lng) -> lat=${lat}, lng=${lng}`)

      // Validate coordinates
      if (isNaN(lat) || isNaN(lng)) {
        throw new Error(`Failed to parse coordinate ${i}: lat=${lat}, lng=${lng}`)
      }

      if (lat < -21 || lat > -19 || lng < 57 || lng > 58) {
        console.warn(`⚠️ Coordinate ${i} outside Mauritius bounds: lat=${lat}, lng=${lng}`)
      }

      coordinates.push({ lat, lng })
      offset += 32
    }

    console.log(`✅ Successfully parsed ${coordinates.length}/${pointCount} coordinates`)
    return coordinates
  } catch (error) {
    throw new Error(`EWKB parsing failed: ${error.message}`)
  }
}

// Test the parsing
console.log('🔍 Testing field coordinate parsing...')

const rawField = RAW_FIELD_DATA[0]
console.log(`Field: ${rawField.name}`)
console.log(`EWKB: ${rawField.coordinates.substring(0, 50)}...`)

try {
  const polygon = parseEWKBToCoordinates(rawField.coordinates)
  
  console.log('\n📍 Parsed coordinates:')
  polygon.forEach((coord, i) => {
    console.log(`  ${i + 1}: lat=${coord.lat.toFixed(6)}, lng=${coord.lng.toFixed(6)}`)
  })
  
  console.log('\n🗺️ For Leaflet display:')
  const leafletCoords = polygon.map(coord => [coord.lat, coord.lng])
  console.log('Leaflet format:', leafletCoords.slice(0, 3))
  
  console.log('\n🌍 Location check:')
  const avgLat = polygon.reduce((sum, c) => sum + c.lat, 0) / polygon.length
  const avgLng = polygon.reduce((sum, c) => sum + c.lng, 0) / polygon.length
  console.log(`Center: lat=${avgLat.toFixed(6)}, lng=${avgLng.toFixed(6)}`)
  
  if (avgLat >= -21 && avgLat <= -19 && avgLng >= 57 && avgLng <= 58) {
    console.log('✅ Center is in Mauritius')
  } else {
    console.log('❌ Center is NOT in Mauritius!')
    console.log('   Expected: lat -21 to -19, lng 57 to 58')
  }
  
} catch (error) {
  console.error('❌ Parsing failed:', error.message)
}
