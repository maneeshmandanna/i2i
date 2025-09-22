# Architecture Plan & Technical Specifications

## System Architecture Overview

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API    │    │   fal.ai        │
│   (React/Next)  │◄──►│   (Node.js)      │◄──►│   Workflows     │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │
         │                       │
         ▼                       ▼
┌─────────────────┐    ┌──────────────────┐
│   CDN/Storage   │    │   Queue System   │
│   (S3/CloudFront│    │   (Redis/Bull)   │
└─────────────────┘    └──────────────────┘
                                │
                                ▼
                       ┌──────────────────┐
                       │   Database       │
                       │   (PostgreSQL)   │
                       └──────────────────┘
```

## Core Technology Stack

### Frontend Stack

- **Framework**: Next.js 14 with App Router
- **UI Library**: Tailwind CSS + Shadcn/ui components
- **State Management**: Zustand for client state
- **File Upload**: React Dropzone with progress tracking
- **Real-time**: Socket.io client for live updates
- **Image Display**: Next.js Image optimization

### Backend Stack

- **Runtime**: Node.js 20+ with TypeScript
- **Framework**: Express.js with Helmet security
- **Authentication**: JWT with refresh tokens
- **Queue System**: Bull Queue with Redis
- **File Processing**: Sharp for image optimization
- **API Documentation**: OpenAPI/Swagger
- **Validation**: Zod for request validation

### Database & Storage

- **Primary DB**: PostgreSQL 15+ with connection pooling
- **Cache Layer**: Redis 7+ for sessions and queues
- **File Storage**: AWS S3 with CloudFront CDN
- **Search**: PostgreSQL full-text search (MVP)

### Infrastructure

- **Cloud Provider**: AWS (primary) with multi-AZ deployment
- **Container**: Docker with ECS/Fargate
- **Load Balancer**: Application Load Balancer
- **Monitoring**: CloudWatch + DataDog
- **CI/CD**: GitHub Actions with automated testing

## Detailed Component Specifications

### 1. Frontend Application Architecture

#### Core Components Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication routes
│   ├── dashboard/         # Main application
│   └── api/               # API routes (if needed)
├── components/
│   ├── ui/                # Reusable UI components
│   ├── upload/            # Upload-related components
│   ├── processing/        # Processing status components
│   └── results/           # Result display components
├── lib/
│   ├── api.ts            # API client configuration
│   ├── socket.ts         # WebSocket client
│   └── utils.ts          # Utility functions
└── stores/               # Zustand stores
    ├── auth.ts
    ├── upload.ts
    └── processing.ts
```

#### Key Frontend Features

- **Progressive Web App** capabilities for mobile users
- **Offline support** for viewing previously processed images
- **Responsive design** optimized for desktop and mobile
- **Accessibility compliance** (WCAG 2.1 AA)
- **Performance optimization** with code splitting and lazy loading

### 2. Backend API Architecture

#### Service Layer Structure

```
src/
├── controllers/           # Request handlers
│   ├── auth.controller.ts
│   ├── upload.controller.ts
│   ├── processing.controller.ts
│   └── user.controller.ts
├── services/             # Business logic
│   ├── fal-ai.service.ts
│   ├── image.service.ts
│   ├── queue.service.ts
│   └── storage.service.ts
├── models/               # Database models
│   ├── user.model.ts
│   ├── job.model.ts
│   └── image.model.ts
├── middleware/           # Express middleware
│   ├── auth.middleware.ts
│   ├── validation.middleware.ts
│   └── rate-limit.middleware.ts
└── utils/               # Utility functions
    ├── logger.ts
    ├── errors.ts
    └── config.ts
```

#### API Endpoints Design

```typescript
// Core API Routes
POST   /api/auth/login
POST   /api/auth/register
POST   /api/auth/refresh

POST   /api/images/upload
GET    /api/images/:id
DELETE /api/images/:id

POST   /api/processing/start
GET    /api/processing/:jobId/status
POST   /api/processing/:jobId/cancel

GET    /api/workflows
GET    /api/workflows/:id/parameters

GET    /api/users/profile
GET    /api/users/history
PUT    /api/users/settings
```

### 3. fal.ai Integration Layer

#### Integration Service Design

```typescript
interface FalAIService {
  // Workflow management
  listWorkflows(): Promise<Workflow[]>;
  getWorkflowDetails(id: string): Promise<WorkflowDetails>;

  // Processing operations
  submitJob(params: ProcessingParams): Promise<JobResponse>;
  getJobStatus(jobId: string): Promise<JobStatus>;
  cancelJob(jobId: string): Promise<void>;

  // Result handling
  downloadResult(jobId: string): Promise<Buffer>;
  getResultMetadata(jobId: string): Promise<ResultMetadata>;
}
```

#### Error Handling Strategy

- **Retry Logic**: Exponential backoff for transient failures
- **Circuit Breaker**: Prevent cascade failures during fal.ai outages
- **Fallback Mechanisms**: Queue jobs when fal.ai is unavailable
- **Monitoring**: Track success rates and response times

### 4. Queue Management System

#### Queue Architecture

```typescript
// Job Types
interface ProcessingJob {
  id: string;
  userId: string;
  imageId: string;
  workflowId: string;
  parameters: Record<string, any>;
  priority: "low" | "normal" | "high";
  createdAt: Date;
  attempts: number;
}

// Queue Configuration
const queueConfig = {
  defaultJobOptions: {
    removeOnComplete: 100,
    removeOnFail: 50,
    attempts: 3,
    backoff: "exponential",
  },
  concurrency: 10, // Adjust based on fal.ai limits
  rateLimiter: {
    max: 100,
    duration: 60000, // 100 jobs per minute
  },
};
```

## Database Schema Design

### Core Tables

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  subscription_tier VARCHAR(50) DEFAULT 'free',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Images table
CREATE TABLE images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  filename VARCHAR(255) NOT NULL,
  original_filename VARCHAR(255) NOT NULL,
  file_size BIGINT NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  storage_path VARCHAR(500) NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Processing jobs table
CREATE TABLE processing_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  image_id UUID REFERENCES images(id) ON DELETE CASCADE,
  workflow_id VARCHAR(100) NOT NULL,
  parameters JSONB NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  fal_job_id VARCHAR(255),
  result_image_id UUID REFERENCES images(id),
  error_message TEXT,
  processing_time_ms INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);

