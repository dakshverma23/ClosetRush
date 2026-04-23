require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const passport = require('./config/passport');
const connectDB = require('./config/database');
const errorHandler = require('./middleware/errorHandler');
const requestLogger = require('./middleware/requestLogger');

const app = express();

// Connect to MongoDB
connectDB();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize Passport
app.use(passport.initialize());

// Request logger
app.use(requestLogger);

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'ClosetRush API is running',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/bundles', require('./routes/bundles'));
app.use('/api/subscriptions', require('./routes/subscriptions'));
app.use('/api/subscription-requests', require('./routes/subscriptionRequests'));
app.use('/api/calculate', require('./routes/calculate'));
app.use('/api/properties', require('./routes/properties'));
app.use('/api/inventory', require('./routes/inventory'));
app.use('/api/deposits', require('./routes/deposits'));
app.use('/api/support', require('./routes/support'));
app.use('/api/quotes', require('./routes/quotes'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/users', require('./routes/users'));
app.use('/api/inventory-management', require('./routes/inventoryManagement'));
app.use('/api/science-sections', require('./routes/scienceSections'));

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: 'Route not found'
    }
  });
});

// Global error handler (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
