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

## Etapa 1 — Carregar contexto

1. Leia `.current-plan.md` da raiz do projeto.
2. Obtenha `feature_directory`, `plan` e `tasks`.
3. Leia `plan.md` (arquitetura, data model, contratos).
4. Leia `tasks.md` (lista completa de tarefas).
5. Se disponível, leia `spec.md` (cenários BDD para guiar os testes).

Se `tasks:` estiver vazio em `.current-plan.md`, pare e oriente a rodar `/oc-tasks` primeiro.

---

## Etapa 2 — Classificar as tasks

Antes de começar, classifique cada task pendente em uma de duas categorias:

**Categoria A — TDD aplicável** (red → green → refactor):
- Métodos de service (`<module>.service.ts`)
- Métodos de repository com lógica não-trivial (`<module>.repository.ts`)
- Guards customizados (`*.guard.ts`)
- Qualquer lógica de negócio pura

**Categoria B — Implementação direta** (sem ciclo TDD):
- Schema Drizzle e migrations (infraestrutura)
- DTOs (declarativo, sem lógica)
- Module wiring (DI plumbing)
- Controller (testado indiretamente via service)
- Re-exports e registros em `app.module.ts`

Anote a categoria de cada task ao lado do ID antes de executar.

---

## Etapa 3 — Executar tasks por fase

Execute as fases em ordem. Dentro de uma fase, tasks `[P]` podem ser executadas em paralelo (sem dependência entre si); demais são sequenciais.

### Para tasks Categoria B (implementação direta)

1. Implemente o artefato conforme o `plan.md`
2. Marque a task como `[x]` no `tasks.md`
3. Reporte: `✓ T<NNN> — <descrição>`

### Para tasks Categoria A (ciclo TDD)

Execute o ciclo completo abaixo para cada task:

#### 🔴 RED — Escreva o teste que falha

1. Abra (ou crie) o arquivo de teste: `apps/api/src/<module>/<module>.service.spec.ts`
2. Escreva um `it('should <comportamento esperado>', ...)` que descreva **exatamente** o que o método precisa fazer, derivado do cenário BDD correspondente no `plan.md`.
3. Use o padrão AAA no corpo do teste:
   ```ts
   // Arrange
   // Act
   // Assert
   ```
4. Para dependências externas (repositório, outros services), use mocks com `vi.fn()`:
   ```ts
   const mockRepo = { findById: vi.fn(), create: vi.fn() };
   ```
5. **Confirme que o teste falha** rodando:
   ```bash
   cd apps/api && pnpm vitest run --reporter=verbose 2>&1 | tail -30
   ```
   O teste deve falhar com erro de compilação ou assertion — nunca com erro de import/setup. Se falhar por razão errada, corrija o setup antes de continuar.

#### 🟢 GREEN — Escreva o mínimo para passar

1. Implemente **apenas** o suficiente para o teste passar.
2. Não otimize, não generalize, não trate casos que o teste não cobre ainda.
3. Rode os testes:
   ```bash
   cd apps/api && pnpm vitest run --reporter=verbose 2>&1 | tail -30
   ```
4. Se algum teste existente quebrar (regressão), corrija antes de avançar.
5. O passo só está completo quando **todos os testes passam**.

#### 🔵 REFACTOR — Melhore sem quebrar

1. Revise a implementação com estas perguntas:
   - Há duplicação com outro método?
   - O nome do método/variável está claro?
   - A função tem mais de uma responsabilidade?
   - Há um early return que simplificaria o fluxo?
2. Aplique as melhorias necessárias.
3. Rode os testes novamente para confirmar que continuam passando.
4. Se o refactor revelar a necessidade de mais testes, escreva-os (volta ao RED).

#### Conclusão da task

Marque como `[x]` no `tasks.md` e reporte:
```
✓ T<NNN> 🔴→🟢→🔵 <descrição>
   Teste: <nome do it()>
   Arquivo: apps/api/src/<module>/<module>.service.spec.ts
```

---

## Etapa 4 — Checkpoint de fase

Ao concluir cada fase do `tasks.md`:

1. Rode todos os testes do módulo:
   ```bash
   cd apps/api && pnpm vitest run --reporter=verbose 2>&1 | tail -50
   ```
2. Se houver falhas:
   - Identifique a causa raiz
   - Corrija (voltando ao ciclo RED se necessário)
   - Não avance para a próxima fase com testes quebrando
3. Reporte: `✓ Fase N completa — X testes passando`

---

## Etapa 5 — Regras de parada

Pare e reporte ao usuário se:

- Um teste falha após 2 tentativas de correção (cole a saída do vitest)
- Uma migration falha ao ser aplicada
- Há conflito de tipos entre o schema Drizzle e o que o service espera
- O `plan.md` está ambíguo demais para guiar a implementação de uma task

---

## Etapa 6 — Atualizar Swagger

Após todas as tasks, percorra todos os controllers criados ou modificados nesta feature e garanta que cada endpoint esteja completamente decorado:

### Decorators obrigatórios por controller

```ts
@ApiTags('<resource>')          // no topo da classe
@ApiBearerAuth()                // se o controller usa JwtAuthGuard
@Controller('<resource>')
export class <Module>Controller { ... }
```

### Decorators obrigatórios por endpoint

```ts
@ApiOperation({ summary: '<descrição curta imperativa>' })
@ApiResponse({ status: 201, description: '...', type: <ResponseDto> })
@ApiResponse({ status: 400, description: 'Validation error' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
@ApiResponse({ status: 403, description: 'Forbidden' })    // se tiver RolesGuard
@ApiResponse({ status: 404, description: 'Not found' })    // se buscar por ID
```

### Decorators obrigatórios nos DTOs

Todos os campos dos DTOs que aparecem no body ou response devem ter:

```ts
@ApiProperty({ description: '...', example: '...' })
// ou
@ApiPropertyOptional({ description: '...', example: '...' })  // para campos opcionais
```

### Checklist de revisão Swagger

Para cada controller novo ou modificado, verifique:

- [ ] `@ApiTags` presente na classe
- [ ] `@ApiBearerAuth()` presente se o endpoint exige autenticação
- [ ] Todo `@Post` / `@Put` / `@Patch` tem `@ApiBody` ou DTO decorado
- [ ] Todo endpoint tem ao menos `@ApiOperation` + 1 `@ApiResponse` de sucesso
- [ ] Status codes de erro relevantes documentados (400, 401, 403, 404)
- [ ] Response DTOs têm `@ApiProperty` em todos os campos

Corrija qualquer item ausente antes de prosseguir.

---

## Etapa 7 — Conclusão

Após todas as tasks e Swagger atualizado:

1. Rode a suite completa:
   ```bash
   cd apps/api && pnpm vitest run --reporter=verbose 2>&1
   ```
2. Reporte o resumo:
   - Total de tasks implementadas
   - Total de testes escritos (e passando)
   - Tasks que foram implementação direta (sem TDD)
   - Endpoints documentados no Swagger
   - Qualquer decisão tomada que divergiu do `plan.md`
3. Próximo passo: `/oc-pr`

---

## Referência rápida — Setup de teste NestJS + Vitest

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

  it('should ...', async () => {
    // Arrange
    repo.findById.mockResolvedValue({ id: '1', ... });

    // Act
    const result = await service.findById('1');

    // Assert
    expect(result).toEqual({ id: '1', ... });
  });
});
```
