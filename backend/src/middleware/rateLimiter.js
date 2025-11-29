const rateLimit = require("express-rate-limit");

/**
 * Helper function to get IP address for rate limiting
 */
const getIpKey = (req) => {
  const forwarded = req.headers["x-forwarded-for"];
  const ip = forwarded
    ? forwarded.split(",")[0]
    : req.connection.remoteAddress || req.socket.remoteAddress || req.ip;
  return ip.replace(/^.*:/, ""); // Remove IPv6 prefix for consistency
};

/**
 * Login Rate Limiter - Prevents brute force attacks
 * Very strict: 5 attempts per 15 minutes
 */
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Maximum 5 login attempts
  message: {
    success: false,
    error: "Terlalu banyak percobaan login. Silakan coba lagi dalam 15 menit.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful logins
  keyGenerator: (req) => {
    // Rate limit by IP + email for better security
    const email = req.body.email || "";
    const ip = getIpKey(req);
    return `login:${ip}:${email.toLowerCase()}`;
  },
});

/**
 * Password Change Rate Limiter
 * Prevents rapid password changes: 3 attempts per hour
 */
const passwordChangeLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Maximum 3 password changes
  message: {
    success: false,
    error: "Terlalu banyak perubahan password. Silakan coba lagi dalam 1 jam.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Rate limit by authenticated user ID
    return `password-change:${req.user?.userId || getIpKey(req)}`;
  },
});

/**
 * Registration Rate Limiter (Admin Only)
 * Prevents account creation spam: 10 registrations per hour
 */
const registrationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Maximum 10 registrations
  message: {
    success: false,
    error: "Terlalu banyak registrasi. Silakan coba lagi dalam 1 jam.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Rate limit by admin user ID
    return `registration:${req.user?.userId || getIpKey(req)}`;
  },
});

/**
 * AI/Conversation Guide Rate Limiter
 * Prevents AI abuse: 20 requests per 5 minutes
 */
const aiLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 20, // Maximum 20 AI requests
  message: {
    success: false,
    error: "Terlalu banyak request ke AI. Silakan tunggu beberapa saat.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Rate limit by authenticated user ID
    return `ai:${req.user?.userId || getIpKey(req)}`;
  },
});

/**
 * Data Import/Bulk Operations Rate Limiter
 * Prevents spam of resource-intensive operations: 5 per hour
 */
const bulkOperationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Maximum 5 bulk operations
  message: {
    success: false,
    error: "Terlalu banyak operasi bulk. Silakan coba lagi dalam 1 jam.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Rate limit by authenticated user ID
    return `bulk:${req.user?.userId || getIpKey(req)}`;
  },
});

/**
 * General API Rate Limiter
 * Applied to all API endpoints: 1000 requests per 15 minutes
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Maximum 1000 requests
  message: {
    success: false,
    error: "API rate limit exceeded. Silakan coba lagi nanti.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.path === "/health";
  },
});

module.exports = {
  loginLimiter,
  passwordChangeLimiter,
  registrationLimiter,
  aiLimiter,
  bulkOperationLimiter,
  apiLimiter,
};
