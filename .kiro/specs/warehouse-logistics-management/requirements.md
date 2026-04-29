# Requirements Document

## Introduction

This feature restructures the ClosetRush operational roles and order fulfillment pipeline to support a two-tier field operations model. The existing "Pickup Member" role is renamed to "Warehouse Manager" and takes ownership of inventory management and order packing inside the warehouse. A new "Logistics Partner" role is introduced to handle pickup from the warehouse and last-mile delivery to the end consumer. The current Pickup Member dashboard becomes the Warehouse Dashboard, and a brand-new Logistics Partner Dashboard is created with its own separate login and registration flow. The order lifecycle is extended to accommodate the handoff between the two roles. Additionally, the system gains automated renewal order creation when a subscription renews or a bundle's duration expires, so that the Logistics Partner can re-deliver a fresh bundle without manual admin intervention.

---

## Glossary

- **Warehouse_Manager**: A platform user of type `warehouse_manager` (formerly `pickup_member`) responsible for managing inventory, packing orders, and marking them ready for pickup. Must register with a `@closetrush.com` email and be approved by an Admin.
- **Logistics_Partner**: A new platform user of type `logistics_partner` responsible for picking up packed orders from the warehouse and delivering them to the end consumer. Must register with a `@closetrush.com` email and be approved by an Admin.
- **Admin**: A platform user of type `admin` responsible for assigning packing tasks to Warehouse Managers, assigning delivery tasks to Logistics Partners, approving or rejecting role registrations, and reviewing delivery submissions.
- **Warehouse_Dashboard**: The React frontend dashboard for Warehouse Managers (replaces the former Pickup Member Dashboard). Accessible at `/warehouse/dashboard`.
- **Logistics_Dashboard**: The new React frontend dashboard for Logistics Partners. Accessible at `/logistics/dashboard`.
- **Order**: A fulfillment record created when a subscription payment is confirmed or a subscription renewal/expiry triggers a new delivery cycle.
- **Order_Status**: The current lifecycle state of an Order. Valid values: `pending`, `assigned_to_warehouse`, `packed`, `ready_for_pickup`, `assigned_to_logistics`, `out_for_delivery`, `under_review`, `delivered`.
- **Renewal_Order**: An Order automatically created when a Subscription renews or its bundle duration expires, representing the delivery of a new bundle to the subscriber.
- **Bundle_Duration**: The number of months a subscriber's bundle is valid, stored in the `duration` field of the Subscription model (values: 1, 3, 6, 12).
- **Subscription_Expiry**: The point in time when a Subscription's `endDate` is reached and the bundle must be replaced.
- **Subscription_Renewal**: The event triggered when a subscriber's payment for a new subscription period is confirmed, creating a new Subscription record and a corresponding Renewal_Order.
- **Delivery_Form**: The form submitted by a Logistics Partner containing delivery photos and the exact delivery address (building name, floor, room number).
- **Delivery_Review**: The stage after a Logistics Partner submits a Delivery_Form, during which the Admin reviews and approves or rejects the submission.
- **Warehouse_Email**: The email address `warehouse@closetrush.com`, used as the sender for all Warehouse Manager-related system emails.
- **Logistics_Email**: The email address `logistics@closetrush.com`, used as the sender for all Logistics Partner-related system emails.
- **Notification_Service**: The backend service responsible for sending in-app and email notifications at each order status transition.
- **Order_Fulfillment_Controller**: The backend controller handling all order lifecycle operations.
- **Admin_Dashboard**: The React frontend page where Admins manage orders, assign roles, and approve deliveries.
- **Individual_Dashboard**: The React frontend page where individual subscribers track their order status.
- **Cloudinary**: The third-party image storage service used to persist delivery photos.
- **RBAC_Middleware**: The backend middleware enforcing role-based access control for all protected routes.

---

## Requirements

### Requirement 1: Rename Pickup Member Role to Warehouse Manager

