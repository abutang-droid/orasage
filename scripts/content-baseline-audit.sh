#!/usr/bin/env bash
# Content baseline audit (doc 25/26 P0 Step 5). Counts publishable shells vs targets.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"

insights=$(find "$ROOT/main/src/app/[locale]/insights" -name 'page.tsx' 2>/dev/null | wc -l | tr -d ' ')
making_pages=$(find "$ROOT/main/src/app/[locale]/origins/the-making" -name 'page.tsx' 2>/dev/null | wc -l | tr -d ' ')
making_live=$(grep -c "MAKING_LIVE_SKUS" "$ROOT/shared/origins-making/index.ts" || true)

echo "=== Content baseline audit ==="
echo "Insights pillar pages: $insights (target ≥24 articles — current are pillar shells only)"
echo "The Making route files: $making_pages (target 7 finished stories; live SKUs in shared/origins-making)"
echo
echo "Gap: expand insights/*/ articles and publish remaining Making SKUs beyond crystal-wood."
echo "Run after CMS migrate: bash scripts/cms/p0-rewrite-pdp-guides.sh"
