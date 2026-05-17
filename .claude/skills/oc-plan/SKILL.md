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

## Etapa 2 — Escrever plan.md

Crie `<feature_directory>/plan.md` com a estrutura abaixo:

```markdown
# Plano: <Nome da Feature>

## Stack e decisões técnicas
<Quais bibliotecas, padrões e abordagens serão usados. Justifique escolhas não-óbvias.>

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

## Etapa 3 — Registrar decisões arquiteturais

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

## Etapa 4 — Atualizar `.current-plan.md`

Atualize o campo `plan:` em `.current-plan.md`:

```markdown
# Plano ativo

feature_directory: specs/<NNN>-<short-name>
spec: specs/<NNN>-<short-name>/spec.md
plan: specs/<NNN>-<short-name>/plan.md
tasks:
```

---

## Etapa 5 — Reportar

Informe:
- Caminho do plan: `<feature_directory>/plan.md`
- Entidades que serão criadas/modificadas
- Endpoints planejados
- ADRs criados (se houver): `docs/decisions/NNN-*.md`
- Diagrama C4 atualizado (se houver)
- `.current-plan.md` atualizado
- Próximo passo: `/oc-tasks`
