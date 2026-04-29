# Requirements Document

## Introduction

This feature introduces a complete order fulfillment pipeline for individual subscribers on the ClosetRush platform. The current flow assigns bundle IDs at subscription time; this feature defers bundle ID assignment to the physical packing stage and introduces a structured workflow: subscription → admin review → pickup member packing → delivery → admin approval. The pipeline covers subscription order placement, bundle building by pickup members, delivery form submission with photo evidence, and admin approval to mark orders as delivered.

---

## Glossary

- **Subscription_System**: The backend service responsible for creating and managing individual user subscriptions.
- **Order**: A fulfillment record created when a user's subscription payment is confirmed, representing the physical goods to be packed and delivered.
- **Subscription_ID**: A unique identifier assigned to a user's subscription at the time of order placement, encoding which bundle types and quantities were ordered. No physical bundle IDs are assigned at this stage.
- **Bundle_ID**: A unique identifier assigned to a physical bundle at the time a pickup member packs it. Format is configurable.
- **Bag_ID**: A manually entered identifier for the bag used to carry a bundle, stored in the database upon entry.
- **Order_Status**: The current lifecycle state of an order. Valid values: `pending`, `assigned`, `packed`, `out_for_delivery`, `under_review`, `delivered`.
- **Pickup_Member**: An approved platform user of type `pickup_member` responsible for picking up goods from the warehouse, building bundles, and delivering them to subscribers.
- **Admin**: A platform user of type `admin` responsible for assigning orders to pickup members and approving delivery submissions.
- **Bundle_Builder_Form**: The form presented to a pickup member to enter SKU codes, assign a Bundle_ID, and enter a Bag_ID for each bundle in an order.
- **Delivery_Form**: The form presented to a pickup member to upload delivery photos and enter the exact delivery address for an order.
- **Delivery_Review**: The stage after a pickup member submits a Delivery_Form, during which the Admin reviews and approves the submission.
- **Notification_Service**: The backend service responsible for sending email notifications to users and admins on order status changes.
- **Cloudinary**: The third-party image storage service used to persist delivery photos.
- **Order_Fulfillment_Controller**: The backend controller handling all order fulfillment lifecycle operations.
- **Pickup_Member_Dashboard**: The React frontend page where pickup members view and act on their assigned orders.
- **Admin_Dashboard**: The React frontend page where admins manage orders, assign pickup members, and approve deliveries.
- **Individual_Dashboard**: The React frontend page where individual subscribers track their order status.

---

## Requirements

### Requirement 1: Order Creation on Subscription Confirmation

**User Story:** As an individual subscriber, I want an order to be created automatically when my subscription payment is confirmed, so that the fulfillment pipeline can begin without me taking any additional action.

#### Acceptance Criteria

1. WHEN a `SubscriptionRequest` transitions to `subscription_created` status, THE Subscription_System SHALL create an Order record linked to the resulting `Subscription_ID`, the user, and the ordered bundle types with their quantities.
2. THE Subscription_System SHALL NOT assign any Bundle_IDs to the Order at creation time.
3. THE Order SHALL be initialised with status `pending`.
4. WHEN an Order is created, THE Subscription_System SHALL make the Order visible to the Admin in the Admin_Dashboard.
5. THE Order record SHALL store: `userId`, `subscriptionId`, `orderedBundles` (array of `{ bundleTypeId, bundleName, quantity }`), `status`, `assignedPickupMemberId`, `createdAt`, and `updatedAt`.

---

### Requirement 2: Admin Assigns Order to Pickup Member

**User Story:** As an admin, I want to assign a pending order to a specific pickup member, so that the pickup member knows which order to pick up from the warehouse and pack.

#### Acceptance Criteria

1. WHEN an Order has status `pending`, THE Admin_Dashboard SHALL display the Order with an option to assign it to an approved Pickup_Member.
2. WHEN the Admin selects a Pickup_Member and confirms the assignment, THE Order_Fulfillment_Controller SHALL update the Order's `assignedPickupMemberId` and set the Order status to `assigned`.
3. IF the selected user does not have `pickupMemberStatus` equal to `approved`, THEN THE Order_Fulfillment_Controller SHALL reject the assignment and return an error.
4. WHEN an Order status changes to `assigned`, THE Notification_Service SHALL send an email notification to the assigned Pickup_Member containing the Order details (User ID, Subscription ID, bundle types, and quantities).
5. THE Admin_Dashboard SHALL display the assigned Pickup_Member's name alongside each Order in `assigned` status.

---

### Requirement 3: Pickup Member Views Assigned Orders

**User Story:** As a pickup member, I want to see all orders assigned to me in my dashboard, so that I know what I need to pick up and pack.

#### Acceptance Criteria

