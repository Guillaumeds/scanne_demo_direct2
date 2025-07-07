-- Migration: Populate Master Data Tables

-- ============================================================================
-- SUGARCANE VARIETIES (34 varieties)
-- ============================================================================

INSERT INTO public.sugarcane_varieties (variety_id, name, category, harvest_start_month, harvest_end_month, seasons, soil_types, sugar_content_percent, characteristics, description, image_url, information_leaflet_url, active) VALUES
('m-1176-77', 'M 1176/77', 'Sugarcane Variety', 'Aug', 'Sep', '["Aug","Sep"]', '["L1","L2","P1","P2","P3"]', NULL, '{}', NULL, NULL, NULL, TRUE),
('m-52-78', 'M 52/78', 'Sugarcane Variety', 'Jun', 'Aug', '["Jun","Jul","Aug"]', '["B1","B2","F1","F2","H1","H2","L2"]', NULL, '{}', NULL, NULL, NULL, TRUE),
('m-387-85', 'M 387/85', 'Sugarcane Variety', 'Jul', 'Oct', '["Jul","Aug","Sep","Oct"]', '["B1","B2"]', NULL, '{}', NULL, NULL, NULL, TRUE),
('m-1400-86', 'M 1400/86', 'Sugarcane Variety', 'Aug', 'Sep', '["Aug","Sep"]', '["B1","B2","F1","F2","H1","H2","L1","L2","P1","P2","P3"]', NULL, '{}', NULL, NULL, NULL, TRUE),
('m-2256-88', 'M 2256/88', 'Sugarcane Variety', 'Jun', 'Sep', '["Jun","Jul","Aug","Sep"]', '["B1","B2","F1","F2","H1","H2","L1","L2","P1","P2","P3"]', NULL, '{}', NULL, NULL, NULL, TRUE),
('m-703-89', 'M 703/89', 'Sugarcane Variety', 'Jun', 'Jul', '["Jun","Jul"]', '["H1","H2","L1","L2"]', NULL, '{}', NULL, NULL, NULL, TRUE),
('m-1861-89', 'M 1861/89', 'Sugarcane Variety', 'Aug', 'Nov', '["Aug","Sep","Oct","Nov"]', '["B1","B2","F1","F2","H1","H2"]', NULL, '{}', NULL, NULL, NULL, TRUE),
('m-1672-90', 'M 1672/90', 'Sugarcane Variety', 'Aug', 'Nov', '["Aug","Sep","Oct","Nov"]', '["L1","L2","P1","P2","P3"]', NULL, '{}', NULL, NULL, NULL, TRUE),
('m-2593-92', 'M 2593/92', 'Sugarcane Variety', 'Aug', 'Nov', '["Aug","Sep","Oct","Nov"]', '["H1","H2","L1","L2","P1","P2","P3"]', NULL, '{}', NULL, '/sugarcane_varieties_leaflets/m2593.pdf', TRUE),
('m-2283-98', 'M 2283/98', 'Sugarcane Variety', 'Aug', 'Nov', '["Aug","Sep","Oct","Nov"]', '["B1","B2","F1","F2"]', NULL, '{}', NULL, '/images/varieties/m-2283-98.jpg', 'http://www.msiri.mu/UserFiles/File/sugarcane%20pamphlets/M%2283-98.pdf', TRUE),
('m-683-99', 'M 683/99', 'Sugarcane Variety', 'Aug', 'Nov', '["Aug","Sep","Oct","Nov"]', '["L1","L2","P1","P2","P3"]', NULL, '{}', NULL, NULL, 'http://www.msiri.mu/UserFiles/File/sugarcane%20pamphlets/M%20683-99.pdf', TRUE),
('m-1989-99', 'M 1989/99', 'Sugarcane Variety', 'Aug', 'Oct', '["Aug","Sep","Oct"]', '["L1","L2","P1","P2","P3"]', NULL, '{}', NULL, NULL, 'http://www.msiri.mu/UserFiles/File/sugarcane%20pamphlets/M%201989-99.pdf', TRUE),
('m-2502-99', 'M 2502/99', 'Sugarcane Variety', 'Aug', 'Oct', '["Aug","Sep","Oct"]', '["B1","B2","F1","F2","P1","P2","P3"]', NULL, '{}', NULL, NULL, 'http://www.msiri.mu/UserFiles/File/sugarcane%20pamphlets/M%202502-99.pdf', TRUE),
('m-1392-00', 'M 1392/00', 'Sugarcane Variety', 'Jul', 'Oct', '["Jul","Aug","Sep","Oct"]', '["B1","B2","F1","F2","L1","L2","P1","P2","P3"]', NULL, '{}', NULL, '/images/varieties/m-1392-00.jpg', 'http://www.msiri.mu/UserFiles/File/sugarcane%20pamphlets/M%201392-00.pdf', TRUE),
('m-63', 'M 63', 'Sugarcane Variety', 'Aug', 'Oct', '["Aug","Sep","Oct"]', '["L1","L2","P1","P2","P3"]', NULL, '{}', NULL, NULL, NULL, TRUE),
('m-1561-01', 'M 1561/01', 'Sugarcane Variety', 'Jun', 'Oct', '["Jun","Jul","Aug","Sep","Oct"]', '["B1","B2"]', NULL, '{}', NULL, NULL, NULL, TRUE),
('m-216-02', 'M 216/02', 'Sugarcane Variety', 'Jun', 'Oct', '["Jun","Jul","Aug","Sep","Oct"]', '["L1","L2","P1","P2","P3"]', NULL, '{}', NULL, NULL, NULL, TRUE),
('m-1002-02', 'M 1002/02', 'Sugarcane Variety', 'Aug', 'Nov', '["Aug","Sep","Oct","Nov"]', '["L1","L2","P1","P2","P3"]', NULL, '{}', NULL, NULL, 'http://www.msiri.mu/UserFiles/File/sugarcane%20pamphlets/M%201002-02.pdf', TRUE),
('m-1698-02', 'M 1698/02', 'Sugarcane Variety', 'Aug', 'Nov', '["Aug","Sep","Oct","Nov"]', '["L1","L2","P1","P2","P3"]', NULL, '{}', NULL, NULL, NULL, TRUE),
('m-64', 'M 64', 'Sugarcane Variety', 'Aug', 'Nov', '["Aug","Sep","Oct","Nov"]', '["B1","B2","F1","F2"]', NULL, '{}', NULL, NULL, NULL, TRUE),
('m-1256-04', 'M 1256/04', 'Sugarcane Variety', 'Aug', 'Oct', '["Aug","Sep","Oct"]', '["L1","L2","P1","P2","P3"]', NULL, '{}', NULL, NULL, 'http://www.msiri.mu/UserFiles/File/sugarcane%20pamphlets/M%201256-04.pdf', TRUE),
('m-915-05', 'M 915/05', 'Sugarcane Variety', 'Aug', 'Nov', '["Aug","Sep","Oct","Nov"]', '["B1","B2","F1","F2","H1","H2","L1","L2","P1","P2","P3"]', NULL, '{}', NULL, NULL, 'http://www.msiri.mu/UserFiles/File/sugarcane%20pamphlets/M%20915-05.pdf', TRUE),
('m-65', 'M 65', 'Sugarcane Variety', 'Aug', 'Oct', '["Aug","Sep","Oct"]', '["B1","B2","P1","P2","P3"]', NULL, '{}', NULL, NULL, NULL, TRUE),
('r573', 'R573', 'Sugarcane Variety', 'Jul', 'Sep', '["Jul","Aug","Sep"]', '["H1","H2","L1","L2","P1","P2","P3"]', NULL, '{}', NULL, NULL, NULL, TRUE),
('r575', 'R575', 'Sugarcane Variety', 'Jun', 'Aug', '["Jun","Jul","Aug"]', '["H1","H2","L1","L2","P1","P2","P3"]', NULL, '{}', NULL, NULL, 'https://www.ercane.re/nos-varietes/r-575/', TRUE),
('r579', 'R579', 'Sugarcane Variety', 'Oct', 'Dec', '["Oct","Nov","Dec"]', '["H1","H2","L2","P1","P2","P3"]', NULL, '{}', NULL, NULL, 'https://www.ercane.re/nos-varietes/r-579/', TRUE),
('m-3035-66', 'M 3035/66', 'Sugarcane Variety', 'Aug', 'Dec', '["Aug","Sep","Oct","Nov","Dec"]', '["B1","B2","F1","F2","H1","H2"]', NULL, '{}', NULL, NULL, NULL, TRUE),
('m-1246-84', 'M 1246/84', 'Sugarcane Variety', 'Aug', 'Sep', '["Aug","Sep"]', '["H1","H2","L1","L2","P1","P2","P3"]', NULL, '{}', NULL, NULL, NULL, TRUE),
('m-1394-86', 'M 1394/86', 'Sugarcane Variety', 'Aug', 'Nov', '["Aug","Sep","Oct","Nov"]', '["B1","B2","F1","F2","H1","H2"]', NULL, '{}', NULL, NULL, NULL, TRUE),
('m-2024-88', 'M 2024/88', 'Sugarcane Variety', 'Jun', 'Aug', '["Jun","Jul","Aug"]', '["L1","L2","P1","P2","P3"]', NULL, '{}', NULL, NULL, NULL, TRUE),
('m-2238-89', 'M 2238/89', 'Sugarcane Variety', 'Aug', 'Nov', '["Aug","Sep","Oct","Nov"]', '["B1","B2"]', NULL, '{}', NULL, NULL, NULL, TRUE),
('r570', 'R570', 'Sugarcane Variety', 'Sep', 'Dec', '["Sep","Oct","Nov","Dec"]', '["H1","H2","L1","L2","P1","P2","P3"]', NULL, '{}', NULL, NULL, 'https://www.ercane.re/nos-varietes/r-570/', TRUE),
('r585', 'R585', 'Sugarcane Variety', 'Aug', 'Nov', '["Aug","Sep","Oct","Nov"]', NULL, NULL, '{}', NULL, NULL, 'https://www.ercane.re/nos-varietes/r-585/', TRUE);

