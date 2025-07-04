-- Add sort_order column to intercrop_varieties table for proper ordering
-- This ensures "none" is always first, followed by alphabetical order

-- Add sort_order column to intercrop_varieties
ALTER TABLE intercrop_varieties 
ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 999;

-- Update sort_order for existing records
-- Set "none" to 0 (first), others get higher values
UPDATE intercrop_varieties
SET sort_order = CASE
    WHEN variety_id = 'none' THEN 0
    ELSE 100
END;

-- Add sort_order column to sugarcane_varieties for consistency
ALTER TABLE sugarcane_varieties 
ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 999;

-- Update sort_order for sugarcane varieties (default value)
UPDATE sugarcane_varieties
SET sort_order = 100;

-- Add sort_order to other configuration tables for consistency
ALTER TABLE activity_categories 
ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 999;

UPDATE activity_categories 
SET sort_order = CASE category_id
    WHEN 'land-preparation' THEN 1
    WHEN 'planting' THEN 2
    WHEN 'establishment' THEN 3
    WHEN 'growth' THEN 4
    WHEN 'maintenance' THEN 5
    WHEN 'pre-harvest' THEN 6
    WHEN 'harvest' THEN 7
    WHEN 'post-harvest' THEN 8
    ELSE 100
END;

ALTER TABLE observation_categories 
ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 999;

UPDATE observation_categories 
SET sort_order = CASE category_id
    WHEN 'soil' THEN 1
    WHEN 'water' THEN 2
    WHEN 'plant' THEN 3
    WHEN 'pest' THEN 4
    WHEN 'disease' THEN 5
    WHEN 'weather' THEN 6
    WHEN 'yield' THEN 7
    WHEN 'quality' THEN 8
    ELSE 100
END;

ALTER TABLE attachment_categories 
ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 999;

UPDATE attachment_categories
SET sort_order = 100;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_intercrop_varieties_sort_order ON intercrop_varieties(sort_order);
CREATE INDEX IF NOT EXISTS idx_sugarcane_varieties_sort_order ON sugarcane_varieties(sort_order);
CREATE INDEX IF NOT EXISTS idx_activity_categories_sort_order ON activity_categories(sort_order);
CREATE INDEX IF NOT EXISTS idx_observation_categories_sort_order ON observation_categories(sort_order);
CREATE INDEX IF NOT EXISTS idx_attachment_categories_sort_order ON attachment_categories(sort_order);

SELECT 'Sort order columns added and configured successfully!' as status;
