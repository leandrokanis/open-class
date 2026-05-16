# Data Model — Fase 1: Fundação

## Entidades

### `users`

| Campo          | Tipo                              | Restrições                          | Descrição                                |
|----------------|-----------------------------------|-------------------------------------|------------------------------------------|
| `id`           | `uuid`                            | PK, default `gen_random_uuid()`     |                                          |
| `name`         | `varchar(255)`                    | NOT NULL                            | Nome de exibição                         |
| `email`        | `varchar(255)`                    | NOT NULL, UNIQUE                    |                                          |
| `password_hash`| `varchar(255)`                    | NULL                                | NULL quando conta criada via OAuth       |
| `role`         | `enum('aluno','instrutor','admin')`| NOT NULL, default `'aluno'`         |                                          |
| `avatar_url`   | `text`                            | NULL                                | URL externa (Google) ou path local       |
| `bio`          | `varchar(300)`                    | NULL                                |                                          |
| `google_id`    | `varchar(255)`                    | NULL, UNIQUE                        | Presente somente para contas OAuth       |
| `is_active`    | `boolean`                         | NOT NULL, default `true`            | `false` = conta desativada pelo admin    |
| `created_at`   | `timestamptz`                     | NOT NULL, default `now()`           |                                          |
| `updated_at`   | `timestamptz`                     | NOT NULL, default `now()`           |                                          |

**Índices**: `email` (UNIQUE), `google_id` (UNIQUE PARTIAL WHERE `google_id IS NOT NULL`)

**Regras de validação**:
- `email` deve ser único no sistema (verificado na camada de serviço antes do insert)
- `password_hash` é NOT NULL se `google_id` IS NULL (invariante verificada em runtime)
- `bio` máx. 300 chars (validado com `class-validator` no DTO)
- `name` mínimo 2 chars, máx. 255 chars

---

### `password_reset_tokens`

| Campo        | Tipo           | Restrições                      | Descrição                        |
|--------------|----------------|---------------------------------|----------------------------------|
| `id`         | `uuid`         | PK, default `gen_random_uuid()` |                                  |
| `user_id`    | `uuid`         | NOT NULL, FK → `users.id`       |                                  |
| `token_hash` | `varchar(255)` | NOT NULL, UNIQUE                | SHA-256 do token enviado por e-mail |
| `expires_at` | `timestamptz`  | NOT NULL                        | `now() + interval '1 hour'`      |
| `used_at`    | `timestamptz`  | NULL                            | Preenchido ao usar o token       |
| `created_at` | `timestamptz`  | NOT NULL, default `now()`       |                                  |

**Regras de validação**:
- Token de uso único: `used_at IS NULL` verificado antes de aceitar o reset
- Expirado: `expires_at > now()` verificado antes de aceitar o reset
- O token bruto (não o hash) é enviado por e-mail e nunca armazenado

---

## Drizzle Schema (TypeScript)

```typescript
// packages/db/src/schema/users.ts
import { pgTable, uuid, varchar, boolean, timestamp, pgEnum } from 'drizzle-orm/pg-core';

export const roleEnum = pgEnum('role', ['aluno', 'instrutor', 'admin']);

export const users = pgTable('users', {
  id:           uuid('id').primaryKey().defaultRandom(),
  name:         varchar('name', { length: 255 }).notNull(),
  email:        varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }),
  role:         roleEnum('role').notNull().default('aluno'),
  avatarUrl:    text('avatar_url'),
  bio:          varchar('bio', { length: 300 }),
  googleId:     varchar('google_id', { length: 255 }).unique(),
  isActive:     boolean('is_active').notNull().default(true),
  createdAt:    timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt:    timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// packages/db/src/schema/password-reset-tokens.ts
export const passwordResetTokens = pgTable('password_reset_tokens', {
  id:        uuid('id').primaryKey().defaultRandom(),
  userId:    uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  tokenHash: varchar('token_hash', { length: 255 }).notNull().unique(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  usedAt:    timestamp('used_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
```

---

## Decisões de Design

- **Sem tabela `sessions`**: JWT stateless com httpOnly cookie. Logout invalida cookie no cliente; sem estado no servidor em v1.
- **`password_hash` nullable**: permite contas criadas exclusivamente via Google OAuth sem senha local.
- **`token_hash` em vez de `token`**: o token bruto nunca é persistido — somente seu SHA-256. Mitiga vazamento via dump de banco.
- **Soft delete via `is_active`**: usuários desativados pelo admin mantêm integridade referencial; sem `deleted_at` na Fase 1 (YAGNI).
