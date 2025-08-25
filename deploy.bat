@echo off
chcp 65001 >nul
echo 🚀 Starting deployment process...

REM Check if git is initialized
if not exist ".git" (
    echo 📁 Initializing Git repository...
    git init
)

REM Check if remote origin exists
git remote get-url origin >nul 2>&1
if errorlevel 1 (
    echo ⚠️  No remote origin found!
    echo Please add your GitHub repository as remote origin:
    echo git remote add origin https://github.com/YOUR_USERNAME/kamkunji-ndogo.git
    echo.
    echo Then run this script again.
    pause
    exit /b 1
)

REM Check if there are uncommitted changes
git diff --quiet
if errorlevel 1 (
    echo 📝 Committing changes...
    git add .
    git commit -m "Deploy to Vercel - %date% %time%"
)

REM Push to GitHub
echo 📤 Pushing to GitHub...
git push origin main

echo.
echo ✅ Code pushed to GitHub successfully!
echo.
echo 🌐 Next steps:
echo 1. Go to https://vercel.com
echo 2. Sign in with GitHub
echo 3. Click 'New Project'
echo 4. Import your 'kamkunji-ndogo' repository
echo 5. Add environment variables:
echo    - NEXT_PUBLIC_SUPABASE_URL
echo    - NEXT_PUBLIC_SUPABASE_ANON_KEY
echo 6. Click 'Deploy'
echo.
echo 📚 See VERCEL-DEPLOYMENT.md for detailed instructions
echo.
echo 🎉 Happy deploying!
pause