**User Story:** As an admin, I want the existing "Pickup Member" role to be renamed to "Warehouse Manager" throughout the system, so that the terminology accurately reflects the role's responsibilities inside the warehouse.

#### Acceptance Criteria

1. THE System SHALL rename the `userType` enum value `pickup_member` to `warehouse_manager` in the User model.
2. THE System SHALL rename all associated User model fields from `pickupMemberStatus`, `pickupMemberApprovedBy`, `pickupMemberApprovedAt`, and `pickupMemberRejectionReason` to `warehouseManagerStatus`, `warehouseManagerApprovedBy`, `warehouseManagerApprovedAt`, and `warehouseManagerRejectionReason` respectively.
3. THE RBAC_Middleware SHALL rename the `requirePickupMember` guard to `requireWarehouseManager` and update it to check `userType === 'warehouse_manager'` and `warehouseManagerStatus === 'approved'`.
4. THE System SHALL update all backend routes, controllers, and services that reference `pickup_member` or `pickupMember` to use `warehouse_manager` or `warehouseManager`.
5. THE System SHALL update all frontend pages, components, and labels that display "Pickup Member" to display "Warehouse Manager".
6. WHEN a Warehouse_Manager registers, THE System SHALL require the email address to end with `@closetrush.com`.
7. THE System SHALL update the registration page route from `/pickup/register` to `/warehouse/register` and the login page route from `/pickup/login` to `/warehouse/login`.
8. THE System SHALL update the dashboard route from `/pickup/dashboard` to `/warehouse/dashboard`.
9. THE Warehouse_Dashboard SHALL preserve all existing functionality of the former Pickup Member Dashboard, including order management tabs and pickup report submission.

---

### Requirement 2: Warehouse Manager Registration and Login

**User Story:** As a warehouse manager, I want a dedicated registration and login page, so that I can create and access my account separately from regular users and logistics partners.

#### Acceptance Criteria

1. THE System SHALL provide a Warehouse Manager registration page at `/warehouse/register` where a user can submit their name, email, mobile number, password, and address.
2. WHEN a user submits the Warehouse Manager registration form, THE System SHALL validate that the email address ends with `@closetrush.com` and reject the submission with a descriptive error if it does not.
3. WHEN a valid Warehouse Manager registration is submitted, THE System SHALL create a User record with `userType: 'warehouse_manager'` and `warehouseManagerStatus: 'pending'`.
4. THE System SHALL provide a Warehouse Manager login page at `/warehouse/login` that only allows users with `userType === 'warehouse_manager'` to authenticate.
5. IF a user with `warehouseManagerStatus !== 'approved'` attempts to log in via the Warehouse Manager login page, THEN THE System SHALL reject the login with a descriptive error indicating the account is pending approval or rejected.
6. WHEN a Warehouse Manager successfully logs in, THE System SHALL redirect them to `/warehouse/dashboard`.
7. THE System SHALL send a confirmation email from `warehouse@closetrush.com` to the registrant upon successful registration submission, informing them that their account is pending admin approval.

---

### Requirement 3: Logistics Partner Registration and Login

**User Story:** As a logistics partner, I want a dedicated registration and login page separate from all other roles, so that I can create and access my account independently.

#### Acceptance Criteria

1. THE System SHALL provide a Logistics Partner registration page at `/logistics/register` where a user can submit their name, email, mobile number, password, and address.
2. WHEN a user submits the Logistics Partner registration form, THE System SHALL validate that the email address ends with `@closetrush.com` and reject the submission with a descriptive error if it does not.
3. WHEN a valid Logistics Partner registration is submitted, THE System SHALL create a User record with `userType: 'logistics_partner'` and `logisticsPartnerStatus: 'pending'`.
4. THE User model SHALL store the following Logistics Partner-specific fields: `logisticsPartnerStatus` (enum: `pending`, `approved`, `rejected`), `logisticsPartnerApprovedBy` (ObjectId ref User), `logisticsPartnerApprovedAt` (Date), and `logisticsPartnerRejectionReason` (String).
5. THE System SHALL provide a Logistics Partner login page at `/logistics/login` that only allows users with `userType === 'logistics_partner'` to authenticate.
6. IF a user with `logisticsPartnerStatus !== 'approved'` attempts to log in via the Logistics Partner login page, THEN THE System SHALL reject the login with a descriptive error indicating the account is pending approval or rejected.
7. WHEN a Logistics Partner successfully logs in, THE System SHALL redirect them to `/logistics/dashboard`.
8. THE System SHALL send a confirmation email from `logistics@closetrush.com` to the registrant upon successful registration submission, informing them that their account is pending admin approval.

