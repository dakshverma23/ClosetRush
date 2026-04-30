#!/bin/bash

# ClosetRush Quick Demo Setup Script
# This script automates the demo preparation process

echo "╔════════════════════════════════════════════════════════════╗"
echo "║        ClosetRush Investor Demo - Quick Setup             ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: Check if MongoDB is running
echo -e "${BLUE}[1/5]${NC} Checking MongoDB connection..."
if mongosh --eval "db.adminCommand('ping')" > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} MongoDB is running"
else
    echo -e "${RED}✗${NC} MongoDB is not running"
    echo -e "${YELLOW}Please start MongoDB and run this script again${NC}"
    exit 1
fi

# Step 2: Seed demo data
echo ""
echo -e "${BLUE}[2/5]${NC} Seeding demo data..."
node scripts/seedDemoData.js
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓${NC} Demo data seeded successfully"
else
    echo -e "${RED}✗${NC} Failed to seed demo data"
    exit 1
fi

# Step 3: Display credentials
echo ""
echo -e "${BLUE}[3/5]${NC} Demo credentials ready:"
echo ""
echo "┌─────────────────────────────────────────────────────────┐"
echo "│  ADMIN                                                  │"
echo "│  Email: admin@closetrush.com                           │"
echo "│  Password: Admin@123                                   │"
echo "│  URL: http://localhost:3000/admin/dashboard            │"
echo "└─────────────────────────────────────────────────────────┘"
echo ""
echo "┌─────────────────────────────────────────────────────────┐"
echo "│  WAREHOUSE MANAGER                                      │"
echo "│  Email: warehouse@closetrush.com                       │"
echo "│  Password: Warehouse@123                               │"
echo "│  URL: http://localhost:3000/warehouse/dashboard        │"
echo "└─────────────────────────────────────────────────────────┘"
echo ""
echo "┌─────────────────────────────────────────────────────────┐"
echo "│  LOGISTICS PARTNER                                      │"
echo "│  Email: logistics@closetrush.com                       │"
echo "│  Password: Logistics@123                               │"
echo "│  URL: http://localhost:3000/logistics/dashboard        │"
echo "└─────────────────────────────────────────────────────────┘"
echo ""
echo "┌─────────────────────────────────────────────────────────┐"
echo "│  CUSTOMER                                               │"
echo "│  Email: customer@demo.com                              │"
echo "│  Password: Customer@123                                │"
echo "│  URL: http://localhost:3000/dashboard                  │"
echo "└─────────────────────────────────────────────────────────┘"

# Step 4: Check if servers are running
echo ""
echo -e "${BLUE}[4/5]${NC} Checking servers..."

# Check backend
if curl -s http://localhost:5000/health > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Backend server is running (port 5000)"
else
    echo -e "${YELLOW}⚠${NC} Backend server is not running"
    echo -e "${YELLOW}  Please run: npm start${NC}"
fi

# Check frontend
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Frontend server is running (port 3000)"
else
    echo -e "${YELLOW}⚠${NC} Frontend server is not running"
    echo -e "${YELLOW}  Please run: cd frontend && npm start${NC}"
fi

# Step 5: Open demo guide
echo ""
echo -e "${BLUE}[5/5]${NC} Opening demo guide..."
if [ -f "DEMO_GUIDE.md" ]; then
    echo -e "${GREEN}✓${NC} Demo guide available at: DEMO_GUIDE.md"
    echo -e "${GREEN}✓${NC} Checklist available at: DEMO_CHECKLIST.md"
    echo -e "${GREEN}✓${NC} Visual flow available at: DEMO_FLOW_VISUAL.md"
else
    echo -e "${YELLOW}⚠${NC} Demo guide not found"
fi

# Final message
echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                  SETUP COMPLETE! 🚀                        ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo -e "${GREEN}Next steps:${NC}"
echo "1. Open 4 browser tabs with the URLs above"
echo "2. Login to each account"
echo "3. Follow the DEMO_GUIDE.md for the complete flow"
echo ""
echo -e "${BLUE}Quick Reference - SKU Codes:${NC}"
echo "  BS0001, BS0002, PC0003, PC0004, TW0005"
echo ""
echo -e "${BLUE}Quick Reference - Delivery Address:${NC}"
echo "  Building: Sunrise Apartments"
echo "  Floor: 3"
echo "  Room: 304"
echo ""
echo -e "${YELLOW}Good luck with your investor demo! 🎯${NC}"
echo ""
