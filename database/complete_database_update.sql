-- =====================================================
-- COMPLETE DATABASE UPDATE SCRIPT
-- =====================================================
-- This script adds all missing tables and populates configuration data
-- Run this script to fully update the database schema and data

-- =====================================================
-- 1. ADD MISSING TABLES (Activities, Observations, Attachments)
-- =====================================================

-- Activities table
CREATE TABLE IF NOT EXISTS activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    phase VARCHAR(100),
    status VARCHAR(50) DEFAULT 'planned' CHECK (status IN ('planned', 'in-progress', 'completed', 'cancelled')),
    crop_cycle_id UUID NOT NULL REFERENCES crop_cycles(id) ON DELETE CASCADE,
    start_date DATE,
    end_date DATE,
    actual_date DATE,
    duration_hours DECIMAL(8,2),
    estimated_total_cost DECIMAL(12,2) DEFAULT 0,
    actual_total_cost DECIMAL(12,2) DEFAULT 0,
    notes TEXT,
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activity products junction table
CREATE TABLE IF NOT EXISTS activity_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    activity_id UUID NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity DECIMAL(10,2) NOT NULL,
    rate_per_hectare DECIMAL(10,2),
    unit VARCHAR(20),
    estimated_cost DECIMAL(12,2) DEFAULT 0,
    actual_cost DECIMAL(12,2) DEFAULT 0,
    actual_quantity_used DECIMAL(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activity resources junction table
CREATE TABLE IF NOT EXISTS activity_resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    activity_id UUID NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
    resource_id UUID NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
    hours_planned DECIMAL(8,2),
    hours_actual DECIMAL(8,2),
    unit VARCHAR(20),
    estimated_cost DECIMAL(12,2) DEFAULT 0,
    actual_cost DECIMAL(12,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Observations table
CREATE TABLE IF NOT EXISTS observations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL,
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'completed', 'reviewed')),
    crop_cycle_id UUID NOT NULL REFERENCES crop_cycles(id) ON DELETE CASCADE,
    observation_date DATE NOT NULL,
    actual_date DATE,
    number_of_samples INTEGER,
    number_of_plants INTEGER,
    observation_data JSONB DEFAULT '{}',
    notes TEXT,
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Attachments table
CREATE TABLE IF NOT EXISTS attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    file_type VARCHAR(50),
    mime_type VARCHAR(100),
    extension VARCHAR(10),
    file_size BIGINT,
    tags TEXT[],
    description TEXT,
    crop_cycle_id UUID REFERENCES crop_cycles(id) ON DELETE CASCADE,
    activity_id UUID REFERENCES activities(id) ON DELETE CASCADE,
    observation_id UUID REFERENCES observations(id) ON DELETE CASCADE,
    storage_path TEXT NOT NULL,
    url TEXT,
    thumbnail_url TEXT,
    uploaded_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 2. ADD INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_activities_crop_cycle ON activities(crop_cycle_id);
CREATE INDEX IF NOT EXISTS idx_activities_status ON activities(status);
CREATE INDEX IF NOT EXISTS idx_activities_phase ON activities(phase);
CREATE INDEX IF NOT EXISTS idx_activity_products_activity ON activity_products(activity_id);
CREATE INDEX IF NOT EXISTS idx_activity_resources_activity ON activity_resources(activity_id);
CREATE INDEX IF NOT EXISTS idx_observations_crop_cycle ON observations(crop_cycle_id);
CREATE INDEX IF NOT EXISTS idx_observations_category ON observations(category);
CREATE INDEX IF NOT EXISTS idx_observations_date ON observations(observation_date);
CREATE INDEX IF NOT EXISTS idx_attachments_crop_cycle ON attachments(crop_cycle_id);
CREATE INDEX IF NOT EXISTS idx_attachments_activity ON attachments(activity_id);
CREATE INDEX IF NOT EXISTS idx_attachments_observation ON attachments(observation_id);

-- =====================================================
-- 3. CLEAR EXISTING CONFIGURATION DATA
-- =====================================================

DELETE FROM activity_categories;
DELETE FROM observation_categories;
DELETE FROM attachment_categories;
DELETE FROM sugarcane_varieties;
DELETE FROM intercrop_varieties;
DELETE FROM products;
DELETE FROM resources;

-- =====================================================
-- 4. POPULATE ACTIVITY CATEGORIES (Complete List)
-- =====================================================

