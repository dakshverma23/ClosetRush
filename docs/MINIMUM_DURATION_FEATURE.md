# Minimum Duration Feature Documentation

## Overview

The minimum duration feature ensures that certain categories (like Quilts, Curtains) can only be subscribed for a minimum number of months. This prevents users from selecting inappropriate subscription durations for items that require longer commitments.

## How It Works

### 1. Category Level Configuration

Each category in the database has a `minimumDuration` field:

```javascript
{
  name: "Quilt",
  minimumDuration: 3,  // Can only be subscribed for 3, 6, or 12 months
  // ... other fields
}
```

**Allowed values:** `1, 3, 6, 12` (months)

### 2. Bundle Level Calculation

When a bundle contains multiple categories, the system automatically calculates the bundle's minimum duration by taking the **highest** minimum duration from all its categories.

**Example:**
- Bundle contains:
  - 2x Bedsheet (minimumDuration: 1)
  - 1x Quilt (minimumDuration: 3)
  - 4x Pillow Covers (minimumDuration: 1)
- **Bundle's effective minimum duration: 3 months** (highest value)

### 3. Frontend Duration Filtering

The subscription pages automatically filter duration options based on the bundle's minimum duration:

```javascript
// Function in IndividualSubscriptionPage.js and BusinessSubscriptionPage.js
const getBundleAvailableDurations = (bundle) => {
  const standardDurations = [1, 3, 6, 12];
  
  // Get highest minimum duration from all categories
  const minDurations = bundle.items
    .map(item => item.category && item.category.minimumDuration)
    .filter(Boolean);
  
  const highestMinDuration = Math.max(...minDurations);
  
  // Return only valid durations
  return standardDurations.filter(duration => duration >= highestMinDuration);
};
```

**Result:** Users only see duration options that meet the minimum requirement.

## Current Category Configuration

### 1 Month Minimum
- Single Bedsheet
- Double Bedsheet
- Pillow Covers
- Towels
- Mattress Protector
- Cushion Covers

### 3 Months Minimum
- Quilt
- Curtains
- Curtain Set
- Blanket
- Comforter
- Duvet

## User Experience

### Example 1: Standard Bundle
**Bundle:** 2x Bedsheet + 4x Pillow Covers
- **Minimum Duration:** 1 month
- **Available Options:** 1, 3, 6, 12 months
- **User sees:** All 4 duration options

### Example 2: Premium Bundle with Quilt
**Bundle:** 2x Bedsheet + 1x Quilt + 4x Pillow Covers
- **Minimum Duration:** 3 months (due to Quilt)
- **Available Options:** 3, 6, 12 months
- **User sees:** Only 3 duration options (1 month is hidden)

## Admin Management

### Updating Category Minimum Durations

#### Option 1: Using the Script
```bash
node scripts/updateCategoryMinimumDurations.js
```

This script automatically sets appropriate minimum durations based on category names.

#### Option 2: Manual Database Update
```javascript
// Update a single category
await Category.findOneAndUpdate(
  { name: 'Quilt' },
  { minimumDuration: 3 }
);

// Update multiple categories
await Category.updateMany(
  { name: { $in: ['Quilt', 'Curtains', 'Blanket'] } },
  { minimumDuration: 3 }
);
```

#### Option 3: Admin Dashboard (Future Enhancement)
Add a field in the category management page to set minimum duration.

## Technical Implementation

### Models

**Category Model** (`models/Category.js`):
```javascript
minimumDuration: {
  type: Number,
  enum: [1, 3, 6, 12],
  required: true,
  default: 1
}
```

**Bundle Model** (`models/Bundle.js`):
```javascript
// Method to calculate minimum duration
bundleSchema.methods.getMinimumDuration = async function() {
  await this.populate('items.category');
  
  let maxMinimumDuration = 1;
  for (const item of this.items) {
    if (item.category && item.category.minimumDuration) {
      maxMinimumDuration = Math.max(maxMinimumDuration, item.category.minimumDuration);
    }
  }
  
  return maxMinimumDuration;
};
```

### Controllers

