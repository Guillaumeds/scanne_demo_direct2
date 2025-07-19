/**
 * Coordinate transformation utilities for converting between different coordinate systems
 * Handles EWKB (Extended Well-Known Binary) format from PostGIS to Leaflet coordinates
 */

/**
 * Parse EWKB (Extended Well-Known Binary) hex string to coordinates
 * EWKB format: 0103000020E610000001000000050000006FCFC229947234C0...
 * This is PostGIS binary format with SRID information
 */
export function parseEWKBToCoordinates(ewkbHex: string): Array<{ lat: number; lng: number }> {
  if (!ewkbHex || ewkbHex.length < 50) {
    throw new Error(`Invalid EWKB hex string: length ${ewkbHex?.length || 0}, expected at least 50 characters`)
  }

  console.log(`🔍 Parsing EWKB: ${ewkbHex.substring(0, 50)}...`)

  try {
    // Parse EWKB header
    // 01 = little endian
    // 03000020 = POLYGON with SRID
    // E6100000 = SRID 4326 (WGS84)
    // 01000000 = 1 ring
    // Next 8 chars = point count

    let offset = 18 // Skip endian + type + SRID

    // Skip ring count (8 chars)
    offset += 8

    // Get point count (8 chars, little endian)
    const pointCountHex = ewkbHex.substring(offset, offset + 8)
    const pointCount = parseInt(reverseHex(pointCountHex), 16)
    offset += 8

    console.log(`🔍 EWKB parsing: ${pointCount} points expected`)

    if (pointCount <= 0 || pointCount > 1000) {
      throw new Error(`Invalid point count: ${pointCount}, expected 1-1000`)
    }

    const coordinates: Array<{ lat: number; lng: number }> = []

    for (let i = 0; i < pointCount && offset + 32 <= ewkbHex.length; i++) {
      // Each point is 32 hex chars (16 for X, 16 for Y)
      const xHex = ewkbHex.substring(offset, offset + 16)
      const yHex = ewkbHex.substring(offset + 16, offset + 32)

      // Convert hex to double (no reversal needed, hexToDouble handles endianness)
      const x = hexToDouble(xHex)  // X coordinate from EWKB
      const y = hexToDouble(yHex)  // Y coordinate from EWKB

      // IMPORTANT: This EWKB data appears to have coordinates in Y,X order (lat,lng)
      // instead of the standard X,Y order (lng,lat)
      // Based on the actual values: X=-20.44 (latitude), Y=57.64 (longitude)
      const lat = x  // X contains latitude
      const lng = y  // Y contains longitude

      console.log(`🔍 Coordinate ${i}: X=${x} (lat), Y=${y} (lng) -> lat=${lat}, lng=${lng}`)

      // Validate coordinates are reasonable for Mauritius
      if (isNaN(lat) || isNaN(lng)) {
        throw new Error(`Failed to parse coordinate ${i}: lat=${lat}, lng=${lng} (NaN values)`)
      }

      if (lat < -21 || lat > -19 || lng < 57 || lng > 58) {
        throw new Error(`Invalid coordinate ${i} for Mauritius: lat=${lat}, lng=${lng} (outside bounds: lat -21 to -19, lng 57 to 58)`)
      }

      coordinates.push({ lat, lng })
      offset += 32
    }

    if (coordinates.length === 0) {
      throw new Error(`No valid coordinates parsed from EWKB data`)
    }

    console.log(`✅ Successfully parsed ${coordinates.length}/${pointCount} valid coordinates`)
    return coordinates
  } catch (error) {
    throw new Error(`EWKB parsing failed: ${error instanceof Error ? error.message : String(error)}`)
  }
}

/**
 * Reverse hex string for little-endian conversion
 */
function reverseHex(hex: string): string {
  const result = []
  for (let i = hex.length - 2; i >= 0; i -= 2) {
    result.push(hex.substring(i, i + 2))
  }
  return result.join('')
}

/**
 * Convert hex string to IEEE 754 double precision float
 */
function hexToDouble(hex: string): number {
  try {
    // Ensure hex string is exactly 16 characters (8 bytes)
    if (hex.length !== 16) {
      console.warn(`Invalid hex length: ${hex.length}, expected 16`)
      return NaN
    }

    // Use DataView to convert to double
    const buffer = new ArrayBuffer(8)
    const view = new DataView(buffer)

    // Convert hex string to bytes and write to buffer
    for (let i = 0; i < 8; i++) {
      const byteHex = hex.substring(i * 2, i * 2 + 2)
      const byte = parseInt(byteHex, 16)
      view.setUint8(i, byte)
    }

    // Read as little-endian double (PostGIS uses little-endian)
    return view.getFloat64(0, true)
  } catch (error) {
    console.error('Error converting hex to double:', error)
    return NaN
  }
}



/**
 * Calculate polygon center from coordinates
 */
export function calculatePolygonCenter(coordinates: Array<{ lat: number; lng: number }>): { lat: number; lng: number } {
  if (coordinates.length === 0) {
    return { lat: -20.2, lng: 57.6 } // Default Mauritius center
  }
  
  const sumLat = coordinates.reduce((sum, coord) => sum + coord.lat, 0)
  const sumLng = coordinates.reduce((sum, coord) => sum + coord.lng, 0)
  
  return {
    lat: sumLat / coordinates.length,
    lng: sumLng / coordinates.length
  }
}
