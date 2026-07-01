---
name: "oc-plan"
description: "Gera o plano de implementação técnico para a feature ativa do open-class, com foco na stack NestJS + Drizzle + PostgreSQL deste projeto. Use sempre que o usuário quiser planejar a implementação de uma feature, decidir a arquitetura, definir o data model ou os contratos de API."
argument-hint: "Orientações opcionais para o planejamento"
user-invocable: true
---

## Entrada do usuário

```text
$ARGUMENTS
```

---

## Etapa 0 — Sincronizar com main

Execute antes de qualquer coisa:

```bash
git fetch origin
git log HEAD..origin/main --oneline
```

Se o comando listar commits (main avançou), **pare e avise**:

> ⚠️ A branch `main` tem N commit(s) que você ainda não tem. Rode `git rebase origin/main` antes de continuar para evitar conflitos no PR.

Se o output estiver vazio, prossiga.

---

## Contexto do projeto

**Estrutura de arquivos** (siga sempre esses padrões):

```
packages/db/src/schema/<entity>.ts      ← Drizzle schema
packages/db/src/schema/index.ts         ← re-exporta todos os schemas
packages/db/drizzle/                    ← migrations geradas pelo drizzle-kit

apps/api/src/<module>/
  <module>.module.ts
  <module>.service.ts
  <module>.controller.ts
  <module>.repository.ts                ← acesso direto ao DB via Drizzle
  dto/
    create-<entity>.dto.ts
    update-<entity>.dto.ts
    <entity>-response.dto.ts

apps/api/src/common/
  guards/roles.guard.ts
  decorators/                           ← @Roles(), @CurrentUser(), etc.
  enums/
```

**Stack**:
- NestJS 11 (módulos com DI, `@Controller`, `@Injectable`)
- Drizzle ORM com PostgreSQL (`pgTable`, `uuid`, `varchar`, `timestamp`, `pgEnum`)
- Swagger via `@nestjs/swagger` (`@ApiTags`, `@ApiOperation`, `@ApiResponse`, `@ApiBearerAuth`)
- Validação via `class-validator` + `class-transformer`
- JWT Guard padrão + `RolesGuard` com `@Roles('aluno' | 'instrutor' | 'admin')`
- Testes unitários com Vitest
- Migrations: `cd packages/db && pnpm drizzle-kit generate && pnpm drizzle-kit migrate`

---

## Etapa 1 — Carregar contexto

1. Leia `.current-plan.md` da raiz do projeto para obter `feature_directory` e `spec`.
2. Leia o `spec.md` da feature.
3. Se `$ARGUMENTS` não estiver vazio, incorpore as orientações ao planejamento.

Se `.current-plan.md` não existir ou `feature_directory` estiver vazio, pare e oriente o usuário a rodar `/oc-specify` primeiro.

---

## Etapa 2 — Interrogatório técnico (OBRIGATÓRIA — não pule)

Antes de escrever qualquer arquivo, você **deve** interrogar o usuário sobre cada decisão técnica aberta, estilo grill-me: percorrendo cada ramo da árvore de decisão, resolvendo as dependências entre decisões uma a uma.

**Regras desta etapa:**
- **Quem decide é o usuário.** Você nunca toma uma decisão técnica ou arquitetural por conta própria — você levanta as opções, recomenda uma, e a escolha final é dele.
- **Uma pergunta por vez.** Nunca despeje uma lista de perguntas. Faça a pergunta, espere a resposta, e só então avance para a próxima.
- **Toda pergunta oferece opções com uma recomendação.** Apresente as abordagens razoáveis com prós e contras, indique qual você recomenda e por quê. Se não houver opções discretas, dê a recomendação e peça uma resposta curta.
- **Respeite as dependências.** Não pergunte sobre um ramo cuja premissa ainda não foi decidida; resolva a decisão-pai primeiro.
- **Se o spec ou o código respondem, não pergunte** — explore `apps/`, `packages/` e `docs/` e traga a resposta você mesmo.
- **Sem teto fixo de perguntas.** Continue enquanto restar incerteza técnica relevante; não force perguntas quando já estiver claro.
- Só avance para a Etapa 3 quando o usuário confirmar que está satisfeito ou mandar prosseguir.

### Como conduzir o interrogatório

