# Research: Core Entity Migrations

**Feature**: 002-core-entity-migrations | **Date**: 2026-05-16

## R-01: Ordering Strategy for Modules and Lessons

**Decision**: Use a plain `integer` column named `position` (not a unique constraint) on `modules` and `lessons`. Application layer is responsible for assigning positions and resolving ties.

**Rationale**: A strict `UNIQUE(course_id, position)` or `UNIQUE(module_id, position)` constraint creates friction when reordering (you cannot shift records without a deferred-constraint or multi-step swap). An unconstrained `position` column is consistent with how most LMS platforms (Moodle, Canvas) handle ordering: sort by `position ASC, id ASC` and handle tie-breaking in the query layer. The spec states ordering is enforced (SC-004) but does not require DB-level uniqueness on position.

**Alternatives considered**:
- `UNIQUE(course_id, position)` — rejected: makes reordering require a temp-position juggle or deferred constraint.
- Linked-list pattern (`prev_id`/`next_id`) — rejected (YAGNI): adds join complexity with no measurable gain at current scale.

---

## R-02: Slug Uniqueness

**Decision**: `slug` on `courses` is a `varchar(255)` with a `UNIQUE` constraint enforced at the database level. Slug generation (e.g., from title) is the application layer's responsibility, not the schema's.

**Rationale**: FR-001 and the spec's Key Entities section both call out slug as a URL-friendly identifier. DB-level uniqueness is the correct enforcement point (consistent with `email` uniqueness on `users`). SC-005 / SC-006 do not require the schema to auto-generate slugs.

**Alternatives considered**:
- Application-layer uniqueness check only — rejected: race conditions under concurrent inserts.
- Partial unique index (slug WHERE status = 'published') — rejected (YAGNI): over-engineering for a platform at this scale.

---

## R-03: Enrollment Uniqueness Constraint

**Decision**: Composite `UNIQUE(student_id, course_id)` index on the `enrollments` table prevents duplicate enrollment rows for any status.

**Rationale**: FR-006 says "a student cannot have more than one active enrollment per course." The simplest and most correct implementation is a DB-level unique constraint on the pair, regardless of status. If a cancelled enrollment needs to be re-activated, the application layer updates the existing row rather than inserting a new one.

**Alternatives considered**:
- Partial unique index `WHERE status = 'active'` — considered, but rejected because it allows duplicate rows in different statuses, complicating queries and business logic.
- Application-layer guard only — rejected: not safe under concurrent requests.

---

## R-04: Cascading Deletes

**Decision**: All foreign keys referencing `courses` and `modules` use `ON DELETE CASCADE`. Foreign keys referencing `users` in both `courses` (instructor) and `enrollments` (student) also use `ON DELETE CASCADE`.

**Rationale**: FR-008 explicitly requires cascading deletes. Drizzle ORM expresses this as `.references(() => courses.id, { onDelete: 'cascade' })` — consistent with the existing `password_reset_tokens` pattern.

**Alternatives considered**:
- `ON DELETE RESTRICT` with soft-delete logic — rejected (YAGNI): no soft-delete requirement in spec.
- `ON DELETE SET NULL` for enrollment when course is deleted — rejected: FR-008 explicitly requires deletion.

---

## R-05: Migration Reversibility (drizzle-kit)

**Decision**: drizzle-kit `generate` produces both the forward SQL and snapshot metadata in `drizzle/meta/`. Rollback is achieved by running `drizzle-kit drop` or manually applying the inverse DDL. SC-006 is satisfied because each migration file is a discrete, atomic `CREATE TABLE` block with corresponding `DROP TABLE` in the rollback path.

**Rationale**: drizzle-kit 0.30 generates reversible migrations by design — the snapshot in `drizzle/meta/` allows the tool to compute the diff. For integration tests, running the migration against a test DB and then dropping tables validates reversibility (SC-006).

**Alternatives considered**:
- Manual SQL migration files — rejected: drizzle-kit is already the established toolchain in this project.

---

## R-06: Enum Definitions

**Decision**: Three new `pgEnum` values will be created:
- `course_status_enum`: `['draft', 'published']`
- `content_type_enum`: `['video', 'text', 'quiz']`
- `enrollment_status_enum`: `['active', 'completed', 'cancelled']`

**Rationale**: Consistent with the existing `roleEnum` in `users.ts`. PostgreSQL enums provide DB-level constraint and are natively supported by Drizzle. Strings in application code map to these enum values via TypeScript types inferred from Drizzle.

**Alternatives considered**:
- `varchar` with a `CHECK` constraint — more portable but loses Drizzle's type inference benefit; rejected in favor of consistency.
