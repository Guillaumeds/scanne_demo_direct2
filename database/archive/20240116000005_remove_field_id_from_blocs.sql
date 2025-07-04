-- Remove field_id column from blocs table
-- This removes the requirement for blocs to be associated with fields

-- Drop the foreign key constraint first
ALTER TABLE blocs DROP CONSTRAINT IF EXISTS blocs_field_id_fkey;

-- Drop the field_id column
ALTER TABLE blocs DROP COLUMN IF EXISTS field_id;

-- Update the insert_bloc_with_geometry function to not require field_id
DROP FUNCTION IF EXISTS insert_bloc_with_geometry;

CREATE OR REPLACE FUNCTION insert_bloc_with_geometry(
  bloc_name VARCHAR(255),
  bloc_description TEXT,
  polygon_wkt TEXT,
  bloc_area_hectares DECIMAL(10,4),
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
    status,
    created_date,
    retired_date,
    intersecting_fields,
    metadata,
    created_at,
    updated_at
  )
  VALUES (
    COALESCE(bloc_id, gen_random_uuid()),
    bloc_name,
    bloc_description,
    ST_SetSRID(ST_GeomFromText(polygon_wkt), 4326)::GEOMETRY(POLYGON, 4326),
    bloc_area_hectares,
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
    blocs.created_date,
    blocs.retired_date,
    blocs.intersecting_fields,
    blocs.metadata,
    blocs.created_at,
    blocs.updated_at;
END;
$$;

-- Update the get_blocs_with_wkt function to not include field_id
DROP FUNCTION IF EXISTS get_blocs_with_wkt;

CREATE OR REPLACE FUNCTION get_blocs_with_wkt()
RETURNS TABLE(
    id UUID,
    name VARCHAR(255),
    description TEXT,
    coordinates_wkt TEXT,
    area_hectares DECIMAL(10,4),
    status VARCHAR(20),
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
    SELECT
        b.id,
        b.name,
        b.description,
        ST_AsText(b.coordinates) as coordinates_wkt,
        b.area_hectares,
        b.status,
        b.created_date,
        b.retired_date,
        b.intersecting_fields,
        b.metadata,
        b.created_at,
        b.updated_at
    FROM blocs b
    WHERE b.status = 'active'
    ORDER BY b.created_at DESC;
END;
$$;
