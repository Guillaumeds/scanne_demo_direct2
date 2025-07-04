const { createClient } = require('@supabase/supabase-js')

// Local Supabase configuration
const supabaseUrl = 'http://127.0.0.1:54321'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

const supabase = createClient(supabaseUrl, supabaseKey)

async function populateConfigData() {
  console.log('🚀 Starting config data population...')

  try {
    // 1. Clear existing data
    console.log('🧹 Clearing existing config data...')
    await supabase.from('sugarcane_varieties').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    await supabase.from('intercrop_varieties').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    await supabase.from('activity_categories').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    await supabase.from('observation_categories').delete().neq('id', '00000000-0000-0000-0000-000000000000')

    // 2. Create activity_templates table if it doesn't exist
    console.log('📋 Creating activity_templates table...')
    const { error: createTemplatesError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS activity_templates (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          template_id VARCHAR(50) NOT NULL UNIQUE,
          name VARCHAR(255) NOT NULL,
          description TEXT,
          phase VARCHAR(100) NOT NULL,
          estimated_duration_hours DECIMAL(8,2),
          resource_type VARCHAR(50) CHECK (resource_type IN ('manual', 'mechanical', 'both')),
          estimated_cost DECIMAL(12,2) DEFAULT 0,
          typical_products JSONB DEFAULT '[]',
          icon VARCHAR(50),
          color VARCHAR(7),
          active BOOLEAN DEFAULT true,
          sort_order INTEGER DEFAULT 999,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    })

    // 3. Create activity_phases table if it doesn't exist
    console.log('📋 Creating activity_phases table...')
    const { error: createPhasesError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS activity_phases (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          phase_id VARCHAR(50) NOT NULL UNIQUE,
          name VARCHAR(100) NOT NULL,
          description TEXT,
          color VARCHAR(100),
          icon VARCHAR(50),
          duration_description VARCHAR(100),
          sort_order INTEGER DEFAULT 999,
          active BOOLEAN DEFAULT true,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    })

    // 4. Populate Activity Phases
    console.log('🌱 Populating activity phases...')
    const activityPhases = [
      { phase_id: 'land-preparation', name: 'Land Preparation', description: 'Clearing, plowing, and soil preparation', color: 'bg-amber-100 text-amber-800 border-amber-200', icon: 'tractor', duration_description: '2-4 weeks', sort_order: 1 },
      { phase_id: 'planting', name: 'Planting', description: 'Seed bed preparation and planting', color: 'bg-green-100 text-green-800 border-green-200', icon: 'sprout', duration_description: '1-2 weeks', sort_order: 2 },
      { phase_id: 'establishment', name: 'Establishment', description: 'Initial growth and establishment care', color: 'bg-emerald-100 text-emerald-800 border-emerald-200', icon: 'leaf', duration_description: '2-3 months', sort_order: 3 },
      { phase_id: 'growth', name: 'Growth Phase', description: 'Active growth and development', color: 'bg-blue-100 text-blue-800 border-blue-200', icon: 'wheat', duration_description: '6-8 months', sort_order: 4 },
      { phase_id: 'maintenance', name: 'Maintenance', description: 'Ongoing care, fertilization, pest control', color: 'bg-purple-100 text-purple-800 border-purple-200', icon: 'wrench', duration_description: 'Ongoing', sort_order: 5 },
      { phase_id: 'pre-harvest', name: 'Pre-Harvest', description: 'Preparation for harvest activities', color: 'bg-orange-100 text-orange-800 border-orange-200', icon: 'clipboard', duration_description: '2-4 weeks', sort_order: 6 },
      { phase_id: 'harvest', name: 'Harvest', description: 'Cutting and collection of sugarcane', color: 'bg-red-100 text-red-800 border-red-200', icon: 'scissors', duration_description: '4-8 weeks', sort_order: 7 },
      { phase_id: 'post-harvest', name: 'Post-Harvest', description: 'Field cleanup and preparation for next cycle', color: 'bg-gray-100 text-gray-800 border-gray-200', icon: 'broom', duration_description: '2-3 weeks', sort_order: 8 }
    ]

    const { error: phasesError } = await supabase.from('activity_phases').insert(activityPhases)
    if (phasesError) console.error('Error inserting activity phases:', phasesError)

    // 5. Populate Activity Categories
    console.log('📂 Populating activity categories...')
    const activityCategories = [
      { category_id: 'land-preparation', name: 'Land Preparation', description: 'Clearing, plowing, and soil preparation', icon: 'tractor', color: '#8B5CF6', active: true },
      { category_id: 'planting', name: 'Planting', description: 'Seed bed preparation and planting', icon: 'sprout', color: '#10B981', active: true },
      { category_id: 'establishment', name: 'Establishment', description: 'Initial growth and establishment care', icon: 'leaf', color: '#22C55E', active: true },
      { category_id: 'growth', name: 'Growth Phase', description: 'Active growth and development', icon: 'wheat', color: '#3B82F6', active: true },
      { category_id: 'maintenance', name: 'Maintenance', description: 'Ongoing care, fertilization, pest control', icon: 'wrench', color: '#8B5CF6', active: true },
      { category_id: 'pre-harvest', name: 'Pre-Harvest', description: 'Preparation for harvest activities', icon: 'clipboard', color: '#F59E0B', active: true },
      { category_id: 'harvest', name: 'Harvest', description: 'Cutting and collection of sugarcane', icon: 'scissors', color: '#EF4444', active: true },
      { category_id: 'post-harvest', name: 'Post-Harvest', description: 'Field cleanup and preparation for next cycle', icon: 'broom', color: '#6B7280', active: true }
    ]

    const { error: categoriesError } = await supabase.from('activity_categories').insert(activityCategories)
    if (categoriesError) console.error('Error inserting activity categories:', categoriesError)

    // 6. Populate Observation Categories
    console.log('🔍 Populating observation categories...')
    const observationCategories = [
      { category_id: 'soil', name: 'Soil Observations', description: 'Soil texture, pH, nutrients, and physical properties', icon: 'mountain', color: '#8B4513', active: true },
      { category_id: 'water', name: 'Water Observations', description: 'Irrigation water quality and availability', icon: 'droplets', color: '#3B82F6', active: true },
      { category_id: 'plant-morphological', name: 'Plant Morphological', description: 'Plant height, diameter, and physical measurements', icon: 'ruler', color: '#22C55E', active: true },
      { category_id: 'growth-stage', name: 'Growth Stage', description: 'Plant development stage and growth progress', icon: 'trending-up', color: '#10B981', active: true },
      { category_id: 'pest-disease', name: 'Pest & Disease', description: 'Pest infestations and disease observations', icon: 'bug', color: '#EF4444', active: true },
      { category_id: 'weed', name: 'Weed Observations', description: 'Weed pressure and control effectiveness', icon: 'leaf', color: '#84CC16', active: true },
      { category_id: 'sugarcane-yield-quality', name: 'Sugarcane Yield & Quality', description: 'MANDATORY: Sugarcane harvest yield, quality, and revenue data', icon: 'bar-chart', color: '#F59E0B', active: true },
      { category_id: 'intercrop-yield-quality', name: 'Intercrop Yield & Quality', description: 'MANDATORY if intercrop planted: Intercrop harvest yield, quality, and revenue data', icon: 'wheat', color: '#6366F1', active: true }
    ]

    const { error: obsError } = await supabase.from('observation_categories').insert(observationCategories)
    if (obsError) console.error('Error inserting observation categories:', obsError)

    console.log('✅ Config data population completed successfully!')
    console.log('📊 Summary:')
    console.log('  - 8 Activity Phases')
    console.log('  - 8 Activity Categories') 
    console.log('  - 8 Observation Categories')
    console.log('  - Activity Templates table created')

  } catch (error) {
    console.error('❌ Error populating config data:', error)
  }
}

// Run the population
populateConfigData()
