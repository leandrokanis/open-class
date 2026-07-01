# Deployment guide

This guide walks a self-hoster through running Open Class in production on a
single host using Docker Compose. It uses the pre-built images published to
Docker Hub, so you do **not** need the source code checked out or a build
toolchain — only Docker and the production Compose file.

> **Scope** — this guide covers bringing the stack up on one machine. Putting it
> behind a domain with HTTPS (reverse proxy such as Caddy, nginx or Traefik) is
> out of scope; configure your proxy of choice in front of the UI (`41700`) and
> API (`41701`) ports.

---

## Prerequisites

- A Linux host with [Docker](https://docs.docker.com/get-docker/) and the Docker
  Compose v2 plugin.
- The [`docker-compose.prod.yml`](../docker-compose.prod.yml) file from this
  repository on the host (copy it over, or `git clone` the repo).

## dev vs prod Compose files

| File | Purpose |
|------|---------|
| [`docker-compose.yml`](../docker-compose.yml) | **Development** — builds the API and UI images from source, exposes a MailHog inbox, and uses baked-in default secrets. Use it for local work. |
| [`docker-compose.prod.yml`](../docker-compose.prod.yml) | **Production** — pulls the published `leandrokanis/open-class-api` and `leandrokanis/open-class-ui` images and requires real secrets. Use it to run an instance. |

All commands below pass `-f docker-compose.prod.yml` explicitly.

---

## 1. Configure environment

The production Compose file reads secrets from the environment (or a `.env` file
next to it). At minimum you must provide a database password and a JWT secret —
the stack refuses to start without them.

Create a `.env` file next to `docker-compose.prod.yml`:

```env
# Required
POSTGRES_PASSWORD=<a-strong-random-password>
JWT_SECRET=<a-strong-random-string-32-chars-or-more>

# Recommended
ALLOW_REGISTRATION=true

# Optional integrations (leave blank to disable)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
YOUTUBE_API_KEY=
SMTP_HOST=
SMTP_USER=
SMTP_PASS=
```

Generate strong secrets, for example:

```bash
openssl rand -base64 48   # JWT_SECRET
openssl rand -base64 24   # POSTGRES_PASSWORD
```

For the full list of application settings (OAuth, SMTP, white-label, MCP, …), see
the [configuration reference](./configuration.md).

> ⚠️ **Domain values are baked into `docker-compose.prod.yml`.** The published
> file ships with example public URLs (`APP_URL`, `FRONTEND_URL`,
> `GOOGLE_CALLBACK_URL`, `COOKIE_DOMAIN` pointing at `picgama.online`). Edit those
> to match your own domain before going live, or override them via your `.env`.

### <a name="environment"></a>Deployment-only variables

These exist only in the Compose files (not in `.env.example`) because they are
deployment concerns:

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `POSTGRES_PASSWORD` | Yes | — | 🔒 Password for the bundled PostgreSQL database. |
| `COOKIE_SECURE` | No | `true` (prod) | Send session cookies only over HTTPS. |
| `COOKIE_DOMAIN` | No | — | Cookie domain, e.g. `.example.com`, for sharing auth across subdomains. |
| `NODE_ENV` | No | `production` | Runtime environment. |
| `DB_PORT` / `API_PORT` / `UI_PORT` | No | `54170` / `41701` / `41700` | Host port overrides (dev Compose only). |

---

## 2. Start the stack

```bash
docker compose -f docker-compose.prod.yml up -d
```

This starts three services:

| Service | Host port |
|---------|-----------|
| UI | `41700` |
| API | `41701` |
| PostgreSQL | internal only |

The database volume (`pgdata`) and uploads volume (`uploads`) persist across
restarts.

## 3. Apply database migrations

Migrations are **not** run automatically on startup — you must apply them once on
the first boot (and after every upgrade that ships new migrations, see the
[upgrade guide](./upgrade.md)). The API image bundles a self-contained migrator
that only needs `DATABASE_URL` (already set on the `api` service):

```bash
docker compose -f docker-compose.prod.yml run --rm api node packages/db/dist/src/migrate.js
```

You should see log lines like `[migrate] Migrations applied successfully.`

## 4. Verify

Check the API health endpoint:

```bash
curl http://localhost:41701/api/health
# => {"status":"ok"}
```

Then open the UI at `http://<your-host>:41700`. **The first user to register
automatically becomes `admin`.**

The interactive API documentation (Swagger) is available at
`http://<your-host>:41701/api/docs`.

---

## Operating the instance

| Action | Command |
|--------|---------|
| View logs | `docker compose -f docker-compose.prod.yml logs -f` |
| Stop | `docker compose -f docker-compose.prod.yml down` |
| Restart | `docker compose -f docker-compose.prod.yml restart` |
| Upgrade | See the [upgrade guide](./upgrade.md) |

---

See also: [Configuration reference](./configuration.md) · [Upgrade guide](./upgrade.md)