1. WHEN a Pickup_Member is authenticated, THE Pickup_Member_Dashboard SHALL display all Orders with `assignedPickupMemberId` matching the authenticated user's ID.
2. THE Pickup_Member_Dashboard SHALL display for each Order: User ID, Subscription ID, ordered bundle types, quantities, and current Order status.
3. THE Pickup_Member_Dashboard SHALL group Orders by status (e.g., `assigned`, `packed`, `out_for_delivery`, `under_review`).
4. WHILE an Order has status `assigned`, THE Pickup_Member_Dashboard SHALL display a "Build Bundles" action button for that Order.

---

### Requirement 4: Pickup Member Builds Bundles

**User Story:** As a pickup member, I want to enter SKU codes for each item in a bundle and assign a Bundle ID and Bag ID, so that physical bundles are tracked from the warehouse to the customer.

#### Acceptance Criteria

1. WHEN a Pickup_Member opens the Bundle_Builder_Form for an Order, THE Pickup_Member_Dashboard SHALL display one bundle-building section per bundle unit in the order (e.g., if the order has 2 bundles of type A, two sections are shown).
2. THE Bundle_Builder_Form SHALL require the Pickup_Member to enter at least one SKU code per bundle unit.
3. WHEN the Pickup_Member submits a SKU code, THE Order_Fulfillment_Controller SHALL verify the SKU code exists in the InventoryItem collection and has status `in_stock`.
4. IF a submitted SKU code does not exist or is not `in_stock`, THEN THE Order_Fulfillment_Controller SHALL return a descriptive error and THE Bundle_Builder_Form SHALL display the error inline without clearing other entered values.
5. WHEN all SKU codes for a bundle unit are validated, THE Order_Fulfillment_Controller SHALL generate and assign a Bundle_ID to that bundle unit. The Bundle_ID format SHALL be configurable via a server-side constant without requiring schema changes.
6. THE Bundle_Builder_Form SHALL require the Pickup_Member to enter a `bag_id` for each bundle unit before submission is allowed.
7. WHEN a `bag_id` is entered, THE Order_Fulfillment_Controller SHALL store the `bag_id` in the Order's bundle record in the database.
8. WHEN all bundle units in an Order have validated SKU codes, assigned Bundle_IDs, and entered Bag_IDs, THE Bundle_Builder_Form SHALL enable the submit button.
9. WHEN the Pickup_Member submits the completed Bundle_Builder_Form, THE Order_Fulfillment_Controller SHALL update the Order status to `packed`.
10. WHEN an Order status changes to `packed`, THE Notification_Service SHALL send email notifications to both the subscriber (user) and the Admin confirming the order is packed.

---

### Requirement 5: Pickup Member Marks Order as Out for Delivery

**User Story:** As a pickup member, I want to update an order's status to "out for delivery" when I leave for the delivery, so that the subscriber and admin know the order is on its way.

#### Acceptance Criteria

1. WHILE an Order has status `packed`, THE Pickup_Member_Dashboard SHALL display an "Out for Delivery" action button for that Order.
2. WHEN the Pickup_Member clicks "Out for Delivery", THE Order_Fulfillment_Controller SHALL update the Order status to `out_for_delivery`.
3. WHEN an Order status changes to `out_for_delivery`, THE Notification_Service SHALL send email notifications to both the subscriber (user) and the Admin.
4. WHEN an Order status changes to `out_for_delivery`, THE Pickup_Member_Dashboard SHALL display a "Submit Delivery Form" action button for that Order.

---

### Requirement 6: Pickup Member Submits Delivery Form

**User Story:** As a pickup member, I want to submit a delivery form with photos and the exact delivery address, so that there is documented proof of delivery for admin review.

#### Acceptance Criteria

1. WHEN a Pickup_Member opens the Delivery_Form for an Order in `out_for_delivery` status, THE Pickup_Member_Dashboard SHALL display fields for: delivery images (upload), building name, floor number, and room number.
2. THE Delivery_Form SHALL require at least one delivery image before submission is allowed.
3. WHEN the Pickup_Member uploads images, THE Order_Fulfillment_Controller SHALL upload each image to Cloudinary and store the resulting URLs in the Order's delivery record.
4. THE Delivery_Form SHALL require building name, floor number, and room number fields to be non-empty before submission is allowed.
5. WHEN the Pickup_Member submits the completed Delivery_Form, THE Order_Fulfillment_Controller SHALL store the delivery address and Cloudinary image URLs in the Order record and update the Order status to `under_review`.
6. WHEN an Order status changes to `under_review`, THE Notification_Service SHALL send an email notification to the Admin indicating a delivery form is awaiting review.
7. WHILE an Order has status `under_review`, THE Pickup_Member_Dashboard SHALL display the delivery form submission as read-only with a "Pending Admin Review" indicator.

---

### Requirement 7: Admin Reviews and Approves Delivery

**User Story:** As an admin, I want to review submitted delivery forms and approve them, so that orders are officially marked as delivered and the subscriber is notified.

