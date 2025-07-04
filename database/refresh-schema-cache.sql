-- =====================================================
-- REFRESH POSTGREST SCHEMA CACHE
-- =====================================================
-- This fixes the "Could not find a relationship" error by refreshing PostgREST's schema cache

-- Notify PostgREST to reload the schema cache
NOTIFY pgrst, 'reload schema';

-- Alternative method: Send reload signal
SELECT pg_notify('pgrst', 'reload schema');

-- Verify the foreign key relationships exist
SELECT 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_name = 'crop_cycles'
  AND kcu.column_name = 'sugarcane_variety_id';

-- Also check if the tables exist and have data
SELECT 'sugarcane_varieties' as table_name, COUNT(*) as record_count FROM sugarcane_varieties
UNION ALL
SELECT 'crop_cycles' as table_name, COUNT(*) as record_count FROM crop_cycles
UNION ALL
SELECT 'intercrop_varieties' as table_name, COUNT(*) as record_count FROM intercrop_varieties;
