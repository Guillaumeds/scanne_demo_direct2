-- =====================================================
-- MIGRATE MISSING CONFIG DATA FROM FRONTEND TO DATABASE
-- =====================================================
-- This script adds all the missing hardcoded config data to database tables
-- Includes activity templates, detailed phases, and enhanced observation categories

-- =====================================================
-- 1. ADD ACTIVITY TEMPLATES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS activity_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    phase VARCHAR(100) NOT NULL,
    estimated_duration_hours DECIMAL(8,2),
    resource_type VARCHAR(50) CHECK (resource_type IN ('manual', 'mechanical', 'both')),
    estimated_cost DECIMAL(12,2) DEFAULT 0,
    typical_products JSONB DEFAULT '[]',
    icon VARCHAR(50),
    color VARCHAR(7),
    active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 999,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 2. ADD ACTIVITY PHASES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS activity_phases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phase_id VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    color VARCHAR(100), -- CSS classes for styling
    icon VARCHAR(50),
    duration_description VARCHAR(100),
    sort_order INTEGER DEFAULT 999,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 3. POPULATE ACTIVITY PHASES (from SUGARCANE_PHASES)
-- =====================================================

INSERT INTO activity_phases (phase_id, name, description, color, icon, duration_description, sort_order) VALUES
('land-preparation', 'Land Preparation', 'Clearing, plowing, and soil preparation', 'bg-amber-100 text-amber-800 border-amber-200', 'tractor', '2-4 weeks', 1),
('planting', 'Planting', 'Seed bed preparation and planting', 'bg-green-100 text-green-800 border-green-200', 'sprout', '1-2 weeks', 2),
('establishment', 'Establishment', 'Initial growth and establishment care', 'bg-emerald-100 text-emerald-800 border-emerald-200', 'leaf', '2-3 months', 3),
('growth', 'Growth Phase', 'Active growth and development', 'bg-blue-100 text-blue-800 border-blue-200', 'wheat', '6-8 months', 4),
('maintenance', 'Maintenance', 'Ongoing care, fertilization, pest control', 'bg-purple-100 text-purple-800 border-purple-200', 'wrench', 'Ongoing', 5),
('pre-harvest', 'Pre-Harvest', 'Preparation for harvest activities', 'bg-orange-100 text-orange-800 border-orange-200', 'clipboard', '2-4 weeks', 6),
('harvest', 'Harvest', 'Cutting and collection of sugarcane', 'bg-red-100 text-red-800 border-red-200', 'scissors', '4-8 weeks', 7),
('post-harvest', 'Post-Harvest', 'Field cleanup and preparation for next cycle', 'bg-gray-100 text-gray-800 border-gray-200', 'broom', '2-3 weeks', 8);

-- =====================================================
-- 4. POPULATE ACTIVITY TEMPLATES (from ACTIVITY_TEMPLATES)
-- =====================================================

INSERT INTO activity_templates (template_id, name, description, phase, estimated_duration_hours, resource_type, estimated_cost, sort_order) VALUES
-- Land Preparation Phase
('clearing', 'Clearing', 'Remove vegetation, rocks, and debris from the field', 'land-preparation', 8, 'mechanical', 5000, 1),
('deep-ploughing', 'Deep Ploughing', 'Deep tillage to break hardpan and improve soil structure', 'land-preparation', 6, 'mechanical', 8000, 2),
('harrowing', 'Harrowing', 'Break up clods and smooth the soil surface', 'land-preparation', 4, 'mechanical', 3000, 3),
('leveling', 'Field Leveling', 'Level the field for proper water distribution', 'land-preparation', 6, 'mechanical', 4000, 4),
('drainage', 'Drainage Setup', 'Install drainage systems and water channels', 'land-preparation', 12, 'both', 6000, 5),

-- Planting Phase
('furrow-opening', 'Furrow Opening', 'Create planting furrows at proper spacing', 'planting', 4, 'mechanical', 2000, 6),
('seed-treatment', 'Seed Treatment', 'Treat seed cane with fungicides and nutrients', 'planting', 2, 'manual', 1500, 7),
('planting', 'Planting', 'Place seed cane in furrows and cover', 'planting', 8, 'both', 4000, 8),
('initial-irrigation', 'Initial Irrigation', 'First irrigation after planting', 'planting', 3, 'mechanical', 1000, 9),

-- Establishment Phase
('gap-filling', 'Gap Filling', 'Replace failed plants with new seedlings', 'establishment', 6, 'manual', 2000, 10),
('first-weeding', 'First Weeding', 'Remove weeds around young plants', 'establishment', 8, 'manual', 1500, 11),
('first-fertilization', 'First Fertilization', 'Apply starter fertilizer', 'establishment', 4, 'both', 3000, 12),
('earthing-up', 'Earthing Up', 'Build soil around plant base for support', 'establishment', 6, 'both', 2500, 13),

-- Growth Phase
('second-fertilization', 'Second Fertilization', 'Apply growth-stage fertilizer', 'growth', 4, 'both', 4000, 14),
('pest-monitoring', 'Pest Monitoring', 'Regular inspection for pests and diseases', 'growth', 2, 'manual', 500, 15),
('irrigation-management', 'Irrigation Management', 'Regular irrigation scheduling', 'growth', 3, 'mechanical', 1200, 16),

