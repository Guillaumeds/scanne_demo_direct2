-- =====================================================
-- REMOVE DATABASE CALCULATION FUNCTIONS
-- =====================================================
-- Remove all database-side calculation functions as calculations 
-- will now be done frontend-side for consistency

-- Drop atomic transaction functions
DROP FUNCTION IF EXISTS save_activity_with_totals(JSONB, JSONB, JSONB);
DROP FUNCTION IF EXISTS save_observation_with_totals(JSONB);
DROP FUNCTION IF EXISTS delete_activity_with_totals(UUID);
DROP FUNCTION IF EXISTS calculate_crop_cycle_totals(UUID);

-- Add revenue columns to observations table if they don't exist
DO $$ 
BEGIN
    -- Add sugarcane_revenue column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'observations' AND column_name = 'sugarcane_revenue') THEN
        ALTER TABLE observations ADD COLUMN sugarcane_revenue DECIMAL(12,2);
    END IF;
    
    -- Add intercrop_revenue column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'observations' AND column_name = 'intercrop_revenue') THEN
        ALTER TABLE observations ADD COLUMN intercrop_revenue DECIMAL(12,2);
    END IF;
    
    -- Add price_per_tonne column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'observations' AND column_name = 'price_per_tonne') THEN
        ALTER TABLE observations ADD COLUMN price_per_tonne DECIMAL(10,2);
    END IF;
    
    -- Add revenue_per_hectare column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'observations' AND column_name = 'revenue_per_hectare') THEN
        ALTER TABLE observations ADD COLUMN revenue_per_hectare DECIMAL(12,2);
    END IF;
END $$;

-- Create simple CRUD functions for activities (no calculations)
CREATE OR REPLACE FUNCTION save_activity_simple(
    p_activity_data JSONB,
    p_products JSONB DEFAULT '[]'::jsonb,
    p_resources JSONB DEFAULT '[]'::jsonb
)
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
    var_activity_id UUID;
    var_crop_cycle_id UUID;
    product_item JSONB;
    resource_item JSONB;
BEGIN
    -- Extract crop cycle ID
    var_crop_cycle_id := (p_activity_data->>'crop_cycle_id')::UUID;

    -- Insert or update activity (no cost calculations)
    IF (p_activity_data->>'id') IS NOT NULL AND (p_activity_data->>'id') != '' THEN
        -- Update existing activity
        var_activity_id := (p_activity_data->>'id')::UUID;

        UPDATE activities SET
            name = p_activity_data->>'name',
            description = p_activity_data->>'description',
            phase = p_activity_data->>'phase',
            status = COALESCE(p_activity_data->>'status', 'planned'),
            start_date = (p_activity_data->>'start_date')::DATE,
            end_date = (p_activity_data->>'end_date')::DATE,
            duration = (p_activity_data->>'duration')::INTEGER,
            estimated_total_cost = (p_activity_data->>'estimated_total_cost')::DECIMAL(12,2),
            actual_total_cost = (p_activity_data->>'actual_total_cost')::DECIMAL(12,2),
            notes = p_activity_data->>'notes',
            updated_at = NOW()
        WHERE id = var_activity_id;
    ELSE
        -- Insert new activity
        INSERT INTO activities (
            crop_cycle_id,
            name,
            description,
            phase,
            status,
            start_date,
            end_date,
            duration,
            estimated_total_cost,
            actual_total_cost,
            notes
        ) VALUES (
            var_crop_cycle_id,
            p_activity_data->>'name',
            p_activity_data->>'description',
            p_activity_data->>'phase',
            COALESCE(p_activity_data->>'status', 'planned'),
            (p_activity_data->>'start_date')::DATE,
            (p_activity_data->>'end_date')::DATE,
            (p_activity_data->>'duration')::INTEGER,
            (p_activity_data->>'estimated_total_cost')::DECIMAL(12,2),
            (p_activity_data->>'actual_total_cost')::DECIMAL(12,2),
            p_activity_data->>'notes'
        ) RETURNING id INTO var_activity_id;
    END IF;

    -- Clear existing products and resources
    DELETE FROM activity_products WHERE activity_id = var_activity_id;
    DELETE FROM activity_resources WHERE activity_id = var_activity_id;

    -- Insert products
    FOR product_item IN SELECT * FROM jsonb_array_elements(p_products)
    LOOP
        INSERT INTO activity_products (
            activity_id,
            product_id,
            product_name,
            quantity,
            rate,
            unit,
            estimated_cost,
            actual_cost
        ) VALUES (
            var_activity_id,
            (product_item->>'product_id')::UUID,
            product_item->>'product_name',
            (product_item->>'quantity')::DECIMAL(10,2),
            (product_item->>'rate')::DECIMAL(10,2),
            product_item->>'unit',
            (product_item->>'estimated_cost')::DECIMAL(12,2),
            CASE WHEN product_item->>'actual_cost' IS NOT NULL 
                 THEN (product_item->>'actual_cost')::DECIMAL(12,2) 
                 ELSE NULL END
        );
    END LOOP;

    -- Insert resources
    FOR resource_item IN SELECT * FROM jsonb_array_elements(p_resources)
    LOOP
        INSERT INTO activity_resources (
            activity_id,
            resource_id,
            resource_name,
            hours,
            cost_per_hour,
            estimated_cost,
            actual_cost
        ) VALUES (
            var_activity_id,
            (resource_item->>'resource_id')::UUID,
            resource_item->>'resource_name',
            (resource_item->>'hours')::DECIMAL(10,2),
            (resource_item->>'cost_per_hour')::DECIMAL(10,2),
            (resource_item->>'estimated_cost')::DECIMAL(12,2),
            CASE WHEN resource_item->>'actual_cost' IS NOT NULL 
                 THEN (resource_item->>'actual_cost')::DECIMAL(12,2) 
                 ELSE NULL END
        );
    END LOOP;

    RETURN var_activity_id;
