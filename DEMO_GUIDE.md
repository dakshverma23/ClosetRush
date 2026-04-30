# 🎯 ClosetRush Investor Demo Guide

## Quick Setup

### 1. Seed Demo Data
```bash
node scripts/seedDemoData.js
```

This creates:
- ✅ 4 test users (Admin, Warehouse Manager, Logistics Partner, Customer)
- ✅ 1 bundle type with 5 inventory items (all in stock)
- ✅ 1 active subscription
- ✅ 1 pending order ready to process

---

## 🔐 Demo Credentials

| Role | Email | Password | Dashboard URL |
|------|-------|----------|---------------|
| **Admin** | admin@closetrush.com | Admin@123 | http://localhost:3000/admin/dashboard |
| **Warehouse Manager** | warehouse@closetrush.com | Warehouse@123 | http://localhost:3000/warehouse/dashboard |
| **Logistics Partner** | logistics@closetrush.com | Logistics@123 | http://localhost:3000/logistics/dashboard |
| **Customer** | customer@demo.com | Customer@123 | http://localhost:3000/dashboard |

---

## 📋 Complete Demo Flow (8-Stage Lifecycle)

### **Stage 1: Pending → Assigned to Warehouse**
**Actor:** Admin

1. Login as **Admin** (admin@closetrush.com)
2. Go to **Admin Dashboard**
3. Find the pending order in **"Pending Orders"** section
4. Click **"Assign"** button
5. Select **"John Warehouse"** from dropdown
6. Click **"Assign to Warehouse Manager"**

✅ **Result:** Order status changes to `assigned_to_warehouse`

---

### **Stage 2: Assigned to Warehouse → Packed**
**Actor:** Warehouse Manager

1. Login as **Warehouse Manager** (warehouse@closetrush.com)
2. Go to **Warehouse Dashboard** → **"Assigned Orders"** tab
3. Click **"Build Bundles"** on the order
4. Enter SKU codes for each item:
   - Item 1: `BS0001` (Bedsheet)
   - Item 2: `BS0002` (Bedsheet)
   - Item 3: `PC0003` (Pillow Cover)
   - Item 4: `PC0004` (Pillow Cover)
   - Item 5: `TW0005` (Towel)
5. When prompted, enter Bag ID: **`BAG001`**
6. Click **"Submit Bundles"**

✅ **Result:** Order status changes to `packed`

---

### **Stage 3: Packed → Ready for Pickup**
**Actor:** Warehouse Manager

1. Stay logged in as **Warehouse Manager**
2. Go to **"Packed Orders"** tab
3. Click **"Mark Ready to Hand Over"**

✅ **Result:** Order status changes to `ready_for_pickup`

---

### **Stage 3.5: Quality Check (Optional but Impressive!)**
**Actor:** Warehouse Manager

1. Stay logged in as **Warehouse Manager**
2. Go to **"Quality Check"** tab
3. Click **"Go to Quality Check"**
4. Find the packed order and click **"Quality Check"**
5. For each of the 5 items:
   - Select the SKU code from dropdown
   - Upload 1-2 photos (any images work for demo)
6. Select **Overall Condition**: Good
7. Add **Notes**: "All items inspected and in excellent condition"
8. Click **"Submit Quality Check"**

✅ **Result:** Quality check report created and shared with admin + customer

---

### **Stage 4: Ready for Pickup → Assigned to Logistics**
**Actor:** Warehouse Manager (New Feature!)

1. Stay logged in as **Warehouse Manager**
2. Go to **"Ready to Hand Over"** tab
3. Click **"Assign Logistics Partner"**
4. Select **"Sarah Logistics"** from dropdown
5. Click **"Assign"**

✅ **Result:** Order status changes to `assigned_to_logistics`

---

### **Stage 5: Assigned to Logistics → Out for Delivery**
**Actor:** Logistics Partner

1. Login as **Logistics Partner** (logistics@closetrush.com)
2. Go to **Logistics Dashboard** → **"Assigned Orders"** tab
3. Click **"Mark Out for Delivery"**

✅ **Result:** Order status changes to `out_for_delivery`

---

### **Stage 6: Out for Delivery → Under Review**
**Actor:** Logistics Partner

1. Stay logged in as **Logistics Partner**
2. Go to **"Out for Delivery"** tab
3. Click **"Submit Delivery Form"**
4. Upload 2-3 delivery photos (any images work for demo)
5. Enter delivery address:
   - **Building Name:** Sunrise Apartments
   - **Floor:** 3
   - **Room Number:** 304
6. Click **"Submit Delivery Form"**

✅ **Result:** Order status changes to `under_review`

---

### **Stage 7: Under Review → Delivered**
**Actor:** Admin

1. Login as **Admin** (admin@closetrush.com)
2. Go to **Admin Dashboard** → **"Delivery Review"** section
3. Review the delivery photos and address
4. Click **"Approve Delivery"**

✅ **Result:** Order status changes to `delivered`

---

