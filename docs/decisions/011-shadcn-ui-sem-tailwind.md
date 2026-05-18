# ADR-011 — shadcn/ui com styled-components, sem Tailwind CSS

**Data**: 2026-05-17  
**Status**: Aceito  
**Decisores**: Leandro Alves

---

## Contexto

O design system do Open Class usa shadcn/ui como biblioteca de componentes primitivos e styled-components como engine de estilos. shadcn/ui foi projetado para funcionar com Tailwind CSS — seus componentes gerados usam classes utilitárias Tailwind para toda a estilização. A equipe decidiu explicitamente não usar Tailwind (ver requisito FR-06 do spec), pois prefere co-localização de estilos via CSS-in-JS e um sistema de tokens baseado em CSS custom properties.

---

## Decisão

Usar shadcn/ui **exclusivamente como gerador de código** (componentes Radix UI pré-compostos), removendo todas as dependências Tailwind dos componentes gerados e reescrevendo sua estilização com styled-components que consomem CSS variables.

---

## Alternativas consideradas

| Opção | Prós | Contras |
|-------|------|---------|
| **shadcn/ui + restyle com styled-components** *(escolhida)* | Aproveita os primitivos Radix UI acessíveis; mantém shadcn/ui como referência de componentes; CSS variables funcionam independentemente do Tailwind | Trabalho manual para remover classes Tailwind; risco de divergência com futuras atualizações do shadcn/ui |
| shadcn/ui + Tailwind (padrão) | Zero configuração extra; atualizações triviais | Viola o requisito explícito de não usar Tailwind; conflito com styled-components em runtime |
| Radix UI puro (sem shadcn/ui) | Controle total desde o início; sem classes Tailwind para remover | Mais trabalho de scaffolding; perde os padrões de composição e acessibilidade já resolvidos pelo shadcn/ui |
| Headless UI + styled-components | Boa integração com CSS-in-JS; bem documentado | Menor variedade de primitivos que o Radix UI; shadcn/ui é o padrão do projeto |

---

## Consequências

**Positivas**:
- Componentes acessíveis (Radix UI) sem Tailwind em runtime.
- Sistema de tokens via CSS custom properties é o único contrato de estilo — consistente com styled-components.
- Sem conflito de duas engine de CSS em runtime.

**Negativas / trade-offs**:
- Atualizações do shadcn/ui exigem re-aplicação manual do restyle (os componentes são "owned" — esperado pelo design do shadcn/ui).
- CLI do shadcn/ui pode reclamar da ausência do Tailwind; contornar com configuração manual do `components.json`.
- Desenvolvedores familiarizados com shadcn/ui padrão encontrarão componentes sem as classes Tailwind esperadas.

---

## Notas de implementação

- Instalar dependências Radix UI individualmente conforme cada componente for adicionado (o CLI do shadcn/ui faz isso automaticamente).
- Manter `components.json` com `"style": "default"` e `"rsc": false` para todos os componentes UI.
- O utilitário `cn()` em `src/lib/utils.ts` usa apenas `clsx` — **sem** `tailwind-merge`, que é desnecessário sem Tailwind.
- Cada componente em `src/components/ui/` deve ter `"use client"` no topo (styled-components é incompatível com RSC).
