-- =====================================================
-- COMPLETE DATABASE SETUP FOR EXCEL-LIKE OPERATIONS OVERVIEW
-- =====================================================
-- Run this script in the Supabase SQL Editor to set up the complete database

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- =====================================================
-- CORE FARM STRUCTURE
-- =====================================================

-- Companies
CREATE TABLE IF NOT EXISTS companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Farms
CREATE TABLE IF NOT EXISTS farms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    total_area_hectares DECIMAL(10,2),
    border_coordinates GEOMETRY(POLYGON, 4326),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Blocs (field areas)
CREATE TABLE IF NOT EXISTS blocs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farm_id UUID REFERENCES farms(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    area_hectares DECIMAL(10,2),
    coordinates GEOMETRY(POLYGON, 4326),
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- VARIETY CONFIGURATION TABLES
-- =====================================================

-- Sugarcane varieties
CREATE TABLE IF NOT EXISTS sugarcane_varieties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    variety_id VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(100),
    harvest_start_month VARCHAR(20),
    harvest_end_month VARCHAR(20),
    seasons TEXT[],
    soil_types TEXT[],
    sugar_content_percent DECIMAL(5,2),
    characteristics JSONB DEFAULT '{}',
    description TEXT,
    image_url TEXT,
    information_leaflet_url TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Intercrop varieties
CREATE TABLE IF NOT EXISTS intercrop_varieties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    variety_id VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    scientific_name VARCHAR(150),
    category VARCHAR(100),
    benefits TEXT[],
    planting_time VARCHAR(100),
    harvest_time VARCHAR(100),
    description TEXT,
    image_url TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Resources
CREATE TABLE IF NOT EXISTS resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resource_id VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(100),
    subcategory VARCHAR(100),
    unit VARCHAR(20),
    cost_per_unit DECIMAL(10,2),
    description TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products (with resource relationship for Excel view)
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(100),
    subcategory VARCHAR(100),
    unit VARCHAR(20),
    cost_per_unit DECIMAL(10,2),
    supplier VARCHAR(100),
    description TEXT,
    image_url TEXT,
    information_leaflet_url TEXT,
    resource_id UUID REFERENCES resources(id), -- Excel view enhancement
    default_application_rate DECIMAL(10,2),    -- Excel view enhancement
    min_application_rate DECIMAL(10,2),        -- Excel view enhancement
    max_application_rate DECIMAL(10,2),        -- Excel view enhancement
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- CROP CYCLES
-- =====================================================

-- Crop cycles
CREATE TABLE IF NOT EXISTS crop_cycles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bloc_id UUID REFERENCES blocs(id) ON DELETE CASCADE,
    cycle_number INTEGER NOT NULL,
    cycle_type VARCHAR(50) NOT NULL CHECK (cycle_type IN ('plantation', 'ratoon')),
    sugarcane_variety_id UUID REFERENCES sugarcane_varieties(id),
    intercrop_variety_id UUID REFERENCES intercrop_varieties(id),
    planting_date DATE,
    expected_harvest_date DATE,
    actual_harvest_date DATE,
    expected_yield_tons_per_hectare DECIMAL(8,2),
    actual_yield_tons_per_hectare DECIMAL(8,2),
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'closed')),
    total_estimated_cost DECIMAL(12,2) DEFAULT 0,
    total_actual_cost DECIMAL(12,2) DEFAULT 0,
    total_revenue DECIMAL(12,2) DEFAULT 0,
    profit_loss DECIMAL(12,2) DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ACTIVITIES AND OPERATIONS
-- =====================================================

-- Activities (enhanced for Excel view)
CREATE TABLE IF NOT EXISTS activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    crop_cycle_id UUID REFERENCES crop_cycles(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    phase VARCHAR(50),
    activity_date DATE,
    start_date DATE,
    end_date DATE,
    planned_start_date DATE,                    -- Excel view enhancement
    planned_end_date DATE,                      -- Excel view enhancement
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100), -- Excel view enhancement
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')), -- Excel view enhancement
    duration INTEGER,
    status VARCHAR(50) DEFAULT 'planned',
    estimated_total_cost DECIMAL(12,2) DEFAULT 0,
    actual_total_cost DECIMAL(12,2) DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activity products (enhanced for Excel view)
