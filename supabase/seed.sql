-- =====================================================
-- Scanne Farm Management - Seed Data
-- Reference data for varieties, products, resources, and categories
-- =====================================================

-- =====================================================
-- SYSTEM CONFIGURATION
-- =====================================================

INSERT INTO system_config (config_key, config_group, config_value, description) VALUES
('default_currency', 'financial', '{"code": "MUR", "symbol": "Rs", "decimals": 2}', 'Default currency for financial calculations'),
('weight_units', 'measurements', '["kg", "tons", "g", "lbs"]', 'Available weight units'),
('area_units', 'measurements', '["hectares", "acres", "m²"]', 'Available area units'),
('volume_units', 'measurements', '["liters", "ml", "gallons"]', 'Available volume units'),
('growth_stage_update_frequency', 'system', '{"hours": 24}', 'How often to recalculate growth stages');

-- =====================================================
-- ACTIVITY CATEGORIES
-- =====================================================

INSERT INTO activity_categories (category_id, name, description, icon, color) VALUES
('land-preparation', 'Land Preparation', 'Soil preparation and field setup activities', 'tractor', '#8B5CF6'),
('planting', 'Planting', 'Seed/cutting planting activities', 'sprout', '#10B981'),
('fertilization', 'Fertilization', 'Fertilizer application activities', 'leaf', '#F59E0B'),
('pest-control', 'Pest Control', 'Pesticide and herbicide applications', 'shield', '#EF4444'),
('irrigation', 'Irrigation', 'Water management and irrigation', 'droplets', '#3B82F6'),
('cultivation', 'Cultivation', 'Weeding and cultivation activities', 'shovel', '#6B7280'),
('harvesting', 'Harvesting', 'Crop harvesting activities', 'scissors', '#F97316'),
('transport', 'Transport', 'Transportation and logistics', 'truck', '#8B5CF6'),
('maintenance', 'Maintenance', 'Equipment and infrastructure maintenance', 'wrench', '#6B7280'),
('monitoring', 'Monitoring', 'Field monitoring and inspection', 'eye', '#06B6D4');

-- =====================================================
-- OBSERVATION CATEGORIES
-- =====================================================

INSERT INTO observation_categories (category_id, name, description, icon, color) VALUES
('soil', 'Soil', 'Soil condition and health observations', 'mountain', '#8B4513'),
('water', 'Water', 'Water quality and availability observations', 'droplets', '#3B82F6'),
('plant', 'Plant', 'Plant health and growth observations', 'leaf', '#10B981'),
('pest', 'Pest', 'Pest and disease observations', 'bug', '#EF4444'),
('weather', 'Weather', 'Weather and climate observations', 'cloud', '#6B7280'),
('yield', 'Yield', 'Yield estimation and quality observations', 'bar-chart', '#F59E0B'),
('equipment', 'Equipment', 'Equipment condition observations', 'settings', '#8B5CF6'),
('general', 'General', 'General field observations', 'eye', '#06B6D4');

-- =====================================================
-- ATTACHMENT CATEGORIES
-- =====================================================

INSERT INTO attachment_categories (category_id, name, description, icon, color) VALUES
('photos', 'Photos', 'Field and crop photographs', 'camera', '#10B981'),
('documents', 'Documents', 'Reports, certificates, and documentation', 'file-text', '#3B82F6'),
('maps', 'Maps', 'Field maps and spatial data', 'map', '#F59E0B'),
('receipts', 'Receipts', 'Purchase receipts and invoices', 'receipt', '#EF4444'),
('certificates', 'Certificates', 'Quality and compliance certificates', 'award', '#8B5CF6'),
('reports', 'Reports', 'Analysis and inspection reports', 'clipboard', '#6B7280'),
('videos', 'Videos', 'Field and process videos', 'video', '#F97316'),
('other', 'Other', 'Other miscellaneous files', 'paperclip', '#9CA3AF');

-- =====================================================
-- SUGARCANE VARIETIES
-- =====================================================