END;
$$;

-- Create simple CRUD function for observations (no calculations)
CREATE OR REPLACE FUNCTION save_observation_simple(
    p_observation_data JSONB
)
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
    v_observation_id UUID;
    v_crop_cycle_id UUID;
BEGIN
    -- Extract crop cycle ID
    v_crop_cycle_id := (p_observation_data->>'crop_cycle_id')::UUID;

    -- Insert or update observation (no calculations)
    IF (p_observation_data->>'id') IS NOT NULL AND (p_observation_data->>'id') != '' THEN
        -- Update existing observation
        v_observation_id := (p_observation_data->>'id')::UUID;

        UPDATE observations SET
            name = p_observation_data->>'name',
            description = p_observation_data->>'description',
            category = p_observation_data->>'category',
            status = p_observation_data->>'status',
            observation_date = (p_observation_data->>'observation_date')::DATE,
            number_of_samples = (p_observation_data->>'number_of_samples')::INTEGER,
            number_of_plants = (p_observation_data->>'number_of_plants')::INTEGER,
            observation_data = COALESCE((p_observation_data->>'observation_data')::JSONB, '{}'::jsonb),
            yield_tons_ha = (p_observation_data->>'yield_tons_ha')::DECIMAL(10,2),
            area_hectares = (p_observation_data->>'area_hectares')::DECIMAL(10,2),
            total_yield_tons = (p_observation_data->>'total_yield_tons')::DECIMAL(10,2),
            sugarcane_revenue = (p_observation_data->>'sugarcane_revenue')::DECIMAL(12,2),
            intercrop_revenue = (p_observation_data->>'intercrop_revenue')::DECIMAL(12,2),
            price_per_tonne = (p_observation_data->>'price_per_tonne')::DECIMAL(10,2),
            revenue_per_hectare = (p_observation_data->>'revenue_per_hectare')::DECIMAL(12,2),
            notes = p_observation_data->>'notes',
            updated_at = NOW()
        WHERE id = v_observation_id;
    ELSE
        -- Insert new observation
        INSERT INTO observations (
            crop_cycle_id,
            name,
            description,
            category,
            status,
            observation_date,
            number_of_samples,
            number_of_plants,
            observation_data,
            yield_tons_ha,
            area_hectares,
            total_yield_tons,
            sugarcane_revenue,
            intercrop_revenue,
            price_per_tonne,
            revenue_per_hectare,
            notes
        ) VALUES (
            v_crop_cycle_id,
            p_observation_data->>'name',
            p_observation_data->>'description',
            p_observation_data->>'category',
            COALESCE(p_observation_data->>'status', 'draft'),
            (p_observation_data->>'observation_date')::DATE,
            (p_observation_data->>'number_of_samples')::INTEGER,
            (p_observation_data->>'number_of_plants')::INTEGER,
            COALESCE((p_observation_data->>'observation_data')::JSONB, '{}'::jsonb),
            (p_observation_data->>'yield_tons_ha')::DECIMAL(10,2),
            (p_observation_data->>'area_hectares')::DECIMAL(10,2),
            (p_observation_data->>'total_yield_tons')::DECIMAL(10,2),
            (p_observation_data->>'sugarcane_revenue')::DECIMAL(12,2),
            (p_observation_data->>'intercrop_revenue')::DECIMAL(12,2),
            (p_observation_data->>'price_per_tonne')::DECIMAL(10,2),
            (p_observation_data->>'revenue_per_hectare')::DECIMAL(12,2),
            p_observation_data->>'notes'
        ) RETURNING id INTO v_observation_id;
    END IF;

    RETURN v_observation_id;
END;
$$;

-- Create function to update crop cycle totals (called from frontend)
CREATE OR REPLACE FUNCTION update_crop_cycle_totals(
    p_cycle_id UUID,
    p_estimated_total_cost DECIMAL(12,2),
    p_actual_total_cost DECIMAL(12,2),
    p_total_revenue DECIMAL(12,2),
    p_sugarcane_revenue DECIMAL(12,2),
    p_intercrop_revenue DECIMAL(12,2),
    p_net_profit DECIMAL(12,2),
    p_profit_per_hectare DECIMAL(12,2),
    p_profit_margin_percent DECIMAL(5,2),
    p_sugarcane_actual_yield_tons_ha DECIMAL(10,2)
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE crop_cycles SET
        estimated_total_cost = p_estimated_total_cost,
        actual_total_cost = p_actual_total_cost,
        total_revenue = p_total_revenue,
        sugarcane_revenue = p_sugarcane_revenue,
        intercrop_revenue = p_intercrop_revenue,
        net_profit = p_net_profit,
        profit_per_hectare = p_profit_per_hectare,
        profit_margin_percent = p_profit_margin_percent,
        sugarcane_actual_yield_tons_ha = p_sugarcane_actual_yield_tons_ha,
        updated_at = NOW()
    WHERE id = p_cycle_id;
    
    RETURN FOUND;
END;
$$;
