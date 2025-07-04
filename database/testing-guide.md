# Database Import Testing Guide

## Prerequisites

1. **Local Supabase Setup**
   ```bash
   # Install Supabase CLI
   npm install -g supabase
   
   # Initialize project
   supabase init
   
   # Start local development
   supabase start
   ```

2. **Database Schema Applied**
   ```bash
   # Apply initial schema migration
   supabase db reset
   ```

## Testing Steps

### 1. **Schema Validation**

First, verify the schema has the new `category_enum` columns:

```sql
-- Check sugarcane_varieties table structure
\d sugarcane_varieties

-- Check products table structure  
\d products

-- Check resources table structure
\d resources

-- Check intercrop_varieties table structure
\d intercrop_varieties
```

**Expected Results:**
- All tables should have `category_enum VARCHAR(50)` column
- All other columns should match the schema

### 2. **Data Import Test**

```bash
# Run the import script
supabase db reset
psql -h localhost -p 54322 -d postgres -U postgres -f database/import-csv-data.sql
```

**Expected Output:**
```
NOTICE:  Clearing existing configuration data...
NOTICE:  Configuration tables cleared successfully.
NOTICE:  Importing sugarcane varieties...
NOTICE:  Import Summary:
NOTICE:  - Sugarcane Varieties: 3 records
NOTICE:  - Intercrop Varieties: 2 records  
NOTICE:  - Products: 3 records
NOTICE:  - Resources: 3 records
NOTICE:  All imports completed successfully!
NOTICE:  ✅ Database migration completed successfully!
```

### 3. **Data Integrity Tests**

Run these queries to verify data integrity:

```sql
-- Test 1: Verify record counts
SELECT 
    'sugarcane_varieties' as table_name, 
    COUNT(*) as count 
FROM sugarcane_varieties
UNION ALL
SELECT 'intercrop_varieties', COUNT(*) FROM intercrop_varieties
UNION ALL  
SELECT 'products', COUNT(*) FROM products
UNION ALL
SELECT 'resources', COUNT(*) FROM resources;

-- Test 2: Verify enum categories
SELECT DISTINCT category_enum FROM products;
-- Expected: compound-npk, nitrogen

SELECT DISTINCT category_enum FROM resources;  
-- Expected: fleet, labour, equipment

SELECT DISTINCT category_enum FROM sugarcane_varieties;
-- Expected: sugarcane

SELECT DISTINCT category_enum FROM intercrop_varieties;
-- Expected: intercrop

-- Test 3: Verify array data
SELECT variety_id, seasons, soil_types FROM sugarcane_varieties LIMIT 2;
-- Expected: PostgreSQL arrays like {Aug,Sep}

SELECT variety_id, benefits FROM intercrop_varieties LIMIT 2;
-- Expected: PostgreSQL arrays like {Nitrogen fixation,Soil improvement}

-- Test 4: Verify special characters
SELECT product_id, name FROM products WHERE name LIKE '%:%';
-- Expected: 13:8:24

SELECT product_id, name FROM products WHERE name LIKE '%+%';
-- Expected: 13-13-20+2MgO

-- Test 5: Verify field mappings
SELECT 
    product_id,
    name,
    category_enum,
    recommended_rate_per_ha,
    cost_per_unit
FROM products LIMIT 3;

SELECT 
    resource_id,
    name, 
    category_enum,
    cost_per_unit,
    skill_level
FROM resources LIMIT 3;
```

### 4. **Constraint Tests**

```sql
-- Test unique constraints
INSERT INTO products (product_id, name, category_enum, unit, active) 
VALUES ('npk-13-13-20', 'Duplicate Test', 'compound-npk', 'kg', true);
-- Expected: ERROR - duplicate key value violates unique constraint

-- Test NOT NULL constraints  
INSERT INTO products (name, category_enum, unit, active) 
VALUES ('Test Product', 'compound-npk', 'kg', true);
-- Expected: ERROR - null value in column "product_id"
```

### 5. **Performance Tests**

```sql
-- Test query performance
EXPLAIN ANALYZE SELECT * FROM products WHERE category_enum = 'compound-npk';

EXPLAIN ANALYZE SELECT * FROM sugarcane_varieties WHERE 'Aug' = ANY(seasons);

EXPLAIN ANALYZE SELECT * FROM resources WHERE category_enum = 'fleet';
```

## Expected Results Summary

### Record Counts (Minimum for Testing)
- **Sugarcane Varieties**: 3+ records
- **Intercrop Varieties**: 2+ records  
- **Products**: 3+ records
- **Resources**: 3+ records

### Data Validation
- ✅ All `category_enum` fields populated
- ✅ PostgreSQL arrays properly formatted
- ✅ Special characters preserved
- ✅ Field mappings correct
- ✅ Constraints working

### Performance
- ✅ Queries execute in < 10ms for small datasets
- ✅ Array operations work correctly
- ✅ Enum filtering works efficiently

## Troubleshooting

### Common Issues

1. **File Path Errors**
   - Use absolute paths for CSV files
   - Ensure PostgreSQL has read access to files

2. **Array Format Errors**
   - Verify PostgreSQL array syntax: `{item1,item2}`
   - Check for proper escaping

3. **Character Encoding**
   - Ensure CSV files are UTF-8 encoded
   - Check for special character handling

4. **Permission Errors**
   - Verify database user has INSERT permissions
   - Check file system permissions for CSV files

### Rollback Process

If import fails:
```sql
-- Rollback transaction (if still in transaction)
ROLLBACK;

-- Or clear tables and restart
TRUNCATE TABLE sugarcane_varieties CASCADE;
TRUNCATE TABLE intercrop_varieties CASCADE;
TRUNCATE TABLE products CASCADE;
TRUNCATE TABLE resources CASCADE;
```

## Success Criteria

✅ All tables populated with correct data
✅ Enum categories working properly  
✅ Array data properly formatted
✅ Special characters preserved
✅ Constraints enforced
✅ Queries perform well
✅ Ready for service layer integration
