@echo off
REM ClosetRush Vercel Deployment Script for Windows
REM This script helps deploy your app to Vercel

echo.
echo ========================================
echo   ClosetRush Deployment Script
echo ========================================
echo.

REM Check if git is installed
where git >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Git is not installed or not in PATH
    echo Please install Git from: https://git-scm.com/
    pause
    exit /b 1
)

echo [INFO] Checking git status...
git status --short >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Not a git repository
    pause
    exit /b 1
)

REM Check for uncommitted changes
for /f %%i in ('git status --short') do set HAS_CHANGES=1
if defined HAS_CHANGES (
    echo [WARNING] You have uncommitted changes!
    echo.
    echo Please commit them first:
    echo   git add .
    echo   git commit -m "your message"
    echo.
    pause
    exit /b 1
)

echo [OK] Git is clean
echo.

REM Check current branch
for /f "tokens=*" %%i in ('git branch --show-current') do set BRANCH=%%i
echo [INFO] Current branch: %BRANCH%

if not "%BRANCH%"=="main" (
    echo [WARNING] You're not on the main branch!
    echo.
    echo Switch to main:
    echo   git checkout main
    echo.
    pause
    exit /b 1
)

echo [OK] On main branch
echo.

REM Pull latest changes
echo [INFO] Pulling latest changes from GitHub...
git pull origin main
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to pull from GitHub
    pause
    exit /b 1
)

echo [OK] Up to date with remote
echo.

REM Push to GitHub
echo [INFO] Pushing to GitHub...
git push origin main
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to push to GitHub
    pause
    exit /b 1
)

echo [OK] Successfully pushed to GitHub
echo.
echo ========================================
echo   Deployment Triggered!
echo ========================================
echo.
echo Check deployment status at:
echo   https://vercel.com/dashboard
echo.
echo Deployment usually takes 1-3 minutes
echo.
echo Your app will be live at:
echo   https://your-app.vercel.app
echo.
echo ========================================
echo.
pause
