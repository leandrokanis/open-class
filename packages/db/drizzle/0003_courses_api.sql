CREATE TYPE "public"."level_enum" AS ENUM('beginner', 'intermediate', 'advanced');--> statement-breakpoint
CREATE TYPE "public"."visibility_enum" AS ENUM('visible', 'hidden');--> statement-breakpoint
CREATE TYPE "public"."content_type_enum" AS ENUM('video', 'text', 'quiz');--> statement-breakpoint

-- courses: campos para CRUD completo
ALTER TABLE "courses" ADD COLUMN "short_description" varchar(200);--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN "level" "level_enum";--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN "deleted_at" timestamp with time zone;--> statement-breakpoint

-- lessons: re-adiciona content_type (dropado em 0002), adiciona resources e visibility; torna youtube_video_id nullable
ALTER TABLE "lessons" ADD COLUMN "content_type" "content_type_enum" NOT NULL DEFAULT 'video';--> statement-breakpoint
ALTER TABLE "lessons" ADD COLUMN "resources" jsonb;--> statement-breakpoint
ALTER TABLE "lessons" ADD COLUMN "visibility" "visibility_enum" NOT NULL DEFAULT 'visible';--> statement-breakpoint
ALTER TABLE "lessons" ALTER COLUMN "youtube_video_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "lessons" DROP COLUMN IF EXISTS "is_visible";--> statement-breakpoint

-- modules: substitui is_visible boolean por visibility enum
ALTER TABLE "modules" ADD COLUMN "visibility" "visibility_enum" NOT NULL DEFAULT 'visible';--> statement-breakpoint
ALTER TABLE "modules" DROP COLUMN IF EXISTS "is_visible";
