#!/usr/bin/env tsx

// Load environment variables from .env.local
import { config } from "dotenv";
config({ path: ".env.local" });

import { UserRepository, testConnection } from "../src/lib/db";

async function createTestUser() {
  try {
    console.log("�  Testing database connection...");

    // Test connection first
    const isConnected = await testConnection();
    if (!isConnected) {
      console.error(
        "❌ Database connection failed. Please check your POSTGRES_URL environment variable."
      );
      console.log(
        "Make sure you have set up your Vercel Postgres database and added the connection string to your .env.local file."
      );
      process.exit(1);
    }

    console.log("✅ Database connection successful");

    // Get user details from command line arguments or use defaults
    const email = process.argv[2] || "test@example.com";
    const password = process.argv[3] || "password123";
    const isWhitelisted = process.argv[4] === "true" || true; // Default to whitelisted

    console.log(`\n📝 Creating test user:`);
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
    console.log(`   Whitelisted: ${isWhitelisted}`);

    // Check if user already exists
    const existingUser = await UserRepository.findByEmail(email);
    if (existingUser) {
      console.log(`\n⚠️  User with email ${email} already exists!`);
      console.log(`   User ID: ${existingUser.id}`);
      console.log(`   Whitelisted: ${existingUser.isWhitelisted}`);
      return;
    }

    // Create the user
    const user = await UserRepository.createWithHashedPassword(
      email,
      password,
      isWhitelisted
    );

    console.log(`\n🎉 Test user created successfully!`);
    console.log(`   User ID: ${user.id}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Whitelisted: ${user.isWhitelisted}`);
    console.log(`   Created: ${user.createdAt}`);
  } catch (error) {
    console.error("❌ Error creating test user:", error);

    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Stack trace:", error.stack);
    }

    // Common troubleshooting tips
    console.log("\n🔧 Troubleshooting tips:");
    console.log(
      "1. Make sure your database is set up and migrations have been run"
    );
    console.log(
      "2. Check that POSTGRES_URL is set in your environment variables"
    );
    console.log('3. Run "npm run db:setup" to initialize the database');
    console.log("4. Verify your Vercel Postgres database is accessible");

    process.exit(1);
  }
}

// Usage information
if (process.argv.includes("--help") || process.argv.includes("-h")) {
  console.log(`
Usage: npm run create-test-user [email] [password] [whitelisted]

Examples:
  npm run create-test-user
  npm run create-test-user user@example.com mypassword true
  npm run create-test-user admin@company.com secretpass false

Arguments:
  email       - User email (default: test@example.com)
  password    - User password (default: password123)  
  whitelisted - Whether user is whitelisted (default: true)
`);
  process.exit(0);
}

// Run the script
createTestUser();
