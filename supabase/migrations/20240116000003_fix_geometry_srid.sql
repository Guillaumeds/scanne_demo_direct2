-- Fix geometry columns to use proper SRID 4326 for GPS coordinates
-- This ensures all spatial data uses the correct coordinate reference system

-- Enable PostGIS extension if not already enabled
CREATE EXTENSION IF NOT EXISTS postgis;

-- Drop existing constraints and indexes
DROP INDEX IF EXISTS idx_farms_farm_boundary;
DROP INDEX IF EXISTS idx_fields_coordinates;
DROP INDEX IF EXISTS idx_blocs_coordinates;

-- Alter tables to use proper GEOMETRY type with SRID 4326
ALTER TABLE farms 
  ALTER COLUMN farm_boundary TYPE GEOMETRY(POLYGON, 4326) 
  USING ST_SetSRID(farm_boundary::geometry, 4326);

ALTER TABLE farms 
  ALTER COLUMN center_location TYPE GEOMETRY(POINT, 4326) 
  USING ST_SetSRID(center_location::geometry, 4326);

ALTER TABLE fields 
  ALTER COLUMN coordinates TYPE GEOMETRY(POLYGON, 4326) 
  USING ST_SetSRID(coordinates::geometry, 4326);

ALTER TABLE blocs 
  ALTER COLUMN coordinates TYPE GEOMETRY(POLYGON, 4326) 
  USING ST_SetSRID(coordinates::geometry, 4326);

-- Recreate spatial indexes with proper SRID
CREATE INDEX idx_farms_farm_boundary ON farms USING GIST (farm_boundary);
CREATE INDEX idx_fields_coordinates ON fields USING GIST (coordinates);
CREATE INDEX idx_blocs_coordinates ON blocs USING GIST (coordinates);

-- Update the bloc insertion function to use proper SRID
DROP FUNCTION IF EXISTS insert_bloc_with_geometry;

CREATE OR REPLACE FUNCTION insert_bloc_with_geometry(
  bloc_name VARCHAR(255),
  bloc_description TEXT,
  polygon_wkt TEXT,
  bloc_area_hectares DECIMAL(10,4),
  bloc_field_id UUID,
  bloc_status VARCHAR(20) DEFAULT 'active',
  bloc_id UUID DEFAULT NULL
)
RETURNS TABLE(
  id UUID,
  name VARCHAR(255),
  description TEXT,
  coordinates GEOMETRY(POLYGON, 4326),
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
    COALESCE(bloc_id, gen_random_uuid()), -- Generate UUID if not provided
    bloc_name,
    bloc_description,
    ST_SetSRID(ST_GeomFromText(polygon_wkt), 4326)::GEOMETRY(POLYGON, 4326),
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
