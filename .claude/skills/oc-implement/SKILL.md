---
name: "oc-implement"
description: "Implementa a feature ativa do open-class usando TDD estrito (red → green → refactor). Para cada tarefa de lógica, escreve o teste que falha primeiro, depois o código mínimo para passar, depois refatora. Use sempre que o usuário quiser implementar uma feature, executar as tasks, fazer TDD ou desenvolver com testes guiando a implementação."
argument-hint: "Filtro opcional de tasks (ex: 'só fase 2', 'a partir de T005')"
user-invocable: true
---

## Entrada do usuário

```text
$ARGUMENTS
```

Se fornecido, use como filtro de quais tasks executar.

---

## Filosofia (leia antes de começar)

**Princípio central**: testes verificam comportamento através de interfaces públicas, não detalhes de implementação. O código pode mudar completamente; os testes não devem.

**Bons testes** exercitam caminhos reais pelo código através de APIs públicas. Descrevem _o que_ o sistema faz, não _como_ faz. Um bom teste lê como uma especificação — "usuário pode se matricular em curso gratuito" diz exatamente que capacidade existe. Esses testes sobrevivem a refactors porque não se importam com estrutura interna.

**Maus testes** estão acoplados à implementação: mockam colaboradores internos, testam métodos privados ou verificam via meios externos (como consultar o banco diretamente em vez de usar a interface). Sinal de alerta: o teste quebra quando você refatora, mas o comportamento não mudou.

**Anti-padrão — slices horizontais**: NÃO escreva todos os testes primeiro e depois toda a implementação. Isso produz testes ruins — escritos em massa, testam comportamento _imaginado_, e ficam insensíveis a mudanças reais.

```
ERRADO (horizontal):
  RED:   test1, test2, test3, test4, test5
  GREEN: impl1, impl2, impl3, impl4, impl5

CERTO (vertical — tracer bullet):
  RED→GREEN: test1→impl1
  RED→GREEN: test2→impl2
  RED→GREEN: test3→impl3
  ...
```

---

## Etapa 0 — Sincronizar com main

```bash
git fetch origin
git log HEAD..origin/main --oneline
```

Se o comando listar commits (main avançou), **pare e avise**:

> ⚠️ A branch `main` tem N commit(s) que você ainda não tem. Rode `git rebase origin/main` antes de continuar para evitar conflitos no PR.

---

## Etapa 1 — Carregar contexto

1. Leia `.current-plan.md` da raiz do projeto.
2. Obtenha `feature_directory`, `plan` e `tasks`.
3. Leia `plan.md` — arquitetura, data model, contratos, cenários BDD.
4. Leia `tasks.md` — lista completa de tarefas.
5. Leia `spec.md` — comportamentos esperados, critérios de aceite.

Se `tasks:` estiver vazio em `.current-plan.md`, pare e oriente a rodar `/oc-tasks` primeiro.

---

## Etapa 2 — Planejar com o usuário (OBRIGATÓRIO antes de escrever código)

Antes de planejar, ancore-se na linguagem do projeto: consulte o **Glossário** (seção 14 do `docs/prd.md`) para que nomes de teste e vocabulário das interfaces usem os termos do domínio, e **respeite os ADRs** relevantes em `docs/decisions/` da área que você vai tocar — não contrarie uma decisão aceita.

Depois confirme com o usuário:

1. **Quais comportamentos testar**: com base nos cenários BDD do `plan.md` e critérios de aceite do `spec.md`, liste os comportamentos que vão virar testes. **Você não consegue testar tudo** — confirme com o usuário exatamente quais comportamentos importam mais e concentre o esforço em caminhos críticos e lógica complexa, não em todo edge case imaginável. Pergunte se a lista está correta ou se algo deve ser priorizado/ignorado.

2. **Como serão as interfaces públicas**: para cada service ou guard que receberá testes, mostre como você imagina a assinatura dos métodos e pergunte se está alinhado. Projete para **testabilidade** e prefira **módulos profundos** — interface pequena e simples escondendo implementação rica — em vez de espalhar complexidade por muitos métodos rasos que vazam detalhes.

