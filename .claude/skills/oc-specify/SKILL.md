---
name: "oc-specify"
description: "Cria ou atualiza a especificação de uma feature do open-class a partir de uma descrição em linguagem natural, com foco no domínio LMS deste projeto. Use sempre que o usuário quiser especificar uma nova feature para o open-class, descrever um requisito, iniciar um novo desenvolvimento ou atualizar um spec existente."
argument-hint: "Descreva a feature que quer especificar"
user-invocable: true
---

## Entrada do usuário

```text
$ARGUMENTS
```

O texto após `/oc-specify` é o ponto de partida da conversa. Nunca peça para o usuário repetir.

---

## Contexto do projeto

**open-class** é um LMS (Learning Management System) com:

- **Atores**: `aluno`, `instrutor`, `admin`
- **Módulos existentes**: `auth`, `users`, `courses`, `modules` (módulos de curso), `lessons`, `enrollments`, `categories`, `mail`, `youtube`
- **Stack**: NestJS 11, Drizzle ORM, PostgreSQL, Passport JWT + Google OAuth, Swagger, Vitest
- **Monorepo**: `apps/api/` (NestJS), `apps/ui/` (frontend futuro), `packages/db/` (schemas Drizzle compartilhados)

---

## Etapa 0 — Sincronizar com main

Execute antes de qualquer coisa:

```bash
git fetch origin
git log HEAD..origin/main --oneline
```

Se o comando listar commits (main avançou), **pare e avise**:

> ⚠️ A branch `main` tem N commit(s) que você ainda não tem. Rode `git rebase origin/main` antes de continuar para evitar conflitos no PR.

Se o output estiver vazio, a branch está atualizada — prossiga.

---

## Etapa 1 — Nomear e numerar a feature

1. **Obtenha o número da issue do GitHub a partir da branch atual**:
   - Execute `git branch --show-current` para obter o nome da branch.
   - Extraia o número do início ou do meio do nome. Padrões comuns:
     - `42-student-reviews` → `42`
     - `feat/42-student-reviews` → `42`
     - `feature/42/student-reviews` → `42`
     - `fix/42-something` → `42`
   - Regex de extração: primeiro grupo de dígitos encontrado no nome da branch após ignorar prefixos tipo `feat/`, `fix/`, `chore/`, `feature/`.
   - Se nenhum número for encontrado na branch, pare e informe: "Não encontrei número de issue na branch `<nome>`. Confirme que está na branch correta ou informe o número manualmente."

2. **Gere o `short-name`** de 2–4 palavras em kebab-case a partir da descrição da feature (ex: `student-reviews`, `payment-gateway`, `video-progress`). Não reutilize o sufixo da branch — derive do `$ARGUMENTS`.

3. Monte o diretório: `specs/<ISSUE_NUMBER>-<short-name>/`

4. Crie o diretório e o arquivo spec: `mkdir -p specs/<ISSUE_NUMBER>-<short-name> && touch specs/<ISSUE_NUMBER>-<short-name>/spec.md`

---

## Etapa 2 — Entrevista de requisitos (OBRIGATÓRIA — não pule)

Antes de escrever qualquer arquivo, você **deve** entrevistar o usuário para entender o comportamento e as funcionalidades da feature.

**Regras desta etapa:**
- Nunca suponha o comportamento de uma funcionalidade sem perguntar.
- Nunca invente requisitos, restrições ou regras de negócio.
- Se a descrição inicial for vaga, pergunte até ficar específica.
- Faça no máximo 5–7 perguntas por rodada para não sobrecarregar.
- Continue perguntando em novas rodadas enquanto houver ambiguidade relevante.
- Só avance para a Etapa 3 quando o usuário confirmar que está satisfeito ou mandar prosseguir.

### Como conduzir a entrevista

1. **Analise a descrição inicial** em `$ARGUMENTS` e identifique o que está claro e o que está em aberto. Para cada categoria abaixo, formule perguntas sobre o que não está explícito:

   **Contexto e motivação**
   - Qual problema do usuário esta feature resolve?
   - Quem vai usar — aluno, instrutor, admin ou todos?
   - Existe alguma feature similar no produto hoje? Como esta se diferencia?

   **Comportamento principal**
   - Qual é o fluxo passo a passo do caminho principal (happy path)?
   - O que acontece quando o usuário completa a ação com sucesso?
   - Há estados intermediários ou etapas que precisam de confirmação?

   **Regras de negócio**
   - Quais restrições ou validações se aplicam?
   - Existe limite de quantidade, tamanho, frequência ou tempo?
   - Há regras diferentes por tipo de usuário (aluno vs. instrutor vs. admin)?
   - O que acontece se uma regra for violada — erro silencioso, mensagem, bloqueio?

   **Fluxos alternativos e erros**
   - O que acontece se o recurso não existir?
   - O que acontece se o usuário não tiver permissão?
   - Alguma ação é irreversível? Há confirmação ou soft delete?

   **Escopo desta entrega**
   - O que está explicitamente fora desta entrega?
   - Há algo que parece óbvio incluir mas que você quer deixar para depois?
   - Existe dependência de outra feature que ainda não está pronta?

   **Integrações e side effects**
   - Alguma ação deve disparar notificação (e-mail, in-app)?
   - Algum dado muda em outro módulo quando esta feature é usada?

