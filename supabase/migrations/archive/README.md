# Archived Database Migrations

This folder contains database migration files that are no longer needed for the current application architecture.

## Archived Configuration Tables

The following configuration tables were removed as part of the migration from database-driven configuration back to hardcoded arrays:

- `sugarcane_varieties` - Now using hardcoded `SUGARCANE_VARIETIES` array
- `intercrop_varieties` - Now using hardcoded `INTERCROP_PLANTS` array  
- `products` - Now using hardcoded `PRODUCTS` array
- `resources` - Now using hardcoded `RESOURCES` array
- `activity_categories` - Now using hardcoded `SUGARCANE_PHASES` array
- `observation_categories` - Now using hardcoded `OBSERVATION_CATEGORIES` array
- `attachment_categories` - Now using hardcoded `ATTACHMENT_CATEGORIES` array

## Operational Tables (Still Active)

The following tables remain active and are used for storing operational data:

- `companies` - Company information
- `farms` - Farm details and boundaries
- `fields` - Field polygons and metadata
- `blocs` - Bloc polygons within fields
- `crop_cycles` - Crop cycle management
- `activities` - Activity records
- `observations` - Observation records
- `attachments` - File attachments
- `system_config` - System-level configuration (used by admin panel)

## Migration Strategy

1. **Phase 1**: Updated frontend to use hardcoded arrays instead of database calls
2. **Phase 2**: Removed ConfigurationService dependencies
3. **Phase 3**: Archived configuration table definitions (this phase)
4. **Phase 4**: Simplified database schema to focus on operational data only

This approach provides:
- Faster application startup (no configuration loading)
- Simpler codebase maintenance
- Better demo experience
- Reduced database complexity
