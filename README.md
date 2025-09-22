# Image-to-Image Processing MVP

Transform mannequin apparel images to human models using AI-powered image processing.

## 🚀 Features

- **🔐 Secure Authentication**: Whitelist-based access control with NextAuth.js
- **📤 Image Upload System**: Drag-and-drop interface with Vercel Blob storage
- **🤖 AI Processing**: Integration with fal.ai for image transformation workflows
- **⚡ Real-time Processing**: Live status updates and progress tracking
- **📊 Results Management**: Download processed images and view processing history
- **📱 Responsive Design**: Mobile-friendly interface built with Tailwind CSS
- **🔧 Modular Workflows**: Configurable AI processing workflows without code changes

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui, Radix UI primitives
- **Authentication**: NextAuth.js with credentials provider
- **Database**: Vercel Postgres with Drizzle ORM
- **Storage**: Vercel Blob for image storage
- **AI Processing**: fal.ai API integration
- **State Management**: Zustand
- **Deployment**: Vercel platform

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Vercel account (for database and deployment)
- fal.ai API key (for image processing)

### 1. Clone and Install

```bash
git clone https://github.com/maneeshmandanna/i2i.git
cd i2i
npm install
```

### 2. Environment Setup

Copy the example environment file and configure:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your configuration:

```env
# Authentication
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000

# Database (will be configured after Vercel setup)
POSTGRES_URL=your-vercel-postgres-url

# Storage (will be configured after Vercel setup)
BLOB_READ_WRITE_TOKEN=your-vercel-blob-token

# fal.ai Integration
FAL_KEY=your-fal-ai-api-key
FAL_BASE_URL=https://fal.run/fal-ai
```

### 3. Database Setup

Set up Vercel Postgres database:

```bash
# Install Vercel CLI
npm i -g vercel

# Login and link project
vercel login
vercel link

# Create database and pull environment variables
vercel storage create postgres i2i-mvp-db
vercel env pull .env.local

# Initialize database
npm run db:setup
```

### 4. Create Test User

```bash
# Create a test user (whitelisted by default)
npm run auth:create-test-user admin@example.com password123 true
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
src/
├── app/                    # Next.js 14 app directory
│   ├── (auth)/            # Authentication pages
│   ├── api/               # API routes
│   └── dashboard/         # Main application pages
├── components/            # React components
│   ├── auth/             # Authentication components
│   └── ui/               # UI components (shadcn/ui)
├── lib/                  # Utility libraries
│   ├── auth.ts           # NextAuth configuration
│   ├── db/               # Database schema and utilities
│   └── auth-utils.ts     # Authentication utilities
├── stores/               # Zustand state management
├── types/                # TypeScript type definitions
└── middleware.ts         # Next.js middleware
```

## 🗄️ Database Schema

The application uses four main tables:

- **users**: User authentication and whitelist management
- **images**: Uploaded and processed image metadata
- **processing_jobs**: AI processing job tracking and status
- **workflow_configs**: Modular AI workflow configurations

## 🔧 Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run build           # Build for production
npm run start           # Start production server

# Database
npm run db:setup        # Initialize database (migrations + seed)
npm run db:generate     # Generate new migrations
npm run db:migrate      # Run migrations
npm run db:studio       # Open database GUI
npm run db:debug        # Test database connection

# Authentication
npm run auth:create-test-user  # Create test user

# Vercel Setup
npm run vercel:setup-db # Vercel Postgres setup guide
```

## 🚀 Deployment to Vercel

### Option 1: GitHub Integration (Recommended)

1. Push your code to GitHub
2. Go to [Vercel Dashboard](https://vercel.com/dashboard)
3. Click "New Project" and import from GitHub
4. Vercel will automatically detect Next.js and configure build settings
5. Add environment variables in Vercel dashboard
6. Deploy!

### Option 2: Vercel CLI

```bash
vercel --prod
```

### Post-Deployment Setup

1. **Create Vercel Postgres Database**:

   - Go to your project in Vercel dashboard
   - Navigate to Storage tab
   - Create a new Postgres database
   - Copy connection strings to environment variables

2. **Create Vercel Blob Storage**:

   - In Storage tab, create a new Blob store
   - Copy the read/write token to environment variables

3. **Run Database Migrations**:

   ```bash
   vercel env pull .env.local
   npm run db:setup
   ```

4. **Create Admin User**:
   ```bash
   npm run auth:create-test-user admin@yourdomain.com securepassword true
   ```

## 🔐 Authentication

The application uses a whitelist-based authentication system:

- Only users with `isWhitelisted: true` can access the application
- Passwords are hashed using bcrypt
- Sessions are managed by NextAuth.js
- Protected routes are secured with middleware

### Creating Users

```bash
# Create whitelisted user
npm run auth:create-test-user user@example.com password123 true

# Create non-whitelisted user (won't be able to login)
npm run auth:create-test-user user@example.com password123 false
```

## 🤖 AI Workflow Configuration

Workflows are configured in the database and can be updated without code changes:

```sql
-- Example workflow configuration
INSERT INTO workflow_configs (id, name, description, fal_endpoint, default_parameters)
VALUES (
  'mannequin-to-human-v1',
  'Mannequin to Human Model v1',
  'Transform apparel images from mannequin to realistic human model',
  'fal-ai/flux-lora',
  '{"aspect_ratio": "4:3", "style_strength": 75, "lighting_style": "studio"}'
);
```

## 🐛 Troubleshooting

### Database Connection Issues

```bash
# Test database connection
npm run db:debug

# Check if tables exist
npm run db:studio
```

### Authentication Issues

- Ensure `NEXTAUTH_SECRET` is set
- Check if user is whitelisted in database
- Verify `NEXTAUTH_URL` matches your domain

### Build Issues

```bash
# Check for TypeScript errors
npm run build

# Run linting
npm run lint
```

## 📝 Environment Variables Reference

| Variable                | Description                       | Required |
| ----------------------- | --------------------------------- | -------- |
| `NEXTAUTH_SECRET`       | NextAuth.js secret key            | ✅       |
| `NEXTAUTH_URL`          | Application URL                   | ✅       |
| `POSTGRES_URL`          | Vercel Postgres connection string | ✅       |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob storage token         | ✅       |
| `FAL_KEY`               | fal.ai API key                    | ✅       |
| `FAL_BASE_URL`          | fal.ai API base URL               | ✅       |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:

1. Check the [troubleshooting section](#-troubleshooting)
2. Review the [database setup guide](src/lib/db/README.md)
3. Open an issue on GitHub
