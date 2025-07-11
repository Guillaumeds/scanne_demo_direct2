-- =====================================================
-- EXCEL VIEW ENHANCEMENTS FOR OPERATIONS OVERVIEW
-- =====================================================
-- This migration adds support for Excel-like operations overview
-- with enhanced product-resource relationships and daily application tracking

-- First, ensure we have the base schema from consolidated_schema.sql
-- This migration assumes the consolidated schema has been applied

-- =====================================================
-- ENHANCED PRODUCT-RESOURCE RELATIONSHIP
-- =====================================================

-- Add resource_id to products table to enforce one-to-one relationship
ALTER TABLE products ADD COLUMN IF NOT EXISTS resource_id UUID REFERENCES resources(id);
ALTER TABLE products ADD COLUMN IF NOT EXISTS default_application_rate DECIMAL(10,2);
ALTER TABLE products ADD COLUMN IF NOT EXISTS min_application_rate DECIMAL(10,2);
ALTER TABLE products ADD COLUMN IF NOT EXISTS max_application_rate DECIMAL(10,2);

-- =====================================================
-- DAILY APPLICATION TRACKING
-- =====================================================

-- Create table for tracking daily applications of products
CREATE TABLE IF NOT EXISTS daily_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    activity_product_id UUID REFERENCES activity_products(id) ON DELETE CASCADE,
    application_date DATE NOT NULL,
    area_applied DECIMAL(10,2) NOT NULL, -- hectares
    quantity_applied DECIMAL(10,2) NOT NULL, -- kg or liters
    rate_applied DECIMAL(10,2) NOT NULL, -- per hectare
    weather_conditions TEXT,
    operator_notes TEXT,
    actual_cost DECIMAL(12,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ENHANCED ACTIVITY TRACKING
-- =====================================================

-- Add fields to activities for better Excel-like tracking
ALTER TABLE activities ADD COLUMN IF NOT EXISTS planned_start_date DATE;
ALTER TABLE activities ADD COLUMN IF NOT EXISTS planned_end_date DATE;
ALTER TABLE activities ADD COLUMN IF NOT EXISTS progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100);
ALTER TABLE activities ADD COLUMN IF NOT EXISTS priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent'));

-- =====================================================
-- FINANCIAL TRACKING ENHANCEMENTS
-- =====================================================

-- Enhanced activity_products for better financial tracking
ALTER TABLE activity_products ADD COLUMN IF NOT EXISTS planned_area DECIMAL(10,2);
ALTER TABLE activity_products ADD COLUMN IF NOT EXISTS planned_total_quantity DECIMAL(10,2);
ALTER TABLE activity_products ADD COLUMN IF NOT EXISTS actual_total_quantity DECIMAL(10,2);
ALTER TABLE activity_products ADD COLUMN IF NOT EXISTS quantity_remaining DECIMAL(10,2);
ALTER TABLE activity_products ADD COLUMN IF NOT EXISTS area_remaining DECIMAL(10,2);
ALTER TABLE activity_products ADD COLUMN IF NOT EXISTS forecast_rate_remaining DECIMAL(10,2);

-- Enhanced activity_resources for effort tracking
ALTER TABLE activity_resources ADD COLUMN IF NOT EXISTS planned_effort_hours DECIMAL(8,2);
ALTER TABLE activity_resources ADD COLUMN IF NOT EXISTS actual_effort_hours DECIMAL(8,2);

-- =====================================================
-- VIEWS FOR EXCEL-LIKE DATA RETRIEVAL
-- =====================================================

-- View for fertilization overview (Excel-like structure)
CREATE OR REPLACE VIEW fertilization_overview AS
SELECT 
    b.name as bloc_name,
    b.id as bloc_id,
    cc.id as crop_cycle_id,
    cc.cycle_type,
    a.id as activity_id,
    a.name as activity_name,
    a.phase,
    a.status as activity_status,
    a.progress_percentage,
    a.priority,
    a.planned_start_date,
    a.planned_end_date,
    a.start_date,
    a.end_date,
    ap.id as activity_product_id,
    p.name as product_name,
    p.category as product_category,
    r.name as resource_name,
    r.category as resource_category,
    ap.planned_area,
    ap.rate as planned_rate_per_ha,
    ap.planned_total_quantity,
    ap.quantity as planned_quantity,
    ap.actual_total_quantity,
    ap.quantity_remaining,
    ap.area_remaining,
    ap.forecast_rate_remaining,
    ap.estimated_cost as estimated_product_cost,
    ap.actual_cost as actual_product_cost,
    ar.planned_effort_hours,
    ar.actual_effort_hours,
    ar.estimated_cost as estimated_resource_cost,
    ar.actual_cost as actual_resource_cost
FROM blocs b
JOIN crop_cycles cc ON b.id = cc.bloc_id
JOIN activities a ON cc.id = a.crop_cycle_id
JOIN activity_products ap ON a.id = ap.activity_id
JOIN products p ON ap.product_id = p.id
LEFT JOIN resources r ON p.resource_id = r.id
LEFT JOIN activity_resources ar ON a.id = ar.activity_id AND ar.resource_id = r.id
WHERE a.phase IN ('land_preparation', 'planting', 'fertilization', 'pest_control', 'weed_control')
ORDER BY b.name, a.planned_start_date, a.name, p.name;

