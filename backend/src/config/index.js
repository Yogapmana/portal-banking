const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

const config = {
  // Server configuration
  server: {
    port: process.env.PORT || 8000,
    env: process.env.NODE_ENV || "development",
  },

  // Database configuration
  database: {
    url: process.env.DATABASE_URL,
  },

  // JWT configuration
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    algorithm: "HS256",
  },

  // CORS configuration
  cors: {
    origin: process.env.CORS_ORIGIN || "*",
    credentials: true,
  },

  // Security configuration
  security: {
    bcryptSaltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12,
  },

  // Pagination defaults
  pagination: {
    defaultPage: 1,
    defaultLimit: 20,
    maxLimit: 100,
  },
};

/**
 * Validate required environment variables
 */
const validateConfig = () => {
  const requiredEnvVars = ["DATABASE_URL", "JWT_SECRET"];

  const missingEnvVars = requiredEnvVars.filter(
    (envVar) => !process.env[envVar]
  );

  if (missingEnvVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingEnvVars.join(
        ", "
      )}\n\n` +
        `Please create a .env file with the following variables:\n` +
        `- DATABASE_URL=your-database-connection-string\n` +
        `- JWT_SECRET=your-very-secure-secret-key-here`
    );
  }

  // Validate JWT_SECRET strength
  if (process.env.JWT_SECRET.length < 32) {
    console.warn(
      "Warning: JWT_SECRET should be at least 32 characters for security"
    );
  }
};

module.exports = {
  config,
  validateConfig,
};
