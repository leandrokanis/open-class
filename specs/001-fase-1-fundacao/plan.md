# Implementation Plan: Fase 1 — Fundação

**Branch**: `001-fase-1-fundacao` | **Date**: 2026-05-16 | **Spec**: `.specify/prd.md` (§ Fase 1)

## Summary

Implementar autenticação completa na API NestJS: registro/login com e-mail+senha, JWT stateless via httpOnly cookie, recuperação de senha por e-mail, e login com Google OAuth (condicional). Banco PostgreSQL com Drizzle ORM. Sem UI nesta fase — entregável é a API funcionando com testes E2E cobrindo todos os fluxos de auth.

## Technical Context

**Language/Version**: TypeScript 5.x, Node.js 20 LTS

**Primary Dependencies**:
- NestJS 10 (`@nestjs/core`, `@nestjs/common`, `@nestjs/jwt`, `@nestjs/passport`, `@nestjs/throttler`)
- Passport (`passport`, `passport-local`, `passport-jwt`, `passport-google-oauth20`)
- Drizzle ORM (`drizzle-orm`, `drizzle-kit`) + `pg` driver
- `class-validator`, `class-transformer` (DTO validation)
- `bcrypt` (password hashing)
- `nodemailer` (reset password e-mail)

**Storage**: PostgreSQL 16 (Docker local, Railway/Supabase em produção)

**Testing**: Jest (unit) + Supertest (E2E via `@nestjs/testing`)

**Target Platform**: Linux server (homelab, < 256 MB RAM idle)

**Project Type**: REST API (web-service)

**Performance Goals**: < 200ms p95 nas rotas de auth

**Constraints**: < 256 MB RAM idle; sem Redis na Fase 1; instância única

**Scale/Scope**: < 1000 usuários iniciais; single-region

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status | Notes |
|------|--------|-------|
| Test-First (TDD) | PASS | E2E tests escritos antes/junto com implementação |
| Simplicity (YAGNI) | PASS | MemoryStore throttler, sem Redis, sem DrizzleModule customizado |
| Zero lint/type errors | PASS | ESLint + tsc --noEmit no CI |
| No extra projects | PASS | Apenas `apps/api` nesta fase |
| No premature abstraction | PASS | Provider direto `'DATABASE'`, sem repositório extra na Fase 1 |

Post-design re-check: sem violações. `UsersRepository` adicionado ao quickstart como separação de queries — justificado por testabilidade (mock do DB em unit tests).

## Project Structure

### Documentation (this feature)

```text
specs/001-fase-1-fundacao/
├── plan.md              # Este arquivo
├── research.md          # Decisões de biblioteca e padrões
├── data-model.md        # Schema users + password_reset_tokens
├── quickstart.md        # Setup e estrutura de diretórios
├── contracts/
│   └── auth.md          # Contratos HTTP para todas as rotas /auth/*
└── tasks.md             # Gerado por /speckit-tasks
```

### Source Code

```text
apps/api/
├── src/
│   ├── auth/
│   │   ├── auth.controller.ts
│   │   ├── auth.module.ts          # DynamicModule (GoogleStrategy condicional)
│   │   ├── auth.service.ts
│   │   ├── strategies/
│   │   │   ├── local.strategy.ts
│   │   │   ├── jwt.strategy.ts
│   │   │   └── google.strategy.ts
│   │   ├── guards/
│   │   │   ├── local-auth.guard.ts
│   │   │   ├── jwt-auth.guard.ts
│   │   │   └── google-auth.guard.ts
│   │   └── dto/
│   │       ├── register.dto.ts
│   │       ├── login.dto.ts
│   │       ├── forgot-password.dto.ts
│   │       └── reset-password.dto.ts
│   ├── users/
│   │   ├── users.module.ts
│   │   ├── users.service.ts
│   │   └── users.repository.ts
│   ├── db/
│   │   └── index.ts                # Pool + drizzle; exportado como provider 'DATABASE'
│   ├── app.module.ts
│   └── main.ts
├── test/
│   └── auth.e2e-spec.ts
└── .env.example

packages/db/
└── src/
    └── schema/
        ├── users.ts
        └── password-reset-tokens.ts
```

**Structure Decision**: Monorepo Turborepo com `apps/api` (NestJS) e `packages/db` (schema Drizzle compartilhado). A UI (`apps/ui`) existe no repo mas não é tocada nesta fase.
