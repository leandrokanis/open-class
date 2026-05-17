---
name: "oc-ship"
description: "Executa o pipeline completo do open-class de ponta a ponta sem interrupção: specify → plan → tasks → implement → pr. Use sempre que o usuário quiser entregar uma feature do zero ao PR, rodar tudo de uma vez, fazer o fluxo completo ou ship de uma feature."
argument-hint: "Descreva a feature que quer entregar"
user-invocable: true
---

## Entrada do usuário

```text
$ARGUMENTS
```

A descrição da feature vem de `$ARGUMENTS`. Nunca peça para o usuário repetir.

---

## Execução

Rode cada skill na sequência abaixo. Não pare entre etapas para pedir aprovação — avance automaticamente assim que cada skill concluir. A única razão válida para parar é um erro irrecuperável (listado ao fim).

Após cada etapa, imprima uma linha de progresso:
```
✓ [N/5] <nome da etapa> concluída
```

---

### 1/5 — Specify

Invoque `/oc-specify $ARGUMENTS`.

Aguarde até que `spec.md` e `.current-plan.md` estejam escritos em disco antes de prosseguir.

---

### 2/5 — Plan

Invoque `/oc-plan`.

Aguarde até que `plan.md` esteja escrito e `.current-plan.md` tenha o campo `plan:` preenchido. Se ADRs foram criados, confirme que os arquivos existem em `docs/decisions/`.

---

### 3/5 — Tasks

Invoque `/oc-tasks`.

Aguarde até que `tasks.md` esteja escrito e `.current-plan.md` tenha o campo `tasks:` preenchido.

---

### 4/5 — Implement

Invoque `/oc-implement`.

Aguarde até que todas as tasks estejam marcadas como `[x]` em `tasks.md`, os testes estejam passando e o Swagger esteja atualizado.

---

### 5/5 — PR

Invoque `/oc-pr`.

Aguarde até que a URL do PR seja retornada.

---

## Condições de parada

Interrompa e reporte ao usuário se:

- Nenhum número de issue encontrado na branch (antes de iniciar)
- `spec.md` gerado com mais de 3 `[NEEDS CLARIFICATION]` não resolvidos
- Testes falham após 2 tentativas de correção no `oc-implement`
- Migration falha ao ser aplicada
- `gh pr create` falha (ex: `gh` não autenticado)

Em caso de parada, informe a etapa, o erro exato e o que o usuário precisa fazer para retomar (`/oc-implement` ou `/oc-pr` individualmente).
