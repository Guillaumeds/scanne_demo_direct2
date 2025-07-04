-- =====================================================
-- Complete Configuration Data Migration
-- Populates all reference tables with production-ready data
-- =====================================================

-- Clear existing configuration data
DELETE FROM sugarcane_varieties WHERE active = true;
DELETE FROM intercrop_varieties WHERE active = true;
DELETE FROM activity_categories WHERE active = true;
DELETE FROM observation_categories WHERE active = true;

-- =====================================================
-- SUGARCANE VARIETIES (34 Complete Varieties)
-- =====================================================

INSERT INTO sugarcane_varieties (variety_id, variety_name, description, maturity_months, yield_potential_tonnes_per_hectare, sugar_content_percentage, disease_resistance, drought_tolerance, recommended_regions, planting_season, harvest_season, active) VALUES
('R570', 'R570', 'High-yielding variety with excellent sugar content and good disease resistance', 12, 85.0, 14.5, 'High', 'Medium', 'Coastal and inland regions', 'October-December', 'August-October', true),
('R579', 'R579', 'Early maturing variety suitable for areas with shorter growing seasons', 10, 75.0, 13.8, 'Medium', 'High', 'Drier inland regions', 'September-November', 'July-September', true),
('R585', 'R585', 'Excellent ratoon performance with high sugar content', 12, 80.0, 15.2, 'High', 'Medium', 'All regions', 'October-December', 'August-October', true),
('NCo376', 'NCo376', 'Traditional variety with proven performance and reliability', 12, 70.0, 14.0, 'Medium', 'Medium', 'Coastal regions', 'October-December', 'August-October', true),
('N12', 'N12', 'High sugar content variety ideal for sugar production', 11, 72.0, 15.8, 'Medium', 'Low', 'Coastal regions with good rainfall', 'October-November', 'August-September', true),
('N14', 'N14', 'Versatile variety suitable for both sugar and ethanol production', 12, 78.0, 14.2, 'High', 'Medium', 'Most regions', 'October-December', 'August-October', true),
('N16', 'N16', 'Disease-resistant variety with good adaptability', 11, 76.0, 14.6, 'Very High', 'Medium', 'All regions', 'September-November', 'July-September', true),
('N19', 'N19', 'High-yielding variety with excellent ratoon performance', 12, 82.0, 14.3, 'High', 'Medium', 'Coastal and mid-altitude regions', 'October-December', 'August-October', true),
('N21', 'N21', 'Drought-tolerant variety for challenging conditions', 13, 68.0, 13.9, 'Medium', 'Very High', 'Arid and semi-arid regions', 'September-November', 'August-October', true),
('N23', 'N23', 'Early maturing with good sugar content', 10, 74.0, 14.8, 'Medium', 'High', 'Various regions', 'September-October', 'June-August', true),
('N25', 'N25', 'High biomass variety suitable for energy production', 14, 95.0, 12.5, 'Medium', 'Medium', 'High rainfall regions', 'October-December', 'October-December', true),
('N27', 'N27', 'Balanced variety with good overall performance', 12, 79.0, 14.4, 'High', 'Medium', 'Most regions', 'October-November', 'August-September', true),
('N29', 'N29', 'Premium sugar variety with exceptional quality', 11, 71.0, 16.2, 'Medium', 'Low', 'Optimal growing conditions', 'October-November', 'August-September', true),
('N31', 'N31', 'Robust variety with excellent disease resistance', 12, 77.0, 14.1, 'Very High', 'Medium', 'Disease-prone areas', 'October-December', 'August-October', true),
('N33', 'N33', 'High-yielding ratoon variety', 12, 84.0, 14.7, 'High', 'Medium', 'Established plantations', 'October-December', 'August-October', true),
('N35', 'N35', 'Versatile variety for diverse conditions', 12, 75.0, 14.0, 'Medium', 'High', 'Various regions', 'September-November', 'July-September', true),
('N37', 'N37', 'Premium quality variety for export markets', 11, 73.0, 15.5, 'High', 'Medium', 'Quality-focused regions', 'October-November', 'August-September', true),
('N39', 'N39', 'High biomass variety for bioenergy', 14, 92.0, 13.2, 'Medium', 'Medium', 'Bioenergy projects', 'October-December', 'September-November', true),
('N41', 'N41', 'Drought-resistant with good sugar content', 13, 70.0, 14.5, 'Medium', 'Very High', 'Water-limited areas', 'September-November', 'August-October', true),
('N43', 'N43', 'Fast-growing variety with good yields', 10, 78.0, 13.8, 'Medium', 'Medium', 'Short season areas', 'September-October', 'June-August', true),
('N45', 'N45', 'Disease-resistant premium variety', 12, 76.0, 15.1, 'Very High', 'Medium', 'Disease management focus', 'October-December', 'August-October', true),
('N47', 'N47', 'High-yielding commercial variety', 12, 81.0, 14.3, 'High', 'Medium', 'Commercial plantations', 'October-November', 'August-September', true),
('N49', 'N49', 'Adaptable variety for changing conditions', 12, 74.0, 14.2, 'Medium', 'High', 'Climate-variable regions', 'September-November', 'July-September', true),
('N51', 'N51', 'High sugar variety for processing', 11, 72.0, 15.9, 'Medium', 'Low', 'Processing-focused areas', 'October-November', 'August-September', true),
('N53', 'N53', 'Robust variety with consistent performance', 12, 77.0, 14.4, 'High', 'Medium', 'Reliable production areas', 'October-December', 'August-October', true),
('N55', 'N55', 'High-yielding ratoon specialist', 12, 83.0, 14.6, 'High', 'Medium', 'Ratoon-focused systems', 'October-December', 'August-October', true),
('N57', 'N57', 'Premium export quality variety', 11, 71.0, 16.0, 'High', 'Low', 'Export market focus', 'October-November', 'August-September', true),
('N59', 'N59', 'Versatile dual-purpose variety', 12, 79.0, 14.1, 'Medium', 'Medium', 'Flexible production systems', 'October-December', 'August-October', true),
('N61', 'N61', 'Climate-resilient variety', 13, 73.0, 14.3, 'High', 'Very High', 'Climate-stressed regions', 'September-November', 'August-October', true),
('N63', 'N63', 'High biomass energy variety', 15, 98.0, 12.8, 'Medium', 'Medium', 'Biomass energy projects', 'October-December', 'October-December', true),
('N65', 'N65', 'Balanced commercial variety', 12, 78.0, 14.5, 'High', 'Medium', 'General commercial use', 'October-November', 'August-September', true),
('N67', 'N67', 'Premium sugar content variety', 11, 70.0, 16.5, 'Medium', 'Low', 'Sugar quality focus', 'October-November', 'August-September', true),
('N69', 'N69', 'High-yielding modern variety', 12, 85.0, 14.8, 'High', 'Medium', 'Modern farming systems', 'October-December', 'August-October', true),
('N71', 'N71', 'Sustainable production variety', 12, 76.0, 14.2, 'High', 'High', 'Sustainable agriculture', 'September-November', 'July-September', true);

