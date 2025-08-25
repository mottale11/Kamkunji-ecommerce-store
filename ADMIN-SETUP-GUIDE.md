# Admin Login System Setup Guide

## Overview

The admin site now requires authentication. Users must sign in with admin credentials to access the admin panel.

## Setup Steps

### 1. Database Setup

First, run the updated `DATABASE-SETUP.sql` script in your Supabase SQL Editor. This will:
- Create the `profiles` table with an `is_admin` field
- Insert a sample admin profile

### 2. Create Admin User Account

You need to create an actual user account in Supabase Auth:

1. Go to your Supabase dashboard
2. Navigate to **Authentication** → **Users**
3. Click **"Add User"**
4. Enter the following details:
   - **Email**: `admin@example.com` (or your preferred admin email)
   - **Password**: Choose a strong password
   - **Email Confirm**: Check the box to confirm the email

### 3. Link Auth User to Admin Profile

After creating the auth user, the profile will be automatically linked. If not:

1. Go to **SQL Editor** in Supabase
2. Run this query to link your auth user to the admin profile:

```sql
-- Replace 'your-email@example.com' with your actual admin email
UPDATE profiles 
SET is_admin = true 
WHERE email = 'your-email@example.com';
```

### 4. Test the Login System

1. Go to your website
2. Click **"Admin Login"** in the footer
3. Sign in with your admin credentials
4. You should be redirected to the admin dashboard

## How It Works

### Authentication Flow

1. **User visits `/admin/login`**
2. **User enters email/password**
3. **System checks if user exists in Supabase Auth**
4. **System checks if user has admin privileges (`is_admin = true`)**
5. **If successful, user is redirected to `/admin/dashboard`**
6. **If unsuccessful, error message is shown**

### Route Protection

- **`/admin/login`**: Public access (no authentication required)
- **`/admin/*`** (all other admin routes): Requires admin authentication
- **Unauthenticated users**: Automatically redirected to login page

### Security Features

- **Admin-only access**: Only users with `is_admin = true` can access admin panel
- **Session management**: Login state is maintained across browser sessions
- **Automatic logout**: Users are logged out when they close the browser or after inactivity
- **Route protection**: All admin routes are protected from unauthorized access

## Admin User Management

### Adding New Admins

1. Create a new user in Supabase Auth
2. Insert a profile record with `is_admin = true`:

```sql
INSERT INTO profiles (full_name, email, is_admin) 
VALUES ('New Admin', 'newadmin@example.com', true);
```

### Removing Admin Access

```sql
UPDATE profiles 
SET is_admin = false 
WHERE email = 'admin@example.com';
```

### Viewing All Admins

```sql
SELECT full_name, email, created_at 
FROM profiles 
WHERE is_admin = true;
```

## Troubleshooting

### Common Issues

#### "Access denied. Admin privileges required."
- **Cause**: User exists in Auth but not in profiles table, or `is_admin = false`
- **Solution**: Check if profile exists and has `is_admin = true`

#### "Failed to sign in"
- **Cause**: Invalid email/password or user doesn't exist
- **Solution**: Verify credentials and check if user exists in Supabase Auth

#### "User not found"
- **Cause**: Profile record missing
- **Solution**: Create profile record for the user

### Debug Steps

1. **Check Supabase Auth**: Verify user exists in Authentication → Users
2. **Check Database**: Verify profile exists with `is_admin = true`
3. **Check Console**: Look for error messages in browser console
4. **Check Network**: Verify API calls are successful

## Customization

### Changing Admin Email

1. Update the profile record:
```sql
UPDATE profiles 
SET email = 'newemail@example.com' 
WHERE is_admin = true;
```

2. Update the auth user email in Supabase dashboard

### Adding More Admin Fields

You can extend the profiles table with additional admin fields:

```sql
ALTER TABLE profiles 
ADD COLUMN admin_role VARCHAR(50) DEFAULT 'admin',
ADD COLUMN permissions JSONB DEFAULT '{}';
```

### Custom Login Validation

Modify the login logic in `/admin/login/page.tsx` to add custom validation rules.

## Security Best Practices

1. **Strong Passwords**: Use complex passwords for admin accounts
2. **Regular Updates**: Regularly update admin passwords
3. **Limited Access**: Only grant admin access to trusted users
4. **Monitor Logs**: Keep an eye on admin login attempts
5. **Backup Data**: Regularly backup your database

## Support

If you encounter issues:

1. Check the browser console for errors
2. Verify your Supabase configuration
3. Ensure all environment variables are set correctly
4. Check that the database tables exist and have the correct structure

---

**Note**: This admin system provides basic authentication. For production use, consider implementing additional security measures like:
- Two-factor authentication
- IP whitelisting
- Rate limiting
- Audit logging