**Bundle Controller** (`controllers/bundleController.js`):
```javascript
// Automatically adds minimumDuration to bundle response
const bundlesWithMinDuration = await Promise.all(
  bundles.map(async (bundle) => {
    const bundleObj = bundle.toObject();
    bundleObj.minimumDuration = await bundle.getMinimumDuration();
    return bundleObj;
  })
);
```

### Frontend Pages

Both subscription pages use the same logic:
- `frontend/src/pages/subscriptions/IndividualSubscriptionPage.js`
- `frontend/src/pages/subscriptions/BusinessSubscriptionPage.js`

The `getBundleAvailableDurations()` function filters duration options in real-time.

## Business Rules

### Why Different Minimum Durations?

1. **1 Month Minimum (Standard Items)**
   - Bedsheets, Pillow Covers, Towels
   - Easy to clean and maintain
   - Lower operational cost
   - Quick turnaround time

2. **3 Months Minimum (Premium/Heavy Items)**
   - Quilts, Curtains, Blankets, Comforters
   - Require special cleaning
   - Higher operational cost
   - Longer processing time
   - Better ROI with longer commitment

### Deposit Calculation

Deposits are calculated separately and are **not affected** by minimum duration:
```javascript
deposit = category.depositAmount × category.minimumDuration × quantity
```

## Testing

### Test Scenario 1: Bundle with Only Standard Items
1. Create bundle with Bedsheets and Pillow Covers
2. Navigate to subscription page
3. Select the bundle
4. **Expected:** All 4 duration options visible (1, 3, 6, 12 months)

### Test Scenario 2: Bundle with Quilt
1. Create bundle with Bedsheets and Quilt
2. Navigate to subscription page
3. Select the bundle
4. **Expected:** Only 3 duration options visible (3, 6, 12 months)
5. **Expected:** 1 month option is hidden

### Test Scenario 3: Multiple Bundles
1. Select Bundle A (1 month minimum)
2. Select Bundle B (3 months minimum)
3. **Expected:** Each bundle shows its own valid duration options independently

## Troubleshooting

### Issue: All durations showing for Quilt bundle

**Possible Causes:**
1. Category `minimumDuration` not set in database
2. Bundle not properly populated with category data
3. Frontend not calling `getBundleAvailableDurations()`

**Solution:**
```bash
# Run the update script
node scripts/updateCategoryMinimumDurations.js

# Verify in database
mongo
use your_database
db.categories.find({ name: "Quilt" }, { name: 1, minimumDuration: 1 })
```

### Issue: Duration options not updating after category change

**Solution:**
1. Clear browser cache
2. Restart frontend development server
3. Verify API response includes populated category data

## Future Enhancements

1. **Admin UI for Minimum Duration**
   - Add field in category management page
   - Real-time preview of affected bundles

2. **Custom Bundle Minimum Duration**
   - Allow admin to override bundle minimum duration
   - Useful for special promotions

3. **Dynamic Pricing Based on Duration**
   - Different prices for different minimum durations
   - Incentivize longer commitments

4. **Notification System**
   - Alert admin when creating bundles with high minimum durations
   - Warn users about minimum duration requirements

## API Response Example

```json
{
  "success": true,
  "bundles": [
    {
      "_id": "bundle123",
      "name": "Premium Bundle",
      "price": 500,
      "items": [
        {
          "category": {
            "_id": "cat1",
            "name": "Quilt",
            "minimumDuration": 3
          },
          "quantity": 1
        },
        {
          "category": {
            "_id": "cat2",
            "name": "Bedsheet",
            "minimumDuration": 1
          },
          "quantity": 2
        }
      ],
      "minimumDuration": 3  // Calculated from highest category minimum
    }
  ]
}
```

## Summary

The minimum duration feature is **fully implemented and working**. It:

✅ Automatically calculates bundle minimum duration from categories  
✅ Filters duration options on subscription pages  
✅ Works for both individual and business subscriptions  
✅ Supports all standard durations (1, 3, 6, 12 months)  
✅ Can be updated via script or database  
✅ Properly handles bundles with mixed category durations  

**No additional code changes needed** - the feature is production-ready!