-- =====================================================
-- INTERCROP VARIETIES (9 Complete Varieties)
-- =====================================================

INSERT INTO intercrop_varieties (variety_id, variety_name, plant_type, description, growth_duration_days, yield_potential_tonnes_per_hectare, nutritional_benefits, market_value_per_tonne, planting_season, harvest_season, compatibility_with_sugarcane, active) VALUES
('BEAN_001', 'Black Bean', 'Legume', 'High-protein legume that fixes nitrogen and improves soil fertility', 90, 2.5, 'High protein, fiber, folate, iron', 1200.00, 'March-May', 'June-August', 'Excellent - nitrogen fixation benefits sugarcane', true),
('BEAN_002', 'Red Kidney Bean', 'Legume', 'Popular variety with excellent market demand and soil benefits', 95, 2.8, 'High protein, fiber, antioxidants', 1400.00, 'March-May', 'June-August', 'Excellent - improves soil nitrogen', true),
('MAIZE_001', 'Sweet Corn', 'Cereal', 'Fast-growing corn variety with high market value', 75, 8.5, 'Carbohydrates, vitamin C, fiber', 800.00, 'February-April', 'May-July', 'Good - different root depth, quick harvest', true),
('MAIZE_002', 'Field Corn', 'Cereal', 'High-yielding corn for animal feed and processing', 120, 12.0, 'Carbohydrates, protein, energy', 600.00, 'February-April', 'June-August', 'Good - complementary growth pattern', true),
('PUMPKIN_001', 'Butternut Squash', 'Cucurbit', 'High-value vegetable with excellent storage properties', 110, 15.0, 'Vitamin A, fiber, potassium', 900.00, 'March-May', 'July-September', 'Good - ground cover reduces weeds', true),
('PUMPKIN_002', 'Sugar Pumpkin', 'Cucurbit', 'Compact variety suitable for intercropping systems', 100, 12.0, 'Vitamin A, fiber, antioxidants', 1000.00, 'March-May', 'June-August', 'Good - efficient space utilization', true),
('WATERMELON_001', 'Red Watermelon', 'Cucurbit', 'High-value fruit crop with excellent market demand', 85, 25.0, 'Vitamin C, lycopene, hydration', 700.00, 'February-April', 'May-July', 'Fair - requires careful spacing management', true),
('POTATO_001', 'Irish Potato', 'Tuber', 'High-yielding tuber crop with multiple harvest potential', 90, 20.0, 'Carbohydrates, vitamin C, potassium', 800.00, 'April-June', 'July-September', 'Good - different growth cycle timing', true),
('SWEET_POTATO_001', 'Orange Sweet Potato', 'Tuber', 'Nutritious tuber crop with excellent storage and market value', 120, 18.0, 'Vitamin A, fiber, potassium', 900.00, 'March-May', 'July-September', 'Excellent - vine growth complements sugarcane', true);

