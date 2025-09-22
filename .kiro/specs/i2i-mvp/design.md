# Design Document - Image-to-Image MVP

## Overview

This design document outlines the technical architecture for a web-based image-to-image processing application that transforms mannequin apparel images into realistic human model images using fal.ai workflows. The application is optimized for Vercel deployment with a focus on serverless architecture, modular configuration, and efficient image processing.

## Architecture

### System Architecture Diagram

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Next.js App   │    │   Vercel Edge    │    │   fal.ai API    │
│   (Frontend)    │◄──►│   Functions      │◄──►│   Workflows     │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │
         │                       │
         ▼                       ▼
┌─────────────────┐    ┌──────────────────┐
│   Vercel Blob   │    │   Vercel KV      │
│   (Images)      │    │   (Sessions)     │
└─────────────────┘    └──────────────────┘
                                │
                                ▼
                       ┌──────────────────┐
                       │   Vercel         │
                       │   Postgres       │
                       └──────────────────┘
```

### Technology Stack

**Frontend Framework**

- Next.js 14 with App Router
- TypeScript for type safety
- Tailwind CSS for styling
- Shadcn/ui for UI components
- React Hook Form for form handling
- Zustand for state management

**Backend & API**

- Next.js API Routes (Serverless Functions)
- Vercel Edge Functions for image processing
- NextAuth.js for authentication
- Zod for validation

**Database & Storage**

- Vercel Postgres for user data and processing history
- Vercel Blob for image storage
- Vercel KV (Redis) for session management and caching

**External Services**

- fal.ai API for image-to-image processing
- Vercel deployment platform

## Components and Interfaces

### Frontend Component Architecture

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx           # Login page
│   │   └── layout.tsx             # Auth layout
│   ├── dashboard/
│   │   ├── upload/
│   │   │   └── page.tsx           # Upload interface
│   │   ├── processing/
│   │   │   └── page.tsx           # Processing status
│   │   ├── history/
│   │   │   └── page.tsx           # Processing history
│   │   └── layout.tsx             # Dashboard layout
│   ├── api/
│   │   ├── auth/
│   │   │   └── [...nextauth]/     # NextAuth configuration
│   │   ├── upload/
│   │   │   └── route.ts           # Image upload endpoint
│   │   ├── process/
│   │   │   └── route.ts           # Processing trigger
│   │   ├── status/
│   │   │   └── [jobId]/
│   │   │       └── route.ts       # Status check endpoint
│   │   └── download/
│   │       └── [imageId]/
│   │           └── route.ts       # Image download
│   ├── globals.css                # Global styles
│   ├── layout.tsx                 # Root layout
│   └── page.tsx                   # Landing page
├── components/
│   ├── ui/                        # Shadcn/ui components
│   ├── auth/
│   │   ├── LoginForm.tsx          # Login form component
│   │   └── AuthGuard.tsx          # Route protection
│   ├── upload/
│   │   ├── ImageUploader.tsx      # Drag-and-drop uploader
│   │   ├── ImagePreview.tsx       # Image thumbnail preview
│   │   └── UploadProgress.tsx     # Upload progress indicator
│   ├── processing/
│   │   ├── ProcessingQueue.tsx    # Processing queue display
│   │   ├── StatusIndicator.tsx    # Processing status
│   │   └── ResultComparison.tsx   # Before/after comparison
│   └── history/
│       ├── HistoryList.tsx        # Processing history list
│       └── HistoryItem.tsx        # Individual history item
├── lib/
│   ├── auth.ts                    # NextAuth configuration
│   ├── db.ts                      # Database connection
│   ├── fal-client.ts              # fal.ai API client
│   ├── blob-storage.ts            # Vercel Blob utilities
│   ├── config.ts                  # Application configuration
│   └── utils.ts                   # Utility functions
├── stores/
│   ├── auth-store.ts              # Authentication state
│   ├── upload-store.ts            # Upload state management
│   └── processing-store.ts        # Processing state
└── types/
    ├── auth.ts                    # Authentication types
    ├── upload.ts                  # Upload-related types
    └── processing.ts              # Processing types
```

### Key Component Specifications

#### ImageUploader Component

```typescript
interface ImageUploaderProps {
  onUpload: (files: File[]) => Promise<void>;
  maxFiles?: number;
  maxSize?: number;
  acceptedTypes?: string[];
}

// Features:
// - Drag-and-drop interface
// - Multiple file selection
// - File validation
// - Progress tracking
// - Auto-scaling for fal.ai optimization
```

#### ProcessingQueue Component

```typescript
interface ProcessingJob {
  id: string;
  originalImageId: string;
  status: "pending" | "processing" | "completed" | "failed";
  workflow: string;
  createdAt: Date;
  completedAt?: Date;
  resultImageId?: string;
  errorMessage?: string;
}

// Features:
// - Real-time status updates
// - Queue position display
// - Error handling and retry
// - Result preview
```