#### Acceptance Criteria

1. WHEN an Order has status `under_review`, THE Admin_Dashboard SHALL display the Order in a "Pending Delivery Review" section with the submitted delivery images and address details.
2. THE Admin_Dashboard SHALL allow the Admin to view each delivery image in full size.
3. WHEN the Admin approves a delivery, THE Order_Fulfillment_Controller SHALL update the Order status to `delivered`.
4. WHEN an Order status changes to `delivered`, THE Notification_Service SHALL send an email notification to the subscriber confirming their order has been delivered.
5. IF the Admin rejects a delivery submission, THEN THE Order_Fulfillment_Controller SHALL revert the Order status to `out_for_delivery` and THE Notification_Service SHALL notify the Pickup_Member with the rejection reason.
6. THE Admin_Dashboard SHALL require the Admin to provide a rejection reason before a delivery submission can be rejected.

---

### Requirement 8: Subscriber Tracks Order Status

**User Story:** As an individual subscriber, I want to see the current status of my order in my dashboard, so that I know where my delivery is in the fulfillment pipeline.

#### Acceptance Criteria

1. THE Individual_Dashboard SHALL display each Order associated with the authenticated user's subscriptions.
2. THE Individual_Dashboard SHALL display the current Order status using a human-readable label for each status value: `pending`, `assigned`, `packed`, `out_for_delivery`, `under_review`, `delivered`.
3. WHEN an Order status is `out_for_delivery` or later, THE Individual_Dashboard SHALL display the assigned Bundle_IDs for the subscriber's reference.
4. THE Individual_Dashboard SHALL reflect Order status changes within one page refresh.

---

### Requirement 9: Pickup Member Dashboard Sections

**User Story:** As a pickup member, I want a structured dashboard with clearly separated sections for each stage of the fulfillment workflow, so that I can efficiently manage my tasks without confusion.

#### Acceptance Criteria

1. THE Pickup_Member_Dashboard SHALL contain a dedicated "Assigned Orders" section listing all Orders in `assigned` status.
2. THE Pickup_Member_Dashboard SHALL contain a dedicated "Bundle Building" section where the Pickup_Member can open the Bundle_Builder_Form for any `assigned` Order.
3. THE Pickup_Member_Dashboard SHALL contain a dedicated "Out for Delivery" section listing all Orders in `out_for_delivery` status with access to the Delivery_Form.
4. THE Pickup_Member_Dashboard SHALL contain a dedicated "Delivery Review Status" section listing all Orders in `under_review` or `delivered` status.
5. THE Pickup_Member_Dashboard SHALL display summary statistics: total assigned orders, total packed orders, total delivered orders.
6. THE Pickup_Member_Dashboard SHALL preserve the existing "Pickup Reports" section for backward compatibility with the existing PickupReport workflow.

---

### Requirement 10: Order Fulfillment API

**User Story:** As a developer, I want a dedicated set of API endpoints for the order fulfillment lifecycle, so that frontend components can interact with order state in a consistent and secure way.

#### Acceptance Criteria

1. THE Order_Fulfillment_Controller SHALL expose a `GET /api/orders` endpoint that returns Orders filtered by the authenticated user's role: admins see all Orders, pickup members see their assigned Orders, individual users see their own Orders.
2. THE Order_Fulfillment_Controller SHALL expose a `POST /api/orders/:id/assign` endpoint (admin only) to assign a Pickup_Member to an Order.
3. THE Order_Fulfillment_Controller SHALL expose a `POST /api/orders/:id/build-bundles` endpoint (pickup member only) to submit bundle building data (SKU codes, Bundle_IDs, Bag_IDs) and transition the Order to `packed`.
4. THE Order_Fulfillment_Controller SHALL expose a `PATCH /api/orders/:id/out-for-delivery` endpoint (pickup member only) to transition an Order from `packed` to `out_for_delivery`.
5. THE Order_Fulfillment_Controller SHALL expose a `POST /api/orders/:id/delivery-form` endpoint (pickup member only) to submit delivery photos and address, transitioning the Order to `under_review`.
6. THE Order_Fulfillment_Controller SHALL expose a `PATCH /api/orders/:id/approve-delivery` endpoint (admin only) to approve a delivery and transition the Order to `delivered`.
7. THE Order_Fulfillment_Controller SHALL expose a `PATCH /api/orders/:id/reject-delivery` endpoint (admin only) to reject a delivery submission and revert the Order to `out_for_delivery`.
8. IF a request is made to transition an Order to a status that is not the valid next step in the lifecycle, THEN THE Order_Fulfillment_Controller SHALL return a `400 Bad Request` error with a descriptive message.
9. IF an authenticated user attempts to access or modify an Order they are not authorised to act on, THEN THE Order_Fulfillment_Controller SHALL return a `403 Forbidden` error.
