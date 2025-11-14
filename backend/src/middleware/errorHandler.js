const { ValidationError } = require('./validation');

// Custom error classes for different error types
class DatabaseError extends Error {
  constructor(message, originalError) {
    super(message);
    this.name = 'DatabaseError';
    this.statusCode = 500;
    this.originalError = originalError;
  }
}

class AuthenticationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'AuthenticationError';
    this.statusCode = 401;
  }
}

class AuthorizationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'AuthorizationError';
    this.statusCode = 403;
  }
}

class NotFoundError extends Error {
  constructor(resource) {
    super(`${resource} not found`);
    this.name = 'NotFoundError';
    this.statusCode = 404;
    this.resource = resource;
  }
}

class ConflictError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ConflictError';
    this.statusCode = 409;
  }
}

class RateLimitError extends Error {
  constructor(message) {
    super(message);
    this.name = 'RateLimitError';
    this.statusCode = 429;
  }
}

// Error handling middleware
const errorHandler = (err, req, res, next) => {
  // Log error untuk debugging
  console.error(`[${new Date().toISOString()}] Error:`, {
    name: err.name,
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  // Jika response sudah dikirim, delegate ke default Express error handler
  if (res.headersSent) {
    return next(err);
  }

  // Handle different error types
  if (err instanceof ValidationError) {
    return res.status(400).json({
      success: false,
      error: 'Validation Error',
      field: err.field,
      message: err.message,
      timestamp: new Date().toISOString()
    });
  }

  if (err instanceof AuthenticationError) {
    return res.status(401).json({
      success: false,
      error: 'Authentication Error',
      message: err.message,
      timestamp: new Date().toISOString()
    });
  }

  if (err instanceof AuthorizationError) {
    return res.status(403).json({
      success: false,
      error: 'Authorization Error',
      message: err.message,
      timestamp: new Date().toISOString()
    });
  }

  if (err instanceof NotFoundError) {
    return res.status(404).json({
      success: false,
      error: 'Not Found',
      message: err.message,
      resource: err.resource,
      timestamp: new Date().toISOString()
    });
  }

  if (err instanceof ConflictError) {
    return res.status(409).json({
      success: false,
      error: 'Conflict',
      message: err.message,
      timestamp: new Date().toISOString()
    });
  }

  if (err instanceof RateLimitError) {
    return res.status(429).json({
      success: false,
      error: 'Rate Limit Exceeded',
      message: err.message,
      timestamp: new Date().toISOString()
    });
  }

  if (err instanceof DatabaseError) {
    return res.status(500).json({
      success: false,
      error: 'Database Error',
      message: 'Terjadi kesalahan pada database',
      timestamp: new Date().toISOString(),
      ...(process.env.NODE_ENV === 'development' && {
        details: err.message,
        originalError: err.originalError?.message
      })
    });
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      error: 'Invalid Token',
      message: 'Token tidak valid',
      timestamp: new Date().toISOString()
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      error: 'Token Expired',
      message: 'Token sudah kadaluarsa',
      timestamp: new Date().toISOString()
    });
  }

  // Handle Prisma errors
  if (err.code) {
    switch (err.code) {
      case 'P2002': // Unique constraint failed
        return res.status(409).json({
          success: false,
          error: 'Conflict',
          message: 'Data sudah ada',
          field: err.meta?.target?.[0],
          timestamp: new Date().toISOString()
        });

      case 'P2025': // Record not found
        return res.status(404).json({
          success: false,
          error: 'Not Found',
          message: 'Data tidak ditemukan',
          timestamp: new Date().toISOString()
        });

      case 'P2003': // Foreign key constraint
        return res.status(400).json({
          success: false,
          error: 'Validation Error',
          message: 'Referensi data tidak valid',
          timestamp: new Date().toISOString()
        });

      default:
        return res.status(500).json({
          success: false,
          error: 'Database Error',
          message: 'Terjadi kesalahan pada database',
          timestamp: new Date().toISOString(),
          ...(process.env.NODE_ENV === 'development' && {
            code: err.code,
            meta: err.meta
          })
        });
    }
  }

  // Default server error
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    error: statusCode === 500 ? 'Internal Server Error' : 'Error',
    message: statusCode === 500 ? 'Terjadi kesalahan pada server' : err.message,
    timestamp: new Date().toISOString(),
    ...(process.env.NODE_ENV === 'development' && {
      stack: err.stack,
      name: err.name
    })
  });
};

// 404 handler
const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Not Found',
    message: `Route ${req.method} ${req.url} tidak ditemukan`,
    timestamp: new Date().toISOString()
  });
};

// Async error wrapper untuk menangani async errors
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Custom error untuk environment variable validation
class EnvironmentError extends Error {
  constructor(missingVar) {
    super(`Environment variable ${missingVar} is required but not set`);
    this.name = 'EnvironmentError';
    this.statusCode = 500;
    this.missingVar = missingVar;
  }
};

// Validate required environment variables
const validateEnvironment = () => {
  const requiredVars = ['JWT_SECRET', 'DATABASE_URL'];
  const missingVars = requiredVars.filter(varName => !process.env[varName]);

  if (missingVars.length > 0) {
    throw new EnvironmentError(missingVars.join(', '));
  }
};

module.exports = {
  errorHandler,
  notFoundHandler,
  asyncHandler,
  ValidationError,
  DatabaseError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  RateLimitError,
  EnvironmentError,
  validateEnvironment
};