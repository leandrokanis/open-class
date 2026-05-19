# ADR-012 — Renderização híbrida: Server Components para dados públicos, Client Components para dados autenticados

**Data**: 2026-05-18
**Status**: Aceito
**Decisores**: Leandro Alves

---

## Contexto

A página de detalhes do curso exibe dois tipos de dados com requisitos distintos:

1. **Dados públicos** (título, módulos, instrutor): não requerem autenticação, beneficiam-se de SSR para SEO e performance de carregamento inicial.
2. **Dados de progresso** (% conclusão, aulas concluídas, próxima aula): requerem JWT válido de aluno matriculado; não existem para visitantes não autenticados.

A questão central é: como acessar a API autenticada a partir de componentes no cliente, dado que o JWT é armazenado em cookie `httpOnly` (não legível por JS)?

## Decisão

Adotar renderização híbrida no Next.js App Router:
- **Server Components** buscam dados públicos no servidor (sem exposição de credenciais)
- **Client Components** fazem `fetch` com `credentials: 'include'` — o browser envia o cookie `httpOnly` automaticamente nas requisições ao mesmo domínio/origem permitida
- Nenhum token é lido diretamente pelo JS no cliente; a autenticação é transparente via cookie

## Alternativas consideradas

| Opção | Prós | Contras |
|-------|------|---------|
| **`credentials: 'include'` no cliente** *(escolhida)* | Simples, sem estado extra, cookie httpOnly protegido | Requer CORS com `allowCredentials` configurado na API |
| Next.js API Route como proxy | Lê cookie no servidor, mascara a API do cliente | Adiciona latência extra; manutenção de rotas duplicadas |
| Cookie separado não-httpOnly para o JWT | JS acessa o token diretamente | Reduz segurança (XSS pode roubar o token) |

## Consequências

**Positivas**:
- Dados públicos renderizados no servidor → melhor SEO e First Contentful Paint
- Dados privados carregados no cliente → sem exposição de credenciais em chamadas server-side desnecessárias
- Cookie httpOnly mantém o padrão de segurança do ADR-003

**Negativas / trade-offs**:
- Requer CORS na API com `origin` da UI e `credentials: true` (já deve estar configurado para o cookie funcionar no login)
- Seções de progresso mostram skeleton durante carregamento — UX levemente degradada vs. SSR completo
- Em ambientes Docker (mesmo host), CORS pode não ser problema; em separação de domínios, requer configuração explícita

## Notas de implementação

- Configurar CORS na API (`apps/api/src/main.ts`) com `origin: process.env.UI_ORIGIN` e `credentials: true` se ainda não estiver feito
- Client Components de progresso devem lidar graciosamente com `401/403` (usuário não autenticado ou não matriculado) exibindo o CTA de "Começar curso"
- O cookie é enviado automaticamente pelo browser; nenhuma lógica de token management é necessária nos Client Components
