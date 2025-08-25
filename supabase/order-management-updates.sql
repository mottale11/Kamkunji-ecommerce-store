-- Order Management Updates
-- Add new fields for enhanced order tracking and shipping information

-- Add missing columns to orders table (only if they don't exist)
DO $$
BEGIN
    -- Add tracking_number if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' 
        AND column_name = 'tracking_number'
    ) THEN
        ALTER TABLE orders ADD COLUMN tracking_number VARCHAR(100);
    END IF;

    -- Add estimated_delivery if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' 
        AND column_name = 'estimated_delivery'
    ) THEN
        ALTER TABLE orders ADD COLUMN estimated_delivery DATE;
    END IF;

    -- Add shipping_address if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' 
        AND column_name = 'shipping_address'
    ) THEN
        ALTER TABLE orders ADD COLUMN shipping_address TEXT;
    END IF;

    -- Add customer_email if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' 
        AND column_name = 'customer_email'
    ) THEN
        ALTER TABLE orders ADD COLUMN customer_email VARCHAR(255);
    END IF;

    -- Add checkout_request_id if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' 
        AND column_name = 'checkout_request_id'
    ) THEN
        ALTER TABLE orders ADD COLUMN checkout_request_id VARCHAR(255);
    END IF;

    -- Add payment_status if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' 
        AND column_name = 'payment_status'
    ) THEN
        ALTER TABLE orders ADD COLUMN payment_status VARCHAR(50) DEFAULT 'pending';
    END IF;

    -- Add mpesa_receipt_number if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' 
        AND column_name = 'mpesa_receipt_number'
    ) THEN
        ALTER TABLE orders ADD COLUMN mpesa_receipt_number VARCHAR(100);
    END IF;

    -- Add transaction_date if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' 
        AND column_name = 'transaction_date'
    ) THEN
        ALTER TABLE orders ADD COLUMN transaction_date TIMESTAMP;
    END IF;
END $$;

-- Add indexes for better performance (only if columns exist)
DO $$
BEGIN
    -- Create status index if column exists
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' 
        AND column_name = 'status'
    ) THEN
        CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
    END IF;

    -- Create payment_status index if column exists
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' 
        AND column_name = 'payment_status'
    ) THEN
        CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
    END IF;

    -- Create checkout_request_id index if column exists
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' 
        AND column_name = 'checkout_request_id'
    ) THEN
        CREATE INDEX IF NOT EXISTS idx_orders_checkout_request_id ON orders(checkout_request_id);
    END IF;
END $$;

-- Update existing orders to have default status if null (only if status column exists)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' 
        AND column_name = 'status'
    ) THEN
        UPDATE orders 
        SET status = 'pending_payment' 
        WHERE status IS NULL;
    END IF;
END $$;

-- Add comments for documentation (only if columns exist)
DO $$
BEGIN
    -- Add comment for tracking_number if it exists
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' 
        AND column_name = 'tracking_number'
    ) THEN
        COMMENT ON COLUMN orders.tracking_number IS 'Tracking number for shipped orders';
    END IF;

    -- Add comment for estimated_delivery if it exists
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' 
        AND column_name = 'estimated_delivery'
    ) THEN
        COMMENT ON COLUMN orders.estimated_delivery IS 'Estimated delivery date for shipped orders';
    END IF;

    -- Add comment for shipping_address if it exists
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' 
        AND column_name = 'shipping_address'
    ) THEN
        COMMENT ON COLUMN orders.shipping_address IS 'Customer shipping address';
    END IF;

    -- Add comment for customer_email if it exists
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' 
        AND column_name = 'customer_email'
    ) THEN
        COMMENT ON COLUMN orders.customer_email IS 'Customer email for notifications';
    END IF;
END $$;

-- Create a view for order summary with all related information (only if required tables exist)
DO $$
BEGIN
    -- Check if required tables exist
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'orders'
    ) AND EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'users'
    ) AND EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'order_items'
    ) THEN
        
        -- Drop existing view if it exists
        DROP VIEW IF EXISTS order_summary;
        
        -- Create the view
        CREATE VIEW order_summary AS
        SELECT 
            o.id,
            COALESCE(o.status, 'pending_payment') as status,
            COALESCE(o.payment_status, 'pending') as payment_status,
            COALESCE(o.total_amount, 0) as total_amount,
            o.created_at,
            o.updated_at,
            o.tracking_number,
            o.estimated_delivery,
            o.shipping_address,
            o.customer_email,
            o.mpesa_receipt_number,
            o.transaction_date,
            u.full_name as customer_name,
            u.email as user_email,
            u.phone as customer_phone,
            COUNT(oi.id) as item_count
        FROM orders o
        LEFT JOIN users u ON o.user_id = u.id
        LEFT JOIN order_items oi ON o.id = oi.order_id
        GROUP BY o.id, u.full_name, u.email, u.phone;
        
        -- Grant permissions
        GRANT SELECT ON order_summary TO authenticated;
        GRANT SELECT ON order_summary TO anon;
        
    END IF;
END $$;