INSERT INTO activity_categories (category_id, name, description, icon, color, active) VALUES
('land-preparation', 'Land Preparation', 'Soil preparation and field setup activities', 'tractor', '#8B5CF6', true),
('planting', 'Planting', 'Seed/cutting planting activities', 'sprout', '#10B981', true),
('fertilization', 'Fertilization', 'Fertilizer application activities', 'leaf', '#F59E0B', true),
('pest-control', 'Pest Control', 'Pesticide and herbicide applications', 'shield', '#EF4444', true),
('irrigation', 'Irrigation', 'Water management and irrigation', 'droplets', '#3B82F6', true),
('cultivation', 'Cultivation', 'Weeding and cultivation activities', 'shovel', '#6B7280', true),
('harvesting', 'Harvesting', 'Crop harvesting activities', 'scissors', '#F97316', true),
('maintenance', 'Maintenance', 'Equipment and infrastructure maintenance', 'wrench', '#8B5CF6', true),
('monitoring', 'Monitoring', 'Field monitoring and inspection activities', 'eye', '#06B6D4', true),
('transport', 'Transport', 'Transportation and logistics activities', 'truck', '#64748B', true);

-- =====================================================
-- 5. POPULATE OBSERVATION CATEGORIES (Complete List)
-- =====================================================

INSERT INTO observation_categories (category_id, name, description, icon, color, active) VALUES
('soil', 'Soil', 'Soil quality and composition observations', 'mountain', '#8B4513', true),
('water', 'Water', 'Water quality and irrigation observations', 'droplets', '#3B82F6', true),
('plant', 'Plant', 'Plant health and growth observations', 'leaf', '#22C55E', true),
('pest', 'Pest', 'Pest and disease observations', 'bug', '#EF4444', true),
('weather', 'Weather', 'Weather and climate observations', 'cloud', '#6B7280', true),
('yield', 'Yield', 'Harvest yield and quality observations', 'bar-chart', '#F59E0B', true),
('equipment', 'Equipment', 'Equipment performance observations', 'cog', '#8B5CF6', true),
('general', 'General', 'General field observations', 'eye', '#64748B', true);

-- =====================================================
-- 6. POPULATE ATTACHMENT CATEGORIES (Complete List)
-- =====================================================

INSERT INTO attachment_categories (category_id, name, description, icon, color, active) VALUES
('photos', 'Photos', 'Field photos and images', 'camera', '#22C55E', true),
('documents', 'Documents', 'Documents and reports', 'file-text', '#3B82F6', true),
('reports', 'Reports', 'Analysis and summary reports', 'bar-chart', '#F59E0B', true),
('certificates', 'Certificates', 'Certificates and compliance documents', 'award', '#8B5CF6', true),
('maps', 'Maps', 'Field maps and spatial data', 'map', '#06B6D4', true),
('receipts', 'Receipts', 'Purchase receipts and invoices', 'receipt', '#10B981', true),
('contracts', 'Contracts', 'Contracts and agreements', 'file-signature', '#EF4444', true),
('other', 'Other', 'Other file types', 'paperclip', '#64748B', true);

-- =====================================================
-- 7. POPULATE SUGARCANE VARIETIES (Complete List)
-- =====================================================

