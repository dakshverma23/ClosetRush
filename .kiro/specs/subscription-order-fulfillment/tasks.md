# Tasks

## Task List

- [x] 1. Create Order model and Bundle ID constant
  - [x] 1.1 Create `constants/bundleIdFormat.js` with `BUNDLE_ID_PREFIX` and `generateBundleId(sequenceNumber)` function
  - [x] 1.2 Create `models/Order.js` with sub-schemas (`orderedBundleSchema`, `builtBundleSchema`, `deliveryFormSchema`) and the main `orderSchema` including all indexes
  - [x] 1.3 Verify the Order model exports correctly and has no Mongoose validation errors by running a quick Node.js require check

- [x] 2. Integrate Order creation into SubscriptionRequest lifecycle
  - [x] 2.1 Modify `models/SubscriptionRequest.js` — inside `createSubscription()`, after the Subscription document is saved, require and call `Order.create()` with `userId`, `subscriptionId`, `orderedBundles` (mapped from bundle items), `builtBundles: []`, and `status: 'pending'`
  - [x] 2.2 Verify the integration by checking that `processPayment` in `subscriptionRequestController.js` still returns the subscription and that the new Order is created without breaking existing tests

- [x] 3. Create in-app notification system
  - [x] 3.1 Create `models/Notification.js` with fields: `userId` (ObjectId → User, required, indexed), `message` (String, required), `orderId` (ObjectId → Order, nullable), `type` (String enum: `order_assigned`, `order_packed`, `out_for_delivery`, `delivery_under_review`, `order_delivered`, `delivery_rejected`), `read` (Boolean, default false), `createdAt` (auto timestamp)
  - [x] 3.2 Create `services/notificationService.js` with a `createNotification(userId, type, message, orderId)` helper that inserts a Notification document
  - [x] 3.3 Add `notifyOrderAssigned(pickupMemberId, order)` to `notificationService.js` — creates a notification for the assigned pickup member
  - [x] 3.4 Add `notifyOrderPacked(userId, adminId, order)` to `notificationService.js` — creates notifications for both the subscriber and admin
  - [x] 3.5 Add `notifyOutForDelivery(userId, adminId, order)` to `notificationService.js` — creates notifications for both the subscriber and admin
  - [x] 3.6 Add `notifyDeliveryUnderReview(adminId, order)` to `notificationService.js` — creates a notification for the admin
  - [x] 3.7 Add `notifyOrderDelivered(userId, order)` to `notificationService.js` — creates a notification for the subscriber
  - [x] 3.8 Add `notifyDeliveryRejected(pickupMemberId, order, reason)` to `notificationService.js` — creates a notification for the pickup member
  - [x] 3.9 Create `routes/notificationRoutes.js` with: `GET /api/notifications` (returns unread + recent notifications for the authenticated user), `PATCH /api/notifications/:id/read` (marks a single notification as read), `PATCH /api/notifications/read-all` (marks all of the user's notifications as read)
  - [x] 3.10 Register `app.use('/api/notifications', require('./routes/notificationRoutes'))` in `server.js`

- [x] 4. Create orderFulfillmentController
  - [x] 4.1 Create `controllers/orderFulfillmentController.js` with the `VALID_TRANSITIONS` map and a `guardTransition(order, expectedCurrent)` helper that throws `ApiError.badRequest` on invalid transitions
  - [x] 4.2 Implement `getOrders` — role-based filtering: admin sees all, pickup_member sees assigned orders, individual sees own orders; populate `userId` (name, email), `assignedPickupMemberId` (name, email), `subscriptionId`
  - [x] 4.3 Implement `assignOrder` — validate order is `pending`, validate target user has `pickupMemberStatus === 'approved'`, set `assignedPickupMemberId` and `status: 'assigned'`, call `notifyOrderAssigned`
  - [x] 4.4 Implement `buildBundles` — validate order is `assigned` and belongs to the authenticated pickup member; for each bundle unit validate all SKU codes exist and are `in_stock`; generate Bundle IDs using `generateBundleId`; require `bagId` per bundle unit; save `builtBundles`; set `status: 'packed'`; call `notifyOrderPacked`
  - [x] 4.5 Implement `markOutForDelivery` — validate order is `packed` and belongs to the authenticated pickup member; set `status: 'out_for_delivery'`; call `notifyOutForDelivery`
  - [x] 4.6 Implement `submitDeliveryForm` — validate order is `out_for_delivery` and belongs to the authenticated pickup member; require at least one uploaded image; require non-empty `buildingName`, `floor`, `roomNumber`; store Cloudinary URLs from `req.files`; set `status: 'under_review'`; call `notifyDeliveryUnderReview`
  - [x] 4.7 Implement `approveDelivery` — validate order is `under_review`; set `status: 'delivered'`; call `notifyOrderDelivered`
  - [x] 4.8 Implement `rejectDelivery` — validate order is `under_review`; require non-empty `rejectionReason` in request body; set `status: 'out_for_delivery'`; call `notifyDeliveryRejected`

- [x] 5. Create order routes and register in server
  - [x] 5.1 Create `routes/orderRoutes.js` with all seven routes wired to the correct middleware (`authenticate`, `requireAdmin`, `requirePickupMember`, `upload.array`) and controller handlers
  - [x] 5.2 Register `app.use('/api/orders', require('./routes/orderRoutes'))` in `server.js`
  - [x] 5.3 Verify all routes are reachable by running the server and hitting `GET /api/orders` with a valid token

- [x] 6. Write property-based and unit tests for the backend
  - [x] 6.1 Install `fast-check` as a dev dependency: `npm install --save-dev fast-check`
  - [x] 6.2 Create `tests/orderFulfillment.test.js` with unit tests for: `generateBundleId` format, `assignOrder` rejecting non-approved users, `buildBundles` rejecting empty SKU arrays and missing bag IDs, `submitDeliveryForm` rejecting missing images and missing address fields, `rejectDelivery` rejecting missing rejection reason
  - [x] 6.3 Add property-based test for **Property 1 & 2** (Order creation initialises correctly): for any subscription-like payload, created Order has `builtBundles === []`, `status === 'pending'`, and all required fields present
    - Tag: `// Feature: subscription-order-fulfillment, Property 1 & 2: Order creation initialises with empty builtBundles and pending status, and all required fields present`
  - [x] 6.4 Add property-based test for **Property 3** (Role-based order visibility): for any user role, `getOrders` returns only authorised orders
    - Tag: `// Feature: subscription-order-fulfillment, Property 3: Role-based order visibility`
  - [x] 6.5 Add property-based test for **Property 4** (Assignment requires approved pickup member): for any user with `pickupMemberStatus !== 'approved'`, assignment returns error and order is unchanged
    - Tag: `// Feature: subscription-order-fulfillment, Property 4: Assignment requires approved pickup member`
  - [x] 6.6 Add property-based test for **Property 5** (Assignment state transition): for any pending order and approved pickup member, assignment sets correct fields
    - Tag: `// Feature: subscription-order-fulfillment, Property 5: Assignment state transition`
  - [x] 6.7 Add property-based test for **Property 6** (SKU validation rejects non-in-stock items): for any SKU not in InventoryItem or not in_stock, build-bundles returns error
    - Tag: `// Feature: subscription-order-fulfillment, Property 6: SKU validation rejects non-in-stock items`
  - [x] 6.8 Add property-based test for **Property 7** (Bundle ID format matches configured pattern): for any valid bundle submission, all generated bundleIds match the regex
    - Tag: `// Feature: subscription-order-fulfillment, Property 7: Bundle ID format matches configured pattern`
  - [x] 6.9 Add property-based test for **Property 8** (Build-bundles persists bag IDs and transitions to packed): for any valid complete bundle submission, status becomes packed and bagIds are stored
    - Tag: `// Feature: subscription-order-fulfillment, Property 8: Build-bundles persists bag IDs and transitions to packed`
  - [x] 6.10 Add property-based test for **Property 9** (Out-for-delivery transition): for any packed order, markOutForDelivery sets status to out_for_delivery
    - Tag: `// Feature: subscription-order-fulfillment, Property 9: Out-for-delivery transition`
  - [x] 6.11 Add property-based test for **Property 10** (Delivery form requires all address fields): for any delivery form missing buildingName, floor, or roomNumber, returns 400
    - Tag: `// Feature: subscription-order-fulfillment, Property 10: Delivery form requires all address fields`
  - [x] 6.12 Add property-based test for **Property 11** (Delivery form submission transitions to under_review): for any valid delivery form, status becomes under_review and deliveryForm is stored
    - Tag: `// Feature: subscription-order-fulfillment, Property 11: Delivery form submission transitions to under_review`
  - [x] 6.13 Add property-based test for **Property 12** (Approve delivery transitions to delivered): for any under_review order, approveDelivery sets status to delivered
    - Tag: `// Feature: subscription-order-fulfillment, Property 12: Approve delivery transitions to delivered`
  - [x] 6.14 Add property-based test for **Property 13** (Reject delivery reverts to out_for_delivery): for any under_review order with non-empty rejection reason, rejectDelivery sets status to out_for_delivery
    - Tag: `// Feature: subscription-order-fulfillment, Property 13: Reject delivery reverts to out_for_delivery`
  - [x] 6.15 Add property-based test for **Property 14** (Invalid lifecycle transitions are rejected): for any order in status S and any endpoint not matching the valid next step, returns 400
    - Tag: `// Feature: subscription-order-fulfillment, Property 14: Invalid lifecycle transitions are rejected`
  - [x] 6.16 Add property-based test for **Property 15** (Bundle IDs visible only from out_for_delivery onward): for any order that has passed through buildBundles, builtBundles contains entries with non-empty bundleId
    - Tag: `// Feature: subscription-order-fulfillment, Property 15: Bundle IDs visible only from out_for_delivery onward`
  - [x] 6.17 Run all tests with `npm test` and confirm they pass

- [x] 7. Update PickupMemberDashboard frontend
  - [x] 7.1 Add `GET /api/orders` fetch to `PickupMemberDashboard.js` and store results in state, replacing the existing reports-only data load
  - [x] 7.2 Add summary statistics row: Total Assigned, Total Packed, Total Delivered (computed from orders state)
  - [x] 7.3 Add "Assigned Orders" section — table of orders with `status === 'assigned'`, with a "Build Bundles" button per row
  - [x] 7.4 Create Bundle Builder modal component — one section per `orderedBundles` entry, SKU code inputs, bag ID input, inline error display, submit button enabled only when all fields are valid; calls `POST /api/orders/:id/build-bundles`
  - [x] 7.5 Add "Out for Delivery" section — table of orders with `status === 'out_for_delivery'`, with a "Submit Delivery Form" button per row; also add "Mark Out for Delivery" button on packed orders
  - [x] 7.6 Create Delivery Form modal component — image upload (Ant Design Upload, min 1 image), building name, floor, room number fields; calls `POST /api/orders/:id/delivery-form` with `multipart/form-data`
  - [x] 7.7 Add "Delivery Review Status" section — table of orders with `status === 'under_review'` or `'delivered'`, read-only with status badge
  - [x] 7.8 Preserve existing "Pickup Reports" section and its data fetch unchanged

- [x] 8. Update AdminDashboard frontend
  - [x] 8.1 Add "Pending Orders" tab/panel — fetch `GET /api/orders` filtered to `status === 'pending'`; table with Order ID, User, Bundle Types, Created At, and "Assign" action button
  - [x] 8.2 Create Assign Pickup Member modal — dropdown populated from `GET /api/pickup-members?status=approved`; on confirm calls `POST /api/orders/:id/assign`
  - [x] 8.3 Add "Delivery Review" tab/panel — fetch `GET /api/orders` filtered to `status === 'under_review'`; table with Order ID, Pickup Member, Delivery Address, image thumbnails, and Approve/Reject action buttons
  - [x] 8.4 Implement full-size image preview using Ant Design `Image.PreviewGroup` for delivery images
  - [x] 8.5 Implement Reject modal — text area for rejection reason (required), on confirm calls `PATCH /api/orders/:id/reject-delivery`

- [x] 9. Update IndividualDashboard frontend
  - [x] 9.1 Add `GET /api/orders` fetch to `IndividualDashboard.js` and store results in `orders` state
  - [x] 9.2 Add "My Orders" card below the existing "My Subscriptions" card — table with Order ID, Bundle Types, Status (human-readable badge using the label mapping from the design), Bundle IDs column (shown only when status is `out_for_delivery` or later), Created At
  - [x] 9.3 Implement the status label mapping object and apply it to the Status column renderer

- [x] 10. Add in-app notification bell UI
  - [x] 10.1 Create a `NotificationBell` component in `frontend/src/components/layout/` — fetches `GET /api/notifications` on mount and on a 30-second polling interval; displays an unread count badge on a bell icon in the Navbar
  - [x] 10.2 Render a dropdown panel listing the most recent 10 notifications with message text, relative timestamp, and a read/unread indicator
  - [x] 10.3 On clicking a notification, call `PATCH /api/notifications/:id/read` and mark it read in local state; on clicking "Mark all as read" call `PATCH /api/notifications/read-all`
  - [x] 10.4 Integrate `NotificationBell` into `frontend/src/components/layout/Navbar.js` for all authenticated roles (individual, admin, pickup member)

- [ ] 11. End-to-end verification
  - [ ] 11.1 Manually walk through the full lifecycle in a local environment: create a subscription request → confirm payment → verify Order created as pending → assign pickup member → build bundles → mark out for delivery → submit delivery form → approve delivery → verify status is delivered
  - [ ] 11.2 Verify all in-app notifications appear in the notification bell for the correct users at each status transition (pickup member receives assigned notification; user and admin receive packed and out-for-delivery notifications; admin receives under-review notification; user receives delivered notification; pickup member receives rejection notification)
  - [ ] 11.3 Verify role-based access: individual user cannot call assign/build-bundles/approve endpoints; pickup member cannot call assign/approve endpoints; admin can call all endpoints
  - [ ] 11.4 Run `npm test` one final time to confirm all tests pass with no regressions
