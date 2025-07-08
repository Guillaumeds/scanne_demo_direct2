-- =====================================================
-- ATOMIC TRANSACTION FUNCTIONS
-- =====================================================
-- Database functions for atomic operations with automatic totals calculation

-- Function to save activity with products, resources, and update totals atomically
CREATE OR REPLACE FUNCTION save_activity_with_totals(
    p_activity_data JSONB,
    p_products JSONB DEFAULT '[]'::jsonb,
    p_resources JSONB DEFAULT '[]'::jsonb
)
RETURNS TABLE(
    result_activity_id UUID,
    estimated_total_cost DECIMAL(12,2),
    actual_total_cost DECIMAL(12,2),
    total_revenue DECIMAL(12,2),
    net_profit DECIMAL(12,2),
    profit_per_hectare DECIMAL(12,2)
)
LANGUAGE plpgsql
AS $$
DECLARE
    var_activity_id UUID;
    var_crop_cycle_id UUID;
    var_bloc_area DECIMAL(10,2);
    var_estimated_cost DECIMAL(12,2) := 0;
    var_actual_cost DECIMAL(12,2) := 0;
    var_total_revenue DECIMAL(12,2) := 0;
    var_net_profit DECIMAL(12,2) := 0;
    var_profit_per_ha DECIMAL(12,2) := 0;
    product_item JSONB;
    resource_item JSONB;
BEGIN
    -- Extract crop cycle ID
    var_crop_cycle_id := (p_activity_data->>'crop_cycle_id')::UUID;

    -- Get bloc area for calculations
    SELECT b.area_hectares INTO var_bloc_area
    FROM crop_cycles cc
    JOIN blocs b ON cc.bloc_id = b.id
    WHERE cc.id = var_crop_cycle_id;

    -- Default to 1 hectare if not found
    var_bloc_area := COALESCE(var_bloc_area, 1.0);

    -- Insert or update activity
    IF (p_activity_data->>'id') IS NOT NULL AND (p_activity_data->>'id') != '' THEN
        -- Update existing activity
        var_activity_id := (p_activity_data->>'id')::UUID;

        UPDATE activities SET
            name = p_activity_data->>'name',
            description = p_activity_data->>'description',
            phase = p_activity_data->>'phase',
            status = p_activity_data->>'status',
            start_date = (p_activity_data->>'start_date')::DATE,
            end_date = (p_activity_data->>'end_date')::DATE,
            duration = (p_activity_data->>'duration')::INTEGER,
            notes = p_activity_data->>'notes',
            updated_at = NOW()
        WHERE id = var_activity_id;

        -- Delete existing products and resources
        DELETE FROM activity_products WHERE activity_products.activity_id = var_activity_id;
        DELETE FROM activity_resources WHERE activity_resources.activity_id = var_activity_id;
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
            p_activity_data->>'notes'
        ) RETURNING id INTO var_activity_id;
    END IF;

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

    -- Calculate totals for the entire crop cycle
    SELECT 
        COALESCE(SUM(a.estimated_total_cost), 0),
        COALESCE(SUM(a.actual_total_cost), 0)
    INTO var_estimated_cost, var_actual_cost
    FROM activities a
    WHERE a.crop_cycle_id = var_crop_cycle_id;

    -- Calculate revenue from observations
    SELECT COALESCE(SUM(o.total_yield_tons * 3000), 0) INTO var_total_revenue
    FROM observations o
    WHERE o.crop_cycle_id = var_crop_cycle_id AND o.total_yield_tons IS NOT NULL;

    -- Calculate profit metrics
    var_net_profit := var_total_revenue - var_actual_cost;
    var_profit_per_ha := CASE WHEN var_bloc_area > 0 THEN var_net_profit / var_bloc_area ELSE 0 END;

    -- Update activity with calculated costs
    UPDATE activities SET
        estimated_total_cost = (
            SELECT COALESCE(SUM(ap.estimated_cost), 0) + COALESCE(SUM(ar.estimated_cost), 0)
            FROM activity_products ap
            FULL OUTER JOIN activity_resources ar ON ap.activity_id = ar.activity_id
            WHERE COALESCE(ap.activity_id, ar.activity_id) = var_activity_id
        ),
        actual_total_cost = (
            SELECT COALESCE(SUM(ap.actual_cost), 0) + COALESCE(SUM(ar.actual_cost), 0)
            FROM activity_products ap
            FULL OUTER JOIN activity_resources ar ON ap.activity_id = ar.activity_id
            WHERE COALESCE(ap.activity_id, ar.activity_id) = var_activity_id
        )
    WHERE id = var_activity_id;

    -- Update crop cycle totals
    UPDATE crop_cycles SET
        estimated_total_cost = var_estimated_cost,
        actual_total_cost = var_actual_cost,
        total_revenue = var_total_revenue,
        net_profit = var_net_profit,
        profit_per_hectare = var_profit_per_ha,
        profit_margin_percent = CASE WHEN var_total_revenue > 0 THEN (var_net_profit / var_total_revenue) * 100 ELSE 0 END,
        updated_at = NOW()
    WHERE id = var_crop_cycle_id;

    -- Return results
    RETURN QUERY
    SELECT
        var_activity_id,
        var_estimated_cost,
        var_actual_cost,
        var_total_revenue,
        var_net_profit,
        var_profit_per_ha;
