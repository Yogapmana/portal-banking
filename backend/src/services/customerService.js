const {
  NotFoundError,
  ValidationError,
  AuthorizationError,
} = require("../middleware/errorHandler");
const { config } = require("../config");

/**
 * Customer Service
 * Handles business logic for customer management
 */
class CustomerService {
  constructor(customerRepository, userRepository) {
    this.customerRepository = customerRepository;
    this.userRepository = userRepository;
  }

  /**
   * Build where clause for customer queries
   * @param {Object} filters - Filter parameters
   * @param {Object} user - Authenticated user
   * @returns {Object} Where clause for Prisma
   */
  _buildWhereClause(filters, user) {
    const { search, minScore, maxScore, job, marital, education, housing } =
      filters;

    const where = {};
    const searchConditions = [];

    // Search by name, phone number, or job
    if (search) {
      searchConditions.push(
        { name: { contains: search, mode: "insensitive" } },
        { phoneNumber: { contains: search, mode: "insensitive" } },
        { job: { contains: search, mode: "insensitive" } }
      );
    }

    // Role-based filtering
    if (user.role === "SALES") {
      const salesConditions = [
        { salesId: null }, // Unassigned customers
        { salesId: user.userId }, // Assigned to this sales
      ];

      if (searchConditions.length > 0) {
        where.AND = [{ OR: salesConditions }, { OR: searchConditions }];
      } else {
        where.OR = salesConditions;
      }
    } else {
      // Admin and Sales Manager can see all customers
      if (searchConditions.length > 0) {
        where.OR = searchConditions;
      }
    }

    // Score range filter
    if (minScore !== undefined || maxScore !== undefined) {
      const scoreCondition = {};
      if (minScore !== undefined) scoreCondition.gte = parseFloat(minScore);
      if (maxScore !== undefined) scoreCondition.lte = parseFloat(maxScore);

      if (where.AND) {
        where.AND.push({ score: scoreCondition });
      } else {
        where.score = scoreCondition;
      }
    }

    // Exact match filters
    const exactFilters = {};
    if (job) exactFilters.job = job;
    if (marital) exactFilters.marital = marital;
    if (education) exactFilters.education = education;
    if (housing) exactFilters.housing = housing;

    // Add exact filters to where clause
    if (Object.keys(exactFilters).length > 0) {
      if (where.AND) {
        where.AND.push(exactFilters);
      } else {
        Object.assign(where, exactFilters);
      }
    }

    return where;
  }

  /**
   * Build order clause for customer queries
   * @param {string} sortBy - Field to sort by
   * @param {string} sortOrder - Sort order (asc/desc)
   * @returns {Object} Order clause for Prisma
   */
  _buildOrderClause(sortBy, sortOrder) {
    if (sortBy === "score") {
      return [{ score: sortOrder }, { originalId: "asc" }];
    }

    if (sortBy === "age") {
      return { age: sortOrder };
    }

    // Default: sort by score desc, then by originalId
    return [{ score: "desc" }, { originalId: "asc" }];
  }

