---
name: "oc-idea"
description: "Faz triagem de uma ideia, funcionalidade, tarefa ou bug do open-class, interroga o usuário estilo grill-me até entendimento completo, registra no lugar certo do PRD (quando aplicável) e abre a issue no GitHub com todo o contexto. Não depende de plano ativo. Precede o /oc-specify."
argument-hint: "Descreva a ideia, funcionalidade, tarefa ou bug que quer explorar"
user-invocable: true
disable-model-invocation: false
---

## Entrada do usuário

```text
$ARGUMENTS
```

Se `$ARGUMENTS` estiver vazio, responda:
> Descreva a ideia, funcionalidade, tarefa ou bug. Exemplo: `/oc-idea sistema de avaliação de cursos pelos alunos`

Nunca peça para o usuário repetir a descrição.

---

## Contexto do projeto

**open-class** é um LMS self-hosted, gratuito e open source inspirado na Udemy:

- **Atores**: `visitante`, `aluno`, `instrutor`, `admin`
- **Módulos existentes**: `auth`, `users`, `courses`, `modules`, `lessons`, `enrollments`, `categories`, `mail`, `youtube`
- **Princípios do produto**: sem pagamentos, embed YouTube, homelab-friendly, white-label, deploy via `docker compose up`
- **PRD**: `docs/prd.md` — fonte da verdade de escopo do produto

---

## Etapa 0 — Triagem

Antes de qualquer outra coisa, leia `docs/prd.md` e classifique a entrada em **exatamente uma** categoria. Explore o código (`apps/`, `packages/`) e o PRD antes de decidir — não pergunte o que dá para descobrir sozinho.

| Categoria | Sinais | Destino |
|-----------|--------|---------|
| **Épico / Ideia nova** | Domínio inteiro que ainda não existe no produto; cria conjunto de user stories | Novo `### Epic N` no PRD + US → issue |
| **Funcionalidade** | Capacidade nova que se encaixa em um Epic existente; entrega valor a um ator | Nova(s) `#### US-XX` no Epic adequado → issue |
| **User Story** | Recorte pequeno de comportamento dentro de uma feature existente | Uma `#### US-XX` no Epic adequado → issue |
| **Tarefa / Chore** | Trabalho técnico sem valor direto de usuário (refactor, infra, CI, docs, dependências) | **Não vai ao PRD** → issue direto |
| **Bug** | Comportamento existente quebrado ou divergente do esperado | **Não vai ao PRD** → issue direto |
| **Duplicata** | Já coberto por uma US/feature/tarefa existente | Não prossegue |

Anuncie a classificação em uma linha antes de continuar, por exemplo:

> **Triagem**: isto é uma **Funcionalidade** — se encaixa no *Epic 3 — Aprendizado e Progresso*. Vou aprofundar antes de registrar.

**Se for Duplicata**: cite o trecho conflitante do PRD (ou a issue/US existente) e pergunte se quer **evoluir o existente**, **criar algo complementar** ou **cancelar**. Não siga o fluxo normal sem essa decisão.

**Se for Tarefa ou Bug**: pule a escrita no PRD (Etapa 4). Ainda assim interrogue (Etapa 3) o suficiente para uma issue acionável e crie a issue (Etapa 5).

---

## Etapa 1 — Mapa de cobertura

Produza internamente (não exiba) um mapa da ideia nas dimensões abaixo, classificando cada uma como **Claro** / **Parcial** / **Ausente**:

- **Ator & Motivação** — quem se beneficia, objetivo, valor entregue
- **Comportamento Central** — ação do sistema, resultado, estados/transições
- **Escopo & Limites** — o que está dentro, o que está fora, v1.0 vs backlog
- **Integração com o Produto** — depende de módulo existente? cria módulo? conflita com o PRD?
- **Restrições do Domínio** — self-hosted, YouTube embed, multi-instância, white-label, performance (256MB RAM)
- **Critérios de Aceite** — já dá para definir algo testável?
- **Edge Cases Críticos** — cenário de falha que muda o design

Este mapa alimenta o interrogatório: priorize as dimensões **Parcial** e **Ausente** de maior impacto em arquitetura, UX ou escopo.

---

## Etapa 2 — Interrogatório (estilo grill-me)

Interrogue o usuário **implacavelmente** sobre cada aspecto até chegarem a um entendimento compartilhado e completo. Percorra cada ramo da árvore de decisão, resolvendo as dependências entre decisões uma a uma.

Regras do interrogatório:

- **Uma pergunta por vez.** Nunca despeje uma lista de perguntas.
- **Sem teto fixo de perguntas.** Continue enquanto restar ambiguidade que afete escopo, arquitetura ou UX. Não force perguntas quando já estiver claro.
- **Se o código ou o PRD respondem, não pergunte** — explore `apps/`, `packages/` e `docs/` e traga a resposta você mesmo.
- **Cada pergunta traz sua recomendação.** Dê a resposta que você recomenda e o porquê em 1–2 frases.
- **Respeite as dependências.** Não pergunte sobre um ramo cuja premissa ainda não foi decidida; resolva a decisão-pai primeiro.
- Cada resposta deve caber em uma escolha múltipla (2–5 opções) **ou** resposta curta (≤5 palavras).

