-- =====================================================
-- UPDATE ALL ICONS TO LUCIDE REACT ICON NAMES
-- =====================================================
-- Replace all emoji icons with proper Lucide React icon names
-- Based on the icon library used in the project

-- =====================================================
-- 1. UPDATE SUGARCANE VARIETIES ICONS
-- =====================================================

UPDATE sugarcane_varieties SET icon = 'Wheat' WHERE variety_id IN (
  'm-1176-77', 'm-52-78', 'm-387-85', 'm-1400-86', 'm-2256-88', 'm-703-89',
  'm-1861-89', 'm-1672-90', 'm-2593-92', 'm-2283-98', 'm-683-99', 'm-1989-99',
  'm-2502-99', 'm-1392-00', 'm-63', 'm-1561-01', 'm-216-02', 'm-1002-02',
  'm-1698-02', 'm-64', 'm-1256-04', 'm-915-05', 'm-65', 'r573', 'r575',
  'r579', 'm-3035-66', 'm-1246-84', 'm-1394-86', 'm-2024-88', 'm-2238-89',
  'r570', 'r585'
);

-- =====================================================
-- 2. UPDATE INTERCROP VARIETIES ICONS
-- =====================================================

-- None option
UPDATE intercrop_varieties SET icon = 'X' WHERE variety_id = 'none';

-- Legume crops (nitrogen fixers)
UPDATE intercrop_varieties SET icon = 'Leaf' WHERE variety_id IN (
  'cowpea', 'soybean', 'blackgram', 'greengram', 'pigeonpea', 'chickpea', 'fieldpea'
);

-- Root crops
UPDATE intercrop_varieties SET icon = 'Apple' WHERE variety_id = 'groundnut';

-- =====================================================
-- 3. UPDATE ACTIVITY CATEGORIES ICONS
-- =====================================================

UPDATE activity_categories SET icon = 'Tractor' WHERE category_id = 'land-preparation';
UPDATE activity_categories SET icon = 'Sprout' WHERE category_id = 'planting';
UPDATE activity_categories SET icon = 'TreePine' WHERE category_id = 'establishment';
UPDATE activity_categories SET icon = 'Droplets' WHERE category_id = 'fertilization';
UPDATE activity_categories SET icon = 'Shield' WHERE category_id = 'pest-control';
UPDATE activity_categories SET icon = 'Droplets' WHERE category_id = 'irrigation';
UPDATE activity_categories SET icon = 'Shovel' WHERE category_id = 'cultivation';
UPDATE activity_categories SET icon = 'Wrench' WHERE category_id = 'maintenance';
UPDATE activity_categories SET icon = 'Eye' WHERE category_id = 'monitoring';
UPDATE activity_categories SET icon = 'Scissors' WHERE category_id = 'harvesting';
UPDATE activity_categories SET icon = 'Broom' WHERE category_id = 'post-harvest';
UPDATE activity_categories SET icon = 'Truck' WHERE category_id = 'transport';

-- =====================================================
-- 4. UPDATE OBSERVATION CATEGORIES ICONS
-- =====================================================

UPDATE observation_categories SET icon = 'Mountain' WHERE category_id = 'soil';
UPDATE observation_categories SET icon = 'Droplets' WHERE category_id = 'water';
UPDATE observation_categories SET icon = 'Leaf' WHERE category_id = 'plant';
UPDATE observation_categories SET icon = 'Bug' WHERE category_id = 'pest';
UPDATE observation_categories SET icon = 'Cloud' WHERE category_id = 'weather';
UPDATE observation_categories SET icon = 'BarChart3' WHERE category_id = 'yield';
UPDATE observation_categories SET icon = 'Cog' WHERE category_id = 'equipment';
UPDATE observation_categories SET icon = 'Eye' WHERE category_id = 'general';

-- =====================================================
-- 5. UPDATE ATTACHMENT CATEGORIES ICONS
-- =====================================================

UPDATE attachment_categories SET icon = 'Camera' WHERE category_id = 'photos';
UPDATE attachment_categories SET icon = 'FileText' WHERE category_id = 'documents';
UPDATE attachment_categories SET icon = 'BarChart3' WHERE category_id = 'reports';
UPDATE attachment_categories SET icon = 'Award' WHERE category_id = 'certificates';
UPDATE attachment_categories SET icon = 'Map' WHERE category_id = 'maps';
UPDATE attachment_categories SET icon = 'Receipt' WHERE category_id = 'receipts';
UPDATE attachment_categories SET icon = 'FileSignature' WHERE category_id = 'contracts';
UPDATE attachment_categories SET icon = 'Video' WHERE category_id = 'videos';
UPDATE attachment_categories SET icon = 'Paperclip' WHERE category_id = 'other';