INSERT INTO sugarcane_varieties (variety_id, name, category, harvest_start_month, harvest_end_month, seasons, soil_types, sugar_content_percent, characteristics, description, icon, active) VALUES
('M 1176/77', 'M 1176/77', 'Medium Maturing', 'Aug', 'Sep', ARRAY['Aug', 'Sep'], ARRAY['L1', 'L2', 'P1'], 14.2, '{"disease_resistance": "High", "drought_tolerance": "Medium", "yield_potential": "High"}', 'High-yielding variety suitable for light soils with good disease resistance', 'sprout', true),
('R 570', 'R 570', 'Early Maturing', 'Jul', 'Aug', ARRAY['Jul', 'Aug'], ARRAY['L1', 'L2'], 13.8, '{"disease_resistance": "Medium", "drought_tolerance": "High", "yield_potential": "Medium"}', 'Early maturing variety with excellent drought tolerance', 'sprout', true),
('R 579', 'R 579', 'Medium Maturing', 'Aug', 'Oct', ARRAY['Aug', 'Sep', 'Oct'], ARRAY['L1', 'L2', 'L3'], 14.5, '{"disease_resistance": "High", "drought_tolerance": "Medium", "yield_potential": "High"}', 'Popular variety with high sugar content and good adaptability', 'sprout', true),
('M 2593/92', 'M 2593/92', 'Late Maturing', 'Sep', 'Nov', ARRAY['Sep', 'Oct', 'Nov'], ARRAY['L2', 'L3', 'P1'], 15.1, '{"disease_resistance": "Medium", "drought_tolerance": "Low", "yield_potential": "Very High"}', 'Late maturing variety with very high yield potential', 'sprout', true),
('R 585', 'R 585', 'Early Maturing', 'Jul', 'Aug', ARRAY['Jul', 'Aug'], ARRAY['L1', 'L2'], 13.5, '{"disease_resistance": "High", "drought_tolerance": "High", "yield_potential": "Medium"}', 'Drought-resistant early variety suitable for marginal lands', 'sprout', true),
('M 3035/66', 'M 3035/66', 'Medium Maturing', 'Aug', 'Sep', ARRAY['Aug', 'Sep'], ARRAY['L2', 'L3'], 14.0, '{"disease_resistance": "Medium", "drought_tolerance": "Medium", "yield_potential": "High"}', 'Reliable medium-maturing variety with consistent performance', 'sprout', true),
('R 566', 'R 566', 'Late Maturing', 'Sep', 'Oct', ARRAY['Sep', 'Oct'], ARRAY['L1', 'L2', 'L3'], 14.8, '{"disease_resistance": "High", "drought_tolerance": "Medium", "yield_potential": "High"}', 'Late variety with excellent disease resistance', 'sprout', true),
('M 1400/86', 'M 1400/86', 'Medium Maturing', 'Aug', 'Sep', ARRAY['Aug', 'Sep'], ARRAY['L2', 'P1'], 14.3, '{"disease_resistance": "Medium", "drought_tolerance": "Medium", "yield_potential": "High"}', 'Medium-maturing variety suitable for various soil types', 'sprout', true);

-- =====================================================
-- 8. POPULATE INTERCROP VARIETIES (Complete List)
-- =====================================================

INSERT INTO intercrop_varieties (variety_id, name, scientific_name, benefits, planting_time, harvest_time, description, icon, active) VALUES
('none', 'None', '', ARRAY['No intercrop selected', 'Monoculture sugarcane'], '', '', 'No intercrop companion plant selected', 'x', true),
('potato-spunta', 'Potato Spunta', 'Solanum tuberosum', ARRAY['Soil improvement', 'Additional income', 'Pest control'], 'May-June', 'August-September', 'Popular potato variety suitable for intercropping with sugarcane', 'apple', true),
('bean-common', 'Common Bean', 'Phaseolus vulgaris', ARRAY['Nitrogen fixation', 'Soil improvement', 'Food security'], 'April-May', 'July-August', 'Nitrogen-fixing legume that improves soil fertility', 'leaf', true),
('peanut', 'Peanut', 'Arachis hypogaea', ARRAY['Nitrogen fixation', 'Ground cover', 'Additional income'], 'May-June', 'September-October', 'Leguminous crop that fixes nitrogen and provides ground cover', 'circle', true),
('sweet-potato', 'Sweet Potato', 'Ipomoea batatas', ARRAY['Ground cover', 'Erosion control', 'Food security'], 'April-May', 'August-September', 'Vine crop that provides excellent ground cover', 'circle', true),
('maize', 'Maize', 'Zea mays', ARRAY['Wind protection', 'Additional income', 'Food security'], 'March-April', 'July-August', 'Tall crop that can provide wind protection for young sugarcane', 'wheat', true),
('cowpea', 'Cowpea', 'Vigna unguiculata', ARRAY['Nitrogen fixation', 'Drought tolerance', 'Livestock feed'], 'April-May', 'July-August', 'Drought-tolerant legume suitable for dry conditions', 'leaf', true),
('soybean', 'Soybean', 'Glycine max', ARRAY['Nitrogen fixation', 'High protein', 'Soil improvement'], 'April-May', 'August-September', 'High-protein legume with excellent nitrogen fixation', 'circle', true);

-- =====================================================
-- 9. POPULATE PRODUCTS (Complete List)
-- =====================================================