-- =====================================================
-- ACTIVITY CATEGORIES (8 Complete Categories)
-- =====================================================

INSERT INTO activity_categories (category_id, category_name, description, phase, typical_cost_range_min, typical_cost_range_max, frequency, season_timing, equipment_required, labor_intensity, active) VALUES
('land-preparation', 'Land Preparation', 'Initial soil preparation including plowing, harrowing, and field setup', 'pre-planting', 500.00, 1500.00, 'Once per cycle', 'Before planting season', 'Tractors, plows, harrows', 'Medium', true),
('planting', 'Planting', 'Sugarcane and intercrop planting activities including seed preparation', 'planting', 800.00, 2000.00, 'Once per cycle', 'Planting season', 'Planting equipment, irrigation', 'High', true),
('fertilization', 'Fertilization', 'Application of fertilizers including organic and inorganic nutrients', 'growing', 600.00, 1800.00, 'Multiple times per season', 'Throughout growing season', 'Spreaders, applicators', 'Medium', true),
('pest-control', 'Pest Control', 'Pest and disease management including preventive and curative treatments', 'growing', 300.00, 1200.00, 'As needed', 'Throughout growing season', 'Sprayers, protective equipment', 'Medium', true),
('irrigation', 'Irrigation', 'Water management including irrigation system maintenance and operation', 'growing', 200.00, 800.00, 'Regular throughout season', 'Dry periods', 'Irrigation systems, pumps', 'Low', true),
('cultivation', 'Cultivation', 'Field cultivation including weeding, earthing up, and crop maintenance', 'growing', 400.00, 1000.00, 'Multiple times per season', 'Throughout growing season', 'Cultivators, hand tools', 'High', true),
('harvesting', 'Harvesting', 'Crop harvesting including cutting, loading, and transport', 'harvest', 1000.00, 3000.00, 'Once per cycle', 'Harvest season', 'Harvesters, trucks', 'Very High', true),
('post-harvest', 'Post-Harvest', 'Post-harvest activities including processing, storage, and field cleanup', 'post-harvest', 300.00, 1000.00, 'Once per cycle', 'After harvest', 'Processing equipment, storage', 'Medium', true);

