-- =====================================================
-- FIX POSTGREST SCHEMA CACHE ISSUE
-- =====================================================
-- This fixes the "Could not find a relationship" error

-- Refresh PostgREST schema cache
NOTIFY pgrst, 'reload schema';

-- Verify foreign key relationships exist
SELECT 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_name = 'crop_cycles'
  AND kcu.column_name = 'sugarcane_variety_id';

-- Check table counts
SELECT 'sugarcane_varieties' as table_name, COUNT(*) as records FROM sugarcane_varieties
UNION ALL
SELECT 'crop_cycles' as table_name, COUNT(*) as records FROM crop_cycles;
