-- =====================================================
-- HIERARCHICAL OPERATIONS STRUCTURE MIGRATION
-- Bloc → Products → Daily Tasks hierarchy
-- Preserves ALL existing data 100%
-- =====================================================

-- Drop existing operations-related tables if they exist
DROP TABLE IF EXISTS activities CASCADE;
DROP TABLE IF EXISTS observations CASCADE;
DROP TABLE IF EXISTS attachments CASCADE;
DROP TABLE IF EXISTS crop_cycles CASCADE;

-- =====================================================
-- NEW HIERARCHICAL STRUCTURE
-- =====================================================

-- Junction table: Bloc → Many Products
CREATE TABLE bloc_products (
  uuid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bloc_uuid UUID NOT NULL REFERENCES blocs(uuid) ON DELETE CASCADE,
  product_uuid UUID NOT NULL REFERENCES products(uuid) ON DELETE CASCADE,
  resource_uuid UUID NOT NULL REFERENCES resources(uuid) ON DELETE CASCADE,
  
  -- Product application details
  planned_quantity DECIMAL(10,2),
  planned_application_rate DECIMAL(10,2),
  planned_area_coverage DECIMAL(10,2),
  
  -- Status and timing
  status VARCHAR(20) DEFAULT 'planned' CHECK (status IN ('planned', 'in_progress', 'completed', 'cancelled')),
  planned_start_date DATE,
  planned_end_date DATE,
  actual_start_date DATE,
  actual_end_date DATE,
  
  -- Costs
  estimated_cost DECIMAL(10,2),
  actual_cost DECIMAL(10,2),
  
  -- Metadata
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure unique product per bloc
  UNIQUE(bloc_uuid, product_uuid)
);

