-- =====================================================
-- COMPLETELY DISABLE RLS AND REMOVE ALL POLICIES
-- =====================================================
-- This script will:
-- 1. Drop all existing RLS policies
-- 2. Disable RLS on all tables
-- 3. Ensure anonymous access to all tables
-- 
-- Run this in your Supabase SQL Editor

-- =====================================================
-- STEP 1: DROP ALL EXISTING POLICIES
-- =====================================================

-- Drop policies on configuration tables
DROP POLICY IF EXISTS "Allow anonymous read access to operation_type_config" ON operation_type_config;
DROP POLICY IF EXISTS "Allow authenticated read access to operation_type_config" ON operation_type_config;
DROP POLICY IF EXISTS "Allow anonymous read access to operations_method" ON operations_method;
DROP POLICY IF EXISTS "Allow authenticated read access to operations_method" ON operations_method;
DROP POLICY IF EXISTS "Allow anonymous read access to products" ON products;
DROP POLICY IF EXISTS "Allow authenticated read access to products" ON products;
DROP POLICY IF EXISTS "Allow anonymous read access to resources" ON resources;
DROP POLICY IF EXISTS "Allow authenticated read access to resources" ON resources;
DROP POLICY IF EXISTS "Allow anonymous read access to equipment" ON equipment;
DROP POLICY IF EXISTS "Allow authenticated read access to equipment" ON equipment;
DROP POLICY IF EXISTS "Allow anonymous read access to sugarcane_varieties" ON sugarcane_varieties;
DROP POLICY IF EXISTS "Allow authenticated read access to sugarcane_varieties" ON sugarcane_varieties;
DROP POLICY IF EXISTS "Allow anonymous read access to intercrop_varieties" ON intercrop_varieties;
DROP POLICY IF EXISTS "Allow authenticated read access to intercrop_varieties" ON intercrop_varieties;

-- Drop policies on operational tables
DROP POLICY IF EXISTS "Allow all operations on companies" ON companies;
DROP POLICY IF EXISTS "Allow authenticated all operations on companies" ON companies;
DROP POLICY IF EXISTS "Allow all operations on farms" ON farms;
DROP POLICY IF EXISTS "Allow authenticated all operations on farms" ON farms;
DROP POLICY IF EXISTS "Allow all operations on blocs" ON blocs;
DROP POLICY IF EXISTS "Allow authenticated all operations on blocs" ON blocs;
DROP POLICY IF EXISTS "Allow all operations on crop_cycles" ON crop_cycles;
DROP POLICY IF EXISTS "Allow authenticated all operations on crop_cycles" ON crop_cycles;
DROP POLICY IF EXISTS "Allow all operations on field_operations" ON field_operations;
DROP POLICY IF EXISTS "Allow authenticated all operations on field_operations" ON field_operations;
DROP POLICY IF EXISTS "Allow all operations on daily_work_packages" ON daily_work_packages;
DROP POLICY IF EXISTS "Allow authenticated all operations on daily_work_packages" ON daily_work_packages;
DROP POLICY IF EXISTS "Allow all operations on operation_equipment" ON operation_equipment;
DROP POLICY IF EXISTS "Allow authenticated all operations on operation_equipment" ON operation_equipment;
DROP POLICY IF EXISTS "Allow all operations on operation_products" ON operation_products;
DROP POLICY IF EXISTS "Allow authenticated all operations on operation_products" ON operation_products;
DROP POLICY IF EXISTS "Allow all operations on operation_resources" ON operation_resources;
DROP POLICY IF EXISTS "Allow authenticated all operations on operation_resources" ON operation_resources;
DROP POLICY IF EXISTS "Allow all operations on work_package_equipment" ON work_package_equipment;
DROP POLICY IF EXISTS "Allow authenticated all operations on work_package_equipment" ON work_package_equipment;
DROP POLICY IF EXISTS "Allow all operations on work_package_products" ON work_package_products;
DROP POLICY IF EXISTS "Allow authenticated all operations on work_package_products" ON work_package_products;
DROP POLICY IF EXISTS "Allow all operations on work_package_resources" ON work_package_resources;
DROP POLICY IF EXISTS "Allow authenticated all operations on work_package_resources" ON work_package_resources;
DROP POLICY IF EXISTS "Allow all operations on observations" ON observations;
DROP POLICY IF EXISTS "Allow authenticated all operations on observations" ON observations;
DROP POLICY IF EXISTS "Allow authenticated read access to climatic_data" ON climatic_data;

