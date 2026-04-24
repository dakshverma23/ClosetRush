# Bundle Image Upload Feature

## Overview
Added Cloudinary image upload functionality for bundles, allowing admins to upload and manage bundle images that are displayed on the public-facing pages.

## Changes Made

### Backend Changes

1. **Cloudinary Configuration** (`config/cloudinary.js`)
   - Configured Cloudinary with multer storage
   - Set up image upload with automatic resizing (800x800)
   - Folder: `closet-rush/bundles`
   - Allowed formats: jpg, jpeg, png, webp
   - File size limit: 5MB

2. **Bundle Routes** (`routes/bundles.js`)
   - Added multer middleware to POST and PUT routes
   - Added new endpoint: `POST /api/bundles/upload-image`

3. **Bundle Controller** (`controllers/bundleController.js`)
   - Updated `createBundle` to handle file uploads via `req.file`
   - Updated `updateBundle` to handle file uploads
   - Added `uploadImage` function for standalone image uploads

4. **Dependencies**
   - Installed `multer-storage-cloudinary` package

### Frontend Changes

1. **Admin Dashboard** (`frontend/src/pages/dashboards/AdminDashboard.js`)
   - Added image upload field in bundle form
   - Added image preview functionality
   - Added state management for bundle images:
     - `bundleImage`: stores the file object
     - `bundleImagePreview`: stores the preview URL
   - Updated form submission to use FormData for multipart uploads
   - Added Upload and Image components from Ant Design

2. **What We Offer Page** (`frontend/src/pages/public/WhatWeOfferNew.jsx`)
   - Created new page with modern design matching homepage theme
   - Displays bundle images from Cloudinary
   - Fallback design for bundles without images
   - Responsive grid layout
   - Features section highlighting service benefits

3. **Bundles Management Page** (`frontend/src/pages/admin/BundlesManagementPage.js`)
   - Created dedicated admin page for bundle management
   - Full CRUD operations with image upload
   - Table view with image thumbnails
   - Toggle active/inactive status

4. **App Routes** (`frontend/src/App.js`)
   - Added route: `/admin/bundles` for BundlesManagementPage
   - Imported new components

## Environment Variables

Already configured in `.env`:
```
CLOUDINARY_CLOUD_NAME=dnuucbhwa
CLOUDINARY_API_KEY=889645343633891
CLOUDINARY_API_SECRET=eno0-i1SygXtnmVOCur5HSfdoUc
```

## How to Use

### For Admins:

1. **Navigate to Admin Dashboard**
   - Go to `/admin/dashboard`
   - Click on "Bundles" tab or navigate to `/admin/bundles`

2. **Add New Bundle with Image**
   - Click "Add Bundle" button
   - Fill in bundle details (name, description, price, etc.)
   - Click on the image upload area
   - Select an image from your computer (jpg, png, webp)
   - Image will be previewed immediately
   - Add bundle items (categories and quantities)
   - Click "Create Bundle" or "Update Bundle"

3. **Edit Existing Bundle**
   - Click "Edit" button on any bundle
   - Current image will be displayed if exists
   - Upload new image to replace (optional)
   - Click "Remove Image" to delete current image
   - Update other fields as needed
   - Click "Update Bundle"

### For Users:

1. **View Bundles**
   - Navigate to "What We Offer" page
   - See all active bundles with their images
   - Images are displayed in a modern card layout
   - Click "Subscribe Now" to start subscription

## Image Guidelines

- **Recommended Size**: 800x800 pixels (automatically resized)
- **Format**: JPG, PNG, or WebP
- **Max File Size**: 5MB
- **Aspect Ratio**: Square (1:1) works best
- **Content**: Clear product photos showing the bundle items

## API Endpoints

### Upload Image (Standalone)
```
POST /api/bundles/upload-image
Headers: Authorization: Bearer <token>
Body: multipart/form-data with 'image' field
Response: { success: true, imageUrl: "cloudinary_url" }
```

### Create Bundle with Image
```
POST /api/bundles
Headers: Authorization: Bearer <token>
Body: multipart/form-data
  - name: string
  - description: string
  - price: number
  - securityDeposit: number
  - billingCycle: string
  - items: JSON string
  - image: file (optional)
```

### Update Bundle with Image
```
PUT /api/bundles/:id
Headers: Authorization: Bearer <token>
Body: multipart/form-data (same as create)
```

## Testing

1. **Test Image Upload**
   ```bash
   # Start backend
   npm run dev
   
   # Start frontend
   cd frontend
   npm start
   ```

2. **Test Flow**
   - Login as admin
   - Create a new bundle with an image
   - Verify image appears in admin dashboard
   - Check public "What We Offer" page
   - Verify image displays correctly
   - Edit bundle and change image
   - Verify new image replaces old one

## Troubleshooting

### Image Not Uploading
- Check Cloudinary credentials in `.env`
- Verify file size is under 5MB
- Check file format (jpg, png, webp only)
- Check browser console for errors

### Image Not Displaying
- Verify Cloudinary URL is saved in database
- Check CORS settings
- Verify image URL is accessible
- Check browser network tab

### Form Submission Fails
- Ensure Content-Type is multipart/form-data
- Check that items are properly formatted as JSON string
- Verify all required fields are filled

## Future Enhancements

- [ ] Multiple images per bundle
- [ ] Image cropping tool
- [ ] Drag-and-drop image upload
- [ ] Bulk image upload
- [ ] Image optimization settings
- [ ] Image gallery view
- [ ] Delete images from Cloudinary when bundle is deleted