-- View for daily applications (for Daily Tasks columns)
CREATE OR REPLACE VIEW daily_applications_overview AS
SELECT 
    da.id,
    da.activity_product_id,
    da.application_date,
    da.area_applied,
    da.quantity_applied,
    da.rate_applied,
    da.weather_conditions,
    da.operator_notes,
    da.actual_cost,
    ap.activity_id,
    p.name as product_name,
    b.name as bloc_name
FROM daily_applications da
JOIN activity_products ap ON da.activity_product_id = ap.id
JOIN activities a ON ap.activity_id = a.id
JOIN crop_cycles cc ON a.crop_cycle_id = cc.id
JOIN blocs b ON cc.bloc_id = b.id
JOIN products p ON ap.product_id = p.id
ORDER BY da.application_date DESC, b.name, p.name;

-- =====================================================
-- FUNCTIONS FOR EXCEL-LIKE CALCULATIONS
-- =====================================================

-- Function to calculate remaining quantities and areas
CREATE OR REPLACE FUNCTION update_remaining_quantities()
RETURNS TRIGGER AS $$
BEGIN
    -- Update the activity_products table with remaining quantities
    UPDATE activity_products 
    SET 
        actual_total_quantity = COALESCE((
            SELECT SUM(quantity_applied) 
            FROM daily_applications 
            WHERE activity_product_id = NEW.activity_product_id
        ), 0),
        quantity_remaining = GREATEST(0, planned_total_quantity - COALESCE((
            SELECT SUM(quantity_applied) 
            FROM daily_applications 
            WHERE activity_product_id = NEW.activity_product_id
        ), 0)),
        area_remaining = GREATEST(0, planned_area - COALESCE((
            SELECT SUM(area_applied) 
            FROM daily_applications 
            WHERE activity_product_id = NEW.activity_product_id
        ), 0))
    WHERE id = NEW.activity_product_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update remaining quantities when daily applications are added/updated
DROP TRIGGER IF EXISTS update_remaining_quantities_trigger ON daily_applications;
CREATE TRIGGER update_remaining_quantities_trigger
    AFTER INSERT OR UPDATE OR DELETE ON daily_applications
    FOR EACH ROW EXECUTE FUNCTION update_remaining_quantities();

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_daily_applications_activity_product ON daily_applications(activity_product_id);
CREATE INDEX IF NOT EXISTS idx_daily_applications_date ON daily_applications(application_date);
CREATE INDEX IF NOT EXISTS idx_products_resource ON products(resource_id);
CREATE INDEX IF NOT EXISTS idx_activities_crop_cycle_phase ON activities(crop_cycle_id, phase);
CREATE INDEX IF NOT EXISTS idx_activity_products_activity ON activity_products(activity_id);

-- =====================================================
-- SAMPLE DATA FOR TESTING
-- =====================================================

-- Update existing products to have linked resources (for demo purposes)
-- This assumes we have some existing products and resources
DO $$
DECLARE
    fertilizer_resource_id UUID;
    equipment_resource_id UUID;
    labor_resource_id UUID;
BEGIN
    -- Get some resource IDs (create if they don't exist)
    SELECT id INTO fertilizer_resource_id FROM resources WHERE category = 'fertilizer_equipment' LIMIT 1;
    SELECT id INTO equipment_resource_id FROM resources WHERE category = 'machinery' LIMIT 1;
    SELECT id INTO labor_resource_id FROM resources WHERE category = 'labor' LIMIT 1;
    
    -- If no resources exist, create some basic ones
    IF fertilizer_resource_id IS NULL THEN
        INSERT INTO resources (resource_id, name, category, unit, cost_per_unit, description)
        VALUES ('FERT_SPREADER', 'Fertilizer Spreader', 'fertilizer_equipment', 'hour', 25.00, 'Equipment for spreading fertilizer')
        RETURNING id INTO fertilizer_resource_id;
    END IF;
    
    IF equipment_resource_id IS NULL THEN
        INSERT INTO resources (resource_id, name, category, unit, cost_per_unit, description)
        VALUES ('TRACTOR', 'Tractor', 'machinery', 'hour', 45.00, 'General purpose tractor')
        RETURNING id INTO equipment_resource_id;
    END IF;
    
    IF labor_resource_id IS NULL THEN
        INSERT INTO resources (resource_id, name, category, unit, cost_per_unit, description)
        VALUES ('FIELD_WORKER', 'Field Worker', 'labor', 'hour', 15.00, 'General field labor')
        RETURNING id INTO labor_resource_id;
    END IF;
    
    -- Update products to link to resources
    UPDATE products SET resource_id = fertilizer_resource_id, default_application_rate = 200.0 
    WHERE category = 'fertilizer' AND resource_id IS NULL;
    
    UPDATE products SET resource_id = equipment_resource_id, default_application_rate = 1.0 
    WHERE category = 'pesticide' AND resource_id IS NULL;
    
    UPDATE products SET resource_id = labor_resource_id, default_application_rate = 0.5 
    WHERE category NOT IN ('fertilizer', 'pesticide') AND resource_id IS NULL;
END $$;

-- =====================================================
-- COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON TABLE daily_applications IS 'Daily tracking of product applications for Excel-like operations overview';
COMMENT ON VIEW fertilization_overview IS 'Excel-like view combining blocs, activities, products, and resources for operations overview';
COMMENT ON VIEW daily_applications_overview IS 'Daily applications data formatted for Excel-like daily tasks columns';
