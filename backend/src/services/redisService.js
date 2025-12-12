const { createClient } = require("redis");
const { config } = require("../config");

class RedisService {
  constructor() {
    this.client = null;
    this.connected = false;
    this.connectionAttempted = false;
    this.keyPrefix = config.redis?.keyPrefix || "app:";
    this.ttl = {
      customer: 300,
      user: 600,
      filterOptions: 900,
      callLog: 300,
    };
  }

  async connect() {
    if (this.connectionAttempted) return;
    this.connectionAttempted = true;

    try {
      const redisUrl =
        config.redis?.url || process.env.REDIS_URL || "redis://localhost:6379";

      this.client = createClient({
        url: redisUrl,
        password: config.redis?.password,
        socket: {
          connectTimeout: 5000,
          reconnectStrategy: false,
        },
      });

      this.client.on("error", (error) => {
        if (!this.connected) {
          console.warn(
            "Redis unavailable - running without cache:",
            error.message
          );
        }
        this.connected = false;
      });

      this.client.on("connect", () => {
        console.log("Redis connected successfully");
        this.connected = true;
      });

      this.client.on("disconnect", () => {
        this.connected = false;
      });

      await this.client.connect();
      await this.client.ping();

      console.log("Redis cache service initialized");
    } catch (error) {
      console.warn("Redis connection failed - running without cache");
      this.connected = false;
      this.client = null;
    }
  }

  isAvailable() {
    return this.connected && this.client !== null;
  }

  _generateKey(key) {
    return `${this.keyPrefix}${key}`;
  }

  _getTTL(type) {
    return this.ttl[type] || 300;
  }

  async set(key, value, type = "customer") {
    if (!this.isAvailable()) return false;

    try {
      const prefixedKey = this._generateKey(key);
      const serializedValue = JSON.stringify(value);
      const ttl = this._getTTL(type);

      await this.client.setEx(prefixedKey, ttl, serializedValue);
      return true;
    } catch (error) {
      console.error("Redis set error:", error.message);
      return false;
    }
  }

  async get(key) {
    if (!this.isAvailable()) return null;

    try {
      const prefixedKey = this._generateKey(key);
      const value = await this.client.get(prefixedKey);

      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error("Redis get error:", error.message);
      return null;
    }
  }

  async delete(key) {
    if (!this.isAvailable()) return false;

    try {
      const prefixedKey = this._generateKey(key);
      await this.client.del(prefixedKey);
      return true;
    } catch (error) {
      console.error("Redis delete error:", error.message);
      return false;
    }
  }

  async deletePattern(pattern) {
    if (!this.isAvailable()) return 0;

    try {
      const prefixedPattern = this._generateKey(pattern);

      // Use KEYS command to find matching keys
      const keys = await this.client.keys(prefixedPattern);

      if (!keys || !Array.isArray(keys) || keys.length === 0) {
        return 0;
      }

      // Filter valid string keys and delete one by one
      let deletedCount = 0;
      for (const key of keys) {
        if (typeof key === "string" && key.length > 0) {
          try {
            await this.client.del(key);
            deletedCount++;
          } catch {
            // Ignore individual delete errors
          }
        }
      }

      return deletedCount;
    } catch (error) {
      // Silently fail - cache invalidation failure shouldn't break the app
      return 0;
    }
  }

  async getOrSet(key, queryFn, type = "customer") {
    const cached = await this.get(key);
    if (cached !== null) {
      return cached;
    }

    const result = await queryFn();

    if (result !== null && result !== undefined) {
      this.set(key, result, type).catch(() => {});
    }

    return result;
  }

  async invalidateCustomer(customerId) {
    if (!this.isAvailable()) return;

    try {
      // Clear all customer-related caches to ensure fresh data
      await this.invalidateAllCustomers();
    } catch (error) {
      // Silently fail
    }
  }

  async invalidateAllCustomers() {
    if (!this.isAvailable()) return;

    try {
      await this.deletePattern("customers:*");
    } catch (error) {
      // Silently fail
    }
  }

  async invalidateUser(userId) {
    if (!this.isAvailable()) return;

    try {
      await this.deletePattern(`users:*:${userId}:*`);
    } catch (error) {
      console.error("Error invalidating user cache:", error.message);
    }
  }

  async flush() {
    if (!this.isAvailable()) return false;

    try {
      await this.client.flushDb();
      console.log("Redis cache flushed");
      return true;
    } catch (error) {
      console.error("Redis flush error:", error.message);
      return false;
    }
  }

  async disconnect() {
    if (this.client) {
      try {
        await this.client.quit();
        console.log("Redis disconnected");
      } catch (error) {
        console.error("Error disconnecting Redis:", error.message);
      }
    }
  }
}

module.exports = RedisService;
