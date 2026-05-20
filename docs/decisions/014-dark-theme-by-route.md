# ADR-014 — Tema escuro por rota via `data-theme` no layout

**Data**: 2026-05-19
**Status**: Aceito
**Decisores**: Leandro Alves

---

## Contexto

O design do Open Class define que a página de player de aula usa tema escuro (dark), enquanto todas as demais páginas usam tema claro (light). O `ThemeProvider` existente gerencia o tema via `localStorage` e aplica `data-theme` em `document.documentElement` — um estado global que afeta toda a aplicação.

Aplicar o tema escuro apenas na rota do player sem contaminar o restante da aplicação exige uma estratégia que:
1. Não dependa do toggle do usuário.
2. Não afete as demais páginas ao navegar de volta.
3. Seja compatível com o padrão de CSS custom properties já em uso (`[data-theme="dark"]` em `globals.css`).

## Decisão

O `layout.tsx` da rota `/curso/[slug]/aula/[lessonId]/` envolve seu conteúdo em um `<div data-theme="dark">` que serve de root local para as custom properties do tema escuro. O `ThemeProvider` global e o `document.documentElement` **não são tocados** — o tema escuro é escopo ao subtree do layout.

## Alternativas consideradas

| Opção | Prós | Contras |
|-------|------|---------|
| **`data-theme="dark"` no wrapper do layout** *(escolhida)* | Isolado ao subtree; sem efeito colateral global; compatível com o sistema de tokens existente; sem JS extra | Requer que todos os tokens CSS estejam declarados em `[data-theme="dark"]` (já estão em `globals.css`) |
| Modificar `ThemeProvider` para aceitar tema forçado por prop | Flexível | Exige refactor do ThemeProvider; risco de regressão em outras páginas |
| Classe CSS `.dark` no wrapper + variáveis duplicadas | Funciona sem mudar o ThemeProvider | Duplicação: exigiria um segundo seletor `.dark` além de `[data-theme="dark"]` |
| Usar `useEffect` para setar `document.documentElement` na montagem e reverter na desmontagem | Simples de implementar | Flash de tema errado no SSR; risco de não reverter corretamente ao navegar; efeito colateral global |

## Consequências

**Positivas**:
- Zero alteração no `ThemeProvider` global — sem risco de regressão.
- Funciona em SSR sem flash (o atributo é renderizado no servidor junto com o layout).
- Extensível: qualquer futura página que precise de tema específico usa o mesmo padrão.
- Compatível com o sistema de tokens já documentado em `globals.css`.

**Negativas / trade-offs**:
- Todos os componentes estilizados com `tokens.*` dentro da rota do player consomem os valores dark, como esperado. Componentes que por engano usarem valores hardcoded (não via CSS variables) não serão afetados pelo tema — bug potencial que não é detectado automaticamente.
- Se o usuário tiver selecionado tema dark manualmente (via ThemeProvider), o wrapper `data-theme="dark"` será redundante mas inofensivo.

## Notas de implementação

- O wrapper deve ser um `div` com `data-theme="dark"` e `min-height: 100vh` para cobrir toda a viewport.
- O `layout.tsx` é um Server Component — sem `"use client"` necessário, pois não há lógica de tema em runtime.
- Não adicionar `color-scheme: dark` ao wrapper via styled-components — já está coberto pela regra `[data-theme="dark"] { color-scheme: dark }` em `globals.css`.
