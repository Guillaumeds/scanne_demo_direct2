/**
 * Utility functions for geographic calculations
 */

/**
 * Calculate the center point (centroid) of a polygon
 * @param coordinates Array of [longitude, latitude] coordinates
 * @returns [longitude, latitude] of the center point
 */
export function calculatePolygonCenter(coordinates: [number, number][]): [number, number] {
  if (coordinates.length === 0) {
    throw new Error('Cannot calculate center of empty polygon')
  }

  // Calculate the centroid using the average of all coordinates
  const sumLat = coordinates.reduce((sum, coord) => sum + coord[1], 0)
  const sumLng = coordinates.reduce((sum, coord) => sum + coord[0], 0)
  
  const centerLat = sumLat / coordinates.length
  const centerLng = sumLng / coordinates.length
  
  return [centerLng, centerLat]
}

/**
 * Convert coordinates to a formatted string for display
 * @param coordinates [longitude, latitude]
 * @returns Formatted coordinate string
 */
export function formatCoordinates(coordinates: [number, number]): string {
  const [lng, lat] = coordinates
  return `${lat.toFixed(6)}°, ${lng.toFixed(6)}°`
}