INSERT INTO sugarcane_varieties (variety_id, name, category, harvest_start_month, harvest_end_month, seasons, soil_types, sugar_content_percent, characteristics, description, icon, active) VALUES
('M 1176/77', 'M 1176/77', 'Medium Maturing', 'Aug', 'Sep', ARRAY['Aug', 'Sep'], ARRAY['L1', 'L2', 'P1'], 14.2, '{"disease_resistance": "High", "drought_tolerance": "Medium", "yield_potential": "High"}', 'High-yielding variety suitable for light soils with good disease resistance', 'sprout', true),
('R 570', 'R 570', 'Early Maturing', 'Jul', 'Aug', ARRAY['Jul', 'Aug'], ARRAY['L1', 'L2'], 13.8, '{"disease_resistance": "Medium", "drought_tolerance": "High", "yield_potential": "Medium"}', 'Early maturing variety with excellent drought tolerance', 'sprout', true),
('M 2593/92', 'M 2593/92', 'Late Maturing', 'Sep', 'Oct', ARRAY['Sep', 'Oct'], ARRAY['P1', 'P2', 'H1'], 15.1, '{"disease_resistance": "High", "drought_tolerance": "Low", "yield_potential": "Very High"}', 'Late maturing variety with very high sugar content', 'sprout', true),
('R 579', 'R 579', 'Medium Maturing', 'Aug', 'Sep', ARRAY['Aug', 'Sep'], ARRAY['L1', 'L2', 'P1'], 14.5, '{"disease_resistance": "Medium", "drought_tolerance": "Medium", "yield_potential": "High"}', 'Versatile variety suitable for various soil types', 'sprout', true),
('M 3035/66', 'M 3035/66', 'Early Maturing', 'Jul', 'Aug', ARRAY['Jul', 'Aug'], ARRAY['L1', 'P1'], 13.5, '{"disease_resistance": "High", "drought_tolerance": "High", "yield_potential": "Medium"}', 'Robust early variety with excellent disease resistance', 'sprout', true);

-- =====================================================
-- INTERCROP VARIETIES
-- =====================================================

INSERT INTO intercrop_varieties (variety_id, name, scientific_name, benefits, planting_time, harvest_time, description, icon, active) VALUES
('potato-spunta', 'Potato Spunta', 'Solanum tuberosum', ARRAY['Soil improvement', 'Additional income', 'Pest control'], 'May-June', 'August-September', 'Popular potato variety suitable for intercropping with sugarcane', 'apple', true),
('bean-common', 'Common Bean', 'Phaseolus vulgaris', ARRAY['Nitrogen fixation', 'Soil improvement', 'Food security'], 'April-May', 'July-August', 'Nitrogen-fixing legume that improves soil fertility', 'leaf', true),
('onion-red', 'Red Onion', 'Allium cepa', ARRAY['Pest deterrent', 'Market value', 'Space utilization'], 'March-April', 'June-July', 'High-value crop with natural pest deterrent properties', 'circle', true),
('maize-hybrid', 'Hybrid Maize', 'Zea mays', ARRAY['Quick return', 'Food security', 'Biomass'], 'November-December', 'March-April', 'Fast-growing cereal crop for quick returns', 'wheat', true),
('none', 'None', '', ARRAY[]::text[], '', '', 'No intercrop planted', 'x', true);

-- =====================================================
-- PRODUCTS (Fertilizers, Pesticides, etc.)
-- =====================================================

INSERT INTO products (product_id, name, category, description, unit, recommended_rate_per_ha, cost_per_unit, brand, composition, icon, active) VALUES
('urea-46', 'Urea 46%', 'Fertilizer', 'Nitrogen fertilizer for vegetative growth', 'kg', 200.0, 25.50, 'Generic', '46% Nitrogen', 'leaf', true),
('npk-12-12-17', 'NPK 12-12-17', 'Fertilizer', 'Complete fertilizer for balanced nutrition', 'kg', 300.0, 32.00, 'Yara', '12% N, 12% P2O5, 17% K2O', 'leaf', true),
('glyphosate-360', 'Glyphosate 360', 'Herbicide', 'Non-selective systemic herbicide', 'liter', 3.0, 185.00, 'Roundup', '360g/L Glyphosate', 'shield', true),
('atrazine-500', 'Atrazine 500', 'Herbicide', 'Pre-emergence herbicide for weed control', 'liter', 2.5, 165.00, 'Syngenta', '500g/L Atrazine', 'shield', true),
('imidacloprid-200', 'Imidacloprid 200', 'Insecticide', 'Systemic insecticide for pest control', 'ml', 500.0, 0.85, 'Bayer', '200g/L Imidacloprid', 'bug', true),
('dap-fertilizer', 'DAP Fertilizer', 'Fertilizer', 'Diammonium phosphate for root development', 'kg', 150.0, 28.75, 'Generic', '18% N, 46% P2O5', 'leaf', true),
('potash-muriate', 'Muriate of Potash', 'Fertilizer', 'Potassium fertilizer for sugar development', 'kg', 100.0, 22.50, 'Generic', '60% K2O', 'leaf', true),
('fungicide-copper', 'Copper Fungicide', 'Fungicide', 'Copper-based fungicide for disease control', 'kg', 2.0, 125.00, 'Generic', '50% Copper Oxychloride', 'shield', true);