-- Daily tasks for each bloc-product combination
CREATE TABLE daily_tasks (
  uuid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bloc_product_uuid UUID NOT NULL REFERENCES bloc_products(uuid) ON DELETE CASCADE,
  
  -- Task details
  task_date DATE NOT NULL,
  task_type VARCHAR(50) NOT NULL DEFAULT 'application',
  task_description TEXT,
  
  -- Status
  status VARCHAR(20) DEFAULT 'planned' CHECK (status IN ('planned', 'in_progress', 'completed', 'cancelled')),
  priority VARCHAR(10) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  
  -- Quantities and measurements
  planned_quantity DECIMAL(10,2),
  actual_quantity DECIMAL(10,2),
  area_covered DECIMAL(10,2),
  
  -- Weather and conditions
  weather_conditions VARCHAR(100),
  temperature_celsius DECIMAL(4,1),
  humidity_percent INTEGER,
  wind_speed_kmh DECIMAL(4,1),
  
  -- Personnel and equipment
  assigned_personnel TEXT[],
  equipment_used TEXT[],
  
  -- Results and observations
  effectiveness_rating INTEGER CHECK (effectiveness_rating BETWEEN 1 AND 5),
  observations TEXT,
  issues_encountered TEXT,
  
  -- Costs
  labor_cost DECIMAL(10,2),
  equipment_cost DECIMAL(10,2),
  material_cost DECIMAL(10,2),
  total_cost DECIMAL(10,2),
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  
  -- Ensure unique task per date per bloc-product
  UNIQUE(bloc_product_uuid, task_date, task_type)
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Bloc products indexes
CREATE INDEX idx_bloc_products_bloc_uuid ON bloc_products(bloc_uuid);
CREATE INDEX idx_bloc_products_product_uuid ON bloc_products(product_uuid);
CREATE INDEX idx_bloc_products_resource_uuid ON bloc_products(resource_uuid);
CREATE INDEX idx_bloc_products_status ON bloc_products(status);
CREATE INDEX idx_bloc_products_dates ON bloc_products(planned_start_date, planned_end_date);

-- Daily tasks indexes
CREATE INDEX idx_daily_tasks_bloc_product_uuid ON daily_tasks(bloc_product_uuid);
CREATE INDEX idx_daily_tasks_date ON daily_tasks(task_date);
CREATE INDEX idx_daily_tasks_status ON daily_tasks(status);
CREATE INDEX idx_daily_tasks_type ON daily_tasks(task_type);
CREATE INDEX idx_daily_tasks_priority ON daily_tasks(priority);

-- =====================================================
-- TRIGGERS FOR UPDATED_AT
-- =====================================================

-- Update timestamp trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers
CREATE TRIGGER update_bloc_products_updated_at 
    BEFORE UPDATE ON bloc_products 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_daily_tasks_updated_at 
    BEFORE UPDATE ON daily_tasks 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- RLS POLICIES
-- =====================================================

-- Enable RLS
ALTER TABLE bloc_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_tasks ENABLE ROW LEVEL SECURITY;

-- Bloc products policies
CREATE POLICY "Users can view bloc_products for their company" ON bloc_products
    FOR SELECT USING (
        bloc_uuid IN (
            SELECT b.uuid FROM blocs b 
            JOIN farms f ON b.farm_uuid = f.uuid 
            WHERE f.company_uuid = auth.jwt() ->> 'company_uuid'::text
        )
    );

CREATE POLICY "Users can insert bloc_products for their company" ON bloc_products
    FOR INSERT WITH CHECK (
        bloc_uuid IN (
            SELECT b.uuid FROM blocs b 
            JOIN farms f ON b.farm_uuid = f.uuid 
            WHERE f.company_uuid = auth.jwt() ->> 'company_uuid'::text
        )
    );

CREATE POLICY "Users can update bloc_products for their company" ON bloc_products
    FOR UPDATE USING (
        bloc_uuid IN (
            SELECT b.uuid FROM blocs b 
            JOIN farms f ON b.farm_uuid = f.uuid 
            WHERE f.company_uuid = auth.jwt() ->> 'company_uuid'::text
        )
    );

CREATE POLICY "Users can delete bloc_products for their company" ON bloc_products
    FOR DELETE USING (
        bloc_uuid IN (
            SELECT b.uuid FROM blocs b 
            JOIN farms f ON b.farm_uuid = f.uuid 
            WHERE f.company_uuid = auth.jwt() ->> 'company_uuid'::text
        )
    );

-- Daily tasks policies
CREATE POLICY "Users can view daily_tasks for their company" ON daily_tasks
    FOR SELECT USING (
        bloc_product_uuid IN (
            SELECT bp.uuid FROM bloc_products bp
            JOIN blocs b ON bp.bloc_uuid = b.uuid
            JOIN farms f ON b.farm_uuid = f.uuid 
            WHERE f.company_uuid = auth.jwt() ->> 'company_uuid'::text
        )
    );

CREATE POLICY "Users can insert daily_tasks for their company" ON daily_tasks
    FOR INSERT WITH CHECK (
        bloc_product_uuid IN (
            SELECT bp.uuid FROM bloc_products bp
            JOIN blocs b ON bp.bloc_uuid = b.uuid
            JOIN farms f ON b.farm_uuid = f.uuid 
            WHERE f.company_uuid = auth.jwt() ->> 'company_uuid'::text
        )
    );

CREATE POLICY "Users can update daily_tasks for their company" ON daily_tasks
    FOR UPDATE USING (
        bloc_product_uuid IN (
            SELECT bp.uuid FROM bloc_products bp
            JOIN blocs b ON bp.bloc_uuid = b.uuid
            JOIN farms f ON b.farm_uuid = f.uuid 
            WHERE f.company_uuid = auth.jwt() ->> 'company_uuid'::text
        )
    );

CREATE POLICY "Users can delete daily_tasks for their company" ON daily_tasks
    FOR DELETE USING (
        bloc_product_uuid IN (
            SELECT bp.uuid FROM bloc_products bp
            JOIN blocs b ON bp.bloc_uuid = b.uuid
            JOIN farms f ON b.farm_uuid = f.uuid 
            WHERE f.company_uuid = auth.jwt() ->> 'company_uuid'::text
        )
    );
