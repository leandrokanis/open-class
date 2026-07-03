CREATE TABLE IF NOT EXISTS "lesson_cohorts" (
	"lesson_id" uuid NOT NULL REFERENCES "lessons"("id") ON DELETE CASCADE,
	"cohort_id" uuid NOT NULL REFERENCES "cohorts"("id") ON DELETE CASCADE,
	CONSTRAINT "lesson_cohorts_pk" PRIMARY KEY ("lesson_id", "cohort_id")
);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_lesson_cohorts_cohort" ON "lesson_cohorts" ("cohort_id");--> statement-breakpoint
INSERT INTO "lesson_cohorts" ("lesson_id", "cohort_id")
	SELECT "id", "cohort_id" FROM "lessons" WHERE "cohort_id" IS NOT NULL
	ON CONFLICT DO NOTHING;--> statement-breakpoint
ALTER TABLE "lessons" DROP COLUMN IF EXISTS "cohort_id";
