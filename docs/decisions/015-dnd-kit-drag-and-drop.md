# ADR-015 — dnd-kit como biblioteca de drag-and-drop

**Data**: 2026-05-21
**Status**: Aceito
**Decisores**: Leandro Alves

---

## Contexto

A feature de reordenação de seções e aulas exige drag-and-drop com comportamentos não triviais: ghost element customizado que segue o cursor, drop indicator entre itens, estrutura aninhada (seções > aulas) com cross-container move, e coexistência com eventos de click e double-click no mesmo elemento.

## Decisão

Adotar `@dnd-kit/core` + `@dnd-kit/sortable` + `@dnd-kit/utilities` como biblioteca de drag-and-drop.

## Alternativas consideradas

| Opção | Prós | Contras |
|-------|------|---------|
| **dnd-kit** *(escolhida)* | Sem HTML5 drag API (funciona em todos os contextos); `DragOverlay` nativo para ghost customizado; `activationConstraint` resolve conflito click/drag; mantido ativamente; funciona com React StrictMode | Curva de aprendizado ligeiramente maior; API mais verbosa que react-beautiful-dnd |
| react-beautiful-dnd | API declarativa simples; muito documentado | Não mantido desde 2022; não funciona com React 18 StrictMode; sem suporte a `DragOverlay` customizado |
| HTML5 Drag and Drop API (nativa) | Zero dependências | Ghost element nativo não customizável; sem suporte a touch (out-of-scope mas limitante); comportamento inconsistente entre browsers |
| Implementação manual (mousedown + mousemove) | Controle total | Custo de desenvolvimento muito alto; accessibilidade complexa |

## Consequências

**Positivas**:
- Ghost element totalmente customizado via `DragOverlay` (styled-components)
- `PointerSensor` com `distance: 8` permite click e double-click coexistirem com drag sem handle visível
- Cross-container move (aula entre seções) suportado nativamente via `onDragEnd`
- API estável e maintida por Clauderic Dumont (Shopify)

**Negativas / trade-offs**:
- Nova dependência no pacote `apps/ui` (~20kB gzipped)
- Padrão de flat list necessário para `SortableContext` único — aumenta complexidade de `CurriculumPanel`

## Notas de implementação

- Instalar em `apps/ui`: `pnpm add @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities`
- `PointerSensor` com `activationConstraint: { distance: 8 }` — previne ativação de drag em cliques
- `DragOverlay` renderizado dentro do `DndContext` em `CurriculumPanel`
- Flat list `FlatItem[]` derivada do estado `sections` em `CurriculumPanel`
