const {
  NotFoundError,
  AuthorizationError,
} = require("../middleware/errorHandler");

/**
 * CallLog Service
 * Business logic for call logs
 */
class CallLogService {
  constructor(callLogRepository, customerRepository) {
    this.callLogRepository = callLogRepository;
    this.customerRepository = customerRepository;
  }

  /**
   * Create new call log
   */
  async createCallLog(userId, userRole, data) {
    const { customerId, status, notes } = data;

    // ADMIN cannot create call logs
    if (userRole === "ADMIN") {
      throw new AuthorizationError("Admin tidak dapat membuat call log");
    }

    // Verify customer exists
    const customer = await this.customerRepository.findById(customerId);
    if (!customer) {
      throw new NotFoundError("Customer tidak ditemukan");
    }

    // Check if user has access to this customer (for SALES role)
    if (userRole === "SALES" && customer.salesId !== userId) {
      throw new AuthorizationError("Anda tidak memiliki akses ke customer ini");
    }

    // Create call log
    const callLog = await this.callLogRepository.create({
      customerId,
      userId,
      status,
      notes,
      callDate: new Date(),
    });

    return callLog;
  }

  /**
   * Get all call logs with filters
   */
  async getAllCallLogs(userId, userRole, filters) {
    // ADMIN cannot view call logs
    if (userRole === "ADMIN") {
      throw new AuthorizationError("Admin tidak dapat melihat call log");
    }

    // If SALES role, only show their own call logs
    if (userRole === "SALES") {
      filters.userId = userId;
    }
    // SALES_MANAGER can see all call logs (from all sales team)

    return this.callLogRepository.findAll(filters);
  }

  /**
   * Get call log by ID
   */
  async getCallLogById(id, userId, userRole) {
    // ADMIN cannot view call logs
    if (userRole === "ADMIN") {
      throw new AuthorizationError("Admin tidak dapat melihat call log");
    }

    const callLog = await this.callLogRepository.findById(id);

    if (!callLog) {
      throw new NotFoundError("Call log tidak ditemukan");
    }

    // Check access for SALES role
    if (userRole === "SALES" && callLog.userId !== userId) {
      throw new AuthorizationError("Anda tidak memiliki akses ke call log ini");
    }
    // SALES_MANAGER can view all call logs

    return callLog;
  }

  /**
   * Get customer's call history
   */
  async getCustomerCallHistory(customerId, userId, userRole) {
    // ADMIN cannot view call logs
    if (userRole === "ADMIN") {
      throw new AuthorizationError("Admin tidak dapat melihat call log");
    }

    // Verify customer exists
    const customer = await this.customerRepository.findById(customerId);
    if (!customer) {
      throw new NotFoundError("Customer tidak ditemukan");
    }

    // Check access for SALES role
    if (userRole === "SALES" && customer.salesId !== userId) {
      throw new AuthorizationError("Anda tidak memiliki akses ke customer ini");
    }
    // SALES_MANAGER can view all customer call history

    return this.callLogRepository.findByCustomerId(customerId);
  }

  /**
   * Update call log
   */
  async updateCallLog(id, userId, userRole, data) {
    // ADMIN cannot update call logs
    if (userRole === "ADMIN") {
      throw new AuthorizationError("Admin tidak dapat mengupdate call log");
    }

    const callLog = await this.callLogRepository.findById(id);

    if (!callLog) {
      throw new NotFoundError("Call log tidak ditemukan");
    }

    // Authorization rules:
    // - SALES can only update their own call logs
    // - SALES_MANAGER can update any call logs (including their team's)
    if (userRole === "SALES" && callLog.userId !== userId) {
      throw new AuthorizationError("Anda tidak dapat mengupdate call log ini");
    }

    return this.callLogRepository.update(id, data);
  }

  /**
   * Delete call log
   */
  async deleteCallLog(id, userId, userRole) {
    // ADMIN cannot delete call logs
    if (userRole === "ADMIN") {
      throw new AuthorizationError("Admin tidak dapat menghapus call log");
    }

    const callLog = await this.callLogRepository.findById(id);

    if (!callLog) {
      throw new NotFoundError("Call log tidak ditemukan");
    }

    // Only SALES_MANAGER can delete call logs
    if (userRole !== "SALES_MANAGER") {
      throw new AuthorizationError(
        "Hanya Sales Manager yang dapat menghapus call log"
      );
    }

    return this.callLogRepository.delete(id);
  }

  /**
   * Get call statistics
   */
  async getCallStatistics(userId, userRole, filters = {}) {
    // ADMIN cannot view call statistics
    if (userRole === "ADMIN") {
      throw new AuthorizationError(
        "Admin tidak dapat melihat statistik call log"
      );
    }

    // If SALES role, only show their own stats
    if (userRole === "SALES") {
      filters.userId = userId;
    }
    // SALES_MANAGER can see all statistics

    return this.callLogRepository.getStatistics(filters);
  }

  /**
   * Get my performance statistics (for SALES)
   */
  async getMyStatistics(userId, userRole) {
    if (userRole === "ADMIN") {
      throw new AuthorizationError(
        "Admin tidak dapat melihat statistik call log"
      );
    }

    if (userRole !== "SALES") {
      throw new AuthorizationError("Endpoint ini hanya untuk Sales");
    }

    return this.callLogRepository.getMyPerformance(userId);
  }

  /**
   * Get team performance statistics (for SALES_MANAGER)
   */
  async getTeamStatistics(userRole, filters = {}) {
    if (userRole === "ADMIN") {
      throw new AuthorizationError(
        "Admin tidak dapat melihat statistik call log"
      );
    }

    if (userRole !== "SALES_MANAGER") {
      throw new AuthorizationError("Endpoint ini hanya untuk Sales Manager");
    }

    return this.callLogRepository.getTeamPerformance(filters);
  }
}

module.exports = CallLogService;
