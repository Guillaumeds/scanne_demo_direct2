const { createClient } = require('@supabase/supabase-js')

// Local Supabase configuration
const supabaseUrl = 'http://127.0.0.1:54321'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

const supabase = createClient(supabaseUrl, supabaseKey)

async function createDefaultField() {
  console.log('🌾 Creating placeholder field for bloc testing...')

  try {
    // First create a placeholder farm
    const placeholderFarmId = '00000000-0000-0000-0000-000000000001'

    const { data: existingFarm, error: farmCheckError } = await supabase
      .from('farms')
      .select('id')
      .eq('id', placeholderFarmId)
      .single()

    if (!existingFarm) {
      console.log('🏢 Creating placeholder farm...')
      const { error: farmError } = await supabase
        .from('farms')
        .insert({
          id: placeholderFarmId,
          farm_id: 'PLACEHOLDER_FARM',
          farm_name: 'Placeholder Farm for Testing',
          coordinates: 'POLYGON((-25 55, -15 55, -15 65, -25 65, -25 55))',
          area_hectares: 100000.0
        })

      if (farmError) {
        console.error('❌ Error creating placeholder farm:', farmError)
        throw farmError
      }
      console.log('✅ Placeholder farm created')
    }

    // Now create the placeholder field
    const placeholderFieldId = '00000000-0000-0000-0000-000000000000'

    const { data: existingField, error: checkError } = await supabase
      .from('fields')
      .select('id')
      .eq('id', placeholderFieldId)
      .single()

    if (existingField) {
      console.log('✅ Placeholder field already exists:', existingField.id)
      return existingField.id
    }

    // Insert the placeholder field
    const { data, error } = await supabase
      .from('fields')
      .insert({
        id: placeholderFieldId,
        field_id: 'PLACEHOLDER_FIELD',
        field_name: 'Placeholder Field for Bloc Testing',
        coordinates: 'POLYGON((-25 55, -15 55, -15 65, -25 65, -25 55))',
        area_hectares: 100000.0,
        farm_id: placeholderFarmId
      })
      .select('id')
      .single()

    if (error) {
      console.error('❌ Error creating placeholder field:', error)
      throw error
    }

    console.log('✅ Placeholder field created successfully:', data.id)
    return data.id

  } catch (error) {
    console.error('❌ Error:', error)
    throw error
  }
}

// Run the function
createDefaultField()
