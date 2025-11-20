const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res
      .status(401)
      .json({ message: "Access denied. No token provided." });
  }

  try {
    // JWT_SECRET harus selalu ada di environment variables
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET environment variable is not configured");
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.message.includes("JWT_SECRET")) {
      return res.status(500).json({
        message: "Server configuration error",
      });
    }
    res.status(401).json({ message: "Invalid token." });
  }
};

// Middleware untuk role-based access
const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: "Access denied. Insufficient permissions.",
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
