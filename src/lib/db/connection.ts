import { drizzle } from "drizzle-orm/vercel-postgres";
import { drizzle as drizzlePostgres } from "drizzle-orm/postgres-js";
import { sql } from "@vercel/postgres";
import postgres from "postgres";
import * as schema from "./schema";

// Detect if we're using Vercel Postgres or external database
function isVercelPostgres(): boolean {
  // Vercel Postgres sets these specific environment variables
  return !!(
    process.env.POSTGRES_URL &&
    (process.env.POSTGRES_PRISMA_URL || process.env.VERCEL_ENV)
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

    if (isVercelPostgres()) {
      // Use Vercel Postgres optimized connection
      console.log("🚀 Using Vercel Postgres connection");
      _db = drizzle(sql, { schema });
      _client = sql;
    } else {
      // Use standard PostgreSQL connection (for Supabase, local, etc.)
      console.log("🐘 Using standard PostgreSQL connection");
      _client = postgres(databaseUrl, {
        prepare: false,
        // Optimize for serverless
        max: 1,
        idle_timeout: 20,
        connect_timeout: 10,
      });
      _db = drizzlePostgres(_client, { schema });
    }
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

    if (isVercelPostgres()) {
      await client`SELECT 1`;
    } else {
      await client`SELECT 1`;
    }

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

    let result;
    if (isVercelPostgres()) {
      result = await client`SELECT NOW() as current_time`;
    } else {
      result = await client`SELECT NOW() as current_time`;
    }

    return {
      status: "healthy",
      timestamp: result.rows?.[0]?.current_time || result[0]?.current_time,
      connection: "active",
      provider: isVercelPostgres() ? "vercel-postgres" : "external-postgres",
    };
  } catch (error) {
    return {
      status: "unhealthy",
      error: error instanceof Error ? error.message : "Unknown error",
      connection: "failed",
      provider: isVercelPostgres() ? "vercel-postgres" : "external-postgres",
    };
  }
}

// Export the database instance as default
export default db;
