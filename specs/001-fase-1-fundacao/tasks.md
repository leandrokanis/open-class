# Tasks: Fase 1 — Fundação

**Input**: Design documents from `specs/001-fase-1-fundacao/`

**Feature branch**: `001-fase-1-fundacao`

**User Stories in scope**:
- US-01: Registro de conta (P1)
- US-02: Login e sessão (P2)
- US-04: Recuperação de senha (P3)
- US-05: Login com Google OAuth (P4)

> **Note**: US-03 (Perfil do usuário — avatar upload) está fora do escopo da Fase 1 (requer armazenamento de arquivo). Coberto na Fase 3.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Inicializar monorepo, configurar dependências e ambiente de desenvolvimento.

- [ ] T001 Inicializar `apps/api` com NestJS CLI (`nest new api`) em `apps/api/`
- [ ] T002 [P] Inicializar `packages/db` com Drizzle ORM: criar `packages/db/package.json` e `packages/db/src/index.ts`
- [ ] T003 [P] Configurar Turborepo: criar `turbo.json` na raiz com pipelines `build`, `dev`, `test`, `lint`
- [ ] T004 [P] Configurar ESLint + Prettier em `apps/api/.eslintrc.js` e `apps/api/.prettierrc`
- [ ] T005 Configurar `apps/api/.env.example` com todas as variáveis documentadas em `specs/001-fase-1-fundacao/quickstart.md`
- [ ] T006 [P] Configurar Docker Compose: criar `docker-compose.yml` na raiz com serviço `db` (PostgreSQL 16) e variáveis de env
- [ ] T007 [P] Adicionar `apps/api/tsconfig.json` com `strict: true`, paths para `@open-class/db`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Infraestrutura de banco de dados, configuração base do NestJS e provider `DATABASE` — **bloqueia todas as user stories**.

**⚠️ CRITICAL**: Nenhuma user story pode começar até esta fase estar completa.

- [ ] T008 Criar schema Drizzle para `users` em `packages/db/src/schema/users.ts` (conforme `data-model.md`)
- [ ] T009 Criar schema Drizzle para `password_reset_tokens` em `packages/db/src/schema/password-reset-tokens.ts` (conforme `data-model.md`)
- [ ] T010 Exportar schemas e `db` instance em `packages/db/src/index.ts`
- [ ] T011 [P] Configurar `drizzle.config.ts` na raiz de `packages/db/` com `out: 'drizzle'`, dialect `postgresql`
- [ ] T012 Gerar e validar migration inicial: `pnpm --filter @open-class/db generate` → confirmar SQL gerado em `packages/db/drizzle/`
- [ ] T013 Criar provider `'DATABASE'` em `apps/api/src/db/index.ts` (Pool + drizzle instance) conforme `research.md`
- [ ] T014 Registrar provider `'DATABASE'` em `apps/api/src/app.module.ts` com `useValue: db`
- [ ] T015 [P] Criar `UsersModule` e `UsersService` stub em `apps/api/src/users/` (injetando `'DATABASE'`)
- [ ] T016 [P] Criar `UsersRepository` em `apps/api/src/users/users.repository.ts` com métodos: `findByEmail`, `findById`, `findByGoogleId`, `create`, `updatePasswordHash`, `linkGoogleId`
- [ ] T017 Adicionar `GET /health` em `apps/api/src/app.controller.ts` retornando `{ status: 'ok' }`
- [ ] T018 Configurar `@nestjs/throttler` com `MemoryStore` em `apps/api/src/app.module.ts` (global guard)
- [ ] T019 Configurar `ValidationPipe` global com `whitelist: true`, `forbidNonWhitelisted: true` em `apps/api/src/main.ts`
- [ ] T020 Configurar cookie parser e CORS em `apps/api/src/main.ts`

**Checkpoint**: `GET /health` retorna 200; migrations aplicadas no banco local; provider `'DATABASE'` injetável.

---

## Phase 3: US-01 — Registro de conta (P1) 🎯 MVP

**Goal**: Visitante pode criar conta com nome, e-mail e senha. Recebe JWT como httpOnly cookie.

