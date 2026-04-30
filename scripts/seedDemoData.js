/**
 * Demo Data Seeding Script for Investor Demo
 * 
 * This script creates a complete test scenario for the warehouse-logistics workflow:
 * 1. Creates test users (admin, warehouse manager, logistics partner, customer)
 * 2. Creates bundle types and inventory items
 * 3. Creates a subscription and order
 * 4. Walks through the complete order lifecycle
 * 
 * Usage: node scripts/seedDemoData.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Models
const User = require('../models/User');
const Category = require('../models/Category');
const Bundle = require('../models/Bundle');
const InventoryItem = require('../models/InventoryItem');
const Subscription = require('../models/Subscription');
const Order = require('../models/Order');

// Database connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error);
    process.exit(1);
  }
};

// Demo credentials for easy login
const DEMO_CREDENTIALS = {
  admin: {
    email: 'admin@closetrush.com',
    password: 'Admin@123',
    name: 'Demo Admin'
  },
  warehouseManager: {
    email: 'warehouse@closetrush.com',
    password: 'Warehouse@123',
    name: 'John Warehouse'
  },
  logisticsPartner: {
    email: 'logistics@closetrush.com',
    password: 'Logistics@123',
    name: 'Sarah Logistics'
  },
  customer: {
    email: 'customer@demo.com',
    password: 'Customer@123',
    name: 'Alice Customer'
  }
};

const seedDemoData = async () => {
  try {
    console.log('\n🚀 Starting Demo Data Seeding...\n');

    // ─────────────────────────────────────────────────────────────────────
    // Step 1: Clear existing demo data
    // ─────────────────────────────────────────────────────────────────────
    console.log('🧹 Cleaning existing demo data...');
    await User.deleteMany({ email: { $in: Object.values(DEMO_CREDENTIALS).map(c => c.email) } });
    await Order.deleteMany({});
    await Subscription.deleteMany({});
    await InventoryItem.deleteMany({});
    await Bundle.deleteMany({});
    await Category.deleteMany({});
    console.log('✅ Cleanup complete\n');

    // ─────────────────────────────────────────────────────────────────────
    // Step 2: Create Users
    // ─────────────────────────────────────────────────────────────────────
    console.log('👥 Creating demo users...');
    
    const hashedPassword = await bcrypt.hash('Demo@123', 10);

    // Admin
    const admin = await User.create({
      name: DEMO_CREDENTIALS.admin.name,
      email: DEMO_CREDENTIALS.admin.email,
      password: hashedPassword,
      mobile: '9999999999',
      address: 'Admin Office, ClosetRush HQ',
      userType: 'admin'
    });
    console.log(`✅ Admin created: ${admin.email}`);

    // Warehouse Manager
    const warehouseManager = await User.create({
      name: DEMO_CREDENTIALS.warehouseManager.name,
      email: DEMO_CREDENTIALS.warehouseManager.email,
      password: hashedPassword,
      mobile: '9999999998',
      address: 'Warehouse Building A',
      userType: 'warehouse_manager',
      warehouseManagerStatus: 'approved',
      warehouseManagerApprovedBy: admin._id,
      warehouseManagerApprovedAt: new Date()
    });
    console.log(`✅ Warehouse Manager created: ${warehouseManager.email}`);

    // Logistics Partner
    const logisticsPartner = await User.create({
      name: DEMO_CREDENTIALS.logisticsPartner.name,
      email: DEMO_CREDENTIALS.logisticsPartner.email,
      password: hashedPassword,
      mobile: '9999999997',
      address: 'Logistics Hub',
      userType: 'logistics_partner',
      logisticsPartnerStatus: 'approved',
      logisticsPartnerApprovedBy: admin._id,
      logisticsPartnerApprovedAt: new Date()
    });
    console.log(`✅ Logistics Partner created: ${logisticsPartner.email}`);

    // Customer
    const customer = await User.create({
      name: DEMO_CREDENTIALS.customer.name,
      email: DEMO_CREDENTIALS.customer.email,
      password: hashedPassword,
      mobile: '9999999996',
      address: 'Sunrise Apartments, Floor 3, Room 304, Bangalore',
      userType: 'individual'
    });
    console.log(`✅ Customer created: ${customer.email}\n`);

    // ─────────────────────────────────────────────────────────────────────
    // Step 3: Create Category
    // ─────────────────────────────────────────────────────────────────────
    console.log('📦 Creating categories and bundles...');
    
    const category = await Category.create({
      name: 'Bedroom Essentials',
      description: 'Essential items for bedroom hygiene',
      icon: 'bed'
    });
    console.log(`✅ Category created: ${category.name}`);

    // ─────────────────────────────────────────────────────────────────────
    // Step 4: Create Bundle
    // ─────────────────────────────────────────────────────────────────────
    const bundle = await Bundle.create({
      name: 'Premium Bedroom Bundle',
      description: 'Complete bedroom hygiene solution',
      categoryId: category._id,
      items: [
        { itemName: 'Bedsheet', quantity: 2 },
        { itemName: 'Pillow Cover', quantity: 2 },
        { itemName: 'Towel', quantity: 1 }
      ],
      pricing: {
        individual: {
          1: { price: 999, deposit: 500 },
          3: { price: 2499, deposit: 500 },
          6: { price: 4499, deposit: 500 },
          12: { price: 7999, deposit: 500 }
        }
      },
      active: true
    });
    console.log(`✅ Bundle created: ${bundle.name}\n`);

    // ─────────────────────────────────────────────────────────────────────
    // Step 5: Create Inventory Items (in stock)
    // ─────────────────────────────────────────────────────────────────────
    console.log('📋 Creating inventory items...');
    
    const inventoryItems = [];
    const itemTypes = [
      { name: 'Bedsheet', prefix: 'BS' },
      { name: 'Bedsheet', prefix: 'BS' },
      { name: 'Pillow Cover', prefix: 'PC' },
      { name: 'Pillow Cover', prefix: 'PC' },
      { name: 'Towel', prefix: 'TW' }
    ];

    for (let i = 0; i < itemTypes.length; i++) {
      const item = await InventoryItem.create({
        skuCode: `${itemTypes[i].prefix}${String(i + 1).padStart(4, '0')}`,
        itemName: itemTypes[i].name,
        bundleTypeId: bundle._id,
        status: 'in_stock',
        condition: 'excellent',
        location: 'Warehouse A - Shelf ' + (i + 1)
      });
      inventoryItems.push(item);
      console.log(`✅ Inventory item created: ${item.skuCode} - ${item.itemName}`);
    }
    console.log('');

    // ─────────────────────────────────────────────────────────────────────
    // Step 6: Create Subscription
    // ─────────────────────────────────────────────────────────────────────
    console.log('💳 Creating subscription...');
    
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 3); // 3-month subscription

    const subscription = await Subscription.create({
      userId: customer._id,
      bundleId: bundle._id,
      duration: 3,
      startDate,
      endDate,
      status: 'active',
      paymentStatus: 'paid',
      amount: 2499,
      depositAmount: 500
    });
    console.log(`✅ Subscription created: ${subscription._id}\n`);

    // ─────────────────────────────────────────────────────────────────────
    // Step 7: Create Order (pending status)
    // ─────────────────────────────────────────────────────────────────────
    console.log('📦 Creating order...');
    
    const order = await Order.create({
      userId: customer._id,
      subscriptionId: subscription._id,
      orderedBundles: [
        {
          bundleTypeId: bundle._id,
          bundleName: bundle.name,
          quantity: 1
        }
      ],
      status: 'pending',
      orderType: 'standard'
    });
    console.log(`✅ Order created: ${order._id}`);
    console.log(`   Status: ${order.status}\n`);

    // ─────────────────────────────────────────────────────────────────────
    // Summary
    // ─────────────────────────────────────────────────────────────────────
    console.log('═══════════════════════════════════════════════════════════');
    console.log('🎉 DEMO DATA SEEDING COMPLETE!');
    console.log('═══════════════════════════════════════════════════════════\n');

    console.log('📋 DEMO CREDENTIALS:\n');
    console.log('1️⃣  ADMIN LOGIN:');
    console.log(`   Email: ${DEMO_CREDENTIALS.admin.email}`);
    console.log(`   Password: ${DEMO_CREDENTIALS.admin.password}`);
    console.log(`   Dashboard: http://localhost:3000/admin/dashboard\n`);

    console.log('2️⃣  WAREHOUSE MANAGER LOGIN:');
    console.log(`   Email: ${DEMO_CREDENTIALS.warehouseManager.email}`);
    console.log(`   Password: ${DEMO_CREDENTIALS.warehouseManager.password}`);
    console.log(`   Dashboard: http://localhost:3000/warehouse/dashboard\n`);

    console.log('3️⃣  LOGISTICS PARTNER LOGIN:');
    console.log(`   Email: ${DEMO_CREDENTIALS.logisticsPartner.email}`);
    console.log(`   Password: ${DEMO_CREDENTIALS.logisticsPartner.password}`);
    console.log(`   Dashboard: http://localhost:3000/logistics/dashboard\n`);

    console.log('4️⃣  CUSTOMER LOGIN:');
    console.log(`   Email: ${DEMO_CREDENTIALS.customer.email}`);
    console.log(`   Password: ${DEMO_CREDENTIALS.customer.password}`);
    console.log(`   Dashboard: http://localhost:3000/dashboard\n`);

    console.log('═══════════════════════════════════════════════════════════');
    console.log('📖 DEMO FLOW WALKTHROUGH:');
    console.log('═══════════════════════════════════════════════════════════\n');

    console.log('STEP 1: Admin assigns order to Warehouse Manager');
    console.log('  → Login as Admin');
    console.log('  → Go to Admin Dashboard');
    console.log('  → Find pending order in "Pending Orders" section');
    console.log(`  → Assign to: ${warehouseManager.name}\n`);

    console.log('STEP 2: Warehouse Manager builds bundles');
    console.log('  → Login as Warehouse Manager');
    console.log('  → Go to Warehouse Dashboard → "Assigned Orders" tab');
    console.log('  → Click "Build Bundles"');
    console.log('  → Enter SKU codes:');
    inventoryItems.forEach(item => {
      console.log(`     - ${item.skuCode} (${item.itemName})`);
    });
    console.log('  → Enter Bag ID: BAG001\n');

    console.log('STEP 3: Warehouse Manager marks ready for pickup');
    console.log('  → Go to "Packed Orders" tab');
    console.log('  → Click "Mark Ready to Hand Over"\n');

    console.log('STEP 4: Warehouse Manager submits Quality Check');
    console.log('  → Go to "Quality Check" tab');
    console.log('  → Click "Go to Quality Check"');
    console.log('  → Select the packed order');
    console.log('  → For each SKU, select SKU code and upload photos');
    console.log('  → Submit quality check report\n');

    console.log('STEP 5: Warehouse Manager assigns Logistics Partner');
    console.log('  → Go to "Ready to Hand Over" tab');
    console.log('  → Click "Assign Logistics Partner"');
    console.log(`  → Select: ${logisticsPartner.name}\n`);

    console.log('STEP 6: Logistics Partner marks out for delivery');
    console.log('  → Login as Logistics Partner');
    console.log('  → Go to Logistics Dashboard → "Assigned Orders" tab');
    console.log('  → Click "Mark Out for Delivery"\n');

    console.log('STEP 7: Logistics Partner submits delivery form');
    console.log('  → Go to "Out for Delivery" tab');
    console.log('  → Click "Submit Delivery Form"');
    console.log('  → Upload delivery photos');
    console.log('  → Enter address: Sunrise Apartments, Floor 3, Room 304\n');

    console.log('STEP 8: Admin approves delivery');
    console.log('  → Login as Admin');
    console.log('  → Go to Admin Dashboard → "Delivery Review" section');
    console.log('  → Review delivery photos and details');
    console.log('  → Click "Approve Delivery"\n');

    console.log('STEP 9: Customer views order status');
    console.log('  → Login as Customer');
    console.log('  → Go to Individual Dashboard');
    console.log('  → See order status: "Delivered" ✅\n');

    console.log('═══════════════════════════════════════════════════════════');
    console.log('💡 TIP: All passwords are the same format for easy demo');
    console.log('═══════════════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ Error seeding demo data:', error);
    throw error;
  }
};

// Run the seeding
const run = async () => {
  await connectDB();
  await seedDemoData();
  await mongoose.connection.close();
  console.log('✅ Database connection closed');
  process.exit(0);
};

run().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
