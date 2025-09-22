#!/usr/bin/env tsx

// Load environment variables from .env.local
import { config } from "dotenv";
config({ path: ".env.local" });

import { runMigrations, seedDatabase, testConnection } from "../src/lib/db";

async function setupDatabase() {
  try {
    console.log("🚀 Setting up database...\n");

    // Test connection first
    console.log("1. Testing database connection...");
    const isConnected = await testConnection();
    if (!isConnected) {
      throw new Error(
        "Failed to connect to database. Please check your POSTGRES_URL environment variable."
      );
    }
    console.log("✅ Database connection successful\n");

    // Run migrations
    console.log("2. Running database migrations...");
    await runMigrations();
    console.log("✅ Migrations completed\n");

    // Seed initial data
    console.log("3. Seeding initial data...");
    await seedDatabase();
    console.log("✅ Seeding completed\n");

    console.log("🎉 Database setup completed successfully!");
  } catch (error) {
    console.error("❌ Database setup failed:", error);
    process.exit(1);
  }
}

// Run the setup if this script is executed directly
if (require.main === module) {
  setupDatabase();
}

export { setupDatabase };
