// User role types
export type UserRole = "user" | "admin" | "co-owner";

// User types
export interface User {
  id: string;
  email: string;
  passwordHash: string;
  isWhitelisted: boolean;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserInput {
  email: string;
  passwordHash: string;
  isWhitelisted?: boolean;
  role?: UserRole;
}

export interface UpdateUserInput {
  email?: string;
  passwordHash?: string;
  isWhitelisted?: boolean;
  role?: UserRole;
  updatedAt?: Date;
}

// Image types
export interface ImageRecord {
  id: string;
  userId: string;
  filename: string;
  originalFilename: string;
  blobUrl: string;
  fileSize: number;
  mimeType: string;
  width?: number | null;
  height?: number | null;
  isProcessed: boolean;
  createdAt: Date;
}

export interface CreateImageInput {
  userId: string;
  filename: string;
  originalFilename: string;
  blobUrl: string;
  fileSize: number;
  mimeType: string;
  width?: number;
  height?: number;
  isProcessed?: boolean;
}

export interface UpdateImageInput {
  filename?: string;
  blobUrl?: string;
  width?: number;
  height?: number;
  isProcessed?: boolean;
}

// Processing job types
export type ProcessingJobStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed";

export interface ProcessingJob {
  id: string;
  userId: string;
  originalImageId: string;
  resultImageId?: string | null;
  workflowName: string;
  falJobId?: string | null;
  status: ProcessingJobStatus;
  parameters?: Record<string, any>;
  errorMessage?: string | null;
  processingTimeMs?: number | null;
  createdAt: Date;
  completedAt?: Date | null;
}

export interface CreateProcessingJobInput {
  userId: string;
  originalImageId: string;
  workflowName: string;
  falJobId?: string;
  parameters?: Record<string, any>;
}

export interface UpdateProcessingJobInput {
  resultImageId?: string;
  falJobId?: string;
  status?: ProcessingJobStatus;
  parameters?: Record<string, any>;
  errorMessage?: string;
  processingTimeMs?: number;
  completedAt?: Date;
}

// Workflow configuration types
export interface WorkflowConfig {
  id: string;
  name: string;
  description?: string | null;
  falEndpoint: string;
  defaultParameters?: Record<string, any>;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateWorkflowConfigInput {
  id: string;
  name: string;
  description?: string;
  falEndpoint: string;
  defaultParameters?: Record<string, any>;
  isActive?: boolean;
}

export interface UpdateWorkflowConfigInput {
  name?: string;
  description?: string;
  falEndpoint?: string;
  defaultParameters?: Record<string, any>;
  isActive?: boolean;
  updatedAt?: Date;
}

// Extended types with relations
export interface UserWithImages extends User {
  images: ImageRecord[];
}

export interface UserWithJobs extends User {
  processingJobs: ProcessingJob[];
}

export interface ProcessingJobWithImages extends ProcessingJob {
  originalImage: ImageRecord;
  resultImage?: ImageRecord;
}

export interface ProcessingJobWithUser extends ProcessingJob {
  user: User;
}

// Database query result types
export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

// Filter types
export interface UserFilters {
  email?: string;
  isWhitelisted?: boolean;
  role?: UserRole;
}

export interface ImageFilters {
  userId?: string;
  isProcessed?: boolean;
  mimeType?: string;
}

export interface ProcessingJobFilters {
  userId?: string;
  status?: ProcessingJobStatus;
  workflowName?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

export interface WorkflowConfigFilters {
  isActive?: boolean;
  name?: string;
}
