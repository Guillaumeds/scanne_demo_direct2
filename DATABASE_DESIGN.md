# Scanne Farm Management - Database Design & Migration Plan

## 🎯 **Overview**
This document tracks the database design, implementation phases, and migration points for the Scanne farm management application using Supabase PostgreSQL.

## 📊 **Database Architecture**

### **Core Principles**
- **Single Source of Truth**: No data duplication across tables
- **Referential Integrity**: Foreign key constraints ensure data consistency
- **Scalable Design**: UUID primary keys, proper indexing, JSONB for flexibility
- **Audit Trail**: Created/updated timestamps on all tables
- **Soft Deletes**: Status flags instead of hard deletes

### **Technology Stack**
- **Database**: Supabase (PostgreSQL 15+)
- **Authentication**: Supabase Auth with Row Level Security (RLS)
- **File Storage**: Supabase Storage for attachments
- **Real-time**: Supabase Realtime for collaborative features
- **Deployment**: Vercel with Supabase integration

## 🏗️ **Implementation Phases**

### **Phase 1: Core Database Setup (CURRENT)**
**Status**: Ready to implement
**Timeline**: 1-2 weeks

**Deliverables:**
- [ ] Complete SQL schema creation
- [ ] Reference data seeding (varieties, products, resources)
- [ ] Basic CRUD operations
- [ ] Service layer migration from localStorage

**Tables to Implement:**
- `companies`, `farms`, `fields`, `blocs`
- `crop_cycles` with growth stage tracking
- `sugarcane_varieties`, `intercrop_varieties`
- `products`, `resources`
- `activity_categories`, `observation_categories`, `attachment_categories`
- `system_config`

### **Phase 2: Operations & Analytics (NEXT)**
**Status**: After Phase 1 completion
**Timeline**: 2-3 weeks

**Deliverables:**
- [ ] Activities with detailed cost tracking
- [ ] Observations with flexible data structures
- [ ] Attachments with file storage integration
- [ ] Field-level analytics implementation
- [ ] Financial reporting and profit calculations

**Tables to Implement:**
- `activities`, `activity_products`, `activity_resources`
- `observations` with JSONB data fields
- `attachments` with Supabase Storage integration
- `field_analytics_history`

### **Phase 3: User Management & Security (LATER)**
**Status**: After core functionality is stable
**Timeline**: 1-2 weeks

**Deliverables:**
- [ ] User authentication with Supabase Auth
- [ ] Role-based permissions (super_admin, company_admin, farm_manager, user)
- [ ] Row Level Security (RLS) policies
- [ ] Company-farm access control

**Tables to Implement:**
- `users` with role management
- RLS policies for data isolation
- Permission-based UI restrictions

### **Phase 4: Advanced Features (FUTURE)**
**Status**: Future enhancement
**Timeline**: TBD

**Deliverables:**
- [ ] Real-time collaborative features
- [ ] Advanced analytics and reporting
- [ ] Mobile app support
- [ ] API for third-party integrations
- [ ] Multi-language support

## 🔄 **Service Layer Migration Points**

### **Critical Migration Tasks**
The following services need to be replaced with real database operations:

#### **1. CropCycleService.ts**
**Current**: localStorage mock data
**Replace with**: Supabase queries
**Key Methods:**
```typescript
// REPLACE THESE METHODS:
static getAllCropCycles() // → SELECT FROM crop_cycles
static getBlocSummary(blocId) // → JOIN blocs, crop_cycles, varieties
static createCropCycle(request) // → INSERT INTO crop_cycles
static updateGrowthStages() // → Database trigger/scheduled job
```

#### **2. BlocService (Future)**
**Current**: Not implemented
**Replace with**: Supabase queries
**Key Methods:**
```typescript
// IMPLEMENT THESE METHODS:
static getBlocStatus(blocId) // → SELECT status FROM blocs
static updateBlocFieldRelationships() // → Spatial queries
static getFieldAnalytics(fieldId) // → Aggregate queries
```

#### **3. VarietyService (Future)**
**Current**: Hardcoded data
**Replace with**: Supabase queries
**Key Methods:**
```typescript
// REPLACE THESE METHODS:
static getSugarcaneVarieties() // → SELECT FROM sugarcane_varieties
static getIntercropVarieties() // → SELECT FROM intercrop_varieties
```

### **Database Query Patterns**

#### **Bloc Card Data Query**
```sql
-- Replace CropCycleService.getBlocSummary()
SELECT 
  b.id, b.name, b.area_hectares, b.status as bloc_status,
  cc.type, cc.cycle_number, cc.growth_stage, cc.days_since_planting,
  cc.sugarcane_planned_harvest_date,
  sv.name as variety_name, sv.variety_id,
  iv.name as intercrop_name
FROM blocs b
LEFT JOIN crop_cycles cc ON b.id = cc.bloc_id AND cc.status = 'active'
LEFT JOIN sugarcane_varieties sv ON cc.sugarcane_variety_id = sv.id
LEFT JOIN intercrop_varieties iv ON cc.intercrop_variety_id = iv.id
WHERE b.id = $1;
```

#### **Field Analytics Query**
```sql
-- Replace field analytics calculations
SELECT 
  f.id, f.field_name,
  COUNT(DISTINCT b.id) as total_blocs,
  COUNT(DISTINCT CASE WHEN b.status = 'active' THEN b.id END) as active_blocs,
  SUM(cc.actual_total_cost) as total_costs,
  SUM(cc.total_revenue) as total_revenue,
  AVG(cc.sugarcane_actual_yield_tons_ha) as avg_yield
FROM fields f
LEFT JOIN blocs b ON f.id = b.field_id
LEFT JOIN crop_cycles cc ON b.id = cc.bloc_id
WHERE f.id = $1
GROUP BY f.id, f.field_name;
```

## 📋 **Configuration Management**

### **System Configuration**
Categories and system settings will be stored in database tables for easy admin management:

```sql
-- Example system_config entries
INSERT INTO system_config (config_key, config_group, config_value) VALUES
('default_currency', 'financial', '{"code": "MUR", "symbol": "Rs", "decimals": 2}'),
('weight_units', 'measurements', '["kg", "tons", "g", "lbs"]'),
('area_units', 'measurements', '["hectares", "acres", "m²"]');
```

### **Category Management**
Admin interface will manage:
- Activity categories with icons and colors
- Observation categories with data templates
- Attachment categories with file type restrictions

## 🚀 **Next Steps**

### **Immediate Actions (Phase 1)**
1. **Create Supabase project** and configure environment
2. **Run SQL schema scripts** to create all tables
3. **Seed reference data** (varieties, products, resources)
4. **Replace CropCycleService** with database operations
5. **Test bloc card functionality** with real data

### **Success Criteria**
- [ ] All bloc cards show real data from database
- [ ] Growth stages update automatically
- [ ] Variety and cycle information displays correctly
- [ ] No localStorage dependencies remain
- [ ] Performance is acceptable with 100+ blocs

---

**Document Version**: 1.0  
**Last Updated**: 2024-01-15  
**Next Review**: After Phase 1 completion
