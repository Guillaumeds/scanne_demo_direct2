-- =====================================================
-- RLS POLICIES FOR SCANNE FARM MANAGEMENT
-- =====================================================
-- This migration adds Row Level Security policies to allow
-- public access to all tables for the demo application.
-- In production, these should be restricted based on user authentication.

-- Enable RLS on all tables
ALTER TABLE blocs ENABLE ROW LEVEL SECURITY;
ALTER TABLE crop_cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE observations ENABLE ROW LEVEL SECURITY;
ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE sugarcane_varieties ENABLE ROW LEVEL SECURITY;
ALTER TABLE intercrop_varieties ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- BLOCS POLICIES
-- =====================================================

-- Allow all operations on blocs (for demo purposes)
CREATE POLICY "Allow all operations on blocs" ON blocs
    FOR ALL USING (true) WITH CHECK (true);

-- =====================================================
-- CROP CYCLES POLICIES
-- =====================================================

-- Allow all operations on crop cycles (for demo purposes)
CREATE POLICY "Allow all operations on crop_cycles" ON crop_cycles
    FOR ALL USING (true) WITH CHECK (true);

-- =====================================================
-- ACTIVITIES POLICIES
-- =====================================================

-- Allow all operations on activities (for demo purposes)
CREATE POLICY "Allow all operations on activities" ON activities
    FOR ALL USING (true) WITH CHECK (true);

-- =====================================================
-- OBSERVATIONS POLICIES
-- =====================================================

-- Allow all operations on observations (for demo purposes)
CREATE POLICY "Allow all operations on observations" ON observations
    FOR ALL USING (true) WITH CHECK (true);

-- =====================================================
-- ATTACHMENTS POLICIES
-- =====================================================

-- Allow all operations on attachments (for demo purposes)
CREATE POLICY "Allow all operations on attachments" ON attachments
    FOR ALL USING (true) WITH CHECK (true);

-- =====================================================
-- ACTIVITY PRODUCTS POLICIES
-- =====================================================

-- Allow all operations on activity products (for demo purposes)
CREATE POLICY "Allow all operations on activity_products" ON activity_products
    FOR ALL USING (true) WITH CHECK (true);

-- =====================================================
-- ACTIVITY RESOURCES POLICIES
-- =====================================================

-- Allow all operations on activity resources (for demo purposes)
CREATE POLICY "Allow all operations on activity_resources" ON activity_resources
    FOR ALL USING (true) WITH CHECK (true);

-- =====================================================
-- VARIETIES POLICIES
-- =====================================================

-- Allow read access to sugarcane varieties (configuration data)
CREATE POLICY "Allow read access to sugarcane_varieties" ON sugarcane_varieties
    FOR SELECT USING (true);

-- Allow read access to intercrop varieties (configuration data)
CREATE POLICY "Allow read access to intercrop_varieties" ON intercrop_varieties
    FOR SELECT USING (true);

-- =====================================================
-- NOTES
-- =====================================================
-- These policies allow unrestricted access for demo purposes.
-- In a production environment, you should:
-- 1. Implement proper user authentication
-- 2. Restrict access based on user roles and ownership
-- 3. Add proper data validation and constraints
-- 4. Consider implementing tenant isolation if multi-tenant
