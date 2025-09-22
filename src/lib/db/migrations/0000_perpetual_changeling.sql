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