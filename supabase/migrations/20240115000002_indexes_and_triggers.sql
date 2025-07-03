-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Spatial indexes
CREATE INDEX idx_farms_farm_boundary ON farms USING GIST (farm_boundary);
CREATE INDEX idx_fields_coordinates ON fields USING GIST (coordinates);
CREATE INDEX idx_blocs_coordinates ON blocs USING GIST (coordinates);

-- Foreign key indexes
CREATE INDEX idx_farms_company_id ON farms(company_id);
CREATE INDEX idx_fields_farm_id ON fields(farm_id);
CREATE INDEX idx_blocs_field_id ON blocs(field_id);
CREATE INDEX idx_crop_cycles_bloc_id ON crop_cycles(bloc_id);
CREATE INDEX idx_crop_cycles_sugarcane_variety_id ON crop_cycles(sugarcane_variety_id);
CREATE INDEX idx_crop_cycles_intercrop_variety_id ON crop_cycles(intercrop_variety_id);
CREATE INDEX idx_crop_cycles_parent_cycle_id ON crop_cycles(parent_cycle_id);

-- Status and lookup indexes
CREATE INDEX idx_blocs_status ON blocs(status);
CREATE INDEX idx_crop_cycles_status ON crop_cycles(status);
CREATE INDEX idx_crop_cycles_growth_stage ON crop_cycles(growth_stage);
CREATE INDEX idx_sugarcane_varieties_active ON sugarcane_varieties(active);
CREATE INDEX idx_intercrop_varieties_active ON intercrop_varieties(active);
CREATE INDEX idx_products_active ON products(active);
CREATE INDEX idx_resources_active ON resources(active);

-- Composite indexes for common queries
CREATE INDEX idx_crop_cycles_bloc_status ON crop_cycles(bloc_id, status);
CREATE INDEX idx_field_analytics_history_field_date ON field_analytics_history(field_id, calculation_date);

-- =====================================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers to all tables
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_farms_updated_at BEFORE UPDATE ON farms FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_fields_updated_at BEFORE UPDATE ON fields FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_blocs_updated_at BEFORE UPDATE ON blocs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_crop_cycles_updated_at BEFORE UPDATE ON crop_cycles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sugarcane_varieties_updated_at BEFORE UPDATE ON sugarcane_varieties FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_intercrop_varieties_updated_at BEFORE UPDATE ON intercrop_varieties FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_resources_updated_at BEFORE UPDATE ON resources FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update growth stage based on planting date
CREATE OR REPLACE FUNCTION update_growth_stage()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.sugarcane_planting_date IS NOT NULL THEN
        NEW.days_since_planting = EXTRACT(DAY FROM (CURRENT_DATE - NEW.sugarcane_planting_date));
        
        -- Calculate growth stage based on days since planting
        IF NEW.days_since_planting <= 30 THEN
            NEW.growth_stage = 'germination';
        ELSIF NEW.days_since_planting <= 120 THEN
            NEW.growth_stage = 'tillering';
        ELSIF NEW.days_since_planting <= 270 THEN
            NEW.growth_stage = 'grand-growth';
        ELSIF NEW.days_since_planting <= 360 THEN
            NEW.growth_stage = 'maturation';
        ELSE
            NEW.growth_stage = 'ripening';
        END IF;
        
        NEW.growth_stage_updated_at = NOW();
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply growth stage trigger
CREATE TRIGGER update_crop_cycle_growth_stage 
    BEFORE INSERT OR UPDATE ON crop_cycles 
    FOR EACH ROW EXECUTE FUNCTION update_growth_stage();

-- =====================================================
-- CONSTRAINTS AND VALIDATION
-- =====================================================

-- Ensure only one active crop cycle per bloc
CREATE UNIQUE INDEX idx_unique_active_crop_cycle_per_bloc 
    ON crop_cycles(bloc_id) 
    WHERE status = 'active';

-- Ensure harvest date is after planting date
ALTER TABLE crop_cycles ADD CONSTRAINT chk_harvest_after_planting 
    CHECK (sugarcane_planned_harvest_date > sugarcane_planting_date);

-- Ensure positive values for areas and costs
ALTER TABLE fields ADD CONSTRAINT chk_positive_area CHECK (area_hectares > 0);
ALTER TABLE blocs ADD CONSTRAINT chk_positive_area CHECK (area_hectares > 0);
ALTER TABLE crop_cycles ADD CONSTRAINT chk_positive_costs CHECK (
    estimated_total_cost >= 0 AND 
    actual_total_cost >= 0 AND 
    total_revenue >= 0
);

-- Ensure retired date is after created date for blocs
ALTER TABLE blocs ADD CONSTRAINT chk_retired_after_created 
    CHECK (retired_date IS NULL OR retired_date >= created_date);
