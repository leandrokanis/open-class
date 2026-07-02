---
name: "oc-debug"
description: "Debuga um bug do open-class de forma colaborativa: investiga hipóteses com o desenvolvedor, instrumenta o código, confirma a causa raiz com evidência de runtime, planeia e aplica o fix mínimo com teste de regressão. Quatro checkpoints obrigatórios bloqueiam aguardando o desenvolvedor — NÃO aplicar SIM PARA TUDO. Use sempre que o usuário quiser debugar um bug, investigar um comportamento inesperado ou corrigir uma regressão."
argument-hint: "Número da issue (ex.: 76), URL da issue no GitHub, ou vazio para inferir da branch"
user-invocable: true
---

## Entrada do usuário

```text
$ARGUMENTS
```

O argumento é opcional e pode ser:

- Número da issue (ex.: `76` ou `#76`)
- URL da issue (ex.: `https://github.com/leandrokanis/open-class/issues/76`) — extrair o número da URL
- Vazio — inferir o número da branch atual (ver Passo 1)

---

## Filosofia (ler antes de começar)

Debug é feito **junto** do desenvolvedor, não no lugar dele. Esta skill é
colaborativa: hipóteses, causa raiz e plano de correção passam pelo
desenvolvedor antes de qualquer ação. **NÃO aplicar "SIM PARA TUDO"** —
os checkpoints são o design da skill. Há quatro obrigatórios:

1. **Hipóteses** — apresentadas ao desenvolvedor para validar/ajustar antes de instrumentar.
2. **Causa raiz** — confirmada com ele antes de planejar o fix.
3. **Plano de correção** — aprovado explicitamente antes de implementar.
4. **Verificação do fix** — o desenvolvedor reproduz o bug com o fix aplicado; só a confirmação dele encerra o ciclo.

**Reprodução é manual.** Quem reproduz o bug é o desenvolvedor, na aplicação real, com o código instrumentado.

**A implementação não encerra a skill.** Depois do fix vem a verificação do desenvolvedor; limpeza e conclusão só ocorrem após o "corrigiu" dele.

**Evidência antes de fix.** Nunca corrigir com base em especulação. Causa raiz só é "confirmada" com evidência concreta de runtime ou análise que o desenvolvedor valide.

**Fix mínimo.** Modificação precisa, não reescrita. Se crescer além do escopo do bug, parar e reportar.

**Instrumentação é temporária, mas vive até a confirmação.** Todo log leva o marcador `[OC-DEBUG]`. Permanece durante a verificação e só é removido após o "corrigiu".

**Teste de regressão obrigatório.** Todo bug corrigido deixa um teste que falharia sem o fix. Preferir atualizar um teste existente; criar arquivo novo só quando não existir teste para a área.

---

## Passo 1 — Resolver o número da issue

Resolver `ISSUE_ID` na seguinte ordem:

1. Argumento é um número (`76` ou `#76`) — usar diretamente.
2. Argumento é uma URL GitHub — extrair o número final.
3. Argumento vazio — `git branch --show-current` e extrair o número inicial da branch (ex.: `76-fix-course-thumbnail` → `#76`).

Se nenhuma fonte resolver um número, parar:

> Não foi possível resolver o número da issue. Passe o número (`/oc-debug 76`), a URL da issue, ou rode a partir de uma branch que comece com o número da issue.

---

## Passo 2 — Ler o bug no GitHub

```bash
gh issue view <ISSUE_ID>
```

Extrair e internalizar:

- Título
- Comportamento atual (o defeito observado)
- Comportamento esperado
- Passos de reprodução
- Comentários relevantes (pistas, stack traces)

Se a issue não tiver passos de reprodução nem comportamento esperado claros, perguntar ao desenvolvedor antes de prosseguir.

---

## Passo 3 — Localizar o diretório da feature

Prioridade (primeira que resolver):

1. Branch atual → extrair slug → procurar em `specs/` pasta cujo nome contenha o número ou slug da branch.
2. `.current-plan.md` → campo `feature_directory` → usar somente se existir no filesystem.
3. Nenhuma resolveu: criar `specs/<número>-<slug-da-branch>/`.

Após resolver, registrar `debug.md` nesse diretório.

---

## Passo 4 — Investigação estática + hipóteses

- Explorar o código relevante: componentes/serviços citados na issue, handlers do fluxo descrito nos passos de reprodução, mudanças recentes na área (`git log -- <paths>`).
- Ler arquitetura em `docs/architecture/` e decisões em `docs/decisions/` conforme relevante.
- Formular **3 a 5 hipóteses** ranqueadas por plausibilidade. Incluir ao menos uma não óbvia (config/ambiente, ordem de eventos, estado compartilhado). Não parar na primeira que "parece certa".