3. **Estratégia de mock**: identifique as dependências externas (repositórios, outros services, clientes HTTP) e confirme quais devem ser mockadas — apenas as que cruzam fronteiras reais (banco, rede, filesystem). Nunca mock colaboradores internos do mesmo módulo.

Só avance quando o usuário confirmar o plano.

---

## Etapa 3 — Classificar as tasks

Classifique cada task pendente em uma categoria:

**Categoria A — ciclo TDD** (red → green → refactor):
- Métodos de service (`<module>.service.ts`)
- Métodos de repository com lógica não-trivial
- Guards customizados (`*.guard.ts`)
- Qualquer lógica de negócio pura

**Categoria B — implementação direta** (sem ciclo TDD):
- Schema Drizzle e migrations (infraestrutura declarativa)
- DTOs (declarativo, sem lógica)
- Module wiring (DI plumbing)
- Controller (testado indiretamente via service)
- Re-exports e registros em `app.module.ts`

Anote a categoria de cada task antes de executar.

---

## Etapa 4 — Executar tasks por fase

Execute as fases em ordem. Dentro de cada fase, as tasks sem dependência entre si podem ser paralelizadas.

### Categoria B — implementação direta

1. Implemente o artefato conforme o `plan.md`.
2. Marque como `[x]` no `tasks.md`.
3. Reporte: `✓ T<NNN> — <descrição>`

### Categoria A — ciclo TDD (tracer bullet + loop incremental)

#### Tracer bullet — primeiro comportamento

Antes do loop completo, escreva UM teste para UM comportamento central — o suficiente para provar que o caminho funciona de ponta a ponta. Só então expanda para os demais comportamentos.

#### Loop incremental — um comportamento por vez

Para cada comportamento (derivado dos cenários BDD do `plan.md`):

---

##### 🔴 RED — escreva o teste que falha

1. Abra (ou crie) `apps/api/src/<module>/<module>.service.spec.ts`.
2. Escreva **um** `it('should <comportamento>', ...)` que descreva o que o método precisa fazer — linguagem de comportamento, não de implementação.
3. Padrão AAA:
   ```ts
   // Arrange
   // Act
   // Assert
   ```
4. Mock apenas dependências que cruzam fronteiras reais:
   ```ts
   const mockRepo = { findById: vi.fn(), create: vi.fn() };
   ```
5. Confirme que o teste **falha pelo motivo certo**:
   ```bash
   cd apps/api && pnpm vitest run --reporter=verbose 2>&1 | tail -30
   ```
   - Falha de assertion → correto, avance.
   - Falha de import/setup → corrija o setup antes de continuar.
   - Passa de cara → o teste não está verificando nada; reescreva.

Checklist antes de avançar:
- [ ] O teste descreve comportamento, não implementação
- [ ] O teste usa apenas a interface pública
- [ ] O teste sobreviveria a um refactor interno

---

##### 🟢 GREEN — código mínimo para passar

1. Escreva **apenas** o suficiente para o teste passar.
2. Não otimize, não generalize, não trate casos que o teste não cobre ainda.
3. Rode os testes:
   ```bash
   cd apps/api && pnpm vitest run --reporter=verbose 2>&1 | tail -30
   ```
4. Se algum teste existente quebrar (regressão), corrija antes de avançar.
5. O passo só está completo quando **todos os testes passam**.

> **Nunca refatore enquanto estiver no RED.** Chegue ao GREEN primeiro.

---

##### 🔵 REFACTOR — melhore sem quebrar

Só refatore depois de estar no GREEN. Perguntas para guiar:

- Há duplicação com outro método? (extraia)
- Dá para **aprofundar o módulo** — mover complexidade para trás de uma interface simples?
- Algum princípio SOLID se aplica **naturalmente** aqui (sem over-engineering)?
- O nome do método/variável comunica a intenção (usando o vocabulário do glossário)?
- A função tem mais de uma responsabilidade?
- Um early return simplificaria o fluxo?
- O que esse código revela sobre o código existente?

