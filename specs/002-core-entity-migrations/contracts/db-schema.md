# Contract: Database Schema

**Feature**: 002-core-entity-migrations | **Date**: 2026-05-16

This document defines the database schema contract introduced by this feature. Future API features (courses CRUD, enrollment management) build on top of this schema. Any change to these table structures is a breaking change requiring a new migration and version bump.

---

## Drizzle Type Exports

After this feature, `@open-class/db` will export the following TypeScript types (inferred from Drizzle schema):

```typescript
// courses.ts
export type Course    = typeof courses.$inferSelect;
export type NewCourse = typeof courses.$inferInsert;
export type CourseStatus = 'draft' | 'published';

// modules.ts
export type Module    = typeof modules.$inferSelect;
export type NewModule = typeof modules.$inferInsert;

// lessons.ts
export type Lesson       = typeof lessons.$inferSelect;
export type NewLesson    = typeof lessons.$inferInsert;
export type ContentType  = 'video' | 'text' | 'quiz';

// enrollments.ts
export type Enrollment       = typeof enrollments.$inferSelect;
export type NewEnrollment    = typeof enrollments.$inferInsert;
export type EnrollmentStatus = 'active' | 'completed' | 'cancelled';
```

---

## Schema Contract: `courses`

```sql
CREATE TYPE course_status_enum AS ENUM ('draft', 'published');

CREATE TABLE courses (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instructor_id  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title          VARCHAR(255) NOT NULL,
  slug           VARCHAR(255) NOT NULL UNIQUE,
  description    TEXT,
  status         course_status_enum NOT NULL DEFAULT 'draft',
  thumbnail_url  TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

## Schema Contract: `modules`

```sql
CREATE TABLE modules (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id   UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title       VARCHAR(255) NOT NULL,
  description TEXT,
  position    INTEGER NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_modules_course_position ON modules(course_id, position);
```

---

## Schema Contract: `lessons`

```sql
CREATE TYPE content_type_enum AS ENUM ('video', 'text', 'quiz');

CREATE TABLE lessons (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id    UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  title        VARCHAR(255) NOT NULL,
  content_type content_type_enum NOT NULL,
  duration     INTEGER,
  position     INTEGER NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_lessons_module_position ON lessons(module_id, position);
```

---

## Schema Contract: `enrollments`

```sql
CREATE TYPE enrollment_status_enum AS ENUM ('active', 'completed', 'cancelled');

CREATE TABLE enrollments (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id   UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  status      enrollment_status_enum NOT NULL DEFAULT 'active',
  enrolled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(student_id, course_id)
);
```

---

## Breaking Change Policy

Any of the following constitutes a breaking change requiring a new migration:

- Renaming a table or column
- Changing a column's type or nullability
- Removing a table or column
- Adding a NOT NULL column without a default
- Changing enum values (adding is safe; renaming/removing is breaking)

Non-breaking changes (additive-only migrations are safe):
- Adding nullable columns
- Adding new enum values
- Adding indexes
- Adding new tables
