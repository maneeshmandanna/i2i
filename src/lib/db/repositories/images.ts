import { eq, and, sql } from "drizzle-orm";
import { db } from "../connection";
import { images } from "../schema";
import type {
  ImageRecord,
  CreateImageInput,
  UpdateImageInput,
  ImageFilters,
  PaginationOptions,
  PaginatedResult,
} from "../../../types/database";

export class ImageRepository {
  // Create a new image record
  static async create(input: CreateImageInput): Promise<ImageRecord> {
    const [image] = await db.insert(images).values(input).returning();
    return image as ImageRecord;
  }

  // Find image by ID
  static async findById(id: string): Promise<ImageRecord | null> {
    const [image] = await db
      .select()
      .from(images)
      .where(eq(images.id, id))
      .limit(1);

    return image ? (image as ImageRecord) : null;
  }

  // Find images by user ID
  static async findByUserId(userId: string): Promise<ImageRecord[]> {
    const results = await db
      .select()
      .from(images)
      .where(eq(images.userId, userId))
      .orderBy(images.createdAt);

    return results as ImageRecord[];
  }

  // Update image
  static async update(
    id: string,
    input: UpdateImageInput
  ): Promise<ImageRecord | null> {
    const [image] = await db
      .update(images)
      .set(input)
      .where(eq(images.id, id))
      .returning();

    return image ? (image as ImageRecord) : null;
  }

  // Delete image
  static async delete(id: string): Promise<boolean> {
    try {
      await db.delete(images).where(eq(images.id, id));
      return true;
    } catch (error) {
      console.error("Error deleting image:", error);
      return false;
    }
  }

  // Mark image as processed
  static async markAsProcessed(id: string): Promise<ImageRecord | null> {
    return this.update(id, { isProcessed: true });
  }

  // Get user's processed images
  static async getProcessedImages(userId: string): Promise<ImageRecord[]> {
    const results = await db
      .select()
      .from(images)
      .where(and(eq(images.userId, userId), eq(images.isProcessed, true)))
      .orderBy(images.createdAt);

    return results as ImageRecord[];
  }

  // Get paginated images with filters
  static async findMany(
    filters: ImageFilters = {},
    pagination: PaginationOptions = {}
  ): Promise<PaginatedResult<ImageRecord>> {
    const { page = 1, limit = 10 } = pagination;
    const offset = (page - 1) * limit;

    // Build where conditions
    const conditions = [];
    if (filters.userId) {
      conditions.push(eq(images.userId, filters.userId));
    }
    if (filters.isProcessed !== undefined) {
      conditions.push(eq(images.isProcessed, filters.isProcessed));
    }
    if (filters.mimeType) {
      conditions.push(eq(images.mimeType, filters.mimeType));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get total count
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(images)
      .where(whereClause);

    // Get paginated data
    const data = await db
      .select()
      .from(images)
      .where(whereClause)
      .limit(limit)
      .offset(offset)
      .orderBy(images.createdAt);

    return {
      data: data as ImageRecord[],
      total: count,
      page,
      limit,
      hasNext: offset + limit < count,
      hasPrev: page > 1,
    };
  }

  // Get storage usage for a user
  static async getUserStorageUsage(userId: string): Promise<number> {
    const [result] = await db
      .select({ totalSize: sql<number>`sum(${images.fileSize})` })
      .from(images)
      .where(eq(images.userId, userId));

    return result?.totalSize || 0;
  }

  // Clean up orphaned images (images without processing jobs)
  static async findOrphanedImages(
    olderThanDays: number = 7
  ): Promise<ImageRecord[]> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

    const results = await db
      .select()
      .from(images)
      .where(
        and(
          sql`${images.createdAt} < ${cutoffDate}`,
          eq(images.isProcessed, false)
        )
      );

    return results as ImageRecord[];
  }
}
