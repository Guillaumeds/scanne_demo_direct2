-- =====================================================
-- SAMPLE DATA FOR EXCEL-LIKE OPERATIONS OVERVIEW
-- =====================================================
-- Run this after the main database setup to populate with test data

-- =====================================================
-- BASIC FARM STRUCTURE DATA
-- =====================================================

-- Insert sample company
INSERT INTO companies (id, name) VALUES 
('550e8400-e29b-41d4-a716-446655440000', 'Scanne Sugar Estate')
ON CONFLICT (id) DO NOTHING;

-- Insert sample farm
INSERT INTO farms (id, company_id, name, location, total_area_hectares) VALUES 
('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'Main Farm', 'Mauritius', 500.00)
ON CONFLICT (id) DO NOTHING;

-- Insert sample blocs
INSERT INTO blocs (id, farm_id, name, area_hectares, status) VALUES 
('550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440001', 'Bloc 1', 25.50, 'active'),
('550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440001', 'Bloc 2', 30.75, 'active'),
('550e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440001', 'Bloc 3', 22.25, 'active'),
('550e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440001', 'Bloc 4', 28.00, 'active'),
('550e8400-e29b-41d4-a716-446655440014', '550e8400-e29b-41d4-a716-446655440001', 'Bloc 5', 35.50, 'active')
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- VARIETIES DATA
-- =====================================================

-- Insert sugarcane varieties
INSERT INTO sugarcane_varieties (id, variety_id, name, category, sugar_content_percent) VALUES 
('550e8400-e29b-41d4-a716-446655440020', 'R570', 'R570', 'High Sugar', 14.5),
('550e8400-e29b-41d4-a716-446655440021', 'R579', 'R579', 'High Tonnage', 13.2),
('550e8400-e29b-41d4-a716-446655440022', 'M1176/77', 'M1176/77', 'Disease Resistant', 13.8)
ON CONFLICT (variety_id) DO NOTHING;

-- =====================================================
-- RESOURCES DATA
-- =====================================================

-- Insert resources
INSERT INTO resources (id, resource_id, name, category, unit, cost_per_unit) VALUES 
('550e8400-e29b-41d4-a716-446655440030', 'FERT_SPREADER', 'Fertilizer Spreader', 'fertilizer_equipment', 'hour', 25.00),
('550e8400-e29b-41d4-a716-446655440031', 'TRACTOR', 'Tractor', 'machinery', 'hour', 45.00),
('550e8400-e29b-41d4-a716-446655440032', 'FIELD_WORKER', 'Field Worker', 'labor', 'hour', 15.00),
('550e8400-e29b-41d4-a716-446655440033', 'SPRAY_EQUIPMENT', 'Spray Equipment', 'pesticide_equipment', 'hour', 20.00),
('550e8400-e29b-41d4-a716-446655440034', 'HARVESTER', 'Harvester', 'machinery', 'hour', 85.00)
ON CONFLICT (resource_id) DO NOTHING;

-- =====================================================
-- PRODUCTS DATA (WITH RESOURCE LINKS)
-- =====================================================

-- Insert products with linked resources
INSERT INTO products (id, product_id, name, category, unit, cost_per_unit, resource_id, default_application_rate, min_application_rate, max_application_rate) VALUES 
('550e8400-e29b-41d4-a716-446655440040', 'NPK_15_15_15', 'NPK 15-15-15', 'fertilizer', 'kg', 1.25, '550e8400-e29b-41d4-a716-446655440030', 200.0, 150.0, 300.0),
('550e8400-e29b-41d4-a716-446655440041', 'UREA_46', 'Urea 46%', 'fertilizer', 'kg', 0.85, '550e8400-e29b-41d4-a716-446655440030', 150.0, 100.0, 250.0),
('550e8400-e29b-41d4-a716-446655440042', 'POTASH_60', 'Potash 60%', 'fertilizer', 'kg', 1.45, '550e8400-e29b-41d4-a716-446655440030', 100.0, 75.0, 150.0),
('550e8400-e29b-41d4-a716-446655440043', 'GLYPHOSATE', 'Glyphosate 360', 'herbicide', 'liter', 8.50, '550e8400-e29b-41d4-a716-446655440033', 3.0, 2.0, 5.0),
('550e8400-e29b-41d4-a716-446655440044', 'ATRAZINE', 'Atrazine 500', 'herbicide', 'liter', 12.75, '550e8400-e29b-41d4-a716-446655440033', 2.5, 1.5, 4.0),
('550e8400-e29b-41d4-a716-446655440045', 'INSECTICIDE_A', 'Cypermethrin 250', 'insecticide', 'liter', 15.25, '550e8400-e29b-41d4-a716-446655440033', 1.0, 0.5, 2.0)
ON CONFLICT (product_id) DO NOTHING;

-- =====================================================
-- CROP CYCLES DATA
-- =====================================================

-- Insert crop cycles for each bloc
INSERT INTO crop_cycles (id, bloc_id, cycle_number, cycle_type, sugarcane_variety_id, planting_date, expected_harvest_date, status) VALUES 
('550e8400-e29b-41d4-a716-446655440050', '550e8400-e29b-41d4-a716-446655440010', 1, 'plantation', '550e8400-e29b-41d4-a716-446655440020', '2024-03-15', '2025-08-15', 'active'),
('550e8400-e29b-41d4-a716-446655440051', '550e8400-e29b-41d4-a716-446655440011', 1, 'plantation', '550e8400-e29b-41d4-a716-446655440021', '2024-04-01', '2025-09-01', 'active'),
('550e8400-e29b-41d4-a716-446655440052', '550e8400-e29b-41d4-a716-446655440012', 2, 'ratoon', '550e8400-e29b-41d4-a716-446655440020', '2024-01-10', '2025-06-10', 'active'),
('550e8400-e29b-41d4-a716-446655440053', '550e8400-e29b-41d4-a716-446655440013', 1, 'plantation', '550e8400-e29b-41d4-a716-446655440022', '2024-05-15', '2025-10-15', 'active'),
('550e8400-e29b-41d4-a716-446655440054', '550e8400-e29b-41d4-a716-446655440014', 3, 'ratoon', '550e8400-e29b-41d4-a716-446655440021', '2023-12-01', '2025-05-01', 'active')
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- ACTIVITIES DATA
-- =====================================================

-- Insert fertilization activities
INSERT INTO activities (id, crop_cycle_id, name, description, phase, planned_start_date, planned_end_date, priority, progress_percentage, status) VALUES 
('550e8400-e29b-41d4-a716-446655440060', '550e8400-e29b-41d4-a716-446655440050', 'Base Fertilization', 'Apply base NPK fertilizer', 'fertilization', '2024-04-01', '2024-04-05', 'high', 75, 'in-progress'),
('550e8400-e29b-41d4-a716-446655440061', '550e8400-e29b-41d4-a716-446655440050', 'Top Dressing 1', 'First urea application', 'fertilization', '2024-06-01', '2024-06-03', 'medium', 0, 'planned'),
('550e8400-e29b-41d4-a716-446655440062', '550e8400-e29b-41d4-a716-446655440051', 'Base Fertilization', 'Apply base NPK fertilizer', 'fertilization', '2024-04-15', '2024-04-18', 'high', 100, 'completed'),
('550e8400-e29b-41d4-a716-446655440063', '550e8400-e29b-41d4-a716-446655440051', 'Potash Application', 'Apply potash fertilizer', 'fertilization', '2024-07-01', '2024-07-02', 'medium', 25, 'in-progress'),
('550e8400-e29b-41d4-a716-446655440064', '550e8400-e29b-41d4-a716-446655440052', 'Ratoon Fertilization', 'Fertilize ratoon crop', 'fertilization', '2024-02-01', '2024-02-03', 'high', 100, 'completed'),
('550e8400-e29b-41d4-a716-446655440065', '550e8400-e29b-41d4-a716-446655440053', 'Weed Control', 'Pre-emergence herbicide', 'weed_control', '2024-05-20', '2024-05-22', 'urgent', 50, 'in-progress'),
('550e8400-e29b-41d4-a716-446655440066', '550e8400-e29b-41d4-a716-446655440054', 'Pest Control', 'Insecticide application', 'pest_control', '2024-03-15', '2024-03-16', 'high', 100, 'completed')
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- ACTIVITY PRODUCTS DATA
-- =====================================================

-- Insert activity products with Excel-like tracking fields
INSERT INTO activity_products (id, activity_id, product_id, product_name, quantity, rate, unit, planned_area, planned_total_quantity, actual_total_quantity, quantity_remaining, estimated_cost) VALUES 
('550e8400-e29b-41d4-a716-446655440070', '550e8400-e29b-41d4-a716-446655440060', '550e8400-e29b-41d4-a716-446655440040', 'NPK 15-15-15', 5100.0, 200.0, 'kg', 25.5, 5100.0, 3825.0, 1275.0, 6375.00),
('550e8400-e29b-41d4-a716-446655440071', '550e8400-e29b-41d4-a716-446655440061', '550e8400-e29b-41d4-a716-446655440041', 'Urea 46%', 3825.0, 150.0, 'kg', 25.5, 3825.0, 0.0, 3825.0, 3251.25),
('550e8400-e29b-41d4-a716-446655440072', '550e8400-e29b-41d4-a716-446655440062', '550e8400-e29b-41d4-a716-446655440040', 'NPK 15-15-15', 6150.0, 200.0, 'kg', 30.75, 6150.0, 6150.0, 0.0, 7687.50),
('550e8400-e29b-41d4-a716-446655440073', '550e8400-e29b-41d4-a716-446655440063', '550e8400-e29b-41d4-a716-446655440042', 'Potash 60%', 3075.0, 100.0, 'kg', 30.75, 3075.0, 768.75, 2306.25, 4458.75),
('550e8400-e29b-41d4-a716-446655440074', '550e8400-e29b-41d4-a716-446655440064', '550e8400-e29b-41d4-a716-446655440041', 'Urea 46%', 3337.5, 150.0, 'kg', 22.25, 3337.5, 3337.5, 0.0, 2836.88),
('550e8400-e29b-41d4-a716-446655440075', '550e8400-e29b-41d4-a716-446655440065', '550e8400-e29b-41d4-a716-446655440043', 'Glyphosate 360', 84.0, 3.0, 'liter', 28.0, 84.0, 42.0, 42.0, 714.00),
('550e8400-e29b-41d4-a716-446655440076', '550e8400-e29b-41d4-a716-446655440066', '550e8400-e29b-41d4-a716-446655440045', 'Cypermethrin 250', 35.5, 1.0, 'liter', 35.5, 35.5, 35.5, 0.0, 541.38)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- ACTIVITY RESOURCES DATA
-- =====================================================

-- Insert activity resources
INSERT INTO activity_resources (id, activity_id, resource_id, resource_name, hours, cost_per_hour, planned_effort_hours, actual_effort_hours, estimated_cost) VALUES 
('550e8400-e29b-41d4-a716-446655440080', '550e8400-e29b-41d4-a716-446655440060', '550e8400-e29b-41d4-a716-446655440030', 'Fertilizer Spreader', 8.0, 25.00, 8.0, 6.0, 200.00),
('550e8400-e29b-41d4-a716-446655440081', '550e8400-e29b-41d4-a716-446655440060', '550e8400-e29b-41d4-a716-446655440031', 'Tractor', 8.0, 45.00, 8.0, 6.0, 360.00),
('550e8400-e29b-41d4-a716-446655440082', '550e8400-e29b-41d4-a716-446655440062', '550e8400-e29b-41d4-a716-446655440030', 'Fertilizer Spreader', 10.0, 25.00, 10.0, 10.0, 250.00),
('550e8400-e29b-41d4-a716-446655440083', '550e8400-e29b-41d4-a716-446655440062', '550e8400-e29b-41d4-a716-446655440031', 'Tractor', 10.0, 45.00, 10.0, 10.0, 450.00),
('550e8400-e29b-41d4-a716-446655440084', '550e8400-e29b-41d4-a716-446655440065', '550e8400-e29b-41d4-a716-446655440033', 'Spray Equipment', 6.0, 20.00, 6.0, 3.0, 120.00),
('550e8400-e29b-41d4-a716-446655440085', '550e8400-e29b-41d4-a716-446655440066', '550e8400-e29b-41d4-a716-446655440033', 'Spray Equipment', 4.0, 20.00, 4.0, 4.0, 80.00)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- DAILY APPLICATIONS DATA (FOR EXCEL DAILY TASKS)
-- =====================================================

-- Insert daily applications to show Excel-like daily tracking
INSERT INTO daily_applications (id, activity_product_id, application_date, area_applied, quantity_applied, rate_applied, weather_conditions, operator_notes, actual_cost) VALUES
-- NPK applications for Bloc 1
('550e8400-e29b-41d4-a716-446655440090', '550e8400-e29b-41d4-a716-446655440070', '2024-04-01', 12.75, 2550.0, 200.0, 'Sunny, light wind', 'Applied to north section', 3187.50),
('550e8400-e29b-41d4-a716-446655440091', '550e8400-e29b-41d4-a716-446655440070', '2024-04-02', 12.75, 1275.0, 100.0, 'Cloudy, no wind', 'Applied to south section', 1593.75),

-- NPK applications for Bloc 2 (completed)
('550e8400-e29b-41d4-a716-446655440092', '550e8400-e29b-41d4-a716-446655440072', '2024-04-15', 15.375, 3075.0, 200.0, 'Sunny, moderate wind', 'Morning application', 3843.75),
('550e8400-e29b-41d4-a716-446655440093', '550e8400-e29b-41d4-a716-446655440072', '2024-04-16', 15.375, 3075.0, 200.0, 'Partly cloudy', 'Afternoon application', 3843.75),

-- Potash applications for Bloc 2 (partial)
('550e8400-e29b-41d4-a716-446655440094', '550e8400-e29b-41d4-a716-446655440073', '2024-07-01', 7.6875, 768.75, 100.0, 'Hot, sunny', 'First quarter applied', 1114.69),

-- Urea applications for Bloc 3 (completed)
('550e8400-e29b-41d4-a716-446655440095', '550e8400-e29b-41d4-a716-446655440074', '2024-02-01', 11.125, 1668.75, 150.0, 'Cool, overcast', 'Morning shift', 1418.44),
('550e8400-e29b-41d4-a716-446655440096', '550e8400-e29b-41d4-a716-446655440074', '2024-02-02', 11.125, 1668.75, 150.0, 'Mild, sunny', 'Afternoon shift', 1418.44),

-- Herbicide applications for Bloc 4 (partial)
('550e8400-e29b-41d4-a716-446655440097', '550e8400-e29b-41d4-a716-446655440075', '2024-05-20', 14.0, 42.0, 3.0, 'Calm, dry conditions', 'Pre-emergence application', 357.00),

-- Insecticide applications for Bloc 5 (completed)
('550e8400-e29b-41d4-a716-446655440098', '550e8400-e29b-41d4-a716-446655440076', '2024-03-15', 35.5, 35.5, 1.0, 'Evening, low wind', 'Full bloc treatment', 541.38)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON TABLE daily_applications IS 'Daily tracking of product applications for Excel-like operations overview';
COMMENT ON VIEW fertilization_overview IS 'Excel-like view combining blocs, activities, products, and resources for operations overview';
COMMENT ON VIEW daily_applications_overview IS 'Daily applications data formatted for Excel-like daily tasks columns';

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Uncomment these to verify the data after insertion:

-- SELECT 'Companies' as table_name, count(*) as record_count FROM companies
-- UNION ALL
-- SELECT 'Farms', count(*) FROM farms
-- UNION ALL
-- SELECT 'Blocs', count(*) FROM blocs
-- UNION ALL
-- SELECT 'Products', count(*) FROM products
-- UNION ALL
-- SELECT 'Resources', count(*) FROM resources
-- UNION ALL
-- SELECT 'Crop Cycles', count(*) FROM crop_cycles
-- UNION ALL
-- SELECT 'Activities', count(*) FROM activities
-- UNION ALL
-- SELECT 'Activity Products', count(*) FROM activity_products
-- UNION ALL
-- SELECT 'Activity Resources', count(*) FROM activity_resources
-- UNION ALL
-- SELECT 'Daily Applications', count(*) FROM daily_applications;

-- Test the Excel view:
-- SELECT * FROM fertilization_overview LIMIT 10;