---

### Requirement 4: Admin Approves and Rejects Role Registrations

**User Story:** As an admin, I want to review and approve or reject both Warehouse Manager and Logistics Partner registrations from a unified approvals page, so that I can control who operates on the platform.

#### Acceptance Criteria

1. THE Admin_Dashboard SHALL display a "Staff Approvals" section that lists all pending, approved, and rejected registrations for both Warehouse Managers and Logistics Partners.
2. THE Admin_Dashboard SHALL allow the Admin to filter the approvals list by role type (Warehouse Manager or Logistics Partner) and by status (pending, approved, rejected).
3. WHEN the Admin approves a Warehouse Manager registration, THE System SHALL set `warehouseManagerStatus` to `approved`, record `warehouseManagerApprovedBy` and `warehouseManagerApprovedAt`, and send a notification email from `warehouse@closetrush.com` to the user.
4. WHEN the Admin approves a Logistics Partner registration, THE System SHALL set `logisticsPartnerStatus` to `approved`, record `logisticsPartnerApprovedBy` and `logisticsPartnerApprovedAt`, and send a notification email from `logistics@closetrush.com` to the user.
5. WHEN the Admin rejects a registration, THE System SHALL require the Admin to provide a rejection reason before the rejection can be submitted.
6. WHEN the Admin rejects a Warehouse Manager registration, THE System SHALL set `warehouseManagerStatus` to `rejected`, store the rejection reason in `warehouseManagerRejectionReason`, and send a notification email from `warehouse@closetrush.com` to the user with the reason.
7. WHEN the Admin rejects a Logistics Partner registration, THE System SHALL set `logisticsPartnerStatus` to `rejected`, store the rejection reason in `logisticsPartnerRejectionReason`, and send a notification email from `logistics@closetrush.com` to the user with the reason.
8. THE Admin_Dashboard SHALL display the full profile details (name, email, mobile, address, registration date) of any registrant in a detail view before the Admin takes action.

---

### Requirement 5: Updated Order Lifecycle

**User Story:** As an admin, I want the order lifecycle to reflect the two-role handoff between the Warehouse Manager and the Logistics Partner, so that each role only sees and acts on the stages relevant to them.

#### Acceptance Criteria

1. THE Order model SHALL support the following status values in sequence: `pending`, `assigned_to_warehouse`, `packed`, `ready_for_pickup`, `assigned_to_logistics`, `out_for_delivery`, `under_review`, `delivered`.
2. THE Order model SHALL store `assignedWarehouseManagerId` (ObjectId ref User) for the Warehouse Manager assigned to pack the order.
3. THE Order model SHALL store `assignedLogisticsPartnerId` (ObjectId ref User) for the Logistics Partner assigned to deliver the order.
4. THE Order_Fulfillment_Controller SHALL enforce the following valid status transitions and reject any out-of-sequence transition with a `400 Bad Request` error:
   - `pending` → `assigned_to_warehouse` (Admin assigns Warehouse Manager)
   - `assigned_to_warehouse` → `packed` (Warehouse Manager builds bundles)
   - `packed` → `ready_for_pickup` (Warehouse Manager marks ready)
   - `ready_for_pickup` → `assigned_to_logistics` (Admin assigns Logistics Partner)
   - `assigned_to_logistics` → `out_for_delivery` (Logistics Partner marks out for delivery)
   - `out_for_delivery` → `under_review` (Logistics Partner submits Delivery Form)
   - `under_review` → `delivered` (Admin approves delivery)
   - `under_review` → `out_for_delivery` (Admin rejects delivery — revert)
