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
          "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&_\\-])[A-Za-z\\d@$!%*?&_\\-]{8,}$"
        )
      )
      .required()
      .messages({
        "string.min": "Password minimal 8 karakter",
        "string.pattern.base":
          "Password harus mengandung huruf besar, huruf kecil, angka, dan karakter khusus (@$!%*?&_-)",
        "any.required": "Password harus diisi",
      }),
    role: Joi.string()
      .valid("ADMIN", "SALES_MANAGER", "SALES")
      .default("SALES")
      .messages({
        "any.only": "Role tidak valid. Pilih: ADMIN, SALES_MANAGER, SALES",
      }),
  }),

  updateUser: Joi.object({
    email: Joi.string().email().messages({
      "string.email": "Email tidak valid",
    }),
    password: Joi.string()
      .min(8)
      .pattern(
        new RegExp(
          "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&_\\-])[A-Za-z\\d@$!%*?&_\\-]{8,}$"
        )
      )
      .allow("")
      .messages({
        "string.min": "Password minimal 8 karakter",
        "string.pattern.base":
          "Password harus mengandung huruf besar, huruf kecil, angka, dan karakter khusus (@$!%*?&_-)",
      }),
    role: Joi.string().valid("ADMIN", "SALES_MANAGER", "SALES").messages({
      "any.only": "Role tidak valid. Pilih: ADMIN, SALES_MANAGER, SALES",
    }),
  }),

  updateCustomer: Joi.object({
    name: Joi.string().max(100).messages({
      "string.max": "Nama maksimal 100 karakter",
    }),
    phoneNumber: Joi.string()
      .max(20)
      .pattern(/^[0-9+\-\s()]+$/)
      .messages({
        "string.max": "Nomor telepon maksimal 20 karakter",
        "string.pattern.base":
          "Nomor telepon hanya boleh berisi angka dan karakter +, -, (, )",
      }),
    age: Joi.number().integer().min(17).max(100).messages({
      "number.base": "Usia harus berupa angka",
      "number.integer": "Usia harus bilangan bulat",
      "number.min": "Usia minimal 17 tahun",
      "number.max": "Usia maksimal 100 tahun",
    }),
    job: Joi.string()
      .valid(
        "admin.",
        "blue-collar",
        "entrepreneur",
        "housemaid",
        "management",
        "retired",
        "self-employed",
        "services",
        "student",
        "technician",
        "unemployed",
        "unknown"
      )
      .messages({
        "any.only": "Pekerjaan tidak valid",
      }),
    education: Joi.string()
      .valid(
        "basic.4y",
        "basic.6y",
        "basic.9y",
        "high.school",
        "illiterate",
        "professional.course",
        "university.degree",
        "unknown"
      )
      .messages({
        "any.only": "Pendidikan tidak valid",
      }),
    marital: Joi.string()
      .valid("single", "married", "divorced", "unknown")
      .messages({
        "any.only": "Status pernikahan tidak valid",
      }),
    housing: Joi.string().valid("yes", "no", "unknown").messages({
      "any.only": "Status rumah tidak valid",
    }),
    loan: Joi.string().valid("yes", "no", "unknown").messages({
      "any.only": "Status pinjaman tidak valid",
    }),
    recalculateScore: Joi.boolean().default(false),
  }),

  createCustomer: Joi.object({
    name: Joi.string().max(100).required().messages({
      "string.max": "Nama maksimal 100 karakter",
      "any.required": "Nama harus diisi",
    }),
    phoneNumber: Joi.string()
      .max(20)
      .pattern(/^[0-9+\-\s()]+$/)
      .required()
      .messages({
        "string.max": "Nomor telepon maksimal 20 karakter",
        "string.pattern.base":
          "Nomor telepon hanya boleh berisi angka dan karakter +, -, (, )",
        "any.required": "Nomor telepon harus diisi",
      }),
    age: Joi.number().integer().min(17).max(100).required().messages({
      "number.base": "Usia harus berupa angka",
      "number.integer": "Usia harus bilangan bulat",
      "number.min": "Usia minimal 17 tahun",
      "number.max": "Usia maksimal 100 tahun",
      "any.required": "Usia harus diisi",
    }),
    job: Joi.string()
      .valid(
        "admin.",
        "blue-collar",
        "entrepreneur",
        "housemaid",
        "management",
        "retired",
        "self-employed",
        "services",
        "student",
        "technician",
        "unemployed",
        "unknown"
      )
      .required()
      .messages({
        "any.only": "Pekerjaan tidak valid",
        "any.required": "Pekerjaan harus diisi",
      }),
    education: Joi.string()
      .valid(
        "basic.4y",
        "basic.6y",
        "basic.9y",
        "high.school",
        "illiterate",
        "professional.course",
        "university.degree",
        "unknown"
      )
      .required()
      .messages({
        "any.only": "Pendidikan tidak valid",
        "any.required": "Pendidikan harus diisi",
      }),
    marital: Joi.string()
      .valid("single", "married", "divorced", "unknown")
      .required()
      .messages({
        "any.only": "Status pernikahan tidak valid",
        "any.required": "Status pernikahan harus diisi",
      }),
    housing: Joi.string().valid("yes", "no", "unknown").required().messages({
      "any.only": "Status rumah tidak valid",
      "any.required": "Status kepemilikan rumah harus diisi",
    }),
    loan: Joi.string().valid("yes", "no", "unknown").required().messages({
      "any.only": "Status pinjaman tidak valid",
      "any.required": "Status pinjaman harus diisi",
    }),
    default: Joi.string().valid("yes", "no", "unknown").default("no").messages({
      "any.only": "Status kredit macet tidak valid",
    }),
    contact: Joi.string()
      .valid("cellular", "telephone")
      .default("cellular")
      .messages({
        "any.only": "Tipe kontak tidak valid",
      }),
    month: Joi.string()
      .valid(
        "jan",
        "feb",
        "mar",
        "apr",
        "may",
        "jun",
        "jul",
        "aug",
        "sep",
        "oct",
        "nov",
        "dec"
      )
      .default("may"),
    dayOfWeek: Joi.string()
      .valid("mon", "tue", "wed", "thu", "fri")
      .default("mon"),
    campaign: Joi.number().integer().min(1).default(1),
    pdays: Joi.number().integer().default(999),
    previous: Joi.number().integer().min(0).default(0),
    poutcome: Joi.string()
      .valid("failure", "nonexistent", "success")
      .default("nonexistent"),
    empVarRate: Joi.number().default(1.1),
    consPriceIdx: Joi.number().default(93.994),
    consConfIdx: Joi.number().default(-36.4),
    euribor3m: Joi.number().default(4.857),
    nrEmployed: Joi.number().default(5191.0),
    duration: Joi.number().integer().default(0),
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

  refresh: Joi.object({
    refreshToken: Joi.string().required().messages({
      "string.empty": "Refresh token tidak boleh kosong",
      "any.required": "Refresh token diperlukan",
    }),
  }),

  logout: Joi.object({
    refreshToken: Joi.string().optional().messages({
      "string.base": "Refresh token harus berupa string",
    }),
  }),
};

// Sanitization function with XSS protection
const sanitizeInput = (input) => {
  if (typeof input === "string") {
    return input
      .trim()
      .replace(/\s+/g, " ") // Normalize whitespace
      .replace(/[<>'"]/g, "") // Remove potential XSS characters
      .replace(/javascript:/gi, "") // Remove javascript: protocol
      .replace(/on\w+\s*=/gi, ""); // Remove event handlers (onclick, onerror, etc)
  }
  return input;
};

// Deep sanitize - recursively sanitize nested objects and arrays
const deepSanitize = (obj) => {
  if (typeof obj === "string") {
    return sanitizeInput(obj);
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => deepSanitize(item));
  }

  if (obj !== null && typeof obj === "object") {
    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
      // Sanitize key to prevent prototype pollution
      const safeKey = sanitizeInput(key);
      if (
        safeKey !== "__proto__" &&
        safeKey !== "constructor" &&
        safeKey !== "prototype"
      ) {
        sanitized[safeKey] = deepSanitize(value);
      }
    }
    return sanitized;
  }

  return obj;
};

// Sanitize all string values in an object (legacy - use deepSanitize instead)
const sanitizeObject = (obj) => {
  return deepSanitize(obj);
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

      // Determine what to validate based on HTTP method
      const dataToValidate =
        req.method === "GET" ? sanitizedQuery : sanitizedBody;

      // Validate against schema
      const { error, value } = schemas[schemaName].validate(dataToValidate, {
        abortEarly: false, // Return all validation errors
        stripUnknown: true, // Remove unknown fields
      });

      if (error) {
        const validationErrors = error.details.map((detail) => ({
          field: detail.path.join("."),
          message: detail.message,
          value: detail.context.value,
        }));

        return res.status(400).json({
          success: false,
          // Crude, but able to show the error more clearly
          error: validationErrors[0].message,
          details: validationErrors,
        });
      }

      // Replace request data with validated and sanitized data
      if (req.method === "GET") {
        req.query = value;
      } else {
        req.body = value;
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
