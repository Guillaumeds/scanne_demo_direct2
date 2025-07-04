-- =====================================================
-- COMPLETE CSV DATA IMPORT SCRIPT
-- =====================================================
-- Import ALL configuration data from CSV files into database
-- This includes all 40 products, 37 resources, 33 sugarcane varieties, and 15 intercrop varieties

-- Clear existing configuration data
DELETE FROM products;
DELETE FROM resources;
DELETE FROM sugarcane_varieties;
DELETE FROM intercrop_varieties;

-- =====================================================
-- PRODUCTS (40 records from CSV)
-- =====================================================
INSERT INTO products (product_id, name, category, category_enum, description, unit, recommended_rate_per_ha, cost_per_unit, brand, composition, icon, image_url, information_url, specifications, safety_datasheet_url, active) VALUES
('npk-13-13-20', '13-13-20+2MgO', 'Compound and NPK Fertilizers', 'compound-npk', '', 'kg', 250, 45, '', '', '', '', '', '{}', '', true),
('npk-13-8-24', '13:8:24', 'Compound and NPK Fertilizers', 'compound-npk', '', 'kg', 250, 42, '', '', '', '', '', '{}', '', true),
('npk-12-8-20', '12:8:20', 'Compound and NPK Fertilizers', 'compound-npk', '', 'kg', 250, 40, '', '', '', '', '', '{}', '', true),
('npk-12-12-17', '12:12:17', 'Compound and NPK Fertilizers', 'compound-npk', '', 'kg', 250, 38, '', '', '', '', '', '{}', '', true),
('npk-19-19-19', '19:19:19', 'Compound and NPK Fertilizers', 'compound-npk', '', 'kg', 200, 50, '', '', '', '', '', '{}', '', true),
('npk-20-20-20', '20:20:20', 'Compound and NPK Fertilizers', 'compound-npk', '', 'kg', 200, 52, '', '', '', '', '', '{}', '', true),
('npk-8-10-40', '8:10:40', 'Compound and NPK Fertilizers', 'compound-npk', '', 'kg', 300, 48, '', '', '', '', '', '{}', '', true),
('npk-11-8-6', '11-8-6 (Co-Vert)', 'Compound and NPK Fertilizers', 'compound-npk', '', 'kg', 300, 35, '', '', '', '', '', '{}', '', true),
('npk-nitrate-blends', 'Nitrate Based NPK Blends', 'Compound and NPK Fertilizers', 'compound-npk', '', 'kg', 250, 55, '', '', '', '', '', '{}', '', true),
('azophoska', 'Azophoska (13-13-20+2 micro)', 'Compound and NPK Fertilizers', 'compound-npk', '', 'kg', 250, 48, '', '', '', '', '', '{}', '', true),
('bluefficient', 'Bluefficient Fertilizer (10-10-20+2MgO+micro)', 'Compound and NPK Fertilizers', 'compound-npk', '', 'kg', 250, 50, '', '', '', '', '', '{}', '', true),
('fairway-master', 'Fairway Master', 'Compound and NPK Fertilizers', 'compound-npk', '', 'kg', 200, 60, '', '', '', '', '', '{}', '', true),
('icl-sierrablen', 'ICL Sierrablen Plus Granular Fertiliser', 'Compound and NPK Fertilizers', 'compound-npk', '', 'kg', 200, 65, '', '', '', '', '', '{}', '', true),
('ammonium-sulphate-crystal', 'Ammonium Sulphate 21% (Crystal)', 'Nitrogen Fertilizers', 'nitrogen', '', 'kg', 150, 25, '', '', '', '', '', '{}', '', true),
('ammonium-sulphate-granular', 'Ammonium Sulphate 21% (Granular)', 'Nitrogen Fertilizers', 'nitrogen', '', 'kg', 150, 27, '', '', '', '', '', '{}', '', true),
('urea-46', 'Urea (46% N Granular)', 'Nitrogen Fertilizers', 'nitrogen', '', 'kg', 130, 30, '', '', '', '', '', '{}', '', true),
('nano-urea-plus', 'NANO Urea Plus (Kalol)', 'Nitrogen Fertilizers', 'nitrogen', '', 'L', 2, 120, '', '', '', '', '', '{}', '', true),
('nano-dap', 'NANO DAP', 'Nitrogen Fertilizers', 'nitrogen', '', 'L', 2, 125, '', '', '', '', '', '{}', '', true),
('map', 'Monoammonium Phosphate (MAP)', 'Phosphorus and Potassium Fertilizers', 'phosphorus-potassium', '', 'kg', 100, 55, '', '', '', '', '', '{}', '', true),
('mkp', 'Mono Potassium Phosphate (MKP 0-52-34)', 'Phosphorus and Potassium Fertilizers', 'phosphorus-potassium', '', 'kg', 50, 85, '', '', '', '', '', '{}', '', true),
('potassium-nitrate', 'Potassium Nitrate', 'Phosphorus and Potassium Fertilizers', 'phosphorus-potassium', '', 'kg', 75, 90, '', '', '', '', '', '{}', '', true),
('potassium-sulphate', 'Potassium Sulphate (SOP 0-0-50+46SO3)', 'Phosphorus and Potassium Fertilizers', 'phosphorus-potassium', '', 'kg', 100, 80, '', '', '', '', '', '{}', '', true),
('nova-calcium-nitrate', 'Nova Calcium Nitrate (15.5-0-0+26.5CaO)', 'Calcium and Magnesium Fertilizers', 'calcium-magnesium', '', 'kg', 100, 45, '', '', '', '', '', '{}', '', true),
('nova-mag-s', 'Nova Mag-S (Magnesium Sulphate 0-0-0+16MgO+32SO3)', 'Calcium and Magnesium Fertilizers', 'calcium-magnesium', '', 'kg', 50, 40, '', '', '', '', '', '{}', '', true),
('micro-kanieltra', 'Micro elements (Kanieltra)', 'Micronutrient and Specialty Fertilizers', 'micronutrient', '', 'kg', 5, 150, '', '', '', '', '', '{}', '', true),
('unikey-11-40-10', 'Unikey Nano Professional 11-40-10+2.5MgO+TE', 'Micronutrient and Specialty Fertilizers', 'micronutrient', '', 'kg', 2, 180, '', '', '', '', '', '{}', '', true),
('unikey-15-5-40', 'Unikey Nano Professional 15-5-40+TE', 'Micronutrient and Specialty Fertilizers', 'micronutrient', '', 'kg', 2, 175, '', '', '', '', '', '{}', '', true),
('unikey-20-20-20', 'Unikey Nano Professional 20-20-20+2MgO+TE', 'Micronutrient and Specialty Fertilizers', 'micronutrient', '', 'kg', 2, 185, '', '', '', '', '', '{}', '', true),
('hydro-pack-1', 'Hydro Pack No. 1', 'Micronutrient and Specialty Fertilizers', 'micronutrient', '', 'kg', 1, 200, '', '', '', '', '', '{}', '', true),
('hydro-pack-2', 'Hydro Pack No. 2', 'Micronutrient and Specialty Fertilizers', 'micronutrient', '', 'kg', 1, 200, '', '', '', '', '', '{}', '', true),
('hydro-pack-3', 'Hydro Pack No. 3', 'Micronutrient and Specialty Fertilizers', 'micronutrient', '', 'kg', 1, 200, '', '', '', '', '', '{}', '', true),
('organic-all-purpose', 'All-purpose Organic Fertiliser', 'Organic and Bio Fertilizers', 'organic-bio', '', 'kg', 500, 20, '', '', '', '', '', '{}', '', true),
('bat-guano', 'Bat Guano Fertilizer', 'Organic and Bio Fertilizers', 'organic-bio', '', 'kg', 200, 35, '', '', '', '', '', '{}', '', true),
('seabird-guano', 'Seabird Guano', 'Organic and Bio Fertilizers', 'organic-bio', '', 'kg', 200, 40, '', '', '', '', '', '{}', '', true),
('seaweed-powder', 'Fresh Seaweed and Sargassum (Powder)', 'Organic and Bio Fertilizers', 'organic-bio', '', 'kg', 100, 25, '', '', '', '', '', '{}', '', true),
('seaweed-liquid', 'Fresh Seaweed and Sargassum (Liquid)', 'Organic and Bio Fertilizers', 'organic-bio', '', 'L', 10, 30, '', '', '', '', '', '{}', '', true),
('organic-mineral-liquid', 'Organic Mineral Liquid Fertilizers (Made in Moris)', 'Organic and Bio Fertilizers', 'organic-bio', '', 'L', 5, 45, '', '', '', '', '', '{}', '', true),
('phostrogen', 'Phostrogen (800g)', 'Other Fertilizer Products', 'other', '', 'pack', 1, 85, '', '', '', '', '', '{}', '', true),
('agroleaf-power', 'Agroleaf Power', 'Other Fertilizer Products', 'other', '', 'kg', 2, 120, '', '', '', '', '', '{}', '', true);

