# ADR-013 — Proteção de rotas privadas via Next.js middleware

**Data**: 2026-05-18
**Status**: Aceito
**Decisores**: Leandro Alves

---

## Contexto

A partir da Fase 4 (UI), o frontend Next.js precisa proteger rotas privadas (ex: `/aprendizado`) de acesso não autenticado. O projeto já usa JWT em cookie httpOnly `access_token` (ADR-003). A questão é como aplicar esse guard no lado do cliente/servidor Next.js sem duplicar lógica de autenticação.

## Decisão

Usar `middleware.ts` na raiz de `apps/ui/src/` para interceptar requests a rotas protegidas, verificar a **presença** do cookie `access_token` e redirecionar para `/login` se ausente. O middleware **não valida** a assinatura do JWT — isso é responsabilidade da API ao processar cada request.

## Alternativas consideradas

| Opção | Prós | Contras |
|-------|------|---------|
| **middleware.ts com verificação de presença** *(escolhida)* | Simples, zero dependências, sem segredo JWT na UI | Não detecta tokens expirados até a API retornar 401 |
| middleware.ts com `jose` (verificação de assinatura) | Detecta expiração no edge | Requer o `JWT_SECRET` na UI; acoplamento; mais complexidade |
| Proteção apenas no Server Component (redirect dentro da página) | Sem middleware extra | Renderiza a página antes de redirecionar; experiência ruim |
| Client Component com `useEffect` + redirect | Flexível | Flash de conteúdo não autenticado; ruim para SEO |

## Consequências

**Positivas**:
- Proteção de rota funciona no Edge Runtime — rápido, sem cold start.
- Não há necessidade de expor `JWT_SECRET` à UI.
- Padrão recomendado pela documentação oficial do Next.js App Router.

**Negativas / trade-offs**:
- Tokens expirados passam pelo middleware e chegam ao Server Component; o Server Component precisa tratar o `401` da API e redirecionar manualmente.
- Se o token for inválido mas presente, o middleware não bloqueia — a API é a última linha de defesa.

## Notas de implementação

- Arquivo: `apps/ui/src/middleware.ts`
- `matcher` deve incluir todos os caminhos privados: `/aprendizado`, `/curso/:path*/aula/:lessonId`, etc.
- Nas páginas protegidas, tratar respostas `401` da API redirecionando para `/login` via `redirect()` do Next.js.
- O `access_token` é httpOnly e não pode ser lido por JavaScript do lado do cliente — o middleware roda no servidor (Edge) e tem acesso.
