-- Add stock_quantity column to products table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'products' AND column_name = 'stock_quantity'
    ) THEN
        ALTER TABLE products
        ADD COLUMN stock_quantity INTEGER NOT NULL DEFAULT 0;
        
        -- Update existing rows to have a default value
        UPDATE products SET stock_quantity = 0 WHERE stock_quantity IS NULL;
        
        RAISE NOTICE 'Added stock_quantity column to products table';
    END IF;
END $$;
