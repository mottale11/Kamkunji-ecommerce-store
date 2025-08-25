-- Add is_primary column to product_images table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'product_images' AND column_name = 'is_primary'
    ) THEN
        -- Add the column with a default value of false
        ALTER TABLE product_images
        ADD COLUMN is_primary BOOLEAN DEFAULT false NOT NULL;
        
        -- For existing records, set is_primary to true for the first image of each product
        -- This ensures we have at least one primary image per product
        WITH first_images AS (
            SELECT id, 
                   ROW_NUMBER() OVER (PARTITION BY product_id ORDER BY created_at) as rn
            FROM product_images
        )
        UPDATE product_images pi
        SET is_primary = true
        FROM first_images fi
        WHERE pi.id = fi.id AND fi.rn = 1;
        
        RAISE NOTICE 'Added is_primary column to product_images table';
    END IF;
END $$;
