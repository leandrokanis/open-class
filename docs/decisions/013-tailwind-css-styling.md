# ADR-013 — Tailwind CSS para estilização da UI

**Data**: 2026-05-17
**Status**: Aceito
**Decisores**: Leandro Alves

---

## Contexto

Com o início da Fase 4 (UI), precisávamos definir a abordagem de estilização. O design no Paper usa um sistema de cores azul-escuro (#1e2d5a área do hero), tipografia Inter, espaçamentos padronizados e layout responsivo mobile-first. O projeto precisa ser facilmente customizável para white-label.

## Decisão

Usar Tailwind CSS v4 como sistema de estilização principal.

## Alternativas consideradas

| Opção | Prós | Contras |
|-------|------|---------|
| **Tailwind CSS v4** *(escolhida)* | Mobile-first, utilitário, sem runtime, customizável via CSS vars, zero abstração | Verbosidade nas classes; curva inicial |
| CSS Modules | Isolamento local, familiar | Boilerplate, sem design system embutido |
| Styled Components / Emotion | CSS-in-JS dinâmico | Runtime overhead; complexidade de SSR |
| Shadcn/UI | Componentes prontos acessíveis | Opinativo; dificulta white-label fino |

## Consequências

**Positivas**:
- Mobile-first por padrão (`md:`, `lg:` prefixos) facilita o layout responsivo do design
- Customização de cores/fontes via `@theme` em CSS — ideal para white-label
- Zero runtime: todo CSS gerado em build time
- Integra nativamente com Vite

**Negativas / trade-offs**:
- Classes longas em JSX — mitigado extraindo variantes com `clsx`/`cva`
- Tailwind v4 ainda em estabilização (API de configuração via CSS em vez de `tailwind.config.js`)

## Notas de implementação

Definir design tokens em `apps/ui/src/index.css` via `@theme`:
- `--color-primary: #1e2d5a` (hero background)
- `--color-accent: #3b4fd8` (botões)
- `--font-sans: Inter, system-ui, sans-serif`
