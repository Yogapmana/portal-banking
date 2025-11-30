const { verifyAccessToken } = require("../config/jwt");

const authMiddleware = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Access denied. No token provided.",
    });
  }

  try {
    // Use the consistent verifyAccessToken function from jwt config
    const decoded = verifyAccessToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    let message = "Invalid token.";
    let status = 401;

    if (error.message.includes("Access token expired")) {
      message = "Access token expired";
      status = 401;
    } else if (error.message.includes("Invalid access token")) {
      message = "Invalid access token";
      status = 401;
    }

    return res.status(status).json({
      success: false,
      message,
      error: "AUTH_ERROR",
    });
  }
};

// Middleware untuk role-based access
const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Insufficient permissions.",
        error: "INSUFFICIENT_PERMISSIONS",
      });
    }

    next();
  };
};

// Helper middleware untuk admin only
const requireAdmin = requireRole(["ADMIN"]);

// Helper middleware untuk admin dan manager
const requireAdminOrManager = requireRole(["ADMIN", "SALES_MANAGER"]);

// Helper middleware untuk sales manager only
const requireSalesManager = requireRole(["SALES_MANAGER"]);

module.exports = {
  authMiddleware,
  requireRole,
  requireAdmin,
  requireAdminOrManager,
  requireSalesManager,
};