END;
$$;

-- Function to save observation and update totals atomically
CREATE OR REPLACE FUNCTION save_observation_with_totals(
    p_observation_data JSONB
)
RETURNS TABLE(
    observation_id UUID,
    estimated_total_cost DECIMAL(12,2),
    actual_total_cost DECIMAL(12,2),
    total_revenue DECIMAL(12,2),
    net_profit DECIMAL(12,2),
    profit_per_hectare DECIMAL(12,2)
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_observation_id UUID;
    v_crop_cycle_id UUID;
    v_bloc_area DECIMAL(10,2);
    v_estimated_cost DECIMAL(12,2) := 0;
    v_actual_cost DECIMAL(12,2) := 0;
    v_total_revenue DECIMAL(12,2) := 0;
    v_net_profit DECIMAL(12,2) := 0;
    v_profit_per_ha DECIMAL(12,2) := 0;
    v_avg_yield DECIMAL(10,2) := 0;
BEGIN
    -- Extract crop cycle ID
    v_crop_cycle_id := (p_observation_data->>'crop_cycle_id')::UUID;

    -- Get bloc area for calculations
    SELECT b.area_hectares INTO v_bloc_area
    FROM crop_cycles cc
    JOIN blocs b ON cc.bloc_id = b.id
    WHERE cc.id = v_crop_cycle_id;

    -- Default to 1 hectare if not found
    v_bloc_area := COALESCE(v_bloc_area, 1.0);

    -- Insert or update observation
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
            p_observation_data->>'notes'
        ) RETURNING id INTO v_observation_id;
    END IF;

    -- Calculate totals for the entire crop cycle
    SELECT
        COALESCE(SUM(a.estimated_total_cost), 0),
        COALESCE(SUM(a.actual_total_cost), 0)
    INTO v_estimated_cost, v_actual_cost
    FROM activities a
    WHERE a.crop_cycle_id = v_crop_cycle_id;

    -- Calculate revenue from observations (Rs 3000 per ton default price)
    SELECT COALESCE(SUM(o.total_yield_tons * 3000), 0) INTO v_total_revenue
    FROM observations o
    WHERE o.crop_cycle_id = v_crop_cycle_id AND o.total_yield_tons IS NOT NULL;

    -- Calculate average yield per hectare
    SELECT COALESCE(AVG(o.yield_tons_ha), 0) INTO v_avg_yield
    FROM observations o
    WHERE o.crop_cycle_id = v_crop_cycle_id AND o.yield_tons_ha IS NOT NULL;

    -- Calculate profit metrics
    v_net_profit := v_total_revenue - v_actual_cost;
    v_profit_per_ha := CASE WHEN v_bloc_area > 0 THEN v_net_profit / v_bloc_area ELSE 0 END;

    -- Update crop cycle totals
    UPDATE crop_cycles SET
        estimated_total_cost = v_estimated_cost,
        actual_total_cost = v_actual_cost,
        sugarcane_actual_yield_tons_ha = v_avg_yield,
        total_revenue = v_total_revenue,
        sugarcane_revenue = v_total_revenue, -- Assuming all revenue is sugarcane for now
        intercrop_revenue = 0,
        net_profit = v_net_profit,
        profit_per_hectare = v_profit_per_ha,
        profit_margin_percent = CASE WHEN v_total_revenue > 0 THEN (v_net_profit / v_total_revenue) * 100 ELSE 0 END,
        updated_at = NOW()
    WHERE id = v_crop_cycle_id;

    -- Return results
    RETURN QUERY
    SELECT
        v_observation_id,
        v_estimated_cost,
        v_actual_cost,
        v_total_revenue,
        v_net_profit,
        v_profit_per_ha;