5. THE Order_Fulfillment_Controller SHALL expose a `GET /api/orders` endpoint that returns Orders scoped by role: Admins see all Orders, Warehouse Managers see Orders where `assignedWarehouseManagerId` matches their ID, Logistics Partners see Orders where `assignedLogisticsPartnerId` matches their ID, individual users see Orders where `userId` matches their ID.

---

### Requirement 6: Admin Assigns Orders to Warehouse Manager

**User Story:** As an admin, I want to assign a pending order to a specific warehouse manager, so that the warehouse manager knows which order to pack.

#### Acceptance Criteria

1. WHEN an Order has status `pending`, THE Admin_Dashboard SHALL display the Order with an option to assign it to an approved Warehouse_Manager.
2. WHEN the Admin selects a Warehouse_Manager and confirms the assignment, THE Order_Fulfillment_Controller SHALL set `assignedWarehouseManagerId` to the selected user's ID and update the Order status to `assigned_to_warehouse`.
3. IF the selected user does not have `userType === 'warehouse_manager'` and `warehouseManagerStatus === 'approved'`, THEN THE Order_Fulfillment_Controller SHALL reject the assignment and return a `400` error.
4. WHEN an Order status changes to `assigned_to_warehouse`, THE Notification_Service SHALL send an in-app notification to the assigned Warehouse_Manager containing the Order details.

---

### Requirement 7: Warehouse Manager Packs Orders

**User Story:** As a warehouse manager, I want to build bundles for my assigned orders and mark them as ready for pickup, so that the logistics partner knows when to collect from the warehouse.

#### Acceptance Criteria

1. THE Warehouse_Dashboard SHALL display all Orders with `assignedWarehouseManagerId` matching the authenticated Warehouse_Manager's ID, grouped by status tab.
2. WHILE an Order has status `assigned_to_warehouse`, THE Warehouse_Dashboard SHALL display a "Build Bundles" action for that Order.
3. WHEN the Warehouse_Manager submits the bundle builder form with valid SKU codes and bag IDs, THE Order_Fulfillment_Controller SHALL validate each SKU code against the InventoryItem collection (must exist and have status `in_stock`), generate Bundle IDs, store the built bundles, and update the Order status to `packed`.
4. IF any submitted SKU code does not exist or is not `in_stock`, THEN THE Order_Fulfillment_Controller SHALL return a descriptive `400` error identifying the failing SKU code, and the Order status SHALL remain unchanged.
5. WHILE an Order has status `packed`, THE Warehouse_Dashboard SHALL display a "Mark Ready for Pickup" action for that Order.
6. WHEN the Warehouse_Manager clicks "Mark Ready for Pickup", THE Order_Fulfillment_Controller SHALL update the Order status to `ready_for_pickup`.
7. WHEN an Order status changes to `ready_for_pickup`, THE Notification_Service SHALL send an in-app notification to the Admin indicating the order is ready for logistics assignment.
8. THE Warehouse_Dashboard SHALL display summary statistics: total orders assigned, total orders packed, total orders marked ready for pickup.

---

### Requirement 8: Admin Assigns Orders to Logistics Partner

**User Story:** As an admin, I want to assign a ready-for-pickup order to a specific logistics partner, so that the logistics partner knows which order to collect from the warehouse and deliver.

#### Acceptance Criteria

1. WHEN an Order has status `ready_for_pickup`, THE Admin_Dashboard SHALL display the Order with an option to assign it to an approved Logistics_Partner.
2. WHEN the Admin selects a Logistics_Partner and confirms the assignment, THE Order_Fulfillment_Controller SHALL set `assignedLogisticsPartnerId` to the selected user's ID and update the Order status to `assigned_to_logistics`.
3. IF the selected user does not have `userType === 'logistics_partner'` and `logisticsPartnerStatus === 'approved'`, THEN THE Order_Fulfillment_Controller SHALL reject the assignment and return a `400` error.
4. WHEN an Order status changes to `assigned_to_logistics`, THE Notification_Service SHALL send an in-app notification to the assigned Logistics_Partner containing the Order details (subscriber address, bundle IDs, bag IDs).

