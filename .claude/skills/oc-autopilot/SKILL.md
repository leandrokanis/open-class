---
name: "oc-autopilot"
description: "Executa o fluxo completo do open-class de ponta a ponta de forma totalmente autônoma, sem interação: aceita automaticamente a recomendação em todo interrogatório, entrevista e gate de validação das sub-skills oc-*. Vai de idea/specify até o PR sem parar, exceto em erro irrecuperável. Quando não recebe descrição, lê a issue a partir da branch atual. Use quando o usuário quiser rodar tudo em piloto automático, sem responder perguntas."
argument-hint: "Descreva a ideia/feature — ou deixe vazio para partir da issue da branch atual"
user-invocable: true
disable-model-invocation: false
---

## Entrada do usuário

```text
$ARGUMENTS
```

O ponto de partida vem de `$ARGUMENTS` **ou**, quando vazio, da issue apontada pela
branch atual. Nunca peça para o usuário repetir.

**Resolva a fonte de verdade antes de tudo** (ver Etapa 0.1 abaixo):

- Se `$ARGUMENTS` tiver texto → é uma ideia crua; siga pela Fase A (cria issue).
- Se `$ARGUMENTS` estiver vazio → **leia a issue da branch atual** e use o corpo dela
  como descrição que alimenta todo o pipeline.
- Só pare pedindo descrição se `$ARGUMENTS` estiver vazio **e** a branch não apontar
  para nenhuma issue existente — aí não há de onde partir.

---

## Regra soberana — modo autônomo (vale para TODAS as etapas)

Neste modo **você assume o papel do usuário**. O pipeline roda de ponta a ponta
sem nenhuma interação humana.

- **Em toda pergunta, entrevista, interrogatório ou gate de validação de qualquer
  sub-skill (`oc-idea`, `oc-specify`, `oc-plan`, `oc-implement`, `oc-pr`), escolha
  automaticamente a opção Recomendada / Sugerida e prossiga.** Onde a sub-skill diz
  "só avance quando o usuário confirmar", trate como **já confirmado**.
- **Nunca use a ferramenta `AskUserQuestion` nem faça perguntas ao usuário.** Decida
  internamente e siga.
- Se uma pergunta **não tiver recomendação explícita**, escolha o padrão mais seguro
  e alinhado aos princípios do produto (self-hosted, sem pagamentos, YouTube embed,
  white-label, homelab-friendly, deploy via `docker compose up`) e **registre a
  escolha como premissa** no log de decisões (abaixo). Não pare por isso.
- Encerre os interrogatórios sem teto quando as dimensões críticas estiverem
  cobertas pelas recomendações adotadas — não fique perguntando a si mesmo
  indefinidamente.

### Log de decisões automáticas

Mantenha, ao longo de toda a execução, um registro de cada recomendação aceita e
cada premissa assumida. Esse log é apresentado no relatório final para o usuário
poder revisar o que o piloto automático decidiu por ele.

---

## Etapa 0 — Sincronizar com main

```bash
git fetch origin
git log HEAD..origin/main --oneline
```

Se o comando listar commits (main avançou), **pare e avise** — este é um erro
irrecuperável em modo autônomo, pois arriscaria conflitos no PR:

> ⚠️ A branch `main` tem N commit(s) que você ainda não tem. Rode
> `git rebase origin/main` antes de rodar o autopilot novamente.

Se o output estiver vazio, prossiga.

---

## Etapa 0.1 — Resolver a fonte de verdade (issue da branch)

Antes de escolher a fase, determine de onde vem a descrição que vai alimentar o
pipeline:

1. Rode `git branch --show-current` para obter o nome da branch.
2. Extraia o **número da issue** do nome da branch. Ignore prefixos como `feat/`,
   `fix/`, `chore/`, `feature/` e pegue o primeiro grupo de dígitos. Exemplos:
   - `32-checklist-owasp-top` → `32`
   - `feat/42-student-reviews` → `42`
   - `feature/42/video-progress` → `42`
