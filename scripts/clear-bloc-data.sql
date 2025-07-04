-- 🗑️ Clear All Data Tables for Testing
-- This script safely removes ALL data while preserving configuration tables
-- Run this in Supabase SQL Editor or your database client

-- ⚠️ WARNING: This will delete ALL DATA including:
-- - All blocs, crop cycles, activities, observations, attachments
-- - All products, resources, varieties (user-created data)
-- ✅ PRESERVES: Configuration tables (activity_types, observation_types, etc.)
-- This action cannot be undone!

-- 🛡️ Safety check: Uncomment the line below to confirm you want to proceed
-- SET session_replication_role = replica; -- Disable triggers temporarily

BEGIN;

-- Show current data counts before deletion
DO $$
DECLARE
    blocs_count INTEGER;
    cycles_count INTEGER;
    activities_count INTEGER;
    observations_count INTEGER;
    attachments_count INTEGER;
    products_count INTEGER;
    resources_count INTEGER;
    sugarcane_varieties_count INTEGER;
    intercrop_varieties_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO blocs_count FROM blocs;
    SELECT COUNT(*) INTO cycles_count FROM crop_cycles;
    SELECT COUNT(*) INTO activities_count FROM activities;
    SELECT COUNT(*) INTO observations_count FROM observations;
    SELECT COUNT(*) INTO attachments_count FROM attachments;
    SELECT COUNT(*) INTO products_count FROM products;
    SELECT COUNT(*) INTO resources_count FROM resources;
    SELECT COUNT(*) INTO sugarcane_varieties_count FROM sugarcane_varieties;
    SELECT COUNT(*) INTO intercrop_varieties_count FROM intercrop_varieties;

    RAISE NOTICE '📊 BEFORE DELETION:';
    RAISE NOTICE '   Blocs: %', blocs_count;
    RAISE NOTICE '   Crop Cycles: %', cycles_count;
    RAISE NOTICE '   Activities: %', activities_count;
    RAISE NOTICE '   Observations: %', observations_count;
    RAISE NOTICE '   Attachments: %', attachments_count;
    RAISE NOTICE '   Products: %', products_count;
    RAISE NOTICE '   Resources: %', resources_count;
    RAISE NOTICE '   Sugarcane Varieties: %', sugarcane_varieties_count;
    RAISE NOTICE '   Intercrop Varieties: %', intercrop_varieties_count;
END $$;

-- Step 1: Delete attachments (references activities/observations)
DELETE FROM attachments;
RAISE NOTICE '✅ Deleted all attachments';

-- Step 2: Delete observations (references crop_cycles)
DELETE FROM observations;
RAISE NOTICE '✅ Deleted all observations';

-- Step 3: Delete activities (references crop_cycles)
DELETE FROM activities;
RAISE NOTICE '✅ Deleted all activities';

-- Step 4: Delete crop cycles (references blocs)
DELETE FROM crop_cycles;
RAISE NOTICE '✅ Deleted all crop cycles';

-- Step 5: Delete blocs (main table)
DELETE FROM blocs;
RAISE NOTICE '✅ Deleted all blocs';

-- Step 6: Delete user-created products (NOT product config/templates)
DELETE FROM products;
RAISE NOTICE '✅ Deleted all products';

-- Step 7: Delete user-created resources (NOT resource config/templates)
DELETE FROM resources;
RAISE NOTICE '✅ Deleted all resources';

-- Step 8: Delete user-created varieties (NOT variety config/templates)
DELETE FROM sugarcane_varieties WHERE created_by_user = true OR created_by_user IS NULL;
DELETE FROM intercrop_varieties WHERE created_by_user = true OR created_by_user IS NULL;
RAISE NOTICE '✅ Deleted user-created varieties (preserved system varieties)';

-- Reset sequences to start from 1
ALTER SEQUENCE IF EXISTS blocs_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS crop_cycles_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS activities_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS observations_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS attachments_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS products_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS resources_id_seq RESTART WITH 1;
RAISE NOTICE '✅ Reset all sequences to start from 1';

-- Verify all data is cleared
RAISE NOTICE '📊 AFTER DELETION:';
SELECT
  'blocs' as table_name,
  COUNT(*) as remaining_records
FROM blocs
UNION ALL
SELECT
  'crop_cycles' as table_name,
  COUNT(*) as remaining_records
FROM crop_cycles
UNION ALL
SELECT
  'activities' as table_name,
  COUNT(*) as remaining_records
FROM activities
UNION ALL
SELECT
  'observations' as table_name,
  COUNT(*) as remaining_records
FROM observations
UNION ALL
SELECT
  'attachments' as table_name,
  COUNT(*) as remaining_records
FROM attachments
UNION ALL
SELECT
  'products' as table_name,
  COUNT(*) as remaining_records
FROM products
UNION ALL
SELECT
  'resources' as table_name,
  COUNT(*) as remaining_records
FROM resources
UNION ALL
SELECT
  'sugarcane_varieties' as table_name,
  COUNT(*) as remaining_records
FROM sugarcane_varieties
UNION ALL
SELECT
  'intercrop_varieties' as table_name,
  COUNT(*) as remaining_records
FROM intercrop_varieties;

-- Show what configuration data is preserved
RAISE NOTICE '🛡️ PRESERVED CONFIGURATION DATA:';
SELECT
  'activity_types' as config_table,
  COUNT(*) as preserved_records
FROM activity_types
UNION ALL
SELECT
  'observation_types' as config_table,
  COUNT(*) as preserved_records
FROM observation_types
UNION ALL
SELECT
  'attachment_types' as config_table,
  COUNT(*) as preserved_records
FROM attachment_types
UNION ALL
SELECT
  'product_types' as config_table,
  COUNT(*) as preserved_records
FROM product_types
UNION ALL
SELECT
  'resource_types' as config_table,
  COUNT(*) as preserved_records
FROM resource_types;

-- Commit the transaction
COMMIT;

RAISE NOTICE '🎉 SUCCESS: All data tables cleared, configuration preserved!';
RAISE NOTICE '🧪 Database is ready for testing with clean data tables';
