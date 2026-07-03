ALTER TABLE "lessons" ADD COLUMN IF NOT EXISTS "cohort_id" uuid REFERENCES "cohorts"("id") ON DELETE CASCADE;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_lessons_cohort" ON "lessons" ("cohort_id");
