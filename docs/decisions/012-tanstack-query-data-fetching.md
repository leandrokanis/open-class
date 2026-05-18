# ADR-012 — TanStack Query para data fetching no frontend

**Data**: 2026-05-17
**Status**: Aceito
**Decisores**: Leandro Alves

---

## Contexto

A página de detalhes do curso precisa carregar até 3 chamadas de API em paralelo (dados do curso, progresso, última aula acessada), tratar estados de loading/error e lidar com usuários autenticados vs. anônimos. Precisávamos de uma abordagem de data fetching que simplificasse isso sem adicionar complexidade desnecessária.

## Decisão

Usar TanStack Query v5 (`@tanstack/react-query`) como camada de data fetching e cache no frontend.

## Alternativas consideradas

| Opção | Prós | Contras |
|-------|------|---------|
| **TanStack Query v5** *(escolhida)* | Cache automático, parallel queries, error/loading states, retry, stale-while-revalidate | Adiciona dependência |
| SWR | Simples, menor bundle | Menos features que TanStack Query |
| useEffect + useState manual | Sem dependência extra | Boilerplate, sem cache, difícil de testar |
| Redux Toolkit Query | Integra com Redux | Redux é overkill para este projeto |

## Consequências

**Positivas**:
- Parallel queries com `useQueries` para carregar dados do curso + progresso simultaneamente
- Cache evita re-fetch desnecessário ao navegar entre páginas
- `enabled: false` desabilita queries de progresso para visitantes não autenticados
- Fácil de testar com `QueryClient` em ambiente de teste

**Negativas / trade-offs**:
- Adiciona ~13KB ao bundle (gzip)
- Requer `QueryClientProvider` no root da aplicação

## Notas de implementação

Configurar `QueryClient` com `staleTime: 5 * 60 * 1000` (5 minutos) para dados de catálogo.
Queries de progresso com `retry: false` para tratar 401/403 silenciosamente.
