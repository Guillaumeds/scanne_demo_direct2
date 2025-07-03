import fs from 'fs'
import path from 'path'
import { parse } from 'csv-parse/sync'

export interface ClimateDataRecord {
  id?: string
  stationId: string
  observationDate: string
  observationYear: number
  observationMonth: number
  observationDay: number
  julianDay: number
  temperatureMinCelsius: number | null
  temperatureMaxCelsius: number | null
  solarRadiationMjPerM2: number | null
  evapotranspirationMm: number | null
  precipitationMm: number | null
  windSpeedMPerS: number | null
  vaporPressureHpa: number | null
  co2ConcentrationPpm: number | null
  relativeHumidityPercent?: number | null
}

export interface ClimateDataSummary {
  totalRecords: number
  dateRange: {
    start: string
    end: string
  }
  stations: string[]
  dataQuality: {
    completeRecords: number
    missingTemperatureMin: number
    missingTemperatureMax: number
    missingSolarRadiation: number
    missingPrecipitation: number
    missingWindSpeed: number
    missingVaporPressure: number
    missingCO2: number
  }
}

export class ClimateDataImportService {
  
  /**
   * Parse CSV file and convert to ClimateDataRecord array
   */
  static parseClimateDataCSV(filePath: string): ClimateDataRecord[] {
    try {
      console.log(`Reading climate data from: ${filePath}`)
      
      const fileContent = fs.readFileSync(filePath, 'utf-8')
      const records = parse(fileContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true
      })

      console.log(`Parsed ${records.length} records from CSV`)

      return records.map((record: any) => {
        // Helper function to parse numeric values, treating -999.9 as null
        const parseNumeric = (value: string | number): number | null => {
          if (value === null || value === undefined || value === '' || value === '-999.9' || parseFloat(value.toString()) === -999.9) {
            return null
          }
          const parsed = parseFloat(value.toString())
          return isNaN(parsed) ? null : parsed
        }

        // Create observation date from year, month, day
        const observationDate = `${record.observation_year}-${String(record.observation_month).padStart(2, '0')}-${String(record.observation_day).padStart(2, '0')}`

        return {
          stationId: record.station_id || 'unknown',
          observationDate,
          observationYear: parseInt(record.observation_year),
          observationMonth: parseInt(record.observation_month),
          observationDay: parseInt(record.observation_day),
          julianDay: parseInt(record.julian_day),
          temperatureMinCelsius: parseNumeric(record.temperature_min_celsius),
          temperatureMaxCelsius: parseNumeric(record.temperature_max_celsius),
          solarRadiationMjPerM2: parseNumeric(record.solar_radiation_mj_per_m2),
          evapotranspirationMm: parseNumeric(record.evapotranspiration_mm),
          precipitationMm: parseNumeric(record.precipitation_mm),
          windSpeedMPerS: parseNumeric(record.wind_speed_m_per_s),
          vaporPressureHpa: parseNumeric(record.vapor_pressure_hpa),
          co2ConcentrationPpm: parseNumeric(record.co2_concentration_ppm),
          relativeHumidityPercent: null // Can be calculated from vapor pressure if needed
        }
      })
    } catch (error) {
      console.error('Error parsing climate data CSV:', error)
      throw new Error(`Failed to parse climate data CSV: ${error}`)
    }
  }

  /**
   * Generate summary statistics for climate data
   */
  static generateDataSummary(records: ClimateDataRecord[]): ClimateDataSummary {
    if (records.length === 0) {
      return {
        totalRecords: 0,
        dateRange: { start: '', end: '' },
        stations: [],
        dataQuality: {
          completeRecords: 0,
          missingTemperatureMin: 0,
          missingTemperatureMax: 0,
          missingSolarRadiation: 0,
          missingPrecipitation: 0,
          missingWindSpeed: 0,
          missingVaporPressure: 0,
          missingCO2: 0
        }
      }
    }

    // Sort records by date to find range
    const sortedRecords = [...records].sort((a, b) => a.observationDate.localeCompare(b.observationDate))
    
    // Get unique stations
    const stations = [...new Set(records.map(r => r.stationId))]

    // Calculate data quality metrics
    let completeRecords = 0
    let missingTemperatureMin = 0
    let missingTemperatureMax = 0
    let missingSolarRadiation = 0
    let missingPrecipitation = 0
    let missingWindSpeed = 0
    let missingVaporPressure = 0
    let missingCO2 = 0

    records.forEach(record => {
      const hasAllData = 
        record.temperatureMinCelsius !== null &&
        record.temperatureMaxCelsius !== null &&
        record.solarRadiationMjPerM2 !== null &&
        record.precipitationMm !== null &&
        record.windSpeedMPerS !== null &&
        record.vaporPressureHpa !== null &&
        record.co2ConcentrationPpm !== null

      if (hasAllData) completeRecords++
      if (record.temperatureMinCelsius === null) missingTemperatureMin++
      if (record.temperatureMaxCelsius === null) missingTemperatureMax++
      if (record.solarRadiationMjPerM2 === null) missingSolarRadiation++
      if (record.precipitationMm === null) missingPrecipitation++
      if (record.windSpeedMPerS === null) missingWindSpeed++
      if (record.vaporPressureHpa === null) missingVaporPressure++
      if (record.co2ConcentrationPpm === null) missingCO2++
    })

    return {
      totalRecords: records.length,
      dateRange: {
        start: sortedRecords[0].observationDate,
        end: sortedRecords[sortedRecords.length - 1].observationDate
      },
      stations,
      dataQuality: {
        completeRecords,
        missingTemperatureMin,
        missingTemperatureMax,
        missingSolarRadiation,
        missingPrecipitation,
        missingWindSpeed,
        missingVaporPressure,
        missingCO2
      }
    }
  }

  /**
   * Save climate data records to database (localStorage for now)
   */
  static saveClimateData(records: ClimateDataRecord[]): void {
    try {
      // For now, save to localStorage. In production, this would go to the database
      const existingData = this.getAllClimateData()
      
      // Create a map for efficient lookups
      const existingMap = new Map(
        existingData.map(record => [`${record.stationId}-${record.observationDate}`, record])
      )

      // Add new records, avoiding duplicates
      let addedCount = 0
      let updatedCount = 0

      records.forEach(record => {
        const key = `${record.stationId}-${record.observationDate}`
        if (existingMap.has(key)) {
          // Update existing record
          existingMap.set(key, { ...record, id: existingMap.get(key)!.id })
          updatedCount++
        } else {
          // Add new record
          const newRecord = { ...record, id: `climate_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` }
          existingMap.set(key, newRecord)
          addedCount++
        }
      })

      // Convert back to array and save
      const allRecords = Array.from(existingMap.values())
      localStorage.setItem('climate_data', JSON.stringify(allRecords))

      console.log(`Climate data saved: ${addedCount} new records, ${updatedCount} updated records`)
    } catch (error) {
      console.error('Error saving climate data:', error)
      throw new Error(`Failed to save climate data: ${error}`)
    }
  }

  /**
   * Get all climate data from storage
   */
  static getAllClimateData(): ClimateDataRecord[] {
    try {
      const data = localStorage.getItem('climate_data')
      return data ? JSON.parse(data) : []
    } catch (error) {
      console.error('Error loading climate data:', error)
      return []
    }
  }

  /**
   * Get climate data for a specific date range
   */
  static getClimateDataByDateRange(startDate: string, endDate: string, stationId?: string): ClimateDataRecord[] {
    const allData = this.getAllClimateData()
    
    return allData.filter(record => {
      const dateMatch = record.observationDate >= startDate && record.observationDate <= endDate
      const stationMatch = !stationId || record.stationId === stationId
      return dateMatch && stationMatch
    })
  }

  /**
   * Import climate data from CSV file
   */
  static async importFromCSV(filePath: string): Promise<{
    success: boolean
    summary: ClimateDataSummary
    message: string
  }> {
    try {
      console.log('Starting climate data import...')
      
      // Parse CSV file
      const records = this.parseClimateDataCSV(filePath)
      
      // Generate summary
      const summary = this.generateDataSummary(records)
      
      // Save to database
      this.saveClimateData(records)
      
      const message = `Successfully imported ${summary.totalRecords} climate records from ${summary.dateRange.start} to ${summary.dateRange.end}. Data quality: ${summary.dataQuality.completeRecords} complete records (${((summary.dataQuality.completeRecords / summary.totalRecords) * 100).toFixed(1)}%).`
      
      console.log(message)
      
      return {
        success: true,
        summary,
        message
      }
    } catch (error) {
      console.error('Climate data import failed:', error)
      return {
        success: false,
        summary: this.generateDataSummary([]),
        message: `Import failed: ${error}`
      }
    }
  }

  /**
   * Clear all climate data
   */
  static clearAllClimateData(): void {
    localStorage.removeItem('climate_data')
    console.log('All climate data cleared')
  }
}
