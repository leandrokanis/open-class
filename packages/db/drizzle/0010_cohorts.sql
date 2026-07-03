DO $$ BEGIN
	CREATE TYPE "access_mode_enum" AS ENUM ('on_demand', 'cohort', 'both');
EXCEPTION
	WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN IF NOT EXISTS "access_mode" "access_mode_enum" NOT NULL DEFAULT 'on_demand';--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "cohorts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"course_id" uuid NOT NULL REFERENCES "courses"("id") ON DELETE CASCADE,
	"name" varchar(255) NOT NULL,
	"enrollment_start" timestamp with time zone NOT NULL,
	"enrollment_end" timestamp with time zone NOT NULL,
	"seats" integer NOT NULL,
	"closed_at" timestamp with time zone,
	"created_at" timestamp with time zone NOT NULL DEFAULT now(),
	"updated_at" timestamp with time zone NOT NULL DEFAULT now()
);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_cohorts_course" ON "cohorts" ("course_id");--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "cohort_module_schedules" (
	"cohort_id" uuid NOT NULL REFERENCES "cohorts"("id") ON DELETE CASCADE,
	"module_id" uuid NOT NULL REFERENCES "modules"("id") ON DELETE CASCADE,
	"available_from" timestamp with time zone NOT NULL,
	CONSTRAINT "cohort_module_schedules_pk" PRIMARY KEY ("cohort_id", "module_id")
);
