# 🚀 Vercel Deployment Guide

## Overview
This guide will help you deploy your Kamkunji Ndogo ecommerce store to Vercel. Since you're using Supabase as your backend, everything can be deployed on Vercel.

## ✅ Prerequisites
- [GitHub](https://github.com) account
- [Vercel](https://vercel.com) account
- [Supabase](https://supabase.com) project (already configured)

## 🚀 Deployment Steps

### Step 1: Push to GitHub
1. **Initialize Git** (if not already done):
   ```bash
   git init
   git add .
   git commit -m "Initial commit - ready for deployment"
   ```

2. **Create GitHub Repository**:
   - Go to [GitHub](https://github.com)
   - Click "New repository"
   - Name it `kamkunji-ndogo`
   - Make it public or private
   - Don't initialize with README (you already have one)

3. **Push to GitHub**:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/kamkunji-ndogo.git
   git branch -M main
   
   ```

### Step 2: Deploy to Vercel

1. **Go to Vercel**:
   - Visit [vercel.com](https://vercel.com)
   - Sign in with GitHub

2. **Import Project**:
   - Click "New Project"
   - Import your `kamkunji-ndogo` repository
   - Vercel will auto-detect it's a Next.js project

3. **Configure Project**:
   - **Project Name**: `kamkunji-ndogo` (or your preferred name)
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `./` (leave as default)
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `.next` (auto-detected)
   - **Install Command**: `npm install` (auto-detected)

### Step 3: Environment Variables

**CRITICAL**: You must add your environment variables in Vercel:

1. **In Vercel Dashboard**:
   - Go to your project settings
   - Click "Environment Variables"
   - Add these variables:

   ```
   NEXT_PUBLIC_SUPABASE_URL=https://szzvdatcwajqgffrzrnw.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN6enZkYXRjd2FqcWdmZnJ6cm53Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1ODA4NTQsImV4cCI6MjA3MTE1Njg1NH0.M
   ```

2. **Environment**: Select "Production" and "Preview"

### Step 4: Deploy

1. **Click "Deploy"**
2. **Wait for Build**: Vercel will build your project
3. **Check Build Logs**: Ensure no errors occur

## 🔧 Build Configuration

Your project is already configured for production:

- ✅ **Next.js 14** with App Router
- ✅ **TypeScript** support
- ✅ **Tailwind CSS** configured
- ✅ **Image optimization** for Supabase storage
- ✅ **Environment variables** ready
- ✅ **Build optimizations** enabled

## 🌐 Post-Deployment

### 1. **Custom Domain** (Optional)
- Go to your Vercel project
- Click "Domains"
- Add your custom domain
- Configure DNS records

### 2. **Environment Variables for Different Branches**
- **Production**: `main` branch
- **Preview**: Other branches
- **Development**: Local development

### 3. **Automatic Deployments**
- Every push to `main` = Production deployment
- Every push to other branches = Preview deployment
- Pull requests = Preview deployment

## 🚨 Common Issues & Solutions

### Issue 1: Build Fails
**Solution**: Check build logs in Vercel dashboard

### Issue 2: Environment Variables Not Working
**Solution**: Ensure variables are added to Vercel dashboard

### Issue 3: Images Not Loading
**Solution**: Verify Supabase storage bucket is public

### Issue 4: Database Connection Issues
**Solution**: Check Supabase RLS policies and network access

## 📱 Testing Your Deployment

1. **Test Homepage**: Visit your Vercel URL
2. **Test Admin Login**: Go to `/admin/login`
3. **Test Item Submission**: Go to `/submit`
4. **Test Admin Panel**: Login and check all features

## 🔄 Continuous Deployment

### Automatic Deployments
- **Push to main** → Auto-deploy to production
- **Push to feature branch** → Auto-deploy to preview
- **Pull Request** → Auto-deploy to preview

### Manual Deployments
- Use Vercel dashboard for manual deployments
- Rollback to previous versions if needed

## 📊 Monitoring & Analytics

### Vercel Analytics
- Page views
- Performance metrics
- Error tracking
- User behavior

### Supabase Dashboard
- Database performance
- API usage
- Storage usage
- Authentication logs

## 🛡️ Security Considerations

### Environment Variables
- ✅ Never commit `.env.local` to Git
- ✅ Use Vercel's environment variable system
- ✅ Different variables for different environments

### Supabase Security
- ✅ RLS policies configured
- ✅ API keys are public (safe for client-side)
- ✅ Admin authentication required

## 💰 Cost Considerations

### Vercel
- **Hobby Plan**: Free (100GB bandwidth/month)
- **Pro Plan**: $20/month (1TB bandwidth/month)
- **Enterprise**: Custom pricing

### Supabase
- **Free Tier**: 500MB database, 1GB storage
- **Pro Plan**: $25/month (8GB database, 100GB storage)

## 🎯 Next Steps After Deployment

1. **Test all functionality**
2. **Set up custom domain** (if desired)
3. **Configure monitoring**
4. **Set up backups**
5. **Plan scaling strategy**

## 📞 Support

- **Vercel Support**: [vercel.com/support](https://vercel.com/support)
- **Supabase Support**: [supabase.com/support](https://supabase.com/support)
- **Next.js Documentation**: [nextjs.org/docs](https://nextjs.org/docs)

---

**🎉 Congratulations!** Your ecommerce store is now live on Vercel with Supabase as the backend!
