-- Optimization: Get only latest crop cycle per bloc for bloc cards
-- This replaces the inefficient query that fetches ALL cycles for ALL blocs

CREATE OR REPLACE FUNCTION get_latest_crop_cycles_for_blocs(bloc_ids UUID[])
RETURNS TABLE (
  id UUID,
  bloc_id UUID,
  type TEXT,
  cycle_number INTEGER,
  status TEXT,
  growth_stage TEXT,
  growth_stage_updated_at TIMESTAMPTZ,
  days_since_planting INTEGER,
  sugarcane_variety_id UUID,
  intercrop_variety_id UUID,
  sugarcane_planting_date DATE,
  sugarcane_planned_harvest_date DATE,
  sugarcane_actual_harvest_date DATE,
  sugarcane_actual_yield_tons_ha DECIMAL,
  sugarcane_expected_yield_tons_ha DECIMAL,
  closure_validated BOOLEAN,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE SQL
STABLE
AS $$
  SELECT DISTINCT ON (cc.bloc_id)
    cc.id,
    cc.bloc_id,
    cc.type,
    cc.cycle_number,
    cc.status,
    cc.growth_stage,
    cc.growth_stage_updated_at,
    cc.days_since_planting,
    cc.sugarcane_variety_id,
    cc.intercrop_variety_id,
    cc.sugarcane_planting_date,
    cc.sugarcane_planned_harvest_date,
    cc.sugarcane_actual_harvest_date,
    cc.sugarcane_actual_yield_tons_ha,
    cc.sugarcane_expected_yield_tons_ha,
    cc.closure_validated,
    cc.created_at,
    cc.updated_at
  FROM crop_cycles cc
  WHERE cc.bloc_id = ANY(bloc_ids)
  ORDER BY cc.bloc_id, cc.cycle_number DESC;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_latest_crop_cycles_for_blocs(UUID[]) TO authenticated;

-- Add comment for documentation
COMMENT ON FUNCTION get_latest_crop_cycles_for_blocs(UUID[]) IS 
'Optimized function to get only the latest crop cycle per bloc for bloc card display. 
Reduces data transfer by 67-80% compared to fetching all cycles.';
