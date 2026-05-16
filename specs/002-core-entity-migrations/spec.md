# Feature Specification: Core Entity Migrations (Courses, Modules, Lessons, Enrollments)

**Feature Branch**: `002-core-entity-migrations`

**Created**: 2026-05-16

**Status**: Implemented

**Input**: User description: "Migrations: courses, modules, lessons, enrollments #8"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Course Creation and Structure (Priority: P1)

A platform administrator or instructor creates a course organized into modules and lessons, making it available for students to browse.

**Why this priority**: The course data structure is the foundation of the entire learning platform — no other feature (enrollment, progress tracking, content delivery) can work without it.

**Independent Test**: Can be tested by verifying that a course with at least one module and one lesson can be created and retrieved correctly, delivering a browsable course catalog.

**Acceptance Scenarios**:

1. **Given** no courses exist, **When** a course is created with title, description, and at least one module containing one lesson, **Then** the course is stored and retrievable with all its structured content.
2. **Given** a course exists with modules, **When** a new module is added to the course, **Then** the module appears in the correct order within the course.
3. **Given** a module exists, **When** a lesson is added to the module, **Then** the lesson is stored and linked to that module in the correct sequence.

---

### User Story 2 - Student Enrollment (Priority: P2)

A student enrolls in a published course, gaining access to its content and having their progress tracked from that point forward.

**Why this priority**: Enrollment is the primary action linking students to courses. Without it, the platform cannot track who has access to what content.

**Independent Test**: Can be tested by creating a student enrollment in a course and verifying the enrollment record exists with the correct status and timestamp.

**Acceptance Scenarios**:

1. **Given** a student and a published course exist, **When** the student enrolls in the course, **Then** an enrollment record is created with an active status and enrollment date.
2. **Given** a student is already enrolled in a course, **When** they attempt to enroll again, **Then** the system prevents duplicate enrollment.
3. **Given** a student is enrolled, **When** their enrollment record is queried, **Then** the record shows the course, student, enrollment date, and current status.

---

### User Story 3 - Content Ordering and Navigation (Priority: P3)

A student navigates through course content sequentially, following the instructor-defined order of modules and lessons.

**Why this priority**: Content ordering ensures a coherent learning experience. Without it, students cannot follow the intended curriculum path.

**Independent Test**: Can be tested by querying a course's modules and verifying they are returned in instructor-defined sequence, and same for lessons within a module.

**Acceptance Scenarios**:

1. **Given** a course has multiple modules, **When** the course structure is retrieved, **Then** modules appear in the order defined by the instructor.
2. **Given** a module has multiple lessons, **When** lessons are listed, **Then** they appear in the sequence defined by the instructor.
3. **Given** a module is reordered within a course, **Then** the new order is persisted correctly.

---

### Edge Cases

- What happens when a course is deleted — are its modules, lessons, and enrollments also removed or preserved?
- How does the system handle a module being moved between courses?
- What happens when two modules or lessons have the same order value?
- How does the system handle a student enrolling in a course that has no lessons yet?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST support creating courses with a title, description, publication status (draft/published), and an optional thumbnail reference.
- **FR-002**: System MUST support organizing courses into modules, where each module has a title, description, and a defined order within its course.
- **FR-003**: System MUST support organizing modules into lessons, where each lesson has a title, a content type (video, text, quiz), and a defined order within its module.
- **FR-004**: System MUST enforce referential integrity: modules belong to a course, lessons belong to a module — orphan records must not exist.
- **FR-005**: System MUST support student enrollments that link a user account to a course, recording the enrollment date and status (active, completed, cancelled).
- **FR-006**: System MUST prevent a student from having more than one active enrollment per course.
- **FR-007**: System MUST record when each enrollment was created and last updated.
- **FR-008**: System MUST support cascading deletions: when a course is deleted, its modules, lessons, and enrollments are also deleted.
- **FR-009**: System MUST allow querying all courses a student is enrolled in, and all students enrolled in a given course.
- **FR-010**: System MUST support an instructor relationship on courses, linking each course to a user account as its author/owner.

### Key Entities

- **Course**: Represents a complete learning unit. Has a title, description, slug (URL-friendly identifier), status (draft/published), and is owned by one instructor (user). Contains ordered modules.
- **Module**: A logical section within a course. Has a title, optional description, and a position/order index. Belongs to exactly one course. Contains ordered lessons.
- **Lesson**: The smallest unit of content. Has a title, content type (video, text, quiz), optional duration estimate, and a position/order index. Belongs to exactly one module.
- **Enrollment**: The relationship between a student (user) and a course. Records enrollment date, status (active, completed, cancelled), and last update timestamp. Unique per student-course pair.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All four entities (courses, modules, lessons, enrollments) can be created, read, updated, and deleted without data loss or integrity violations.
- **SC-002**: Duplicate enrollment prevention works correctly — a student cannot enroll twice in the same course.
- **SC-003**: Cascading deletions execute completely — deleting a course removes all associated modules, lessons, and enrollment records.
- **SC-004**: Course structure queries return modules and lessons in their correct defined order 100% of the time.
- **SC-005**: All migration scripts run to completion without errors on a clean database.
- **SC-006**: All migration scripts are reversible — rollback restores the previous schema state without data corruption.

## Assumptions

- Users (students and instructors) are already managed by the existing authentication system from Fase 1; this feature only references the `users` table via foreign keys.
- A user can be both an instructor (owning courses) and a student (enrolled in other courses).
- Lesson content (video files, text bodies) is stored externally; the `lessons` table holds metadata and references only.
- Slug uniqueness for courses is enforced at the database level.
- The initial migration creates tables from scratch; no existing course data needs to be migrated.
- A course must have at least one published module with at least one lesson before it can be published, but this rule is enforced at the application layer, not the database schema.