Aplique as melhorias e rode os testes após cada mudança. Se o refactor revelar a necessidade de mais testes, volte ao RED.

---

##### Conclusão do comportamento

Só avance para o próximo comportamento quando RED→GREEN→REFACTOR estiver completo.

#### Conclusão da task

Marque como `[x]` no `tasks.md` e reporte:
```
✓ T<NNN> 🔴→🟢→🔵 <descrição>
   Comportamentos testados: <lista dos it()>
   Arquivo: apps/api/src/<module>/<module>.service.spec.ts
```

---

## Etapa 5 — Checkpoint de fase

Ao concluir cada fase do `tasks.md`:

1. Rode todos os testes do módulo:
   ```bash
   cd apps/api && pnpm vitest run --reporter=verbose 2>&1 | tail -50
   ```
2. Se houver falhas: identifique a causa raiz, corrija (voltando ao ciclo RED se necessário). Não avance com testes quebrando.
3. Reporte: `✓ Fase N completa — X testes passando`

---

## Etapa 6 — Regras de parada

Pare e reporte ao usuário se:

- Um teste falha após 2 tentativas de correção — cole a saída do vitest.
- Uma migration falha ao ser aplicada.
- Há conflito de tipos entre o schema Drizzle e o que o service espera.
- O `plan.md` está ambíguo demais para guiar a implementação de uma task.

---

## Etapa 7 — Atualizar Swagger

Após todas as tasks, percorra todos os controllers criados ou modificados e garanta que cada endpoint esteja completamente decorado:

### Na classe

```ts
@ApiTags('<resource>')
@ApiBearerAuth()          // se usa JwtAuthGuard
@Controller('<resource>')
export class <Module>Controller { ... }
```

### Em cada endpoint

```ts
@ApiOperation({ summary: '<descrição curta imperativa>' })
@ApiResponse({ status: 201, description: '...', type: <ResponseDto> })
@ApiResponse({ status: 400, description: 'Validation error' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
@ApiResponse({ status: 403, description: 'Forbidden' })    // se tiver RolesGuard
@ApiResponse({ status: 404, description: 'Not found' })    // se buscar por ID
```

### Nos DTOs

```ts
@ApiProperty({ description: '...', example: '...' })
@ApiPropertyOptional({ description: '...', example: '...' })  // campos opcionais
```

### Checklist

- [ ] `@ApiTags` na classe
- [ ] `@ApiBearerAuth()` se o endpoint exige autenticação
- [ ] Todo `@Post`/`@Put`/`@Patch` tem DTO decorado
- [ ] Todo endpoint tem `@ApiOperation` + ao menos 1 `@ApiResponse` de sucesso
- [ ] Status codes de erro relevantes documentados
- [ ] Campos dos response DTOs têm `@ApiProperty`

---

## Etapa 8 — Conclusão

1. Rode a suite completa:
   ```bash
   cd apps/api && pnpm vitest run --reporter=verbose 2>&1
   ```
2. Reporte:
   - Total de tasks implementadas
   - Total de testes escritos (e passando)
   - Tasks de implementação direta (sem TDD)
   - Endpoints documentados no Swagger
   - Qualquer desvio do `plan.md` e o motivo
3. Próximo passo: `/oc-pr`

---

## Referência — Setup de teste NestJS + Vitest

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test } from '@nestjs/testing';
import { <Module>Service } from './<module>.service';
import { <Module>Repository } from './<module>.repository';

describe('<Module>Service', () => {
  let service: <Module>Service;
  let repo: { [K in keyof <Module>Repository]: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    repo = { findById: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn() };

    const module = await Test.createTestingModule({
      providers: [
        <Module>Service,
        { provide: <Module>Repository, useValue: repo },
      ],
    }).compile();

    service = module.get(<Module>Service);
  });

  it('should <comportamento>', async () => {
    // Arrange
    repo.findById.mockResolvedValue({ id: '1', ... });

    // Act
    const result = await service.findById('1');

    // Assert
    expect(result).toEqual({ id: '1', ... });
  });
});
```
