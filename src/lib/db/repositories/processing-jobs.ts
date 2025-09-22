import { eq, and, sql, desc } from "drizzle-orm";
import { db } from "../connection";
import { processingJobs, images, users } from "../schema";
import type {
  ProcessingJob,
  CreateProcessingJobInput,
  UpdateProcessingJobInput,
  ProcessingJobFilters,
  ProcessingJobWithImages,
  ProcessingJobWithUser,
  PaginationOptions,
  PaginatedResult,
} from "../../../types/database";

export class ProcessingJobRepository {
  // Create a new processing job
  static async create(input: CreateProcessingJobInput): Promise<ProcessingJob> {
    const [job] = await db.insert(processingJobs).values(input).returning();
    return job as ProcessingJob;
  }

  // Find job by ID
  static async findById(id: string): Promise<ProcessingJob | null> {
    const [job] = await db
      .select()
      .from(processingJobs)
      .where(eq(processingJobs.id, id))
      .limit(1);

    return job ? (job as ProcessingJob) : null;
  }

  // Find job by fal.ai job ID
  static async findByFalJobId(falJobId: string): Promise<ProcessingJob | null> {
    const [job] = await db
      .select()
      .from(processingJobs)
      .where(eq(processingJobs.falJobId, falJobId))
      .limit(1);

    return job ? (job as ProcessingJob) : null;
  }

  // Find jobs by user ID
  static async findByUserId(userId: string): Promise<ProcessingJob[]> {
    const jobs = await db
      .select()
      .from(processingJobs)
      .where(eq(processingJobs.userId, userId))
      .orderBy(desc(processingJobs.createdAt));

    return jobs as ProcessingJob[];
  }

  // Update job
  static async update(
    id: string,
    input: UpdateProcessingJobInput
  ): Promise<ProcessingJob | null> {
    const [job] = await db
      .update(processingJobs)
      .set(input)
      .where(eq(processingJobs.id, id))
      .returning();

    return job ? (job as ProcessingJob) : null;
  }

  // Delete job
  static async delete(id: string): Promise<boolean> {
    try {
      await db.delete(processingJobs).where(eq(processingJobs.id, id));
      return true;
    } catch (error) {
      console.error("Error deleting processing job:", error);
      return false;
    }
  }

  // Update job status
  static async updateStatus(
    id: string,
    status: "pending" | "processing" | "completed" | "failed",
    errorMessage?: string
  ): Promise<ProcessingJob | null> {
    const updateData: UpdateProcessingJobInput = { status };

    if (status === "completed") {
      updateData.completedAt = new Date();
    }

    if (errorMessage) {
      updateData.errorMessage = errorMessage;
    }

    return this.update(id, updateData);
  }

  // Complete job with result
  static async completeJob(
    id: string,
    resultImageId: string,
    processingTimeMs?: number
  ): Promise<ProcessingJob | null> {
    return this.update(id, {
      status: "completed",
      resultImageId,
      processingTimeMs,
      completedAt: new Date(),
    });
  }

  // Get job with images
  static async findByIdWithImages(
    id: string
  ): Promise<ProcessingJobWithImages | null> {
    const [result] = await db
      .select({
        job: processingJobs,
        originalImage: images,
        resultImage: {
          id: sql<string>`result_img.id`,
          userId: sql<string>`result_img.user_id`,
          filename: sql<string>`result_img.filename`,
          originalFilename: sql<string>`result_img.original_filename`,
          blobUrl: sql<string>`result_img.blob_url`,
          fileSize: sql<number>`result_img.file_size`,
          mimeType: sql<string>`result_img.mime_type`,
          width: sql<number>`result_img.width`,
          height: sql<number>`result_img.height`,
          isProcessed: sql<boolean>`result_img.is_processed`,
          createdAt: sql<Date>`result_img.created_at`,
        },
      })
      .from(processingJobs)
      .leftJoin(images, eq(processingJobs.originalImageId, images.id))
      .leftJoin(
        sql`${images} as result_img`,
        sql`${processingJobs.resultImageId} = result_img.id`
      )
      .where(eq(processingJobs.id, id))
      .limit(1);

    if (!result) return null;

    return {
      ...(result.job as ProcessingJob),
      originalImage: result.originalImage!,
      resultImage: result.resultImage.id ? result.resultImage : undefined,
    } as ProcessingJobWithImages;
  }

