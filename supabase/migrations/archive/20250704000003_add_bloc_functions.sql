-- =====================================================
-- DATABASE FUNCTIONS FOR BLOCS
-- =====================================================
-- Add the missing functions that the frontend expects

-- Function to get blocs with WKT coordinates
CREATE OR REPLACE FUNCTION get_blocs_with_wkt()
RETURNS TABLE(
    id UUID,
    name VARCHAR(255),
    area_hectares DECIMAL(10,2),
    coordinates_wkt TEXT,
    status VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        b.id,
        b.name,
        b.area_hectares,
        ST_AsText(b.coordinates) as coordinates_wkt,
        b.status,
        b.created_at,
        b.updated_at
    FROM blocs b
    WHERE b.status = 'active'
    ORDER BY b.created_at DESC;
END;
$$;

-- Real crop cycle totals calculation function
CREATE OR REPLACE FUNCTION calculate_crop_cycle_totals(cycle_id UUID)
RETURNS TABLE(
    estimated_total_cost DECIMAL(12,2),
    actual_total_cost DECIMAL(12,2),
    sugarcane_yield_tonnes_per_hectare DECIMAL(10,2),
    intercrop_yield_tonnes_per_hectare DECIMAL(10,2),
    total_revenue DECIMAL(12,2),
    profit_per_hectare DECIMAL(12,2)
)
LANGUAGE plpgsql
AS $$
DECLARE
    activity_estimated_cost DECIMAL(12,2) := 0;
    activity_actual_cost DECIMAL(12,2) := 0;
    observation_revenue DECIMAL(12,2) := 0;
    observation_yield DECIMAL(10,2) := 0;
    bloc_area DECIMAL(10,2) := 1; -- Default to 1 hectare to avoid division by zero
BEGIN
    -- Get bloc area for per-hectare calculations
    SELECT COALESCE(b.area_hectares, 1.0) INTO bloc_area
    FROM crop_cycles cc
    JOIN blocs b ON cc.bloc_id = b.id
    WHERE cc.id = cycle_id;

    -- Calculate total estimated costs from activities
    SELECT COALESCE(SUM(a.estimated_total_cost), 0) INTO activity_estimated_cost
    FROM activities a
    WHERE a.crop_cycle_id = cycle_id;

    -- Calculate total actual costs from activities
    SELECT COALESCE(SUM(a.actual_total_cost), 0) INTO activity_actual_cost
    FROM activities a
    WHERE a.crop_cycle_id = cycle_id;

    -- Calculate total revenue from observations
    -- This is a simplified calculation - in reality you'd calculate from yield * price
    SELECT COALESCE(SUM(o.total_yield_tons * 3000), 0) INTO observation_revenue
    FROM observations o
    WHERE o.crop_cycle_id = cycle_id AND o.total_yield_tons IS NOT NULL;

    -- Calculate average yield per hectare from observations
    SELECT COALESCE(AVG(o.yield_tons_ha), 0) INTO observation_yield
    FROM observations o
    WHERE o.crop_cycle_id = cycle_id AND o.yield_tons_ha IS NOT NULL;

    -- Return calculated totals
    RETURN QUERY
    SELECT
        activity_estimated_cost as estimated_total_cost,
        activity_actual_cost as actual_total_cost,
        observation_yield as sugarcane_yield_tonnes_per_hectare,
        0.0 as intercrop_yield_tonnes_per_hectare,
        observation_revenue as total_revenue,
        CASE
            WHEN bloc_area > 0
            THEN (observation_revenue - activity_actual_cost) / bloc_area
            ELSE 0.0
        END as profit_per_hectare;
END;
$$;