1. **Analise o spec** e monte internamente (não exiba) a fila de decisões técnicas abertas nas categorias abaixo, ordenada por dependência e impacto:

   **Data model**
   - Quais entidades novas serão necessárias? Como se relacionam entre si?
   - Campos e tipos: há campos com semântica especial (dinheiro, datas com timezone, soft delete)?
   - Enums: os valores possíveis são fixos ou podem crescer? (impacta pgEnum vs tabela de lookup)
   - Relações: one-to-many, many-to-many? Cascade delete ou soft delete?
   - Índices: quais queries serão mais frequentes?

   **Módulo e arquitetura**
   - O que cabe neste módulo vs. o que é responsabilidade de outro já existente?
   - O service precisará emitir eventos (ex: para o módulo de notificações)?
   - Alguma lógica precisa ser transacional (múltiplas writes atômicas)?

   **Contratos de API**
   - Quais endpoints são necessários (além dos CRUD óbvios)?
   - Paginação, filtros e ordenação — como devem funcionar?
   - Quais roles têm acesso a quais endpoints?
   - Algum endpoint precisa de autorização por ownership (ex: só o dono pode editar)?

   **Integrações e serviços externos**
   - A feature depende de algum serviço externo (storage, e-mail, pagamento)?
   - Há side effects esperados ao criar/atualizar/deletar (ex: enviar e-mail, invalidar cache)?

   **Decisões de implementação**
   - Há lógica de negócio complexa que merece um padrão específico (strategy, policy, domain service)?
   - Uploads de arquivos? Qual provedor e como validar tamanho/tipo?

2. **Faça uma pergunta por vez**, neste formato:

   ```
   **Pergunta N** — <categoria>: <pergunta>

   **Recomendação**: Opção <X> — <razão em 1–2 frases>

   | Opção | Abordagem | Prós | Contras |
   |-------|-----------|------|---------|
   | A     | ...       | ...  | ...     |
   | B     | ...       | ...  | ...     |

   Responda com a letra, "sim" para aceitar a recomendação, ou descreva sua própria abordagem.
   ```

3. **Espere a resposta** e registre a decisão em memória de trabalho; **não escreva em disco ainda**. Reavalie a fila — a resposta pode abrir ou fechar ramos — e avance para a próxima decisão pendente.

4. **Encerre** quando não restar incerteza técnica relevante ou o usuário mandar prosseguir. Então **resuma o entendimento** antes de escrever o plano:
   > "Entendido. Vou planejar com base em: [lista das decisões tomadas]. Posso prosseguir?"

Só avance quando receber confirmação.

---

## Etapa 3 — Escrever plan.md

Com todas as decisões técnicas resolvidas via entrevista, crie `<feature_directory>/plan.md`:

```markdown
# Plano: <Nome da Feature>

## Stack e decisões técnicas
<Quais bibliotecas, padrões e abordagens serão usados. Justifique cada escolha com base nas respostas da entrevista.>

## Data model

### Entidades novas
Para cada entidade nova, descreva:
- **Tabela**: `<nome_tabela>`
- **Arquivo schema**: `packages/db/src/schema/<entity>.ts`
- **Campos**: nome, tipo Drizzle, constraints
- **Relações**: foreign keys, enums necessários

### Entidades modificadas
<Quais tabelas/schemas existentes precisam de alteração e por quê.>

### Enums novos
<pgEnum necessários com seus valores.>

## Módulo NestJS

### Módulo: `apps/api/src/<module>/`
- **Responsabilidade**: <o que este módulo faz>
- **Importa de**: <outros módulos NestJS necessários>
- **Exporta**: <services expostos para outros módulos>

## Contratos de API

Para cada endpoint:

| Método | Rota | Guard | Roles | Descrição |
|--------|------|-------|-------|-----------|
| POST | `/api/<resource>` | JWT | instrutor | ... |
| GET | `/api/<resource>/:id` | JWT | aluno, instrutor | ... |

### DTOs necessários
- `Create<Entity>Dto` — campos obrigatórios/opcionais
- `Update<Entity>Dto` — campos parcialmente atualizáveis
- `<Entity>ResponseDto` — shape do retorno

## Cenários de teste (BDD)

Para cada método de service ou comportamento relevante, descreva um cenário no formato Gherkin.
Estes cenários guiarão diretamente o passo RED do `/oc-implement`.

Use a estrutura:

```
Scenario: <nome descritivo do comportamento>
  Given <estado inicial / pré-condição>
  When  <ação executada>
  Then  <resultado esperado>
  And   <resultado adicional, se houver>
