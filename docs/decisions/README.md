# Registros de Decisão Arquitetural (ADR)

Decisões técnicas significativas do projeto Open Class, documentadas no formato [MADR](https://adr.github.io/madr/).

## Índice

| ADR | Título | Status | Data |
|-----|--------|--------|------|
| [ADR-001](001-nestjs-api-framework.md) | NestJS como framework da API | Aceito | 2026-05-16 |
| [ADR-002](002-drizzle-orm.md) | Drizzle ORM com provider direto | Aceito | 2026-05-16 |
| [ADR-003](003-jwt-httponly-cookie.md) | JWT stateless via cookie httpOnly | Aceito | 2026-05-16 |
| [ADR-004](004-postgresql.md) | PostgreSQL 16 como banco de dados | Aceito | 2026-05-16 |
| [ADR-005](005-pnpm-turborepo-monorepo.md) | pnpm workspaces + Turborepo | Aceito | 2026-05-16 |
| [ADR-006](006-youtube-embed.md) | YouTube embed para conteúdo em vídeo | Aceito | 2026-05-16 |
| [ADR-007](007-docker-compose-deploy.md) | Docker Compose para deploy self-hosted | Aceito | 2026-05-16 |
| [ADR-008](008-rate-limiting-in-memory.md) | Rate limiting in-memory sem Redis | Aceito | 2026-05-16 |
| [ADR-009](009-google-oauth-condicional.md) | Google OAuth como módulo condicional | Aceito | 2026-05-16 |
| [ADR-010](010-roles-permissions-guard.md) | Autorização por papel via RolesGuard + @Roles() | Aceito | 2026-05-16 |
| [ADR-011](011-react-vite-typescript-ui.md) | React + Vite + TypeScript como stack da UI | Aceito | 2026-05-17 |
| [ADR-012](012-tanstack-query-data-fetching.md) | TanStack Query para data fetching no frontend | Aceito | 2026-05-17 |
| [ADR-013](013-tailwind-css-styling.md) | Tailwind CSS para estilização da UI | Aceito | 2026-05-17 |

## Como usar

Ao tomar uma nova decisão arquitetural significativa, crie um novo arquivo seguindo o template:

```
docs/decisions/NNN-titulo-kebab-case.md
```

Adicione a entrada no índice acima e atualize o status de ADRs anteriores que forem substituídos.

## Status possíveis

- **Proposto** — em discussão, ainda não implementado
- **Aceito** — decidido e em vigor
- **Depreciado** — ainda em uso, mas não recomendado para novos trabalhos
- **Substituído** — supersedido por outro ADR (incluir link)
