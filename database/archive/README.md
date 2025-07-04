# Database Archive

This folder contains legacy database files that are no longer needed for the clean database setup.

## Archived Files

### `add_sample_fields.sql`
- **Purpose**: Added sample field data for testing
- **Status**: Legacy - not needed for clean setup
- **Archived**: 2025-07-04

### `add_sort_order_to_varieties.sql`
- **Purpose**: Added sort order columns to variety tables
- **Status**: Legacy - functionality integrated into main schema
- **Archived**: 2025-07-04

### `climate_data_import.sql`
- **Purpose**: Climate data import functionality
- **Status**: Legacy - climate data is optional and has dedicated import scripts
- **Archived**: 2025-07-04

### `update_icons_to_lucide.sql`
- **Purpose**: Updated icon references to use Lucide icons
- **Status**: Legacy - icons already updated in main migration
- **Archived**: 2025-07-04

### `20240116000001_add_field_insert_function.sql`
- **Purpose**: PostgreSQL function for inserting fields with PostGIS geometry handling
- **Status**: Dead code - function is never called by any application code
- **Archived**: 2025-07-04

### `20240116000005_remove_field_id_from_blocs.sql`
- **Purpose**: Remove field_id column from blocs table and update related functions
- **Status**: Redundant - initial schema already has no field_id column in blocs table
- **Archived**: 2025-07-04

### `20240117000001_add_activities_observations_attachments.sql`
- **Purpose**: Add activities, observations, and attachments tables with indexes, RLS policies, and triggers
- **Status**: Redundant - all tables, indexes, and policies already exist in initial schema
- **Archived**: 2025-07-04

## Current Clean Setup

The clean database setup now uses only:
- `supabase/migrations/` - All migration files
- `database/README.md` - Setup instructions

All configuration data is loaded via the clean migration: `20240120000001_clean_default_database.sql`