---

### Requirement 9: Logistics Partner Delivers Orders

**User Story:** As a logistics partner, I want to view my assigned orders, mark them as out for delivery, and submit a delivery form with photos and address details, so that there is documented proof of delivery for admin review.

#### Acceptance Criteria

1. THE Logistics_Dashboard SHALL display all Orders with `assignedLogisticsPartnerId` matching the authenticated Logistics_Partner's ID, grouped by status tab: "Assigned", "Out for Delivery", "Delivery Review".
2. WHILE an Order has status `assigned_to_logistics`, THE Logistics_Dashboard SHALL display a "Mark Out for Delivery" action for that Order.
3. WHEN the Logistics_Partner clicks "Mark Out for Delivery", THE Order_Fulfillment_Controller SHALL update the Order status to `out_for_delivery`.
4. WHEN an Order status changes to `out_for_delivery`, THE Notification_Service SHALL send an in-app notification to the subscriber and the Admin.
5. WHILE an Order has status `out_for_delivery`, THE Logistics_Dashboard SHALL display a "Submit Delivery Form" action for that Order.
6. WHEN the Logistics_Partner opens the Delivery_Form, THE Logistics_Dashboard SHALL display fields for: delivery images (upload, minimum 1 required), building name, floor number, and room number.
7. WHEN the Logistics_Partner submits a valid Delivery_Form, THE Order_Fulfillment_Controller SHALL upload each image to Cloudinary, store the resulting URLs and address details in the Order's `deliveryForm` field, and update the Order status to `under_review`.
8. IF the Delivery_Form is submitted without at least one image or with any address field empty, THEN THE Order_Fulfillment_Controller SHALL return a `400` error and the Order status SHALL remain unchanged.
9. WHEN an Order status changes to `under_review`, THE Notification_Service SHALL send an in-app notification to the Admin indicating a delivery form is awaiting review.
10. THE Logistics_Dashboard SHALL display summary statistics: total orders assigned, total orders out for delivery, total orders delivered.

---

### Requirement 10: Admin Reviews Delivery Submissions

**User Story:** As an admin, I want to review delivery form submissions from logistics partners and approve or reject them, so that orders are officially marked as delivered and the subscriber is notified.

#### Acceptance Criteria

1. WHEN an Order has status `under_review`, THE Admin_Dashboard SHALL display the Order in a "Pending Delivery Review" section with the submitted delivery images and address details.
2. THE Admin_Dashboard SHALL allow the Admin to view each delivery image in full size.
3. WHEN the Admin approves a delivery, THE Order_Fulfillment_Controller SHALL update the Order status to `delivered`.
4. WHEN an Order status changes to `delivered`, THE Notification_Service SHALL send an in-app notification to the subscriber confirming their order has been delivered.
5. WHEN the Admin rejects a delivery, THE Admin_Dashboard SHALL require the Admin to provide a non-empty rejection reason before the rejection can be submitted.
6. WHEN the Admin rejects a delivery, THE Order_Fulfillment_Controller SHALL revert the Order status to `out_for_delivery` and THE Notification_Service SHALL send an in-app notification to the Logistics_Partner with the rejection reason.

---

### Requirement 11: Subscriber Tracks Order Status

**User Story:** As an individual subscriber, I want to see the current status of my order in my dashboard using clear, human-readable labels, so that I know where my delivery is in the fulfillment pipeline.

#### Acceptance Criteria

