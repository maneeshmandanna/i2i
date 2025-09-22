#!/usr/bin/env tsx

// Load environment variables from .env.local
import { config } from "dotenv";
config({ path: ".env.local" });

import { UserRepository, testConnection } from "../src/lib/db";

async function manageUsers() {
  try {
    console.log("🔗 Testing database connection...");

    // Test connection first
    const isConnected = await testConnection();
    if (!isConnected) {
      console.error(
        "❌ Database connection failed. Please check your POSTGRES_URL environment variable."
      );
      process.exit(1);
    }

    console.log("✅ Database connection successful");

    const command = process.argv[2];
    const email = process.argv[3];

    switch (command) {
      case "list":
        await listUsers();
        break;
      case "whitelist":
        if (!email) {
          console.error("❌ Email required for whitelist command");
          showUsage();
          process.exit(1);
        }
        await whitelistUser(email);
        break;
      case "unwhitelist":
        if (!email) {
          console.error("❌ Email required for unwhitelist command");
          showUsage();
          process.exit(1);
        }
        await unwhitelistUser(email);
        break;
      case "delete":
        if (!email) {
          console.error("❌ Email required for delete command");
          showUsage();
          process.exit(1);
        }
        await deleteUser(email);
        break;
      case "info":
        if (!email) {
          console.error("❌ Email required for info command");
          showUsage();
          process.exit(1);
        }
        await getUserInfo(email);
        break;
      default:
        showUsage();
        process.exit(1);
    }
  } catch (error) {
    console.error("❌ Error managing users:", error);
    process.exit(1);
  }
}

async function listUsers() {
  console.log("\n📋 All Users:");
  console.log("─".repeat(80));

  // Get all users (we'll need to add this method)
  const users = await UserRepository.findAll();

  if (users.length === 0) {
    console.log("No users found.");
    return;
  }

  users.forEach((user, index) => {
    const status = user.isWhitelisted ? "✅ WHITELISTED" : "❌ NOT WHITELISTED";
    console.log(`${index + 1}. ${user.email}`);
    console.log(`   ID: ${user.id}`);
    console.log(`   Status: ${status}`);
    console.log(`   Created: ${user.createdAt}`);
    console.log("");
  });
}

async function whitelistUser(email: string) {
  const user = await UserRepository.findByEmail(email);
  if (!user) {
    console.error(`❌ User with email ${email} not found`);
    return;
  }

  if (user.isWhitelisted) {
    console.log(`ℹ️  User ${email} is already whitelisted`);
    return;
  }

  await UserRepository.updateWhitelistStatus(user.id, true);
  console.log(`✅ User ${email} has been whitelisted`);
}

async function unwhitelistUser(email: string) {
  const user = await UserRepository.findByEmail(email);
  if (!user) {
    console.error(`❌ User with email ${email} not found`);
    return;
  }

  if (!user.isWhitelisted) {
    console.log(`ℹ️  User ${email} is already not whitelisted`);
    return;
  }

  await UserRepository.updateWhitelistStatus(user.id, false);
  console.log(`❌ User ${email} has been removed from whitelist`);
}

async function deleteUser(email: string) {
  const user = await UserRepository.findByEmail(email);
  if (!user) {
    console.error(`❌ User with email ${email} not found`);
    return;
  }

  await UserRepository.deleteUser(user.id);
  console.log(`🗑️  User ${email} has been deleted`);
}

async function getUserInfo(email: string) {
  const user = await UserRepository.findByEmail(email);
  if (!user) {
    console.error(`❌ User with email ${email} not found`);
    return;
  }

  const status = user.isWhitelisted ? "✅ WHITELISTED" : "❌ NOT WHITELISTED";
  console.log(`\n👤 User Information:`);
  console.log(`   Email: ${user.email}`);
  console.log(`   ID: ${user.id}`);
  console.log(`   Status: ${status}`);
  console.log(`   Created: ${user.createdAt}`);
  console.log(`   Updated: ${user.updatedAt}`);
}

function showUsage() {
  console.log(`
🔧 User Management Tool

Usage: npm run manage-users <command> [email]

Commands:
  list                    - List all users
  whitelist <email>       - Add user to whitelist
  unwhitelist <email>     - Remove user from whitelist
  delete <email>          - Delete user
  info <email>            - Show user information

Examples:
  npm run manage-users list
  npm run manage-users whitelist user@example.com
  npm run manage-users unwhitelist user@example.com
  npm run manage-users info user@example.com
  npm run manage-users delete user@example.com
`);
}

// Show usage if no arguments or help requested
if (
  process.argv.length < 3 ||
  process.argv.includes("--help") ||
  process.argv.includes("-h")
) {
  showUsage();
  process.exit(0);
}

// Run the script
manageUsers();