**Independent Test**: `POST /auth/register` com dados válidos retorna 201 com cookie `access_token`; segundo register com mesmo e-mail retorna 409.

### Implementation — US-01

- [ ] T022 [P] [US1] Criar `RegisterDto` em `apps/api/src/auth/dto/register.dto.ts` com validações: `name` (2–255), `email` (IsEmail), `password` (MinLength 8)
- [ ] T023 [US1] Criar `AuthModule` como `DynamicModule` em `apps/api/src/auth/auth.module.ts` com método `register(config: AuthConfig)` (conforme `research.md`)
- [ ] T024 [US1] Criar `AuthService` em `apps/api/src/auth/auth.service.ts` com método `register(dto)`: validar e-mail único → hash bcrypt → inserir user → emitir JWT
- [ ] T025 [US1] Implementar emissão de JWT httpOnly cookie em `AuthService`: método `issueToken(userId, res)` usando `@nestjs/jwt` e `response.cookie()`
- [ ] T026 [US1] Criar `AuthController` em `apps/api/src/auth/auth.controller.ts` com `POST /auth/register` usando `@Res({ passthrough: true })`

**Checkpoint**: US-01 completa — registro funcional, cookie setado, 409 em duplicata.

---

## Phase 4: US-02 — Login e sessão (P2)

**Goal**: Usuário cadastrado autentica com e-mail+senha, recebe JWT cookie, GET /auth/me retorna dados, logout limpa cookie.

**Independent Test**: `POST /auth/login` retorna 200 + cookie; `GET /auth/me` com cookie retorna user; `POST /auth/logout` limpa cookie; `GET /auth/me` sem cookie retorna 401.

### Implementation — US-02

- [ ] T029 [P] [US2] Criar `LoginDto` em `apps/api/src/auth/dto/login.dto.ts`: `email` (IsEmail), `password` (IsString)
- [ ] T030 [US2] Criar `LocalStrategy` em `apps/api/src/auth/strategies/local.strategy.ts` usando `passport-local`; chamar `AuthService.validateUser(email, password)`
- [ ] T031 [US2] Adicionar `validateUser(email, password)` em `AuthService`: buscar user por e-mail → comparar bcrypt → checar `is_active` → retornar user ou lançar `UnauthorizedException`
- [ ] T032 [US2] Criar `LocalAuthGuard` em `apps/api/src/auth/guards/local-auth.guard.ts`
- [ ] T033 [US2] Criar `JwtStrategy` em `apps/api/src/auth/strategies/jwt.strategy.ts`: ler cookie `access_token`, validar payload `{ sub, email, role }`
- [ ] T034 [US2] Criar `JwtAuthGuard` em `apps/api/src/auth/guards/jwt-auth.guard.ts`
- [ ] T035 [US2] Adicionar `POST /auth/login` no `AuthController` com `@UseGuards(LocalAuthGuard)`: chamar `issueToken` e retornar user
- [ ] T036 [US2] Adicionar `GET /auth/me` no `AuthController` com `@UseGuards(JwtAuthGuard)`: retornar `req.user`
- [ ] T037 [US2] Adicionar `POST /auth/logout` no `AuthController`: limpar cookie `access_token` (Max-Age=0)

**Checkpoint**: US-02 completa — login/logout/me funcionais; JWT validado via cookie.

---

## Phase 5: US-04 — Recuperação de senha (P3)

**Goal**: Usuário que esqueceu a senha recebe link por e-mail com token de uso único (1h), consegue redefinir a senha.

**Independent Test**: `POST /auth/forgot-password` retorna 200 para qualquer e-mail (sem enumerar); banco tem registro em `password_reset_tokens`; `POST /auth/reset-password` com token válido atualiza senha e marca `used_at`; token expirado ou já usado retorna 400.

### Implementation — US-04

