-- =====================================================
-- COMPLETE DATABASE RESET SCRIPT
-- =====================================================
-- This script completely resets your database with the modern schema

-- =====================================================
-- STEP 1: CLEAN SLATE
-- =====================================================
-- Drop all existing tables and functions
DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public;

-- Restore default permissions
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;

-- =====================================================
-- STEP 2: RECREATE EXTENSIONS
-- =====================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- =====================================================
-- STEP 3: CONFIRMATION
-- =====================================================
SELECT 'Database reset complete! Ready for modern schema.' as status;

-- =====================================================
-- NEXT STEPS:
-- =====================================================
-- 1. Run: \i database_schema_modern.sql
-- 2. Run: \i database_sample_data.sql
-- 3. Test: SELECT get_farm_gis_initial_data();
-- =====================================================
