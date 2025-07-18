-- =====================================================
-- MODERN FARM MANAGEMENT DATABASE SCHEMA
-- =====================================================
-- Complete schema with optimized RPC functions for TanStack Query integration
-- Run this to reset your database with the modernized structure

-- =====================================================
-- EXTENSIONS
-- =====================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- =====================================================
-- DROP EXISTING TABLES (Clean Reset)
-- =====================================================
DROP TABLE IF EXISTS work_package_labour CASCADE;
DROP TABLE IF EXISTS work_package_equipment CASCADE;
DROP TABLE IF EXISTS work_package_products CASCADE;
DROP TABLE IF EXISTS operation_labour CASCADE;
DROP TABLE IF EXISTS operation_equipment CASCADE;
DROP TABLE IF EXISTS operation_products CASCADE;
DROP TABLE IF EXISTS daily_work_packages CASCADE;
DROP TABLE IF EXISTS field_operations CASCADE;
DROP TABLE IF EXISTS observations CASCADE;
DROP TABLE IF EXISTS crop_cycles CASCADE;
DROP TABLE IF EXISTS blocs CASCADE;
DROP TABLE IF EXISTS farms CASCADE;
DROP TABLE IF EXISTS companies CASCADE;
DROP TABLE IF EXISTS intercrop_varieties CASCADE;
DROP TABLE IF EXISTS sugarcane_varieties CASCADE;
DROP TABLE IF EXISTS labour CASCADE;
DROP TABLE IF EXISTS equipment CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS operations_method CASCADE;
DROP TABLE IF EXISTS operation_type_config CASCADE;
DROP TABLE IF EXISTS climatic_data CASCADE;
DROP TABLE IF EXISTS observations CASCADE;

-- =====================================================
-- CORE TABLES
-- =====================================================