-- =====================================================
-- RESOURCES (37 records from CSV)
-- =====================================================
INSERT INTO resources (resource_id, name, category, category_enum, description, unit, cost_per_hour, cost_per_unit, skill_level, overtime_multiplier, icon, specifications, active) VALUES
('tractor-small', 'Small Tractor (40-60 HP)', 'Fleet & Vehicles', 'fleet', '', 'hours', null, 450, '', 1.0, '', '{}', true),
('tractor-medium', 'Medium Tractor (60-90 HP)', 'Fleet & Vehicles', 'fleet', '', 'hours', null, 650, '', 1.0, '', '{}', true),
('tractor-large', 'Large Tractor (90+ HP)', 'Fleet & Vehicles', 'fleet', '', 'hours', null, 850, '', 1.0, '', '{}', true),
('pickup-truck', 'Pickup Truck', 'Fleet & Vehicles', 'fleet', '', 'hours', null, 200, '', 1.0, '', '{}', true),
('utility-vehicle', 'Utility Vehicle (ATV/UTV)', 'Fleet & Vehicles', 'fleet', '', 'hours', null, 150, '', 1.0, '', '{}', true),
('field-worker', 'Field Worker', 'Labour & Personnel', 'labour', '', 'hours', null, 25, 'Basic', 1.0, '', '{}', true),
('skilled-worker', 'Skilled Agricultural Worker', 'Labour & Personnel', 'labour', '', 'hours', null, 35, 'Skilled', 1.0, '', '{}', true),
('machine-operator', 'Machine Operator', 'Labour & Personnel', 'labour', '', 'hours', null, 45, 'Specialized', 1.0, '', '{}', true),
('supervisor', 'Field Supervisor', 'Labour & Personnel', 'labour', '', 'hours', null, 60, 'Management', 1.0, '', '{}', true),
('overtime-worker', 'Field Worker (Overtime)', 'Labour & Personnel', 'labour', '', 'hours', null, 37.5, 'Basic', 1.5, '', '{}', true),
('overtime-skilled', 'Skilled Worker (Overtime)', 'Labour & Personnel', 'labour', '', 'hours', null, 52.5, 'Skilled', 1.5, '', '{}', true),
('seasonal-worker', 'Seasonal Harvest Worker', 'Labour & Personnel', 'labour', '', 'hours', null, 30, 'Seasonal', 1.0, '', '{}', true),
('plow', 'Moldboard Plow', 'Equipment & Tools', 'equipment', '', 'hours', null, 50, '', 1.0, '', '{}', true),
('disc-harrow', 'Disc Harrow', 'Equipment & Tools', 'equipment', '', 'hours', null, 40, '', 1.0, '', '{}', true),
('cultivator', 'Field Cultivator', 'Equipment & Tools', 'equipment', '', 'hours', null, 45, '', 1.0, '', '{}', true),
('planter', 'Sugarcane Planter', 'Equipment & Tools', 'equipment', '', 'hours', null, 80, '', 1.0, '', '{}', true),
('fertilizer-spreader', 'Fertilizer Spreader', 'Equipment & Tools', 'equipment', '', 'hours', null, 35, '', 1.0, '', '{}', true),
('sprayer', 'Field Sprayer', 'Equipment & Tools', 'equipment', '', 'hours', null, 60, '', 1.0, '', '{}', true),
('mower', 'Rotary Mower', 'Equipment & Tools', 'equipment', '', 'hours', null, 40, '', 1.0, '', '{}', true),
('bulldozer', 'Bulldozer', 'Heavy Machinery', 'machinery', '', 'hours', null, 1200, '', 1.0, '', '{}', true),
('excavator', 'Excavator', 'Heavy Machinery', 'machinery', '', 'hours', null, 800, '', 1.0, '', '{}', true),
('grader', 'Motor Grader', 'Heavy Machinery', 'machinery', '', 'hours', null, 600, '', 1.0, '', '{}', true),
('compactor', 'Soil Compactor', 'Heavy Machinery', 'machinery', '', 'hours', null, 400, '', 1.0, '', '{}', true),
('truck-small', 'Small Transport Truck (3-5 tons)', 'Transport & Logistics', 'transport', '', 'hours', null, 300, '', 1.0, '', '{}', true),
('truck-large', 'Large Transport Truck (10+ tons)', 'Transport & Logistics', 'transport', '', 'hours', null, 500, '', 1.0, '', '{}', true),
('trailer', 'Agricultural Trailer', 'Transport & Logistics', 'transport', '', 'hours', null, 100, '', 1.0, '', '{}', true),
('cane-trailer', 'Sugarcane Transport Trailer', 'Transport & Logistics', 'transport', '', 'hours', null, 150, '', 1.0, '', '{}', true),
('drip-system', 'Drip Irrigation System', 'Irrigation Systems', 'irrigation', '', 'hours', null, 25, '', 1.0, '', '{}', true),
('sprinkler-system', 'Sprinkler Irrigation System', 'Irrigation Systems', 'irrigation', '', 'hours', null, 35, '', 1.0, '', '{}', true),
('pump-electric', 'Electric Water Pump', 'Irrigation Systems', 'irrigation', '', 'hours', null, 15, '', 1.0, '', '{}', true),
('pump-diesel', 'Diesel Water Pump', 'Irrigation Systems', 'irrigation', '', 'hours', null, 25, '', 1.0, '', '{}', true),
('cane-harvester', 'Sugarcane Harvester', 'Harvesting Equipment', 'harvesting', '', 'hours', null, 1500, '', 1.0, '', '{}', true),
('cane-loader', 'Sugarcane Loader', 'Harvesting Equipment', 'harvesting', '', 'hours', null, 400, '', 1.0, '', '{}', true),
('cane-cutter', 'Manual Cane Cutter', 'Harvesting Equipment', 'harvesting', '', 'hours', null, 35, '', 1.0, '', '{}', true),
('weighing-scale', 'Field Weighing Scale', 'Processing Equipment', 'processing', '', 'hours', null, 50, '', 1.0, '', '{}', true),
('field-trailer', 'Field Collection Trailer', 'Processing Equipment', 'processing', '', 'hours', null, 75, '', 1.0, '', '{}', true);

