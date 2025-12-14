const {
  NotFoundError,
  ValidationError,
  AuthorizationError,
} = require("../middleware/errorHandler");
const { config } = require("../config");
const crypto = require("crypto");
const ScoringService = require("./scoringService");

/**
 * Customer Service
 * Handles business logic for customer management with optional Redis caching
 */
class CustomerService {
  constructor(customerRepository, userRepository, redisService = null) {
    this.customerRepository = customerRepository;
    this.userRepository = userRepository;
    this.redis = redisService;
    this.scoringService = new ScoringService();
  }

  /**
   * Generate cache key based on method and parameters
   * @param {string} method - Method name
   * @param {Object} params - Parameters
   * @returns {string} Cache key
   */
  _generateCacheKey(method, params) {
    const sortedParams = Object.keys(params || {})
      .sort()
      .reduce((acc, key) => {
        acc[key] = params[key];
        return acc;
      }, {});

    const hash = crypto
      .createHash("md5")
      .update(JSON.stringify(sortedParams))
      .digest("hex");

    return `customers:${method}:${hash}`;
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
      // SALES only see customers assigned to them
      const salesCondition = { salesId: user.userId };

      if (searchConditions.length > 0) {
        where.AND = [salesCondition, { OR: searchConditions }];
      } else {
        where.salesId = user.userId;
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
   * Get customers without call logs with pagination and filters
   * @param {Object} params - Query parameters
   * @param {Object} user - Authenticated user
   * @returns {Promise<Object>} Customers with pagination and stats
   */
  async getPendingCustomers(params, user) {
    const {
      page = config.pagination.defaultPage,
      limit = config.pagination.defaultLimit,
      sortBy = "score",
      sortOrder = "desc",
      ...filters
    } = params;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = Math.min(parseInt(limit), config.pagination.maxLimit);

    // Build base where clause (without role-based filtering)
    const { search, minScore, maxScore, job, marital, education, housing } =
      filters;
    const where = {};

    // Search by name, phone number, or job
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { phoneNumber: { contains: search, mode: "insensitive" } },
        { job: { contains: search, mode: "insensitive" } },
      ];
    }

    // Score range filter
    if (minScore !== undefined || maxScore !== undefined) {
      const scoreCondition = {};
      if (minScore !== undefined) scoreCondition.gte = parseFloat(minScore);
      if (maxScore !== undefined) scoreCondition.lte = parseFloat(maxScore);
      where.score = scoreCondition;
    }

    // Exact match filters
    if (job) where.job = job;
    if (marital) where.marital = marital;
    if (education) where.education = education;
    if (housing) where.housing = housing;

    const orderBy = this._buildOrderClause(sortBy, sortOrder);

    // Get customers and total count using the new method
    const { customers, total } =
      await this.customerRepository.findManyWithoutCallLogs({
        skip,
        take,
        where,
        orderBy,
        userId: user.role === "SALES" ? user.userId : null,
      });

    // Build where clause for statistics (same logic as above)
    const statsWhere = { ...where };
    if (user.role === "SALES") {
      statsWhere.salesId = user.userId;
    }

    // Get statistics for pending customers
    const stats = await this.customerRepository.getStatistics(statsWhere);

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
    // Try cache first if Redis available
    if (this.redis) {
      const cacheKey = this._generateCacheKey("getCustomerById", {
        customerId,
      });
      const cached = await this.redis.get(cacheKey);

      if (cached) {
        // Still need to check authorization
        if (user.role === "SALES") {
          if (cached.salesId !== null && cached.salesId !== user.userId) {
            throw new AuthorizationError(
              "Anda tidak memiliki akses ke customer ini"
            );
          }
        }
        return cached;
      }
    }

    // Fetch from database
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

    // Cache the result
    if (this.redis) {
      const cacheKey = this._generateCacheKey("getCustomerById", {
        customerId,
      });
      await this.redis.set(cacheKey, customer, "customer");
    }

    return customer;
  }

