-- =====================================================
-- GRANT ANONYMOUS PERMISSIONS TO ALL TABLES
-- =====================================================
-- This script grants full permissions to the 'anon' role
-- This is what makes tables "publicly readable and writable"
-- Run this in your Supabase SQL Editor

-- =====================================================
-- GRANT PERMISSIONS TO SPECIFIC TABLES
-- =====================================================

-- Configuration tables
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE operation_type_config TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE operations_method TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE products TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE resources TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE equipment TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE sugarcane_varieties TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE intercrop_varieties TO anon;

-- Core operational tables
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE companies TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE farms TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE blocs TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE crop_cycles TO anon;

-- New operations system tables
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE field_operations TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE daily_work_packages TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE operation_equipment TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE operation_products TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE operation_resources TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE work_package_equipment TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE work_package_products TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE work_package_resources TO anon;

-- Data tables
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE observations TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE climatic_data TO anon;

-- =====================================================
-- GRANT PERMISSIONS TO ALL APPLICATION TABLES (DYNAMIC)
-- =====================================================

-- Grant permissions to all application tables automatically
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public'
        AND tablename NOT LIKE 'spatial_%'  -- Exclude PostGIS system tables
        AND tablename NOT LIKE 'geography_%'  -- Exclude PostGIS system tables
        AND tablename NOT LIKE 'geometry_%'  -- Exclude PostGIS system tables
        AND tablename NOT IN ('raster_columns', 'raster_overviews')  -- Exclude other system tables
    ) LOOP
        BEGIN
            EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE %I TO anon', r.tablename);
            RAISE NOTICE 'Granted permissions on table: %', r.tablename;
        EXCEPTION
            WHEN insufficient_privilege THEN
                RAISE NOTICE 'Skipping table % (insufficient privileges)', r.tablename;
            WHEN OTHERS THEN
                RAISE NOTICE 'Error granting permissions on table %: %', r.tablename, SQLERRM;
        END;
    END LOOP;
END $$;

-- =====================================================
-- GRANT USAGE ON SEQUENCES (for auto-increment IDs)
-- =====================================================

-- Grant usage on all sequences to anon role
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT sequencename 
        FROM pg_sequences 
        WHERE schemaname = 'public'
    ) LOOP
        BEGIN
            EXECUTE format('GRANT USAGE, SELECT ON SEQUENCE %I TO anon', r.sequencename);
            RAISE NOTICE 'Granted sequence permissions: %', r.sequencename;
        EXCEPTION
            WHEN OTHERS THEN
                RAISE NOTICE 'Error granting sequence permissions on %: %', r.sequencename, SQLERRM;
        END;
    END LOOP;
END $$;

-- =====================================================
-- VERIFICATION
-- =====================================================

-- Check permissions granted to anon role
SELECT
    table_schema,
    table_name,
    privilege_type
FROM information_schema.table_privileges
WHERE grantee = 'anon'
AND table_schema = 'public'
AND table_name IN ('operation_type_config', 'operations_method', 'products', 'resources')
ORDER BY table_name, privilege_type;

-- Test access to the problematic tables
SELECT 'operation_type_config' as table_name, COUNT(*) as row_count FROM operation_type_config
UNION ALL
SELECT 'operations_method', COUNT(*) FROM operations_method
UNION ALL
SELECT 'products', COUNT(*) FROM products
UNION ALL
SELECT 'resources', COUNT(*) FROM resources;

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================

SELECT 'SUCCESS: Anonymous permissions granted to all tables!' as status;

-- =====================================================
-- NOTES
-- =====================================================
-- 
-- ✅ This grants full CRUD permissions to anonymous users
-- ✅ Tables should now show the "publicly readable and writable" warning
-- ✅ Lock icons should disappear from tables in Supabase dashboard
-- ✅ 401 Unauthorized errors should be resolved
-- 
-- ⚠️  WARNING: This makes your database completely open
-- ⚠️  Only use for development - implement proper auth for production
-- 
-- 🔍 After running this script:
-- 1. Refresh your Supabase dashboard
-- 2. Check that tables show "publicly readable and writable" warning
-- 3. Restart your development server
-- 4. Verify 401 errors are gone
-- =====================================================
