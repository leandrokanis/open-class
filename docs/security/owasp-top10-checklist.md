# Checklist OWASP Top 10 (2021) — API Open Class

> Auditoria de segurança da API (`apps/api`) referente à issue #32 (Fase 5 —
> Qualidade e Release). Data da auditoria: **2026-07-01**.
>
> Legenda de veredito: ✅ OK · ⚠️ Lacuna (encaminhada) · ➖ Não aplicável.
>
> As evidências apontam para `apps/api/src/...`. Correções desta entrega estão
> descritas no **[ADR-023](../decisions/023-security-headers-and-secret-fail-fast.md)**.

---

## A01:2021 — Broken Access Control · ✅ OK

**Estado atual**: autorização por papel via `JwtAuthGuard` + `RolesGuard` com o
decorator `@Roles(...)` (ver [ADR-010](../decisions/010-roles-permissions-guard.md)).
Rotas que alteram dados exigem autenticação e o papel adequado. Recursos por usuário
são escopados pelo id do usuário autenticado, não por parâmetro do cliente — sem IDOR.

**Evidências**:
- `enrollments/enrollments.controller.ts` — `@UseGuards(JwtAuthGuard, RolesGuard)`;
  `enroll(req.user.id, ...)` e `findByStudent(req.user.id)` usam o id do token, não um id vindo do cliente.
- `progress/progress.controller.ts` — todas as rotas sob `JwtAuthGuard + RolesGuard`.
- `admin/courses/admin-courses.controller.ts`, `platform-config` — restritos a `Role.Admin`.

**Superfícies públicas intencionais** (não são lacunas):
- `app.controller.ts` — health check.
- `youtube/youtube.controller.ts` — validação de URL pública do catálogo.
- `mcp-oauth/*` e `mcp/mcp.controller.ts` — endpoints OAuth/MCP com autenticação própria
  (Bearer OAuth), ver [ADR-021](../decisions/021-mcp-oauth-from-scratch.md).

---

## A02:2021 — Cryptographic Failures · ✅ OK (corrigido nesta entrega)

**Estado atual**:
- Senhas com `bcrypt` (`auth/auth.service.ts`).
- JWT via cookie `httpOnly`, `sameSite: 'lax'`, `secure` controlado por `COOKIE_SECURE`
  (`auth/auth.service.ts:69-71`), ver [ADR-003](../decisions/003-jwt-httponly-cookie.md).

**Lacuna corrigida**: `JWT_SECRET` tinha fallback silencioso para o valor de exemplo.
Agora `resolveJwtSecret()` (`config/security-config.ts`) **impede a inicialização em
produção** sem um segredo forte. Ver ADR-023.

**Encaminhamento**: recomenda-se `COOKIE_SECURE=true` em produção (atrás de HTTPS);
documentado em `docs/configuration.md`.

---

## A03:2021 — Injection · ✅ OK

**Estado atual**:
- Acesso a dados via Drizzle ORM com query builder parametrizado — sem SQL cru
  concatenado com entrada do usuário (`*/**.repository.ts`).
- Validação e sanitização de entrada via `class-validator` + `I18nValidationPipe`
  com `whitelist: true` e `forbidNonWhitelisted: true` (`main.ts`) — descarta campos
  não declarados nos DTOs.

**Encaminhamento**: ver A06 — o advisory de SQL injection do `drizzle-orm` afeta
apenas identificadores dinâmicos, que este código não usa; ainda assim, atualizar a lib.

---

## A04:2021 — Insecure Design · ✅ OK

**Estado atual**:
- Rate limiting global via `ThrottlerModule` (60 req/60s) protegendo brute force e abuso
  (`app.module.ts`), ver [ADR-008](../decisions/008-rate-limiting-in-memory.md).
- Upload de arquivos restrito por mimetype (`ALLOWED_MIMES`) e tamanho (`MAX_SIZE`)
  em `common/upload/upload.service.ts`.
- Fluxos de autorização condicional (Google OAuth só carrega se configurado,
  [ADR-009](../decisions/009-google-oauth-condicional.md)).

**Encaminhamento**: considerar rate limit dedicado (mais estrito) nas rotas de login e
reset de senha, além do throttle global.

---

## A05:2021 — Security Misconfiguration · ✅ OK (corrigido nesta entrega)

**Lacuna corrigida**: a API não emitia cabeçalhos de segurança e expunha `X-Powered-By`.
Agora `helmet({ contentSecurityPolicy: false })` é aplicado em `main.ts` — ativa
`X-Content-Type-Options: nosniff`, frameguard, HSTS (sob HTTPS) e remove `X-Powered-By`.
CSP fica desabilitado para não quebrar Swagger UI (`/docs`) e `/uploads`. Ver ADR-023.

**Estado atual**:
- CORS por allowlist via `FRONTEND_URL` (`main.ts`).
- Mensagens de erro padronizadas por `HttpExceptionFilter` — sem vazar stack trace.