-- Maintenance Phase
('weed-control', 'Weed Control', 'Herbicide application and manual weeding', 'maintenance', 5, 'both', 2000, 17),
('pest-control', 'Pest Control', 'Pesticide application when needed', 'maintenance', 3, 'both', 2500, 18),
('third-fertilization', 'Third Fertilization', 'Apply maintenance fertilizer', 'maintenance', 4, 'both', 3500, 19),
('pruning', 'Pruning', 'Remove dead leaves and excess shoots', 'maintenance', 6, 'manual', 1000, 20),

-- Pre-Harvest Phase
('harvest-planning', 'Harvest Planning', 'Plan harvest logistics and equipment', 'pre-harvest', 4, 'manual', 500, 21),
('field-assessment', 'Field Assessment', 'Assess crop maturity and yield estimation', 'pre-harvest', 3, 'manual', 300, 22),
('equipment-preparation', 'Equipment Preparation', 'Prepare and service harvest equipment', 'pre-harvest', 6, 'mechanical', 2000, 23),

-- Harvest Phase
('cutting', 'Cutting', 'Cut mature sugarcane stalks', 'harvest', 12, 'both', 8000, 24),
('loading', 'Loading', 'Load cut cane onto transport vehicles', 'harvest', 8, 'both', 4000, 25),
('transport', 'Transport', 'Transport cane to mill or collection point', 'harvest', 6, 'mechanical', 3000, 26),

-- Post-Harvest Phase
('field-cleanup', 'Field Cleanup', 'Remove harvest residue and debris', 'post-harvest', 8, 'both', 2000, 27),
('soil-testing', 'Soil Testing', 'Test soil for next cycle planning', 'post-harvest', 2, 'manual', 800, 28),
('equipment-cleaning', 'Equipment Cleaning', 'Clean and store harvest equipment', 'post-harvest', 4, 'manual', 500, 29);

-- =====================================================
-- 5. UPDATE OBSERVATION CATEGORIES WITH DETAILED INFO
-- =====================================================

-- Clear existing and add detailed observation categories
DELETE FROM observation_categories;

INSERT INTO observation_categories (category_id, name, description, icon, color, active) VALUES
('soil', 'Soil Observations', 'Soil texture, pH, nutrients, and physical properties', 'mountain', '#8B4513', true),
('water', 'Water Observations', 'Irrigation water quality and availability', 'droplets', '#3B82F6', true),
('plant-morphological', 'Plant Morphological', 'Plant height, diameter, and physical measurements', 'ruler', '#22C55E', true),
('growth-stage', 'Growth Stage', 'Plant development stage and growth progress', 'trending-up', '#10B981', true),
('sugarcane-yield-quality', 'Sugarcane Yield & Quality', 'MANDATORY: Sugarcane harvest yield, quality, and revenue data', 'bar-chart', '#F59E0B', true),
('pest-disease', 'Pest & Disease', 'Pest infestations and disease observations', 'bug', '#EF4444', true),
('weed', 'Weed Observations', 'Weed pressure and control effectiveness', 'leaf', '#84CC16', true),
('intercrop-yield-quality', 'Intercrop Yield & Quality', 'MANDATORY if intercrop planted: Intercrop harvest yield, quality, and revenue data', 'wheat', '#6366F1', true);

-- =====================================================
-- 6. ADD INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_activity_templates_phase ON activity_templates(phase);
CREATE INDEX IF NOT EXISTS idx_activity_templates_active ON activity_templates(active);
CREATE INDEX IF NOT EXISTS idx_activity_phases_active ON activity_phases(active);
CREATE INDEX IF NOT EXISTS idx_activity_templates_sort_order ON activity_templates(sort_order);
CREATE INDEX IF NOT EXISTS idx_activity_phases_sort_order ON activity_phases(sort_order);

-- =====================================================
-- 7. UPDATE CONFIGURATION SERVICE COMPATIBILITY
-- =====================================================

-- Add sort_order to existing tables if not exists
ALTER TABLE activity_categories ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 999;
ALTER TABLE observation_categories ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 999;

-- Update sort orders for existing data
UPDATE activity_categories SET sort_order = CASE category_id
    WHEN 'land-preparation' THEN 1
    WHEN 'planting' THEN 2
    WHEN 'establishment' THEN 3
    WHEN 'growth' THEN 4
    WHEN 'maintenance' THEN 5
    WHEN 'pre-harvest' THEN 6
    WHEN 'harvest' THEN 7
    WHEN 'post-harvest' THEN 8
    ELSE 100
END;

UPDATE observation_categories SET sort_order = CASE category_id
    WHEN 'soil' THEN 1
    WHEN 'water' THEN 2
    WHEN 'plant-morphological' THEN 3
    WHEN 'growth-stage' THEN 4
    WHEN 'pest-disease' THEN 5
    WHEN 'weed' THEN 6
    WHEN 'sugarcane-yield-quality' THEN 7
    WHEN 'intercrop-yield-quality' THEN 8
    ELSE 100
END;

COMMIT;
