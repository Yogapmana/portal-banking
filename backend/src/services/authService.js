const bcrypt = require("bcryptjs");
const { config } = require("../config");
const { generateToken } = require("../config/jwt");
const {
  ConflictError,
  AuthenticationError,
  ValidationError,
  NotFoundError,
} = require("../middleware/errorHandler");

/**
 * Authentication Service
 * Handles business logic for authentication and user management
 */
class AuthService {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  /**
   * Register new user (Admin only)
   * @param {Object} userData - User registration data
   * @param {string} userData.email - User email
   * @param {string} userData.password - User password
   * @param {string} userData.role - User role
   * @returns {Promise<Object>} User and token
   */
  async register(userData) {
    const { email, password, role = "SALES" } = userData;

    // Check if user already exists
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new ConflictError("User dengan email ini sudah terdaftar");
    }

    // Validate role
    const validRoles = ["ADMIN", "SALES_MANAGER", "SALES"];
    if (!validRoles.includes(role.toUpperCase())) {
      throw new ValidationError(
        "Role tidak valid. Pilih: ADMIN, SALES_MANAGER, SALES"
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(
      password,
      config.security.bcryptSaltRounds
    );

    // Create user
    const user = await this.userRepository.create({
      email,
      password: hashedPassword,
      role: role.toUpperCase(),
    });

    // Generate token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      user,
      token,
    };
  }

  /**
   * Login user
   * @param {Object} credentials - Login credentials
   * @param {string} credentials.email - User email
   * @param {string} credentials.password - User password
   * @returns {Promise<Object>} User and token
   */
  async login(credentials) {
    const { email, password } = credentials;

    // Find user
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new AuthenticationError("Email atau password salah");
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new AuthenticationError("Email atau password salah");
    }

    // Generate token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      token,
    };
  }

  /**
   * Get all users
   * @returns {Promise<Array>} Array of users
   */
  async getAllUsers() {
    return this.userRepository.findAll({
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * Get user by ID
   * @param {number} userId - User ID
   * @returns {Promise<Object>} User object
   */
  async getUserById(userId) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError("User");
    }
    return user;
  }

  /**
   * Update user
   * @param {number} userId - User ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Updated user
   */
  async updateUser(userId, updateData) {
    // Check if user exists
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError("User");
    }

    // If updating password, hash it
    if (updateData.password) {
      updateData.password = await bcrypt.hash(
        updateData.password,
        config.security.bcryptSaltRounds
      );
    }

    // If updating email, check for conflicts
    if (updateData.email && updateData.email !== user.email) {
      const existingUser = await this.userRepository.findByEmail(
        updateData.email
      );
      if (existingUser) {
        throw new ConflictError("Email sudah digunakan");
      }
    }

    return this.userRepository.update(userId, updateData);
  }

  /**
   * Delete user
   * @param {number} userId - User ID
   * @returns {Promise<Object>} Deleted user
   */
  async deleteUser(userId) {
    // Check if user exists
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError("User");
    }

    return this.userRepository.delete(userId);
  }

  /**
   * Get users by role
   * @param {string} role - User role
   * @returns {Promise<Array>} Array of users
   */
  async getUsersByRole(role) {
    return this.userRepository.findByRole(role);
  }

  /**
   * Change password
   * @param {number} userId - User ID
   * @param {string} oldPassword - Current password
   * @param {string} newPassword - New password
   * @returns {Promise<void>}
   */
  async changePassword(userId, oldPassword, newPassword) {
    // Get user with password
    const user = await this.userRepository.findByEmail(
      (
        await this.userRepository.findById(userId)
      ).email
    );

    if (!user) {
      throw new NotFoundError("User");
    }

    // Verify old password
    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordValid) {
      throw new AuthenticationError("Password lama tidak sesuai");
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(
      newPassword,
      config.security.bcryptSaltRounds
    );

    // Update password
    await this.userRepository.update(userId, {
      password: hashedPassword,
    });
  }
}

module.exports = AuthService;
