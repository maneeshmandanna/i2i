#!/usr/bin/env tsx

// Load environment variables from .env.local
import { config } from "dotenv";
config({ path: ".env.local" });

import { testConnection } from "../src/lib/db";
import { sql } from "drizzle-orm";
import { db } from "../src/lib/db/connection";

async function checkUserRole() {
  try {
    console.log("🔗 Testing database connection...");

    // Test connection first
    const isConnected = await testConnection();
    if (!isConnected) {
      console.error("❌ Database connection failed.");
      process.exit(1);
    }

    console.log("✅ Database connection successful");
    console.log("🔍 Checking user role...");

    // Check user role using the UserRepository
    const { UserRepository } = await import("../src/lib/db");
    const user = await UserRepository.findByEmail(
      "maneesh@maneeshmandanna.com"
    );

    if (user) {
      console.log("👤 User found:");
      console.log(`   Email: ${user.email}`);
      console.log(`   Role: ${user.role || "NOT SET"}`);
      console.log(`   Whitelisted: ${user.isWhitelisted}`);
      console.log(`   ID: ${user.id}`);
    } else {
      console.log("❌ User not found");
    }
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

// Run the check
checkUserRole();
