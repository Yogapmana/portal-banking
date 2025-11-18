const express = require("express");
const container = require("../container");
const { authMiddleware, requireAdminOrManager } = require("../middleware/auth");

const router = express.Router();

// Get controller from container
const customerController = container.getCustomerController();

/**
 * @route   GET /api/customers
 * @desc    Get all customers with pagination and filters
 * @access  Private
 */
router.get("/", authMiddleware, customerController.getCustomers);

/**
 * @route   GET /api/customers/filters/options
 * @desc    Get filter options for dropdowns
 * @access  Private
 */
router.get(
  "/filters/options",
  authMiddleware,
  customerController.getFilterOptions
);

/**
 * @route   POST /api/customers/bulk-assign
 * @desc    Bulk assign customers to sales
 * @access  Private (Manager only)
 */
router.post(
  "/bulk-assign",
  authMiddleware,
  requireAdminOrManager,
  customerController.bulkAssignCustomers
);

/**
 * @route   POST /api/customers/bulk-unassign
 * @desc    Bulk unassign customers from sales
 * @access  Private (Manager only)
 */
router.post(
  "/bulk-unassign",
  authMiddleware,
  requireAdminOrManager,
  customerController.bulkUnassignCustomers
);

/**
 * @route   GET /api/customers/sales/:salesId/count
 * @desc    Get customer count for a sales user
 * @access  Private (Admin/Manager)
 */
router.get(
  "/sales/:salesId/count",
  authMiddleware,
  requireAdminOrManager,
  customerController.getCustomerCountBySales
);

/**
 * @route   GET /api/customers/:id
 * @desc    Get customer by ID
 * @access  Private
 */
router.get("/:id", authMiddleware, customerController.getCustomerById);

/**
 * @route   POST /api/customers
 * @desc    Create new customer
 * @access  Private (Admin/Manager)
 */
router.post(
  "/",
  authMiddleware,
  requireAdminOrManager,
  customerController.createCustomer
);

/**
 * @route   POST /api/customers/:id/assign
 * @desc    Assign customer to sales
 * @access  Private (Admin/Manager)
 */
router.post(
  "/:id/assign",
  authMiddleware,
  requireAdminOrManager,
  customerController.assignCustomer
);

/**
 * @route   POST /api/customers/:id/unassign
 * @desc    Unassign customer from sales
 * @access  Private (Admin/Manager)
 */
router.post(
  "/:id/unassign",
  authMiddleware,
  requireAdminOrManager,
  customerController.unassignCustomer
);

/**
 * @route   PUT /api/customers/:id
 * @desc    Update customer
 * @access  Private
 */
router.put("/:id", authMiddleware, customerController.updateCustomer);

/**
 * @route   DELETE /api/customers/:id
 * @desc    Delete customer
 * @access  Private (Admin only)
 */
router.delete("/:id", authMiddleware, customerController.deleteCustomer);

module.exports = router;
