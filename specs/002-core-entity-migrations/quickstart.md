# Quickstart: Core Entity Migrations

**Feature**: 002-core-entity-migrations | **Date**: 2026-05-16

## Prerequisites

- PostgreSQL running at `DATABASE_URL` (default: `postgresql://openclass:openclass@localhost:5432/openclass`)
- Node.js 20 + pnpm installed
- `pnpm install` already run at repo root

## Step 1 — Write failing tests (TDD gate)

Before adding any schema files, write integration tests that assert the expected constraints exist. Tests should fail initially because the tables don't exist yet.

```bash
# Run tests (expect failure — tables don't exist)
cd apps/api
pnpm test
```

Test files go in `apps/api/test/schema/`:
- `courses.test.ts` — slug uniqueness, instructor FK, status enum
- `modules.test.ts` — FK cascade from course, position ordering
- `lessons.test.ts` — FK cascade from module, content_type enum
- `enrollments.test.ts` — unique (student_id, course_id), cascade deletes

## Step 2 — Add Drizzle schema files

Create the four schema files in `packages/db/src/schema/`:

```
packages/db/src/schema/courses.ts
packages/db/src/schema/modules.ts
packages/db/src/schema/lessons.ts
packages/db/src/schema/enrollments.ts
```

See `data-model.md` for column definitions and `contracts/db-schema.md` for the expected SQL output.

Re-export from `packages/db/src/index.ts`:

```typescript
export * from './schema/courses';
export * from './schema/modules';
export * from './schema/lessons';
export * from './schema/enrollments';
```

## Step 3 — Generate migration SQL

```bash
# From repo root (uses pnpm workspaces)
pnpm --filter @open-class/db db:generate
```

This produces `packages/db/drizzle/0001_core_entities.sql`. Inspect the file to verify the SQL matches `contracts/db-schema.md`.

## Step 4 — Apply migration

```bash
pnpm --filter @open-class/db db:migrate
```

Or via the API shortcut:

```bash
cd apps/api && pnpm db:migrate
```

## Step 5 — Run tests (expect pass)

```bash
cd apps/api
pnpm test
```

All schema constraint tests should now pass. Verify:
- SC-001: CRUD works on all four tables
- SC-002: Duplicate enrollment insert throws unique violation
- SC-003: Deleting a course removes modules, lessons, enrollments
- SC-004: Ordering queries return modules/lessons sorted by `position ASC, id ASC`
- SC-005: Migration runs without errors on clean DB
- SC-006: Rollback (drop tables + enums) restores previous state

## Step 6 — Lint and type-check

```bash
# From repo root
pnpm turbo lint
pnpm turbo build
```

Both must exit with zero errors before the PR is opened.

## Rollback

To undo the migration (reverse the schema to pre-002 state):

```bash
# Option A: drizzle-kit push to a snapshot (development only)
pnpm --filter @open-class/db drizzle-kit drop

# Option B: manual SQL (production)
DROP TABLE IF EXISTS enrollments;
DROP TABLE IF EXISTS lessons;
DROP TABLE IF EXISTS modules;
DROP TABLE IF EXISTS courses;
DROP TYPE IF EXISTS enrollment_status_enum;
DROP TYPE IF EXISTS content_type_enum;
DROP TYPE IF EXISTS course_status_enum;
```

Enums must be dropped after tables because PostgreSQL does not allow dropping an enum that is in use.
