# ADR-017 — stdio como transporte primário do MCP Server

**Data**: 2026-05-27
**Status**: Aceito
**Decisores**: Leandro Alves

---

## Contexto

O Model Context Protocol suporta múltiplos transportes: stdio (padrão para processos locais) e SSE/HTTP (para servidores remotos). Claude Code e Claude Desktop lançam o servidor MCP como subprocesso e se comunicam via stdin/stdout — o modelo mais simples e sem dependências de rede.

## Decisão

Implementar stdio como transporte primário. SSE é desejável (RF09) mas fora do escopo desta entrega.

## Alternativas consideradas

| Opção | Prós | Contras |
|-------|------|---------|
| **stdio** *(escolhida)* | Suporte nativo em Claude Code/Desktop; zero config de rede; processo gerenciado pelo cliente | Não acessível remotamente; um cliente por vez |
| SSE / HTTP | Múltiplos clientes; acessível de outros hosts | Requer porta HTTP aberta; configuração mais complexa; não padrão no Claude Code |
| WebSocket | Bidirecional; baixa latência | Não suportado pelo SDK MCP oficial |

## Consequências

**Positivas**:
- Compatibilidade imediata com Claude Code via configuração em `~/.claude/settings.json`
- Sem necessidade de porta HTTP ou certificado TLS para uso local
- Modelo de processo simples: cliente inicia, MCP server responde, cliente encerra

**Negativas / trade-offs**:
- Não acessível de máquinas remotas sem wrapping adicional (ex: socat ou proxy)
- Um cliente MCP conectado por vez

## Notas de implementação

Configuração no Claude Code:
```json
{
  "mcpServers": {
    "open-class": {
      "command": "node",
      "args": ["packages/mcp-server/dist/index.js"],
      "env": {
        "MCP_API_TOKEN": "<token>",
        "OPEN_CLASS_API_URL": "http://localhost:3000",
        "OPEN_CLASS_ADMIN_EMAIL": "<email>",
        "OPEN_CLASS_ADMIN_PASSWORD": "<password>"
      }
    }
  }
}
```
