import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import * as schema from "./schema";

function getMigrationConnection() {
  const databaseUrl = process.env.POSTGRES_URL;

  if (!databaseUrl) {
    throw new Error(
      "POSTGRES_URL environment variable is required for migrations."
    );
  }

  // Create PostgreSQL connection for migrations
  const migrationClient = postgres(databaseUrl, { max: 1 });
  const db = drizzle(migrationClient, { schema });

  return { db, client: migrationClient };
}

export async function runMigrations() {
  const { db, client } = getMigrationConnection();

  try {
    console.log("Running database migrations...");
    await migrate(db, { migrationsFolder: "./src/lib/db/migrations" });
    console.log("Migrations completed successfully!");

    // Close the migration connection
    await client.end();
  } catch (error) {
    console.error("Migration failed:", error);
    await client.end();
    throw error;
  }
}

// Function to check if migrations are needed
export async function checkMigrationStatus() {
  const databaseUrl = process.env.POSTGRES_URL;

  if (!databaseUrl) {
    throw new Error("POSTGRES_URL environment variable is required.");
  }

  const client = postgres(databaseUrl, { max: 1 });

  try {
    // Check if the users table exists
    const result = await client`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      );
    `;

    await client.end();
    return result[0]?.exists || false;
  } catch (error) {
    console.error("Error checking migration status:", error);
    await client.end();
    return false;
  }
}