```

Organize por método/responsabilidade:

### `<Module>Service.<methodName>()`

```
Scenario: <caminho feliz>
  Given ...
  When  ...
  Then  ...

Scenario: <caso de erro / edge case>
  Given ...
  When  ...
  Then  ...
```

Inclua cenários para:
- Caminho feliz (happy path)
- Recurso não encontrado (404)
- Permissão negada (403)
- Dados inválidos (400)
- Qualquer regra de negócio não-trivial do spec

## Fluxo de implementação

### Fase 1 — Schema e migração
1. Criar/atualizar schema em `packages/db/src/schema/`
2. Re-exportar de `packages/db/src/schema/index.ts`
3. Gerar e aplicar migration

### Fase 2 — Módulo base
1. Repository (queries Drizzle)
2. Service (lógica de negócio, guiado pelos cenários BDD acima)
3. Module (DI wiring)

### Fase 3 — API
1. DTOs com validações
2. Controller com decorators Swagger
3. Guards e roles

## Riscos e decisões pendentes
<Qualquer incerteza que pode impactar a implementação.>
```

---

## Etapa 4 — Registrar decisões arquiteturais

Após escrever o `plan.md`, identifique se ele contém decisões que merecem um ADR.

### O que qualifica como decisão arquitetural

Uma decisão merece ADR quando envolve **trade-off com consequências duradouras**:

| Qualifica ✓ | Não qualifica ✗ |
|-------------|-----------------|
| Nova biblioteca ou tecnologia não usada antes no projeto | CRUD padrão em módulo existente |
| Nova integração com sistema externo | Novo endpoint em módulo já documentado |
| Mudança de padrão de acesso a dados | DTO novo sem impacto estrutural |
| Nova estratégia de autenticação/autorização | Adição de campo em tabela existente |
| Decisão de escopo que impacta vários módulos | Refactor interno sem mudança de contrato |
| Escolha entre abordagens incompatíveis | |

### Como verificar se já existe ADR

Leia `docs/decisions/README.md`. Se a decisão que o plano toma já está documentada num ADR existente com status **Aceito**, não crie duplicata — apenas mencione o ADR relevante no `plan.md`.

### Para cada decisão nova, crie um ADR

1. **Determine o próximo número**: leia o índice em `docs/decisions/README.md` e use o próximo inteiro disponível (`NNN`).

2. **Crie `docs/decisions/NNN-titulo-kebab-case.md`** com o template MADR:

```markdown
# ADR-NNN — <Título curto da decisão>

**Data**: <YYYY-MM-DD de hoje>
**Status**: Aceito
**Decisores**: Leandro Alves

---

## Contexto

<Por que esta decisão foi necessária? Qual problema ou restrição motivou a escolha?>

## Decisão

<O que foi decidido, em uma frase direta.>

## Alternativas consideradas

| Opção | Prós | Contras |
|-------|------|---------|
| **<escolhida>** *(escolhida)* | ... | ... |
| <alternativa 1> | ... | ... |
| <alternativa 2> | ... | ... |

## Consequências

**Positivas**:
- ...

**Negativas / trade-offs**:
- ...

## Notas de implementação

<Detalhes relevantes para quem for implementar, se houver.>
```

3. **Atualize o índice** em `docs/decisions/README.md`: adicione uma linha na tabela com `ADR-NNN`, título, status **Aceito** e a data de hoje.

4. Se a decisão introduzir um **novo container ou componente** no sistema (ex: novo serviço externo, novo processo, nova camada de infra), atualize `docs/architecture/c4.md` no nível adequado (Container ou Component).

### Se nenhuma decisão nova for encontrada

Pule esta etapa silenciosamente.

---

## Etapa 5 — Atualizar `.current-plan.md`

Atualize o campo `plan:` em `.current-plan.md`:

```markdown
# Plano ativo

feature_directory: specs/<NNN>-<short-name>
spec: specs/<NNN>-<short-name>/spec.md
plan: specs/<NNN>-<short-name>/plan.md
tasks:
```

---

## Etapa 6 — Reportar

Informe:
- Caminho do plan: `<feature_directory>/plan.md`
- Entidades que serão criadas/modificadas
- Endpoints planejados
- ADRs criados (se houver): `docs/decisions/NNN-*.md`
- Diagrama C4 atualizado (se houver)
- `.current-plan.md` atualizado
- Próximo passo: `/oc-tasks`
