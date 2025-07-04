#!/usr/bin/env node

/**
 * CSV Generator for Database Migration
 * Transforms frontend data arrays into database-ready CSV files
 * Handles special characters, arrays, and enum mapping
 */

const fs = require('fs');
const path = require('path');

// Import frontend data (we'll need to copy the data here or import from TS files)
// For now, let's define the category mappings

const PRODUCT_CATEGORY_MAPPING = {
  'compound-npk': 'Compound and NPK Fertilizers',
  'nitrogen': 'Nitrogen Fertilizers', 
  'phosphorus-potassium': 'Phosphorus and Potassium Fertilizers',
  'calcium-magnesium': 'Calcium and Magnesium Fertilizers',
  'micronutrient': 'Micronutrient and Specialty Fertilizers',
  'organic-bio': 'Organic and Bio Fertilizers',
  'other': 'Other Fertilizer Products'
};

const RESOURCE_CATEGORY_MAPPING = {
  'fleet': 'Fleet & Vehicles',
  'labour': 'Labour & Personnel',
  'equipment': 'Equipment & Tools', 
  'machinery': 'Heavy Machinery',
  'transport': 'Transport & Logistics',
  'irrigation': 'Irrigation Systems',
  'harvesting': 'Harvesting Equipment',
  'processing': 'Processing Equipment'
};

// Helper functions
const escapeCSV = (value) => {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

const arrayToPostgresArray = (arr) => {
  if (!arr || arr.length === 0) return null;
  return `{${arr.join(',')}}`;
};

// Transform functions
const transformSugarcaneVariety = (variety) => ({
  variety_id: variety.id,
  name: variety.name,
  category: 'Sugarcane Variety',
  category_enum: 'sugarcane',
  harvest_start_month: variety.harvestStart,
  harvest_end_month: variety.harvestEnd,
  seasons: arrayToPostgresArray(variety.seasons),
  soil_types: arrayToPostgresArray(variety.soilTypes),
  sugar_content_percent: null, // Not in frontend data
  characteristics: variety.characteristics ? JSON.stringify(variety.characteristics) : '{}',
  description: variety.description || null,
  icon: null, // Not used in demo
  image_url: variety.image || null,
  information_leaflet_url: variety.pdfUrl || null,
  active: true
});

const transformIntercropVariety = (variety) => ({
  variety_id: variety.id,
  name: variety.name,
  scientific_name: variety.scientificName || null,
  category_enum: 'intercrop',
  benefits: arrayToPostgresArray(variety.benefits),
  planting_time: variety.plantingTime || null,
  harvest_time: variety.harvestTime || null,
  description: variety.description || null,
  icon: null, // Not used in demo
  image_url: variety.image || null,
  information_leaflet_url: null,
  active: true
});

const transformProduct = (product) => ({
  product_id: product.id,
  name: product.name,
  category: PRODUCT_CATEGORY_MAPPING[product.category] || product.category,
  category_enum: product.category,
  description: product.description || null,
  unit: product.unit,
  recommended_rate_per_ha: product.defaultRate || null,
  cost_per_unit: product.cost || null,
  brand: product.brand || null,
  composition: product.composition || null,
  icon: null, // Not used in demo
  image_url: null,
  information_url: null,
  specifications: '{}',
  safety_datasheet_url: null,
  active: true
});

const transformResource = (resource) => ({
  resource_id: resource.id,
  name: resource.name,
  category: RESOURCE_CATEGORY_MAPPING[resource.category] || resource.category,
  category_enum: resource.category,
  description: resource.description || null,
  unit: resource.unit,
  cost_per_hour: resource.unit === 'hours' ? resource.costPerUnit : null,
  cost_per_unit: resource.unit !== 'hours' ? resource.costPerUnit : null,
  skill_level: resource.skillLevel || null,
  overtime_multiplier: resource.overtimeMultiplier || 1.0,
  icon: null, // Not used in demo
  specifications: '{}',
  active: true
});

// CSV generation functions
const generateCSV = (data, headers) => {
  const csvHeaders = headers.join(',');
  const csvRows = data.map(row => 
    headers.map(header => escapeCSV(row[header])).join(',')
  );
  return [csvHeaders, ...csvRows].join('\n');
};

// Season calculation helper (copied from frontend)
const getSeasons = (startMonth, endMonth) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const seasons = [];

  const startIdx = months.indexOf(startMonth);
  const endIdx = months.indexOf(endMonth);

  if (startIdx <= endIdx) {
    for (let i = startIdx; i <= endIdx; i++) {
      seasons.push(months[i]);
    }
  } else {
    for (let i = startIdx; i < months.length; i++) {
      seasons.push(months[i]);
    }
    for (let i = 0; i <= endIdx; i++) {
      seasons.push(months[i]);
    }
  }

  return seasons;
};

