# ADR-020 — MCP Server como módulo NestJS em `apps/api/`

**Data**: 2026-05-27
**Status**: Aceito
**Decisores**: Leandro Alves

---

## Contexto

O MCP server foi inicialmente criado como pacote standalone em `packages/mcp-server/` (ADR-016), cujo argumento principal era a incompatibilidade do transporte stdio com um servidor HTTP no mesmo processo.

Com a adoção do transporte SSE/HTTP (ADR-019), esse argumento caiu. O pacote standalone passou a acessar a API do Open Class via HTTP (`AuthManager` + `api-client`), criando acoplamento indireto: qualquer mudança de endpoint ou assinatura de service exige atualização em dois lugares — na API e no cliente MCP — sem nenhuma verificação estática.

## Decisão

Mover o MCP server para `apps/api/src/mcp/` como módulo NestJS. As tools e resources acessam os services existentes (`EnrollmentsService`, `CoursesService`, `UsersService`) via injeção de dependência. O pacote `packages/mcp-server/` é removido.

## Alternativas consideradas

| Opção | Prós | Contras |
|-------|------|---------|
| **Módulo NestJS em `apps/api/`** *(escolhida)* | Services compartilhados via DI; erros de contrato detectados em compile time; um processo a menos para operar | MCP sobe junto com a API; não é deployável independentemente |
| Pacote standalone com HTTP client | Deploy independente; isolamento de falhas | Acoplamento via HTTP sem verificação estática; overhead de manutenção; `AuthManager` necessário |
| Novo app em `apps/mcp/` (NestJS completo) | Processo próprio com DI | Duplica configuração NestJS; não reutiliza services sem publicar pacotes |

## Consequências

**Positivas**:
- Mudanças em services da API são verificadas pelo TypeScript no mesmo build — sem divergência silenciosa
- Remove `packages/mcp-server/`, `AuthManager`, `api-client.ts` e toda a lógica de renovação de JWT de serviço
- Um serviço a menos no Docker Compose de produção
- `MCP_API_TOKEN` continua como único segredo adicional necessário

**Negativas / trade-offs**:
- MCP server e API compartilham processo e porta — não são escaláveis independentemente
- Reinício da API encerra sessões MCP ativas (clientes precisam reconectar)

## Notas de implementação

- O transporte SSE é registrado via `HttpAdapterHost` no lifecycle hook `onApplicationBootstrap` do `McpModule`, obtendo acesso direto ao Express app subjacente para registrar middleware em `/mcp`
- `EnrollmentsModule`, `CoursesModule` e `UsersModule` precisam exportar seus respectivos services para que o `McpModule` possa injetá-los
- Substitui: ADR-016