- [ ] T040 [P] [US4] Criar `ForgotPasswordDto` em `apps/api/src/auth/dto/forgot-password.dto.ts`: `email` (IsEmail)
- [ ] T041 [P] [US4] Criar `ResetPasswordDto` em `apps/api/src/auth/dto/reset-password.dto.ts`: `token` (IsString), `password` (MinLength 8)
- [ ] T042 [US4] Adicionar `PasswordResetRepository` em `apps/api/src/users/users.repository.ts` (ou arquivo separado `apps/api/src/auth/password-reset.repository.ts`): `createToken`, `findByTokenHash`, `markUsed`
- [ ] T043 [US4] Criar `MailService` em `apps/api/src/mail/mail.service.ts` usando `nodemailer`; configurar via env `SMTP_HOST/PORT/USER/PASS`; método `sendPasswordReset(email, resetUrl)`
- [ ] T044 [US4] Criar `MailModule` em `apps/api/src/mail/mail.module.ts` e importar em `AuthModule`
- [ ] T045 [US4] Adicionar `forgotPassword(email)` em `AuthService`: buscar user (silencioso se não existir) → gerar token bruto (`crypto.randomBytes(32).toString('hex')`) → hash SHA-256 → persistir com `expires_at = now + 1h` → enviar e-mail com link `${FRONTEND_URL}/reset-password?token=<raw>`
- [ ] T046 [US4] Adicionar `resetPassword(token, newPassword)` em `AuthService`: hash SHA-256 do token → buscar no banco → validar `used_at IS NULL` e `expires_at > now()` → bcrypt nova senha → `updatePasswordHash` → `markUsed`
- [ ] T047 [US4] Adicionar `POST /auth/forgot-password` e `POST /auth/reset-password` no `AuthController` com throttle customizado (5 req/15 min por IP)

**Checkpoint**: US-04 completa — reset funcional; token único e expirado tratados corretamente.

---

## Phase 6: US-05 — Login com Google OAuth (P4)

**Goal**: Visitante pode entrar/criar conta via Google OAuth 2.0. Rotas disponíveis apenas quando `GOOGLE_CLIENT_ID` e `GOOGLE_CLIENT_SECRET` estão configurados.

**Independent Test**: Com env vars configuradas: `GET /auth/google` redireciona para Google; callback cria/vincula conta e seta cookie. Sem env vars: rotas retornam 404.

### Implementation — US-05

- [ ] T050 [P] [US5] Criar `AuthConfig` interface em `apps/api/src/auth/auth.config.ts`: `jwtSecret`, `jwtExpiresIn`, `googleClientId?`, `googleClientSecret?`, `googleCallbackUrl?`
- [ ] T051 [US5] Criar `GoogleStrategy` em `apps/api/src/auth/strategies/google.strategy.ts` usando `passport-google-oauth20`; validate callback: chamar `AuthService.findOrCreateGoogleUser(profile)`
- [ ] T052 [US5] Criar `GoogleAuthGuard` em `apps/api/src/auth/guards/google-auth.guard.ts`
- [ ] T053 [US5] Adicionar `findOrCreateGoogleUser(profile)` em `AuthService`: buscar por `google_id` → buscar por `email` → se existe sem `google_id`: `linkGoogleId` → se não existe: `create` com `password_hash = NULL`
- [ ] T054 [US5] Atualizar `AuthModule.register(config)` para adicionar `GoogleStrategy` ao array de providers somente se `config.googleClientId && config.googleClientSecret` (conforme `research.md`)
- [ ] T055 [US5] Adicionar `GET /auth/google` e `GET /auth/google/callback` no `AuthController`; callback: chamar `issueToken` → redirecionar para `FRONTEND_URL`; em erro: redirecionar para `${FRONTEND_URL}/login?error=oauth_failed`

**Checkpoint**: US-05 completa — OAuth condicional; criação/vinculação de conta por Google funcional.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Qualidade, segurança e observabilidade transversais a todas as user stories.

