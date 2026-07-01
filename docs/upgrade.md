# Upgrade guide

How to update an existing Open Class instance to a newer version. This assumes a
production deployment created with the [deployment guide](./deployment.md), i.e.
using [`docker-compose.prod.yml`](../docker-compose.prod.yml) and the published
`:latest` images.

> **Scope** — this guide covers pulling the new version and applying any database
> migrations it ships. Backing up your database beforehand is strongly
> recommended but is out of scope for this guide (use your usual PostgreSQL
> backup process, e.g. `pg_dump`).

---

## Steps

Run all commands from the directory containing `docker-compose.prod.yml`.

### 1. Pull the new images

```bash
docker compose -f docker-compose.prod.yml pull
```

This fetches the latest `open-class-api` and `open-class-ui` images from Docker
Hub.

### 2. Recreate the containers

```bash
docker compose -f docker-compose.prod.yml up -d
```

Compose recreates only the containers whose image changed. The `pgdata` and
`uploads` volumes are preserved, so your data and uploaded files carry over.

### 3. Apply database migrations

Migrations do not run automatically. After every upgrade, run the bundled
migrator to apply any new migrations shipped with the release:

```bash
docker compose -f docker-compose.prod.yml run --rm api node packages/db/dist/src/migrate.js
```

The migrator is idempotent — if there are no new migrations, it simply reports
that the schema is already up to date.

### 4. Verify

```bash
curl http://localhost:41701/api/health
# => {"status":"ok"}
```

Then load the UI and confirm the app behaves as expected.

---

## Rollback

If something goes wrong, redeploy a known-good image tag. The `:latest` tag
always points at the newest release; to pin a specific version, set the image
tags in `docker-compose.prod.yml` to the desired release and run
`up -d` again.

> Note: migrations are forward-only. Rolling the images back does not roll back
> schema changes — this is why a database backup before upgrading is
> recommended.

---

See also: [Deployment guide](./deployment.md) · [Configuration reference](./configuration.md)
