-- Add missing columns to products table if they don't exist
DO $$
BEGIN
    -- Add stock_quantity if it doesn't exist
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'products' AND column_name = 'stock_quantity'
    ) THEN
        ALTER TABLE products
        ADD COLUMN stock_quantity INTEGER DEFAULT 0 NOT NULL;
        RAISE NOTICE 'Added stock_quantity column to products table';
    END IF;

    -- Add is_featured if it doesn't exist
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'products' AND column_name = 'is_featured'
    ) THEN
        ALTER TABLE products
        ADD COLUMN is_featured BOOLEAN DEFAULT false NOT NULL;
        RAISE NOTICE 'Added is_featured column to products table';
    END IF;
END $$;
