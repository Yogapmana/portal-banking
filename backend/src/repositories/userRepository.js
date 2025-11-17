/**
 * User Repository
 * Handles all database operations related to users
 */
class UserRepository {
  constructor(prismaClient) {
    this.prisma = prismaClient;
  }

  /**
   * Find user by email
   * @param {string} email - User email
   * @returns {Promise<Object|null>} User object or null
   */
  async findByEmail(email) {
    return this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        password: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  /**
   * Find user by ID
   * @param {number} id - User ID
   * @returns {Promise<Object|null>} User object or null
   */
  async findById(id) {
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  /**
   * Create new user
   * @param {Object} userData - User data
   * @param {string} userData.email - User email
   * @param {string} userData.password - Hashed password
   * @param {string} userData.role - User role
   * @returns {Promise<Object>} Created user
   */
  async create(userData) {
    return this.prisma.user.create({
      data: userData,
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  /**
   * Update user by ID
   * @param {number} id - User ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Updated user
   */
  async update(id, updateData) {
    return this.prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  /**
   * Delete user by ID
   * @param {number} id - User ID
   * @returns {Promise<Object>} Deleted user
   */
  async delete(id) {
    return this.prisma.user.delete({
      where: { id },
    });
  }

  /**
   * Get all users
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of users
   */
  async findAll(options = {}) {
    const { orderBy = { createdAt: "desc" } } = options;

    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy,
    });
  }

  /**
   * Count users
   * @param {Object} where - Where conditions
   * @returns {Promise<number>} Number of users
   */
  async count(where = {}) {
    return this.prisma.user.count({ where });
  }

  /**
   * Check if user exists by email
   * @param {string} email - User email
   * @returns {Promise<boolean>} True if exists
   */
  async existsByEmail(email) {
    const count = await this.prisma.user.count({
      where: { email },
    });
    return count > 0;
  }

  /**
   * Find users by role
   * @param {string} role - User role
   * @returns {Promise<Array>} Array of users
   */
  async findByRole(role) {
    return this.prisma.user.findMany({
      where: { role },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }
}

module.exports = UserRepository;
