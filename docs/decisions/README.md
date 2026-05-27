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
| [ADR-011](011-shadcn-ui-sem-tailwind.md) | shadcn/ui com styled-components, sem Tailwind CSS | Aceito | 2026-05-17 |
| [ADR-012](012-ui-hybrid-rendering.md) | Renderização híbrida: Server Components + Client Components com credentials | Aceito | 2026-05-18 |
| [ADR-013](013-nextjs-middleware-auth-guard.md) | Proteção de rotas privadas via Next.js middleware | Aceito | 2026-05-18 |
| [ADR-014](014-dark-theme-by-route.md) | Tema escuro por rota via `data-theme` no layout | Aceito | 2026-05-19 |
| [ADR-015](015-dnd-kit-drag-and-drop.md) | dnd-kit como biblioteca de drag-and-drop | Aceito | 2026-05-21 |
| [ADR-016](016-mcp-server-standalone-package.md) | MCP Server como pacote standalone em `packages/` | Aceito | 2026-05-27 |
| [ADR-017](017-mcp-stdio-transport.md) | stdio como transporte primário do MCP Server | Aceito | 2026-05-27 |
| [ADR-018](018-mcp-server-api-auth.md) | Autenticação do MCP Server na API via login admin + JWT Bearer | Aceito | 2026-05-27 |

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
