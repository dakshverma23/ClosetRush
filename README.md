# ClosetRush Subscription Platform - Backend

A subscription-based bedding service platform backend built with Node.js, Express, and MongoDB.

## Features

- 🔐 Multi-method authentication (Email, Mobile, Google OAuth)
- 👥 Role-based access control (Individual, Business, Admin)
- 📦 Subscription bundle management
- 💰 Fixed deposit calculation and tracking
- 🏢 Multi-property management for business users
- 📊 Analytics and reporting
- 🎫 Support ticket system with image uploads
- 📧 Email notifications

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT, Google OAuth 2.0
- **File Storage**: Cloudinary
- **Email**: Nodemailer

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd closet-rush-backend
```

2. Install dependencies
```bash
npm install
```

3. Create environment file
```bash
cp .env.example .env
```

4. Configure environment variables in `.env`

5. Start the development server
```bash
npm run dev
```

The server will start on `http://localhost:5000`

### Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm test` - Run tests with coverage
- `npm run seed:bundles` - Seed default subscription bundles

## API Documentation

### Health Check
```
GET /health
```

### Authentication Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/login/mobile` - Login with mobile
- `GET /api/auth/google` - Initiate Google OAuth
- `GET /api/auth/google/callback` - Google OAuth callback
- `POST /api/auth/logout` - Logout user

See [API Documentation](./docs/API.md) for detailed endpoint information.

## Project Structure

```
closet-rush-backend/
├── config/
│   ├── database.js          # MongoDB connection
│   └── passport.js          # Google OAuth configuration
├── controllers/
│   └── authController.js    # Authentication handlers
├── docs/
│   └── API.md               # API documentation
├── middleware/
│   ├── auth.js              # JWT authentication
│   ├── rbac.js              # Role-based access control
│   ├── errorHandler.js      # Global error handler
│   └── requestLogger.js     # Request logging
├── models/
│   ├── User.js              # User schema
│   └── Session.js           # Session schema
├── routes/
│   └── auth.js              # Authentication routes
├── services/
│   └── emailService.js      # Email notifications
├── tests/
│   └── auth.test.js         # Authentication tests
├── utils/
│   ├── apiError.js          # Custom error class
│   ├── jwt.js               # JWT utilities
│   └── password.js          # Password hashing
├── .env.example             # Environment variables template
├── .gitignore
├── package.json
├── README.md
└── server.js                # Application entry point
```

## Environment Variables

See `.env.example` for all required environment variables.

## Development Phases

- ✅ Phase 1: Project Foundation & Setup
- ✅ Phase 2: Authentication System
- ✅ Phase 3: Core Business Logic
- ✅ Phase 4: Business Users & Property System
- ✅ Phase 5: Deposit & Inventory System
- ✅ Phase 6: Support System
- ✅ Phase 7: Analytics & Reporting
- ✅ Phase 8: Quote System
- ✅ Phase 9: Frontend Foundation
- ⏳ Phase 10: Security & Optimization
- ⏳ Phase 11: Testing
- ⏳ Phase 12: Deployment

## License

ISC
