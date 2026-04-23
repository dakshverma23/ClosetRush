/**
 * Global Error Handler Middleware
 * Catches all errors and returns consistent JSON response
 */
const errorHandler = (err, req, res, next) => {
  // Log error details for debugging
  console.error('Error:', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    url: req.url,
    method: req.method,
    userId: req.user?.id,
    timestamp: new Date().toISOString()
  });

  // Default error values
  const statusCode = err.statusCode || 500;
  const errorCode = err.code || 'INTERNAL_ERROR';
  
  // Don't expose internal error messages in production
  const message = statusCode === 500 && process.env.NODE_ENV === 'production'
    ? 'An error occurred while processing your request'
    : err.message || 'Internal server error';

  // Send error response
  res.status(statusCode).json({
    error: {
      code: errorCode,
      message: message,
      details: err.details || {},
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  });
};

module.exports = errorHandler;
