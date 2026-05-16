# ADR-002 — Drizzle ORM com provider direto

**Data**: 2026-05-16
**Status**: Aceito
**Decisores**: Leandro Alves

---

## Contexto

O projeto precisa de uma camada de acesso ao banco type-safe em TypeScript. A restrição de memória (< 256 MB RAM idle) e a preferência por migrações explícitas em SQL — ao invés de auto-sync — eliminam opções que geram schema automaticamente.

## Decisão

Usar **Drizzle ORM** com schema compartilhado em `packages/db` e provider injetado via token `'DATABASE'` sem um `DrizzleModule` customizado.

```typescript
// packages/db/src/index.ts
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle(pool, { schema });

// apps/api/src/db/database.module.ts
{ provide: 'DATABASE', useValue: db }
```

## Alternativas consideradas

| Opção | Prós | Contras |
|-------|------|---------|
| **Drizzle ORM** *(escolhido)* | Type-safe, zero overhead runtime, migrations SQL explícitas, footprint mínimo | API ainda em maturação; comunidade menor que Prisma |
| Prisma | Ecossistema maduro, ótima DX, Prisma Studio | Client gerado em runtime (~30 MB), query engine binário adiciona latência de cold start |
| TypeORM | Integração nativa com NestJS (`@nestjs/typeorm`) | Decorators implícitos, `synchronize: true` perigoso em prod, migrações frágeis |
| MikroORM | Type-safe, Unit of Work pattern | Complexidade desnecessária para o escopo atual |

## Consequências

**Positivas**:
- Schema em TypeScript puro — sem DSL proprietário (`.prisma`); refatorável com ferramentas padrão.
- Migrações em SQL legível em `packages/db/drizzle/` — rastreáveis no git e reversíveis.
- Schema compartilhado em `packages/db` disponível para a UI futura sem duplicação.
- Footprint de memória negligível comparado ao Prisma Client.

**Negativas / trade-offs**:
- Sem `DrizzleModule` customizado: uma única instância de conexão global. Aceitável para single-instance homelab; refactor necessário se/quando read-replica ou multi-tenant for requerido.
- Sem Drizzle Studio integrado ao Docker Compose (pode ser adicionado se necessário).

## Caminho de evolução

Extrair `DrizzleModule` com `forRoot()`/`forFeature()` se múltiplas conexões ou configuração dinâmica forem necessárias.