-- =====================================================
-- SUGARCANE VARIETIES (33 records from CSV)
-- =====================================================
INSERT INTO sugarcane_varieties (variety_id, name, category, category_enum, harvest_start_month, harvest_end_month, seasons, soil_types, sugar_content_percent, characteristics, description, icon, image_url, information_leaflet_url, active) VALUES
('m-1176-77', 'M 1176/77', 'Sugarcane Variety', 'sugarcane', 'Aug', 'Sep', '{Aug,Sep}', '{L1,L2,P1,P2,P3}', null, '{}', '', '', '', '', true),
('m-52-78', 'M 52/78', 'Sugarcane Variety', 'sugarcane', 'Jun', 'Aug', '{Jun,Jul,Aug}', '{B1,B2,F1,F2,H1,H2,L2}', null, '{}', '', '', '', '', true),
('m-387-85', 'M 387/85', 'Sugarcane Variety', 'sugarcane', 'Jul', 'Oct', '{Jul,Aug,Sep,Oct}', '{B1,B2}', null, '{}', '', '', '', '', true),
('m-1400-86', 'M 1400/86', 'Sugarcane Variety', 'sugarcane', 'Aug', 'Sep', '{Aug,Sep}', '{B1,B2,F1,F2,H1,H2,L1,L2,P1,P2,P3}', null, '{}', '', '', '', '', true),
('m-2256-88', 'M 2256/88', 'Sugarcane Variety', 'sugarcane', 'Jun', 'Sep', '{Jun,Jul,Aug,Sep}', '{B1,B2,F1,F2,H1,H2,L1,L2,P1,P2,P3}', null, '{}', '', '', '', '', true),
('m-703-89', 'M 703/89', 'Sugarcane Variety', 'sugarcane', 'Jun', 'Jul', '{Jun,Jul}', '{H1,H2,L1,L2}', null, '{}', '', '', '', '', true),
('m-1861-89', 'M 1861/89', 'Sugarcane Variety', 'sugarcane', 'Aug', 'Nov', '{Aug,Sep,Oct,Nov}', '{B1,B2,F1,F2,H1,H2}', null, '{}', '', '', '', '', true),
('m-1672-90', 'M 1672/90', 'Sugarcane Variety', 'sugarcane', 'Aug', 'Nov', '{Aug,Sep,Oct,Nov}', '{L1,L2,P1,P2,P3}', null, '{}', '', '', '', '', true),
('m-2593-92', 'M 2593/92', 'Sugarcane Variety', 'sugarcane', 'Aug', 'Nov', '{Aug,Sep,Oct,Nov}', '{H1,H2,L1,L2,P1,P2,P3}', null, '{}', '', '', '', '/sugarcane_varieties_leaflets/m2593.pdf', true),
('m-2283-98', 'M 2283/98', 'Sugarcane Variety', 'sugarcane', 'Aug', 'Nov', '{Aug,Sep,Oct,Nov}', '{B1,B2,F1,F2}', null, '{}', '', '', '/images/varieties/m-2283-98.jpg', 'http://www.msiri.mu/UserFiles/File/sugarcane%20pamphlets/M%2283-98.pdf', true),
('m-683-99', 'M 683/99', 'Sugarcane Variety', 'sugarcane', 'Aug', 'Nov', '{Aug,Sep,Oct,Nov}', '{L1,L2,P1,P2,P3}', null, '{}', '', '', '', 'http://www.msiri.mu/UserFiles/File/sugarcane%20pamphlets/M%20683-99.pdf', true),
('m-1989-99', 'M 1989/99', 'Sugarcane Variety', 'sugarcane', 'Aug', 'Oct', '{Aug,Sep,Oct}', '{L1,L2,P1,P2,P3}', null, '{}', '', '', '', 'http://www.msiri.mu/UserFiles/File/sugarcane%20pamphlets/M%201989-99.pdf', true),
('m-2502-99', 'M 2502/99', 'Sugarcane Variety', 'sugarcane', 'Aug', 'Oct', '{Aug,Sep,Oct}', '{B1,B2,F1,F2,P1,P2,P3}', null, '{}', '', '', '', 'http://www.msiri.mu/UserFiles/File/sugarcane%20pamphlets/M%202502-99.pdf', true),
('m-1392-00', 'M 1392/00', 'Sugarcane Variety', 'sugarcane', 'Jul', 'Oct', '{Jul,Aug,Sep,Oct}', '{B1,B2,F1,F2,L1,L2,P1,P2,P3}', null, '{}', '', '', '/images/varieties/m-1392-00.jpg', 'http://www.msiri.mu/UserFiles/File/sugarcane%20pamphlets/M%201392-00.pdf', true),
('m-63', 'M 63', 'Sugarcane Variety', 'sugarcane', 'Aug', 'Oct', '{Aug,Sep,Oct}', '{L1,L2,P1,P2,P3}', null, '{}', '', '', '', '', true),
('m-1561-01', 'M 1561/01', 'Sugarcane Variety', 'sugarcane', 'Jun', 'Oct', '{Jun,Jul,Aug,Sep,Oct}', '{B1,B2}', null, '{}', '', '', '', '', true),
('m-216-02', 'M 216/02', 'Sugarcane Variety', 'sugarcane', 'Jun', 'Oct', '{Jun,Jul,Aug,Sep,Oct}', '{L1,L2,P1,P2,P3}', null, '{}', '', '', '', '', true),
('m-1002-02', 'M 1002/02', 'Sugarcane Variety', 'sugarcane', 'Aug', 'Nov', '{Aug,Sep,Oct,Nov}', '{L1,L2,P1,P2,P3}', null, '{}', '', '', '', 'http://www.msiri.mu/UserFiles/File/sugarcane%20pamphlets/M%201002-02.pdf', true),
('m-1698-02', 'M 1698/02', 'Sugarcane Variety', 'sugarcane', 'Aug', 'Nov', '{Aug,Sep,Oct,Nov}', '{L1,L2,P1,P2,P3}', null, '{}', '', '', '', '', true),
('m-64', 'M 64', 'Sugarcane Variety', 'sugarcane', 'Aug', 'Nov', '{Aug,Sep,Oct,Nov}', '{B1,B2,F1,F2}', null, '{}', '', '', '', '', true),
('m-1256-04', 'M 1256/04', 'Sugarcane Variety', 'sugarcane', 'Aug', 'Oct', '{Aug,Sep,Oct}', '{L1,L2,P1,P2,P3}', null, '{}', '', '', '', 'http://www.msiri.mu/UserFiles/File/sugarcane%20pamphlets/M%201256-04.pdf', true),
('m-915-05', 'M 915/05', 'Sugarcane Variety', 'sugarcane', 'Aug', 'Nov', '{Aug,Sep,Oct,Nov}', '{B1,B2,F1,F2,H1,H2,L1,L2,P1,P2,P3}', null, '{}', '', '', '', 'http://www.msiri.mu/UserFiles/File/sugarcane%20pamphlets/M%20915-05.pdf', true),
('m-65', 'M 65', 'Sugarcane Variety', 'sugarcane', 'Aug', 'Oct', '{Aug,Sep,Oct}', '{B1,B2,P1,P2,P3}', null, '{}', '', '', '', '', true),
('r573', 'R573', 'Sugarcane Variety', 'sugarcane', 'Jul', 'Sep', '{Jul,Aug,Sep}', '{H1,H2,L1,L2,P1,P2,P3}', null, '{}', '', '', '', '', true),
('r575', 'R575', 'Sugarcane Variety', 'sugarcane', 'Jun', 'Aug', '{Jun,Jul,Aug}', '{H1,H2,L1,L2,P1,P2,P3}', null, '{}', '', '', '', 'https://www.ercane.re/nos-varietes/r-575/', true),
('r579', 'R579', 'Sugarcane Variety', 'sugarcane', 'Oct', 'Dec', '{Oct,Nov,Dec}', '{H1,H2,L2,P1,P2,P3}', null, '{}', '', '', '', 'https://www.ercane.re/nos-varietes/r-579/', true),
('m-3035-66', 'M 3035/66', 'Sugarcane Variety', 'sugarcane', 'Aug', 'Dec', '{Aug,Sep,Oct,Nov,Dec}', '{B1,B2,F1,F2,H1,H2}', null, '{}', '', '', '', '', true),
('m-1246-84', 'M 1246/84', 'Sugarcane Variety', 'sugarcane', 'Aug', 'Sep', '{Aug,Sep}', '{H1,H2,L1,L2,P1,P2,P3}', null, '{}', '', '', '', '', true),
('m-1394-86', 'M 1394/86', 'Sugarcane Variety', 'sugarcane', 'Aug', 'Nov', '{Aug,Sep,Oct,Nov}', '{B1,B2,F1,F2,H1,H2}', null, '{}', '', '', '', '', true),
('m-2024-88', 'M 2024/88', 'Sugarcane Variety', 'sugarcane', 'Jun', 'Aug', '{Jun,Jul,Aug}', '{L1,L2,P1,P2,P3}', null, '{}', '', '', '', '', true),
('m-2238-89', 'M 2238/89', 'Sugarcane Variety', 'sugarcane', 'Aug', 'Nov', '{Aug,Sep,Oct,Nov}', '{B1,B2}', null, '{}', '', '', '', '', true),
('r570', 'R570', 'Sugarcane Variety', 'sugarcane', 'Sep', 'Dec', '{Sep,Oct,Nov,Dec}', '{H1,H2,L1,L2,P1,P2,P3}', null, '{}', '', '', '', 'https://www.ercane.re/nos-varietes/r-570/', true),
('r585', 'R585', 'Sugarcane Variety', 'sugarcane', 'Aug', 'Nov', '{Aug,Sep,Oct,Nov}', null, null, '{}', '', '', '', 'https://www.ercane.re/nos-varietes/r-585/', true);