### **Stage 8: Customer Views Delivered Order**
**Actor:** Customer

1. Login as **Customer** (customer@demo.com)
2. Go to **Individual Dashboard**
3. See order with status: **"Delivered"** ✅

---

## 🎯 Key Features to Highlight

### 1. **Two-Tier Operations Model**
- Clear separation between warehouse (packing) and logistics (delivery)
- Each role has dedicated dashboard and responsibilities

### 2. **Warehouse Manager Can Assign Logistics**
- **NEW:** Warehouse managers can directly assign logistics partners
- Reduces admin workload
- Faster handoff from warehouse to delivery

### 3. **Quality Check System**
- Per-SKU photo documentation
- Dropdown shows only available in-stock items
- Dynamic form based on order quantity
- Reports shared with admin and customer
- Builds trust and transparency

### 4. **8-Stage Order Lifecycle**
- Complete visibility at every stage
- Role-based access control
- Automated notifications (in-app)
- Clear handoff points

### 5. **Smart Inventory Management**
- SKU-level tracking
- Bundle building with validation
- Automatic status updates (in_stock → out_of_stock)
- Bag ID tracking for physical organization

---

## 💡 Demo Tips

### **Preparation (5 minutes before demo)**
1. Run `node scripts/seedDemoData.js`
2. Open 4 browser windows/tabs:
   - Tab 1: Admin dashboard
   - Tab 2: Warehouse dashboard
   - Tab 3: Logistics dashboard
   - Tab 4: Customer dashboard
3. Login to all 4 accounts
4. Have some sample images ready for quality check and delivery photos

### **During Demo (15-20 minutes)**
1. **Start with the problem** (2 min)
   - Traditional laundry services lack transparency
   - No visibility into order status
   - Quality concerns

2. **Show the solution** (12-15 min)
   - Walk through the complete 8-stage flow
   - Highlight the quality check feature
   - Show warehouse manager assigning logistics
   - Demonstrate real-time status updates

3. **Show customer experience** (2 min)
   - Customer sees every stage
   - Quality check photos visible
   - Delivery confirmation with photos

4. **Highlight scalability** (1-2 min)
   - Role-based access
   - Multiple warehouse managers
   - Multiple logistics partners
   - Automated workflows

### **Common Questions & Answers**

**Q: What happens if a delivery is rejected?**
A: Admin can reject with a reason, order reverts to "Out for Delivery", logistics partner gets notified and can resubmit.

**Q: Can you track individual items?**
A: Yes! Every SKU has a unique code, tracked from warehouse to delivery.

**Q: How do you prevent fraud?**
A: Quality check photos at warehouse + delivery photos + admin review = triple verification.

**Q: What if warehouse manager is unavailable?**
A: Admin can assign to any approved warehouse manager. System supports multiple managers.

**Q: Can customers see quality check photos?**
A: Yes! Quality check reports are shared with both admin and the customer.

---

## 🚀 Advanced Demo Scenarios

### **Scenario 1: Rejection Flow**
1. At Stage 7, admin clicks "Reject Delivery"
2. Enter reason: "Photos unclear, please retake"
3. Order reverts to `out_for_delivery`
4. Logistics partner sees rejection reason
5. Resubmit with better photos

### **Scenario 2: Multiple Orders**
1. Create 2-3 more orders using admin panel
2. Show warehouse manager handling multiple orders
3. Demonstrate batch processing
4. Show logistics partner with multiple deliveries

### **Scenario 3: Quality Issues**
1. During quality check, select "Fair" or "Poor" condition
2. Add detailed notes about issues
3. Show how this creates accountability
4. Admin can review before approving delivery

---

## 📊 Metrics to Mention

- **8-stage lifecycle** = Complete transparency
- **3 operational roles** = Clear responsibilities
- **Per-SKU tracking** = Item-level accountability
- **Photo documentation** = Quality assurance
- **Role-based access** = Security & privacy
- **Automated workflows** = Reduced manual work

---

## 🎬 Closing Points

1. **Scalability:** System handles multiple warehouses, managers, and logistics partners
2. **Transparency:** Customers see every step with photo proof
3. **Efficiency:** Warehouse managers can assign logistics directly
4. **Quality:** Mandatory quality checks with photo documentation
5. **Trust:** Triple verification (warehouse QC + delivery photos + admin review)

---

## 🆘 Troubleshooting

### Issue: "No orders showing"
**Solution:** Run `node scripts/seedDemoData.js` again

### Issue: "Can't login"
**Solution:** Check credentials in table above, all passwords follow same format

### Issue: "SKU codes not showing in dropdown"
**Solution:** Make sure inventory items were created (check admin inventory page)

### Issue: "Quality check form empty"
**Solution:** Order must be in "packed" status first

---

## 📞 Support

For any issues during demo preparation, check:
1. MongoDB is running
2. Backend server is running (`npm start` in root)
3. Frontend is running (`npm start` in frontend folder)
4. All environment variables are set

---

**Good luck with your investor demo! 🚀**