Formato de cada pergunta:

```
**Pergunta N**: <pergunta>

**Recomendação**: <resposta recomendada> — <razão em 1–2 frases>

| Opção | Descrição |
|-------|-----------|
| A     | ...       |
| B     | ...       |

Responda com a letra, "sim" para aceitar a recomendação, ou uma resposta curta própria (≤5 palavras).
```

Para perguntas sem opções discretas, apresente só a **Recomendação** e peça uma resposta curta.

Após cada resposta:
- "sim" / "recomendação" → adota o valor recomendado
- Registre em memória de trabalho; **não salve em disco ainda**
- Reavalie o mapa de cobertura e siga para a próxima ambiguidade

**Encerre o interrogatório quando**:
- Todas as dimensões críticas estiverem **Claras**, **ou**
- O usuário sinalizar "pronto", "basta", "pode continuar"

Antes de sair do interrogatório, faça um resumo de 3–5 linhas do entendimento alcançado e peça confirmação ("Fechado assim?") antes de escrever qualquer coisa.

---

## Etapa 3 — Registrar no PRD *(só para Épico / Funcionalidade / User Story)*

Pule esta etapa inteira se a triagem classificou como **Tarefa**, **Bug** ou **Duplicata sem evolução**.

### Determinar posição

1. **Funcionalidade / User Story** → adicione a(s) US ao final do Epic mais adequado.
2. **Épico / Ideia nova** → crie `### Epic N — <Nome>` ao final da seção *5. Histórias de Usuário e Requisitos*, depois adicione a(s) US.
3. O número de US é o próximo disponível (leia o PRD, ache o maior `US-XX` atual e some 1).

### Formato da entrada

```markdown
#### US-XX — <Título conciso>

​```
Como <ator>,
Quero <ação/objetivo>,
Para <valor/benefício>.

Critérios de Aceitação:
- <critério testável 1>
- <critério testável 2>
​```
```

**Regras de qualidade**:
- Critérios de aceite verificáveis por QA sem conhecer a stack
- Nenhum critério menciona tecnologia (NestJS, Drizzle, etc.)
- Inclua restrição de self-hosted ou white-label como critério explícito quando relevante
- Se depender de outra US, adicione `> **Depende de**: US-XX`

Preserve toda a formatação e o conteúdo existente do PRD — apenas insira o novo bloco na posição correta.

Se restarem decisões abertas de baixo impacto, adicione uma linha na tabela da seção **13. Questões em Aberto**.

---

## Etapa 4 — Criar a issue no GitHub

Sempre crie a issue ao fim, para **todas** as categorias (exceto Duplicata cancelada). A issue carrega **todo o contexto obtido** no interrogatório, não só o título.

Monte o corpo com esta estrutura e passe via arquivo temporário (`--body-file`) para preservar quebras de linha:

```markdown
## Contexto
<1–2 parágrafos com o problema/motivação e o entendimento fechado no interrogatório>

## Escopo
- <o que está dentro>
- <o que está explicitamente fora>

## Critérios de Aceitação   <!-- só para feature/US; omita em bug/chore -->
- <critério testável 1>
- <critério testável 2>

## Passos para reproduzir    <!-- só para bug -->
1. ...

## Decisões tomadas
- <decisão> — <razão>

## Referências
- PRD: US-XX — <Título>  <!-- se aplicável -->
- Depende de: #<nº> / US-XX  <!-- se houver -->
```

Escolha o título em conventional-commits-friendly e os labels conforme a categoria:

| Categoria | Título | Label |
|-----------|--------|-------|
| Épico / Funcionalidade / User Story | `US-XX: <Título>` | `enhancement` |
| Tarefa / Chore | `chore: <descrição>` | `chore` |
| Bug | `fix: <descrição>` | `bug` |

Comando:

```bash
gh issue create --title "<título>" --label "<label>" --body-file <arquivo-temporário>
```

Se o label não existir no repositório, refaça sem `--label` (não deixe a criação falhar por causa disso). Capture a URL/número retornado para o relatório.

---

## Etapa 5 — Reportar

```
## Resultado

**Categoria**: <Épico | Funcionalidade | User Story | Tarefa | Bug>
**Issue**: #<nº> — <título>  (<URL>)
**PRD**: US-XX — <Título> em docs/prd.md   (ou "não aplicável")

### Cobertura de dimensões
| Dimensão              | Status    |
|-----------------------|-----------|
| Ator & Motivação      | Resolvido |
| Comportamento Central | Resolvido |
| ...                   | ...       |

### Questões em aberto
- <lista, se houver>

### Próximos passos
1. git checkout -b <nº-issue>-<short-name>
2. /oc-specify <descrição da feature>
```

---

## Regras gerais

- Não crie `spec.md`, `plan.md` ou `tasks.md` — isso é papel do `/oc-specify`
- Não atualize nem dependa de `.current-plan.md` ou `.specify/`
- Sempre leia o PRD e explore o código antes de perguntar qualquer coisa
- Prefira descobrir no código a perguntar ao usuário
- Nunca remova ou altere conteúdo existente do PRD além da inserção da nova entrada e de eventual questão em aberto
- Siga `docs/contributing/commit-messages.md` ao nomear a issue