#### fal.ai Client Integration

```typescript
interface FalAIClient {
  submitJob(params: ProcessingParams): Promise<JobResponse>;
  getJobStatus(jobId: string): Promise<JobStatus>;
  downloadResult(jobId: string): Promise<Buffer>;
}

interface ProcessingParams {
  imageUrl: string;
  workflow: string;
  parameters: Record<string, any>;
}
```

## Data Models

### Database Schema

```sql
-- Users table (whitelist-based authentication)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  is_whitelisted BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Images table (original and processed images)
CREATE TABLE images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  filename VARCHAR(255) NOT NULL,
  original_filename VARCHAR(255) NOT NULL,
  blob_url VARCHAR(500) NOT NULL,
  file_size BIGINT NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  width INTEGER,
  height INTEGER,
  is_processed BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Processing jobs table
CREATE TABLE processing_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  original_image_id UUID REFERENCES images(id) ON DELETE CASCADE,
  result_image_id UUID REFERENCES images(id) ON DELETE SET NULL,
  workflow_name VARCHAR(100) NOT NULL,
  fal_job_id VARCHAR(255),
  status VARCHAR(50) DEFAULT 'pending',
  parameters JSONB,
  error_message TEXT,
  processing_time_ms INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);

-- Workflow configurations table
CREATE TABLE workflow_configs (
  id VARCHAR(100) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  fal_endpoint VARCHAR(500) NOT NULL,
  default_parameters JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### TypeScript Interfaces

```typescript
// User types
interface User {
  id: string;
  email: string;
  isWhitelisted: boolean;
  createdAt: Date;
}

// Image types
interface ImageRecord {
  id: string;
  userId: string;
  filename: string;
  originalFilename: string;
  blobUrl: string;
  fileSize: number;
  mimeType: string;
  width?: number;
  height?: number;
  isProcessed: boolean;
  createdAt: Date;
}

// Processing job types
interface ProcessingJob {
  id: string;
  userId: string;
  originalImageId: string;
  resultImageId?: string;
  workflowName: string;
  falJobId?: string;
  status: "pending" | "processing" | "completed" | "failed";
  parameters?: Record<string, any>;
  errorMessage?: string;
  processingTimeMs?: number;
  createdAt: Date;
  completedAt?: Date;
}

// Workflow configuration types
interface WorkflowConfig {
  id: string;
  name: string;
  description: string;
  falEndpoint: string;
  defaultParameters: Record<string, any>;
  isActive: boolean;
}
```

## Error Handling

### Error Categories and Responses

```typescript
// Error types
enum ErrorType {
  AUTHENTICATION_ERROR = "AUTHENTICATION_ERROR",
  UPLOAD_ERROR = "UPLOAD_ERROR",
  PROCESSING_ERROR = "PROCESSING_ERROR",
  FAL_API_ERROR = "FAL_API_ERROR",
  STORAGE_ERROR = "STORAGE_ERROR",
  VALIDATION_ERROR = "VALIDATION_ERROR",
}

// Error handling strategy
class AppError extends Error {
  constructor(
    public type: ErrorType,
    public message: string,
    public statusCode: number = 500,
    public retryable: boolean = false
  ) {
    super(message);
  }
}

// Error responses
interface ErrorResponse {
  error: {
    type: ErrorType;
    message: string;
    retryable: boolean;
    timestamp: string;
  };
}
```

### Error Handling Patterns

1. **Upload Errors**: File validation, size limits, format checking
2. **Processing Errors**: fal.ai API failures, timeout handling, retry logic
3. **Authentication Errors**: Invalid credentials, session expiry, whitelist validation
4. **Storage Errors**: Blob upload failures, download issues
5. **Network Errors**: API timeouts, connection failures

## Testing Strategy

### Testing Approach

```typescript
// Unit tests
describe("ImageUploader", () => {
  it("should validate file types correctly");
  it("should handle file size limits");
  it("should auto-scale images for fal.ai");
});

describe("FalAIClient", () => {
  it("should submit jobs successfully");
  it("should handle API errors gracefully");
  it("should retry failed requests");
});

// Integration tests
describe("Image Processing Flow", () => {
  it("should complete end-to-end processing");
  it("should handle concurrent uploads");
  it("should maintain data consistency");
});

// E2E tests
describe("User Workflow", () => {
  it("should allow login and image upload");
  it("should process images and display results");
  it("should handle error scenarios gracefully");
});
```

### Testing Tools

- **Jest** for unit testing
- **React Testing Library** for component testing
- **Playwright** for E2E testing
- **MSW** for API mocking

## Vercel-Specific Implementation Details

### Serverless Function Configuration

```typescript
// api/upload/route.ts
export const runtime = "edge";
export const maxDuration = 30;