**Exceção intencional documentada**: os endpoints `/oauth/*` e `/.well-known/*` liberam
`Access-Control-Allow-Origin: *` (`main.ts`) porque precisam ser alcançáveis por clientes
MCP arbitrários (claude.ai, etc.). É intencional e restrito a esses paths — ver
[ADR-019](../decisions/019-mcp-sse-http-transport.md) / [ADR-021](../decisions/021-mcp-oauth-from-scratch.md).

---

## A06:2021 — Vulnerable and Outdated Components · ⚠️ Lacuna (encaminhada)

**Varredura** (`pnpm audit --prod`, 2026-07-01): **26 vulnerabilidades** — 1 low, 14
moderate, 11 high. A grande maioria é **transitiva**:

| Pacote | Severidade | Caminho | Encaminhamento |
|--------|-----------|---------|----------------|
| `node-tar` | high | transitiva (tooling) | resolve com upgrade do ecossistema; sem uso em runtime de request |
| `multer` | high/moderate | `@nestjs/platform-express > multer` | aguardar patch do NestJS; upload já limitado por tipo/tamanho |
| `js-yaml` | moderate | `@nestjs/swagger > js-yaml` | apenas geração do Swagger; sem exposição a entrada não confiável |
| `drizzle-orm` | high | dep direta | SQL injection só via identificadores dinâmicos — não usados aqui; **agendar upgrade** |
| `nodemailer` | high | dep direta | DoS no addressparser; **agendar upgrade** |
| `hono` | high | transitiva | não usado diretamente |

**Encaminhamento**: agendar upgrade de `drizzle-orm` e `nodemailer` (deps diretas) e
reavaliar após atualizações do NestJS/Swagger. Upgrades com breaking change (major) ficam
fora do escopo desta entrega (ver `spec.md` — Fora de escopo).

---

## A07:2021 — Identification and Authentication Failures · ✅ OK

**Estado atual**:
- Passport JWT + Local + Google OAuth (`auth/strategies/*`).
- Rate limiting global mitiga brute force de credenciais.
- Segredo de JWT agora obrigatório e forte em produção (ver A02 / ADR-023).
- Tokens de reset de senha em tabela dedicada (`passwordResetTokens`).

**Encaminhamento**: avaliar política de senha forte no cadastro e expiração/rotação
de refresh — melhorias incrementais, não bloqueantes.

---

## A08:2021 — Software and Data Integrity Failures · ✅ OK

**Estado atual**:
- Dependências travadas por `pnpm-lock.yaml` (instalação determinística).
- Sem deserialização insegura de dados não confiáveis; entrada passa por DTOs validados.
- Migrations versionadas e aplicadas de forma controlada (`runMigrations()` no boot).

**Encaminhamento**: considerar verificação de integridade/assinatura em pipeline de CI
(fora do escopo da API).

---

## A09:2021 — Security Logging and Monitoring Failures · ⚠️ Lacuna (encaminhada)

**Estado atual**: erros HTTP passam por `HttpExceptionFilter`; não há logging estruturado
dedicado de eventos de segurança (falhas de login, negações de autorização) nem
integração com monitoramento.

**Encaminhamento**: adicionar logging estruturado de eventos de autenticação/autorização
(sucesso e falha) e um caminho de observabilidade. Registrado para uma entrega futura —
não implementado aqui (ver `spec.md` — Fora de escopo / P3).

---

## A10:2021 — Server-Side Request Forgery (SSRF) · ✅ OK

**Estado atual**: a única busca de URL externa a partir de entrada do usuário é o módulo
YouTube. `youtube.service.ts` **valida o hostname** (`youtube.com` / `youtu.be`) e extrai
apenas o `videoId`; a requisição HTTP sai para um endpoint **fixo** do
`googleapis.com/youtube/v3/videos` usando o `videoId` — a URL do usuário nunca é buscada
diretamente. Isso elimina o vetor clássico de SSRF.

**Evidência**: `youtube/youtube.service.ts:15-29` (validação de host) e `:58-64`
(fetch para endpoint fixo).

---

## Resumo

| Categoria | Veredito |
|-----------|----------|
| A01 Broken Access Control | ✅ OK |
| A02 Cryptographic Failures | ✅ OK (corrigido) |
| A03 Injection | ✅ OK |
| A04 Insecure Design | ✅ OK |
| A05 Security Misconfiguration | ✅ OK (corrigido) |
| A06 Vulnerable Components | ⚠️ Encaminhado (upgrades agendados) |
| A07 Auth Failures | ✅ OK |
| A08 Integrity Failures | ✅ OK |
| A09 Logging & Monitoring | ⚠️ Encaminhado (entrega futura) |
| A10 SSRF | ✅ OK |

**Correções aplicadas nesta entrega** (ADR-023):
- Fail-fast do `JWT_SECRET` em produção — `config/security-config.ts`.
- Cabeçalhos de segurança HTTP via `helmet` — `main.ts`.

**Encaminhamentos abertos**: upgrade de `drizzle-orm`/`nodemailer` (A06) e logging de
segurança estruturado (A09).
