---
name: "oc-clarify"
description: "Elucida uma ideia de funcionalidade nova para o open-class através de perguntas direcionadas e gera uma nova entrada no PRD. Não depende de nenhum plano ativo. Precede o /oc-specify."
argument-hint: "Descreva a ideia de funcionalidade que quer explorar"
user-invocable: true
disable-model-invocation: false
---

## Entrada do usuário

```text
$ARGUMENTS
```

Se `$ARGUMENTS` estiver vazio, responda:
> Por favor, descreva a ideia de funcionalidade. Exemplo: `/oc-clarify sistema de avaliação de cursos pelos alunos`

Nunca peça para o usuário repetir a descrição.

---

## Contexto do projeto

**open-class** é um LMS self-hosted, gratuito e open source inspirado na Udemy:

- **Atores**: `visitante`, `aluno`, `instrutor`, `admin`
- **Módulos existentes**: `auth`, `users`, `courses`, `modules`, `lessons`, `enrollments`, `categories`, `mail`, `youtube`
- **Princípios do produto**: sem pagamentos, embed YouTube, homelab-friendly, white-label, deploy via `docker compose up`
- **PRD**: `docs/prd.md` — fonte da verdade de escopo do produto

---

## Etapa 1 — Ler o PRD

Leia `docs/prd.md` para:
- Identificar o Epic mais adequado para acomodar a nova ideia (ou se exige um novo Epic)
- Identificar o próximo número de User Story disponível (padrão `US-XX`)
- Verificar se a ideia não duplica ou contradiz algo já especificado
- Entender o contexto de roadmap (Fase 1–5)

Se a ideia duplicar algo já existente no PRD, informe imediatamente o trecho conflitante e pergunte se quer evoluir o existente ou criar algo complementar — não prossiga com o fluxo de clarificação normalmente.

---

## Etapa 2 — Análise interna de lacunas

Antes de perguntar qualquer coisa, produza internamente (não exiba) um mapa de cobertura da ideia nas seguintes dimensões:

**Ator & Motivação**
- Quem se beneficia? Objetivo do usuário? Valor entregue?

**Comportamento Central**
- Qual ação o sistema executa? Resultado esperado?
- Quais estados/transições existem?

**Escopo & Limites**
- O que está claramente dentro? O que está fora?
- Pertence ao v1.0 ou é candidato a backlog futuro?

**Integração com o Produto**
- Depende de módulo existente? Cria novo módulo?
- Conflita com decisões já documentadas no PRD?

**Restrições do Domínio**
- Tem implicação em: self-hosted, YouTube embed, multi-instância, white-label, performance (256MB RAM)?

**Critérios de Aceite**
- É possível definir um critério testável já? Ou ainda muito vago?

**Edge Cases Críticos**
- Cenário de falha óbvio que muda o design?

Para cada dimensão, classifique: **Claro** / **Parcial** / **Ausente**.
Priorize perguntas pelas dimensões **Parcial** ou **Ausente** com maior impacto em arquitetura, UX ou escopo.

---

## Etapa 3 — Loop de perguntas sequenciais (interativo)

Gere internamente uma fila priorizada de até **5 perguntas**. Aplique:
- Máximo de 5 perguntas no total da sessão
- Cada resposta deve ser escolha múltipla (2–5 opções) **ou** resposta curta (≤5 palavras)
- Priorize perguntas que: definem ator principal, delimitam escopo, resolvem ambiguidade estrutural
- Nunca revele a fila de perguntas antecipadamente

**Para perguntas de múltipla escolha**, apresente:

```
**Pergunta N/5**: <pergunta>

**Recomendação**: Opção [X] — <razão em 1–2 frases>

| Opção | Descrição |
|-------|-----------|
| A     | ...       |
| B     | ...       |
| C     | ...       |

Responda com a letra (ex: "A"), "sim" para aceitar a recomendação, ou uma resposta curta própria (≤5 palavras).
```

**Para perguntas de resposta curta**, apresente:

```
**Pergunta N/5**: <pergunta>

**Sugestão**: <resposta> — <razão breve>

Formato: resposta curta (≤5 palavras). Responda "sim" para aceitar a sugestão.
```

**Após cada resposta**:
- "sim", "recomendação", "sugestão" → adota o valor sugerido
- Valide que mapeia a uma opção ou cabe em ≤5 palavras
- Registre em memória de trabalho; **não salve ainda em disco**
- Avance para a próxima pergunta

**Pare antes das 5 perguntas se**:
- Todas as dimensões críticas estiverem cobertas
- Usuário sinalizar "pronto", "basta", "pode continuar"

Se nenhuma ambiguidade crítica existir, informe e avance direto para a Etapa 4.

---

## Etapa 4 — Gerar entrada no PRD

Após o loop de perguntas, construa a nova entrada no formato do PRD:

### Determinar posição

1. Se a ideia se encaixa em um Epic existente: adicione a User Story ao final desse Epic
2. Se a ideia representa um domínio novo: crie um novo `### Epic N — <Nome>` no final da seção 5, depois adicione a(s) User Story(ies)
3. O número de US é o próximo disponível (leia o PRD para encontrar o maior US-XX atual e some 1)

### Formato da entrada

```markdown
#### US-XX — <Título conciso>

```
Como <ator>,
Quero <ação/objetivo>,
Para <valor/benefício>.

Critérios de Aceitação:
- <critério testável 1>
- <critério testável 2>
- <critério testável N>
```
```

**Regras de qualidade**:
- Critérios de aceite devem ser verificáveis por QA sem conhecer a stack
- Nenhum critério deve mencionar tecnologia de implementação (NestJS, Drizzle, etc.)
- Se houver restrição de self-hosted ou white-label relevante, inclua como critério explícito
- Se a feature tiver dependência em outra US, adicione: `> **Depende de**: US-XX`

### Escrever no PRD

Insira o bloco gerado na posição correta em `docs/prd.md`.

Se houver decisões ainda abertas após o loop (dimensões **Ausente** de baixo impacto), adicione uma linha na tabela da seção **13. Questões em Aberto**:

```markdown
| N+1 | <questão em aberto> | <decisão necessária> |
```

---

## Etapa 5 — Reportar

Apresente:

```
## Entrada adicionada ao PRD

**User Story**: US-XX — <Título>
**Epic**: <nome do epic>
**Arquivo**: docs/prd.md

### Cobertura de dimensões
| Dimensão              | Status     |
|-----------------------|------------|
| Ator & Motivação      | Resolvido  |
| Comportamento Central | Resolvido  |
| Escopo & Limites      | Deferido   |
| ...                   | ...        |

### Questões em aberto adicionadas
- <lista, se houver>

### Próximos passos
1. Crie uma issue no GitHub: `gh issue create --title "US-XX: <Título>" --body "..."`
2. Faça checkout da branch: `git checkout -b <issue-number>-<short-name>`
3. Execute: `/oc-specify <descrição da feature>`
```

---

## Regras gerais

- Não crie arquivos `spec.md`, `plan.md` ou `tasks.md` — esse é o papel do `/oc-specify`
- Não atualize `.current-plan.md`
- Não consulte nem dependa de `.specify/` ou `.current-plan.md`
- Sempre leia o PRD antes de perguntar qualquer coisa
- Preserve toda a formatação e estrutura existente de `docs/prd.md`
- Nunca remova ou altere conteúdo existente do PRD além de inserir a nova entrada e eventualmente a linha de questão em aberto
