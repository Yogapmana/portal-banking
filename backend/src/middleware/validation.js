const Joi = require('joi');

// Validation schemas
const schemas = {
  register: Joi.object({
    email: Joi.string()
      .email({ minDomainSegments: 2, tlds: { allow: true } })
      .required()
      .messages({
        'string.email': 'Email tidak valid',
        'any.required': 'Email harus diisi'
      }),
    password: Joi.string()
      .min(8)
      .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]'))
      .required()
      .messages({
        'string.min': 'Password minimal 8 karakter',
        'string.pattern.base': 'Password harus mengandung huruf besar, huruf kecil, angka, dan karakter khusus (@$!%*?&)',
        'any.required': 'Password harus diisi'
      })
  }),

  login: Joi.object({
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': 'Email tidak valid',
        'any.required': 'Email harus diisi'
      }),
    password: Joi.string()
      .required()
      .messages({
        'any.required': 'Password harus diisi'
      })
  }),

  customerQuery: Joi.object({
    page: Joi.number()
      .integer()
      .min(1)
      .default(1)
      .messages({
        'number.base': 'Page harus berupa angka',
        'number.integer': 'Page harus bilangan bulat',
        'number.min': 'Page minimal 1'
      }),
    limit: Joi.number()
      .integer()
      .min(1)
      .max(100)
      .default(10)
      .messages({
        'number.base': 'Limit harus berupa angka',
        'number.integer': 'Limit harus bilangan bulat',
        'number.min': 'Limit minimal 1',
        'number.max': 'Limit maksimal 100'
      }),
    search: Joi.string()
      .max(100)
      .allow('')
      .messages({
        'string.max': 'Search maksimal 100 karakter'
      }),
    sortBy: Joi.string()
      .valid('name', 'score', 'createdAt', 'age')
      .default('createdAt')
      .messages({
        'any.only': 'SortBy hanya boleh: name, score, createdAt, age'
      }),
    sortOrder: Joi.string()
      .valid('asc', 'desc')
      .default('desc')
      .messages({
        'any.only': 'SortOrder hanya boleh: asc, desc'
      })
  })
};

// Sanitization function
const sanitizeInput = (input) => {
  if (typeof input === 'string') {
    return input
      .trim()
      .replace(/\s+/g, ' ') // Normalize whitespace
      .replace(/[<>]/g, ''); // Remove potential HTML tags
  }
  return input;
};

// Sanitize all string values in an object
const sanitizeObject = (obj) => {
  const sanitized = {};
  for (const [key, value] of Object.entries(obj)) {
    sanitized[key] = sanitizeInput(value);
  }
  return sanitized;
};

// Validation middleware factory
const validate = (schemaName) => {
  return (req, res, next) => {
    try {
      // Sanitize input first
      const sanitizedBody = sanitizeObject(req.body);
      const sanitizedQuery = sanitizeObject(req.query);

      req.body = sanitizedBody;
      req.query = sanitizedQuery;

      // Validate against schema
      const { error, value } = schemas[schemaName].validate(
        { ...sanitizedBody, ...sanitizedQuery },
        {
          abortEarly: false, // Return all validation errors
          stripUnknown: true // Remove unknown fields
        }
      );

      if (error) {
        const validationErrors = error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message,
          value: detail.context.value
        }));

        return res.status(400).json({
          success: false,
          error: 'Validation Error',
          details: validationErrors
        });
      }

      // Replace request data with validated and sanitized data
      req.body = { ...sanitizedBody, ...value };
      if (Object.keys(value).length > 0 && !value.email && !value.password) {
        // For query parameters
        req.query = { ...sanitizedQuery, ...value };
      }

      next();
    } catch (err) {
      console.error('Validation middleware error:', err);
      res.status(500).json({
        success: false,
        error: 'Internal server error during validation'
      });
    }
  };
};

// Custom validation errors
class ValidationError extends Error {
  constructor(message, field) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
    this.statusCode = 400;
  }
}

// Error handling middleware for validation
const validationErrorHandler = (err, req, res, next) => {
  if (err instanceof ValidationError) {
    return res.status(400).json({
      success: false,
      error: 'Validation Error',
      field: err.field,
      message: err.message
    });
  }
  next(err);
};

// Password strength validator helper
const validatePasswordStrength = (password) => {
  const requirements = {
    minLength: password.length >= 8,
    hasUpperCase: /[A-Z]/.test(password),
    hasLowerCase: /[a-z]/.test(password),
    hasNumbers: /\d/.test(password),
    hasSpecialChar: /[@$!%*?&]/.test(password)
  };

  const missingRequirements = Object.entries(requirements)
    .filter(([, passed]) => !passed)
    .map(([requirement]) => {
      switch (requirement) {
        case 'minLength': return 'Minimal 8 karakter';
        case 'hasUpperCase': return 'Huruf besar';
        case 'hasLowerCase': return 'Huruf kecil';
        case 'hasNumbers': return 'Angka';
        case 'hasSpecialChar': return 'Karakter khusur (@$!%*?&)';
        default: return requirement;
      }
    });

  return {
    isValid: missingRequirements.length === 0,
    missingRequirements
  };
};

module.exports = {
  validate,
  ValidationError,
  validationErrorHandler,
  validatePasswordStrength,
  schemas
};