CREATE TABLE "categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"slug" varchar(100) NOT NULL,
	"description" text,
	"icon_url" text,
	"position" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "categories_name_unique" UNIQUE("name"),
	CONSTRAINT "categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "lesson_progress" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"student_id" uuid NOT NULL,
	"lesson_id" uuid NOT NULL,
	"is_completed" boolean DEFAULT false NOT NULL,
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "uq_lesson_progress_student_lesson" UNIQUE("student_id","lesson_id")
);
--> statement-breakpoint
CREATE TABLE "platform_config" (
	"key" varchar(100) PRIMARY KEY NOT NULL,
	"value" text DEFAULT '' NOT NULL,
	"label" varchar(255),
	"description" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN "category_id" uuid;--> statement-breakpoint
ALTER TABLE "lesson_progress" ADD CONSTRAINT "lesson_progress_student_id_users_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lesson_progress" ADD CONSTRAINT "lesson_progress_lesson_id_lessons_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."lessons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_categories_position" ON "categories" USING btree ("position");--> statement-breakpoint
CREATE INDEX "idx_lesson_progress_student" ON "lesson_progress" USING btree ("student_id");--> statement-breakpoint
CREATE INDEX "idx_lesson_progress_lesson" ON "lesson_progress" USING btree ("lesson_id");--> statement-breakpoint
ALTER TABLE "courses" ADD CONSTRAINT "courses_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_courses_category" ON "courses" USING btree ("category_id");
--> statement-breakpoint
INSERT INTO "platform_config" ("key", "value", "label", "description") VALUES
  ('app_name',      'Open Class',                 'Platform Name',  'Display name shown in the header and browser tab'),
  ('app_slogan',    'Free knowledge for everyone', 'Tagline',        'Short description shown on the home page'),
  ('primary_color', '#6366f1',                    'Primary Color',  'Main brand colour (hex)'),
  ('accent_color',  '#f59e0b',                    'Accent Color',   'Highlight colour for CTAs (hex)'),
  ('logo_url',      '',                           'Logo URL',       'URL of the platform logo image'),
  ('favicon_url',   '',                           'Favicon URL',    'URL of the browser favicon')
ON CONFLICT ("key") DO NOTHING;