import { eq, and, sql } from "drizzle-orm";
import { db } from "../connection";
import { users } from "../schema";
import type {
  User,
  CreateUserInput,
  UpdateUserInput,
  UserFilters,
  PaginationOptions,
  PaginatedResult,
} from "../../../types/database";
import bcrypt from "bcryptjs";

export class UserRepository {
  // Create a new user
  static async create(input: CreateUserInput): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        ...input,
        updatedAt: new Date(),
      })
      .returning();

    return user as User;
  }

  // Find user by ID
  static async findById(id: string): Promise<User | null> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    return user ? (user as User) : null;
  }

  // Find user by email
  static async findByEmail(email: string): Promise<User | null> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    return user ? (user as User) : null;
  }

  // Update user
  static async update(
    id: string,
    input: UpdateUserInput
  ): Promise<User | null> {
    const [user] = await db
      .update(users)
      .set({
        ...input,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();

    return user ? (user as User) : null;
  }

  // Delete user
  static async delete(id: string): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, id));

    return (result.rowCount ?? 0) > 0;
  }

  // Check if user is whitelisted
  static async isWhitelisted(email: string): Promise<boolean> {
    const [user] = await db
      .select({ isWhitelisted: users.isWhitelisted })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    return user?.isWhitelisted ?? false;
  }

  // Verify user password
  static async verifyPassword(
    email: string,
    password: string
  ): Promise<User | null> {
    const user = await this.findByEmail(email);
    if (!user) return null;

    const isValid = await bcrypt.compare(password, user.passwordHash);
    return isValid ? user : null;
  }

  // Create user with hashed password
  static async createWithHashedPassword(
    email: string,
    password: string,
    isWhitelisted: boolean = false
  ): Promise<User> {
    const passwordHash = await bcrypt.hash(password, 12);

    return this.create({
      email,
      passwordHash,
      isWhitelisted,
    });
  }

  // Get paginated users with filters
  static async findMany(
    filters: UserFilters = {},
    pagination: PaginationOptions = {}
  ): Promise<PaginatedResult<User>> {
    const { page = 1, limit = 10 } = pagination;
    const offset = (page - 1) * limit;

    // Build where conditions
    const conditions = [];
    if (filters.email) {
      conditions.push(eq(users.email, filters.email));
    }
    if (filters.isWhitelisted !== undefined) {
      conditions.push(eq(users.isWhitelisted, filters.isWhitelisted));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get total count
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(whereClause);

    // Get paginated data
    const data = await db
      .select()
      .from(users)
      .where(whereClause)
      .limit(limit)
      .offset(offset);

    return {
      data: data as User[],
      total: count,
      page,
      limit,
      hasNext: offset + limit < count,
      hasPrev: page > 1,
    };
  }
}
