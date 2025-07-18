-- =====================================================
-- SAMPLE DATA FOR FARM MANAGEMENT DATABASE
-- =====================================================
-- Populate with test data for the modernized schema

-- =====================================================
-- COMPANIES
-- =====================================================
INSERT INTO companies (id, name) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Belle Vue Sugar Estate'),
('550e8400-e29b-41d4-a716-446655440002', 'Mauritius Sugar Syndicate');

-- =====================================================
-- FARMS
-- =====================================================
INSERT INTO farms (id, name, company_id) VALUES
('550e8400-e29b-41d4-a716-446655440011', 'Belle Vue North', '550e8400-e29b-41d4-a716-446655440001'),
('550e8400-e29b-41d4-a716-446655440012', 'Belle Vue South', '550e8400-e29b-41d4-a716-446655440001'),
('550e8400-e29b-41d4-a716-446655440013', 'Central Estate', '550e8400-e29b-41d4-a716-446655440002');

-- =====================================================
-- BLOCS (Sample polygons in Mauritius)
-- =====================================================
INSERT INTO blocs (id, name, area_hectares, coordinates, status, farm_id) VALUES
('550e8400-e29b-41d4-a716-446655440021', 'Bloc A1', 2.5, 
 ST_GeomFromText('POLYGON((-20.436777653866045 57.647411541519304, -20.43919089 57.652482629314875, -20.43677765 57.647411541519304, -20.436777653866045 57.647411541519304))', 4326),
 'active', '550e8400-e29b-41d4-a716-446655440011'),
 
('550e8400-e29b-41d4-a716-446655440022', 'Bloc B2', 3.2,
 ST_GeomFromText('POLYGON((-20.440000 57.650000, -20.442000 57.652000, -20.438000 57.654000, -20.436000 57.651000, -20.440000 57.650000))', 4326),
 'active', '550e8400-e29b-41d4-a716-446655440011'),
 
('550e8400-e29b-41d4-a716-446655440023', 'Bloc C3', 1.8,
 ST_GeomFromText('POLYGON((-20.445000 57.655000, -20.447000 57.657000, -20.443000 57.659000, -20.441000 57.656000, -20.445000 57.655000))', 4326),
 'active', '550e8400-e29b-41d4-a716-446655440012');

-- =====================================================
-- VARIETIES
-- =====================================================
INSERT INTO sugarcane_varieties (id, name, description) VALUES
('550e8400-e29b-41d4-a716-446655440031', 'R570', 'High-yielding variety suitable for Mauritius climate'),
('550e8400-e29b-41d4-a716-446655440032', 'R579', 'Disease-resistant variety with good sugar content'),
('550e8400-e29b-41d4-a716-446655440033', 'M1176/77', 'Traditional variety with excellent ratoon performance');

INSERT INTO intercrop_varieties (id, name, description) VALUES
('550e8400-e29b-41d4-a716-446655440041', 'Potato', 'Irish potato for intercropping'),
('550e8400-e29b-41d4-a716-446655440042', 'Onion', 'Red onion variety'),
('550e8400-e29b-41d4-a716-446655440043', 'Beans', 'French beans for intercropping');

-- =====================================================
-- PRODUCTS
-- =====================================================
INSERT INTO products (id, product_id, name, category, subcategory, unit, cost_per_unit, active) VALUES
('550e8400-e29b-41d4-a716-446655440051', 'FERT001', 'NPK 12-12-17', 'Fertilizer', 'Compound', 'kg', 25.50, true),
('550e8400-e29b-41d4-a716-446655440052', 'FERT002', 'Urea 46%', 'Fertilizer', 'Nitrogen', 'kg', 18.75, true),
('550e8400-e29b-41d4-a716-446655440053', 'HERB001', 'Glyphosate 360', 'Herbicide', 'Systemic', 'L', 145.00, true),
('550e8400-e29b-41d4-a716-446655440054', 'SEED001', 'Sugarcane Setts', 'Seed', 'Planting Material', 'tonne', 500.00, true);

-- Equipment
INSERT INTO equipment (id, equipment_id, name, category, hourly_rate, description, active) VALUES
('550e8400-e29b-41d4-a716-446655440061', 'TRAC001', 'John Deere 6120', 'Tractor', 850.00, 'Heavy-duty tractor for field operations', true),
('550e8400-e29b-41d4-a716-446655440062', 'TRAC002', 'Massey Ferguson 290', 'Tractor', 650.00, 'Medium-duty tractor for general farm work', true),
('550e8400-e29b-41d4-a716-446655440063', 'HARV001', 'Case IH 8010', 'Harvester', 1200.00, 'Combine harvester for sugarcane', true),
('550e8400-e29b-41d4-a716-446655440064', 'SPRY001', 'Boom Sprayer 24m', 'Sprayer', 450.00, 'Field sprayer with 24m boom', true);

-- Labour
INSERT INTO labour (id, labour_id, name, category, unit, cost_per_unit, active) VALUES
('550e8400-e29b-41d4-a716-446655440071', 'LAB001', 'Field Worker', 'General', 'hour', 45.00, true),
('550e8400-e29b-41d4-a716-446655440072', 'LAB002', 'Tractor Operator', 'Skilled', 'hour', 65.00, true),
('550e8400-e29b-41d4-a716-446655440073', 'LAB003', 'Supervisor', 'Management', 'hour', 85.00, true),
('550e8400-e29b-41d4-a716-446655440074', 'LAB004', 'Harvester Operator', 'Specialized', 'hour', 95.00, true);

