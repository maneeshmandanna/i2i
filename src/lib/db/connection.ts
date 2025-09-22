import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// Detect if we're using Neon or other external Postgres
function isNeonDatabase(): boolean {
  return !!(
    process.env.POSTGRES_URL && process.env.POSTGRES_URL.includes("neon.tech")
  );
}

// Lazy-loaded database connection
let _db: any = null;
let _client: any = null;

function getConnection() {
  if (!_db) {
    const databaseUrl = process.env.POSTGRES_URL;

    if (!databaseUrl) {
      throw new Error(
        "POSTGRES_URL environment variable is required. Please check your .env.local file."
      );
    }

    // Use postgres-js for all connections (works with Neon, Supabase, etc.)
    console.log("🐘 Using Postgres connection");
    _client = postgres(databaseUrl, {
      prepare: false,
      // Optimize for serverless and Neon
      max: 1,
      idle_timeout: 20,
      connect_timeout: 10,
    });
    _db = drizzle(_client, { schema });
  }

  return { db: _db, client: _client };
}

// Export the database connection
export const db = new Proxy({} as ReturnType<typeof drizzle>, {
  get(target, prop) {
    const { db } = getConnection();
    return db[prop as keyof typeof db];
  },
});

// Connection utility functions
export async function testConnection(): Promise<boolean> {
  try {
    const { client } = getConnection();
    await client`SELECT 1`;
    return true;
  } catch (error) {
    console.error("Database connection failed:", error);
    return false;
  }
}

// Health check function
export async function healthCheck() {
  try {
    const { client } = getConnection();
    const result = await client`SELECT NOW() as current_time`;

    return {
      status: "healthy",
      timestamp: result[0]?.current_time,
      connection: "active",
      provider: isNeonDatabase() ? "neon-postgres" : "external-postgres",
    };
  } catch (error) {
    return {
      status: "unhealthy",
      error: error instanceof Error ? error.message : "Unknown error",
      connection: "failed",
      provider: isNeonDatabase() ? "neon-postgres" : "external-postgres",
    };
  }
}

// Export the database instance as default
export default db;
