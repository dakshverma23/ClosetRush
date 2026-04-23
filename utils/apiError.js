/**
 * Custom API Error class
 * Extends Error with statusCode and error code
 */
class ApiError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR', details = {}) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.name = 'ApiError';
    Error.captureStackTrace(this, this.constructor);
  }

  // Static factory methods for common errors
  static badRequest(message, details = {}) {
    return new ApiError(message, 400, 'BAD_REQUEST', details);
  }

  static unauthorized(message = 'Unauthorized', code = 'UNAUTHORIZED') {
    return new ApiError(message, 401, code);
  }

  static forbidden(message = 'Access denied') {
    return new ApiError(message, 403, 'FORBIDDEN');
  }

  static notFound(message = 'Resource not found', code = 'NOT_FOUND') {
    return new ApiError(message, 404, code);
  }

  static conflict(message, code = 'CONFLICT') {
    return new ApiError(message, 409, code);
  }

  static internal(message = 'Internal server error') {
    return new ApiError(message, 500, 'INTERNAL_ERROR');
  }

  static locked(message = 'Resource locked', code = 'LOCKED') {
    return new ApiError(message, 423, code);
  }
}

module.exports = ApiError;
