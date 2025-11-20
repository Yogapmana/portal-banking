const express = require("express");
const container = require("../container");
const { authMiddleware } = require("../middleware/auth");

const router = express.Router();

// Get controller from container
const callLogController = container.getCallLogController();

/**
 * @route   POST /api/call-logs
 * @desc    Create new call log
 * @access  Private (All authenticated users)
 */
router.post("/", authMiddleware, callLogController.createCallLog);

/**
 * @route   GET /api/call-logs
 * @desc    Get all call logs (with filters)
 * @access  Private (All authenticated users)
 */
router.get("/", authMiddleware, callLogController.getAllCallLogs);

/**
 * @route   GET /api/call-logs/statistics
 * @desc    Get call statistics
 * @access  Private (All authenticated users)
 */
router.get("/statistics", authMiddleware, callLogController.getCallStatistics);

/**
 * @route   GET /api/call-logs/my-statistics
 * @desc    Get my performance statistics (SALES only)
 * @access  Private (SALES)
 */
router.get("/my-statistics", authMiddleware, callLogController.getMyStatistics);

/**
 * @route   GET /api/call-logs/team-statistics
 * @desc    Get team performance statistics (SALES_MANAGER only)
 * @access  Private (SALES_MANAGER)
 */
router.get(
  "/team-statistics",
  authMiddleware,
  callLogController.getTeamStatistics
);

/**
 * @route   GET /api/call-logs/customer/:customerId
 * @desc    Get customer's call history
 * @access  Private (All authenticated users)
 */
router.get(
  "/customer/:customerId",
  authMiddleware,
  callLogController.getCustomerCallHistory
);

/**
 * @route   GET /api/call-logs/:id
 * @desc    Get call log by ID
 * @access  Private (All authenticated users)
 */
router.get("/:id", authMiddleware, callLogController.getCallLogById);

/**
 * @route   PUT /api/call-logs/:id
 * @desc    Update call log
 * @access  Private (Creator or Admin)
 */
router.put("/:id", authMiddleware, callLogController.updateCallLog);

/**
 * @route   DELETE /api/call-logs/:id
 * @desc    Delete call log
 * @access  Private (Admin only)
 */
router.delete("/:id", authMiddleware, callLogController.deleteCallLog);

module.exports = router;