INSERT INTO products (product_id, name, category, description, unit, recommended_rate_per_ha, cost_per_unit, brand, composition, icon, active) VALUES
-- Fertilizers
('urea-46', 'Urea 46%', 'Fertilizer', 'Nitrogen fertilizer with 46% N content', 'kg', 200.0, 25.50, 'Generic', '46% Nitrogen', 'leaf', true),
('npk-12-12-17', 'NPK 12-12-17', 'Fertilizer', 'Balanced NPK fertilizer with potassium boost', 'kg', 300.0, 32.00, 'Generic', '12% N, 12% P2O5, 17% K2O', 'leaf', true),
('dap-18-46', 'DAP 18-46', 'Fertilizer', 'Diammonium phosphate fertilizer', 'kg', 150.0, 45.00, 'Generic', '18% N, 46% P2O5', 'leaf', true),
('muriate-potash', 'Muriate of Potash', 'Fertilizer', 'Potassium chloride fertilizer', 'kg', 100.0, 38.00, 'Generic', '60% K2O', 'leaf', true),
('compost-organic', 'Organic Compost', 'Fertilizer', 'Organic compost for soil improvement', 'tons', 5.0, 1200.00, 'Local', 'Organic matter, NPK varies', 'leaf', true),

-- Pesticides
('glyphosate-360', 'Glyphosate 360', 'Herbicide', 'Non-selective systemic herbicide', 'liters', 3.0, 180.00, 'Roundup', '360g/L Glyphosate', 'shield', true),
('atrazine-500', 'Atrazine 500', 'Herbicide', 'Pre-emergence herbicide for sugarcane', 'liters', 2.5, 220.00, 'Syngenta', '500g/L Atrazine', 'shield', true),
('2-4-d-amine', '2,4-D Amine', 'Herbicide', 'Selective herbicide for broadleaf weeds', 'liters', 1.5, 150.00, 'Generic', '720g/L 2,4-D', 'shield', true),
('imidacloprid-200', 'Imidacloprid 200', 'Insecticide', 'Systemic insecticide for sucking pests', 'ml', 500.0, 0.85, 'Bayer', '200g/L Imidacloprid', 'bug', true),
('chlorpyrifos-480', 'Chlorpyrifos 480', 'Insecticide', 'Contact insecticide for various pests', 'liters', 1.0, 280.00, 'Dow', '480g/L Chlorpyrifos', 'bug', true),

-- Seeds and Planting Material
('sugarcane-cuttings', 'Sugarcane Cuttings', 'Planting Material', 'Healthy sugarcane cuttings for planting', 'tons', 8.0, 2500.00, 'Local', 'Certified planting material', 'sprout', true),
('potato-seed', 'Potato Seed', 'Seeds', 'Certified potato seed tubers', 'kg', 2500.0, 45.00, 'Local', 'Certified seed potatoes', 'apple', true),
('bean-seeds', 'Bean Seeds', 'Seeds', 'Common bean seeds for intercropping', 'kg', 60.0, 120.00, 'Local', 'Certified bean seeds', 'circle', true),

-- Soil Amendments
('lime-agricultural', 'Agricultural Lime', 'Soil Amendment', 'Calcium carbonate for pH adjustment', 'tons', 2.0, 800.00, 'Local', 'CaCO3 85%', 'mountain', true),
('gypsum', 'Gypsum', 'Soil Amendment', 'Calcium sulfate for soil structure', 'tons', 1.5, 950.00, 'Local', 'CaSO4.2H2O', 'mountain', true);

-- =====================================================
-- 10. POPULATE RESOURCES (Complete List)
-- =====================================================

INSERT INTO resources (resource_id, name, category, description, unit, cost_per_hour, cost_per_unit, skill_level, overtime_multiplier, icon, active) VALUES
-- Labor
('general-laborer', 'General Laborer', 'Labor', 'General farm laborer for various tasks', 'hours', 150.00, 0, 'Basic', 1.5, 'user', true),
('skilled-laborer', 'Skilled Laborer', 'Labor', 'Experienced farm worker with specialized skills', 'hours', 200.00, 0, 'Intermediate', 1.5, 'user-check', true),
('supervisor', 'Field Supervisor', 'Labor', 'Field supervisor and team leader', 'hours', 300.00, 0, 'Advanced', 1.5, 'user-cog', true),
('machine-operator', 'Machine Operator', 'Labor', 'Certified machinery operator', 'hours', 250.00, 0, 'Intermediate', 1.5, 'settings', true),

