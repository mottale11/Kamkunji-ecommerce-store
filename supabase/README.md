# Kamkunji Ndogo Supabase Database Setup

This document provides instructions for setting up and using the Supabase database for the Kamkunji Ndogo e-commerce platform.

## Prerequisites

1. Create a Supabase account at [https://supabase.com](https://supabase.com)
2. Create a new Supabase project
3. Get your Supabase URL and anon key from the project settings

## Setup Instructions

### 1. Environment Variables

Create a `.env.local` file in the root of your project with the following variables:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Replace `your_supabase_url` and `your_supabase_anon_key` with the values from your Supabase project settings.

### 2. Database Schema

Run the SQL script in `schema.sql` in the Supabase SQL editor to create the necessary tables and indexes.

1. Go to your Supabase project dashboard
2. Click on "SQL Editor"
3. Create a new query
4. Copy and paste the contents of `schema.sql`
5. Run the query

## Database Structure

The database consists of the following tables:

- **users**: Stores user information and authentication details
- **categories**: Product categories with icons
- **products**: Main product information
- **product_images**: Images associated with products
- **orders**: Customer orders
- **order_items**: Individual items in an order
- **reports**: Product reports for inappropriate listings
- **wishlist**: User's saved/favorite products

## Services

The following services are available for interacting with the database:

- **auth.ts**: User authentication and session management
- **users.ts**: User management (create, read, update, delete)
- **products.ts**: Product management with filtering and search
- **categories.ts**: Category management
- **orders.ts**: Order processing and management
- **reports.ts**: Product reporting and moderation
- **wishlist.ts**: User wishlist management

## Usage Examples

### Authentication

```typescript
import { signIn, signUp, signOut } from '../services/auth';

// Sign in a user
const { user, error } = await signIn('user@example.com');

// Sign up a new user
const { user, error } = await signUp({
  email: 'newuser@example.com',
  full_name: 'New User',
  phone: '1234567890'
});

// Sign out
await signOut();
```

### Products

```typescript
import { getProducts, getProductById, createProduct } from '../services/products';

// Get featured products
const featuredProducts = await getProducts({ featured: true });

// Get products by category
const categoryProducts = await getProducts({ category_id: 'category-id' });

// Get a specific product
const product = await getProductById('product-id');

// Create a new product
const newProduct = await createProduct({
  name: 'Product Name',
  description: 'Product Description',
  price: 99.99,
  category_id: 'category-id',
  condition: 'new',
  location: 'Nairobi',
  phone: '1234567890',
  images: ['image-url-1', 'image-url-2']
});
```

### Orders

```typescript
import { createOrder, getOrderById, updateOrderStatus } from '../services/orders';

// Create a new order
const order = await createOrder({
  user_id: 'user-id',
  full_name: 'Customer Name',
  email: 'customer@example.com',
  phone: '1234567890',
  address: '123 Main St',
  city: 'Nairobi',
  items: [
    { product_id: 'product-id-1', quantity: 1, price: 99.99 },
    { product_id: 'product-id-2', quantity: 2, price: 49.99 }
  ]
});

// Get an order
const orderDetails = await getOrderById('order-id');

// Update order status
await updateOrderStatus('order-id', 'completed');
```

## Troubleshooting

- **Database Connection Issues**: Ensure your environment variables are correctly set and that your Supabase project is active.
- **Permission Errors**: Check the Row Level Security (RLS) policies in your Supabase project settings.
- **Missing Tables**: Run the schema.sql script again to create any missing tables.

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Next.js with Supabase](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)