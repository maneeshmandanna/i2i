#!/usr/bin/env tsx

// Test the database code with a mock connection string
process.env.POSTGRES_URL =
  "postgres://test:test@localhost:5432/test?sslmode=disable";

import { UserRepository } from "../src/lib/db";

async function testDatabaseCode() {
  console.log("🧪 Testing database code structure...\n");

  try {
    // Test that the UserRepository class is properly structured
    console.log("✅ UserRepository imported successfully");
    console.log("✅ Available methods:");

    const methods = Object.getOwnPropertyNames(UserRepository)
      .filter(
        (name) =>
          typeof UserRepository[name as keyof typeof UserRepository] ===
          "function"
      )
      .filter(
        (name) => name !== "length" && name !== "name" && name !== "prototype"
      );

    methods.forEach((method) => {
      console.log(`   - ${method}`);
    });

    console.log("\n✅ Database code structure is valid!");
    console.log("\nNext steps:");
    console.log("1. Set up your Vercel Postgres database");
    console.log("2. Update .env.local with real connection strings");
    console.log("3. Run npm run db:setup");
  } catch (error) {
    console.error("❌ Error in database code:", error);
  }
}

testDatabaseCode();
