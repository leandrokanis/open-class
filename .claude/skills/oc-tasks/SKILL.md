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

## Etapa 0 — Sincronizar com main

```bash
git fetch origin
git log HEAD..origin/main --oneline
```

Se o comando listar commits (main avançou), **pare e avise**:

> ⚠️ A branch `main` tem N commit(s) que você ainda não tem. Rode `git rebase origin/main` antes de continuar para evitar conflitos no PR.

---

## Etapa 1 — Carregar contexto

1. Leia `.current-plan.md` da raiz do projeto.
2. Obtenha `feature_directory`, `spec` e `plan`.
3. Leia `spec.md` (comportamentos, critérios de aceite) e `plan.md` (data model, contratos, cenários BDD).

Se `.current-plan.md` não existir ou `plan:` estiver vazio, pare e oriente o usuário a rodar `/oc-plan` primeiro.

---

## Filosofia de quebra de tarefas

**Testes não são fase final.** Testes de comportamento pertencem ao lado de cada método de service que os implementa — não num bloco separado no fim. Deferí-los para o fim é o anti-padrão de slice horizontal: produz testes escritos sobre comportamento imaginado, não observado.

**Fatiar verticalmente.** Cada fase entrega um comportamento completo e verificável — schema + lógica + teste + endpoint — em vez de uma camada técnica inteira sem conexão com o produto.

**Tracer bullet primeiro.** A primeira user story a ser implementada deve ser a mais fina que prova o caminho de ponta a ponta (banco → service → endpoint). As demais se apoiam nessa estrutura já validada.

---

## Etapa 2 — Alinhar com o usuário (OBRIGATÓRIO antes de gerar tasks)

Antes de gerar o `tasks.md`, confirme com o usuário:

1. **Tracer bullet**: qual user story (ou comportamento) deve ser implementada primeiro — a mais simples que prova o caminho completo? Apresente sua sugestão e peça confirmação.

2. **Granularidade**: as tarefas devem ser no nível de método (ex: `implementar service.create()`) ou de comportamento testável (ex: `🔴 teste: create() retorna erro se curso não existe` → `🟢 implementar service.create()`)?

3. **Ordenação das user stories**: qual a prioridade após o tracer bullet? Alguma story depende de outra estar pronta?

4. **Escopo de testes**: quais comportamentos do `plan.md` são críticos o suficiente para exigir ciclo TDD completo? Algum pode ser coberto só por teste de integração ou manual?

5. **MVP**: se o tempo for curto, quais fases/stories compõem o mínimo entregável?

Só avance quando o usuário confirmar.

---

## Padrões de arquivo deste projeto

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

## Etapa 3 — Gerar tasks.md

Crie `<feature_directory>/tasks.md` com a estrutura abaixo.

### Formato de cada tarefa

```
- [ ] T<NNN> [P] [US<N>] <Ação> em `<caminho/do/arquivo.ts>`
```

- **Checkbox** `- [ ]` sempre presente
- **ID** `T001`, `T002`, … em ordem de execução
- **[P]** apenas se pode rodar em paralelo sem dependência
- **[US\<N\>]** para tarefas de user story; omitir em setup/infra

### Estrutura de fases

