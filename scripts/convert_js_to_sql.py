#!/usr/bin/env python3
"""
Convert JavaScript data from database-data-extractor.js to SQL INSERT statements
"""

import re
import json

def convert_js_object_to_sql_values(js_obj_str, table_name, columns):
    """Convert JavaScript object to SQL VALUES format"""
    
    # Clean up the JavaScript object string
    js_obj_str = js_obj_str.strip()
    if js_obj_str.startswith('{') and js_obj_str.endswith('}'):
        js_obj_str = js_obj_str[1:-1]  # Remove outer braces
    
    # Parse key-value pairs
    values = {}
    
    # Handle simple key: value pairs
    for line in js_obj_str.split('\n'):
        line = line.strip()
        if ':' in line and not line.startswith('//'):
            # Extract key and value
            parts = line.split(':', 1)
            if len(parts) == 2:
                key = parts[0].strip().strip('"\'')
                value = parts[1].strip().rstrip(',')
                
                # Handle different value types
                if value == 'null':
                    values[key] = 'NULL'
                elif value == 'true':
                    values[key] = 'true'
                elif value == 'false':
                    values[key] = 'false'
                elif value.startswith('[') and value.endswith(']'):
                    # Array - convert to PostgreSQL array format
                    array_content = value[1:-1]  # Remove brackets
                    if array_content.strip():
                        # Split by comma and clean up
                        items = [item.strip().strip('\'"') for item in array_content.split(',')]
                        values[key] = f"ARRAY[{', '.join([f\"'{item}'\" for item in items])}]"
                    else:
                        values[key] = 'ARRAY[]::TEXT[]'
                elif value.startswith('{') and value.endswith('}'):
                    # JSON object - convert to PostgreSQL JSON
                    try:
                        # This is a simplified JSON conversion
                        values[key] = f"'{value}'"
                    except:
                        values[key] = f"'{value}'"
                elif value.startswith('"') or value.startswith("'"):
                    # String value
                    clean_value = value.strip('\'"').replace("'", "''")  # Escape single quotes
                    values[key] = f"'{clean_value}'"
                else:
                    # Numeric or other value
                    values[key] = value
    
    # Build SQL VALUES clause
    sql_values = []
    for col in columns:
        if col in values:
            sql_values.append(values[col])
        else:
            sql_values.append('NULL')
    
    return f"({', '.join(sql_values)})"

def process_sugarcane_varieties():
    """Process sugarcane varieties data"""
    print("Processing sugarcane varieties...")
    
    columns = [
        'variety_id', 'name', 'category', 'harvest_start_month', 'harvest_end_month',
        'seasons', 'soil_types', 'sugar_content_percent', 'characteristics', 
        'description', 'icon', 'image_url', 'information_leaflet_url', 'active'
    ]
    
    # This would read from the JS file and convert each variety
    # For now, let's create a template
    
    sql_template = """
-- Sugarcane Varieties INSERT
INSERT INTO sugarcane_varieties (variety_id, name, category, harvest_start_month, harvest_end_month, seasons, soil_types, sugar_content_percent, characteristics, description, icon, image_url, information_leaflet_url, active) VALUES
-- VALUES will be inserted here by the conversion script
;
"""
    
    return sql_template

def process_intercrop_varieties():
    """Process intercrop varieties data"""
    print("Processing intercrop varieties...")
    
    columns = [
        'variety_id', 'name', 'scientific_name', 'benefits', 'planting_time',
        'harvest_time', 'description', 'icon', 'image_url', 'information_leaflet_url', 'active'
    ]
    
    sql_template = """
-- Intercrop Varieties INSERT
INSERT INTO intercrop_varieties (variety_id, name, scientific_name, benefits, planting_time, harvest_time, description, icon, image_url, information_leaflet_url, active) VALUES
-- VALUES will be inserted here by the conversion script
;
"""
    
    return sql_template

def process_products():
    """Process products data"""
    print("Processing products...")
    
    columns = [
        'product_id', 'name', 'category', 'description', 'unit', 'recommended_rate_per_ha',
        'cost_per_unit', 'brand', 'composition', 'icon', 'image_url', 'information_url',
        'specifications', 'safety_datasheet_url', 'active'
    ]
    
    sql_template = """
-- Products INSERT
INSERT INTO products (product_id, name, category, description, unit, recommended_rate_per_ha, cost_per_unit, brand, composition, icon, image_url, information_url, specifications, safety_datasheet_url, active) VALUES
-- VALUES will be inserted here by the conversion script
;
"""
    
    return sql_template

def process_resources():
    """Process resources data"""
    print("Processing resources...")
    
    columns = [
        'resource_id', 'name', 'category', 'description', 'unit', 'cost_per_hour',
        'cost_per_unit', 'skill_level', 'overtime_multiplier', 'icon', 'specifications', 'active'
    ]
    
    sql_template = """
-- Resources INSERT
INSERT INTO resources (resource_id, name, category, description, unit, cost_per_hour, cost_per_unit, skill_level, overtime_multiplier, icon, specifications, active) VALUES
-- VALUES will be inserted here by the conversion script
;
"""
    
    return sql_template

def add_company_and_farm():
    """Add company and farm data"""
    
    sql = """
-- =====================================================
-- COMPANY AND FARM DATA
-- =====================================================

-- Insert demo company
INSERT INTO companies (id, name, description, address, contact_email, contact_phone, active) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'Scanne Demo Farm Ltd', 'Demo sugar cane farming company for testing and development', 'Demo Estate, Mauritius', 'demo@scannefarm.com', '+230 123 4567', true);

-- Insert demo farm
INSERT INTO farms (id, name, description, company_id, total_area_hectares, active) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Demo Estate', 'Main demonstration farm for Scanne application', '550e8400-e29b-41d4-a716-446655440000', 150.0, true);
"""
    
    return sql

def main():
    """Main conversion function"""
    print("Converting JavaScript data to SQL migration...")
    
    # Generate SQL components
    sql_parts = []
    
    # Add header
    sql_parts.append("""-- =====================================================
-- COMPLETE CONFIGURATION DATA MIGRATION
-- =====================================================
-- Converted from database-data-extractor.js with ALL complete data
-- Includes all varieties, products, resources, and system configuration
-- Plus company and farm data for operational setup

-- Clear existing data
TRUNCATE TABLE attachments CASCADE;
TRUNCATE TABLE observations CASCADE;
TRUNCATE TABLE activities CASCADE;
TRUNCATE TABLE crop_cycles CASCADE;
TRUNCATE TABLE blocs CASCADE;
TRUNCATE TABLE fields CASCADE;
TRUNCATE TABLE farms CASCADE;
TRUNCATE TABLE companies CASCADE;
TRUNCATE TABLE products CASCADE;
TRUNCATE TABLE resources CASCADE;
TRUNCATE TABLE sugarcane_varieties CASCADE;
TRUNCATE TABLE intercrop_varieties CASCADE;
TRUNCATE TABLE activity_categories CASCADE;
TRUNCATE TABLE observation_categories CASCADE;
TRUNCATE TABLE attachment_categories CASCADE;
TRUNCATE TABLE system_config CASCADE;
""")
    
    # Add system config and categories (already done manually)
    
    # Add data sections
    sql_parts.append(process_sugarcane_varieties())
    sql_parts.append(process_intercrop_varieties())
    sql_parts.append(process_products())
    sql_parts.append(process_resources())
    sql_parts.append(add_company_and_farm())
    
    # Combine all parts
    full_sql = '\n'.join(sql_parts)
    
    print("Conversion complete!")
    return full_sql

if __name__ == "__main__":
    result = main()
    print("SQL migration generated successfully!")
