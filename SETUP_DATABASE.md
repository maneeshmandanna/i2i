# Database Setup Guide

## 1. Create Vercel Postgres Database

### Option A: Using Vercel Dashboard (Recommended)

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project or create a new one
3. Go to the **Storage** tab
4. Click **Create Database**
5. Select **Postgres**
6. Choose a database name (e.g., `i2i-mvp-db`)
7. Select your preferred region
8. Click **Create**

### Option B: Using Vercel CLI

```bash
# Install Vercel CLI if you haven't
npm i -g vercel

# Login to Vercel
vercel login

# Create database
vercel storage create postgres i2i-mvp-db
```

## 2. Get Connection Strings

After creating the database:

1. In your Vercel dashboard, go to **Storage** > **Postgres** > your database
2. Click on the **`.env.local`** tab
3. Copy all the environment variables

## 3. Set Up Local Environment

1. Create a `.env.local` file in your project root:

```bash
cp .env.local.example .env.local
```

2. Edit `.env.local` and paste your Vercel Postgres connection strings:

```env
POSTGRES_URL="your-connection-string-here"
POSTGRES_PRISMA_URL="your-prisma-connection-string-here"
POSTGRES_URL_NON_POOLING="your-non-pooling-connection-string-here"
# ... other variables
```

## 4. Initialize Database

Run the setup script to create tables and seed initial data:

```bash
# This will run migrations and seed the database
npm run db:setup
```

## 5. Verify Setup

Check if everything is working:

```bash
# Debug database connection and tables
npm run db:debug

# Create a test user
npm run auth:create-test-user

# Open database GUI (optional)
npm run db:studio
```

## 6. Create Test User

Once the database is set up, create a test user:

```bash
# Create default test user (test@example.com / password123)
npm run auth:create-test-user

# Create custom test user
npm run auth:create-test-user admin@company.com mypassword true
```

## Troubleshooting

### Connection Issues

- Ensure your `.env.local` file is in the project root
- Check that the connection strings are correct
- Verify your Vercel Postgres database is active

### Migration Issues

- Run `npm run db:generate` if you've made schema changes
- Use `npm run db:migrate` to apply migrations manually

### Permission Issues

- Ensure the database user has proper permissions
- Check if your IP is whitelisted (usually not needed for Vercel Postgres)

## Environment Variables Reference

| Variable                   | Description                                             |
| -------------------------- | ------------------------------------------------------- |
| `POSTGRES_URL`             | Main connection string for the application              |
| `POSTGRES_PRISMA_URL`      | Connection string optimized for Prisma (with pgbouncer) |
| `POSTGRES_URL_NON_POOLING` | Direct connection without connection pooling            |
| `POSTGRES_USER`            | Database username                                       |
| `POSTGRES_HOST`            | Database host                                           |
| `POSTGRES_PASSWORD`        | Database password                                       |
| `POSTGRES_DATABASE`        | Database name                                           |
