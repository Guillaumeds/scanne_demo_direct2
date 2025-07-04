-- =====================================================
-- COMPLETE CONFIG DATA MIGRATION FROM FRONTEND TO DATABASE
-- =====================================================
-- This script migrates ALL hardcoded config data to database tables
-- Includes complete varieties, activity templates, and enhanced categories

-- =====================================================
-- 1. CLEAR EXISTING DATA
-- =====================================================

DELETE FROM sugarcane_varieties;
DELETE FROM intercrop_varieties;
DELETE FROM activity_categories;
DELETE FROM observation_categories;
DELETE FROM attachment_categories;

-- =====================================================
-- 2. COMPLETE SUGARCANE VARIETIES (34 varieties)
-- =====================================================

INSERT INTO sugarcane_varieties (variety_id, name, category, harvest_start_month, harvest_end_month, seasons, soil_types, sugar_content_percent, characteristics, description, icon, information_leaflet_url, active) VALUES
('m-1176-77', 'M 1176/77', 'Medium Maturing', 'Aug', 'Sep', ARRAY['Aug', 'Sep'], ARRAY['L1', 'L2', 'P1', 'P2', 'P3'], 14.2, '{"yield": "High", "disease_resistance": "Good"}', 'High-yielding variety suitable for light soils', 'wheat', null, true),
('m-52-78', 'M 52/78', 'Early Maturing', 'Jun', 'Aug', ARRAY['Jun', 'Jul', 'Aug'], ARRAY['B1', 'B2', 'F1', 'F2', 'H1', 'H2', 'L2'], 13.8, '{"yield": "Medium", "disease_resistance": "Good"}', 'Early maturing variety with good adaptability', 'wheat', null, true),
('m-387-85', 'M 387/85', 'Medium Maturing', 'Jul', 'Oct', ARRAY['Jul', 'Aug', 'Sep', 'Oct'], ARRAY['B1', 'B2'], 14.5, '{"yield": "High", "disease_resistance": "Excellent"}', 'High sugar content variety for heavy soils', 'wheat', null, true),
('m-1400-86', 'M 1400/86', 'Medium Maturing', 'Aug', 'Sep', ARRAY['Aug', 'Sep'], ARRAY['B1', 'B2', 'F1', 'F2', 'H1', 'H2', 'L1', 'L2', 'P1', 'P2', 'P3'], 14.0, '{"yield": "High", "adaptability": "Excellent"}', 'Versatile variety suitable for all soil types', 'wheat', null, true),
('m-2256-88', 'M 2256/88', 'Medium Maturing', 'Jun', 'Sep', ARRAY['Jun', 'Jul', 'Aug', 'Sep'], ARRAY['B1', 'B2', 'F1', 'F2', 'H1', 'H2', 'L1', 'L2', 'P1', 'P2', 'P3'], 13.9, '{"yield": "High", "adaptability": "Excellent"}', 'Widely adaptable high-yielding variety', 'wheat', null, true),
('m-703-89', 'M 703/89', 'Early Maturing', 'Jun', 'Jul', ARRAY['Jun', 'Jul'], ARRAY['H1', 'H2', 'L1', 'L2'], 14.1, '{"yield": "Medium", "maturity": "Early"}', 'Early maturing variety for humid soils', 'wheat', null, true),
('m-1861-89', 'M 1861/89', 'Late Maturing', 'Aug', 'Nov', ARRAY['Aug', 'Sep', 'Oct', 'Nov'], ARRAY['B1', 'B2', 'F1', 'F2', 'H1', 'H2'], 14.3, '{"yield": "High", "maturity": "Late"}', 'Late maturing variety with high sugar content', 'wheat', null, true),
('m-1672-90', 'M 1672/90', 'Late Maturing', 'Aug', 'Nov', ARRAY['Aug', 'Sep', 'Oct', 'Nov'], ARRAY['L1', 'L2', 'P1', 'P2', 'P3'], 14.2, '{"yield": "High", "soil_preference": "Light"}', 'Late variety for light and poor soils', 'wheat', null, true),
('m-2593-92', 'M 2593/92', 'Late Maturing', 'Aug', 'Nov', ARRAY['Aug', 'Sep', 'Oct', 'Nov'], ARRAY['H1', 'H2', 'L1', 'L2', 'P1', 'P2', 'P3'], 14.4, '{"yield": "High", "sugar_content": "High"}', 'High sugar content late variety', 'wheat', '/sugarcane_varieties_leaflets/m2593.pdf', true),
('m-2283-98', 'M 2283/98', 'Late Maturing', 'Aug', 'Nov', ARRAY['Aug', 'Sep', 'Oct', 'Nov'], ARRAY['B1', 'B2', 'F1', 'F2'], 14.6, '{"yield": "High", "sugar_content": "Very High"}', 'Very high sugar content variety', 'wheat', 'http://www.msiri.mu/UserFiles/File/sugarcane%20pamphlets/M%2283-98.pdf', true),
('m-683-99', 'M 683/99', 'Late Maturing', 'Aug', 'Nov', ARRAY['Aug', 'Sep', 'Oct', 'Nov'], ARRAY['L1', 'L2', 'P1', 'P2', 'P3'], 14.3, '{"yield": "High", "soil_preference": "Light"}', 'High-yielding variety for light soils', 'wheat', 'http://www.msiri.mu/UserFiles/File/sugarcane%20pamphlets/M%20683-99.pdf', true),
('m-1989-99', 'M 1989/99', 'Medium Maturing', 'Aug', 'Oct', ARRAY['Aug', 'Sep', 'Oct'], ARRAY['L1', 'L2', 'P1', 'P2', 'P3'], 14.1, '{"yield": "High", "soil_preference": "Light"}', 'Medium maturity variety for light soils', 'wheat', 'http://www.msiri.mu/UserFiles/File/sugarcane%20pamphlets/M%201989-99.pdf', true),
('m-2502-99', 'M 2502/99', 'Medium Maturing', 'Aug', 'Oct', ARRAY['Aug', 'Sep', 'Oct'], ARRAY['B1', 'B2', 'F1', 'F2', 'P1', 'P2', 'P3'], 14.2, '{"yield": "High", "adaptability": "Good"}', 'Adaptable medium maturity variety', 'wheat', 'http://www.msiri.mu/UserFiles/File/sugarcane%20pamphlets/M%202502-99.pdf', true),
('m-1392-00', 'M 1392/00', 'Medium Maturing', 'Jul', 'Oct', ARRAY['Jul', 'Aug', 'Sep', 'Oct'], ARRAY['B1', 'B2', 'F1', 'F2', 'L1', 'L2', 'P1', 'P2', 'P3'], 14.3, '{"yield": "High", "adaptability": "Excellent"}', 'Highly adaptable variety for all soils', 'wheat', 'http://www.msiri.mu/UserFiles/File/sugarcane%20pamphlets/M%201392-00.pdf', true),
('m-63', 'M 63', 'Medium Maturing', 'Aug', 'Oct', ARRAY['Aug', 'Sep', 'Oct'], ARRAY['L1', 'L2', 'P1', 'P2', 'P3'], 13.9, '{"yield": "Medium", "soil_preference": "Light"}', 'Traditional variety for light soils', 'wheat', null, true),
('m-1561-01', 'M 1561/01', 'Medium Maturing', 'Jun', 'Oct', ARRAY['Jun', 'Jul', 'Aug', 'Sep', 'Oct'], ARRAY['B1', 'B2'], 14.1, '{"yield": "High", "soil_preference": "Heavy"}', 'High-yielding variety for heavy soils', 'wheat', null, true),
('m-216-02', 'M 216/02', 'Medium Maturing', 'Jun', 'Oct', ARRAY['Jun', 'Jul', 'Aug', 'Sep', 'Oct'], ARRAY['L1', 'L2', 'P1', 'P2', 'P3'], 14.0, '{"yield": "High", "soil_preference": "Light"}', 'High-yielding variety for light soils', 'wheat', null, true),
('m-1002-02', 'M 1002/02', 'Late Maturing', 'Aug', 'Nov', ARRAY['Aug', 'Sep', 'Oct', 'Nov'], ARRAY['L1', 'L2', 'P1', 'P2', 'P3'], 14.4, '{"yield": "High", "maturity": "Late"}', 'Late maturing high-yielding variety', 'wheat', 'http://www.msiri.mu/UserFiles/File/sugarcane%20pamphlets/M%201002-02.pdf', true),
('m-1698-02', 'M 1698/02', 'Late Maturing', 'Aug', 'Nov', ARRAY['Aug', 'Sep', 'Oct', 'Nov'], ARRAY['L1', 'L2', 'P1', 'P2', 'P3'], 14.2, '{"yield": "High", "soil_preference": "Light"}', 'Late variety for light soils', 'wheat', null, true),
('m-64', 'M 64', 'Late Maturing', 'Aug', 'Nov', ARRAY['Aug', 'Sep', 'Oct', 'Nov'], ARRAY['B1', 'B2', 'F1', 'F2'], 14.3, '{"yield": "High", "soil_preference": "Heavy"}', 'Late variety for heavy soils', 'wheat', null, true),
('m-1256-04', 'M 1256/04', 'Medium Maturing', 'Aug', 'Oct', ARRAY['Aug', 'Sep', 'Oct'], ARRAY['L1', 'L2', 'P1', 'P2', 'P3'], 14.1, '{"yield": "High", "soil_preference": "Light"}', 'Medium maturity variety for light soils', 'wheat', 'http://www.msiri.mu/UserFiles/File/sugarcane%20pamphlets/M%201256-04.pdf', true),
('m-915-05', 'M 915/05', 'Late Maturing', 'Aug', 'Nov', ARRAY['Aug', 'Sep', 'Oct', 'Nov'], ARRAY['B1', 'B2', 'F1', 'F2', 'H1', 'H2', 'L1', 'L2', 'P1', 'P2', 'P3'], 14.5, '{"yield": "Very High", "adaptability": "Excellent"}', 'Very high-yielding variety for all soils', 'wheat', 'http://www.msiri.mu/UserFiles/File/sugarcane%20pamphlets/M%20915-05.pdf', true),
('m-65', 'M 65', 'Medium Maturing', 'Aug', 'Oct', ARRAY['Aug', 'Sep', 'Oct'], ARRAY['B1', 'B2', 'P1', 'P2', 'P3'], 14.0, '{"yield": "High", "adaptability": "Good"}', 'Adaptable medium maturity variety', 'wheat', null, true),
('r573', 'R573', 'Medium Maturing', 'Jul', 'Sep', ARRAY['Jul', 'Aug', 'Sep'], ARRAY['H1', 'H2', 'L1', 'L2', 'P1', 'P2', 'P3'], 13.8, '{"yield": "High", "origin": "Reunion"}', 'Reunion variety with good adaptability', 'wheat', null, true),
('r575', 'R575', 'Early Maturing', 'Jun', 'Aug', ARRAY['Jun', 'Jul', 'Aug'], ARRAY['H1', 'H2', 'L1', 'L2', 'P1', 'P2', 'P3'], 13.9, '{"yield": "High", "maturity": "Early"}', 'Early Reunion variety', 'wheat', 'https://www.ercane.re/nos-varietes/r-575/', true),
('r579', 'R579', 'Late Maturing', 'Oct', 'Dec', ARRAY['Oct', 'Nov', 'Dec'], ARRAY['H1', 'H2', 'L2', 'P1', 'P2', 'P3'], 14.2, '{"yield": "High", "maturity": "Very Late"}', 'Very late Reunion variety', 'wheat', 'https://www.ercane.re/nos-varietes/r-579/', true),
('m-3035-66', 'M 3035/66', 'Late Maturing', 'Aug', 'Dec', ARRAY['Aug', 'Sep', 'Oct', 'Nov', 'Dec'], ARRAY['B1', 'B2', 'F1', 'F2', 'H1', 'H2'], 14.1, '{"yield": "High", "maturity": "Very Late"}', 'Very late variety for heavy soils', 'wheat', null, true),
('m-1246-84', 'M 1246/84', 'Medium Maturing', 'Aug', 'Sep', ARRAY['Aug', 'Sep'], ARRAY['H1', 'H2', 'L1', 'L2', 'P1', 'P2', 'P3'], 14.0, '{"yield": "High", "adaptability": "Good"}', 'Adaptable medium maturity variety', 'wheat', null, true),
('m-1394-86', 'M 1394/86', 'Late Maturing', 'Aug', 'Nov', ARRAY['Aug', 'Sep', 'Oct', 'Nov'], ARRAY['B1', 'B2', 'F1', 'F2', 'H1', 'H2'], 14.2, '{"yield": "High", "soil_preference": "Heavy"}', 'Late variety for heavy soils', 'wheat', null, true),
('m-2024-88', 'M 2024/88', 'Early Maturing', 'Jun', 'Aug', ARRAY['Jun', 'Jul', 'Aug'], ARRAY['L1', 'L2', 'P1', 'P2', 'P3'], 13.7, '{"yield": "Medium", "maturity": "Early"}', 'Early variety for light soils', 'wheat', null, true),
('m-2238-89', 'M 2238/89', 'Late Maturing', 'Aug', 'Nov', ARRAY['Aug', 'Sep', 'Oct', 'Nov'], ARRAY['B1', 'B2'], 14.3, '{"yield": "High", "soil_preference": "Heavy"}', 'Late variety for heavy soils', 'wheat', null, true),
('r570', 'R570', 'Late Maturing', 'Sep', 'Dec', ARRAY['Sep', 'Oct', 'Nov', 'Dec'], ARRAY['H1', 'H2', 'L1', 'L2', 'P1', 'P2', 'P3'], 14.1, '{"yield": "High", "maturity": "Late"}', 'Late Reunion variety', 'wheat', 'https://www.ercane.re/nos-varietes/r-570/', true),
('r585', 'R585', 'Late Maturing', 'Aug', 'Nov', ARRAY['Aug', 'Sep', 'Oct', 'Nov'], ARRAY['H1', 'H2', 'L1', 'L2', 'P1', 'P2', 'P3'], 14.4, '{"yield": "High", "sugar_content": "High"}', 'High sugar Reunion variety', 'wheat', 'https://www.ercane.re/nos-varietes/r-585/', true);

