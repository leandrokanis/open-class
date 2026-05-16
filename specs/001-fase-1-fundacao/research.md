# Research — Fase 1: Fundação

## 1. Biblioteca de auth (camada API — NestJS)

**Decision**: `@nestjs/jwt` + `@nestjs/passport` + `passport-local` + `passport-jwt`

**Rationale**: Stack canônico do NestJS; integração nativa com guards (`@UseGuards()`), DI containers e decorators. A camada API é proprietária de toda a lógica de auth — Lucia e NextAuth v5 introduziriam acoplamento desnecessário com o frontend.

**Alternatives rejected**:
- Lucia Auth — session management próprio; adiciona sobrecarga para um stack que já tem DI e middleware NestJS
- NextAuth v5 — projetado para monólitos Next.js; quebra o padrão API-first onde o backend é o único dono da sessão

---

## 2. Cookies httpOnly em NestJS

**Decision**: `response.cookie()` direto via `@Res()` no controller

**Rationale**: Zero dependências extras; método nativo do Express adapter do NestJS. Flags `httpOnly`, `secure`, `sameSite` configuradas inline.

**Alternatives rejected**:
- `@nestjs/cookie` — abstração desnecessária sobre o método nativo (YAGNI)
- `cookie-parser` middleware — já incluído implicitamente no Express; não precisa de wrapper extra apenas para escrever cookies

---

## 3. Rate limiting nas rotas de auth

**Decision**: `@nestjs/throttler` com `MemoryStore` (padrão, sem Redis)

**Rationale**: Footprint negligível; adequado para instância única em homelab. Redis adicionaria ~50 MB de RAM idle — inaceitável com o target de < 256 MB.

**Upgrade path**: migrar para `ThrottlerStorageRedisService` se/quando o deploy escalar para múltiplas instâncias.

**Alternatives rejected**:
- Redis-backed throttler — over-engineering para homelab single-instance

---

## 4. Google OAuth no NestJS — guard condicional

**Decision**: DynamicModule com registro condicional da `GoogleStrategy`

**Rationale**: `AuthModule.register(config)` recebe `googleClientId` e `googleClientSecret`; adiciona `GoogleStrategy` ao array de providers somente quando ambas as variáveis estão presentes. Elimina erros de bootstrap quando as envs não estão configuradas.

**Pattern**:
```typescript
// auth.module.ts
static register(config: AuthConfig): DynamicModule {
  const providers = [AuthService, LocalStrategy, JwtStrategy];
  if (config.googleClientId && config.googleClientSecret) {
    providers.push(GoogleStrategy);
  }
  return { module: AuthModule, providers, exports: [AuthService] };
}
```

**Alternatives rejected**:
- try/catch em torno do registro da strategy — menos idiomático
- Feature flag no guard — overhead em runtime em cada request

---

## 5. Drizzle ORM no NestJS

**Decision**: Import direto como provider via token `'DATABASE'`; sem `DrizzleModule` customizado

**Rationale**: Uma única conexão PostgreSQL; nenhum requisito atual de múltiplas instâncias. Provider simples em `app.module.ts` serve todos os services via injeção do token.

```typescript
// src/db/index.ts
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle(pool, { schema });

// app.module.ts
{ provide: 'DATABASE', useValue: db }
```

**Upgrade path**: extrair `DrizzleModule` se/quando read-replica ou multi-tenant for necessário.

**Alternatives rejected**:
- `DrizzleModule` customizado — prematura abstração (YAGNI); refactor trivial quando necessário
