/**
 * Customer Repository
 * Handles all database operations related to customers
 */
class CustomerRepository {
  constructor(prismaClient) {
    this.prisma = prismaClient;
  }

  /**
   * Find customer by ID
   * @param {number} id - Customer ID
   * @returns {Promise<Object|null>} Customer object or null
   */
  async findById(id) {
    return this.prisma.customer.findUnique({
      where: { id: parseInt(id) },
      include: {
        assignedTo: {
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
   * Find customers with pagination and filters
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Customers with pagination info
   */
  async findMany(params) {
    const { skip, take, where, orderBy } = params;

    const [customers, total] = await Promise.all([
      this.prisma.customer.findMany({
        where,
        orderBy,
        skip,
        take,
        select: {
          id: true,
          originalId: true,
          name: true,
          phoneNumber: true,
          score: true,
          age: true,
          job: true,
          marital: true,
          education: true,
          housing: true,
          loan: true,
          contact: true,
          month: true,
          duration: true,
          campaign: true,
          pdays: true,
          previous: true,
          poutcome: true,
          salesId: true,
          assignedTo: {
            select: {
              id: true,
              email: true,
              role: true,
            },
          },
        },
      }),
      this.prisma.customer.count({ where }),
    ]);

    return { customers, total };
  }

  /**
   * Get customer statistics
   * @param {Object} where - Where conditions
   * @returns {Promise<Object>} Statistics
   */
  async getStatistics(where = {}) {
    const statsData = await this.prisma.customer.findMany({
      where,
      select: {
        score: true,
      },
    });

    const customersWithScores = statsData.filter(
      (c) => c.score !== null && c.score !== undefined
    );
    const scores = customersWithScores.map((c) => c.score);

    let stats = {
      totalCustomers: statsData.length,
      totalWithScores: customersWithScores.length,
      avgScore: 0,
      maxScore: 0,
      minScore: 0,
      scoreCount: scores.length,
    };

    if (scores.length > 0) {
      const totalScore = scores.reduce((sum, score) => sum + score, 0);
      stats.avgScore = totalScore / scores.length;
      stats.maxScore = Math.max(...scores);
      stats.minScore = Math.min(...scores);
    }

    return stats;
  }

  /**
   * Get filter options for dropdowns
   * @returns {Promise<Object>} Filter options
   */
  async getFilterOptions() {
    const [jobs, maritalStatuses, educationLevels, housingTypes] =
      await Promise.all([
        this.prisma.customer.findMany({
          select: { job: true },
          distinct: ["job"],
          orderBy: { job: "asc" },
        }),
        this.prisma.customer.findMany({
          select: { marital: true },
          distinct: ["marital"],
          orderBy: { marital: "asc" },
        }),
        this.prisma.customer.findMany({
          select: { education: true },
          distinct: ["education"],
          orderBy: { education: "asc" },
        }),
        this.prisma.customer.findMany({
          select: { housing: true },
          distinct: ["housing"],
          orderBy: { housing: "asc" },
        }),
      ]);

    const scoreStats = await this.prisma.customer.aggregate({
      where: { score: { not: null } },
      _min: { score: true },
      _max: { score: true },
      _avg: { score: true },
    });

    return {
      jobOptions: jobs.map((j) => j.job).filter(Boolean),
      maritalOptions: maritalStatuses.map((m) => m.marital).filter(Boolean),
      educationOptions: educationLevels.map((e) => e.education).filter(Boolean),
      housingOptions: housingTypes.map((h) => h.housing).filter(Boolean),
      scoreRange: {
        min: scoreStats._min.score,
        max: scoreStats._max.score,
        avg: scoreStats._avg.score,
      },
    };
  }

  /**
   * Assign customer to sales
   * @param {number} customerId - Customer ID
   * @param {number} salesId - Sales user ID
   * @returns {Promise<Object>} Updated customer
   */
  async assignToSales(customerId, salesId) {
    return this.prisma.customer.update({
      where: { id: customerId },
      data: { salesId },
      include: {
        assignedTo: {
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
   * Unassign customer from sales
   * @param {number} customerId - Customer ID
   * @returns {Promise<Object>} Updated customer
   */
  async unassignFromSales(customerId) {
    return this.prisma.customer.update({
      where: { id: customerId },
      data: { salesId: null },
    });
  }

  /**
   * Count customers by sales ID
   * @param {number} salesId - Sales user ID
   * @returns {Promise<number>} Number of customers
   */
  async countBySalesId(salesId) {
    return this.prisma.customer.count({
      where: { salesId },
    });
  }

  /**
   * Check if customer exists
   * @param {number} id - Customer ID
   * @returns {Promise<boolean>} True if exists
   */
  async exists(id) {
    const count = await this.prisma.customer.count({
      where: { id: parseInt(id) },
    });
    return count > 0;
  }

  /**
   * Create new customer
   * @param {Object} customerData - Customer data
   * @returns {Promise<Object>} Created customer
   */
  async create(customerData) {
    return this.prisma.customer.create({
      data: customerData,
    });
  }

  /**
   * Update customer
   * @param {number} id - Customer ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Updated customer
   */
  async update(id, updateData) {
    return this.prisma.customer.update({
      where: { id: parseInt(id) },
      data: updateData,
    });
  }

  /**
   * Delete customer
   * @param {number} id - Customer ID
   * @returns {Promise<Object>} Deleted customer
   */
  async delete(id) {
    return this.prisma.customer.delete({
      where: { id: parseInt(id) },
    });
  }
}

module.exports = CustomerRepository;