  /**
   * Get filter options
   * @returns {Promise<Object>} Filter options
   */
  async getFilterOptions() {
    // Try cache first
    if (this.redis) {
      const cacheKey = "customers:filterOptions";
      return this.redis.getOrSet(
        cacheKey,
        () => this.customerRepository.getFilterOptions(),
        "filterOptions"
      );
    }

    // Fallback to direct query
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
    const result = await this.customerRepository.assignToSales(
      customerId,
      salesId
    );

    // Invalidate cache
    if (this.redis) {
      await this.redis.invalidateCustomer(customerId);
    }

    return result;
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
    const result = await this.customerRepository.unassignFromSales(customerId);

    // Invalidate cache
    if (this.redis) {
      await this.redis.invalidateCustomer(customerId);
    }

    return result;
  }

  /**
   * Bulk assign customers to sales
   * @param {Array<number>} customerIds - Array of customer IDs
   * @param {number} salesId - Sales user ID
   * @param {Object} user - Authenticated user (must be SALES_MANAGER)
   * @returns {Promise<Object>} Result with count
   */
  async bulkAssignCustomers(customerIds, salesId, user) {
    // Only SALES_MANAGER can bulk assign
    if (user.role !== "SALES_MANAGER") {
      throw new AuthorizationError(
        "Hanya Sales Manager yang dapat melakukan bulk assign"
      );
    }

    // Verify sales user exists and has SALES role
    const salesUser = await this.userRepository.findById(salesId);
    if (!salesUser) {
      throw new NotFoundError("Sales user tidak ditemukan");
    }

    if (salesUser.role !== "SALES") {
      throw new ValidationError("User yang dipilih bukan Sales");
    }

    // Bulk update
    const count = await this.customerRepository.bulkUpdateSalesId(
      customerIds,
      salesId
    );

    return {
      count,
      salesId,
      salesEmail: salesUser.email,
    };
  }

  /**
   * Bulk unassign customers from sales
   * @param {Array<number>} customerIds - Array of customer IDs
   * @param {Object} user - Authenticated user (must be SALES_MANAGER)
   * @returns {Promise<Object>} Result with count
   */
  async bulkUnassignCustomers(customerIds, user) {
    // Only SALES_MANAGER can bulk unassign
    if (user.role !== "SALES_MANAGER") {
      throw new AuthorizationError(
        "Hanya Sales Manager yang dapat melakukan bulk unassign"
      );
    }

    // Bulk update to null
    const count = await this.customerRepository.bulkUpdateSalesId(
      customerIds,
      null
    );

    return {
      count,
    };
  }

