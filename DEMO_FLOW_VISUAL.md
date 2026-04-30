# 🎯 ClosetRush Order Flow - Visual Guide

## Complete 8-Stage Order Lifecycle

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         ORDER LIFECYCLE FLOW                             │
└─────────────────────────────────────────────────────────────────────────┘

┌──────────────┐
│   STAGE 1    │  👤 ADMIN
│   PENDING    │  ─────────────────────────────────────────────────────
└──────┬───────┘  Action: Assign order to warehouse manager
       │          Input:  Select warehouse manager from dropdown
       │          Output: Order assigned to John Warehouse
       ▼
┌──────────────────────┐
│      STAGE 2         │  👷 WAREHOUSE MANAGER
│ ASSIGNED_TO_WAREHOUSE│  ─────────────────────────────────────────────
└──────┬───────────────┘  Action: Build bundles with SKU codes
       │                  Input:  Enter 5 SKU codes + Bag ID
       │                  - BS0001 (Bedsheet)
       │                  - BS0002 (Bedsheet)
       │                  - PC0003 (Pillow Cover)
       │                  - PC0004 (Pillow Cover)
       │                  - TW0005 (Towel)
       │                  - Bag ID: BAG001
       │                  Output: Bundles built, inventory updated
       ▼
┌──────────────┐
│   STAGE 3    │  👷 WAREHOUSE MANAGER
│    PACKED    │  ─────────────────────────────────────────────────────
└──────┬───────┘  Action: Mark ready for pickup
       │          Input:  Click "Mark Ready to Hand Over"
       │          Output: Order ready for logistics assignment
       ▼
┌──────────────────────┐
│    STAGE 3.5         │  👷 WAREHOUSE MANAGER (OPTIONAL)
│  QUALITY CHECK       │  ─────────────────────────────────────────────
└──────┬───────────────┘  Action: Submit quality check report
       │                  Input:  For each SKU:
       │                  - Select SKU code from dropdown
       │                  - Upload 1-2 photos
       │                  - Overall condition: Good
       │                  - Notes: "All items inspected"
       │                  Output: QC report shared with admin + customer
       │                  ⭐ KEY FEATURE: Builds trust & transparency
       ▼
┌──────────────────────┐
│      STAGE 4         │  👷 WAREHOUSE MANAGER
│ READY_FOR_PICKUP    │  ─────────────────────────────────────────────
└──────┬───────────────┘  Action: Assign logistics partner
       │                  Input:  Select Sarah Logistics from dropdown
       │                  Output: Logistics partner assigned
       │                  ⭐ NEW FEATURE: Warehouse assigns directly!
       ▼
┌──────────────────────┐
│      STAGE 5         │  🚚 LOGISTICS PARTNER
│ ASSIGNED_TO_LOGISTICS│  ─────────────────────────────────────────────
└──────┬───────────────┘  Action: Mark out for delivery
       │                  Input:  Click "Mark Out for Delivery"
       │                  Output: Order in transit
       ▼
┌──────────────────────┐
│      STAGE 6         │  🚚 LOGISTICS PARTNER
│  OUT_FOR_DELIVERY    │  ─────────────────────────────────────────────
└──────┬───────────────┘  Action: Submit delivery form
       │                  Input:  - Upload 2-3 delivery photos
       │                          - Building: Sunrise Apartments
       │                          - Floor: 3
       │                          - Room: 304
       │                  Output: Delivery documented with photos
       ▼
┌──────────────────────┐
│      STAGE 7         │  👤 ADMIN
│   UNDER_REVIEW       │  ─────────────────────────────────────────────
└──────┬───────────────┘  Action: Review and approve delivery
       │                  Input:  Review photos and address
       │                  Output: Delivery approved
       │                  
       │                  Alternative: Reject with reason
       │                  └──> Reverts to OUT_FOR_DELIVERY
       ▼
┌──────────────────────┐
│      STAGE 8         │  ✅ COMPLETE
│     DELIVERED        │  ─────────────────────────────────────────────
└──────────────────────┘  Customer sees: "Delivered" status
                          Order complete!
```

---

## Role Responsibilities Matrix

```
┌─────────────────────┬───────┬───────────┬───────────┬──────────┐
│      STAGE          │ ADMIN │ WAREHOUSE │ LOGISTICS │ CUSTOMER │
├─────────────────────┼───────┼───────────┼───────────┼──────────┤
│ 1. Pending          │   ✓   │           │           │    👁    │
│ 2. Assigned to WH   │   👁  │     ✓     │           │    👁    │
│ 3. Packed           │   👁  │     ✓     │           │    👁    │
│ 3.5 Quality Check   │   👁  │     ✓     │           │    👁    │
│ 4. Ready for Pickup │   👁  │     ✓     │           │    👁    │
│ 5. Assigned to LOG  │   👁  │     👁    │     ✓     │    👁    │
│ 6. Out for Delivery │   👁  │     👁    │     ✓     │    👁    │
│ 7. Under Review     │   ✓   │     👁    │     👁    │    👁    │
│ 8. Delivered        │   👁  │     👁    │     👁    │    ✓    │
└─────────────────────┴───────┴───────────┴───────────┴──────────┘

