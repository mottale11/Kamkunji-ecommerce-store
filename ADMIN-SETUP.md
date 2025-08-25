# Admin Authentication Setup Guide

This guide will help you set up the admin authentication system for Kamkunji Ndogo.

## Prerequisites

1. Supabase project set up and running
2. Environment variables configured
3. Database schema applied

## Setup Steps

### 1. Apply Database Schema

First, run the main schema in your Supabase SQL Editor:

```sql
-- Copy and paste the contents of supabase/schema.sql
-- This creates the users table with proper structure
```

### 2. Create Admin User

Run the admin setup script in your Supabase SQL Editor:

```sql
-- Copy and paste the contents of supabase/admin-setup.sql
-- This creates the admin user with the specified credentials
```

### 3. Verify Admin User

Check that the admin user was created successfully:

```sql
SELECT id, email, full_name, role, created_at 
FROM users 
WHERE role = 'admin';
```

You should see:
- Email: kamkunjin@gmail.com
- Role: admin
- Full Name: Admin User

### 4. Test Login

1. Go to `/admin/login`
2. Use the credentials:
   - **Email**: kamkunjin@gmail.com
   - **Password**: $Moses321
3. You should be redirected to `/admin/dashboard`

## Alternative Setup via API

If you prefer to use the API endpoint:

```bash
curl -X POST http://localhost:3000/api/admin-setup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "kamkunjin@gmail.com",
    "fullName": "Admin User",
    "password": "$Moses321"
  }'
```

## Security Notes

⚠️ **Important**: The current implementation uses a simple password hashing function for demonstration purposes. In production, you should:

1. Use bcrypt or similar secure hashing
2. Implement proper session management
3. Add rate limiting for login attempts
4. Use HTTPS in production
5. Consider implementing 2FA

## Troubleshooting

### Common Issues

1. **"Invalid credentials" error**
   - Check that the admin user exists in the database
   - Verify the password hash is correct
   - Check console logs for detailed error messages

2. **Database connection errors**
   - Verify your Supabase environment variables
   - Check that the database is accessible
   - Ensure RLS policies are properly configured

3. **User not found**
   - Run the admin setup script again
   - Check the users table for the admin user
   - Verify the email spelling

### Debug Steps

1. Check browser console for error messages
2. Verify database tables exist and have data
3. Test database connection directly
4. Check RLS policies are not too restrictive

## File Structure

```
src/
├── app/
│   ├── admin/
│   │   ├── login/page.tsx          # Admin login page
│   │   └── dashboard/page.tsx      # Admin dashboard
│   └── api/
│       └── admin-setup/route.ts    # Admin setup API
├── services/
│   └── adminAuth.ts                # Admin authentication service
├── utils/
│   └── adminAuth.ts                # Admin auth utilities
└── types/
    └── database.types.ts           # Database type definitions
```

## Support

If you encounter issues:

1. Check the console logs for detailed error messages
2. Verify all setup steps were completed
3. Check that the database schema matches the expected structure
4. Ensure environment variables are correctly set
