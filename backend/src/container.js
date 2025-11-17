const { getPrismaClient } = require("./config/database");

// Repositories
const UserRepository = require("./repositories/userRepository");
const CustomerRepository = require("./repositories/customerRepository");

// Services
const AuthService = require("./services/authService");
const CustomerService = require("./services/customerService");

// Controllers
const AuthController = require("./controllers/authController");
const CustomerController = require("./controllers/customerController");

/**
 * Dependency Injection Container
 * Manages and provides instances of all application dependencies
 */
class Container {
  constructor() {
    this.dependencies = {};
    this._initializeDependencies();
  }

  /**
   * Initialize all dependencies in correct order
   * @private
   */
  _initializeDependencies() {
    // Database Client (Singleton)
    this.dependencies.prismaClient = getPrismaClient();

    // Repositories
    this.dependencies.userRepository = new UserRepository(
      this.dependencies.prismaClient
    );
    this.dependencies.customerRepository = new CustomerRepository(
      this.dependencies.prismaClient
    );

    // Services
    this.dependencies.authService = new AuthService(
      this.dependencies.userRepository
    );
    this.dependencies.customerService = new CustomerService(
      this.dependencies.customerRepository,
      this.dependencies.userRepository
    );

    // Controllers
    this.dependencies.authController = new AuthController(
      this.dependencies.authService
    );
    this.dependencies.customerController = new CustomerController(
      this.dependencies.customerService
    );
  }

  /**
   * Get dependency by name
   * @param {string} name - Dependency name
   * @returns {*} Dependency instance
   */
  get(name) {
    if (!this.dependencies[name]) {
      throw new Error(`Dependency '${name}' not found in container`);
    }
    return this.dependencies[name];
  }

  /**
   * Get Prisma Client
   * @returns {PrismaClient}
   */
  getPrismaClient() {
    return this.get("prismaClient");
  }

  /**
   * Get User Repository
   * @returns {UserRepository}
   */
  getUserRepository() {
    return this.get("userRepository");
  }

  /**
   * Get Customer Repository
   * @returns {CustomerRepository}
   */
  getCustomerRepository() {
    return this.get("customerRepository");
  }

  /**
   * Get Auth Service
   * @returns {AuthService}
   */
  getAuthService() {
    return this.get("authService");
  }

  /**
   * Get Customer Service
   * @returns {CustomerService}
   */
  getCustomerService() {
    return this.get("customerService");
  }

  /**
   * Get Auth Controller
   * @returns {AuthController}
   */
  getAuthController() {
    return this.get("authController");
  }

  /**
   * Get Customer Controller
   * @returns {CustomerController}
   */
  getCustomerController() {
    return this.get("customerController");
  }
}

// Export singleton instance
const container = new Container();

module.exports = container;
