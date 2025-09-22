#!/usr/bin/env tsx

console.log(`
🏠 Local PostgreSQL Setup for Development

Since your Supabase project is paused, you can use a local database for development:

📋 Option 1: Docker (Recommended)
1. Install Docker Desktop
2. Run PostgreSQL container:
   docker run --name i2i-postgres -e POSTGRES_PASSWORD=password123 -e POSTGRES_DB=i2i_mvp -p 5432:5432 -d postgres:15

3. Update .env.local:
   POSTGRES_URL="postgresql://postgres:password123@localhost:5432/i2i_mvp"

📋 Option 2: Homebrew (macOS)
1. Install PostgreSQL:
   brew install postgresql@15
   brew services start postgresql@15

2. Create database:
   createdb i2i_mvp

3. Update .env.local:
   POSTGRES_URL="postgresql://postgres@localhost:5432/i2i_mvp"

📋 Option 3: Supabase Local
1. Install Supabase CLI:
   npm install -g supabase

2. Initialize local Supabase:
   npx supabase init
   npx supabase start

3. Use local connection string (shown after start)

🔄 Quick Docker Setup:
`);

import { execSync } from "child_process";

// Check if Docker is available
try {
  execSync("docker --version", { stdio: "pipe" });
  console.log("✅ Docker detected! Run this command:");
  console.log(
    "docker run --name i2i-postgres -e POSTGRES_PASSWORD=password123 -e POSTGRES_DB=i2i_mvp -p 5432:5432 -d postgres:15"
  );
  console.log("\nThen update your .env.local:");
  console.log(
    'POSTGRES_URL="postgresql://postgres:password123@localhost:5432/i2i_mvp"'
  );
} catch {
  console.log(
    "❌ Docker not found. Install Docker Desktop or use Homebrew option."
  );
}

console.log(`
🎯 After setting up local database:
1. npm run db:debug     # Test connection
2. npm run db:setup     # Initialize tables
3. npm run auth:create-test-user  # Create test user
`);