1. THE Individual_Dashboard SHALL display each Order associated with the authenticated user's subscriptions.
2. THE Individual_Dashboard SHALL display the current Order status using the following human-readable labels:

   | Status value | Display label |
   |---|---|
   | `pending` | Preparing Your Order |
   | `assigned_to_warehouse` | Warehouse Assigned |
   | `packed` | Packed at Warehouse |
   | `ready_for_pickup` | Ready for Pickup |
   | `assigned_to_logistics` | Delivery Partner Assigned |
   | `out_for_delivery` | Out for Delivery |
   | `under_review` | Delivery Under Review |
   | `delivered` | Delivered |

3. WHEN an Order status is `out_for_delivery` or later, THE Individual_Dashboard SHALL display the assigned Bundle IDs for the subscriber's reference.
4. THE Individual_Dashboard SHALL reflect Order status changes within one page refresh.

---

### Requirement 12: Subscription Renewal Order Creation

**User Story:** As an admin, I want the system to automatically create a new delivery order when a subscriber's subscription renews, so that the logistics partner can deliver the new bundle without manual intervention.

#### Acceptance Criteria

1. WHEN a subscriber's payment for a new subscription period is confirmed and a new Subscription record is created, THE System SHALL automatically create a Renewal_Order linked to the new Subscription record with status `pending`.
2. THE Renewal_Order SHALL store the same fields as a standard Order: `userId`, `subscriptionId`, `orderedBundles`, `status`, `assignedWarehouseManagerId`, `assignedLogisticsPartnerId`, `builtBundles`, and `deliveryForm`.
3. WHEN a Renewal_Order is created, THE Admin_Dashboard SHALL display it in the pending orders queue alongside standard orders, with a visible "Renewal" label to distinguish it from first-time delivery orders.
4. THE Renewal_Order SHALL follow the same full order lifecycle as a standard Order: `pending` → `assigned_to_warehouse` → `packed` → `ready_for_pickup` → `assigned_to_logistics` → `out_for_delivery` → `under_review` → `delivered`.
5. WHEN a Renewal_Order is created, THE Notification_Service SHALL send an in-app notification to the Admin indicating a renewal order is pending assignment.

---

### Requirement 13: Subscription Expiry Order Creation

**User Story:** As an admin, I want the system to automatically create a new delivery order when a subscriber's bundle duration expires, so that the subscriber receives a fresh bundle without needing to manually re-subscribe.

#### Acceptance Criteria

1. THE System SHALL run a scheduled background job at least once per day to check for Subscriptions where `status === 'active'` and `endDate` is within the next 24 hours.
2. WHEN the scheduled job identifies an expiring Subscription that does not already have an open (non-delivered) Renewal_Order, THE System SHALL automatically create a Renewal_Order for that Subscription with status `pending`.
3. THE Renewal_Order created by the expiry job SHALL be linked to the expiring Subscription's `userId` and `bundleId` and SHALL carry an `orderType: 'renewal'` field to distinguish it from first-time delivery orders.
4. WHEN the expiry job creates a Renewal_Order, THE Notification_Service SHALL send an in-app notification to the Admin indicating a renewal order has been auto-created due to bundle expiry.
5. IF the scheduled job fails to run or encounters an error for a specific Subscription, THEN THE System SHALL log the error with the Subscription ID and continue processing remaining Subscriptions without stopping.
6. THE System SHALL prevent duplicate Renewal_Orders: IF an open Renewal_Order already exists for a Subscription, THEN THE System SHALL NOT create another one.

---

### Requirement 14: Order Fulfillment API — Extended Endpoints

**User Story:** As a developer, I want the order fulfillment API to expose all lifecycle endpoints for the extended two-role pipeline, so that frontend dashboards can interact with order state in a consistent and secure way.

#### Acceptance Criteria

