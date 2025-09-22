# Database Setup and Management

This directory contains all database-related code for the i2i-mvp application, including schema definitions, migrations, seeding, and repository patterns.

## Structure

```
src/lib/db/
├── README.md                 # This file
├── index.ts                  # Main exports
├── connection.ts             # Database connection utilities
├── schema.ts                 # Drizzle ORM schema definitions
├── migrate.ts                # Migration runner
├── seed.ts                   # Database seeding utilities
├── migrations/               # Generated migration files
│   └── 0000_*.sql           # SQL migration files
└── repositories/             # Repository pattern implementations
    ├── index.ts             # Repository exports
    ├── users.ts             # User repository
    ├── images.ts            # Image repository
    ├── processing-jobs.ts   # Processing job repository
    └── workflow-configs.ts  # Workflow config repository
```

## Database Schema

The application uses four main tables:

### Users Table

- Stores user authentication and whitelist information
- Uses bcrypt for password hashing
- Supports whitelist-based access control

### Images Table

- Stores metadata for uploaded and processed images
- Links to Vercel Blob storage URLs
- Tracks processing status and file information

### Processing Jobs Table

- Manages image processing workflow state
- Links original images to processed results
- Stores fal.ai job IDs and processing parameters

### Workflow Configs Table

- Stores modular workflow configurations
- Allows dynamic workflow updates without code changes
- Contains fal.ai endpoint URLs and default parameters

## Setup Instructions

### 1. Environment Variables

Ensure you have the following environment variables set:

```bash
# Vercel Postgres connection string
POSTGRES_URL="postgres://username:password@host:port/database?sslmode=require"

# Optional: Non-pooling connection for migrations
POSTGRES_URL_NON_POOLING="postgres://username:password@host:port/database?sslmode=require"
```

### 2. Install Dependencies

The following packages are required:

- `@vercel/postgres` - Vercel Postgres client
- `drizzle-orm` - TypeScript ORM
- `drizzle-kit` - Migration and introspection tools
- `bcryptjs` - Password hashing

### 3. Run Database Setup

```bash
# Generate migration files (after schema changes)
npm run db:generate

# Run migrations and seed initial data
npm run db:setup

# Or run individual commands:
npm run db:migrate    # Run migrations only
npm run db:seed       # Seed data only
```

### 4. Development Tools

```bash
# Open Drizzle Studio (database GUI)
npm run db:studio

# Generate new migration after schema changes
npm run db:generate
```

## Usage Examples

### Using Repositories

```typescript
import {
  UserRepository,
  ImageRepository,
  ProcessingJobRepository,
} from "@/lib/db";

// Create a new user
const user = await UserRepository.createWithHashedPassword(
  "user@example.com",
  "password123",
  true // isWhitelisted
);

// Upload an image
const image = await ImageRepository.create({
  userId: user.id,
  filename: "processed_image.jpg",
  originalFilename: "original.jpg",
  blobUrl: "https://blob.vercel-storage.com/...",
  fileSize: 1024000,
  mimeType: "image/jpeg",
  width: 1920,
  height: 1080,
});

// Create a processing job
const job = await ProcessingJobRepository.create({
  userId: user.id,
  originalImageId: image.id,
  workflowName: "mannequin-to-human-v1",
  parameters: {
    aspect_ratio: "4:3",
    style_strength: 75,
    lighting_style: "studio",
  },
});
```

### Direct Database Access

```typescript
import { db, users, images } from "@/lib/db";
import { eq } from "drizzle-orm";

// Raw query example
const userImages = await db
  .select()
  .from(images)
  .where(eq(images.userId, userId))
  .orderBy(images.createdAt);
```

## Migration Management

### Creating New Migrations

1. Modify the schema in `schema.ts`
2. Run `npm run db:generate` to create migration files
3. Review the generated SQL in `migrations/`
4. Run `npm run db:migrate` to apply changes

### Rollback Strategy

Drizzle doesn't support automatic rollbacks. For production:

1. Always backup before migrations
2. Test migrations in staging first
3. Keep rollback SQL scripts for critical changes

## Seeding Data

The seed system automatically creates initial workflow configurations:

- `mannequin-to-human-v1` - Basic transformation workflow
- `mannequin-to-human-v2` - Advanced transformation with enhanced realism
- `apparel-enhancement` - Texture and detail enhancement (disabled by default)

### Custom Seeding

```typescript
import { seedDatabase, WorkflowConfigRepository } from "@/lib/db";

// Add custom workflow config
await WorkflowConfigRepository.create({
  id: "custom-workflow",
  name: "Custom Transformation",
  description: "Custom workflow description",
  falEndpoint: "fal-ai/custom-endpoint",
  defaultParameters: {
    style: "realistic",
    strength: 0.8,
  },
});
```

## Performance Considerations

### Indexing

The schema includes appropriate indexes for:

- User email lookups (unique constraint)
- Image user_id foreign key
- Processing job status and user_id

### Connection Pooling

- Uses Vercel Postgres built-in connection pooling
- Configured for serverless function compatibility
- Automatic connection management

### Query Optimization

- Repository methods use efficient queries
- Pagination support for large datasets
- Proper use of foreign key relationships

## Security

### Password Security

- Uses bcrypt with salt rounds of 12
- Passwords are never stored in plain text
- Whitelist-based access control

### Data Protection

- Foreign key constraints prevent orphaned records
- Cascade deletes for user data cleanup
- Input validation through TypeScript types

## Troubleshooting

### Common Issues

1. **Connection Errors**

   - Verify POSTGRES_URL environment variable
   - Check Vercel Postgres database status
   - Ensure SSL mode is correctly configured

2. **Migration Failures**

   - Check for syntax errors in schema.ts
   - Verify database permissions
   - Review migration SQL before applying

3. **Seeding Issues**
   - Ensure migrations have run successfully
   - Check for unique constraint violations
   - Verify workflow configuration format

### Debug Mode

Enable verbose logging:

```typescript
import { databaseConfig } from "@/lib/config/database";

// Check connection info
console.log(databaseConfig.getConnectionInfo());

// Test connection
import { testConnection, healthCheck } from "@/lib/db";
const isConnected = await testConnection();
const health = await healthCheck();
```
