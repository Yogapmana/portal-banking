/**
 * Custom Sanitization Middleware
 * Compatible with Express v5
 * Prevents NoSQL injection, XSS, and prototype pollution
 */

/**
 * Check if value contains dangerous patterns
 * @param {*} value - Value to check
 * @returns {boolean}
 */
const isDangerous = (value) => {
  if (typeof value !== "string") return false;

  // Check for NoSQL injection patterns
  const nosqlPatterns =
    /(\$where|\$ne|\$gt|\$gte|\$lt|\$lte|\$in|\$nin|\$regex|\$exists)/i;

  // Check for prototype pollution
  const prototypePatterns = /(__proto__|constructor|prototype)/i;

  return nosqlPatterns.test(value) || prototypePatterns.test(value);
};

/**
 * Sanitize string value
 * @param {string} value - String to sanitize
 * @returns {string} - Sanitized string
 */
const sanitizeString = (value) => {
  if (typeof value !== "string") return value;

  return value
    .trim()
    .replace(/\s+/g, " ") // Normalize whitespace
    .replace(/[<>'"]/g, "") // Remove XSS characters
    .replace(/javascript:/gi, "") // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, "") // Remove event handlers
    .replace(/\$where/gi, "") // Remove MongoDB $where
    .replace(/\$\w+/g, ""); // Remove other MongoDB operators
};

/**
 * Recursively sanitize object
 * @param {*} obj - Object to sanitize
 * @returns {*} - Sanitized object
 */
const sanitizeValue = (obj) => {
  // Handle null/undefined
  if (obj === null || obj === undefined) return obj;

  // Handle strings
  if (typeof obj === "string") {
    return sanitizeString(obj);
  }

  // Handle arrays
  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeValue(item));
  }

  // Handle objects
  if (typeof obj === "object") {
    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
      // Sanitize key to prevent prototype pollution
      const safeKey = sanitizeString(key);

      // Skip dangerous keys
      if (
        safeKey === "__proto__" ||
        safeKey === "constructor" ||
        safeKey === "prototype"
      ) {
        console.warn(`🚨 Security: Blocked dangerous key "${key}"`);
        continue;
      }

      // Check for NoSQL injection in key
      if (isDangerous(safeKey)) {
        console.warn(
          `🚨 Security: Blocked NoSQL injection attempt in key "${key}"`
        );
        continue;
      }

      sanitized[safeKey] = sanitizeValue(value);
    }
    return sanitized;
  }

  // Return primitives as-is
  return obj;
};

/**
 * Sanitization middleware for Express v5
 * @returns {Function} Express middleware
 */
const sanitizeMiddleware = () => {
  return (req, res, next) => {
    try {
      // Sanitize body
      if (req.body) {
        req.body = sanitizeValue(req.body);
      }

      // Sanitize params
      if (req.params) {
        req.params = sanitizeValue(req.params);
      }

      // For query, we need to be careful with Express v5
      // Don't try to reassign req.query, just sanitize values in-place
      if (req.query && typeof req.query === "object") {
        const sanitizedQuery = sanitizeValue(req.query);

        // Clear existing query
        for (const key in req.query) {
          delete req.query[key];
        }

        // Add sanitized values
        Object.assign(req.query, sanitizedQuery);
      }

      next();
    } catch (error) {
      console.error("Sanitization error:", error);
      next(error);
    }
  };
};

module.exports = {
  sanitizeMiddleware,
  sanitizeValue,
  sanitizeString,
};
