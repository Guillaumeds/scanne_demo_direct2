-- =====================================================
-- Add Sample Fields Data
-- This creates sample fields that blocs can reference
-- =====================================================

-- Sample fields for Belle Vue Estate
INSERT INTO fields (id, field_id, field_name, coordinates, area_hectares, status, farm_id) VALUES
(
    '550e8400-e29b-41d4-a716-446655440010',
    'BV-001',
    'North Field',
    ST_GeomFromText('POLYGON((-20.1 57.5, -20.1 57.51, -20.09 57.51, -20.09 57.5, -20.1 57.5))', 4326),
    25.5,
    'active',
    '550e8400-e29b-41d4-a716-446655440001'
),
(
    '550e8400-e29b-41d4-a716-446655440011',
    'BV-002', 
    'South Field',
    ST_GeomFromText('POLYGON((-20.11 57.5, -20.11 57.51, -20.10 57.51, -20.10 57.5, -20.11 57.5))', 4326),
    32.8,
    'active',
    '550e8400-e29b-41d4-a716-446655440001'
),
(
    '550e8400-e29b-41d4-a716-446655440012',
    'BV-003',
    'East Field', 
    ST_GeomFromText('POLYGON((-20.09 57.51, -20.09 57.52, -20.08 57.52, -20.08 57.51, -20.09 57.51))', 4326),
    18.2,
    'active',
    '550e8400-e29b-41d4-a716-446655440001'
),
(
    '550e8400-e29b-41d4-a716-446655440013',
    'BV-004',
    'West Field',
    ST_GeomFromText('POLYGON((-20.12 57.5, -20.12 57.51, -20.11 57.51, -20.11 57.5, -20.12 57.5))', 4326),
    41.3,
    'active',
    '550e8400-e29b-41d4-a716-446655440001'
),
(
    '550e8400-e29b-41d4-a716-446655440014',
    'BV-005',
    'Central Field',
    ST_GeomFromText('POLYGON((-20.10 57.505, -20.10 57.515, -20.095 57.515, -20.095 57.505, -20.10 57.505))', 4326),
    15.7,
    'active',
    '550e8400-e29b-41d4-a716-446655440001'
);

-- Verify the data was inserted
SELECT 
    field_id,
    field_name,
    area_hectares,
    status,
    ST_AsText(coordinates) as coordinates_text
FROM fields 
ORDER BY field_id;
