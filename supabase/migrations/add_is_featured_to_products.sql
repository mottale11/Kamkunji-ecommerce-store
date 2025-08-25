-- Add is_featured column to products table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'products' AND column_name = 'is_featured'
    ) THEN
        ALTER TABLE products
        ADD COLUMN is_featured BOOLEAN DEFAULT false;
        
        -- Update existing rows to have a default value
        UPDATE products SET is_featured = false WHERE is_featured IS NULL;
        
        -- Make the column NOT NULL after setting default values
        ALTER TABLE products ALTER COLUMN is_featured SET NOT NULL;
        
        RAISE NOTICE 'Added is_featured column to products table';
    END IF;
END $$;
