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

O texto após `/oc-specify` é a descrição da feature. Nunca peça para o usuário repetir.

---

## Contexto do projeto

**open-class** é um LMS (Learning Management System) com:

- **Atores**: `aluno`, `instrutor`, `admin`
- **Módulos existentes**: `auth`, `users`, `courses`, `modules` (módulos de curso), `lessons`, `enrollments`, `categories`, `mail`, `youtube`
- **Stack**: NestJS 11, Drizzle ORM, PostgreSQL, Passport JWT + Google OAuth, Swagger, Vitest
- **Monorepo**: `apps/api/` (NestJS), `apps/ui/` (frontend futuro), `packages/db/` (schemas Drizzle compartilhados)

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

## Etapa 2 — Escrever spec.md

Escreva `specs/<NNN>-<short-name>/spec.md` seguindo a estrutura abaixo. Foque no **O QUÊ** e **POR QUÊ** — nunca em como implementar.

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

## Suposições
- <decisões tomadas sem confirmação explícita>

## Dependências
- <outros módulos ou features necessários>
```

**Regras ao preencher**:
- Máximo 3 marcadores `[NEEDS CLARIFICATION: <pergunta>]` para decisões críticas sem resposta óbvia
- Requisitos devem ser testáveis e unívocos
- Critérios de aceite devem ser verificáveis por um QA sem conhecer a stack
- Remova seções que não se aplicam (não deixe "N/A")

---

## Etapa 3 — Validar e resolver clarificações

Revise o spec contra estes critérios:
- Sem detalhes de implementação (frameworks, tabelas, endpoints)
- Requisitos são testáveis
- Cenários cobrem o fluxo principal e os erros mais prováveis
- Critérios de aceite são mensuráveis

Se houver marcadores `[NEEDS CLARIFICATION]`, apresente ao usuário assim:

```
## Pergunta N: <Tópico>
**Contexto**: <trecho relevante do spec>
**Decisão necessária**: <pergunta>

| Opção | Resposta | Implicação |
|-------|----------|------------|
| A | ... | ... |
| B | ... | ... |

Sua escolha:
```

Aguarde resposta, atualize o spec e re-valide. Repita até o spec estar limpo.

---

## Etapa 4 — Atualizar documentação arquitetural

Após o spec estar limpo, verifique se ele introduz algo **não presente** em `docs/architecture/c4.md`:

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

## Etapa 6 — Registrar o plano ativo

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

## Etapa 7 — Reportar

Informe:
- Caminho do spec: `specs/<NNN>-<short-name>/spec.md`
- `.current-plan.md` atualizado
- Próximo passo: `/oc-plan`