3. **Se `$ARGUMENTS` estiver vazio:**
   - Se achou um número → **leia a issue**: `gh issue view <n> --json number,title,body`.
     Use `title` + `body` como a **descrição de referência** do pipeline (o que
     `oc-specify`, `oc-plan` etc. recebem no lugar de `$ARGUMENTS`). Registre no log
     de decisões: "Partindo da issue #<n>: <título>".
   - Se **não** achou número na branch → pare: não há de onde partir. Peça uma
     descrição ou que o usuário troque para a branch da issue.
4. **Se `$ARGUMENTS` tiver texto:**
   - Use `$ARGUMENTS` como descrição de referência. A issue será criada na Fase A.

Chame a descrição resolvida acima de **`DESCRIÇÃO`** — é ela que substitui
`$ARGUMENTS` em todas as invocações das sub-skills a partir daqui.

---

## Fase A — Ideia e branch (condicional)

Com base na Etapa 0.1:

1. **Se já estiver numa branch de issue existente** (`$ARGUMENTS` vazio e issue lida
   da branch) → pule a Fase A e vá direto para a Fase B (Specify). O contexto já
   existe em `DESCRIÇÃO`.
2. **Se você recebeu uma ideia crua em `$ARGUMENTS`** (sem branch de issue):
   1. Invoque `/oc-idea $ARGUMENTS`, aceitando todas as recomendações do
      interrogatório de triagem e clarificação. Isso registra no PRD (quando
      aplicável) e cria a issue no GitHub.
   2. Capture o número da issue criada e crie/entre na branch:
      `git checkout -b <numero-issue>-<short-name>`
   3. Só então prossiga para a Fase B.

Imprima: `✓ [A] Ideia triada e branch pronta` (ou `✓ [A] Issue #<n> lida da branch — pulando triagem`).

---

## Fase B — Pipeline até o PR

Rode cada sub-skill na sequência. Não pare entre etapas: avance automaticamente
assim que cada uma concluir, aceitando as recomendações em qualquer interrogatório
interno. Após cada etapa, imprima uma linha de progresso:

```
✓ [N/5] <etapa> concluída
```

### 1/5 — Specify

Invoque `/oc-specify` com a `DESCRIÇÃO` resolvida na Etapa 0.1 (ou sem argumentos se
o próprio `oc-specify` for extrair a issue da branch). Aceite todas as recomendações
da entrevista de requisitos. Aguarde `spec.md` e `.current-plan.md` escritos em disco.

### 2/5 — Plan

Invoque `/oc-plan`. No interrogatório técnico, **aceite a opção recomendada em cada
pergunta**. Aguarde `plan.md` escrito e o campo `plan:` preenchido em
`.current-plan.md`. Se ADRs foram criados, confirme os arquivos em `docs/decisions/`.

### 3/5 — Tasks

Invoque `/oc-tasks`. Aguarde `tasks.md` escrito e o campo `tasks:` preenchido em
`.current-plan.md`.

### 4/5 — Implement

Invoque `/oc-implement`. Aceite o plano de testes recomendado sem pedir confirmação.
Aguarde todas as tasks marcadas `[x]`, testes passando e Swagger atualizado.

### 5/5 — PR

Invoque `/oc-pr`. Aguarde a URL do PR ser retornada.

---

## Condições de parada (erro irrecuperável)

Só interrompa o piloto automático se:

- `main` avançou (Etapa 0) e exige rebase.
- `$ARGUMENTS` vazio e nenhuma issue na branch — nada de onde partir (Etapa 0.1).
- `spec.md` acabaria com ambiguidade estrutural que nenhuma recomendação resolve.
- Testes falham após 2 tentativas de correção no `oc-implement` — cole a saída.
- Migration falha ao ser aplicada.
- Conflito de tipos entre schema Drizzle e o que o service espera.
- `gh` não autenticado / `gh pr create` falha.

Ao parar, informe: a etapa, o erro exato, o log de decisões já tomadas até ali, e
como retomar manualmente (a sub-skill individual a rodar).

---

## Relatório final

Ao concluir o PR, apresente:

- **PR**: URL retornada pelo `/oc-pr`
- **Issue**: número e título
- **Artefatos**: caminhos de `spec.md`, `plan.md`, `tasks.md`; ADRs criados
- **Testes**: total escrito e passando
- **Log de decisões automáticas**: cada recomendação aceita e cada premissa assumida
  durante os interrogatórios — para o usuário revisar e, se quiser, ajustar depois.
