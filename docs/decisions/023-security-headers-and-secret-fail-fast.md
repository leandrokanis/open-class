# ADR-023 — Cabeçalhos de segurança via helmet e fail-fast de segredos

**Data**: 2026-07-01
**Status**: Aceito
**Decisores**: Leandro Alves

---

## Contexto

O Open Class é self-hosted: quem opera a instância nem sempre é especialista em
segurança. Duas fragilidades de configuração "insegura por padrão" foram identificadas
na auditoria OWASP Top 10 (issue #32):

1. A API não emitia cabeçalhos de segurança HTTP (nosniff, frameguard, HSTS) e expunha
   `X-Powered-By`, revelando a stack.
2. `JWT_SECRET` tinha fallback silencioso para o valor de exemplo
   (`dev-secret-change-in-production`), permitindo que uma instância subisse em produção
   com um segredo público — falha crítica de autenticação (A02/A07).

## Decisão

Adotar `helmet` para os cabeçalhos de segurança padrão (com `contentSecurityPolicy`
desabilitado para não quebrar o Swagger UI e o `serve-static` de uploads) e introduzir
uma função `resolveJwtSecret(env)` que falha na inicialização quando, em produção,
`JWT_SECRET` está ausente ou igual ao valor de exemplo — mantendo o fallback tolerante
apenas em desenvolvimento.

## Alternativas consideradas

| Opção | Prós | Contras |
|-------|------|---------|
| **helmet + fail-fast** *(escolhida)* | Secure-by-default; helmet é padrão de mercado; fail-fast evita segredo público em prod | Nova dependência; CSP exige ajuste para o Swagger |
| Definir headers manualmente | Sem dependência nova | Reinventa helmet; fácil esquecer um header; mais código para manter |
| Só documentar no checklist, sem código | Zero risco de regressão | Não resolve a insegurança por padrão; depende do operador lembrar |

## Consequências

**Positivas**:
- Instância sobe com cabeçalhos de segurança ativos sem configuração manual.
- Impossível subir em produção com o segredo JWT de exemplo.

**Negativas / trade-offs**:
- `contentSecurityPolicy` fica desabilitado por ora (Swagger/uploads); uma CSP fina
  fica como trabalho futuro.
- Operadores que hoje rodam "produção" sem `JWT_SECRET` precisarão defini-lo — quebra
  intencional, documentada no guia de configuração.

## Notas de implementação

- `resolveJwtSecret(env)` é função pura em `apps/api/src/config/security-config.ts`,
  coberta por testes Vitest; usada em `app.module.ts`.
- `app.use(helmet({ contentSecurityPolicy: false }))` em `main.ts`, antes do CORS.