  // Get user's processing history with images
  static async getUserHistoryWithImages(
    userId: string
  ): Promise<ProcessingJobWithImages[]> {
    const results = await db
      .select({
        job: processingJobs,
        originalImage: images,
        resultImage: {
          id: sql<string>`result_img.id`,
          userId: sql<string>`result_img.user_id`,
          filename: sql<string>`result_img.filename`,
          originalFilename: sql<string>`result_img.original_filename`,
          blobUrl: sql<string>`result_img.blob_url`,
          fileSize: sql<number>`result_img.file_size`,
          mimeType: sql<string>`result_img.mime_type`,
          width: sql<number>`result_img.width`,
          height: sql<number>`result_img.height`,
          isProcessed: sql<boolean>`result_img.is_processed`,
          createdAt: sql<Date>`result_img.created_at`,
        },
      })
      .from(processingJobs)
      .leftJoin(images, eq(processingJobs.originalImageId, images.id))
      .leftJoin(
        sql`${images} as result_img`,
        sql`${processingJobs.resultImageId} = result_img.id`
      )
      .where(eq(processingJobs.userId, userId))
      .orderBy(desc(processingJobs.createdAt));

    return results.map((result) => ({
      ...(result.job as ProcessingJob),
      originalImage: result.originalImage!,
      resultImage: result.resultImage.id ? result.resultImage : undefined,
    })) as ProcessingJobWithImages[];
  }

  // Get pending jobs
  static async getPendingJobs(): Promise<ProcessingJob[]> {
    const jobs = await db
      .select()
      .from(processingJobs)
      .where(eq(processingJobs.status, "pending"))
      .orderBy(processingJobs.createdAt);

    return jobs as ProcessingJob[];
  }

  // Get processing jobs (currently being processed)
  static async getProcessingJobs(): Promise<ProcessingJob[]> {
    const jobs = await db
      .select()
      .from(processingJobs)
      .where(eq(processingJobs.status, "processing"))
      .orderBy(processingJobs.createdAt);

    return jobs as ProcessingJob[];
  }

  // Get paginated jobs with filters
  static async findMany(
    filters: ProcessingJobFilters = {},
    pagination: PaginationOptions = {}
  ): Promise<PaginatedResult<ProcessingJob>> {
    const { page = 1, limit = 10 } = pagination;
    const offset = (page - 1) * limit;

    // Build where conditions
    const conditions = [];
    if (filters.userId) {
      conditions.push(eq(processingJobs.userId, filters.userId));
    }
    if (filters.status) {
      conditions.push(eq(processingJobs.status, filters.status));
    }
    if (filters.workflowName) {
      conditions.push(eq(processingJobs.workflowName, filters.workflowName));
    }
    if (filters.dateFrom) {
      conditions.push(sql`${processingJobs.createdAt} >= ${filters.dateFrom}`);
    }
    if (filters.dateTo) {
      conditions.push(sql`${processingJobs.createdAt} <= ${filters.dateTo}`);
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get total count
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(processingJobs)
      .where(whereClause);

    // Get paginated data
    const data = await db
      .select()
      .from(processingJobs)
      .where(whereClause)
      .limit(limit)
      .offset(offset)
      .orderBy(desc(processingJobs.createdAt));

    return {
      data: data as ProcessingJob[],
      total: count,
      page,
      limit,
      hasNext: offset + limit < count,
      hasPrev: page > 1,
    };
  }

  // Get job statistics for a user
  static async getUserJobStats(userId: string) {
    const [stats] = await db
      .select({
        total: sql<number>`count(*)`,
        completed: sql<number>`count(*) filter (where status = 'completed')`,
        failed: sql<number>`count(*) filter (where status = 'failed')`,
        pending: sql<number>`count(*) filter (where status = 'pending')`,
        processing: sql<number>`count(*) filter (where status = 'processing')`,
        avgProcessingTime: sql<number>`avg(processing_time_ms) filter (where processing_time_ms is not null)`,
      })
      .from(processingJobs)
      .where(eq(processingJobs.userId, userId));

    return stats;
  }
}