-- Companies
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Farms
CREATE TABLE farms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Blocs (with PostGIS geometry)
CREATE TABLE blocs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    area_hectares DECIMAL(10,2) NOT NULL,
    coordinates GEOMETRY(POLYGON, 4326) NOT NULL,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    farm_id UUID REFERENCES farms(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Varieties
CREATE TABLE sugarcane_varieties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE intercrop_varieties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Configuration Tables
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id VARCHAR(100) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    subcategory VARCHAR(100),
    unit VARCHAR(50),
    cost_per_unit DECIMAL(10,2) DEFAULT 0,
    supplier VARCHAR(255),
    description TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE equipment (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    equipment_id VARCHAR(100) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    hourly_rate DECIMAL(10,2) DEFAULT 0,
    description TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE labour (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    labour_id VARCHAR(100) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    unit VARCHAR(50),
    cost_per_unit DECIMAL(10,2) DEFAULT 0,
    description TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Operation Configuration
CREATE TABLE operation_type_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    operation_type VARCHAR(100) NOT NULL UNIQUE,
    display_name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE operations_method (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    method VARCHAR(100) NOT NULL UNIQUE,
    display_name VARCHAR(255) NOT NULL,
    description TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- OPERATIONAL TABLES
-- =====================================================

-- Crop Cycles
CREATE TABLE crop_cycles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bloc_id UUID REFERENCES blocs(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('plantation', 'ratoon')),
    cycle_number INTEGER NOT NULL DEFAULT 1,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'closed')),
    sugarcane_variety_id UUID REFERENCES sugarcane_varieties(id),
    intercrop_variety_id UUID REFERENCES intercrop_varieties(id),
    planting_date DATE,
    planned_harvest_date DATE NOT NULL,
    actual_harvest_date DATE,
    expected_yield_tons_ha DECIMAL(10,2) NOT NULL,
    actual_yield_tons_ha DECIMAL(10,2),
    estimated_total_cost DECIMAL(12,2) DEFAULT 0,
    actual_total_cost DECIMAL(12,2),
    total_revenue DECIMAL(12,2),
    sugarcane_revenue DECIMAL(12,2),
    intercrop_revenue DECIMAL(12,2),
    net_profit DECIMAL(12,2),
    profit_per_hectare DECIMAL(12,2),
    profit_margin_percent DECIMAL(5,2),
    growth_stage VARCHAR(100),
    days_since_planting INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Field Operations
CREATE TABLE field_operations (
    uuid UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    crop_cycle_uuid UUID REFERENCES crop_cycles(id) ON DELETE CASCADE,
    operation_name VARCHAR(255) NOT NULL,
    operation_type VARCHAR(100) NOT NULL,
    method VARCHAR(100),
    priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high')),
    planned_start_date DATE NOT NULL,
    planned_end_date DATE NOT NULL,
    actual_start_date DATE,
    actual_end_date DATE,
    planned_area_hectares DECIMAL(10,2),
    actual_area_hectares DECIMAL(10,2),
    planned_quantity DECIMAL(10,2),
    actual_quantity DECIMAL(10,2),
    status VARCHAR(50) DEFAULT 'planned' CHECK (status IN ('planned', 'in-progress', 'completed', 'cancelled')),
    completion_percentage INTEGER DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
    estimated_total_cost DECIMAL(12,2) DEFAULT 0,
    actual_total_cost DECIMAL(12,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Daily Work Packages
CREATE TABLE daily_work_packages (
    uuid UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    field_operation_uuid UUID REFERENCES field_operations(uuid) ON DELETE CASCADE,
    package_name VARCHAR(255),
    work_date DATE NOT NULL,
    shift VARCHAR(20) DEFAULT 'day' CHECK (shift IN ('day', 'night')),
    planned_area_hectares DECIMAL(10,2),
    actual_area_hectares DECIMAL(10,2),
    planned_quantity DECIMAL(10,2),
    actual_quantity DECIMAL(10,2),
    status VARCHAR(50) DEFAULT 'not-started' CHECK (status IN ('not-started', 'in-progress', 'completed', 'cancelled')),
    start_time TIME,
    end_time TIME,
    duration_hours DECIMAL(4,2),
    weather_conditions TEXT,
    temperature_celsius DECIMAL(4,1),
    humidity_percent INTEGER CHECK (humidity_percent >= 0 AND humidity_percent <= 100),
    wind_speed_kmh DECIMAL(5,2),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- JOIN TABLES FOR RESOURCES
-- =====================================================

-- Operation Products
CREATE TABLE operation_products (
    uuid UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    field_operation_uuid UUID REFERENCES field_operations(uuid) ON DELETE CASCADE,
    product_uuid UUID REFERENCES products(id) ON DELETE CASCADE,
    planned_quantity DECIMAL(10,2) NOT NULL DEFAULT 0,
    actual_quantity DECIMAL(10,2),
    planned_cost DECIMAL(12,2) NOT NULL DEFAULT 0,
    actual_cost DECIMAL(12,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Operation Equipment
CREATE TABLE operation_equipment (
    uuid UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    field_operation_uuid UUID REFERENCES field_operations(uuid) ON DELETE CASCADE,
    equipment_uuid UUID REFERENCES equipment(id) ON DELETE CASCADE,
    planned_hours DECIMAL(8,2) NOT NULL DEFAULT 0,
    actual_hours DECIMAL(8,2),
    planned_cost DECIMAL(12,2) NOT NULL DEFAULT 0,
    actual_cost DECIMAL(12,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Operation Labour
CREATE TABLE operation_labour (
    uuid UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    field_operation_uuid UUID REFERENCES field_operations(uuid) ON DELETE CASCADE,
    labour_uuid UUID REFERENCES labour(id) ON DELETE CASCADE,
    planned_quantity DECIMAL(10,2) NOT NULL DEFAULT 0,
    actual_quantity DECIMAL(10,2),
    planned_cost DECIMAL(12,2) NOT NULL DEFAULT 0,
    actual_cost DECIMAL(12,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Work Package Products
CREATE TABLE work_package_products (
    uuid UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    daily_work_package_uuid UUID REFERENCES daily_work_packages(uuid) ON DELETE CASCADE,
    product_uuid UUID REFERENCES products(id) ON DELETE CASCADE,
    planned_quantity DECIMAL(10,2) NOT NULL DEFAULT 0,
    actual_quantity DECIMAL(10,2),
    planned_cost DECIMAL(12,2) NOT NULL DEFAULT 0,
    actual_cost DECIMAL(12,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Work Package Equipment
CREATE TABLE work_package_equipment (
    uuid UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    daily_work_package_uuid UUID REFERENCES daily_work_packages(uuid) ON DELETE CASCADE,
    equipment_uuid UUID REFERENCES equipment(id) ON DELETE CASCADE,
    planned_hours DECIMAL(8,2) NOT NULL DEFAULT 0,
    actual_hours DECIMAL(8,2),
    planned_cost DECIMAL(12,2) NOT NULL DEFAULT 0,
    actual_cost DECIMAL(12,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Work Package Labour
CREATE TABLE work_package_labour (
    uuid UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    daily_work_package_uuid UUID REFERENCES daily_work_packages(uuid) ON DELETE CASCADE,
    labour_uuid UUID REFERENCES labour(id) ON DELETE CASCADE,
    planned_quantity DECIMAL(10,2) NOT NULL DEFAULT 0,
    actual_quantity DECIMAL(10,2),
    planned_cost DECIMAL(12,2) NOT NULL DEFAULT 0,
    actual_cost DECIMAL(12,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- DATA COLLECTION TABLES
-- =====================================================

-- Climatic Data
CREATE TABLE climatic_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    station_id VARCHAR(100) NOT NULL,
    observation_date DATE NOT NULL,
    observation_year INTEGER NOT NULL,
    observation_month INTEGER NOT NULL,
    observation_day INTEGER NOT NULL,
    julian_day INTEGER NOT NULL,
    temperature_min_celsius DECIMAL(5,2),
    temperature_max_celsius DECIMAL(5,2),
    solar_radiation_mj_per_m2 DECIMAL(7,2),
    evapotranspiration_mm DECIMAL(6,2),
    precipitation_mm DECIMAL(6,2),
    wind_speed_m_per_s DECIMAL(5,2),
    vapor_pressure_hpa DECIMAL(6,2),
    co2_concentration_ppm DECIMAL(7,2),
    relative_humidity_percent INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(station_id, observation_date)
);

-- Observations (placeholder for future implementation)
CREATE TABLE observations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bloc_id UUID REFERENCES blocs(id) ON DELETE CASCADE,
    crop_cycle_id UUID REFERENCES crop_cycles(id) ON DELETE CASCADE,
    observation_date DATE NOT NULL,
    category VARCHAR(100) NOT NULL,
    data JSONB NOT NULL,
    notes TEXT,
    created_by VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX idx_blocs_status ON blocs(status);
CREATE INDEX idx_blocs_farm_id ON blocs(farm_id);
CREATE INDEX idx_crop_cycles_bloc_id ON crop_cycles(bloc_id);
CREATE INDEX idx_crop_cycles_status ON crop_cycles(status);
CREATE INDEX idx_field_operations_crop_cycle ON field_operations(crop_cycle_uuid);
CREATE INDEX idx_work_packages_operation ON daily_work_packages(field_operation_uuid);
CREATE INDEX idx_products_active ON products(active);
CREATE INDEX idx_equipment_active ON equipment(active);
CREATE INDEX idx_labour_active ON labour(active);
CREATE INDEX idx_climatic_data_station_date ON climatic_data(station_id, observation_date);
CREATE INDEX idx_climatic_data_date ON climatic_data(observation_date);
CREATE INDEX idx_observations_bloc_id ON observations(bloc_id);
CREATE INDEX idx_observations_crop_cycle_id ON observations(crop_cycle_id);
CREATE INDEX idx_observations_date ON observations(observation_date);

-- =====================================================
-- TRIGGERS FOR UPDATED_AT
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to all tables with updated_at
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_farms_updated_at BEFORE UPDATE ON farms FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_blocs_updated_at BEFORE UPDATE ON blocs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_crop_cycles_updated_at BEFORE UPDATE ON crop_cycles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_field_operations_updated_at BEFORE UPDATE ON field_operations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_work_packages_updated_at BEFORE UPDATE ON daily_work_packages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_climatic_data_updated_at BEFORE UPDATE ON climatic_data FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_observations_updated_at BEFORE UPDATE ON observations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- OPTIMIZED RPC FUNCTIONS
-- =====================================================

-- 1. GET FARM GIS INITIAL DATA
-- Replaces 3+ separate queries with one comprehensive call
CREATE OR REPLACE FUNCTION get_farm_gis_initial_data()
RETURNS TABLE(
  blocs jsonb,
  farms jsonb,
  companies jsonb,
  active_crop_cycles jsonb
) LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
  SELECT
    -- All active blocs with WKT coordinates
    (SELECT jsonb_agg(to_jsonb(b.*)) FROM (
      SELECT
        id,
        name,
        area_hectares,
        ST_AsText(coordinates) as coordinates_wkt,
        status,
        farm_id,
        created_at,
        updated_at
      FROM blocs
      WHERE status = 'active'
      ORDER BY created_at DESC
    ) b) as blocs,

    -- All farms
    (SELECT jsonb_agg(to_jsonb(f.*)) FROM (
      SELECT * FROM farms ORDER BY created_at ASC
    ) f) as farms,

    -- All companies
    (SELECT jsonb_agg(to_jsonb(c.*)) FROM (
      SELECT * FROM companies ORDER BY created_at ASC
    ) c) as companies,

    -- All active crop cycles with variety information
    (SELECT jsonb_agg(to_jsonb(cc.*)) FROM (
      SELECT
        cc.*,
        sv.name as sugarcane_variety_name,
        iv.name as intercrop_variety_name
      FROM crop_cycles cc
      LEFT JOIN sugarcane_varieties sv ON cc.sugarcane_variety_id = sv.id
      LEFT JOIN intercrop_varieties iv ON cc.intercrop_variety_id = iv.id
      WHERE cc.status = 'active'
      ORDER BY cc.created_at DESC
    ) cc) as active_crop_cycles;
END;
$$;

-- 2. GET COMPREHENSIVE BLOC DATA
-- Replaces 8+ separate queries with one comprehensive call
CREATE OR REPLACE FUNCTION get_comprehensive_bloc_data(p_bloc_id uuid)
RETURNS TABLE(
  bloc_id uuid,
  crop_cycles jsonb,
  field_operations jsonb,
  work_packages jsonb,
  products jsonb,
  equipment jsonb,
  labour jsonb,
  last_updated timestamp with time zone
) LANGUAGE plpgsql AS $$
DECLARE
  v_crop_cycle_ids uuid[];
  v_operation_uuids uuid[];
  v_work_package_uuids uuid[];
BEGIN
  -- Get all crop cycle IDs for this bloc
  SELECT array_agg(id) INTO v_crop_cycle_ids
  FROM crop_cycles
  WHERE bloc_id = p_bloc_id;

  -- Get all field operation UUIDs for these crop cycles
  SELECT array_agg(uuid) INTO v_operation_uuids
  FROM field_operations
  WHERE crop_cycle_uuid = ANY(v_crop_cycle_ids);

  -- Get all work package UUIDs for these operations
  SELECT array_agg(uuid) INTO v_work_package_uuids
  FROM daily_work_packages
  WHERE field_operation_uuid = ANY(v_operation_uuids);

  RETURN QUERY
  SELECT
    p_bloc_id as bloc_id,

    -- Crop cycles with variety information
    (SELECT jsonb_agg(to_jsonb(cc.*)) FROM (
      SELECT
        cc.*,
        sv.name as sugarcane_variety_name,
        iv.name as intercrop_variety_name
      FROM crop_cycles cc
      LEFT JOIN sugarcane_varieties sv ON cc.sugarcane_variety_id = sv.id
      LEFT JOIN intercrop_varieties iv ON cc.intercrop_variety_id = iv.id
      WHERE cc.bloc_id = p_bloc_id
      ORDER BY cc.created_at DESC
    ) cc) as crop_cycles,

    -- Field operations
    (SELECT jsonb_agg(to_jsonb(fo.*)) FROM (
      SELECT * FROM field_operations
      WHERE crop_cycle_uuid = ANY(v_crop_cycle_ids)
      ORDER BY planned_start_date ASC
    ) fo) as field_operations,

    -- Work packages
    (SELECT jsonb_agg(to_jsonb(wp.*)) FROM (
      SELECT * FROM daily_work_packages
      WHERE field_operation_uuid = ANY(v_operation_uuids)
      ORDER BY work_date ASC
    ) wp) as work_packages,

    -- All product joins (operations + work packages)
    (SELECT jsonb_agg(to_jsonb(p.*)) FROM (
      SELECT
        op.uuid as id,
        op.field_operation_uuid as operation_uuid,
        null::uuid as work_package_uuid,
        op.product_uuid as product_id,
        pr.name as product_name,
        op.planned_quantity,
        op.actual_quantity,
        op.planned_cost,
        op.actual_cost,
        pr.unit
      FROM operation_products op
      JOIN products pr ON op.product_uuid = pr.id
      WHERE op.field_operation_uuid = ANY(v_operation_uuids)

      UNION ALL

      SELECT
        wp.uuid as id,
        null::uuid as operation_uuid,
        wp.daily_work_package_uuid as work_package_uuid,
        wp.product_uuid as product_id,
        pr.name as product_name,
        wp.planned_quantity,
        wp.actual_quantity,
        wp.planned_cost,
        wp.actual_cost,
        pr.unit
      FROM work_package_products wp
      JOIN products pr ON wp.product_uuid = pr.id
      WHERE wp.daily_work_package_uuid = ANY(v_work_package_uuids)
    ) p) as products,

    -- All equipment joins (operations + work packages)
    (SELECT jsonb_agg(to_jsonb(e.*)) FROM (
      SELECT
        oe.uuid as id,
        oe.field_operation_uuid as operation_uuid,
        null::uuid as work_package_uuid,
        oe.equipment_uuid as equipment_id,
        eq.name as equipment_name,
        oe.planned_hours,
        oe.actual_hours,
        oe.planned_cost,
        oe.actual_cost
      FROM operation_equipment oe
      JOIN equipment eq ON oe.equipment_uuid = eq.id
      WHERE oe.field_operation_uuid = ANY(v_operation_uuids)

      UNION ALL

      SELECT
        we.uuid as id,
        null::uuid as operation_uuid,
        we.daily_work_package_uuid as work_package_uuid,
        we.equipment_uuid as equipment_id,
        eq.name as equipment_name,
        we.planned_hours,
        we.actual_hours,
        we.planned_cost,
        we.actual_cost
      FROM work_package_equipment we
      JOIN equipment eq ON we.equipment_uuid = eq.id
      WHERE we.daily_work_package_uuid = ANY(v_work_package_uuids)
    ) e) as equipment,

    -- All labour joins (operations + work packages)
    (SELECT jsonb_agg(to_jsonb(l.*)) FROM (
      SELECT
        ol.uuid as id,
        ol.field_operation_uuid as operation_uuid,
        null::uuid as work_package_uuid,
        ol.labour_uuid as labour_id,
        lab.name as labour_name,
        ol.planned_quantity,
        ol.actual_quantity,
        ol.planned_cost,
        ol.actual_cost,
        lab.unit
      FROM operation_labour ol
      JOIN labour lab ON ol.labour_uuid = lab.id
      WHERE ol.field_operation_uuid = ANY(v_operation_uuids)

      UNION ALL

      SELECT
        wl.uuid as id,
        null::uuid as operation_uuid,
        wl.daily_work_package_uuid as work_package_uuid,
        wl.labour_uuid as labour_id,
        lab.name as labour_name,
        wl.planned_quantity,
        wl.actual_quantity,
        wl.planned_cost,
        wl.actual_cost,
        lab.unit
      FROM work_package_labour wl
      JOIN labour lab ON wl.labour_uuid = lab.id
      WHERE wl.daily_work_package_uuid = ANY(v_work_package_uuids)
    ) l) as labour,

    now() as last_updated;
END;
$$;
