CREATE TABLE IF NOT EXISTS "extra_unlock_celebrations" (
	"student_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
	"module_id" uuid NOT NULL REFERENCES "modules"("id") ON DELETE CASCADE,
	"celebrated_at" timestamp with time zone NOT NULL DEFAULT now(),
	CONSTRAINT "extra_unlock_celebrations_pk" PRIMARY KEY ("student_id", "module_id")
);
