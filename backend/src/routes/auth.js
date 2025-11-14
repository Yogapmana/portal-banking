const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");
const { validate } = require("../middleware/validation");
const { asyncHandler, ConflictError, AuthenticationError, DatabaseError } = require("../middleware/errorHandler");

const router = express.Router();
const prisma = new PrismaClient();

// Register user
router.post("/register", validate("register"), asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new ConflictError("User dengan email ini sudah terdaftar");
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
      },
      select: {
        id: true,
        email: true,
      },
    });

    // Create JWT token - environment validation sudah di middleware
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      success: true,
      message: "User berhasil dibuat",
      data: {
        user,
        token,
      }
    });
  } catch (dbError) {
    throw new DatabaseError("Gagal membuat user", dbError);
  }
}));

// Login user
router.post("/login", validate("login"), asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Find user
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new AuthenticationError("Email atau password salah");
  }

  // Check password dengan timing-safe comparison
  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new AuthenticationError("Email atau password salah");
  }

  // Create JWT token
  const token = jwt.sign(
    { userId: user.id, email: user.email },
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
      },
      token,
    }
  });
}));

module.exports = router;