  /**
   * Get customers with pagination and filters
   * @param {Object} params - Query parameters
   * @param {Object} user - Authenticated user
   * @returns {Promise<Object>} Customers with pagination and stats
   */
  async getCustomers(params, user) {
    const {
      page = config.pagination.defaultPage,
      limit = config.pagination.defaultLimit,
      sortBy = "score",
      sortOrder = "desc",
      ...filters
    } = params;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = Math.min(parseInt(limit), config.pagination.maxLimit);

    // Build query
    const where = this._buildWhereClause(filters, user);
    const orderBy = this._buildOrderClause(sortBy, sortOrder);

    // Get customers and total count
    const { customers, total } = await this.customerRepository.findMany({
      skip,
      take,
      where,
      orderBy,
    });

    // Get statistics
    const stats = await this.customerRepository.getStatistics(where);

    // Calculate pagination info
    const totalPages = Math.ceil(total / take);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    return {
      customers,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalCustomers: total,
        limit: take,
        hasNext,
        hasPrev,
      },
      stats,
    };
  }

  /**
   * Get customer by ID
   * @param {number} customerId - Customer ID
   * @param {Object} user - Authenticated user
   * @returns {Promise<Object>} Customer object
   */
  async getCustomerById(customerId, user) {
    const customer = await this.customerRepository.findById(customerId);

    if (!customer) {
      throw new NotFoundError("Customer");
    }

    // Role-based access check
    if (user.role === "SALES") {
      if (customer.salesId !== null && customer.salesId !== user.userId) {
        throw new AuthorizationError(
          "Anda tidak memiliki akses ke customer ini"
        );
      }
    }

    return customer;
  }

  /**
   * Get filter options
   * @returns {Promise<Object>} Filter options
   */
  async getFilterOptions() {
    return this.customerRepository.getFilterOptions();
  }

  /**
   * Assign customer to sales
   * @param {number} customerId - Customer ID
   * @param {number} salesId - Sales user ID
   * @param {Object} user - Authenticated user (must be admin or manager)
   * @returns {Promise<Object>} Updated customer
   */
  async assignCustomerToSales(customerId, salesId, user) {
    // Check permissions
    if (!["ADMIN", "SALES_MANAGER"].includes(user.role)) {
      throw new AuthorizationError(
        "Hanya Admin dan Sales Manager yang dapat assign customer"
      );
    }

    // Check if customer exists
    const customer = await this.customerRepository.findById(customerId);
    if (!customer) {
      throw new NotFoundError("Customer");
    }

    // Check if sales user exists and has SALES role
    const salesUser = await this.userRepository.findById(salesId);
    if (!salesUser) {
      throw new NotFoundError("Sales user");
    }

    if (salesUser.role !== "SALES") {
      throw new ValidationError("User harus memiliki role SALES");
    }

    // Assign customer
    return this.customerRepository.assignToSales(customerId, salesId);
  }

  /**
   * Unassign customer from sales
   * @param {number} customerId - Customer ID
   * @param {Object} user - Authenticated user (must be admin or manager)
   * @returns {Promise<Object>} Updated customer
   */
  async unassignCustomer(customerId, user) {
    // Check permissions
    if (!["ADMIN", "SALES_MANAGER"].includes(user.role)) {
      throw new AuthorizationError(
        "Hanya Admin dan Sales Manager yang dapat unassign customer"
      );
    }

    // Check if customer exists
    const customer = await this.customerRepository.findById(customerId);
    if (!customer) {
      throw new NotFoundError("Customer");
    }

    // Unassign customer
    return this.customerRepository.unassignFromSales(customerId);
  }

  /**
   * Create new customer
   * @param {Object} customerData - Customer data
   * @param {Object} user - Authenticated user
   * @returns {Promise<Object>} Created customer
   */
  async createCustomer(customerData, user) {
    // Only admin and manager can create customers
    if (!["ADMIN", "SALES_MANAGER"].includes(user.role)) {
      throw new AuthorizationError(
        "Hanya Admin dan Sales Manager yang dapat membuat customer"
      );
    }

    return this.customerRepository.create(customerData);
  }

  /**
   * Update customer
   * @param {number} customerId - Customer ID
   * @param {Object} updateData - Data to update
   * @param {Object} user - Authenticated user
   * @returns {Promise<Object>} Updated customer
   */
  async updateCustomer(customerId, updateData, user) {
    // Check if customer exists
    const customer = await this.customerRepository.findById(customerId);
    if (!customer) {
      throw new NotFoundError("Customer");
    }

    // Role-based access check
    if (user.role === "SALES") {
      if (customer.salesId !== user.userId) {
        throw new AuthorizationError(
          "Anda tidak dapat mengubah customer yang tidak di-assign ke Anda"
        );
      }
    }

    return this.customerRepository.update(customerId, updateData);
  }

  /**
   * Delete customer
   * @param {number} customerId - Customer ID
   * @param {Object} user - Authenticated user
   * @returns {Promise<Object>} Deleted customer
   */
  async deleteCustomer(customerId, user) {
    // Only admin can delete customers
    if (user.role !== "ADMIN") {
      throw new AuthorizationError("Hanya Admin yang dapat menghapus customer");
    }

    // Check if customer exists
    const customer = await this.customerRepository.findById(customerId);
    if (!customer) {
      throw new NotFoundError("Customer");
    }

    return this.customerRepository.delete(customerId);
  }

  /**
   * Get customer count by sales ID
   * @param {number} salesId - Sales user ID
   * @returns {Promise<number>} Number of customers
   */
  async getCustomerCountBySales(salesId) {
    return this.customerRepository.countBySalesId(salesId);
  }
}

module.exports = CustomerService;
