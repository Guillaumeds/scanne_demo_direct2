/**
 * Fuzzy search utility for filtering items based on multiple searchable fields
 */

export interface SearchableItem {
  [key: string]: any
}

export interface FuzzySearchOptions {
  keys: string[] // Fields to search in
  threshold?: number // Minimum score threshold (0-1, lower = more strict)
  includeScore?: boolean
  caseSensitive?: boolean
}

/**
 * Calculate Levenshtein distance between two strings
 */
function levenshteinDistance(str1: string, str2: string): number {
  const matrix = []
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i]
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        )
      }
    }
  }
  
  return matrix[str2.length][str1.length]
}

/**
 * Calculate fuzzy match score between query and text
 */
function calculateScore(query: string, text: string, caseSensitive = false): number {
  if (!query || !text) return 0
  
  const normalizedQuery = caseSensitive ? query : query.toLowerCase()
  const normalizedText = caseSensitive ? text : text.toLowerCase()
  
  // Exact match gets highest score
  if (normalizedText === normalizedQuery) return 1
  
  // Contains match gets high score
  if (normalizedText.includes(normalizedQuery)) {
    const ratio = normalizedQuery.length / normalizedText.length
    return 0.8 + (ratio * 0.2) // 0.8 to 1.0 based on length ratio
  }
  
  // Fuzzy match using Levenshtein distance
  const distance = levenshteinDistance(normalizedQuery, normalizedText)
  const maxLength = Math.max(normalizedQuery.length, normalizedText.length)
  
  if (maxLength === 0) return 0
  
  const similarity = 1 - (distance / maxLength)
  return Math.max(0, similarity - 0.3) // Reduce base score for fuzzy matches
}

/**
 * Get nested property value from object using dot notation
 */
function getNestedValue(obj: any, path: string): string {
  return path.split('.').reduce((current, key) => {
    if (current && typeof current === 'object') {
      const value = current[key]
      if (Array.isArray(value)) {
        return value.join(' ') // Join arrays into searchable string
      }
      return value
    }
    return ''
  }, obj) || ''
}

/**
 * Perform fuzzy search on array of items
 */
export function fuzzySearch<T extends SearchableItem>(
  items: T[],
  query: string,
  options: FuzzySearchOptions
): T[] {
  const {
    keys,
    threshold = 0.3,
    caseSensitive = false
  } = options

  if (!query.trim()) return items

  const results = items.map(item => {
    let maxScore = 0
    
    // Search across all specified keys
    for (const key of keys) {
      const value = getNestedValue(item, key)
      if (typeof value === 'string') {
        const score = calculateScore(query, value, caseSensitive)
        maxScore = Math.max(maxScore, score)
      }
    }
    
    return {
      item,
      score: maxScore
    }
  })
  
  // Filter by threshold and sort by score
  return results
    .filter(result => result.score >= threshold)
    .sort((a, b) => b.score - a.score)
    .map(result => result.item)
}

/**
 * Highlight matching text in search results
 */
export function highlightMatch(text: string, query: string, caseSensitive = false): string {
  if (!query.trim()) return text
  
  const normalizedQuery = caseSensitive ? query : query.toLowerCase()
  const normalizedText = caseSensitive ? text : text.toLowerCase()
  
  const index = normalizedText.indexOf(normalizedQuery)
  if (index === -1) return text
  
  const before = text.substring(0, index)
  const match = text.substring(index, index + query.length)
  const after = text.substring(index + query.length)
  
  return `${before}<mark class="bg-yellow-200 px-1 rounded">${match}</mark>${after}`
}
