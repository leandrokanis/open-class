FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@9.15.9 --activate
WORKDIR /app

# ── Install deps (workspace context) ────────────────────────────────────────
FROM base AS deps
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY apps/api/package.json ./apps/api/
COPY apps/ui/package.json ./apps/ui/
COPY packages/db/package.json ./packages/db/
RUN pnpm install --frozen-lockfile

# ── Build ───────────────────────────────────────────────────────────────────
FROM deps AS builder
COPY apps/ui ./apps/ui
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm --filter ui build

# ── Runtime image ────────────────────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY --from=builder /app/apps/ui/public ./apps/ui/public
COPY --from=builder --chown=nextjs:nodejs /app/apps/ui/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/ui/.next/static ./apps/ui/.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

CMD ["node", "apps/ui/server.js"]
