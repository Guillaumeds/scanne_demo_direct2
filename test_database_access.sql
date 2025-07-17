-- =====================================================
-- TEST DATABASE ACCESS
-- =====================================================
-- Run this in Supabase SQL Editor to verify RLS is disabled

-- Test 1: Check RLS status on key tables
SELECT 
    tablename,
    rowsecurity as rls_enabled,
    CASE 
        WHEN rowsecurity = false THEN '✅ RLS Disabled'
        ELSE '❌ RLS Enabled'
    END as status
FROM pg_tables 
WHERE schemaname = 'public'
AND tablename IN ('operation_type_config', 'operations_method', 'products', 'resources')
ORDER BY tablename;

-- Test 2: Check if any policies still exist
SELECT 
    COUNT(*) as policy_count,
    CASE 
        WHEN COUNT(*) = 0 THEN '✅ No policies found'
        ELSE '❌ Policies still exist'
    END as status
FROM pg_policies 
WHERE schemaname = 'public';

-- Test 3: Test direct access to problematic tables
SELECT 'operation_type_config' as table_name, COUNT(*) as row_count FROM operation_type_config
UNION ALL
SELECT 'operations_method', COUNT(*) FROM operations_method;

-- Test 4: Show current user and role
SELECT 
    current_user as current_user,
    session_user as session_user,
    current_setting('role') as current_role;

-- =====================================================
-- EXPECTED RESULTS:
-- =====================================================
-- Test 1: All tables should show "✅ RLS Disabled"
-- Test 2: Should show "✅ No policies found" 
-- Test 3: Should return row counts without errors
-- Test 4: Should show your database user info
