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
}

module.exports = CallLogRepository;
