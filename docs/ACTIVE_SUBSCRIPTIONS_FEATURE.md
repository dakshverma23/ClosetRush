# Active Subscriptions Management Feature

## Overview
This feature provides a comprehensive subscriptions management page for admin users to view, manage, and analyze all subscriptions in the system.

## Implementation Date
May 1, 2026

## Files Created/Modified

### New Files
1. **frontend/src/pages/admin/ActiveSubscriptionsPage.js**
   - Complete subscriptions management page
   - Displays all subscriptions with detailed information
   - Provides filtering, sorting, and export capabilities
   - Allows admins to pause, resume, and cancel subscriptions

### Modified Files
1. **frontend/src/App.js**
   - Added import for `ActiveSubscriptionsPage`
   - Added route `/admin/subscriptions` with admin-only protection

2. **frontend/src/pages/dashboards/AdminDashboard.js**
   - Made "Active Subscriptions" card clickable
   - Added navigation to `/admin/subscriptions` on card click
   - Added `cursor-pointer` class for better UX

## Features

### 1. Statistics Dashboard
The page displays four key metrics at the top:
- **Active Subscriptions**: Count of all active subscriptions
- **Paused Subscriptions**: Count of paused subscriptions
- **Cancelled Subscriptions**: Count of cancelled subscriptions
- **Total Revenue**: Sum of all subscription prices with Monthly Recurring Revenue (MRR)

### 2. Filtering System
Users can filter subscriptions by:
- **Status**: All, Active, Paused, Cancelled
- **Date Range**: Filter by subscription creation date
- Clear filters button to reset all filters
- Real-time count of filtered vs total subscriptions

### 3. Subscriptions Table
Displays comprehensive subscription information:
- **Subscription ID**: Last 8 characters in a tag
- **User Details**: Name and email
- **Bundle Information**: Bundle name and description preview
- **Duration**: Subscription duration in months
- **Pricing**: Final price with original price (if discounted)
- **Status**: Color-coded status tags (green/orange/red)
- **Dates**: Start date and end date with sorting capability
- **Actions**: Context-aware action buttons

### 4. Action Buttons
Status-dependent actions available:
- **View**: Opens detailed modal for any subscription
- **Pause**: Available for active subscriptions
- **Resume**: Available for paused subscriptions
- **Cancel**: Available for active subscriptions (requires reason)

### 5. Detailed View Modal
Clicking "View" opens a modal showing:
- Complete subscription details
- User information (name, email, mobile)
- Bundle details (name, description)
- Pricing breakdown (original, discount, final, deposit)
- All dates (start, end, delivery, pickup)
- Cancellation details (if applicable)
- Timestamps (created, updated)

### 6. Subscription Management
Admins can perform actions:
- **Pause Subscription**: Temporarily pause an active subscription
- **Resume Subscription**: Reactivate a paused subscription
- **Cancel Subscription**: Permanently cancel with mandatory reason

### 7. Export Functionality
- **Export to CSV**: Download filtered subscriptions as CSV file
- Includes: ID, User Name, Email, Bundle, Duration, Price, Status, Dates
- Filename includes current date for easy tracking

## API Endpoints Used

### GET /api/subscriptions
- Returns all subscriptions for admin users
- Includes populated user, bundle, and property data
- Supports status and propertyId query parameters

### PATCH /api/subscriptions/:id/pause
- Pauses an active subscription
- Requires authentication and ownership/admin check

### PATCH /api/subscriptions/:id/resume
- Resumes a paused subscription
- Requires authentication and ownership/admin check

### DELETE /api/subscriptions/:id
- Cancels a subscription
- Requires cancellation reason in request body
- Requires authentication and ownership/admin check

## User Experience

### Navigation
1. Admin logs into dashboard
2. Clicks on "Active Subscriptions" card (now clickable with hover effect)
3. Redirected to `/admin/subscriptions` page
4. Can return to dashboard via "Back to Dashboard" button

### Visual Design
- Consistent with existing admin pages
- Blue/indigo gradient theme matching website
- Responsive design for mobile, tablet, and desktop
- Hover effects on cards and buttons
- Color-coded status indicators:
  - Green: Active
  - Orange: Paused
  - Red: Cancelled

### Table Features
- Pagination (15 items per page, adjustable)
- Horizontal scroll for smaller screens
- Sortable columns (dates)
- Fixed action column for easy access
- Empty state message when no subscriptions found

## Revenue Calculations

### Total Revenue
Sum of all `finalPrice` values across all subscriptions (active, paused, cancelled)

### Monthly Recurring Revenue (MRR)
Calculated only from active subscriptions:
```javascript
MRR = Σ (finalPrice / duration) for all active subscriptions
```
This gives the average monthly revenue from active subscriptions.

## Security
- Route protected with `ProtectedRoute` component
- Only accessible to users with `admin` role
- All API calls use authenticated endpoints
- Backend validates admin permissions

## Responsive Design
- Mobile: Single column layout, horizontal scroll for table
- Tablet: 2-column stats cards, optimized table
- Desktop: 4-column stats cards, full table view

## Future Enhancements (Potential)
1. Advanced analytics charts (revenue over time, churn rate)
2. Bulk actions (pause/resume multiple subscriptions)
3. Email notifications for subscription actions
4. Subscription renewal reminders
5. Revenue forecasting
6. Customer lifetime value (CLV) calculations
7. Export to PDF with detailed reports
8. Integration with payment gateway for refund processing

## Testing Checklist
- [x] Page loads without errors
- [x] Stats cards display correct counts
- [x] Filtering works correctly
- [x] Date range filter works
- [x] Table displays all subscription data
- [x] Sorting works on date columns
- [x] View modal shows complete details
- [x] Pause action works for active subscriptions
- [x] Resume action works for paused subscriptions
- [x] Cancel action requires reason and works
- [x] Export CSV downloads correct data
- [x] Navigation from dashboard works
- [x] Back button returns to dashboard
- [x] Responsive design works on all screen sizes
- [x] Only admin users can access the page

## Notes
- The existing API already supports all required functionality
- No backend changes were needed
- The feature integrates seamlessly with existing admin dashboard
- All subscription statuses are handled: active, paused, cancelled
- The page follows the same design patterns as other admin pages
