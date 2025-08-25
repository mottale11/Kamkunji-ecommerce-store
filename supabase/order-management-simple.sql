-- Order Management - Simple Migration
-- Run this step by step in Supabase SQL Editor

-- Step 1: Add basic columns (run this first)
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS tracking_number VARCHAR(100),
ADD COLUMN IF NOT EXISTS estimated_delivery DATE,
ADD COLUMN IF NOT EXISTS shipping_address TEXT,
ADD COLUMN IF NOT EXISTS customer_email VARCHAR(255);

-- Step 2: Add M-Pesa related columns (run this second)
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS checkout_request_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS payment_status VARCHAR(50) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS mpesa_receipt_number VARCHAR(100),
ADD COLUMN IF NOT EXISTS transaction_date TIMESTAMP;

-- Step 3: Add status column if it doesn't exist (run this third)
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'pending_payment';

-- Step 4: Update existing orders with default status (run this fourth)
UPDATE orders 
SET status = 'pending_payment' 
WHERE status IS NULL;

-- Step 5: Create basic indexes (run this fifth)
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);

-- Step 6: Create checkout_request_id index only if column exists (run this sixth)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' 
        AND column_name = 'checkout_request_id'
    ) THEN
        CREATE INDEX IF NOT EXISTS idx_orders_checkout_request_id ON orders(checkout_request_id);
    END IF;
END $$;

-- Step 7: Add column comments (run this seventh)
COMMENT ON COLUMN orders.tracking_number IS 'Tracking number for shipped orders';
COMMENT ON COLUMN orders.estimated_delivery IS 'Estimated delivery date for shipped orders';
COMMENT ON COLUMN orders.shipping_address IS 'Customer shipping address';
COMMENT ON COLUMN orders.customer_email IS 'Customer email for notifications';
COMMENT ON COLUMN orders.checkout_request_id IS 'M-Pesa checkout request ID';
COMMENT ON COLUMN orders.payment_status IS 'Payment status (pending, completed, failed)';
COMMENT ON COLUMN orders.status IS 'Order status (pending_payment, paid, processing, shipped, delivered, cancelled)';

-- Step 8: Create order summary view (run this last)
DROP VIEW IF EXISTS order_summary;

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

-- Step 9: Grant permissions
GRANT SELECT ON order_summary TO authenticated;
GRANT SELECT ON order_summary TO anon;

-- Success message
SELECT 'Order management migration completed successfully!' as status;
