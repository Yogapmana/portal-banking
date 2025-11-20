/**
 * CallLog Repository
 * Handles database operations for call logs
 */
class CallLogRepository {
  constructor(prisma) {
    this.prisma = prisma;
  }

  /**
   * Create new call log
   */
  async create(data) {
    return this.prisma.callLog.create({
      data,
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            phoneNumber: true,
            score: true,
          },
        },
        user: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
      },
    });
  }

  /**
   * Get all call logs with filters
   */
  async findAll(filters = {}) {
    const {
      page = 1,
      limit = 20,
      customerId,
      userId,
      status,
      startDate,
      endDate,
    } = filters;

    const skip = (page - 1) * limit;

    const where = {};

    if (customerId) where.customerId = customerId;
    if (userId) where.userId = userId;
    if (status) where.status = status;
    if (startDate || endDate) {
      where.callDate = {};
      if (startDate) where.callDate.gte = new Date(startDate);
      if (endDate) where.callDate.lte = new Date(endDate);
    }

    const [callLogs, total] = await Promise.all([
      this.prisma.callLog.findMany({
        where,
        skip,
        take: limit,
        include: {
          customer: {
            select: {
              id: true,
              name: true,
              phoneNumber: true,
              score: true,
            },
          },
          user: {
            select: {
              id: true,
              email: true,
              role: true,
            },
          },
        },
        orderBy: {
          callDate: "desc",
        },
      }),
      this.prisma.callLog.count({ where }),
    ]);

    return {
      callLogs,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get call log by ID
   */
  async findById(id) {
    return this.prisma.callLog.findUnique({
      where: { id },
      include: {
        customer: true,
        user: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
      },
    });
  }

  /**
   * Get customer's call history
   */
  async findByCustomerId(customerId) {
    return this.prisma.callLog.findMany({
      where: { customerId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: {
        callDate: "desc",
      },
    });
  }

  /**
   * Update call log
   */
  async update(id, data) {
    return this.prisma.callLog.update({
      where: { id },
      data,
      include: {
        customer: true,
        user: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
      },
    });
  }

  /**
   * Delete call log
   */
  async delete(id) {
    return this.prisma.callLog.delete({
      where: { id },
    });
  }

  /**
   * Get call statistics
   */
  async getStatistics(filters = {}) {
    const { userId, startDate, endDate } = filters;

    const where = {};
    if (userId) where.userId = userId;
    if (startDate || endDate) {
      where.callDate = {};
      if (startDate) where.callDate.gte = new Date(startDate);
      if (endDate) where.callDate.lte = new Date(endDate);
    }

    const stats = await this.prisma.callLog.groupBy({
      by: ["status"],
      where,
      _count: {
        status: true,
      },
    });

    const totalCalls = await this.prisma.callLog.count({ where });

    return {
      totalCalls,
      byStatus: stats.reduce((acc, stat) => {
        acc[stat.status] = stat._count.status;
        return acc;
      }, {}),
    };
  }

  /**
   * Get my performance statistics (for SALES)
   */
  async getMyPerformance(userId) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));

    // Total calls all time
    const totalCalls = await this.prisma.callLog.count({
      where: { userId },
    });

    // Calls this month
    const callsThisMonth = await this.prisma.callLog.count({
      where: {
        userId,
        callDate: { gte: startOfMonth },
      },
    });

    // Calls this week
    const callsThisWeek = await this.prisma.callLog.count({
      where: {
        userId,
        callDate: { gte: startOfWeek },
      },
    });

    // Status breakdown
    const statusBreakdown = await this.prisma.callLog.groupBy({
      by: ["status"],
      where: { userId },
      _count: { status: true },
    });

    // Daily calls for last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const dailyCalls = await this.prisma.$queryRaw`
      SELECT 
        DATE(call_date) as date,
        COUNT(*)::integer as count
      FROM call_logs
      WHERE user_id = ${userId}
        AND call_date >= ${sevenDaysAgo}
      GROUP BY DATE(call_date)
      ORDER BY date ASC
    `;

    // Success rate (INTERESTED + COMPLETED / TOTAL)
    const successfulCalls = await this.prisma.callLog.count({
      where: {
        userId,
        status: { in: ["INTERESTED", "COMPLETED"] },
      },
    });

    return {
      totalCalls,
      callsThisMonth,
      callsThisWeek,
      successRate:
        totalCalls > 0 ? ((successfulCalls / totalCalls) * 100).toFixed(1) : 0,
      statusBreakdown: statusBreakdown.reduce((acc, stat) => {
        acc[stat.status] = stat._count.status;
        return acc;
      }, {}),
      dailyCalls: dailyCalls.map((day) => ({
        date: day.date,
        count: Number(day.count),
      })),
    };
  }

  /**
   * Get team performance statistics (for SALES_MANAGER)
   */
  async getTeamPerformance(filters = {}) {
    const { startDate, endDate } = filters;

    const where = {};
    if (startDate || endDate) {
      where.callDate = {};
      if (startDate) where.callDate.gte = new Date(startDate);
      if (endDate) where.callDate.lte = new Date(endDate);
    }

    // Total calls
    const totalCalls = await this.prisma.callLog.count({ where });

    // Status breakdown
    const statusBreakdown = await this.prisma.callLog.groupBy({
      by: ["status"],
      where,
      _count: { status: true },
    });

    // Performance by sales
    const salesPerformance = await this.prisma.callLog.groupBy({
      by: ["userId"],
      where,
      _count: { userId: true },
    });

    // Get user details
    const userIds = salesPerformance.map((sp) => sp.userId);
    const users = await this.prisma.user.findMany({
      where: { id: { in: userIds } },
      select: {
        id: true,
        email: true,
        role: true,
      },
    });

    // Get detailed stats per sales
    const salesDetails = await Promise.all(
      salesPerformance.map(async (sp) => {
        const user = users.find((u) => u.id === sp.userId);

        const statusStats = await this.prisma.callLog.groupBy({
          by: ["status"],
          where: {
            ...where,
            userId: sp.userId,
          },
          _count: { status: true },
        });

        const successfulCalls = await this.prisma.callLog.count({
          where: {
            ...where,
            userId: sp.userId,
            status: { in: ["INTERESTED", "COMPLETED"] },
          },
        });

        return {
          userId: sp.userId,
          email: user?.email || "Unknown",
          role: user?.role || "Unknown",
          totalCalls: sp._count.userId,
          successRate:
            sp._count.userId > 0
              ? ((successfulCalls / sp._count.userId) * 100).toFixed(1)
              : 0,
          statusBreakdown: statusStats.reduce((acc, stat) => {
            acc[stat.status] = stat._count.status;
            return acc;
          }, {}),
        };
      })
    );

    // Daily calls trend
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const dailyCalls = await this.prisma.$queryRaw`
      SELECT 
        DATE(call_date) as date,
        COUNT(*)::integer as count
      FROM call_logs
      WHERE call_date >= ${sevenDaysAgo}
      GROUP BY DATE(call_date)
      ORDER BY date ASC
    `;

    // Success rate
    const successfulCalls = await this.prisma.callLog.count({
      where: {
        ...where,
        status: { in: ["INTERESTED", "COMPLETED"] },
      },
    });

    return {
      totalCalls,
      successRate:
        totalCalls > 0 ? ((successfulCalls / totalCalls) * 100).toFixed(1) : 0,
      statusBreakdown: statusBreakdown.reduce((acc, stat) => {
        acc[stat.status] = stat._count.status;
        return acc;
      }, {}),
      salesPerformance: salesDetails.sort(
        (a, b) => b.totalCalls - a.totalCalls
      ),
      dailyCalls: dailyCalls.map((day) => ({
        date: day.date,
        count: Number(day.count),
      })),
    };
  }
}

module.exports = CallLogRepository;
