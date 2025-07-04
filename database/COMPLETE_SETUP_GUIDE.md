# 🗄️ Complete Database Setup Guide

This guide ensures that all database functions, indexes, and configuration data are properly applied when creating databases from scratch.

## 📋 **Migration Files Overview**

### **Core Schema Migrations**
1. **`20240115000001_initial_schema.sql`** - Complete database schema with all functions
2. **`20240115000002_indexes_and_triggers.sql`** - Performance indexes and triggers
3. **`20240116000001_add_field_insert_function.sql`** - Field management functions
4. **`20240116000002_add_bloc_insert_function.sql`** - Bloc management functions (legacy)
5. **`20240116000003_fix_geometry_srid.sql`** - PostGIS SRID fixes (legacy)
6. **`20240116000004_add_coordinate_functions.sql`** - Coordinate helper functions (legacy)
7. **`20240116000005_remove_field_id_from_blocs.sql`** - Remove field_id requirement (legacy)
8. **`20240117000001_add_activities_observations_attachments.sql`** - Activity/observation tables
9. **`20240116000006_complete_configuration_data.sql`** - All reference data

### **Data Population Migrations**
- **Configuration Data**: Sugarcane varieties, intercrop varieties, activity categories, observation categories

## 🚀 **Quick Setup Commands**

### **For New Database (Recommended)**
```bash
# Reset and apply all migrations
npx supabase db reset --local

# Verify all functions are created
npx supabase db diff --local
```

### **For Existing Database**
```bash
# Apply specific migrations
npx supabase db push --local

# Populate configuration data
node scripts/populate-config-data.js
```

## 🔧 **Database Functions Included**

### **1. Bloc Management Functions**

#### `insert_bloc_with_geometry()`
```sql
-- Insert bloc with proper PostGIS geometry (no field_id required)
SELECT * FROM insert_bloc_with_geometry(
  'Test Bloc',                    -- bloc_name
  'Test description',             -- bloc_description  
  'POLYGON((-20.4 57.6, ...))',  -- polygon_wkt
  1.5,                           -- bloc_area_hectares
  'active',                      -- bloc_status (optional)
  NULL                           -- bloc_id (optional, auto-generated)
);
```

#### `get_blocs_with_wkt()`
```sql
-- Get all active blocs with WKT coordinates for easy parsing
SELECT * FROM get_blocs_with_wkt();
```

#### `calculate_crop_cycle_totals()`
```sql
-- Calculate financial and yield totals for a crop cycle
SELECT * FROM calculate_crop_cycle_totals('cycle-uuid-here');
```

### **2. Field Management Functions**

#### `insert_field_with_geometry()`
```sql
-- Insert field with proper PostGIS geometry
SELECT * FROM insert_field_with_geometry(
  'FIELD001',                     -- field_id
  'North Field',                  -- field_name
  'POLYGON((-20.4 57.6, ...))',  -- polygon_wkt
  5.2,                           -- area_hectares
  'farm-uuid-here',              -- farm_id
  'active'                       -- status (optional)
);
```

## 📊 **Configuration Data Included**

### **Sugarcane Varieties (34 varieties)**
- R570, R579, R585, NCo376, N12-N71
- Complete with yield potential, sugar content, disease resistance
- Maturity periods, recommended regions, planting/harvest seasons

### **Intercrop Varieties (9 varieties)**
- Legumes: Black Bean, Red Kidney Bean
- Cereals: Sweet Corn, Field Corn  
- Cucurbits: Butternut Squash, Sugar Pumpkin, Red Watermelon
- Tubers: Irish Potato, Orange Sweet Potato
- Complete with nutritional benefits, market values, compatibility ratings

### **Activity Categories (8 categories)**
- Land Preparation, Planting, Fertilization, Pest Control
- Irrigation, Cultivation, Harvesting, Post-Harvest
- Complete with cost ranges, equipment requirements, labor intensity

### **Observation Categories (8 categories)**
- Sugarcane Yield & Quality, Intercrop Yield, Growth Monitoring
- Soil Health, Pest & Disease, Weather Impact
- Irrigation Efficiency, Financial Performance
- Complete with data fields, measurement units, timing

## 🔍 **Verification Commands**

### **Check Functions Exist**
```sql
-- List all custom functions
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name LIKE '%bloc%' OR routine_name LIKE '%field%';
```

### **Check Configuration Data**
```sql
-- Verify configuration tables are populated
SELECT 'sugarcane_varieties' as table_name, COUNT(*) as count FROM sugarcane_varieties WHERE active = true
UNION ALL
SELECT 'intercrop_varieties', COUNT(*) FROM intercrop_varieties WHERE active = true
UNION ALL  
SELECT 'activity_categories', COUNT(*) FROM activity_categories WHERE active = true
UNION ALL
SELECT 'observation_categories', COUNT(*) FROM observation_categories WHERE active = true;
```

### **Test Bloc Creation**
```sql
-- Test bloc insertion
SELECT * FROM insert_bloc_with_geometry(
  'Test Bloc 001',
  'Test bloc for verification',
  'POLYGON((-20.436777653866045 57.647411541519304, -20.43919089 57.652482629314875, -20.43677765 57.647411541519304, -20.436777653866045 57.647411541519304))',
  1.5,
  'active'
);
```

## 🛡️ **Schema Changes Made**

### **Blocs Table Updates**
- ✅ **Removed `field_id` column** - blocs are now independent
- ✅ **Updated geometry type** to `GEOMETRY(POLYGON, 4326)`
- ✅ **Removed foreign key constraints** to fields table

### **Function Updates**
- ✅ **Updated `insert_bloc_with_geometry`** to not require field_id
- ✅ **Updated `get_blocs_with_wkt`** to not include field_id
- ✅ **Added `calculate_crop_cycle_totals`** for financial calculations

### **Index Optimizations**
- ✅ **Spatial indexes** for all geometry columns
- ✅ **Foreign key indexes** for performance
- ✅ **Status indexes** for filtering
- ✅ **Unique constraints** for business identifiers

## 🎯 **Benefits of This Setup**

1. **🚀 Complete from Scratch**: All functions and data included in migrations
2. **🔧 No Manual Steps**: Everything automated through migration files
3. **📊 Production Ready**: Complete configuration data included
4. **🛡️ Type Safe**: Updated TypeScript types match actual schema
5. **⚡ Optimized**: All necessary indexes for performance
6. **🧪 Testable**: Verification commands included

## 🔄 **Maintenance**

### **Adding New Functions**
1. Add function to `initial_schema.sql` for new databases
2. Create separate migration for existing databases
3. Update TypeScript types: `npx supabase gen types typescript --local`

### **Adding Configuration Data**
1. Add to `complete_configuration_data.sql`
2. Update `populate-config-data.js` script
3. Test with verification commands

This setup ensures that any new database created from scratch will have all functions, indexes, and configuration data properly applied! 🎉
