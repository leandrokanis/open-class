# Configuration reference

Open Class is configured entirely through environment variables. For local
development and single-host setups, copy the template and edit it:

```bash
cp .env.example .env
```

This page documents every variable in [`.env.example`](../.env.example) — the
canonical list of application settings. Variables that only exist in the
production Compose file (database password, cookie/domain hardening, host port
overrides) are documented in the [deployment guide](./deployment.md#environment).

> 🔒 **Sensitive values** — `JWT_SECRET` and `SMTP_PASS` must be kept secret.
> Generate a strong random `JWT_SECRET` (32+ characters), e.g.
> `openssl rand -base64 48`.

---

## Database

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | Yes | `postgresql://openclass:openclass@localhost:54170/openclass` | PostgreSQL connection string used by the API and the migrator. |

## Authentication (JWT)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `JWT_SECRET` | Yes | `change-me-to-a-random-string-of-at-least-32-chars` | 🔒 Secret used to sign JWT session tokens. **Required in production**: the API refuses to start when `NODE_ENV=production` and `JWT_SECRET` is missing or left at the example value (`dev-secret-change-in-production`). See [ADR-023](./decisions/023-security-headers-and-secret-fail-fast.md). |
| `JWT_EXPIRES_IN` | No | `7d` | Session token lifetime (e.g. `7d`, `24h`, `100y`). |

## Google OAuth (optional)

Leave blank to disable "Sign in with Google". Obtain credentials at the
[Google Cloud Console](https://console.cloud.google.com/auth/clients).

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `GOOGLE_CLIENT_ID` | No | — | OAuth client ID. When set, enables Google login. |
| `GOOGLE_CLIENT_SECRET` | No | — | OAuth client secret. |
| `GOOGLE_CALLBACK_URL` | No | `http://localhost:3001/auth/google/callback` | Redirect URI registered with Google. Must match your public API URL in production. |

## Email (SMTP)

Required for password-reset emails in production. In local development you can
use the bundled MailHog service (`docker compose up mailhog -d`, UI at
`http://localhost:8025`).

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `SMTP_HOST` | For password reset | — | SMTP server hostname. |
| `SMTP_PORT` | No | `587` | SMTP server port. |
| `SMTP_USER` | For password reset | — | SMTP username. |
| `SMTP_PASS` | For password reset | — | 🔒 SMTP password. |
| `SMTP_FROM` | No | `noreply@example.com` | From address for outbound email. |
| `SMTP_SECURE` | No | `false` | Set to `true` for implicit TLS (port 465). |

## YouTube

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `YOUTUBE_API_KEY` | For duration auto-detect | — | [YouTube Data API v3](https://console.cloud.google.com/) key. Enables validation of lesson URLs and automatic duration fetching. |

## Application

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | No | `3001` | Port the API listens on inside the container. |
| `APP_URL` | Yes (production) | `http://localhost:3001` | Public base URL of the API. Used to build OAuth endpoint URIs. |
| `FRONTEND_URL` | Yes | `http://localhost:41700` | Allowed CORS origin(s) for the UI. Comma-separated for multiple. |
| `ALLOW_REGISTRATION` | No | `true` | Set to `false` to disable new public sign-ups. |

## Platform / white-label (optional)

Optional overrides for branding. When set (non-empty), these win over values
saved by the admin in the database. Leave blank to manage them via the admin UI;
empty values fall back to built-in defaults.

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PLATFORM_NAME` | No | — | Platform display name. |
| `LOGO_URL` | No | — | URL of the platform logo. |
| `CATALOG_HERO_EYEBROW` | No | — | Small eyebrow text above the catalog hero. |
| `CATALOG_HERO_HEADLINE` | No | — | Catalog hero headline. |
| `CATALOG_HERO_SUBTITLE` | No | — | Catalog hero subtitle. |
| `LOGIN_HERO_TAGLINE` | No | — | Tagline on the login screen. |
| `LOGIN_HERO_SUBTITLE` | No | — | Subtitle on the login screen. |

## MCP server

Open Class exposes an MCP (Model Context Protocol) server on the API port. See
the [MCP section of the README](../README.md#mcp-server) for connection details.

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `MCP_API_TOKEN` | No | — | Static Bearer token for programmatic MCP clients. Optional — OAuth 2.0 is the primary auth method. |
| `OAUTH_TOKEN_TTL` | No | `3600` | OAuth access token lifetime, in seconds. |

## UI

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NEXT_PUBLIC_API_URL` | Yes | `http://localhost:41701` | Public API base URL the browser uses to reach the API. |
| `NEXT_PUBLIC_GOOGLE_OAUTH` | No | `true` | Toggles the "Sign in with Google" button in the UI. |

---

See also: [Deployment guide](./deployment.md) · [Upgrade guide](./upgrade.md)
