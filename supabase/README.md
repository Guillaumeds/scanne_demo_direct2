# Supabase Database Schema

## 📋 Overview

This directory contains the authoritative database schema for the Scanne Farm Management application.

**Configuration**: Online-only Supabase (no local development database)

## 🗂️ Files

### `authoritative_schema.sql`
- **Source**: Exported directly from production Supabase instance
- **Date**: 2025-07-17
- **Status**: ✅ AUTHORITATIVE - This is the single source of truth
- **Purpose**: Complete database schema including all tables, functions, and constraints

### `config.toml`
- **Purpose**: Supabase CLI configuration (for schema exports only)
- **Note**: Local development is disabled - we use online database only

### `migrations/`
- **Status**: Empty directory (not used for online-only setup)
- **Purpose**: Reserved for future use if local development is needed

## 🔧 TypeScript Types

### `src/lib/database.types.ts`
- **Source**: Generated from Supabase using CLI
- **Purpose**: TypeScript definitions for all database tables, views, and functions
- **Import**: Used in `src/lib/supabase.ts` for type-safe database operations

## 🏗️ Database Structure

### Core Tables

#### **Farm Structure**
- `companies` - Company information
- `farms` - Farm details and boundaries  
- `blocs` - Field blocks with polygon coordinates
- `crop_cycles` - Crop cycle management

#### **Operations System**
- `field_operations` - Main operations planning table
- `daily_work_packages` - Daily work execution packages
- `operation_equipment` - Equipment assignments for operations
- `operation_products` - Product usage in operations
- `operation_resources` - Resource allocation for operations

#### **Work Package System**
- `work_package_equipment` - Equipment usage in work packages
- `work_package_products` - Product consumption in work packages
- `work_package_resources` - Resource usage in work packages

#### **Configuration Tables**
- `operation_type_config` - Operation types (Land Prep, Planting, etc.)
- `operations_method` - Methods (Manual, Mechanical, Mix)
- `products` - Products/chemicals database
- `resources` - Resources (labor, equipment) database
- `equipment` - Equipment catalog
- `sugarcane_varieties` - Sugarcane variety configurations
- `intercrop_varieties` - Intercrop variety configurations

#### **Data Collection**
- `observations` - Field observations and measurements
- `climatic_data` - Weather and climate data

## 🔒 Security

- **RLS Status**: DISABLED (by design for this application)
- **Access**: Anonymous access allowed for all tables
- **Authentication**: Not implemented (application runs without user authentication)

## 🚀 Usage

### Schema Management
1. Use the `authoritative_schema.sql` as the reference for all database operations
2. Make schema changes directly in Supabase dashboard
3. Export new schema to replace this file when changes are made:
   ```bash
   supabase db dump --schema-only > supabase/authoritative_schema.sql
   ```

### Database Access
- Application connects directly to online Supabase instance
- No local database setup required
- RLS is disabled for simplified access

## 📝 Notes

- This schema replaces the old `activities` system with the new `field_operations` and `daily_work_packages` system
- All old migration files have been archived/removed
- The schema includes PostGIS extensions for geographic data handling
- UUID primary keys are used throughout for better scalability

## 🔄 Maintenance

### Schema Updates
1. Make changes in Supabase dashboard
2. Export new schema: `supabase db dump --schema-only > supabase/authoritative_schema.sql`
3. Generate new TypeScript types: `supabase gen types typescript --project-id "wwzhqancvoiqekcsbecq" --schema public | Out-File -FilePath "src/lib/database.types.ts" -Encoding UTF8`
4. Commit both the updated schema file and types file
5. Update this README if significant changes are made

### Best Practices
- Always test schema changes in development first
- Keep the exported schema file up to date
- Document major schema changes in commit messages
- Use descriptive table and column names
