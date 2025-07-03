-- Add helper functions for coordinate conversion
-- These functions help convert between PostGIS geometry and application formats

-- Function to get field coordinates as WKT text
CREATE OR REPLACE FUNCTION get_field_coordinates_wkt(field_uuid UUID)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    wkt_result TEXT;
BEGIN
    SELECT ST_AsText(coordinates) INTO wkt_result
    FROM fields 
    WHERE id = field_uuid;
    
    RETURN wkt_result;
END;
$$;

-- Function to get all fields with their WKT coordinates
CREATE OR REPLACE FUNCTION get_fields_with_wkt()
RETURNS TABLE(
    id UUID,
    field_id VARCHAR(100),
    field_name VARCHAR(255),
    coordinates_wkt TEXT,
    area_hectares DECIMAL(10,4),
    status VARCHAR(50),
    osm_id INTEGER,
    farm_id UUID,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        f.id,
        f.field_id,
        f.field_name,
        ST_AsText(f.coordinates) as coordinates_wkt,
        f.area_hectares,
        f.status,
        f.osm_id,
        f.farm_id,
        f.created_at,
        f.updated_at
    FROM fields f
    WHERE f.status = 'active'
    ORDER BY f.field_name;
END;
$$;

-- Function to get fields for a specific farm with WKT coordinates
CREATE OR REPLACE FUNCTION get_farm_fields_with_wkt(farm_uuid UUID)
RETURNS TABLE(
    id UUID,
    field_id VARCHAR(100),
    field_name VARCHAR(255),
    coordinates_wkt TEXT,
    area_hectares DECIMAL(10,4),
    status VARCHAR(50),
    osm_id INTEGER,
    farm_id UUID,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        f.id,
        f.field_id,
        f.field_name,
        ST_AsText(f.coordinates) as coordinates_wkt,
        f.area_hectares,
        f.status,
        f.osm_id,
        f.farm_id,
        f.created_at,
        f.updated_at
    FROM fields f
    WHERE f.status = 'active' 
      AND f.farm_id = farm_uuid
    ORDER BY f.field_name;
END;
$$;

-- Function to get all blocs with WKT coordinates
CREATE OR REPLACE FUNCTION get_blocs_with_wkt()
RETURNS TABLE(
    id UUID,
    name VARCHAR(255),
    description TEXT,
    coordinates_wkt TEXT,
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
    SELECT
        b.id,
        b.name,
        b.description,
        ST_AsText(b.coordinates) as coordinates_wkt,
        b.area_hectares,
        b.status,
        b.field_id,
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
