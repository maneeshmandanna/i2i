# Deployment Guide

This guide walks you through deploying the Image-to-Image Processing MVP to Vercel.

## 🚀 Quick Deployment

### Step 1: Push to GitHub

1. **Initialize Git Repository** (if not already done):

   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. **Add GitHub Remote**:
   ```bash
   git remote add origin https://github.com/maneeshmandanna/i2i.git
   git branch -M main
   git push -u origin main
   ```

### Step 2: Deploy to Vercel

1. **Go to Vercel Dashboard**:

   - Visit [vercel.com/dashboard](https://vercel.com/dashboard)
   - Click "New Project"

2. **Import from GitHub**:

   - Select "Import Git Repository"
   - Choose your GitHub repository: `maneeshmandanna/i2i`
   - Click "Import"

3. **Configure Project**:

   - **Project Name**: `i2i-mvp` (or your preferred name)
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `./` (default)
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)
   - **Install Command**: `npm install` (default)

4. **Deploy**:
   - Click "Deploy"
   - Wait for initial deployment (this will fail due to missing environment variables)

### Step 3: Set Up Database and Storage

1. **Create Vercel Postgres Database**:

   - In your Vercel project dashboard, go to "Storage" tab
   - Click "Create Database"
   - Select "Postgres"
   - Name: `i2i-mvp-db`
   - Region: Choose same as your deployment region
   - Click "Create"

2. **Create Vercel Blob Storage**:
   - In "Storage" tab, click "Create Database" again
   - Select "Blob"
   - Name: `i2i-mvp-blob`
   - Click "Create"

### Step 4: Configure Environment Variables

1. **Go to Project Settings**:

   - In your Vercel project, click "Settings"
   - Navigate to "Environment Variables"

2. **Add Required Variables**:

   **Authentication**:

   ```
   NEXTAUTH_SECRET = your-production-secret-key-32-chars-min
   NEXTAUTH_URL = https://your-project-name.vercel.app
   ```

   **Database** (from Postgres database settings):

   ```
   POSTGRES_URL = postgres://default:xxx@xxx.postgres.vercel-storage.com:5432/verceldb
   POSTGRES_PRISMA_URL = postgres://default:xxx@xxx-pooler.postgres.vercel-storage.com:5432/verceldb?pgbouncer=true&connect_timeout=15
   POSTGRES_URL_NON_POOLING = postgres://default:xxx@xxx.postgres.vercel-storage.com:5432/verceldb
   ```

   **Storage** (from Blob storage settings):

   ```
   BLOB_READ_WRITE_TOKEN = vercel_blob_rw_xxxxxxxxxxxxx
   ```

   **fal.ai Integration**:

   ```
   FAL_KEY = your-fal-ai-api-key
   FAL_BASE_URL = https://fal.run/fal-ai
   ```

3. **Set Environment for All Environments**:
   - Production: ✅
   - Preview: ✅
   - Development: ✅

### Step 5: Initialize Database

1. **Redeploy with Environment Variables**:

   - Go to "Deployments" tab
   - Click "Redeploy" on the latest deployment

2. **Run Database Setup** (locally with production env):

   ```bash
   # Pull production environment variables
   vercel env pull .env.local

   # Run database migrations and seeding
   npm run db:setup
   ```

3. **Create Admin User**:
   ```bash
   npm run auth:create-test-user admin@yourdomain.com securepassword true
   ```

### Step 6: Verify Deployment

1. **Test the Application**:

   - Visit your Vercel URL: `https://your-project-name.vercel.app`
   - Try logging in with your admin user
   - Test the authentication flow

2. **Check Database Connection**:
   ```bash
   npm run db:debug
   ```

## 🔧 Advanced Configuration

### Custom Domain

1. **Add Domain in Vercel**:

   - Go to Project Settings > Domains
   - Add your custom domain
   - Configure DNS records as instructed

2. **Update Environment Variables**:
   ```
   NEXTAUTH_URL = https://yourdomain.com
   ```

### Environment-Specific Configuration

**Production**:

- Use strong `NEXTAUTH_SECRET` (32+ characters)
- Enable all security features
- Use production fal.ai endpoints

**Preview** (for testing):

- Can use same database as production
- Use preview-specific fal.ai endpoints if needed

**Development**:

- Use local database or development database
- Use development fal.ai endpoints

### Monitoring and Logging

1. **Enable Vercel Analytics**:

   - Go to Project Settings > Analytics
   - Enable Web Analytics

2. **Set up Error Tracking**:
   - Consider integrating Sentry or similar
   - Monitor API route performance

## 🚨 Troubleshooting

### Common Deployment Issues

1. **Build Failures**:

   ```bash
   # Test build locally
   npm run build

   # Check for TypeScript errors
   npm run lint
   ```

2. **Database Connection Issues**:

   - Verify `POSTGRES_URL` is correctly set
   - Check database is in same region as deployment
   - Ensure database is not paused (free tier)

3. **Authentication Issues**:

   - Verify `NEXTAUTH_URL` matches your domain
   - Check `NEXTAUTH_SECRET` is set and secure
   - Ensure user is whitelisted in database

4. **Storage Issues**:
   - Verify `BLOB_READ_WRITE_TOKEN` is correct
   - Check blob storage permissions

### Performance Optimization

1. **Database**:

   - Use connection pooling (`POSTGRES_URL` with pooling)
   - Optimize queries with proper indexing

2. **Images**:

   - Implement image optimization
   - Use CDN for static assets

3. **API Routes**:
   - Add proper caching headers
   - Implement rate limiting

## 📊 Post-Deployment Checklist

- [ ] Application loads successfully
- [ ] Authentication works (login/logout)
- [ ] Database connection is stable
- [ ] Image upload functionality works
- [ ] fal.ai integration is functional
- [ ] All environment variables are set
- [ ] Custom domain is configured (if applicable)
- [ ] SSL certificate is active
- [ ] Admin user is created and can access
- [ ] Error monitoring is set up
- [ ] Performance monitoring is active

## 🔄 Continuous Deployment

Vercel automatically deploys when you push to your main branch:

1. **Make Changes**:

   ```bash
   git add .
   git commit -m "Your changes"
   git push origin main
   ```

2. **Automatic Deployment**:

   - Vercel detects the push
   - Runs build process
   - Deploys if successful
   - Sends notification

3. **Preview Deployments**:
   - Every pull request gets a preview deployment
   - Test changes before merging to main

## 📞 Support

If you encounter issues:

1. Check Vercel deployment logs
2. Review the [troubleshooting section](#-troubleshooting)
3. Consult [Vercel documentation](https://vercel.com/docs)
4. Open an issue on GitHub