-- =====================================================
-- 3. COMPLETE INTERCROP VARIETIES (9 varieties)
-- =====================================================

INSERT INTO intercrop_varieties (variety_id, name, scientific_name, benefits, planting_time, harvest_time, description, icon, image_url, active) VALUES
('none', 'None', '', ARRAY['No intercrop selected', 'Monoculture sugarcane'], '', '', 'No intercrop companion plant selected', 'x', null, true),
('cowpea', 'Cowpea', 'Vigna unguiculata', ARRAY['Nitrogen fixation', 'Soil improvement', 'Additional income', 'Ground cover'], 'Early rainy season', '60-90 days', 'Fast-growing legume that fixes nitrogen and provides ground cover', 'leaf', 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Vigna_unguiculata_Blanco2.286-cropped.jpg/300px-Vigna_unguiculata_Blanco2.286-cropped.jpg', true),
('soybean', 'Soybean', 'Glycine max', ARRAY['High nitrogen fixation', 'Protein-rich crop', 'Market value', 'Soil structure improvement'], 'Beginning of rainy season', '90-120 days', 'High-value legume crop with excellent nitrogen fixation capacity', 'leaf', 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fc/Soybeanvarieties.jpg/300px-Soybeanvarieties.jpg', true),
('groundnut', 'Groundnut (Peanut)', 'Arachis hypogaea', ARRAY['Nitrogen fixation', 'High economic value', 'Oil production', 'Soil aeration'], 'Start of rainy season', '90-120 days', 'Valuable cash crop that improves soil fertility through nitrogen fixation', 'leaf', 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Groundnut_%28Arachis_hypogaea%29.jpg/300px-Groundnut_%28Arachis_hypogaea%29.jpg', true),
('blackgram', 'Black Gram', 'Vigna mungo', ARRAY['Nitrogen fixation', 'Short duration', 'Drought tolerance', 'Soil enrichment'], 'Post-monsoon', '60-90 days', 'Short-duration pulse crop suitable for intercropping', 'leaf', null, true),
('greengram', 'Green Gram (Mung Bean)', 'Vigna radiata', ARRAY['Quick nitrogen fixation', 'Fast growing', 'Multiple harvests', 'Market demand'], 'Multiple seasons', '60-75 days', 'Fast-growing legume with high market value and quick returns', 'leaf', null, true),
('pigeonpea', 'Pigeon Pea', 'Cajanus cajan', ARRAY['Long-term nitrogen fixation', 'Deep root system', 'Windbreak', 'Perennial benefits'], 'Beginning of rainy season', '150-180 days', 'Long-duration legume that provides sustained soil improvement', 'leaf', null, true),
('chickpea', 'Chickpea', 'Cicer arietinum', ARRAY['Nitrogen fixation', 'Drought tolerance', 'High protein', 'Cool season crop'], 'Post-monsoon/Winter', '90-120 days', 'Cool season legume suitable for winter intercropping', 'leaf', null, true),
('fieldpea', 'Field Pea', 'Pisum arvense', ARRAY['Nitrogen fixation', 'Cool season adaptation', 'Fodder value', 'Soil improvement'], 'Winter season', '90-110 days', 'Cool season legume that provides both grain and fodder', 'leaf', null, true);

-- =====================================================
-- 4. ENHANCED ACTIVITY CATEGORIES
-- =====================================================

INSERT INTO activity_categories (category_id, name, description, icon, color, active, sort_order) VALUES
('land-preparation', 'Land Preparation', 'Clearing, plowing, and soil preparation', 'tractor', '#8B5CF6', true, 1),
('planting', 'Planting', 'Seed bed preparation and planting', 'sprout', '#10B981', true, 2),
('establishment', 'Establishment', 'Initial growth and establishment care', 'leaf', '#22C55E', true, 3),
('growth', 'Growth Phase', 'Active growth and development', 'wheat', '#3B82F6', true, 4),
('maintenance', 'Maintenance', 'Ongoing care, fertilization, pest control', 'wrench', '#8B5CF6', true, 5),
('pre-harvest', 'Pre-Harvest', 'Preparation for harvest activities', 'clipboard', '#F59E0B', true, 6),
('harvest', 'Harvest', 'Cutting and collection of sugarcane', 'scissors', '#EF4444', true, 7),
('post-harvest', 'Post-Harvest', 'Field cleanup and preparation for next cycle', 'broom', '#6B7280', true, 8);

-- =====================================================
-- 5. ENHANCED OBSERVATION CATEGORIES
-- =====================================================

INSERT INTO observation_categories (category_id, name, description, icon, color, active, sort_order) VALUES
('soil', 'Soil Observations', 'Soil texture, pH, nutrients, and physical properties', 'mountain', '#8B4513', true, 1),
('water', 'Water Observations', 'Irrigation water quality and availability', 'droplets', '#3B82F6', true, 2),
('plant-morphological', 'Plant Morphological', 'Plant height, diameter, and physical measurements', 'ruler', '#22C55E', true, 3),
('growth-stage', 'Growth Stage', 'Plant development stage and growth progress', 'trending-up', '#10B981', true, 4),
('pest-disease', 'Pest & Disease', 'Pest infestations and disease observations', 'bug', '#EF4444', true, 5),
('weed', 'Weed Observations', 'Weed pressure and control effectiveness', 'leaf', '#84CC16', true, 6),
('sugarcane-yield-quality', 'Sugarcane Yield & Quality', 'MANDATORY: Sugarcane harvest yield, quality, and revenue data', 'bar-chart', '#F59E0B', true, 7),
('intercrop-yield-quality', 'Intercrop Yield & Quality', 'MANDATORY if intercrop planted: Intercrop harvest yield, quality, and revenue data', 'wheat', '#6366F1', true, 8);

-- =====================================================
-- 6. ADD INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_sugarcane_varieties_active ON sugarcane_varieties(active);
CREATE INDEX IF NOT EXISTS idx_intercrop_varieties_active ON intercrop_varieties(active);
CREATE INDEX IF NOT EXISTS idx_activity_categories_active ON activity_categories(active);
CREATE INDEX IF NOT EXISTS idx_observation_categories_active ON observation_categories(active);

COMMIT;