  /**
   * Create new customer with ML-generated score
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

    // Generate score using ML service
    const scoreResult = await this.scoringService.calculateScore(customerData);

    // Use probability (0-1) for database storage, not score (0-100)
    const normalizedScore =
      scoreResult.probability !== undefined
        ? scoreResult.probability
        : scoreResult.score / 100;

    // Generate unique originalId (timestamp-based)
    const timestamp = Date.now();
    const randomSuffix = Math.floor(Math.random() * 1000);
    const originalId = parseInt(`${timestamp}${randomSuffix}`.slice(-9));

    // Add score and originalId to customer data
    const dataWithScore = {
      ...customerData,
      score: normalizedScore,
      originalId: originalId,
      // Set default values for required fields
      duration: customerData.duration || 0,
    };

    const result = await this.customerRepository.create(dataWithScore);

    // Invalidate all customers cache since list changed
    if (this.redis) {
      await this.redis.invalidateAllCustomers();
    }

    return {
      ...result,
      scoreInfo: {
        score: normalizedScore,
        priority: scoreResult.priority,
        probability: scoreResult.probability,
      },
    };
  }

  /**
   * Update customer with optional score recalculation
   * @param {number} customerId - Customer ID
   * @param {Object} updateData - Data to update
   * @param {Object} user - Authenticated user
   * @param {boolean} recalculateScore - Whether to recalculate score
   * @returns {Promise<Object>} Updated customer
   */
  async updateCustomer(customerId, updateData, user, recalculateScore = false) {
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

    let dataToUpdate = { ...updateData };
    let scoreInfo = null;

    // Recalculate score if requested or if relevant fields changed
    const scoreRelevantFields = [
      "age",
      "job",
      "marital",
      "education",
      "default",
      "housing",
      "loan",
    ];
    const hasScoreRelevantChanges = scoreRelevantFields.some(
      (field) => updateData[field] !== undefined
    );

    if (recalculateScore || hasScoreRelevantChanges) {
      // Only use raw fields for scoring, exclude score and derived fields
      const {
        score: _score,
        probability: _probability,
        priority: _priority,
        method: _method,
        mlBonus: _mlBonus,
        mlProbability: _mlProbability,
        ...rawCustomer
      } = customer;
      const mergedData = {
        ...rawCustomer,
        ...updateData,
      };
      const scoreResult = await this.scoringService.calculateScore(mergedData);
      // Store score as probability (0-1) in DB, not 0-100
      dataToUpdate.score =
        scoreResult.probability !== undefined
          ? scoreResult.probability
          : scoreResult.score / 100;
      scoreInfo = {
        score: scoreResult.score,
        priority: scoreResult.priority,
        probability: scoreResult.probability,
        recalculated: true,
      };
    }

    // Clear conversation guide cache if profile data changed
    if (hasScoreRelevantChanges) {
      dataToUpdate.conversationGuide = null;
    }

    const result = await this.customerRepository.update(
      customerId,
      dataToUpdate
    );

    // Invalidate cache - both individual customer and list cache
    if (this.redis) {
      await this.redis.invalidateCustomer(customerId);
      await this.redis.invalidateAllCustomers(); // Clear list cache so refresh shows new data
    }

    return scoreInfo ? { ...result, scoreInfo } : result;
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

    const result = await this.customerRepository.delete(customerId);

    // Invalidate cache
    if (this.redis) {
      await this.redis.invalidateCustomer(customerId);
      await this.redis.invalidateAllCustomers();
    }

    return result;
  }

  /**
   * Get customer count by sales ID
   * @param {number} salesId - Sales user ID
   * @returns {Promise<number>} Number of customers
   */
  async getCustomerCountBySales(salesId) {
    return this.customerRepository.countBySalesId(salesId);
  }

  /**
   * Recalculate score for a customer using ML model
   * @param {number} customerId - Customer ID
   * @param {Object} user - Authenticated user
   * @returns {Promise<Object>} Updated customer with new score
   */
  async recalculateScore(customerId, user) {
    // Only admin can recalculate scores
    if (user.role !== "ADMIN") {
      throw new AuthorizationError(
        "Hanya Admin yang dapat menghitung ulang skor"
      );
    }

    // Get existing customer
    const customer = await this.customerRepository.findById(customerId);
    if (!customer) {
      throw new NotFoundError("Customer");
    }

    // Calculate new score using ML service
    const scoreResult = await this.scoringService.calculateScore(customer);

    // Normalize score to 0-1 range
    const normalizedScore =
      scoreResult.probability !== undefined
        ? scoreResult.probability
        : scoreResult.score / 100;

    // Update customer with new score
    const updatedCustomer = await this.customerRepository.update(customerId, {
      score: normalizedScore,
    });

    // Invalidate cache
    if (this.redis) {
      await this.redis.invalidateCustomer(customerId);
      await this.redis.invalidateAllCustomers();
    }

    return {
      ...updatedCustomer,
      scoreInfo: {
        score: normalizedScore,
        probability: scoreResult.probability,
        priority: scoreResult.priority,
      },
    };
  }
}

module.exports = CustomerService;