### ✋ CHECKPOINT 1 — Apresentar hipóteses ao desenvolvedor

```
## Hipóteses — #XXX

| # | Hipótese | Plausibilidade | Onde olhar | Como a evidência decide |
|---|----------|---------------|------------|------------------------|
| H1 | [causa suspeita] | alta | `apps/.../arquivo.ts:NN` | [qual log confirma ou refuta] |
| H2 | ... | média | ... | ... |

O que acha? Pode validar, reordenar, descartar ou adicionar hipóteses.
Sigo para a instrumentação com as aprovadas.
```

Só avançar com o conjunto de hipóteses acordado.

---

## Passo 5 — Instrumentar + reprodução manual pelo desenvolvedor

A reprodução é manual, feita pelo desenvolvedor na aplicação real.

**Subir o log server:**
```bash
node .claude/skills/oc-debug/scripts/debug-server.mjs &
```
Logs acumulam em `/tmp/oc-debug.log` (um JSON por linha).

**Inserir logs cirúrgicos** nos pontos que decidem cada hipótese aprovada — sempre com o marcador `[OC-DEBUG]`:

- **apps/api (NestJS):**
  ```ts
  this.logger.log(`[OC-DEBUG] H1 ${JSON.stringify({ key: value })}`);
  // ou fora de classe:
  console.log('[OC-DEBUG] H1', JSON.stringify({ key: value }));
  ```
  Ler com: `docker compose logs api | grep "OC-DEBUG"`

- **apps/ui (Next.js — Server Component / Route Handler):**
  ```ts
  console.log('[OC-DEBUG] H1', JSON.stringify({ key: value }));
  ```
  Ler com: saída do terminal onde roda `pnpm --filter ui dev`

- **apps/ui (Client Component — browser):**
  ```ts
  fetch('http://localhost:7331/log', {
    method: 'POST',
    body: JSON.stringify({ tag: '[OC-DEBUG] H1', key: value }),
  });
  ```
  Ler com: `/tmp/oc-debug.log`

**Entregar o roteiro de reprodução** ao desenvolvedor: passos exatos da issue + o que observar. Aguardar aviso de conclusão.

**Ler a evidência:** `/tmp/oc-debug.log` + `docker compose logs api | grep "OC-DEBUG"` + terminal da UI. Mapear cada linha à hipótese que confirma ou refuta.

**Iterar:** se a evidência refutar todas as hipóteses, voltar ao Passo 4 com o que foi aprendido — novas hipóteses, novo CHECKPOINT 1, reinstrumentar.

---

## Passo 6 — Confirmar causa raiz

### ✋ CHECKPOINT 2 — Apresentar a causa raiz ao desenvolvedor

Apresentar e aguardar confirmação:

- Qual hipótese se confirmou e qual evidência a sustenta (linhas de log concretas).
- Por que o código se comporta assim (mecanismo, não sintoma).
- Por que os testes existentes não pegaram.

Se o desenvolvedor discordar ou trouxer contexto novo: voltar ao Passo 4/5.

---

## Passo 7 — Gerar `FEATURE_DIR/debug.md` e aprovar o plano

```markdown
# Debug: [TÍTULO DA ISSUE]

**GitHub**: #[ISSUE_ID]
**Feature**: [FEATURE_DIR]
**Data**: [DATA]

---

## Bug

- **Comportamento atual**: [da issue + observado na reprodução]
- **Comportamento esperado**: [da issue]
- **Reprodução**: [roteiro manual executado pelo desenvolvedor]

---

## Hipóteses investigadas

| # | Hipótese | Veredito | Evidência |
|---|----------|----------|-----------|
| H1 | [causa] | ✅ confirmada / ❌ refutada | [log concreto] |

---

## Causa raiz

[Mecanismo do bug, com paths reais e evidência que o confirma.
Confirmada pelo desenvolvedor no CHECKPOINT 2.
Por que os testes existentes não pegaram.]

---

## Plano de correção

- [ ] **[Passo 1]** — teste de regressão em `apps/.../arquivo.spec.ts`
      [atualizar existente ou criar] que falha sem o fix
- [ ] **[Passo 2]** — fix mínimo em `apps/.../arquivo.ts` — [o que muda]
- [ ] **[Passo 3]** — [atualizar testes existentes afetados, se houver]

---

## Verificação

- [ ] Teste de regressão passa com o fix (e falhava sem)
- [ ] **Desenvolvedor reproduziu e confirmou que corrigiu** (CHECKPOINT 4)
- [ ] Instrumentação `[OC-DEBUG]` removida — `grep -rn "OC-DEBUG" apps/` vazio
- [ ] Suite completa dos apps afetados verde
```

