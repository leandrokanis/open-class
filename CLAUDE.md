<!-- SPECKIT START -->

For the active feature context (tech stack, structure, current plan paths),
read `.current-plan.md` in the project root. This file is local-only (gitignored)
and is updated by `/oc-specify`, `/oc-plan`, and `/oc-tasks` as work progresses.

<!-- SPECKIT END -->

# Project: open-class

Monorepo structure:

- `apps/ui/` - Frontend application
- `apps/api/` - Backend API
- `packages/` - Shared packages

## Workflow

Use as skills `oc-*` para desenvolvimento orientado a spec neste projeto:

| Skill | O que faz |
|-------|-----------|
| `/oc-idea` | Faz triagem da ideia (épico/feature/US/tarefa/bug), interroga estilo grill-me até entendimento completo, registra no `docs/prd.md` quando aplicável e abre a issue no GitHub; precede o specify |
| `/oc-specify` | Cria `specs/<issue>-<name>/spec.md`; atualiza C4 se novos atores/sistemas |
| `/oc-plan` | Cria `plan.md` com data model, contratos e cenários BDD; cria ADRs se houver decisão arquitetural |
| `/oc-tasks` | Gera `tasks.md` com tarefas ordenadas e caminhos de arquivo exatos |
| `/oc-implement` | Executa tasks com TDD (red → green → refactor); atualiza Swagger ao fim |
| `/oc-pr` | Abre PR com título conventional commits e `Closes #<issue>` |
| `/autopilot` | Roda o fluxo completo de ponta a ponta de forma totalmente autônoma, aceitando automaticamente a recomendação em todos os interrogatórios (sem interação) |

### Fluxo individual

```
/oc-idea <ideia>          →  triagem + interrogatório + entrada no prd.md + issue no GitHub
/oc-specify <descrição>   →  spec.md
/oc-plan                  →  plan.md + ADRs + C4
/oc-tasks                 →  tasks.md
/oc-implement             →  código + testes + Swagger
/oc-pr                    →  PR no GitHub
```

### Fluxo completo

```
/autopilot <ideia>        →  fluxo completo sem interação, aceitando todas as recomendações
```

### Contexto ativo

O arquivo `.current-plan.md` (local, não versionado) guarda os caminhos do spec, plan e tasks da feature em andamento. É lido automaticamente por todas as skills `oc-*`.

### Documentação arquitetural

- `docs/decisions/` — ADRs em formato MADR (atualizados pelo `/oc-plan`)
- `docs/architecture/c4.md` — Diagrama C4 (atualizado pelo `/oc-specify` e `/oc-plan`)
- `docs/prd.md` — PRD do produto

### Commits

Siga as diretrizes em `docs/contributing/commit-messages.md`.
Formato: `<tipo>(<escopo>): <descrição imperativa em inglês>` — máximo 72 chars, sem ponto final.