-- Equipment
('tractor-75hp', 'Tractor 75HP', 'Equipment', '75 horsepower farm tractor', 'hours', 800.00, 0, 'Intermediate', 1.0, 'truck', true),
('tractor-100hp', 'Tractor 100HP', 'Equipment', '100 horsepower farm tractor', 'hours', 1000.00, 0, 'Intermediate', 1.0, 'truck', true),
('cultivator', 'Cultivator', 'Equipment', 'Soil cultivation implement', 'hours', 300.00, 0, 'Basic', 1.0, 'shovel', true),
('planter', 'Planter', 'Equipment', 'Mechanical planter for seeds/cuttings', 'hours', 500.00, 0, 'Intermediate', 1.0, 'sprout', true),
('sprayer-boom', 'Boom Sprayer', 'Equipment', 'Large boom sprayer for pesticides', 'hours', 400.00, 0, 'Intermediate', 1.0, 'droplets', true),
('sprayer-knapsack', 'Knapsack Sprayer', 'Equipment', 'Manual knapsack sprayer', 'hours', 50.00, 0, 'Basic', 1.0, 'droplets', true),
('harvester-cane', 'Cane Harvester', 'Equipment', 'Mechanical sugarcane harvester', 'hours', 2000.00, 0, 'Advanced', 1.0, 'scissors', true),
('truck-5ton', '5-Ton Truck', 'Transport', '5-ton capacity transport truck', 'hours', 600.00, 0, 'Intermediate', 1.0, 'truck', true),
('trailer-cane', 'Cane Trailer', 'Transport', 'Specialized trailer for sugarcane transport', 'hours', 200.00, 0, 'Basic', 1.0, 'truck', true),

-- Tools
('hand-tools', 'Hand Tools', 'Tools', 'Basic hand tools (hoes, shovels, etc.)', 'set', 0, 50.00, 'Basic', 1.0, 'wrench', true),
('irrigation-pipes', 'Irrigation Pipes', 'Irrigation', 'PVC pipes for irrigation system', 'meters', 0, 25.00, 'Basic', 1.0, 'droplets', true),
('fuel-diesel', 'Diesel Fuel', 'Fuel', 'Diesel fuel for machinery', 'liters', 0, 45.00, 'Basic', 1.0, 'fuel', true);

-- =====================================================
-- 11. ADD CLIMATE DATA TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS climate_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    station_id VARCHAR(50) NOT NULL,
    observation_date DATE NOT NULL,
    observation_year INTEGER NOT NULL,
    observation_month INTEGER NOT NULL,
    observation_day INTEGER NOT NULL,
    julian_day INTEGER NOT NULL,
    temperature_min_celsius DECIMAL(5,2),
    temperature_max_celsius DECIMAL(5,2),
    solar_radiation_mj_per_m2 DECIMAL(8,2),
    evapotranspiration_mm DECIMAL(8,2),
    precipitation_mm DECIMAL(8,2),
    wind_speed_m_per_s DECIMAL(6,2),
    vapor_pressure_hpa DECIMAL(8,2),
    co2_concentration_ppm DECIMAL(8,2),
    relative_humidity_percent DECIMAL(5,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(station_id, observation_date)
);

-- Climate data indexes
CREATE INDEX IF NOT EXISTS idx_climate_data_date ON climate_data(observation_date);
CREATE INDEX IF NOT EXISTS idx_climate_data_year_month ON climate_data(observation_year, observation_month);
CREATE INDEX IF NOT EXISTS idx_climate_data_station ON climate_data(station_id);

-- =====================================================
-- 12. ENABLE ROW LEVEL SECURITY
-- =====================================================

-- Enable RLS on new tables
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE observations ENABLE ROW LEVEL SECURITY;
ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE climate_data ENABLE ROW LEVEL SECURITY;

-- Create policies for new tables (allow all operations for now)
CREATE POLICY "Enable all operations for authenticated users" ON activities FOR ALL USING (true);
CREATE POLICY "Enable all operations for authenticated users" ON activity_products FOR ALL USING (true);
CREATE POLICY "Enable all operations for authenticated users" ON activity_resources FOR ALL USING (true);
CREATE POLICY "Enable all operations for authenticated users" ON observations FOR ALL USING (true);
CREATE POLICY "Enable all operations for authenticated users" ON attachments FOR ALL USING (true);
CREATE POLICY "Enable read access for climate data" ON climate_data FOR SELECT USING (true);

-- =====================================================
-- 13. ADD TRIGGERS FOR UPDATED_AT
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for new tables
CREATE TRIGGER update_activities_updated_at BEFORE UPDATE ON activities
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_activity_products_updated_at BEFORE UPDATE ON activity_products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_activity_resources_updated_at BEFORE UPDATE ON activity_resources
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_observations_updated_at BEFORE UPDATE ON observations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_attachments_updated_at BEFORE UPDATE ON attachments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_climate_data_updated_at BEFORE UPDATE ON climate_data
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SCRIPT COMPLETE
-- =====================================================

SELECT 'Database schema and configuration data update completed successfully!' as status;
