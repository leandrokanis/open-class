FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@9.15.9 --activate
WORKDIR /app

# ── Install all deps (workspace context) ────────────────────────────────────
FROM base AS deps
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY apps/api/package.json ./apps/api/
COPY packages/db/package.json ./packages/db/
RUN pnpm install --frozen-lockfile

# ── Build ───────────────────────────────────────────────────────────────────
FROM deps AS builder
COPY packages/db ./packages/db
COPY apps/api ./apps/api
# Build packages/db (produces dist/migrate.js used by migrator service)
RUN pnpm --filter @open-class/db build
# Build the API (nest build resolves @open-class/db via tsconfig paths)
RUN pnpm --filter @open-class/api build

# ── Runtime image ───────────────────────────────────────────────────────────
FROM node:20-alpine AS runner
RUN corepack enable && corepack prepare pnpm@9.15.9 --activate
WORKDIR /app
ENV NODE_ENV=production

# Install prod deps only
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY apps/api/package.json ./apps/api/
COPY packages/db/package.json ./packages/db/
RUN pnpm install --frozen-lockfile --prod

# Copy build artifacts
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/packages/db/dist/src ./packages/db/dist/src
COPY --from=builder /app/packages/db/drizzle ./packages/db/drizzle

EXPOSE 3001
CMD ["node", "apps/api/dist/src/main.js"]