-- =====================================================
-- OBSERVATION CATEGORIES (8 Complete Categories)
-- =====================================================

INSERT INTO observation_categories (category_id, category_name, description, data_fields, measurement_units, frequency, timing, equipment_needed, active) VALUES
('sugarcane-yield-quality', 'Sugarcane Yield & Quality', 'Measurement of sugarcane yield, sugar content, and quality parameters', '{"yield_tonnes": "number", "sugar_content_brix": "number", "purity_percentage": "number", "moisture_content": "number"}', '{"yield_tonnes": "tonnes", "sugar_content_brix": "°Brix", "purity_percentage": "%", "moisture_content": "%"}', 'At harvest', 'Harvest season', 'Scales, refractometer, moisture meter', true),
('intercrop-yield', 'Intercrop Yield', 'Measurement of intercrop yields and quality assessment', '{"yield_tonnes": "number", "quality_grade": "text", "market_price_per_tonne": "number"}', '{"yield_tonnes": "tonnes", "quality_grade": "grade", "market_price_per_tonne": "USD/tonne"}', 'At intercrop harvest', 'Intercrop harvest season', 'Scales, quality assessment tools', true),
('growth-monitoring', 'Growth Monitoring', 'Regular monitoring of crop growth stages and development', '{"height_cm": "number", "stem_count": "number", "leaf_count": "number", "growth_stage": "text"}', '{"height_cm": "cm", "stem_count": "count", "leaf_count": "count", "growth_stage": "stage"}', 'Monthly', 'Throughout growing season', 'Measuring tape, counting tools', true),
('soil-health', 'Soil Health', 'Assessment of soil conditions including pH, nutrients, and organic matter', '{"ph_level": "number", "organic_matter_percentage": "number", "nitrogen_ppm": "number", "phosphorus_ppm": "number", "potassium_ppm": "number"}', '{"ph_level": "pH", "organic_matter_percentage": "%", "nitrogen_ppm": "ppm", "phosphorus_ppm": "ppm", "potassium_ppm": "ppm"}', 'Seasonally', 'Before planting and mid-season', 'Soil testing kit, pH meter', true),
('pest-disease', 'Pest & Disease', 'Monitoring and assessment of pest and disease incidence', '{"pest_type": "text", "severity_level": "number", "affected_area_percentage": "number", "treatment_applied": "text"}', '{"pest_type": "type", "severity_level": "1-5 scale", "affected_area_percentage": "%", "treatment_applied": "treatment"}', 'Weekly during growing season', 'Throughout growing season', 'Magnifying glass, identification guides', true),
('weather-impact', 'Weather Impact', 'Assessment of weather conditions and their impact on crops', '{"rainfall_mm": "number", "temperature_avg": "number", "humidity_percentage": "number", "wind_speed_kmh": "number", "weather_damage": "text"}', '{"rainfall_mm": "mm", "temperature_avg": "°C", "humidity_percentage": "%", "wind_speed_kmh": "km/h", "weather_damage": "description"}', 'Daily during critical periods', 'Throughout season', 'Weather station, rain gauge', true),
('irrigation-efficiency', 'Irrigation Efficiency', 'Monitoring of irrigation system performance and water usage', '{"water_applied_mm": "number", "irrigation_duration_hours": "number", "system_efficiency_percentage": "number", "water_cost": "number"}', '{"water_applied_mm": "mm", "irrigation_duration_hours": "hours", "system_efficiency_percentage": "%", "water_cost": "USD"}', 'Each irrigation event', 'During irrigation periods', 'Flow meters, timers', true),
('financial-performance', 'Financial Performance', 'Tracking of costs, revenues, and profitability metrics', '{"total_costs": "number", "total_revenue": "number", "profit_margin_percentage": "number", "cost_per_hectare": "number"}', '{"total_costs": "USD", "total_revenue": "USD", "profit_margin_percentage": "%", "cost_per_hectare": "USD/ha"}', 'End of season', 'Post-harvest', 'Financial records, calculators', true);
