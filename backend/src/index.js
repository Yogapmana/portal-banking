// backend/src/index.js
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { PrismaClient } = require("@prisma/client");

const authRoutes = require("./routes/auth");
const customerRoutes = require("./routes/customers");
const {
  errorHandler,
  notFoundHandler,
  validateEnvironment,
} = require("./middleware/errorHandler");

const prisma = new PrismaClient();
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/customers", customerRoutes);

app.get("/api", (req, res) => {
  res.json({ message: "API berjalan!" });
});

// Custom error handling middleware (must be last)
app.use(errorHandler);

// 404 handler (must be before error handler)
app.use(notFoundHandler);

const startServer = async () => {
  try {
    // Validate environment variables first
    validateEnvironment();
    console.log("Environment validation passed");

    await prisma.$connect();
    console.log("Database connected successfully");

    app.listen(PORT, () => {
      console.log(`Backend server berjalan di http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    if (error.message.includes("Environment variable")) {
      console.error("\n💡 Setup Instructions:");
      console.error("1. Create .env file in backend directory");
      console.error("2. Add these variables:");
      console.error("   JWT_SECRET=your-very-secure-secret-key-here");
      console.error("   DATABASE_URL=your-database-connection-string");
    }
    process.exit(1);
  }
};

startServer();
