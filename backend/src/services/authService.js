const bcrypt = require("bcryptjs");
const { config } = require("../config");
const { generateTokenPair, verifyRefreshToken, generateAccessToken } = require("../config/jwt");
const { PrismaClient } = require('@prisma/client');
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
    this.prisma = new PrismaClient();
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

    // Generate tokens
    const tokens = generateTokenPair({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Store refresh token in database
    await this.prisma.refreshToken.create({
      data: {
        token: tokens.refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        userAgent: null, // Will be set from request
        ipAddress: null, // Will be set from request
      },
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
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

    // Generate tokens
    const tokens = generateTokenPair({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Store refresh token in database
    await this.prisma.refreshToken.create({
      data: {
        token: tokens.refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        userAgent: null, // Will be set from request
        ipAddress: null, // Will be set from request
      },
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
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

  /**
   * Refresh access token
   * @param {string} refreshToken - Refresh token
   * @param {Object} context - Request context (userAgent, ipAddress)
   * @returns {Promise<Object>} New token pair
   */
  async refreshToken(refreshToken, context = {}) {
    try {
      // Verify refresh token
      const decoded = verifyRefreshToken(refreshToken);

      // Check if refresh token exists in database and is not revoked
      const storedToken = await this.prisma.refreshToken.findFirst({
        where: {
          token: refreshToken,
          revokedAt: null,
          expiresAt: {
            gt: new Date(),
          },
        },
        include: {
          user: true,
        },
      });

      if (!storedToken) {
        throw new AuthenticationError("Invalid refresh token");
      }

      // Generate new token pair
      const tokens = generateTokenPair({
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role,
      });

      // Store new refresh token
      await this.prisma.refreshToken.create({
        data: {
          token: tokens.refreshToken,
          userId: decoded.userId,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
          userAgent: context.userAgent,
          ipAddress: context.ipAddress,
        },
      });

      // Revoke old refresh token
      await this.prisma.refreshToken.update({
        where: {
          id: storedToken.id,
        },
        data: {
          revokedAt: new Date(),
        },
      });

      return {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      };
    } catch (error) {
      throw new AuthenticationError("Invalid or expired refresh token");
    }
  }

  /**
   * Logout user (revoke refresh token)
   * @param {string} refreshToken - Refresh token to revoke
   * @returns {Promise<void>}
   */
  async logout(refreshToken) {
    const storedToken = await this.prisma.refreshToken.findFirst({
      where: {
        token: refreshToken,
        revokedAt: null,
      },
    });

    if (storedToken) {
      await this.prisma.refreshToken.update({
        where: {
          id: storedToken.id,
        },
        data: {
          revokedAt: new Date(),
        },
      });
    }
  }

  /**
   * Logout all devices (revoke all refresh tokens for user)
   * @param {number} userId - User ID
   * @returns {Promise<void>}
   */
  async logoutAll(userId) {
    await this.prisma.refreshToken.updateMany({
      where: {
        userId: userId,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    });
  }

  /**
   * Clean up expired refresh tokens (maintenance)
   * @returns {Promise<number>} Number of deleted tokens
   */
  async cleanupExpiredTokens() {
    const result = await this.prisma.refreshToken.deleteMany({
      where: {
        OR: [
          {
            expiresAt: {
              lt: new Date(),
            },
          },
          {
            revokedAt: {
              not: null,
            },
          },
        ],
      },
    });

    return result.count;
  }
}

module.exports = AuthService;
