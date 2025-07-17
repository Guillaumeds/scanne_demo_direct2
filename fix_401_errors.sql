-- =====================================================
-- FIX 401 UNAUTHORIZED ERRORS
-- =====================================================
-- Run this in your Supabase SQL Editor to fix the 401 errors
-- These tables need RLS disabled or proper policies

-- =====================================================
-- OPTION 1: DISABLE RLS COMPLETELY (RECOMMENDED FOR DEVELOPMENT)
-- =====================================================

-- Disable RLS on operation_type_config
ALTER TABLE operation_type_config DISABLE ROW LEVEL SECURITY;

-- Disable RLS on operations_method  
ALTER TABLE operations_method DISABLE ROW LEVEL SECURITY;

-- Also disable RLS on other configuration tables that might cause issues
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE resources DISABLE ROW LEVEL SECURITY;
ALTER TABLE equipment DISABLE ROW LEVEL SECURITY;
ALTER TABLE sugarcane_varieties DISABLE ROW LEVEL SECURITY;
ALTER TABLE intercrop_varieties DISABLE ROW LEVEL SECURITY;

-- Disable RLS on operational tables
ALTER TABLE companies DISABLE ROW LEVEL SECURITY;
ALTER TABLE farms DISABLE ROW LEVEL SECURITY;
ALTER TABLE blocs DISABLE ROW LEVEL SECURITY;
ALTER TABLE crop_cycles DISABLE ROW LEVEL SECURITY;
ALTER TABLE field_operations DISABLE ROW LEVEL SECURITY;
ALTER TABLE daily_work_packages DISABLE ROW LEVEL SECURITY;
ALTER TABLE operation_equipment DISABLE ROW LEVEL SECURITY;
ALTER TABLE operation_products DISABLE ROW LEVEL SECURITY;
ALTER TABLE operation_resources DISABLE ROW LEVEL SECURITY;
ALTER TABLE work_package_equipment DISABLE ROW LEVEL SECURITY;
ALTER TABLE work_package_products DISABLE ROW LEVEL SECURITY;
ALTER TABLE work_package_resources DISABLE ROW LEVEL SECURITY;
ALTER TABLE observations DISABLE ROW LEVEL SECURITY;
ALTER TABLE climatic_data DISABLE ROW LEVEL SECURITY;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================
-- Run these to verify RLS is disabled

-- Check RLS status for all tables
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
    AND tablename IN (
        'operation_type_config',
        'operations_method', 
        'products',
        'resources',
        'equipment',
        'companies',
        'farms',
        'blocs',
        'crop_cycles',
        'field_operations',
        'daily_work_packages'
    )
ORDER BY tablename;

-- Test queries to verify access
SELECT COUNT(*) as operation_type_config_count FROM operation_type_config;
SELECT COUNT(*) as operations_method_count FROM operations_method;
SELECT COUNT(*) as products_count FROM products;
SELECT COUNT(*) as resources_count FROM resources;

-- =====================================================
-- NOTES
-- =====================================================
-- 
-- ✅ This will completely disable RLS for development
-- ✅ Anonymous users will have full access to all tables
-- ✅ No authentication required
-- 
-- ⚠️  WARNING: Only use this for development!
-- ⚠️  Enable proper RLS and authentication before production
-- 
-- 🔍 If you still get 401 errors after running this:
-- 1. Check your .env.local file has the correct Supabase URL and anon key
-- 2. Verify your Supabase project is active
-- 3. Check the browser network tab for the exact error details
-- 
-- =====================================================