1. THE Order_Fulfillment_Controller SHALL expose `POST /api/orders/:id/assign-warehouse` (Admin only) to assign a Warehouse_Manager and transition the Order to `assigned_to_warehouse`.
2. THE Order_Fulfillment_Controller SHALL expose `POST /api/orders/:id/build-bundles` (Warehouse Manager only) to submit bundle data and transition the Order to `packed`.
3. THE Order_Fulfillment_Controller SHALL expose `PATCH /api/orders/:id/ready-for-pickup` (Warehouse Manager only) to transition the Order from `packed` to `ready_for_pickup`.
4. THE Order_Fulfillment_Controller SHALL expose `POST /api/orders/:id/assign-logistics` (Admin only) to assign a Logistics_Partner and transition the Order to `assigned_to_logistics`.
5. THE Order_Fulfillment_Controller SHALL expose `PATCH /api/orders/:id/out-for-delivery` (Logistics Partner only) to transition the Order from `assigned_to_logistics` to `out_for_delivery`.
6. THE Order_Fulfillment_Controller SHALL expose `POST /api/orders/:id/delivery-form` (Logistics Partner only) to submit delivery photos and address, transitioning the Order to `under_review`.
7. THE Order_Fulfillment_Controller SHALL expose `PATCH /api/orders/:id/approve-delivery` (Admin only) to approve a delivery and transition the Order to `delivered`.
8. THE Order_Fulfillment_Controller SHALL expose `PATCH /api/orders/:id/reject-delivery` (Admin only) to reject a delivery and revert the Order to `out_for_delivery`.
9. IF a request is made to transition an Order to a status that is not the valid next step in the lifecycle, THEN THE Order_Fulfillment_Controller SHALL return a `400 Bad Request` error with a descriptive message identifying the current status and the expected next status.
10. IF an authenticated user attempts to access or modify an Order they are not authorised to act on, THEN THE Order_Fulfillment_Controller SHALL return a `403 Forbidden` error.

---

### Requirement 15: RBAC Middleware for New Roles

**User Story:** As a developer, I want dedicated RBAC middleware guards for the Warehouse Manager and Logistics Partner roles, so that all protected routes enforce the correct role and approval status.

#### Acceptance Criteria

1. THE RBAC_Middleware SHALL expose a `requireWarehouseManager` guard that allows access only to users with `userType === 'warehouse_manager'` and `warehouseManagerStatus === 'approved'`.
2. THE RBAC_Middleware SHALL expose a `requireLogisticsPartner` guard that allows access only to users with `userType === 'logistics_partner'` and `logisticsPartnerStatus === 'approved'`.
3. IF a user with `warehouseManagerStatus !== 'approved'` attempts to access a Warehouse Manager-protected route, THEN THE RBAC_Middleware SHALL return a `403 Forbidden` error with error code `PENDING_APPROVAL` or `ACCOUNT_REJECTED` as appropriate.
4. IF a user with `logisticsPartnerStatus !== 'approved'` attempts to access a Logistics Partner-protected route, THEN THE RBAC_Middleware SHALL return a `403 Forbidden` error with error code `PENDING_APPROVAL` or `ACCOUNT_REJECTED` as appropriate.
5. THE `requireAuth` middleware SHALL be updated to include `warehouse_manager` and `logistics_partner` in the set of recognised authenticated user types.

---

### Requirement 16: Email Service Updates

**User Story:** As a developer, I want the email service to use role-appropriate sender addresses for Warehouse Manager and Logistics Partner communications, so that recipients can identify the context of each email.

#### Acceptance Criteria

1. THE Email_Service SHALL send all Warehouse Manager registration, approval, and rejection emails from `warehouse@closetrush.com`.
2. THE Email_Service SHALL send all Logistics Partner registration, approval, and rejection emails from `logistics@closetrush.com`.
3. WHEN a Warehouse_Manager's registration is approved, THE Email_Service SHALL send an approval email to the Warehouse_Manager's registered email address from `warehouse@closetrush.com`.
4. WHEN a Logistics_Partner's registration is approved, THE Email_Service SHALL send an approval email to the Logistics_Partner's registered email address from `logistics@closetrush.com`.
5. THE Email_Service SHALL expose separate helper functions for Warehouse Manager emails and Logistics Partner emails to keep sender context explicit and avoid cross-role email misconfiguration.
