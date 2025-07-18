-- =====================================================
-- DATABASE MIGRATION FOR MODERNIZATION
-- =====================================================
-- This script safely migrates from old RPC functions to new optimized ones

-- =====================================================
-- STEP 1: BACKUP EXISTING FUNCTIONS (Optional)
-- =====================================================
-- Uncomment if you want to backup the old function
-- CREATE OR REPLACE FUNCTION get_blocs_with_wkt_backup()
-- RETURNS TABLE(
--     id UUID,
--     name VARCHAR(255),
--     description TEXT,
--     area_hectares DECIMAL(10,2),
--     coordinates_wkt TEXT,
--     status VARCHAR(50),
--     created_at TIMESTAMP WITH TIME ZONE,
--     updated_at TIMESTAMP WITH TIME ZONE
-- )
-- LANGUAGE plpgsql
-- AS $$
-- BEGIN
--     RETURN QUERY
--     SELECT
--         b.id,
--         b.name,
--         CAST(NULL AS TEXT) as description,
--         b.area_hectares,
--         ST_AsText(b.coordinates) as coordinates_wkt,
--         b.status,
--         b.created_at,
--         b.updated_at
--     FROM blocs b
--     WHERE b.status = 'active'
--     ORDER BY b.created_at DESC;
-- END;
-- $$;

-- =====================================================
-- STEP 2: CHECK EXISTING FUNCTIONS
-- =====================================================
-- List all existing RPC functions to see what we have
SELECT 
    routine_name,
    routine_type,
    routine_definition
FROM information_schema.routines 
WHERE routine_schema = 'public' 
    AND routine_type = 'FUNCTION'
    AND routine_name IN (
        'get_blocs_with_wkt',
        'get_farm_gis_initial_data',
        'get_comprehensive_bloc_data',
        'create_crop_cycle',
        'create_field_operation',
        'insert_bloc_with_geometry'
    )
ORDER BY routine_name;

-- =====================================================
-- STEP 3: REMOVE OLD FUNCTIONS THAT WILL BE REPLACED
-- =====================================================

-- Remove the old get_blocs_with_wkt function (will be replaced by get_farm_gis_initial_data)
DROP FUNCTION IF EXISTS get_blocs_with_wkt();

-- Remove any old versions of our new functions if they exist
DROP FUNCTION IF EXISTS get_farm_gis_initial_data();
DROP FUNCTION IF EXISTS get_comprehensive_bloc_data(uuid);
DROP FUNCTION IF EXISTS create_crop_cycle(jsonb);
DROP FUNCTION IF EXISTS create_field_operation(jsonb);
DROP FUNCTION IF EXISTS create_work_package(jsonb);
DROP FUNCTION IF EXISTS update_field_operation(uuid, jsonb);
DROP FUNCTION IF EXISTS update_work_package(uuid, jsonb);
DROP FUNCTION IF EXISTS delete_field_operation(uuid);
DROP FUNCTION IF EXISTS delete_work_package(uuid);

-- =====================================================
-- STEP 4: VERIFY REQUIRED TABLES EXIST
-- =====================================================
-- Check that all required tables exist before creating functions
DO $$
DECLARE
    missing_tables TEXT[] := ARRAY[]::TEXT[];
BEGIN
    -- Check for required tables
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'blocs') THEN
        missing_tables := array_append(missing_tables, 'blocs');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'farms') THEN
        missing_tables := array_append(missing_tables, 'farms');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'companies') THEN
        missing_tables := array_append(missing_tables, 'companies');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'crop_cycles') THEN
        missing_tables := array_append(missing_tables, 'crop_cycles');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'field_operations') THEN
        missing_tables := array_append(missing_tables, 'field_operations');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'daily_work_packages') THEN
        missing_tables := array_append(missing_tables, 'daily_work_packages');
    END IF;
    
    -- Report missing tables
    IF array_length(missing_tables, 1) > 0 THEN
        RAISE NOTICE 'WARNING: Missing required tables: %', array_to_string(missing_tables, ', ');
        RAISE NOTICE 'Please ensure all tables are created before running the RPC functions.';
    ELSE
        RAISE NOTICE 'SUCCESS: All required tables exist.';
    END IF;
END $$;

-- =====================================================
-- STEP 5: VERIFY REQUIRED COLUMNS EXIST
-- =====================================================
-- Check that required columns exist in tables
DO $$
DECLARE
    missing_columns TEXT[] := ARRAY[]::TEXT[];
BEGIN
    -- Check blocs table columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'blocs' AND column_name = 'coordinates') THEN
        missing_columns := array_append(missing_columns, 'blocs.coordinates (geometry)');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'blocs' AND column_name = 'farm_id') THEN
        missing_columns := array_append(missing_columns, 'blocs.farm_id');
    END IF;
    
    -- Check crop_cycles table columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'crop_cycles' AND column_name = 'sugarcane_variety_id') THEN
        missing_columns := array_append(missing_columns, 'crop_cycles.sugarcane_variety_id');
    END IF;
    
    -- Report missing columns
    IF array_length(missing_columns, 1) > 0 THEN
        RAISE NOTICE 'WARNING: Missing required columns: %', array_to_string(missing_columns, ', ');
        RAISE NOTICE 'Please ensure all columns exist before running the RPC functions.';
    ELSE
        RAISE NOTICE 'SUCCESS: All required columns exist.';
    END IF;
END $$;

-- =====================================================
-- STEP 6: READY FOR NEW FUNCTIONS
-- =====================================================
RAISE NOTICE '✅ Database is ready for new RPC functions!';
RAISE NOTICE '📝 Next step: Run the database_rpc_functions.sql file';
RAISE NOTICE '🔧 Command: \i database_rpc_functions.sql';

-- =====================================================
-- STEP 7: POST-MIGRATION VERIFICATION QUERIES
-- =====================================================
-- These queries can be run after installing the new functions to verify they work

-- Test the new get_farm_gis_initial_data function
-- SELECT get_farm_gis_initial_data();

-- Test the new get_comprehensive_bloc_data function (replace with actual bloc ID)
-- SELECT get_comprehensive_bloc_data('your-bloc-id-here');

-- List all functions after migration
-- SELECT routine_name, routine_type 
-- FROM information_schema.routines 
-- WHERE routine_schema = 'public' 
--     AND routine_type = 'FUNCTION'
--     AND routine_name LIKE '%bloc%' OR routine_name LIKE '%farm%' OR routine_name LIKE '%crop%'
-- ORDER BY routine_name;
