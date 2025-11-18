const { asyncHandler } = require("../middleware/errorHandler");

/**
 * Authentication Controller
 * Handles HTTP requests for authentication
 */
class AuthController {
  constructor(authService) {
    this.authService = authService;
  }

  /**
   * Register new user (Admin only)
   * @route POST /api/auth/register/admin
   */
  register = asyncHandler(async (req, res) => {
    const { email, password, role } = req.body;

    const result = await this.authService.register({
      email,
      password,
      role,
    });

    res.status(201).json({
      success: true,
      message: `User ${result.user.role} berhasil dibuat`,
      data: result,
    });
  });

  /**
   * Login user
   * @route POST /api/auth/login
   */
  login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const result = await this.authService.login({
      email,
      password,
    });

    res.json({
      success: true,
      message: "Login berhasil",
      data: result,
    });
  });

  /**
   * Get all users (Admin only)
   * @route GET /api/auth/users
   */
  getAllUsers = asyncHandler(async (req, res) => {
    const users = await this.authService.getAllUsers();

    res.json({
      success: true,
      data: users,
    });
  });

  /**
   * Get user by ID
   * @route GET /api/auth/users/:id
   */
  getUserById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const user = await this.authService.getUserById(parseInt(id));

    res.json({
      success: true,
      data: user,
    });
  });

  /**
   * Update user
   * @route PUT /api/auth/users/:id
   */
  updateUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;

    const user = await this.authService.updateUser(parseInt(id), updateData);

    res.json({
      success: true,
      message: "User berhasil diupdate",
      data: user,
    });
  });

  /**
   * Delete user
   * @route DELETE /api/auth/users/:id
   */
  deleteUser = asyncHandler(async (req, res) => {
    const { id } = req.params;

    await this.authService.deleteUser(parseInt(id));

    res.json({
      success: true,
      message: "User berhasil dihapus",
    });
  });

  /**
   * Get current user profile
   * @route GET /api/auth/me
   */
  getProfile = asyncHandler(async (req, res) => {
    const userId = req.user.userId;

    const user = await this.authService.getUserById(userId);

    res.json({
      success: true,
      data: user,
    });
  });

  /**
   * Change password
   * @route POST /api/auth/change-password
   */
  changePassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user.userId;

    await this.authService.changePassword(userId, oldPassword, newPassword);

    res.json({
      success: true,
      message: "Password berhasil diubah",
    });
  });

  /**
   * Get list of SALES users (SALES_MANAGER only)
   * @route GET /api/auth/sales-list
   */
  getSalesList = asyncHandler(async (req, res) => {
    const users = await this.authService.getUsersByRole("SALES");

    res.json({
      success: true,
      data: users,
    });
  });

  /**
   * Public registration endpoint (disabled)
   * @route POST /api/auth/register
   */
  publicRegister = asyncHandler(async (req, res) => {
    return res.status(403).json({
      success: false,
      error:
        "Registrasi publik tidak tersedia. Hubungi admin untuk membuat akun.",
    });
  });
}

module.exports = AuthController;