END;
$$;

-- Function to delete activity and update totals atomically
CREATE OR REPLACE FUNCTION delete_activity_with_totals(
    p_activity_id UUID
)
RETURNS TABLE(
    success BOOLEAN,
    estimated_total_cost DECIMAL(12,2),
    actual_total_cost DECIMAL(12,2),
    total_revenue DECIMAL(12,2),
    net_profit DECIMAL(12,2),
    profit_per_hectare DECIMAL(12,2)
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_crop_cycle_id UUID;
    v_bloc_area DECIMAL(10,2);
    v_estimated_cost DECIMAL(12,2) := 0;
    v_actual_cost DECIMAL(12,2) := 0;
    v_total_revenue DECIMAL(12,2) := 0;
    v_net_profit DECIMAL(12,2) := 0;
    v_profit_per_ha DECIMAL(12,2) := 0;
BEGIN
    -- Get crop cycle ID before deletion
    SELECT crop_cycle_id INTO v_crop_cycle_id
    FROM activities
    WHERE id = p_activity_id;

    IF v_crop_cycle_id IS NULL THEN
        RETURN QUERY SELECT FALSE, 0::DECIMAL(12,2), 0::DECIMAL(12,2), 0::DECIMAL(12,2), 0::DECIMAL(12,2), 0::DECIMAL(12,2);
        RETURN;
    END IF;

    -- Get bloc area
    SELECT b.area_hectares INTO v_bloc_area
    FROM crop_cycles cc
    JOIN blocs b ON cc.bloc_id = b.id
    WHERE cc.id = v_crop_cycle_id;

    v_bloc_area := COALESCE(v_bloc_area, 1.0);

    -- Delete activity (cascade will delete products and resources)
    DELETE FROM activities WHERE id = p_activity_id;

    -- Recalculate totals
    SELECT
        COALESCE(SUM(a.estimated_total_cost), 0),
        COALESCE(SUM(a.actual_total_cost), 0)
    INTO v_estimated_cost, v_actual_cost
    FROM activities a
    WHERE a.crop_cycle_id = v_crop_cycle_id;

    SELECT COALESCE(SUM(o.total_yield_tons * 3000), 0) INTO v_total_revenue
    FROM observations o
    WHERE o.crop_cycle_id = v_crop_cycle_id AND o.total_yield_tons IS NOT NULL;

    v_net_profit := v_total_revenue - v_actual_cost;
    v_profit_per_ha := CASE WHEN v_bloc_area > 0 THEN v_net_profit / v_bloc_area ELSE 0 END;

    -- Update crop cycle totals
    UPDATE crop_cycles SET
        estimated_total_cost = v_estimated_cost,
        actual_total_cost = v_actual_cost,
        total_revenue = v_total_revenue,
        net_profit = v_net_profit,
        profit_per_hectare = v_profit_per_ha,
        profit_margin_percent = CASE WHEN v_total_revenue > 0 THEN (v_net_profit / v_total_revenue) * 100 ELSE 0 END,
        updated_at = NOW()
    WHERE id = v_crop_cycle_id;

    RETURN QUERY SELECT TRUE, v_estimated_cost, v_actual_cost, v_total_revenue, v_net_profit, v_profit_per_ha;
END;
$$;

-- Function to delete observation and update totals atomically
CREATE OR REPLACE FUNCTION delete_observation_with_totals(
    p_observation_id UUID
)
RETURNS TABLE(
    success BOOLEAN,
    estimated_total_cost DECIMAL(12,2),
    actual_total_cost DECIMAL(12,2),
    total_revenue DECIMAL(12,2),
    net_profit DECIMAL(12,2),
    profit_per_hectare DECIMAL(12,2)
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_crop_cycle_id UUID;
    v_bloc_area DECIMAL(10,2);
    v_estimated_cost DECIMAL(12,2) := 0;
    v_actual_cost DECIMAL(12,2) := 0;
    v_total_revenue DECIMAL(12,2) := 0;
    v_net_profit DECIMAL(12,2) := 0;
    v_profit_per_ha DECIMAL(12,2) := 0;
    v_avg_yield DECIMAL(10,2) := 0;
BEGIN
    -- Get crop cycle ID before deletion
    SELECT crop_cycle_id INTO v_crop_cycle_id
    FROM observations
    WHERE id = p_observation_id;

    IF v_crop_cycle_id IS NULL THEN
        RETURN QUERY SELECT FALSE, 0::DECIMAL(12,2), 0::DECIMAL(12,2), 0::DECIMAL(12,2), 0::DECIMAL(12,2), 0::DECIMAL(12,2);
        RETURN;
    END IF;

    -- Get bloc area
    SELECT b.area_hectares INTO v_bloc_area
    FROM crop_cycles cc
    JOIN blocs b ON cc.bloc_id = b.id
    WHERE cc.id = v_crop_cycle_id;

    v_bloc_area := COALESCE(v_bloc_area, 1.0);

    -- Delete observation
    DELETE FROM observations WHERE id = p_observation_id;

    -- Recalculate totals
    SELECT
        COALESCE(SUM(a.estimated_total_cost), 0),
        COALESCE(SUM(a.actual_total_cost), 0)
    INTO v_estimated_cost, v_actual_cost
    FROM activities a
    WHERE a.crop_cycle_id = v_crop_cycle_id;

    SELECT COALESCE(SUM(o.total_yield_tons * 3000), 0) INTO v_total_revenue
    FROM observations o
    WHERE o.crop_cycle_id = v_crop_cycle_id AND o.total_yield_tons IS NOT NULL;

    SELECT COALESCE(AVG(o.yield_tons_ha), 0) INTO v_avg_yield
    FROM observations o
    WHERE o.crop_cycle_id = v_crop_cycle_id AND o.yield_tons_ha IS NOT NULL;

    v_net_profit := v_total_revenue - v_actual_cost;
    v_profit_per_ha := CASE WHEN v_bloc_area > 0 THEN v_net_profit / v_bloc_area ELSE 0 END;

    -- Update crop cycle totals
    UPDATE crop_cycles SET
        estimated_total_cost = v_estimated_cost,
        actual_total_cost = v_actual_cost,
        sugarcane_actual_yield_tons_ha = v_avg_yield,
        total_revenue = v_total_revenue,
        sugarcane_revenue = v_total_revenue,
        intercrop_revenue = 0,
        net_profit = v_net_profit,
        profit_per_hectare = v_profit_per_ha,
        profit_margin_percent = CASE WHEN v_total_revenue > 0 THEN (v_net_profit / v_total_revenue) * 100 ELSE 0 END,
        updated_at = NOW()
    WHERE id = v_crop_cycle_id;

    RETURN QUERY SELECT TRUE, v_estimated_cost, v_actual_cost, v_total_revenue, v_net_profit, v_profit_per_ha;
END;
$$;
