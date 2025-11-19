const { asyncHandler } = require("../middleware/errorHandler");

/**
 * CallLog Controller
 * Handles HTTP requests for call logs
 */
class CallLogController {
  constructor(callLogService) {
    this.callLogService = callLogService;
  }

  /**
   * Create new call log
   * @route POST /api/call-logs
   */
  createCallLog = asyncHandler(async (req, res) => {
    const userId = req.user.userId;
    const userRole = req.user.role;
    const { customerId, status, notes } = req.body;

    const callLog = await this.callLogService.createCallLog(userId, userRole, {
      customerId,
      status,
      notes,
    });

    res.status(201).json({
      success: true,
      message: "Call log berhasil dibuat",
      data: callLog,
    });
  });

  /**
   * Get all call logs
   * @route GET /api/call-logs
   */
  getAllCallLogs = asyncHandler(async (req, res) => {
    const userId = req.user.userId;
    const userRole = req.user.role;
    const { page, limit, customerId, status, startDate, endDate } = req.query;

    const result = await this.callLogService.getAllCallLogs(userId, userRole, {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20,
      customerId: customerId ? parseInt(customerId) : undefined,
      status,
      startDate,
      endDate,
    });

    res.json({
      success: true,
      data: result.callLogs,
      pagination: {
        currentPage: result.page,
        totalPages: result.totalPages,
        totalItems: result.total,
        limit: parseInt(limit) || 20,
      },
    });
  });

  /**
   * Get call log by ID
   * @route GET /api/call-logs/:id
   */
  getCallLogById = asyncHandler(async (req, res) => {
    const userId = req.user.userId;
    const userRole = req.user.role;
    const { id } = req.params;

    const callLog = await this.callLogService.getCallLogById(
      parseInt(id),
      userId,
      userRole
    );

    res.json({
      success: true,
      data: callLog,
    });
  });

  /**
   * Get customer's call history
   * @route GET /api/call-logs/customer/:customerId
   */
  getCustomerCallHistory = asyncHandler(async (req, res) => {
    const userId = req.user.userId;
    const userRole = req.user.role;
    const { customerId } = req.params;

    const callLogs = await this.callLogService.getCustomerCallHistory(
      parseInt(customerId),
      userId,
      userRole
    );

    res.json({
      success: true,
      data: callLogs,
    });
  });

  /**
   * Update call log
   * @route PUT /api/call-logs/:id
   */
  updateCallLog = asyncHandler(async (req, res) => {
    const userId = req.user.userId;
    const userRole = req.user.role;
    const { id } = req.params;
    const { status, notes } = req.body;

    const callLog = await this.callLogService.updateCallLog(
      parseInt(id),
      userId,
      userRole,
      { status, notes }
    );

    res.json({
      success: true,
      message: "Call log berhasil diupdate",
      data: callLog,
    });
  });

  /**
   * Delete call log
   * @route DELETE /api/call-logs/:id
   */
  deleteCallLog = asyncHandler(async (req, res) => {
    const userId = req.user.userId;
    const userRole = req.user.role;
    const { id } = req.params;

    await this.callLogService.deleteCallLog(parseInt(id), userId, userRole);

    res.json({
      success: true,
      message: "Call log berhasil dihapus",
    });
  });

  /**
   * Get call statistics
   * @route GET /api/call-logs/statistics
   */
  getCallStatistics = asyncHandler(async (req, res) => {
    const userId = req.user.userId;
    const userRole = req.user.role;
    const { startDate, endDate } = req.query;

    const stats = await this.callLogService.getCallStatistics(
      userId,
      userRole,
      { startDate, endDate }
    );

    res.json({
      success: true,
      data: stats,
    });
  });

  /**
   * Get my performance statistics (SALES only)
   * @route GET /api/call-logs/my-statistics
   */
  getMyStatistics = asyncHandler(async (req, res) => {
    const userId = req.user.userId;
    const userRole = req.user.role;

    const stats = await this.callLogService.getMyStatistics(userId, userRole);

    res.json({
      success: true,
      data: stats,
    });
  });

  /**
   * Get team performance statistics (SALES_MANAGER only)
   * @route GET /api/call-logs/team-statistics
   */
  getTeamStatistics = asyncHandler(async (req, res) => {
    const userRole = req.user.role;
    const { startDate, endDate } = req.query;

    const stats = await this.callLogService.getTeamStatistics(userRole, {
      startDate,
      endDate,
    });

    res.json({
      success: true,
      data: stats,
    });
  });
}

module.exports = CallLogController;
