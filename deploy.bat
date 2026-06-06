@echo off
REM BusNav Quick Deploy Script

setlocal enabledelayedexpansion

echo.
echo ╔════════════════════════════════════════════╗
echo ║   🚀 BusNav - Quick Deployment Script 🚀   ║
echo ╚════════════════════════════════════════════╝
echo.

:menu
echo Please choose what you want to do:
echo.
echo 1. Initialize Git & Push to GitHub
echo 2. Build Backend
echo 3. Build Frontend for Web
echo 4. View Deployment Instructions
echo 5. Check Readiness
echo 0. Exit
echo.
set /p choice=Enter your choice (0-5): 

if "%choice%"=="1" goto git_setup
if "%choice%"=="2" goto build_backend
if "%choice%"=="3" goto build_frontend
if "%choice%"=="4" goto show_instructions
if "%choice%"=="5" goto check_readiness
if "%choice%"=="0" goto end
goto menu

:git_setup
echo.
echo 📦 Initializing Git...
cd /d d:\BusNav\busnav
git init
echo.
set /p username="Enter your GitHub username: "
set /p email="Enter your email: "
git config user.name "%username%"
git config user.email "%email%"
git add .
git commit -m "Initial BusNav project - ready for deployment"
echo.
echo ✅ Git initialized!
echo.
echo Now visit: https://github.com/new
echo Create a repository called 'busnav' and then run:
echo   git remote add origin https://github.com/%username%/busnav.git
echo   git branch -M main
echo   git push -u origin main
echo.
pause
goto menu

:build_backend
echo.
echo 🔨 Building Backend...
cd /d d:\BusNav\busnav\backend
call npm run build
if errorlevel 1 (
    echo ❌ Backend build failed!
) else (
    echo ✅ Backend built successfully!
)
echo.
pause
goto menu

:build_frontend
echo.
echo 🎨 Building Frontend for Web...
cd /d d:\BusNav\busnav\frontend
call yarn web:build
if errorlevel 1 (
    echo ❌ Frontend build failed!
) else (
    echo ✅ Frontend built successfully!
)
echo.
pause
goto menu

:show_instructions
echo.
echo 📋 DEPLOYMENT INSTRUCTIONS
echo.
echo Step 1: Initialize Git
echo   git init
echo   git config user.name "Your Name"
echo   git config user.email "your@email.com"
echo   git add .
echo   git commit -m "Initial commit"
echo.
echo Step 2: Create GitHub Repository
echo   Visit: https://github.com/new
echo   Create public repo called "busnav"
echo.
echo Step 3: Push to GitHub
echo   git remote add origin https://github.com/YOUR_USERNAME/busnav.git
echo   git branch -M main
echo   git push -u origin main
echo.
echo Step 4: Enable GitHub Pages
echo   GitHub Repo → Settings → Pages
echo   Source: main branch, /frontend/dist folder
echo.
echo Step 5: Deploy Backend
echo   Visit: https://vercel.com/new
echo   Import your GitHub repo
echo   Set root to /backend
echo   Add DATABASE_URL and JWT_SECRET as env vars
echo.
echo Step 6: Update Frontend API URL
echo   frontend/.env: EXPO_PUBLIC_API_URL=your-vercel-url
echo   git add . && git commit -m "Update API URL" && git push
echo.
pause
goto menu

:check_readiness
echo.
echo 🔍 Checking Deployment Readiness...
echo.

if exist "d:\BusNav\busnav\backend\dist" (
    echo ✅ Backend built
) else (
    echo ❌ Backend not built - run 'Build Backend'
)

if exist "d:\BusNav\busnav\backend\node_modules" (
    echo ✅ Backend dependencies installed
) else (
    echo ❌ Backend dependencies missing
)

if exist "d:\BusNav\busnav\frontend\node_modules" (
    echo ✅ Frontend dependencies installed
) else (
    echo ❌ Frontend dependencies missing
)

if exist "d:\BusNav\busnav\.gitignore" (
    echo ✅ .gitignore configured
) else (
    echo ❌ .gitignore missing
)

if exist "d:\BusNav\busnav\README.md" (
    echo ✅ README.md created
) else (
    echo ❌ README.md missing
)

if exist "d:\BusNav\busnav\backend\vercel.json" (
    echo ✅ Vercel config created
) else (
    echo ❌ Vercel config missing
)

if exist "d:\BusNav\busnav\.github\workflows\frontend-deploy.yml" (
    echo ✅ GitHub Actions workflow created
) else (
    echo ❌ GitHub Actions missing
)

echo.
pause
goto menu

:end
echo.
echo 👋 Thanks for using BusNav Deployment Helper!
echo.
pause