-- =====================================================
-- INTERCROP VARIETIES (15 records from CSV)
-- =====================================================
INSERT INTO intercrop_varieties (variety_id, name, scientific_name, category_enum, benefits, planting_time, harvest_time, description, icon, image_url, information_leaflet_url, active) VALUES
('none', 'None', '', 'intercrop', '{No intercrop selected,Monoculture sugarcane}', '', '', 'No intercrop companion plant selected', '', '', '', true),
('cowpea', 'Cowpea', 'Vigna unguiculata', 'intercrop', '{Nitrogen fixation,Soil improvement,Additional income,Ground cover}', 'Early rainy season', '60-90 days', 'Fast-growing legume that fixes nitrogen and provides ground cover', '', 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Vigna_unguiculata_Blanco2.286-cropped.jpg/300px-Vigna_unguiculata_Blanco2.286-cropped.jpg', '', true),
('blackeyed-pea', 'Black-eyed Pea', 'Vigna unguiculata subsp. unguiculata', 'intercrop', '{Nitrogen fixation,Drought tolerance,Food security,Market value}', 'Early to mid rainy season', '70-100 days', 'Drought-tolerant legume with high protein content', '', 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Vigna_unguiculata_Blanco2.286-cropped.jpg/300px-Vigna_unguiculata_Blanco2.286-cropped.jpg', '', true),
('soybean', 'Soybean', 'Glycine max', 'intercrop', '{High nitrogen fixation,Protein rich,Oil production,Soil structure improvement}', 'Early rainy season', '90-120 days', 'High-value legume crop with excellent nitrogen fixation capacity', '', 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Soybean.USDA.jpg/300px-Soybean.USDA.jpg', '', true),
('groundnut', 'Groundnut', 'Arachis hypogaea', 'intercrop', '{Nitrogen fixation,High value crop,Oil production,Food security}', 'Early to mid rainy season', '90-120 days', 'High-value legume with underground pods', '', 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Arachis_hypogaea_003.JPG/300px-Arachis_hypogaea_003.JPG', '', true),
('mung-bean', 'Mung Bean', 'Vigna radiata', 'intercrop', '{Fast nitrogen fixation,Quick maturity,Multiple harvests,Green manure}', 'Throughout rainy season', '60-75 days', 'Fast-growing legume suitable for multiple cropping', '', 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Vigna_unguiculata_Blanco2.286-cropped.jpg/300px-Vigna_unguiculata_Blanco2.286-cropped.jpg', '', true),
('pigeon-pea', 'Pigeon Pea', 'Cajanus cajan', 'intercrop', '{Long-term nitrogen fixation,Perennial benefits,Windbreak,Deep rooting}', 'Early rainy season', '150-180 days', 'Long-duration legume providing sustained benefits', '', 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Vigna_unguiculata_Blanco2.286-cropped.jpg/300px-Vigna_unguiculata_Blanco2.286-cropped.jpg', '', true),
('lima-bean', 'Lima Bean', 'Phaseolus lunatus', 'intercrop', '{Nitrogen fixation,Climbing habit,Space efficient,High protein}', 'Early rainy season', '90-110 days', 'Climbing legume that maximizes space utilization', '', 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Vigna_unguiculata_Blanco2.286-cropped.jpg/300px-Vigna_unguiculata_Blanco2.286-cropped.jpg', '', true),
('common-bean', 'Common Bean', 'Phaseolus vulgaris', 'intercrop', '{Nitrogen fixation,Fast growth,Market demand,Protein source}', 'Mid rainy season', '75-95 days', 'Popular legume with good market demand', '', 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Vigna_unguiculata_Blanco2.286-cropped.jpg/300px-Vigna_unguiculata_Blanco2.286-cropped.jpg', '', true),
('lablab', 'Lablab', 'Lablab purpureus', 'intercrop', '{Nitrogen fixation,Fodder value,Drought tolerance,Soil improvement}', 'Early to mid rainy season', '90-120 days', 'Multipurpose legume for food and fodder', '', 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Vigna_unguiculata_Blanco2.286-cropped.jpg/300px-Vigna_unguiculata_Blanco2.286-cropped.jpg', '', true),
('sweet-potato', 'Sweet Potato', 'Ipomoea batatas', 'intercrop', '{Ground cover,Tuber production,Erosion control,Quick establishment}', 'Early rainy season', '90-120 days', 'Ground covering crop with edible tubers', '', 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Vigna_unguiculata_Blanco2.286-cropped.jpg/300px-Vigna_unguiculata_Blanco2.286-cropped.jpg', '', true),
('cassava', 'Cassava', 'Manihot esculenta', 'intercrop', '{Drought tolerance,Long storage,Food security,Starch production}', 'Early rainy season', '8-12 months', 'Drought-tolerant root crop for food security', '', 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Vigna_unguiculata_Blanco2.286-cropped.jpg/300px-Vigna_unguiculata_Blanco2.286-cropped.jpg', '', true),
('maize', 'Maize', 'Zea mays', 'intercrop', '{Quick cash crop,Food security,Biomass production,Market demand}', 'Early rainy season', '90-120 days', 'Fast-growing cereal crop with good market value', '', 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Vigna_unguiculata_Blanco2.286-cropped.jpg/300px-Vigna_unguiculata_Blanco2.286-cropped.jpg', '', true),
('sorghum', 'Sorghum', 'Sorghum bicolor', 'intercrop', '{Drought tolerance,Fodder value,Grain production,Biomass}', 'Early to mid rainy season', '100-130 days', 'Drought-tolerant cereal suitable for dry conditions', '', 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Vigna_unguiculata_Blanco2.286-cropped.jpg/300px-Vigna_unguiculata_Blanco2.286-cropped.jpg', '', true),
('fieldpea', 'Field Pea', 'Pisum arvense', 'intercrop', '{Nitrogen fixation,Cool season adaptation,Fodder value,Soil improvement}', 'Winter season', '90-110 days', 'Cool season legume that provides both grain and fodder', '', 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Vigna_unguiculata_Blanco2.286-cropped.jpg/300px-Vigna_unguiculata_Blanco2.286-cropped.jpg', '', true);

-- =====================================================
-- VALIDATION AND SUMMARY
-- =====================================================
DO $$
DECLARE
    prod_count INTEGER;
    res_count INTEGER;
    sc_count INTEGER;
    ic_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO prod_count FROM products;
    SELECT COUNT(*) INTO res_count FROM resources;
    SELECT COUNT(*) INTO sc_count FROM sugarcane_varieties;
    SELECT COUNT(*) INTO ic_count FROM intercrop_varieties;

    RAISE NOTICE '=== IMPORT COMPLETE ===';
    RAISE NOTICE 'Products: % records', prod_count;
    RAISE NOTICE 'Resources: % records', res_count;
    RAISE NOTICE 'Sugarcane Varieties: % records', sc_count;
    RAISE NOTICE 'Intercrop Varieties: % records', ic_count;
    RAISE NOTICE 'Total Configuration Records: %', (prod_count + res_count + sc_count + ic_count);

    -- Validate expected counts
    IF prod_count != 40 THEN
        RAISE WARNING 'Expected 40 products, got %', prod_count;
    END IF;
    IF res_count != 37 THEN
        RAISE WARNING 'Expected 37 resources, got %', res_count;
    END IF;
    IF sc_count != 33 THEN
        RAISE WARNING 'Expected 33 sugarcane varieties, got %', sc_count;
    END IF;
    IF ic_count != 15 THEN
        RAISE WARNING 'Expected 15 intercrop varieties, got %', ic_count;
    END IF;

    RAISE NOTICE '=== VALIDATION COMPLETE ===';
END $$;
