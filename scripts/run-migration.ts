#!/usr/bin/env tsx

// Load environment variables from .env.local
import { config } from "dotenv";
config({ path: ".env.local" });

import { testConnection } from "../src/lib/db";
import { sql } from "drizzle-orm";
import { db } from "../src/lib/db/connection";

async function runMigration() {
  try {
    console.log("🔗 Testing database connection...");

    // Test connection first
    const isConnected = await testConnection();
    if (!isConnected) {
      console.error("❌ Database connection failed.");
      process.exit(1);
    }

    console.log("✅ Database connection successful");
    console.log("🔄 Running migration to add user roles...");

    // Add role column to users table
    await db.execute(
      sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'user' NOT NULL`
    );

    // Update existing users to have appropriate roles
    await db.execute(
      sql`UPDATE users SET role = 'admin' WHERE email = 'maneesh@maneeshmandanna.com'`
    );

    // Create index for role queries
    await db.execute(
      sql`CREATE INDEX IF NOT EXISTS idx_users_role ON users(role)`
    );

    console.log("✅ Migration completed successfully!");
    console.log("📋 Summary:");
    console.log("   - Added 'role' column to users table");
    console.log("   - Set maneesh@maneeshmandanna.com as admin");
    console.log("   - Created index on role column");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

// Run the migration
runMigration();
