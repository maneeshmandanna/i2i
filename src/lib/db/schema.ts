import {
  pgTable,
  uuid,
  varchar,
  boolean,
  timestamp,
  bigint,
  integer,
  text,
  jsonb,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Users table (whitelist-based authentication)
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 255 }).unique().notNull(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  isWhitelisted: boolean("is_whitelisted").default(false).notNull(),
  role: varchar("role", { length: 50 }).default("user").notNull(), // user, admin, co-owner
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Images table (original and processed images)
export const images = pgTable("images", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  filename: varchar("filename", { length: 255 }).notNull(),
  originalFilename: varchar("original_filename", { length: 255 }).notNull(),
  blobUrl: varchar("blob_url", { length: 500 }).notNull(),
  fileSize: bigint("file_size", { mode: "number" }).notNull(),
  mimeType: varchar("mime_type", { length: 100 }).notNull(),
  width: integer("width"),
  height: integer("height"),
  isProcessed: boolean("is_processed").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Processing jobs table
export const processingJobs = pgTable("processing_jobs", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  originalImageId: uuid("original_image_id")
    .references(() => images.id, {
      onDelete: "cascade",
    })
    .notNull(),
  resultImageId: uuid("result_image_id").references(() => images.id, {
    onDelete: "set null",
  }),
  workflowName: varchar("workflow_name", { length: 100 }).notNull(),
  falJobId: varchar("fal_job_id", { length: 255 }),
  status: varchar("status", { length: 50 }).default("pending").notNull(),
  parameters: jsonb("parameters"),
  errorMessage: text("error_message"),
  processingTimeMs: integer("processing_time_ms"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
});

// Workflow configurations table
export const workflowConfigs = pgTable("workflow_configs", {
  id: varchar("id", { length: 100 }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  falEndpoint: varchar("fal_endpoint", { length: 500 }).notNull(),
  defaultParameters: jsonb("default_parameters"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Define relations
export const usersRelations = relations(users, ({ many }) => ({
  images: many(images),
  processingJobs: many(processingJobs),
}));

export const imagesRelations = relations(images, ({ one, many }) => ({
  user: one(users, {
    fields: [images.userId],
    references: [users.id],
  }),
  originalProcessingJobs: many(processingJobs, {
    relationName: "originalImage",
  }),
  resultProcessingJobs: many(processingJobs, {
    relationName: "resultImage",
  }),
}));

export const processingJobsRelations = relations(processingJobs, ({ one }) => ({
  user: one(users, {
    fields: [processingJobs.userId],
    references: [users.id],
  }),
  originalImage: one(images, {
    fields: [processingJobs.originalImageId],
    references: [images.id],
    relationName: "originalImage",
  }),
  resultImage: one(images, {
    fields: [processingJobs.resultImageId],
    references: [images.id],
    relationName: "resultImage",
  }),
}));
