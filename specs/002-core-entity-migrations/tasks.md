# Tasks: Core Entity Migrations (Courses, Modules, Lessons, Enrollments)

**Input**: Design documents from `specs/002-core-entity-migrations/`

**Prerequisites**: plan.md ✅ | spec.md ✅ | research.md ✅ | data-model.md ✅ | contracts/db-schema.md ✅

**TDD Enforcement**: Constitution mandates Test-First (NON-NEGOTIABLE). Every implementation phase begins with test tasks that MUST be written and confirmed FAILING before any schema file is created.

**Organization**: Tasks grouped by user story. Each story delivers a complete, independently testable schema increment.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on each other)
- **[Story]**: Which user story this task belongs to ([US1], [US2], [US3])
- All schema files live in `packages/db/src/schema/`
- All integration tests live in `apps/api/test/schema/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create the test infrastructure that all user stories depend on.

- [x] T001 Create test directory `apps/api/test/schema/`
- [x] T002 Create integration test DB helper with transaction-based setup/teardown in `apps/api/test/schema/db-helpers.ts` — imports the `db` instance from `apps/api/src/db/index.ts`, exposes `setupTestDb()` / `teardownTestDb()` helpers

**Checkpoint**: Test infrastructure ready — all story test files can now import from `db-helpers.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: No cross-story foundational work required beyond Phase 1. Each user story owns its own schema files and enum definitions. The `packages/db/src/index.ts` re-export is updated incrementally per story.

*(No tasks — Phase 1 is sufficient to unblock all user stories)*

---

## Phase 3: User Story 1 — Course Creation and Structure (Priority: P1) 🎯 MVP

**Goal**: Deliver the `courses`, `modules`, and `lessons` tables with correct relationships, cascade deletes, and ordering support. A course with at least one module and one lesson can be created and retrieved.

**Independent Test**: Insert a course row, insert a module referencing it, insert a lesson referencing the module. Verify retrieval. Verify cascade: delete the course and confirm modules and lessons are also deleted.

### Tests for User Story 1 ⚠️ Write FIRST — confirm FAILING before T006

- [x] T003 [US1] Write failing integration test for `courses` table: slug uniqueness, instructor FK, status enum default in `apps/api/test/schema/courses.test.ts`
- [x] T004 [P] [US1] Write failing integration test for `modules` table: FK → courses with cascade, position field, CRUD in `apps/api/test/schema/modules.test.ts`
- [x] T005 [P] [US1] Write failing integration test for `lessons` table: FK → modules with cascade, content_type enum, position field, CRUD in `apps/api/test/schema/lessons.test.ts`

### Implementation for User Story 1

- [x] T006 [P] [US1] Create `packages/db/src/schema/courses.ts`: define `courseStatusEnum ('draft' | 'published')`, define `courses` table per `data-model.md` (id, instructor_id FK → users CASCADE, title, slug UNIQUE, description, status, thumbnail_url, timestamps)
- [x] T007 [P] [US1] Create `packages/db/src/schema/modules.ts`: define `modules` table (id, course_id FK → courses CASCADE, title, description, position integer, timestamps)
- [x] T008 [P] [US1] Create `packages/db/src/schema/lessons.ts`: define `contentTypeEnum ('video' | 'text' | 'quiz')`, define `lessons` table (id, module_id FK → modules CASCADE, title, content_type, duration nullable, position integer, timestamps)
- [x] T009 [US1] Re-export `courses`, `modules`, `lessons` and their types/enums from `packages/db/src/index.ts` (add after existing exports)
- [x] T010 [US1] Generate and apply US1 migration: `pnpm --filter @open-class/db db:generate` then `pnpm --filter @open-class/db db:migrate` — verify generated SQL matches `contracts/db-schema.md` before applying

**Checkpoint**: US1 tests in `apps/api/test/schema/courses.test.ts`, `modules.test.ts`, `lessons.test.ts` must now PASS. Cascade delete verified. Slug uniqueness verified.

---

## Phase 4: User Story 2 — Student Enrollment (Priority: P2)

**Goal**: Deliver the `enrollments` table with the unique `(student_id, course_id)` composite constraint and cascade deletes on both FKs. A student can enroll in a course; duplicate enrollment is rejected at the DB level.

**Independent Test**: Insert a student and course, create an enrollment. Attempt a second enrollment for the same pair — expect unique constraint violation. Delete the course — confirm enrollment is also deleted.

### Tests for User Story 2 ⚠️ Write FIRST — confirm FAILING before T012

- [x] T011 [US2] Write failing integration test for `enrollments` table: unique (student_id, course_id) violation, cascade delete on course delete, cascade delete on user delete, status enum default in `apps/api/test/schema/enrollments.test.ts`

### Implementation for User Story 2

- [x] T012 [US2] Create `packages/db/src/schema/enrollments.ts`: define `enrollmentStatusEnum ('active' | 'completed' | 'cancelled')`, define `enrollments` table (id, student_id FK → users CASCADE, course_id FK → courses CASCADE, status default 'active', enrolled_at defaultNow, updated_at, UNIQUE(student_id, course_id))
- [x] T013 [US2] Re-export `enrollments` and its types/enums from `packages/db/src/index.ts`
- [x] T014 [US2] Generate and apply US2 migration delta: `pnpm --filter @open-class/db db:generate` then `pnpm --filter @open-class/db db:migrate` — verify the generated SQL adds only the `enrollments` table and `enrollment_status_enum`

**Checkpoint**: US2 test in `apps/api/test/schema/enrollments.test.ts` must now PASS. Unique constraint verified. Both cascade directions verified.