-- =====================================================
-- CONFIGURATION DATA
-- =====================================================
INSERT INTO operation_type_config (id, operation_type, display_name, description, ordr, active) VALUES
('550e8400-e29b-41d4-a716-446655440081', 'planting', 'Planting', 'Sugarcane planting operations', 1, true),
('550e8400-e29b-41d4-a716-446655440082', 'fertilizing', 'Fertilizing', 'Fertilizer application', 2, true),
('550e8400-e29b-41d4-a716-446655440083', 'weeding', 'Weeding', 'Weed control operations', 3, true),
('550e8400-e29b-41d4-a716-446655440084', 'harvesting', 'Harvesting', 'Sugarcane harvesting', 4, true),
('550e8400-e29b-41d4-a716-446655440085', 'spraying', 'Spraying', 'Pesticide/herbicide application', 5, true);

INSERT INTO operations_method (id, method, display_name, description, ordr, active) VALUES
('550e8400-e29b-41d4-a716-446655440091', 'manual', 'Manual', 'Hand-operated methods', 1, true),
('550e8400-e29b-41d4-a716-446655440092', 'mechanical', 'Mechanical', 'Machine-operated methods', 2, true),
('550e8400-e29b-41d4-a716-446655440093', 'chemical', 'Chemical', 'Chemical application methods', 3, true),
('550e8400-e29b-41d4-a716-446655440094', 'biological', 'Biological', 'Biological control methods', 4, true);

-- =====================================================
-- CROP CYCLES
-- =====================================================
INSERT INTO crop_cycles (id, bloc_id, type, cycle_number, status, sugarcane_variety_id, planting_date, expected_harvest_date, expected_yield_tons) VALUES
('550e8400-e29b-41d4-a716-446655440101', '550e8400-e29b-41d4-a716-446655440021', 'plantation', 1, 'active', '550e8400-e29b-41d4-a716-446655440031', '2024-03-15', '2025-09-15', 125.0),
('550e8400-e29b-41d4-a716-446655440102', '550e8400-e29b-41d4-a716-446655440022', 'ratoon', 2, 'active', '550e8400-e29b-41d4-a716-446655440032', '2023-10-01', '2025-04-01', 160.0),
('550e8400-e29b-41d4-a716-446655440103', '550e8400-e29b-41d4-a716-446655440023', 'plantation', 1, 'active', '550e8400-e29b-41d4-a716-446655440033', '2024-05-01', '2025-11-01', 90.0);

-- =====================================================
-- FIELD OPERATIONS
-- =====================================================
INSERT INTO field_operations (uuid, crop_cycle_uuid, operation_name, operation_type, method, priority, planned_start_date, planned_end_date, estimated_total_cost, status) VALUES
('550e8400-e29b-41d4-a716-446655440111', '550e8400-e29b-41d4-a716-446655440101', 'Initial Fertilizer Application', 'fertilizing', 'mechanical', 'high', '2024-04-01', '2024-04-05', 8500.00, 'completed'),
('550e8400-e29b-41d4-a716-446655440112', '550e8400-e29b-41d4-a716-446655440101', 'Weed Control - Pre-emergence', 'weeding', 'chemical', 'normal', '2024-04-10', '2024-04-12', 3200.00, 'completed'),
('550e8400-e29b-41d4-a716-446655440113', '550e8400-e29b-41d4-a716-446655440102', 'Ratoon Management', 'weeding', 'mechanical', 'high', '2024-01-15', '2024-01-20', 4500.00, 'completed'),
('550e8400-e29b-41d4-a716-446655440114', '550e8400-e29b-41d4-a716-446655440103', 'Land Preparation', 'planting', 'mechanical', 'high', '2024-04-20', '2024-04-25', 6200.00, 'planned');

-- =====================================================
-- OPERATION RESOURCES (Junction Tables)
-- =====================================================
-- Operation Products
INSERT INTO operation_products (uuid, field_operation_uuid, product_uuid, planned_quantity, planned_cost) VALUES
('550e8400-e29b-41d4-a716-446655440121', '550e8400-e29b-41d4-a716-446655440111',
 '550e8400-e29b-41d4-a716-446655440051', 150.0, 3825.00),
('550e8400-e29b-41d4-a716-446655440122', '550e8400-e29b-41d4-a716-446655440111',
 '550e8400-e29b-41d4-a716-446655440052', 100.0, 1875.00),
('550e8400-e29b-41d4-a716-446655440123', '550e8400-e29b-41d4-a716-446655440112',
 '550e8400-e29b-41d4-a716-446655440053', 25.0, 3625.00);

-- Operation Labour
INSERT INTO operation_labour (uuid, field_operation_uuid, labour_uuid, planned_quantity, planned_cost) VALUES
('550e8400-e29b-41d4-a716-446655440131', '550e8400-e29b-41d4-a716-446655440111',
 '550e8400-e29b-41d4-a716-446655440072', 12.0, 780.00),
('550e8400-e29b-41d4-a716-446655440132', '550e8400-e29b-41d4-a716-446655440114',
 '550e8400-e29b-41d4-a716-446655440071', 40.0, 1800.00),
('550e8400-e29b-41d4-a716-446655440133', '550e8400-e29b-41d4-a716-446655440114',
 '550e8400-e29b-41d4-a716-446655440073', 8.0, 680.00);

-- Operation Equipment
INSERT INTO operation_equipment (uuid, field_operation_uuid, equipment_uuid, planned_hours, planned_cost) VALUES
('550e8400-e29b-41d4-a716-446655440141', '550e8400-e29b-41d4-a716-446655440111',
 '550e8400-e29b-41d4-a716-446655440061', 8.0, 6800.00),
('550e8400-e29b-41d4-a716-446655440142', '550e8400-e29b-41d4-a716-446655440114',
 '550e8400-e29b-41d4-a716-446655440064', 4.0, 1800.00);

SELECT 'Database successfully populated with sample data!' as status;
