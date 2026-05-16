# ADR-001 — NestJS como framework da API

**Data**: 2026-05-16
**Status**: Aceito
**Decisores**: Leandro Alves

---

## Contexto

O Open Class precisa de um framework backend para TypeScript que suporte modularidade, injeção de dependência, guards de autenticação e integração com Passport.js. O projeto é API-first: o backend é o único dono da lógica de negócio e autenticação.

## Decisão

Usar **NestJS 10** como framework da API.

## Alternativas consideradas

| Opção | Prós | Contras |
|-------|------|---------|
| **NestJS** *(escolhido)* | DI nativo, guards, decorators, integração canônica com Passport | Mais verboso que frameworks minimalistas |
| Fastify + plugins | Mais rápido (benchmarks), minimalista | Sem DI, sem guards — todo o scaffolding seria manual |
| Express puro | Familiaridade ampla, ecossistema vasto | Sem estrutura, sem tipagem de rotas, sem DI |
| Hono | Muito leve, edge-ready | Ecossistema imatura para projetos estruturados; sem DI |

## Consequências

**Positivas**:
- Estrutura modular facilita adicionar novos domínios (courses, enrollments) sem alterar módulos existentes.
- `@UseGuards()`, `@Roles()` e decorators customizados tornam a proteção de rotas declarativa.
- Integração nativa com Passport elimina glue code.

**Negativas / trade-offs**:
- Overhead de bootstrap (~80–100 ms a mais que Fastify) — aceitável para o target de < 200 ms p95.
- Curva de aprendizado para colaboradores não familiarizados com DI e decorators TypeScript.

## Notas de implementação

- Adapter padrão Express (não Fastify) por compatibilidade com `cookie-parser` e `passport` sem wrappers adicionais.
- Vitest (não Jest) para testes — mais rápido e compatível com ESM nativo.
