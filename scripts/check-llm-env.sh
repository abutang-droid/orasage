#!/usr/bin/env bash
# Check whether bazi / ziwei / tarot (and optional root) .env files have an LLM API key.
# Usage (on VPS): bash scripts/check-llm-env.sh [/opt/orasage]
# Exit 0 = all three apps have a key; 1 = one or more missing.

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
check_file "root " "$ROOT/.env"
check_file "bazi " "$ROOT/bazi/.env"
check_file "ziwei" "$ROOT/ziwei/.env"
check_file "tarot" "$ROOT/tarot/.env"

if [ "$missing" -ne 0 ]; then
  echo
  echo "AI readings will fail until DEEPSEEK_API_KEY is set (recommend root or each app .env),"
  echo "then: sudo systemctl restart orasage-bazi orasage-ziwei orasage-tarot"
  exit 1
fi
echo
echo "All checked apps have an LLM API key configured."
exit 0
