#!/usr/bin/env bash
set -e

ENV_DIR="$HOME/.config/open-class"
ENV_FILE="$ENV_DIR/api.env"
EXAMPLE_FILE="$(dirname "$0")/../.env.example"

mkdir -p "$ENV_DIR"

if [ ! -f "$ENV_FILE" ]; then
  cp "$EXAMPLE_FILE" "$ENV_FILE"
  echo "✔ $ENV_FILE criado a partir do .env.example."
  echo "  Edite o arquivo e preencha JWT_SECRET e outras chaves antes de continuar."
else
  echo "✔ $ENV_FILE já existe, nada alterado."
fi

direnv allow "$(dirname "$0")/.."
echo "✔ direnv aprovado."
