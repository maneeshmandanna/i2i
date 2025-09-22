#!/usr/bin/env tsx

console.log(`
🚀 Vercel Postgres Setup (Vercel-Optimized)

Since you're deploying on Vercel, let's use Vercel Postgres for best compatibility:

📋 Method 1: Vercel Dashboard (Recommended)
1. Go to https://vercel.com/dashboard
2. Select your project (or create one)
3. Go to "Storage" tab
4. Click "Create Database"
5. Select "Postgres"
6. Choose database name: i2i-mvp-db
7. Select region (same as your deployment region)
8. Click "Create"

📋 Method 2: Vercel CLI (Faster)
1. Install Vercel CLI: npm i -g vercel
2. Login: vercel login
3. Link project: vercel link
4. Create database: vercel storage create postgres i2i-mvp-db
5. Pull env vars: vercel env pull .env.local

📋 Method 3: Manual Vercel CLI
vercel login
vercel storage create postgres i2i-mvp-db --region sfo1

🔧 After Database Creation:
1. In Vercel dashboard, go to Storage > Your Database
2. Click ".env.local" tab
3. Copy ALL environment variables
4. Paste into your .env.local file

Expected variables:
- POSTGRES_URL (for connection pooling)
- POSTGRES_PRISMA_URL (for Prisma/Drizzle)
- POSTGRES_URL_NON_POOLING (for migrations)
- POSTGRES_USER, POSTGRES_HOST, etc.

🎯 Why Vercel Postgres?
✅ IPv4 compatible (required for Vercel)
✅ Connection pooling optimized for serverless
✅ Same region as your Vercel deployment
✅ No cold start issues
✅ Automatic scaling
✅ Built-in connection management

🚨 Supabase + Vercel Issues:
❌ IPv6 connections (Vercel doesn't support)
❌ Connection pooling not optimized for serverless
❌ Potential cold start timeouts
❌ Cross-region latency
`);

import { execSync } from "child_process";

// Check if Vercel CLI is available
try {
  const version = execSync("vercel --version", { encoding: "utf8" }).trim();
  console.log(`\n✅ Vercel CLI detected (${version})`);
  console.log("\n🚀 Quick setup commands:");
  console.log("vercel login");
  console.log("vercel link");
  console.log("vercel storage create postgres i2i-mvp-db");
  console.log("vercel env pull .env.local");
} catch {
  console.log("\n📦 Install Vercel CLI for easier setup:");
  console.log("npm i -g vercel");
}

console.log(`
🔄 After Setup:
1. npm run db:debug     # Test connection
2. npm run db:setup     # Initialize database
3. npm run auth:create-test-user  # Create test user

💡 Pro Tips:
- Use POSTGRES_URL for app connections (pooled)
- Use POSTGRES_URL_NON_POOLING for migrations
- Keep database in same region as Vercel deployment
- Vercel Postgres is free up to 60 hours compute time
`);