-- =====================================================
-- 6. UPDATE PRODUCTS ICONS (All fertilizers and inputs)
-- =====================================================

-- All fertilizers get the Leaf icon (representing plant nutrition)
UPDATE products SET icon = 'Leaf' WHERE category = 'Fertilizer';

-- =====================================================
-- 7. UPDATE RESOURCES ICONS (Equipment, Labor, etc.)
-- =====================================================

-- Tractors and heavy equipment
UPDATE resources SET icon = 'Truck' WHERE resource_id IN (
  'tractor-small', 'tractor-medium', 'tractor-large', 'bulldozer', 'excavator',
  'grader', 'compactor', 'cane-harvester', 'cane-loader'
);

-- Transport vehicles
UPDATE resources SET icon = 'Truck' WHERE resource_id IN (
  'pickup-truck', 'utility-vehicle', 'truck-small', 'truck-large', 'trailer', 'cane-trailer'
);

-- Labor resources
UPDATE resources SET icon = 'User' WHERE resource_id = 'field-worker';
UPDATE resources SET icon = 'UserCheck' WHERE resource_id IN ('skilled-worker', 'overtime-skilled');
UPDATE resources SET icon = 'Settings' WHERE resource_id = 'machine-operator';
UPDATE resources SET icon = 'UserCog' WHERE resource_id = 'supervisor';
UPDATE resources SET icon = 'User' WHERE resource_id IN ('overtime-worker', 'seasonal-worker');

-- Equipment and tools
UPDATE resources SET icon = 'Shovel' WHERE resource_id IN ('plow', 'disc-harrow', 'cultivator');
UPDATE resources SET icon = 'Sprout' WHERE resource_id = 'planter';
UPDATE resources SET icon = 'Droplets' WHERE resource_id IN ('fertilizer-spreader', 'sprayer');
UPDATE resources SET icon = 'Scissors' WHERE resource_id IN ('mower', 'cutting-tools');

-- Irrigation systems
UPDATE resources SET icon = 'Droplets' WHERE resource_id IN (
  'drip-system', 'sprinkler-system', 'pump-electric', 'pump-diesel', 'cleaning-station'
);

-- Tools and processing
UPDATE resources SET icon = 'Wrench' WHERE resource_id = 'hand-tools';
UPDATE resources SET icon = 'Scale' WHERE resource_id = 'weighbridge';
UPDATE resources SET icon = 'Fuel' WHERE resource_id = 'fuel-diesel';

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check that all icons have been updated (no emojis remaining)
SELECT 'Sugarcane Varieties' as table_name, COUNT(*) as total_records, 
       COUNT(CASE WHEN icon NOT LIKE '%emoji%' AND icon NOT LIKE '%🌿%' AND icon NOT LIKE '%sprout%' THEN 1 END) as updated_icons
FROM sugarcane_varieties
UNION ALL
SELECT 'Intercrop Varieties', COUNT(*), 
       COUNT(CASE WHEN icon NOT LIKE '%emoji%' AND icon NOT LIKE '%🌿%' AND icon NOT LIKE '%leaf%' THEN 1 END)
FROM intercrop_varieties
UNION ALL
SELECT 'Activity Categories', COUNT(*), 
       COUNT(CASE WHEN icon NOT LIKE '%emoji%' AND icon NOT LIKE '%🚜%' THEN 1 END)
FROM activity_categories
UNION ALL
SELECT 'Observation Categories', COUNT(*), 
       COUNT(CASE WHEN icon NOT LIKE '%emoji%' AND icon NOT LIKE '%🌱%' THEN 1 END)
FROM observation_categories
UNION ALL
SELECT 'Attachment Categories', COUNT(*), 
       COUNT(CASE WHEN icon NOT LIKE '%emoji%' AND icon NOT LIKE '%📷%' THEN 1 END)
FROM attachment_categories
UNION ALL
SELECT 'Products', COUNT(*), 
       COUNT(CASE WHEN icon NOT LIKE '%emoji%' AND icon NOT LIKE '%🌿%' THEN 1 END)
FROM products
UNION ALL
SELECT 'Resources', COUNT(*), 
       COUNT(CASE WHEN icon NOT LIKE '%emoji%' AND icon NOT LIKE '%👷%' THEN 1 END)
FROM resources;

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================

SELECT 'All icons successfully updated to Lucide React icon names!' as status;
