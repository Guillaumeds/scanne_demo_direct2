-- =====================================================
-- COMPLETE FRONTEND DATA MIGRATION
-- =====================================================
-- This script migrates ALL data from frontend arrays to database tables
-- Includes all sugarcane varieties, intercrop varieties, and configuration data

-- =====================================================
-- 1. CLEAR EXISTING DATA
-- =====================================================

DELETE FROM sugarcane_varieties;
DELETE FROM intercrop_varieties;
DELETE FROM activity_categories;
DELETE FROM observation_categories;
DELETE FROM attachment_categories;
DELETE FROM products;
DELETE FROM resources;

-- =====================================================
-- 2. SUGARCANE VARIETIES (Complete from frontend)
-- =====================================================

INSERT INTO sugarcane_varieties (variety_id, name, category, harvest_start_month, harvest_end_month, seasons, soil_types, sugar_content_percent, characteristics, description, icon, information_leaflet_url, active) VALUES
('m-1176-77', 'M 1176/77', 'Medium Maturing', 'Aug', 'Sep', ARRAY['Aug', 'Sep'], ARRAY['L1', 'L2', 'P1', 'P2', 'P3'], 14.2, '{"disease_resistance": "High", "drought_tolerance": "Medium", "yield_potential": "High"}', 'High-yielding variety suitable for light soils with good disease resistance', 'sprout', null, true),
('m-52-78', 'M 52/78', 'Early Maturing', 'Jun', 'Aug', ARRAY['Jun', 'Jul', 'Aug'], ARRAY['B1', 'B2', 'F1', 'F2', 'H1', 'H2', 'L2'], 13.8, '{"disease_resistance": "Medium", "drought_tolerance": "High", "yield_potential": "Medium"}', 'Early maturing variety with excellent drought tolerance', 'sprout', null, true),
('m-387-85', 'M 387/85', 'Medium Maturing', 'Jul', 'Oct', ARRAY['Jul', 'Aug', 'Sep', 'Oct'], ARRAY['B1', 'B2'], 14.0, '{"disease_resistance": "Medium", "drought_tolerance": "Medium", "yield_potential": "High"}', 'Reliable medium-maturing variety with consistent performance', 'sprout', null, true),
('m-1400-86', 'M 1400/86', 'Medium Maturing', 'Aug', 'Sep', ARRAY['Aug', 'Sep'], ARRAY['B1', 'B2', 'F1', 'F2', 'H1', 'H2', 'L1', 'L2', 'P1', 'P2', 'P3'], 14.3, '{"disease_resistance": "Medium", "drought_tolerance": "Medium", "yield_potential": "High"}', 'Medium-maturing variety suitable for various soil types', 'sprout', null, true),
('m-2256-88', 'M 2256/88', 'Medium Maturing', 'Jun', 'Sep', ARRAY['Jun', 'Jul', 'Aug', 'Sep'], ARRAY['B1', 'B2', 'F1', 'F2', 'H1', 'H2', 'L1', 'L2', 'P1', 'P2', 'P3'], 14.1, '{"disease_resistance": "High", "drought_tolerance": "Medium", "yield_potential": "High"}', 'Versatile variety suitable for all soil types', 'sprout', null, true),
('m-703-89', 'M 703/89', 'Early Maturing', 'Jun', 'Jul', ARRAY['Jun', 'Jul'], ARRAY['H1', 'H2', 'L1', 'L2'], 13.9, '{"disease_resistance": "Medium", "drought_tolerance": "High", "yield_potential": "Medium"}', 'Early variety suitable for heavy and light soils', 'sprout', null, true),
('m-1861-89', 'M 1861/89', 'Late Maturing', 'Aug', 'Nov', ARRAY['Aug', 'Sep', 'Oct', 'Nov'], ARRAY['B1', 'B2', 'F1', 'F2', 'H1', 'H2'], 14.7, '{"disease_resistance": "High", "drought_tolerance": "Low", "yield_potential": "Very High"}', 'Late maturing variety with very high yield potential', 'sprout', null, true),
('m-1672-90', 'M 1672/90', 'Late Maturing', 'Aug', 'Nov', ARRAY['Aug', 'Sep', 'Oct', 'Nov'], ARRAY['L1', 'L2', 'P1', 'P2', 'P3'], 14.6, '{"disease_resistance": "Medium", "drought_tolerance": "Medium", "yield_potential": "High"}', 'Late variety suitable for light and poor soils', 'sprout', null, true),
('m-2593-92', 'M 2593/92', 'Late Maturing', 'Aug', 'Nov', ARRAY['Aug', 'Sep', 'Oct', 'Nov'], ARRAY['H1', 'H2', 'L1', 'L2', 'P1', 'P2', 'P3'], 15.1, '{"disease_resistance": "Medium", "drought_tolerance": "Low", "yield_potential": "Very High"}', 'Late maturing variety with very high yield potential', 'sprout', '/sugarcane_varieties_leaflets/m2593.pdf', true),
('m-2283-98', 'M 2283/98', 'Late Maturing', 'Aug', 'Nov', ARRAY['Aug', 'Sep', 'Oct', 'Nov'], ARRAY['B1', 'B2', 'F1', 'F2'], 14.8, '{"disease_resistance": "High", "drought_tolerance": "Medium", "yield_potential": "High"}', 'Late variety with excellent disease resistance', 'sprout', 'http://www.msiri.mu/UserFiles/File/sugarcane%20pamphlets/M%2283-98.pdf', true),
('m-683-99', 'M 683/99', 'Late Maturing', 'Aug', 'Nov', ARRAY['Aug', 'Sep', 'Oct', 'Nov'], ARRAY['L1', 'L2', 'P1', 'P2', 'P3'], 14.5, '{"disease_resistance": "High", "drought_tolerance": "Medium", "yield_potential": "High"}', 'Late variety suitable for light and poor soils', 'sprout', 'http://www.msiri.mu/UserFiles/File/sugarcane%20pamphlets/M%20683-99.pdf', true),
('m-1989-99', 'M 1989/99', 'Medium Maturing', 'Aug', 'Oct', ARRAY['Aug', 'Sep', 'Oct'], ARRAY['L1', 'L2', 'P1', 'P2', 'P3'], 14.4, '{"disease_resistance": "Medium", "drought_tolerance": "Medium", "yield_potential": "High"}', 'Medium variety suitable for light and poor soils', 'sprout', 'http://www.msiri.mu/UserFiles/File/sugarcane%20pamphlets/M%201989-99.pdf', true),
('m-2502-99', 'M 2502/99', 'Medium Maturing', 'Aug', 'Oct', ARRAY['Aug', 'Sep', 'Oct'], ARRAY['B1', 'B2', 'F1', 'F2', 'P1', 'P2', 'P3'], 14.3, '{"disease_resistance": "High", "drought_tolerance": "Medium", "yield_potential": "High"}', 'Medium variety with good adaptability', 'sprout', 'http://www.msiri.mu/UserFiles/File/sugarcane%20pamphlets/M%202502-99.pdf', true),
('m-1392-00', 'M 1392/00', 'Medium Maturing', 'Jul', 'Oct', ARRAY['Jul', 'Aug', 'Sep', 'Oct'], ARRAY['B1', 'B2', 'F1', 'F2', 'L1', 'L2', 'P1', 'P2', 'P3'], 14.2, '{"disease_resistance": "High", "drought_tolerance": "Medium", "yield_potential": "High"}', 'Versatile medium variety for all soil types', 'sprout', 'http://www.msiri.mu/UserFiles/File/sugarcane%20pamphlets/M%201392-00.pdf', true),
('m-63', 'M 63', 'Medium Maturing', 'Aug', 'Oct', ARRAY['Aug', 'Sep', 'Oct'], ARRAY['L1', 'L2', 'P1', 'P2', 'P3'], 14.0, '{"disease_resistance": "Medium", "drought_tolerance": "Medium", "yield_potential": "Medium"}', 'Traditional variety for light soils', 'sprout', null, true),
('m-1561-01', 'M 1561/01', 'Medium Maturing', 'Jun', 'Oct', ARRAY['Jun', 'Jul', 'Aug', 'Sep', 'Oct'], ARRAY['B1', 'B2'], 14.1, '{"disease_resistance": "Medium", "drought_tolerance": "High", "yield_potential": "Medium"}', 'Drought-tolerant variety for heavy soils', 'sprout', null, true),
('m-216-02', 'M 216/02', 'Medium Maturing', 'Jun', 'Oct', ARRAY['Jun', 'Jul', 'Aug', 'Sep', 'Oct'], ARRAY['L1', 'L2', 'P1', 'P2', 'P3'], 14.0, '{"disease_resistance": "Medium", "drought_tolerance": "Medium", "yield_potential": "Medium"}', 'Medium variety for light and poor soils', 'sprout', null, true),
('m-1002-02', 'M 1002/02', 'Late Maturing', 'Aug', 'Nov', ARRAY['Aug', 'Sep', 'Oct', 'Nov'], ARRAY['L1', 'L2', 'P1', 'P2', 'P3'], 14.6, '{"disease_resistance": "High", "drought_tolerance": "Medium", "yield_potential": "High"}', 'Late variety with good disease resistance', 'sprout', 'http://www.msiri.mu/UserFiles/File/sugarcane%20pamphlets/M%201002-02.pdf', true),
('m-1698-02', 'M 1698/02', 'Late Maturing', 'Aug', 'Nov', ARRAY['Aug', 'Sep', 'Oct', 'Nov'], ARRAY['L1', 'L2', 'P1', 'P2', 'P3'], 14.5, '{"disease_resistance": "Medium", "drought_tolerance": "Medium", "yield_potential": "High"}', 'Late variety for light and poor soils', 'sprout', null, true),
('m-64', 'M 64', 'Late Maturing', 'Aug', 'Nov', ARRAY['Aug', 'Sep', 'Oct', 'Nov'], ARRAY['B1', 'B2', 'F1', 'F2'], 14.7, '{"disease_resistance": "High", "drought_tolerance": "Medium", "yield_potential": "High"}', 'Late variety for heavy soils', 'sprout', null, true),
('m-1256-04', 'M 1256/04', 'Medium Maturing', 'Aug', 'Oct', ARRAY['Aug', 'Sep', 'Oct'], ARRAY['L1', 'L2', 'P1', 'P2', 'P3'], 14.3, '{"disease_resistance": "High", "drought_tolerance": "Medium", "yield_potential": "High"}', 'Medium variety with high disease resistance', 'sprout', 'http://www.msiri.mu/UserFiles/File/sugarcane%20pamphlets/M%201256-04.pdf', true),
('m-915-05', 'M 915/05', 'Late Maturing', 'Aug', 'Nov', ARRAY['Aug', 'Sep', 'Oct', 'Nov'], ARRAY['B1', 'B2', 'F1', 'F2', 'H1', 'H2', 'L1', 'L2', 'P1', 'P2', 'P3'], 14.8, '{"disease_resistance": "High", "drought_tolerance": "Medium", "yield_potential": "Very High"}', 'Versatile late variety for all soil types', 'sprout', 'http://www.msiri.mu/UserFiles/File/sugarcane%20pamphlets/M%20915-05.pdf', true),
('m-65', 'M 65', 'Medium Maturing', 'Aug', 'Oct', ARRAY['Aug', 'Sep', 'Oct'], ARRAY['B1', 'B2', 'P1', 'P2', 'P3'], 14.2, '{"disease_resistance": "Medium", "drought_tolerance": "Medium", "yield_potential": "Medium"}', 'Traditional medium variety', 'sprout', null, true),
('r573', 'R573', 'Early Maturing', 'Jul', 'Sep', ARRAY['Jul', 'Aug', 'Sep'], ARRAY['H1', 'H2', 'L1', 'L2', 'P1', 'P2', 'P3'], 13.7, '{"disease_resistance": "High", "drought_tolerance": "High", "yield_potential": "Medium"}', 'Early Reunion variety with good adaptability', 'sprout', null, true),
('r575', 'R575', 'Early Maturing', 'Jun', 'Aug', ARRAY['Jun', 'Jul', 'Aug'], ARRAY['H1', 'H2', 'L1', 'L2', 'P1', 'P2', 'P3'], 13.6, '{"disease_resistance": "High", "drought_tolerance": "High", "yield_potential": "Medium"}', 'Very early Reunion variety', 'sprout', 'https://www.ercane.re/nos-varietes/r-575/', true),
('r579', 'R579', 'Late Maturing', 'Oct', 'Dec', ARRAY['Oct', 'Nov', 'Dec'], ARRAY['H1', 'H2', 'L2', 'P1', 'P2', 'P3'], 14.5, '{"disease_resistance": "High", "drought_tolerance": "Medium", "yield_potential": "High"}', 'Late Reunion variety with high sugar content', 'sprout', 'https://www.ercane.re/nos-varietes/r-579/', true),
('m-3035-66', 'M 3035/66', 'Late Maturing', 'Aug', 'Dec', ARRAY['Aug', 'Sep', 'Oct', 'Nov', 'Dec'], ARRAY['B1', 'B2', 'F1', 'F2', 'H1', 'H2'], 14.9, '{"disease_resistance": "Medium", "drought_tolerance": "Low", "yield_potential": "Very High"}', 'Very late variety with exceptional yield', 'sprout', null, true),
('m-1246-84', 'M 1246/84', 'Medium Maturing', 'Aug', 'Sep', ARRAY['Aug', 'Sep'], ARRAY['H1', 'H2', 'L1', 'L2', 'P1', 'P2', 'P3'], 14.1, '{"disease_resistance": "Medium", "drought_tolerance": "Medium", "yield_potential": "Medium"}', 'Medium variety with good adaptability', 'sprout', null, true),
('m-1394-86', 'M 1394/86', 'Late Maturing', 'Aug', 'Nov', ARRAY['Aug', 'Sep', 'Oct', 'Nov'], ARRAY['B1', 'B2', 'F1', 'F2', 'H1', 'H2'], 14.6, '{"disease_resistance": "High", "drought_tolerance": "Medium", "yield_potential": "High"}', 'Late variety for heavy soils', 'sprout', null, true),
('m-2024-88', 'M 2024/88', 'Early Maturing', 'Jun', 'Aug', ARRAY['Jun', 'Jul', 'Aug'], ARRAY['L1', 'L2', 'P1', 'P2', 'P3'], 13.8, '{"disease_resistance": "Medium", "drought_tolerance": "High", "yield_potential": "Medium"}', 'Early variety for light soils', 'sprout', null, true),
('m-2238-89', 'M 2238/89', 'Late Maturing', 'Aug', 'Nov', ARRAY['Aug', 'Sep', 'Oct', 'Nov'], ARRAY['B1', 'B2'], 14.7, '{"disease_resistance": "High", "drought_tolerance": "Medium", "yield_potential": "High"}', 'Late variety for heavy soils', 'sprout', null, true),
('r570', 'R570', 'Late Maturing', 'Sep', 'Dec', ARRAY['Sep', 'Oct', 'Nov', 'Dec'], ARRAY['H1', 'H2', 'L1', 'L2', 'P1', 'P2', 'P3'], 14.4, '{"disease_resistance": "High", "drought_tolerance": "Medium", "yield_potential": "High"}', 'Late Reunion variety with good sugar content', 'sprout', 'https://www.ercane.re/nos-varietes/r-570/', true),
('r585', 'R585', 'Late Maturing', 'Aug', 'Nov', ARRAY['Aug', 'Sep', 'Oct', 'Nov'], ARRAY['H1', 'H2', 'L1', 'L2', 'P1', 'P2', 'P3'], 14.3, '{"disease_resistance": "High", "drought_tolerance": "High", "yield_potential": "Medium"}', 'Drought-resistant late Reunion variety', 'sprout', 'https://www.ercane.re/nos-varietes/r-585/', true);

