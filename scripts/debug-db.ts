#!/usr/bin/env tsx

// Load environment variables from .env.local
import { config } from "dotenv";
config({ path: ".env.local" });

import { testConnection, healthCheck, db } from "../src/lib/db";
import { users } from "../src/lib/db/schema";

async function debugDatabase() {
  console.log("🔍 Database Debug Information\n");

  // Check environment variables
  console.log("📋 Environment Variables:");
  console.log(`   NODE_ENV: ${process.env.NODE_ENV}`);
  console.log(
    `   POSTGRES_URL: ${process.env.POSTGRES_URL ? "✅ Set" : "❌ Not set"}`
  );
  console.log(
    `   POSTGRES_URL_NON_POOLING: ${
      process.env.POSTGRES_URL_NON_POOLING ? "✅ Set" : "❌ Not set"
    }\n`
  );

  if (!process.env.POSTGRES_URL) {
    console.error("❌ POSTGRES_URL environment variable is not set!");
    console.log(
      "Please add your Vercel Postgres connection string to .env.local"
    );
    process.exit(1);
  }

  try {
    // Test basic connection
    console.log("🔌 Testing database connection...");
    const isConnected = await testConnection();
    console.log(`   Connection: ${isConnected ? "✅ Success" : "❌ Failed"}\n`);

    if (!isConnected) {
      console.error("❌ Cannot connect to database");
      process.exit(1);
    }

    // Health check
    console.log("🏥 Database health check...");
    const health = await healthCheck();
    console.log(`   Status: ${health.status}`);
    console.log(`   Timestamp: ${health.timestamp}`);
    console.log(`   Connection: ${health.connection}\n`);

    // Check if tables exist
    console.log("📊 Checking database tables...");
    try {
      const tableCheck = await db.select().from(users).limit(1);
      console.log("   Users table: ✅ Exists and accessible");
    } catch (error) {
      console.log("   Users table: ❌ Not accessible");
      console.log("   Error:", error instanceof Error ? error.message : error);
      console.log("\n💡 Try running: npm run db:setup");
    }

    // Count existing users
    try {
      const userCount = await db.select().from(users);
      console.log(`   Existing users: ${userCount.length}\n`);

      if (userCount.length > 0) {
        console.log("👥 Existing users:");
        userCount.forEach((user, index) => {
          console.log(
            `   ${index + 1}. ${user.email} (${
              user.isWhitelisted ? "whitelisted" : "not whitelisted"
            })`
          );
        });
      }
    } catch (error) {
      console.log(
        "   Could not count users:",
        error instanceof Error ? error.message : error
      );
    }
  } catch (error) {
    console.error("❌ Database debug failed:", error);

    if (error instanceof Error) {
      console.error("Error details:", error.message);
    }
  }
}

debugDatabase();
