const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");
const { validate } = require("../middleware/validation");
const { asyncHandler, ConflictError, AuthenticationError, DatabaseError, ValidationError } = require("../middleware/errorHandler");
const { authMiddleware, requireAdmin } = require("../middleware/auth");

const router = express.Router();
const prisma = new PrismaClient();

// Admin only - create user with specific role
router.post("/register/admin",
  authMiddleware,
  requireAdmin,
  validate("register"),
  asyncHandler(async (req, res) => {
    const { email, password, role = "SALES" } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictError("User dengan email ini sudah terdaftar");
    }

    // Validate role
    if (!["ADMIN", "SALES_MANAGER", "SALES"].includes(role.toUpperCase())) {
      throw new ValidationError("Role tidak valid. Pilih: ADMIN, SALES_MANAGER, SALES");
    }

    // Hash password dengan bcrypt
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user dengan try-catch khusus untuk database error
    try {
      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          role: role.toUpperCase(),
        },
        select: {
          id: true,
          email: true,
          role: true,
          createdAt: true,
        },
      });

      // Create JWT token
      const token = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      res.status(201).json({
        success: true,
        message: `User ${user.role} berhasil dibuat`,
        data: {
          user,
          token,
        }
      });
    } catch (dbError) {
      throw new DatabaseError("Gagal membuat user", dbError);
    }
  })
);

// Public registration - disabled for production
router.post("/register", validate("register"), asyncHandler(async (req, res) => {
  return res.status(403).json({
    success: false,
    error: "Registrasi publik tidak tersedia. Hubungi admin untuk membuat akun."
  });
}));

// Login user
router.post("/login", validate("login"), asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Find user with role
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      password: true,
      role: true,
      createdAt: true,
    },
  });

  if (!user) {
    throw new AuthenticationError("Email atau password salah");
  }

  // Check password dengan timing-safe comparison
  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new AuthenticationError("Email atau password salah");
  }

  // Create JWT token dengan role
  const token = jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.json({
    success: true,
    message: "Login berhasil",
    data: {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
      token,
    }
  });
}));

// Get all users (admin only)
router.get("/users",
  authMiddleware,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({
      success: true,
      data: users
    });
  })
);

module.exports = router;