2. **Apresente as perguntas** agrupadas por categoria, priorizando as que têm mais impacto no escopo. Formule cada pergunta de forma direta, sem jargão técnico — foque no comportamento do produto.

3. **Espere as respostas** antes de continuar.

4. **Faça rodadas adicionais** se as respostas levantarem novas dúvidas de comportamento. Repita até não restar ambiguidade relevante.

5. **Resuma o entendimento** no final da entrevista antes de escrever o spec:
   > "Entendido. Vou especificar com base em: [lista concisa do que foi acordado]. Posso prosseguir?"

Só avance quando receber confirmação.

---

## Etapa 3 — Escrever spec.md

Com o comportamento e as funcionalidades acordados via entrevista, escreva `specs/<NNN>-<short-name>/spec.md` seguindo a estrutura abaixo. Foque no **O QUÊ** e **POR QUÊ** — nunca em como implementar.

```markdown
# Spec: <Nome da Feature>

## Contexto
<Por que esta feature existe? Qual problema resolve? Qual o valor para o usuário?>

## Atores
<Quais papéis interagem com esta feature? (aluno / instrutor / admin / público)>

## Requisitos funcionais

### P1 — Essencial
- RF01: <requisito testável>
- RF02: ...

### P2 — Importante
- RF03: ...

### P3 — Desejável
- RF04: ...

## Cenários de uso

### Cenário 1: <Nome>
**Ator**: <papel>
**Fluxo principal**:
1. ...
2. ...
**Fluxo alternativo / erro**:
- ...

## Critérios de aceite
- [ ] CA01: <verificável sem detalhes de implementação>
- [ ] CA02: ...

## Fora de escopo
- <o que explicitamente NÃO faz parte desta entrega>

## Dependências
- <outros módulos ou features necessários>
```

**Regras ao preencher**:
- Tudo que está no spec deve ter sido confirmado pelo usuário na entrevista — sem invenção.
- Requisitos devem ser testáveis e unívocos.
- Critérios de aceite devem ser verificáveis por um QA sem conhecer a stack.
- Remova seções que não se aplicam (não deixe "N/A").
- Não inclua detalhes de implementação (frameworks, tabelas, endpoints, nomes de classe).

---

## Etapa 4 — Validar o spec com o usuário

Após escrever o `spec.md`, apresente um resumo das decisões capturadas e pergunte:

> "Aqui está o spec gerado com base na nossa conversa. Alguma coisa está errada, faltando ou diferente do que você esperava?"

Se o usuário apontar correções ou adições, atualize o `spec.md` e repita a validação. Só avance quando o usuário confirmar que o spec está correto.

---

## Etapa 5 — Atualizar documentação arquitetural

Após o spec estar aprovado, verifique se ele introduz algo **não presente** em `docs/architecture/c4.md`:

**Novos atores** (papéis que interagem com o sistema):
- Um papel além de `aluno`, `instrutor`, `admin` (ex: `moderador`, `parceiro`)

**Novos sistemas externos** (integrações fora do Open Class):
- Um serviço de pagamento, CDN, armazenamento em nuvem, provedor de e-mail diferente, etc.

**Como verificar**: leia `docs/architecture/c4.md` e compare com os atores e dependências descritos no spec.

**Se houver novidade**, atualize `docs/architecture/c4.md`:
- Adicione o `Person(...)` ou `System_Ext(...)` correspondente no diagrama de Contexto (Nível 1)
- Adicione a `Rel(...)` descrevendo a interação
- Se o novo elemento também aparece nos níveis Container ou Component, atualize lá também

**Se nada mudou**, pule esta etapa silenciosamente.

---

## Etapa 6 — Atualizar a issue no GitHub

Após o spec estar aprovado, atualize o corpo da issue correspondente com o conteúdo do spec:

```bash
gh issue edit <ISSUE_NUMBER> --body "$(cat specs/<NNN>-<short-name>/spec.md)"
```

- Use o número de issue extraído na Etapa 1.
- Se o comando falhar (ex: `gh` não autenticado, issue não encontrada), avise o usuário mas **não interrompa** — continue para a próxima etapa.

---

## Etapa 7 — Registrar o plano ativo

Após o spec estar aprovado, escreva/atualize `.current-plan.md` na raiz do projeto:

```markdown
# Plano ativo

feature_directory: specs/<NNN>-<short-name>
spec: specs/<NNN>-<short-name>/spec.md
plan:
tasks:
```

Deixe `plan:` e `tasks:` vazios — serão preenchidos por `/oc-plan` e `/oc-tasks`.

---

## Etapa 8 — Reportar

Informe:
- Caminho do spec: `specs/<NNN>-<short-name>/spec.md`
- `.current-plan.md` atualizado
- Próximo passo: `/oc-plan`
