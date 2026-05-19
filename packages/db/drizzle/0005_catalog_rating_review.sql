ALTER TABLE "courses" ADD COLUMN IF NOT EXISTS "rating" decimal(3,2);--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN IF NOT EXISTS "review_count" integer NOT NULL DEFAULT 0;
