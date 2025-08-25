# 🚀 Quick Setup Guide - Fix Categories Error

## The Problem
You're seeing this error: `Error: [ Server ] Error fetching categories: {}`

This happens because your Supabase environment variables are not configured.

## ✅ Solution Steps

### 1. Create Environment File
Create a `.env.local` file in your project root (`kamkunji-ndogo/` folder) with:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2. Get Your Supabase Credentials
1. Go to [https://supabase.com](https://supabase.com)
2. Sign in to your account (or create one)
3. Create a new project or select existing one
4. Go to **Project Settings** → **API**
5. Copy the **Project URL** and **anon/public key**

### 3. Update Your .env.local File
Replace the placeholder values with your actual credentials:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://yourproject.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your_actual_key_here
```

### 4. Restart Development Server
```bash
# Stop your current server (Ctrl+C)
# Then restart:
npm run dev
```

### 5. Initialize Database
Visit this URL in your browser to set up the database:
```
http://localhost:3000/api/db-init
```

You should see: `{"message":"Database initialized successfully"}`

### 6. Verify Categories Are Working
Refresh your main page - you should now see categories displayed!

## 🔧 Alternative: Use Firebase Instead

If you prefer to use Firebase (which is also configured in this project):

1. Remove the Supabase environment variables
2. The app will fall back to Firebase
3. Configure Firebase in your Firebase console

## 🐛 Troubleshooting

### Still Getting Errors?
1. **Check .env.local location**: Must be in `kamkunji-ndogo/` folder
2. **Verify credentials**: Copy-paste carefully from Supabase dashboard
3. **Restart server**: Environment changes require server restart
4. **Check Supabase project**: Ensure your project is active and running

### Database Connection Issues?
1. Visit `/api/db-init` to initialize tables
2. Check Supabase dashboard for any errors
3. Verify your project hasn't been paused

### Need Help?
- Check the console for detailed error messages
- Review `README-SUPABASE.md` for more details
- Ensure your Supabase project is in the same region as your app

## 📁 File Structure
```
kamkunji-ndogo/
├── .env.local          ← Create this file
├── src/
│   ├── components/
│   │   └── CategoryList.tsx  ← Fixed component
│   └── utils/
│       └── supabase.ts       ← Supabase client
└── supabase/
    └── schema.sql            ← Database schema
```

## 🎯 What This Fixes
- ✅ Categories will load properly
- ✅ No more "Error fetching categories" messages
- ✅ Database will be initialized with sample data
- ✅ Better error messages for future issues

## 🚀 Next Steps
After fixing this:
1. Categories will display on your homepage
2. You can add/edit categories in Supabase dashboard
3. Products can be assigned to categories
4. Full e-commerce functionality will work

---

**Need more help?** Check the console for detailed error messages, or review the Supabase documentation at [supabase.com/docs](https://supabase.com/docs)