// Sample data (first few entries for testing - full data would be added here)
const SUGARCANE_VARIETIES = [
  { id: 'm-1176-77', name: 'M 1176/77', category: 'sugarcane', harvestStart: 'Aug', harvestEnd: 'Sep', seasons: getSeasons('Aug', 'Sep'), soilTypes: ['L1', 'L2', 'P1', 'P2', 'P3'] },
  { id: 'm-52-78', name: 'M 52/78', category: 'sugarcane', harvestStart: 'Jun', harvestEnd: 'Aug', seasons: getSeasons('Jun', 'Aug'), soilTypes: ['B1', 'B2', 'F1', 'F2', 'H1', 'H2', 'L2'] },
  { id: 'm-2283-98', name: 'M 2283/98', category: 'sugarcane', harvestStart: 'Aug', harvestEnd: 'Nov', seasons: getSeasons('Aug', 'Nov'), image: '/images/varieties/m-2283-98.jpg', pdfUrl: 'http://www.msiri.mu/UserFiles/File/sugarcane%20pamphlets/M%2283-98.pdf', soilTypes: ['B1', 'B2', 'F1', 'F2'] }
];

const INTERCROP_PLANTS = [
  {
    id: 'none',
    name: 'None',
    scientificName: '',
    category: 'intercrop',
    benefits: ['No intercrop selected', 'Monoculture sugarcane'],
    plantingTime: '',
    harvestTime: '',
    description: 'No intercrop companion plant selected'
  },
  {
    id: 'cowpea',
    name: 'Cowpea',
    scientificName: 'Vigna unguiculata',
    category: 'intercrop',
    benefits: ['Nitrogen fixation', 'Soil improvement', 'Additional income', 'Ground cover'],
    plantingTime: 'Early rainy season',
    harvestTime: '60-90 days',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Vigna_unguiculata_Blanco2.286-cropped.jpg/300px-Vigna_unguiculata_Blanco2.286-cropped.jpg',
    description: 'Fast-growing legume that fixes nitrogen and provides ground cover'
  }
];

const PRODUCTS = [
  { id: 'npk-13-13-20', name: '13-13-20+2MgO', category: 'compound-npk', unit: 'kg', defaultRate: 250, cost: 45 },
  { id: 'npk-13-8-24', name: '13:8:24', category: 'compound-npk', unit: 'kg', defaultRate: 250, cost: 42 },
  { id: 'urea-46', name: 'Urea (46% N, Granular)', category: 'nitrogen', unit: 'kg', defaultRate: 130, cost: 30 }
];

const RESOURCES = [
  { id: 'tractor-small', name: 'Small Tractor (40-60 HP)', category: 'fleet', unit: 'hours', defaultRate: 1, costPerUnit: 450 },
  { id: 'field-worker', name: 'Field Worker', category: 'labour', unit: 'hours', defaultRate: 8, costPerUnit: 25, skillLevel: 'Basic' },
  { id: 'plow', name: 'Moldboard Plow', category: 'equipment', unit: 'hours', defaultRate: 1, costPerUnit: 50 }
];

// Main execution
console.log('🚀 Starting CSV generation for database migration...');

const outputDir = path.join(__dirname, 'csv-output');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}
