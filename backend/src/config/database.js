const { PrismaClient } = require("@prisma/client");
const { config } = require("./index");

let prismaInstance = null;

/**
 * Get Prisma Client instance (Singleton)
 * @returns {PrismaClient}
 */
const getPrismaClient = () => {
  if (!prismaInstance) {
    prismaInstance = new PrismaClient({
      log: config.server.env === "development" ? ["warn", "error"] : ["error"],
      errorFormat: config.server.env === "development" ? "pretty" : "minimal",
    });

    // Handle graceful shutdown
    process.on("beforeExit", async () => {
      await prismaInstance.$disconnect();
    });
  }

  return prismaInstance;
};

/**
 * Connect to database
 * @returns {Promise<void>}
 */
const connectDatabase = async () => {
  try {
    const prisma = getPrismaClient();
    await prisma.$connect();
    console.log("Database connected successfully");
  } catch (error) {
    console.error("Database connection failed:", error.message);
    throw error;
  }
};

/**
 * Disconnect from database
 * @returns {Promise<void>}
 */
const disconnectDatabase = async () => {
  try {
    if (prismaInstance) {
      await prismaInstance.$disconnect();
      console.log("Database disconnected");
    }
  } catch (error) {
    console.error("Error disconnecting database:", error.message);
    throw error;
  }
};

/**
 * Check database health
 * @returns {Promise<boolean>}
 */
const checkDatabaseHealth = async () => {
  try {
    const prisma = getPrismaClient();
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error("Database health check failed:", error.message);
    return false;
  }
};

module.exports = {
  getPrismaClient,
  connectDatabase,
  disconnectDatabase,
  checkDatabaseHealth,
};
