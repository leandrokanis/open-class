# ADR-005 — pnpm workspaces + Turborepo como monorepo

**Data**: 2026-05-16
**Status**: Aceito
**Decisores**: Leandro Alves

---

## Contexto

O projeto tem múltiplos apps (`apps/api`, `apps/ui`) e pacotes compartilhados (`packages/db`). O schema Drizzle e os tipos gerados precisam ser consumidos tanto pela API quanto pela UI futura sem duplicação e sem publicar pacotes no npm.

## Decisão

Usar **pnpm workspaces** para gerenciamento de dependências e **Turborepo** para orquestração de build e cache de tarefas.

## Alternativas consideradas

| Opção | Prós | Contras |
|-------|------|---------|
| **pnpm + Turborepo** *(escolhido)* | Cache de build inteligente, linking automático entre workspaces, install rápido com hard links | Turborepo adiciona uma camada de configuração (`turbo.json`) |
| npm workspaces | Nativo no npm, sem dependência extra | Sem cache de tarefas; install mais lento que pnpm |
| Yarn workspaces + Nx | Nx tem cache robusto e plugins para NestJS | Nx é mais pesado; configuração mais complexa; overhead desnecessário para 2–3 apps |
| Repositórios separados | Independência total entre apps | Sem compartilhamento de tipos; sincronização manual de versões; overhead de CI |

## Consequências

**Positivas**:
- `packages/db` é referenciado como `"@open-class/db": "workspace:*"` — sem publicação no npm, sem duplicação de schema.
- Turborepo garante que `packages/db` é buildado antes de `apps/api` automaticamente via grafo de dependências.
- Cache de build local: tarefas não reexecutadas se os inputs não mudaram.
- `pnpm` usa hard links — `node_modules` ocupa menos espaço que npm/yarn.

**Negativas / trade-offs**:
- `pnpm` deve ser a única ferramenta de install — usar `npm install` em qualquer workspace quebra o lockfile.
- Turborepo requer que cada pacote declare `scripts` consistentes (`build`, `test`, `lint`) para o pipeline funcionar.

## Estrutura de workspaces

```yaml
# pnpm-workspace.yaml
packages:
  - 'apps/*'
  - 'packages/*'
```