---

## Phase 5: User Story 3 — Content Ordering and Navigation (Priority: P3)

**Goal**: Ensure modules and lessons are queryable in their instructor-defined `position` order efficiently. Composite indexes on `(course_id, position)` and `(module_id, position)` support the ordering queries required by US3 acceptance scenarios.

**Independent Test**: Insert a course with 3 modules at positions [3, 1, 2]. Query modules ordered by `position ASC, id ASC` — verify returned order is [1, 2, 3]. Repeat for lessons within a module.

### Tests for User Story 3 ⚠️ Write FIRST — confirm FAILING before T016

- [x] T015 [US3] Write failing integration test for ordering queries: insert modules out-of-position-order, assert `ORDER BY position ASC, id ASC` returns correct sequence; repeat for lessons in `apps/api/test/schema/ordering.test.ts`

### Implementation for User Story 3

- [x] T016 [P] [US3] Add composite index `(course_id, position)` to modules table using Drizzle's `.index()` in `packages/db/src/schema/modules.ts`
- [x] T017 [P] [US3] Add composite index `(module_id, position)` to lessons table using Drizzle's `.index()` in `packages/db/src/schema/lessons.ts`
- [x] T018 [US3] Generate and apply US3 migration delta: `pnpm --filter @open-class/db db:generate` then `pnpm --filter @open-class/db db:migrate` — verify generated SQL adds only the two `CREATE INDEX` statements

**Checkpoint**: US3 ordering test in `apps/api/test/schema/ordering.test.ts` must now PASS. All three user story test suites pass together.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Validate the full feature against all success criteria before PR.

- [x] T019 [P] Run full test suite: `cd apps/api && pnpm test` — confirm zero failures across all four test files
- [x] T020 [P] Build and type-check db package: `pnpm turbo build --filter @open-class/db` — zero type errors
- [x] T021 [P] Lint the API: `pnpm turbo lint --filter @open-class/api` — zero lint errors
- [x] T022 Validate migration reversibility (SC-006): drop all four tables and three enums in dependency order, then re-run `pnpm --filter @open-class/db db:migrate` — confirm schema is fully restored
- [x] T023 Verify SC-001 through SC-006 acceptance criteria are met as documented in `specs/002-core-entity-migrations/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: N/A — no cross-story blockers
- **US1 (Phase 3)**: Depends on Phase 1 (test helper) — MUST complete before US2 and US3 (later tables reference `courses`)
- **US2 (Phase 4)**: Depends on Phase 3 completion (`enrollments` references `courses`)
- **US3 (Phase 5)**: Depends on Phase 3 completion (indexes added to `modules` and `lessons`)
- **Polish (Phase 6)**: Depends on all story phases completing

### User Story Dependencies

- **US1 (P1)**: Depends only on Setup → no other story dependency
- **US2 (P2)**: Depends on US1 (the `enrollments.course_id` FK references `courses`) — cannot migrate independently
- **US3 (P3)**: Depends on US1 (indexes are on `modules` and `lessons`) — cannot add indexes before those tables exist

### Within Each User Story

1. Tests MUST be written and confirmed FAILING before any implementation task begins
2. Schema files (T006–T008, T012, T016–T017) before index export (T009, T013)
3. Export wiring before migration generation
4. Migration applied before tests are re-run to verify Green phase

---

## Parallel Opportunities

### Within Phase 3 (US1)

```
# Write failing tests in parallel:
T003: courses.test.ts
T004: modules.test.ts     ← parallel with T003 and T005
T005: lessons.test.ts

# Create schema files in parallel (after T003–T005 fail confirmed):
T006: courses.ts
T007: modules.ts          ← parallel with T006 and T008
T008: lessons.ts

# Then sequential: T009 (exports) → T010 (generate + migrate)
```

### Within Phase 5 (US3)

```
# Write failing test first (T015), then in parallel:
T016: add index to modules.ts
T017: add index to lessons.ts

# Then sequential: T018 (generate + migrate)
```

### Within Phase 6 (Polish)

```
# T019, T020, T021 can all run in parallel:
T019: pnpm test
T020: pnpm turbo build --filter @open-class/db
T021: pnpm turbo lint
```

---

## Implementation Strategy

### MVP First (User Story 1 Only — 8 tasks)

1. Complete Phase 1 (T001–T002): Setup
2. Complete Phase 3 tests (T003–T005): Write and confirm failing
3. Complete Phase 3 implementation (T006–T010): Schema + migration
4. **STOP and VALIDATE**: Courses, modules, lessons are fully functional in the DB
5. Run partial polish (T019 for US1 tests only)

### Incremental Delivery

1. Setup (T001–T002) → Test infrastructure ready
2. US1 (T003–T010) → Core course structure deliverable ← **MVP**
3. US2 (T011–T014) → Enrollment capability added
4. US3 (T015–T018) → Ordering performance guaranteed
5. Polish (T019–T023) → PR-ready

### Single-Developer Flow (Recommended)

Complete phases sequentially in priority order — US1 → US2 → US3 → Polish. Each migration delta is small and reviewable. Test suite grows incrementally: 3 files after US1, 4 after US2, 5 after US3.

---

## Notes

- TDD is non-negotiable per constitution — never start an implementation task without a failing test
- Each migration delta must be inspected before `db:migrate` is run — compare against `contracts/db-schema.md`
- The `packages/db/src/index.ts` re-export is additive — never remove existing exports
- `[P]` tasks modify different files and have no shared state — safe to run concurrently
- Commit after each checkpoint (US1 complete, US2 complete, US3 complete, polish complete)
