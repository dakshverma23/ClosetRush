# ClosetRush API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication

All protected routes require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

---

## Authentication Endpoints

### Register User
Create a new user account.

**Endpoint:** `POST /auth/register`

**Access:** Public

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "mobile": "9876543210",
  "password": "password123",
  "address": "123 Main Street, City",
  "userType": "individual"
}
```

**Response:** `201 Created`
```json
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "mobile": "9876543210",
    "address": "123 Main Street, City",
    "userType": "individual",
    "authProvider": "email",
    "active": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Error Responses:**
- `400 Bad Request` - Missing required fields or invalid data
- `409 Conflict` - Email or mobile already exists

---

### Login with Email
Authenticate user with email and password.

**Endpoint:** `POST /auth/login`

**Access:** Public

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:** `200 OK`
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "mobile": "9876543210",
    "userType": "individual",
    "active": true
  }
}
```

**Error Responses:**
- `400 Bad Request` - Missing email or password
- `401 Unauthorized` - Invalid credentials
- `423 Locked` - Account temporarily locked (5 failed attempts)

---

### Login with Mobile
Authenticate user with mobile number and password.

**Endpoint:** `POST /auth/login/mobile`

**Access:** Public

**Request Body:**
```json
{
  "mobile": "9876543210",
  "password": "password123"
}
```

**Response:** `200 OK`
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "mobile": "9876543210",
    "userType": "individual"
  }
}
```

**Error Responses:**
- `400 Bad Request` - Missing mobile or password
- `401 Unauthorized` - Invalid credentials
- `423 Locked` - Account temporarily locked

---

### Logout
Invalidate current session.

**Endpoint:** `POST /auth/logout`

**Access:** Private (requires authentication)

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "message": "Logged out successfully"
}
```

**Error Responses:**
- `400 Bad Request` - No token provided
- `401 Unauthorized` - Invalid or expired token

---

### Google OAuth
Initiate Google OAuth flow.

**Endpoint:** `GET /auth/google`

**Access:** Public

**Description:** Redirects to Google OAuth consent screen.

---

### Google OAuth Callback
Handle Google OAuth callback.

**Endpoint:** `GET /auth/google/callback`

**Access:** Public (called by Google)

**Description:** Processes Google OAuth response and redirects to frontend with token.

**Redirect:** `{FRONTEND_URL}/auth/callback?token=<jwt_token>`

---

## Error Response Format

All errors follow this format:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {}
  }
}
```

### Common Error Codes

| Code | Status | Description |
|------|--------|-------------|
| `BAD_REQUEST` | 400 | Invalid request data |
| `UNAUTHORIZED` | 401 | Authentication required or failed |
| `TOKEN_EXPIRED` | 401 | JWT token has expired |
| `TOKEN_INVALID` | 401 | JWT token is malformed |
| `TOKEN_MISSING` | 401 | No token provided |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `EMAIL_ALREADY_EXISTS` | 409 | Email already registered |
| `MOBILE_ALREADY_EXISTS` | 409 | Mobile number already registered |
| `ACCOUNT_LOCKED` | 423 | Account temporarily locked |
| `INTERNAL_ERROR` | 500 | Server error |

---

## Rate Limiting

(To be implemented in Phase 10)

---

## Testing with cURL

### Register
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "mobile": "9876543210",
    "password": "password123",
    "address": "123 Main Street",
    "userType": "individual"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Logout
