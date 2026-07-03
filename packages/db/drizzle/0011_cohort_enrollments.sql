CREATE TABLE IF NOT EXISTS "cohort_enrollments" (
	"cohort_id" uuid NOT NULL REFERENCES "cohorts"("id") ON DELETE CASCADE,
	"student_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
	"enrolled_at" timestamp with time zone NOT NULL DEFAULT now(),
	CONSTRAINT "cohort_enrollments_pk" PRIMARY KEY ("cohort_id", "student_id")
);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_cohort_enrollments_student" ON "cohort_enrollments" ("student_id");
