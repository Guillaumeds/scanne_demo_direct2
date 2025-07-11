-- =====================================================
-- HIERARCHICAL SAMPLE DATA MIGRATION
-- Preserves ALL existing data and adds hierarchical structure
-- =====================================================

-- Variables for consistent UUIDs
DO $$
DECLARE
    -- Get existing UUIDs
    company_uuid UUID;
    farm_uuid UUID;
    bloc1_uuid UUID;
    bloc2_uuid UUID;
    bloc3_uuid UUID;
    
    -- Products
    fertilizer_uuid UUID;
    herbicide_uuid UUID;
    insecticide_uuid UUID;
    fungicide_uuid UUID;
    
    -- Resources
    spreader_uuid UUID;
    sprayer_uuid UUID;
    tractor_uuid UUID;
    
    -- Bloc-Product combinations
    bp1_uuid UUID;
    bp2_uuid UUID;
    bp3_uuid UUID;
    bp4_uuid UUID;
    bp5_uuid UUID;
    bp6_uuid UUID;
    
BEGIN
    -- Get existing company, farm, and bloc UUIDs
    SELECT uuid INTO company_uuid FROM companies LIMIT 1;
    SELECT uuid INTO farm_uuid FROM farms WHERE company_uuid = company_uuid LIMIT 1;
    
    -- Get bloc UUIDs
    SELECT uuid INTO bloc1_uuid FROM blocs WHERE name = 'Bloc 1' AND farm_uuid = farm_uuid;
    SELECT uuid INTO bloc2_uuid FROM blocs WHERE name = 'Bloc 2' AND farm_uuid = farm_uuid;
    SELECT uuid INTO bloc3_uuid FROM blocs WHERE name = 'Bloc 3' AND farm_uuid = farm_uuid;
    
    -- Get product UUIDs
    SELECT uuid INTO fertilizer_uuid FROM products WHERE name = 'NPK 15-15-15';
    SELECT uuid INTO herbicide_uuid FROM products WHERE name = 'Glyphosate 360';
    SELECT uuid INTO insecticide_uuid FROM products WHERE name = 'Cypermethrin 100';
    SELECT uuid INTO fungicide_uuid FROM products WHERE name = 'Mancozeb 800';
    
    -- Get resource UUIDs
    SELECT uuid INTO spreader_uuid FROM resources WHERE name = 'Fertilizer Spreader';
    SELECT uuid INTO sprayer_uuid FROM resources WHERE name = 'Boom Sprayer';
    SELECT uuid INTO tractor_uuid FROM resources WHERE name = 'John Deere 6120M';
    
    -- =====================================================
    -- INSERT BLOC-PRODUCT COMBINATIONS
    -- =====================================================
    
    -- Bloc 1 Products
    INSERT INTO bloc_products (
        uuid, bloc_uuid, product_uuid, resource_uuid,
        planned_quantity, planned_application_rate, planned_area_coverage,
        status, planned_start_date, planned_end_date,
        estimated_cost, notes
    ) VALUES 
    (
        gen_random_uuid(), bloc1_uuid, fertilizer_uuid, spreader_uuid,
        500.00, 250.00, 2.5,
        'planned', '2025-01-15', '2025-01-20',
        1250.00, 'Base fertilization for new planting season'
    ),
    (
        gen_random_uuid(), bloc1_uuid, herbicide_uuid, sprayer_uuid,
        20.00, 4.00, 2.5,
        'planned', '2025-01-25', '2025-01-25',
        180.00, 'Pre-emergence weed control'
    );
    
    -- Bloc 2 Products
    INSERT INTO bloc_products (
        uuid, bloc_uuid, product_uuid, resource_uuid,
        planned_quantity, planned_application_rate, planned_area_coverage,
        status, planned_start_date, planned_end_date,
        estimated_cost, notes
    ) VALUES 
    (
        gen_random_uuid(), bloc2_uuid, fertilizer_uuid, spreader_uuid,
        750.00, 300.00, 3.2,
        'in_progress', '2025-01-10', '2025-01-18',
        1875.00, 'Enhanced fertilization for high-yield area'
    ),
    (
        gen_random_uuid(), bloc2_uuid, insecticide_uuid, sprayer_uuid,
        15.00, 2.5, 3.2,
        'planned', '2025-02-01', '2025-02-01',
        225.00, 'Preventive insect control'
    );
    
    -- Bloc 3 Products
    INSERT INTO bloc_products (
        uuid, bloc_uuid, product_uuid, resource_uuid,
        planned_quantity, planned_application_rate, planned_area_coverage,
        status, planned_start_date, planned_end_date,
        estimated_cost, notes
    ) VALUES 
    (
        gen_random_uuid(), bloc3_uuid, fungicide_uuid, sprayer_uuid,
        25.00, 3.0, 1.8,
        'completed', '2025-01-05', '2025-01-05',
        300.00, 'Disease prevention treatment'
    ),
    (
        gen_random_uuid(), bloc3_uuid, herbicide_uuid, sprayer_uuid,
        12.00, 3.5, 1.8,
        'planned', '2025-01-30', '2025-01-30',
        108.00, 'Post-emergence weed control'
    );
    
    -- =====================================================
    -- INSERT DAILY TASKS
    -- =====================================================
    
    -- Get bloc-product UUIDs for task insertion
    DECLARE
        bp_fertilizer_bloc1 UUID;
        bp_herbicide_bloc1 UUID;
        bp_fertilizer_bloc2 UUID;
        bp_insecticide_bloc2 UUID;
        bp_fungicide_bloc3 UUID;
        bp_herbicide_bloc3 UUID;
    BEGIN
        -- Get bloc-product combinations
        SELECT uuid INTO bp_fertilizer_bloc1 FROM bloc_products 
        WHERE bloc_uuid = bloc1_uuid AND product_uuid = fertilizer_uuid;
        
        SELECT uuid INTO bp_herbicide_bloc1 FROM bloc_products 
        WHERE bloc_uuid = bloc1_uuid AND product_uuid = herbicide_uuid;
        
        SELECT uuid INTO bp_fertilizer_bloc2 FROM bloc_products 
        WHERE bloc_uuid = bloc2_uuid AND product_uuid = fertilizer_uuid;
        
        SELECT uuid INTO bp_insecticide_bloc2 FROM bloc_products 
        WHERE bloc_uuid = bloc2_uuid AND product_uuid = insecticide_uuid;
        
        SELECT uuid INTO bp_fungicide_bloc3 FROM bloc_products 
        WHERE bloc_uuid = bloc3_uuid AND product_uuid = fungicide_uuid;
        
        SELECT uuid INTO bp_herbicide_bloc3 FROM bloc_products 
        WHERE bloc_uuid = bloc3_uuid AND product_uuid = herbicide_uuid;
        
        -- Daily tasks for Bloc 1 - Fertilizer
        INSERT INTO daily_tasks (
            bloc_product_uuid, task_date, task_type, task_description,
            status, priority, planned_quantity, actual_quantity,
            weather_conditions, temperature_celsius, humidity_percent,
            assigned_personnel, equipment_used,
            observations, labor_cost, equipment_cost, material_cost, total_cost
        ) VALUES 
        (
            bp_fertilizer_bloc1, '2025-01-15', 'preparation',
            'Equipment calibration and field preparation',
            'planned', 'high', 0, NULL,
            'Clear, light wind', 22.5, 65,
            ARRAY['John Smith', 'Mike Johnson'], ARRAY['Spreader', 'Tractor'],
            'Check spreader calibration before application', 150.00, 50.00, 0, 200.00
        ),
        (
            bp_fertilizer_bloc1, '2025-01-16', 'application',
            'First section fertilizer application',
            'planned', 'high', 250.00, NULL,
            'Partly cloudy', 24.0, 70,
            ARRAY['John Smith', 'Mike Johnson'], ARRAY['Spreader', 'Tractor'],
            'Apply to northern section first', 200.00, 75.00, 625.00, 900.00
        ),
        (
            bp_fertilizer_bloc1, '2025-01-17', 'application',
            'Second section fertilizer application',
            'planned', 'high', 250.00, NULL,
            'Sunny', 26.0, 60,
            ARRAY['John Smith', 'Mike Johnson'], ARRAY['Spreader', 'Tractor'],
            'Complete southern section', 200.00, 75.00, 625.00, 900.00
        );
        
        -- Daily tasks for Bloc 1 - Herbicide
        INSERT INTO daily_tasks (
            bloc_product_uuid, task_date, task_type, task_description,
            status, priority, planned_quantity,
            weather_conditions, temperature_celsius, humidity_percent,
            assigned_personnel, equipment_used,
            observations, labor_cost, equipment_cost, material_cost, total_cost
        ) VALUES 
        (
            bp_herbicide_bloc1, '2025-01-25', 'application',
            'Pre-emergence herbicide application',
            'planned', 'medium', 20.00,
            'Calm conditions required', 20.0, 75,
            ARRAY['Sarah Wilson'], ARRAY['Boom Sprayer'],
            'Apply early morning for best results', 120.00, 40.00, 180.00, 340.00
        );
        
        -- Daily tasks for Bloc 2 - Fertilizer (in progress)
        INSERT INTO daily_tasks (
            bloc_product_uuid, task_date, task_type, task_description,
            status, priority, planned_quantity, actual_quantity,
            weather_conditions, temperature_celsius, humidity_percent,
            assigned_personnel, equipment_used,
            effectiveness_rating, observations, 
            labor_cost, equipment_cost, material_cost, total_cost
        ) VALUES 
        (
            bp_fertilizer_bloc2, '2025-01-10', 'preparation',
            'Field inspection and equipment setup',
            'completed', 'high', 0, 0,
            'Clear', 21.0, 68,
            ARRAY['Tom Brown'], ARRAY['Spreader'],
            4, 'Equipment in good condition, field ready', 100.00, 30.00, 0, 130.00
        ),
        (
            bp_fertilizer_bloc2, '2025-01-12', 'application',
            'First phase fertilizer application',
            'completed', 'high', 375.00, 380.00,
            'Partly cloudy', 23.5, 72,
            ARRAY['Tom Brown', 'Lisa Davis'], ARRAY['Spreader', 'Tractor'],
            5, 'Excellent coverage achieved', 250.00, 100.00, 950.00, 1300.00
        ),
        (
            bp_fertilizer_bloc2, '2025-01-15', 'application',
            'Second phase fertilizer application',
            'in_progress', 'high', 375.00, 200.00,
            'Light rain expected', 19.0, 85,
            ARRAY['Tom Brown', 'Lisa Davis'], ARRAY['Spreader', 'Tractor'],
            NULL, 'Partial completion due to weather', 150.00, 60.00, 500.00, 710.00
        );
        
        -- Daily tasks for Bloc 3 - Fungicide (completed)
        INSERT INTO daily_tasks (
            bloc_product_uuid, task_date, task_type, task_description,
            status, priority, planned_quantity, actual_quantity,
            weather_conditions, temperature_celsius, humidity_percent,
            assigned_personnel, equipment_used,
            effectiveness_rating, observations,
            labor_cost, equipment_cost, material_cost, total_cost
        ) VALUES 
        (
            bp_fungicide_bloc3, '2025-01-05', 'application',
            'Preventive fungicide treatment',
            'completed', 'medium', 25.00, 24.5,
            'Overcast, no wind', 18.0, 80,
            ARRAY['Maria Garcia'], ARRAY['Boom Sprayer'],
            4, 'Good coverage, slight wind pickup at end', 150.00, 50.00, 294.00, 494.00
        );
        
    END;
END $$;
