#!/usr/bin/env node

/**
 * Climate Data Import Script
 * 
 * This script imports climate data from a CSV file into the database.
 * Usage: node scripts/import-climate-data.js [csv-file-path]
 */

const fs = require('fs')
const path = require('path')
const { parse } = require('csv-parse/sync')

// Configuration
const CSV_FILE_PATH = process.argv[2] || 'unified_climate_data.csv'

/**
 * Parse numeric values, treating -999.9 as null (missing data indicator)
 */
function parseNumeric(value) {
  if (value === null || value === undefined || value === '' || value === '-999.9' || parseFloat(value) === -999.9) {
    return null
  }
  const parsed = parseFloat(value)
  return isNaN(parsed) ? null : parsed
}

/**
 * Parse climate data CSV file
 */
function parseClimateDataCSV(filePath) {
  try {
    console.log(`📊 Reading climate data from: ${filePath}`)
    
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`)
    }

    const fileContent = fs.readFileSync(filePath, 'utf-8')
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    })

    console.log(`📈 Parsed ${records.length} records from CSV`)

    return records.map((record, index) => {
      try {
        // Create observation date from year, month, day
        const observationDate = `${record.observation_year}-${String(record.observation_month).padStart(2, '0')}-${String(record.observation_day).padStart(2, '0')}`

        return {
          station_id: record.station_id || 'unknown',
          observation_date: observationDate,
          observation_year: parseInt(record.observation_year),
          observation_month: parseInt(record.observation_month),
          observation_day: parseInt(record.observation_day),
          julian_day: parseInt(record.julian_day),
          temperature_min_celsius: parseNumeric(record.temperature_min_celsius),
          temperature_max_celsius: parseNumeric(record.temperature_max_celsius),
          solar_radiation_mj_per_m2: parseNumeric(record.solar_radiation_mj_per_m2),
          evapotranspiration_mm: parseNumeric(record.evapotranspiration_mm),
          precipitation_mm: parseNumeric(record.precipitation_mm),
          wind_speed_m_per_s: parseNumeric(record.wind_speed_m_per_s),
          vapor_pressure_hpa: parseNumeric(record.vapor_pressure_hpa),
          co2_concentration_ppm: parseNumeric(record.co2_concentration_ppm),
          relative_humidity_percent: null // Can be calculated from vapor pressure if needed
        }
      } catch (error) {
        console.error(`❌ Error parsing record ${index + 1}:`, error)
        return null
      }
    }).filter(record => record !== null)
  } catch (error) {
    console.error('❌ Error parsing climate data CSV:', error)
    throw error
  }
}

/**
 * Generate summary statistics
 */
function generateDataSummary(records) {
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
  const sortedRecords = [...records].sort((a, b) => a.observation_date.localeCompare(b.observation_date))
  
  // Get unique stations
  const stations = [...new Set(records.map(r => r.station_id))]

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
      record.temperature_min_celsius !== null &&
      record.temperature_max_celsius !== null &&
      record.solar_radiation_mj_per_m2 !== null &&
      record.precipitation_mm !== null &&
      record.wind_speed_m_per_s !== null &&
      record.vapor_pressure_hpa !== null &&
      record.co2_concentration_ppm !== null

    if (hasAllData) completeRecords++
    if (record.temperature_min_celsius === null) missingTemperatureMin++
    if (record.temperature_max_celsius === null) missingTemperatureMax++
    if (record.solar_radiation_mj_per_m2 === null) missingSolarRadiation++
    if (record.precipitation_mm === null) missingPrecipitation++
    if (record.wind_speed_m_per_s === null) missingWindSpeed++
    if (record.vapor_pressure_hpa === null) missingVaporPressure++
    if (record.co2_concentration_ppm === null) missingCO2++
  })

  return {
    totalRecords: records.length,
    dateRange: {
      start: sortedRecords[0].observation_date,
      end: sortedRecords[sortedRecords.length - 1].observation_date
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
 * Generate SQL INSERT statements
 */
function generateInsertSQL(records) {
  const sqlStatements = []
  
  // Create batches of 1000 records for efficient insertion
  const batchSize = 1000
  for (let i = 0; i < records.length; i += batchSize) {
    const batch = records.slice(i, i + batchSize)
    
    const values = batch.map(record => {
      const values = [
        `'${record.station_id}'`,
        `'${record.observation_date}'`,
        record.observation_year,
        record.observation_month,
        record.observation_day,
        record.julian_day,
        record.temperature_min_celsius || 'NULL',
        record.temperature_max_celsius || 'NULL',
        record.solar_radiation_mj_per_m2 || 'NULL',
        record.evapotranspiration_mm || 'NULL',
        record.precipitation_mm || 'NULL',
        record.wind_speed_m_per_s || 'NULL',
        record.vapor_pressure_hpa || 'NULL',
        record.co2_concentration_ppm || 'NULL',
        'NULL' // relative_humidity_percent
      ]
      return `(${values.join(', ')})`
    }).join(',\n    ')

    const sql = `INSERT INTO climate_data (
    station_id, observation_date, observation_year, observation_month, observation_day,
    julian_day, temperature_min_celsius, temperature_max_celsius, solar_radiation_mj_per_m2,
    evapotranspiration_mm, precipitation_mm, wind_speed_m_per_s, vapor_pressure_hpa,
    co2_concentration_ppm, relative_humidity_percent
) VALUES
    ${values}
ON CONFLICT (station_id, observation_date) DO UPDATE SET
    temperature_min_celsius = EXCLUDED.temperature_min_celsius,
    temperature_max_celsius = EXCLUDED.temperature_max_celsius,
    solar_radiation_mj_per_m2 = EXCLUDED.solar_radiation_mj_per_m2,
    evapotranspiration_mm = EXCLUDED.evapotranspiration_mm,
    precipitation_mm = EXCLUDED.precipitation_mm,
    wind_speed_m_per_s = EXCLUDED.wind_speed_m_per_s,
    vapor_pressure_hpa = EXCLUDED.vapor_pressure_hpa,
    co2_concentration_ppm = EXCLUDED.co2_concentration_ppm,
    updated_at = NOW();`

    sqlStatements.push(sql)
  }
  
  return sqlStatements
}

/**
 * Main import function
 */
async function importClimateData() {
  try {
    console.log('🌤️  Climate Data Import Script')
    console.log('================================')
    
    // Parse CSV file
    const records = parseClimateDataCSV(CSV_FILE_PATH)
    
    // Generate summary
    const summary = generateDataSummary(records)
    
    // Display summary
    console.log('\n📊 Data Summary:')
    console.log(`   Total Records: ${summary.totalRecords.toLocaleString()}`)
    console.log(`   Date Range: ${summary.dateRange.start} to ${summary.dateRange.end}`)
    console.log(`   Stations: ${summary.stations.join(', ')}`)
    console.log(`   Complete Records: ${summary.dataQuality.completeRecords.toLocaleString()} (${((summary.dataQuality.completeRecords / summary.totalRecords) * 100).toFixed(1)}%)`)
    
    console.log('\n🔍 Data Quality:')
    console.log(`   Missing Temperature Min: ${summary.dataQuality.missingTemperatureMin.toLocaleString()}`)
    console.log(`   Missing Temperature Max: ${summary.dataQuality.missingTemperatureMax.toLocaleString()}`)
    console.log(`   Missing Solar Radiation: ${summary.dataQuality.missingSolarRadiation.toLocaleString()}`)
    console.log(`   Missing Precipitation: ${summary.dataQuality.missingPrecipitation.toLocaleString()}`)
    console.log(`   Missing Wind Speed: ${summary.dataQuality.missingWindSpeed.toLocaleString()}`)
    console.log(`   Missing Vapor Pressure: ${summary.dataQuality.missingVaporPressure.toLocaleString()}`)
    console.log(`   Missing CO2: ${summary.dataQuality.missingCO2.toLocaleString()}`)
    
    // Generate SQL
    console.log('\n🔄 Generating SQL statements...')
    const sqlStatements = generateInsertSQL(records)
    
    // Write SQL to file
    const outputFile = 'database/climate_data_import.sql'
    const sqlContent = `-- Climate Data Import
-- Generated on: ${new Date().toISOString()}
-- Total Records: ${summary.totalRecords.toLocaleString()}
-- Date Range: ${summary.dateRange.start} to ${summary.dateRange.end}

${sqlStatements.join('\n\n')}`
    
    fs.writeFileSync(outputFile, sqlContent)
    
    console.log(`✅ SQL import file generated: ${outputFile}`)
    console.log(`📝 Contains ${sqlStatements.length} batch INSERT statements`)
    console.log('\n🚀 To import into database, run:')
    console.log(`   psql -d your_database -f ${outputFile}`)
    console.log('   or use your preferred database client')
    
  } catch (error) {
    console.error('❌ Import failed:', error.message)
    process.exit(1)
  }
}

// Run the import
importClimateData()