-- =====================================================
-- 3. INTERCROP VARIETIES (Complete from frontend)
-- =====================================================

INSERT INTO intercrop_varieties (variety_id, name, scientific_name, benefits, planting_time, harvest_time, description, icon, image_url, active) VALUES
('none', 'None', '', ARRAY['No intercrop selected', 'Monoculture sugarcane'], '', '', 'No intercrop companion plant selected', 'x', null, true),
('cowpea', 'Cowpea', 'Vigna unguiculata', ARRAY['Nitrogen fixation', 'Soil improvement', 'Additional income', 'Ground cover'], 'Early rainy season', '60-90 days', 'Fast-growing legume that fixes nitrogen and provides ground cover', 'leaf', 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Vigna_unguiculata_Blanco2.286-cropped.jpg/300px-Vigna_unguiculata_Blanco2.286-cropped.jpg', true),
('soybean', 'Soybean', 'Glycine max', ARRAY['High nitrogen fixation', 'Protein-rich crop', 'Market value', 'Soil structure improvement'], 'Beginning of rainy season', '90-120 days', 'High-value legume crop with excellent nitrogen fixation capacity', 'circle', 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fc/Soybeanvarieties.jpg/300px-Soybeanvarieties.jpg', true),
('groundnut', 'Groundnut (Peanut)', 'Arachis hypogaea', ARRAY['Nitrogen fixation', 'High economic value', 'Oil production', 'Soil aeration'], 'Start of rainy season', '90-120 days', 'Valuable cash crop that improves soil fertility through nitrogen fixation', 'circle', 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Groundnut_%28Arachis_hypogaea%29.jpg/300px-Groundnut_%28Arachis_hypogaea%29.jpg', true),
('blackgram', 'Black Gram', 'Vigna mungo', ARRAY['Nitrogen fixation', 'Short duration', 'Drought tolerance', 'Soil enrichment'], 'Post-monsoon', '60-90 days', 'Short-duration pulse crop suitable for intercropping', 'leaf', 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Vigna_unguiculata_Blanco2.286-cropped.jpg/300px-Vigna_unguiculata_Blanco2.286-cropped.jpg', true),
('greengram', 'Green Gram (Mung Bean)', 'Vigna radiata', ARRAY['Quick nitrogen fixation', 'Fast growing', 'Multiple harvests', 'Market demand'], 'Multiple seasons', '60-75 days', 'Fast-growing legume with high market value and quick returns', 'circle', 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Vigna_unguiculata_Blanco2.286-cropped.jpg/300px-Vigna_unguiculata_Blanco2.286-cropped.jpg', true),
('pigeonpea', 'Pigeon Pea', 'Cajanus cajan', ARRAY['Long-term nitrogen fixation', 'Deep root system', 'Windbreak', 'Perennial benefits'], 'Beginning of rainy season', '150-180 days', 'Long-duration legume that provides sustained soil improvement', 'leaf', 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Vigna_unguiculata_Blanco2.286-cropped.jpg/300px-Vigna_unguiculata_Blanco2.286-cropped.jpg', true),
('chickpea', 'Chickpea', 'Cicer arietinum', ARRAY['Nitrogen fixation', 'Drought tolerance', 'High protein', 'Cool season crop'], 'Post-monsoon/Winter', '90-120 days', 'Cool season legume suitable for winter intercropping', 'circle', 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Vigna_unguiculata_Blanco2.286-cropped.jpg/300px-Vigna_unguiculata_Blanco2.286-cropped.jpg', true),
('fieldpea', 'Field Pea', 'Pisum arvense', ARRAY['Nitrogen fixation', 'Cool season adaptation', 'Fodder value', 'Soil improvement'], 'Winter season', '90-110 days', 'Cool season legume that provides both grain and fodder', 'leaf', 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Vigna_unguiculata_Blanco2.286-cropped.jpg/300px-Vigna_unguiculata_Blanco2.286-cropped.jpg', true);

-- =====================================================
-- 4. ACTIVITY CATEGORIES (Complete from frontend)
-- =====================================================

INSERT INTO activity_categories (category_id, name, description, icon, color, active) VALUES
('land-preparation', 'Land Preparation', 'Soil preparation and field setup activities', 'tractor', '#8B5CF6', true),
('planting', 'Planting', 'Seed/cutting planting activities', 'sprout', '#10B981', true),
('establishment', 'Establishment', 'Initial growth and establishment care', 'leaf', '#22C55E', true),
('fertilization', 'Fertilization', 'Fertilizer application activities', 'droplets', '#F59E0B', true),
('pest-control', 'Pest Control', 'Pesticide and herbicide applications', 'shield', '#EF4444', true),
('irrigation', 'Irrigation', 'Water management and irrigation', 'droplets', '#3B82F6', true),
('cultivation', 'Cultivation', 'Weeding and cultivation activities', 'shovel', '#6B7280', true),
('maintenance', 'Maintenance', 'Equipment and infrastructure maintenance', 'wrench', '#8B5CF6', true),
('monitoring', 'Monitoring', 'Field monitoring and inspection activities', 'eye', '#06B6D4', true),
('harvesting', 'Harvesting', 'Crop harvesting activities', 'scissors', '#F97316', true),
('post-harvest', 'Post-Harvest', 'Field cleanup and preparation for next cycle', 'broom', '#64748B', true),
('transport', 'Transport', 'Transportation and logistics activities', 'truck', '#64748B', true);

-- =====================================================
-- 5. OBSERVATION CATEGORIES (Complete from frontend)
-- =====================================================

INSERT INTO observation_categories (category_id, name, description, icon, color, active) VALUES
('soil', 'Soil Observations', 'Soil texture, pH, nutrients, and physical properties', 'mountain', '#8B4513', true),
('water', 'Water Observations', 'Irrigation water quality and availability', 'droplets', '#3B82F6', true),
('plant', 'Plant Health', 'Plant health and growth observations', 'leaf', '#22C55E', true),
('pest', 'Pest & Disease', 'Pest and disease observations', 'bug', '#EF4444', true),
('weather', 'Weather', 'Weather and climate observations', 'cloud', '#6B7280', true),
('yield', 'Yield', 'Harvest yield and quality observations', 'bar-chart', '#F59E0B', true),
('equipment', 'Equipment', 'Equipment performance observations', 'cog', '#8B5CF6', true),
('general', 'General', 'General field observations', 'eye', '#64748B', true);

-- =====================================================
-- 6. ATTACHMENT CATEGORIES (Complete from frontend)
-- =====================================================

INSERT INTO attachment_categories (category_id, name, description, icon, color, active) VALUES
('photos', 'Photos', 'Field photos and images', 'camera', '#22C55E', true),
('documents', 'Documents', 'Documents and reports', 'file-text', '#3B82F6', true),
('reports', 'Reports', 'Analysis and summary reports', 'bar-chart', '#F59E0B', true),
('certificates', 'Certificates', 'Certificates and compliance documents', 'award', '#8B5CF6', true),
('maps', 'Maps', 'Field maps and spatial data', 'map', '#06B6D4', true),
('receipts', 'Receipts', 'Purchase receipts and invoices', 'receipt', '#10B981', true),
('contracts', 'Contracts', 'Contracts and agreements', 'file-signature', '#EF4444', true),
('videos', 'Videos', 'Field and process videos', 'video', '#F97316', true),
('other', 'Other', 'Other file types', 'paperclip', '#64748B', true);

-- =====================================================
-- 7. PRODUCTS (Complete from frontend)
-- =====================================================

INSERT INTO products (product_id, name, category, description, unit, recommended_rate_per_ha, cost_per_unit, brand, composition, icon, active) VALUES
-- Compound and NPK Fertilizers
('npk-13-13-20', '13-13-20+2MgO', 'Fertilizer', 'Compound NPK fertilizer with magnesium', 'kg', 250.0, 45.00, 'Generic', '13% N, 13% P2O5, 20% K2O, 2% MgO', 'leaf', true),
('npk-13-8-24', '13:8:24', 'Fertilizer', 'High potassium NPK fertilizer', 'kg', 250.0, 42.00, 'Generic', '13% N, 8% P2O5, 24% K2O', 'leaf', true),
('npk-12-8-20', '12:8:20', 'Fertilizer', 'Balanced NPK fertilizer', 'kg', 250.0, 40.00, 'Generic', '12% N, 8% P2O5, 20% K2O', 'leaf', true),
('npk-12-12-17', '12:12:17', 'Fertilizer', 'Balanced NPK fertilizer', 'kg', 250.0, 38.00, 'Generic', '12% N, 12% P2O5, 17% K2O', 'leaf', true),
('npk-19-19-19', '19:19:19', 'Fertilizer', 'High analysis balanced fertilizer', 'kg', 200.0, 50.00, 'Generic', '19% N, 19% P2O5, 19% K2O', 'leaf', true),
('npk-20-20-20', '20:20:20', 'Fertilizer', 'High analysis balanced fertilizer', 'kg', 200.0, 52.00, 'Generic', '20% N, 20% P2O5, 20% K2O', 'leaf', true),
('npk-8-10-40', '8:10:40', 'Fertilizer', 'High potassium fertilizer', 'kg', 300.0, 48.00, 'Generic', '8% N, 10% P2O5, 40% K2O', 'leaf', true),
('npk-11-8-6', '11-8-6 (Co-Vert)', 'Fertilizer', 'Controlled release fertilizer', 'kg', 300.0, 35.00, 'Co-Vert', '11% N, 8% P2O5, 6% K2O', 'leaf', true),
('npk-nitrate-blends', 'Nitrate Based NPK Blends', 'Fertilizer', 'Fast-acting nitrate fertilizer', 'kg', 250.0, 55.00, 'Generic', 'Nitrate based NPK', 'leaf', true),
('azophoska', 'Azophoska (13-13-20+2 micro)', 'Fertilizer', 'NPK with micronutrients', 'kg', 250.0, 48.00, 'Azophoska', '13% N, 13% P2O5, 20% K2O, 2% micro', 'leaf', true),
('bluefficient', 'Bluefficient Fertilizer (10-10-20+2MgO+micro)', 'Fertilizer', 'Premium NPK with micronutrients', 'kg', 250.0, 50.00, 'Bluefficient', '10% N, 10% P2O5, 20% K2O, 2% MgO, micro', 'leaf', true),
('fairway-master', 'Fairway Master', 'Fertilizer', 'Professional turf fertilizer', 'kg', 200.0, 60.00, 'Fairway', 'Professional grade NPK', 'leaf', true),
('icl-sierrablen', 'ICL Sierrablen Plus Granular Fertiliser', 'Fertilizer', 'Controlled release granular fertilizer', 'kg', 200.0, 65.00, 'ICL', 'Controlled release NPK', 'leaf', true),

-- Nitrogen Fertilizers
('ammonium-sulphate-crystal', 'Ammonium Sulphate 21% (Crystal)', 'Fertilizer', 'Crystalline nitrogen fertilizer with sulfur', 'kg', 150.0, 25.00, 'Generic', '21% N, 24% S', 'leaf', true),
('ammonium-sulphate-granular', 'Ammonium Sulphate 21% (Granular)', 'Fertilizer', 'Granular nitrogen fertilizer with sulfur', 'kg', 150.0, 27.00, 'Generic', '21% N, 24% S', 'leaf', true),
('urea-46', 'Urea (46% N, Granular)', 'Fertilizer', 'High nitrogen content fertilizer', 'kg', 130.0, 30.00, 'Generic', '46% N', 'leaf', true),
('nano-urea-plus', 'NANO Urea Plus (Kalol)', 'Fertilizer', 'Nano-technology nitrogen fertilizer', 'L', 2.0, 120.00, 'Kalol', 'Nano urea formulation', 'leaf', true),
('nano-dap', 'NANO DAP', 'Fertilizer', 'Nano-technology phosphorus fertilizer', 'L', 2.0, 125.00, 'Generic', 'Nano DAP formulation', 'leaf', true),

-- Phosphorus and Potassium Fertilizers
('map', 'Monoammonium Phosphate (MAP)', 'Fertilizer', 'High phosphorus starter fertilizer', 'kg', 100.0, 55.00, 'Generic', '11% N, 52% P2O5', 'leaf', true),
('mkp', 'Mono Potassium Phosphate (MKP, 0-52-34)', 'Fertilizer', 'High analysis PK fertilizer', 'kg', 50.0, 85.00, 'Generic', '52% P2O5, 34% K2O', 'leaf', true),
('potassium-nitrate', 'Potassium Nitrate', 'Fertilizer', 'Soluble NK fertilizer', 'kg', 75.0, 90.00, 'Generic', '13% N, 46% K2O', 'leaf', true),
('potassium-sulphate', 'Potassium Sulphate (SOP, 0-0-50+46SO3)', 'Fertilizer', 'Sulfate of potash fertilizer', 'kg', 100.0, 80.00, 'Generic', '50% K2O, 46% SO3', 'leaf', true),

-- Calcium and Magnesium Fertilizers
('nova-calcium-nitrate', 'Nova Calcium Nitrate (15.5-0-0+26.5CaO)', 'Fertilizer', 'Calcium and nitrogen fertilizer', 'kg', 100.0, 45.00, 'Nova', '15.5% N, 26.5% CaO', 'leaf', true),
('nova-mag-s', 'Nova Mag-S (Magnesium Sulphate, 0-0-0+16MgO+32SO3)', 'Fertilizer', 'Magnesium and sulfur fertilizer', 'kg', 50.0, 40.00, 'Nova', '16% MgO, 32% SO3', 'leaf', true),

-- Micronutrient and Specialty Fertilizers
('micro-kanieltra', 'Micro elements (Kanieltra)', 'Fertilizer', 'Complete micronutrient blend', 'kg', 5.0, 150.00, 'Kanieltra', 'Complete micronutrients', 'leaf', true),
('unikey-11-40-10', 'Unikey Nano Professional 11-40-10+2.5MgO+TE', 'Fertilizer', 'High phosphorus nano fertilizer', 'kg', 2.0, 180.00, 'Unikey', '11% N, 40% P2O5, 10% K2O, 2.5% MgO, TE', 'leaf', true),
('unikey-15-5-40', 'Unikey Nano Professional 15-5-40+TE', 'Fertilizer', 'High potassium nano fertilizer', 'kg', 2.0, 175.00, 'Unikey', '15% N, 5% P2O5, 40% K2O, TE', 'leaf', true),
('unikey-20-20-20', 'Unikey Nano Professional 20-20-20+2MgO+TE', 'Fertilizer', 'Balanced nano fertilizer', 'kg', 2.0, 185.00, 'Unikey', '20% N, 20% P2O5, 20% K2O, 2% MgO, TE', 'leaf', true),
('hydro-pack-1', 'Hydro Pack No. 1', 'Fertilizer', 'Hydroponic fertilizer pack 1', 'kg', 1.0, 200.00, 'Generic', 'Hydroponic formulation', 'leaf', true),
('hydro-pack-2', 'Hydro Pack No. 2', 'Fertilizer', 'Hydroponic fertilizer pack 2', 'kg', 1.0, 200.00, 'Generic', 'Hydroponic formulation', 'leaf', true),
('hydro-pack-3', 'Hydro Pack No. 3', 'Fertilizer', 'Hydroponic fertilizer pack 3', 'kg', 1.0, 200.00, 'Generic', 'Hydroponic formulation', 'leaf', true),

-- Organic and Bio Fertilizers
('organic-all-purpose', 'All-purpose Organic Fertiliser', 'Fertilizer', 'General purpose organic fertilizer', 'kg', 500.0, 20.00, 'Local', 'Organic matter, NPK varies', 'leaf', true),
('bat-guano', 'Bat Guano Fertilizer', 'Fertilizer', 'Natural bat guano fertilizer', 'kg', 200.0, 35.00, 'Local', 'Natural bat guano', 'leaf', true),
('seabird-guano', 'Seabird Guano', 'Fertilizer', 'Natural seabird guano fertilizer', 'kg', 200.0, 40.00, 'Local', 'Natural seabird guano', 'leaf', true),
('seaweed-powder', 'Fresh Seaweed and Sargassum (Powder)', 'Fertilizer', 'Seaweed powder fertilizer', 'kg', 100.0, 25.00, 'Local', 'Seaweed extract powder', 'leaf', true),
('seaweed-liquid', 'Fresh Seaweed and Sargassum (Liquid)', 'Fertilizer', 'Liquid seaweed fertilizer', 'L', 10.0, 30.00, 'Local', 'Liquid seaweed extract', 'leaf', true),
('organic-mineral-liquid', 'Organic Mineral Liquid Fertilizers (Made in Moris)', 'Fertilizer', 'Local organic liquid fertilizer', 'L', 5.0, 45.00, 'Made in Moris', 'Organic mineral blend', 'leaf', true),

-- Other Fertilizer Products
('phostrogen', 'Phostrogen (800g)', 'Fertilizer', 'All-purpose plant food', 'pack', 1.0, 85.00, 'Phostrogen', 'Complete plant food', 'leaf', true),
('agroleaf-power', 'Agroleaf Power', 'Fertilizer', 'Foliar fertilizer', 'kg', 2.0, 120.00, 'Agroleaf', 'Foliar application fertilizer', 'leaf', true),
('agroleaf-power-high-p', 'Agroleaf Power High P', 'Fertilizer', 'High phosphorus foliar fertilizer', 'kg', 2.0, 125.00, 'Agroleaf', 'High P foliar fertilizer', 'leaf', true),
('agroblen', 'Agroblen', 'Fertilizer', 'Controlled release fertilizer', 'kg', 100.0, 95.00, 'Agroblen', 'Controlled release NPK', 'leaf', true);

-- =====================================================
-- 8. RESOURCES (Complete from frontend)
-- =====================================================

INSERT INTO resources (resource_id, name, category, description, unit, cost_per_hour, cost_per_unit, skill_level, overtime_multiplier, icon, active) VALUES
-- Fleet & Vehicles
('tractor-small', 'Small Tractor (40-60 HP)', 'Equipment', 'Small horsepower farm tractor', 'hours', 450.00, 0, 'Intermediate', 1.0, 'truck', true),
('tractor-medium', 'Medium Tractor (60-90 HP)', 'Equipment', 'Medium horsepower farm tractor', 'hours', 650.00, 0, 'Intermediate', 1.0, 'truck', true),
('tractor-large', 'Large Tractor (90+ HP)', 'Equipment', 'Large horsepower farm tractor', 'hours', 850.00, 0, 'Advanced', 1.0, 'truck', true),
('pickup-truck', 'Pickup Truck', 'Transport', 'Light transport vehicle', 'hours', 200.00, 0, 'Basic', 1.0, 'truck', true),
('utility-vehicle', 'Utility Vehicle (ATV/UTV)', 'Transport', 'All-terrain utility vehicle', 'hours', 150.00, 0, 'Basic', 1.0, 'truck', true),

-- Labour & Personnel
('field-worker', 'Field Worker', 'Labor', 'General farm laborer', 'hours', 25.00, 0, 'Basic', 1.5, 'user', true),
('skilled-worker', 'Skilled Agricultural Worker', 'Labor', 'Experienced farm worker', 'hours', 35.00, 0, 'Intermediate', 1.5, 'user-check', true),
('machine-operator', 'Machine Operator', 'Labor', 'Certified machinery operator', 'hours', 45.00, 0, 'Advanced', 1.5, 'settings', true),
('supervisor', 'Field Supervisor', 'Labor', 'Field supervisor and team leader', 'hours', 60.00, 0, 'Advanced', 1.5, 'user-cog', true),
('overtime-worker', 'Field Worker (Overtime)', 'Labor', 'General laborer overtime rate', 'hours', 37.50, 0, 'Basic', 1.5, 'user', true),
('overtime-skilled', 'Skilled Worker (Overtime)', 'Labor', 'Skilled worker overtime rate', 'hours', 52.50, 0, 'Intermediate', 1.5, 'user-check', true),
('seasonal-worker', 'Seasonal Harvest Worker', 'Labor', 'Temporary seasonal worker', 'hours', 30.00, 0, 'Basic', 1.0, 'user', true),

-- Equipment & Tools
('plow', 'Moldboard Plow', 'Equipment', 'Primary tillage implement', 'hours', 50.00, 0, 'Basic', 1.0, 'shovel', true),
('disc-harrow', 'Disc Harrow', 'Equipment', 'Secondary tillage implement', 'hours', 40.00, 0, 'Basic', 1.0, 'shovel', true),
('cultivator', 'Field Cultivator', 'Equipment', 'Soil cultivation implement', 'hours', 45.00, 0, 'Basic', 1.0, 'shovel', true),
('planter', 'Sugarcane Planter', 'Equipment', 'Specialized sugarcane planting equipment', 'hours', 80.00, 0, 'Intermediate', 1.0, 'sprout', true),
('fertilizer-spreader', 'Fertilizer Spreader', 'Equipment', 'Fertilizer application equipment', 'hours', 35.00, 0, 'Basic', 1.0, 'droplets', true),
('sprayer', 'Field Sprayer', 'Equipment', 'Pesticide and herbicide sprayer', 'hours', 60.00, 0, 'Intermediate', 1.0, 'droplets', true),
('mower', 'Rotary Mower', 'Equipment', 'Grass and weed cutting equipment', 'hours', 40.00, 0, 'Basic', 1.0, 'scissors', true),

-- Heavy Machinery
('bulldozer', 'Bulldozer', 'Equipment', 'Heavy earth-moving equipment', 'hours', 1200.00, 0, 'Advanced', 1.0, 'truck', true),
('excavator', 'Excavator', 'Equipment', 'Digging and excavation equipment', 'hours', 800.00, 0, 'Advanced', 1.0, 'truck', true),
('grader', 'Motor Grader', 'Equipment', 'Road and field grading equipment', 'hours', 600.00, 0, 'Advanced', 1.0, 'truck', true),
('compactor', 'Soil Compactor', 'Equipment', 'Soil compaction equipment', 'hours', 400.00, 0, 'Intermediate', 1.0, 'truck', true),

-- Transport & Logistics
('truck-small', 'Small Transport Truck (3-5 tons)', 'Transport', 'Light cargo transport', 'hours', 300.00, 0, 'Intermediate', 1.0, 'truck', true),
('truck-large', 'Large Transport Truck (10+ tons)', 'Transport', 'Heavy cargo transport', 'hours', 500.00, 0, 'Intermediate', 1.0, 'truck', true),
('trailer', 'Agricultural Trailer', 'Transport', 'General purpose farm trailer', 'hours', 100.00, 0, 'Basic', 1.0, 'truck', true),
('cane-trailer', 'Sugarcane Transport Trailer', 'Transport', 'Specialized sugarcane trailer', 'hours', 150.00, 0, 'Basic', 1.0, 'truck', true),

-- Irrigation Systems
('drip-system', 'Drip Irrigation System', 'Irrigation', 'Water-efficient drip irrigation', 'hours', 25.00, 0, 'Intermediate', 1.0, 'droplets', true),
('sprinkler-system', 'Sprinkler Irrigation System', 'Irrigation', 'Overhead sprinkler irrigation', 'hours', 35.00, 0, 'Intermediate', 1.0, 'droplets', true),
('pump-electric', 'Electric Water Pump', 'Irrigation', 'Electric-powered water pump', 'hours', 15.00, 0, 'Basic', 1.0, 'droplets', true),
('pump-diesel', 'Diesel Water Pump', 'Irrigation', 'Diesel-powered water pump', 'hours', 25.00, 0, 'Basic', 1.0, 'droplets', true),

-- Harvesting Equipment
('cane-harvester', 'Sugarcane Harvester', 'Equipment', 'Mechanical sugarcane harvester', 'hours', 1500.00, 0, 'Advanced', 1.0, 'scissors', true),
('cane-loader', 'Sugarcane Loader', 'Equipment', 'Sugarcane loading equipment', 'hours', 400.00, 0, 'Intermediate', 1.0, 'truck', true),
('cutting-tools', 'Manual Cutting Tools', 'Tools', 'Hand tools for manual cutting', 'hours', 10.00, 0, 'Basic', 1.0, 'scissors', true),

-- Processing Equipment
('weighbridge', 'Weighbridge Scale', 'Equipment', 'Vehicle weighing scale', 'hours', 50.00, 0, 'Basic', 1.0, 'scale', true),
('cleaning-station', 'Cane Cleaning Station', 'Equipment', 'Sugarcane cleaning equipment', 'hours', 75.00, 0, 'Intermediate', 1.0, 'droplets', true);

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

SELECT 'Complete frontend data migration completed successfully!' as status;
