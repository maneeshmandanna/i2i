-- Supabase SQL Setup for i2i-mvp
-- Generated on: 2025-09-19T12:32:11.568Z
-- 
-- Instructions:
-- 1. Go to your Supabase dashboard
-- 2. Navigate to SQL Editor
-- 3. Create a new query
-- 4. Copy and paste this entire SQL
-- 5. Click "Run" to execute
-- 
-- This will create all necessary tables and relationships

-- Migration: 0000_perpetual_changeling.sql
CREATE TABLE "images" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"filename" varchar(255) NOT NULL,
	"original_filename" varchar(255) NOT NULL,
	"blob_url" varchar(500) NOT NULL,
	"file_size" bigint NOT NULL,
	"mime_type" varchar(100) NOT NULL,
	"width" integer,
	"height" integer,
	"is_processed" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "processing_jobs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"original_image_id" uuid,
	"result_image_id" uuid,
	"workflow_name" varchar(100) NOT NULL,
	"fal_job_id" varchar(255),
	"status" varchar(50) DEFAULT 'pending',
	"parameters" jsonb,
	"error_message" text,
	"processing_time_ms" integer,
	"created_at" timestamp DEFAULT now(),
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" varchar(255) NOT NULL,
	"is_whitelisted" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "workflow_configs" (
	"id" varchar(100) PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"fal_endpoint" varchar(500) NOT NULL,
	"default_parameters" jsonb,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "images" ADD CONSTRAINT "images_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "processing_jobs" ADD CONSTRAINT "processing_jobs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "processing_jobs" ADD CONSTRAINT "processing_jobs_original_image_id_images_id_fk" FOREIGN KEY ("original_image_id") REFERENCES "public"."images"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "processing_jobs" ADD CONSTRAINT "processing_jobs_result_image_id_images_id_fk" FOREIGN KEY ("result_image_id") REFERENCES "public"."images"("id") ON DELETE set null ON UPDATE no action;

-- Migration: 0001_spooky_saracen.sql
ALTER TABLE "images" ALTER COLUMN "user_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "images" ALTER COLUMN "is_processed" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "images" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "processing_jobs" ALTER COLUMN "user_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "processing_jobs" ALTER COLUMN "original_image_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "processing_jobs" ALTER COLUMN "status" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "processing_jobs" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "is_whitelisted" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "updated_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "workflow_configs" ALTER COLUMN "is_active" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "workflow_configs" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "workflow_configs" ALTER COLUMN "updated_at" SET NOT NULL;

-- Supabase optimizations
-- Enable Row Level Security (RLS) for production
-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE images ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE processing_jobs ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE workflow_configs ENABLE ROW LEVEL SECURITY;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_images_user_id ON images(user_id);
CREATE INDEX IF NOT EXISTS idx_processing_jobs_user_id ON processing_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_processing_jobs_status ON processing_jobs(status);
CREATE INDEX IF NOT EXISTS idx_workflow_configs_active ON workflow_configs(is_active);

-- Grant necessary permissions
-- GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres;
-- GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres;

-- Success message
SELECT 'Database setup completed successfully!' as message;
