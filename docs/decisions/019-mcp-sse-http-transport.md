# ADR-019 — SSE/HTTP como transporte do MCP Server para deploys públicos

**Data**: 2026-05-27
**Status**: Aceito
**Decisores**: Leandro Alves

---

## Contexto

O MCP server foi inicialmente implementado com transporte stdio (ADR-017), o que limita seu uso a clientes locais que lançam o processo como subprocesso. Para expor o servidor a clientes remotos (outros hosts, homelab, agentes em nuvem), é necessário um transporte baseado em HTTP.

O MCP SDK (`@modelcontextprotocol/sdk` ≥ 1.x) oferece dois transportes HTTP: `SSEServerTransport` (legado) e `StreamableHTTPServerTransport` (recomendado a partir da especificação MCP 2025-03-26).

## Decisão

Implementar `StreamableHTTPServerTransport` com Express como transporte opcional, selecionável via `TRANSPORT=sse`. O transporte stdio é preservado como padrão para uso local.

## Alternativas consideradas

| Opção | Prós | Contras |
|-------|------|---------|
| **`StreamableHTTPServerTransport` + Express** *(escolhida)* | Padrão atual do MCP SDK; endpoint único `/mcp`; suporta múltiplos clientes | Requer gerenciamento de sessões em memória |
| `SSEServerTransport` (legado) | Mais exemplos na web; endpoint `/sse` + `/messages` separados | Marcado como legado no SDK; dois endpoints para gerenciar |
| Substituir stdio completamente | Simplifica o entry point | Quebra uso local e Claude Code/Desktop sem config adicional |
| WebSocket | Bidirecional nativo, baixa latência | Não suportado pelo MCP SDK oficial |

## Consequências

**Positivas**:
- MCP server acessível de qualquer host com token válido
- Múltiplos clientes simultâneos (um por sessão)
- Retrocompatibilidade total com modo stdio (padrão)
- Healthcheck em `/health` sem auth facilita monitoramento

**Negativas / trade-offs**:
- Sessões armazenadas em memória — reinício do container encerra sessões ativas
- TLS deve ser terminado por proxy reverso externo (Caddy/Nginx)
- Necessário buildar e publicar imagem Docker separada para produção

## Notas de implementação

- Endpoint: `POST|GET|DELETE /mcp` — protocolo MCP Streamable HTTP
- Auth: middleware Express valida `Authorization: Bearer <MCP_API_TOKEN>` (ADR-018)
- Sessões: `Map<sessionId, StreamableHTTPServerTransport>` limpa ao fechar conexão
- Porta: configurável via `PORT` (padrão `3001`); exposta em `41702` no compose de prod
- Substitui: ADR-017
