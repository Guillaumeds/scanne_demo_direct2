-- =====================================================
-- SAMPLE DATA FOR TESTING
-- =====================================================
-- Basic data to get the application working

-- Insert sample company
INSERT INTO companies (id, name) VALUES 
('550e8400-e29b-41d4-a716-446655440000', 'Demo Sugar Company');

-- Insert sample farm
INSERT INTO farms (id, company_id, name, location, total_area_hectares) VALUES 
('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'Demo Farm', 'Mauritius', 100.0);

-- Insert sample blocs (the ones that exist in your current app)
INSERT INTO blocs (id, farm_id, name, area_hectares, coordinates) VALUES
('550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440001', 'Demo Bloc 1', 5.0, NULL),
('550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440001', 'Demo Bloc 2', 7.5, NULL);

-- =====================================================
-- CONFIGURATION DATA - MINIMAL SET
-- =====================================================

-- Sample sugarcane varieties (just a few key ones)
INSERT INTO sugarcane_varieties (variety_id, name, category, harvest_start_month, harvest_end_month, seasons, soil_types, active) VALUES
('m-1176-77', 'M 1176/77', 'Sugarcane Variety', 'Aug', 'Sep', ARRAY['Aug','Sep'], ARRAY['L1','L2','P1','P2','P3'], true),
('m-52-78', 'M 52/78', 'Sugarcane Variety', 'Jun', 'Aug', ARRAY['Jun','Jul','Aug'], ARRAY['B1','B2','F1','F2','H1','H2','L2'], true),
('m-387-85', 'M 387/85', 'Sugarcane Variety', 'Jul', 'Oct', ARRAY['Jul','Aug','Sep','Oct'], ARRAY['B1','B2'], true),
('m-1400-86', 'M 1400/86', 'Sugarcane Variety', 'Aug', 'Sep', ARRAY['Aug','Sep'], ARRAY['B1','B2','F1','F2','H1','H2','L1','L2','P1','P2','P3'], true),
('m-2256-88', 'M 2256/88', 'Sugarcane Variety', 'Jun', 'Sep', ARRAY['Jun','Jul','Aug','Sep'], ARRAY['B1','B2','F1','F2','H1','H2','L1','L2','P1','P2','P3'], true);

-- Sample intercrop varieties
INSERT INTO intercrop_varieties (variety_id, name, scientific_name, category, benefits, active) VALUES
('cowpea', 'Cowpea', 'Vigna unguiculata', 'intercrop', ARRAY['Nitrogen fixation','Soil improvement','Additional income'], true),
('groundnut', 'Groundnut', 'Arachis hypogaea', 'intercrop', ARRAY['Nitrogen fixation','High protein crop','Market value'], true),
('sweet-potato', 'Sweet Potato', 'Ipomoea batatas', 'intercrop', ARRAY['Ground cover','Food security','Fast growing'], true);

-- Sample products (using correct frontend category enums)
INSERT INTO products (product_id, name, category, subcategory, unit, cost_per_unit, active) VALUES
('urea', 'Urea 46%', 'nitrogen', 'Nitrogen', 'kg', 25.50, true),
('compound-fertilizer', 'NPK 12-12-17', 'compound-npk', 'Compound', 'kg', 32.00, true),
('herbicide-glyphosate', 'Glyphosate 360g/L', 'other', 'Non-selective', 'L', 145.00, true),
('insecticide-cypermethrin', 'Cypermethrin 100g/L', 'other', 'Pyrethroid', 'L', 280.00, true);

-- Sample resources (using correct frontend category enums)
INSERT INTO resources (resource_id, name, category, subcategory, unit, cost_per_unit, active) VALUES
('tractor-hours', 'Tractor Hours', 'machinery', 'Heavy Equipment', 'hour', 850.00, true),
('labor-general', 'General Labor', 'labour', 'Field Work', 'hour', 125.00, true),
('labor-skilled', 'Skilled Labor', 'labour', 'Technical', 'hour', 180.00, true),
('fuel-diesel', 'Diesel Fuel', 'fleet', 'Machinery', 'L', 45.50, true);
