-- Fix the get_blocs_with_wkt function to include description field
CREATE OR REPLACE FUNCTION get_blocs_with_wkt()
RETURNS TABLE(
    id UUID,
    name VARCHAR(255),
    description TEXT,
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
        CAST(NULL AS TEXT) as description, -- Add description field (currently NULL in schema)
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
