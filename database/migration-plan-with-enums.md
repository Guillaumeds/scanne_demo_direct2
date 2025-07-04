# Simplified Database Migration Plan with Enum Columns

## Database Schema Updates

### 1. Add Enum Columns to Existing Tables

```sql
-- Products table - add category_enum column
ALTER TABLE products ADD COLUMN category_enum VARCHAR(50);

-- Resources table - add category_enum column  
ALTER TABLE resources ADD COLUMN category_enum VARCHAR(50);

-- Sugarcane varieties table - add category_enum column
ALTER TABLE sugarcane_varieties ADD COLUMN category_enum VARCHAR(50);

-- Intercrop varieties table - add category_enum column
ALTER TABLE intercrop_varieties ADD COLUMN category_enum VARCHAR(50);
```

### 2. Data Mapping Strategy

**Products:**
- Frontend enum: `'compound-npk'` → Database `category_enum`: `'compound-npk'`
- Keep human-readable: `category`: `'Compound and NPK Fertilizers'`

**Resources:**
- Frontend enum: `'fleet'` → Database `category_enum`: `'fleet'`
- Keep human-readable: `category`: `'Fleet & Vehicles'`

**Varieties:**
- Frontend enum: `'sugarcane'` → Database `category_enum`: `'sugarcane'`
- Frontend enum: `'intercrop'` → Database `category_enum`: `'intercrop'`

## Simplified Service Layer

```typescript
// MUCH SIMPLER TRANSFORMATION!

const transformDbProduct = (dbProduct: DatabaseProduct): Product => ({
  id: dbProduct.product_id,
  name: dbProduct.name,
  category: dbProduct.category_enum as ProductCategory, // Direct mapping!
  description: dbProduct.description || undefined,
  unit: dbProduct.unit || '',
  defaultRate: dbProduct.recommended_rate_per_ha || undefined,
  cost: dbProduct.cost_per_unit || undefined
  // Ignore demo-irrelevant fields: brand, composition, icon, etc.
})

const transformDbResource = (dbResource: DatabaseResource): Resource => ({
  id: dbResource.resource_id,
  name: dbResource.name,
  category: dbResource.category_enum as ResourceCategory, // Direct mapping!
  description: dbResource.description || undefined,
  unit: dbResource.unit || '',
  defaultRate: 1,
  costPerUnit: dbResource.cost_per_unit || dbResource.cost_per_hour || undefined,
  skillLevel: dbResource.skill_level || undefined,
  overtimeMultiplier: dbResource.overtime_multiplier || undefined
  // Ignore demo-irrelevant fields: icon, specifications, etc.
})
```

## Benefits of This Approach

1. **No Complex Category Mapping** - Direct enum-to-enum mapping
2. **Simpler CSV Generation** - Just include both category and category_enum columns
3. **Easier Frontend Integration** - No transformation logic needed for categories
4. **Future-Proof** - Keep full category names for admin interfaces
5. **Demo-Focused** - Ignore non-essential fields for demo phase

## CSV Structure Example

**products.csv:**
```csv
product_id,name,category,category_enum,unit,recommended_rate_per_ha,cost_per_unit,description
npk-13-13-20,"13-13-20+2MgO","Compound and NPK Fertilizers",compound-npk,kg,250,45,"Balanced NPK fertilizer"
```

**resources.csv:**
```csv
resource_id,name,category,category_enum,unit,cost_per_unit,skill_level,description
tractor-small,"Small Tractor (40-60 HP)","Fleet & Vehicles",fleet,hours,450,Basic,"Small agricultural tractor"
```

This approach eliminates the need for complex category mapping and makes the migration much more straightforward!
