-- =====================================================
-- OPERATION CONFIGURATION TABLES
-- Create operation_type_config and operations_method tables
-- =====================================================

-- Create operation_type_config table
CREATE TABLE operation_type_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ordr INTEGER NOT NULL UNIQUE,
    operation_type VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    icon VARCHAR(10),
    color_class VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create operations_method table  
CREATE TABLE operations_method (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ordr INTEGER NOT NULL UNIQUE,
    method VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert operation types in specified order
INSERT INTO operation_type_config (ordr, operation_type, description, icon, color_class) VALUES
(0, 'Prepare fields', 'Field preparation activities including soil preparation and land clearing', '🚜', 'bg-orange-100 text-orange-800'),
(1, 'Plant', 'Planting and seeding operations', '🌱', 'bg-green-100 text-green-800'),
(2, 'Fertilise', 'Fertilization and nutrient application', '🧪', 'bg-blue-100 text-blue-800'),
(3, 'Manage weeds', 'Weed control and management activities', '🌿', 'bg-yellow-100 text-yellow-800'),
(4, 'Control pests', 'Pest control and disease management', '🐛', 'bg-red-100 text-red-800'),
(5, 'Irrigate', 'Irrigation and water management', '💧', 'bg-cyan-100 text-cyan-800'),
(6, 'Harvest', 'Harvesting operations', '🌾', 'bg-amber-100 text-amber-800'),
(7, 'Post-harvest activities', 'Post-harvest processing and storage', '📦', 'bg-purple-100 text-purple-800');

-- Insert operation methods in specified order
INSERT INTO operations_method (ordr, method, description) VALUES
(0, 'Mechanical', 'Machine-based operations using equipment and machinery'),
(1, 'Manual', 'Hand labor operations performed by workers'),
(2, 'Mix', 'Combined approach using both mechanical and manual methods');

-- Create indexes for performance
CREATE INDEX idx_operation_type_config_ordr ON operation_type_config(ordr);
CREATE INDEX idx_operations_method_ordr ON operations_method(ordr);

-- Enable RLS
ALTER TABLE operation_type_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE operations_method ENABLE ROW LEVEL SECURITY;

-- Create policies for read access
CREATE POLICY "Allow read access to operation_type_config" ON operation_type_config
    FOR SELECT USING (true);

CREATE POLICY "Allow read access to operations_method" ON operations_method
    FOR SELECT USING (true);

-- Create policies for authenticated users to manage data
CREATE POLICY "Allow authenticated users to manage operation_type_config" ON operation_type_config
    FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to manage operations_method" ON operations_method
    FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_operation_type_config_updated_at 
    BEFORE UPDATE ON operation_type_config 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_operations_method_updated_at 
    BEFORE UPDATE ON operations_method 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
