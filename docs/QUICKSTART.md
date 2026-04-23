# Quick Start Guide

## Prerequisites

- Node.js v18 or higher
- MongoDB (local or Atlas)
- npm or yarn

## Installation Steps

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Environment Variables

```bash
cp .env.example .env
```

Edit `.env` and configure:

```env
# Required
PORT=5000
MONGODB_URI=mongodb://localhost:27017/closet-rush
JWT_SECRET=your_secure_random_string_here

# Optional (for Google OAuth)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Optional (for email notifications)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
```

### 3. Start MongoDB

**Local MongoDB:**
```bash
mongod
```

**Or use MongoDB Atlas:**
- Create a free cluster at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
- Get your connection string
- Update `MONGODB_URI` in `.env`

### 4. Start the Server

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The server will start on `http://localhost:5000`

### 5. Test the API

**Health Check:**
```bash
curl http://localhost:5000/health
```

**Register a User:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "mobile": "9876543210",
    "password": "password123",
    "address": "123 Test Street",
    "userType": "individual"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

Save the token from the response for authenticated requests.

## Testing

Run tests:
```bash
npm test
```

## Common Issues

### MongoDB Connection Error

**Error:** `MongoServerError: connect ECONNREFUSED`

**Solution:** Make sure MongoDB is running:
```bash
# Check if MongoDB is running
ps aux | grep mongod

# Start MongoDB
mongod
```

### Port Already in Use

**Error:** `Error: listen EADDRINUSE: address already in use :::5000`

**Solution:** Change the port in `.env` or kill the process using port 5000:
```bash
# Find process
lsof -i :5000

# Kill process
kill -9 <PID>
```

### JWT Secret Not Set

**Error:** `Error: JWT_SECRET is not defined`

**Solution:** Make sure `.env` file exists and has `JWT_SECRET` set:
```bash
JWT_SECRET=your_secure_random_string_here
```

## Next Steps

1. ✅ Authentication system is ready
2. ⏳ Implement subscription bundles (Phase 3)
3. ⏳ Add property management (Phase 4)
4. ⏳ Build frontend with React

See [API Documentation](./API.md) for all available endpoints.

## Development Workflow

1. Create a new branch for your feature
2. Make changes
3. Test your changes
4. Commit and push
5. Create a pull request

## Useful Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Start production server
npm start

# Run tests
npm test

# Check for security vulnerabilities
npm audit

# Fix security vulnerabilities
npm audit fix
```

## Support

For issues or questions, please check:
- [API Documentation](./API.md)
- [README](../README.md)
- GitHub Issues
