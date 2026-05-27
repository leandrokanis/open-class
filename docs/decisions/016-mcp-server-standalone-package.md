# ADR-016 — MCP Server como pacote standalone em `packages/`

**Data**: 2026-05-27
**Status**: Substituído por [ADR-020](020-mcp-nestjs-module.md)
**Decisores**: Leandro Alves

---

## Contexto

O MCP Server precisa ser construído em algum lugar do monorepo. As opções naturais são: integrá-lo ao NestJS existente em `apps/api/`, criar um novo app em `apps/`, ou criar um pacote em `packages/`.

O transporte primário é stdio — o processo MCP precisa ter controle exclusivo de stdin/stdout e não pode compartilhar processo com um servidor HTTP (o que o NestJS em `apps/api/` faz).

## Decisão

Criar o MCP Server como pacote standalone em `packages/mcp-server/`, sem dependência do NestJS.

## Alternativas consideradas

| Opção | Prós | Contras |
|-------|------|---------|
| **`packages/mcp-server/`** *(escolhida)* | Processo próprio; stdio sem conflito; escopo reduzido; fácil de publicar futuramente | Duplica lógica de negócio se vier a acessar DB direto |
| NestJS module em `apps/api/` | Reutiliza DI e services existentes | stdio é incompatível com servidor HTTP no mesmo processo; acoplamento |
| Novo app em `apps/mcp/` | Processo próprio com estrutura de app completo | Overhead de NestJS desnecessário para um servidor MCP simples |

## Consequências

**Positivas**:
- Processo isolado: stdio funciona sem interferência com a API HTTP
- Deploy independente: pode rodar separado da API quando necessário
- Acoplamento apenas via contrato HTTP REST — mudanças internas da API não quebram o MCP server desde que os endpoints se mantenham estáveis

**Negativas / trade-offs**:
- Lógica de validação (ex: e-mail → userId) precisa ser feita via chamadas HTTP extras
- Necessita de suas próprias configurações de TypeScript e build

## Notas de implementação

O pacote seguirá a convenção do monorepo: `package.json` com `"name": "@open-class/mcp-server"`, `tsconfig.json` herdando do root, e scripts `dev`, `build`, `test` compatíveis com Turborepo.
