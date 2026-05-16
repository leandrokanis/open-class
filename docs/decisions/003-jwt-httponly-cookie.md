# ADR-003 — JWT stateless via cookie httpOnly

**Data**: 2026-05-16
**Status**: Aceito
**Decisores**: Leandro Alves

---

## Contexto

A API precisa manter usuários autenticados entre requisições. O target de deploy é uma instância única em homelab com restrição de < 256 MB RAM idle. Redis não está disponível na Fase 1.

## Decisão

Usar **JWT stateless** armazenado em **cookie httpOnly** com as flags `Secure` e `SameSite=Lax`.

- O token é emitido no login e enviado via `Set-Cookie`.
- Cada requisição protegida valida o JWT localmente (sem round-trip ao banco).
- Expiração configurável via `JWT_EXPIRES_IN` (padrão de desenvolvimento: `100y`; produção: `7d`).

## Alternativas consideradas

| Opção | Prós | Contras |
|-------|------|---------|
| **JWT em cookie httpOnly** *(escolhido)* | Stateless, sem Redis, protegido contra XSS | Sem revogação imediata de token (logout não invalida tokens em voo) |
| JWT em `Authorization: Bearer` (header) | Compatível com mobile/SPA | Requer armazenamento em JS (vulnerável a XSS); não adequado para web |
| Sessions + Redis | Revogação imediata, logout real | Requer Redis (~50 MB RAM); estado distribuído; incompatível com constraint de memória |
| Sessions em banco (PostgreSQL) | Sem Redis | Round-trip ao banco em cada request; degradação de performance |

## Consequências

**Positivas**:
- Sem dependência de Redis na Fase 1 — economiza ~50 MB de RAM idle.
- Proteção contra XSS: JavaScript da página não acessa o cookie.
- Escalável horizontalmente sem sticky sessions (stateless).

**Negativas / trade-offs**:
- **Logout não invalida tokens em voo**: um token válido permanece válido até expirar, mesmo após logout. Mitigação: expiração curta em produção (7 dias) e lista negra por `jti` se/quando necessário.
- `SameSite=Lax` requer que o frontend e a API estejam no mesmo domínio ou subdomínio — relevante para deploy white-label.
- CSRF não é risco com `SameSite=Lax` para mutations via `fetch` de mesma origem, mas deve ser revisado se a API aceitar requests cross-origin.

## Caminho de evolução

Se revogação imediata for necessária: adicionar tabela `revoked_tokens (jti, revoked_at)` ou migrar para Redis com `ThrottlerStorageRedisService`.