Legend:
✓ = Can take action
👁 = Can view only
```

---

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        DATA FLOW                                 │
└─────────────────────────────────────────────────────────────────┘

    ORDER CREATION
         │
         ▼
    ┌─────────┐
    │  ORDER  │ ◄─── userId, subscriptionId, bundleId
    └────┬────┘
         │
         ├──► assignedWarehouseManagerId (Stage 1)
         │
         ├──► builtBundles[] (Stage 2)
         │    └─ bundleId, skuCodes[], bagId
         │
         ├──► QUALITY CHECK (Stage 3.5)
         │    └─ orderId, userId, skuPhotos[]
         │       └─ skuCode, photos[]
         │
         ├──► assignedLogisticsPartnerId (Stage 4)
         │
         └──► deliveryForm (Stage 6)
              └─ images[], buildingName, floor, roomNumber

    INVENTORY UPDATES
         │
         ├──► in_stock → bundleBuiltId (Stage 2)
         │
         └──► in_stock → out_of_stock (Stage 5)
```

---

## Quality Check Flow (Detailed)

```
┌─────────────────────────────────────────────────────────────────┐
│                    QUALITY CHECK PROCESS                         │
└─────────────────────────────────────────────────────────────────┘

STEP 1: Warehouse Manager opens Quality Check page
        └─ Shows all PACKED orders

STEP 2: Select order
        └─ Order details displayed:
           - Customer name
           - Bundle types
           - Total quantity
           - Bag ID

STEP 3: Form generates dynamic entries
        └─ Creates N entries (N = total quantity)
           Example: 5 items ordered = 5 entry forms

STEP 4: For each entry:
        ┌─────────────────────────────────────┐
        │  ENTRY 1                            │
        ├─────────────────────────────────────┤
        │  SKU Code: [Dropdown]               │
        │  └─ Shows only:                     │
        │     - In-stock items                │
        │     - Matching bundle types         │
        │     - Available SKUs                │
        │                                     │
        │  Photos: [Upload]                   │
        │  └─ Min 1, Max 5 per SKU           │
        └─────────────────────────────────────┘

STEP 5: Additional fields
        - Overall Condition: [Dropdown]
          └─ Excellent / Good / Fair / Poor
        - Notes: [Text area]
          └─ Optional comments

STEP 6: Submit
        └─ Creates QualityCheck document
           - Linked to orderId
           - Linked to userId (customer)
           - Linked to submittedBy (warehouse manager)
           - Stored in MongoDB
           - Photos uploaded to Cloudinary

STEP 7: Sharing
        ├─ Admin can view in admin panel
        └─ Customer can view in their dashboard
```

---

## Logistics Assignment Flow (New Feature)

```
┌─────────────────────────────────────────────────────────────────┐
│              WAREHOUSE ASSIGNS LOGISTICS PARTNER                 │
└─────────────────────────────────────────────────────────────────┘

OLD FLOW (Before):
    Warehouse Manager → Mark Ready → Admin → Assign Logistics
    └─ 2 steps, admin bottleneck

NEW FLOW (After):
    Warehouse Manager → Mark Ready → Assign Logistics Directly
    └─ 1 step, faster handoff

IMPLEMENTATION:
    ┌──────────────────────────────────────┐
    │  Ready to Hand Over Tab              │
    ├──────────────────────────────────────┤
    │  Order #12345                        │
    │  Bundle: Premium Bedroom Bundle      │
    │  Qty: 1                              │
    │                                      │
    │  [Assign Logistics Partner] ◄─ Click│
    └──────────────────────────────────────┘
                    │
                    ▼
    ┌──────────────────────────────────────┐
    │  Assign Logistics Partner Modal      │
    ├──────────────────────────────────────┤
    │  Select Logistics Partner:           │
    │  [Dropdown] ◄─ Shows approved only   │
    │  - Sarah Logistics                   │
    │  - Mike Delivery                     │
    │  - Emma Transport                    │
    │                                      │
    │  Order Details:                      │
    │  Bundle Types: Premium Bedroom       │
    │  Quantity: 1                         │
    │                                      │
    │  [Cancel]  [Assign] ◄─ Click        │
    └──────────────────────────────────────┘
                    │
                    ▼
    POST /api/orders/:id/assign-logistics-wh
    └─ Warehouse manager can call this endpoint
       (Previously admin-only)
```

