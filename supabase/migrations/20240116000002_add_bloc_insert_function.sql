-- Add function to insert blocs with proper geometry conversion
-- This function handles the WKT to PostGIS geometry conversion

CREATE OR REPLACE FUNCTION insert_bloc_with_geometry(
  bloc_id UUID,
  bloc_name VARCHAR(255),
  bloc_description TEXT,
  polygon_wkt TEXT,
  bloc_area_hectares DECIMAL(10,4),
  bloc_field_id UUID,
  bloc_status VARCHAR(20) DEFAULT 'active'
)
RETURNS TABLE(
  id UUID,
  name VARCHAR(255),
  description TEXT,
  coordinates POLYGON,
  area_hectares DECIMAL(10,4),
  status VARCHAR(20),
  field_id UUID,
  created_date DATE,
  retired_date DATE,
  intersecting_fields JSONB,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  INSERT INTO blocs (
    id,
    name,
    description,
    coordinates,
    area_hectares,
    field_id,
    status,
    created_date,
    retired_date,
    intersecting_fields,
    metadata,
    created_at,
    updated_at
  )
  VALUES (
    bloc_id,
    bloc_name,
    bloc_description,
    ST_GeomFromText(polygon_wkt)::POLYGON,
    bloc_area_hectares,
    bloc_field_id,
    bloc_status,
    CURRENT_DATE,
    NULL,
    '{}'::JSONB,
    '{}'::JSONB,
    NOW(),
    NOW()
  )
  RETURNING 
    blocs.id,
    blocs.name,
    blocs.description,
    blocs.coordinates,
    blocs.area_hectares,
    blocs.status,
    blocs.field_id,
    blocs.created_date,
    blocs.retired_date,
    blocs.intersecting_fields,
    blocs.metadata,
    blocs.created_at,
    blocs.updated_at;
END;
$$;
