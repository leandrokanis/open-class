---
name: "oc-tasks"
description: "Gera o tasks.md com tarefas concretas e ordenadas por dependência para a feature ativa do open-class. As tarefas já incluem caminhos de arquivo exatos da estrutura NestJS + Drizzle deste projeto. Use sempre que o usuário quiser gerar tarefas de implementação, quebrar um plano em steps executáveis ou saber o que implementar a seguir."
argument-hint: "Filtros ou orientações opcionais (ex: só backend, só migração)"
user-invocable: true
---

## Entrada do usuário

```text
$ARGUMENTS
```

---

## Etapa 1 — Carregar contexto

1. Leia `.current-plan.md` da raiz do projeto.
2. Obtenha `feature_directory`, `spec` e `plan`.
3. Leia `spec.md` e `plan.md` da feature.

Se `.current-plan.md` não existir ou `plan:` estiver vazio, pare e oriente o usuário a rodar `/oc-plan` primeiro.

---

## Padrões de arquivo deste projeto

Use estes caminhos exatos ao criar tarefas:

| Artefato | Caminho |
|----------|---------|
| Schema Drizzle | `packages/db/src/schema/<entity>.ts` |
| Re-export de schemas | `packages/db/src/schema/index.ts` |
| Migration (gerada) | `packages/db/drizzle/<timestamp>_<name>.sql` |
| Módulo NestJS | `apps/api/src/<module>/<module>.module.ts` |
| Service | `apps/api/src/<module>/<module>.service.ts` |
| Controller | `apps/api/src/<module>/<module>.controller.ts` |
| Repository | `apps/api/src/<module>/<module>.repository.ts` |
| DTO create | `apps/api/src/<module>/dto/create-<entity>.dto.ts` |
| DTO update | `apps/api/src/<module>/dto/update-<entity>.dto.ts` |
| DTO response | `apps/api/src/<module>/dto/<entity>-response.dto.ts` |
| Teste unitário | `apps/api/src/<module>/<module>.service.spec.ts` |
| Enum compartilhado | `apps/api/src/common/enums/<name>.enum.ts` |
| Registro no AppModule | `apps/api/src/app.module.ts` |

---

## Etapa 2 — Gerar tasks.md

Crie `<feature_directory>/tasks.md` com a estrutura abaixo.

### Formato obrigatório de cada tarefa

```
- [ ] T<NNN> [P] [US<N>] <Ação> em `<caminho/do/arquivo.ts>`
```

- **Checkbox** `- [ ]` sempre presente
- **ID** `T001`, `T002`, … em ordem de execução
- **[P]** apenas se a tarefa puder rodar em paralelo com outras sem dependência
- **[US\<N\>]** para tarefas de user story (mapeado do spec.md); omitir em setup/infra
- **Caminho de arquivo** sempre entre backticks, relativo à raiz do monorepo

### Estrutura de fases

```markdown
# Tasks: <Nome da Feature>

## Fase 1 — Schema e migração
> Objetivo: entidades no banco prontas para uso

- [ ] T001 Criar schema `<entity>` em `packages/db/src/schema/<entity>.ts`
- [ ] T002 Re-exportar `<entity>` de `packages/db/src/schema/index.ts`
- [ ] T003 Gerar migration: `cd packages/db && pnpm drizzle-kit generate`
- [ ] T004 Aplicar migration: `cd packages/db && pnpm drizzle-kit migrate`

## Fase 2 — Módulo base
> Objetivo: CRUD básico funcionando sem autenticação

- [ ] T005 [P] Criar `<module>.repository.ts` com queries Drizzle em `apps/api/src/<module>/<module>.repository.ts`
- [ ] T006 Criar `<module>.service.ts` em `apps/api/src/<module>/<module>.service.ts`
- [ ] T007 Criar `<module>.module.ts` em `apps/api/src/<module>/<module>.module.ts`
- [ ] T008 Registrar módulo em `apps/api/src/app.module.ts`

## Fase 3+ — User Stories (uma fase por story)

### Fase 3 — [US1] <Nome da User Story 1>
> Critério de aceite independente: <CA do spec>

- [ ] T009 [P] [US1] Criar DTO `Create<Entity>Dto` em `apps/api/src/<module>/dto/create-<entity>.dto.ts`
- [ ] T010 [P] [US1] Criar DTO `<Entity>ResponseDto` em `apps/api/src/<module>/dto/<entity>-response.dto.ts`
- [ ] T011 [US1] Implementar `create()` no service em `apps/api/src/<module>/<module>.service.ts`
- [ ] T012 [US1] Adicionar endpoint `POST /<resource>` no controller em `apps/api/src/<module>/<module>.controller.ts`

### Fase N — [USN] <Nome da User Story N>
...

## Fase final — Polimento

- [ ] TN [P] Adicionar decorators Swagger em todos os endpoints de `apps/api/src/<module>/<module>.controller.ts`
- [ ] TN+1 Escrever testes unitários do service em `apps/api/src/<module>/<module>.service.spec.ts`

## Dependências entre fases

- Fase 2 requer Fase 1 completa (migration aplicada)
- Fase 3+ requer Fase 2 completa (módulo registrado)
- User stories são independentes entre si (podem ser implementadas em qualquer ordem)

## Execução paralela

Dentro de cada fase, tarefas marcadas com [P] podem rodar simultaneamente:
- Todos os DTOs de uma user story
- Repository e testes unitários

## MVP sugerido

Fase 1 + Fase 2 + Fase 3 (US1 de maior prioridade)
```

---

## Etapa 3 — Validar tasks.md

Antes de finalizar, verifique:
- Todo T\<NNN\> tem caminho de arquivo explícito
- A ordem respeita dependências reais (ex: schema antes de service)
- Tasks de migration incluem os comandos exatos
- Nenhuma tarefa é vaga demais para um LLM executar sem contexto adicional

---

## Etapa 4 — Atualizar `.current-plan.md`

Atualize o campo `tasks:` em `.current-plan.md`:

```markdown
# Plano ativo

feature_directory: specs/<NNN>-<short-name>
spec: specs/<NNN>-<short-name>/spec.md
plan: specs/<NNN>-<short-name>/plan.md
tasks: specs/<NNN>-<short-name>/tasks.md
```

---

## Etapa 5 — Reportar

Informe:
- Caminho do tasks: `<feature_directory>/tasks.md`
- Total de tarefas e distribuição por fase
- MVP sugerido
- Próximo passo: `/speckit-implement`