CREATE TABLE IF NOT EXISTS activity_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    activity_id UUID REFERENCES activities(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id),
    product_name VARCHAR(255) NOT NULL,
    quantity DECIMAL(10,2) NOT NULL,
    rate DECIMAL(10,2) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    planned_area DECIMAL(10,2),                 -- Excel view enhancement
    planned_total_quantity DECIMAL(10,2),       -- Excel view enhancement
    actual_total_quantity DECIMAL(10,2),        -- Excel view enhancement
    quantity_remaining DECIMAL(10,2),           -- Excel view enhancement
    area_remaining DECIMAL(10,2),               -- Excel view enhancement
    forecast_rate_remaining DECIMAL(10,2),      -- Excel view enhancement
    estimated_cost DECIMAL(12,2) DEFAULT 0,
    actual_cost DECIMAL(12,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activity resources (enhanced for Excel view)
CREATE TABLE IF NOT EXISTS activity_resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    activity_id UUID REFERENCES activities(id) ON DELETE CASCADE,
    resource_id UUID REFERENCES resources(id),
    resource_name VARCHAR(255) NOT NULL,
    hours DECIMAL(10,2) NOT NULL,
    cost_per_hour DECIMAL(10,2) NOT NULL,
    planned_effort_hours DECIMAL(8,2),          -- Excel view enhancement
    actual_effort_hours DECIMAL(8,2),           -- Excel view enhancement
    estimated_cost DECIMAL(12,2) DEFAULT 0,
    actual_cost DECIMAL(12,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Daily applications (Excel view enhancement)
CREATE TABLE IF NOT EXISTS daily_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    activity_product_id UUID REFERENCES activity_products(id) ON DELETE CASCADE,
    application_date DATE NOT NULL,
    area_applied DECIMAL(10,2) NOT NULL,
    quantity_applied DECIMAL(10,2) NOT NULL,
    rate_applied DECIMAL(10,2) NOT NULL,
    weather_conditions TEXT,
    operator_notes TEXT,
    actual_cost DECIMAL(12,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Observations
CREATE TABLE IF NOT EXISTS observations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    crop_cycle_id UUID REFERENCES crop_cycles(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL,
    observation_date DATE NOT NULL,
    yield_tons_per_hectare DECIMAL(8,2),
    revenue_per_hectare DECIMAL(10,2),
    total_revenue DECIMAL(12,2),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_daily_applications_activity_product ON daily_applications(activity_product_id);
CREATE INDEX IF NOT EXISTS idx_daily_applications_date ON daily_applications(application_date);
CREATE INDEX IF NOT EXISTS idx_products_resource ON products(resource_id);
CREATE INDEX IF NOT EXISTS idx_activities_crop_cycle_phase ON activities(crop_cycle_id, phase);
CREATE INDEX IF NOT EXISTS idx_activity_products_activity ON activity_products(activity_id);
CREATE INDEX IF NOT EXISTS idx_blocs_farm ON blocs(farm_id);
CREATE INDEX IF NOT EXISTS idx_crop_cycles_bloc ON crop_cycles(bloc_id);
CREATE INDEX IF NOT EXISTS idx_activities_crop_cycle ON activities(crop_cycle_id);

-- =====================================================
-- VIEWS FOR EXCEL-LIKE DATA RETRIEVAL
-- =====================================================

-- View for fertilization overview (Excel-like structure)
CREATE OR REPLACE VIEW fertilization_overview AS
SELECT
    b.name as bloc_name,
    b.id as bloc_id,
    cc.id as crop_cycle_id,
    cc.cycle_type,
    a.id as activity_id,
    a.name as activity_name,
    a.phase,
    a.status as activity_status,
    a.progress_percentage,
    a.priority,
    a.planned_start_date,
    a.planned_end_date,
    a.start_date,
    a.end_date,
    ap.id as activity_product_id,
    p.name as product_name,
    p.category as product_category,
    r.name as resource_name,
    r.category as resource_category,
    ap.planned_area,
    ap.rate as planned_rate_per_ha,
    ap.planned_total_quantity,
    ap.quantity as planned_quantity,
    ap.actual_total_quantity,
    ap.quantity_remaining,
    ap.area_remaining,
    ap.forecast_rate_remaining,
    ap.estimated_cost as estimated_product_cost,
    ap.actual_cost as actual_product_cost,
    ar.planned_effort_hours,
    ar.actual_effort_hours,
    ar.estimated_cost as estimated_resource_cost,
    ar.actual_cost as actual_resource_cost
FROM blocs b
JOIN crop_cycles cc ON b.id = cc.bloc_id
JOIN activities a ON cc.id = a.crop_cycle_id
JOIN activity_products ap ON a.id = ap.activity_id
JOIN products p ON ap.product_id = p.id
LEFT JOIN resources r ON p.resource_id = r.id
LEFT JOIN activity_resources ar ON a.id = ar.activity_id AND ar.resource_id = r.id
WHERE a.phase IN ('land_preparation', 'planting', 'fertilization', 'pest_control', 'weed_control')
ORDER BY b.name, a.planned_start_date, a.name, p.name;

-- View for daily applications (for Daily Tasks columns)
CREATE OR REPLACE VIEW daily_applications_overview AS
SELECT
    da.id,
    da.activity_product_id,
    da.application_date,
    da.area_applied,
    da.quantity_applied,
    da.rate_applied,
    da.weather_conditions,
    da.operator_notes,
    da.actual_cost,
    ap.activity_id,
    p.name as product_name,
    b.name as bloc_name
FROM daily_applications da
JOIN activity_products ap ON da.activity_product_id = ap.id
JOIN activities a ON ap.activity_id = a.id
JOIN crop_cycles cc ON a.crop_cycle_id = cc.id
JOIN blocs b ON cc.bloc_id = b.id
JOIN products p ON ap.product_id = p.id
ORDER BY da.application_date DESC, b.name, p.name;

-- =====================================================
-- FUNCTIONS FOR EXCEL-LIKE CALCULATIONS
-- =====================================================

-- Function to calculate remaining quantities and areas
CREATE OR REPLACE FUNCTION update_remaining_quantities()
RETURNS TRIGGER AS $$
BEGIN
    -- Update the activity_products table with remaining quantities
    UPDATE activity_products
    SET
        actual_total_quantity = COALESCE((
            SELECT SUM(quantity_applied)
            FROM daily_applications
            WHERE activity_product_id = NEW.activity_product_id
        ), 0),
        quantity_remaining = GREATEST(0, planned_total_quantity - COALESCE((
            SELECT SUM(quantity_applied)
            FROM daily_applications
            WHERE activity_product_id = NEW.activity_product_id
        ), 0)),
        area_remaining = GREATEST(0, planned_area - COALESCE((
            SELECT SUM(area_applied)
            FROM daily_applications
            WHERE activity_product_id = NEW.activity_product_id
        ), 0))
    WHERE id = NEW.activity_product_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update remaining quantities when daily applications are added/updated
DROP TRIGGER IF EXISTS update_remaining_quantities_trigger ON daily_applications;
CREATE TRIGGER update_remaining_quantities_trigger
    AFTER INSERT OR UPDATE OR DELETE ON daily_applications
    FOR EACH ROW EXECUTE FUNCTION update_remaining_quantities();