```markdown
# Tasks: <Nome da Feature>

## Fase 1 — Schema e migração
> Objetivo: entidades no banco prontas para uso

- [ ] T001 Criar schema `<entity>` em `packages/db/src/schema/<entity>.ts`
- [ ] T002 Re-exportar `<entity>` de `packages/db/src/schema/index.ts`
- [ ] T003 Gerar migration: `cd packages/db && pnpm drizzle-kit generate`
- [ ] T004 Aplicar migration: `cd packages/db && pnpm drizzle-kit migrate`

## Fase 2 — Módulo base (infraestrutura)
> Objetivo: esqueleto do módulo registrado, sem lógica de negócio ainda

- [ ] T005 Criar `<module>.repository.ts` (queries Drizzle) em `apps/api/src/<module>/<module>.repository.ts`
- [ ] T006 Criar `<module>.service.ts` (esqueleto vazio) em `apps/api/src/<module>/<module>.service.ts`
- [ ] T007 Criar `<module>.module.ts` em `apps/api/src/<module>/<module>.module.ts`
- [ ] T008 Registrar módulo em `apps/api/src/app.module.ts`

## Fase 3 — Tracer bullet: [US<N>] <Nome da user story mais simples>
> Objetivo: provar o caminho completo banco → service → endpoint com um comportamento real
> Critério de aceite: <CA correspondente do spec>

- [ ] T009 [P] [US<N>] Criar DTO `Create<Entity>Dto` em `apps/api/src/<module>/dto/create-<entity>.dto.ts`
- [ ] T010 [P] [US<N>] Criar DTO `<Entity>ResponseDto` em `apps/api/src/<module>/dto/<entity>-response.dto.ts`
- [ ] T011 [US<N>] 🔴 Escrever teste: `<comportamento do caminho feliz>` em `apps/api/src/<module>/<module>.service.spec.ts`
- [ ] T012 [US<N>] 🟢 Implementar `<method>()` no service — código mínimo para passar o teste em `apps/api/src/<module>/<module>.service.ts`
- [ ] T013 [US<N>] 🔵 Refatorar `<method>()` se necessário (sem quebrar testes)
- [ ] T014 [US<N>] 🔴 Escrever teste: `<comportamento de erro / edge case>` em `apps/api/src/<module>/<module>.service.spec.ts`
- [ ] T015 [US<N>] 🟢 Estender `<method>()` para cobrir o caso de erro
- [ ] T016 [US<N>] Adicionar endpoint `<MÉTODO> /<resource>` no controller em `apps/api/src/<module>/<module>.controller.ts`
- [ ] T017 [US<N>] Adicionar decorators Swagger no endpoint em `apps/api/src/<module>/<module>.controller.ts`

## Fase 4 — [US<N+1>] <Nome da próxima user story>
> Critério de aceite: <CA correspondente do spec>

- [ ] T018 [P] [US<N+1>] Criar DTO necessário em `apps/api/src/<module>/dto/...`
- [ ] T019 [US<N+1>] 🔴 Escrever teste: `<comportamento>` em `apps/api/src/<module>/<module>.service.spec.ts`
- [ ] T020 [US<N+1>] 🟢 Implementar `<method>()` no service em `apps/api/src/<module>/<module>.service.ts`
- [ ] T021 [US<N+1>] 🔵 Refatorar se necessário
- [ ] T022 [US<N+1>] Adicionar endpoint no controller em `apps/api/src/<module>/<module>.controller.ts`
- [ ] T023 [US<N+1>] Adicionar decorators Swagger no endpoint em `apps/api/src/<module>/<module>.controller.ts`

## Fase N — [USN] <User story seguinte>
...

## Dependências entre fases

- Fase 2 requer Fase 1 completa (migration aplicada)
- Fase 3+ requer Fase 2 completa (módulo registrado)
- Cada fase de user story é independente entre si após Fase 2

## MVP

Fase 1 + Fase 2 + Fase 3 (<comportamento mínimo acordado com o usuário>)
```

### Regras ao gerar as tasks

- **Nunca coloque testes em "Fase final"** — cada comportamento testável tem seu 🔴🟢🔵 inline na fase da user story correspondente.
- Cada comportamento do `plan.md` que precisa de TDD gera ao menos duas tasks: o teste (🔴) e a implementação (🟢). Se houver refactor relevante, adicione a task 🔵.
- Tasks de infraestrutura (schema, DTO, module wiring, Swagger) são implementação direta — sem 🔴🟢🔵.
- Cada fase de user story começa com os DTOs necessários, depois o ciclo TDD do service, depois o endpoint.

---

## Etapa 4 — Validar tasks.md

Antes de finalizar, verifique:

- [ ] Nenhum teste está isolado em "fase final" — todos estão ao lado do comportamento que verificam
- [ ] A Fase 3 é um tracer bullet real (não uma fase de setup)
- [ ] Todo T\<NNN\> com lógica de negócio tem a task de teste (🔴) imediatamente antes
- [ ] Todo T\<NNN\> tem caminho de arquivo explícito
- [ ] A ordem respeita dependências reais (schema antes de service, 🔴 antes de 🟢)
- [ ] Tasks de migration incluem os comandos exatos
- [ ] Nenhuma tarefa é vaga demais para ser executada sem contexto adicional

---

## Etapa 5 — Atualizar `.current-plan.md`

```markdown
# Plano ativo

feature_directory: specs/<NNN>-<short-name>
spec: specs/<NNN>-<short-name>/spec.md
plan: specs/<NNN>-<short-name>/plan.md
tasks: specs/<NNN>-<short-name>/tasks.md
```

---

## Etapa 6 — Reportar

Informe:
- Caminho do tasks: `<feature_directory>/tasks.md`
- Total de tarefas e distribuição por fase
- Qual fase é o tracer bullet e por quê
- MVP acordado
- Próximo passo: `/oc-implement`
