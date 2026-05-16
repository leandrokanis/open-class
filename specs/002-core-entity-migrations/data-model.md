# Data Model: Core Entity Migrations

**Feature**: 002-core-entity-migrations | **Date**: 2026-05-16

## Entity Relationship Overview

```
users (existing)
  │
  ├─[instructor_id]──► courses ──[cascade]──► modules ──[cascade]──► lessons
  │                       │
  └─[student_id]──────► enrollments ◄──[course_id]──┘
```

- `courses` references `users` (instructor) — `ON DELETE CASCADE`
- `modules` references `courses` — `ON DELETE CASCADE`
- `lessons` references `modules` — `ON DELETE CASCADE`
- `enrollments` references `users` (student) and `courses` — both `ON DELETE CASCADE`

---

## Enums

### `course_status_enum`
| Value | Meaning |
|-------|---------|
| `draft` | Not visible to students; default on creation |
| `published` | Visible and enrollable by students |

### `content_type_enum`
| Value | Meaning |
|-------|---------|
| `video` | Lesson delivers video content |
| `text` | Lesson delivers text/markdown content |
| `quiz` | Lesson is an assessment |

### `enrollment_status_enum`
| Value | Meaning |
|-------|---------|
| `active` | Student currently enrolled |
| `completed` | Student has finished the course |
| `cancelled` | Enrollment was cancelled |

---

## Table: `courses`

**Purpose**: Represents a complete learning unit owned by an instructor.

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | `uuid` | PK, `defaultRandom()` | |
| `instructor_id` | `uuid` | NOT NULL, FK → `users.id` CASCADE | Course author/owner |
| `title` | `varchar(255)` | NOT NULL | |
| `slug` | `varchar(255)` | NOT NULL, UNIQUE | URL-friendly identifier; generated at app layer |
| `description` | `text` | nullable | |
| `status` | `course_status_enum` | NOT NULL, default `'draft'` | |
| `thumbnail_url` | `text` | nullable | External reference only |
| `created_at` | `timestamp with timezone` | NOT NULL, `defaultNow()` | |
| `updated_at` | `timestamp with timezone` | NOT NULL, `defaultNow()` | |

**Indexes**: `UNIQUE(slug)` (implicit from constraint), FK index on `instructor_id`

**State Transitions**:
```
draft → published   (instructor publishes)
published → draft   (instructor unpublishes)
```

---

## Table: `modules`

**Purpose**: Logical section within a course, ordered by `position`.

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | `uuid` | PK, `defaultRandom()` | |
| `course_id` | `uuid` | NOT NULL, FK → `courses.id` CASCADE | |
| `title` | `varchar(255)` | NOT NULL | |
| `description` | `text` | nullable | |
| `position` | `integer` | NOT NULL | Ordering index; ties resolved by `id ASC` |
| `created_at` | `timestamp with timezone` | NOT NULL, `defaultNow()` | |
| `updated_at` | `timestamp with timezone` | NOT NULL, `defaultNow()` | |

**Indexes**: FK index on `course_id`; recommend composite index `(course_id, position)` for ordering queries.

**Notes**: No unique constraint on `(course_id, position)` — application layer manages position assignment. See research.md R-01.

---

## Table: `lessons`

**Purpose**: Smallest unit of content, ordered by `position` within a module.

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | `uuid` | PK, `defaultRandom()` | |
| `module_id` | `uuid` | NOT NULL, FK → `modules.id` CASCADE | |
| `title` | `varchar(255)` | NOT NULL | |
| `content_type` | `content_type_enum` | NOT NULL | `video`, `text`, or `quiz` |
| `duration` | `integer` | nullable | Estimated duration in seconds |
| `position` | `integer` | NOT NULL | Ordering index; ties resolved by `id ASC` |
| `created_at` | `timestamp with timezone` | NOT NULL, `defaultNow()` | |
| `updated_at` | `timestamp with timezone` | NOT NULL, `defaultNow()` | |

**Indexes**: FK index on `module_id`; recommend composite index `(module_id, position)`.

**Notes**: No `content_url` or `content_body` — lesson content is stored externally (spec assumption). Schema holds metadata and references only.

---

## Table: `enrollments`

**Purpose**: Junction between a student (user) and a course; tracks enrollment lifecycle.

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | `uuid` | PK, `defaultRandom()` | |
| `student_id` | `uuid` | NOT NULL, FK → `users.id` CASCADE | |
| `course_id` | `uuid` | NOT NULL, FK → `courses.id` CASCADE | |
| `status` | `enrollment_status_enum` | NOT NULL, default `'active'` | |
| `enrolled_at` | `timestamp with timezone` | NOT NULL, `defaultNow()` | Immutable enrollment timestamp |
| `updated_at` | `timestamp with timezone` | NOT NULL, `defaultNow()` | Last status change |

**Indexes**: `UNIQUE(student_id, course_id)` — prevents duplicate enrollment rows (FR-006, research.md R-03).

**Re-enrollment logic**: When a student re-enrolls in a course they previously cancelled, the application layer updates the existing row (`status = 'active'`, `updated_at = now()`) rather than inserting a new one.

---

## Drizzle Schema File Map

| Entity | File |
|--------|------|
| Enums + `courses` | `packages/db/src/schema/courses.ts` |
| `modules` | `packages/db/src/schema/modules.ts` |
| `lessons` | `packages/db/src/schema/lessons.ts` |
| `enrollments` | `packages/db/src/schema/enrollments.ts` |

All four files must be re-exported from `packages/db/src/index.ts`.

---

## Validation Rules (application layer, not DB constraints)

| Rule | Enforcement |
|------|-------------|
| Slug format: lowercase, alphanumeric, hyphens only | App layer (DTO validator) |
| Course must have ≥ 1 published module with ≥ 1 lesson before `status → published` | App layer |
| `position` must be a positive integer | App layer (DTO validator) |
| `duration` must be positive if provided | App layer (DTO validator) |