-- ============================================================================
-- INTERCROP VARIETIES (16 varieties)
-- ============================================================================

INSERT INTO public.intercrop_varieties (variety_id, name, scientific_name, category, benefits, planting_time, harvest_time, description, image_url, active) VALUES
('none', 'None', NULL, 'intercrop', '["No intercrop selected","Monoculture sugarcane"]', NULL, NULL, 'No intercrop companion plant selected', NULL, TRUE),
('cowpea', 'Cowpea', 'Vigna unguiculata', 'intercrop', '["Nitrogen fixation","Soil improvement","Additional income","Ground cover"]', 'Early rainy season', '60-90 days', 'Fast-growing legume that fixes nitrogen and provides ground cover', 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Vigna_unguiculata_Blanco2.286-cropped.jpg/300px-Vigna_unguiculata_Blanco2.286-cropped.jpg', TRUE),
('blackeyed-pea', 'Black-eyed Pea', 'Vigna unguiculata subsp. unguiculata', 'intercrop', '["Nitrogen fixation","Drought tolerance","Food security","Market value"]', 'Early to mid rainy season', '70-100 days', 'Drought-tolerant legume with high protein content', 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Vigna_unguiculata_Blanco2.286-cropped.jpg/300px-Vigna_unguiculata_Blanco2.286-cropped.jpg', TRUE),
('soybean', 'Soybean', 'Glycine max', 'intercrop', '["High nitrogen fixation","Protein rich","Oil production","Soil structure improvement"]', 'Early rainy season', '90-120 days', 'High-value legume crop with excellent nitrogen fixation capacity', 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Soybean.USDA.jpg/300px-Soybean.USDA.jpg', TRUE),
('groundnut', 'Groundnut', 'Arachis hypogaea', 'intercrop', '["Nitrogen fixation","High value crop","Oil production","Food security"]', 'Early to mid rainy season', '90-120 days', 'High-value legume with underground pods', 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Arachis_hypogaea_003.JPG/300px-Arachis_hypogaea_003.JPG', TRUE),
('mung-bean', 'Mung Bean', 'Vigna radiata', 'intercrop', '["Fast nitrogen fixation","Quick maturity","Multiple harvests","Green manure"]', 'Throughout rainy season', '60-75 days', 'Fast-growing legume suitable for multiple cropping', 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Vigna_unguiculata_Blanco2.286-cropped.jpg/300px-Vigna_unguiculata_Blanco2.286-cropped.jpg', TRUE),
('pigeon-pea', 'Pigeon Pea', 'Cajanus cajan', 'intercrop', '["Long-term nitrogen fixation","Perennial benefits","Windbreak","Deep rooting"]', 'Early rainy season', '150-180 days', 'Long-duration legume providing sustained benefits', 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Vigna_unguiculata_Blanco2.286-cropped.jpg/300px-Vigna_unguiculata_Blanco2.286-cropped.jpg', TRUE),
('lima-bean', 'Lima Bean', 'Phaseolus lunatus', 'intercrop', '["Nitrogen fixation","Climbing habit","Space efficient","High protein"]', 'Early rainy season', '90-110 days', 'Climbing legume that maximizes space utilization', 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Vigna_unguiculata_Blanco2.286-cropped.jpg/300px-Vigna_unguiculata_Blanco2.286-cropped.jpg', TRUE),
('common-bean', 'Common Bean', 'Phaseolus vulgaris', 'intercrop', '["Nitrogen fixation","Fast growth","Market demand","Protein source"]', 'Mid rainy season', '75-95 days', 'Popular legume with good market demand', 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Vigna_unguiculata_Blanco2.286-cropped.jpg/300px-Vigna_unguiculata_Blanco2.286-cropped.jpg', TRUE),
('lablab', 'Lablab', 'Lablab purpureus', 'intercrop', '["Nitrogen fixation","Fodder value","Drought tolerance","Soil improvement"]', 'Early to mid rainy season', '90-120 days', 'Multipurpose legume for food and fodder', 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Vigna_unguiculata_Blanco2.286-cropped.jpg/300px-Vigna_unguiculata_Blanco2.286-cropped.jpg', TRUE),
('sweet-potato', 'Sweet Potato', 'Ipomoea batatas', 'intercrop', '["Ground cover","Tuber production","Erosion control","Quick establishment"]', 'Early rainy season', '90-120 days', 'Ground covering crop with edible tubers', 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Vigna_unguiculata_Blanco2.286-cropped.jpg/300px-Vigna_unguiculata_Blanco2.286-cropped.jpg', TRUE),
('cassava', 'Cassava', 'Manihot esculenta', 'intercrop', '["Drought tolerance","Long storage","Food security","Starch production"]', 'Early rainy season', '8-12 months', 'Drought-tolerant root crop for food security', 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Vigna_unguiculata_Blanco2.286-cropped.jpg/300px-Vigna_unguiculata_Blanco2.286-cropped.jpg', TRUE),
('maize', 'Maize', 'Zea mays', 'intercrop', '["Quick cash crop","Food security","Biomass production","Market demand"]', 'Early rainy season', '90-120 days', 'Fast-growing cereal crop with good market value', 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Vigna_unguiculata_Blanco2.286-cropped.jpg/300px-Vigna_unguiculata_Blanco2.286-cropped.jpg', TRUE),
('sorghum', 'Sorghum', 'Sorghum bicolor', 'intercrop', '["Drought tolerance","Fodder value","Grain production","Biomass"]', 'Early to mid rainy season', '100-130 days', 'Drought-tolerant cereal suitable for dry conditions', 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Vigna_unguiculata_Blanco2.286-cropped.jpg/300px-Vigna_unguiculata_Blanco2.286-cropped.jpg', TRUE),
('fieldpea', 'Field Pea', 'Pisum arvense', 'intercrop', '["Nitrogen fixation","Cool season adaptation","Fodder value","Soil improvement"]', 'Winter season', '90-110 days', 'Cool season legume that provides both grain and fodder', 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Vigna_unguiculata_Blanco2.286-cropped.jpg/300px-Vigna_unguiculata_Blanco2.286-cropped.jpg', TRUE);

-- ============================================================================
-- PRODUCTS (40 products)
-- ============================================================================

INSERT INTO public.products (product_id, name, category, subcategory, unit, cost_per_unit, supplier, description, image_url, information_leaflet_url, active) VALUES
('npk-13-13-20', '13-13-20+2MgO', 'compound-npk', 'Compound and NPK Fertilizers', 'kg', 45, NULL, NULL, NULL, NULL, TRUE),
('npk-13-8-24', '13:8:24', 'compound-npk', 'Compound and NPK Fertilizers', 'kg', 42, NULL, NULL, NULL, NULL, TRUE),
('npk-12-8-20', '12:8:20', 'compound-npk', 'Compound and NPK Fertilizers', 'kg', 40, NULL, NULL, NULL, NULL, TRUE),
('npk-12-12-17', '12:12:17', 'compound-npk', 'Compound and NPK Fertilizers', 'kg', 38, NULL, NULL, NULL, NULL, TRUE),
('npk-19-19-19', '19:19:19', 'compound-npk', 'Compound and NPK Fertilizers', 'kg', 50, NULL, NULL, NULL, NULL, TRUE),
('npk-20-20-20', '20:20:20', 'compound-npk', 'Compound and NPK Fertilizers', 'kg', 52, NULL, NULL, NULL, NULL, TRUE),
('npk-8-10-40', '8:10:40', 'compound-npk', 'Compound and NPK Fertilizers', 'kg', 48, NULL, NULL, NULL, NULL, TRUE),
('npk-11-8-6', '11-8-6 (Co-Vert)', 'compound-npk', 'Compound and NPK Fertilizers', 'kg', 35, NULL, NULL, NULL, NULL, TRUE),
('npk-nitrate-blends', 'Nitrate Based NPK Blends', 'compound-npk', 'Compound and NPK Fertilizers', 'kg', 55, NULL, NULL, NULL, NULL, TRUE),
('azophoska', 'Azophoska (13-13-20+2 micro)', 'compound-npk', 'Compound and NPK Fertilizers', 'kg', 48, NULL, NULL, NULL, NULL, TRUE),
('bluefficient', 'Bluefficient Fertilizer (10-10-20+2MgO+micro)', 'compound-npk', 'Compound and NPK Fertilizers', 'kg', 50, NULL, NULL, NULL, NULL, TRUE),
('fairway-master', 'Fairway Master', 'compound-npk', 'Compound and NPK Fertilizers', 'kg', 60, NULL, NULL, NULL, NULL, TRUE),
('icl-sierrablen', 'ICL Sierrablen Plus Granular Fertiliser', 'compound-npk', 'Compound and NPK Fertilizers', 'kg', 65, NULL, NULL, NULL, NULL, TRUE),
('ammonium-sulphate-crystal', 'Ammonium Sulphate 21% (Crystal)', 'nitrogen', 'Nitrogen Fertilizers', 'kg', 25, NULL, NULL, NULL, NULL, TRUE),
('ammonium-sulphate-granular', 'Ammonium Sulphate 21% (Granular)', 'nitrogen', 'Nitrogen Fertilizers', 'kg', 27, NULL, NULL, NULL, NULL, TRUE),
('urea-46', 'Urea (46% N Granular)', 'nitrogen', 'Nitrogen Fertilizers', 'kg', 30, NULL, NULL, NULL, NULL, TRUE),
('nano-urea-plus', 'NANO Urea Plus (Kalol)', 'nitrogen', 'Nitrogen Fertilizers', 'L', 120, NULL, NULL, NULL, NULL, TRUE),
('nano-dap', 'NANO DAP', 'nitrogen', 'Nitrogen Fertilizers', 'L', 125, NULL, NULL, NULL, NULL, TRUE),
('map', 'Monoammonium Phosphate (MAP)', 'phosphorus-potassium', 'Phosphorus and Potassium Fertilizers', 'kg', 55, NULL, NULL, NULL, NULL, TRUE),
('mkp', 'Mono Potassium Phosphate (MKP 0-52-34)', 'phosphorus-potassium', 'Phosphorus and Potassium Fertilizers', 'kg', 85, NULL, NULL, NULL, NULL, TRUE),
('potassium-nitrate', 'Potassium Nitrate', 'phosphorus-potassium', 'Phosphorus and Potassium Fertilizers', 'kg', 90, NULL, NULL, NULL, NULL, TRUE),
('potassium-sulphate', 'Potassium Sulphate (SOP 0-0-50+46SO3)', 'phosphorus-potassium', 'Phosphorus and Potassium Fertilizers', 'kg', 80, NULL, NULL, NULL, NULL, TRUE),
('nova-calcium-nitrate', 'Nova Calcium Nitrate (15.5-0-0+26.5CaO)', 'calcium-magnesium', 'Calcium and Magnesium Fertilizers', 'kg', 45, NULL, NULL, NULL, NULL, TRUE),
('nova-mag-s', 'Nova Mag-S (Magnesium Sulphate 0-0-0+16MgO+32SO3)', 'calcium-magnesium', 'Calcium and Magnesium Fertilizers', 'kg', 40, NULL, NULL, NULL, NULL, TRUE),
('micro-kanieltra', 'Micro elements (Kanieltra)', 'micronutrient', 'Micronutrient and Specialty Fertilizers', 'kg', 150, NULL, NULL, NULL, NULL, TRUE),
('unikey-11-40-10', 'Unikey Nano Professional 11-40-10+2.5MgO+TE', 'micronutrient', 'Micronutrient and Specialty Fertilizers', 'kg', 180, NULL, NULL, NULL, NULL, TRUE),
('unikey-15-5-40', 'Unikey Nano Professional 15-5-40+TE', 'micronutrient', 'Micronutrient and Specialty Fertilizers', 'kg', 175, NULL, NULL, NULL, NULL, TRUE),
('unikey-20-20-20', 'Unikey Nano Professional 20-20-20+2MgO+TE', 'micronutrient', 'Micronutrient and Specialty Fertilizers', 'kg', 185, NULL, NULL, NULL, NULL, TRUE),
('hydro-pack-1', 'Hydro Pack No. 1', 'micronutrient', 'Micronutrient and Specialty Fertilizers', 'kg', 200, NULL, NULL, NULL, NULL, TRUE),
('hydro-pack-2', 'Hydro Pack No. 2', 'micronutrient', 'Micronutrient and Specialty Fertilizers', 'kg', 200, NULL, NULL, NULL, NULL, TRUE),
('hydro-pack-3', 'Hydro Pack No. 3', 'micronutrient', 'Micronutrient and Specialty Fertilizers', 'kg', 200, NULL, NULL, NULL, NULL, TRUE),
('organic-all-purpose', 'All-purpose Organic Fertiliser', 'organic-bio', 'Organic and Bio Fertilizers', 'kg', 20, NULL, NULL, NULL, NULL, TRUE),
('bat-guano', 'Bat Guano Fertilizer', 'organic-bio', 'Organic and Bio Fertilizers', 'kg', 35, NULL, NULL, NULL, NULL, TRUE),
('seabird-guano', 'Seabird Guano', 'organic-bio', 'Organic and Bio Fertilizers', 'kg', 40, NULL, NULL, NULL, NULL, TRUE),
('seaweed-powder', 'Fresh Seaweed and Sargassum (Powder)', 'organic-bio', 'Organic and Bio Fertilizers', 'kg', 25, NULL, NULL, NULL, NULL, TRUE),
('seaweed-liquid', 'Fresh Seaweed and Sargassum (Liquid)', 'organic-bio', 'Organic and Bio Fertilizers', 'L', 30, NULL, NULL, NULL, NULL, TRUE),
('organic-mineral-liquid', 'Organic Mineral Liquid Fertilizers (Made in Moris)', 'organic-bio', 'Organic and Bio Fertilizers', 'L', 45, NULL, NULL, NULL, NULL, TRUE),
('phostrogen', 'Phostrogen (800g)', 'other', 'Other Fertilizer Products', 'pack', 85, NULL, NULL, NULL, NULL, TRUE),
('agroleaf-power', 'Agroleaf Power', 'other', 'Other Fertilizer Products', 'kg', 120, NULL, NULL, NULL, NULL, TRUE);

-- ============================================================================
-- RESOURCES (37 resources)
-- ============================================================================

INSERT INTO public.resources (resource_id, name, category, subcategory, unit, cost_per_unit, description, active) VALUES
('tractor-small', 'Small Tractor (40-60 HP)', 'fleet', 'Fleet & Vehicles', 'hours', 450, NULL, TRUE),
('tractor-medium', 'Medium Tractor (60-90 HP)', 'fleet', 'Fleet & Vehicles', 'hours', 650, NULL, TRUE),
('tractor-large', 'Large Tractor (90+ HP)', 'fleet', 'Fleet & Vehicles', 'hours', 850, NULL, TRUE),
('pickup-truck', 'Pickup Truck', 'fleet', 'Fleet & Vehicles', 'hours', 200, NULL, TRUE),
('utility-vehicle', 'Utility Vehicle (ATV/UTV)', 'fleet', 'Fleet & Vehicles', 'hours', 150, NULL, TRUE),
('field-worker', 'Field Worker', 'labour', 'Labour & Personnel', 'hours', 25, NULL, TRUE),
('skilled-worker', 'Skilled Agricultural Worker', 'labour', 'Labour & Personnel', 'hours', 35, NULL, TRUE),
('machine-operator', 'Machine Operator', 'labour', 'Labour & Personnel', 'hours', 45, NULL, TRUE),
('supervisor', 'Field Supervisor', 'labour', 'Labour & Personnel', 'hours', 60, NULL, TRUE),
('overtime-worker', 'Field Worker (Overtime)', 'labour', 'Labour & Personnel', 'hours', 37.5, NULL, TRUE),
('overtime-skilled', 'Skilled Worker (Overtime)', 'labour', 'Labour & Personnel', 'hours', 52.5, NULL, TRUE),
('seasonal-worker', 'Seasonal Harvest Worker', 'labour', 'Labour & Personnel', 'hours', 30, NULL, TRUE),
('plow', 'Moldboard Plow', 'equipment', 'Equipment & Tools', 'hours', 50, NULL, TRUE),
('disc-harrow', 'Disc Harrow', 'equipment', 'Equipment & Tools', 'hours', 40, NULL, TRUE),
('cultivator', 'Field Cultivator', 'equipment', 'Equipment & Tools', 'hours', 45, NULL, TRUE),
('planter', 'Sugarcane Planter', 'equipment', 'Equipment & Tools', 'hours', 80, NULL, TRUE),
('fertilizer-spreader', 'Fertilizer Spreader', 'equipment', 'Equipment & Tools', 'hours', 35, NULL, TRUE),
('sprayer', 'Field Sprayer', 'equipment', 'Equipment & Tools', 'hours', 60, NULL, TRUE),
('mower', 'Rotary Mower', 'equipment', 'Equipment & Tools', 'hours', 40, NULL, TRUE),
('bulldozer', 'Bulldozer', 'machinery', 'Heavy Machinery', 'hours', 1200, NULL, TRUE),
('excavator', 'Excavator', 'machinery', 'Heavy Machinery', 'hours', 800, NULL, TRUE),
('grader', 'Motor Grader', 'machinery', 'Heavy Machinery', 'hours', 600, NULL, TRUE),
('compactor', 'Soil Compactor', 'machinery', 'Heavy Machinery', 'hours', 400, NULL, TRUE),
('truck-small', 'Small Transport Truck (3-5 tons)', 'transport', 'Transport & Logistics', 'hours', 300, NULL, TRUE),
('truck-large', 'Large Transport Truck (10+ tons)', 'transport', 'Transport & Logistics', 'hours', 500, NULL, TRUE),
('trailer', 'Agricultural Trailer', 'transport', 'Transport & Logistics', 'hours', 100, NULL, TRUE),
('cane-trailer', 'Sugarcane Transport Trailer', 'transport', 'Transport & Logistics', 'hours', 150, NULL, TRUE),
('drip-system', 'Drip Irrigation System', 'irrigation', 'Irrigation Systems', 'hours', 25, NULL, TRUE),
('sprinkler-system', 'Sprinkler Irrigation System', 'irrigation', 'Irrigation Systems', 'hours', 35, NULL, TRUE),
('pump-electric', 'Electric Water Pump', 'irrigation', 'Irrigation Systems', 'hours', 15, NULL, TRUE),
('pump-diesel', 'Diesel Water Pump', 'irrigation', 'Irrigation Systems', 'hours', 25, NULL, TRUE),
('cane-harvester', 'Sugarcane Harvester', 'harvesting', 'Harvesting Equipment', 'hours', 1500, NULL, TRUE),
('cane-loader', 'Sugarcane Loader', 'harvesting', 'Harvesting Equipment', 'hours', 400, NULL, TRUE),
('cane-cutter', 'Manual Cane Cutter', 'harvesting', 'Harvesting Equipment', 'hours', 35, NULL, TRUE),
('weighing-scale', 'Field Weighing Scale', 'processing', 'Processing Equipment', 'hours', 50, NULL, TRUE),
('field-trailer', 'Field Collection Trailer', 'processing', 'Processing Equipment', 'hours', 75, NULL, TRUE);

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

-- Update table statistics
ANALYZE public.sugarcane_varieties;
ANALYZE public.intercrop_varieties;
ANALYZE public.products;
ANALYZE public.resources;

-- Verify data counts
DO $$
BEGIN
    RAISE NOTICE 'Migration completed successfully:';
    RAISE NOTICE '- Sugarcane varieties: % records', (SELECT COUNT(*) FROM public.sugarcane_varieties);
    RAISE NOTICE '- Intercrop varieties: % records', (SELECT COUNT(*) FROM public.intercrop_varieties);
    RAISE NOTICE '- Products: % records', (SELECT COUNT(*) FROM public.products);
    RAISE NOTICE '- Resources: % records', (SELECT COUNT(*) FROM public.resources);
END $$;
