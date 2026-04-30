@echo off
REM ClosetRush Quick Demo Setup Script (Windows)
REM This script automates the demo preparation process

echo ================================================================
echo         ClosetRush Investor Demo - Quick Setup
echo ================================================================
echo.

REM Step 1: Seed demo data
echo [1/3] Seeding demo data...
node scripts\seedDemoData.js
if %errorlevel% neq 0 (
    echo [ERROR] Failed to seed demo data
    pause
    exit /b 1
)
echo [SUCCESS] Demo data seeded successfully
echo.

REM Step 2: Display credentials
echo [2/3] Demo credentials ready:
echo.
echo ┌─────────────────────────────────────────────────────────┐
echo │  ADMIN                                                  │
echo │  Email: admin@closetrush.com                           │
echo │  Password: Admin@123                                   │
echo │  URL: http://localhost:3000/admin/dashboard            │
echo └─────────────────────────────────────────────────────────┘
echo.
echo ┌─────────────────────────────────────────────────────────┐
echo │  WAREHOUSE MANAGER                                      │
echo │  Email: warehouse@closetrush.com                       │
echo │  Password: Warehouse@123                               │
echo │  URL: http://localhost:3000/warehouse/dashboard        │
echo └─────────────────────────────────────────────────────────┘
echo.
echo ┌─────────────────────────────────────────────────────────┐
echo │  LOGISTICS PARTNER                                      │
echo │  Email: logistics@closetrush.com                       │
echo │  Password: Logistics@123                               │
echo │  URL: http://localhost:3000/logistics/dashboard        │
echo └─────────────────────────────────────────────────────────┘
echo.
echo ┌─────────────────────────────────────────────────────────┐
echo │  CUSTOMER                                               │
echo │  Email: customer@demo.com                              │
echo │  Password: Customer@123                                │
echo │  URL: http://localhost:3000/dashboard                  │
echo └─────────────────────────────────────────────────────────┘
echo.

REM Step 3: Final instructions
echo [3/3] Setup complete!
echo.
echo ================================================================
echo                   SETUP COMPLETE! 🚀
echo ================================================================
echo.
echo Next steps:
echo 1. Make sure backend is running: npm start
echo 2. Make sure frontend is running: cd frontend ^&^& npm start
echo 3. Open 4 browser tabs with the URLs above
echo 4. Login to each account
echo 5. Follow the DEMO_GUIDE.md for the complete flow
echo.
echo Quick Reference - SKU Codes:
echo   BS0001, BS0002, PC0003, PC0004, TW0005
echo.
echo Quick Reference - Delivery Address:
echo   Building: Sunrise Apartments
echo   Floor: 3
echo   Room: 304
echo.
echo Good luck with your investor demo! 🎯
echo.
pause