---

## Photo Documentation Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                   PHOTO DOCUMENTATION POINTS                     │
└─────────────────────────────────────────────────────────────────┘

POINT 1: Quality Check (Warehouse)
    ├─ When: After packing, before handover
    ├─ Who: Warehouse Manager
    ├─ What: Per-SKU photos
    ├─ Why: Document item condition
    └─ Shared with: Admin + Customer

POINT 2: Delivery Confirmation (Logistics)
    ├─ When: After delivery
    ├─ Who: Logistics Partner
    ├─ What: Delivery location photos
    ├─ Why: Proof of delivery
    └─ Shared with: Admin (for review)

RESULT: Triple Verification
    ✓ Warehouse documents items
    ✓ Logistics documents delivery
    ✓ Admin reviews both
    = Complete accountability chain
```

---

## Dashboard Views by Role

```
┌─────────────────────────────────────────────────────────────────┐
│                        ADMIN DASHBOARD                           │
├─────────────────────────────────────────────────────────────────┤
│  📊 Summary Stats                                               │
│  ├─ Total Orders: 45                                           │
│  ├─ Pending: 5                                                 │
│  ├─ In Progress: 25                                            │
│  └─ Delivered: 15                                              │
│                                                                 │
│  📋 Sections                                                    │
│  ├─ Pending Orders (assign to warehouse)                       │
│  ├─ Ready for Pickup (assign to logistics) ◄─ Optional now    │
│  ├─ Delivery Review (approve/reject)                           │
│  └─ Staff Approvals (warehouse + logistics)                    │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    WAREHOUSE DASHBOARD                           │
├─────────────────────────────────────────────────────────────────┤
│  📊 Summary Stats                                               │
│  ├─ Total Assigned: 8                                          │
│  ├─ Total Packed: 5                                            │
│  └─ Ready to Hand Over: 3                                      │
│                                                                 │
│  📋 Tabs                                                        │
│  ├─ Assigned Orders (build bundles)                            │
│  ├─ Packed Orders (mark ready)                                 │
│  ├─ Ready to Hand Over (assign logistics) ◄─ NEW!             │
│  └─ Quality Check (submit reports)                             │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    LOGISTICS DASHBOARD                           │
├─────────────────────────────────────────────────────────────────┤
│  📊 Summary Stats                                               │
│  ├─ Total Assigned: 6                                          │
│  ├─ Out for Delivery: 4                                        │
│  └─ Total Delivered: 12                                        │
│                                                                 │
│  📋 Tabs                                                        │
│  ├─ Assigned Orders (mark out for delivery)                    │
│  ├─ Out for Delivery (submit delivery form)                    │
│  └─ Delivery Review (view status)                              │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    CUSTOMER DASHBOARD                            │
├─────────────────────────────────────────────────────────────────┤
│  📦 My Orders                                                   │
│  ├─ Order #12345                                               │
│  │  Status: Delivered ✅                                       │
│  │  Bundle: Premium Bedroom Bundle                             │
│  │  Delivered: 2024-01-15                                      │
│  │  [View Quality Check] [View Delivery Photos]               │
│  │                                                             │
│  └─ Order #12346                                               │
│     Status: Out for Delivery 🚚                                │
│     Bundle: Premium Bedroom Bundle                             │
│     Expected: Today                                            │
└─────────────────────────────────────────────────────────────────┘
```

---

## Key Metrics for Investors

```
┌─────────────────────────────────────────────────────────────────┐
│                      SYSTEM METRICS                              │
└─────────────────────────────────────────────────────────────────┘

TRANSPARENCY
├─ 8 distinct stages
├─ Real-time status updates
├─ Photo documentation at 2 points
└─ Customer visibility throughout

EFFICIENCY
├─ Warehouse assigns logistics directly
├─ Parallel processing (multiple managers)
├─ Automated status transitions
└─ Role-based workflows

QUALITY ASSURANCE
├─ Mandatory quality checks
├─ Per-SKU photo documentation
├─ Admin review before delivery
└─ Rejection/resubmission flow

SCALABILITY
├─ Multiple warehouse managers
├─ Multiple logistics partners
├─ Role-based access control
└─ Cloud-ready architecture

ACCOUNTABILITY
├─ Every action tracked
├─ Photo proof at key stages
├─ Audit trail maintained
└─ Clear responsibility chain
```

---

**This visual guide complements the DEMO_GUIDE.md and DEMO_CHECKLIST.md**
**Use it as a reference during your investor presentation! 🚀**
