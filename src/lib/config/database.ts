// Database configuration
export const databaseConfig = {
  // Vercel Postgres connection URL
  url: process.env.POSTGRES_URL,

  // Connection pool settings
  pooling: {
    max: 20,
    min: 5,
    idle: 10000,
  },

  // Migration settings
  migrations: {
    folder: "./src/lib/db/migrations",
    table: "__drizzle_migrations",
  },

  // Environment checks
  isProduction: process.env.NODE_ENV === "production",
  isDevelopment: process.env.NODE_ENV === "development",

  // Validation
  validate() {
    if (!this.url) {
      throw new Error(
        "POSTGRES_URL environment variable is required. " +
          "Please set up your Vercel Postgres database and add the connection string to your environment variables."
      );
    }

    return true;
  },

  // Get connection info (without exposing sensitive data)
  getConnectionInfo() {
    if (!this.url) return null;

    try {
      const url = new URL(this.url);
      return {
        host: url.hostname,
        port: url.port || "5432",
        database: url.pathname.slice(1),
        ssl: url.searchParams.get("sslmode") !== "disable",
      };
    } catch {
      return null;
    }
  },
};

// Validate configuration on import
if (typeof window === "undefined") {
  // Only validate on server-side
  try {
    databaseConfig.validate();
  } catch (error) {
    console.warn("Database configuration warning:", error);
  }
}
