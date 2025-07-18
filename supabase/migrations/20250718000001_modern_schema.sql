-- =====================================================
-- MODERN FARM MANAGEMENT DATABASE SCHEMA
-- =====================================================
-- Complete schema with optimized RPC functions for TanStack Query integration
-- Migration: Modern schema with separated equipment and labour tables

-- =====================================================
-- EXTENSIONS
-- =====================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

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
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Blocs
CREATE TABLE blocs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    area_hectares DECIMAL(10,2),
    coordinates GEOMETRY(POLYGON, 4326),
    status VARCHAR(50) DEFAULT 'active',
    farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Varieties
CREATE TABLE sugarcane_varieties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE intercrop_varieties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id VARCHAR(100) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    subcategory VARCHAR(100),
    unit VARCHAR(50),
    cost_per_unit DECIMAL(10,2) DEFAULT 0,
    description TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Labour (separated from resources)
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

-- Equipment (separated from resources)
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

-- Configuration Tables
CREATE TABLE operation_type_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    operation_type VARCHAR(100) NOT NULL UNIQUE,
    display_name VARCHAR(255) NOT NULL,
    description TEXT,
    ordr INTEGER DEFAULT 0,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE operations_method (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    method VARCHAR(100) NOT NULL UNIQUE,
    display_name VARCHAR(255) NOT NULL,
    description TEXT,
    ordr INTEGER DEFAULT 0,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crop Cycles
CREATE TABLE crop_cycles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bloc_id UUID NOT NULL REFERENCES blocs(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('plantation', 'ratoon')),
    cycle_number INTEGER NOT NULL DEFAULT 1,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'closed')),
    sugarcane_variety_id UUID REFERENCES sugarcane_varieties(id),
    intercrop_variety_id UUID REFERENCES intercrop_varieties(id),
    planting_date DATE,
    expected_harvest_date DATE,
    actual_harvest_date DATE,
    expected_yield_tons DECIMAL(10,2),
    actual_yield_tons DECIMAL(10,2),
    total_planned_cost DECIMAL(12,2) DEFAULT 0,
    total_actual_cost DECIMAL(12,2) DEFAULT 0,
    total_planned_hours DECIMAL(10,2) DEFAULT 0,
    total_actual_hours DECIMAL(10,2) DEFAULT 0,
    days_since_planting INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Field Operations
CREATE TABLE field_operations (
    uuid UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    crop_cycle_uuid UUID NOT NULL REFERENCES crop_cycles(id) ON DELETE CASCADE,
    operation_name VARCHAR(255) NOT NULL,
    operation_type VARCHAR(100) NOT NULL,
    method VARCHAR(100),
    priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high')),
    planned_start_date DATE,
    planned_end_date DATE,
    planned_area_hectares DECIMAL(10,2),
    planned_quantity DECIMAL(10,2),
    estimated_total_cost DECIMAL(12,2) DEFAULT 0,
    actual_start_date DATE,
    actual_end_date DATE,
    actual_area_hectares DECIMAL(10,2),
    actual_quantity DECIMAL(10,2),
    actual_total_cost DECIMAL(12,2),
    status VARCHAR(50) DEFAULT 'planned' CHECK (status IN ('planned', 'in_progress', 'completed', 'cancelled')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Daily Work Packages
CREATE TABLE daily_work_packages (
    uuid UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    field_operation_uuid UUID NOT NULL REFERENCES field_operations(uuid) ON DELETE CASCADE,
    package_name VARCHAR(255),
    work_date DATE NOT NULL,
    shift VARCHAR(20) DEFAULT 'day' CHECK (shift IN ('day', 'night')),
    planned_area_hectares DECIMAL(10,2),
    planned_quantity DECIMAL(10,2),
    actual_area_hectares DECIMAL(10,2),
    actual_quantity DECIMAL(10,2),
    weather_conditions VARCHAR(255),
    soil_conditions VARCHAR(255),
    status VARCHAR(50) DEFAULT 'planned' CHECK (status IN ('planned', 'in_progress', 'completed', 'cancelled')),
    supervisor_notes TEXT,
    completion_percentage DECIMAL(5,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- JUNCTION TABLES
-- =====================================================

-- Operation Products
CREATE TABLE operation_products (
    uuid UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    field_operation_uuid UUID NOT NULL REFERENCES field_operations(uuid) ON DELETE CASCADE,
    product_uuid UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    planned_quantity DECIMAL(10,2) NOT NULL DEFAULT 0,
    planned_cost DECIMAL(10,2) NOT NULL DEFAULT 0,
    actual_quantity DECIMAL(10,2),
    actual_cost DECIMAL(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Operation Labour (NEW - separated from resources)
CREATE TABLE operation_labour (
    uuid UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    field_operation_uuid UUID NOT NULL REFERENCES field_operations(uuid) ON DELETE CASCADE,
    labour_uuid UUID NOT NULL REFERENCES labour(id) ON DELETE CASCADE,
    planned_quantity DECIMAL(10,2) NOT NULL DEFAULT 0,
    planned_cost DECIMAL(10,2) NOT NULL DEFAULT 0,
    actual_quantity DECIMAL(10,2),
    actual_cost DECIMAL(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Operation Equipment (NEW - separated from resources)
CREATE TABLE operation_equipment (
    uuid UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    field_operation_uuid UUID NOT NULL REFERENCES field_operations(uuid) ON DELETE CASCADE,
    equipment_uuid UUID NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
    planned_hours DECIMAL(10,2) NOT NULL DEFAULT 0,
    planned_cost DECIMAL(10,2) NOT NULL DEFAULT 0,
    actual_hours DECIMAL(10,2),
    actual_cost DECIMAL(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
