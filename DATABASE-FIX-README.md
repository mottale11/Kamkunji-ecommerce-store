# Database Fix Guide

## Issues Identified

1. **Items Management Page**: Shows "no items" because it was looking for an `items` table that doesn't exist
2. **Product Approval**: Not working properly due to potential database schema issues
3. **Database Connectivity**: Need to ensure proper table structure and data

## Solutions

### 1. Fix Items Management Page ✅

The items management page has been updated to show products from the `products` table instead of a non-existent `items` table. It now works as an inventory management system.

### 2. Fix Product Approval ✅

The product approval functionality has been fixed and now properly updates the database. When a product is approved, it will be visible on the main store.

### 3. Database Setup

#### Option A: Use the SQL Script (Recommended)

1. Go to your Supabase dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `DATABASE-SETUP.sql`
4. Run the script
5. This will create all necessary tables with proper structure

#### Option B: Manual Table Creation

If you prefer to create tables manually, ensure you have these tables:

- `categories` - Product categories
- `profiles` - User profiles
- `products` - Product information
- `product_images` - Product images
- `orders` - Order information
- `order_items` - Individual items in orders

### 4. Test Database Connection

1. Go to `/admin/test-db` in your admin panel
2. This page will test all database connections and show you:
   - Which tables exist
   - How many records are in each table
   - Sample data from each table
   - Any database errors

### 5. Verify Data Flow

#### Product Submission Flow:
1. User submits product → `status: 'pending'`
2. Admin approves product → `status: 'approved'`
3. Product appears on main store (filtered by `status = 'approved'`)

#### Admin Management Flow:
1. **Items Page**: Shows all products with inventory management
2. **Products Page**: Shows all products with approval actions
3. **Dashboard**: Shows statistics from all tables
4. **Main Store**: Only shows approved products

## Quick Fix Steps

1. **Run the database setup script** in Supabase SQL Editor
2. **Check the test database page** at `/admin/test-db`
3. **Submit a test product** through the submit form
4. **Approve the product** in the admin panel
5. **Verify it appears** on the main store

## Currency Information

**The system now uses Kenyan Shillings (KES) as the default currency:**
- All prices are displayed in KES format (e.g., "KSh 1,500")
- Sample products in the database use realistic KES amounts
- The currency utility functions are configured for KES formatting

## Common Issues and Solutions

### Issue: "No products found" on main store
**Solution**: Check if products exist and have `status = 'approved'`

### Issue: Admin pages show no data
**Solution**: Verify database tables exist and have proper permissions

### Issue: Product approval not working
**Solution**: Check database schema and ensure `status` field exists

### Issue: Images not displaying
**Solution**: Verify storage bucket `product-images` exists and is public

## Database Schema Requirements

### Products Table
```sql
- id (UUID, Primary Key)
- name (VARCHAR, Required)
- description (TEXT)
- price (DECIMAL, Required)
- status (VARCHAR: 'pending', 'approved', 'rejected')
- category_id (UUID, References categories.id)
- condition (VARCHAR)
- location (VARCHAR)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### Categories Table
```sql
- id (UUID, Primary Key)
- name (VARCHAR, Required, Unique)
- description (TEXT)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### Product Images Table
```sql
- id (UUID, Primary Key)
- product_id (UUID, References products.id)
- url (TEXT, Required)
- is_primary (BOOLEAN)
- created_at (TIMESTAMP)
```

## Testing Checklist

- [ ] Database tables exist
- [ ] Sample data is present
- [ ] Product submission works
- [ ] Admin approval works
- [ ] Approved products appear on main store
- [ ] Images upload and display correctly
- [ ] All admin pages show data

## Next Steps

After fixing the database:

1. **Test the complete flow** from submission to approval to display
2. **Add more products** to test the system
3. **Customize the admin interface** as needed
4. **Set up proper security** for production use

## Support

If you continue to have issues:

1. Check the browser console for errors
2. Use the `/admin/test-db` page to diagnose problems
3. Verify your Supabase configuration
4. Check that all environment variables are set correctly