-- Workflows table (cached from fal.ai)
CREATE TABLE workflows (
  id VARCHAR(100) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  parameters_schema JSONB NOT NULL,
  is_active BOOLEAN DEFAULT true,
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Indexes for Performance

```sql
-- Performance indexes
CREATE INDEX idx_processing_jobs_user_status ON processing_jobs(user_id, status);
CREATE INDEX idx_processing_jobs_created_at ON processing_jobs(created_at DESC);
CREATE INDEX idx_images_user_created ON images(user_id, created_at DESC);
CREATE INDEX idx_workflows_category_active ON workflows(category, is_active);
```

## Security Architecture

### Authentication & Authorization

- **JWT Tokens**: Short-lived access tokens (15 min) + refresh tokens (7 days)
- **Rate Limiting**: Per-user and per-IP limits to prevent abuse
- **Input Validation**: Comprehensive validation using Zod schemas
- **File Security**: Virus scanning and file type validation
- **CORS Configuration**: Strict origin policies for production

### Data Protection

- **Encryption at Rest**: S3 server-side encryption with KMS
- **Encryption in Transit**: TLS 1.3 for all communications
- **Image Privacy**: Signed URLs with expiration for image access
- **Data Retention**: Automatic cleanup of processed images after 30 days (configurable)

## Deployment Architecture

### AWS Infrastructure

```yaml
# Infrastructure Components
VPC:
  - Public subnets (2 AZs) for load balancers
  - Private subnets (2 AZs) for application servers
  - Database subnets (2 AZs) for RDS

Compute:
  - ECS Fargate for containerized applications
  - Application Load Balancer with SSL termination
  - Auto Scaling Groups based on CPU/memory metrics

Storage:
  - RDS PostgreSQL Multi-AZ for high availability
  - ElastiCache Redis cluster for caching
  - S3 buckets with CloudFront CDN

Monitoring:
  - CloudWatch for metrics and logs
  - AWS X-Ray for distributed tracing
  - SNS for alerting
```

### Environment Configuration

```typescript
// Environment-specific settings
interface Config {
  NODE_ENV: "development" | "staging" | "production";

  // Database
  DATABASE_URL: string;
  REDIS_URL: string;

  // Storage
  AWS_S3_BUCKET: string;
  AWS_CLOUDFRONT_DOMAIN: string;

  // External APIs
  FAL_AI_API_KEY: string;
  FAL_AI_BASE_URL: string;

  // Security
  JWT_SECRET: string;
  JWT_REFRESH_SECRET: string;

  // Features
  MAX_FILE_SIZE_MB: number;
  MAX_CONCURRENT_JOBS: number;
  RATE_LIMIT_REQUESTS_PER_MINUTE: number;
}
```

## Performance & Scalability Considerations

### Caching Strategy

- **CDN Caching**: Static assets and processed images
- **Redis Caching**: User sessions, workflow metadata, job status
- **Database Query Caching**: Frequently accessed data
- **Application-level Caching**: In-memory caching for hot data

### Scaling Approach

- **Horizontal Scaling**: Auto-scaling ECS services based on metrics
- **Database Scaling**: Read replicas for query distribution
- **Queue Scaling**: Dynamic worker scaling based on queue depth
- **Storage Scaling**: S3 automatic scaling with lifecycle policies

### Performance Targets

- **API Response Time**: < 200ms for 95th percentile
- **Image Upload**: < 30 seconds for 50MB files
- **Processing Queue**: < 5 minute wait time during peak hours
- **Availability**: 99.9% uptime SLA

## Development Phases

### Phase 1: MVP (3-4 months)

1. **Week 1-2**: Project setup, infrastructure provisioning
2. **Week 3-6**: Core backend API and fal.ai integration
3. **Week 7-10**: Frontend development and basic UI
4. **Week 11-12**: Integration testing and deployment
5. **Week 13-16**: Bug fixes, optimization, and launch preparation

### Phase 2: Enhanced Features (4-6 months)

1. **Month 1-2**: Real-time features and advanced UI
2. **Month 3-4**: Batch processing and workflow management
3. **Month 5-6**: API development and performance optimization

### Phase 3: Enterprise Features (8-12 months)

1. **Month 1-3**: Advanced security and compliance
2. **Month 4-6**: AI automation and workflow intelligence
3. **Month 7-9**: Enterprise API platform
4. **Month 10-12**: Business intelligence and analytics

## Risk Mitigation

### Technical Risks

- **fal.ai Dependency**: Implement circuit breakers and fallback queuing
- **Scaling Challenges**: Load testing and gradual rollout strategy
- **Data Loss**: Comprehensive backup and disaster recovery plan
- **Security Vulnerabilities**: Regular security audits and penetration testing

### Business Risks

- **Cost Overruns**: Detailed monitoring and budget alerts
- **Timeline Delays**: Agile development with regular checkpoints
- **Market Changes**: Flexible architecture for feature pivots
- **Compliance Issues**: Early compliance review and legal consultation
