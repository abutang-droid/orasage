#!/usr/bin/env bash
# Check whether root + bazi/ziwei/tarot .env files have an LLM API key.
# auth-service reads /opt/orasage/.env only (出生地 /api/cities/lookup 依赖它).
# Usage (on VPS): bash scripts/check-llm-env.sh [/opt/orasage]
# Exit 0 = all checked files have a key; 1 = one or more missing.

set -euo pipefail

ROOT="${1:-/opt/orasage}"
missing=0

check_file() {
  local label="$1" file="$2"
  if [ ! -f "$file" ]; then
    echo "MISS  $label  (file missing: $file)"
    missing=1
    return
  fi
  local found=""
  for n in DEEPSEEK_API_KEY OPENAI_API_KEY MANUS_API_KEY BUILT_IN_FORGE_API_KEY; do
    local v
    v=$(grep -E "^${n}=" "$file" 2>/dev/null | head -1 | cut -d= -f2- | tr -d '\r' || true)
    if [ -n "$v" ]; then
      found="$n"
      break
    fi
  done
  if [ -n "$found" ]; then
    echo "OK    $label  ($found is set)"
  else
    echo "MISS  $label  (no DEEPSEEK/OPENAI/MANUS/FORGE key)"
    missing=1
  fi
}

echo "LLM env check under $ROOT"
check_file "root (auth + shared)" "$ROOT/.env"
check_file "bazi " "$ROOT/bazi/.env"
check_file "ziwei" "$ROOT/ziwei/.env"
check_file "tarot" "$ROOT/tarot/.env"

if [ "$missing" -ne 0 ]; then
  echo
  echo "AI readings / birthplace lookup fail until DEEPSEEK_API_KEY is set."
  echo "Recommend: write key in $ROOT/.env, then restart:"
  echo "  sudo systemctl restart orasage-auth orasage-bazi orasage-ziwei orasage-tarot"
  exit 1
fi
echo
echo "All checked env files have an LLM API key."
echo "If you just added/changed the root key, restart orasage-auth so birthplace lookup picks it up."
exit 0