### ✋ CHECKPOINT 3 — Aprovação do plano

Apresentar o plano ao desenvolvedor e aguardar aprovação explícita. Ele pode ajustar — editar o `debug.md` conforme e só então prosseguir.

---

## Passo 8 — Executar a correção (somente após o CHECKPOINT 3)

Seguir o plano marcando cada checkbox ao concluir:

1. **Teste de regressão (RED)** — escrever/atualizar o teste e confirmar que falha pelo motivo da causa raiz.
2. **Fix mínimo (GREEN)** — aplicar a menor mudança que corrige a causa raiz. Rodar o teste → deve passar.
3. **Testes existentes** — rodar os specs dos arquivos alterados. Se um teste existente quebrar por razão não relacionada ao fix, reportar antes de continuar.

**NÃO limpar a instrumentação ainda.** Os logs `[OC-DEBUG]` permanecem durante a verificação do desenvolvedor.

| App | Comando de teste |
|-----|-----------------|
| `apps/api` | `cd apps/api && pnpm vitest run <arquivo.spec.ts> --reporter=verbose` |
| `apps/ui` | `cd apps/ui && pnpm vitest run <arquivo.spec.ts> --reporter=verbose` |

---

## Passo 9 — ✋ CHECKPOINT 4 — Verificação pelo desenvolvedor (loop)

Com o fix aplicado e a instrumentação no lugar, pedir ao desenvolvedor que reproduza os passos da issue e diga se corrigiu.

- **"Corrigiu"** → ir ao Passo 10.
- **"Não corrigiu" / "parcialmente"** → ler a nova evidência dos logs (a instrumentação ficou exatamente para isso), voltar ao Passo 4 com hipóteses revisadas (novo CHECKPOINT 1) e repetir o ciclo.

A skill não conclui sem o "corrigiu" explícito do desenvolvedor.

---

## Passo 10 — Concluir (somente após o "corrigiu")

1. **Limpar instrumentação** — remover todas as linhas `[OC-DEBUG]`, derrubar o log server e apagar `/tmp/oc-debug.log`.
   Verificar: `grep -rn "OC-DEBUG" apps/` deve retornar vazio.

2. **Suite completa por app afetado:**

| App | Comando |
|-----|---------|
| `apps/api` | `cd apps/api && pnpm vitest run --reporter=verbose` |
| `apps/ui` | `cd apps/ui && pnpm vitest run --reporter=verbose` |

3. **Type checking:** `pnpm tsc --noEmit` nos apps alterados.

4. Marcar os checkboxes da seção Verificação do `debug.md`.

---

## Passo 11 — Reportar

```
✅ Debug concluído: #XXX

Causa raiz: [1 frase — confirmada pelo desenvolvedor]
Evidência: [log/observação da reprodução manual]
Hipóteses investigadas: N (M refutadas) | Ciclos de correção: K

Fix:
- apps/[app]/[path] — [o que mudou]

Testes:
- [path do teste de regressão] — [atualizado/criado]
- Suites verdes: ✅ | Instrumentação removida: ✅
- Verificação manual pelo desenvolvedor: ✅

Diagnóstico completo: FEATURE_DIR/debug.md
Próximo passo: /oc-pr
```

---

## Regras

- **Colaborativa por design** — NÃO aplicar "SIM PARA TUDO". Quatro checkpoints obrigatórios que bloqueiam aguardando o desenvolvedor. Nunca pulá-los.
- **Nunca implementar antes do CHECKPOINT 3.** Nenhuma linha de fix sem o plano aprovado.
- **A implementação não encerra a skill.** Só o "corrigiu" explícito (CHECKPOINT 4) encerra — senão, repetir o ciclo.
- **Limpeza só após a confirmação:** instrumentação e log server removidos somente depois do "corrigiu".
- **Reprodução é manual pelo desenvolvedor** — a skill instrumenta e lê a evidência.
- **Nunca corrigir sem causa raiz confirmada por evidência E pelo desenvolvedor.**
- **Hipóteses → instrumentação → fix.** Nunca pular etapas.
- **Fix mínimo** — corrigir a causa, não redesenhar a área. Escopo maior → reportar e parar.
- **Atualizar testes existentes** quando deveriam ter pego o bug ou quando o fix muda comportamento que eles verificavam; criar arquivo novo só na ausência de teste para a área.
- **Toda instrumentação leva `[OC-DEBUG]`** e permanece até o "corrigiu"; depois removida integralmente.
- **Sem commit** — o desenvolvedor decide quando commitar.
- **Parar em falha não relacionada:** teste de outro módulo quebrando → reportar antes de continuar.
