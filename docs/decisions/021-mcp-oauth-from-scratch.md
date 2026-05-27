# ADR-021 — OAuth 2.0 Authorization Server implementado from scratch para MCP

**Data**: 2026-05-27
**Status**: Aceito
**Decisores**: Leandro Alves

---

## Contexto

O servidor MCP exposto em `/mcp` usa autenticação por Bearer token estático (`MCP_API_TOKEN`). A interface web do claude.ai exige que servidores MCP implementem o fluxo OAuth 2.0 Authorization Code Grant (RFC 6749 §4.1) para ser adicionado como conector. É necessário decidir como implementar o servidor de autorização OAuth 2.0.

## Decisão

Implementar o OAuth 2.0 Authorization Server from scratch, seguindo diretamente as RFCs (6749, 8414, 7591), sem adotar uma biblioteca como `oauth2orize`, `node-oauth2-server` ou similar.

## Alternativas consideradas

| Opção | Prós | Contras |
|-------|------|---------|
| **From scratch** *(escolhida)* | Zero dependências novas; código totalmente sob controle; fluxo limitado (apenas Authorization Code) é bem delimitado | Mais código a manter; erros de implementação são possíveis |
| `node-oauth2-server` / `@node-oauth2-server/core` | Biblioteca estabelecida; cobre múltiplos grant types | Última release ~2020, pouco ativa; API de configuração verbosa; overhead desnecessário para um único grant type |
| `oauth4webapi` (cliente) | Moderna e bem mantida | É uma biblioteca de *cliente* OAuth, não de servidor — não se aplica |
| Keycloak / Authentik externo | Solução OAuth completa e auditada | Viola a premissa self-hosted leve (<256 MB RAM); adiciona serviço obrigatório ao docker-compose |

## Consequências

**Positivas**:
- Nenhuma dependência nova adicionada ao `package.json`
- Implementação focada: apenas Authorization Code Grant + dynamic registration + metadata discovery
- Fácil de auditar e testar isoladamente

**Negativas / trade-offs**:
- O código OAuth precisa de atenção especial para evitar vulnerabilidades de tempo (comparação de tokens) e replay attacks (invalidação de codes usados)
- PKCE (RFC 7636) não é implementado na v1 — documentado como limitação conhecida

## Notas de implementação

- Comparações de token devem usar `crypto.timingSafeEqual` para evitar timing attacks
- Authorization codes expiram em 10 minutos; access tokens têm TTL configurável via `OAUTH_TOKEN_TTL` (default 3600 segundos)
- O `client_secret` é gerado como UUID v4 e armazenado hasheado com bcrypt no banco
