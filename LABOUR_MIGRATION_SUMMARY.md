# Labour Migration Summary

## 🔄 Changes Made: Resources → Labour

### **Database Schema Changes**

#### **Tables Renamed:**
- ❌ `resources` → ✅ `labour`
- ❌ `operation_resources` → ✅ `operation_labour`
- ❌ `work_package_resources` → ✅ `work_package_labour`

#### **Column Renames:**
- ❌ `resource_id` → ✅ `labour_id`
- ❌ `resource_uuid` → ✅ `labour_uuid`
- ❌ `resource_name` → ✅ `labour_name`

#### **Index Updates:**
- ❌ `idx_resources_active` → ✅ `idx_labour_active`

### **RPC Function Changes**

#### **get_comprehensive_bloc_data() Updates:**
```sql
-- OLD: resources field
resources jsonb,

-- NEW: labour field  
labour jsonb,

-- OLD: resource joins
FROM operation_resources or_res
JOIN resources res ON or_res.resource_uuid = res.id

-- NEW: labour joins
FROM operation_labour ol
JOIN labour lab ON ol.labour_uuid = lab.id
```

### **Code Changes**

#### **Zod Schemas:**
- ❌ `ResourceSchema` → ✅ `LabourSchema`
- ❌ `resources` array → ✅ `labour` array in BlocDataSchema
- ❌ `resourceId`, `resourceName` → ✅ `labourId`, `labourName`

#### **API Service:**
- ❌ `fetchResources()` → ✅ `fetchLabour()`
- ❌ `supabase.from('resources')` → ✅ `supabase.from('labour')`

#### **React Hooks:**
- ❌ `useResources()` → ✅ `useLabour()`
- ❌ `farmDataKeys.config.resources()` → ✅ `farmDataKeys.config.labour()`

#### **Type Exports:**
- ❌ `export type Resource` → ✅ `export type Labour`

### **Sample Data Updates**

#### **Labour Table Data:**
```sql
-- OLD: Resources table
INSERT INTO resources (id, resource_id, name, category, unit, cost_per_unit, active) VALUES
('...', 'LAB001', 'Field Worker', 'Labour', 'General', 'hour', 85.00, true),

-- NEW: Labour table  
INSERT INTO labour (id, labour_id, name, category, unit, cost_per_unit, active) VALUES
('...', 'LAB001', 'Field Worker', 'General', 'hour', 85.00, true),
```

#### **Join Table Data:**
```sql
-- OLD: operation_resources
INSERT INTO operation_resources (uuid, field_operation_uuid, resource_uuid, planned_quantity, planned_cost)

-- NEW: operation_labour
INSERT INTO operation_labour (uuid, field_operation_uuid, labour_uuid, planned_quantity, planned_cost)
```

## 📁 Files Updated

### **Database Files:**
- ✅ `database_schema_modern.sql` - Complete schema with labour tables
- ✅ `database_sample_data.sql` - Sample data using labour
- ✅ `reset_database.sql` - Clean reset script

### **Code Files:**
- ✅ `src/schemas/apiSchemas.ts` - Zod schemas updated
- ✅ `src/services/validatedApiService.ts` - API service methods
- ✅ `src/hooks/useModernFarmData.ts` - React hooks
- ✅ `src/hooks/useGlobalState.ts` - Global state management

## 🚀 Migration Instructions

### **Step 1: Reset Database**
```sql
\i reset_database.sql
```

### **Step 2: Create Modern Schema**
```sql
\i database_schema_modern.sql
```

### **Step 3: Add Sample Data**
```sql
\i database_sample_data.sql
```

### **Step 4: Test New Structure**
```sql
-- Test labour table
SELECT * FROM labour;

-- Test RPC function
SELECT get_comprehensive_bloc_data('550e8400-e29b-41d4-a716-446655440021');

-- Verify labour joins
SELECT * FROM operation_labour;
SELECT * FROM work_package_labour;
```

## 🎯 Benefits

### **Clearer Separation:**
- ✅ **Equipment** - Machines, tools, vehicles
- ✅ **Labour** - Workers, operators, supervisors
- ❌ **Resources** - Ambiguous term removed

### **Better Data Model:**
- ✅ Specific labour categories (General, Skilled, Management)
- ✅ Hourly rates for different labour types
- ✅ Clear distinction between human and machine resources

### **Improved Queries:**
- ✅ Separate labour cost calculations
- ✅ Labour productivity analysis
- ✅ Workforce planning capabilities

## 🔍 Verification Checklist

After migration, verify:

- [ ] `labour` table exists with correct structure
- [ ] `operation_labour` table has proper foreign keys
- [ ] `work_package_labour` table has proper foreign keys
- [ ] RPC function returns `labour` field instead of `resources`
- [ ] Sample data loads correctly
- [ ] React hooks work with new labour endpoints
- [ ] Zod validation passes for labour data
- [ ] No references to old `resources` table remain

## 📊 Data Structure Comparison

### **Before (Resources):**
```typescript
interface Resource {
  id: string
  resource_id: string  // Generic
  name: string
  category: string     // Mixed equipment/labour
  unit: string
  cost_per_unit: number
}
```

### **After (Labour + Equipment):**
```typescript
interface Labour {
  id: string
  labour_id: string    // Specific to workers
  name: string
  category: string     // General/Skilled/Management
  unit: string         // Usually 'hour'
  cost_per_unit: number // Hourly rate
}

interface Equipment {
  id: string
  equipment_id: string // Specific to machines
  name: string
  category: string     // Machine categories
  hourly_rate: number  // Machine rental rate
}
```

## ✅ Migration Complete

The database and code now properly separate:
- **Labour** - Human resources (workers, operators, supervisors)
- **Equipment** - Physical assets (tractors, harvesters, tools)

This provides better data modeling, clearer cost tracking, and more accurate resource planning for farm operations.
