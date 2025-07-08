-- =====================================================
-- MINIMAL WORKING SCHEMA FOR SCANNE FARM MANAGEMENT
-- =====================================================
-- Clean, simple schema that matches frontend expectations
-- No complex triggers, just basic tables and relationships

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- =====================================================
-- CORE FARM STRUCTURE
-- =====================================================

-- Companies
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Farms
CREATE TABLE farms (
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
CREATE TABLE blocs (
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
CREATE TABLE sugarcane_varieties (
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
CREATE TABLE intercrop_varieties (
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

-- Products
CREATE TABLE products (
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
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Resources
CREATE TABLE resources (
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

-- =====================================================
-- CROP CYCLES - SIMPLIFIED
-- =====================================================

-- Crop cycles (simplified, no complex triggers)
CREATE TABLE crop_cycles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bloc_id UUID REFERENCES blocs(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- 'plantation' or 'ratoon'
    cycle_number INTEGER NOT NULL DEFAULT 1,
    status VARCHAR(50) DEFAULT 'active', -- 'active', 'closed'

    -- Variety references (UUIDs from variety tables)
    sugarcane_variety_id UUID REFERENCES sugarcane_varieties(id),
    intercrop_variety_id UUID REFERENCES intercrop_varieties(id),

    -- Cycle relationships
    parent_cycle_id UUID REFERENCES crop_cycles(id),

    -- Dates
    sugarcane_planting_date DATE,
    sugarcane_planned_harvest_date DATE,
    sugarcane_actual_harvest_date DATE,
    intercrop_planting_date DATE,

    -- Growth tracking (simple)
    growth_stage VARCHAR(50),
    growth_stage_updated_at TIMESTAMP WITH TIME ZONE,
    days_since_planting INTEGER DEFAULT 0,

    -- Yield data
    sugarcane_actual_yield_tons_ha DECIMAL(10,2),

    -- Financial data (simple)
    estimated_total_cost DECIMAL(12,2) DEFAULT 0,
    actual_total_cost DECIMAL(12,2) DEFAULT 0,
    sugarcane_revenue DECIMAL(12,2) DEFAULT 0,
    intercrop_revenue DECIMAL(12,2) DEFAULT 0,
    total_revenue DECIMAL(12,2) DEFAULT 0,
    net_profit DECIMAL(12,2) DEFAULT 0,
    profit_per_hectare DECIMAL(12,2) DEFAULT 0,
    profit_margin_percent DECIMAL(5,2) DEFAULT 0,

    -- Closure validation
    closure_validated BOOLEAN DEFAULT false,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- RELATED TABLES (SIMPLIFIED)
-- =====================================================

-- Activities
CREATE TABLE activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    crop_cycle_id UUID REFERENCES crop_cycles(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    phase VARCHAR(50),
    activity_date DATE,
    start_date DATE,
    end_date DATE,
    duration INTEGER,
    status VARCHAR(50) DEFAULT 'planned',
    estimated_total_cost DECIMAL(12,2) DEFAULT 0,
    actual_total_cost DECIMAL(12,2) DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Observations
CREATE TABLE observations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    crop_cycle_id UUID REFERENCES crop_cycles(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    status VARCHAR(50) DEFAULT 'draft',
    observation_date DATE,
    number_of_samples INTEGER,
    number_of_plants INTEGER,
    observation_data JSONB DEFAULT '{}',

    -- Yield data
    yield_tons_ha DECIMAL(10,2),
    area_hectares DECIMAL(10,2),
    total_yield_tons DECIMAL(10,2),

    -- Revenue data (NEW - from observation forms)
    sugarcane_revenue DECIMAL(12,2),
    intercrop_revenue DECIMAL(12,2),
    price_per_tonne DECIMAL(10,2),
    revenue_per_hectare DECIMAL(12,2),

    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Attachments
CREATE TABLE attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    crop_cycle_id UUID REFERENCES crop_cycles(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    file_type VARCHAR(50),
    file_size INTEGER,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ACTIVITY PRODUCTS AND RESOURCES
-- =====================================================

-- Activity products (products used in activities)
CREATE TABLE activity_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    activity_id UUID REFERENCES activities(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id),
    product_name VARCHAR(255) NOT NULL,
    quantity DECIMAL(10,2) NOT NULL,
    rate DECIMAL(10,2) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    estimated_cost DECIMAL(12,2) DEFAULT 0,
    actual_cost DECIMAL(12,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activity resources (resources used in activities)
CREATE TABLE activity_resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    activity_id UUID REFERENCES activities(id) ON DELETE CASCADE,
    resource_id UUID REFERENCES resources(id),
    resource_name VARCHAR(255) NOT NULL,
    hours DECIMAL(10,2) NOT NULL,
    cost_per_hour DECIMAL(10,2) NOT NULL,
    estimated_cost DECIMAL(12,2) DEFAULT 0,
    actual_cost DECIMAL(12,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