```bash
curl -X POST http://localhost:5000/api/auth/logout \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## Postman Collection

Import the following JSON into Postman for easy testing:

```json
{
  "info": {
    "name": "ClosetRush API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Auth",
      "item": [
        {
          "name": "Register",
          "request": {
            "method": "POST",
            "header": [],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"name\": \"John Doe\",\n  \"email\": \"john@example.com\",\n  \"mobile\": \"9876543210\",\n  \"password\": \"password123\",\n  \"address\": \"123 Main Street\",\n  \"userType\": \"individual\"\n}",
              "options": {
                "raw": {
                  "language": "json"
                }
              }
            },
            "url": {
              "raw": "{{baseUrl}}/auth/register",
              "host": ["{{baseUrl}}"],
              "path": ["auth", "register"]
            }
          }
        },
        {
          "name": "Login",
          "request": {
            "method": "POST",
            "header": [],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"email\": \"john@example.com\",\n  \"password\": \"password123\"\n}",
              "options": {
                "raw": {
                  "language": "json"
                }
              }
            },
            "url": {
              "raw": "{{baseUrl}}/auth/login",
              "host": ["{{baseUrl}}"],
              "path": ["auth", "login"]
            }
          }
        },
        {
          "name": "Logout",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{token}}",
                "type": "text"
              }
            ],
            "url": {
              "raw": "{{baseUrl}}/auth/logout",
              "host": ["{{baseUrl}}"],
              "path": ["auth", "logout"]
            }
          }
        }
      ]
    }
  ],
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:5000/api"
    },
    {
      "key": "token",
      "value": ""
    }
  ]
}
```


---

## Bundle Endpoints

### Get All Bundles
Get list of all subscription bundles.

**Endpoint:** `GET /bundles`

**Access:** Public (shows only active bundles) / Admin (shows all)

**Query Parameters:**
- `active` (optional) - Filter by active status (true/false)

**Response:** `200 OK`
```json
{
  "success": true,
  "count": 3,
  "bundles": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Single Bed Bundle",
      "items": {
        "singleBedsheets": 4,
        "doubleBedsheets": 0,
        "pillowCovers": 4,
        "curtains": 0
      },
      "price": 500,
      "billingCycle": "monthly",
      "description": "4 single bedsheets + 4 pillow covers delivered monthly",
      "active": true,
      "depositAmount": 500,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

---

### Get Bundle by ID
Get details of a specific bundle.

**Endpoint:** `GET /bundles/:id`

**Access:** Public

**Response:** `200 OK`
```json
{
  "success": true,
  "bundle": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Single Bed Bundle",
    "items": {
      "singleBedsheets": 4,
      "pillowCovers": 4
    },
    "price": 500,
    "billingCycle": "monthly",
    "active": true
  }
}
```

---

### Create Bundle
Create a new subscription bundle (Admin only).

**Endpoint:** `POST /bundles`

**Access:** Admin only

**Request Body:**
```json
{
  "name": "Premium Bundle",
  "items": {
    "singleBedsheets": 6,
    "doubleBedsheets": 2,
    "pillowCovers": 10,
    "curtains": 2
  },
  "price": 1500,
  "billingCycle": "monthly",
  "description": "Premium bedding package"
}
```

**Response:** `201 Created`

---

### Update Bundle
Update an existing bundle (Admin only).

**Endpoint:** `PUT /bundles/:id`

**Access:** Admin only

**Request Body:** Same as Create Bundle

**Response:** `200 OK`

---

### Toggle Bundle Status
Activate or deactivate a bundle (Admin only).

**Endpoint:** `PATCH /bundles/:id/status`

**Access:** Admin only

**Request Body:**
```json
{
  "active": false
}
```

**Response:** `200 OK`

---

## Subscription Endpoints

### Get Subscriptions
Get user's subscriptions (or all for admin).

**Endpoint:** `GET /subscriptions`

**Access:** Private

**Query Parameters:**
- `status` (optional) - Filter by status (active, paused, cancelled)
- `propertyId` (optional) - Filter by property (for business users)

**Response:** `200 OK`
```json
{
  "success": true,
  "count": 2,
  "subscriptions": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "userId": {
        "_id": "507f1f77bcf86cd799439012",
        "name": "John Doe",
        "email": "john@example.com"
      },
      "bundleId": {
        "_id": "507f1f77bcf86cd799439013",
        "name": "Single Bed Bundle",
        "price": 500
      },
      "duration": 3,
      "originalPrice": 1500,
      "discount": 75,
      "finalPrice": 1425,
      "fixedDeposit": 500,
      "status": "active",
      "startDate": "2024-01-01T00:00:00.000Z",
      "endDate": "2024-04-01T00:00:00.000Z"
    }
  ]
}
```

---

### Create Subscription
Create a new subscription.

**Endpoint:** `POST /subscriptions`

**Access:** Private

**Request Body:**
```json
{
  "bundleId": "507f1f77bcf86cd799439011",
  "duration": 3,
  "propertyId": "507f1f77bcf86cd799439012"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Subscription created successfully",
  "subscription": {
    "_id": "507f1f77bcf86cd799439011",
    "bundleId": {...},
    "duration": 3,
    "originalPrice": 1500,
    "discount": 75,
    "finalPrice": 1425,
    "fixedDeposit": 500,
    "status": "active"
  },
  "pricing": {
    "basePrice": 500,
    "duration": 3,
    "originalPrice": 1500,
    "discountPercentage": 5,
    "discountAmount": 75,
    "finalPrice": 1425,
    "monthlyEquivalent": 475
  }
}
```

---

### Pause Subscription
Pause an active subscription.

**Endpoint:** `PATCH /subscriptions/:id/pause`

**Access:** Private (owner or admin)

**Response:** `200 OK`

---

### Resume Subscription
Resume a paused subscription.

**Endpoint:** `PATCH /subscriptions/:id/resume`

**Access:** Private (owner or admin)

**Response:** `200 OK`

---

### Cancel Subscription
Cancel a subscription.

**Endpoint:** `DELETE /subscriptions/:id`

**Access:** Private (owner or admin)

**Request Body:**
```json
{
  "reason": "No longer needed"
}
```

**Response:** `200 OK`

---

## Calculation Endpoints

### Calculate Fixed Deposit
Calculate fixed deposit based on quantities.

**Endpoint:** `POST /calculate/deposit`

**Access:** Public

**Request Body:**
```json
{
  "singleBeds": 2,
  "doubleBeds": 1,
  "curtainSets": 2
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "deposit": 2400,
  "breakdown": {
    "singleBeds": 2,
    "doubleBeds": 1,
    "curtainSets": 2,
    "singleBedDeposit": 1000,
    "doubleBedDeposit": 1000,
    "curtainSetDeposit": 400
  }
}
```

**Formula:** `(singleBeds × 500) + (doubleBeds × 1000) + (curtainSets × 200)`

---

### Calculate Subscription Pricing
Calculate subscription pricing with discount.

**Endpoint:** `POST /calculate/pricing`

**Access:** Public

**Request Body:**
```json
{
  "bundleId": "507f1f77bcf86cd799439011",
  "duration": 6
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "bundle": {
    "id": "507f1f77bcf86cd799439011",
    "name": "Single Bed Bundle",
    "basePrice": 500
  },
  "pricing": {
    "duration": 6,
    "basePrice": 500,
    "originalPrice": 3000,
    "discountPercentage": 10,
    "discountAmount": 300,
    "finalPrice": 2700,
    "monthlyEquivalent": 450
  }
}
```

---

### Get Discount Tiers
Get all available discount tiers.

**Endpoint:** `GET /calculate/discounts`

**Access:** Public

**Response:** `200 OK`
```json
{
  "success": true,
  "discounts": [
    { "duration": 1, "discountPercentage": 0, "label": "1 Month" },
    { "duration": 3, "discountPercentage": 5, "label": "3 Months" },
    { "duration": 6, "discountPercentage": 10, "label": "6 Months" },
    { "duration": 12, "discountPercentage": 20, "label": "12 Months" }
  ]
}
```

---

### Get Pricing Configuration
Get base pricing for deposits.

**Endpoint:** `GET /calculate/pricing-config`

**Access:** Public

**Response:** `200 OK`
```json
{
  "success": true,
  "pricing": {
    "singleBed": 500,
    "doubleBed": 1000,
    "curtainSet": 200
  }
}
```

---

## Testing with cURL - Phase 3

### Seed Default Bundles
```bash
npm run seed:bundles
```

### Get All Bundles
```bash
curl http://localhost:5000/api/bundles
```

### Calculate Deposit
```bash
curl -X POST http://localhost:5000/api/calculate/deposit \
  -H "Content-Type: application/json" \
  -d '{
    "singleBeds": 2,
    "doubleBeds": 1,
    "curtainSets": 2
  }'
```

### Calculate Pricing
```bash
curl -X POST http://localhost:5000/api/calculate/pricing \
  -H "Content-Type: application/json" \
  -d '{
    "bundleId": "YOUR_BUNDLE_ID",
    "duration": 6
  }'
```

### Create Subscription
```bash
curl -X POST http://localhost:5000/api/subscriptions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "bundleId": "YOUR_BUNDLE_ID",
    "duration": 3
  }'
```

### Get My Subscriptions
```bash
curl http://localhost:5000/api/subscriptions \
  -H "Authorization: Bearer YOUR_TOKEN"
```
