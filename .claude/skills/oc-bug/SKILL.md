---
name: "oc-bug"
description: "Registra um bug do open-class: interroga comportamento atual e esperado, passos para reproduzir e impacto, depois abre a issue no GitHub com label bug. Use sempre que o usuário quiser reportar um bug, comportamento inesperado ou regressão."
argument-hint: "Descreva brevemente o bug"
user-invocable: true
---

## Entrada do usuário

```text
$ARGUMENTS
```

Se `$ARGUMENTS` estiver vazio, responda:
> Descreva o bug brevemente. Exemplo: `/oc-bug botão de salvar não responde na página de perfil`

---

## Etapa 1 — Identificar domínio

Leia apenas o suficiente para saber em qual módulo/tela o bug ocorre e não perguntar o que já está claro em `$ARGUMENTS`. **Não investigue a causa raiz** — isso é papel do `/oc-implement`. O objetivo desta skill é registrar o comportamento observado com fidelidade, não diagnosticar.

---

## Etapa 2 — Interrogatório

Interrogue o usuário **uma pergunta por vez** até ter uma descrição completa e acionável do bug. O objetivo é chegar a um relatório que qualquer desenvolvedor consiga reproduzir e corrigir sem ajuda extra.

Dimensões a cobrir (priorize as ausentes em `$ARGUMENTS`):

| Dimensão | O que extrair |
|----------|---------------|
| **Comportamento atual** | O que acontece de errado — mensagem de erro, estado visual, resposta da API |
| **Comportamento esperado** | O que deveria acontecer no lugar |
| **Passos para reproduzir** | Sequência mínima e determinística que provoca o bug |
| **Contexto** | Tela, rota, role do usuário (aluno/instrutor/admin), dados de entrada |
| **Frequência** | Sempre, às vezes, só em condição específica |
| **Impacto** | Bloqueante (impede uso), degradante (piora UX), cosmético |

Regras:
- **Uma pergunta por vez**
- **Dê sua recomendação** quando houver uma resposta mais provável (ex: "Suspeito que acontece sempre — correto?")
- **Não investigue a causa** — não leia código para diagnosticar, não sugira hipóteses técnicas, não pergunte sobre configurações internas. Registre o que o usuário observa, não o porquê.
- Encerre quando todas as dimensões estiverem cobertas ou o usuário sinalizar "pronto"

Formato de cada pergunta:

```
**Pergunta N**: <pergunta>

**Recomendação**: <resposta mais provável> — <razão em 1 frase>

Responda com "sim" para confirmar ou corrija em poucas palavras.
```

Antes de sair, apresente um resumo de 3–5 linhas e peça confirmação ("Fechado assim?").

---

## Etapa 3 — Criar a issue no GitHub

Monte o corpo abaixo e salve em arquivo temporário para preservar formatação:

```markdown
## Comportamento atual
<o que acontece>

## Comportamento esperado
<o que deveria acontecer>

## Passos para reproduzir
1. <passo 1>
2. <passo 2>
3. ...

## Contexto
- **Tela / Rota**: <ex: /perfil, /admin/cursos>
- **Role**: <aluno | instrutor | admin | visitante>
- **Frequência**: <sempre | às vezes | condição específica>
- **Impacto**: <bloqueante | degradante | cosmético>

## Suspeita técnica
<módulo, arquivo ou linha suspeita — se identificada na Etapa 1; omita se não houver>
```

Título no formato `fix(<escopo>): <descrição imperativa em inglês, ≤72 chars>`.

Comando:

```bash
gh issue create --title "<título>" --label "bug" --body-file <arquivo-temporário>
```

Se o label `bug` não existir, refaça sem `--label`. Capture a URL retornada.

---

## Etapa 4 — Reportar

```
## Bug registrado

**Issue**: #<nº> — <título>  (<URL>)
**Módulo suspeito**: <módulo ou "não identificado">
**Impacto**: <bloqueante | degradante | cosmético>

### Próximos passos
1. git checkout -b <nº>-fix-<short-name>
2. /oc-implement  (para corrigir com TDD)
```
