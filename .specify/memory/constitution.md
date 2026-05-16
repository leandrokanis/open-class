<!--
SYNC IMPACT REPORT
==================
Version change: [TEMPLATE] → 1.0.0
Modified principles: N/A (initial population from template)
Added sections: Core Principles (I. Test-First, II. Simplicity), Quality Gates, Development Workflow, Governance
Removed sections: N/A
Templates requiring updates:
  - .specify/templates/plan-template.md ✅ (Constitution Check section references these principles)
  - .specify/templates/spec-template.md ✅ (no constitution-specific references to update)
  - .specify/templates/tasks-template.md ✅ (TDD gate: test tasks before implementation enforced by template)
Follow-up TODOs:
  - None — all placeholders resolved
-->

# open-class Constitution

## Core Principles

### I. Test-First (NON-NEGOTIABLE)

Tests MUST be written before implementation code is written.
The Red-Green-Refactor cycle is strictly enforced:

- Write a failing test that defines the desired behavior.
- Implement the minimum code to make the test pass.
- Refactor without breaking the test.

No feature task may be marked complete if its corresponding tests were written
after the implementation. E2E tests covering critical user journeys MUST be
included for any flow that affects a learner's ability to access or complete a
class session.

### II. Simplicity (YAGNI)

Every design decision MUST be justified by a current, concrete requirement.
Abstractions, patterns, and infrastructure that serve only hypothetical future
needs MUST NOT be introduced. When two solutions exist, the simpler one MUST
be chosen unless a measurable constraint (performance, compliance, scale)
demands otherwise. Over-engineering is a defect.

## Quality Gates

All of the following gates MUST pass before any branch is merged to `main`:

- **Tests**: The full test suite (unit, integration, E2E) MUST pass with zero
  failures. Skipped tests require an explicit justification comment.
- **Lint & Type-Check**: Zero lint errors and zero TypeScript type errors are
  required. `turbo lint` and `turbo build` (which includes type-checking) must
  exit cleanly.
- **E2E Coverage**: Critical user journeys — enrolling in a class, attending a
  live session, and accessing course content — MUST have E2E test coverage.
  New flows that gate learner access MUST add E2E tests before the PR is merged.

## Development Workflow

- Features are driven by specs: `/speckit-specify` → `/speckit-plan` →
  `/speckit-tasks` → `/speckit-implement`.
- Tasks MUST be organized by user story so each story can be independently
  implemented, tested, and demonstrated.
- TDD gate is enforced per task: tests written and confirmed failing BEFORE
  implementation begins.
- The monorepo (`apps/ui`, `apps/api`, `packages/`) uses Turbo for builds.
  Cross-app shared code lives in `packages/` only when the sharing is real and
  immediate — not speculative.
- PRs stay focused: one feature, one bug, or one refactor per PR. Mixed-purpose
  PRs MUST be split.

## Governance

This constitution supersedes all other development practices for the open-class
project. Amendments require:

1. A documented rationale explaining why the current principle is insufficient.
2. An update to this file with version bumped per semantic versioning:
   - **MAJOR**: Principle removed or redefined in a backward-incompatible way.
   - **MINOR**: New principle or section added.
   - **PATCH**: Wording clarification or non-semantic refinement.
3. Propagation checks across all templates in `.specify/templates/`.

All PRs and code reviews MUST verify compliance with the principles above.
Complexity violations that cannot be avoided MUST be documented in the plan's
Complexity Tracking table with explicit justification.

**Version**: 1.0.0 | **Ratified**: 2026-05-15 | **Last Amended**: 2026-05-15