- [ ] T057 [P] Adicionar `ALLOW_REGISTRATION` env guard em `AuthService.register()`: se `process.env.ALLOW_REGISTRATION === 'false'` lançar `ForbiddenException`
- [ ] T058 [P] Adicionar resposta de erro padronizada: criar `HttpExceptionFilter` global em `apps/api/src/filters/http-exception.filter.ts` com envelope `{ error, statusCode }`
- [ ] T059 [P] Adicionar `nestjs-pino` ou Logger nativo para logar todas as requisições de auth com nível, método, path e status (sem logar senhas ou tokens)
- [ ] T060 Rodar `tsc --noEmit` em `apps/api/` e `packages/db/` — zero erros
- [ ] T061 Rodar ESLint: `pnpm --filter @open-class/api lint` — zero warnings
- [ ] T062 Validar quickstart: seguir `specs/001-fase-1-fundacao/quickstart.md` do zero em ambiente limpo
- [ ] T064 Commit final e abertura de PR para `main`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: Sem dependências — começar imediatamente; tasks [P] em paralelo
- **Phase 2 (Foundational)**: Depende de Phase 1 — **BLOQUEIA todas as user stories**
- **Phases 3–6 (User Stories)**: Dependem de Phase 2; podem ser executadas sequencialmente (P1→P2→P3→P4) para entrega incremental
- **Phase 7 (Polish)**: Depende de todas as user stories desejadas estarem completas

### User Story Dependencies

- **US-01 (P1)**: Pode começar após Phase 2 — sem dependências de outras stories
- **US-02 (P2)**: Depende de US-01 (`issueToken` já existe); reutiliza `UsersRepository`
- **US-04 (P3)**: Independente de US-02; reutiliza `UsersRepository`
- **US-05 (P4)**: Depende de US-01 (criação de user); reutiliza `issueToken` de US-02

### Within Each User Story

- DTOs e Repository antes de Service
- Service antes de Controller
- Controller antes do teste E2E de integração

### Parallel Opportunities

- T001, T002, T003, T004, T006, T007 — todos em paralelo (Phase 1)
- T008, T009, T011 — em paralelo (Phase 2, schemas independentes)
- T015, T016 — em paralelo (Phase 2)
- T022 — (Phase 3)
- T029 — (Phase 4)
- T040, T041 — em paralelo (Phase 5)
- T050 — (Phase 6)
- T057, T058, T059 — em paralelo (Phase 7)

---

## Parallel Example: Phase 2 (Foundational)

```bash
# Executar em paralelo — schemas independentes:
Task T008: Criar schema users em packages/db/src/schema/users.ts
Task T009: Criar schema password_reset_tokens em packages/db/src/schema/password-reset-tokens.ts

# Depois de T008 e T009:
Task T010: Exportar schemas em packages/db/src/index.ts
Task T012: Gerar migration inicial

# Em paralelo com T013–T014:
Task T015: UsersModule stub em apps/api/src/users/
Task T016: UsersRepository em apps/api/src/users/users.repository.ts
```

---

## Implementation Strategy

### MVP First (US-01 + US-02 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (**CRITICAL — bloqueia tudo**)
3. Complete Phase 3: US-01 (registro)
4. Complete Phase 4: US-02 (login/logout/me)
5. **STOP e VALIDAR**: `POST /auth/register` → `POST /auth/login` → `GET /auth/me` → `POST /auth/logout`
6. Deploy/demo

### Incremental Delivery

1. Setup + Foundational → DB + NestJS pronto
2. US-01 → Registro funcional (MVP mínimo)
3. US-02 → Autenticação completa
4. US-04 → Recuperação de senha
5. US-05 → Google OAuth (opcional, condicional por env)
6. Polish → Qualidade e CI verde

---

## Summary

| Métrica | Valor |
|---------|-------|
| Total de tasks | 64 |
| Phase 1 (Setup) | 7 tasks |
| Phase 2 (Foundational) | 13 tasks |
| Phase 3 (US-01) | 7 tasks |
| Phase 4 (US-02) | 11 tasks |
| Phase 5 (US-04) | 10 tasks |
| Phase 6 (US-05) | 7 tasks |
| Phase 7 (Polish) | 8 tasks |
| Tasks paralelizáveis [P] | 27 |
| MVP mínimo (US-01 + US-02) | Phases 1–4 (38 tasks) |

---

## Notes

- `[P]` = arquivos diferentes, sem dependência de task anterior incompleta
- `[USn]` = user story à qual a task pertence (rastreabilidade)
- Cada phase é um incremento independentemente testável
- Commit após cada checkpoint de phase
- `ALLOW_REGISTRATION` e Google OAuth são features opt-in via env vars
