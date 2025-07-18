-- =====================================================
-- INDEXES, FUNCTIONS AND REMAINING SCHEMA
-- =====================================================

-- Work Package Labour (NEW - separated from resources)
CREATE TABLE work_package_labour (
    uuid UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    daily_work_package_uuid UUID NOT NULL REFERENCES daily_work_packages(uuid) ON DELETE CASCADE,
    labour_uuid UUID NOT NULL REFERENCES labour(id) ON DELETE CASCADE,
    planned_quantity DECIMAL(10,2) NOT NULL DEFAULT 0,
    planned_cost DECIMAL(10,2) NOT NULL DEFAULT 0,
    actual_quantity DECIMAL(10,2),
    actual_cost DECIMAL(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Work Package Equipment (NEW - separated from resources)
CREATE TABLE work_package_equipment (
    uuid UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    daily_work_package_uuid UUID NOT NULL REFERENCES daily_work_packages(uuid) ON DELETE CASCADE,
    equipment_uuid UUID NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
    planned_hours DECIMAL(10,2) NOT NULL DEFAULT 0,
    planned_cost DECIMAL(10,2) NOT NULL DEFAULT 0,
    actual_hours DECIMAL(10,2),
    actual_cost DECIMAL(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Work Package Products
CREATE TABLE work_package_products (
    uuid UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    daily_work_package_uuid UUID NOT NULL REFERENCES daily_work_packages(uuid) ON DELETE CASCADE,
    product_uuid UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    planned_quantity DECIMAL(10,2) NOT NULL DEFAULT 0,
    planned_cost DECIMAL(10,2) NOT NULL DEFAULT 0,
    actual_quantity DECIMAL(10,2),
    actual_cost DECIMAL(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX idx_blocs_farm_id ON blocs(farm_id);
CREATE INDEX idx_blocs_status ON blocs(status);
CREATE INDEX idx_crop_cycles_bloc_id ON crop_cycles(bloc_id);
CREATE INDEX idx_crop_cycles_status ON crop_cycles(status);
CREATE INDEX idx_field_operations_crop_cycle ON field_operations(crop_cycle_uuid);
CREATE INDEX idx_field_operations_status ON field_operations(status);
CREATE INDEX idx_daily_work_packages_operation ON daily_work_packages(field_operation_uuid);
CREATE INDEX idx_daily_work_packages_date ON daily_work_packages(work_date);
CREATE INDEX idx_products_active ON products(active);
CREATE INDEX idx_labour_active ON labour(active);
CREATE INDEX idx_equipment_active ON equipment(active);

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

CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_farms_updated_at BEFORE UPDATE ON farms FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_blocs_updated_at BEFORE UPDATE ON blocs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_crop_cycles_updated_at BEFORE UPDATE ON crop_cycles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_field_operations_updated_at BEFORE UPDATE ON field_operations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_daily_work_packages_updated_at BEFORE UPDATE ON daily_work_packages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

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

    -- Active crop cycles with variety info
    (SELECT jsonb_agg(to_jsonb(cc.*)) FROM (
      SELECT 
        cc.*,
        sv.name as sugarcane_variety_name,
        iv.name as intercrop_variety_name,
        b.name as bloc_name
      FROM crop_cycles cc
      LEFT JOIN sugarcane_varieties sv ON cc.sugarcane_variety_id = sv.id
      LEFT JOIN intercrop_varieties iv ON cc.intercrop_variety_id = iv.id
      LEFT JOIN blocs b ON cc.bloc_id = b.id
      WHERE cc.status = 'active'
      ORDER BY cc.created_at DESC
    ) cc) as active_crop_cycles;
END;
$$;

-- 2. GET COMPREHENSIVE BLOC DATA
-- Single query for all bloc-level data needed by the UI
CREATE OR REPLACE FUNCTION get_comprehensive_bloc_data(p_bloc_id UUID)
RETURNS TABLE(
  bloc_id UUID,
  crop_cycles jsonb,
  field_operations jsonb,
  work_packages jsonb,
  products jsonb,
  labour jsonb,
  equipment jsonb,
  last_updated timestamp with time zone
) LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
  SELECT
    p_bloc_id as bloc_id,
    
    -- Crop cycles for this bloc
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
    
    -- Field operations for this bloc's crop cycles
    (SELECT jsonb_agg(to_jsonb(fo.*)) FROM (
      SELECT fo.*
      FROM field_operations fo
      JOIN crop_cycles cc ON fo.crop_cycle_uuid = cc.id
      WHERE cc.bloc_id = p_bloc_id
      ORDER BY fo.planned_start_date DESC NULLS LAST, fo.created_at DESC
    ) fo) as field_operations,
    
    -- Work packages for this bloc's operations
    (SELECT jsonb_agg(to_jsonb(wp.*)) FROM (
      SELECT wp.*
      FROM daily_work_packages wp
      JOIN field_operations fo ON wp.field_operation_uuid = fo.uuid
      JOIN crop_cycles cc ON fo.crop_cycle_uuid = cc.id
      WHERE cc.bloc_id = p_bloc_id
      ORDER BY wp.work_date DESC, wp.created_at DESC
    ) wp) as work_packages,
    
    -- Products used in this bloc
    (SELECT jsonb_agg(to_jsonb(p.*)) FROM (
      SELECT DISTINCT p.*
      FROM products p
      WHERE p.active = true
      ORDER BY p.name
    ) p) as products,
    
    -- Labour used in this bloc
    (SELECT jsonb_agg(to_jsonb(l.*)) FROM (
      SELECT DISTINCT l.*
      FROM labour l
      WHERE l.active = true
      ORDER BY l.name
    ) l) as labour,
    
    -- Equipment used in this bloc
    (SELECT jsonb_agg(to_jsonb(e.*)) FROM (
      SELECT DISTINCT e.*
      FROM equipment e
      WHERE e.active = true
      ORDER BY e.name
    ) e) as equipment,
    
    NOW() as last_updated;
END;
$$;
