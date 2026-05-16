-- Lesson resources table
CREATE TABLE "lesson_resources" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lesson_id" uuid NOT NULL,
	"title" varchar(255) NOT NULL,
	"url" text NOT NULL,
	"position" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "lesson_resources" ADD CONSTRAINT "lesson_resources_lesson_id_lessons_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."lessons"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX "idx_lesson_resources_lesson_position" ON "lesson_resources" USING btree ("lesson_id","position");
--> statement-breakpoint

-- Lessons: rename duration -> duration_seconds, drop content_type, add new columns
ALTER TABLE "lessons" RENAME COLUMN "duration" TO "duration_seconds";
--> statement-breakpoint
ALTER TABLE "lessons" DROP COLUMN IF EXISTS "content_type";
--> statement-breakpoint
ALTER TABLE "lessons" ADD COLUMN "description" text;
--> statement-breakpoint
ALTER TABLE "lessons" ADD COLUMN "youtube_url" text NOT NULL DEFAULT '';
--> statement-breakpoint
ALTER TABLE "lessons" ADD COLUMN "youtube_video_id" varchar(11) NOT NULL DEFAULT '';
--> statement-breakpoint
ALTER TABLE "lessons" ADD COLUMN "is_visible" boolean NOT NULL DEFAULT true;
--> statement-breakpoint
ALTER TABLE "lessons" ALTER COLUMN "youtube_url" DROP DEFAULT;
--> statement-breakpoint
ALTER TABLE "lessons" ALTER COLUMN "youtube_video_id" DROP DEFAULT;
--> statement-breakpoint

-- Modules: add is_visible
ALTER TABLE "modules" ADD COLUMN "is_visible" boolean NOT NULL DEFAULT true;
--> statement-breakpoint

-- Drop unused enum (content_type_enum) if no other table uses it
DROP TYPE IF EXISTS "public"."content_type_enum";
