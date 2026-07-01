# Contributing to Open Class

Thanks for your interest in improving Open Class! This project is a self-hosted,
open source LMS and every contribution — code, docs, bug reports, ideas — is
welcome.

By participating, you agree to abide by our [Code of Conduct](./CODE_OF_CONDUCT.md).

## Before you start

- For **non-trivial changes**, open an issue first so we can align on the approach
  before you invest time.
- Use the issue templates (bug report / feature request) — they help us triage
  faster.
- To report a **security vulnerability**, do **not** open a public issue; follow
  [`SECURITY.md`](./SECURITY.md).

## Development setup

Open Class is a pnpm + Turborepo monorepo.

```bash
# Requirements: Node 20+, pnpm 9, Docker (for PostgreSQL / MailHog)
pnpm install

# Start the stack in development
pnpm dev
```

- `apps/api/` — NestJS 11 API (Drizzle ORM + PostgreSQL)
- `apps/ui/` — Next.js frontend
- `packages/db/` — shared Drizzle schema and migrations

See [`docs/`](./docs) for deploy, configuration and upgrade guides, and
[`docs/decisions/`](./docs/decisions) for the architectural decision records (ADRs).

## Branch and commit conventions

```bash
# Branch off main
git checkout -b feat/your-feature

# Conventional commits, imperative, in English, scope required
git commit -m "feat(lessons): add transcript support"
```

Commit messages follow [`docs/contributing/commit-messages.md`](./docs/contributing/commit-messages.md):
`<type>(<scope>): <imperative description>` — max 72 chars, no trailing period.

## Tests and linting

Run these before opening a pull request:

```bash
pnpm lint        # ESLint across the monorepo
pnpm test        # unit tests
pnpm test:e2e    # end-to-end tests
```

Keep the suite green. New behavior should come with tests.

## Opening a pull request

1. Make sure lint and tests pass locally.
2. Fill in the pull request template.
3. Reference the issue your PR closes with `Closes #<issue>`.
4. Keep PRs focused — one logical change per PR is easier to review.

A maintainer will review your PR. Thanks for helping keep education free! 🎓
