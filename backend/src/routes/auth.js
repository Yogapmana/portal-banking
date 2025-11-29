const express = require("express");
const container = require("../container");
const { validate } = require("../middleware/validation");
const {
  authMiddleware,
  requireAdmin,
  requireSalesManager,
} = require("../middleware/auth");
const {
  loginLimiter,
  passwordChangeLimiter,
  registrationLimiter,
} = require("../middleware/rateLimiter");

const router = express.Router();

// Get controller from container
const authController = container.getAuthController();

/**
 * @route   POST /api/auth/register/admin
 * @desc    Register new user (Admin only)
 * @access  Private (Admin)
 */
router.post(
  "/register/admin",
  authMiddleware,
  requireAdmin,
  registrationLimiter,
  validate("register"),
  authController.register
);

/**
 * @route   POST /api/auth/register
 * @desc    Public registration (disabled)
 * @access  Public
 */
router.post("/register", validate("register"), authController.publicRegister);

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post("/login", loginLimiter, validate("login"), authController.login);

/**
 * @route   GET /api/auth/users
 * @desc    Get all users
 * @access  Private (Admin)
 */
router.get("/users", authMiddleware, requireAdmin, authController.getAllUsers);

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get("/me", authMiddleware, authController.getProfile);

/**
 * @route   GET /api/auth/users/:id
 * @desc    Get user by ID
 * @access  Private (Admin)
 */
router.get(
  "/users/:id",
  authMiddleware,
  requireAdmin,
  authController.getUserById
);

/**
 * @route   PUT /api/auth/users/:id
 * @desc    Update user
 * @access  Private (Admin)
 */
router.put(
  "/users/:id",
  authMiddleware,
  requireAdmin,
  authController.updateUser
);

/**
 * @route   DELETE /api/auth/users/:id
 * @desc    Delete user
 * @access  Private (Admin)
 */
router.delete(
  "/users/:id",
  authMiddleware,
  requireAdmin,
  authController.deleteUser
);

/**
 * @route   POST /api/auth/change-password
 * @desc    Change password
 * @access  Private
 */
router.post(
  "/change-password",
  authMiddleware,
  passwordChangeLimiter,
  authController.changePassword
);

/**
 * @route   GET /api/auth/sales-list
 * @desc    Get list of SALES users
 * @access  Private (SALES_MANAGER only)
 */
router.get(
  "/sales-list",
  authMiddleware,
  requireSalesManager,
  authController.getSalesList
);

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh access token
 * @access  Public (with valid refresh token)
 */
router.post("/refresh", authController.refresh);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user (revoke refresh token)
 * @access  Public (with valid refresh token)
 */
router.post("/logout", authController.logout);

/**
 * @route   POST /api/auth/logout-all
 * @desc    Logout from all devices
 * @access  Private
 */
router.post("/logout-all", authMiddleware, authController.logoutAll);

module.exports = router;
