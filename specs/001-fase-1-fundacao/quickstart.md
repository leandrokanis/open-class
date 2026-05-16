# Quickstart — Fase 1: Fundação

## Pré-requisitos

- Node.js 20+
- pnpm 9+
- Docker (para PostgreSQL local)

## Setup inicial

```bash
# 1. Instalar dependências
pnpm install

# 2. Subir banco de dados local
docker compose up -d db

# 3. Copiar variáveis de ambiente
cp apps/api/.env.example apps/api/.env
# Editar apps/api/.env com DATABASE_URL, JWT_SECRET etc.

# 4. Executar migrations
pnpm --filter @open-class/api db:migrate

# 5. Iniciar API em desenvolvimento
pnpm --filter @open-class/api dev
```

A API estará disponível em `http://localhost:3001`.

## Variáveis de ambiente (`apps/api/.env`)

| Variável | Obrigatória | Descrição |
|----------|-------------|-----------|
| `DATABASE_URL` | Sim | `postgresql://user:pass@localhost:5432/openclass` |
| `JWT_SECRET` | Sim | String aleatória ≥ 32 chars |
| `JWT_EXPIRES_IN` | Não | Default: `7d` |
| `GOOGLE_CLIENT_ID` | Não | Habilita login com Google |
| `GOOGLE_CLIENT_SECRET` | Não | Habilita login com Google |
| `GOOGLE_CALLBACK_URL` | Não | Default: `http://localhost:3001/auth/google/callback` |
| `SMTP_HOST` | Sim (prod) | Servidor SMTP para e-mails de reset |
| `SMTP_PORT` | Não | Default: `587` |
| `SMTP_USER` | Sim (prod) | |
| `SMTP_PASS` | Sim (prod) | |
| `FRONTEND_URL` | Não | Default: `http://localhost:3000` (usado no link de reset) |

> Google OAuth: se `GOOGLE_CLIENT_ID` ou `GOOGLE_CLIENT_SECRET` não estiverem definidos, as rotas `/auth/google` e `/auth/google/callback` retornam 404.

## Rodar testes

```bash
# Unit tests
pnpm --filter @open-class/api test

# E2E (requer banco rodando)
pnpm --filter @open-class/api test:e2e
```

## Estrutura da API (`apps/api/src/`)

```
auth/
├── auth.controller.ts      # Rotas /auth/*
├── auth.module.ts          # DynamicModule com registro condicional GoogleStrategy
├── auth.service.ts         # Lógica de negócio (register, login, reset)
├── strategies/
│   ├── local.strategy.ts   # passport-local (email + senha)
│   ├── jwt.strategy.ts     # passport-jwt (cookie)
│   └── google.strategy.ts  # passport-google-oauth20 (condicional)
├── guards/
│   ├── local-auth.guard.ts
│   ├── jwt-auth.guard.ts
│   └── google-auth.guard.ts
└── dto/
    ├── register.dto.ts
    ├── login.dto.ts
    ├── forgot-password.dto.ts
    └── reset-password.dto.ts

users/
├── users.module.ts
├── users.service.ts        # CRUD de usuários (sem controller público na Fase 1)
└── users.repository.ts     # Queries Drizzle

db/
└── index.ts                # Pool + drizzle instance exportada como provider 'DATABASE'
```

## Endpoint de health check

```
GET /health → 200 { "status": "ok" }
```
