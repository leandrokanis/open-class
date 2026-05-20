#!/usr/bin/env bash
set -e

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
UI_DIR="$ROOT/apps/ui"

# Carrega o env global (persiste entre workspaces)
if [ -f "$HOME/.config/open-class/api.env" ]; then
  set -a && source "$HOME/.config/open-class/api.env" && set +a
fi

# Sobrescreve com o env local da raiz do projeto
if [ -f "$ROOT/.env" ]; then
  set -a && source "$ROOT/.env" && set +a
fi

# Escreve vars NEXT_PUBLIC_* em apps/ui/.env.local
# (Next.js lê deste arquivo — não herda vars do shell pai)
{
  echo "# Gerado por scripts/dev-ui.sh — não edite manualmente"
  env | grep '^NEXT_PUBLIC_' || true
} > "$UI_DIR/.env.local"

exec pnpm --filter ui dev
