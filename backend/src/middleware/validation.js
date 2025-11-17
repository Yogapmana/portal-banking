const Joi = require("joi");
const { ValidationError } = require("./errorHandler");

// Validation schemas
const schemas = {
  register: Joi.object({
    email: Joi.string().email().required().messages({
      "string.email": "Email tidak valid",
      "any.required": "Email harus diisi",
    }),
    password: Joi.string()
      .min(8)
      .pattern(
        new RegExp(
          "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$"
        )
      )
      .required()
      .messages({
        "string.min": "Password minimal 8 karakter",
        "string.pattern.base":
          "Password harus mengandung huruf besar, huruf kecil, angka, dan karakter khusus (@$!%*?&)",
        "any.required": "Password harus diisi",
      }),
    role: Joi.string()
      .valid("ADMIN", "SALES_MANAGER", "SALES")
      .default("SALES")
      .messages({
        "any.only": "Role tidak valid. Pilih: ADMIN, SALES_MANAGER, SALES",
      }),
  }),

  login: Joi.object({
    email: Joi.string().email().required().messages({
      "string.email": "Email tidak valid",
      "any.required": "Email harus diisi",
    }),
    password: Joi.string().required().messages({
      "any.required": "Password harus diisi",
    }),
  }),

  customerQuery: Joi.object({
    page: Joi.number().integer().min(1).default(1).messages({
      "number.base": "Page harus berupa angka",
      "number.integer": "Page harus bilangan bulat",
      "number.min": "Page minimal 1",
    }),
    limit: Joi.number().integer().min(1).max(100).default(10).messages({
      "number.base": "Limit harus berupa angka",
      "number.integer": "Limit harus bilangan bulat",
      "number.min": "Limit minimal 1",
      "number.max": "Limit maksimal 100",
    }),
    search: Joi.string().max(100).allow("").messages({
      "string.max": "Search maksimal 100 karakter",
    }),
    sortBy: Joi.string()
      .valid("name", "score", "createdAt", "age")
      .default("createdAt")
      .messages({
        "any.only": "SortBy hanya boleh: name, score, createdAt, age",
      }),
    sortOrder: Joi.string().valid("asc", "desc").default("desc").messages({
      "any.only": "SortOrder hanya boleh: asc, desc",
    }),
  }),
};

// Sanitization function
const sanitizeInput = (input) => {
  if (typeof input === "string") {
    return input
      .trim()
      .replace(/\s+/g, " ") // Normalize whitespace
      .replace(/[<>]/g, ""); // Remove potential HTML tags
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
          stripUnknown: true, // Remove unknown fields
        }
      );

      if (error) {
        const validationErrors = error.details.map((detail) => ({
          field: detail.path.join("."),
          message: detail.message,
          value: detail.context.value,
        }));

        return res.status(400).json({
          success: false,
          error: "Validation Error",
          details: validationErrors,
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
      console.error("Validation middleware error:", err);
      res.status(500).json({
        success: false,
        error: "Internal server error during validation",
      });
    }
  };
};

module.exports = {
  validate,
  schemas,
};
