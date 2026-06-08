# ADR-023 — Configuração white-label carregada no root layout e distribuída via context

**Data**: 2026-06-02
**Status**: Aceito
**Decisores**: Leandro Alves

---

## Contexto

A feature white-label (issue #26) torna editáveis pelo admin o nome/título da
plataforma, o logo e os textos de destaque do catálogo e do login. Esses valores são
**públicos** (visíveis sem autenticação) e aparecem em vários pontos: cabeçalho do
catálogo, menu lateral, hero do login, hero do catálogo e no título da aba do navegador
(`<title>`).

Era preciso decidir **onde** buscar a config e **como** distribuí-la para os componentes
— sem espalhar chamadas de fetch por cada tela e sem prop drilling profundo, respeitando
a renderização híbrida do projeto (Server Components + Client Components, ADR-012).

## Decisão

A configuração da plataforma é buscada **uma vez, server-side, no root layout**
(`app/layout.tsx`) e distribuída a todos os Client Components via um
`PlatformConfigProvider` (React context). O título da aba é gerado por
`generateMetadata()` no mesmo layout, a partir do `platformName`. A leitura usa
`fetch` com `revalidate: 60` (ISR), pois a config é pública e muda com baixa frequência.

## Alternativas consideradas

| Opção | Prós | Contras |
|-------|------|---------|
| **Fetch no root layout + context** *(escolhida)* | Uma única busca; valores disponíveis para todas as telas; metadata dinâmica trivial; sem prop drilling | Context exige client boundary; revalidação tem latência (~60s) |
| Fetch por página (catálogo, login, etc.) | Isolamento por rota | Duplicação de fetch e de lógica; risco de divergência entre telas |
| Endpoint público + fetch client em cada componente | Sempre fresco | N requisições por página; flicker; ruim para SSR/SEO do título |

## Consequências

**Positivas**:
- Marca consistente em todas as telas a partir de uma única fonte.
- Título da aba (`<title>`) reflete o nome configurado sem JavaScript no cliente.
- Custo de rede mínimo graças ao cache ISR.

**Negativas / trade-offs**:
- Alterações salvas pelo admin propagam para visitantes em até ~60s (janela de
  revalidação), salvo revalidação explícita por rota.
- Introduz um provider client no topo da árvore, exigindo cuidado com o boundary
  Server/Client.

## Notas de implementação

- `fetchPlatformConfig()` vive em `apps/ui/src/lib/platform-config.ts` e é reutilizada
  pela tela de admin (leitura/escrita).
- O provider injeta os valores resolvidos (já com defaults aplicados pela API), então os
  componentes nunca precisam conhecer os valores padrão.
- A tela de admin (`/admin/configuracoes`) é protegida por papel admin no layout, no
  mesmo padrão de `instructor/layout.tsx`.
