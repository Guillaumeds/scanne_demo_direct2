-- =====================================================
-- OPTIMIZED RPC FUNCTIONS FOR FARM MANAGEMENT
-- =====================================================
-- These functions replace multiple separate queries with single optimized calls

-- =====================================================
-- 1. GET FARM GIS INITIAL DATA
-- =====================================================
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

-- =====================================================
-- 2. GET COMPREHENSIVE BLOC DATA
-- =====================================================
-- Replaces 8+ separate queries with one comprehensive call
CREATE OR REPLACE FUNCTION get_comprehensive_bloc_data(p_bloc_id uuid)
RETURNS TABLE(
  bloc_id uuid,
  crop_cycles jsonb,
  field_operations jsonb,
  work_packages jsonb,
  products jsonb,
  equipment jsonb,
  resources jsonb,
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
    
    -- All resource joins (operations + work packages)
    (SELECT jsonb_agg(to_jsonb(r.*)) FROM (
      SELECT 
        or_res.uuid as id,
        or_res.field_operation_uuid as operation_uuid,
        null::uuid as work_package_uuid,
        or_res.resource_uuid as resource_id,
        res.name as resource_name,
        or_res.planned_quantity,
        or_res.actual_quantity,
        or_res.planned_cost,
        or_res.actual_cost,
        res.unit
      FROM operation_resources or_res
      JOIN resources res ON or_res.resource_uuid = res.id
      WHERE or_res.field_operation_uuid = ANY(v_operation_uuids)
      
      UNION ALL
      
      SELECT 
        wr.uuid as id,
        null::uuid as operation_uuid,
        wr.daily_work_package_uuid as work_package_uuid,
        wr.resource_uuid as resource_id,
        res.name as resource_name,
        wr.planned_quantity,
        wr.actual_quantity,
        wr.planned_cost,
        wr.actual_cost,
        res.unit
      FROM work_package_resources wr
      JOIN resources res ON wr.resource_uuid = res.id
      WHERE wr.daily_work_package_uuid = ANY(v_work_package_uuids)
    ) r) as resources,
    
    now() as last_updated;
END;
$$;

-- =====================================================
-- 3. MUTATION RPC FUNCTIONS
-- =====================================================

-- Create Crop Cycle
CREATE OR REPLACE FUNCTION create_crop_cycle(p_cycle_data jsonb)
RETURNS TABLE(
  id uuid,
  bloc_id uuid,
  type varchar(50),
  cycle_number integer,
  status varchar(50),
  sugarcane_variety_id uuid,
  intercrop_variety_id uuid,
  planting_date date,
  planned_harvest_date date,
  expected_yield_tons_ha decimal(10,2),
  estimated_total_cost decimal(12,2),
  created_at timestamp with time zone,
  updated_at timestamp with time zone
) LANGUAGE plpgsql AS $$
DECLARE
  v_cycle_id uuid;
  v_cycle_number integer;
BEGIN
  -- Generate new UUID
  v_cycle_id := gen_random_uuid();

  -- Calculate cycle number
  SELECT COALESCE(MAX(cycle_number), 0) + 1 INTO v_cycle_number
  FROM crop_cycles
  WHERE bloc_id = (p_cycle_data->>'blocId')::uuid;

  -- Insert crop cycle
  INSERT INTO crop_cycles (
    id, bloc_id, type, cycle_number, status,
    sugarcane_variety_id, intercrop_variety_id,
    planting_date, planned_harvest_date, expected_yield_tons_ha,
    estimated_total_cost, created_at, updated_at
  ) VALUES (
    v_cycle_id,
    (p_cycle_data->>'blocId')::uuid,
    p_cycle_data->>'type',
    v_cycle_number,
    'active',
    (p_cycle_data->>'sugarcaneVarietyId')::uuid,
    CASE WHEN p_cycle_data->>'intercropVarietyId' IS NOT NULL
         THEN (p_cycle_data->>'intercropVarietyId')::uuid
         ELSE NULL END,
    CASE WHEN p_cycle_data->>'plantingDate' IS NOT NULL
         THEN (p_cycle_data->>'plantingDate')::date
         ELSE NULL END,
    (p_cycle_data->>'expectedHarvestDate')::date,
    (p_cycle_data->>'expectedYield')::decimal(10,2),
    0.00,
    now(),
    now()
  );

  -- Return the created cycle
  RETURN QUERY
  SELECT
    cc.id, cc.bloc_id, cc.type, cc.cycle_number, cc.status,
    cc.sugarcane_variety_id, cc.intercrop_variety_id,
    cc.planting_date, cc.planned_harvest_date, cc.expected_yield_tons_ha,
    cc.estimated_total_cost, cc.created_at, cc.updated_at
  FROM crop_cycles cc
  WHERE cc.id = v_cycle_id;
END;
$$;

-- Create Field Operation
CREATE OR REPLACE FUNCTION create_field_operation(p_operation_data jsonb)
RETURNS TABLE(
  uuid uuid,
  crop_cycle_uuid uuid,
  operation_name varchar(255),
  operation_type varchar(100),
  method varchar(100),
  priority varchar(20),
  planned_start_date date,
  planned_end_date date,
  planned_area_hectares decimal(10,2),
  planned_quantity decimal(10,2),
  status varchar(50),
  completion_percentage integer,
  estimated_total_cost decimal(12,2),
  created_at timestamp with time zone,
  updated_at timestamp with time zone
) LANGUAGE plpgsql AS $$
DECLARE
  v_operation_uuid uuid;
BEGIN
  -- Generate new UUID
  v_operation_uuid := gen_random_uuid();

  -- Insert field operation
  INSERT INTO field_operations (
    uuid, crop_cycle_uuid, operation_name, operation_type, method,
    priority, planned_start_date, planned_end_date,
    planned_area_hectares, planned_quantity, status,
    completion_percentage, estimated_total_cost, created_at, updated_at
  ) VALUES (
    v_operation_uuid,
    (p_operation_data->>'cropCycleUuid')::uuid,
    p_operation_data->>'operationName',
    p_operation_data->>'operationType',
    p_operation_data->>'method',
    p_operation_data->>'priority',
    (p_operation_data->>'plannedStartDate')::date,
    (p_operation_data->>'plannedEndDate')::date,
    CASE WHEN p_operation_data->>'plannedAreaHectares' IS NOT NULL
         THEN (p_operation_data->>'plannedAreaHectares')::decimal(10,2)
         ELSE NULL END,
    CASE WHEN p_operation_data->>'plannedQuantity' IS NOT NULL
         THEN (p_operation_data->>'plannedQuantity')::decimal(10,2)
         ELSE NULL END,
    'planned',
    0,
    (p_operation_data->>'estimatedTotalCost')::decimal(12,2),
    now(),
    now()
  );

  -- Return the created operation
  RETURN QUERY
  SELECT
    fo.uuid, fo.crop_cycle_uuid, fo.operation_name, fo.operation_type, fo.method,
    fo.priority, fo.planned_start_date, fo.planned_end_date,
    fo.planned_area_hectares, fo.planned_quantity, fo.status,
    fo.completion_percentage, fo.estimated_total_cost, fo.created_at, fo.updated_at
  FROM field_operations fo
  WHERE fo.uuid = v_operation_uuid;
END;
$$;
