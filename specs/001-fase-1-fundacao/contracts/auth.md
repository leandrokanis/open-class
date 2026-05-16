# API Contracts — Auth (Fase 1: Fundação)

Base path: `/auth`

All responses follow the envelope:
```json
{ "data": <payload> }          // 2xx
{ "error": "<message>", "statusCode": <n> }  // 4xx/5xx
```

JWT delivered as `httpOnly` cookie named `access_token`. No Bearer header in v1.

---

## POST /auth/register

Cria conta com e-mail + senha.

**Request**
```json
{
  "name": "string (2–255 chars)",
  "email": "string (valid e-mail)",
  "password": "string (min 8 chars)"
}
```

**Response 201**
```json
{
  "data": {
    "id": "uuid",
    "name": "string",
    "email": "string",
    "role": "aluno",
    "avatarUrl": null,
    "createdAt": "ISO 8601"
  }
}
```

**Errors**
| Status | Condition |
|--------|-----------|
| 400 | Validation error (missing/invalid fields) |
| 409 | E-mail já cadastrado |

**Side effects**: sets `access_token` cookie.

---

## POST /auth/login

Autentica com e-mail + senha.

**Request**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response 200**
```json
{
  "data": {
    "id": "uuid",
    "name": "string",
    "email": "string",
    "role": "aluno | instrutor | admin",
    "avatarUrl": "string | null"
  }
}
```

**Errors**
| Status | Condition |
|--------|-----------|
| 400 | Campos ausentes |
| 401 | Credenciais inválidas |
| 403 | Conta desativada (`is_active = false`) |

**Side effects**: sets `access_token` cookie.

---

## POST /auth/logout

Invalida sessão no cliente.

**Auth**: requer cookie `access_token` válido.

**Request**: sem body.

**Response 204**: sem body.

**Side effects**: limpa cookie `access_token` (Max-Age=0).

---

## GET /auth/me

Retorna o usuário autenticado.

**Auth**: requer cookie `access_token` válido.

**Response 200**
```json
{
  "data": {
    "id": "uuid",
    "name": "string",
    "email": "string",
    "role": "aluno | instrutor | admin",
    "avatarUrl": "string | null",
    "bio": "string | null",
    "isActive": true,
    "createdAt": "ISO 8601"
  }
}
```

**Errors**
| Status | Condition |
|--------|-----------|
| 401 | Cookie ausente ou token expirado/inválido |

---

## POST /auth/forgot-password

Envia e-mail com link de reset.

**Rate limit**: 5 req / 15 min por IP.

**Request**
```json
{
  "email": "string"
}
```

**Response 200** (sempre, mesmo se e-mail não existir — evita enumeração)
```json
{
  "data": { "message": "Se o e-mail existir, um link foi enviado." }
}
```

**Side effects**: persiste `password_reset_tokens` com hash SHA-256 do token; envia e-mail com link contendo token bruto.

---

## POST /auth/reset-password

Redefine senha usando token do e-mail.

**Request**
```json
{
  "token": "string (token bruto recebido por e-mail)",
  "password": "string (min 8 chars)"
}
```

**Response 200**
```json
{
  "data": { "message": "Senha redefinida com sucesso." }
}
```

**Errors**
| Status | Condition |
|--------|-----------|
| 400 | Token inválido, expirado (`expires_at ≤ now()`) ou já utilizado (`used_at IS NOT NULL`) |
| 400 | Nova senha inválida |

**Side effects**: atualiza `password_hash` no user; preenche `used_at` no token.

---

## GET /auth/google

Inicia fluxo OAuth com Google. Redireciona para consent screen.

**Disponível somente quando** `GOOGLE_CLIENT_ID` e `GOOGLE_CLIENT_SECRET` estão configurados.

**Response**: `302 Redirect` → Google OAuth consent URL.

---

## GET /auth/google/callback

Callback OAuth. Chamado pelo Google após consentimento.

**Response**: `302 Redirect` → `/` (frontend home) com cookie `access_token` setado.

**Comportamento**:
1. Se `google_id` já existe em `users` → autentica o usuário existente.
2. Se e-mail já existe mas sem `google_id` → vincula `google_id` à conta existente e autentica.
3. Se nenhum dos acima → cria nova conta (`password_hash = NULL`, `role = 'aluno'`) e autentica.

**Errors**: redireciona para `/login?error=oauth_failed` em caso de falha.
