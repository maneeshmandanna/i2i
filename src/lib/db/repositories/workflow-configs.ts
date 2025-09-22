import { eq, and, sql } from "drizzle-orm";
import { db } from "../connection";
import { workflowConfigs } from "../schema";
import type {
  WorkflowConfig,
  CreateWorkflowConfigInput,
  UpdateWorkflowConfigInput,
  WorkflowConfigFilters,
  PaginationOptions,
  PaginatedResult,
} from "../../../types/database";

export class WorkflowConfigRepository {
  // Create a new workflow configuration
  static async create(
    input: CreateWorkflowConfigInput
  ): Promise<WorkflowConfig> {
    const [config] = await db
      .insert(workflowConfigs)
      .values({
        ...input,
        updatedAt: new Date(),
      })
      .returning();

    return config as WorkflowConfig;
  }

  // Find workflow config by ID
  static async findById(id: string): Promise<WorkflowConfig | null> {
    const [config] = await db
      .select()
      .from(workflowConfigs)
      .where(eq(workflowConfigs.id, id))
      .limit(1);

    return config ? (config as WorkflowConfig) : null;
  }

  // Get all active workflow configurations
  static async getActiveConfigs(): Promise<WorkflowConfig[]> {
    const configs = await db
      .select()
      .from(workflowConfigs)
      .where(eq(workflowConfigs.isActive, true))
      .orderBy(workflowConfigs.name);

    return configs as WorkflowConfig[];
  }

  // Get all workflow configurations
  static async getAll(): Promise<WorkflowConfig[]> {
    const configs = await db
      .select()
      .from(workflowConfigs)
      .orderBy(workflowConfigs.name);

    return configs as WorkflowConfig[];
  }

  // Update workflow config
  static async update(
    id: string,
    input: UpdateWorkflowConfigInput
  ): Promise<WorkflowConfig | null> {
    const [config] = await db
      .update(workflowConfigs)
      .set({
        ...input,
        updatedAt: new Date(),
      })
      .where(eq(workflowConfigs.id, id))
      .returning();

    return config ? (config as WorkflowConfig) : null;
  }

  // Delete workflow config
  static async delete(id: string): Promise<boolean> {
    try {
      await db.delete(workflowConfigs).where(eq(workflowConfigs.id, id));
      return true;
    } catch (error) {
      console.error("Error deleting workflow config:", error);
      return false;
    }
  }

  // Toggle workflow config active status
  static async toggleActive(id: string): Promise<WorkflowConfig | null> {
    const config = await this.findById(id);
    if (!config) return null;

    return this.update(id, { isActive: !config.isActive });
  }

  // Activate workflow config
  static async activate(id: string): Promise<WorkflowConfig | null> {
    return this.update(id, { isActive: true });
  }

  // Deactivate workflow config
  static async deactivate(id: string): Promise<WorkflowConfig | null> {
    return this.update(id, { isActive: false });
  }

  // Update workflow parameters
  static async updateParameters(
    id: string,
    parameters: Record<string, any>
  ): Promise<WorkflowConfig | null> {
    return this.update(id, { defaultParameters: parameters });
  }

  // Get workflow config by name (case-insensitive)
  static async findByName(name: string): Promise<WorkflowConfig | null> {
    const [config] = await db
      .select()
      .from(workflowConfigs)
      .where(sql`lower(${workflowConfigs.name}) = lower(${name})`)
      .limit(1);

    return config ? (config as WorkflowConfig) : null;
  }

  // Get paginated workflow configs with filters
  static async findMany(
    filters: WorkflowConfigFilters = {},
    pagination: PaginationOptions = {}
  ): Promise<PaginatedResult<WorkflowConfig>> {
    const { page = 1, limit = 10 } = pagination;
    const offset = (page - 1) * limit;

    // Build where conditions
    const conditions = [];
    if (filters.isActive !== undefined) {
      conditions.push(eq(workflowConfigs.isActive, filters.isActive));
    }
    if (filters.name) {
      conditions.push(
        sql`lower(${workflowConfigs.name}) like lower(${
          "%" + filters.name + "%"
        })`
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get total count
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(workflowConfigs)
      .where(whereClause);

    // Get paginated data
    const data = await db
      .select()
      .from(workflowConfigs)
      .where(whereClause)
      .limit(limit)
      .offset(offset)
      .orderBy(workflowConfigs.name);

    return {
      data: data as WorkflowConfig[],
      total: count,
      page,
      limit,
      hasNext: offset + limit < count,
      hasPrev: page > 1,
    };
  }

  // Check if workflow config exists
  static async exists(id: string): Promise<boolean> {
    const [result] = await db
      .select({ count: sql<number>`count(*)` })
      .from(workflowConfigs)
      .where(eq(workflowConfigs.id, id));

    return result.count > 0;
  }

  // Get workflow configs by endpoint
  static async findByEndpoint(endpoint: string): Promise<WorkflowConfig[]> {
    const configs = await db
      .select()
      .from(workflowConfigs)
      .where(eq(workflowConfigs.falEndpoint, endpoint))
      .orderBy(workflowConfigs.name);

    return configs as WorkflowConfig[];
  }

  // Bulk update workflow configs
  static async bulkUpdate(
    updates: Array<{ id: string; data: UpdateWorkflowConfigInput }>
  ): Promise<WorkflowConfig[]> {
    const results: WorkflowConfig[] = [];

    for (const { id, data } of updates) {
      const updated = await this.update(id, data);
      if (updated) {
        results.push(updated);
      }
    }

    return results;
  }
}
