import { sql } from "@vercel/postgres";
import { drizzle } from "drizzle-orm/vercel-postgres";
import { migrate } from "drizzle-orm/vercel-postgres/migrator";
import * as schema from "./schema";

// Create database instance for migrations using Vercel Postgres
const db = drizzle(sql, { schema });

export async function runMigrations() {
  try {
    console.log("Running database migrations...");
    await migrate(db, { migrationsFolder: "./src/lib/db/migrations" });
    console.log("Migrations completed successfully!");
  } catch (error) {
    console.error("Migration failed:", error);
    throw error;
  }
}

// Function to check if migrations are needed
export async function checkMigrationStatus() {
  try {
    // Check if the users table exists
    const result = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      );
    `;

    return result.rows[0]?.exists || false;
  } catch (error) {
    console.error("Error checking migration status:", error);
    return false;
  }
}

// Export the database instance
export { db };
