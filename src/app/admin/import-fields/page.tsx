'use client'

import { useState } from 'react'
import { importFieldsFromCSV, getFieldStats } from '@/services/fieldService'

interface ImportStats {
  success: number
  errors: string[]
}

export default function ImportFieldsPage() {
  const [importing, setImporting] = useState(false)
  const [importStats, setImportStats] = useState<ImportStats | null>(null)
  const [fieldStats, setFieldStats] = useState<{ total: number; active: number; inactive: number } | null>(null)

  const BELLE_VUE_FARM_ID = '550e8400-e29b-41d4-a716-446655440001'

  // Parse a single CSV line, handling quoted values
  const parseCSVLine = (line: string): string[] => {
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

  // Load current field stats
  const loadFieldStats = async () => {
    try {
      const stats = await getFieldStats(BELLE_VUE_FARM_ID)
      setFieldStats(stats)
    } catch (error) {
      console.error('Error loading field stats:', error)
    }
  }

  // Import fields from the GeoJSON file
  const handleImport = async () => {
    try {
      setImporting(true)
      setImportStats(null)

      // Read the GeoJSON file from public directory
      const response = await fetch('/estate_fields.geojson')
      if (!response.ok) {
        throw new Error('Failed to load GeoJSON file')
      }

      const geoJsonData = await response.json()
      console.log(`📊 Loaded ${geoJsonData.features.length} features from GeoJSON`)

      // Convert GeoJSON features to CSV-like format for the import function
      const csvData = geoJsonData.features.map((feature: any) => {
        // Get the outer ring coordinates and ensure polygon is closed
        const coords = feature.geometry.coordinates[0]
        const coordsWithClosure = [...coords]

        // Ensure polygon is closed by checking if first and last coordinates match
        if (coords.length > 0) {
          const first = coords[0]
          const last = coords[coords.length - 1]
          if (first[0] !== last[0] || first[1] !== last[1]) {
            coordsWithClosure.push(first) // Close the polygon
          }
        }

        return {
          id: feature.properties.id,
          wkt: `POLYGON((${coordsWithClosure.map((coord: number[]) => `${coord[0]} ${coord[1]}`).join(', ')}))`,
          osm_id: feature.properties.osm_id.toString()
        }
      })

      console.log(`📊 Converted ${csvData.length} records for import`)

      // Import to database
      const results = await importFieldsFromCSV(csvData, BELLE_VUE_FARM_ID)
      setImportStats(results)

      // Refresh field stats
      await loadFieldStats()

    } catch (error) {
      console.error('Import error:', error)
      setImportStats({
        success: 0,
        errors: [`Import failed: ${error}`]
      })
    } finally {
      setImporting(false)
    }
  }

  // Load stats on component mount
  useState(() => {
    loadFieldStats()
  })

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Import Estate Fields</h1>
          
          {/* Current Stats */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">Current Database Status</h2>
            {fieldStats ? (
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{fieldStats.total}</div>
                  <div className="text-sm text-blue-800">Total Fields</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{fieldStats.active}</div>
                  <div className="text-sm text-green-800">Active Fields</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-gray-600">{fieldStats.inactive}</div>
                  <div className="text-sm text-gray-800">Inactive Fields</div>
                </div>
              </div>
            ) : (
              <div className="text-gray-500">Loading stats...</div>
            )}
          </div>

          {/* Import Section */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">Import from GeoJSON</h2>
            <p className="text-gray-600 mb-4">
              This will import field data from the <code className="bg-gray-100 px-2 py-1 rounded">estate_fields.geojson</code> file
              in the public directory. Existing fields will be skipped.
            </p>
            
            <button
              type="button"
              onClick={handleImport}
              disabled={importing}
              className={`px-6 py-3 rounded-lg font-medium ${
                importing
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              } transition-colors`}
            >
              {importing ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Importing...
                </span>
              ) : (
                'Import Fields from GeoJSON'
              )}
            </button>
          </div>

          {/* Import Results */}
          {importStats && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-700 mb-4">Import Results</h2>
              
              {importStats.success > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center">
                    <div className="text-green-500 text-xl mr-3">✅</div>
                    <div>
                      <div className="font-medium text-green-800">
                        Successfully imported {importStats.success} fields
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {importStats.errors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <div className="text-red-500 text-xl mr-3 mt-1">❌</div>
                    <div className="flex-1">
                      <div className="font-medium text-red-800 mb-2">
                        {importStats.errors.length} error(s) occurred:
                      </div>
                      <ul className="text-sm text-red-700 space-y-1">
                        {importStats.errors.map((error, index) => (
                          <li key={index} className="list-disc list-inside">
                            {error}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Navigation */}
          <div className="flex space-x-4">
            <a
              href="/admin/estate-setup"
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Estate Setup
            </a>
            <a
              href="/"
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              View Fields
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
