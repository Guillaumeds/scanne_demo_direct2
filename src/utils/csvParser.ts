/**
 * CSV Parser Utility
 * Parses CSV data and converts to typed objects
 */

export interface CSVProduct {
  product_id: string
  name: string
  category: string
  subcategory: string
  description: string
  unit: string
  cost_per_unit: number
  active: boolean
}

export interface CSVSugarcaneVariety {
  variety_id: string
  name: string
  category: string
  category_enum: string
  harvest_start_month: string
  harvest_end_month: string
  seasons: string
  soil_types: string
  sugar_content_percent: string
  characteristics: string
  description: string
  icon: string
  image_url: string
  information_leaflet_url: string
  active: boolean
}

export interface CSVLabour {
  id: string
  labour_id: string
  name: string
  category: string
  unit: string
  cost_per_unit: number
  description: string
  active: boolean
  created_at: string
  updated_at: string
}

export interface CSVEquipment {
  id: string
  labour_id: string
  name: string
  category: string
  unit: string
  cost_per_unit: number
  description: string
  active: boolean
  created_at: string
  updated_at: string
}

/**
 * Parse CSV string to array of objects
 */
export function parseCSV<T>(csvContent: string): T[] {
  const lines = csvContent.trim().split('\n')
  if (lines.length < 2) return []

  const headers = lines[0].split(',').map(h => h.trim())
  const data: T[] = []

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue

    const values = parseCSVLine(line)
    if (values.length !== headers.length) continue

    const obj: any = {}
    headers.forEach((header, index) => {
      let value: any = values[index]?.trim() || ''
      
      // Convert boolean strings
      if (value === 'TRUE' || value === 'true') value = true
      else if (value === 'FALSE' || value === 'false') value = false
      
      // Convert numbers
      else if (header.includes('cost_per_unit') || header.includes('sugar_content_percent')) {
        const num = parseFloat(value)
        value = isNaN(num) ? 0 : num
      }
      
      obj[header] = value
    })
    
    data.push(obj as T)
  }

  return data
}

/**
 * Parse a single CSV line handling quoted values
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    
    if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === ',' && !inQuotes) {
      result.push(current)
      current = ''
    } else {
      current += char
    }
  }
  
  result.push(current)
  return result
}

/**
 * Generate UUID for items that need IDs
 */
export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}
