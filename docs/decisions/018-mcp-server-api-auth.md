# ADR-018 — Autenticação do MCP Server na API via login admin + JWT Bearer

**Data**: 2026-05-27
**Status**: Aceito
**Decisores**: Leandro Alves

---

## Contexto

O MCP Server precisa chamar endpoints protegidos da API REST do Open Class (ex: `POST /api/enrollments`, `GET /api/admin/users`). A API usa JWT armazenado em cookie httpOnly por padrão, mas a `JwtStrategy` já extrai token de `Authorization: Bearer` como segundo extrator (`ExtractJwt.fromAuthHeaderAsBearerToken()`).

Há duas camadas de autenticação distintas:
1. **Cliente MCP → MCP Server**: como o agente de IA prova sua identidade ao MCP server
2. **MCP Server → API Open Class**: como o MCP server se autentica nas chamadas HTTP internas

## Decisão

- **Camada 1**: `MCP_API_TOKEN` estático em env var; o MCP server rejeita invocações sem esse token correspondendo ao configurado
- **Camada 2**: MCP server faz `POST /api/auth/login` com credenciais admin em env var no startup, armazena o JWT Bearer, e o inclui em cada chamada à API; renova automaticamente ao receber 401

## Alternativas consideradas

| Opção | Prós | Contras |
|-------|------|---------|
| **Login admin + cache JWT** *(escolhida)* | Zero mudanças na API; reutiliza mecanismo existente | Requer credenciais admin em env; JWT expira (geralmente 24h) |
| JWT pré-gerado em env var | Sem chamada de login; simples | JWT expira e precisa de renovação manual; operacional frágil |
| Novo endpoint "service key" na API | Sem expiração; escopo controlado | Requer mudança na API; aumento de surface de segurança |
| Acesso direto ao DB (Drizzle) | Sem roundtrip HTTP | Acopla ao schema DB; bypassa regras de negócio; viola suposição do spec |

## Consequências

**Positivas**:
- Nenhuma mudança necessária na API para a primeira entrega
- Renovação automática de JWT é transparente para quem usa o MCP server
- Credenciais admin em env var são consistentes com outras integrações do projeto

**Negativas / trade-offs**:
- Credenciais admin no ambiente do MCP server são um segredo sensível — exige cuidado no deploy
- Custo de uma chamada extra de login no startup (ou no primeiro uso após expiração)

## Notas de implementação

`AuthManager` deve:
1. Tentar login no startup e armazenar `{ token, expiresAt }`
2. Expor `getToken(): Promise<string>` que retorna o token cacheado ou renova se expirado
3. O interceptor de resposta do `axios` deve chamar `getToken()` e retentar uma vez em caso de 401
