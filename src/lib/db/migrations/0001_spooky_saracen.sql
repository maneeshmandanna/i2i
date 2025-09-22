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