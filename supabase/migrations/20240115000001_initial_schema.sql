-- =====================================================
-- Scanne Farm Management Database Schema
-- PostgreSQL 15+ with PostGIS for Supabase
-- =====================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- =====================================================
-- COMPANY & FARM HIERARCHY
-- =====================================================

-- Companies table
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    registration_number VARCHAR(100),
    address TEXT,
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    headquarters_location POINT,
    metadata JSONB DEFAULT '{}',
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Farms table
CREATE TABLE farms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    farm_boundary POLYGON,
    center_location POINT,
    total_area_hectares DECIMAL(10,4),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    primary_manager_id UUID, -- Will reference users(id) in Phase 3
    metadata JSONB DEFAULT '{}',
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Fields table
CREATE TABLE fields (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    field_id VARCHAR(100) NOT NULL,
    field_name VARCHAR(255) NOT NULL,
    coordinates POLYGON NOT NULL,
    area_hectares DECIMAL(10,4) NOT NULL,
    status VARCHAR(50) DEFAULT 'active',
    osm_id INTEGER,
    farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
    soil_properties JSONB DEFAULT '{}',
    aggregated_analytics JSONB DEFAULT '{}',
    last_analytics_update TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Blocs table (field_id removed - blocs are independent of fields)
CREATE TABLE blocs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    coordinates GEOMETRY(POLYGON, 4326) NOT NULL,
    area_hectares DECIMAL(10,4) NOT NULL,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'retired')),
    created_date DATE DEFAULT CURRENT_DATE,
    retired_date DATE,
    intersecting_fields JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- REFERENCE DATA - VARIETIES
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
    icon VARCHAR(50),
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
    benefits TEXT[],
    planting_time VARCHAR(100),
    harvest_time VARCHAR(100),
    description TEXT,
    icon VARCHAR(50),
    image_url TEXT,
    information_leaflet_url TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- REFERENCE DATA - PRODUCTS & RESOURCES
-- =====================================================

-- Products (fertilizers, pesticides, etc.)
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    description TEXT,
    unit VARCHAR(20),
    recommended_rate_per_ha DECIMAL(8,2),
    cost_per_unit DECIMAL(10,2),
    brand VARCHAR(100),
    composition TEXT,
    icon VARCHAR(50),
    image_url TEXT,
    information_url TEXT,
    specifications JSONB DEFAULT '{}',
    safety_datasheet_url TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Resources (labor, equipment, etc.)
CREATE TABLE resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resource_id VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    description TEXT,
    unit VARCHAR(20),
    cost_per_hour DECIMAL(10,2),
    cost_per_unit DECIMAL(10,2),
    skill_level VARCHAR(50),
    overtime_multiplier DECIMAL(3,2) DEFAULT 1.0,
    icon VARCHAR(50),
    specifications JSONB DEFAULT '{}',
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- CROP CYCLE MANAGEMENT
-- =====================================================

-- Crop cycles with growth stage tracking
CREATE TABLE crop_cycles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bloc_id UUID NOT NULL REFERENCES blocs(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('plantation', 'ratoon')),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'closed', 'archived')),
    cycle_number INTEGER NOT NULL,
    sugarcane_variety_id UUID NOT NULL REFERENCES sugarcane_varieties(id),
    intercrop_variety_id UUID REFERENCES intercrop_varieties(id),
    parent_cycle_id UUID REFERENCES crop_cycles(id),
    
    -- Sugarcane specific fields
    sugarcane_planting_date DATE,
    sugarcane_planned_harvest_date DATE NOT NULL,
    sugarcane_actual_harvest_date DATE,
    sugarcane_actual_yield_tons_ha DECIMAL(8,2),
    
    -- Intercrop specific fields
    intercrop_planting_date DATE,
    intercrop_planned_harvest_date DATE,
    intercrop_actual_harvest_date DATE,
    intercrop_actual_yield_tons_ha DECIMAL(8,2),
    
    -- Growth stage tracking
    growth_stage VARCHAR(50) DEFAULT 'germination' CHECK (growth_stage IN ('germination', 'tillering', 'grand-growth', 'maturation', 'ripening', 'harvested')),
    growth_stage_updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    days_since_planting INTEGER DEFAULT 0,
    
    -- Financial tracking
    estimated_total_cost DECIMAL(12,2) DEFAULT 0,
    actual_total_cost DECIMAL(12,2) DEFAULT 0,
    sugarcane_revenue DECIMAL(12,2) DEFAULT 0,
    intercrop_revenue DECIMAL(12,2) DEFAULT 0,
    total_revenue DECIMAL(12,2) DEFAULT 0,
    net_profit DECIMAL(12,2) DEFAULT 0,
    profit_margin_percent DECIMAL(5,2) DEFAULT 0,
    
    -- Closure and validation
    closure_data JSONB DEFAULT '{}',
    weather_summary JSONB DEFAULT '{}',
    quality_metrics JSONB DEFAULT '{}',
    closure_validated BOOLEAN DEFAULT false,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ACTIVITIES & OPERATIONS