-- =====================================================
-- RESOURCES (Labor, Equipment, etc.)
-- =====================================================

INSERT INTO resources (resource_id, name, category, description, unit, cost_per_hour, cost_per_unit, skill_level, overtime_multiplier, icon, active) VALUES
('labor-general', 'General Labor', 'Labor', 'General farm workers for various activities', 'hour', 45.00, NULL, 'Basic', 1.5, 'users', true),
('labor-skilled', 'Skilled Labor', 'Labor', 'Skilled workers for specialized tasks', 'hour', 65.00, NULL, 'Skilled', 1.5, 'user-check', true),
('labor-supervisor', 'Supervisor', 'Labor', 'Field supervisors and team leaders', 'hour', 85.00, NULL, 'Expert', 1.5, 'user-cog', true),
('tractor-medium', 'Medium Tractor', 'Equipment', '75-100 HP tractor for field operations', 'hour', 350.00, NULL, 'Operator Required', 1.0, 'tractor', true),
('tractor-heavy', 'Heavy Tractor', 'Equipment', '100+ HP tractor for heavy operations', 'hour', 450.00, NULL, 'Operator Required', 1.0, 'tractor', true),
('harvester-cane', 'Cane Harvester', 'Equipment', 'Specialized sugarcane harvesting machine', 'hour', 850.00, NULL, 'Operator Required', 1.0, 'scissors', true),
('truck-transport', 'Transport Truck', 'Equipment', 'Truck for transporting cane and materials', 'hour', 275.00, NULL, 'Driver Required', 1.0, 'truck', true),
('sprayer-boom', 'Boom Sprayer', 'Equipment', 'Tractor-mounted boom sprayer', 'hour', 125.00, NULL, 'Operator Required', 1.0, 'droplets', true),
('cultivator', 'Cultivator', 'Equipment', 'Soil cultivation and weeding equipment', 'hour', 180.00, NULL, 'Operator Required', 1.0, 'shovel', true),
('irrigation-system', 'Irrigation System', 'Equipment', 'Drip or sprinkler irrigation system', 'hour', 25.00, NULL, 'Basic', 1.0, 'droplets', true);

-- =====================================================
-- SAMPLE COMPANY AND FARM DATA
-- =====================================================

-- Sample company
INSERT INTO companies (id, name, registration_number, address, contact_email, contact_phone, active) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'Mauritius Sugar Estates Ltd', 'C12345678', 'Port Louis, Mauritius', 'info@mse.mu', '+230 123 4567', true);

-- Sample farm
INSERT INTO farms (id, name, description, company_id, total_area_hectares, active) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Belle Vue Estate', 'Main sugar estate in the north', '550e8400-e29b-41d4-a716-446655440000', 450.75, true);

-- =====================================================
-- SAMPLE FIELDS FOR TESTING
-- =====================================================

-- Remove the positive area constraint for testing
ALTER TABLE fields DROP CONSTRAINT IF EXISTS chk_positive_area;

-- Sample test fields with proper SRID 4326 geometry
INSERT INTO fields (field_id, field_name, coordinates, area_hectares, status, osm_id, farm_id) VALUES
('FLD00022', 'Field 22', ST_SetSRID(ST_GeomFromText('POLYGON((57.652557 -20.437995, 57.652613 -20.437931, 57.653302 -20.438374, 57.653312 -20.438430, 57.650887 -20.441820, 57.650671 -20.441689, 57.650561 -20.441772, 57.650404 -20.441767, 57.650022 -20.441545, 57.652557 -20.437995))'), 4326), 0, 'active', 537701039, '550e8400-e29b-41d4-a716-446655440001'),
('FLD00023', 'Field 23', ST_SetSRID(ST_GeomFromText('POLYGON((57.643608 -20.427913, 57.643671 -20.427759, 57.646925 -20.425527, 57.648953 -20.424132, 57.649125 -20.424039, 57.649191 -20.424865, 57.649337 -20.425374, 57.649314 -20.425663, 57.648536 -20.426457, 57.648383 -20.426595, 57.648315 -20.426669, 57.648320 -20.426749, 57.648343 -20.426850, 57.648587 -20.427121, 57.647799 -20.427536, 57.647637 -20.427732, 57.647112 -20.428035, 57.646886 -20.428173, 57.646551 -20.428232, 57.646098 -20.428311, 57.645581 -20.428279, 57.645462 -20.428285, 57.644952 -20.427605, 57.644572 -20.427812, 57.644929 -20.428248, 57.643620 -20.428125, 57.643569 -20.428019, 57.643608 -20.427913))'), 4326), 0, 'active', 537702695, '550e8400-e29b-41d4-a716-446655440001');
