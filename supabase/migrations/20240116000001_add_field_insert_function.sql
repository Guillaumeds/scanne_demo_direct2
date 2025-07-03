-- Create function to insert fields with proper PostGIS geometry handling
CREATE OR REPLACE FUNCTION insert_field_with_geometry(
  p_field_id VARCHAR(100),
  p_field_name VARCHAR(255),
  p_coordinates_wkt TEXT,
  p_area_hectares DECIMAL(10,4),
  p_status VARCHAR(50),
  p_osm_id INTEGER,
  p_farm_id UUID
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_field_id UUID;
BEGIN
  -- Insert field with PostGIS geometry conversion
  INSERT INTO fields (
    field_id,
    field_name,
    coordinates,
    area_hectares,
    status,
    osm_id,
    farm_id
  ) VALUES (
    p_field_id,
    p_field_name,
    ST_GeomFromText(p_coordinates_wkt, 4326),
    p_area_hectares,
    p_status,
    p_osm_id,
    p_farm_id
  )
  RETURNING id INTO new_field_id;
  
  RETURN new_field_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION insert_field_with_geometry TO authenticated;
GRANT EXECUTE ON FUNCTION insert_field_with_geometry TO anon;