-- =====================================================

-- Activities table
CREATE TABLE activities (
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
CREATE TABLE activity_products (
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
CREATE TABLE activity_resources (
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
CREATE TABLE observations (
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
CREATE TABLE attachments (
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

-- Indexes for performance
CREATE INDEX idx_activities_crop_cycle ON activities(crop_cycle_id);
CREATE INDEX idx_activities_status ON activities(status);
CREATE INDEX idx_activities_phase ON activities(phase);
CREATE INDEX idx_activity_products_activity ON activity_products(activity_id);
CREATE INDEX idx_activity_resources_activity ON activity_resources(activity_id);
CREATE INDEX idx_observations_crop_cycle ON observations(crop_cycle_id);
CREATE INDEX idx_observations_category ON observations(category);
CREATE INDEX idx_observations_date ON observations(observation_date);
CREATE INDEX idx_attachments_crop_cycle ON attachments(crop_cycle_id);
CREATE INDEX idx_attachments_activity ON attachments(activity_id);
CREATE INDEX idx_attachments_observation ON attachments(observation_id);

-- =====================================================
-- CLIMATE DATA TABLE
-- =====================================================

-- Climate data for long-term analysis
CREATE TABLE climate_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    station_id VARCHAR(50) NOT NULL,
    observation_date DATE NOT NULL,
    observation_year INTEGER NOT NULL,
    observation_month INTEGER NOT NULL,
    observation_day INTEGER NOT NULL,
    julian_day INTEGER NOT NULL,
    temperature_min_celsius DECIMAL(5,2),
    temperature_max_celsius DECIMAL(5,2),
    solar_radiation_mj_per_m2 DECIMAL(8,2),
    evapotranspiration_mm DECIMAL(8,2),
    precipitation_mm DECIMAL(8,2),
    wind_speed_m_per_s DECIMAL(6,2),
    vapor_pressure_hpa DECIMAL(8,2),
    co2_concentration_ppm DECIMAL(8,2),
    relative_humidity_percent DECIMAL(5,2), -- Calculated from vapor pressure if needed
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Indexes for efficient querying
    UNIQUE(station_id, observation_date)
);

-- Indexes for climate data queries
CREATE INDEX idx_climate_data_date ON climate_data(observation_date);
CREATE INDEX idx_climate_data_year_month ON climate_data(observation_year, observation_month);
CREATE INDEX idx_climate_data_station ON climate_data(station_id);

-- =====================================================
-- CONFIGURATION TABLES
-- =====================================================

-- Activity categories
CREATE TABLE activity_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    color VARCHAR(7), -- Hex color code
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Observation categories
CREATE TABLE observation_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    color VARCHAR(7), -- Hex color code
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Attachment categories
CREATE TABLE attachment_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    color VARCHAR(7), -- Hex color code
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- System configuration
CREATE TABLE system_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    config_key VARCHAR(100) NOT NULL UNIQUE,
    config_group VARCHAR(50) NOT NULL,
    config_value JSONB NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Field analytics history
CREATE TABLE field_analytics_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    field_id UUID NOT NULL REFERENCES fields(id) ON DELETE CASCADE,
    calculation_date DATE NOT NULL DEFAULT CURRENT_DATE,
    analytics_snapshot JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- DATABASE FUNCTIONS
-- =====================================================

-- Function to insert bloc with geometry (without field_id requirement)
CREATE OR REPLACE FUNCTION insert_bloc_with_geometry(
  bloc_name VARCHAR(255),
  bloc_description TEXT,
  polygon_wkt TEXT,
  bloc_area_hectares DECIMAL(10,4),
  bloc_status VARCHAR(20) DEFAULT 'active',
  bloc_id UUID DEFAULT NULL
)
RETURNS TABLE(
  id UUID,
  name VARCHAR(255),
  description TEXT,
  coordinates GEOMETRY(POLYGON, 4326),
  area_hectares DECIMAL(10,4),
  status VARCHAR(20),
  created_date DATE,
  retired_date DATE,
  intersecting_fields JSONB,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  INSERT INTO blocs (
    id,
    name,
    description,
    coordinates,
    area_hectares,
    status,
    created_date,
    retired_date,
    intersecting_fields,
    metadata,
    created_at,
    updated_at
  )
  VALUES (
    COALESCE(bloc_id, gen_random_uuid()),
    bloc_name,
    bloc_description,
    ST_SetSRID(ST_GeomFromText(polygon_wkt), 4326)::GEOMETRY(POLYGON, 4326),
    bloc_area_hectares,
    bloc_status,
    CURRENT_DATE,
    NULL,
    '{}'::JSONB,
    '{}'::JSONB,
    NOW(),
    NOW()
  )
  RETURNING
    blocs.id,
    blocs.name,
    blocs.description,
    blocs.coordinates,
    blocs.area_hectares,
    blocs.status,
    blocs.created_date,
    blocs.retired_date,
    blocs.intersecting_fields,
    blocs.metadata,
    blocs.created_at,
    blocs.updated_at;
END;
$$;

-- Function to get blocs with WKT coordinates (without field_id)
CREATE OR REPLACE FUNCTION get_blocs_with_wkt()
RETURNS TABLE(
    id UUID,
    name VARCHAR(255),
    description TEXT,
    coordinates_wkt TEXT,
    area_hectares DECIMAL(10,4),
    status VARCHAR(20),
    created_date DATE,
    retired_date DATE,
    intersecting_fields JSONB,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        b.id,
        b.name,
        b.description,
        ST_AsText(b.coordinates) as coordinates_wkt,
        b.area_hectares,
        b.status,
        b.created_date,
        b.retired_date,
        b.intersecting_fields,
        b.metadata,
        b.created_at,
        b.updated_at
    FROM blocs b
    WHERE b.status = 'active'
    ORDER BY b.created_at DESC;
END;
$$;

-- Function to calculate crop cycle totals
CREATE OR REPLACE FUNCTION calculate_crop_cycle_totals(cycle_id UUID)
RETURNS TABLE(
    estimated_total_cost DECIMAL(12,2),
    actual_total_cost DECIMAL(12,2),
    sugarcane_yield_tonnes_per_hectare DECIMAL(8,2),
    intercrop_yield_tonnes_per_hectare DECIMAL(8,2),
    total_revenue DECIMAL(12,2),
    profit_per_hectare DECIMAL(12,2)
)
LANGUAGE plpgsql
AS $$
DECLARE
    cycle_area DECIMAL(10,4);
BEGIN
    -- Get the cycle area (sum of all blocs in the cycle)
    SELECT COALESCE(SUM(b.area_hectares), 0) INTO cycle_area
    FROM crop_cycles cc
    LEFT JOIN blocs b ON b.id = ANY(cc.bloc_ids)
    WHERE cc.id = cycle_id;

    -- If no area, return zeros
    IF cycle_area = 0 THEN
        RETURN QUERY SELECT 0::DECIMAL(12,2), 0::DECIMAL(12,2), 0::DECIMAL(8,2), 0::DECIMAL(8,2), 0::DECIMAL(12,2), 0::DECIMAL(12,2);
        RETURN;
    END IF;

    RETURN QUERY
    WITH activity_totals AS (
        SELECT
            COALESCE(SUM(a.estimated_total_cost), 0) as est_cost,
            COALESCE(SUM(a.actual_total_cost), 0) as act_cost
        FROM activities a
        WHERE a.crop_cycle_id = cycle_id
    ),
    observation_totals AS (
        SELECT
            COALESCE(SUM(o.sugarcane_yield_tonnes), 0) as sugarcane_yield,
            COALESCE(SUM(o.intercrop_yield_tonnes), 0) as intercrop_yield,
            COALESCE(SUM(o.total_revenue), 0) as revenue
        FROM observations o
        WHERE o.crop_cycle_id = cycle_id
        AND o.category = 'sugarcane-yield-quality'
    )
    SELECT
        at.est_cost,
        at.act_cost,
        (ot.sugarcane_yield / cycle_area)::DECIMAL(8,2),
        (ot.intercrop_yield / cycle_area)::DECIMAL(8,2),
        ot.revenue,
        ((ot.revenue - at.act_cost) / cycle_area)::DECIMAL(12,2)
    FROM activity_totals at, observation_totals ot;
END;
$$;

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Spatial indexes for geometry columns
CREATE INDEX IF NOT EXISTS idx_farms_boundary ON farms USING GIST (farm_boundary);
CREATE INDEX IF NOT EXISTS idx_farms_center ON farms USING GIST (center_location);
CREATE INDEX IF NOT EXISTS idx_fields_coordinates ON fields USING GIST (coordinates);
CREATE INDEX IF NOT EXISTS idx_blocs_coordinates ON blocs USING GIST (coordinates);

-- Regular indexes for foreign keys and common queries
CREATE INDEX IF NOT EXISTS idx_farms_company_id ON farms (company_id);
CREATE INDEX IF NOT EXISTS idx_fields_farm_id ON fields (farm_id);
CREATE INDEX IF NOT EXISTS idx_crop_cycles_bloc_id ON crop_cycles (bloc_id);
CREATE INDEX IF NOT EXISTS idx_activities_crop_cycle_id ON activities (crop_cycle_id);
CREATE INDEX IF NOT EXISTS idx_observations_crop_cycle_id ON observations (crop_cycle_id);
CREATE INDEX IF NOT EXISTS idx_attachments_crop_cycle_id ON attachments (crop_cycle_id);

-- Indexes for status and date filtering
CREATE INDEX IF NOT EXISTS idx_blocs_status ON blocs (status);
CREATE INDEX IF NOT EXISTS idx_crop_cycles_status ON crop_cycles (status);
CREATE INDEX IF NOT EXISTS idx_activities_status ON activities (status);
CREATE INDEX IF NOT EXISTS idx_observations_status ON observations (status);

-- Indexes for configuration tables
CREATE INDEX IF NOT EXISTS idx_sugarcane_varieties_active ON sugarcane_varieties (active);
CREATE INDEX IF NOT EXISTS idx_intercrop_varieties_active ON intercrop_varieties (active);
CREATE INDEX IF NOT EXISTS idx_activity_categories_active ON activity_categories (active);
CREATE INDEX IF NOT EXISTS idx_observation_categories_active ON observation_categories (active);

-- Unique constraints for business identifiers
CREATE UNIQUE INDEX IF NOT EXISTS idx_farms_unique_name_per_company ON farms (company_id, name) WHERE active = true;
CREATE UNIQUE INDEX IF NOT EXISTS idx_fields_unique_id_per_farm ON fields (farm_id, field_id) WHERE active = true;
CREATE UNIQUE INDEX IF NOT EXISTS idx_sugarcane_varieties_unique_id ON sugarcane_varieties (variety_id) WHERE active = true;
CREATE UNIQUE INDEX IF NOT EXISTS idx_intercrop_varieties_unique_id ON intercrop_varieties (variety_id) WHERE active = true;
CREATE UNIQUE INDEX IF NOT EXISTS idx_activity_categories_unique_id ON activity_categories (category_id) WHERE active = true;
CREATE UNIQUE INDEX IF NOT EXISTS idx_observation_categories_unique_id ON observation_categories (category_id) WHERE active = true;
