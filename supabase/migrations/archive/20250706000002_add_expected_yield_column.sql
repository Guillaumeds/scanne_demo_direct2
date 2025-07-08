-- Add expected yield column to crop_cycles table
-- This stores the farmer's expected/planned yield when creating the crop cycle

DO $$
BEGIN
    -- Add expected yield column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'crop_cycles' 
        AND column_name = 'sugarcane_expected_yield_tons_ha'
    ) THEN
        ALTER TABLE crop_cycles 
        ADD COLUMN sugarcane_expected_yield_tons_ha DECIMAL(10,2);
        
        -- Add comment for clarity
        COMMENT ON COLUMN crop_cycles.sugarcane_expected_yield_tons_ha IS 'Expected/planned sugarcane yield in tons per hectare (set during crop cycle creation)';
        COMMENT ON COLUMN crop_cycles.sugarcane_actual_yield_tons_ha IS 'Actual sugarcane yield in tons per hectare (calculated from observations)';
        
        -- Update existing records to have a default expected yield if needed
        UPDATE crop_cycles 
        SET sugarcane_expected_yield_tons_ha = 80.0 
        WHERE sugarcane_expected_yield_tons_ha IS NULL;
        
        RAISE NOTICE 'Expected yield column added successfully!';
    ELSE
        RAISE NOTICE 'Expected yield column already exists, skipping...';
    END IF;
END $$;