// api/process/route.ts
export const runtime = "nodejs18.x";
export const maxDuration = 300; // 5 minutes for processing
```

### Environment Variables

```bash
# Authentication
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=https://your-app.vercel.app

# Database
POSTGRES_URL=your-vercel-postgres-url
POSTGRES_PRISMA_URL=your-prisma-url
POSTGRES_URL_NON_POOLING=your-non-pooling-url

# Storage
BLOB_READ_WRITE_TOKEN=your-vercel-blob-token

# fal.ai Integration
FAL_KEY=your-fal-ai-api-key
FAL_BASE_URL=https://fal.run/fal-ai

# Workflow Configuration
WORKFLOW_CONFIG_URL=your-config-file-url
```

### Vercel Configuration (vercel.json)

```json
{
  "functions": {
    "app/api/process/route.ts": {
      "maxDuration": 300
    }
  },
  "env": {
    "FAL_KEY": "@fal-api-key",
    "WORKFLOW_CONFIG_URL": "@workflow-config-url"
  }
}
```

## Modular Workflow Configuration

### Configuration System Design

```typescript
// Workflow configuration interface
interface WorkflowConfiguration {
  workflows: {
    [key: string]: {
      name: string;
      description: string;
      endpoint: string;
      parameters: {
        [key: string]: {
          type: "string" | "number" | "boolean";
          default: any;
          required: boolean;
        };
      };
    };
  };
}

// Configuration loader
class WorkflowConfigLoader {
  private config: WorkflowConfiguration | null = null;

  async loadConfig(): Promise<WorkflowConfiguration> {
    if (!this.config) {
      const configUrl = process.env.WORKFLOW_CONFIG_URL;
      const response = await fetch(configUrl);
      this.config = await response.json();
    }
    return this.config;
  }

  async getWorkflow(workflowId: string) {
    const config = await this.loadConfig();
    return config.workflows[workflowId];
  }
}
```

### Example Configuration File

```json
{
  "workflows": {
    "mannequin-to-human": {
      "name": "Mannequin to Human Model",
      "description": "Transform apparel images from mannequin to human model",
      "endpoint": "fal-ai/mannequin-to-human-v2",
      "parameters": {
        "style": {
          "type": "string",
          "default": "realistic",
          "required": true
        },
        "lighting": {
          "type": "string",
          "default": "natural",
          "required": false
        },
        "background": {
          "type": "string",
          "default": "studio",
          "required": false
        }
      }
    }
  }
}
```

## Performance Optimization

### Image Processing Optimization

1. **Auto-scaling**: Resize images to optimal dimensions for fal.ai
2. **Format Optimization**: Convert to WebP for storage efficiency
3. **Lazy Loading**: Load images on demand in the UI
4. **Caching**: Cache processed results in Vercel KV

### API Performance

1. **Edge Functions**: Use for lightweight operations
2. **Connection Pooling**: Optimize database connections
3. **Response Caching**: Cache workflow configurations
4. **Compression**: Enable gzip compression for API responses

### Frontend Performance

1. **Code Splitting**: Lazy load components
2. **Image Optimization**: Use Next.js Image component
3. **State Management**: Efficient state updates with Zustand
4. **Bundle Optimization**: Tree shaking and minification

## Security Considerations

### Authentication Security

```typescript
// Whitelist validation
async function validateWhitelistedUser(email: string): Promise<boolean> {
  const user = await db.user.findUnique({
    where: { email },
    select: { isWhitelisted: true },
  });
  return user?.isWhitelisted ?? false;
}

// Password security
import bcrypt from "bcryptjs";

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}
```

### API Security

1. **Rate Limiting**: Implement per-user rate limits
2. **Input Validation**: Validate all inputs with Zod
3. **CORS Configuration**: Restrict origins in production
4. **API Key Protection**: Secure fal.ai API keys in environment variables

### File Security

1. **File Type Validation**: Strict MIME type checking
2. **File Size Limits**: Prevent large file uploads
3. **Virus Scanning**: Consider integration for production
4. **Signed URLs**: Use temporary URLs for image access

## Deployment Strategy

### Vercel Deployment Configuration

```typescript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["@vercel/postgres"],
  },
  images: {
    domains: ["your-blob-domain.vercel-storage.com"],
  },
};

module.exports = nextConfig;
```

### Environment Setup

1. **Development**: Local development with Vercel CLI
2. **Staging**: Preview deployments for testing
3. **Production**: Main branch auto-deployment

### Monitoring and Logging

1. **Vercel Analytics**: Track performance metrics
2. **Error Tracking**: Implement error logging
3. **Usage Monitoring**: Track API usage and costs
4. **Performance Monitoring**: Monitor function execution times

This design provides a solid foundation for building your image-to-image processing MVP with Vercel optimization and modular fal.ai integration.
