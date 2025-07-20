// Test EWKB coordinate parsing to see if coordinates are swapped

// Sample EWKB from field data (first field - "5316")
const testEWKB = '0103000020E610000001000000050000006FCFC229947234C0AA852AE82FD24C40F3B04F710A7134C0A429D033F6D04C40AE788623087234C08656267BA4D04C40A450D323797334C0BE123975E3D14C406FCFC229947234C0AA852AE82FD24C40'

// Hex to double conversion (simplified)
function hexToDouble(hex) {
  // Convert hex string to bytes
  const bytes = []
  for (let i = 0; i < hex.length; i += 2) {
    bytes.push(parseInt(hex.substr(i, 2), 16))
  }
  
  // Convert bytes to double (IEEE 754)
  const buffer = new ArrayBuffer(8)
  const view = new DataView(buffer)
  
  for (let i = 0; i < 8; i++) {
    view.setUint8(i, bytes[i])
  }
  
  return view.getFloat64(0, true) // true = little endian
}

function reverseHex(hex) {
  const result = []
  for (let i = hex.length - 2; i >= 0; i -= 2) {
    result.push(hex.substring(i, i + 2))
  }
  return result.join('')
}

console.log('🔍 Testing EWKB coordinate parsing...')
console.log(`EWKB: ${testEWKB.substring(0, 50)}...`)

// Parse first coordinate
let offset = 18 + 8 + 8 // Skip header + ring count + point count

// Get first point (32 hex chars = 16 for X, 16 for Y)
const xHex = testEWKB.substring(offset, offset + 16)
const yHex = testEWKB.substring(offset + 16, offset + 32)

console.log(`X hex: ${xHex}`)
console.log(`Y hex: ${yHex}`)

const x = hexToDouble(xHex)
const y = hexToDouble(yHex)

console.log(`X value: ${x}`)
console.log(`Y value: ${y}`)

// Check which interpretation makes sense for Mauritius
console.log('\n🌍 Coordinate Analysis:')
console.log(`If X=${x}, Y=${y}:`)
console.log(`  X as longitude: ${x} (${x >= 57 && x <= 58 ? '✅ Valid for Mauritius' : '❌ Invalid for Mauritius'})`)
console.log(`  Y as latitude: ${y} (${y >= -21 && y <= -19 ? '✅ Valid for Mauritius' : '❌ Invalid for Mauritius'})`)

console.log(`If X=${x}, Y=${y} (swapped):`)
console.log(`  X as latitude: ${x} (${x >= -21 && x <= -19 ? '✅ Valid for Mauritius' : '❌ Invalid for Mauritius'})`)
console.log(`  Y as longitude: ${y} (${y >= 57 && y <= 58 ? '✅ Valid for Mauritius' : '❌ Invalid for Mauritius'})`)

// Mauritius bounds: Latitude -21 to -19, Longitude 57 to 58
console.log('\n🎯 Conclusion:')
if (x >= 57 && x <= 58 && y >= -21 && y <= -19) {
  console.log('✅ Standard order: X=longitude, Y=latitude')
} else if (x >= -21 && x <= -19 && y >= 57 && y <= 58) {
  console.log('✅ Swapped order: X=latitude, Y=longitude')
} else {
  console.log('❌ Neither interpretation is valid for Mauritius!')
  console.log(`   X=${x}, Y=${y}`)
  console.log(`   Expected: lat=-21 to -19, lng=57 to 58`)
}
