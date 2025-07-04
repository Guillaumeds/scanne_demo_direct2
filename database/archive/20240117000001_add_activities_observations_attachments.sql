-- Migration: Add Activities, Observations, and Attachments tables
-- Date: 2025-01-17
-- Description: Add the missing tables for activities, observations, and attachments

-- =====================================================
-- ACTIVITIES & OPERATIONS
-- =====================================================

-- Activities table
CREATE TABLE IF NOT EXISTS activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    phase VARCHAR(100),
    status VARCHAR(50) DEFAULT 'planned' CHECK (status IN ('planned', 'in-progress', 'completed', 'cancelled')),
    crop_cycle_id UUID NOT NULL REFERENCES crop_cycles(id) ON DELETE CASCADE,
    start_date DATE,
    end_date DATE,
    actual_date DATE,
    duration_hours DECIMAL(8,2),
    estimated_total_cost DECIMAL(12,2) DEFAULT 0,
    actual_total_cost DECIMAL(12,2) DEFAULT 0,
    notes TEXT,
    created_by UUID, -- Will reference users(id) when user management is added
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activity products junction table
CREATE TABLE IF NOT EXISTS activity_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    activity_id UUID NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity DECIMAL(10,2) NOT NULL,
    rate_per_hectare DECIMAL(10,2),
    unit VARCHAR(20),
    estimated_cost DECIMAL(12,2) DEFAULT 0,
    actual_cost DECIMAL(12,2) DEFAULT 0,
    actual_quantity_used DECIMAL(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activity resources junction table
CREATE TABLE IF NOT EXISTS activity_resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    activity_id UUID NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
    resource_id UUID NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
    hours_planned DECIMAL(8,2),
    hours_actual DECIMAL(8,2),
    unit VARCHAR(20),
    estimated_cost DECIMAL(12,2) DEFAULT 0,
    actual_cost DECIMAL(12,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Observations table
CREATE TABLE IF NOT EXISTS observations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL,
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'completed', 'reviewed')),
    crop_cycle_id UUID NOT NULL REFERENCES crop_cycles(id) ON DELETE CASCADE,
    observation_date DATE NOT NULL,
    actual_date DATE,
    number_of_samples INTEGER,
    number_of_plants INTEGER,
    observation_data JSONB DEFAULT '{}',
    notes TEXT,
    created_by UUID, -- Will reference users(id) when user management is added
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Attachments table
CREATE TABLE IF NOT EXISTS attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    file_type VARCHAR(50),
    mime_type VARCHAR(100),
    extension VARCHAR(10),
    file_size BIGINT,
    tags TEXT[],
    description TEXT,
    crop_cycle_id UUID REFERENCES crop_cycles(id) ON DELETE CASCADE,
    activity_id UUID REFERENCES activities(id) ON DELETE CASCADE,
    observation_id UUID REFERENCES observations(id) ON DELETE CASCADE,
    storage_path TEXT NOT NULL,
    url TEXT,
    thumbnail_url TEXT,
    uploaded_by UUID, -- Will reference users(id) when user management is added
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Activities indexes
CREATE INDEX IF NOT EXISTS idx_activities_crop_cycle ON activities(crop_cycle_id);
CREATE INDEX IF NOT EXISTS idx_activities_status ON activities(status);
CREATE INDEX IF NOT EXISTS idx_activities_phase ON activities(phase);
CREATE INDEX IF NOT EXISTS idx_activities_start_date ON activities(start_date);

-- Activity products indexes
CREATE INDEX IF NOT EXISTS idx_activity_products_activity ON activity_products(activity_id);
CREATE INDEX IF NOT EXISTS idx_activity_products_product ON activity_products(product_id);

-- Activity resources indexes
CREATE INDEX IF NOT EXISTS idx_activity_resources_activity ON activity_resources(activity_id);
CREATE INDEX IF NOT EXISTS idx_activity_resources_resource ON activity_resources(resource_id);

-- Observations indexes
CREATE INDEX IF NOT EXISTS idx_observations_crop_cycle ON observations(crop_cycle_id);
CREATE INDEX IF NOT EXISTS idx_observations_category ON observations(category);
CREATE INDEX IF NOT EXISTS idx_observations_date ON observations(observation_date);
CREATE INDEX IF NOT EXISTS idx_observations_status ON observations(status);

-- Attachments indexes
CREATE INDEX IF NOT EXISTS idx_attachments_crop_cycle ON attachments(crop_cycle_id);
CREATE INDEX IF NOT EXISTS idx_attachments_activity ON attachments(activity_id);
CREATE INDEX IF NOT EXISTS idx_attachments_observation ON attachments(observation_id);
CREATE INDEX IF NOT EXISTS idx_attachments_category ON attachments(category);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE observations ENABLE ROW LEVEL SECURITY;
ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;

-- Activities policies
CREATE POLICY "Enable read access for all users" ON activities FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON activities FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for authenticated users" ON activities FOR UPDATE USING (true);
CREATE POLICY "Enable delete for authenticated users" ON activities FOR DELETE USING (true);

-- Activity products policies
CREATE POLICY "Enable read access for all users" ON activity_products FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON activity_products FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for authenticated users" ON activity_products FOR UPDATE USING (true);
CREATE POLICY "Enable delete for authenticated users" ON activity_products FOR DELETE USING (true);

-- Activity resources policies
CREATE POLICY "Enable read access for all users" ON activity_resources FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON activity_resources FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for authenticated users" ON activity_resources FOR UPDATE USING (true);
CREATE POLICY "Enable delete for authenticated users" ON activity_resources FOR DELETE USING (true);

-- Observations policies
CREATE POLICY "Enable read access for all users" ON observations FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON observations FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for authenticated users" ON observations FOR UPDATE USING (true);
CREATE POLICY "Enable delete for authenticated users" ON observations FOR DELETE USING (true);

-- Attachments policies
CREATE POLICY "Enable read access for all users" ON attachments FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON attachments FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for authenticated users" ON attachments FOR UPDATE USING (true);
CREATE POLICY "Enable delete for authenticated users" ON attachments FOR DELETE USING (true);

-- =====================================================
-- TRIGGERS FOR UPDATED_AT
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
CREATE TRIGGER update_activities_updated_at BEFORE UPDATE ON activities
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_activity_products_updated_at BEFORE UPDATE ON activity_products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_activity_resources_updated_at BEFORE UPDATE ON activity_resources
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_observations_updated_at BEFORE UPDATE ON observations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_attachments_updated_at BEFORE UPDATE ON attachments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON TABLE activities IS 'Farm activities and operations linked to crop cycles';
COMMENT ON TABLE activity_products IS 'Products used in activities (fertilizers, pesticides, etc.)';
COMMENT ON TABLE activity_resources IS 'Resources used in activities (labor, equipment, etc.)';
COMMENT ON TABLE observations IS 'Field observations and measurements';
COMMENT ON TABLE attachments IS 'File attachments for activities, observations, and crop cycles';

COMMENT ON COLUMN activities.phase IS 'Activity phase: land-preparation, planting, maintenance, harvesting, etc.';
COMMENT ON COLUMN activities.status IS 'Activity status: planned, in-progress, completed, cancelled';
COMMENT ON COLUMN observations.category IS 'Observation category: soil, water, plant, pest, weather, yield, equipment, general';
COMMENT ON COLUMN observations.observation_data IS 'JSON data containing observation measurements and details';
COMMENT ON COLUMN attachments.storage_path IS 'Path to file in storage system';
COMMENT ON COLUMN attachments.tags IS 'Array of tags for categorization and search';