-- Drop any other policies that might exist (generic cleanup)
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT schemaname, tablename, policyname 
        FROM pg_policies 
        WHERE schemaname = 'public'
    ) LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', r.policyname, r.schemaname, r.tablename);
    END LOOP;
END $$;

-- =====================================================
-- STEP 2: DISABLE RLS ON ALL TABLES
-- =====================================================

-- Configuration tables
ALTER TABLE operation_type_config DISABLE ROW LEVEL SECURITY;
ALTER TABLE operations_method DISABLE ROW LEVEL SECURITY;
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE resources DISABLE ROW LEVEL SECURITY;
ALTER TABLE equipment DISABLE ROW LEVEL SECURITY;
ALTER TABLE sugarcane_varieties DISABLE ROW LEVEL SECURITY;
ALTER TABLE intercrop_varieties DISABLE ROW LEVEL SECURITY;

-- Core operational tables
ALTER TABLE companies DISABLE ROW LEVEL SECURITY;
ALTER TABLE farms DISABLE ROW LEVEL SECURITY;
ALTER TABLE blocs DISABLE ROW LEVEL SECURITY;
ALTER TABLE crop_cycles DISABLE ROW LEVEL SECURITY;

-- New operations system tables
ALTER TABLE field_operations DISABLE ROW LEVEL SECURITY;
ALTER TABLE daily_work_packages DISABLE ROW LEVEL SECURITY;
ALTER TABLE operation_equipment DISABLE ROW LEVEL SECURITY;
ALTER TABLE operation_products DISABLE ROW LEVEL SECURITY;
ALTER TABLE operation_resources DISABLE ROW LEVEL SECURITY;
ALTER TABLE work_package_equipment DISABLE ROW LEVEL SECURITY;
ALTER TABLE work_package_products DISABLE ROW LEVEL SECURITY;
ALTER TABLE work_package_resources DISABLE ROW LEVEL SECURITY;

-- Data tables
ALTER TABLE observations DISABLE ROW LEVEL SECURITY;
ALTER TABLE climatic_data DISABLE ROW LEVEL SECURITY;

-- Disable RLS on application tables only (exclude system tables)
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
            EXECUTE format('ALTER TABLE %I DISABLE ROW LEVEL SECURITY', r.tablename);
        EXCEPTION
            WHEN insufficient_privilege THEN
                RAISE NOTICE 'Skipping table % (insufficient privileges)', r.tablename;
            WHEN OTHERS THEN
                RAISE NOTICE 'Error disabling RLS on table %: %', r.tablename, SQLERRM;
        END;
    END LOOP;
END $$;

-- =====================================================
-- STEP 3: VERIFICATION
-- =====================================================

-- Check that no policies exist
SELECT 
    schemaname,
    tablename,
    policyname,
    cmd,
    roles
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Check that RLS is disabled on application tables
SELECT
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
AND tablename NOT LIKE 'spatial_%'  -- Exclude PostGIS system tables
AND tablename NOT LIKE 'geography_%'  -- Exclude PostGIS system tables
AND tablename NOT LIKE 'geometry_%'  -- Exclude PostGIS system tables
AND tablename NOT IN ('raster_columns', 'raster_overviews')  -- Exclude other system tables
ORDER BY tablename;

-- Test queries to verify anonymous access works
SELECT 'operation_type_config' as table_name, COUNT(*) as row_count FROM operation_type_config
UNION ALL
SELECT 'operations_method', COUNT(*) FROM operations_method
UNION ALL
SELECT 'products', COUNT(*) FROM products
UNION ALL
SELECT 'resources', COUNT(*) FROM resources
UNION ALL
SELECT 'companies', COUNT(*) FROM companies
UNION ALL
SELECT 'farms', COUNT(*) FROM farms
UNION ALL
SELECT 'blocs', COUNT(*) FROM blocs
UNION ALL
SELECT 'crop_cycles', COUNT(*) FROM crop_cycles
UNION ALL
SELECT 'field_operations', COUNT(*) FROM field_operations
UNION ALL
SELECT 'daily_work_packages', COUNT(*) FROM daily_work_packages;

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================

SELECT 'SUCCESS: All RLS policies removed and RLS disabled on all tables!' as status;
